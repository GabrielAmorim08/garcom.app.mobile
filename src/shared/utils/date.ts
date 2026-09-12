import i18n from '../../i18n';

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Whole days between today and the given date, ignoring the time of day. */
export function daysFromToday(iso: string): number {
  const target = startOfDay(new Date(iso)).getTime();
  const today = startOfDay(new Date()).getTime();
  return Math.round((target - today) / 86_400_000);
}

/**
 * "Hoje" / "Amanhã" for the next two days, and the short date after that — the
 * labelling used on the assignment list.
 */
export function relativeDayLabel(iso: string): string {
  const days = daysFromToday(iso);
  if (days === 0) {
    return i18n.t('common.today');
  }
  if (days === 1) {
    return i18n.t('common.tomorrow');
  }
  return new Intl.DateTimeFormat(i18n.language, { day: '2-digit' }).format(new Date(iso));
}

/** yyyy-MM for the earnings endpoint. */
export function toMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function combineDateAndTime(date: Date, time: Date): Date {
  const result = new Date(date);
  result.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return result;
}
