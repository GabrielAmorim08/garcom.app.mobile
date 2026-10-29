import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

import { ApiError, FieldError } from './apiError';
import { apiConfig } from './config';
import { tokenStorage } from './tokenStorage';

interface ErrorBody {
  message?: string;
  error?: string;
  detail?: string;
  errors?: Array<{ field?: string; message?: string }>;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

/** Called when refreshing fails, so the app can drop the session and show login. */
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

export const httpClient: AxiosInstance = axios.create({
  baseURL: apiConfig.baseUrl,
  timeout: apiConfig.timeoutMs,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use(async config => {
  const tokens = await tokenStorage.read();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

/**
 * Concurrent 401s must trigger a single refresh; everything else waits for it,
 * otherwise the first response to land invalidates the tokens the others are using.
 */
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const tokens = await tokenStorage.read();
  if (!tokens?.refreshToken) {
    return null;
  }

  try {
    // A bare client: the interceptor must not run for the refresh call itself.
    const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
      `${apiConfig.baseUrl}/auth/refresh`,
      { refreshToken: tokens.refreshToken },
      { timeout: apiConfig.timeoutMs },
    );

    await tokenStorage.write({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    return data.accessToken;
  } catch {
    await tokenStorage.clear();
    return null;
  }
}

httpClient.interceptors.response.use(
  response => response,
  async (error: AxiosError<ErrorBody>) => {
    const config = error.config as RetriableConfig | undefined;

    if (!error.response) {
      throw new ApiError('network', error.message || 'Network error');
    }

    const { status, data } = error.response;

    if (status === 401 && config && !config._retried) {
      config._retried = true;

      refreshInFlight ??= refreshAccessToken().finally(() => {
        refreshInFlight = null;
      });

      const newToken = await refreshInFlight;
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`;
        return httpClient.request(config);
      }

      onSessionExpired?.();
    }

    const fieldErrors: FieldError[] = (data?.errors ?? [])
      .filter(e => e.field && e.message)
      .map(e => ({ field: e.field!, message: e.message! }));

    const serverMessage = data?.message ?? data?.error ?? undefined;

    throw ApiError.fromStatus(status, serverMessage ?? error.message, fieldErrors, serverMessage);
  },
);
