import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState } from 'react-native';

import { ApiError } from './apiError';

/** Coming back to the app counts as focus, so stale lists refresh as soon as it is opened. */
focusManager.setEventListener(handleFocus => {
  const subscription = AppState.addEventListener('change', state => handleFocus(state === 'active'));
  return () => subscription.remove();
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // Retrying an auth or validation failure only delays the error the user needs to see.
        if (error instanceof ApiError && error.kind !== 'network' && error.kind !== 'server') {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: { retry: false },
  },
});

/**
 * How often the lists on the home and "my services" screens refresh while open. Short
 * enough that an accept or a check-in shows up on its own, long enough to stay light.
 */
export const LIVE_REFRESH_MS = 20_000;

/** Query keys in one place, so invalidation never guesses a string. */
export const queryKeys = {
  currentUser: ['currentUser'] as const,

  company: {
    mine: ['company', 'mine'] as const,
  },

  jobPosts: {
    all: ['jobPosts'] as const,
    nearby: (lat: number, lng: number, radius: number) =>
      ['jobPosts', 'nearby', lat, lng, radius] as const,
    byCompany: (companyId: string) => ['jobPosts', 'company', companyId] as const,
    detail: (id: string) => ['jobPosts', 'detail', id] as const,
    providers: (id: string) => ['jobPosts', 'providers', id] as const,
  },

  jobApplications: {
    byWaiter: ['jobApplications', 'waiter'] as const,
    historyByWaiter: ['jobApplications', 'waiter', 'history'] as const,
    byJobPost: (jobPostId: string) => ['jobApplications', 'jobPost', jobPostId] as const,
  },

  jobAssignments: {
    upcoming: ['jobAssignments', 'upcoming'] as const,
    history: ['jobAssignments', 'history'] as const,
    earnings: (month: string) => ['jobAssignments', 'earnings', month] as const,
    detail: (id: string) => ['jobAssignments', 'detail', id] as const,
  },

  notifications: {
    all: ['notifications'] as const,
    list: ['notifications', 'list'] as const,
    unreadCount: ['notifications', 'unreadCount'] as const,
  },

  chat: {
    inbox: ['chat', 'inbox'] as const,
    messages: (conversationId: string) => ['chat', 'messages', conversationId] as const,
  },
} as const;
