import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../../shared/api/queryClient';
import type { PagedResult } from '../../shared/types/common';
import { jobApplicationService } from './jobApplicationService';
import type { JobApplicationWithPost } from './types';

export function useMyApplications() {
  return useQuery<PagedResult<JobApplicationWithPost>>({
    queryKey: queryKeys.jobApplications.byWaiter,
    queryFn: () => jobApplicationService.getMine(),
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
