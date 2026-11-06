import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { LIVE_REFRESH_MS, queryKeys } from '../../shared/api/queryClient';
import type { PagedResult } from '../../shared/types/common';
import { jobApplicationService } from './jobApplicationService';
import type { JobApplicationWithPost } from './types';

export function useMyApplications() {
  return useQuery<PagedResult<JobApplicationWithPost>>({
    queryKey: queryKeys.jobApplications.byWaiter,
    queryFn: () => jobApplicationService.getMine(),
    refetchInterval: LIVE_REFRESH_MS,
  });
}

export function useApplicationHistory() {
  return useQuery<PagedResult<JobApplicationWithPost>>({
    queryKey: queryKeys.jobApplications.historyByWaiter,
    queryFn: () => jobApplicationService.getMine({ history: true }),
  });
}

/** Answering an invitation changes the application, the service, and possibly the schedule. */
function refreshAfterAnswering(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.jobApplications.byWaiter });
  void queryClient.invalidateQueries({ queryKey: queryKeys.jobPosts.all });
  void queryClient.invalidateQueries({ queryKey: ['jobAssignments'] });
  void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
}

export function useAnswerInvitation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { applicationId: string; accept: boolean }>({
    mutationFn: ({ applicationId, accept }) =>
      accept
        ? jobApplicationService.acceptInvitation(applicationId)
        : jobApplicationService.declineInvitation(applicationId),
    onSettled: () => refreshAfterAnswering(queryClient),
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { applicationId: string; jobPostId: string }>({
    mutationFn: ({ applicationId }) => jobApplicationService.withdraw(applicationId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobApplications.byWaiter });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobPosts.detail(variables.jobPostId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobPosts.all });
    },
  });
}
