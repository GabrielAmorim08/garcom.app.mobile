import { httpClient } from '../../shared/api/httpClient';
import type { Company, CreateCompanyRequest } from './types';

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

  async update(id: string, payload: Partial<CreateCompanyRequest>): Promise<Company> {
    const { data } = await httpClient.put<Company>(`/companies/${id}`, payload);
    return data;
  },
};
