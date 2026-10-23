import type { Address, GeoPoint } from '../../shared/types/common';

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

export interface WaiterProfile {
  userId: string;
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
}
