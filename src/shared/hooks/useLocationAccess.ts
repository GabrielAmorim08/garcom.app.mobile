import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export type LocationBlock = 'permission' | 'services' | null;

const POSITION_UNAVAILABLE = 2;
const PERMISSION_DENIED = 1;
const PROBE_TIMEOUT_MS = 10_000;

async function hasPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const permission = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
  if (await PermissionsAndroid.check(permission)) {
    return true;
  }

  return (await PermissionsAndroid.request(permission)) === PermissionsAndroid.RESULTS.GRANTED;
}

/**
 * Asks the device for a fix only to learn whether location is reachable. A timeout
 * is not a block: indoors there may be no fix yet, and the nearby search still has
 * a fallback position.
 */
function probe(): Promise<LocationBlock> {
  return new Promise(resolve => {
    Geolocation.getCurrentPosition(
      () => resolve(null),
      error => {
        if (error.code === PERMISSION_DENIED) {
          resolve('permission');
        } else if (error.code === POSITION_UNAVAILABLE) {
          resolve('services');
        } else {
          resolve(null);
        }
      },
      { enableHighAccuracy: true, timeout: PROBE_TIMEOUT_MS, maximumAge: 60_000 },
    );
  });
}

/**
 * The app needs the device position to work, so signed-in users are held at a dialog
 * until permission is granted and the location service is on. It re-checks whenever
 * the app comes back to the foreground, which is where the settings screen returns.
 */
export function useLocationAccess() {
  const [block, setBlock] = useState<LocationBlock>(null);
  const checking = useRef(false);

  const check = useCallback(async () => {
    if (checking.current) {
      return;
    }

    checking.current = true;
    try {
      if (!(await hasPermission())) {
        setBlock('permission');
        return;
      }

      setBlock(await probe());
    } finally {
      checking.current = false;
    }
  }, []);

  useEffect(() => {
    void check();

    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        void check();
      }
    });

    return () => subscription.remove();
  }, [check]);

  const openSettings = useCallback(async () => {
    if (block === 'services' && Platform.OS === 'android') {
      try {
        await Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
        return;
      } catch {
        // Some devices do not expose the screen; the app settings are the fallback.
      }
    }

    await Linking.openSettings();
  }, [block]);

  return { block, openSettings };
}
