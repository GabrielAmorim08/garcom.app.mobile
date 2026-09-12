import { useQuery } from '@tanstack/react-query';

import { mockApi } from '../../mocks/mockApi';
import { apiConfig } from '../../shared/api/config';
import { queryKeys } from '../../shared/api/queryClient';
import { userService } from './userService';
import type { User, WaiterProfile } from './types';

export function useCurrentUser() {
  return useQuery<User>({
    queryKey: queryKeys.currentUser,
    queryFn: () => (apiConfig.useMocks ? mockApi.getCurrentUser() : userService.getCurrent()),
  });
}

export function useWaiterProfile() {
  return useQuery<WaiterProfile>({
    queryKey: ['waiterProfile'],
    queryFn: () =>
      apiConfig.useMocks ? mockApi.getWaiterProfile() : userService.getWaiterProfile(),
  });
}
