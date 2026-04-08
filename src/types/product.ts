// src/types/product.ts
export type ProductStatus = 'affiche' | 'cache' | 'rupture' | 'lien';

export type Product = {
  _id: string;
  name: string;
  slug?: string;
  sku?: string;
  price?: number;
  oldPrice?: number;
  cost?: number;
  deliveryFee?: number;
  images: string[];
  stock?: number;
  status: ProductStatus;
  categories: string[];
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductPayload = {
  name: string;
  slug?: string;
  sku?: string;
  price?: number;
  oldPrice?: number;
  cost?: number;
  deliveryFee?: number;
  stock?: number;
  status?: ProductStatus;
  //  status?: 'affiche' | 'cache' | 'rupture' | 'lien';
  categories?: string[];
  description?: string;
};