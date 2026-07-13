import { api } from './client';

export function listNotifications() {
  return api.get('/notifications');
}

export function getUnreadCount() {
  return api.get('/notifications/unread-count').then((r) => r.count);
}

export function markNotificationRead(id) {
  return api.patch(`/notifications/${id}/read`);
}

export function markAllNotificationsRead() {
  return api.patch('/notifications/read-all');
}
