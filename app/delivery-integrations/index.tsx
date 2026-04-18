import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  View,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Input } from "../../src/ui/atoms";
import { colors } from "../../src/ui/theme";
import {
  createShipmentTicket,
  getDeliveryIntegrations,
  getDeliveryShipments,
  refreshOrderShipment,
  requestShipmentPickup,
} from "../../src/services/delivery-integrations.service";
import type { DeliveryProviderCategory, DeliveryShipment } from "../../src/types/delivery";

type IntegrationItem = Awaited<ReturnType<typeof getDeliveryIntegrations>>[number];

const TABS: { key: "all" | DeliveryProviderCategory; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "delivery", label: "Livraison" },
  { key: "fulfillment", label: "Fulfillment" },
];

export default function DeliveryIntegrationsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const columns = width >= 1400 ? 5 : width >= 1100 ? 4 : width >= 820 ? 3 : 1;
  const cardWidth = width >= 820 ? Math.max(250, Math.floor((width - 32 - (columns - 1) * 16) / columns)) : width - 32;
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | DeliveryProviderCategory>("all");
  const [items, setItems] = useState<IntegrationItem[]>([]);
  const [shipments, setShipments] = useState<DeliveryShipment[]>([]);
  const [shipmentQuery, setShipmentQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ticketOrderId, setTicketOrderId] = useState<string | null>(null);
  const [ticketMotif, setTicketMotif] = useState("Autre");
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");

  const shipmentStatusOptions = useMemo(() => {
    const values = Array.from(
      new Set(
        shipments
          .map((item) => item.shippingStatusLabel || item.shippingStatus || "")
          .filter(Boolean)
      )
    );
    return values;
  }, [shipments]);

  const filteredShipments = useMemo(() => {
    const search = shipmentQuery.trim().toLowerCase();
    return shipments.filter((shipment) => {
      const providerMatch =
        providerFilter === "all" ||
        shipment.providerKey === providerFilter ||
        shipment.providerName === providerFilter;
      const statusValue = shipment.shippingStatusLabel || shipment.shippingStatus || "";
      const statusMatch = statusFilter === "all" || statusValue === statusFilter;
      const searchMatch =
        !search ||
        shipment.customerName.toLowerCase().includes(search) ||
        shipment.phone.toLowerCase().includes(search) ||
        shipment.trackingCode.toLowerCase().includes(search) ||
        (shipment.city || "").toLowerCase().includes(search);
      return providerMatch && statusMatch && searchMatch;
    });
  }, [shipments, shipmentQuery, providerFilter, statusFilter]);

  const getShipmentStatusTheme = (shipment: DeliveryShipment) => {
    const value = String(shipment.shippingStatusLabel || shipment.shippingStatus || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (value.includes("livre")) return { bg: "#DCFCE7", text: "#166534" };
    if (value.includes("retour")) return { bg: "#FEE2E2", text: "#B91C1C" };
    if (value.includes("cours") || value.includes("transfert") || value.includes("reporte")) {
      return { bg: "#FEF3C7", text: "#92400E" };
    }
    if (value.includes("collecte") || value.includes("cree") || value.includes("paye")) {
      return { bg: "#DBEAFE", text: "#1D4ED8" };
    }
    return { bg: "#EEF2FF", text: colors.blue };
  };

  const load = async () => {
    const [data, tracked] = await Promise.all([
      getDeliveryIntegrations(),
      getDeliveryShipments(),
    ]);
    setItems(data);
    setShipments(tracked);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesTab = tab === "all" || item.provider.category === tab;
      const matchesSearch =
        !search ||
        item.provider.name.toLowerCase().includes(search) ||
        item.provider.description.toLowerCase().includes(search);
      return matchesTab && matchesSearch;
    });
  }, [items, query, tab]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}>
        {/* <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <View>
            <Text style={{ color: colors.blue, fontSize: 28, fontWeight: "900" }}>Integrations Livraison</Text>
            <Text style={{ color: colors.grayText, marginTop: 4 }}>
              Catalogue des societes de livraison et fulfillment.
            </Text>
          </View>
        </View> */}

        <Card>
          <View style={{ flexDirection: width >= 900 ? "row" : "column", gap: 12 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {TABS.map((item) => {
                  const active = tab === item.key;
                  return (
                    <Pressable
                      key={item.key}
                      onPress={() => setTab(item.key)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 12,
                        backgroundColor: active ? colors.white : "#EEF2FF",
                        borderWidth: 1,
                        borderColor: active ? colors.border : "transparent",
                      }}
                    >
                      <Text style={{ color: active ? colors.blue : "#64748B", fontWeight: "800" }}>{item.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
            <View style={{ flex: 1 }}>
              <Input value={query} onChangeText={setQuery} placeholder="Rechercher une societe de livraison" />
            </View>
          </View>
        </Card>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
          {filtered.map((item) => (
            <Card
              key={item.provider.id}
              style={{
                width: cardWidth,
                padding: 0,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: 120,
                  backgroundColor: item.provider.accent,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 16,
                }}
              >
                <Text
                  style={{
                    color: item.provider.textColor,
                    fontSize: 22,
                    fontWeight: "900",
                    textAlign: "center",
                  }}
                >
                  {item.provider.name}
                </Text>
              </View>

              <View style={{ padding: 16, gap: 12 }}>
                <Text style={{ color: colors.grayText, minHeight: 40 }}>{item.provider.description}</Text>

                <Button
                  title={item.config.enabled ? "Integre" : "Integrer"}
                  variant={item.config.enabled ? "orange" : "primary"}
                  onPress={() => router.push(`/delivery-integrations/${item.provider.id}` as never)}
                />
              </View>
            </Card>
          ))}
        </View>

        <Card>
          <View style={{ flexDirection: width >= 980 ? "row" : "column", justifyContent: "space-between", gap: 10, marginBottom: 16 }}>
            <View>
              <Text style={{ color: colors.blue, fontSize: 24, fontWeight: "900" }}>Suivi des colis</Text>
              <Text style={{ color: colors.grayText, marginTop: 4 }}>
                Tableau unifie des expeditions et statuts transporteurs.
              </Text>
            </View>
            <Button title="Rafraichir" variant="ghost" onPress={load} />
          </View>

          <View style={{ flexDirection: width >= 1180 ? "row" : "column", gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Input
                value={shipmentQuery}
                onChangeText={setShipmentQuery}
                placeholder="Rechercher un client, code barre ou ville"
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                  onPress={() => setProviderFilter("all")}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: providerFilter === "all" ? "#EEF2FF" : "#F8FAFC",
                  }}
                >
                  <Text style={{ color: providerFilter === "all" ? colors.blue : "#475569", fontWeight: "800" }}>
                    Tous les transporteurs
                  </Text>
                </Pressable>
                {items
                  .filter((item) => item.config.enabled)
                  .map((item) => (
                    <Pressable
                      key={item.provider.id}
                      onPress={() => setProviderFilter(item.provider.id)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        borderRadius: 12,
                        backgroundColor: providerFilter === item.provider.id ? "#EEF2FF" : "#F8FAFC",
                      }}
                    >
                      <Text style={{ color: providerFilter === item.provider.id ? colors.blue : "#475569", fontWeight: "800" }}>
                        {item.provider.name}
                      </Text>
                    </Pressable>
                  ))}
              </View>
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                  onPress={() => setStatusFilter("all")}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 12,
                    backgroundColor: statusFilter === "all" ? colors.orangeSoft : "#FFF7ED",
                  }}
                >
                  <Text style={{ color: statusFilter === "all" ? colors.orange : "#9A3412", fontWeight: "800" }}>
                    Tous les statuts
                  </Text>
                </Pressable>
                {shipmentStatusOptions.map((status) => (
                  <Pressable
                    key={status}
                    onPress={() => setStatusFilter(status)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: statusFilter === status ? colors.orangeSoft : "#FFF7ED",
                    }}
                  >
                    <Text style={{ color: statusFilter === status ? colors.orange : "#9A3412", fontWeight: "800" }}>
                      {status}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {filteredShipments.length === 0 ? (
            <Text style={{ color: colors.grayText }}>Aucun colis synchronise pour le moment.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ minWidth: 1240 }}>
                <View style={{ flexDirection: "row", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <Text style={{ width: 180, color: colors.blue, fontWeight: "900" }}>Client</Text>
                  <Text style={{ width: 110, color: colors.blue, fontWeight: "900" }}>Telephone</Text>
                  <Text style={{ width: 110, color: colors.blue, fontWeight: "900" }}>Ville</Text>
                  <Text style={{ width: 150, color: colors.blue, fontWeight: "900" }}>Societe</Text>
                  <Text style={{ width: 150, color: colors.blue, fontWeight: "900" }}>Code barre</Text>
                  <Text style={{ width: 170, color: colors.blue, fontWeight: "900" }}>Statut transport</Text>
                  <Text style={{ width: 150, color: colors.blue, fontWeight: "900" }}>Derniere synchro</Text>
                  <Text style={{ width: 110, color: colors.blue, fontWeight: "900" }}>Total</Text>
                  <Text style={{ width: 290, color: colors.blue, fontWeight: "900" }}>Actions</Text>
                </View>

                {filteredShipments.map((shipment) => {
                  const tone = getShipmentStatusTheme(shipment);
                  return (
                  <View
                    key={`${shipment.orderId}-${shipment.trackingCode}`}
                    style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}
                  >
                    <View style={{ width: 180 }}>
                      <Text style={{ color: "#0F172A", fontWeight: "800" }}>{shipment.customerName}</Text>
                      <Text style={{ color: colors.grayText, marginTop: 4 }}>Commande #{shipment.orderId.slice(-4)}</Text>
                    </View>
                    <Text style={{ width: 110, color: "#334155" }}>{shipment.phone}</Text>
                    <Text style={{ width: 110, color: "#334155" }}>{shipment.city || "-"}</Text>
                    <Text style={{ width: 150, color: "#0F172A", fontWeight: "700" }}>{shipment.providerName || shipment.providerKey}</Text>
                    <Text style={{ width: 150, color: colors.blue, fontWeight: "800" }}>{shipment.trackingCode}</Text>
                    <View style={{ width: 170 }}>
                      <View style={{ alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: tone.bg }}>
                        <Text style={{ color: tone.text, fontWeight: "800" }}>
                          {shipment.shippingStatusLabel || shipment.shippingStatus || "-"}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ width: 150, color: colors.grayText }}>
                      {shipment.syncedAt ? new Date(shipment.syncedAt).toLocaleString() : "-"}
                    </Text>
                    <Text style={{ width: 110, color: "#0F172A", fontWeight: "800" }}>{Number(shipment.total || 0).toFixed(2)} DT</Text>
                    <View style={{ width: 290, flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                      <Button title="Voir" variant="ghost" onPress={() => router.push(`/orders/${shipment.orderId}` as never)} />
                      <Button
                        title="Sync"
                        variant="orange"
                        onPress={async () => {
                          await refreshOrderShipment(shipment.orderId);
                          await load();
                        }}
                      />
                      <Button
                        title="Pickup"
                        variant="ghost"
                        onPress={async () => {
                          try {
                            await requestShipmentPickup(shipment.orderId);
                            Alert.alert("Succes", "Demande de pickup envoyee.");
                            await load();
                          } catch (error: any) {
                            Alert.alert("Erreur", error?.response?.data?.message || "Impossible de demander le pickup.");
                          }
                        }}
                      />
                      <Button
                        title="Ticket"
                        variant="ghost"
                        onPress={() => {
                          setTicketOrderId(shipment.orderId);
                          setTicketMotif("Autre");
                          setTicketTitle(`Demande transport ${shipment.trackingCode}`);
                          setTicketDescription("");
                        }}
                      />
                    </View>
                  </View>
                )})}
              </View>
            </ScrollView>
          )}
        </Card>

        {ticketOrderId ? (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(15,23,42,0.35)",
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            <Card style={{ width: "100%", maxWidth: 560 }}>
              <Text style={{ color: colors.blue, fontSize: 22, fontWeight: "900", marginBottom: 12 }}>
                Creer un ticket transport
              </Text>
              <View style={{ gap: 12 }}>
                <Input value={ticketMotif} onChangeText={setTicketMotif} placeholder="Motif" />
                <Input value={ticketTitle} onChangeText={setTicketTitle} placeholder="Titre du ticket" />
                <Input
                  value={ticketDescription}
                  onChangeText={setTicketDescription}
                  placeholder="Description"
                  multiline
                  style={{ minHeight: 100, textAlignVertical: "top" }}
                />
              </View>
              <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
                <Button title="Annuler" variant="ghost" onPress={() => setTicketOrderId(null)} />
                <Button
                  title="Envoyer le ticket"
                  variant="orange"
                  onPress={async () => {
                    try {
                      await createShipmentTicket(ticketOrderId, {
                        motif: ticketMotif,
                        title: ticketTitle,
                        description: ticketDescription,
                      });
                      Alert.alert("Succes", "Ticket transport cree.");
                      setTicketOrderId(null);
                      await load();
                    } catch (error: any) {
                      Alert.alert("Erreur", error?.response?.data?.message || "Impossible de creer le ticket.");
                    }
                  }}
                />
              </View>
            </Card>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
