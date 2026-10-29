import { ApiError } from '../../shared/api/apiError';
import { httpClient } from '../../shared/api/httpClient';

export interface CnpjLookup {
  cnpj: string;
  legalName: string;
  tradeName: string | null;
  email: string | null;
  phone: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  registrationStatus: string | null;
}

/** Null when the CNPJ is unknown to the registry; any other failure is thrown. */
export async function lookupCnpj(cnpj: string): Promise<CnpjLookup | null> {
  try {
    const { data } = await httpClient.get<CnpjLookup>(`/cnpj/${cnpj}`);
    return data;
  } catch (caught) {
    if (caught instanceof ApiError && caught.status === 404) {
      return null;
    }

    throw caught;
  }
}
