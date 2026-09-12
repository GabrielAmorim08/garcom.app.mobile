import type { EarningsSummary, JobAssignmentWithPost } from '../entities/jobAssignment/types';
import type { JobPost, JobPostEstimate, NearbyJobPost } from '../entities/jobPost/types';
import type { User, WaiterProfile } from '../entities/user/types';
import type { PagedResult } from '../shared/types/common';
import { durationInHours } from '../shared/utils/format';
import {
  mockHistoryAssignments,
  mockMonthEarnings,
  mockNearbyJobPosts,
  mockUpcomingAssignments,
  mockUser,
  mockWaiterProfile,
} from './fixtures';

/** Latency so loading states are exercised instead of flashing past. */
const delay = (ms = 350) => new Promise<void>(resolve => setTimeout(resolve, ms));

function page<T>(items: T[]): PagedResult<T> {
  return {
    items,
    page: 1,
    pageSize: items.length || 1,
    totalItems: items.length,
    totalPages: 1,
    hasNext: false,
  };
}

/** In-memory applications, so applying twice behaves like the real thing. */
const appliedJobPostIds = new Set<string>();

export const mockApi = {
  async getCurrentUser(): Promise<User> {
    await delay(200);
    return mockUser;
  },

  async getWaiterProfile(): Promise<WaiterProfile> {
    await delay(200);
    return mockWaiterProfile;
  },

  async getNearbyJobPosts(): Promise<PagedResult<NearbyJobPost>> {
    await delay();
    return page(
      mockNearbyJobPosts.map(post => ({
        ...post,
        hasApplied: appliedJobPostIds.has(post.id),
      })),
    );
  },

  async getJobPost(id: string): Promise<NearbyJobPost> {
    await delay(250);
    const post = mockNearbyJobPosts.find(item => item.id === id);
    if (!post) {
      throw new Error(`Mock job post not found: ${id}`);
    }
    return { ...post, hasApplied: appliedJobPostIds.has(post.id) };
  },

  async applyToJobPost(jobPostId: string): Promise<void> {
    await delay(500);
    appliedJobPostIds.add(jobPostId);
  },

  async createJobPost(): Promise<JobPost> {
    await delay(600);
    return mockNearbyJobPosts[0];
  },

  /**
   * Mirrors the rule the server will own: hours in the shift times the number of
   * waiters, with a band around it.
   */
  async estimateJobPost(input: {
    shiftStart: string;
    shiftEnd: string;
    slots: number;
  }): Promise<JobPostEstimate> {
    await delay(250);
    const hours = Math.max(durationInHours(input.shiftStart, input.shiftEnd), 1);
    const base = hours * 30 * input.slots;
    return {
      minAmount: Math.round(base),
      maxAmount: Math.round(base * 1.35),
      currency: 'BRL',
    };
  },

  async getUpcomingAssignments(): Promise<PagedResult<JobAssignmentWithPost>> {
    await delay();
    return page(mockUpcomingAssignments);
  },

  async getHistoryAssignments(): Promise<PagedResult<JobAssignmentWithPost>> {
    await delay();
    return page(mockHistoryAssignments);
  },

  async getEarnings(month: string): Promise<EarningsSummary> {
    await delay(200);
    return {
      month,
      totalAmount: mockMonthEarnings,
      assignmentsCount: mockUpcomingAssignments.length,
      currency: 'BRL',
    };
  },
};
