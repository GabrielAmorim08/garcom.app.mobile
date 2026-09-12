/** Mirrors the API's PagedResult<T>. */
export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
}

export interface PageRequest {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

/** WGS84 coordinate pair, in the order the API expects. */
export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Address {
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  district?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

/** ISO-8601 string as it travels over the wire. Parse at the edge, never store Date in cache. */
export type IsoDateTime = string;
export type IsoDate = string;
