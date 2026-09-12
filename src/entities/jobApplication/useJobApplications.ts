import { useMutation, useQueryClient } from '@tanstack/react-query';

import { mockApi } from '../../mocks/mockApi';
import { apiConfig } from '../../shared/api/config';
import { queryKeys } from '../../shared/api/queryClient';
import { jobApplicationService } from './jobApplicationService';
import type { ApplyRequest } from './types';

export function useApplyToJobPost() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ApplyRequest>({
    mutationFn: async payload => {
      if (apiConfig.useMocks) {
        await mockApi.applyToJobPost(payload.jobPostId);
        return;
      }
      await jobApplicationService.apply(payload);
    },
    onSuccess: (_data, variables) => {
      // The card's CTA and the nearby list both reflect the new application.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.jobPosts.detail(variables.jobPostId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobPosts.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobApplications.byWaiter });
    },
  });
}
