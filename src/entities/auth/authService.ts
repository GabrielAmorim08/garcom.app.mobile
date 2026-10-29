import { httpClient } from '../../shared/api/httpClient';
import { tokenStorage } from '../../shared/api/tokenStorage';
import type {
  AuthSession,
  SendPhoneCodeResponse,
  SignInRequest,
  SignUpRequest,
  VerifyEmailRequest,
  VerifyPhoneCodeResponse,
} from './types';

export const authService = {
  async signIn(payload: SignInRequest): Promise<AuthSession> {
    const { data } = await httpClient.post<AuthSession>('/auth/sign-in', payload);
    await tokenStorage.write({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data;
  },

  async signUp(payload: SignUpRequest): Promise<AuthSession> {
    const { data } = await httpClient.post<AuthSession>('/auth/sign-up', payload);
    await tokenStorage.write({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data;
  },

  async sendPhoneCode(phone: string): Promise<SendPhoneCodeResponse> {
    const { data } = await httpClient.post<SendPhoneCodeResponse>(
      '/auth/phone-verification/send',
      { phone },
    );
    return data;
  },

  async verifyPhoneCode(phone: string, code: string): Promise<VerifyPhoneCodeResponse> {
    const { data } = await httpClient.post<VerifyPhoneCodeResponse>(
      '/auth/phone-verification/verify',
      { phone, code },
    );
    return data;
  },

  async resendEmailVerification(email: string): Promise<void> {
    await httpClient.post('/auth/email-verification/resend', { email });
  },

  async verifyEmail(payload: VerifyEmailRequest): Promise<void> {
    await httpClient.post('/auth/email-verification/verify', payload);
  },

  /**
   * Revokes the refresh token server-side before clearing it locally. A failure here
   * must not keep the user signed in on the device.
   */
  async signOut(): Promise<void> {
    try {
      await httpClient.post('/auth/sign-out');
    } catch {
      // Backend logout is optional for now; local session cleanup must always win.
    } finally {
      await tokenStorage.clear();
    }
  },

  async registerDeviceToken(token: string, platform: 'Android' | 'Ios'): Promise<void> {
    await httpClient.post('/device-tokens', { token, platform });
  },
};
