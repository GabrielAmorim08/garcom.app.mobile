import { httpClient } from '../../shared/api/httpClient';
import type { User, WaiterProfile } from './types';

/** Everything the app knows how to ask about users and waiter profiles. */
export const userService = {
  async getCurrent(): Promise<User> {
    const { data } = await httpClient.get<User>('/users/me');
    return data;
  },

  async updateCurrent(payload: Pick<User, 'fullName' | 'phone'>): Promise<User> {
    const { data } = await httpClient.put<User>('/users/me', payload);
    return data;
  },

  async getWaiterProfile(): Promise<WaiterProfile> {
    const { data } = await httpClient.get<WaiterProfile>('/waiter-profiles/me');
    return data;
  },

  async updateWaiterProfile(payload: Partial<WaiterProfile>): Promise<WaiterProfile> {
    const { data } = await httpClient.put<WaiterProfile>('/waiter-profiles/me', payload);
    return data;
  },

  async setAvailability(isAvailable: boolean): Promise<void> {
    await httpClient.patch('/waiter-profiles/me/availability', { isAvailable });
  },
};
