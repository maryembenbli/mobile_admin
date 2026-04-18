export type DeliveryProviderCategory = "delivery" | "fulfillment";

export type DeliveryProvider = {
  id: string;
  name: string;
  category: DeliveryProviderCategory;
  accent: string;
  textColor: string;
  description: string;
};

export type DeliveryIntegrationConfig = {
  enabled: boolean;
  apiCode?: string;
  apiKey?: string;
  username?: string;
  password?: string;
  shippingCost?: string;
  returnCost?: string;
  storeName?: string;
  storePhone?: string;
  storeAddress?: string;
  taxId?: string;
  defaultPieceSize?: string;
  serviceType?: string;
  testedAt?: string | null;
  lastTestResult?: Record<string, unknown> | null;
};

export type DeliveryIntegrationItem = {
  provider: DeliveryProvider;
  config: DeliveryIntegrationConfig;
};

export type DeliveryShipment = {
  orderId: string;
  customerName: string;
  phone: string;
  city?: string;
  total: number;
  orderStatus: string;
  providerKey: string;
  providerName: string;
  trackingCode: string;
  shippingStatus: string;
  shippingStatusLabel: string;
  syncedAt?: string | null;
  createdAt?: string | null;
};
