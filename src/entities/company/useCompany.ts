import { useMutation, useQuery } from '@tanstack/react-query';

import { queryClient, queryKeys } from '../../shared/api/queryClient';
import { companyService } from './companyService';
import type { Company, CreateCompanyRequest } from './types';

export function useMyCompany() {
  return useQuery<Company | null>({
    queryKey: queryKeys.company.mine,
    queryFn: companyService.getMine,
  });
}

export function useUpdateMyCompany() {
  return useMutation<Company, Error, Partial<CreateCompanyRequest>>({
    mutationFn: payload => companyService.updateMine(payload),
    onSuccess: company => {
      queryClient.setQueryData(queryKeys.company.mine, company);
    },
  });
}
