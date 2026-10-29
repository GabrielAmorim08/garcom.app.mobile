import type { TFunction } from 'i18next';

import { ApiError } from './apiError';

/**
 * The text a screen shows for a failed request. A message written by the API wins,
 * because it is already meant for the user; otherwise the error kind picks a
 * translated message. The transport's own text ("Request failed with status code
 * 401") never reaches the screen.
 */
export function getErrorMessage(error: unknown, t: TFunction): string {
  if (error instanceof ApiError) {
    return error.serverMessage ?? t(error.translationKey as never);
  }

  return t('errors.generic');
}
