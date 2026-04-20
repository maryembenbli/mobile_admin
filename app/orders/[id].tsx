import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Card, Input } from "../../src/ui/atoms";
import {
  getEnabledDeliveryProviders,
  shipOrderWithProvider,
} from "../../src/services/delivery-integrations.service";
import { getOrder, updateOrder } from "../../src/services/orders.service";
import type { Order, OrderItem, OrderStatus } from "../../src/types/order";
import type { DeliveryProvider } from "../../src/types/delivery";
import { colors } from "../../src/ui/theme";
import { TUNISIA_CITY_OPTIONS } from "../../src/constants/tunisia-cities";

const BASE_STATUS_FLOW: OrderStatus[] = [
  "en_attente",
  "tentative1",
  "confirmee",
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

function Picker({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: string;
  options: { key: string; label: string }[];
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((item) => item.key === value);

  return (
    <View style={{ minWidth: 190 }}>
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          minHeight: 52,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.white,
          paddingHorizontal: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: selected ? colors.text : "#94A3B8", fontWeight: "700", flex: 1 }}>
          {selected?.label || placeholder}
        </Text>
        <Text style={{ color: "#64748B", fontWeight: "900" }}>?</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(15,23,42,0.32)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              alignSelf: "center",
              width: "100%",
              maxWidth: 420,
              borderRadius: 18,
              overflow: "hidden",
              backgroundColor: colors.white,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <ScrollView style={{ maxHeight: 320 }}>
              <View style={{ padding: 10, gap: 8 }}>
                {options.map((option) => (
                  <Pressable
                    key={option.key}
                    onPress={() => {
                      onChange(option.key);
                      setOpen(false);
                    }}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: option.key === value ? "#EEF2FF" : colors.white,
                      borderWidth: 1,
                      borderColor: option.key === value ? "#C7D2FE" : colors.border,
                    }}
                  >
                    <Text style={{ color: colors.text, fontWeight: "700" }}>{option.label}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
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

  const statusFlow: OrderStatus[] =
    order?.isAbandoned || status === "abandonnee"
      ? (["abandonnee", ...BASE_STATUS_FLOW] as OrderStatus[])
      : BASE_STATUS_FLOW;

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
      Alert.alert(
        "Champs requis",
        `Impossible d enregistrer avec une societe de livraison tant que ces champs manquent: ${missing.join(", ")}.`,
      );
      return;
    }

    const previousSnapshot = {
      status: order.status,
      rejectReason: order.rejectReason,
      privateNote: order.privateNote || "",
      exchange: Boolean(order.exchange),
      deliveryCompany: order.deliveryCompany || "",
      customerName: order.customerName || "Client",
      phone: order.phone || "",
      city: order.city || undefined,
      address: order.address || undefined,
      email: order.email || undefined,
      customerNote: order.customerNote || undefined,
    };

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

      let finalOrder = updated;

      if (status === "confirmee" && deliveryCompany.trim()) {
        try {
          finalOrder = await shipOrderWithProvider(order._id);
        } catch (error: any) {
          await updateOrder(order._id, previousSnapshot);
          throw error;
        }
      }

      setOrder(finalOrder);
      Alert.alert(
        "Succes",
        finalOrder.status === "telechargee"
          ? "Commande enregistree et envoyee au transporteur."
          : "Commande mise a jour.",
      );
      router.replace("/orders" as never);
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Erreur",
        error?.response?.data?.message ||
          "Impossible d enregistrer les changements.",
      );
    } finally {
      setSaving(false);
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
            {statusFlow.map((item) => {
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
            <Text style={{ color: colors.grayText, marginBottom: 10 }}>
              Enregistrer une commande confirmee avec une societe integree l envoie automatiquement au transporteur.
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
              <Picker
                value={city}
                options={TUNISIA_CITY_OPTIONS}
                onChange={setCity}
                placeholder="Choisir une ville"
              />
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
