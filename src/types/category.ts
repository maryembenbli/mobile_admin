// src/types/category.ts
export type Category = {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  image?: string;
};