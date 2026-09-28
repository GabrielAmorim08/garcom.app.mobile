import { create } from 'zustand';

import { queryClient, queryKeys } from '../../shared/api/queryClient';
import { tokenStorage } from '../../shared/api/tokenStorage';
import { userService } from '../user/userService';
import type { User, UserRoleType } from '../user/types';
import { authPreferences } from './authPreferences';
import { authService } from './authService';
import type { SignInRequest, SignUpRequest } from './types';

/** Which side of the product the UI is showing. A user with both roles can switch. */
export type AppMode = 'company' | 'waiter';

interface AuthState {
  user: User | null;
  mode: AppMode;
  /** True until the stored session has been checked, so the splash can wait. */
  isHydrating: boolean;
  isSigningIn: boolean;
  isSigningUp: boolean;
  isVerifyingEmail: boolean;
  pendingVerificationEmail: string | null;
  hasCompletedFirstLogin: boolean;

  hydrate: () => Promise<void>;
  signIn: (payload: SignInRequest) => Promise<void>;
  signUp: (payload: SignUpRequest) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  signOut: () => Promise<void>;
  setMode: (mode: AppMode) => void;
  setUser: (user: User | null) => void;
}

function defaultModeFor(roles: UserRoleType[]): AppMode {
  return roles.includes('CompanyOwner') ? 'company' : 'waiter';
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  mode: 'waiter',
  isHydrating: true,
  isSigningIn: false,
  isSigningUp: false,
  isVerifyingEmail: false,
  pendingVerificationEmail: null,
  hasCompletedFirstLogin: false,

  async hydrate() {
    const hasCompletedFirstLogin = await authPreferences.hasCompletedFirstLogin();
    const tokens = await tokenStorage.read();
    if (!tokens) {
      set({ user: null, hasCompletedFirstLogin, isHydrating: false });
      return;
    }

    try {
      const user = await userService.getCurrent();
      set({
        user,
        mode: defaultModeFor(user.roles),
        hasCompletedFirstLogin: true,
        isHydrating: false,
      });
    } catch {
      await tokenStorage.clear();
      set({ user: null, hasCompletedFirstLogin, isHydrating: false });
    }
  },

  async signIn(payload) {
    set({ isSigningIn: true });
    try {
      const session = await authService.signIn(payload);
      await authPreferences.markFirstLoginCompleted();
      queryClient.setQueryData(queryKeys.currentUser, session.user);
      set({
        user: session.user,
        mode: defaultModeFor(session.user.roles),
        isSigningIn: false,
        pendingVerificationEmail: null,
        hasCompletedFirstLogin: true,
      });
    } catch (error) {
      set({ isSigningIn: false });
      throw error;
    }
  },

  async signUp(payload) {
    set({ isSigningUp: true });
    try {
      const session = await authService.signUp(payload);
      await authPreferences.markFirstLoginCompleted();
      queryClient.setQueryData(queryKeys.currentUser, session.user);
      set({
        user: session.user,
        mode: defaultModeFor(session.user.roles),
        isSigningUp: false,
        pendingVerificationEmail: session.user.email,
        hasCompletedFirstLogin: true,
      });
    } catch (error) {
      set({ isSigningUp: false });
      throw error;
    }
  },

  async verifyEmail(code) {
    const email = get().pendingVerificationEmail;
    if (!email) {
      return;
    }

    set({ isVerifyingEmail: true });
    try {
      await authService.verifyEmail({ email, code });
      const user = await userService.getCurrent();
      queryClient.setQueryData(queryKeys.currentUser, user);
      set({
        user,
        mode: defaultModeFor(user.roles),
        pendingVerificationEmail: null,
        isVerifyingEmail: false,
      });
    } catch (error) {
      set({ isVerifyingEmail: false });
      throw error;
    }
  },

  async resendEmailVerification() {
    const email = get().pendingVerificationEmail;
    if (!email) {
      return;
    }

    await authService.resendEmailVerification(email);
  },

  async signOut() {
    await authService.signOut();
    queryClient.clear();
    set({ user: null, pendingVerificationEmail: null });
  },

  setMode(mode) {
    set({ mode });
  },

  setUser(user) {
    set({ user, mode: user ? defaultModeFor(user.roles) : get().mode });
  },
}));
