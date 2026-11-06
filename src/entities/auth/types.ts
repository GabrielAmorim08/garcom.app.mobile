import type { ProviderKind } from '../jobPost/types';
import type { User } from '../user/types';
import type { Address } from '../../shared/types/common';

export interface SignInRequest {
  document: string;
  password: string;
  device: DeviceInfoRequest;
}

export interface SignUpRequest {
  fullName: string;
  email: string;
  phone: string;
  /** CPF of the provider. A company owner signs in with the company CNPJ instead. */
  document?: string;
  password: string;
  role: 'Waiter' | 'CompanyOwner';
  device: DeviceInfoRequest;
  company?: CompanySignUpRequest;
  /** Roles a provider works as, picked during sign-up. */
  providerKinds?: ProviderKind[];
}

export interface AuthSession {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  sessionId: string;
  user: User;
}

export interface DeviceInfoRequest {
  deviceId: string;
  platform: 'Android' | 'Ios';
  deviceModel?: string;
  appVersion?: string;
}

export interface CompanySignUpRequest {
  legalName: string;
  tradeName?: string;
  taxId: string;
  companyEmail: string;
  companyPhone: string;
  address: Address;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}
