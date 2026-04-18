import api from "./api";
import type {
  DeliveryIntegrationConfig,
  DeliveryIntegrationItem,
  DeliveryShipment,
} from "../types/delivery";
import type { Order } from "../types/order";

export async function getDeliveryIntegrations(): Promise<DeliveryIntegrationItem[]> {
  const { data } = await api.get("/delivery/providers");
  return Array.isArray(data) ? (data as DeliveryIntegrationItem[]) : [];
}

export async function getDeliveryIntegrationConfig(
  providerId: string
): Promise<DeliveryIntegrationItem["config"]> {
  const { data } = await api.get(`/delivery/providers/${providerId}/config`);
  return (data?.config || { enabled: false }) as DeliveryIntegrationConfig;
}

export async function saveDeliveryIntegrationConfig(
  providerId: string,
  config: DeliveryIntegrationConfig
): Promise<DeliveryIntegrationItem> {
  const { data } = await api.patch(`/delivery/providers/${providerId}/config`, config);
  return data as DeliveryIntegrationItem;
}

export async function testDeliveryIntegration(
  providerId: string,
  trackingCode?: string
) {
  const { data } = await api.post(`/delivery/providers/${providerId}/test`, {
    trackingCode: trackingCode || undefined,
  });
  return data as {
    success: boolean;
    providerKey: string;
    testedAt?: string;
    result?: Record<string, unknown>;
  };
}

export async function getEnabledDeliveryProviders(): Promise<DeliveryIntegrationItem[]> {
  const integrations = await getDeliveryIntegrations();
  return integrations.filter((item) => item.config.enabled);
}

export async function shipOrderWithProvider(orderId: string): Promise<Order> {
  const { data } = await api.post(`/delivery/orders/${orderId}/ship`);
  return data as Order;
}

export async function bulkShipOrdersWithProvider(orderIds: string[], providerKey: string) {
  const { data } = await api.post('/delivery/orders/bulk-ship', { orderIds, providerKey });
  return data as {
    providerKey: string;
    providerName: string;
    total: number;
    successCount: number;
    failureCount: number;
    results: Array<{
      orderId: string;
      success: boolean;
      trackingCode?: string;
      message?: string;
    }>;
  };
}

export async function refreshOrderShipment(orderId: string): Promise<Order> {
  const { data } = await api.post(`/delivery/orders/${orderId}/refresh`);
  return data as Order;
}

export async function getDeliveryShipments(providerKey?: string): Promise<DeliveryShipment[]> {
  const { data } = await api.get("/delivery/shipments", {
    params: providerKey ? { providerKey } : undefined,
  });
  return Array.isArray(data) ? (data as DeliveryShipment[]) : [];
}

export async function requestShipmentPickup(orderId: string) {
  const { data } = await api.post(`/delivery/orders/${orderId}/pickup`);
  return data as { success: boolean; orderId: string; trackingCode: string };
}

export async function createShipmentTicket(
  orderId: string,
  payload: { motif: string; title: string; description?: string }
) {
  const { data } = await api.post(`/delivery/orders/${orderId}/ticket`, payload);
  return data as { success: boolean; orderId: string; trackingCode: string };
}
