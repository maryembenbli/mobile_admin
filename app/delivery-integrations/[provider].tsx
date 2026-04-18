import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Card, Input } from "../../src/ui/atoms";
import { colors } from "../../src/ui/theme";
import {
  getDeliveryIntegrationConfig,
  getDeliveryIntegrations,
  saveDeliveryIntegrationConfig,
  testDeliveryIntegration,
} from "../../src/services/delivery-integrations.service";

export default function DeliveryProviderConfigScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ provider?: string | string[] }>();
  const providerId = Array.isArray(params.provider) ? params.provider[0] : params.provider;
  const [enabled, setEnabled] = useState(false);
  const [provider, setProvider] = useState<any>(null);
  const [apiCode, setApiCode] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [returnCost, setReturnCost] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [defaultPieceSize, setDefaultPieceSize] = useState("1");
  const [serviceType, setServiceType] = useState("Livraison");
  const [trackingCodeToTest, setTrackingCodeToTest] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const hasCoreCredentials = Boolean(apiCode.trim() && apiKey.trim());

  useEffect(() => {
    if (!providerId) return;

    (async () => {
      const integrations = await getDeliveryIntegrations();
      const match = integrations.find((item) => item.provider.id === providerId);
      setProvider(match?.provider || null);
      const config = await getDeliveryIntegrationConfig(providerId);
      setEnabled(Boolean(config.enabled));
      setApiCode(config.apiCode || "");
      setApiKey(config.apiKey || "");
      setUsername(config.username || "");
      setPassword(config.password || "");
      setShippingCost(config.shippingCost || "");
      setReturnCost(config.returnCost || "");
      setStoreName(config.storeName || "");
      setStorePhone(config.storePhone || "");
      setStoreAddress(config.storeAddress || "");
      setTaxId(config.taxId || "");
      setDefaultPieceSize(config.defaultPieceSize || "1");
      setServiceType(config.serviceType || "Livraison");
    })();
  }, [providerId]);

  const save = async () => {
    if (!providerId) return;
    try {
      setSaving(true);
      const shouldEnable = enabled || hasCoreCredentials;
      await saveDeliveryIntegrationConfig(providerId, {
        enabled: shouldEnable,
        apiCode,
        apiKey,
        username,
        password,
        shippingCost,
        returnCost,
        storeName,
        storePhone,
        storeAddress,
        taxId,
        defaultPieceSize,
        serviceType,
      });
      setEnabled(shouldEnable);
      Alert.alert("Succes", "Integration enregistree.");
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible d enregistrer l integration.");
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!providerId) return;
    try {
      setTesting(true);
      const result = await testDeliveryIntegration(providerId, trackingCodeToTest.trim() || undefined);
      Alert.alert(
        "Test reussi",
        result.result?.message
          ? String(result.result.message)
          : "La configuration livraison est valide."
      );
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Echec du test",
        error?.response?.data?.message || "Impossible de tester l integration."
      );
    } finally {
      setTesting(false);
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
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#0F172A", fontSize: 26, fontWeight: "900" }}>{provider.name}</Text>
            <Text style={{ color: colors.grayText, marginTop: 6 }}>
              {enabled || hasCoreCredentials
                ? "Integration activee pour les commandes NOVIKA."
                : "Remplissez les acces API puis enregistrez pour activer ce transporteur."}
            </Text>
          </View>
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
              <Text style={{ color: "#0F172A", fontWeight: "800" }}>
                {enabled || hasCoreCredentials ? "Active" : "Inactive"}
              </Text>
            </Pressable>
            <Button title={testing ? "Test..." : "Tester"} variant="ghost" onPress={testConnection} disabled={testing || saving} />
            <Button title={saving ? "Enregistrement..." : "Enregistrer"} onPress={save} disabled={saving || testing} />
          </View>
        </View>

        <Card>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A", marginBottom: 14 }}>Acces API</Text>
          <View style={{ gap: 12 }}>
            <View>
              <Text style={{ fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>Code API</Text>
              <Input value={apiCode} onChangeText={setApiCode} placeholder="Code API du fournisseur" />
            </View>
            <View>
              <Text style={{ fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>Cle API</Text>
              <Input value={apiKey} onChangeText={setApiKey} placeholder="Cle API du fournisseur" secureTextEntry />
            </View>
            <View>
              <Text style={{ fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>Login fournisseur</Text>
              <Input value={username} onChangeText={setUsername} placeholder={`Login ${provider.name}`} />
            </View>
            <View>
              <Text style={{ fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>Mot de passe fournisseur</Text>
              <Input value={password} onChangeText={setPassword} placeholder={`Mot de passe ${provider.name}`} secureTextEntry />
            </View>
            <View>
              <Text style={{ fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>Code barre pour test (optionnel)</Text>
              <Input value={trackingCodeToTest} onChangeText={setTrackingCodeToTest} placeholder="Exemple: 185219736" />
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
            <View>
              <Text style={{ fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>Taille de colis par defaut</Text>
              <Input value={defaultPieceSize} onChangeText={setDefaultPieceSize} placeholder="0 petit / 1 moyen / 2 grand" />
            </View>
            <View>
              <Text style={{ fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>Type de service</Text>
              <Input value={serviceType} onChangeText={setServiceType} placeholder="Livraison ou Echange" />
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
