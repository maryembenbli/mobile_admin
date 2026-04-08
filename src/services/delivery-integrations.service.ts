import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DeliveryIntegrationConfig, DeliveryProvider } from "../types/delivery";

const STORAGE_KEY = "delivery_integrations";

export const DELIVERY_PROVIDERS: DeliveryProvider[] = [
  { id: "colis-express", name: "Colis Express", category: "delivery", accent: "#F59E0B", textColor: "#7C2D12", description: "Expedition nationale rapide" },
  { id: "adex", name: "Adex", category: "delivery", accent: "#5B21B6", textColor: "#312E81", description: "Ajout, suivi et bordereaux" },
  { id: "aramex", name: "Aramex", category: "delivery", accent: "#DC2626", textColor: "#7F1D1D", description: "Delivery unlimited" },
  { id: "aurex", name: "Aurex Delivery", category: "delivery", accent: "#111827", textColor: "#111827", description: "Suivi et operations logistiques" },
  { id: "best-delivery", name: "Best Delivery", category: "delivery", accent: "#F97316", textColor: "#9A3412", description: "Livraison express urbaine" },
  { id: "big-boss", name: "Big Boss", category: "delivery", accent: "#FACC15", textColor: "#3F3F46", description: "Distribution colis et retour" },
  { id: "ciblex", name: "Ciblex Express", category: "delivery", accent: "#F8FAFC", textColor: "#1F2937", description: "Reseau de livraison premium" },
  { id: "droppo", name: "DroPo", category: "fulfillment", accent: "#F1F5F9", textColor: "#1F2937", description: "Fulfillment et points relais" },
  { id: "confiva", name: "Confiva Logistics", category: "fulfillment", accent: "#E0F2FE", textColor: "#0F172A", description: "Preparation et stockage" },
  { id: "deliveryx", name: "DeliveryX", category: "delivery", accent: "#111827", textColor: "#FFFFFF", description: "Operations de dernier kilometre" },
  { id: "cosmos", name: "Cosmos Delivery", category: "delivery", accent: "#E0F2FE", textColor: "#1D4ED8", description: "Expedition rapide et traçable" },
  { id: "converty", name: "Converty", category: "fulfillment", accent: "#4C1D95", textColor: "#FFFFFF", description: "Print your own shipping labels" },
];

async function readAllConfigs(): Promise<Record<string, DeliveryIntegrationConfig>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Record<string, DeliveryIntegrationConfig>) : {};
}

export async function getDeliveryIntegrations() {
  const configs = await readAllConfigs();
  return DELIVERY_PROVIDERS.map((provider) => ({
    provider,
    config: configs[provider.id] || { enabled: false },
  }));
}

export async function getDeliveryIntegrationConfig(providerId: string) {
  const configs = await readAllConfigs();
  return configs[providerId] || { enabled: false };
}

export async function saveDeliveryIntegrationConfig(
  providerId: string,
  config: DeliveryIntegrationConfig
) {
  const configs = await readAllConfigs();
  configs[providerId] = config;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  return config;
}

export async function getEnabledDeliveryProviders() {
  const integrations = await getDeliveryIntegrations();
  return integrations.filter((item) => item.config.enabled);
}
