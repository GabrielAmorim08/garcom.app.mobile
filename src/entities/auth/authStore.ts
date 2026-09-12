import { create } from 'zustand';

import { tokenStorage } from '../../shared/api/tokenStorage';
import type { User, UserRoleType } from '../user/types';
import { authService } from './authService';
import type { SignInRequest } from './types';

/** Which side of the product the UI is showing. A user with both roles can switch. */
export type AppMode = 'company' | 'waiter';

interface AuthState {
  user: User | null;
  mode: AppMode;
  /** True until the stored session has been checked, so the splash can wait. */
  isHydrating: boolean;
  isSigningIn: boolean;

  hydrate: () => Promise<void>;
  signIn: (payload: SignInRequest) => Promise<void>;
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

  async hydrate() {
    const tokens = await tokenStorage.read();
    if (!tokens) {
      set({ user: null, isHydrating: false });
      return;
    }
    // The stored user is loaded by the app shell through useCurrentUser; here we
    // only record that a session exists.
    set({ isHydrating: false });
  },

  async signIn(payload) {
    set({ isSigningIn: true });
    try {
      const session = await authService.signIn(payload);
      set({
        user: session.user,
        mode: defaultModeFor(session.user.roles),
        isSigningIn: false,
      });
    } catch (error) {
      set({ isSigningIn: false });
      throw error;
    }
  },

  async signOut() {
    await authService.signOut();
    set({ user: null });
  },

  setMode(mode) {
    set({ mode });
  },

  setUser(user) {
    set({ user, mode: user ? defaultModeFor(user.roles) : get().mode });
  },
}));
