import { useQuery } from '@tanstack/react-query';

import { mockApi } from '../../mocks/mockApi';
import { apiConfig } from '../../shared/api/config';
import { queryKeys } from '../../shared/api/queryClient';
import type { PagedResult } from '../../shared/types/common';
import { toMonthKey } from '../../shared/utils/date';
import { jobAssignmentService } from './jobAssignmentService';
import type { EarningsSummary, JobAssignmentWithPost } from './types';

export function useUpcomingAssignments() {
  return useQuery<PagedResult<JobAssignmentWithPost>>({
    queryKey: queryKeys.jobAssignments.upcoming,
    queryFn: () =>
      apiConfig.useMocks
        ? mockApi.getUpcomingAssignments()
        : jobAssignmentService.getUpcoming(),
  });
}

export function useAssignmentHistory() {
  return useQuery<PagedResult<JobAssignmentWithPost>>({
    queryKey: queryKeys.jobAssignments.history,
    queryFn: () =>
      apiConfig.useMocks ? mockApi.getHistoryAssignments() : jobAssignmentService.getHistory(),
  });
}

export function useMonthEarnings(month: string = toMonthKey()) {
  return useQuery<EarningsSummary>({
    queryKey: queryKeys.jobAssignments.earnings(month),
    queryFn: () =>
      apiConfig.useMocks ? mockApi.getEarnings(month) : jobAssignmentService.getEarnings(month),
  });
}
