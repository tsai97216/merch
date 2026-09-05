import type { Item } from './types';

interface WorkIndex { id: string; name: string; code: string; data: string; }
interface WorkFile { items: Item[]; }

const money = (value: number) => `NT$ ${new Intl.NumberFormat('zh-TW').format(value)}`;
const quantityOf = (item: Item) => Number.isInteger(item.quantity) && (item.quantity || 0) > 0 ? item.quantity as number : 1;
const valueOf = (item: Item) => Number(item.purchase?.price || 0) * quantityOf(item);
const esc = (value: unknown) => String(value ?? '').replace(/[&<>\"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#39;' }[c] as string));

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

function pieChart(entries: Array<[string, number]>, title: string): string {
  if (!entries.length) return `<div class="stat-empty">目前沒有資料</div>`;
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  if (!total) return '<div class="stat-empty">目前沒有資料</div>';
  const cx = 80, cy = 80, r = 62;
  let angle = -Math.PI / 2;
  const palette = ['#356ae6', '#7b61ff', '#13a67b', '#f29d38', '#e45d75', '#6d7888', '#4d9de0', '#9b59b6'];
  const slices = entries.map(([name, value], index) => {
    const next = angle + (value / total) * Math.PI * 2;
    const large = next - angle > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(next), y2 = cy + r * Math.sin(next);
    const path = entries.length === 1
      ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${palette[index % palette.length]}"/>`
      : `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z" fill="${palette[index % palette.length]}"/>`;
    angle = next;
    const percent = Math.round(value / total * 100);
    return { name, value, percent, path, color: palette[index % palette.length] };
  });
  return `<div class="stat-pie-wrap"><div class="stat-pie" aria-label="${esc(title)}"><svg viewBox="0 0 160 160" role="img" aria-label="${esc(title)}">${slices.map((slice) => slice.path).join('')}<circle cx="80" cy="80" r="31" fill="white"/></svg><div class="stat-pie-center"><strong>${total}</strong><span>件</span></div></div><div class="stat-pie-legend">${slices.map(({ name, value, percent, color }) => `<div class="stat-pie-legend-row" data-search-query="${esc(name)}"><i style="background:${color}"></i><span>${esc(name)}</span><b>${value} · ${percent}%</b></div>`).join('')}</div></div>`;
}

function roleRanking(items: Item[]): string {
  const counts = new Map<string, number>();
  items.forEach((item) => (item.characters || []).forEach((character) => counts.set(character, (counts.get(character) || 0) + quantityOf(item))));
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hant')).slice(0, 5);
  return top.length ? `<ol class="ranking statistics-ranking">${top.map(([character, count], index) => `<li><span>${index + 1}</span><strong data-search-query="${esc(character)}">${esc(character)}</strong><b>${count}</b></li>`).join('')}</ol>` : '<div class="stat-empty">目前沒有資料</div>';
}

function monthBars(items: Item[]): string {
  const months = new Map<string, { count: number; spending: number }>();
  items.forEach((item) => {
    const raw = item.purchase?.date || item.createdAt;
    if (!raw) return;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = months.get(key) || { count: 0, spending: 0 };
    current.count += quantityOf(item);
    current.spending += valueOf(item);
    months.set(key, current);
  });
  const entries = [...months.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  if (!entries.length) return '<div class="stat-empty">目前沒有資料</div>';
  const max = Math.max(1, ...entries.map(([, value]) => value.spending));
  return `<div class="month-bars">${entries.map(([month, value]) => `<div class="month-bar-row"><div class="month-bar-meta"><span>${esc(month)}</span><b>${value.count} 件 · ${money(value.spending)}</b></div><div class="month-bar-track"><i style="width:${Math.max(value.spending ? 5 : 0, value.spending / max * 100)}%"></i></div></div>`).join('')}</div>`;
}

async function renderEnhancedStatistics() {
  const page = document.querySelector<HTMLElement>('[data-page="statistics"]');
  if (!page) return;
  try {
    const { works, items } = await loadItems();
    const workNames = new Map(works.map((work) => [work.code, work.name]));
    const workCounts = new Map<string, number>();
    const categoryCounts = new Map<string, number>();
    items.forEach((item) => {
      const code = item.id.match(/^([A-Za-z]+)[A-Za-z]\d+$/)?.[1] || item.workName || '其他';
      workCounts.set(code, (workCounts.get(code) || 0) + quantityOf(item));
      const category = item.category || '其他';
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + quantityOf(item));
    });

    const workHost = document.querySelector<HTMLElement>('#work-statistics');
    if (workHost) {
      const entries: Array<[string, number]> = [...workCounts.entries()]
        .map(([code, count]): [string, number] => [workNames.get(code) || code, count])
        .sort((a, b) => b[1] - a[1]);
      workHost.innerHTML = pieChart(entries, '作品統計');
    }
    const categoryHost = document.querySelector<HTMLElement>('#category-list');
    if (categoryHost) {
      const entries: Array<[string, number]> = [...categoryCounts.entries()]
        .map(([name, count]): [string, number] => [name, count])
        .sort((a, b) => b[1] - a[1]);
      categoryHost.innerHTML = pieChart(entries, '類型分布');
    }

    let breakdown = page.querySelector<HTMLElement>('#statistics-breakdown');
    if (!breakdown) {
      breakdown = document.createElement('div');
      breakdown.id = 'statistics-breakdown';
      breakdown.className = 'statistics-breakdown';
      page.appendChild(breakdown);
    }
    breakdown.innerHTML = `<section class="panel stat-breakdown-panel"><div class="panel-heading"><div><span class="panel-label">CHARACTERS</span><h2>角色排行</h2></div></div>${roleRanking(items)}</section><section class="panel stat-breakdown-panel"><div class="panel-heading"><div><span class="panel-label">MONTHLY</span><h2>各月份統計</h2><p>依購買日期統計數量與消費。</p></div></div>${monthBars(items)}</section>`;
  } catch (error) {
    console.error('[statistics-enhancement]', error);
  }
}

function sync() {
  if (location.hash.replace(/^#\//, '').split('/')[0] === 'statistics') void renderEnhancedStatistics();
}

window.addEventListener('hashchange', sync);
window.addEventListener('load', sync);
sync();
