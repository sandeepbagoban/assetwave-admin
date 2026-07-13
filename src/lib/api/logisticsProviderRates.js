import { api } from './client';

export function createLogisticsProviderRate(providerId, payload) {
  return api.post(`/logistics-providers/${providerId}/rates`, payload);
}

export function updateLogisticsProviderRate(providerId, rateId, payload) {
  return api.patch(`/logistics-providers/${providerId}/rates/${rateId}`, payload);
}

export function deleteLogisticsProviderRate(providerId, rateId) {
  return api.del(`/logistics-providers/${providerId}/rates/${rateId}`);
}
