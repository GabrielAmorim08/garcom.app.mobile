import type { Address, GeoPoint } from '../../shared/types/common';
import type { ProviderKind } from '../jobPost/types';

export type UserStatus = 'Pending' | 'Active' | 'Suspended' | 'Deactivated';

export type UserRoleType = 'Waiter' | 'CompanyOwner' | 'Administrator';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profilePhotoPath: string | null;
  status: UserStatus;
  roles: UserRoleType[];
}

export type PixKeyType = 'Cpf' | 'Email' | 'Phone' | 'Random';

/** What a provider has done and how they were rated, for one role. */
export interface ProviderKindStats {
  kind: ProviderKind;
  completedServices: number;
  averageRating: number;
  ratingsCount: number;
}

/** A provider as a company sees them when looking them up by member number. */
export interface WaiterCard {
  userId: string;
  fullName: string;
  profilePhotoPath: string | null;
  memberNumber: number;
  providerKinds: ProviderKind[];
  averageRating: number;
  ratingsCount: number;
  completedServices: number;
  kindStats: ProviderKindStats[];
}

export interface WaiterProfile {
  userId: string;
  /** Cooperative member number, shown with seven digits. */
  memberNumber: number;
  kindStats: ProviderKindStats[];
  bio: string | null;
  experienceYears: number;
  hourlyRate: number | null;
  averageRating: number;
  ratingsCount: number;
  isAvailable: boolean;
  searchRadiusMeters: number;
  /** Shifts already completed. Drives the counter on the waiter home screen. */
  completedServices: number;
  homeAddress: Address;
  homeLocation: GeoPoint | null;
  pixKey: string | null;
  pixKeyType: PixKeyType | null;
  /** False until a PIX key is saved: without one the waiter cannot be paid. */
  canReceivePayouts: boolean;
  /** Roles the provider says they work as. Only orders and filters shifts, never restricts them. */
  providerKinds: ProviderKind[];
}

export interface UpdateWaiterProfileRequest {
  bio: string | null;
  experienceYears: number;
  hourlyRate: number | null;
  searchRadiusMeters: number;
  homeAddress: Address | null;
  homeLocation: GeoPoint | null;
  pixKey: string | null;
  pixKeyType: PixKeyType | null;
  providerKinds?: ProviderKind[];
}
