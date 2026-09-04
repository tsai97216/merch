import type { AppState, MerchItem } from './types.ts';
import type { Route } from './router.ts';
import { formatDate, toTimestamp } from './utils/date.ts';
import { formatCurrency, formatCount, formatList } from './utils/format.ts';

const STATUS_LABELS: Record<string, string> = { received: '已收到', pending: '待處理', preorder: '預購中' };
const SORT_LABELS: Record<string, string> = {
  'updated-desc': '最近更新', 'updated-asc': '最早更新', 'price-desc': '價格高到低', 'price-asc': '價格低到高', 'title-asc': '名稱 A → Z',
};

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = ''): HTMLElementTagNameMap[K] { const node = document.createElement(tag); if (className) node.className = className; return node; }
function text<K extends keyof HTMLElementTagNameMap>(tag: K, value: string, className = ''): HTMLElementTagNameMap[K] { const node = el(tag, className); node.textContent = value; return node; }
function statusLabel(status: string): string { return STATUS_LABELS[status] ?? (status || '未設定'); }
function statusClass(status: string): string { return status === 'received' || status === '已收到' ? 'received' : status === 'preorder' || status === '預購中' ? 'preorder' : status === 'pending' || status === '待處理' ? 'pending' : ''; }
function formatMoney(item: MerchItem): string { return Number.isFinite(item.purchase.price) ? formatCurrency(item.purchase.price, item.purchase.currency || 'TWD') : '未記錄價格'; }
function cover(item: MerchItem): HTMLDivElement {
  const box = el('div', 'item-cover');
  const image = item.images.find((candidate) => candidate.isCover) ?? item.images[0];
  if (!image) { box.textContent = 'NO IMAGE'; return box; }
  const img = document.createElement('img'); img.src = image.url; img.alt = image.alt || item.title; img.loading = 'lazy';
  img.addEventListener('error', () => box.replaceChildren(text('span', 'IMAGE UNAVAILABLE')), { once: true }); box.append(img); return box;
}
function shell(state: AppState, route: Route, content: HTMLElement): HTMLElement {
  const root = el('div', 'site-shell'); const sidebar = el('aside', 'sidebar');
  const brand = document.createElement('a'); brand.className = 'brand'; brand.href = '#/'; brand.append(text('span', 'CHI', 'brand-mark'));
  const brandCopy = el('span', 'brand-copy'); brandCopy.append(text('strong', '我的收藏'), text('span', 'MERCH COLLECTION')); brand.append(brandCopy); sidebar.append(brand);
  const nav = el('nav', 'nav');
  const links: Array<[Route['name'], string, string]> = [['home', '⌂', '首頁'], ['collection', '▦', '收藏'], ['statistics', '◫', '統計'], ['management', '✎', '管理'], ['settings', '⚙', '設定']];
  for (const [name, icon, label] of links) { const link = document.createElement('a'); link.className = `nav-item${route.name === name ? ' active' : ''}`; link.href = `#/${name}`; link.setAttribute('aria-current', route.name === name ? 'page' : 'false'); link.append(text('span', icon), text('span', label)); nav.append(link); }
  sidebar.append(nav); const footer = el('div', 'sidebar-footer'); footer.append(text('span', 'CHI MERCH'), text('span', state.version ? `v${state.version.version}` : '…')); sidebar.append(footer);
  const main = el('div', 'main'); const header = el('header', 'header'); const headerCopy = el('div'); headerCopy.append(text('p', 'CHI MERCH', 'eyebrow'), text('h1', pageTitle(route)), text('p', pageDescription(route))); header.append(headerCopy);
  if (route.name === 'collection') { const search = el('label', 'header-search'); search.append(text('span', '⌕')); const input = el('input') as HTMLInputElement; input.type = 'search'; input.placeholder = '在收藏中搜尋…'; input.value = state.ui.collection.search; input.dataset.collectionField = 'search'; input.setAttribute('aria-label', '搜尋收藏'); search.append(input); header.append(search); }
  main.append(header); const contentRoot = el('main', 'content'); contentRoot.append(content); main.append(contentRoot); root.append(sidebar, main); return root;
}
function pageTitle(route: Route): string { switch (route.name) { case 'home': return '我的收藏'; case 'collection': return '收藏'; case 'statistics': return '統計'; case 'management': return '管理'; case 'settings': return '設定'; case 'item': return '收藏詳細'; default: return '找不到頁面'; } }
function pageDescription(route: Route): string { switch (route.name) { case 'home': return '收藏管理系統'; case 'collection': return '瀏覽、搜尋與整理目前收藏。'; case 'statistics': return '快速掌握收藏規模與消費。'; case 'management': return '收藏與資料管理入口。'; case 'settings': return '網站與資料連線狀態。'; case 'item': return '查看單件收藏的完整資訊。'; default: return '目前路徑不存在。'; } }
function heading(eyebrow: string, title: string, description = ''): HTMLElement { const wrap = el('div', 'page-heading'); const left = el('div'); left.append(text('p', eyebrow, 'eyebrow'), text('h2', title)); if (description) left.append(text('p', description)); wrap.append(left); return wrap; }
function statCard(label: string, value: string, note: string): HTMLElement { const card = el('article', 'stat-card'); card.append(text('span', label), text('strong', value), text('small', note)); return card; }
function stats(items: MerchItem[]): HTMLElement {
  const grid = el('div', 'stat-grid'); const received = items.filter((i) => statusClass(i.status) === 'received').length; const preorder = items.filter((i) => statusClass(i.status) === 'preorder').length; const pending = items.filter((i) => statusClass(i.status) === 'pending').length;
  const total = items.reduce((sum, i) => sum + (Number.isFinite(i.purchase.price) ? i.purchase.price : 0), 0);
  grid.append(statCard('總收藏', formatCount(items.length), '所有作品'), statCard('已收到', formatCount(received), '已完成到貨'), statCard('預購中', formatCount(preorder), '等待發售'), statCard('待處理', formatCount(pending), '尚未完成'), statCard('已記錄消費', formatCurrency(total), '依資料庫價格計算')); return grid;
}
function itemCard(item: MerchItem, workName: string): HTMLElement {
  const article = el('article', 'item-card'); article.tabIndex = 0; article.dataset.action = 'open-item'; article.dataset.itemId = item.id; article.append(cover(item));
  const body = el('div', 'item-card-body'); const meta = el('div', 'item-meta'); meta.append(text('span', workName, 'item-work'), text('span', statusLabel(item.status), `badge ${statusClass(item.status)}`)); body.append(meta, text('h3', item.title));
  const detail = [formatList(item.characters), item.category, item.manufacturer].filter(Boolean).join(' · '); if (detail) body.append(text('p', detail));
  const bottom = el('div', 'item-bottom'); bottom.append(text('b', formatMoney(item)), text('span', item.release.expectedDate ? `預計 ${formatDate(item.release.expectedDate)}` : '')); body.append(bottom); article.append(body); return article;
}
function itemRow(item: MerchItem, workName: string): HTMLElement {
  const row = el('article', 'item-list-row'); row.tabIndex = 0; row.dataset.action = 'open-item'; row.dataset.itemId = item.id; row.append(cover(item));
  const main = el('div', 'item-list-main'); const meta = el('div', 'item-meta'); meta.append(text('span', workName, 'item-work'), text('span', statusLabel(item.status), `badge ${statusClass(item.status)}`)); main.append(meta, text('h3', item.title)); main.append(text('p', [formatList(item.characters), item.category, item.manufacturer].filter(Boolean).join(' · ')));
  const side = el('div', 'item-list-side'); side.append(text('b', formatMoney(item)), text('span', item.release.expectedDate ? `預計 ${formatDate(item.release.expectedDate)}` : '')); row.append(main, side); return row;
}
function filterItems(items: MerchItem[], ui: AppState['ui']['collection']): MerchItem[] {
  const query = ui.search.trim().toLocaleLowerCase('zh-TW');
  return [...items].filter((item) => { const haystack = [item.title, item.series, item.category, item.manufacturer, item.workId, ...item.characters].join(' ').toLocaleLowerCase('zh-TW'); return (!query || haystack.includes(query)) && (!ui.status || item.status === ui.status) && (!ui.category || item.category === ui.category) && (!ui.character || item.characters.includes(ui.character)) && (!ui.manufacturer || item.manufacturer === ui.manufacturer) && (!ui.workId || item.workId === ui.workId); }).sort((a, b) => {
    switch (ui.sort) { case 'updated-asc': return toTimestamp(a.updatedAt) - toTimestamp(b.updatedAt); case 'price-desc': return b.purchase.price - a.purchase.price; case 'price-asc': return a.purchase.price - b.purchase.price; case 'title-asc': return a.title.localeCompare(b.title, 'zh-Hant'); default: return toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt); }
  });
}
function selectOptions(select: HTMLSelectElement, values: Array<{ value: string; label: string }>, selected: string, allLabel: string): void { select.append(new Option(allLabel, '')); for (const option of values) select.append(new Option(option.label, option.value, false, option.value === selected)); }
function unique(values: string[]): string[] { return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-Hant')); }
function linkButton(label: string, href: string, primary = false): HTMLAnchorElement { const link = document.createElement('a'); link.className = `button${primary ? ' primary' : ''}`; link.href = href; link.textContent = label; return link; }

export function renderHome(state: AppState): HTMLElement {
  const page = el('section', 'page page-content'); const hero = el('section', 'hero'); const copy = el('div'); copy.append(text('p', 'COLLECTION', 'eyebrow'), text('h2', '收藏管理系統')); hero.append(copy, text('p', '把收藏、發售、物流與售後資訊集中在同一個地方。')); page.append(hero, stats(state.items));
  const two = el('div', 'two-column'); const works = el('section', 'panel'); works.append(heading('WORKS', '作品', '目前資料集中的作品。')); const workList = el('div', 'simple-list');
  for (const work of state.works) { const row = document.createElement('a'); row.className = 'simple-list-row'; row.href = '#/collection'; row.addEventListener('click', () => storeWorkFilter(work.id)); row.append(text('span', work.name), text('span', formatCount(state.items.filter((i) => i.workId === work.id).length), 'muted')); workList.append(row); }
  works.append(workList);
  const recent = el('section', 'panel'); recent.append(heading('RECENT', '最近更新')); const recentList = el('div', 'simple-list');
  for (const item of [...state.items].sort((a, b) => toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt)).slice(0, 5)) { const row = document.createElement('a'); row.className = 'simple-list-row'; row.href = `#/item/${encodeURIComponent(item.id)}`; row.append(text('span', item.title), text('span', formatDate(item.updatedAt), 'muted')); recentList.append(row); }
  if (!state.items.length) recentList.append(text('p', '目前沒有收藏資料。', 'empty-copy')); recent.append(recentList); two.append(works, recent); page.append(two);
  const lower = el('div', 'two-column');
  const added = el('section', 'panel'); added.append(heading('RECENTLY ADDED', '最近新增')); const addedList = el('div', 'simple-list');
  for (const item of [...state.items].sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt)).slice(0, 5)) { const row = document.createElement('a'); row.className = 'simple-list-row'; row.href = `#/item/${encodeURIComponent(item.id)}`; row.append(text('span', item.title), text('span', formatDate(item.createdAt), 'muted')); addedList.append(row); }
  if (!state.items.length) addedList.append(text('p', '目前沒有收藏資料。', 'empty-copy')); added.append(addedList);
  const actionPanel = el('section', 'panel'); actionPanel.append(heading('QUICK ACCESS', '快速入口', '常用功能。')); const actions = el('div', 'quick-actions'); actions.append(linkButton('查看全部收藏', '#/collection', true), linkButton('查看統計', '#/statistics'));
  const arriving = state.items.filter((i) => statusClass(i.status) !== 'received' && i.release.expectedDate).sort((a, b) => toTimestamp(a.release.expectedDate) - toTimestamp(b.release.expectedDate)).slice(0, 3);
  if (arriving.length) { const list = el('div', 'simple-list'); list.append(text('p', '即將到貨', 'eyebrow')); for (const item of arriving) { const row = document.createElement('a'); row.className = 'simple-list-row'; row.href = `#/item/${encodeURIComponent(item.id)}`; row.append(text('span', item.title), text('span', formatDate(item.release.expectedDate), 'muted')); list.append(row); } actionPanel.append(list); }
  const pending = state.items.filter((i) => statusClass(i.status) === 'pending'); if (pending.length) { const notice = el('div', 'notice'); notice.append(text('span', '待處理', 'notice-label'), text('span', `${pending.length} 件收藏需要留意。`)); actionPanel.append(notice); }
  lower.append(added, actionPanel); page.append(lower); return shell(state, { name: 'home' }, page);
}

let storeWorkFilter: (workId: string) => void = () => undefined;
export function setHomeWorkFilterHandler(handler: (workId: string) => void): void { storeWorkFilter = handler; }

export function renderCollection(state: AppState): HTMLElement {
  const page = el('section', 'page page-content'); page.append(heading('COLLECTION', '收藏', `共 ${formatCount(state.items.length)}。`)); const panel = el('section', 'panel collection-panel'); const toolbar = el('div', 'toolbar');
  const search = el('input') as HTMLInputElement; search.type = 'search'; search.placeholder = '搜尋標題、角色、作品、廠商…'; search.value = state.ui.collection.search; search.dataset.collectionField = 'search'; toolbar.append(search);
  const works = state.works.map((w) => ({ value: w.id, label: w.name })); const statuses = unique(state.items.map((i) => i.status)).map((v) => ({ value: v, label: statusLabel(v) })); const categories = unique(state.items.map((i) => i.category)).map((v) => ({ value: v, label: v }));
  const work = el('select') as HTMLSelectElement; work.dataset.collectionField = 'workId'; selectOptions(work, works, state.ui.collection.workId, '全部作品'); toolbar.append(work); const status = el('select') as HTMLSelectElement; status.dataset.collectionField = 'status'; selectOptions(status, statuses, state.ui.collection.status, '全部狀態'); toolbar.append(status); const category = el('select') as HTMLSelectElement; category.dataset.collectionField = 'category'; selectOptions(category, categories, state.ui.collection.category, '全部類別'); toolbar.append(category); panel.append(toolbar);
  const secondary = el('div', 'toolbar-secondary'); const chars = el('select') as HTMLSelectElement; chars.dataset.collectionField = 'character'; selectOptions(chars, unique(state.items.flatMap((i) => i.characters)).map((v) => ({ value: v, label: v })), state.ui.collection.character, '全部角色'); secondary.append(chars);
  const manufacturers = el('select') as HTMLSelectElement; manufacturers.dataset.collectionField = 'manufacturer'; selectOptions(manufacturers, unique(state.items.map((i) => i.manufacturer)).map((v) => ({ value: v, label: v })), state.ui.collection.manufacturer, '全部廠商'); secondary.append(manufacturers); const sort = el('select') as HTMLSelectElement; sort.dataset.collectionField = 'sort'; selectOptions(sort, Object.entries(SORT_LABELS).map(([value, label]) => ({ value, label })), state.ui.collection.sort, '排序'); secondary.append(sort);
  const modes = el('div', 'view-toggle'); const cardButton = el('button', state.ui.collection.viewMode === 'card' ? 'button primary' : 'button'); cardButton.type = 'button'; cardButton.dataset.action = 'view-card'; cardButton.textContent = '卡片'; const listButton = el('button', state.ui.collection.viewMode === 'list' ? 'button primary' : 'button'); listButton.type = 'button'; listButton.dataset.action = 'view-list'; listButton.textContent = '清單'; modes.append(cardButton, listButton); secondary.append(modes); panel.append(secondary);
  const filtered = filterItems(state.items, state.ui.collection); const meta = el('div', 'collection-meta'); meta.append(text('span', `${filtered.length} / ${state.items.length} 件`, 'muted'), text('span', state.ui.collection.viewMode === 'card' ? 'CARD VIEW' : 'LIST VIEW')); panel.append(meta); const grid = el('div', state.ui.collection.viewMode === 'card' ? 'collection-grid' : 'collection-list'); const workMap = new Map(state.works.map((w) => [w.id, w.name]));
  for (const item of filtered) grid.append(state.ui.collection.viewMode === 'card' ? itemCard(item, workMap.get(item.workId) ?? item.workId) : itemRow(item, workMap.get(item.workId) ?? item.workId)); if (!filtered.length) grid.append(text('div', '沒有符合條件的收藏。', 'empty-state')); panel.append(grid); page.append(panel); return shell(state, { name: 'collection' }, page);
}

export function renderItem(state: AppState, id: string): HTMLElement {
  const page = el('section', 'page page-content'); const item = state.items.find((candidate) => candidate.id === id);
  if (!item) { page.append(heading('NOT FOUND', '找不到收藏', '這個 Item ID 不存在。')); const back = el('button', 'button primary'); back.type = 'button'; back.dataset.action = 'back-collection'; back.textContent = '返回收藏'; page.append(back); return shell(state, { name: 'item', id }, page); }
  const work = state.works.find((candidate) => candidate.id === item.workId); page.append(heading('ITEM DETAIL', item.title, work?.name ?? item.workId)); const panel = el('section', 'panel detail-panel'); const gallery = el('div', 'detail-gallery');
  for (const image of item.images) { const img = document.createElement('img'); img.src = image.url; img.alt = image.alt || item.title; img.loading = 'lazy'; img.addEventListener('error', () => img.replaceWith(text('div', 'IMAGE UNAVAILABLE', 'image-error')), { once: true }); gallery.append(img); }
  if (!item.images.length) gallery.append(text('div', 'NO IMAGE', 'image-error')); const info = el('div', 'detail-info'); info.append(text('span', statusLabel(item.status), `badge ${statusClass(item.status)}`), text('h3', item.title));
  const fields: Array<[string, string]> = [['作品', work?.name ?? item.workId], ['角色', formatList(item.characters) || '未設定'], ['類別', item.category || '未設定'], ['廠商', item.manufacturer || '未設定'], ['價格', formatMoney(item)], ['購買平台', item.purchase.platform || '未設定'], ['購買日期', formatDate(item.purchase.date)], ['發售日期', formatDate(item.release.date)], ['預計到貨', formatDate(item.release.expectedDate)], ['收到日期', formatDate(item.release.receivedDate)], ['物流', item.shipping.status || '未設定'], ['售後', item.afterSales.status || '無']];
  for (const [label, value] of fields) addField(info, label, value); panel.append(gallery, info); page.append(panel);
  if (item.description || item.notes || item.shipping.note || item.afterSales.note) { const notes = el('section', 'panel'); notes.append(heading('NOTES', '備註')); for (const [label, value] of [['描述', item.description], ['備註', item.notes], ['物流備註', item.shipping.note], ['售後備註', item.afterSales.note]] as const) if (value) addField(notes, label, value); page.append(notes); }
  const back = el('button', 'button'); back.type = 'button'; back.dataset.action = 'back-collection'; back.textContent = '返回收藏'; page.append(back); return shell(state, { name: 'item', id }, page);
}
function addField(parent: HTMLElement, label: string, value: string): void { const row = el('div', 'detail-field'); row.append(text('span', label), text('strong', value)); parent.append(row); }

export function renderStatistics(state: AppState): HTMLElement {
  const page = el('section', 'page page-content'); page.append(heading('STATISTICS', '統計', '快速掌握收藏規模與消費。'), stats(state.items)); const panel = el('section', 'panel'); panel.append(heading('BY WORK', '按作品')); const list = el('div', 'simple-list');
  for (const work of state.works) { const workItems = state.items.filter((i) => i.workId === work.id); const amount = workItems.reduce((sum, i) => sum + (Number.isFinite(i.purchase.price) ? i.purchase.price : 0), 0); const row = el('div', 'simple-list-row'); row.append(text('span', work.name), text('span', `${formatCount(workItems.length)} · ${formatCurrency(amount)}`, 'muted')); list.append(row); }
  panel.append(list); page.append(panel); return shell(state, { name: 'statistics' }, page);
}

export function renderPlaceholder(state: AppState, route: Route): HTMLElement {
  const page = el('section', 'page page-content'); page.append(heading(route.name.toUpperCase(), pageTitle(route), '此區塊已接上新架構，功能依 TODO.md 階段逐步加入。')); const notice = el('div', 'notice'); notice.append(text('span', 'INFO', 'notice-label'), text('span', '目前先保留穩定的頁面入口，不讓未完成的管理功能影響收藏瀏覽。')); page.append(notice);
  if (route.name === 'settings') { const panel = el('section', 'panel'); panel.append(heading('SYSTEM', '系統狀態')); addField(panel, '版本', state.version?.version ?? '未知'); addField(panel, '作品數', formatCount(state.works.length)); addField(panel, '收藏數', formatCount(state.items.length)); page.append(panel); }
  return shell(state, route, page);
}
