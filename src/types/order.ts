export type OrderStatus =
  | "rejetee"
  | "en_attente"
  | "tentative1"
  | "confirmee"
  | "telechargee"
  | "emballee"
  | "livree"
  | "retournee";

export type OrderHistoryEntry = {
  status: OrderStatus;
  changedBy: string;
  note?: string;
  date?: string;
};

export type OrderProduct = {
  _id?: string;
  name?: string;
  title?: string;
  images?: string[];
  image?: string;
};

export type OrderItem = {
  product: string | OrderProduct;
  quantity: number;
  price: number;
  deliveryFee?: number;
  deleveryFree?: number;
};

export type Order = {
  _id: string;
  status: OrderStatus;
  rejectReason?: string;
  deliveryCompany?: string;
  deliveryProvider?: string;
  deliveryTrackingCode?: string;
  deliveryStatus?: string;
  deliveryStatusLabel?: string;
  deliveryPayload?: Record<string, unknown> | null;
  deliverySyncedAt?: string;
  shippedAt?: string;
  privateNote?: string;
  exchange?: boolean;
  customerName: string;
  phone: string;
  city?: string;
  address?: string;
  email?: string;
  customerNote?: string;
  total: number;
  items: OrderItem[];
  history?: OrderHistoryEntry[];
  isAbandoned?: boolean;
  abandonedAt?: string;
  isArchived?: boolean;
  archivedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};



