import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button, Card, Input, SectionTitle } from "../ui/atoms";
import { colors } from "../ui/theme";
import { TUNISIA_CITY_OPTIONS } from "../constants/tunisia-cities";
import {
  archiveOrder,
  createOrder,
  deleteOrder,
  getOrders,
  restoreOrder,
} from "../services/orders.service";
import { getProducts } from "../services/products.service";
import {
  bulkShipOrdersWithProvider,
  getEnabledDeliveryProviders,
} from "../services/delivery-integrations.service";
import { playNewOrderAlert } from "../services/order-alert.service";
import { useAdminShell } from "../context/AdminShellContext";
import type { DeliveryIntegrationItem } from "../types/delivery";
import type { Order, OrderItem, OrderStatus } from "../types/order";
import type { Product } from "../types/product";

const API_BASE_URL =
  (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_BASE_URL) ||
  "http://127.0.0.1:3000";

type OrdersTab = "commandes" | "abandonnee" | "supprimee" | "archivee";
type StatusFilter = "all" | OrderStatus;
type PeriodFilter = "all" | "today" | "7d" | "30d" | "month";
type Locale = "fr" | "ar";

type CreateOrderFormState = {
  customerName: string;
  phone: string;
  city: string;
  address: string;
  email: string;
  customerNote: string;
  deliveryCompany: string;
  productId: string;
  quantity: string;
};

type FeedbackState = {
  tone: "success" | "warning" | "error";
  title: string;
  message: string;
} | null;

const EMPTY_FORM: CreateOrderFormState = {
  customerName: "",
  phone: "",
  city: "",
  address: "",
  email: "",
  customerNote: "",
  deliveryCompany: "",
  productId: "",
  quantity: "1",
};

const STATUS_ORDER: StatusFilter[] = [
  "all",
  "en_attente",
  "confirmee",
  "telechargee",
  "tentative1",
  "emballee",
  "livree",
  "rejetee",
  "retournee",
];

const PERIOD_OPTIONS: { key: PeriodFilter; label: string }[] = [
  { key: "all", label: "Toute periode" },
  { key: "today", label: "Aujourd hui" },
  { key: "7d", label: "7 derniers jours" },
  { key: "30d", label: "30 derniers jours" },
  { key: "month", label: "Ce mois" },
];

function getMissingShippingFieldsForOrder(
  order: Pick<Order, "customerName" | "phone" | "city" | "address">,
) {
  const missing: string[] = [];
  if (!String(order.customerName || "").trim()) missing.push("nom");
  if (!String(order.phone || "").trim()) missing.push("telephone");
  if (!String(order.city || "").trim()) missing.push("ville");
  if (!String(order.address || "").trim()) missing.push("adresse");
  return missing;
}

const translations = {
  fr: {
    title: "Commandes",
    subtitle:
      "Pilotage commercial, suivi transport et actions rapides dans une seule vue NOVIKA.",
    tabs: {
      commandes: "Commandes",
      abandonnee: "Abandonnee",
      supprimee: "Supprimee",
      archivee: "Archivee",
    },
    searchPlaceholder: "Rechercher par client, telephone, ville ou produit...",
    allStatuses: "Tous les statuts",
    addOrder: "Ajouter une commande",
    selected: "selectionnees",
    archive: "Archiver",
    delete: "Supprimer",
    restore: "Restaurer",
    chooseProvider: "Choisir un transporteur",
    downloadCarrier: "Telecharger vers le transporteur",
    totalOrders: "Total visible",
    totalValue: "Valeur totale",
    empty: "Aucune commande pour ce filtre.",
    emptyDeleted: "Aucune commande supprimee pour ce filtre.",
    emptyArchived: "Aucune commande archivee pour ce filtre.",
    emptyAbandoned: "Aucune commande abandonnee pour ce filtre.",
    customer: "Client",
    date: "Date",
    delivery: "Livraison",
    status: "Statut",
    total: "Total",
    actions: "Actions",
    product: "Produit",
    quantity: "Quantite",
    quickDetails: "Details commande",
    addModalTitle: "Ajouter une commande",
    save: "Enregistrer",
    cancel: "Annuler",
    city: "Ville",
    address: "Adresse",
    email: "Email",
    note: "Note client",
    phone: "Telephone",
    customerName: "Nom client",
    noProvider: "Aucun transporteur integre",
    shipSuccess: "Commande(s) envoyee(s) au transporteur.",
    shipPartial: "Certaines commandes n'ont pas ete envoyees. Details:",
    shipNothing: "Aucune commande n'a ete envoyee au transporteur.",
    createSuccess: "Commande ajoutee avec succes.",
    invalidCreate: "Nom, telephone, ville, adresse et produit sont obligatoires.",
    invalidProvider: "Choisis un transporteur avant le telechargement.",
    onlyConfirmed: "Le telechargement est reserve aux commandes confirmees.",
    loadError: "Impossible de charger les commandes pour le moment.",
    bulkError: "L'action groupee a echoue.",
    shipError: "Le telechargement vers le transporteur a echoue.",
    createError: "La creation de commande a echoue.",
    loading: "Chargement des commandes...",
    advancedFilter: "Filtre avance",
    resetFilters: "Reinitialiser",
    period: "Periode",
    provider: "Livraison",
    productFilter: "Produit",
    allProviders: "Tous les transporteurs",
    allProducts: "Tous les produits",
    statusRequired: "Champs requis",
    cityFilter: "Ville",
    allCities: "Toutes les villes",
    preview: "Apercu selection",
    summary: "Resume de la commande",
    unitPrice: "Prix unitaire",
    subtotal: "Sous-total",
    deliveryFee: "Frais de livraison",
    addToSummary: "Ajouter au resume",
    noHistory: "Aucun historique disponible pour cette commande pour le moment.",
    statusPicker: "Statut",
  },
  ar: {
    title: "Commandes",
    subtitle: "Pilotage commercial, suivi transport et actions rapides dans une seule vue NOVIKA.",
    tabs: {
      commandes: "Commandes",
      abandonnee: "Abandonnee",
      supprimee: "Supprimee",
      archivee: "Archivee",
    },
    searchPlaceholder: "Rechercher par client, telephone, ville ou produit...",
    allStatuses: "Tous les statuts",
    addOrder: "Ajouter une commande",
    selected: "selectionnees",
    archive: "Archiver",
    delete: "Supprimer",
    restore: "Restaurer",
    chooseProvider: "Choisir un transporteur",
    downloadCarrier: "Telecharger vers le transporteur",
    totalOrders: "Total visible",
    totalValue: "Valeur totale",
    empty: "Aucune commande pour ce filtre.",
    emptyDeleted: "Aucune commande supprimee pour ce filtre.",
    emptyArchived: "Aucune commande archivee pour ce filtre.",
    emptyAbandoned: "Aucune commande abandonnee pour ce filtre.",
    customer: "Client",
    date: "Date",
    delivery: "Livraison",
    status: "Statut",
    total: "Total",
    actions: "Actions",
    product: "Produit",
    quantity: "Quantite",
    quickDetails: "Details commande",
    addModalTitle: "Ajouter une commande",
    save: "Enregistrer",
    cancel: "Annuler",
    city: "Ville",
    address: "Adresse",
    email: "Email",
    note: "Note client",
    phone: "Telephone",
    customerName: "Nom client",
    noProvider: "Aucun transporteur integre",
    shipSuccess: "Commande(s) envoyee(s) au transporteur.",
    shipPartial: "Certaines commandes n'ont pas ete envoyees. Details:",
    shipNothing: "Aucune commande n'a ete envoyee au transporteur.",
    createSuccess: "Commande ajoutee avec succes.",
    invalidCreate: "Nom, telephone, ville, adresse et produit sont obligatoires.",
    invalidProvider: "Choisis un transporteur avant le telechargement.",
    onlyConfirmed: "Le telechargement est reserve aux commandes confirmees.",
    loadError: "Impossible de charger les commandes pour le moment.",
    bulkError: "L'action groupee a echoue.",
    shipError: "Le telechargement vers le transporteur a echoue.",
    createError: "La creation de commande a echoue.",
    loading: "Chargement des commandes...",
    advancedFilter: "Filtre avance",
    resetFilters: "Reinitialiser",
    period: "Periode",
    provider: "Livraison",
    productFilter: "Produit",
    allProviders: "Tous les transporteurs",
    allProducts: "Tous les produits",
    statusRequired: "Champs requis",
    cityFilter: "Ville",
    allCities: "Toutes les villes",
    preview: "Apercu selection",
    summary: "Resume de la commande",
    unitPrice: "Prix unitaire",
    subtotal: "Sous-total",
    deliveryFee: "Frais de livraison",
    addToSummary: "Ajouter au resume",
    noHistory: "Aucun historique disponible pour cette commande pour le moment.",
    statusPicker: "Statut",
  },
} as const;

function formatMoney(value: number) {
  return `${Number(value || 0).toFixed(2)} DT`;
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleString("fr-FR") : "-";
}

function normalizeProductTitle(item?: OrderItem | null) {
  if (!item) return "Produit";
  if (!item.product) return "Produit supprime";
  return typeof item.product === "string"
    ? item.product
    : item.product?.name || item.product?.title || "Produit";
}

function normalizeProductId(item?: OrderItem | null) {
  if (!item) return "";
  if (!item.product) return "";
  return typeof item.product === "string" ? item.product : item.product?._id || "";
}

function resolveImageUri(raw?: string | null) {
  if (!raw) return null;
  return raw.startsWith("http") ? raw : `${API_BASE_URL}${raw}`;
}

function normalizeProductImage(item?: OrderItem | null) {
  if (!item || !item.product || typeof item.product === "string") return null;
  return resolveImageUri(item.product.images?.[0] || item.product.image || null);
}

function getStatusTheme(status: OrderStatus) {
  if (status === "abandonnee") return { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" };
  if (status === "confirmee") return { bg: "#DCFCE7", text: "#166534", border: "#BBF7D0" };
  if (status === "telechargee") return { bg: "#DBEAFE", text: "#1D4ED8", border: "#BFDBFE" };
  if (status === "emballee") return { bg: "#F3E8FF", text: "#7C3AED", border: "#DDD6FE" };
  if (status === "livree") return { bg: "#ECFDF3", text: "#16A34A", border: "#BBF7D0" };
  if (status === "tentative1") return { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" };
  if (status === "rejetee" || status === "retournee") {
    return { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" };
  }
  return { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" };
}

function matchesPeriod(createdAt: string | undefined, filter: PeriodFilter) {
  if (filter === "all") return true;
  if (!createdAt) return false;
  const value = new Date(createdAt);
  if (Number.isNaN(value.getTime())) return false;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (filter === "today") return value >= startOfToday;

  if (filter === "7d") {
    const start = new Date(startOfToday);
    start.setDate(start.getDate() - 6);
    return value >= start;
  }

  if (filter === "30d") {
    const start = new Date(startOfToday);
    start.setDate(start.getDate() - 29);
    return value >= start;
  }

  if (filter === "month") {
    return value.getFullYear() === now.getFullYear() && value.getMonth() === now.getMonth();
  }

  return true;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const theme = getStatusTheme(status);
  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: 999,
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.bg,
        paddingHorizontal: 12,
        paddingVertical: 7,
      }}
    >
      <Text style={{ color: theme.text, fontWeight: "900", fontSize: 12 }}>{status}</Text>
    </View>
  );
}

function ActionIconButton({
  icon,
  onPress,
  color = colors.text,
}: {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Feather name={icon} size={16} color={color} />
    </Pressable>
  );
}

function Checkbox({ checked, onPress }: { checked: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 24,
        height: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: checked ? colors.cobalt : colors.border,
        backgroundColor: checked ? colors.cobaltSoft : colors.white,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {checked ? <Feather name="check" size={14} color={colors.cobalt} /> : null}
    </Pressable>
  );
}

function SelectablePill({
  label,
  active,
  onPress,
  accent,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  accent: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 999,
        backgroundColor: active ? accent : colors.white,
        borderWidth: 1,
        borderColor: active ? accent : colors.border,
      }}
    >
      <Text style={{ color: active ? colors.white : colors.text, fontWeight: "800" }}>
        {label}
      </Text>
    </Pressable>
  );
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
        <Feather name="chevron-down" size={16} color="#64748B" />
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
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: option.key === value ? colors.cobalt : colors.border,
                      backgroundColor: option.key === value ? colors.cobaltSoft : colors.white,
                      padding: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: option.key === value ? colors.cobalt : colors.textSoft,
                        fontWeight: "700",
                      }}
                    >
                      {option.label}
                    </Text>
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

function QuickDetailsModal({
  order,
  visible,
  onClose,
  texts,
}: {
  order: Order | null;
  visible: boolean;
  onClose: () => void;
  texts: (typeof translations)[Locale];
}) {
  if (!order) return null;
  const historyEntries = [...(order.history || [])].sort((a, b) => {
    const left = a?.date ? new Date(a.date).getTime() : 0;
    const right = b?.date ? new Date(b.date).getTime() : 0;
    return right - left;
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(15,23,42,0.46)",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Card style={{ width: "100%", maxWidth: 720, alignSelf: "center", maxHeight: "88%" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "900", fontSize: 24 }}>
              {texts.quickDetails}
            </Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={22} color={colors.grayText} />
            </Pressable>
          </View>

          <ScrollView>
            <Text style={{ color: colors.text, fontWeight: "900", fontSize: 20 }}>
              {order.customerName}
            </Text>
            <Text style={{ color: colors.grayText, marginTop: 6 }}>{order.phone}</Text>
            <Text style={{ color: colors.grayText, marginTop: 2 }}>{order.city || "-"}</Text>
            <Text style={{ color: colors.grayText, marginTop: 2 }}>{order.address || "-"}</Text>
            {order.email ? (
              <Text style={{ color: colors.grayText, marginTop: 2 }}>{order.email}</Text>
            ) : null}

            <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
              <StatusBadge status={order.status} />
              {order.deliveryCompany ? (
                <View
                  style={{
                    backgroundColor: colors.violetSoft,
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                  }}
                >
                  <Text style={{ color: colors.violet, fontWeight: "800" }}>
                    {order.deliveryCompany}
                  </Text>
                </View>
              ) : null}
              {order.deliveryTrackingCode ? (
                <View
                  style={{
                    backgroundColor: colors.cobaltSoft,
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                  }}
                >
                  <Text style={{ color: colors.cobalt, fontWeight: "800" }}>
                    {order.deliveryTrackingCode}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={{ gap: 10, marginTop: 18 }}>
              {(order.items || []).map((item, index) => {
                const imageUri = normalizeProductImage(item);
                return (
                  <Card key={`${order._id}-${index}`} tone="muted">
                    <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                      <View
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 14,
                          borderWidth: 1,
                          borderColor: colors.border,
                          overflow: "hidden",
                          backgroundColor: colors.white,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {imageUri ? (
                          <Image source={{ uri: imageUri }} style={{ width: 56, height: 56 }} />
                        ) : (
                          <Feather name="package" size={16} color={colors.grayText} />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontWeight: "800" }}>
                          {normalizeProductTitle(item)}
                        </Text>
                        <Text style={{ color: colors.grayText, marginTop: 4 }}>
                          {texts.quantity}: {item.quantity}
                        </Text>
                        <Text style={{ color: colors.grayText }}>{formatMoney(item.price)}</Text>
                      </View>
                    </View>
                  </Card>
                );
              })}
            </View>

            <View style={{ marginTop: 18 }}>
              <Text style={{ color: colors.text, fontWeight: "900", fontSize: 18, marginBottom: 12 }}>
                Historique
              </Text>
              <View style={{ gap: 12 }}>
                {historyEntries.length ? (
                  historyEntries.map((entry, index) => (
                    <View
                      key={`${entry.status}-${entry.date}-${index}`}
                      style={{
                        borderBottomWidth: index === historyEntries.length - 1 ? 0 : 1,
                        borderBottomColor: colors.border,
                        paddingBottom: 12,
                      }}
                    >
                      <Text style={{ color: colors.grayText }}>{formatDate(entry.date)}</Text>
                      <View style={{ marginTop: 8 }}>
                        <StatusBadge status={entry.status} />
                      </View>
                      <Text style={{ color: colors.text, fontWeight: "900", marginTop: 8 }}>
                        {entry.changedBy}
                      </Text>
                      {entry.note ? (
                        <Text style={{ color: colors.grayText, marginTop: 4 }}>{entry.note}</Text>
                      ) : null}
                    </View>
                  ))
                ) : (
                  <Text style={{ color: colors.grayText }}>{texts.noHistory}</Text>
                )}
              </View>
            </View>
          </ScrollView>
        </Card>
      </View>
    </Modal>
  );
}

function HistoryPanel({
  order,
  texts,
  onClose,
}: {
  order: Order;
  texts: (typeof translations)[Locale];
  onClose: () => void;
}) {
  const historyEntries = [...(order.history || [])].sort((a, b) => {
    const left = a?.date ? new Date(a.date).getTime() : 0;
    const right = b?.date ? new Date(b.date).getTime() : 0;
    return right - left;
  });

  return (
    <Card
      style={{
        width: 320,
        borderStyle: "dashed",
        borderColor: "#D8D1FF",
        alignSelf: "stretch",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: "900", fontSize: 18 }}>Historique</Text>
        <Pressable onPress={onClose}>
          <Feather name="x" size={18} color={colors.grayText} />
        </Pressable>
      </View>

      <ScrollView style={{ maxHeight: 560 }}>
        <View style={{ gap: 14 }}>
          {historyEntries.length ? (
            historyEntries.map((entry, index) => (
              <View
                key={`${entry.status}-${entry.date}-${index}`}
                style={{
                  paddingBottom: 14,
                  borderBottomWidth: index === historyEntries.length - 1 ? 0 : 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text style={{ color: colors.grayText }}>{formatDate(entry.date)}</Text>
                <View style={{ marginTop: 8 }}>
                  <StatusBadge status={entry.status} />
                </View>
                <Text style={{ color: colors.text, fontWeight: "900", marginTop: 8 }}>
                  {entry.changedBy}
                </Text>
                {entry.note ? (
                  <Text style={{ color: colors.grayText, marginTop: 6 }}>{entry.note}</Text>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={{ color: colors.grayText }}>{texts.noHistory}</Text>
          )}
        </View>
      </ScrollView>
    </Card>
  );
}

export default function OrdersScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { locale } = useAdminShell();
  const texts = translations[(locale as Locale) || "fr"];
  const isDesktop = width >= 1180;
  const isTablet = width >= 820;

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<DeliveryIntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<OrdersTab>("commandes");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkProviderKey, setBulkProviderKey] = useState("");
  const [quickViewOrder, setQuickViewOrder] = useState<Order | null>(null);
  const [historyOrder, setHistoryOrder] = useState<Order | null>(null);
  const [createVisible, setCreateVisible] = useState(false);
  const [form, setForm] = useState<CreateOrderFormState>(EMPTY_FORM);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const hasBootstrappedAlertRef = useRef(false);
  const knownLeadCountRef = useRef(0);

  const statusLabels: Record<StatusFilter, string> = {
    all: texts.allStatuses,
    abandonnee: "Abandonnee",
    en_attente: "En attente",
    confirmee: "Confirmee",
    telechargee: "Telechargee",
    tentative1: "Tentative 1",
    emballee: "Emballee",
    livree: "Livree",
    rejetee: "Rejetee",
    retournee: "Retournee",
  };

  const statusFilterOptions = useMemo(
    () => STATUS_ORDER.map((status) => ({ key: status, label: statusLabels[status] })),
    [statusLabels],
  );

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [ordersData, productsData, enabledProviders] = await Promise.all([
        getOrders(),
        getProducts(),
        getEnabledDeliveryProviders(),
      ]);
      const normalizedOrders = Array.isArray(ordersData) ? ordersData : [];
      const nextLeadCount = normalizedOrders.filter((item) => !item.isDeleted).length;
      const hasNewLead = hasBootstrappedAlertRef.current && nextLeadCount > knownLeadCountRef.current;
      knownLeadCountRef.current = nextLeadCount;
      hasBootstrappedAlertRef.current = true;
      if (hasNewLead) {
        await playNewOrderAlert();
      }

      setOrders(normalizedOrders);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setProviders(Array.isArray(enabledProviders) ? enabledProviders : []);
      setBulkProviderKey((current) => {
        if (current && enabledProviders.some((item) => item.provider.id === current)) return current;
        return enabledProviders[0]?.provider.id || "";
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", texts.loadError);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => loadData(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredOrders = useMemo(() => {
    const base = orders.filter((order) => {
      if (tab === "abandonnee") return !!order.isAbandoned;
      if (tab === "supprimee") return !!order.isDeleted;
      if (tab === "archivee") return !!order.isArchived;
      return !order.isAbandoned && !order.isDeleted && !order.isArchived;
    });

    return base.filter((order) => {
      const haystack = [
        order.customerName,
        order.phone,
        order.city,
        order.address,
        order.deliveryCompany,
        ...(order.items || []).map((item) => normalizeProductTitle(item)),
      ]
        .join(" ")
        .toLowerCase();

      const productIds = (order.items || [])
        .map((item) => normalizeProductId(item))
        .filter(Boolean);

      const matchesSearch =
        !search.trim() || haystack.includes(search.trim().toLowerCase());
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      const matchesProvider =
        providerFilter === "all" || (order.deliveryCompany || "") === providerFilter;
      const matchesProduct =
        productFilter === "all" || productIds.includes(productFilter);
      const matchesCity =
        cityFilter === "all" || (order.city || "").trim() === cityFilter;
      const matchesCreatedAt = matchesPeriod(order.createdAt, periodFilter);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesProvider &&
        matchesProduct &&
        matchesCity &&
        matchesCreatedAt
      );
    });
  }, [orders, search, statusFilter, providerFilter, productFilter, cityFilter, periodFilter, tab]);

  const selectedOrders = useMemo(
    () => filteredOrders.filter((order) => selectedIds.includes(order._id)),
    [filteredOrders, selectedIds],
  );

  const tabCounts = useMemo(
    () => ({
      commandes: orders.filter((item) => !item.isAbandoned && !item.isDeleted && !item.isArchived)
        .length,
      abandonnee: orders.filter((item) => !!item.isAbandoned).length,
      supprimee: orders.filter((item) => !!item.isDeleted).length,
      archivee: orders.filter((item) => !!item.isArchived).length,
    }),
    [orders],
  );

  const totals = useMemo(
    () => ({
      count: filteredOrders.length,
      value: filteredOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    }),
    [filteredOrders],
  );

  const productOptions = useMemo(
    () => products.filter((product) => product.status !== "cache"),
    [products],
  );

  const providerOptions = useMemo(
    () => providers.map((item) => ({ key: item.provider.id, name: item.provider.name })),
    [providers],
  );

  const providerFilterOptions = useMemo(() => {
    const names = Array.from(
      new Set(
        [...providers.map((item) => item.provider.name), ...orders.map((item) => item.deliveryCompany)]
          .filter((item): item is string => !!item && !!item.trim()),
      ),
    );

    return [
      { key: "all", label: texts.allProviders },
      ...names.map((name) => ({ key: name, label: name })),
    ];
  }, [orders, providers, texts.allProviders]);

  const cityFilterOptions = useMemo(
    () => [{ key: "all", label: texts.allCities }, ...TUNISIA_CITY_OPTIONS],
    [texts.allCities],
  );

  const productFilterOptions = useMemo(
    () => [
      { key: "all", label: texts.allProducts },
      ...productOptions.map((product) => ({ key: product._id, label: product.name })),
    ],
    [productOptions, texts.allProducts],
  );

  const emptyMessage = useMemo(() => {
    if (tab === "supprimee") return texts.emptyDeleted;
    if (tab === "archivee") return texts.emptyArchived;
    if (tab === "abandonnee") return texts.emptyAbandoned;
    return texts.empty;
  }, [tab, texts]);

  const resetAdvancedFilters = () => {
    setPeriodFilter("all");
    setProviderFilter("all");
    setProductFilter("all");
    setCityFilter("all");
  };

  const selectedProduct = useMemo(
    () => productOptions.find((product) => product._id === form.productId) || null,
    [form.productId, productOptions],
  );
  const previewQuantity = Math.max(1, Number(form.quantity || 1));
  const previewUnitPrice = Number(selectedProduct?.price || 0);
  const previewDeliveryFee = Number(selectedProduct?.deliveryFee || 0);
  const previewSubtotal = previewUnitPrice * previewQuantity;
  const previewTotal = previewSubtotal + previewDeliveryFee;

  const toggleSelection = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length > 0 && selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(filteredOrders.map((order) => order._id));
  };

  const runSingleAction = async (orderId: string, action: "archive" | "delete" | "restore") => {
    setSubmitting(true);
    try {
      if (action === "archive") {
        await archiveOrder(orderId);
      } else if (action === "delete") {
        await deleteOrder(orderId);
      } else {
        await restoreOrder(orderId);
      }
      await loadData(true);
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", texts.bulkError);
    } finally {
      setSubmitting(false);
    }
  };

  const runBulkAction = async (action: "archive" | "delete" | "restore") => {
    if (!selectedOrders.length) return;
    setSubmitting(true);
    try {
      if (action === "archive") {
        await Promise.all(selectedOrders.map((order) => archiveOrder(order._id)));
      } else if (action === "delete") {
        await Promise.all(selectedOrders.map((order) => deleteOrder(order._id)));
      } else {
        await Promise.all(selectedOrders.map((order) => restoreOrder(order._id)));
      }
      setSelectedIds([]);
      await loadData(true);
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", texts.bulkError);
    } finally {
      setSubmitting(false);
    }
  };

  const runBulkShip = async () => {
    if (!selectedOrders.length) return;
    if (!bulkProviderKey) {
      Alert.alert("Information", texts.invalidProvider);
      return;
    }
    if (selectedOrders.some((order) => order.status !== "confirmee")) {
      Alert.alert("Information", texts.onlyConfirmed);
      return;
    }

    const invalidOrders = selectedOrders
      .map((order) => ({ order, missing: getMissingShippingFieldsForOrder(order) }))
      .filter((item) => item.missing.length > 0);

    if (invalidOrders.length) {
      const details = invalidOrders
        .map((item) => `${item.order._id.slice(-4)}: ${item.missing.join(", ")}`)
        .join("\n");
      const message = `Impossible d envoyer au transporteur tant que ces champs manquent:\n${details}`;
      setFeedback({ tone: "error", title: texts.statusRequired, message });
      Alert.alert(texts.statusRequired, message);
      return;
    }

    setSubmitting(true);
    try {
      const result = await bulkShipOrdersWithProvider(
        selectedOrders.map((order) => order._id),
        bulkProviderKey,
      );
      await loadData(true);
      if (result.successCount > 0 && result.failureCount === 0) {
        setSelectedIds([]);
        setFeedback({
          tone: "success",
          title: "Succes",
          message: texts.shipSuccess,
        });
        Alert.alert("Succes", texts.shipSuccess);
      } else if (result.successCount > 0 && result.failureCount > 0) {
        const details = result.results
          .filter((item) => !item.success)
          .map((item) => `${item.orderId.slice(-4)}: ${item.message || "Erreur"}`)
          .join("\n");
        const message = `${texts.shipPartial}\n${details}`;
        setSelectedIds(result.results.filter((item) => !item.success).map((item) => item.orderId));
        setFeedback({
          tone: "warning",
          title: "Information",
          message,
        });
        Alert.alert("Information", message);
      } else {
        const details = result.results
          .map((item) => `${item.orderId.slice(-4)}: ${item.message || "Erreur"}`)
          .join("\n");
        const message = `${texts.shipNothing}\n${details}`;
        setSelectedIds(result.results.map((item) => item.orderId));
        setFeedback({
          tone: "error",
          title: "Erreur",
          message,
        });
        Alert.alert("Erreur", message);
      }
    } catch (error: any) {
      console.error(error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        texts.shipError;
      setFeedback({
        tone: "error",
        title: "Erreur",
        message,
      });
      Alert.alert("Erreur", message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitCreateOrder = async () => {
    const selectedProduct = productOptions.find((product) => product._id === form.productId);
    if (
      !form.customerName.trim() ||
      !form.phone.trim() ||
      !form.city.trim() ||
      !form.address.trim() ||
      !selectedProduct
    ) {
      Alert.alert("Information", texts.invalidCreate);
      return;
    }

    setSubmitting(true);
    try {
      const quantity = Math.max(1, Number(form.quantity || 1));
      await createOrder({
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        city: form.city.trim() || undefined,
        address: form.address.trim() || undefined,
        email: form.email.trim() || undefined,
        customerNote: form.customerNote.trim() || undefined,
        deliveryCompany: form.deliveryCompany.trim() || undefined,
        items: [
          {
            product: selectedProduct._id,
            quantity,
            price: Number(selectedProduct.price || 0),
            deliveryFee: Number(selectedProduct.deliveryFee || 0),
          },
        ],
      });
      setCreateVisible(false);
      setForm(EMPTY_FORM);
      await loadData(true);
      Alert.alert("Succes", texts.createSuccess);
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", texts.createError);
    } finally {
      setSubmitting(false);
    }
  };

  const renderRowActions = (order: Order) => (
    <View style={{ flexDirection: "row", gap: 8, marginLeft: "auto" }}>
      <ActionIconButton icon="eye" onPress={() => setQuickViewOrder(order)} color={colors.cobalt} />
      <ActionIconButton
        icon="edit-3"
        onPress={() => router.push(`/orders/${order._id}` as never)}
        color={colors.text}
      />
      {tab === "supprimee" || tab === "archivee" ? (
        <ActionIconButton
          icon="rotate-ccw"
          onPress={() => runSingleAction(order._id, "restore")}
          color={colors.cobalt}
        />
      ) : null}
      {tab !== "archivee" ? (
        <ActionIconButton
          icon={tab === "commandes" ? "archive" : "trash-2"}
          onPress={() => runSingleAction(order._id, tab === "commandes" ? "archive" : "delete")}
          color={tab === "commandes" ? colors.orange : "#DC2626"}
        />
      ) : null}
      {tab === "commandes" ? (
        <ActionIconButton
          icon="trash-2"
          onPress={() => runSingleAction(order._id, "delete")}
          color="#DC2626"
        />
      ) : null}
    </View>
  );

  const renderTableRow = (order: Order) => {
    const firstItem = order.items?.[0];
    const imageUri = normalizeProductImage(firstItem);
    const isChecked = selectedIds.includes(order._id);

    return (
      <View
        key={order._id}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 14,
          paddingVertical: 14,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Checkbox checked={isChecked} onPress={() => toggleSelection(order._id)} />
        <Text style={{ width: 76, color: colors.text, fontWeight: "800" }}>{order._id.slice(-4)}</Text>
        <View style={{ width: 260, flexDirection: "row", gap: 12, alignItems: "center" }}>
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              overflow: "hidden",
              backgroundColor: colors.bgMuted,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={{ width: 54, height: 54 }} />
            ) : (
              <Feather name="package" size={16} color={colors.grayText} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: "800" }} numberOfLines={2}>
              {normalizeProductTitle(firstItem)}
            </Text>
            <Text style={{ color: colors.grayText, marginTop: 4 }}>
              {texts.quantity}: {firstItem?.quantity || 0}
            </Text>
          </View>
        </View>
        <View style={{ width: 180 }}>
          <Text style={{ color: colors.text, fontWeight: "800" }}>{order.customerName}</Text>
          <Text style={{ color: colors.grayText, marginTop: 4 }}>{order.phone}</Text>
        </View>
        <Text style={{ width: 170, color: colors.grayText }}>{formatDate(order.createdAt)}</Text>
        <Text style={{ width: 120, color: colors.text, fontWeight: "700" }}>
          {order.deliveryCompany || "-"}
        </Text>
        <Pressable onPress={() => setHistoryOrder(order)} style={{ width: 130 }}>
          <StatusBadge status={order.status} />
        </Pressable>
        <Text style={{ width: 120, color: colors.cobalt, fontWeight: "900", fontSize: 18 }}>
          {formatMoney(order.total)}
        </Text>
        {renderRowActions(order)}
      </View>
    );
  };

  const renderMobileCard = (order: Order) => {
    const firstItem = order.items?.[0];
    const imageUri = normalizeProductImage(firstItem);
    const isChecked = selectedIds.includes(order._id);

    return (
      <Card key={order._id} style={{ gap: 14 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Checkbox checked={isChecked} onPress={() => toggleSelection(order._id)} />
            <Text style={{ color: colors.grayText, fontWeight: "800" }}>#{order._id.slice(-4)}</Text>
          </View>
          <Pressable onPress={() => setHistoryOrder(order)}>
            <StatusBadge status={order.status} />
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <View
            style={{
              width: 68,
              height: 68,
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: colors.bgMuted,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={{ width: 68, height: 68 }} />
            ) : (
              <Feather name="package" size={18} color={colors.grayText} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: "900", fontSize: 16 }}>
              {normalizeProductTitle(firstItem)}
            </Text>
            <Text style={{ color: colors.grayText, marginTop: 6 }}>{order.customerName}</Text>
            <Text style={{ color: colors.grayText, marginTop: 2 }}>{order.phone}</Text>
            <Text style={{ color: colors.grayText, marginTop: 2 }}>{formatDate(order.createdAt)}</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ color: colors.grayText, fontWeight: "700" }}>{texts.delivery}</Text>
            <Text style={{ color: colors.text, fontWeight: "800", marginTop: 4 }}>
              {order.deliveryCompany || "-"}
            </Text>
          </View>
          <Text style={{ color: colors.cobalt, fontWeight: "900", fontSize: 20 }}>
            {formatMoney(order.total)}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          {renderRowActions(order)}
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.cobalt} />
        <Text style={{ color: colors.grayText, marginTop: 12 }}>{texts.loading}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 36, gap: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData(true);
            }}
          />
        }
      >
        <Card>
          <SectionTitle title={texts.title} subtitle={texts.subtitle} />

          <View
            style={{
              flexDirection: isTablet ? "row" : "column",
              gap: 10,
              alignItems: isTablet ? "center" : "stretch",
            }}
          >
            <View style={{ flex: 1, flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
              {(Object.keys(texts.tabs) as OrdersTab[]).map((currentTab) => {
                const active = tab === currentTab;
                const count = tabCounts[currentTab];
                return (
                  <Pressable
                    key={currentTab}
                    onPress={() => {
                      setTab(currentTab);
                      setSelectedIds([]);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      borderRadius: 18,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      backgroundColor: active ? colors.white : colors.bgMuted,
                      borderWidth: 1,
                      borderColor: active ? colors.border : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: active ? colors.text : colors.grayText,
                        fontWeight: "900",
                        fontSize: 16,
                      }}
                    >
                      {texts.tabs[currentTab]}
                    </Text>
                    <View
                      style={{
                        minWidth: 30,
                        height: 30,
                        borderRadius: 999,
                        backgroundColor: active ? colors.cobaltSoft : colors.white,
                        alignItems: "center",
                        justifyContent: "center",
                        paddingHorizontal: 8,
                      }}
                    >
                      <Text style={{ color: active ? colors.cobalt : colors.text, fontWeight: "900" }}>
                        {count}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ width: isTablet ? 260 : "100%" }}>
              <Button title={texts.addOrder} onPress={() => setCreateVisible(true)} variant="orange" />
            </View>
          </View>
        </Card>

        <Card style={{ gap: 14 }}>
          <View
            style={{
              flexDirection: isDesktop ? "row" : "column",
              gap: 12,
              alignItems: isDesktop ? "center" : "stretch",
              flexWrap: "wrap",
            }}
          >
            <View style={{ flex: 1, minWidth: 240 }}>
              <Input value={search} onChangeText={setSearch} placeholder={texts.searchPlaceholder} />
            </View>
            <Picker
              value={statusFilter}
              options={statusFilterOptions}
              onChange={(value) => setStatusFilter(value as StatusFilter)}
              placeholder={texts.statusPicker}
            />
            <Picker
              value={periodFilter}
              options={PERIOD_OPTIONS}
              onChange={(value) => setPeriodFilter(value as PeriodFilter)}
              placeholder={texts.period}
            />
            <Button
              title={advancedOpen ? "Filtre avance -" : "Filtre avance +"}
              onPress={() => setAdvancedOpen((current) => !current)}
              variant="ghost"
            />
          </View>

          {advancedOpen ? (
            <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 12, flexWrap: "wrap" }}>
              <Picker
                value={productFilter}
                options={productFilterOptions}
                onChange={setProductFilter}
                placeholder={texts.productFilter}
              />
              <Picker
                value={cityFilter}
                options={cityFilterOptions}
                onChange={setCityFilter}
                placeholder={texts.cityFilter}
              />
              <Picker
                value={providerFilter}
                options={providerFilterOptions}
                onChange={setProviderFilter}
                placeholder={texts.provider}
              />
              <View style={{ width: isDesktop ? 220 : "100%" }}>
                <Button title={texts.resetFilters} onPress={resetAdvancedFilters} variant="secondary" />
              </View>
            </View>
          ) : null}

          {feedback ? (
            <View
              style={{
                borderRadius: 18,
                padding: 14,
                borderWidth: 1,
                borderColor:
                  feedback.tone === "success"
                    ? "#BBF7D0"
                    : feedback.tone === "warning"
                      ? "#FED7AA"
                      : "#FECACA",
                backgroundColor:
                  feedback.tone === "success"
                    ? "#ECFDF3"
                    : feedback.tone === "warning"
                      ? "#FFF7ED"
                      : "#FEF2F2",
              }}
            >
              <Text
                style={{
                  color:
                    feedback.tone === "success"
                      ? "#166534"
                      : feedback.tone === "warning"
                        ? "#C2410C"
                        : "#B91C1C",
                  fontWeight: "900",
                  marginBottom: 8,
                }}
              >
                {feedback.title}
              </Text>
              <Text
                style={{
                  color:
                    feedback.tone === "success"
                      ? "#166534"
                      : feedback.tone === "warning"
                        ? "#9A3412"
                        : "#991B1B",
                  lineHeight: 20,
                }}
              >
                {feedback.message}
              </Text>
            </View>
          ) : null}

          {selectedOrders.length ? (
            <Card tone="muted" style={{ gap: 12 }}>
              <View
                style={{
                  flexDirection: isTablet ? "row" : "column",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <Text style={{ color: colors.text, fontWeight: "900", fontSize: 16 }}>
                  {selectedOrders.length} {texts.selected}
                </Text>
                <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                  {tab === "commandes" ? (
                    <Button
                      title={texts.archive}
                      onPress={() => runBulkAction("archive")}
                      variant="ghost"
                      disabled={submitting}
                    />
                  ) : null}
                  {tab === "supprimee" || tab === "archivee" ? (
                    <Button
                      title={texts.restore}
                      onPress={() => runBulkAction("restore")}
                      variant="secondary"
                      disabled={submitting}
                    />
                  ) : null}
                  {tab !== "supprimee" ? (
                    <Button
                      title={texts.delete}
                      onPress={() => runBulkAction("delete")}
                      variant="ghost"
                      disabled={submitting}
                    />
                  ) : null}
                </View>
              </View>

              {tab === "commandes" ? (
                <>
                  <View style={{ gap: 10 }}>
                    <Text style={{ color: colors.grayText, fontWeight: "800" }}>{texts.chooseProvider}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                      {providerOptions.length ? (
                        providerOptions.map((provider) => (
                          <SelectablePill
                            key={provider.key}
                            label={provider.name}
                            active={bulkProviderKey === provider.key}
                            onPress={() => setBulkProviderKey(provider.key)}
                            accent={colors.cobalt}
                          />
                        ))
                      ) : (
                        <View
                          style={{
                            borderRadius: 18,
                            backgroundColor: colors.orangeSoft,
                            paddingHorizontal: 14,
                            paddingVertical: 12,
                          }}
                        >
                          <Text style={{ color: colors.orange, fontWeight: "800" }}>{texts.noProvider}</Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>

                  <Button
                    title={texts.downloadCarrier}
                    onPress={runBulkShip}
                    variant="primary"
                    disabled={submitting || !providerOptions.length}
                  />
                </>
              ) : null}
            </Card>
          ) : null}
        </Card>

        <View style={{ flexDirection: isTablet ? "row" : "column", gap: 16 }}>
          <Card style={{ flex: 1 }}>
            <Text style={{ color: colors.grayText, fontWeight: "700" }}>{texts.totalOrders}</Text>
            <Text style={{ color: colors.cobalt, fontWeight: "900", fontSize: 34, marginTop: 10 }}>
              {totals.count}
            </Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text style={{ color: colors.grayText, fontWeight: "700" }}>{texts.totalValue}</Text>
            <Text style={{ color: colors.orange, fontWeight: "900", fontSize: 34, marginTop: 10 }}>
              {formatMoney(totals.value)}
            </Text>
          </Card>
        </View>

        {filteredOrders.length ? (
          isDesktop ? (
            <View style={{ flexDirection: "row", gap: 16, alignItems: "flex-start" }}>
            <Card style={{ flex: 1, paddingHorizontal: 0, overflow: "hidden" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingHorizontal: 14,
                  paddingBottom: 12,
                }}
              >
                <Checkbox
                  checked={selectedIds.length > 0 && selectedIds.length === filteredOrders.length}
                  onPress={toggleSelectAll}
                />
                <Text style={{ width: 76, color: colors.cobalt, fontWeight: "900" }}>ID</Text>
                <Text style={{ width: 260, color: colors.cobalt, fontWeight: "900" }}>{texts.product}</Text>
                <Text style={{ width: 180, color: colors.cobalt, fontWeight: "900" }}>{texts.customer}</Text>
                <Text style={{ width: 170, color: colors.cobalt, fontWeight: "900" }}>{texts.date}</Text>
                <Text style={{ width: 120, color: colors.cobalt, fontWeight: "900" }}>{texts.delivery}</Text>
                <Text style={{ width: 130, color: colors.cobalt, fontWeight: "900" }}>{texts.status}</Text>
                <Text style={{ width: 120, color: colors.cobalt, fontWeight: "900" }}>{texts.total}</Text>
                <Text style={{ marginLeft: "auto", color: colors.cobalt, fontWeight: "900" }}>
                  {texts.actions}
                </Text>
              </View>
              {filteredOrders.map(renderTableRow)}
            </Card>
              {historyOrder ? (
                <HistoryPanel
                  order={historyOrder}
                  texts={texts}
                  onClose={() => setHistoryOrder(null)}
                />
              ) : null}
            </View>
          ) : (
            <View style={{ gap: 12 }}>{filteredOrders.map(renderMobileCard)}</View>
          )
        ) : (
          <Card>
            <Text style={{ color: colors.grayText, fontWeight: "700" }}>{emptyMessage}</Text>
          </Card>
        )}
      </ScrollView>

      <QuickDetailsModal
        order={quickViewOrder}
        visible={!!quickViewOrder}
        onClose={() => setQuickViewOrder(null)}
        texts={texts}
      />

      {!isDesktop && historyOrder ? (
        <Modal
          visible={!!historyOrder}
          transparent
          animationType="fade"
          onRequestClose={() => setHistoryOrder(null)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(15,23,42,0.46)",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <HistoryPanel
              order={historyOrder}
              texts={texts}
              onClose={() => setHistoryOrder(null)}
            />
          </View>
        </Modal>
      ) : null}

      <Modal visible={createVisible} transparent animationType="fade" onRequestClose={() => setCreateVisible(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(15,23,42,0.46)",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Card style={{ width: "100%", maxWidth: 760, alignSelf: "center", maxHeight: "90%" }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "900", fontSize: 24 }}>
                {texts.addModalTitle}
              </Text>
              <Pressable onPress={() => setCreateVisible(false)}>
                <Feather name="x" size={22} color={colors.grayText} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ gap: 14 }}>
              <View style={{ flexDirection: isTablet ? "row" : "column", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: "800", marginBottom: 8 }}>
                    {texts.customerName}
                  </Text>
                  <Input
                    value={form.customerName}
                    onChangeText={(value) => setForm((current) => ({ ...current, customerName: value }))}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: "800", marginBottom: 8 }}>
                    {texts.phone}
                  </Text>
                  <Input
                    value={form.phone}
                    onChangeText={(value) => setForm((current) => ({ ...current, phone: value }))}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View>
                <Text style={{ color: colors.text, fontWeight: "800", marginBottom: 8 }}>
                  {texts.email}
                </Text>
                <Input
                  value={form.email}
                  onChangeText={(value) => setForm((current) => ({ ...current, email: value }))}
                  keyboardType="email-address"
                />
              </View>

              <View style={{ flexDirection: isTablet ? "row" : "column", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: "800", marginBottom: 8 }}>
                    {texts.city}
                  </Text>
                  <Picker
                    value={form.city}
                    options={cityFilterOptions.filter((item) => item.key !== "all")}
                    onChange={(value) => setForm((current) => ({ ...current, city: value }))}
                    placeholder="Choisir une ville"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: "800", marginBottom: 8 }}>
                    Societe de livraison
                  </Text>
                  <Picker
                    value={form.deliveryCompany}
                    options={[
                      { key: "", label: "Aucune societe" },
                      ...providerFilterOptions.filter((item) => item.key !== "all"),
                    ]}
                    onChange={(value) => setForm((current) => ({ ...current, deliveryCompany: value }))}
                    placeholder="Aucune societe"
                  />
                </View>
              </View>

              <View>
                <Text style={{ color: colors.text, fontWeight: "800", marginBottom: 8 }}>
                  {texts.address}
                </Text>
                <Input
                  value={form.address}
                  onChangeText={(value) => setForm((current) => ({ ...current, address: value }))}
                />
              </View>

              <View>
                <Text style={{ color: colors.text, fontWeight: "800", marginBottom: 8 }}>
                  {texts.note}
                </Text>
                <Input
                  value={form.customerNote}
                  onChangeText={(value) => setForm((current) => ({ ...current, customerNote: value }))}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={{ flexDirection: isTablet ? "row" : "column", gap: 12, alignItems: "stretch" }}>
                <View style={{ flex: 1, gap: 12 }}>
                  <View>
                    <Text style={{ color: colors.text, fontWeight: "800", marginBottom: 8 }}>
                      {texts.product}
                    </Text>
                    <Picker
                      value={form.productId}
                      options={productFilterOptions.filter((item) => item.key !== "all")}
                      onChange={(value) => setForm((current) => ({ ...current, productId: value }))}
                      placeholder="Choisir un produit"
                    />
                  </View>

                  <View style={{ width: isTablet ? 200 : "100%" }}>
                    <Text style={{ color: colors.text, fontWeight: "800", marginBottom: 8 }}>
                      {texts.quantity}
                    </Text>
                    <Input
                      value={form.quantity}
                      onChangeText={(value) => setForm((current) => ({ ...current, quantity: value }))}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <Card tone="muted" style={{ flex: 1, gap: 12 }}>
                  <Text style={{ color: colors.text, fontWeight: "900", fontSize: 18 }}>
                    {texts.summary}
                  </Text>
                  <Text style={{ color: colors.grayText, fontWeight: "800" }}>{texts.preview}</Text>
                  <Text style={{ color: colors.violet, fontWeight: "900", fontSize: 20 }}>
                    {formatMoney(previewTotal)}
                  </Text>
                  {selectedProduct ? (
                    <>
                      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                        <View
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: 18,
                            overflow: "hidden",
                            backgroundColor: colors.white,
                            borderWidth: 1,
                            borderColor: colors.border,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {selectedProduct.images?.[0] ? (
                            <Image
                              source={{
                                uri: resolveImageUri(selectedProduct.images?.[0] || "") || "",
                              }}
                              style={{ width: 64, height: 64 }}
                            />
                          ) : (
                            <Feather name="package" size={18} color={colors.grayText} />
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: colors.text, fontWeight: "900", fontSize: 16 }}>
                            {selectedProduct.name}
                          </Text>
                          <Text style={{ color: colors.grayText, marginTop: 4 }}>
                            {texts.quantity}: {previewQuantity}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={{
                          borderRadius: 18,
                          borderWidth: 1,
                          borderColor: colors.border,
                          overflow: "hidden",
                          backgroundColor: colors.white,
                        }}
                      >
                        {[
                          [texts.unitPrice, formatMoney(previewUnitPrice)],
                          [texts.subtotal, formatMoney(previewSubtotal)],
                          [texts.deliveryFee, formatMoney(previewDeliveryFee)],
                        ].map(([label, value], index) => (
                          <View
                            key={label}
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              paddingHorizontal: 16,
                              paddingVertical: 14,
                              borderBottomWidth: index === 2 ? 0 : 1,
                              borderBottomColor: colors.border,
                            }}
                          >
                            <Text style={{ color: colors.text, fontWeight: "800" }}>{label}</Text>
                            <Text style={{ color: colors.text, fontWeight: "900" }}>{value}</Text>
                          </View>
                        ))}
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            paddingHorizontal: 16,
                            paddingVertical: 16,
                            backgroundColor: colors.violetSoft,
                          }}
                        >
                          <Text style={{ color: colors.violet, fontWeight: "900", fontSize: 16 }}>
                            {texts.total}
                          </Text>
                          <Text style={{ color: colors.text, fontWeight: "900", fontSize: 16 }}>
                            {formatMoney(previewTotal)}
                          </Text>
                        </View>
                      </View>
                    </>
                  ) : (
                    <Text style={{ color: colors.grayText }}>Selectionne un produit pour voir le resume.</Text>
                  )}
                </Card>
              </View>
            </ScrollView>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 18 }}>
              <View style={{ flex: 1 }}>
                <Button title={texts.cancel} onPress={() => setCreateVisible(false)} variant="ghost" />
              </View>
              <View style={{ flex: 1 }}>
                <Button title={texts.save} onPress={submitCreateOrder} variant="orange" disabled={submitting} />
              </View>
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}






