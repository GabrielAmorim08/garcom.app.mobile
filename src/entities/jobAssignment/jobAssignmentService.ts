import { httpClient } from '../../shared/api/httpClient';
import type { PagedResult, PageRequest } from '../../shared/types/common';
import type {
  CheckInRequest,
  EarningsSummary,
  JobAssignment,
  JobAssignmentWithPost,
} from './types';

export const jobAssignmentService = {
  /** Shifts that have not happened yet, soonest first. */
  async getUpcoming(params?: PageRequest): Promise<PagedResult<JobAssignmentWithPost>> {
    const { data } = await httpClient.get<PagedResult<JobAssignmentWithPost>>(
      '/job-assignments/upcoming',
      { params },
    );
    return data;
  },

  async getHistory(params?: PageRequest): Promise<PagedResult<JobAssignmentWithPost>> {
    const { data } = await httpClient.get<PagedResult<JobAssignmentWithPost>>(
      '/job-assignments/history',
      { params },
    );
    return data;
  },

  async getById(id: string): Promise<JobAssignmentWithPost> {
    const { data } = await httpClient.get<JobAssignmentWithPost>(`/job-assignments/${id}`);
    return data;
  },

  /** Location travels with the check-in so the server can flag a check-in far from the venue. */
  async checkIn({ assignmentId, location }: CheckInRequest): Promise<JobAssignment> {
    const { data } = await httpClient.post<JobAssignment>(
      `/job-assignments/${assignmentId}/check-in`,
      location,
    );
    return data;
  },

  async checkOut({ assignmentId, location }: CheckInRequest): Promise<JobAssignment> {
    const { data } = await httpClient.post<JobAssignment>(
      `/job-assignments/${assignmentId}/check-out`,
      location,
    );
    return data;
  },

  async cancel(assignmentId: string, reason: string): Promise<void> {
    await httpClient.post(`/job-assignments/${assignmentId}/cancel`, { reason });
  },

  /** Month in yyyy-MM. Drives the earnings card on "Meus serviços". */
  async getEarnings(month: string): Promise<EarningsSummary> {
    const { data } = await httpClient.get<EarningsSummary>('/job-assignments/earnings', {
      params: { month },
    });
    return data;
  },
};
