import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Input } from "../../src/ui/atoms";
import { colors } from "../../src/ui/theme";
import {
  getApplicationIntegrations,
} from "../../src/services/application-integrations.service";
import type { ApplicationIntegrationCategory } from "../../src/types/application";

type IntegrationItem = Awaited<ReturnType<typeof getApplicationIntegrations>>[number];

const TABS: { key: "all" | ApplicationIntegrationCategory; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "marketing", label: "Marketing" },
  { key: "analytics", label: "Analytics" },
  { key: "commerce", label: "Commerce" },
  { key: "security", label: "Securite" },
  { key: "messaging", label: "Messaging" },
];

export default function ApplicationIntegrationsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const columns = width >= 1400 ? 5 : width >= 1100 ? 4 : width >= 820 ? 3 : 1;
  const cardWidth = width >= 820 ? Math.max(250, Math.floor((width - 32 - (columns - 1) * 16) / columns)) : width - 32;
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | ApplicationIntegrationCategory>("all");
  const [items, setItems] = useState<IntegrationItem[]>([]);

  useEffect(() => {
    (async () => {
      setItems(await getApplicationIntegrations());
    })();
  }, []);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesTab = tab === "all" || item.integration.category === tab;
      const matchesSearch =
        !search ||
        item.integration.name.toLowerCase().includes(search) ||
        item.integration.description.toLowerCase().includes(search);
      return matchesTab && matchesSearch;
    });
  }, [items, query, tab]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <View>
            <Text style={{ color: colors.blue, fontSize: 28, fontWeight: "900" }}>Integrations Applications</Text>
            <Text style={{ color: colors.grayText, marginTop: 4 }}>
              Marketing, analytics, marketplaces, domaines et services externes.
            </Text>
          </View>
        </View>

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
              <Input value={query} onChangeText={setQuery} placeholder="Rechercher une application" />
            </View>
          </View>
        </Card>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
          {filtered.map((item) => (
            <Card
              key={item.integration.id}
              style={{
                width: cardWidth,
                padding: 0,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: 140,
                  backgroundColor: item.integration.accent,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 16,
                }}
              >
                <Text
                  style={{
                    color: item.integration.textColor,
                    fontSize: 28,
                    fontWeight: "900",
                    textAlign: "center",
                  }}
                >
                  {item.integration.name}
                </Text>
              </View>

              <View style={{ padding: 16, gap: 12 }}>
                <Text style={{ color: "#0F172A", fontWeight: "900", fontSize: 18 }}>
                  {item.integration.name}
                </Text>
                <Text style={{ color: colors.grayText, minHeight: 66 }}>
                  {item.integration.description}
                </Text>

                <Button
                  title={item.config.enabled ? "Integre" : "Integrer"}
                  variant={item.config.enabled ? "orange" : "primary"}
                  onPress={() => router.push(`/app-integrations/${item.integration.id}` as never)}
                />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
