import { api } from './client';

export function listOrders(params) {
  return api.get('/admin/orders', params);
}

export function getOrder(id) {
  return api.get(`/admin/orders/${id}`);
}

export function setOrderStatus(id, toStatus, note) {
  return api.patch(`/admin/orders/${id}/status`, { to_status: toStatus, note });
}

export function releaseEscrow(id) {
  return api.patch(`/admin/orders/${id}/escrow/release`, {});
}

export function refundEscrow(id, reason) {
  return api.patch(`/admin/orders/${id}/escrow/refund`, { reason });
}

export function resolveDispute(id, resolution, note) {
  return api.patch(`/admin/orders/${id}/dispute/resolve`, { resolution, note });
}
