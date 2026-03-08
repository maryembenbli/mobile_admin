import api from './api';
import type { Category } from '../types/category';

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get('/categories');
  return data;
}

export async function createCategory(payload: Partial<Category>) {
  const { data } = await api.post('/categories', payload);
  return data as Category;
}

export async function updateCategory(id: string, payload: Partial<Category>) {
  const { data } = await api.patch(`/categories/${id}`, payload);
  return data as Category;
}

export async function deleteCategory(id: string) {
  const { data } = await api.delete(`/categories/${id}`);
  return data as { message: string };
}