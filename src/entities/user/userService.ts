import { httpClient } from '../../shared/api/httpClient';
import type { UpdateWaiterProfileRequest, User, WaiterCard, WaiterProfile } from './types';

export interface ImageFile {
  uri: string;
  type: string;
  name: string;
}

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

  async uploadProfilePhoto(file: ImageFile): Promise<{ path: string }> {
    const form = new FormData();
    form.append('file', file as never);
    const { data } = await httpClient.post<{ path: string }>('/media/profile-photo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async getWaiterProfile(): Promise<WaiterProfile> {
    const { data } = await httpClient.get<WaiterProfile>('/waiter-profiles/me');
    return data;
  },

  async updateWaiterProfile(payload: UpdateWaiterProfileRequest): Promise<WaiterProfile> {
    const { data } = await httpClient.put<WaiterProfile>('/waiter-profiles/me', payload);
    return data;
  },

  async findMemberByNumber(memberNumber: number): Promise<WaiterCard> {
    const { data } = await httpClient.get<WaiterCard>(`/waiter-profiles/by-number/${memberNumber}`);
    return data;
  },

  async setAvailability(isAvailable: boolean): Promise<WaiterProfile> {
    const { data } = await httpClient.patch<WaiterProfile>('/waiter-profiles/me/availability', {
      isAvailable,
    });
    return data;
  },
};
