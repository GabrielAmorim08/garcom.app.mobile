import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { LIVE_REFRESH_MS, queryClient, queryKeys } from '../../shared/api/queryClient';
import type { PagedResult } from '../../shared/types/common';
import { notificationService } from './notificationService';
import type { AppNotification } from './types';

const LIST_SIZE = 50;

/** Last count seen, to tell that something new arrived since the previous poll. */
let lastUnreadCount: number | null = null;

/**
 * The screens that show services (home, my services, company lists) refresh when a
 * new notification arrives, which is what makes an accept or a check-in show up
 * without the user pulling to refresh.
 */
function refreshServiceScreens() {
  void queryClient.invalidateQueries({ queryKey: queryKeys.jobPosts.all });
  void queryClient.invalidateQueries({ queryKey: ['jobAssignments'] });
  void queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
}

export function useUnreadNotificationCount() {
  return useQuery<number>({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: async () => {
      const count = await notificationService.getUnreadCount();
      if (lastUnreadCount !== null && count > lastUnreadCount) {
        refreshServiceScreens();
      }
      lastUnreadCount = count;
      return count;
    },
    refetchInterval: LIVE_REFRESH_MS,
  });
}

export function useNotifications() {
  return useQuery<PagedResult<AppNotification>>({
    queryKey: queryKeys.notifications.list,
    queryFn: () => notificationService.getAll({ page: 1, pageSize: LIST_SIZE }),
    refetchInterval: LIVE_REFRESH_MS,
  });
}

export function useMarkNotificationRead() {
  const client = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: id => notificationService.markAsRead(id),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const client = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      lastUnreadCount = 0;
      void client.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
