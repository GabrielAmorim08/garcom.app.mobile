import { useCallback, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

import type { GeoPoint } from '../types/common';
import { DEFAULT_LOCATION } from '../utils/geo';

interface UseCurrentLocationResult {
  location: GeoPoint;
  /** True while the device is being asked, so the button can show a spinner. */
  isLocating: boolean;
  /** False once the user denies permission: the UI falls back to a typed address. */
  isGranted: boolean;
  request: () => Promise<GeoPoint | null>;
}

async function ensurePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    // iOS prompts on first use through the Info.plist usage description.
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

/**
 * Device position for the nearby search and for "usar minha localização".
 * Falls back to the city centre so a denied permission still shows a useful list.
 */
export function useCurrentLocation(): UseCurrentLocationResult {
  const [location, setLocation] = useState<GeoPoint>(DEFAULT_LOCATION);
  const [isLocating, setIsLocating] = useState(false);
  const [isGranted, setIsGranted] = useState(true);

  const request = useCallback(async () => {
    setIsLocating(true);

    const allowed = await ensurePermission();
    if (!allowed) {
      setIsGranted(false);
      setIsLocating(false);
      return null;
    }

    return new Promise<GeoPoint | null>(resolve => {
      Geolocation.getCurrentPosition(
        position => {
          const point: GeoPoint = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(point);
          setIsGranted(true);
          setIsLocating(false);
          resolve(point);
        },
        () => {
          setIsLocating(false);
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
      );
    });
  }, []);

  return { location, isLocating, isGranted, request };
}
