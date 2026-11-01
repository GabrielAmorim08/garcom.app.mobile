import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';

import { mockApi } from '../../mocks/mockApi';
import { LIVE_REFRESH_MS, queryKeys } from '../../shared/api/queryClient';
import { shouldUseApi } from '../../shared/api/shouldUseApi';
import type { GeoPoint, PagedResult } from '../../shared/types/common';
import { toMonthKey } from '../../shared/utils/date';
import { jobAssignmentService } from './jobAssignmentService';
import type { EarningsSummary, JobAssignment, JobAssignmentWithPost } from './types';

export function useUpcomingAssignments() {
  return useQuery<PagedResult<JobAssignmentWithPost>>({
    queryKey: queryKeys.jobAssignments.upcoming,
    queryFn: async () =>
      (await shouldUseApi())
        ? jobAssignmentService.getUpcoming()
        : mockApi.getUpcomingAssignments(),
    refetchInterval: LIVE_REFRESH_MS,
  });
}

export function useAssignmentHistory() {
  return useQuery<PagedResult<JobAssignmentWithPost>>({
    queryKey: queryKeys.jobAssignments.history,
    queryFn: async () =>
      (await shouldUseApi()) ? jobAssignmentService.getHistory() : mockApi.getHistoryAssignments(),
  });
}

export function useJobAssignment(id: string) {
  return useQuery<JobAssignmentWithPost>({
    queryKey: queryKeys.jobAssignments.detail(id),
    queryFn: () => jobAssignmentService.getById(id),
    enabled: Boolean(id),
  });
}

export function useMonthEarnings(month: string = toMonthKey()) {
  return useQuery<EarningsSummary>({
    queryKey: queryKeys.jobAssignments.earnings(month),
    queryFn: async () =>
      (await shouldUseApi()) ? jobAssignmentService.getEarnings(month) : mockApi.getEarnings(month),
  });
}

export function useEarningsTimeline(months: string[]) {
  const queries = useQueries({
    queries: months.map(month => ({
      queryKey: queryKeys.jobAssignments.earnings(month),
      queryFn: async () =>
        (await shouldUseApi()) ? jobAssignmentService.getEarnings(month) : mockApi.getEarnings(month),
    })),
  });

  return months.map((month, index) => ({ month, data: queries[index]?.data }));
}

interface CheckPointInput {
  assignmentId: string;
  location: GeoPoint;
}

function useCheckPoint(action: 'checkIn' | 'checkOut') {
  const queryClient = useQueryClient();

  return useMutation<JobAssignment, Error, CheckPointInput>({
    mutationFn: input =>
      action === 'checkIn' ? jobAssignmentService.checkIn(input) : jobAssignmentService.checkOut(input),
    onSuccess: (_assignment, input) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobAssignments.detail(input.assignmentId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobAssignments.upcoming });
      void queryClient.invalidateQueries({ queryKey: queryKeys.jobAssignments.history });
      void queryClient.invalidateQueries({ queryKey: ['jobAssignments', 'earnings'] });
      void queryClient.invalidateQueries({ queryKey: ['waiterProfile'] });
    },
  });
}

export function useCheckIn() {
  return useCheckPoint('checkIn');
}

export function useCheckOut() {
  return useCheckPoint('checkOut');
}
