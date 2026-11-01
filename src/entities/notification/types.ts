import type { IsoDateTime } from '../../shared/types/common';

export type NotificationKind =
  | 'ApplicationReceived'
  | 'ApplicationAccepted'
  | 'ApplicationRejected'
  | 'ServiceStarted'
  | 'ServiceCancelled'
  | 'ProviderCheckedIn'
  | 'ProviderCheckedOut';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  /** The service the notification is about, so a tap can open it. */
  jobPostId: string | null;
  readAt: IsoDateTime | null;
  createdAt: IsoDateTime;
}
