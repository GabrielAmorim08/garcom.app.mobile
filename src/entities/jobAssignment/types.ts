import type { GeoPoint, IsoDateTime } from '../../shared/types/common';
import type { JobPost } from '../jobPost/types';

export type JobAssignmentStatus =
  | 'Confirmed'
  | 'CheckedIn'
  | 'CheckedOut'
  | 'NoShow'
  | 'Cancelled'
  | 'Completed';

export interface JobAssignment {
  id: string;
  jobPostId: string;
  jobApplicationId: string | null;
  waiterUserId: string;
  status: JobAssignmentStatus;
  checkInAt: IsoDateTime | null;
  checkOutAt: IsoDateTime | null;
  completedAt: IsoDateTime | null;
  /** Amount the waiter receives for this assignment. */
  payAmount: number;
}

/** Assignment plus its post, which is what every list and detail screen needs. */
export interface JobAssignmentWithPost extends JobAssignment {
  jobPost: JobPost;
}

export interface CheckInRequest {
  assignmentId: string;
  location: GeoPoint;
}

export interface EarningsSummary {
  /** Month as yyyy-MM. */
  month: string;
  totalAmount: number;
  assignmentsCount: number;
  currency: string;
}
