import './styles.css';
import { createRouter } from './router';
import { loadVersion } from './version';

type Status = 'received' | 'preorder' | 'pending' | string;
type ImageMeta = { id: string; path?: string; url?: string; sha?: string; alt?: string; isCover?: boolean };
type Item = { id: string; workId: string; workName?: string; title: string; series?: string; characters?: string[]; category?: string; manufacturer?: string; status: Status; description?: string; notes?: string; images?: ImageMeta[]; purchase?: { price?: number; currency?: string; platform?: string; date?: string; url?: string; orderId?: string }; release?: { date?: string; expectedDate?: string; receivedDate?: string }; shipping?: { status?: string; method?: string; trackingNumber?: string; note?: string }; afterSales?: { status?: string; note?: string; updatedAt?: string }; createdAt?: string; updatedAt?: string };
type Work = { id: string; name: string; items: Item[] };
type Store = { works: Work[]; items: Item[]; version: string; subscribe: (fn: () => void) => () => void };

const $ = <T extends Element>(selector: string, root: ParentNode = document) => root.querySelector<T>(selector);
const $$ = <T extends Element>(selector: string, root: ParentNode = document) => [...root.querySelectorAll<T>(selector)];
const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>\"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#39;' }[c] as string));
const money = (n?: number) => `NT$ ${new Intl.NumberFormat('zh-TW').format(Number(n || 0))}`;
const statusText = (s: string) => ({ received:'已收到', preorder:'預購中', pending:'待到貨' } as Record<string,string>)[s] || s || '未設定';
const dateText = (s?: string) => s ? new Date(s).toLocaleDateString('zh-TW') : '未設定';

function createStore(works: Work[], version: string): Store {
  const listeners = new Set<() => void>();
  return { works, items: works.flatMap((w) => w.items.map((i) => ({ ...i, workId:w.id, workName:w.name }))), version,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); } };
}

async function loadStore(): Promise<Store> {
  const index = await fetch('./data/works.json', { cache:'no-store' }).then(r => { if (!r.ok) throw new Error(`works.json ${r.status}`); return r.json(); });
  const works = await Promise.all(index.works.map(async (w: {id:string;name:string;data:string}) => {
    const payload = await fetch(`./${w.data}`, { cache:'no-store' }).then(r => { if (!r.ok) throw new Error(`${w.data} ${r.status}`); return r.json(); });
    return { id:w.id, name:w.name, items:Array.isArray(payload.items) ? payload.items : [] };
  }));
  const version = await loadVersion().catch(() => '1.0.0');
  return createStore(works, version);
}

function itemCard(item: Item, compact = false): string {
  const image = item.images?.find(i => i.isCover) || item.images?.[0];
  const src = image?.url || image?.path || '';
  return `<article class="item-card ${compact ? 'compact':''}" data-item-id="${escapeHtml(item.id)}">
    <div class="item-media">${src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(image?.alt || item.title)}" loading="lazy" onerror="this.style.display='none';this.parentElement.classList.add('image-fallback')">` : '<span class="image-placeholder">NO IMAGE</span>'}</div>
    <div class="item-body"><div class="item-top"><span class="badge">${escapeHtml(statusText(item.status))}</span><span class="muted">${escapeHtml(item.category || '未分類')}</span></div><h3>${escapeHtml(item.title)}</h3><p class="item-work">${escapeHtml(item.workName || '')}${item.characters?.length ? ` · ${escapeHtml(item.characters.join('、'))}` : ''}</p><div class="item-bottom"><strong>${money(item.purchase?.price)}</strong><span>${escapeHtml(item.manufacturer || '')}</span></div></div>
  </article>`;
}

function renderHome(store: Store) {
  const total = store.items.length, pending = store.items.filter(i => i.status !== 'received').length;
  const spending = store.items.reduce((sum,i) => sum + Number(i.purchase?.price || 0),0);
  const now = new Date(), month = store.items.filter(i => { const d = new Date(i.purchase?.date || ''); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); }).reduce((s,i)=>s+Number(i.purchase?.price||0),0);
  const set = (key:string, value:string) => { const e = $<HTMLElement>(`[data-home="${key}"]`); if(e)e.textContent=value; };
  set('total', String(total)); set('pending', String(pending)); set('month', money(month)); set('spending', money(spending));
  const bars = $('#work-bars'); if (bars) bars.innerHTML = store.works.map(w => `<div class="bar-row"><span>${escapeHtml(w.name)}</span><div><i style="width:${total ? Math.max(4, w.items.length/total*100):4}%"></i></div><b>${w.items.length}</b></div>`).join('') || '<div class="empty-state">目前沒有資料</div>';
  const recent = $('#recent-items'); if(recent) recent.innerHTML = [...store.items].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).slice(0,4).map(i=>itemCard(i,true)).join('') || '<div class="empty-state">目前沒有收藏</div>';
  const rank = $('#character-ranking'); const counts = new Map<string,number>(); store.items.forEach(i => (i.characters||[]).forEach(c=>counts.set(c,(counts.get(c)||0)+1))); const top=[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5); if(rank) rank.innerHTML=top.length?top.map(([c,n],idx)=>`<li><span>${idx+1}</span><strong>${escapeHtml(c)}</strong><b>${n}</b></li>`).join(''):'<li class="empty-state">目前沒有資料</li>';
}

function renderCollection(store: Store) {
  const host = $('#collection-items'); if(!host)return;
  const query = ($<HTMLInputElement>('#collection-search')?.value || '').trim().toLowerCase();
  const status = $<HTMLSelectElement>('#filter-status')?.value || 'all', work = $<HTMLSelectElement>('#filter-work')?.value || 'all', sort = $<HTMLSelectElement>('#sort')?.value || 'created';
  let items = store.items.filter(i => !query || [i.title,i.workName,i.category,i.manufacturer,...(i.characters||[]),i.notes].join(' ').toLowerCase().includes(query)).filter(i=>status==='all'||i.status===status).filter(i=>work==='all'||i.workId===work);
  items = [...items].sort((a,b)=> sort==='price' ? Number(b.purchase?.price||0)-Number(a.purchase?.price||0) : sort==='title' ? a.title.localeCompare(b.title,'zh-Hant') : String(b.createdAt).localeCompare(String(a.createdAt)));
  host.innerHTML = items.map(i=>itemCard(i)).join('') || '<div class="empty-state wide">沒有符合條件的收藏</div>';
  const count=$('#collection-count'); if(count)count.textContent=`${items.length} ITEMS`;
  $$('.item-card',host).forEach(c=>c.addEventListener('click',()=>location.hash=`#/item/${encodeURIComponent(c.getAttribute('data-item-id')||'')}`));
}

function renderStatistics(store: Store) {
  const total=store.items.length, pending=store.items.filter(i=>i.status!=='received').length, spending=store.items.reduce((s,i)=>s+Number(i.purchase?.price||0),0);
  const set=(k:string,v:string)=>{const e=$<HTMLElement>(`[data-stat="${k}"]`);if(e)e.textContent=v}; set('total',String(total));set('pending',String(pending));set('spending',money(spending));
  const cats=new Map<string,number>();store.items.forEach(i=>cats.set(i.category||'未分類',(cats.get(i.category||'未分類')||0)+1));const legend=$('#category-list');if(legend)legend.innerHTML=[...cats.entries()].sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div><span>${escapeHtml(k)}</span><b>${v}</b></div>`).join('')||'<div class="empty-state">目前沒有資料</div>';
  const workStats=$('#work-statistics');if(workStats)workStats.innerHTML=store.works.map(w=>`<div class="bar-row"><span>${escapeHtml(w.name)}</span><div><i style="width:${total?Math.max(4,w.items.length/total*100):4}%"></i></div><b>${w.items.length}</b></div>`).join('');
}

function renderDetail(store: Store, id: string) {
  const item=store.items.find(i=>i.id===id), page=$('#detail'); if(!page)return;
  if(!item){page.innerHTML='<div class="page-heading"><span class="eyebrow">404 / ITEM</span><h1>找不到收藏</h1><p>這個收藏不存在或已被移除。</p><a class="button" href="#/collection">返回收藏</a></div>';return;}
  const images=(item.images||[]).map(im=>`<img src="${escapeHtml(im.url||im.path||'')}" alt="${escapeHtml(im.alt||item.title)}" loading="lazy">`).join('');
  page.innerHTML=`<div class="page-heading"><a class="back-link" href="#/collection">← 返回收藏</a><span class="eyebrow">ITEM DETAIL</span><h1>${escapeHtml(item.title)}</h1><p>${escapeHtml(item.workName||'')} · ${escapeHtml(item.characters?.join('、')||'')}</p></div><div class="detail-grid"><section class="panel image-viewer">${images||'<div class="image-placeholder large">NO IMAGE</div>'}</section><section class="panel detail-info"><span class="badge">${escapeHtml(statusText(item.status))}</span><h2>${escapeHtml(item.category||'未分類')}</h2><dl><dt>廠商</dt><dd>${escapeHtml(item.manufacturer||'未設定')}</dd><dt>價格</dt><dd>${money(item.purchase?.price)}</dd><dt>購買日期</dt><dd>${dateText(item.purchase?.date)}</dd><dt>預計到貨</dt><dd>${dateText(item.release?.expectedDate)}</dd><dt>物流</dt><dd>${escapeHtml(item.shipping?.method||'未設定')}</dd><dt>售後</dt><dd>${escapeHtml(item.afterSales?.note||'無')}</dd></dl><div class="detail-actions"><button class="button" data-delete-item="${escapeHtml(item.id)}">刪除</button></div></section></div>`;
  const del=$('[data-delete-item]');del?.addEventListener('click',()=>{ if(confirm('確定要刪除此收藏嗎？')) alert('目前資料來源為 GitHub 靜態資料，寫入 API 尚未啟用。'); });
}

async function boot() {
  const router=createRouter({onNavigate:route=>{ $$('.page').forEach(p=>{const active=p.getAttribute('data-page')===route.name || (route.name==='item'&&p.getAttribute('data-page')==='detail') || (route.name==='not-found'&&p.getAttribute('data-page')==='404');p.toggleAttribute('hidden',!active);p.classList.toggle('is-active',active)}); $$('.nav a').forEach(a=>a.classList.toggle('is-active',a.dataset.route===route.name)); }});
  router.start();
  try { const store=await loadStore(); document.documentElement.dataset.dataReady='true'; $$('.version').forEach(e=>e.textContent=`v${store.version}`); renderHome(store); renderCollection(store); renderStatistics(store); store.subscribe(()=>{renderHome(store);renderCollection(store);renderStatistics(store)}); $$('#collection-search,#filter-status,#filter-work,#sort').forEach(e=>e.addEventListener('input',()=>renderCollection(store))); $$('#filter-status,#filter-work,#sort').forEach(e=>e.addEventListener('change',()=>renderCollection(store))); $$('.view-button').forEach(b=>b.addEventListener('click',()=>{const mode=b.dataset.view||'cards';localStorage.setItem('merch-view',mode);$$('.view-button').forEach(x=>{const on=x.dataset.view===mode;x.classList.toggle('is-active',on);x.setAttribute('aria-pressed',String(on))});$('#collection-items')?.classList.toggle('list-mode',mode==='list')})); const saved=localStorage.getItem('merch-view')||'cards';$('.view-button[data-view="'+saved+'"]')?.dispatchEvent(new Event('click')); window.addEventListener('hashchange',()=>{const r=location.hash.match(/^#\/item\/(.+)$/);if(r)renderDetail(store,decodeURIComponent(r[1]));}); if(location.hash.startsWith('#/item/'))renderDetail(store,decodeURIComponent(location.hash.slice(7))); }
  catch(error){console.error(error);const e=$('#global-error');if(e){e.hidden=false;e.innerHTML=`<strong>資料載入失敗</strong><p>${escapeHtml(error instanceof Error?error.message:'Unknown error')}</p>`}}
}
boot();
