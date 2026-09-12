import { httpClient } from '../../shared/api/httpClient';
import { tokenStorage } from '../../shared/api/tokenStorage';
import type { AuthSession, SignInRequest, SignUpRequest } from './types';

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

  /**
   * Revokes the refresh token server-side before clearing it locally. A failure here
   * must not keep the user signed in on the device.
   */
  async signOut(): Promise<void> {
    try {
      await httpClient.post('/auth/sign-out');
    } finally {
      await tokenStorage.clear();
    }
  },

  async registerDeviceToken(token: string, platform: 'Android' | 'Ios'): Promise<void> {
    await httpClient.post('/device-tokens', { token, platform });
  },
};
