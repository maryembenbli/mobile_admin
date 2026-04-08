import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ApplicationConfig, ApplicationIntegration } from "../types/application";

const STORAGE_KEY = "application_integrations";

export const APPLICATION_INTEGRATIONS: ApplicationIntegration[] = [
  {
    id: "facebook",
    name: "Facebook",
    category: "marketing",
    accent: "#E9D5FF",
    textColor: "#1D4ED8",
    description: "Facebook Conversion API et Pixel pour le sponsoring et les achats.",
  },
  {
    id: "domain",
    name: "Domain",
    category: "commerce",
    accent: "#F3F4F6",
    textColor: "#334155",
    description: "Verifier et connecter votre domaine principal ou un autre site web.",
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    category: "analytics",
    accent: "#F3E8FF",
    textColor: "#D97706",
    description: "Analyse trafic, commandes et conversion du catalogue.",
  },
  {
    id: "clarity",
    name: "Clarity",
    category: "analytics",
    accent: "#E0F2FE",
    textColor: "#2563EB",
    description: "Heatmaps et enregistrements de session Microsoft Clarity.",
  },
  {
    id: "ip-blocker",
    name: "IP Blocker",
    category: "security",
    accent: "#FEE2E2",
    textColor: "#B91C1C",
    description: "Bloquer IP et visiteurs indesirables de passer des commandes.",
  },
  {
    id: "country-blocker",
    name: "Country Blocker",
    category: "security",
    accent: "#FCE7F3",
    textColor: "#BE123C",
    description: "Controler quels pays peuvent acceder a la boutique.",
  },
  {
    id: "finco",
    name: "Finco",
    category: "commerce",
    accent: "#EEF2FF",
    textColor: "#312E81",
    description: "Facturation, export des ventes et transformation en e-commerce.",
  },
  {
    id: "livraison-sms",
    name: "Livraison SMS",
    category: "messaging",
    accent: "#FEF3C7",
    textColor: "#92400E",
    description: "Envoyer des SMS automatiques selon le statut de commande.",
  },
  {
    id: "shopify",
    name: "Shopify",
    category: "commerce",
    accent: "#ECFCCB",
    textColor: "#166534",
    description: "Synchroniser les produits, commandes et stock avec Shopify.",
  },
];

async function readAllConfigs(): Promise<Record<string, ApplicationConfig>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Record<string, ApplicationConfig>) : {};
}

export async function getApplicationIntegrations() {
  const configs = await readAllConfigs();
  return APPLICATION_INTEGRATIONS.map((integration) => ({
    integration,
    config: configs[integration.id] || { enabled: false, values: {} },
  }));
}

export async function getApplicationConfig(integrationId: string) {
  const configs = await readAllConfigs();
  return configs[integrationId] || { enabled: false, values: {} };
}

export async function saveApplicationConfig(
  integrationId: string,
  config: ApplicationConfig
) {
  const configs = await readAllConfigs();
  configs[integrationId] = config;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  return config;
}
