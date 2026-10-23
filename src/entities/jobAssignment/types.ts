import type { GeoPoint, IsoDateTime } from '../../shared/types/common';
import type { JobPost } from '../jobPost/types';

export type JobAssignmentStatus =
  | 'Confirmed'
  | 'CheckedIn'
  | 'CheckedOut'
  | 'Disputed'
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
  /** How far from the venue the waiter was, measured by the server. */
  checkInDistanceMeters: number | null;
  checkOutDistanceMeters: number | null;
  /** Until when the company may contest the check-out. */
  contestWindowEndsAt: IsoDateTime | null;
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
