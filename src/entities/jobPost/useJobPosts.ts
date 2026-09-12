import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { mockApi } from '../../mocks/mockApi';
import { apiConfig } from '../../shared/api/config';
import { queryKeys } from '../../shared/api/queryClient';
import type { PagedResult } from '../../shared/types/common';
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
    queryFn: () =>
      apiConfig.useMocks ? mockApi.getNearbyJobPosts() : jobPostService.getNearby(query),
  });
}

export function useJobPost(id: string) {
  return useQuery<NearbyJobPost | JobPost>({
    queryKey: queryKeys.jobPosts.detail(id),
    queryFn: () => (apiConfig.useMocks ? mockApi.getJobPost(id) : jobPostService.getById(id)),
    enabled: Boolean(id),
  });
}

export function useCreateJobPost() {
  const queryClient = useQueryClient();

  return useMutation<JobPost, Error, CreateJobPostRequest>({
    mutationFn: payload =>
      apiConfig.useMocks ? mockApi.createJobPost() : jobPostService.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobPosts.all });
    },
  });
}

type EstimateInput = Pick<CreateJobPostRequest, 'serviceKind' | 'shiftStart' | 'shiftEnd' | 'slots'>;

/**
 * Runs only once the flow has a start, an end and a quantity, which is why it is
 * a query with `enabled` rather than a mutation fired on every keystroke.
 */
export function useJobPostEstimate(input: EstimateInput | null) {
  return useQuery<JobPostEstimate>({
    queryKey: ['jobPostEstimate', input],
    queryFn: () =>
      apiConfig.useMocks
        ? mockApi.estimateJobPost(input!)
        : jobPostService.estimate(input!),
    enabled: Boolean(input),
    staleTime: 60_000,
  });
}
