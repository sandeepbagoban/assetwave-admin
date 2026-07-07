import { api } from './client';

export function getDashboardStats() {
  return api.get('/admin/dashboard/stats');
}
