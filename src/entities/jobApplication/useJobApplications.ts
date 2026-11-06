import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { mockApi } from '../../mocks/mockApi';
import { apiConfig } from '../../shared/api/config';
import { queryKeys } from '../../shared/api/queryClient';
import { tokenStorage } from '../../shared/api/tokenStorage';
import { jobApplicationService } from './jobApplicationService';
import type { ApplyRequest, JobApplicant, JobApplication } from './types';

export function useApplyToJobPost() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ApplyRequest>({
    mutationFn: async payload => {
      if (!(await shouldUseApi())) {
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

export function useJobApplicants(jobPostId: string) {
  return useQuery<JobApplicant[]>({
    queryKey: queryKeys.jobApplications.byJobPost(jobPostId),
    queryFn: () => jobApplicationService.getApplicants(jobPostId),
    enabled: Boolean(jobPostId),
  });
}

export function useAcceptJobApplication(jobPostId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: applicationId => jobApplicationService.accept(applicationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobApplications.byJobPost(jobPostId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobPosts.detail(jobPostId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobPosts.all });
    },
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation<JobApplication, Error, { jobPostId: string; waiterUserId: string }>({
    mutationFn: ({ jobPostId, waiterUserId }) => jobApplicationService.invite(jobPostId, waiterUserId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobApplications.byJobPost(variables.jobPostId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobPosts.detail(variables.jobPostId) });
    },
  });
}

export function useCancelInvitation(jobPostId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: applicationId => jobApplicationService.cancelInvitation(applicationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobApplications.byJobPost(jobPostId) });
    },
  });
}

export function useRejectJobApplication(jobPostId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: applicationId => jobApplicationService.reject(applicationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobApplications.byJobPost(jobPostId) });
    },
  });
}

async function shouldUseApi(): Promise<boolean> {
  return !apiConfig.useMocks || Boolean(await tokenStorage.read());
}
