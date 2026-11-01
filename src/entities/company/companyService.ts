import { httpClient } from '../../shared/api/httpClient';
import type { Company, CreateCompanyRequest } from './types';
import type { ImageFile } from '../user/userService';

export const companyService = {
  /** The company owned by the signed-in user. */
  async getMine(): Promise<Company | null> {
    const { data } = await httpClient.get<Company | null>('/companies/mine');
    return data;
  },

  async create(payload: CreateCompanyRequest): Promise<Company> {
    const { data } = await httpClient.post<Company>('/companies', payload);
    return data;
  },

  async updateMine(payload: Partial<CreateCompanyRequest>): Promise<Company> {
    const { data } = await httpClient.put<Company>('/companies/mine', payload);
    return data;
  },

  async uploadLogo(file: ImageFile): Promise<{ path: string }> {
    const form = new FormData();
    form.append('file', file as never);
    const { data } = await httpClient.post<{ path: string }>('/media/company-logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
