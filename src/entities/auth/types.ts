import type { User } from '../user/types';

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: 'Waiter' | 'CompanyOwner';
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}
