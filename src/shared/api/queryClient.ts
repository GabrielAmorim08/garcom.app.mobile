import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './apiError';

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
  },

  jobApplications: {
    byWaiter: ['jobApplications', 'waiter'] as const,
    byJobPost: (jobPostId: string) => ['jobApplications', 'jobPost', jobPostId] as const,
  },

  jobAssignments: {
    upcoming: ['jobAssignments', 'upcoming'] as const,
    history: ['jobAssignments', 'history'] as const,
    earnings: (month: string) => ['jobAssignments', 'earnings', month] as const,
    detail: (id: string) => ['jobAssignments', 'detail', id] as const,
  },
} as const;
