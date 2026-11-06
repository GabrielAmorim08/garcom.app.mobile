import type { IsoDateTime } from '../../shared/types/common';
import type { JobPost, ProviderKind } from '../jobPost/types';
import type { ProviderKindStats } from '../user/types';

export type JobApplicationStatus =
  | 'Pending'
  | 'Accepted'
  | 'Rejected'
  | 'Withdrawn'
  | 'Cancelled'
  /** The company invited the provider and is waiting for an answer. */
  | 'Invited'
  | 'Declined';

export interface JobApplication {
  id: string;
  jobPostId: string;
  waiterUserId: string;
  message: string | null;
  status: JobApplicationStatus;
  createdAt: IsoDateTime;
  respondedAt: IsoDateTime | null;
}

/** A waiter's application together with the post it points at, for list screens. */
export interface JobApplicationWithPost extends JobApplication {
  jobPost: JobPost;
}

/** An applicant as the company sees them when choosing who to accept. */
export interface JobApplicant {
  applicationId: string;
  waiterUserId: string;
  fullName: string;
  profilePhotoPath: string | null;
  averageRating: number;
  ratingsCount: number;
  completedServices: number;
  distanceMeters: number | null;
  message: string | null;
  status: JobApplicationStatus;
  memberNumber?: number | null;
  providerKinds?: ProviderKind[];
  kindStats?: ProviderKindStats[];
}

export interface ApplyRequest {
  jobPostId: string;
  message?: string | null;
  /** Sent so the server can record how far the waiter was when applying. */
  latitude?: number;
  longitude?: number;
}
