import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { mockApi } from '../../mocks/mockApi';
import { apiConfig } from '../../shared/api/config';
import { queryKeys } from '../../shared/api/queryClient';
import { tokenStorage } from '../../shared/api/tokenStorage';
import type { GeoPoint, PagedResult } from '../../shared/types/common';
import { jobPostService } from './jobPostService';
import type {
  CreateJobPostRequest,
  JobPost,
  JobPostEstimate,
  NearbyJobPost,
  NearbyQuery,
} from './types';

export function useNearbyJobPosts(query: NearbyQuery) {
  return useQuery<PagedResult<NearbyJobPost>>({
    queryKey: queryKeys.jobPosts.nearby(query.latitude, query.longitude, query.radiusMeters),
    queryFn: async () =>
      (await shouldUseApi()) ? jobPostService.getNearby(query) : mockApi.getNearbyJobPosts(),
  });
}

export function useJobPost(id: string, origin?: GeoPoint) {
  return useQuery<NearbyJobPost | JobPost>({
    queryKey: queryKeys.jobPosts.detail(id),
    queryFn: async () =>
      (await shouldUseApi()) ? jobPostService.getById(id, origin) : mockApi.getJobPost(id),
    enabled: Boolean(id),
  });
}

export function useMyJobPosts() {
  return useQuery<PagedResult<JobPost>>({
    queryKey: queryKeys.jobPosts.byCompany('mine'),
    queryFn: () => jobPostService.getMine(),
  });
}

export function useCreateJobPost() {
  const queryClient = useQueryClient();

  return useMutation<JobPost, Error, CreateJobPostRequest>({
    mutationFn: async payload =>
      (await shouldUseApi()) ? jobPostService.create(payload) : mockApi.createJobPost(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobPosts.all });
    },
  });
}

export function useUpdateJobPostStatus() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; action: 'cancel' | 'complete' }>({
    mutationFn: ({ id, action }) => action === 'cancel' ? jobPostService.cancel(id, '') : jobPostService.complete(id),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobPosts.detail(variables.id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobPosts.all });
    },
  });
}

type EstimateInput = Pick<
  CreateJobPostRequest,
  'serviceKind' | 'providerKind' | 'shiftStart' | 'shiftEnd' | 'slots'
>;

/**
 * Runs only once the flow has a start, an end and a quantity, which is why it is
 * a query with `enabled` rather than a mutation fired on every keystroke.
 */
export function useJobPostEstimate(input: EstimateInput | null) {
  return useQuery<JobPostEstimate>({
    queryKey: ['jobPostEstimate', input],
    queryFn: async () =>
      (await shouldUseApi())
        ? jobPostService.estimate(input!)
        : mockApi.estimateJobPost(input!),
    enabled: Boolean(input),
    staleTime: 60_000,
  });
}

async function shouldUseApi(): Promise<boolean> {
  return !apiConfig.useMocks || Boolean(await tokenStorage.read());
}
