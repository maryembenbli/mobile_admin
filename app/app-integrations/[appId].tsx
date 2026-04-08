import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Card, Input } from "../../src/ui/atoms";
import { colors } from "../../src/ui/theme";
import {
  APPLICATION_INTEGRATIONS,
  getApplicationConfig,
  saveApplicationConfig,
} from "../../src/services/application-integrations.service";

type Values = Record<string, string | boolean | string[]>;

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <Pressable onPress={() => onChange(!value)}>
      <View
        style={{
          width: 44,
          height: 24,
          borderRadius: 999,
          backgroundColor: value ? colors.orange : "#E2E8F0",
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
            marginLeft: value ? 20 : 0,
          }}
        />
      </View>
    </Pressable>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View>
      <Text style={{ fontWeight: "800", color: "#0F172A", marginBottom: 8 }}>{label}</Text>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        style={multiline ? ({ minHeight: 88, textAlignVertical: "top" } as never) : undefined}
      />
    </View>
  );
}

export default function ApplicationConfigScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ appId?: string | string[] }>();
  const appId = Array.isArray(params.appId) ? params.appId[0] : params.appId;
  const integration = useMemo(
    () => APPLICATION_INTEGRATIONS.find((item) => item.id === appId),
    [appId]
  );
  const [enabled, setEnabled] = useState(false);
  const [values, setValues] = useState<Values>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!appId) return;
    (async () => {
      const config = await getApplicationConfig(appId);
      setEnabled(Boolean(config.enabled));
      setValues(config.values || {});
    })();
  }, [appId]);

  const setValue = (key: string, value: string | boolean | string[]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    if (!appId) return;
    try {
      setSaving(true);
      await saveApplicationConfig(appId, { enabled, values });
      Alert.alert("Succes", "Integration enregistree.");
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible d enregistrer l integration.");
    } finally {
      setSaving(false);
    }
  };

  const renderFacebook = () => (
    <>
      <Card>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A" }}>Configuration Facebook</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Button title="Tester les Pixels/CAPI" variant="ghost" onPress={() => {}} />
            <Button title="Ajouter un Pixel" variant="ghost" onPress={() => setValue("pixelId", "")} />
          </View>
        </View>
        <View style={{ gap: 12 }}>
          <Field label="ID Pixel" value={String(values.pixelId || "")} onChangeText={(v) => setValue("pixelId", v)} placeholder="1062929199123039" />
          <Field label="Cle API de conversion" value={String(values.conversionApiKey || "")} onChangeText={(v) => setValue("conversionApiKey", v)} placeholder="Add your Conversion API" />
          <Field label="Verification de domaine" value={String(values.domainVerification || "")} onChangeText={(v) => setValue("domainVerification", v)} placeholder='<meta name="facebook-domain-verification" ... />' multiline />
        </View>
      </Card>
      <Card>
        <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A", marginBottom: 14 }}>Attribution et evenements</Text>
        <View style={{ gap: 12 }}>
          <Field label="Evenement de commande abandonnee" value={String(values.abandonedEvent || "")} onChangeText={(v) => setValue("abandonedEvent", v)} placeholder="A la confirmation" />
          <Field label="Evenement d'achat de commande" value={String(values.purchaseEvent || "")} onChangeText={(v) => setValue("purchaseEvent", v)} placeholder="A la reception" />
          <Field label="Attribution modifier" value={String(values.attributionPercent || "")} onChangeText={(v) => setValue("attributionPercent", v)} placeholder="% 100" />
        </View>
      </Card>
    </>
  );

  const renderGoogleAnalytics = () => (
    <Card>
      <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A", marginBottom: 14 }}>Tracking</Text>
      <Field label="Google Analytics Code" value={String(values.gaCode || "")} onChangeText={(v) => setValue("gaCode", v)} placeholder="G-XXXXXXXXXX" />
    </Card>
  );

  const renderDomain = () => (
    <>
      <Card>
        <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A", marginBottom: 14 }}>Domaine principal</Text>
        <View style={{ gap: 12 }}>
          <Field label="Nom de domaine" value={String(values.domain || "")} onChangeText={(v) => setValue("domain", v)} placeholder="www.maboutique.com" />
          <Field label="Provider DNS" value={String(values.dnsProvider || "")} onChangeText={(v) => setValue("dnsProvider", v)} placeholder="Cloudflare, OVH..." />
          <Field label="Verification TXT/CNAME" value={String(values.verificationToken || "")} onChangeText={(v) => setValue("verificationToken", v)} placeholder="Token de verification" />
        </View>
      </Card>
      <Card>
        <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A", marginBottom: 14 }}>Autre site web</Text>
        <View style={{ gap: 12 }}>
          <Field label="URL du site" value={String(values.externalStoreUrl || "")} onChangeText={(v) => setValue("externalStoreUrl", v)} placeholder="https://autresite.com" />
          <Field label="Webhook catalogue" value={String(values.catalogWebhook || "")} onChangeText={(v) => setValue("catalogWebhook", v)} placeholder="URL de synchronisation" />
        </View>
      </Card>
    </>
  );

  const renderShopify = () => (
    <>
      <Card>
        <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A", marginBottom: 14 }}>Connexion Shopify</Text>
        <View style={{ gap: 12 }}>
          <Field label="Store URL" value={String(values.storeUrl || "")} onChangeText={(v) => setValue("storeUrl", v)} placeholder="https://store.myshopify.com" />
          <Field label="Admin API Access Token" value={String(values.adminToken || "")} onChangeText={(v) => setValue("adminToken", v)} placeholder="shpat_..." />
          <Field label="Webhook secret" value={String(values.webhookSecret || "")} onChangeText={(v) => setValue("webhookSecret", v)} placeholder="Secret webhook" />
        </View>
      </Card>
      <Card>
        <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A", marginBottom: 14 }}>Synchronisation produits</Text>
        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: "#0F172A", fontWeight: "800" }}>Sync produits</Text>
            <Toggle value={Boolean(values.syncProducts)} onChange={(v) => setValue("syncProducts", v)} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: "#0F172A", fontWeight: "800" }}>Sync commandes</Text>
            <Toggle value={Boolean(values.syncOrders)} onChange={(v) => setValue("syncOrders", v)} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: "#0F172A", fontWeight: "800" }}>Sync stock</Text>
            <Toggle value={Boolean(values.syncInventory)} onChange={(v) => setValue("syncInventory", v)} />
          </View>
        </View>
      </Card>
    </>
  );

  const renderClarity = () => (
    <Card>
      <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A", marginBottom: 14 }}>Configuration Clarity</Text>
      <View style={{ gap: 12 }}>
        <Field label="Project ID" value={String(values.projectId || "")} onChangeText={(v) => setValue("projectId", v)} placeholder="Clarity Project ID" />
        <Field label="Domaine associe" value={String(values.domain || "")} onChangeText={(v) => setValue("domain", v)} placeholder="www.maboutique.com" />
      </View>
    </Card>
  );

  const renderSecurity = (name: string) => (
    <Card>
      <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A", marginBottom: 14 }}>{name}</Text>
      <View style={{ gap: 12 }}>
        <Field label="Valeurs bloquees" value={String(values.blockedValues || "")} onChangeText={(v) => setValue("blockedValues", v)} placeholder="Liste separee par virgules" multiline />
        <Field label="Message de blocage" value={String(values.blockMessage || "")} onChangeText={(v) => setValue("blockMessage", v)} placeholder="Acces refuse" />
      </View>
    </Card>
  );

  const renderLivraisonSms = () => (
    <>
      <Card>
        <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A", marginBottom: 14 }}>API SMS</Text>
        <View style={{ gap: 12 }}>
          <Field label="API key" value={String(values.apiKey || "")} onChangeText={(v) => setValue("apiKey", v)} placeholder="Cle API SMS" />
          <Field label="Sender name" value={String(values.senderName || "")} onChangeText={(v) => setValue("senderName", v)} placeholder="Nom expediteur" />
        </View>
      </Card>
      <Card>
        <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A", marginBottom: 14 }}>Statuts a notifier</Text>
        <View style={{ gap: 14 }}>
          {["tentative1", "confirmee", "retournee", "livree"].map((status) => (
            <View key={status} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: "#0F172A", fontWeight: "800" }}>{status}</Text>
              <Toggle value={Boolean(values[`status_${status}`])} onChange={(v) => setValue(`status_${status}`, v)} />
            </View>
          ))}
        </View>
      </Card>
    </>
  );

  const renderFinco = () => (
    <Card>
      <Text style={{ fontSize: 18, fontWeight: "900", color: "#0F172A", marginBottom: 14 }}>Connexion Finco</Text>
      <View style={{ gap: 12 }}>
        <Field label="Merchant code" value={String(values.merchantCode || "")} onChangeText={(v) => setValue("merchantCode", v)} placeholder="Merchant code" />
        <Field label="API secret" value={String(values.apiSecret || "")} onChangeText={(v) => setValue("apiSecret", v)} placeholder="API secret" />
        <Field label="Journal de ventes" value={String(values.salesJournal || "")} onChangeText={(v) => setValue("salesJournal", v)} placeholder="Journal de ventes" />
      </View>
    </Card>
  );

  const renderContent = () => {
    switch (integration?.id) {
      case "facebook":
        return renderFacebook();
      case "google-analytics":
        return renderGoogleAnalytics();
      case "domain":
        return renderDomain();
      case "shopify":
        return renderShopify();
      case "clarity":
        return renderClarity();
      case "ip-blocker":
        return renderSecurity("IP Blocker");
      case "country-blocker":
        return renderSecurity("Country Blocker");
      case "livraison-sms":
        return renderLivraisonSms();
      case "finco":
        return renderFinco();
      default:
        return (
          <Card>
            <Text style={{ color: colors.grayText }}>Formulaire indisponible pour cette integration.</Text>
          </Card>
        );
    }
  };

  if (!integration) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg }}>
        <Text style={{ color: colors.grayText }}>Application introuvable.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <Text style={{ color: "#0F172A", fontSize: 26, fontWeight: "900" }}>{integration.name}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Toggle value={enabled} onChange={setEnabled} />
            <Button title={saving ? "Enregistrement..." : "Enregistrer"} onPress={save} disabled={saving} />
          </View>
        </View>

        {renderContent()}
      </ScrollView>
    </View>
  );
}
