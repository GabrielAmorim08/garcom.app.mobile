import { httpClient } from '../../shared/api/httpClient';
import type { GeoPoint, PagedResult, PageRequest } from '../../shared/types/common';
import type { JobPostProvider } from '../jobAssignment/types';
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

  /**
   * With an origin the server also returns the distance and whether the signed-in
   * waiter already applied, and prices the post from the waiter's side.
   */
  async getById(id: string, origin?: GeoPoint): Promise<JobPost | NearbyJobPost> {
    const { data } = await httpClient.get<JobPost | NearbyJobPost>(`/job-posts/${id}`, {
      params: origin,
    });
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

  /** Releases the providers' check-in before the scheduled time. */
  async start(id: string): Promise<void> {
    await httpClient.post(`/job-posts/${id}/start`);
  },

  /** Who is booked on the service and what each one has done so far. */
  async getProviders(id: string): Promise<JobPostProvider[]> {
    const { data } = await httpClient.get<JobPostProvider[]>(`/job-posts/${id}/providers`);
    return data;
  },

  async complete(id: string): Promise<void> {
    await httpClient.post(`/job-posts/${id}/complete`);
  },
};
