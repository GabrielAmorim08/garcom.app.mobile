import { httpClient } from '../../shared/api/httpClient';
import type { PagedResult, PageRequest } from '../../shared/types/common';
import type {
  CreateJobPostRequest,
  JobPost,
  JobPostEstimate,
  NearbyJobPost,
  NearbyQuery,
} from './types';

export const jobPostService = {
  /** Proximity search. The radius is in metres to match PostGIS ST_DWithin. */
  async getNearby(query: NearbyQuery & PageRequest): Promise<PagedResult<NearbyJobPost>> {
    const { data } = await httpClient.get<PagedResult<NearbyJobPost>>('/job-posts/nearby', {
      params: query,
    });
    return data;
  },

  async getById(id: string): Promise<JobPost> {
    const { data } = await httpClient.get<JobPost>(`/job-posts/${id}`);
    return data;
  },

  async getMine(params?: PageRequest): Promise<PagedResult<JobPost>> {
    const { data } = await httpClient.get<PagedResult<JobPost>>('/job-posts/mine', { params });
    return data;
  },

  async create(payload: CreateJobPostRequest): Promise<JobPost> {
    const { data } = await httpClient.post<JobPost>('/job-posts', payload);
    return data;
  },

  /**
   * Price range for step 3. Estimated on the server so the rule lives in one place
   * and can change without shipping a new app build.
   */
  async estimate(payload: Pick<CreateJobPostRequest,
    'serviceKind' | 'providerKind' | 'shiftStart' | 'shiftEnd' | 'slots'>): Promise<JobPostEstimate> {
    const { data } = await httpClient.post<JobPostEstimate>('/job-posts/estimate', payload);
    return data;
  },

  async cancel(id: string, reason: string): Promise<void> {
    await httpClient.post(`/job-posts/${id}/cancel`, { reason });
  },
};
