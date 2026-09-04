import './styles.css';
import { navigate, parseRoute, startRouter, type Route } from './router.ts';
import { store } from './store.ts';
import type { AppState, MerchItem } from './types.ts';
import { formatCurrency, formatCount, formatList } from './utils/format.ts';
import { formatDate, toTimestamp } from './utils/date.ts';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('找不到 #app');

let route: Route = parseRoute();
const statusText: Record<string, string> = { received: '已收到', pending: '待處理', preorder: '預購中' };
const statusClass = (s: string) => s === 'received' ? 'received' : s === 'preorder' ? 'preorder' : s === 'pending' ? 'pending' : '';
const label = (s: string) => statusText[s] ?? s || '未設定';
const money = (i: MerchItem) => formatCurrency(i.purchase.price, i.purchase.currency || 'TWD');
const workName = (state: AppState, id: string) => state.works.find((w) => w.id === id)?.name ?? id;

function node<K extends keyof HTMLElementTagNameMap>(tag: K, textValue?: string, className?: string): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (textValue !== undefined) n.textContent = textValue;
  return n;
}

function link(textValue: string, href: string, className = 'button'): HTMLAnchorElement {
  const a = node('a', textValue, className);
  a.href = href;
  return a;
}

function image(item: MerchItem): HTMLElement {
  const box = node('div', undefined, 'item-cover');
  const asset = item.images.find((x) => x.isCover) ?? item.images[0];
  if (!asset?.url) { box.textContent = 'NO IMAGE'; return box; }
  const img = node('img') as HTMLImageElement;
  img.src = asset.url;
  img.alt = asset.alt || item.title;
  img.loading = 'lazy';
  img.onerror = () => { img.remove(); box.textContent = 'IMAGE UNAVAILABLE'; };
  box.append(img);
  return box;
}

function shell(state: AppState, title: string, description: string, content: HTMLElement): HTMLElement {
  const shell = node('div', undefined, 'site-shell');
  const aside = node('aside', undefined, 'sidebar');
  const brand = link('CHI', '#/', 'brand brand-mark');
  aside.append(brand);
  const nav = node('nav', undefined, 'nav');
  const pages: Array<[string, string]> = [['home','首頁'],['collection','收藏'],['statistics','統計'],['management','管理'],['settings','設定']];
  for (const [name, textValue] of pages) {
    const a = link(textValue, `#/${name}`, `nav-item${route.name === name ? ' active' : ''}`);
    nav.append(a);
  }
  aside.append(nav);
  const footer = node('footer', `v${state.version?.version ?? '—'}`, 'sidebar-footer');
  aside.append(footer);
  const main = node('div', undefined, 'main');
  const header = node('header', undefined, 'header');
  header.append(node('p', 'CHI MERCH', 'eyebrow'), node('h1', title), node('p', description));
  main.append(header, content);
  shell.append(aside, main);
  return shell;
}

function statePage(title: string, message: string, retry = false): HTMLElement {
  const page = node('main', undefined, 'state-screen');
  const card = node('section', undefined, 'state-copy');
  card.append(node('p', 'CHI MERCH', 'eyebrow'), node('h1', title), node('p', message));
  if (retry) {
    const button = node('button', '重新載入', 'button primary');
    button.type = 'button';
    button.dataset.action = 'retry';
    card.append(button);
  }
  page.append(card);
  return page;
}

function itemCard(item: MerchItem, state: AppState): HTMLElement {
  const card = node('article', undefined, 'item-card');
  card.tabIndex = 0;
  card.dataset.action = 'open-item';
  card.dataset.itemId = item.id;
  card.append(image(item));
  const body = node('div', undefined, 'item-card-body');
  const meta = node('div', undefined, 'item-meta');
  meta.append(node('span', workName(state, item.workId), 'item-work'), node('span', label(item.status), `badge ${statusClass(item.status)}`));
  body.append(meta, node('h3', item.title));
  const detail = [formatList(item.characters), item.category, item.manufacturer].filter(Boolean).join(' · ');
  if (detail) body.append(node('p', detail));
  const bottom = node('div', undefined, 'item-bottom');
  bottom.append(node('b', money(item)), node('span', item.release.expectedDate ? `預計 ${formatDate(item.release.expectedDate)}` : ''));
  body.append(bottom); card.append(body); return card;
}

function filtered(state: AppState): MerchItem[] {
  const ui = state.ui.collection;
  const q = ui.search.trim().toLocaleLowerCase('zh-TW');
  return [...state.items].filter((i) => {
    const hay = [i.title, i.series, i.category, i.manufacturer, i.workId, ...i.characters].join(' ').toLocaleLowerCase('zh-TW');
    return (!q || hay.includes(q)) && (!ui.status || i.status === ui.status) && (!ui.category || i.category === ui.category) && (!ui.character || i.characters.includes(ui.character)) && (!ui.manufacturer || i.manufacturer === ui.manufacturer) && (!ui.workId || i.workId === ui.workId);
  }).sort((a,b) => {
    if (ui.sort === 'price-asc') return a.purchase.price - b.purchase.price;
    if (ui.sort === 'price-desc') return b.purchase.price - a.purchase.price;
    if (ui.sort === 'title-asc') return a.title.localeCompare(b.title, 'zh-Hant');
    return (ui.sort === 'updated-asc' ? 1 : -1) * (toTimestamp(a.updatedAt) - toTimestamp(b.updatedAt));
  });
}

function home(state: AppState): HTMLElement {
  const page = node('main', undefined, 'content page-content');
  const hero = node('section', undefined, 'hero');
  hero.append(node('div', undefined, 'hero-copy'));
  const copy = hero.firstElementChild!; copy.append(node('p', 'COLLECTION', 'eyebrow'), node('h2', '收藏管理系統'), node('p', '集中管理收藏、發售、物流與售後資訊。'));
  page.append(hero);
  const stats = node('div', undefined, 'stat-grid');
  const received = state.items.filter((i) => i.status === 'received').length;
  const preorder = state.items.filter((i) => i.status === 'preorder').length;
  const pending = state.items.filter((i) => i.status === 'pending').length;
  for (const [a,b,c] of [['總收藏',formatCount(state.items.length),'所有資料'],['已收到',formatCount(received),'已完成到貨'],['預購中',formatCount(preorder),'等待發售'],['待處理',formatCount(pending),'需要留意']]) {
    const card = node('article', undefined, 'stat-card'); card.append(node('span', a), node('strong', b), node('small', c)); stats.append(card);
  }
  page.append(stats);
  const grid = node('div', undefined, 'two-column');
  for (const [title, list] of [['作品', state.works.map((w) => ({ text:w.name, href:'#/collection' }))], ['最近更新', [...state.items].sort((a,b)=>toTimestamp(b.updatedAt)-toTimestamp(a.updatedAt)).slice(0,5).map((i)=>({text:i.title,href:`#/item/${encodeURIComponent(i.id)}`}))]] as const) {
    const panel = node('section', undefined, 'panel'); panel.append(node('h3', title));
    const ul = node('div', undefined, 'simple-list');
    for (const x of list) ul.append(link(x.text, x.href, 'simple-list-row'));
    if (!list.length) ul.append(node('p','目前沒有資料。','empty-copy'));
    panel.append(ul); grid.append(panel);
  }
  page.append(grid);
  return shell(state, '我的收藏', '收藏管理系統', page);
}

function collection(state: AppState): HTMLElement {
  const page = node('main', undefined, 'content page-content');
  page.append(node('div', undefined, 'page-heading'));
  const heading = page.firstElementChild!; heading.append(node('div')); const left = heading.firstElementChild!; left.append(node('p','COLLECTION','eyebrow'), node('h2','收藏'), node('p',`共 ${formatCount(state.items.length)}。`));
  const panel = node('section', undefined, 'panel');
  const toolbar = node('div', undefined, 'toolbar');
  const search = node('input') as HTMLInputElement; search.type='search'; search.placeholder='搜尋標題、角色、作品、廠商…'; search.value=state.ui.collection.search; search.dataset.collectionField='search'; toolbar.append(search);
  const makeSelect = (field:string, values:string[], current:string, all:string) => { const s=node('select') as HTMLSelectElement; s.dataset.collectionField=field; s.append(new Option(all,'')); for(const v of values) s.append(new Option(v,v,false,v===current)); return s; };
  toolbar.append(makeSelect('workId',state.works.map(w=>w.id),state.ui.collection.workId,'全部作品'));
  toolbar.append(makeSelect('status',[...new Set(state.items.map(i=>i.status))],state.ui.collection.status,'全部狀態'));
  toolbar.append(makeSelect('category',[...new Set(state.items.map(i=>i.category).filter(Boolean))],state.ui.collection.category,'全部分類'));
  panel.append(toolbar);
  const meta=node('div',undefined,'collection-meta'); meta.append(node('span',`${formatCount(filtered(state).length)} 符合`));
  const sort=makeSelect('sort',['updated-desc','updated-asc','price-desc','price-asc','title-asc'],state.ui.collection.sort,'排序'); meta.append(sort); panel.append(meta);
  const grid=node('div',undefined,state.ui.collection.viewMode==='list'?'item-list':'item-grid');
  for(const item of filtered(state)) grid.append(itemCard(item,state));
  if(!grid.children.length) grid.append(node('p','沒有符合條件的收藏。','empty-copy'));
  panel.append(grid); page.append(panel); return shell(state,'收藏','瀏覽、搜尋與整理目前收藏。',page);
}

function statistics(state: AppState): HTMLElement {
  const page=node('main',undefined,'content page-content'); const panel=node('section',undefined,'panel');
  panel.append(node('p','STATISTICS','eyebrow'),node('h2','統計'));
  const total=state.items.reduce((s,i)=>s+(Number.isFinite(i.purchase.price)?i.purchase.price:0),0);
  const grid=node('div',undefined,'stat-grid'); grid.append(node('article',undefined,'stat-card')); const first=grid.firstElementChild!; first.append(node('span','總收藏'),node('strong',formatCount(state.items.length)),node('small','全部作品'));
  const second=node('article',undefined,'stat-card'); second.append(node('span','總支出'),node('strong',formatCurrency(total)),node('small','依收藏資料計算')); grid.append(second); panel.append(grid);
  const works=node('div',undefined,'simple-list'); for(const w of state.works){const n=state.items.filter(i=>i.workId===w.id); works.append(node('div',`${w.name}　${formatCount(n.length)}　${formatCurrency(n.reduce((s,i)=>s+i.purchase.price,0))}`,'simple-list-row'));} panel.append(node('h3','依作品'),works); page.append(panel); return shell(state,'統計','快速掌握收藏規模與消費。',page);
}

function detail(state: AppState, id: string): HTMLElement {
  const item=state.items.find(i=>i.id===id); const page=node('main',undefined,'content page-content');
  if(!item){ page.append(node('section',undefined,'panel')); const p=page.firstElementChild!; p.append(node('h2','找不到收藏'),node('p','這件收藏不存在。'),link('返回收藏','#/collection','button primary')); return shell(state,'收藏詳細','',page); }
  const panel=node('section',undefined,'panel'); panel.append(node('p','ITEM','eyebrow'),node('h2',item.title));
  const info=node('div',undefined,'detail-grid'); info.append(node('div',`作品：${workName(state,item.workId)}`),node('div',`狀態：${label(item.status)}`),node('div',`分類：${item.category||'未設定'}`),node('div',`角色：${formatList(item.characters)||'未設定'}`),node('div',`廠商：${item.manufacturer||'未設定'}`),node('div',`價格：${money(item)}`),node('div',`購買日期：${formatDate(item.purchase.date)}`),node('div',`預計發售：${formatDate(item.release.expectedDate)}`),node('div',`物流：${item.shipping.status||'未設定'}`),node('div',`售後：${item.afterSales.status||'未設定'}`)); panel.append(info);
  if(item.description) panel.append(node('h3','說明'),node('p',item.description)); if(item.notes) panel.append(node('h3','備註'),node('p',item.notes));
  const images=node('div',undefined,'image-grid'); for(const asset of item.images){const b=node('button',undefined,'image-button'); b.type='button'; b.dataset.action='view-image'; b.dataset.imageUrl=asset.url; b.dataset.imageAlt=asset.alt||item.title; b.append(image({...item,images:[asset]})); images.append(b);} panel.append(images,link('返回收藏','#/collection','button')); page.append(panel); return shell(state,'收藏詳細','查看單件收藏的完整資訊。',page);
}

function placeholder(state: AppState, route: Route): HTMLElement { const page=node('main',undefined,'content page-content'); const panel=node('section',undefined,'panel'); const title=route.name==='settings'?'設定':route.name==='management'?'管理':'頁面不存在'; panel.append(node('p','CHI MERCH','eyebrow'),node('h2',title),node('p','此區域尚未啟用。'),link('返回首頁','#/','button primary')); page.append(panel); return shell(state,title,'',page); }

function render(): void {
  const state=store.getState();
  if(state.loading){root.replaceChildren(statePage('載入收藏中','正在讀取作品與收藏資料。')); return;}
  if(state.error){root.replaceChildren(statePage('資料載入失敗',state.error,true)); return;}
  switch(route.name){case 'home':root.replaceChildren(home(state));break;case 'collection':root.replaceChildren(collection(state));break;case 'statistics':root.replaceChildren(statistics(state));break;case 'item':root.replaceChildren(detail(state,route.id));break;default:root.replaceChildren(placeholder(state,route));}
  document.documentElement.dataset.chiMerchBooted='true';
}

root.addEventListener('click',(event)=>{const t=event.target instanceof Element?event.target.closest<HTMLElement>('[data-action]'):null;if(!t)return;const action=t.dataset.action;if(action==='open-item'){const id=t.dataset.itemId;if(id)navigate({name:'item',id});}else if(action==='retry'){void store.load();}else if(action==='view-image'){const url=t.dataset.imageUrl;if(url){const overlay=node('div',undefined,'image-modal');const close=node('button','關閉','button');close.type='button';close.dataset.action='close-image';const img=node('img') as HTMLImageElement;img.src=url;img.alt=t.dataset.imageAlt||'收藏圖片';overlay.append(close,img);document.body.append(overlay);}}else if(action==='close-image'){t.closest('.image-modal')?.remove();}});
root.addEventListener('keydown',(event)=>{if((event.key==='Enter'||event.key===' ')&&event.target instanceof Element){const t=event.target.closest<HTMLElement>('[data-action="open-item"]');if(t?.dataset.itemId){event.preventDefault();navigate({name:'item',id:t.dataset.itemId});}}});
root.addEventListener('input',(event)=>{if(event.target instanceof HTMLInputElement&&event.target.dataset.collectionField==='search')store.setCollectionUI({search:event.target.value});});
root.addEventListener('change',(event)=>{const t=event.target;if(t instanceof HTMLInputElement||t instanceof HTMLSelectElement){const f=t.dataset.collectionField;if(f==='search')store.setCollectionUI({search:t.value});else if(f==='status')store.setCollectionUI({status:t.value});else if(f==='category')store.setCollectionUI({category:t.value});else if(f==='workId')store.setCollectionUI({workId:t.value});else if(f==='sort')store.setCollectionUI({sort:t.value});}});
store.subscribe(render);
startRouter((r)=>{route=r;render();});
void store.load();
