import { useMutation, useQuery } from '@tanstack/react-query';

import { queryClient, queryKeys } from '../../shared/api/queryClient';
import { companyService } from './companyService';
import type { ImageFile } from '../user/userService';
import type { Company, CreateCompanyRequest } from './types';

export function useMyCompany(enabled = true) {
  return useQuery<Company | null>({
    queryKey: queryKeys.company.mine,
    queryFn: companyService.getMine,
    enabled,
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

export function useUploadCompanyLogo() {
  return useMutation<{ path: string }, Error, ImageFile>({
    mutationFn: file => companyService.uploadLogo(file),
    onSuccess: media => {
      queryClient.setQueryData<Company | null>(queryKeys.company.mine, current =>
        current ? { ...current, logoPath: media.path } : current,
      );
    },
  });
}
