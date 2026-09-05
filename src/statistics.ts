import './statistics.css';
import { loadStore } from './store';
import type { Item } from './types';

const money = (n: number) => `NT$ ${new Intl.NumberFormat('zh-TW').format(Math.round(n))}`;
const quantity = (item: Item) => Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1;
const value = (item: Item) => Number(item.purchase?.price || 0) * quantity(item);
const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>\"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#39;' }[c] as string));
const monthKey = (date?: string) => { if (!date) return ''; const d = new Date(date); if (Number.isNaN(d.getTime())) return ''; return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };
const monthLabel = (key: string) => { const [year, month] = key.split('-'); return `${year}/${Number(month)}月`; };

type Row = { label: string; value: number };
type Chart = { id: string; title: string; description: string; type: 'bar' | 'line'; rows: Row[]; format: 'money' | 'count' };

function aggregate(items: Item[]): Chart[] {
  const workSpend = new Map<string, number>(), workCount = new Map<string, number>(), categoryCount = new Map<string, number>(), monthlySpend = new Map<string, number>();
  items.forEach((item) => {
    const work = item.workName || '未分類作品', category = item.category || '未分類';
    workSpend.set(work, (workSpend.get(work) || 0) + value(item));
    workCount.set(work, (workCount.get(work) || 0) + quantity(item));
    categoryCount.set(category, (categoryCount.get(category) || 0) + quantity(item));
    const month = monthKey(item.purchase?.date); if (month) monthlySpend.set(month, (monthlySpend.get(month) || 0) + value(item));
  });
  const sortRows = (map: Map<string, number>, chronological = false) => [...map.entries()].sort((a,b) => chronological ? a[0].localeCompare(b[0]) : b[1]-a[1] || a[0].localeCompare(b[0], 'zh-Hant')).map(([label, value]) => ({ label, value }));
  return [
    { id:'work-spending', title:'作品消費排行', description:'依作品統計實際購買金額，單價依數量加權。', type:'bar', rows:sortRows(workSpend), format:'money' },
    { id:'monthly-spending', title:'每月消費趨勢', description:'依購買日期整理每月實際消費。', type:'line', rows:sortRows(monthlySpend, true).map((r) => ({ ...r, label:monthLabel(r.label) })), format:'money' },
    { id:'work-count', title:'作品收藏數量', description:'依作品統計收藏數量，包含 quantity。', type:'bar', rows:sortRows(workCount), format:'count' },
    { id:'category-count', title:'類別收藏數量', description:'依類別統計收藏數量，包含 quantity。', type:'bar', rows:sortRows(categoryCount), format:'count' },
  ];
}

function chartSvg(chart: Chart, large = false): string {
  const width = large ? 900 : 640, height = large ? 390 : 245, left = chart.type === 'bar' ? (large ? 190 : 150) : (large ? 65 : 48), right = 30, top = 25, bottom = chart.type === 'line' ? 55 : 24, plotW = width-left-right, plotH = height-top-bottom, max = Math.max(...chart.rows.map((r) => r.value), 0);
  if (!chart.rows.length) return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(chart.title)}"><text x="${width/2}" y="${height/2}" text-anchor="middle" class="chart-empty">目前沒有足夠資料</text></svg>`;
  if (chart.type === 'bar') {
    const gap = large ? 13 : 9, rowH = Math.max(24, (plotH-gap*Math.max(0,chart.rows.length-1))/chart.rows.length), barH = Math.min(rowH-4,18);
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(chart.title)}">${chart.rows.map((r,i) => { const y=top+i*(rowH+gap), barW=max?Math.max(2,r.value/max*(plotW-12)):0, text=chart.format==='money'?money(r.value):`${r.value} 件`; return `<g class="chart-bar" tabindex="0"><text x="${left-12}" y="${y+barH/2+4}" text-anchor="end">${escapeHtml(r.label)}</text><rect x="${left}" y="${y}" width="${plotW}" height="${barH}" rx="8" class="chart-track"/><rect x="${left}" y="${y}" width="${barW}" height="${barH}" rx="8" class="chart-fill"/><text x="${Math.min(width-right,left+barW+8)}" y="${y+barH/2+4}" class="chart-value">${escapeHtml(text)}</text><title>${escapeHtml(r.label)}：${escapeHtml(text)}</title></g>`; }).join('')}</svg>`;
  }
  const points=chart.rows.map((r,i)=>({ ...r,x:chart.rows.length===1?left+plotW/2:left+i*plotW/(chart.rows.length-1),y:top+plotH-(max?r.value/max*plotH:0) })), path=points.map((p,i)=>`${i?'L':'M'} ${p.x} ${p.y}`).join(' ');
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(chart.title)}"><line x1="${left}" y1="${top+plotH}" x2="${left+plotW}" y2="${top+plotH}" class="chart-axis"/><path d="${path}" class="chart-line"/>${points.map((p)=>`<g class="chart-point" tabindex="0"><circle cx="${p.x}" cy="${p.y}" r="${large?7:5}"/><text x="${p.x}" y="${height-19}" text-anchor="middle">${escapeHtml(p.label)}</text><title>${escapeHtml(p.label)}：${escapeHtml(money(p.value))}</title></g>`).join('')}</svg>`;
}

function table(chart: Chart): string { return `<div class="statistics-data"><div class="statistics-data-head"><span>詳細數據</span><span>${chart.rows.length} 筆</span></div><div class="statistics-data-list">${chart.rows.map((r)=>`<div class="statistics-data-row"><strong>${escapeHtml(r.label)}</strong><span>${chart.format==='money'?escapeHtml(money(r.value)):`${r.value} 件`}</span></div>`).join('')||'<div class="empty-state">目前沒有資料</div>'}</div></div>`; }

function openDetail(chart: Chart): void {
  const modal=document.createElement('div'); modal.className='statistics-detail'; modal.innerHTML=`<div class="statistics-detail-backdrop" data-stat-close></div><section class="statistics-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="statistics-detail-title"><header class="statistics-detail-header"><div><span class="eyebrow">STATISTICS DETAIL</span><h2 id="statistics-detail-title">${escapeHtml(chart.title)}</h2><p>${escapeHtml(chart.description)}</p></div><button type="button" class="statistics-detail-close" data-stat-close aria-label="關閉詳細統計"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></header><div class="statistics-large-chart">${chartSvg(chart,true)}</div>${table(chart)}</section>`;
  document.body.appendChild(modal); document.body.classList.add('statistics-detail-open');
  const close=()=>{modal.remove();document.body.classList.remove('statistics-detail-open');document.removeEventListener('keydown',keydown);};
  const keydown=(event: KeyboardEvent)=>{if(event.key==='Escape')close();};
  modal.querySelectorAll('[data-stat-close]').forEach((node)=>node.addEventListener('click',close)); document.addEventListener('keydown',keydown); modal.tabIndex=-1; modal.focus();
}

function render(charts: Chart[]): void {
  const host=document.querySelector<HTMLElement>('#statistics-charts'); if(!host)return;
  host.innerHTML=charts.map((chart)=>`<button type="button" class="statistics-chart-card" data-chart-id="${chart.id}"><span class="statistics-chart-heading"><span><b>${escapeHtml(chart.title)}</b><small>${escapeHtml(chart.description)}</small></span><i class="fa-solid fa-up-right-and-down-left-from-center" aria-hidden="true"></i></span><span class="statistics-chart-preview">${chartSvg(chart)}</span><span class="statistics-chart-hint">點擊查看互動詳細圖表</span></button>`).join('');
  host.querySelectorAll<HTMLElement>('[data-chart-id]').forEach((button)=>button.addEventListener('click',()=>{const chart=charts.find((item)=>item.id===button.dataset.chartId);if(chart)openDetail(chart);}));
}

async function boot(): Promise<void> { const host=document.querySelector<HTMLElement>('#statistics-charts'); if(!host)return; try { const store=await loadStore(); render(aggregate(store.snapshot.items)); } catch { host.innerHTML='<div class="empty-state wide">統計資料載入失敗</div>'; } }
void boot();
