import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { getStoredUser, getToken, logout } from "../src/services/auth.service";

type Tab = "dashboard" | "products" | "orders" | "stats";
type StoredUser = { sub: string; permissions?: string[]; isSuperAdmin?: boolean };

const colors = {
  blue: "#1E3A8A",
  orange: "#F97316",
  bg: "#F3F4F6",
  white: "#FFFFFF",
  grayText: "#6B7280",
  border: "#E5E7EB",
  green: "#10B981",
  amber: "#F59E0B",
};

function Card({
  children,
  leftAccent,
}: {
  children: React.ReactNode;
  leftAccent?: string;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        borderLeftWidth: leftAccent ? 4 : 1,
        borderLeftColor: leftAccent || colors.border,
      }}
    >
      {children}
    </View>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  const can = (perm: string) => {
    const perms = user?.permissions || [];
    return perms.includes("*") || perms.includes(perm);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const token = await getToken();
      if (!token) return router.replace("/login");
      setUser((await getStoredUser()) as StoredUser);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ textAlign: "center", marginTop: 10 }}>Chargement...</Text>
      </View>
    );
  }

  const KPI = ({
    title,
    value,
    accent,
  }: {
    title: string;
    value: string;
    accent: string;
  }) => (
    <View style={{ flex: 1, minWidth: 150 }}>
      <Card leftAccent={accent}>
        <Text style={{ fontSize: 20, fontWeight: "900", color: colors.blue }}>{value}</Text>
        <Text style={{ color: colors.grayText, marginTop: 4 }}>{title}</Text>
      </Card>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.blue, padding: 16 }}>
        <Text style={{ color: "white", fontSize: 20, fontWeight: "900" }}>
          Dashboard Admin
        </Text>
        <Text style={{ color: "#BFDBFE", marginTop: 4 }}>ID: {user?.sub}</Text>

        <Pressable
          onPress={async () => {
            await logout();
            router.replace("/login");
          }}
          style={{
            marginTop: 12,
            backgroundColor: "rgba(255,255,255,0.15)",
            padding: 10,
            borderRadius: 12,
            alignSelf: "flex-start",
          }}
        >
          <Text style={{ color: "white", fontWeight: "800" }}>Déconnexion</Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 90 }}>
        {tab === "dashboard" && (
          <>
            <Text style={{ fontSize: 20, fontWeight: "900", color: colors.blue, marginBottom: 12 }}>
              Vue d'ensemble
            </Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 as any }}>
              <KPI title="Commandes" value="-" accent={colors.blue} />
              <KPI title="Revenus" value="-" accent={colors.green} />
              <KPI title="Stock Faible" value="-" accent={colors.orange} />
              <KPI title="Taux Confirmation" value="-" accent={colors.amber} />
            </View>

            <Card leftAccent={colors.blue} >
              <Text style={{ fontSize: 16, fontWeight: "900", color: colors.blue }}>
                Actions rapides
              </Text>

              <View style={{ flexDirection: "row", gap: 10 as any, marginTop: 10 }}>
                {can("PRODUCTS") && (
                  <Pressable
                    onPress={() => setTab("products")}
                    style={{
                      flex: 1,
                      backgroundColor: colors.blue,
                      padding: 12,
                      borderRadius: 12,
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "800", textAlign: "center" }}>
                      Produits
                    </Text>
                  </Pressable>
                )}

                {can("ORDERS") && (
                  <Pressable
                    onPress={() => setTab("orders")}
                    style={{
                      flex: 1,
                      backgroundColor: colors.orange,
                      padding: 12,
                      borderRadius: 12,
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "800", textAlign: "center" }}>
                      Commandes
                    </Text>
                  </Pressable>
                )}
              </View>
            </Card>

            {/* SuperAdmin فقط */}
            {(user?.permissions || []).includes("*") && (
              <Pressable
                onPress={() => router.push("/admins")}
                style={{
                  marginTop: 14,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 12,
                  borderRadius: 14,
                  backgroundColor: "white",
                }}
              >
                <Text style={{ textAlign: "center", fontWeight: "900", color: colors.blue }}>
                  Admins (Super Admin)
                </Text>
              </Pressable>
            )}
          </>
        )}

        {tab === "products" && (
          <Card leftAccent={colors.blue}>
            <Text style={{ fontWeight: "900", color: colors.blue }}>Produits</Text>
            <Text style={{ marginTop: 6, color: colors.grayText }}>
              TODO: écran produits (list + add/edit)
            </Text>
          </Card>
        )}

        {tab === "orders" && (
          <Card leftAccent={colors.orange}>
            <Text style={{ fontWeight: "900", color: colors.blue }}>Commandes</Text>
            <Text style={{ marginTop: 6, color: colors.grayText }}>
              TODO: écran commandes (confirmation)
            </Text>
          </Card>
        )}

        {tab === "stats" && (
          <Card leftAccent={colors.amber}>
            <Text style={{ fontWeight: "900", color: colors.blue }}>Statistiques</Text>
            <Text style={{ marginTop: 6, color: colors.grayText }}>TODO</Text>
          </Card>
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          {[
            { key: "dashboard", label: "Accueil" },
            { key: "products", label: "Produits", perm: "PRODUCTS" },
            { key: "orders", label: "Commandes", perm: "ORDERS" },
            { key: "stats", label: "Stats", perm: "STATS" },
          ].map((item) => {
            if (item.perm && !can(item.perm)) return null;
            const active = tab === (item.key as Tab);
            return (
              <Pressable
                key={item.key}
                onPress={() => setTab(item.key as Tab)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  alignItems: "center",
                  backgroundColor: active ? "#EFF6FF" : "white",
                }}
              >
                <Text style={{ color: active ? colors.blue : colors.grayText, fontWeight: "800" }}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
