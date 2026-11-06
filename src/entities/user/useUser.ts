import { useMutation, useQuery } from '@tanstack/react-query';

import { mockApi } from '../../mocks/mockApi';
import { apiConfig } from '../../shared/api/config';
import { queryClient, queryKeys } from '../../shared/api/queryClient';
import { shouldUseApi } from '../../shared/api/shouldUseApi';
import { tokenStorage } from '../../shared/api/tokenStorage';
import { type ImageFile, userService } from './userService';
import type { UpdateWaiterProfileRequest, User, WaiterCard, WaiterProfile } from './types';

const waiterProfileKey = ['waiterProfile'] as const;

export function useCurrentUser() {
  return useQuery<User>({
    queryKey: queryKeys.currentUser,
    queryFn: async () => {
      const tokens = await tokenStorage.read();
      return tokens || !apiConfig.useMocks ? userService.getCurrent() : mockApi.getCurrentUser();
    },
  });
}

export function useWaiterProfile() {
  return useQuery<WaiterProfile>({
    queryKey: waiterProfileKey,
    queryFn: async () =>
      (await shouldUseApi()) ? userService.getWaiterProfile() : mockApi.getWaiterProfile(),
  });
}

export function useUpdateWaiterProfile() {
  return useMutation<WaiterProfile, Error, UpdateWaiterProfileRequest>({
    mutationFn: payload => userService.updateWaiterProfile(payload),
    onSuccess: profile => {
      queryClient.setQueryData(waiterProfileKey, profile);
    },
  });
}

export function useFindMember() {
  return useMutation<WaiterCard, Error, number>({
    mutationFn: memberNumber => userService.findMemberByNumber(memberNumber),
  });
}

export function useSetAvailability() {
  return useMutation<WaiterProfile, Error, boolean>({
    mutationFn: isAvailable => userService.setAvailability(isAvailable),
    onSuccess: profile => {
      queryClient.setQueryData(waiterProfileKey, profile);
    },
  });
}

export function useUpdateCurrentUser() {
  return useMutation<User, Error, Pick<User, 'fullName' | 'phone'>>({
    mutationFn: payload => userService.updateCurrent(payload),
    onSuccess: user => {
      queryClient.setQueryData(queryKeys.currentUser, user);
    },
  });
}

export function useUploadProfilePhoto() {
  return useMutation<{ path: string }, Error, ImageFile>({
    mutationFn: file => userService.uploadProfilePhoto(file),
    onSuccess: media => {
      queryClient.setQueryData<User>(queryKeys.currentUser, current =>
        current ? { ...current, profilePhotoPath: media.path } : current,
      );
    },
  });
}
