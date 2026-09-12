export type ApiErrorKind =
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'validation'
  | 'conflict'
  | 'server'
  | 'unknown';

export interface FieldError {
  field: string;
  message: string;
}

/**
 * Transport failures normalised into one shape, so screens never branch on
 * HTTP status codes.
 */
export class ApiError extends Error {
  constructor(
    public readonly kind: ApiErrorKind,
    message: string,
    public readonly status?: number,
    public readonly fieldErrors: FieldError[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromStatus(status: number, message: string, fieldErrors: FieldError[] = []): ApiError {
    const kind: ApiErrorKind =
      status === 401 ? 'unauthorized'
      : status === 403 ? 'forbidden'
      : status === 404 ? 'notFound'
      : status === 409 ? 'conflict'
      : status === 400 || status === 422 ? 'validation'
      : status >= 500 ? 'server'
      : 'unknown';

    return new ApiError(kind, message, status, fieldErrors);
  }

  /** i18n key for a user-facing message. */
  get translationKey(): string {
    switch (this.kind) {
      case 'network':
        return 'errors.network';
      case 'unauthorized':
        return 'errors.unauthorized';
      case 'notFound':
        return 'errors.notFound';
      default:
        return 'errors.generic';
    }
  }
}
