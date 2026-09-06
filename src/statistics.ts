import './statistics.css';
import { loadStore } from './store';
import type { Item } from './types';

const money = (n: number) => `NT$ ${new Intl.NumberFormat('zh-TW').format(Math.round(n))}`;
const quantity = (item: Item) => Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1;
const value = (item: Item) => Number(item.purchase?.price || 0) * quantity(item);
const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>\"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#39;' }[c] as string));
const monthKey = (date?: string) => { if (!date) return ''; const d = new Date(date); if (Number.isNaN(d.getTime())) return ''; return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };
const monthLabel = (key: string) => { const [year, month] = key.split('-'); return `${year}/${Number(month)}月`; };
const percent = (n: number) => `${n.toFixed(1)}%`;

type Row = { label: string; value: number };
type DetailRow = { label: string; quantity: number; spend: number; share: number; extra?: string };
type Chart = { id: string; title: string; description: string; largeType: 'bar' | 'donut'; smallType: 'bar' | 'donut'; rows: Row[]; details: DetailRow[]; format: 'money' | 'count'; summary: { label: string; value: string }[] };

type WorkAggregate = { quantity: number; spend: number };

function aggregate(items: Item[]): Chart[] {
  const workSpend = new Map<string, WorkAggregate>(), workCount = new Map<string, WorkAggregate>(), categoryCount = new Map<string, WorkAggregate>(), monthly = new Map<string, WorkAggregate>();
  items.forEach((item) => {
    const work = item.workName || '未分類作品';
    const category = item.category || '未分類';
    const qty = quantity(item), spend = value(item);
    const add = (map: Map<string, WorkAggregate>, key: string) => { const old = map.get(key) || { quantity: 0, spend: 0 }; map.set(key, { quantity: old.quantity + qty, spend: old.spend + spend }); };
    add(workSpend, work); add(workCount, work); add(categoryCount, category);
    const month = monthKey(item.purchase?.date); if (month) add(monthly, month);
  });

  const totalSpend = [...workSpend.values()].reduce((sum, row) => sum + row.spend, 0);
  const totalQuantity = items.reduce((sum, item) => sum + quantity(item), 0);
  const sorted = (map: Map<string, WorkAggregate>) => [...map.entries()].sort((a,b) => b[1].spend - a[1].spend || b[1].quantity - a[1].quantity || a[0].localeCompare(b[0], 'zh-Hant'));
  const detail = (entries: [string, WorkAggregate][], denominator: number, extra?: (row: WorkAggregate, label: string) => string) => entries.map(([label, row]) => ({ label, quantity: row.quantity, spend: row.spend, share: denominator ? row.spend / denominator * 100 : 0, extra: extra?.(row, label) }));
  const workSpendEntries = sorted(workSpend);
  const workCountEntries = [...workCount.entries()].sort((a,b) => b[1].quantity - a[1].quantity || b[1].spend - a[1].spend || a[0].localeCompare(b[0], 'zh-Hant'));
  const categoryEntries = [...categoryCount.entries()].sort((a,b) => b[1].quantity - a[1].quantity || b[1].spend - a[1].spend || a[0].localeCompare(b[0], 'zh-Hant'));
  const currentYear = new Date().getFullYear();
  const monthlyEntries: [string, WorkAggregate][] = Array.from({length:12}, (_,i) => { const key = `${currentYear}-${String(i+1).padStart(2,'0')}`; return [key, monthly.get(key) || {quantity:0, spend:0}]; });

  const monthlyDetails: DetailRow[] = [];
  let cumulative = 0;
  monthlyEntries.forEach(([key, row], index) => {
    cumulative += row.spend;
    const previous = index ? monthlyEntries[index - 1][1].spend : 0;
    const delta = previous ? `${row.spend >= previous ? '+' : ''}${percent((row.spend - previous) / previous * 100)} vs 上月` : '首筆月份';
    monthlyDetails.push({ label: monthLabel(key), quantity: row.quantity, spend: row.spend, share: totalSpend ? row.spend / totalSpend * 100 : 0, extra: `${money(cumulative)} 累計 · ${delta}` });
  });

  const makeRows = (entries: [string, WorkAggregate][], field: 'spend' | 'quantity'): Row[] => entries.map(([label, row]) => ({ label, value: field === 'spend' ? row.spend : row.quantity }));
  const topWork = workSpendEntries[0];
  const topMonth = monthlyEntries.reduce<[string, WorkAggregate] | undefined>((best, current) => !best || current[1].spend > best[1].spend ? current : best, undefined);
  const averageMonth = totalSpend / 12;

  return [
    {
      id:'work-spending', title:'作品消費排行', description:'看每個作品實際投入多少預算，並可進一步查看收藏數與消費占比。', largeType:'bar', smallType:'donut',
      rows:makeRows(workSpendEntries, 'spend'), details:detail(workSpendEntries, totalSpend), format:'money',
      summary:[['總消費',money(totalSpend)],['最高作品',topWork?.[0] || '無資料'],['最高作品消費',topWork ? money(topWork[1].spend) : 'NT$ 0'],['作品數',String(workSpendEntries.length)]].map(([label,value])=>({label,value}))
    },
    {
      id:'monthly-spending', title:'每月消費趨勢', description:'以今年 12 個月份完整呈現消費；沒有資料的月份也會明確顯示為 0。', largeType:'bar', smallType:'bar',
      rows:monthlyEntries.map(([label,row])=>({label:monthLabel(label),value:row.spend})), details:monthlyDetails, format:'money',
      summary:[['有消費月份',`${monthlyEntries.filter(([,r]) => r.spend > 0).length} 個月`],['最高月份',topMonth ? monthLabel(topMonth[0]) : '無資料'],['最高月消費',topMonth ? money(topMonth[1].spend) : 'NT$ 0'],['月均消費',money(averageMonth)]].map(([label,value])=>({label,value}))
    },
    {
      id:'work-count', title:'作品收藏數量', description:'看哪些作品收藏最多，數量依每筆資料的 quantity 加總。', largeType:'bar', smallType:'donut',
      rows:makeRows(workCountEntries, 'quantity'), details:detail(workCountEntries, totalQuantity, (row) => `消費 ${money(row.spend)}`), format:'count',
      summary:[['總收藏',`${totalQuantity} 件`],['作品種類',`${workCountEntries.length} 個`],['最多收藏作品',workCountEntries[0]?.[0] || '無資料'],['最多作品數量',workCountEntries[0] ? `${workCountEntries[0][1].quantity} 件` : '0 件']].map(([label,value])=>({label,value}))
    },
    {
      id:'category-count', title:'類別收藏數量', description:'以圓餅圖呈現各類別收藏占比，詳細視圖提供完整數量與比例。', largeType:'donut', smallType:'donut',
      rows:makeRows(categoryEntries, 'quantity'), details:detail(categoryEntries, totalQuantity, (row) => `消費 ${money(row.spend)}`), format:'count',
      summary:[['總收藏',`${totalQuantity} 件`],['類別數',`${categoryEntries.length} 類`],['主要類別',categoryEntries[0]?.[0] || '無資料'],['主要類別占比',categoryEntries[0] ? percent(categoryEntries[0][1].quantity / Math.max(totalQuantity,1) * 100) : '0%']].map(([label,value])=>({label,value}))
    },
  ];
}

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
  const labels=chart.rows.map((r,i)=>{const x=left+i*slot+(slot-barW)/2; const h=r.value/max*plotH; const y=top+plotH-h; const value=chart.format==='money'?money(r.value):String(r.value); return '<g class="chart-bar-item"><title>'+escapeHtml(r.label)+'：'+escapeHtml(value)+'</title><rect x="'+x+'" y="'+y+'" width="'+barW+'" height="'+h+'" rx="5" class="bar-fill"></rect><text x="'+(x+barW/2)+'" y="'+(height-bottom+20)+'" text-anchor="middle">'+escapeHtml(r.label.replace(/^\\d{4}-/,'').replace('-','月'))+'月</text>'+ (large?'<text x="'+(x+barW/2)+'" y="'+Math.max(18,y-7)+'" text-anchor="middle" class="bar-value">'+escapeHtml(value)+'</text>':'')+'</g>';}).join('');
  return '<svg viewBox="0 0 '+width+' '+height+'" role="img" aria-label="'+escapeHtml(chart.title)+'"><line x1="'+left+'" y1="'+(top+plotH)+'" x2="'+(width-right)+'" y2="'+(top+plotH)+'" class="chart-axis"></line>'+labels+'</svg>';
}

function barSvg(chart: Chart, width: number, height: number, large: boolean): string {
  if (chart.id === 'monthly-spending') return verticalMonthlySvg(chart,width,height,large);
  const left = large ? 230 : 175, right = 95, top = 30, bottom = 42, plotW = width-left-right, plotH = height-top-bottom, max = Math.max(...chart.rows.map((r) => r.value), 0);
  const gap = large ? 12 : 10, rowH = Math.max(25, (plotH-gap*Math.max(0,chart.rows.length-1))/chart.rows.length), barH = Math.min(rowH-5, large ? 30 : 24);
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(chart.title)}">${chart.rows.map((r,i) => { const y=top+i*(rowH+gap), barW=max?Math.max(r.value === 0 ? 0 : 2,r.value/max*(plotW-15)):0, text=chart.format==='money'?money(r.value):`${r.value} 件`; return `<g class="chart-bar" tabindex="0"><text x="${left-12}" y="${y+barH/2+4}" text-anchor="end">${escapeHtml(r.label)}</text><rect x="${left}" y="${y}" width="${plotW}" height="${barH}" rx="9" class="chart-track"/><rect x="${left}" y="${y}" width="${barW}" height="${barH}" rx="9" class="chart-fill"/><text x="${Math.min(width-right,left+barW+8)}" y="${y+barH/2+4}" class="chart-value">${escapeHtml(text)}</text><title>${escapeHtml(r.label)}：${escapeHtml(text)}</title></g>`; }).join('')}</svg>`;
}

function lineSvg(chart: Chart, width: number, height: number, large: boolean): string {
  const left=large?68:48,right=large?42:30,top=28,bottom=58,plotW=width-left-right,plotH=height-top-bottom,max=Math.max(...chart.rows.map(r=>r.value),0);
  const points=chart.rows.map((r,i)=>({ ...r,x:chart.rows.length===1?left+plotW/2:left+i*plotW/(chart.rows.length-1),y:top+plotH-(max?r.value/max*plotH:0) }));
  const path=points.map((p,i)=>`${i?'L':'M'} ${p.x} ${p.y}`).join(' ');
  const grid=[0,.25,.5,.75,1].map((v)=>{const y=top+plotH-v*plotH;const label=money(max*v);return `<line x1="${left}" y1="${y}" x2="${left+plotW}" y2="${y}" class="chart-grid-line"/><text x="${left-9}" y="${y+4}" text-anchor="end" class="chart-axis-label">${escapeHtml(label)}</text>`;}).join('');
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(chart.title)}">${grid}<line x1="${left}" y1="${top+plotH}" x2="${left+plotW}" y2="${top+plotH}" class="chart-axis"/><path d="${path}" class="chart-line"/>${points.map((p)=>`<g class="chart-point" tabindex="0"><circle cx="${p.x}" cy="${p.y}" r="${large?7:5}"/><text x="${p.x}" y="${height-19}" text-anchor="middle">${escapeHtml(p.label)}</text><title>${escapeHtml(p.label)}：${escapeHtml(money(p.value))}</title></g>`).join('')}</svg>`;
}

function donutSvg(chart: Chart, width: number, height: number, large: boolean): string {
  const cx=large?300:300, cy=height/2, radius=large?175:190, inner=large?105:112, total=chart.rows.reduce((s,r)=>s+r.value,0)||1;
  let angle=-Math.PI/2;
  const arcs=chart.rows.map((r,i)=>{const start=angle, end=angle+r.value/total*Math.PI*2; angle=end; const largeArc=end-start>Math.PI?1:0; const p1=[cx+radius*Math.cos(start),cy+radius*Math.sin(start)],p2=[cx+radius*Math.cos(end),cy+radius*Math.sin(end)],q1=[cx+inner*Math.cos(end),cy+inner*Math.sin(end)],q2=[cx+inner*Math.cos(start),cy+inner*Math.sin(start)]; const d=`M ${p1[0]} ${p1[1]} A ${radius} ${radius} 0 ${largeArc} 1 ${p2[0]} ${p2[1]} L ${q1[0]} ${q1[1]} A ${inner} ${inner} 0 ${largeArc} 0 ${q2[0]} ${q2[1]} Z`; return `<path d="${d}" class="donut-segment donut-${i%6}" tabindex="0"><title>${escapeHtml(r.label)}：${r.value} 件（${percent(r.value/total*100)}）</title></path>`; }).join('');
  const legend=chart.rows.map((r,i)=>`<g class="donut-legend"><circle cx="${large?600:610}" cy="${35+i*30}" r="8" class="donut-dot donut-${i%6}"/><text x="${large?615:625}" y="${39+i*30}">${escapeHtml(r.label)} · ${chart.format==='money'?money(r.value):`${r.value} 件`} · ${percent(r.value/total*100)}</text></g>`).join('');
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(chart.title)}">${arcs}<text x="${cx}" y="${cy-5}" text-anchor="middle" class="donut-total">${total}</text><text x="${cx}" y="${cy+18}" text-anchor="middle" class="donut-caption">收藏</text>${legend}</svg>`;
}

function detailTable(chart: Chart): string {
  return `<div class="statistics-data"><div class="statistics-data-head"><span>完整資料</span><span>${chart.details.length} 筆</span></div><div class="statistics-data-table"><div class="statistics-data-table-row statistics-data-table-header"><span>項目</span><span>數量</span><span>消費</span><span>占比</span><span>補充</span></div>${chart.details.map((row)=>`<div class="statistics-data-table-row"><strong>${escapeHtml(row.label)}</strong><span>${row.quantity} 件</span><span>${escapeHtml(money(row.spend))}</span><span>${percent(row.share)}</span><span>${escapeHtml(row.extra || '')}</span></div>`).join('') || '<div class="empty-state">目前沒有資料</div>'}</div></div>`;
}

function openDetail(chart: Chart): void {
  const modal=document.createElement('div'); modal.className='statistics-detail';
  modal.innerHTML=`<div class="statistics-detail-backdrop" data-stat-close></div><section class="statistics-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="statistics-detail-title"><header class="statistics-detail-header"><div><span class="eyebrow">STATISTICS DETAIL</span><h2 id="statistics-detail-title">${escapeHtml(chart.title)}</h2><p>${escapeHtml(chart.description)}</p></div><button type="button" class="statistics-detail-close" data-stat-close aria-label="關閉詳細統計"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></header><div class="statistics-summary-grid">${chart.summary.map((item)=>`<div class="statistics-summary-card"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`).join('')}</div><div class="statistics-large-chart">${chartSvg(chart,true)}</div>${detailTable(chart)}</section>`;
  document.body.appendChild(modal); document.body.classList.add('statistics-detail-open');
  const close=()=>{modal.remove();document.body.classList.remove('statistics-detail-open');document.removeEventListener('keydown',keydown);};
  const keydown=(event: KeyboardEvent)=>{if(event.key==='Escape')close();};
  modal.querySelectorAll('[data-stat-close]').forEach((node)=>node.addEventListener('click',close)); document.addEventListener('keydown',keydown); modal.tabIndex=-1; modal.focus();
}

function render(charts: Chart[]): void {
  const host=document.querySelector<HTMLElement>('#statistics-charts'); if(!host)return;
  host.innerHTML=charts.map((chart)=>`<button type="button" class="statistics-chart-card" data-chart-id="${chart.id}"><span class="statistics-chart-heading"><span><b>${escapeHtml(chart.title)}</b><small>${escapeHtml(chart.description)}</small></span><i class="fa-solid fa-up-right-and-down-left-from-center" aria-hidden="true"></i></span><span class="statistics-chart-preview">${chartSvg(chart)}</span><span class="statistics-chart-hint">點擊查看完整分析</span></button>`).join('');
  host.querySelectorAll<HTMLElement>('[data-chart-id]').forEach((button)=>button.addEventListener('click',()=>{const chart=charts.find((item)=>item.id===button.dataset.chartId);if(chart)openDetail(chart);}));
}

async function boot(): Promise<void> { const host=document.querySelector<HTMLElement>('#statistics-charts'); if(!host)return; try { const store=await loadStore(); render(aggregate(store.snapshot.items)); } catch { host.innerHTML='<div class="empty-state wide">統計資料載入失敗</div>'; } }
void boot();
