import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Card, Input } from "../../src/ui/atoms";
import {
  getEnabledDeliveryProviders,
  refreshOrderShipment,
  shipOrderWithProvider,
} from "../../src/services/delivery-integrations.service";
import { getOrder, updateOrder } from "../../src/services/orders.service";
import type { Order, OrderItem, OrderStatus } from "../../src/types/order";
import type { DeliveryProvider } from "../../src/types/delivery";
import { colors } from "../../src/ui/theme";

const STATUS_FLOW: OrderStatus[] = [
  "en_attente",
  "tentative1",
  "confirmee",
  "telechargee",
  "emballee",
  "livree",
  "rejetee",
  "retournee",
];

const REJECT_REASONS = [
  "not_available",
  "expensive",
  "didnt_click_buy",
  "better_price",
  "expensive_delivery",
  "other",
] as const;

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function formatMoney(value: number) {
  return `${Number(value || 0).toFixed(2)} DT`;
}

function getProductTitle(item: OrderItem) {
  if (typeof item.product === "string") return item.product;
  return item.product?.name || item.product?.title || item.product?._id || "Produit";
}

function getStatusTheme(status: OrderStatus) {
  switch (status) {
    case "confirmee":
      return { bg: "#DCFCE7", text: "#166534", border: "#BBF7D0" };
    case "livree":
      return { bg: "#DBEAFE", text: "#1D4ED8", border: "#BFDBFE" };
    case "telechargee":
      return { bg: "#DBEAFE", text: "#1D4ED8", border: "#BFDBFE" };
    case "emballee":
      return { bg: "#EDE9FE", text: "#6D28D9", border: "#DDD6FE" };
    case "tentative1":
      return { bg: "#FFEDD5", text: "#C2410C", border: "#FED7AA" };
    case "rejetee":
      return { bg: "#FEE2E2", text: "#B91C1C", border: "#FECACA" };
    case "retournee":
      return { bg: "#F1F5F9", text: "#334155", border: "#CBD5E1" };
    default:
      return { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" };
  }
}

export default function OrderDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shippingActionLoading, setShippingActionLoading] = useState(false);
  const [status, setStatus] = useState<OrderStatus>("en_attente");
  const [rejectReason, setRejectReason] = useState("");
  const [privateNote, setPrivateNote] = useState("");
  const [exchange, setExchange] = useState(false);
  const [deliveryCompany, setDeliveryCompany] = useState("");
  const [enabledProviders, setEnabledProviders] = useState<DeliveryProvider[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const historyEntries = [...(order?.history || [])].sort((a, b) => {
    const left = a?.date ? new Date(a.date).getTime() : 0;
    const right = b?.date ? new Date(b.date).getTime() : 0;
    return right - left;
  });

  const getMissingShippingFields = () => {
    const missing: string[] = [];
    if (!customerName.trim()) missing.push("nom");
    if (!phone.trim()) missing.push("telephone");
    if (!city.trim()) missing.push("ville");
    if (!address.trim()) missing.push("adresse");
    return missing;
  };

  const loadOrder = async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    try {
      const data = await getOrder(orderId);
      setOrder(data);
      setStatus(data.status);
      setRejectReason(data.rejectReason || "");
      setPrivateNote(data.privateNote || "");
      setExchange(Boolean(data.exchange));
      setDeliveryCompany(data.deliveryCompany || "");
      setCustomerName(data.customerName || "");
      setPhone(data.phone || "");
      setCity(data.city || "");
      setAddress(data.address || "");
      setEmail(data.email || "");
      setCustomerNote(data.customerNote || "");
    } catch (error) {
      console.error(error);
      setOrder(null);
      Alert.alert("Erreur", "Impossible de charger la commande.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  useEffect(() => {
    (async () => {
      const providers = await getEnabledDeliveryProviders();
      setEnabledProviders(providers.map((item) => item.provider));
    })();
  }, []);

  const saveOrder = async () => {
    if (!order) return;
    if (!phone.trim()) {
      Alert.alert("Champ requis", "Le numero de telephone est obligatoire.");
      return;
    }
    const missing = getMissingShippingFields();
    if (deliveryCompany && missing.length) {
      Alert.alert("Champs requis", `Impossible d enregistrer avec une societe de livraison tant que ces champs manquent: ${missing.join(", ")}.`);
      return;
    }

    try {
      setSaving(true);
      const updated = await updateOrder(order._id, {
        status,
        rejectReason: status === "rejetee" ? rejectReason : undefined,
        privateNote,
        exchange,
        deliveryCompany,
        customerName: customerName.trim() || "Client",
        phone: phone.trim(),
        city: city.trim() || undefined,
        address: address.trim() || undefined,
        email: email.trim() || undefined,
        customerNote: customerNote.trim() || undefined,
      });
      setOrder(updated);
      Alert.alert("Succes", "Commande mise a jour.");
      router.replace("/orders" as never);
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible d enregistrer les changements.");
    } finally {
      setSaving(false);
    }
  };

  const shipOrder = async () => {
    if (!order) return;
    if (!deliveryCompany.trim()) {
      Alert.alert("Transporteur requis", "Choisis d abord une societe de livraison.");
      return;
    }
    const missing = getMissingShippingFields();
    if (missing.length) {
      Alert.alert("Champs requis", `Impossible d envoyer au transporteur tant que ces champs manquent: ${missing.join(", ")}.`);
      return;
    }
    try {
      setShippingActionLoading(true);
      await updateOrder(order._id, {
        status,
        rejectReason: status === "rejetee" ? rejectReason : undefined,
        privateNote,
        exchange,
        deliveryCompany,
        customerName: customerName.trim() || "Client",
        phone: phone.trim(),
        city: city.trim(),
        address: address.trim(),
        email: email.trim() || undefined,
        customerNote: customerNote.trim() || undefined,
      });
      const updated = await shipOrderWithProvider(order._id);
      setOrder(updated);
      setDeliveryCompany(updated.deliveryCompany || "");
      Alert.alert("Succes", "Commande envoyee au transporteur.");
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Erreur",
        error?.response?.data?.message ||
          "Impossible d envoyer la commande au transporteur.",
      );
    } finally {
      setShippingActionLoading(false);
    }
  };

  const refreshTracking = async () => {
    if (!order) return;
    try {
      setShippingActionLoading(true);
      const updated = await refreshOrderShipment(order._id);
      setOrder(updated);
      Alert.alert("Succes", "Suivi transport synchronise.");
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Erreur",
        error?.response?.data?.message ||
          "Impossible de synchroniser le suivi transport.",
      );
    } finally {
      setShippingActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.bg,
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  if (!order) {
    return (
      <View
        style={{
          flex: 1,
          padding: 16,
          backgroundColor: colors.bg,
          justifyContent: "center",
        }}
      >
        <Card>
          <Text style={{ color: colors.grayText }}>Commande introuvable.</Text>
          <View style={{ marginTop: 14 }}>
            <Button
              title="Retour liste"
              variant="ghost"
              onPress={() => router.replace("/orders" as never)}
            />
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Text style={{ color: "#0F172A", fontSize: 26, fontWeight: "900" }}>
            Modifier la commande n°{order._id.slice(-4)}
          </Text>
          <Button
            title={saving ? "Enregistrement..." : "Enregistrer"}
            onPress={saveOrder}
            disabled={saving}
          />
        </View>

        <Card>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "900", color: "#0F172A" }}
            >
              Details de la commande
            </Text>
            <Pressable
              onPress={() => setExchange((current) => !current)}
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: exchange ? colors.blue : "white",
                }}
              />
              <Text style={{ color: "#0F172A", fontWeight: "700" }}>Echange</Text>
            </Pressable>
          </View>

          <Text
            style={{ fontWeight: "800", color: "#0F172A", marginBottom: 10 }}
          >
            Statut
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {STATUS_FLOW.map((item) => {
              const active = status === item;
              const theme = getStatusTheme(item);

              return (
                <Pressable
                  key={item}
                  onPress={() => setStatus(item)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: active ? theme.border : colors.border,
                    backgroundColor: active ? theme.bg : "white",
                  }}
                >
                  <Text
                    style={{
                      color: active ? theme.text : "#475569",
                      fontWeight: "800",
                    }}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {status === "rejetee" ? (
            <View style={{ marginTop: 16 }}>
              <Text
                style={{ fontWeight: "800", color: "#0F172A", marginBottom: 10 }}
              >
                Raison du rejet
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {REJECT_REASONS.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => setRejectReason(item)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor:
                        rejectReason === item ? "#FCA5A5" : colors.border,
                      backgroundColor:
                        rejectReason === item ? "#FEE2E2" : "white",
                    }}
                  >
                    <Text
                      style={{
                        color: rejectReason === item ? "#B91C1C" : "#475569",
                        fontWeight: "800",
                      }}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}

          <View style={{ marginTop: 16 }}>
            <Text
              style={{ fontWeight: "800", color: "#0F172A", marginBottom: 10 }}
            >
              Societe de livraison
            </Text>
            {enabledProviders.length === 0 ? (
              <View style={{ gap: 10 }}>
                <Text style={{ color: colors.grayText }}>
                  Aucune societe integree pour le moment.
                </Text>
                <Button
                  title="Ouvrir les integrations livraison"
                  variant="ghost"
                  onPress={() => router.push("/delivery-integrations" as never)}
                />
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {enabledProviders.map((provider) => {
                    const active = deliveryCompany === provider.name;
                    return (
                      <Pressable
                        key={provider.id}
                        onPress={() => {
                          const missing = getMissingShippingFields();
                          if (missing.length) {
                            Alert.alert("Champs requis", `Impossible de choisir une societe de livraison tant que ces champs manquent: ${missing.join(", ")}.`);
                            return;
                          }
                          setDeliveryCompany(provider.name);
                        }}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          borderRadius: 14,
                          borderWidth: 1,
                          borderColor: active ? "#C4B5FD" : colors.border,
                          backgroundColor: active ? "#F5F3FF" : "white",
                        }}
                      >
                        <Text
                          style={{
                            color: active ? "#6D28D9" : "#475569",
                            fontWeight: "800",
                          }}
                        >
                          {provider.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </View>

          {deliveryCompany ? (
            <View style={{ marginTop: 16, gap: 12 }}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 16,
                  padding: 14,
                  backgroundColor: "#F8FAFC",
                }}
              >
                <Text style={{ color: "#0F172A", fontWeight: "900" }}>
                  Suivi transport
                </Text>
                <Text style={{ color: colors.grayText, marginTop: 8 }}>
                  Transporteur: {order.deliveryCompany || deliveryCompany}
                </Text>
                <Text style={{ color: colors.grayText, marginTop: 6 }}>
                  Code barre: {order.deliveryTrackingCode || "-"}
                </Text>
                <Text style={{ color: colors.grayText, marginTop: 6 }}>
                  Statut transport: {order.deliveryStatusLabel || order.deliveryStatus || "-"}
                </Text>
                <Text style={{ color: colors.grayText, marginTop: 6 }}>
                  Derniere synchro: {formatDate(order.deliverySyncedAt)}
                </Text>
              </View>

              <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
                <Button
                  title={
                    shippingActionLoading
                      ? "Envoi..."
                      : "Envoyer au transporteur"
                  }
                  variant="orange"
                  onPress={shipOrder}
                  disabled={shippingActionLoading}
                />
                {order.deliveryTrackingCode ? (
                  <Button
                    title={
                      shippingActionLoading ? "Sync..." : "Synchroniser le suivi"
                    }
                    variant="ghost"
                    onPress={refreshTracking}
                    disabled={shippingActionLoading}
                  />
                ) : null}
              </View>
            </View>
          ) : null}

          <View style={{ marginTop: 16 }}>
            <Text
              style={{ fontWeight: "800", color: "#0F172A", marginBottom: 10 }}
            >
              Ajouter une note privee...
            </Text>
            <Input
              value={privateNote}
              onChangeText={setPrivateNote}
              placeholder="Ajouter une note privee..."
              multiline
              style={{ minHeight: 100, textAlignVertical: "top" }}
            />
          </View>
        </Card>

        <Card>
          <Text
            style={{ fontSize: 18, fontWeight: "900", color: "#0F172A", marginBottom: 14 }}
          >
            Details du client
          </Text>
          <View style={{ gap: 12 }}>
            <View>
              <Text
                style={{ fontWeight: "800", color: "#0F172A", marginBottom: 8 }}
              >
                Nom
              </Text>
              <Input
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="Nom du client"
              />
            </View>
            <View>
              <Text
                style={{ fontWeight: "800", color: "#0F172A", marginBottom: 8 }}
              >
                Telephone
              </Text>
              <Input
                value={phone}
                onChangeText={setPhone}
                placeholder="Numero de telephone"
              />
            </View>
            <View>
              <Text
                style={{ fontWeight: "800", color: "#0F172A", marginBottom: 8 }}
              >
                Ville
              </Text>
              <Input value={city} onChangeText={setCity} placeholder="Ville" />
            </View>
            <View>
              <Text
                style={{ fontWeight: "800", color: "#0F172A", marginBottom: 8 }}
              >
                Adresse
              </Text>
              <Input
                value={address}
                onChangeText={setAddress}
                placeholder="Adresse"
                multiline
                style={{ minHeight: 80, textAlignVertical: "top" }}
              />
            </View>
            <View>
              <Text
                style={{ fontWeight: "800", color: "#0F172A", marginBottom: 8 }}
              >
                Email
              </Text>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                autoCapitalize="none"
              />
            </View>
            <View>
              <Text
                style={{ fontWeight: "800", color: "#0F172A", marginBottom: 8 }}
              >
                Note client
              </Text>
              <Input
                value={customerNote}
                onChangeText={setCustomerNote}
                placeholder="Note client"
                multiline
                style={{ minHeight: 90, textAlignVertical: "top" }}
              />
            </View>
          </View>
        </Card>

        <Card>
          <Text
            style={{ fontSize: 18, fontWeight: "900", color: "#0F172A", marginBottom: 14 }}
          >
            Produits
          </Text>
          <View style={{ gap: 12 }}>
            {order.items.map((item, index) => (
              <View
                key={`${getProductTitle(item)}-${index}`}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 16,
                  padding: 12,
                }}
              >
                <Text style={{ color: "#0F172A", fontWeight: "900" }}>
                  {getProductTitle(item)}
                </Text>
                <Text style={{ color: colors.grayText, marginTop: 4 }}>
                  Quantite: {item.quantity}
                </Text>
                <Text style={{ color: colors.grayText, marginTop: 4 }}>
                  Prix: {formatMoney(item.price)}
                </Text>
              </View>
            ))}
            <Text style={{ color: colors.blue, fontWeight: "900", fontSize: 18 }}>
              Total: {formatMoney(order.total)}
            </Text>
          </View>
        </Card>

        <Card>
          <Text
            style={{ fontSize: 18, fontWeight: "900", color: "#0F172A", marginBottom: 14 }}
          >
            Historique
          </Text>
          <View style={{ gap: 12 }}>
            {historyEntries.length ? (
            historyEntries.map((entry, index) => (
              <View
                key={`${entry.status}-${entry.date}-${index}`}
                style={{
                  borderBottomWidth:
                    index === historyEntries.length - 1 ? 0 : 1,
                  borderBottomColor: colors.border,
                  paddingBottom: 12,
                }}
              >
                <Text style={{ color: "#0F172A", fontWeight: "900" }}>
                  {entry.status}
                </Text>
                <Text style={{ color: colors.grayText, marginTop: 4 }}>
                  {entry.changedBy}
                </Text>
                {entry.note ? (
                  <Text style={{ color: colors.grayText, marginTop: 4 }}>
                    {entry.note}
                  </Text>
                ) : null}
                <Text style={{ color: colors.grayText, marginTop: 4 }}>
                  {formatDate(entry.date)}
                </Text>
              </View>
            ))
          ) : (
            <View
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.bgMuted,
                padding: 14,
              }}
            >
              <Text style={{ color: colors.grayText }}>
                Aucun historique disponible pour cette commande pour le moment.
              </Text>
            </View>
          )}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
