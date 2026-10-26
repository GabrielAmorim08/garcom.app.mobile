import { useCallback, useEffect, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

import type { GeoPoint } from '../types/common';
import { DEFAULT_LOCATION } from '../utils/geo';

/**
 * Shared across screens, so a tab opened later starts from the position that is
 * already known instead of flashing the fallback city.
 */
let lastKnownLocation: GeoPoint | null = null;

interface UseCurrentLocationOptions {
  /** Ask for the device position as soon as the screen mounts. */
  autoRequest?: boolean;
}

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
 * GPS first: it is the most reliable source and the only one an emulator feeds.
 * Network is the fallback for when there is no GPS fix, such as indoors.
 */
function readPosition(highAccuracy: boolean): Promise<GeoPoint | null> {
  return new Promise(resolve => {
    Geolocation.getCurrentPosition(
      position => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: highAccuracy, timeout: highAccuracy ? 15_000 : 8_000, maximumAge: 60_000 },
    );
  });
}

/**
 * Device position for the nearby search and for "usar minha localização".
 * Falls back to the city centre so a denied permission still shows a useful list.
 */
export function useCurrentLocation(options: UseCurrentLocationOptions = {}): UseCurrentLocationResult {
  const { autoRequest = false } = options;

  const [location, setLocation] = useState<GeoPoint>(lastKnownLocation ?? DEFAULT_LOCATION);
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

    const point = (await readPosition(true)) ?? (await readPosition(false));

    if (point) {
      lastKnownLocation = point;
      setLocation(point);
      setIsGranted(true);
    }

    setIsLocating(false);
    return point;
  }, []);

  useEffect(() => {
    if (autoRequest) {
      void request();
    }
  }, [autoRequest, request]);

  return { location, isLocating, isGranted, request };
}
