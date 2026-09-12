import type { GeoPoint } from '../types/common';

const EARTH_RADIUS_M = 6_371_000;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * Great-circle distance, used only for local sorting and labels. Anything the
 * server persists is measured by PostGIS, not here.
 */
export function distanceInMeters(from: GeoPoint, to: GeoPoint): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLng / 2) ** 2;

  return Math.round(EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/** São Paulo city centre: the fallback when location permission is denied. */
export const DEFAULT_LOCATION: GeoPoint = { latitude: -23.5505, longitude: -46.6333 };
