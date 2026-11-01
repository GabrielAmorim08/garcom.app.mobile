import type { Address, GeoPoint } from '../../shared/types/common';

export type CompanyStatus = 'Pending' | 'Active' | 'Suspended';

export interface Company {
  id: string;
  ownerUserId: string;
  legalName: string;
  tradeName: string | null;
  taxId: string;
  email: string;
  phone: string;
  logoPath: string | null;
  status: CompanyStatus;
  averageRating: number;
  ratingsCount: number;
  address: Address;
}

export interface CreateCompanyRequest {
  legalName: string;
  tradeName?: string | null;
  taxId: string;
  email: string;
  phone: string;
  address: Address;
}

export type EstablishmentStatus = 'Active' | 'Inactive';

export interface Establishment {
  id: string;
  companyId: string;
  name: string;
  phone: string | null;
  address: Address;
  location: GeoPoint | null;
  status: EstablishmentStatus;
}

export interface CreateEstablishmentRequest {
  name: string;
  phone?: string | null;
  address: Address;
  location: GeoPoint;
}
