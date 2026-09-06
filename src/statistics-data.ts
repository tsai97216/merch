import type { Item } from './types';
import { categoryName } from './category-label';
import { currentYear, monthKey, monthLabel } from './utils/date';
import { formatMoney, formatPercent, formatQuantity } from './utils/format';

export type Row = { label: string; value: number };
export type DetailRow = { label: string; quantity: number; spend: number; share: number; extra?: string };
export type Chart = { id: string; title: string; description: string; largeType: 'bar' | 'donut'; smallType: 'bar' | 'donut'; rows: Row[]; details: DetailRow[]; format: 'money' | 'count'; summary: { label: string; value: string }[] };
type WorkAggregate = { quantity: number; spend: number };

const quantity = (item: Item) => Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1;
const value = (item: Item) => Number(item.purchase?.price || 0) * quantity(item);

export function aggregateStatistics(items: Item[]): Chart[] {
  const workSpend = new Map<string, WorkAggregate>();
  const workCount = new Map<string, WorkAggregate>();
  const categoryCount = new Map<string, WorkAggregate>();
  const monthly = new Map<string, WorkAggregate>();
  const add = (map: Map<string, WorkAggregate>, key: string, row: WorkAggregate) => {
    const old = map.get(key) || { quantity: 0, spend: 0 };
    map.set(key, { quantity: old.quantity + row.quantity, spend: old.spend + row.spend });
  };

  items.forEach((item) => {
    const row = { quantity: quantity(item), spend: value(item) };
    add(workSpend, item.workName || '未分類作品', row);
    add(workCount, item.workName || '未分類作品', row);
    add(categoryCount, categoryName(item.category), row);
    const month = monthKey(item.purchase?.date);
    if (month) add(monthly, month, row);
  });

  const totalSpend = [...workSpend.values()].reduce((sum, row) => sum + row.spend, 0);
  const totalQuantity = items.reduce((sum, item) => sum + quantity(item), 0);
  const sortSpend = (map: Map<string, WorkAggregate>) => [...map.entries()].sort((a,b) => b[1].spend - a[1].spend || b[1].quantity - a[1].quantity || a[0].localeCompare(b[0], 'zh-Hant'));
  const sortQuantity = (map: Map<string, WorkAggregate>) => [...map.entries()].sort((a,b) => b[1].quantity - a[1].quantity || b[1].spend - a[1].spend || a[0].localeCompare(b[0], 'zh-Hant'));
  const details = (entries: [string, WorkAggregate][], denominator: number, extra?: (row: WorkAggregate) => string) => entries.map(([label, row]) => ({ label, quantity: row.quantity, spend: row.spend, share: denominator ? row.spend / denominator * 100 : 0, extra: extra?.(row) }));
  const rows = (entries: [string, WorkAggregate][], field: 'spend' | 'quantity'): Row[] => entries.map(([label, row]) => ({ label, value: field === 'spend' ? row.spend : row.quantity }));

  const workSpendEntries = sortSpend(workSpend);
  const workCountEntries = sortQuantity(workCount);
  const categoryEntries = sortQuantity(categoryCount);
  const year = currentYear();
  const monthlyEntries: [string, WorkAggregate][] = Array.from({ length: 12 }, (_, i) => {
    const key = `${year}-${String(i + 1).padStart(2, '0')}`;
    return [key, monthly.get(key) || { quantity: 0, spend: 0 }];
  });

  let cumulative = 0;
  const monthlyDetails: DetailRow[] = monthlyEntries.map(([key, row], index) => {
    cumulative += row.spend;
    const previous = index ? monthlyEntries[index - 1][1].spend : 0;
    const delta = previous ? `${row.spend >= previous ? '+' : ''}${formatPercent((row.spend - previous) / previous * 100)} vs 上月` : '首筆月份';
    return { label: monthLabel(key), quantity: row.quantity, spend: row.spend, share: totalSpend ? row.spend / totalSpend * 100 : 0, extra: `${formatMoney(cumulative)} 累計 · ${delta}` };
  });

  const topWork = workSpendEntries[0];
  const topMonth = monthlyEntries.reduce<[string, WorkAggregate] | undefined>((best, current) => !best || current[1].spend > best[1].spend ? current : best, undefined);
  const averageMonth = totalSpend / 12;

  return [
    {
      id: 'work-spending', title: '作品消費排行', description: '看每個作品實際投入多少預算，並可進一步查看收藏數與消費占比。', largeType: 'bar', smallType: 'donut',
      rows: rows(workSpendEntries, 'spend'), details: details(workSpendEntries, totalSpend), format: 'money',
      summary: [['總消費', formatMoney(totalSpend)], ['最高作品', topWork?.[0] || '無資料'], ['最高作品消費', topWork ? formatMoney(topWork[1].spend) : 'NT$ 0'], ['作品數', String(workSpendEntries.length)]].map(([label, value]) => ({ label, value }))
    },
    {
      id: 'monthly-spending', title: '每月消費趨勢', description: '以今年 12 個月份完整呈現消費；沒有資料的月份也會明確顯示為 0。', largeType: 'bar', smallType: 'bar',
      rows: monthlyEntries.map(([label, row]) => ({ label: monthLabel(label), value: row.spend })), details: monthlyDetails, format: 'money',
      summary: [['有消費月份', `${monthlyEntries.filter(([,r]) => r.spend > 0).length} 個月`], ['最高月份', topMonth ? monthLabel(topMonth[0]) : '無資料'], ['最高月消費', topMonth ? formatMoney(topMonth[1].spend) : 'NT$ 0'], ['月均消費', formatMoney(averageMonth)]].map(([label, value]) => ({ label, value }))
    },
    {
      id: 'work-count', title: '作品收藏數量', description: '看哪些作品收藏最多，數量依每筆資料的 quantity 加總。', largeType: 'bar', smallType: 'donut',
      rows: rows(workCountEntries, 'quantity'), details: details(workCountEntries, totalQuantity, (row) => `消費 ${formatMoney(row.spend)}`), format: 'count',
      summary: [['總收藏', formatQuantity(totalQuantity)], ['作品種類', `${workCountEntries.length} 個`], ['最多收藏作品', workCountEntries[0]?.[0] || '無資料'], ['最多作品數量', workCountEntries[0] ? formatQuantity(workCountEntries[0][1].quantity) : '0 件']].map(([label, value]) => ({ label, value }))
    },
    {
      id: 'category-count', title: '類別收藏數量', description: '以周邊類型名稱呈現各類別收藏占比，詳細視圖提供完整數量與比例。', largeType: 'donut', smallType: 'donut',
      rows: rows(categoryEntries, 'quantity'), details: details(categoryEntries, totalQuantity, (row) => `消費 ${formatMoney(row.spend)}`), format: 'count',
      summary: [['總收藏', formatQuantity(totalQuantity)], ['類別數', `${categoryEntries.length} 類`], ['主要類別', categoryEntries[0]?.[0] || '無資料'], ['主要類別占比', categoryEntries[0] ? formatPercent(categoryEntries[0][1].quantity / Math.max(totalQuantity, 1) * 100) : '0%']].map(([label, value]) => ({ label, value }))
    },
  ];
}
