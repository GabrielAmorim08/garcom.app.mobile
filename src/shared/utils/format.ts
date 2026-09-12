import i18n from '../../i18n';

/** Falls back to the app language when a locale is not passed explicitly. */
function currentLocale(): string {
  return i18n.language || 'pt-BR';
}

export function formatCurrency(amount: number, currency = 'BRL'): string {
  return new Intl.NumberFormat(currentLocale(), {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** "12 Abr" — the compact date used on cards. */
export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat(currentLocale(), { day: '2-digit', month: 'short' })
    .format(new Date(iso))
    .replace('.', '');
}

/** "12 de Abril de 2025" — the long form used on detail screens. */
export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat(currentLocale(), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(currentLocale(), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

/** "19:00 - 23:00" */
export function formatTimeRange(startIso: string, endIso: string): string {
  return `${formatTime(startIso)} - ${formatTime(endIso)}`;
}

/** Whole hours between two instants, rounded to one decimal. */
export function durationInHours(startIso: string, endIso: string): number {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  return Math.round((ms / 3_600_000) * 10) / 10;
}

/** Metres to the "1.2" the cards show next to "km". */
export function formatDistanceKm(meters: number): string {
  const km = meters / 1000;
  return new Intl.NumberFormat(currentLocale(), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(km);
}

export function formatRating(value: number): string {
  return new Intl.NumberFormat(currentLocale(), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

/** First name only, for greetings. */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}
