import { api } from './client';

export function listSellers(params) {
  return api.get('/admin/sellers', params);
}

export function getSeller(id) {
  return api.get(`/admin/sellers/${id}`);
}

export function approveSeller(id, notes) {
  return api.patch(`/admin/sellers/${id}/approve`, { notes });
}

export function rejectSeller(id, notes) {
  return api.patch(`/admin/sellers/${id}/reject`, { notes });
}

export function suspendSeller(id, notes) {
  return api.patch(`/admin/sellers/${id}/suspend`, { notes });
}
