export function formatMoney(value: number): string {
  return `NT$ ${new Intl.NumberFormat('zh-TW').format(Math.round(Number.isFinite(value) ? value : 0))}`;
}

export function formatPercent(value: number): string {
  return `${(Number.isFinite(value) ? value : 0).toFixed(1)}%`;
}

export function formatQuantity(value: number): string {
  return `${Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0} 件`;
}
