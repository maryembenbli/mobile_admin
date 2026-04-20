import React, { useEffect, useMemo, useState } from "react";
import { Linking, Platform, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import type { UserPermission } from "../constants/permissions";
import { colors, radii, shadows } from "../ui/theme";
import { Badge } from "../ui/atoms";
import type { AdminShellLocale, AdminShellUser } from "../context/AdminShellContext";

type CrudAction = "read" | "create" | "update" | "delete";

type NavLabelSet = {
  brandTitle: string;
  brandSubtitle: string;
  dashboard: string;
  orders: string;
  products: string;
  admins: string;
  applications: string;
  delivery: string;
  categories: string;
  permissions: string;
  deliveryTracking: string;
  openStore: string;
  connectedAs: string;
  logout: string;
  menu: string;
  dashboardHint: string;
  catalogueGroup: string;
  teamGroup: string;
};

const MODULE_ALIASES: Record<string, string[]> = {
  dashboard: ["dashboard", "stats", "statistique", "statistiques"],
  orders: ["orders", "order", "commande", "commandes"],
  products: ["products", "product", "produit", "produits"],
  admins: ["admins", "admin", "users", "utilisateur", "utilisateurs", "staff"],
  applications: ["applications", "integrations", "app-integrations", "marketing", "analytics"],
  delivery: ["livraison", "delivery", "delivery-integrations", "delivery-shipments"],
};

const labels: Record<AdminShellLocale, NavLabelSet> = {
  fr: {
    brandTitle: "NOVIKA",
    brandSubtitle: "Plateforme admin e-commerce",
    dashboard: "Dashboard",
    orders: "Commandes",
    products: "Produits",
    admins: "Admins",
    applications: "Applications",
    delivery: "Livraison",
    categories: "Categories",
    permissions: "Permissions",
    deliveryTracking: "Suivi commande",
    openStore: "Voir la boutique",
    connectedAs: "Connecte en tant que",
    logout: "Deconnexion",
    menu: "Menu",
    dashboardHint: "Pilotage commercial, operations et catalogue dans une meme coque NOVIKA.",
    catalogueGroup: "Catalogue",
    teamGroup: "Equipe & securite",
  },
  ar: {
    brandTitle: "NOVIKA",
    brandSubtitle: "منصة إدارة التجارة الإلكترونية",
    dashboard: "لوحة التحكم",
    orders: "الطلبات",
    products: "المنتجات",
    admins: "المشرفون",
    applications: "التطبيقات",
    delivery: "التوصيل",
    categories: "التصنيفات",
    permissions: "الصلاحيات",
    deliveryTracking: "متابعة الشحنات",
    openStore: "عرض المتجر",
    connectedAs: "المستخدم المتصل",
    logout: "تسجيل الخروج",
    menu: "القائمة",
    dashboardHint: "متابعة المبيعات والعمليات والكتالوج داخل واجهة NOVIKA موحدة.",
    catalogueGroup: "Catalogue",
    teamGroup: "Equipe & securite",
  },
};

type NavigationItem = {
  key: string;
  label: string;
  route: string;
  accent: string;
  visible: boolean;
  children?: NavigationItem[];
};

function canAccess(user: AdminShellUser, moduleName: string, action: CrudAction = "read") {
  if (user?.isSuperAdmin) return true;
  const aliases = MODULE_ALIASES[moduleName] || [moduleName];
  return (user?.permissions || []).some((permission: UserPermission) => {
    const permissionModule = String(permission.module || "").trim().toLowerCase();
    const permissionAction = String(permission.action || "").trim().toLowerCase();
    return aliases.includes(permissionModule) && permissionAction === action;
  });
}

function resolveTitle(pathname: string, locale: AdminShellLocale) {
  const t = labels[locale];
  if (pathname.startsWith("/orders")) return t.orders;
  if (pathname.startsWith("/products")) return t.products;
  if (pathname.startsWith("/admins")) return t.admins;
  if (pathname.startsWith("/app-integrations")) return t.applications;
  if (pathname.startsWith("/delivery-shipments")) return t.deliveryTracking;
  if (pathname.startsWith("/delivery-integrations")) return t.delivery;
  if (pathname.startsWith("/categories")) return t.categories;
  if (pathname.startsWith("/permissions")) return t.permissions;
  return t.dashboard;
}

export default function AdminAppShell({
  pathname,
  locale,
  setLocale,
  user,
  onLogout,
  children,
}: {
  pathname: string;
  locale: AdminShellLocale;
  setLocale: (locale: AdminShellLocale) => void;
  user: AdminShellUser;
  onLogout: () => Promise<void>;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1180;
  const isTablet = width >= 760;
  const isCompactMobile = width < 520;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const t = labels[locale];
  const pageTitle = resolveTitle(pathname, locale);
  const storefrontUrl = process.env.EXPO_PUBLIC_STOREFRONT_URL || "http://127.0.0.1:5173";

  const navigationItems = useMemo(
    () =>
      [
        { key: "dashboard", label: t.dashboard, route: "/dashboard", accent: colors.cobalt, visible: true },
        { key: "orders", label: t.orders, route: "/orders", accent: colors.violet, visible: canAccess(user, "orders") },
        {
          key: "products",
          label: t.products,
          route: "/products",
          accent: colors.teal,
          visible: canAccess(user, "products"),
          children: [
            {
              key: "categories",
              label: t.categories,
              route: "/categories",
              accent: colors.teal,
              visible: canAccess(user, "products"),
            },
          ],
        },
        {
          key: "admins",
          label: t.admins,
          route: "/admins",
          accent: colors.orange,
          visible: canAccess(user, "admins"),
          children: [
            {
              key: "permissions",
              label: t.permissions,
              route: "/permissions",
              accent: colors.orange,
              visible: canAccess(user, "admins"),
            },
          ],
        },
        { key: "applications", label: t.applications, route: "/app-integrations", accent: colors.cobalt, visible: !!user?.isSuperAdmin },
        {
          key: "delivery",
          label: t.delivery,
          route: "/delivery-integrations",
          accent: colors.green,
          visible: !!user?.isSuperAdmin,
          children: [
            {
              key: "deliveryTracking",
              label: t.deliveryTracking,
              route: "/delivery-shipments",
              accent: colors.green,
              visible: !!user?.isSuperAdmin,
            },
          ],
        },
      ]
        .filter((item) => item.visible)
        .map((item) => ({
          ...item,
          children: item.children?.filter((child) => child.visible),
        })) as NavigationItem[],
    [t, user],
  );

  const openStorefront = async () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.open(storefrontUrl, "_blank", "noopener,noreferrer");
      return;
    }
    await Linking.openURL(storefrontUrl);
  };

  useEffect(() => {
    setExpandedGroups((prev) => {
      const next = { ...prev };
      navigationItems.forEach((item) => {
        if (!item.children?.length) return;
        const shouldBeOpen =
          pathname === item.route ||
          pathname.startsWith(`${item.route}/`) ||
          item.children.some((child) => pathname === child.route || pathname.startsWith(`${child.route}/`));
        if (shouldBeOpen) next[item.key] = true;
        else if (typeof next[item.key] === "undefined") next[item.key] = false;
      });
      return next;
    });
  }, [navigationItems, pathname]);

  const renderNavigationItem = (item: NavigationItem) => {
    const active = pathname === item.route || pathname.startsWith(`${item.route}/`);
    const childActive = item.children?.some((child) => pathname === child.route || pathname.startsWith(`${child.route}/`));
    const expanded = !!expandedGroups[item.key];

    return (
      <View key={item.route} style={{ gap: 8 }}>
        <Pressable
          onPress={() => {
            router.push(item.route as never);
            setMobileMenuOpen(false);
            if (item.children?.length) {
              setExpandedGroups((prev) => ({ ...prev, [item.key]: true }));
            }
          }}
          style={{
            borderRadius: radii.md,
            paddingHorizontal: 14,
            paddingVertical: 14,
            backgroundColor: active || childActive ? "rgba(255,255,255,0.12)" : "transparent",
            borderWidth: 1,
            borderColor: active || childActive ? "rgba(255,255,255,0.12)" : "transparent",
            flexDirection: isDesktop ? "row" : "column",
            alignItems: isDesktop ? "center" : "stretch",
            gap: 12,
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: isDesktop ? "row" : "column", alignItems: isDesktop ? "center" : "stretch", gap: isDesktop ? 12 : 8, flex: isDesktop ? 1 : undefined }}>
            <View style={{ width: 12, height: 12, borderRadius: radii.pill, backgroundColor: item.accent }} />
            <Text style={{ color: active || childActive ? colors.white : "rgba(255,255,255,0.82)", fontWeight: "800", fontSize: 15 }}>
              {item.label}
            </Text>
          </View>
          {item.children?.length ? (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                setExpandedGroups((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
              }}
              style={{
                width: 26,
                height: 26,
                borderRadius: radii.pill,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.08)",
              }}
            >
              <Text style={{ color: colors.white, fontWeight: "900", fontSize: 14 }}>{expanded ? "−" : "+"}</Text>
            </Pressable>
          ) : null}
        </Pressable>

        {item.children?.length && expanded ? (
          <View
            style={{
              marginLeft: 18,
              paddingLeft: 16,
              borderLeftWidth: 1,
              borderLeftColor: "rgba(255,255,255,0.12)",
              gap: 8,
            }}
          >
            {item.children.map((child) => {
              const isChildActive = pathname === child.route || pathname.startsWith(`${child.route}/`);
              return (
                <Pressable
                  key={child.route}
                  onPress={() => {
                    router.push(child.route as never);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    borderRadius: radii.md,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    backgroundColor: isChildActive ? "rgba(255,255,255,0.1)" : "transparent",
                    borderWidth: 1,
                    borderColor: isChildActive ? "rgba(255,255,255,0.12)" : "transparent",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <View style={{ width: 8, height: 8, borderRadius: radii.pill, backgroundColor: child.accent }} />
                  <Text style={{ color: isChildActive ? colors.white : "rgba(255,255,255,0.72)", fontWeight: "700", fontSize: 14 }}>
                    {child.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>
    );
  };

  const Sidebar = (
    <View
      style={{
        width: isDesktop ? 288 : Math.min(320, Math.max(274, width - 40)),
        backgroundColor: colors.navy,
        borderRadius: isDesktop ? 0 : radii.xl,
        paddingHorizontal: 18,
        paddingVertical: 18,
        ...(shadows.card as object),
      }}
    >
      <LinearBrandBlock title={t.brandTitle} subtitle={t.brandSubtitle} />

      <View style={{ marginTop: 22, marginBottom: 14 }}>
        <Badge label={t.menu} tone="muted" />
      </View>

      <ScrollView contentContainerStyle={{ gap: 8, paddingBottom: 20 }}>
        {navigationItems.map(renderNavigationItem)}
      </ScrollView>

      <View
        style={{
          marginTop: "auto",
          borderRadius: radii.lg,
          backgroundColor: "rgba(255,255,255,0.08)",
          padding: 14,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <Text style={{ color: "rgba(255,255,255,0.62)", fontWeight: "700", fontSize: 12 }}>{t.connectedAs}</Text>
        <Text style={{ color: colors.white, fontWeight: "900", marginTop: 6 }}>{user?.email || user?.sub || "Admin"}</Text>
        <Pressable
          onPress={onLogout}
          style={{
            marginTop: 14,
            borderRadius: radii.md,
            backgroundColor: colors.orange,
            paddingVertical: 12,
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.white, fontWeight: "900" }}>{t.logout}</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, flexDirection: "row", backgroundColor: colors.bg }}>
      {isDesktop ? Sidebar : null}

      {!isDesktop && mobileMenuOpen ? (
        <Pressable
          onPress={() => setMobileMenuOpen(false)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.overlay,
            zIndex: 30,
            flexDirection: "row",
          }}
        >
          <Pressable onPress={(event) => event.stopPropagation()} style={{ marginTop: 12, marginBottom: 12, marginLeft: 12 }}>
            {Sidebar}
          </Pressable>
        </Pressable>
      ) : null}

      <View style={{ flex: 1 }}>
        <View
          style={{
            marginHorizontal: 14,
            marginTop: 14,
            marginBottom: 0,
            borderRadius: radii.xl,
            backgroundColor: colors.white,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 18,
            paddingVertical: 16,
            flexDirection: isDesktop ? "row" : "column",
            alignItems: isDesktop ? "center" : "stretch",
            justifyContent: "space-between",
            gap: 14,
            ...(shadows.card as object),
          }}
        >
          <View style={{ flexDirection: isDesktop ? "row" : "column", alignItems: isDesktop ? "center" : "stretch", gap: isDesktop ? 12 : 8, flex: isDesktop ? 1 : undefined }}>
            {!isDesktop ? (
              <Pressable
                onPress={() => setMobileMenuOpen(true)}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: radii.md,
                  backgroundColor: colors.cobaltSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: colors.cobalt, fontWeight: "900", fontSize: 20 }}>≡</Text>
              </Pressable>
            ) : null}
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 26, fontWeight: "900" }}>{pageTitle}</Text>
              <Text style={{ color: colors.grayText, marginTop: 4 }}>{t.dashboardHint}</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <View style={{ flexDirection: "row", backgroundColor: colors.bgMuted, borderRadius: radii.pill, padding: 4 }}>
              <LocaleChip label="FR" active={locale === "fr"} onPress={() => setLocale("fr")} />
              <LocaleChip label="AR" active={locale === "ar"} onPress={() => setLocale("ar")} />
            </View>

            <Pressable
              onPress={openStorefront}
              style={{
                borderRadius: radii.pill,
                paddingHorizontal: 14,
                paddingVertical: 10,
                backgroundColor: colors.orangeSoft,
                borderWidth: 1,
                borderColor: "#FED7AA",
              }}
            >
              <Text style={{ color: colors.orange, fontWeight: "900" }}>{t.openStore}</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ flex: 1, padding: 14 }}>{children}</View>
      </View>
    </View>
  );
}

function LocaleChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        borderRadius: radii.pill,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: active ? colors.white : "transparent",
      }}
    >
      <Text style={{ color: active ? colors.text : colors.cobalt, fontWeight: "900" }}>{label}</Text>
    </Pressable>
  );
}

function LinearBrandBlock({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View
      style={{
        borderRadius: radii.lg,
        backgroundColor: "rgba(255,255,255,0.08)",
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 18,
            backgroundColor: colors.orange,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: colors.white, fontWeight: "900", fontSize: 18 }}>N</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.white, fontWeight: "900", fontSize: 24 }}>{title}</Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{subtitle}</Text>
        </View>
      </View>
    </View>
  );
}

