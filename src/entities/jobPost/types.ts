import type { Address, GeoPoint, IsoDateTime } from '../../shared/types/common';

export type JobPostStatus = 'Draft' | 'Published' | 'Filled' | 'Cancelled' | 'Completed';

export type PayType = 'PerShift' | 'PerHour';

/** The four cards on step 1 of the request flow. */
export type ServiceKind = 'PrivateEvent' | 'Restaurant' | 'Corporate' | 'Other';

export type ProviderKind =
  | 'Waiter'
  | 'KitchenAssistant'
  | 'PantryAttendant'
  | 'Bartender'
  | 'Receptionist'
  | 'Cleaner'
  | 'Other';

export interface JobPost {
  id: string;
  companyId: string;
  companyName: string;
  establishmentId: string | null;
  establishmentName: string | null;

  serviceKind: ServiceKind;
  providerKind: ProviderKind;
  title: string;
  description: string | null;

  shiftStart: IsoDateTime;
  shiftEnd: IsoDateTime;

  slots: number;
  slotsFilled: number;

  payAmount: number;
  payType: PayType;

  dressCode: string | null;
  requirements: string | null;

  address: Address;
  location: GeoPoint | null;

  status: JobPostStatus;
}

/** A job post as it appears in the waiter's nearby list, with the computed distance. */
export interface NearbyJobPost extends JobPost {
  distanceMeters: number;
  /** True when the signed-in waiter already applied, so the CTA can change. */
  hasApplied: boolean;
}

export interface CreateJobPostRequest {
  serviceKind: ServiceKind;
  providerKind: ProviderKind;
  establishmentId?: string | null;
  title: string;
  description?: string | null;
  shiftStart: IsoDateTime;
  shiftEnd: IsoDateTime;
  slots: number;
  payAmount: number;
  payType: PayType;
  dressCode?: string | null;
  requirements?: string | null;
  address: Address;
  location: GeoPoint | null;
}

export interface NearbyQuery {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  serviceKind?: ServiceKind;
  minPay?: number;
  fromDate?: IsoDateTime;
}

/** Server-side estimate shown on step 3 before the request is created. */
export interface JobPostEstimate {
  minAmount: number;
  maxAmount: number;
  currency: string;
}
