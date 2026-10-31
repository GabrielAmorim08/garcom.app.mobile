import { httpClient } from '../../shared/api/httpClient';
import type { PagedResult, PageRequest } from '../../shared/types/common';
import type {
  ApplyRequest,
  JobApplicant,
  JobApplication,
  JobApplicationWithPost,
} from './types';

type MyApplicationsQuery = PageRequest & { history?: boolean };

export const jobApplicationService = {
  async apply(payload: ApplyRequest): Promise<JobApplication> {
    const { data } = await httpClient.post<JobApplication>('/job-applications', payload);
    return data;
  },

  async withdraw(applicationId: string): Promise<void> {
    await httpClient.post(`/job-applications/${applicationId}/withdraw`);
  },

  async getMine(params?: MyApplicationsQuery): Promise<PagedResult<JobApplicationWithPost>> {
    const { data } = await httpClient.get<PagedResult<JobApplicationWithPost>>(
      '/job-applications/mine',
      { params },
    );
    return data;
  },

  /** Company side: who applied for one of my posts. */
  async getApplicants(jobPostId: string): Promise<JobApplicant[]> {
    const { data } = await httpClient.get<JobApplicant[]>(
      `/job-posts/${jobPostId}/applicants`,
    );
    return data;
  },

  /**
   * Accepting creates the assignment and takes a slot. The server does it in one
   * transaction, so two companies accepting at once cannot oversell the post.
   */
  async accept(applicationId: string): Promise<void> {
    await httpClient.post(`/job-applications/${applicationId}/accept`);
  },

  async reject(applicationId: string, reason?: string): Promise<void> {
    await httpClient.post(`/job-applications/${applicationId}/reject`, { reason });
  },
};
