import api from "./api";
import type { Order, OrderStatus } from "../types/order";

export type CreateOrderPayload = {
  customerName: string;
  phone: string;
  city?: string;
  address?: string;
  email?: string;
  customerNote?: string;
  deliveryCompany?: string;
  exchange?: boolean;
  items: {
    product: string;
    quantity: number;
    price: number;
    deliveryFee?: number;
  }[];
};

export async function getOrders(): Promise<Order[]> {
  const { data } = await api.get("/orders");
  return Array.isArray(data) ? (data as Order[]) : [];
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await api.get(`/orders/${id}`);
  return data as Order;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await api.post(`/orders`, payload);
  return data as Order;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const { data } = await api.patch(`/orders/${id}`, { status });
  return data as Order;
}

export async function updateOrder(
  id: string,
  payload: Partial<Order> & { status?: OrderStatus }
): Promise<Order> {
  const { data } = await api.patch(`/orders/${id}`, payload);
  return data as Order;
}

export async function archiveOrder(id: string): Promise<Order> {
  const { data } = await api.patch(`/orders/${id}/archive`);
  return data as Order;
}

export async function restoreOrder(id: string): Promise<Order> {
  const { data } = await api.patch(`/orders/${id}/restore`);
  return data as Order;
}

export async function deleteOrder(id: string): Promise<{ message: string }> {
  const { data } = await api.delete(`/orders/${id}`);
  return data as { message: string };
}
