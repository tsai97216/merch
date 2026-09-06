import './statistics.css';
import { getStore, type MerchStore } from './store';
import { aggregateStatistics, type Chart } from './statistics-data';
import { currentYear } from './utils/date';
import { escapeHtml, qs, qsa } from './utils/dom';
import { formatMoney, formatPercent, formatQuantity } from './utils/format';

const chartColors = ['#2563eb','#60a5fa','#93c5fd','#1d4ed8','#3b82f6','#bfdbfe'];

function chartSvg(chart: Chart, large = false): string {
  const type = large ? chart.largeType : chart.smallType;
  const width = large ? 1100 : 920, height = large ? 520 : 430;
  if (!chart.rows.length) return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(chart.title)}"><text x="${width/2}" y="${height/2}" text-anchor="middle" class="chart-empty">目前沒有足夠資料</text></svg>`;
  if (type === 'donut') return donutSvg(chart, width, height, large);
  return barSvg(chart, width, height, large);
}

function verticalMonthlySvg(chart: Chart, width: number, height: number, large: boolean): string {
  const left=large?65:48,right=large?28:18,top=28,bottom=large?58:52;
  const plotW=width-left-right, plotH=height-top-bottom;
  const max=Math.max(...chart.rows.map(r=>r.value),1);
  const gap=large?12:8, slot=plotW/chart.rows.length, barW=Math.max(8,slot-gap);
  const labels=chart.rows.map((r,i)=>{const x=left+i*slot+(slot-barW)/2; const h=r.value/max*plotH; const y=top+plotH-h; const value=chart.format==='money'?formatMoney(r.value):formatQuantity(r.value); return '<g class="chart-bar-item"><title>'+escapeHtml(r.label)+'：'+escapeHtml(value)+'</title><rect x="'+x+'" y="'+y+'" width="'+barW+'" height="'+h+'" rx="5" class="bar-fill"></rect><text x="'+(x+barW/2)+'" y="'+(height-bottom+20)+'" text-anchor="middle">'+escapeHtml(r.label)+'</text>'+ (large?'<text x="'+(x+barW/2)+'" y="'+Math.max(18,y-7)+'" text-anchor="middle" class="bar-value">'+escapeHtml(value)+'</text>':'')+'</g>';}).join('');
  return '<svg viewBox="0 0 '+width+' '+height+'" role="img" aria-label="'+escapeHtml(chart.title)+'"><text x="'+left+'" y="16" class="chart-year">'+currentYear()+' 年</text><line x1="'+left+'" y1="'+(top+plotH)+'" x2="'+(width-right)+'" y2="'+(top+plotH)+'" class="chart-axis"></line>'+labels+'</svg>';
}

function barSvg(chart: Chart, width: number, height: number, large: boolean): string {
  if (chart.id === 'monthly-spending') return verticalMonthlySvg(chart,width,height,large);
  const left = large ? 230 : 175, right = 95, top = 30, bottom = 42, plotW = width-left-right, plotH = height-top-bottom, max = Math.max(...chart.rows.map((r) => r.value), 0);
  const gap = large ? 12 : 10, rowH = Math.max(25, (plotH-gap*Math.max(0,chart.rows.length-1))/chart.rows.length), barH = Math.min(rowH-5, large ? 30 : 24);
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(chart.title)}">${chart.rows.map((r,i) => { const y=top+i*(rowH+gap), barW=max?Math.max(r.value === 0 ? 0 : 2,r.value/max*(plotW-15)):0, text=chart.format==='money'?formatMoney(r.value):formatQuantity(r.value); return `<g class="chart-bar" tabindex="0"><text x="${left-12}" y="${y+barH/2+4}" text-anchor="end">${escapeHtml(r.label)}</text><rect x="${left}" y="${y}" width="${plotW}" height="${barH}" rx="9" class="chart-track"/><rect x="${left}" y="${y}" width="${barW}" height="${barH}" rx="9" class="chart-fill"/><text x="${Math.min(width-right,left+barW+8)}" y="${y+barH/2+4}" class="chart-value">${escapeHtml(text)}</text><title>${escapeHtml(r.label)}：${escapeHtml(text)}</title></g>`; }).join('')}</svg>`;
}

function donutSvg(chart: Chart, width: number, height: number, large: boolean): string {
  const cx=300, cy=height/2, radius=large?175:190, inner=large?105:112, total=chart.rows.reduce((s,r)=>s+r.value,0)||1;
  let angle=-Math.PI/2;
  const arcs=chart.rows.map((r,i)=>{const start=angle, end=angle+r.value/total*Math.PI*2; angle=end; const largeArc=end-start>Math.PI?1:0; const p1=[cx+radius*Math.cos(start),cy+radius*Math.sin(start)],p2=[cx+radius*Math.cos(end),cy+radius*Math.sin(end)],q1=[cx+inner*Math.cos(end),cy+inner*Math.sin(end)],q2=[cx+inner*Math.cos(start),cy+inner*Math.sin(start)]; const d=`M ${p1[0]} ${p1[1]} A ${radius} ${radius} 0 ${largeArc} 1 ${p2[0]} ${p2[1]} L ${q1[0]} ${q1[1]} A ${inner} ${inner} 0 ${largeArc} 0 ${q2[0]} ${q2[1]} Z`; const color=chartColors[i%chartColors.length]; return `<path d="${d}" class="donut-segment" fill="${color}" tabindex="0"><title>${escapeHtml(r.label)}：${chart.format==='money'?formatMoney(r.value):formatQuantity(r.value)}（${formatPercent(r.value/total*100)}）</title></path>`; }).join('');
  const legend=chart.rows.map((r,i)=>{const color=chartColors[i%chartColors.length]; return `<g class="donut-legend"><circle cx="${large?600:610}" cy="${35+i*30}" r="8" fill="${color}" class="donut-dot"/><text x="${large?615:625}" y="${39+i*30}">${escapeHtml(r.label)} · ${chart.format==='money'?formatMoney(r.value):formatQuantity(r.value)} · ${formatPercent(r.value/total*100)}</text></g>`;}).join('');
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(chart.title)}">${arcs}<text x="${cx}" y="${cy-5}" text-anchor="middle" class="donut-total">${total}</text><text x="${cx}" y="${cy+18}" text-anchor="middle" class="donut-caption">收藏</text>${legend}</svg>`;
}

function detailTable(chart: Chart): string {
  return `<div class="statistics-data"><div class="statistics-data-head"><span>完整資料</span><span>${chart.details.length} 筆</span></div><div class="statistics-data-table"><div class="statistics-data-table-row statistics-data-table-header"><span>項目</span><span>數量</span><span>消費</span><span>占比</span><span>補充</span></div>${chart.details.map((row)=>`<div class="statistics-data-table-row"><strong>${escapeHtml(row.label)}</strong><span>${escapeHtml(formatQuantity(row.quantity))}</span><span>${escapeHtml(formatMoney(row.spend))}</span><span>${formatPercent(row.share)}</span><span>${escapeHtml(row.extra || '')}</span></div>`).join('') || '<div class="empty-state">目前沒有資料</div>'}</div></div>`;
}

function openDetail(chart: Chart): void {
  const modal=document.createElement('div'); modal.className='statistics-detail';
  modal.innerHTML=`<div class="statistics-detail-backdrop" data-stat-close></div><section class="statistics-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="statistics-detail-title"><header class="statistics-detail-header"><div><span class="eyebrow">STATISTICS DETAIL</span><h2 id="statistics-detail-title">${escapeHtml(chart.title)}</h2><p>${escapeHtml(chart.description)}</p></div><button type="button" class="statistics-detail-close" data-stat-close aria-label="關閉詳細統計"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></header><div class="statistics-summary-grid">${chart.summary.map((item)=>`<div class="statistics-summary-card"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`).join('')}</div><div class="statistics-large-chart">${chartSvg(chart,true)}</div>${detailTable(chart)}</section>`;
  document.body.appendChild(modal); document.body.classList.add('statistics-detail-open');
  const close=()=>{modal.remove();document.body.classList.remove('statistics-detail-open');document.removeEventListener('keydown',keydown);};
  const keydown=(event: KeyboardEvent)=>{if(event.key==='Escape')close();};
  qsa<HTMLElement>('[data-stat-close]', modal).forEach((node)=>node.addEventListener('click',close)); document.addEventListener('keydown',keydown); modal.tabIndex=-1; modal.focus();
}

function render(charts: Chart[]): void {
  const host=qs<HTMLElement>('#statistics-charts'); if(!host)return;
  host.innerHTML=charts.map((chart)=>`<button type="button" class="statistics-chart-card" data-chart-id="${escapeHtml(chart.id)}"><span class="statistics-chart-heading"><span><b>${escapeHtml(chart.title)}</b><small>${escapeHtml(chart.description)}</small></span><i class="fa-solid fa-up-right-and-down-left-from-center" aria-hidden="true"></i></span><span class="statistics-chart-preview">${chartSvg(chart)}</span><span class="statistics-chart-hint">點擊查看完整分析</span></button>`).join('');
  qsa<HTMLElement>('[data-chart-id]', host).forEach((button)=>button.addEventListener('click',()=>{const chart=charts.find((item)=>item.id===button.dataset.chartId);if(chart)openDetail(chart);}));
}

let unsubscribe: (() => void) | null = null;

function mount(store: MerchStore): void {
  unsubscribe?.();
  const renderCurrent = () => render(aggregateStatistics(store.snapshot.items));
  renderCurrent();
  unsubscribe = store.subscribe(renderCurrent);
}

async function boot(): Promise<void> {
  const host=qs<HTMLElement>('#statistics-charts'); if(!host)return;
  try { mount(await getStore()); }
  catch { host.innerHTML='<div class="empty-state wide">統計資料載入失敗</div>'; }
}
void boot();
