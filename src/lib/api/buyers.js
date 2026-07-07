import { api } from './client';

export function listBuyers(params) {
  return api.get('/admin/buyers', params);
}

export function getUser(id) {
  return api.get(`/admin/users/${id}`);
}

export function setUserStatus(id, status) {
  return api.patch(`/admin/users/${id}`, { status });
}
