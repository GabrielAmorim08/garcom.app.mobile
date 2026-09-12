import { httpClient } from '../../shared/api/httpClient';
import type { CreateEstablishmentRequest, Establishment } from '../company/types';

export const establishmentService = {
  async getByCompany(companyId: string): Promise<Establishment[]> {
    const { data } = await httpClient.get<Establishment[]>(
      `/companies/${companyId}/establishments`,
    );
    return data;
  },

  async create(companyId: string, payload: CreateEstablishmentRequest): Promise<Establishment> {
    const { data } = await httpClient.post<Establishment>(
      `/companies/${companyId}/establishments`,
      payload,
    );
    return data;
  },

  async update(id: string, payload: Partial<CreateEstablishmentRequest>): Promise<Establishment> {
    const { data } = await httpClient.put<Establishment>(`/establishments/${id}`, payload);
    return data;
  },
};
