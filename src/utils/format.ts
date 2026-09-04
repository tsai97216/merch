export function formatNumber(value: number, locale = 'zh-TW'): string {
  return new Intl.NumberFormat(locale).format(Number.isFinite(value) ? value : 0);
}

export function formatCurrency(value: number, currency = 'TWD', locale = 'zh-TW'): string {
  if (!Number.isFinite(value)) return '未記錄';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCount(value: number, suffix = '件', locale = 'zh-TW'): string {
  return `${formatNumber(value, locale)} ${suffix}`;
}

export function formatList(values: string[], separator = '、'): string {
  return values.filter(Boolean).join(separator);
}

export function fallback(value: string | null | undefined, label = '未設定'): string {
  const normalized = value?.trim();
  return normalized ? normalized : label;
}
