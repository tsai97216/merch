export function parseDate(value?: string): Date | null {
  if (!value) return null;
  const normalized = value.trim();
  if (!normalized) return null;

  // Date-only values such as 2026-01-01 are calendar dates, not UTC timestamps.
  // Construct them in the browser's local timezone so Taiwan and other UTC+
  // zones do not shift them into the previous month.
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]);
    const day = Number(dateOnly[3]);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    return date;
  }

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function monthKey(value?: string): string {
  const date = parseDate(value);
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(value: string): string {
  const month = Number(value.split('-')[1]);
  return Number.isInteger(month) && month >= 1 && month <= 12 ? `${month}月` : '';
}

export function currentYear(): number {
  return new Date().getFullYear();
}
