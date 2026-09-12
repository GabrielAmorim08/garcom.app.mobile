import type { IsoDateTime } from '../../shared/types/common';

export interface Rating {
  id: string;
  jobAssignmentId: string;
  fromUserId: string;
  toUserId: string;
  score: number;
  comment: string | null;
  createdAt: IsoDateTime;
}

export interface CreateRatingRequest {
  jobAssignmentId: string;
  toUserId: string;
  /** 1 to 5. */
  score: number;
  comment?: string | null;
}
