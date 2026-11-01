import { httpClient } from '../../shared/api/httpClient';
import type { PagedResult, PageRequest } from '../../shared/types/common';
import type { AppNotification } from './types';

export const notificationService = {
  async getAll(params?: PageRequest): Promise<PagedResult<AppNotification>> {
    const { data } = await httpClient.get<PagedResult<AppNotification>>('/notifications', { params });
    return data;
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await httpClient.get<{ count: number }>('/notifications/unread-count');
    return data.count;
  },

  async markAsRead(id: string): Promise<void> {
    await httpClient.post(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await httpClient.post('/notifications/read-all');
  },
};
