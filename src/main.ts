import './styles.css';
import './item-detail-modal.css';
import { createRouter } from './router';
import { loadStore, MerchStore } from './store';
import { parseItemId } from './item-id';
import type { Item } from './types';

const $ = <T extends Element>(selector: string, root: ParentNode = document) => root.querySelector<T>(selector);
const $$ = <T extends Element>(selector: string, root: ParentNode = document) => [...root.querySelectorAll<T>(selector)];
const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>\"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#39;' }[c] as string));
const money = (n?: number) => n == null ? '—' : `NT$ ${new Intl.NumberFormat('zh-TW').format(Number(n))}`;
const statusText = (s: string) => ({ received:'已收到', preorder:'預購中', pending:'待到貨' } as Record<string,string>)[s] || s || '未設定';
const dateText = (s?: string) => s ? new Date(s).toLocaleDateString('zh-TW') : '—';

function getItemIdParts(item: Item) {
  return parseItemId(item.id);
}

function itemSearchText(item: Item): string {
  const parsed = getItemIdParts(item);
  const idParts = parsed ? [parsed.workCode, parsed.categoryCode, `${parsed.workCode}${parsed.categoryCode}`, String(parsed.sequence).padStart(3, '0')] : [];
  return [item.id, ...idParts, item.title, item.workName, item.category, item.manufacturer, ...(item.characters || []), item.notes].filter(Boolean).join(' ').toLowerCase();
}

function matchesItemQuery(item: Item, query: string): boolean {
  if (!query) return true;
  const normalized = query.trim().toLowerCase();
  const parsed = getItemIdParts(item);
  if (parsed) {
    const exactId = item.id.toLowerCase() === normalized;
    const groupKey = `${parsed.workCode}${parsed.categoryCode}`.toLowerCase();
    const workKey = parsed.workCode.toLowerCase();
    if (exactId || groupKey === normalized || workKey === normalized) return true;
  }
  return itemSearchText(item).includes(normalized);
}

function itemCard(item: Item, compact = false): string {
  const image = item.images?.find((i) => i.isCover) || item.images?.[0];
  const src = image?.url || image?.path || '';
  return `<article class="item-card ${compact ? 'compact':''}" data-item-id="${escapeHtml(item.id)}"><div class="item-media">${src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(image?.alt || item.title)}" loading="lazy" onerror="this.style.display='none';this.parentElement.classList.add('image-fallback')">` : '<span class="image-placeholder">NO IMAGE</span>'}</div><div class="item-body"><div class="item-top"><span class="badge">${escapeHtml(statusText(item.status))}</span><span class="muted">${escapeHtml(item.category || '未分類')}</span></div><h3>${escapeHtml(item.title)}</h3><p class="item-work">${escapeHtml(item.workName || '')}${item.characters?.length ? ` · ${escapeHtml(item.characters.join('、'))}` : ''}</p><div class="item-bottom"><strong>${money(item.purchase?.price)}</strong><span>${escapeHtml(item.manufacturer || '')}</span></div></div></article>`;
}

function renderHome(store: MerchStore) {
  const { items, works } = store.snapshot; const total = items.length;
  const received = items.filter((i) => i.status === 'received').length; const preorder = items.filter((i) => i.status === 'preorder').length; const pending = items.filter((i) => i.status === 'pending' || i.status === 'preorder').length;
  const spending = items.reduce((sum, i) => sum + Number(i.purchase?.price || 0), 0); const now = new Date();
  const month = items.filter((i) => { const d = new Date(i.purchase?.date || ''); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); }).reduce((s, i) => s + Number(i.purchase?.price || 0), 0);
  const set = (key: string, value: string) => { const e = $<HTMLElement>(`[data-home="${key}"]`); if (e) e.textContent = value; };
  set('total', String(total)); set('received', String(received)); set('preorder', String(preorder)); set('pending', String(pending)); set('month', money(month)); set('spending', money(spending));
  const bars = $('#work-bars'); if (bars) bars.innerHTML = works.map((w) => `<div class="bar-row"><span>${escapeHtml(w.name)}</span><div><i style="width:${total ? Math.max(4, w.items.length / total * 100) : 4}%"></i></div><b>${w.items.length}</b></div>`).join('') || '<div class="empty-state">目前沒有資料</div>';
  const recent = $('#recent-items'); if (recent) recent.innerHTML = [...items].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))).slice(0, 4).map((i) => itemCard(i, true)).join('') || '<div class="empty-state">目前沒有收藏</div>';
  $$('.item-card', recent || document).forEach((card) => card.addEventListener('click', () => location.hash = `#/item/${encodeURIComponent(card.getAttribute('data-item-id') || '')}`));
  const rank = $('#character-ranking'); const counts = new Map<string, number>(); items.forEach((i) => (i.characters || []).forEach((c) => counts.set(c, (counts.get(c) || 0) + 1)));
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5); if (rank) rank.innerHTML = top.length ? top.map(([c, n], idx) => `<li><span>${idx + 1}</span><strong>${escapeHtml(c)}</strong><b>${n}</b></li>`).join('') : '<li class="empty-state">目前沒有資料</li>';
}

function renderCollection(store: MerchStore) {
  const host = $('#collection-items'); if (!host) return; const { items, ui } = store.snapshot; const query = ui.collectionQuery.trim().toLowerCase();
  let filtered = items
    .filter((i) => matchesItemQuery(i, query))
    .filter((i) => ui.collectionStatus === 'all' || i.status === ui.collectionStatus)
    .filter((i) => ui.collectionWork === 'all' || getItemIdParts(i)?.workCode === (store.snapshot.works.find((w) => w.id === ui.collectionWork)?.name || ui.collectionWork));
  filtered = [...filtered].sort((a, b) => ui.collectionSort === 'price' ? Number(b.purchase?.price || 0) - Number(a.purchase?.price || 0) : ui.collectionSort === 'title' ? a.title.localeCompare(b.title, 'zh-Hant') : String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  host.innerHTML = filtered.map((i) => itemCard(i)).join('') || '<div class="empty-state wide">沒有符合條件的收藏</div>'; host.classList.toggle('list-mode', ui.collectionView === 'list');
  const count = $('#collection-count'); if (count) count.textContent = `${filtered.length} ITEMS`; $$('.item-card', host).forEach((card) => card.addEventListener('click', () => location.hash = `#/item/${encodeURIComponent(card.getAttribute('data-item-id') || '')}`));
  $$('.view-button').forEach((button) => { const active = button.dataset.view === ui.collectionView; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); });
}

function renderStatistics(store: MerchStore) {
  const { items } = store.snapshot; const total = items.length; const pending = items.filter((i) => i.status !== 'received').length; const spending = items.reduce((s, i) => s + Number(i.purchase?.price || 0), 0);
  const set = (k: string, v: string) => { const e = $<HTMLElement>(`[data-stat="${k}"]`); if (e) e.textContent = v; }; set('total', String(total)); set('pending', String(pending)); set('spending', money(spending));

  const cats = new Map<string, { code: string; name: string; count: number }>();
  items.forEach((item) => {
    const parsed = getItemIdParts(item);
    const code = parsed?.categoryCode || 'o';
    const name = item.category || '其他';
    const current = cats.get(code);
    cats.set(code, { code, name: current?.name || name, count: (current?.count || 0) + 1 });
  });
  const legend = $('#category-list');
  if (legend) legend.innerHTML = [...cats.values()].sort((a, b) => b.count - a.count).map(({ code, name, count }) => `<div><span>${escapeHtml(code)} · ${escapeHtml(name)}</span><b>${count}</b></div>`).join('') || '<div class="empty-state">目前沒有資料</div>';

  const workCounts = new Map<string, number>();
  items.forEach((item) => {
    const code = getItemIdParts(item)?.workCode || item.workName || 'UNKNOWN';
    workCounts.set(code, (workCounts.get(code) || 0) + 1);
  });
  const workStats = $('#work-statistics');
  if (workStats) {
    const max = Math.max(1, ...workCounts.values());
    workStats.innerHTML = [...workCounts.entries()].sort((a, b) => b[1] - a[1]).map(([code, count]) => `<div class="bar-row"><span>${escapeHtml(code)}</span><div><i style="width:${Math.max(4, count / max * 100)}%"></i></div><b>${count}</b></div>`).join('') || '<div class="empty-state">目前沒有資料</div>';
  }
}

let detailModal: HTMLElement | null = null; let detailUnderlyingRoute = 'collection';
function ensureDetailModal() {
  if (detailModal) return detailModal; const modal = document.createElement('div'); modal.className = 'item-detail-modal'; modal.hidden = true;
  modal.innerHTML = `<div class="item-detail-backdrop" data-detail-close></div><section class="item-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="item-detail-title"><button type="button" class="item-detail-close" aria-label="關閉" data-detail-close><i class="fa-solid fa-xmark"></i></button><div class="item-detail-header"><div class="item-detail-image" id="item-detail-image">IMAGE</div><div class="item-detail-heading"><span class="eyebrow">ITEM DETAIL</span><h2 id="item-detail-title"></h2><p id="item-detail-subtitle"></p><div id="item-detail-status"></div></div></div><div class="item-detail-grid"><section><span class="detail-label">基本資訊</span><dl><div><dt>作品</dt><dd id="detail-work"></dd></div><div><dt>角色</dt><dd id="detail-character"></dd></div><div><dt>類型</dt><dd id="detail-type"></dd></div><div><dt>製造商</dt><dd id="detail-manufacturer"></dd></div></dl></section><section><span class="detail-label">購買資訊</span><dl><div><dt>價格</dt><dd id="detail-price"></dd></div><div><dt>平台</dt><dd id="detail-platform"></dd></div><div><dt>購買日期</dt><dd id="detail-purchase-date"></dd></div></dl></section><section><span class="detail-label">發售與到貨</span><dl><div><dt>發售日期</dt><dd id="detail-release-date"></dd></div><div><dt>收到日期</dt><dd id="detail-received-date"></dd></div><div><dt>物流方式</dt><dd id="detail-shipping"></dd></div></dl></section><section><span class="detail-label">售後</span><dl><div><dt>狀態</dt><dd id="detail-after-sales"></dd></div></dl></section></div><section class="item-detail-text"><div><span class="detail-label">商品描述</span><p id="detail-description"></p></div><div><span class="detail-label">備註</span><p id="detail-notes"></p></div></section><div class="item-detail-footer"><span>建立：<b id="detail-created"></b></span><span>更新：<b id="detail-updated"></b></span></div></section>`;
  document.body.appendChild(modal); modal.querySelectorAll('[data-detail-close]').forEach((node) => node.addEventListener('click', closeDetailModal)); document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && detailModal && !detailModal.hidden) closeDetailModal(); }); detailModal = modal; return modal;
}
function setDetailText(modal: HTMLElement, id: string, value: unknown) { const node = modal.querySelector<HTMLElement>(`#${id}`); if (node) node.textContent = value == null || value === '' ? '—' : String(value); }
function closeDetailModal() { if (detailModal) { detailModal.hidden = true; document.body.classList.remove('detail-modal-open'); } const target = `#/${detailUnderlyingRoute}`; if (location.hash !== target) location.hash = target; }
function renderDetail(store: MerchStore, id: string) {
  const modal = ensureDetailModal(); const item = store.snapshot.items.find((i) => i.id === id);
  if (!item) { const dialog = $('.item-detail-dialog', modal); if (dialog) dialog.innerHTML = `<button type="button" class="item-detail-close" aria-label="關閉" data-detail-close><i class="fa-solid fa-xmark"></i></button><div class="item-detail-error"><span class="eyebrow">404 / ITEM</span><h2>找不到收藏</h2><p>這個收藏不存在或已被移除。</p></div>`; dialog?.querySelector('[data-detail-close]')?.addEventListener('click', closeDetailModal); modal.hidden = false; document.body.classList.add('detail-modal-open'); return; }
  const characters = item.characters?.join('、') || '—'; const releaseDate = item.release?.date || item.release?.expectedDate; const shipping = item.shipping?.method || item.shipping?.status; const afterSales = item.afterSales?.status || item.afterSales?.note;
  setDetailText(modal, 'item-detail-title', item.title || '收藏詳細資訊'); setDetailText(modal, 'item-detail-subtitle', `${item.workName || item.series || '—'} · ${characters}`); setDetailText(modal, 'detail-work', item.workName || item.series); setDetailText(modal, 'detail-character', characters); setDetailText(modal, 'detail-type', item.category); setDetailText(modal, 'detail-manufacturer', item.manufacturer); setDetailText(modal, 'detail-price', money(item.purchase?.price)); setDetailText(modal, 'detail-platform', item.purchase?.platform); setDetailText(modal, 'detail-purchase-date', dateText(item.purchase?.date)); setDetailText(modal, 'detail-release-date', dateText(releaseDate)); setDetailText(modal, 'detail-received-date', dateText(item.release?.receivedDate)); setDetailText(modal, 'detail-shipping', shipping); setDetailText(modal, 'detail-after-sales', afterSales); setDetailText(modal, 'detail-description', item.description); setDetailText(modal, 'detail-notes', item.notes); setDetailText(modal, 'detail-created', dateText(item.createdAt)); setDetailText(modal, 'detail-updated', dateText(item.updatedAt));
  const status = $('#item-detail-status', modal); if (status) status.innerHTML = `<span class="badge">${escapeHtml(statusText(item.status))}</span>`; const image = $('#item-detail-image', modal); const cover = item.images?.find((entry) => entry.isCover) || item.images?.[0]; const imageSrc = cover?.url || cover?.path || ''; if (image) image.innerHTML = imageSrc ? `<img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(cover?.alt || item.title || '')}" onerror="this.style.display='none';this.parentElement.classList.add('image-fallback')">` : '<span class="image-placeholder">IMAGE</span>';
  modal.hidden = false; document.body.classList.add('detail-modal-open');
}

function syncCollectionControls(store: MerchStore) { const { ui } = store.snapshot; const search = $('#collection-search') as HTMLInputElement | null; const work = $('#filter-work') as HTMLSelectElement | null; const status = $('#filter-status') as HTMLSelectElement | null; const sort = $('#sort') as HTMLSelectElement | null; if (search) search.value = ui.collectionQuery; if (work) work.value = ui.collectionWork; if (status) status.value = ui.collectionStatus; if (sort) sort.value = ui.collectionSort; }
function setupCollection(store: MerchStore) { const search = $('#collection-search') as HTMLInputElement | null; const work = $('#filter-work') as HTMLSelectElement | null; const status = $('#filter-status') as HTMLSelectElement | null; const sort = $('#sort') as HTMLSelectElement | null; search?.addEventListener('input', () => store.setUi({ collectionQuery: search.value })); work?.addEventListener('change', () => store.setUi({ collectionWork: work.value })); status?.addEventListener('change', () => store.setUi({ collectionStatus: status.value })); sort?.addEventListener('change', () => store.setUi({ collectionSort: sort.value as 'created' | 'title' | 'price' })); $$('.view-button').forEach((button) => button.addEventListener('click', () => store.setUi({ collectionView: button.dataset.view === 'list' ? 'list' : 'cards' }))); }
function setupSidebarToggle() { const sidebar = $('.sidebar') as HTMLElement | null; const button = $('#sidebar-toggle') as HTMLButtonElement | null; if (!sidebar || !button) return; const key = 'chi-merch-sidebar-collapsed'; const setCollapsed = (collapsed: boolean) => { sidebar.classList.toggle('is-collapsed', collapsed); document.body.classList.toggle('sidebar-collapsed', collapsed); button.setAttribute('aria-label', collapsed ? '展開側邊欄' : '收合側邊欄'); button.title = collapsed ? '展開側邊欄' : '收合側邊欄'; button.innerHTML = '<i class="fa-solid fa-grip-lines-vertical" aria-hidden="true"></i>'; try { localStorage.setItem(key, collapsed ? '1' : '0'); } catch {} }; let collapsed = false; try { collapsed = localStorage.getItem(key) === '1'; } catch {} setCollapsed(collapsed); button.addEventListener('click', () => setCollapsed(!sidebar.classList.contains('is-collapsed'))); }

async function boot() {
  setupSidebarToggle(); let visiblePage = 'home'; let storeRef: MerchStore | null = null;
  if (location.hash.startsWith('#/item/')) visiblePage = 'collection';
  const router = createRouter({ onNavigate: (route) => {
    if (route.name === 'item') { detailUnderlyingRoute = visiblePage || 'collection'; if (storeRef) renderDetail(storeRef, route.id); return; }
    if (route.name === 'not-found') { $$('.page').forEach((page) => { const active = page.getAttribute('data-page') === '404'; page.toggleAttribute('hidden', !active); page.classList.toggle('is-active', active); }); if (detailModal) { detailModal.hidden = true; document.body.classList.remove('detail-modal-open'); } return; }
    visiblePage = route.name; if (detailModal) { detailModal.hidden = true; document.body.classList.remove('detail-modal-open'); }
    $$('.page').forEach((page) => { const active = page.getAttribute('data-page') === route.name; page.toggleAttribute('hidden', !active); page.classList.toggle('is-active', active); }); $$('.nav a').forEach((a) => a.classList.toggle('is-active', a.dataset.route === route.name)); const recentSection = $('#recent-section'); if (recentSection) recentSection.toggleAttribute('hidden', route.name !== 'home');
  }});
  try { const store = await loadStore(); storeRef = store; document.documentElement.dataset.dataReady = 'true'; $$('.version').forEach((e) => e.textContent = `v${store.snapshot.version}`); syncCollectionControls(store); renderHome(store); renderCollection(store); renderStatistics(store); setupCollection(store); store.subscribe(() => { renderHome(store); renderCollection(store); renderStatistics(store); }); router.start(); } catch (error) { console.error(error); const e = $('#global-error'); if (e) { e.hidden = false; e.innerHTML = `<strong>資料載入失敗</strong><p>${escapeHtml(error instanceof Error ? error.message : 'Unknown error')}</p>`; } }
}
boot();
