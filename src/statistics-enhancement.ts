import type { Item } from './types';

interface WorkIndex { id: string; name: string; code: string; data: string; }
interface WorkFile { items: Item[]; }

const money = (value: number) => `NT$ ${new Intl.NumberFormat('zh-TW').format(value)}`;
const quantityOf = (item: Item) => Number.isInteger(item.quantity) && (item.quantity || 0) > 0 ? item.quantity as number : 1;
const valueOf = (item: Item) => Number(item.purchase?.price || 0) * quantityOf(item);
const esc = (value: unknown) => String(value ?? '').replace(/[&<>\"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#39;' }[c] as string));

function ensureHost(): HTMLElement | null {
  const page = document.querySelector<HTMLElement>('[data-page="statistics"]');
  if (!page) return null;
  let host = page.querySelector<HTMLElement>('#statistics-breakdown');
  if (!host) {
    host = document.createElement('div');
    host.id = 'statistics-breakdown';
    host.className = 'statistics-breakdown';
    page.appendChild(host);
  }
  return host;
}

function rows(entries: Array<[string, number, number]>, valueMode: 'count' | 'money' = 'count') {
  if (!entries.length) return '<div class="stat-empty">目前沒有資料</div>';
  return entries.map(([label, count, spending]) => `<div class="stat-summary-row" data-search-query="${esc(label)}"><span>${esc(label)}</span><b>${valueMode === 'money' ? money(spending) : count}</b></div>`).join('');
}

async function loadItems(): Promise<{ works: WorkIndex[]; items: Item[] }> {
  const index = await fetch('/data/works.json', { cache: 'no-store' });
  if (!index.ok) throw new Error(`works.json HTTP ${index.status}`);
  const { works } = await index.json() as { works: WorkIndex[] };
  const files = await Promise.all(works.map(async (work) => {
    const response = await fetch(`/${work.data}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${work.data} HTTP ${response.status}`);
    return await response.json() as WorkFile;
  }));
  return { works, items: files.flatMap((file) => file.items || []) };
}

async function renderEnhancedStatistics() {
  const host = ensureHost();
  if (!host) return;
  try {
    const { works, items } = await loadItems();
    const workNames = new Map(works.map((work) => [work.code, work.name]));
    const aggregate = (getter: (item: Item) => string | undefined) => {
      const map = new Map<string, [number, number]>();
      items.forEach((item) => {
        const key = getter(item) || '其他';
        const current = map.get(key) || [0, 0];
        map.set(key, [current[0] + quantityOf(item), current[1] + valueOf(item)]);
      });
      return [...map.entries()].map(([key, [count, spending]]) => [key, count, spending] as [string, number, number]).sort((a, b) => b[1] - a[1]);
    };

    const workSpending = new Map<string, number>();
    items.forEach((item) => {
      const code = item.id.match(/^([A-Za-z]+)[A-Za-z]\d+$/)?.[1] || item.workName || '其他';
      workSpending.set(code, (workSpending.get(code) || 0) + valueOf(item));
    });
    const workEntries = [...workSpending.entries()].sort((a, b) => b[1] - a[1]).map(([code, amount]) => [workNames.get(code) || code, 0, amount] as [string, number, number]);

    const months = new Map<string, [number, number]>();
    items.forEach((item) => {
      const date = item.purchase?.date || item.createdAt;
      if (!date) return;
      const d = new Date(date);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const current = months.get(key) || [0, 0];
      months.set(key, [current[0] + quantityOf(item), current[1] + valueOf(item)]);
    });
    const monthEntries = [...months.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([key, [count, spending]]) => [key, count, spending] as [string, number, number]);

    host.innerHTML = `<div class="stat-subsection"><div class="stat-subsection-title">各作品消費</div><div class="stat-summary-list">${rows(workEntries, 'money')}</div></div><div class="stat-subsection"><div class="stat-subsection-title">角色統計</div><div class="stat-summary-list">${rows(aggregate((item) => item.characters?.[0]))}</div></div><div class="stat-subsection"><div class="stat-subsection-title">廠商統計</div><div class="stat-summary-list">${rows(aggregate((item) => item.manufacturer))}</div></div><div class="stat-subsection"><div class="stat-subsection-title">狀態統計</div><div class="stat-summary-list">${rows(aggregate((item) => item.status === 'pending' || item.status === 'preorder' ? '待到貨' : item.status === 'received' ? '已收到' : item.status))}</div></div><div class="stat-subsection"><div class="stat-subsection-title">各月份消費／新增</div><div class="stat-summary-list">${monthEntries.length ? monthEntries.map(([month, count, spending]) => `<div class="stat-summary-row"><span>${esc(month)} · ${count} 件</span><b>${money(spending)}</b></div>`).join('') : '<div class="stat-empty">目前沒有資料</div>'}</div></div>`;
  } catch (error) {
    console.error('[statistics-enhancement]', error);
    host.innerHTML = '<div class="stat-empty">統計明細載入失敗</div>';
  }
}

function sync() {
  if (location.hash.replace(/^#\//, '').split('/')[0] === 'statistics') void renderEnhancedStatistics();
}

window.addEventListener('hashchange', sync);
window.addEventListener('load', sync);
sync();
