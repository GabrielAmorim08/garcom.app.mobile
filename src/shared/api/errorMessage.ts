import type { TFunction } from 'i18next';

import { ApiError } from './apiError';

/**
 * The server answers business-rule refusals (409, 400, 404) with a sentence already
 * written for the user, so it is shown as is. Anything else falls back to a generic,
 * translated message instead of leaking a stack trace or a status code to the screen.
 */
export function getErrorMessage(error: unknown, t: TFunction): string {
  if (error instanceof ApiError) {
    const speaksToUser =
      error.kind === 'conflict' || error.kind === 'validation' || error.kind === 'notFound';

    if (speaksToUser && error.message) {
      return error.message;
    }

    return t(error.translationKey as never);
  }

  return t('errors.generic');
}
