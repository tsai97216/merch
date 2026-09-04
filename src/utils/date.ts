export function parseDate(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string, locale = 'zh-TW'): string {
  const date = parseDate(value);
  if (!date) return value || '未設定';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function formatDateTime(value: string, locale = 'zh-TW'): string {
  const date = parseDate(value);
  if (!date) return value || '未設定';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function toTimestamp(value: string): number {
  return parseDate(value)?.getTime() ?? Number.NEGATIVE_INFINITY;
}
