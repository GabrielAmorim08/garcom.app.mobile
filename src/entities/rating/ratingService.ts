import { httpClient } from '../../shared/api/httpClient';
import type { PagedResult, PageRequest } from '../../shared/types/common';
import type { CreateRatingRequest, Rating } from './types';

export const ratingService = {
  async create(payload: CreateRatingRequest): Promise<Rating> {
    const { data } = await httpClient.post<Rating>('/ratings', payload);
    return data;
  },

  async getReceived(userId: string, params?: PageRequest): Promise<PagedResult<Rating>> {
    const { data } = await httpClient.get<PagedResult<Rating>>(`/users/${userId}/ratings`, {
      params,
    });
    return data;
  },

  /** Whether the signed-in user still owes a rating for this assignment. */
  async isPending(jobAssignmentId: string): Promise<boolean> {
    const { data } = await httpClient.get<{ pending: boolean }>(
      `/job-assignments/${jobAssignmentId}/rating-pending`,
    );
    return data.pending;
  },
};
