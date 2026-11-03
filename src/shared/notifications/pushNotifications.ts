import {
  getInitialNotification,
  getMessaging,
  getToken,
  isDeviceRegisteredForRemoteMessages,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AuthorizationStatus } from '@notifee/react-native';
import { Platform } from 'react-native';

import { authService } from '../../entities/auth/authService';
import { queryClient, queryKeys } from '../api/queryClient';

const ANDROID_CHANNEL_ID = 'taxaup-important-events';

type FirebaseMessaging = ReturnType<typeof getMessaging>;

let stopListening: (() => void) | null = null;

/** Where the device registration stands, so the profile can say why push is not working. */
export type PushRegistration =
  | { state: 'idle' }
  | { state: 'registered' }
  | { state: 'failed'; reason: string };

let registration: PushRegistration = { state: 'idle' };
const registrationListeners = new Set<(value: PushRegistration) => void>();

function setRegistration(value: PushRegistration) {
  registration = value;
  registrationListeners.forEach(listener => listener(value));
}

export function getPushRegistration(): PushRegistration {
  return registration;
}

export function subscribePushRegistration(listener: (value: PushRegistration) => void): () => void {
  registrationListeners.add(listener);
  return () => registrationListeners.delete(listener);
}

function describeFailure(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  return message.replace(/\s+/g, ' ').slice(0, 140);
}

function refreshAfterNotification() {
  void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.jobPosts.all });
  void queryClient.invalidateQueries({ queryKey: ['jobAssignments'] });
  void queryClient.invalidateQueries({ queryKey: ['jobApplications'] });
  void queryClient.invalidateQueries({ queryKey: queryKeys.chat.inbox });
}

function isAllowed(status: AuthorizationStatus): boolean {
  return status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;
}

/**
 * Asks the system for permission. It goes through notifee and not through Firebase on
 * purpose: iOS only lists "Notifications" in the app's settings after the app asked
 * once, so the question has to be asked even when the Firebase configuration is missing.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return isAllowed(settings.authorizationStatus);
}

export type NotificationPermission = 'granted' | 'denied' | 'undetermined';

export async function getNotificationPermission(): Promise<NotificationPermission> {
  const settings = await notifee.getNotificationSettings();

  if (isAllowed(settings.authorizationStatus)) {
    return 'granted';
  }

  return settings.authorizationStatus === AuthorizationStatus.NOT_DETERMINED ? 'undetermined' : 'denied';
}

/** The only way back in once the user said no: the system settings of the app. */
export function openNotificationSettings(): Promise<void> {
  return notifee.openNotificationSettings();
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

async function registerCurrentToken(firebaseMessaging: FirebaseMessaging) {
  const token = await getToken(firebaseMessaging);
  await authService.registerDeviceToken(token, Platform.OS === 'ios' ? 'Ios' : 'Android');
}

function listen(firebaseMessaging: FirebaseMessaging): () => void {
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
}

/**
 * Asks for consent, registers the FCM token with our API and makes foreground events
 * visible. Safe to call again (after the user turns notifications on in the profile):
 * the previous listeners are replaced, never doubled. Background notifications are
 * displayed by Android/iOS directly from the FCM payload.
 */
export async function startPushNotifications(): Promise<void> {
  stopPushNotifications();
  setRegistration({ state: 'idle' });

  try {
    if (!(await requestNotificationPermission())) {
      return;
    }
  } catch (error) {
    console.warn('Notification permission could not be requested.', error);
    return;
  }

  try {
    // Do not access Firebase while the module is being loaded. A distribution build
    // without GoogleService-Info.plist must still show the login screen.
    const firebaseMessaging = getMessaging();
    // On iOS the APNs registration must be complete before FCM can issue a
    // device token. Android handles this registration automatically.
    if (Platform.OS === 'ios' && !isDeviceRegisteredForRemoteMessages(firebaseMessaging)) {
      await registerDeviceForRemoteMessages(firebaseMessaging);
    }
    await registerCurrentToken(firebaseMessaging);
    stopListening = listen(firebaseMessaging);
    setRegistration({ state: 'registered' });
  } catch (error) {
    setRegistration({ state: 'failed', reason: describeFailure(error) });
    // Firebase configuration is absent for contributors who do not have project access.
    // The in-app notification centre keeps working.
    console.warn('Push notifications could not be initialized.', error);
  }
}

export function stopPushNotifications() {
  stopListening?.();
  stopListening = null;
}
