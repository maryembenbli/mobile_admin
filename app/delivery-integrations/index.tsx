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
  getDeliveryIntegrations,
} from "../../src/services/delivery-integrations.service";
import type { DeliveryProviderCategory } from "../../src/types/delivery";

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

  const load = async () => {
    const data = await getDeliveryIntegrations();
    setItems(data);
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

      </ScrollView>
    </View>
  );
}
