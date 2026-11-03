import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  requestPermission as requestMessagingPermission,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { PermissionsAndroid, Platform } from 'react-native';

import { authService } from '../../entities/auth/authService';
import { queryClient, queryKeys } from '../api/queryClient';

const ANDROID_CHANNEL_ID = 'taxaup-important-events';

function refreshAfterNotification() {
  void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.jobPosts.all });
  void queryClient.invalidateQueries({ queryKey: ['jobAssignments'] });
  void queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
  void queryClient.invalidateQueries({ queryKey: queryKeys.chat.inbox });
}

async function requestPushPermission(firebaseMessaging: ReturnType<typeof getMessaging>): Promise<boolean> {
  if (Platform.OS === 'android') {
    if (Platform.Version < 33) {
      return true;
    }

    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  const status = await requestMessagingPermission(firebaseMessaging);
  return status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;
}

async function showForegroundNotification(message: RemoteMessage) {
  const title = message.notification?.title ?? 'TaxaUp';
  const body = message.notification?.body ?? 'Você recebeu uma nova atualização.';

  const channelId =
    Platform.OS === 'android'
      ? await notifee.createChannel({
          id: ANDROID_CHANNEL_ID,
          name: 'Atualizações importantes',
          importance: AndroidImportance.HIGH,
        })
      : undefined;

  await notifee.displayNotification({
    title,
    body,
    data: message.data,
    android: channelId
      ? {
          channelId,
          pressAction: { id: 'default' },
        }
      : undefined,
    ios: {
      sound: 'default',
      foregroundPresentationOptions: {
        banner: true,
        badge: true,
        list: true,
        sound: true,
      },
    },
  });
}

async function registerCurrentToken(firebaseMessaging: ReturnType<typeof getMessaging>) {
  const token = await getToken(firebaseMessaging);
  await authService.registerDeviceToken(token, Platform.OS === 'ios' ? 'Ios' : 'Android');
}

/**
 * Requests consent only for an authenticated user, registers the FCM token with our
 * API, and makes foreground events visible immediately. Background notifications are
 * displayed by Android/iOS directly from the FCM notification payload.
 */
export async function startPushNotifications(): Promise<() => void> {
  try {
    // Do not access Firebase while the module is being loaded. A distribution
    // build without the optional GoogleService-Info.plist must still be able to
    // show the login screen instead of remaining on the native splash screen.
    const firebaseMessaging = getMessaging();
    const allowed = await requestPushPermission(firebaseMessaging);
    if (!allowed) {
      return () => undefined;
    }

    await registerCurrentToken(firebaseMessaging);

    const unsubscribeTokenRefresh = onTokenRefresh(firebaseMessaging, token =>
      authService.registerDeviceToken(token, Platform.OS === 'ios' ? 'Ios' : 'Android').catch(() => undefined),
    );
    const unsubscribeForeground = onMessage(firebaseMessaging, async message => {
      refreshAfterNotification();
      await showForegroundNotification(message);
    });
    const unsubscribeOpened = onNotificationOpenedApp(firebaseMessaging, () => refreshAfterNotification());

    // Covers an app started by tapping an OS notification.
    void getInitialNotification(firebaseMessaging).then(message => {
      if (message) {
        refreshAfterNotification();
      }
    });

    return () => {
      unsubscribeTokenRefresh();
      unsubscribeForeground();
      unsubscribeOpened();
    };
  } catch (error) {
    // Firebase configuration is intentionally absent for contributors who do not
    // have project access. The in-app notification centre remains available.
    console.warn('Push notifications could not be initialized.', error);
    return () => undefined;
  }
}
