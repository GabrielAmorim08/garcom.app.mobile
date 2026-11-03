import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import {
  getNotificationPermission,
  NotificationPermission,
  openNotificationSettings,
  startPushNotifications,
} from './pushNotifications';

/**
 * Whether the system lets the app notify, kept fresh when the user comes back from the
 * settings, and what to do about it: ask the first time, send them to the settings after.
 */
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  const refresh = useCallback(async () => {
    try {
      setPermission(await getNotificationPermission());
    } catch {
      setPermission(null);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        void refresh();
      }
    });

    return () => subscription.remove();
  }, [refresh]);

  const enable = useCallback(async () => {
    if (permission === 'undetermined') {
      await startPushNotifications();
      await refresh();
      return;
    }

    await openNotificationSettings();
  }, [permission, refresh]);

  return { permission, enable };
}
