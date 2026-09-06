export function parseDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
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
