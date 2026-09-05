import './styles.css';
import { createRouter } from './router';
import { loadStore, MerchStore } from './store';
import type { Item } from './types';

const $ = <T extends Element>(selector: string, root: ParentNode = document) => root.querySelector<T>(selector);
const $$ = <T extends Element>(selector: string, root: ParentNode = document) => [...root.querySelectorAll<T>(selector)];

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>\"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#39;' }[c] as string));
const money = (n?: number) => `NT$ ${new Intl.NumberFormat('zh-TW').format(Number(n || 0))}`;
const statusText = (s: string) => ({ received:'已收到', preorder:'預購中', pending:'待到貨' } as Record<string,string>)[s] || s || '未設定';
const dateText = (s?: string) => s ? new Date(s).toLocaleDateString('zh-TW') : '未設定';

function itemCard(item: Item, compact = false): string {
  const image = item.images?.find((i) => i.isCover) || item.images?.[0];
  const src = image?.url || image?.path || '';
  return `<article class="item-card ${compact ? 'compact':''}" data-item-id="${escapeHtml(item.id)}">
    <div class="item-media">${src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(image?.alt || item.title)}" loading="lazy" onerror="this.style.display='none';this.parentElement.classList.add('image-fallback')">` : '<span class="image-placeholder">NO IMAGE</span>'}</div>
    <div class="item-body"><div class="item-top"><span class="badge">${escapeHtml(statusText(item.status))}</span><span class="muted">${escapeHtml(item.category || '未分類')}</span></div><h3>${escapeHtml(item.title)}</h3><p class="item-work">${escapeHtml(item.workName || '')}${item.characters?.length ? ` · ${escapeHtml(item.characters.join('、'))}` : ''}</p><div class="item-bottom"><strong>${money(item.purchase?.price)}</strong><span>${escapeHtml(item.manufacturer || '')}</span></div></div>
  </article>`;
}

function renderHome(store: MerchStore) {
  const { items, works } = store.snapshot;
  const total = items.length;
  const received = items.filter((i) => i.status === 'received').length;
  const preorder = items.filter((i) => i.status === 'preorder').length;
  const pending = items.filter((i) => i.status === 'pending' || i.status === 'preorder').length;
  const spending = items.reduce((sum, i) => sum + Number(i.purchase?.price || 0), 0);
  const now = new Date();
  const month = items.filter((i) => { const d = new Date(i.purchase?.date || ''); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); }).reduce((s, i) => s + Number(i.purchase?.price || 0), 0);
  const set = (key: string, value: string) => { const e = $<HTMLElement>(`[data-home="${key}"]`); if (e) e.textContent = value; };
  set('total', String(total)); set('received', String(received)); set('preorder', String(preorder)); set('pending', String(pending)); set('month', money(month)); set('spending', money(spending));
  const bars = $('#work-bars');
  if (bars) bars.innerHTML = works.map((w) => `<div class="bar-row"><span>${escapeHtml(w.name)}</span><div><i style="width:${total ? Math.max(4, w.items.length / total * 100) : 4}%"></i></div><b>${w.items.length}</b></div>`).join('') || '<div class="empty-state">目前沒有資料</div>';
  const recent = $('#recent-items');
  if (recent) recent.innerHTML = [...items].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))).slice(0, 4).map((i) => itemCard(i, true)).join('') || '<div class="empty-state">目前沒有收藏</div>';
  $$('.item-card', recent || document).forEach((card) => card.addEventListener('click', () => location.hash = `#/item/${encodeURIComponent(card.getAttribute('data-item-id') || '')}`));
  const rank = $('#character-ranking');
  const counts = new Map<string, number>();
  items.forEach((i) => (i.characters || []).forEach((c) => counts.set(c, (counts.get(c) || 0) + 1)));
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (rank) rank.innerHTML = top.length ? top.map(([c, n], idx) => `<li><span>${idx + 1}</span><strong>${escapeHtml(c)}</strong><b>${n}</b></li>`).join('') : '<li class="empty-state">目前沒有資料</li>';
}

function renderCollection(store: MerchStore) {
  const host = $('#collection-items'); if (!host) return;
  const { items, ui } = store.snapshot;
  const query = ui.collectionQuery.trim().toLowerCase();
  let filtered = items.filter((i) => !query || [i.title, i.workName, i.category, i.manufacturer, ...(i.characters || []), i.notes].join(' ').toLowerCase().includes(query))
    .filter((i) => ui.collectionStatus === 'all' || i.status === ui.collectionStatus)
    .filter((i) => ui.collectionWork === 'all' || i.workId === ui.collectionWork);
  filtered = [...filtered].sort((a, b) => ui.collectionSort === 'price' ? Number(b.purchase?.price || 0) - Number(a.purchase?.price || 0) : ui.collectionSort === 'title' ? a.title.localeCompare(b.title, 'zh-Hant') : String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  host.innerHTML = filtered.map((i) => itemCard(i)).join('') || '<div class="empty-state wide">沒有符合條件的收藏</div>';
  host.classList.toggle('list-mode', ui.collectionView === 'list');
  const count = $('#collection-count'); if (count) count.textContent = `${filtered.length} ITEMS`;
  $$('.item-card', host).forEach((card) => card.addEventListener('click', () => location.hash = `#/item/${encodeURIComponent(card.getAttribute('data-item-id') || '')}`));
  $$('.view-button').forEach((button) => { const active = button.dataset.view === ui.collectionView; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); });
}

function renderStatistics(store: MerchStore) {
  const { items, works } = store.snapshot;
  const total = items.length;
  const pending = items.filter((i) => i.status !== 'received').length;
  const spending = items.reduce((s, i) => s + Number(i.purchase?.price || 0), 0);
  const set = (k: string, v: string) => { const e = $<HTMLElement>(`[data-stat="${k}"]`); if (e) e.textContent = v; };
  set('total', String(total)); set('pending', String(pending)); set('spending', money(spending));
  const cats = new Map<string, number>();
  items.forEach((i) => cats.set(i.category || '未分類', (cats.get(i.category || '未分類') || 0) + 1));
  const legend = $('#category-list');
  if (legend) legend.innerHTML = [...cats.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div><span>${escapeHtml(k)}</span><b>${v}</b></div>`).join('') || '<div class="empty-state">目前沒有資料</div>';
  const workStats = $('#work-statistics');
  if (workStats) workStats.innerHTML = works.map((w) => `<div class="bar-row"><span>${escapeHtml(w.name)}</span><div><i style="width:${total ? Math.max(4, w.items.length / total * 100) : 4}%"></i></div><b>${w.items.length}</b></div>`).join('');
}

function renderDetail(store: MerchStore, id: string) {
  const item = store.snapshot.items.find((i) => i.id === id);
  const page = $('#detail'); if (!page) return;
  if (!item) { page.innerHTML = '<div class="page-heading"><span class="eyebrow">404 / ITEM</span><h1>找不到收藏</h1><p>這個收藏不存在或已被移除。</p><a class="button" href="#/collection">返回收藏</a></div>'; return; }
  const images = (item.images || []).map((im) => `<img src="${escapeHtml(im.url || im.path || '')}" alt="${escapeHtml(im.alt || item.title)}" loading="lazy" onerror="this.style.display='none';this.parentElement.classList.add('image-fallback')">`).join('');
  page.innerHTML = `<div class="page-heading"><a class="back-link" href="#/collection">← 返回收藏</a><span class="eyebrow">ITEM DETAIL</span><h1>${escapeHtml(item.title)}</h1><p>${escapeHtml(item.workName || '')} · ${escapeHtml(item.characters?.join('、') || '')}</p></div><div class="detail-grid"><section class="panel image-viewer">${images || '<div class="image-placeholder large">NO IMAGE</div>'}</section><section class="panel detail-info"><span class="badge">${escapeHtml(statusText(item.status))}</span><h2>${escapeHtml(item.category || '未分類')}</h2><dl><dt>廠商</dt><dd>${escapeHtml(item.manufacturer || '未設定')}</dd><dt>價格</dt><dd>${money(item.purchase?.price)}</dd><dt>購買日期</dt><dd>${dateText(item.purchase?.date)}</dd><dt>發售日期</dt><dd>${dateText(item.release?.date)}</dd><dt>預計到貨</dt><dd>${dateText(item.release?.expectedDate)}</dd><dt>收到日期</dt><dd>${dateText(item.release?.receivedDate)}</dd><dt>物流</dt><dd>${escapeHtml(item.shipping?.method || '未設定')}</dd><dt>物流狀態</dt><dd>${escapeHtml(item.shipping?.status || '未設定')}</dd><dt>售後</dt><dd>${escapeHtml(item.afterSales?.note || '無')}</dd></dl></section></div>`;
}

function syncCollectionControls(store: MerchStore) {
  const { ui } = store.snapshot;
  const search = $('#collection-search') as HTMLInputElement | null;
  const work = $('#filter-work') as HTMLSelectElement | null;
  const status = $('#filter-status') as HTMLSelectElement | null;
  const sort = $('#sort') as HTMLSelectElement | null;
  if (search) search.value = ui.collectionQuery;
  if (work) work.value = ui.collectionWork;
  if (status) status.value = ui.collectionStatus;
  if (sort) sort.value = ui.collectionSort;
}

function setupCollection(store: MerchStore) {
  const search = $('#collection-search') as HTMLInputElement | null;
  const work = $('#filter-work') as HTMLSelectElement | null;
  const status = $('#filter-status') as HTMLSelectElement | null;
  const sort = $('#sort') as HTMLSelectElement | null;
  search?.addEventListener('input', () => store.setUi({ collectionQuery: search.value }));
  work?.addEventListener('change', () => store.setUi({ collectionWork: work.value }));
  status?.addEventListener('change', () => store.setUi({ collectionStatus: status.value }));
  sort?.addEventListener('change', () => store.setUi({ collectionSort: sort.value as 'created' | 'title' | 'price' }));
  $$('.view-button').forEach((button) => button.addEventListener('click', () => store.setUi({ collectionView: button.dataset.view === 'list' ? 'list' : 'cards' })));
}

function setupSidebarToggle() {
  const sidebar = $('.sidebar') as HTMLElement | null;
  const button = $('#sidebar-toggle') as HTMLButtonElement | null;
  if (!sidebar || !button) return;
  const key = 'chi-merch-sidebar-collapsed';
  const setCollapsed = (collapsed: boolean) => {
    sidebar.classList.toggle('is-collapsed', collapsed);
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    button.setAttribute('aria-label', collapsed ? '展開側邊欄' : '收合側邊欄');
    button.title = collapsed ? '展開側邊欄' : '收合側邊欄';
    button.innerHTML = '<i class="fa-solid fa-grip-lines-vertical" aria-hidden="true"></i>';
    try { localStorage.setItem(key, collapsed ? '1' : '0'); } catch {}
  };
  let collapsed = false;
  try { collapsed = localStorage.getItem(key) === '1'; } catch {}
  setCollapsed(collapsed);
  button.addEventListener('click', () => setCollapsed(!sidebar.classList.contains('is-collapsed')));
}

async function boot() {
  setupSidebarToggle();
  const router = createRouter({ onNavigate: (route) => {
    $$('.page').forEach((page) => {
      const active = page.getAttribute('data-page') === route.name || (route.name === 'item' && page.getAttribute('data-page') === 'detail') || (route.name === 'not-found' && page.getAttribute('data-page') === '404');
      page.toggleAttribute('hidden', !active);
      page.classList.toggle('is-active', active);
    });
    $$('.nav a').forEach((a) => a.classList.toggle('is-active', a.dataset.route === route.name));
    const recentSection = $('#recent-section');
    const isHome = route.name === 'home';
    if (recentSection) recentSection.toggleAttribute('hidden', !isHome);
  }});
  router.start();

  try {
    const store = await loadStore();
    document.documentElement.dataset.dataReady = 'true';
    $$('.version').forEach((e) => e.textContent = `v${store.snapshot.version}`);
    syncCollectionControls(store);
    renderHome(store); renderCollection(store); renderStatistics(store);
    setupCollection(store);
    store.subscribe(() => { renderHome(store); renderCollection(store); renderStatistics(store); });
    window.addEventListener('hashchange', () => { const route = router.current(); if (route.name === 'item') renderDetail(store, route.id); });
    const route = router.current(); if (route.name === 'item') renderDetail(store, route.id);
  } catch (error) {
    console.error(error);
    const e = $('#global-error');
    if (e) { e.hidden = false; e.innerHTML = `<strong>資料載入失敗</strong><p>${escapeHtml(error instanceof Error ? error.message : 'Unknown error')}</p>`; }
  }
}

boot();
