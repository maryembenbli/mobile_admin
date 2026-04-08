import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Card, Input } from "../../src/ui/atoms";
import { colors } from "../../src/ui/theme";
import {
  DELIVERY_PROVIDERS,
  getDeliveryIntegrationConfig,
  saveDeliveryIntegrationConfig,
} from "../../src/services/delivery-integrations.service";

export default function DeliveryProviderConfigScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ provider?: string | string[] }>();
  const providerId = Array.isArray(params.provider) ? params.provider[0] : params.provider;
  const provider = useMemo(
    () => DELIVERY_PROVIDERS.find((item) => item.id === providerId),
    [providerId]
  );

  const [enabled, setEnabled] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [returnCost, setReturnCost] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!providerId) return;

    (async () => {
      const config = await getDeliveryIntegrationConfig(providerId);
      setEnabled(Boolean(config.enabled));
      setUsername(config.username || "");
      setPassword(config.password || "");
      setShippingCost(config.shippingCost || "");
      setReturnCost(config.returnCost || "");
      setStoreName(config.storeName || "");
      setStorePhone(config.storePhone || "");
      setStoreAddress(config.storeAddress || "");
      setTaxId(config.taxId || "");
    })();
  }, [providerId]);

  const save = async () => {
    if (!providerId) return;
    try {
      setSaving(true);
      await saveDeliveryIntegrationConfig(providerId, {
        enabled,
        username,
        password,
        shippingCost,
        returnCost,
        storeName,
        storePhone,
        storeAddress,
        taxId,
      });
      Alert.alert("Succes", "Integration enregistree.");
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible d enregistrer l integration.");
    } finally {
      setSaving(false);
    }
  };

  if (!provider) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg }}>
        <Text style={{ color: colors.grayText }}>Societe introuvable.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <Text style={{ color: "#0F172A", fontSize: 26, fontWeight: "900" }}>{provider.name}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Pressable onPress={() => setEnabled((current) => !current)} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 999,
                  backgroundColor: enabled ? colors.orange : "#E2E8F0",
                  padding: 3,
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    backgroundColor: "white",
                    marginLeft: enabled ? 20 : 0,
                  }}
                />
              </View>
            </Pressable>
            <Button title={saving ? "Enregistrement..." : "Enregistrer"} onPress={save} disabled={saving} />
          </View>
        </View>

        <Card>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A", marginBottom: 14 }}>Identifiants</Text>
          <View style={{ gap: 12 }}>
            <View>
              <Text style={{ fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>Nom d utilisateur {provider.name}</Text>
              <Input value={username} onChangeText={setUsername} placeholder={`Nom d'utilisateur ${provider.name}`} />
            </View>
            <View>
              <Text style={{ fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>Mot de passe {provider.name}</Text>
              <Input value={password} onChangeText={setPassword} placeholder={`Mot de passe ${provider.name}`} secureTextEntry />
            </View>
          </View>
        </Card>

        <Card>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A", marginBottom: 14 }}>Cout</Text>
          <View style={{ gap: 12 }}>
            <View>
              <Text style={{ fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>Cout de livraison</Text>
              <Input value={shippingCost} onChangeText={setShippingCost} placeholder="Cout de livraison" />
            </View>
            <View>
              <Text style={{ fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>Cout de retour</Text>
              <Input value={returnCost} onChangeText={setReturnCost} placeholder="Cout de retour" />
            </View>
          </View>
        </Card>

        <Card>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A", marginBottom: 14 }}>Libelle</Text>
          <View style={{ gap: 12 }}>
            <View>
              <Text style={{ fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>Nom de magasin</Text>
              <Input value={storeName} onChangeText={setStoreName} placeholder="Nom de magasin" />
            </View>
            <View>
              <Text style={{ fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>Numero de telephone du magasin</Text>
              <Input value={storePhone} onChangeText={setStorePhone} placeholder="Numero de telephone du magasin" />
            </View>
            <View>
              <Text style={{ fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>Adresse du magasin</Text>
              <Input value={storeAddress} onChangeText={setStoreAddress} placeholder="Adresse du magasin" />
            </View>
            <View>
              <Text style={{ fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>Matricule fiscale</Text>
              <Input value={taxId} onChangeText={setTaxId} placeholder="Matricule fiscale" />
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
