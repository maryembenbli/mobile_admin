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
  username?: string;
  password?: string;
  shippingCost?: string;
  returnCost?: string;
  storeName?: string;
  storePhone?: string;
  storeAddress?: string;
  taxId?: string;
};
