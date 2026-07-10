import { api } from './client';

export function listLogisticsProviders() {
  return api.get('/logistics-providers');
}

export function createLogisticsProvider(payload) {
  return api.post('/logistics-providers', payload);
}

export function updateLogisticsProvider(id, payload) {
  return api.patch(`/logistics-providers/${id}`, payload);
}

export function deleteLogisticsProvider(id) {
  return api.del(`/logistics-providers/${id}`);
}
