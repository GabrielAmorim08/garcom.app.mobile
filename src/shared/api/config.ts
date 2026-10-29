import { Platform } from 'react-native';

import { apiUrlOverride } from './apiUrlOverride';

/**
 * Android emulators reach the host machine through 10.0.2.2, never localhost.
 * Replace these with the deployed URL through an env file before shipping.
 */
const DEV_HOST = Platform.select({ android: '10.0.2.2', default: 'localhost' });

const defaultBaseUrl = __DEV__ ? `http://${DEV_HOST}:5181` : 'https://api.serveup.app';

export const apiConfig = {
  baseUrl: (apiUrlOverride ?? defaultBaseUrl).replace(/\/+$/, ''),
  timeoutMs: 15_000,
  /** Serves screens from in-memory fixtures while the backend is not up yet. */
  useMocks: __DEV__,
} as const;
