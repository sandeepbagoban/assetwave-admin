import { api } from './client';

export function listCategories() {
  return api.get('/categories');
}

export function createCategory(payload) {
  return api.post('/categories', payload);
}

export function updateCategory(id, payload) {
  return api.patch(`/categories/${id}`, payload);
}

export function deleteCategory(id) {
  return api.del(`/categories/${id}`);
}
