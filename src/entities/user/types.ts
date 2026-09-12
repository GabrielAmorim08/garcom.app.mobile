export type UserStatus = 'Pending' | 'Active' | 'Suspended' | 'Deactivated';

export type UserRoleType = 'Waiter' | 'CompanyOwner' | 'Administrator';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profilePhotoUrl: string | null;
  status: UserStatus;
  roles: UserRoleType[];
}

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
}
