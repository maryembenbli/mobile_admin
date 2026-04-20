import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Svg, { Circle, Line, Path, Polyline, Text as SvgText } from "react-native-svg";
import { Feather } from "@expo/vector-icons";
import { getStoredUser, getToken, logout } from "../src/services/auth.service";
import { getDashboardSummary } from "../src/services/dashboard.service";
import { getApplicationIntegrations } from "../src/services/application-integrations.service";
import { playNewOrderAlert } from "../src/services/order-alert.service";
import { useAdminShell } from "../src/context/AdminShellContext";
import { colors as themeColors, radii, shadows } from "../src/ui/theme";
import { Badge } from "../src/ui/atoms";

type CrudAction = "read" | "create" | "update" | "delete";
type UserPermission = { module: string; action: CrudAction };
type Locale = "fr" | "ar";

type StoredUser = {
  sub: string;
  email?: string;
  permissions?: UserPermission[];
  isSuperAdmin?: boolean;
};

type Summary = {
  today: { leadsCount: number; ordersCount: number; abandonedCount: number; revenue: number };
  week: { leadsCount: number; ordersCount: number; abandonedCount: number; revenue: number };
  month: { leadsCount: number; ordersCount: number; abandonedCount: number; revenue: number; label: string; offset: number };
  totals: {
    leads: number;
    orders: number;
    products: number;
    users: number;
    revenue: number;
    archived: number;
    deleted: number;
  };
  pipeline: {
    conversionRate: number;
    abandonmentRate: number;
    totalLeads: number;
    realOrders: number;
    abandonedLeads: number;
  };
  tracking: {
    deliveredPercent: number;
    returnedPercent: number;
    confirmedPercent: number;
    abandonedPercent: number;
  };
  shipping: {
    totalTracked: number;
    created: number;
    inTransit: number;
    delivered: number;
    returned: number;
  };
  traffic: {
    confirmedCount: number;
    abandonedCount: number;
    confirmedPercent: number;
    abandonedPercent: number;
  };
  statuses: {
    pending: number;
    attempt1: number;
    confirmed: number;
    packed: number;
    delivered: number;
    rejected: number;
    returned: number;
  };
  callStats: {
    pendingCalls: number;
    followUps: number;
    answeredRate: number;
    rejectedAfterCall: number;
  };
  productTests: {
    testedProducts: number;
    topProducts: { name: string; orders: number; revenue: number }[];
  };
  topCities: { city: string; leads: number; orders: number; revenue: number }[];
  categoryDistribution: { name: string; value: number }[];
  dailySeries: { label: string; leads: number; orders: number; abandoned: number; revenue: number }[];
};

const colors = {
  bg: themeColors.bg,
  card: themeColors.card,
  text: themeColors.text,
  muted: themeColors.grayText,
  border: themeColors.border,
  primary: themeColors.cobalt,
  primarySoft: themeColors.cobaltSoft,
  secondary: themeColors.violet,
  secondarySoft: themeColors.violetSoft,
  cyan: themeColors.teal,
  green: themeColors.green,
  greenSoft: themeColors.greenSoft,
  orange: themeColors.orange,
  orangeSoft: themeColors.orangeSoft,
  red: themeColors.red,
  redSoft: themeColors.redSoft,
  navy: themeColors.navy,
  navySoft: themeColors.navySoft,
};

const MODULE_ALIASES: Record<string, string[]> = {
  orders: ["orders", "order", "commande", "commandes"],
  products: ["products", "product", "produit", "produits"],
  admins: ["admins", "admin", "users", "utilisateur", "utilisateurs", "staff"],
  categories: ["categories", "category", "categorie"],
  dashboard: ["dashboard", "stats", "statistique", "statistiques"],
};

const translations = {
  fr: {
    dashboardTag: "TABLEAU DE BORD",
    dashboardTitle: "Pilotage e-commerce",
    dashboardSubtitle: "Un dashboard clair pour suivre ventes, pipeline et performance sans surcharger l'ecran.",
    session: "Session",
    superAdmin: "Super Admin",
    admin: "Admin",
    logout: "Deconnexion",
    languageFr: "FR",
    languageAr: "AR",
    orders: "Commandes",
    total: "Total",
    revenue: "Revenus",
    products: "Produits",
    users: "Utilisateurs",
    thisMonth: "ce mois",
    today: "aujourd'hui",
    topTracked: "tops suivis",
    leadsCaptured: "leads captures",
    salesTrend: "Tendance des ventes",
    salesTrendSub: "Evolution du chiffre d'affaires sur le mois affiche",
    salesBadge: "Ventes",
    pipeline: "Vue pipeline",
    pipelineSub: "Les KPI essentiels pour decider vite",
    shipping: "Suivi transport",
    shippingSub: "Vue rapide des colis sans ouvrir le tableau detaille",
    shippingTracked: "Colis crees",
    shippingInTransit: "En cours",
    shippingDelivered: "Livres",
    shippingReturned: "Retours",
    leads: "Leads",
    abandons: "Abandons",
    realOrders: "Commandes reelles",
    conversionRate: "Taux de conversion",
    abandonmentRate: "Taux d'abandon",
    deliveryRate: "Taux de livraison",
    ordersChart: "Commandes",
    ordersChartSub: "Nombre de commandes sur tout le mois affiche",
    currentMonth: "Mois affiche",
    previousMonth: "Mois precedent",
    nextMonth: "Mois suivant",
    ordersBadge: "Commandes / Abandons",
    totalOrdersBadge: "commandes",
    yLegend: "Nombre de commandes",
    xLegend: "Nombre de commandes sur le mois affiche",
    tooltipOrders: "Commandes",
    tooltipAbandons: "Abandons",
    integrations: "Integrations & analyse produit",
    integrationsSub: "Etat marketing et top produits du mois",
    active: "actives",
    connected: "Connecte",
    notConnected: "Non connecte",
    activeApps: "Applications actives",
    productSalesTests: "ventes / tests",
    otherSpaces: "Autres espaces",
    otherSpacesSub: "Les statistiques detaillees restent dans les modules metier pour garder ce dashboard court et utile.",
    navOrders: "Commandes",
    navOrdersDesc: "Workflow, relances et details",
    navProducts: "Produits",
    navProductsDesc: "Catalogue, categories et stock",
    navAdmins: "Admins",
    navAdminsDesc: "Equipe, roles et permissions",
    navApps: "Applications",
    navAppsDesc: "Pixels, analytics et tracking",
    navDelivery: "Livraison",
    navDeliveryDesc: "Societes et configurations",
    loading: "Chargement du dashboard...",
  },
  ar: {
    dashboardTag: "???? ??????",
    dashboardTitle: "????? ??????? ???????????",
    dashboardSubtitle: "???? ????? ??????? ???????? ????? ??????? ??????? ???? ?????? ?? ???????.",
    session: "??????",
    superAdmin: "???? ???",
    admin: "????",
    logout: "????? ??????",
    languageFr: "FR",
    languageAr: "AR",
    orders: "???????",
    total: "??????",
    revenue: "????????",
    products: "????????",
    users: "??????????",
    thisMonth: "??? ?????",
    today: "?????",
    topTracked: "?????? ??????",
    leadsCaptured: "????? ???????",
    salesTrend: "????? ????????",
    salesTrendSub: "???? ??? ????????? ???? ?????? ???????",
    salesBadge: "????????",
    pipeline: "???? ??????",
    pipelineSub: "???????? ???????? ?????? ?????? ?????",
    shipping: "????? ???????",
    shippingSub: "???? ?????? ????? ??????? ??? ??? ????? ??????? ??????",
    shippingTracked: "?????? ??????",
    shippingInTransit: "?? ???????",
    shippingDelivered: "?????",
    shippingReturned: "???????",
    leads: "??????? ?????????",
    abandons: "????????",
    realOrders: "??????? ???????",
    conversionRate: "???? ???????",
    abandonmentRate: "???? ??????",
    deliveryRate: "???? ???????",
    ordersChart: "???????",
    ordersChartSub: "عدد الطلبات خلال كامل الشهر المعروض",
    currentMonth: "الشهر المعروض",
    previousMonth: "الشهر السابق",
    nextMonth: "الشهر التالي",
    ordersBadge: "????? / ??????",
    totalOrdersBadge: "???",
    yLegend: "??? ???????",
    xLegend: "عدد الطلبات خلال الشهر المعروض",
    tooltipOrders: "???????",
    tooltipAbandons: "????????",
    integrations: "????????? ?????? ????????",
    integrationsSub: "???? ??????? ????????? ?????? ??? ?????",
    active: "????",
    connected: "????",
    notConnected: "??? ????",
    activeApps: "??????? ????",
    productSalesTests: "?????? / ????????",
    otherSpaces: "?????? ????",
    otherSpacesSub: "????????? ????????? ???? ???? ??????? ?????? ??? ???? ?????? ??????.",
    navOrders: "???????",
    navOrdersDesc: "???????? ?????????? ?????????",
    navProducts: "????????",
    navProductsDesc: "???????? ?????????? ????????",
    navAdmins: "????????",
    navAdminsDesc: "?????? ???????? ??????????",
    navApps: "?????????",
    navAppsDesc: "????????? ??????? ????????",
    navDelivery: "???????",
    navDeliveryDesc: "??????? ??????????",
    loading: "???? ????? ???? ??????...",
  },
} as const;

type DashboardTexts = Record<keyof typeof translations.fr, string>;

function formatMoney(value: number) {
  return `${Number(value || 0).toFixed(2)} TND`;
}

function Surface({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: radii.lg,
          padding: 18,
          borderWidth: 1,
          borderColor: colors.border,
          ...(shadows.card as object),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function StatCard({ title, value, subtitle, gradient }: { title: string; value: string; subtitle: string; gradient: string[] }) {
  return (
    <LinearGradient colors={gradient as [string, string]} style={{ borderRadius: 28, padding: 18, minHeight: 138 }}>
      <Text style={{ color: "rgba(255,255,255,0.78)", fontWeight: "700" }}>{title}</Text>
      <Text style={{ color: "white", fontSize: 28, fontWeight: "900", marginTop: 18 }}>{value}</Text>
      <Text style={{ color: "rgba(255,255,255,0.82)", fontWeight: "700", marginTop: 10 }}>{subtitle}</Text>
    </LinearGradient>
  );
}

function SectionHeader({ title, subtitle, badge }: { title: string; subtitle?: string; badge?: string }) {
  return (
    <View style={{ marginBottom: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: "900" }}>{title}</Text>
        {subtitle ? <Text style={{ color: colors.muted, marginTop: 4 }}>{subtitle}</Text> : null}
      </View>
      {badge ? (
        <View style={{ backgroundColor: colors.primarySoft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 }}>
          <Text style={{ color: colors.primary, fontWeight: "900", fontSize: 12 }}>{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

function MiniMetric({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <Text style={{ color: colors.muted, fontWeight: "700" }}>{label}</Text>
      <Text style={{ color: color || colors.text, fontWeight: "900" }}>{value}</Text>
    </View>
  );
}

function InsightTile({ title, value, accent, bg }: { title: string; value: string; accent: string; bg: string }) {
  return (
    <View style={{ flex: 1, minHeight: 92, borderRadius: 22, backgroundColor: bg, padding: 16, borderWidth: 1, borderColor: colors.border }}>
      <Text style={{ color: colors.muted, fontWeight: "700" }}>{title}</Text>
      <Text style={{ color: accent, fontWeight: "900", fontSize: 24, marginTop: 14 }}>{value}</Text>
    </View>
  );
}

function ProductAnalyticsCard({ title, revenue, orders, locale, texts }: { title: string; revenue: number; orders: number; locale: Locale; texts: DashboardTexts }) {
  return (
    <View style={{ borderRadius: 20, backgroundColor: colors.primarySoft, padding: 14, marginBottom: 10 }}>
      <Text style={{ color: colors.text, fontWeight: "900", fontSize: 15, textAlign: locale === "ar" ? "right" : "left" }}>{title}</Text>
      <Text style={{ color: colors.muted, marginTop: 4, textAlign: locale === "ar" ? "right" : "left" }}>{orders} {texts.productSalesTests}</Text>
      <Text style={{ color: colors.primary, marginTop: 8, fontWeight: "900", fontSize: 18, textAlign: locale === "ar" ? "right" : "left" }}>{formatMoney(revenue)}</Text>
    </View>
  );
}

function OrdersBarsChart({
  series,
  width,
  texts,
}: {
  series: Summary["dailySeries"];
  width: number;
  texts: DashboardTexts;
}) {
  const chartSeries = series.map((item) => ({
    label: item.label,
    orders: Number(item.orders || 0),
    revenue: Number(item.revenue || 0),
  }));
  const firstPositiveIndex = chartSeries.findIndex((item) => item.orders > 0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(firstPositiveIndex >= 0 ? firstPositiveIndex : null);
  const chartHeight = 352;
  const graphHeight = 224;
  const barWidth = 72;
  const gap = 18;
  const leftGutter = 42;
  const contentWidth = Math.max(width, leftGutter + chartSeries.length * (barWidth + gap) + 24);
  const maxOrders = Math.max(...chartSeries.map((item) => item.orders), 1);
  const step = Math.max(1, Math.ceil(maxOrders / 6));
  const topTick = step * 6;
  const yTicks = Array.from({ length: 7 }, (_, index) => topTick - index * step);
  const selectedItem = selectedIndex !== null ? chartSeries[selectedIndex] : null;
  const tooltipLeft = selectedIndex !== null ? leftGutter + selectedIndex * (barWidth + gap) : 0;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 12 }}>
      <View style={{ width: contentWidth, height: chartHeight, position: "relative" }}>
        <View style={{ position: "absolute", left: 0, top: 46, width: leftGutter, height: graphHeight, justifyContent: "space-between" }}>
          {yTicks.map((tick, index) => (
            <Text key={`${tick}-${index}`} style={{ color: colors.muted, fontWeight: "700", fontSize: 12, textAlign: "right", paddingRight: 8 }}>
              {tick}
            </Text>
          ))}
        </View>

        <View style={{ marginLeft: leftGutter, marginTop: 46, height: graphHeight, justifyContent: "space-between" }}>
          {yTicks.map((_, index) => (
            <View key={index} style={{ borderTopWidth: 1, borderTopColor: colors.border }} />
          ))}
        </View>

        <View style={{ position: "absolute", left: leftGutter, top: 0, flexDirection: "row", alignItems: "flex-end", gap }}>
          {chartSeries.map((item, index) => {
            const orders = item.orders;
            const revenue = item.revenue;
            const barHeight = Math.max(orders > 0 ? 16 : 0, (orders / maxOrders) * graphHeight);
            const selected = index === selectedIndex;
            return (
              <View key={`${item.label}-${index}`} style={{ width: barWidth, alignItems: "center", paddingTop: 18 }}>
                <Text style={{ color: colors.text, fontWeight: "900", fontSize: 12, marginBottom: 12, minHeight: 20 }}>
                  {revenue > 0 ? `${Math.round(revenue)} TND` : ""}
                </Text>
                <Pressable onPress={() => setSelectedIndex(index)} style={{ alignItems: "center" }}>
                  <View
                    style={{
                      width: barWidth,
                      height: graphHeight,
                      justifyContent: "flex-end",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        width: barWidth - 10,
                        height: barHeight,
                        borderRadius: 18,
                        backgroundColor: colors.secondary,
                        opacity: selected ? 1 : 0.92,
                      }}
                    />
                  </View>
                  <Text style={{ color: colors.muted, fontWeight: "700", fontSize: 12, marginTop: 14 }}>{item.label}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        {selectedItem ? (
          <View
            style={{
              position: "absolute",
              top: 72,
              left: Math.min(Math.max(tooltipLeft + 8, leftGutter + 8), contentWidth - 172),
              minWidth: 146,
              borderRadius: 18,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 14,
              shadowColor: "#0F172A",
              shadowOpacity: 0.12,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 8 },
              elevation: 4,
              zIndex: 12,
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "900", fontSize: 16 }}>{selectedItem.label}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }}>
              <View style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: colors.secondary }} />
              <Text style={{ color: colors.muted, fontSize: 15 }}>{texts.tooltipOrders}: {selectedItem.orders}</Text>
            </View>
            <Text style={{ color: colors.text, fontWeight: "900", marginTop: 10 }}>{formatMoney(selectedItem.revenue)}</Text>
          </View>
        ) : null}

        <Text style={{ position: "absolute", left: leftGutter, top: 2, color: colors.muted, fontWeight: "800", fontSize: 13 }}>
          {texts.yLegend}
        </Text>
      </View>
    </ScrollView>
  );
}

function SalesTrendChart({
  series,
  width,
  locale,
}: {
  series: Summary["dailySeries"];
  width: number;
  locale: Locale;
}) {
  const chartWidth = Math.max(420, width);
  const chartHeight = 280;
  const leftPadding = 34;
  const rightPadding = 18;
  const topPadding = 18;
  const bottomPadding = 38;
  const innerWidth = chartWidth - leftPadding - rightPadding;
  const innerHeight = chartHeight - topPadding - bottomPadding;
  const values = series.map((item) => Number(item.revenue || 0));
  const maxValue = Math.max(...values, 1);
  const ticks = Array.from({ length: 5 }, (_, index) => Math.round((maxValue / 4) * (4 - index)));
  const stepX = series.length > 1 ? innerWidth / (series.length - 1) : innerWidth;
  const labelEvery = series.length > 20 ? 4 : series.length > 14 ? 3 : series.length > 9 ? 2 : 1;

  const points = series.map((item, index) => {
    const x = leftPadding + index * stepX;
    const y = topPadding + innerHeight - (Number(item.revenue || 0) / maxValue) * innerHeight;
    return { x, y, label: item.label };
  });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Svg width={chartWidth} height={chartHeight}>
        {ticks.map((tick, index) => {
          const y = topPadding + (innerHeight / 4) * index;
          return (
            <React.Fragment key={`tick-${tick}-${index}`}>
              <Line x1={leftPadding} y1={y} x2={chartWidth - rightPadding} y2={y} stroke={colors.border} strokeWidth={1} />
              <SvgText x={leftPadding - 8} y={y + 4} fontSize="11" fill={colors.muted} textAnchor="end">
                {tick}
              </SvgText>
            </React.Fragment>
          );
        })}

        <Polyline
          points={points.map((point) => `${point.x},${point.y}`).join(" ")}
          fill="none"
          stroke={colors.primary}
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.map((point, index) => (
          <React.Fragment key={`point-${point.label}`}>
            <Circle cx={point.x} cy={point.y} r={4} fill={colors.primary} />
            {index % labelEvery === 0 || index === points.length - 1 ? (
              <SvgText
                x={point.x}
                y={chartHeight - 10}
                fontSize="11"
                fill={colors.muted}
                textAnchor="middle"
              >
                {locale === "ar" ? point.label.replace("Apr", "أبر").replace("Mar", "مار") : point.label}
              </SvgText>
            ) : null}
          </React.Fragment>
        ))}
      </Svg>
    </ScrollView>
  );
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = {
    x: cx + r * Math.cos((Math.PI / 180) * startAngle),
    y: cy + r * Math.sin((Math.PI / 180) * startAngle),
  };
  const end = {
    x: cx + r * Math.cos((Math.PI / 180) * endAngle),
    y: cy + r * Math.sin((Math.PI / 180) * endAngle),
  };
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

function ShippingStatTile({
  icon,
  label,
  value,
  accent,
  soft,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: number;
  accent: string;
  soft: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: 150,
        borderRadius: 22,
        backgroundColor: soft,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 12,
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          backgroundColor: "rgba(255,255,255,0.78)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Feather name={icon} size={20} color={accent} />
      </View>
      <View>
        <Text style={{ color: colors.muted, fontWeight: "700" }}>{label}</Text>
        <Text style={{ color: accent, fontWeight: "900", fontSize: 26, marginTop: 8 }}>{value}</Text>
      </View>
    </View>
  );
}

function PipelinePieChart({
  realOrders,
  abandonedLeads,
  texts,
}: {
  realOrders: number;
  abandonedLeads: number;
  texts: DashboardTexts;
}) {
  const total = Math.max(realOrders + abandonedLeads, 1);
  const confirmedRatio = realOrders / total;
  const confirmedEnd = -90 + confirmedRatio * 360;
  const size = 212;
  const cx = size / 2;
  const cy = size / 2;
  const r = 72;
  const strokeWidth = 28;

  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 6 }}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={r} stroke={colors.border} strokeWidth={strokeWidth} fill="none" />
        {realOrders > 0 ? (
          <Path
            d={describeArc(cx, cy, r, -90, confirmedEnd)}
            stroke={colors.secondary}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        ) : null}
        {abandonedLeads > 0 ? (
          <Path
            d={describeArc(cx, cy, r, confirmedEnd, 270)}
            stroke={colors.orange}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        ) : null}
      </Svg>

      <View style={{ position: "absolute", alignItems: "center" }}>
        <Text style={{ color: colors.muted, fontWeight: "700", fontSize: 13 }}>{texts.total || texts.orders}</Text>
        <Text style={{ color: colors.text, fontWeight: "900", fontSize: 28, marginTop: 4 }}>{realOrders + abandonedLeads}</Text>
      </View>

      <View style={{ marginTop: 8, width: "100%", gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <View style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: colors.secondary }} />
          <Text style={{ color: colors.muted, fontWeight: "700" }}>
            {texts.realOrders}: {realOrders}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <View style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: colors.orange }} />
          <Text style={{ color: colors.muted, fontWeight: "700" }}>
            {texts.abandons}: {abandonedLeads}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1200;
  const isTablet = width >= 768;
  const { locale } = useAdminShell();
  const [monthOffset, setMonthOffset] = useState(0);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [integrationStats, setIntegrationStats] = useState({
    facebookEnabled: false,
    gaEnabled: false,
    activeApps: 0,
  });
  const hasBootstrappedAlertRef = useRef(false);
  const knownLeadCountRef = useRef(0);
  const texts = translations[locale];

  const can = (moduleName: string, action: CrudAction, currentUser = user) => {
    if (currentUser?.isSuperAdmin) return true;
    const aliases = MODULE_ALIASES[moduleName] || [moduleName];
    return (currentUser?.permissions || []).some(
      (permission) =>
        aliases.includes(String(permission.module || "").trim().toLowerCase()) &&
        String(permission.action || "").trim().toLowerCase() === action,
    );
  };

  const load = async (silent = false, targetOffset = monthOffset) => {
    if (!silent) setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      const [storedUser, dashboardSummary] = await Promise.all([getStoredUser(), getDashboardSummary(targetOffset)]);
      const normalizedUser = storedUser as StoredUser | null;
      setUser(normalizedUser);
      setSummary(dashboardSummary as Summary);

      if (normalizedUser?.isSuperAdmin) {
        const applications = await getApplicationIntegrations();
        setIntegrationStats({
          facebookEnabled: applications.some((item) => item.integration.id === "facebook" && item.config.enabled),
          gaEnabled: applications.some((item) => item.integration.id === "google-analytics" && item.config.enabled),
          activeApps: applications.filter((item) => item.config.enabled).length,
        });
      } else {
        setIntegrationStats({ facebookEnabled: false, gaEnabled: false, activeApps: 0 });
      }

      const nextLeadCount = Number((dashboardSummary as Summary).totals?.leads || 0);
      const hasNewLead = hasBootstrappedAlertRef.current && nextLeadCount > knownLeadCountRef.current;
      knownLeadCountRef.current = nextLeadCount;
      hasBootstrappedAlertRef.current = true;

      if (hasNewLead) {
        await playNewOrderAlert();
      }
    } catch (error) {
      if ((error as { response?: { status?: number } })?.response?.status === 401) {
        await logout();
        router.replace("/login");
        return;
      }
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load(false, monthOffset);
  }, [monthOffset]);

  useEffect(() => {
    const interval = setInterval(() => load(true, monthOffset), 15000);
    return () => clearInterval(interval);
  }, [monthOffset]);

  const hasOrdersAccess = can("orders", "read");
  const hasProductsAccess = can("products", "read");
  const hasAdminsAccess = can("admins", "read");
  const isSuperAdmin = !!user?.isSuperAdmin;

  if (loading || !summary) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size='large' color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.muted }}>{texts.loading}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 36 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
      >
        <LinearGradient colors={["#0F172A", "#312E81"]} style={{ borderRadius: 32, padding: 22, overflow: "hidden" }}>
          <View style={{ flexDirection: isTablet ? "row" : "column", justifyContent: "space-between", gap: 18 }}>
            <View style={{ flex: 1 }}>
              <Badge label={texts.dashboardTag} tone="violet" />
              <Text style={{ color: "white", fontSize: 30, fontWeight: "900", marginTop: 8 }}>{texts.dashboardTitle}</Text>
              <Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 8, lineHeight: 22 }}>{texts.dashboardSubtitle}</Text>
            </View>

            <View style={{ minWidth: isTablet ? 280 : undefined, gap: 12 }}>
              <View style={{ borderRadius: 22, backgroundColor: "rgba(255,255,255,0.08)", padding: 16 }}>
                <Text style={{ color: "#C7D2FE", fontWeight: "700" }}>{texts.currentMonth}</Text>
                <Text style={{ color: "white", fontWeight: "900", fontSize: 20, marginTop: 6 }}>{summary.month.label}</Text>
                <Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 6 }}>
                  {summary.month.ordersCount + summary.month.abandonedCount} {texts.totalOrdersBadge} • {formatMoney(summary.month.revenue)}
                </Text>
              </View>
              <View style={{ borderRadius: 22, backgroundColor: "rgba(255,255,255,0.08)", padding: 16 }}>
                <Text style={{ color: "#C7D2FE", fontWeight: "700" }}>{texts.session}</Text>
                <Text style={{ color: "white", fontWeight: "900", fontSize: 18, marginTop: 6 }}>
                  {user?.isSuperAdmin ? texts.superAdmin : texts.admin}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 6 }}>{user?.email || user?.sub}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {hasOrdersAccess ? (
          <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <StatCard title={texts.orders} value={String(summary.totals.orders)} subtitle={`${summary.month.ordersCount + summary.month.abandonedCount} ${texts.thisMonth}`} gradient={["#4F46E5", "#6366F1"]} />
            </View>
            <View style={{ flex: 1 }}>
              <StatCard title={texts.revenue} value={formatMoney(summary.totals.revenue)} subtitle={`${formatMoney(summary.today.revenue)} ${texts.today}`} gradient={["#0891B2", "#06B6D4"]} />
            </View>
            <View style={{ flex: 1 }}>
              <StatCard title={texts.products} value={String(summary.totals.products)} subtitle={`${summary.productTests.testedProducts} ${texts.topTracked}`} gradient={["#059669", "#10B981"]} />
            </View>
            <View style={{ flex: 1 }}>
              <StatCard title={texts.users} value={String(summary.totals.users || 0)} subtitle={`${summary.totals.leads} ${texts.leadsCaptured}`} gradient={["#7C3AED", "#8B5CF6"]} />
            </View>
          </View>
        ) : null}

        {hasOrdersAccess ? (
          <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 16 }}>
            <Surface style={{ flex: 1.7, overflow: "hidden", minWidth: 0 }}>
              <SectionHeader title={texts.salesTrend} subtitle={texts.salesTrendSub} badge={texts.salesBadge} />
              <SalesTrendChart
                series={summary.dailySeries}
                width={isDesktop ? Math.max(480, Math.floor((width - 120) * 0.5)) : Math.max(320, width - 90)}
                locale={locale}
              />
            </Surface>

            <Surface style={{ flex: 1, minWidth: 0 }}>
              <SectionHeader title={texts.pipeline} subtitle={texts.pipelineSub} badge={`${summary.pipeline.conversionRate}%`} />
              <View style={{ flexDirection: isTablet ? "row" : "column", gap: 16, alignItems: "center" }}>
                <View style={{ flex: 1, width: "100%" }}>
                  <PipelinePieChart
                    realOrders={summary.pipeline.realOrders}
                    abandonedLeads={summary.pipeline.abandonedLeads}
                    texts={texts}
                  />
                </View>
                <View style={{ flex: 1, width: "100%" }}>
                  <View style={{ flexDirection: "row", gap: 12, marginBottom: 14 }}>
                    <InsightTile title={texts.leads} value={String(summary.pipeline.totalLeads)} accent={colors.primary} bg={colors.primarySoft} />
                    <InsightTile title={texts.abandons} value={String(summary.pipeline.abandonedLeads)} accent={colors.orange} bg={colors.orangeSoft} />
                  </View>
                  <MiniMetric label={texts.realOrders} value={String(summary.pipeline.realOrders)} color={colors.green} />
                  <MiniMetric label={texts.conversionRate} value={`${summary.pipeline.conversionRate}%`} color={colors.primary} />
                  <MiniMetric label={texts.abandonmentRate} value={`${summary.pipeline.abandonmentRate}%`} color={colors.red} />
                  <MiniMetric label={texts.deliveryRate} value={`${summary.tracking.deliveredPercent}%`} color={colors.green} />
                </View>
              </View>
            </Surface>
          </View>
        ) : null}

        {hasOrdersAccess ? (
          <Surface>
            <SectionHeader
              title={texts.ordersChart}
              subtitle={`${summary.month.label} • ${texts.ordersChartSub}`}
              badge={`${summary.month.ordersCount + summary.month.abandonedCount} ${texts.totalOrdersBadge}`}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, marginBottom: 10 }}>
              <Pressable
                onPress={() => setMonthOffset((value) => value - 1)}
                style={{ backgroundColor: colors.primarySoft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }}
              >
                <Text style={{ color: colors.primary, fontWeight: "800" }}>← {texts.previousMonth}</Text>
              </Pressable>
              {monthOffset < 0 ? (
                <Pressable
                  onPress={() => setMonthOffset((value) => Math.min(value + 1, 0))}
                  style={{ backgroundColor: colors.secondarySoft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }}
                >
                  <Text style={{ color: colors.secondary, fontWeight: "800" }}>{texts.nextMonth} →</Text>
                </Pressable>
              ) : null}
            </View>
            <OrdersBarsChart series={summary.dailySeries} width={Math.max(360, width - 80)} texts={texts} />
            <Text style={{ color: colors.muted, fontWeight: "700", textAlign: "center", fontSize: 12, marginTop: 6 }}>
              {texts.xLegend}
            </Text>
          </Surface>
        ) : null}

        {hasOrdersAccess ? (
          <Surface>
            <SectionHeader
              title={texts.shipping}
              subtitle={texts.shippingSub}
              badge={`${summary.shipping.totalTracked} ${texts.shippingTracked.toLowerCase()}`}
            />
            <View
              style={{
                flexDirection: isDesktop ? "row" : "column",
                gap: 14,
              }}
            >
              <ShippingStatTile
                icon="package"
                label={texts.shippingTracked}
                value={summary.shipping.created}
                accent={colors.primary}
                soft={colors.primarySoft}
              />
              <ShippingStatTile
                icon="truck"
                label={texts.shippingInTransit}
                value={summary.shipping.inTransit}
                accent={colors.orange}
                soft={colors.orangeSoft}
              />
              <ShippingStatTile
                icon="check-circle"
                label={texts.shippingDelivered}
                value={summary.shipping.delivered}
                accent={colors.green}
                soft={colors.greenSoft}
              />
              <ShippingStatTile
                icon="corner-up-left"
                label={texts.shippingReturned}
                value={summary.shipping.returned}
                accent={colors.red}
                soft={colors.redSoft}
              />
            </View>
          </Surface>
        ) : null}

        {isSuperAdmin ? (
          <Surface>
            <SectionHeader title={texts.integrations} subtitle={texts.integrationsSub} badge={`${integrationStats.activeApps} ${texts.active}`} />
            <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 16 }}>
              <View style={{ flex: 0.95, gap: 12 }}>
                <View style={{ borderRadius: 18, backgroundColor: integrationStats.facebookEnabled ? colors.greenSoft : colors.secondarySoft, padding: 14 }}>
                  <Text style={{ color: colors.text, fontWeight: "800" }}>Facebook Ads</Text>
                  <Text style={{ color: integrationStats.facebookEnabled ? colors.green : colors.secondary, fontWeight: "900", marginTop: 6 }}>
                    {integrationStats.facebookEnabled ? texts.connected : texts.notConnected}
                  </Text>
                </View>
                <View style={{ borderRadius: 18, backgroundColor: integrationStats.gaEnabled ? colors.greenSoft : colors.secondarySoft, padding: 14 }}>
                  <Text style={{ color: colors.text, fontWeight: "800" }}>Google Analytics</Text>
                  <Text style={{ color: integrationStats.gaEnabled ? colors.green : colors.secondary, fontWeight: "900", marginTop: 6 }}>
                    {integrationStats.gaEnabled ? texts.connected : texts.notConnected}
                  </Text>
                </View>
                <InsightTile title={texts.activeApps} value={String(integrationStats.activeApps)} accent={colors.primary} bg={colors.primarySoft} />
              </View>
              <View style={{ flex: 1.45 }}>
                {summary.productTests.topProducts.map((product) => (
                  <ProductAnalyticsCard key={product.name} title={product.name} orders={product.orders} revenue={product.revenue} locale={locale} texts={texts} />
                ))}
              </View>
            </View>
          </Surface>
        ) : null}
      </ScrollView>
    </View>
  );
}






