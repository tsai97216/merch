import type { AppState, MerchItem, Work } from './types.ts';
import { navigate, type Route } from './router.ts';

const STATUS_LABELS: Record<string, string> = {
  received: '已收到',
  pending: '待處理',
  preorder: '預購中',
};

const SORT_LABELS: Record<string, string> = {
  'updated-desc': '最近更新',
  'updated-asc': '最早更新',
  'price-desc': '價格高到低',
  'price-asc': '價格低到高',
  'title-asc': '名稱 A → Z',
};

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function text(tag: keyof HTMLElementTagNameMap, value: string, className?: string): HTMLElement {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = value;
  return node;
}

function button(label: string, action: string, className = 'button'): HTMLButtonElement {
  const node = el('button', className);
  node.type = 'button';
  node.dataset.action = action;
  node.textContent = label;
  return node;
}

function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status || '未設定';
}

function statusClass(status: string): string {
  if (status === 'received') return 'received';
  if (status === 'preorder') return 'preorder';
  if (status === 'pending') return 'pending';
  return '';
}

function formatMoney(item: MerchItem): string {
  const { price, currency } = item.purchase;
  if (!price) return '未記錄價格';
  return `${new Intl.NumberFormat('zh-TW').format(price)} ${currency}`;
}

function formatDate(value: string): string {
  if (!value) return '未設定';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

function cover(item: MerchItem): HTMLDivElement {
  const wrapper = el('div', 'item-cover');
  const image = item.images.find((candidate) => candidate.isCover) ?? item.images[0];
  if (!image) {
    wrapper.textContent = 'NO IMAGE';
    return wrapper;
  }
  const img = document.createElement('img');
  img.src = image.url;
  img.alt = image.alt || item.title;
  img.loading = 'lazy';
  img.addEventListener('error', () => {
    wrapper.replaceChildren(text('span', 'IMAGE UNAVAILABLE'));
  }, { once: true });
  wrapper.append(img);
  return wrapper;
}

function itemCard(item: MerchItem, workName: string): HTMLElement {
  const article = el('article', 'item-card');
  article.tabIndex = 0;
  article.dataset.action = 'open-item';
  article.dataset.itemId = item.id;
  article.append(cover(item));

  const body = el('div', 'item-card-body');
  const meta = el('div', 'item-meta');
  meta.append(text('span', workName, 'item-work'));
  meta.append(text('span', statusLabel(item.status), `badge ${statusClass(item.status)}`));
  body.append(meta);
  body.append(text('h3', item.title));
  const detail = [item.characters.join('、'), item.category, item.manufacturer].filter(Boolean).join(' · ');
  if (detail) body.append(text('p', detail));

  const bottom = el('div', 'item-bottom');
  bottom.append(text('b', formatMoney(item)));
  const expected = item.release.expectedDate;
  bottom.append(text('span', expected ? `到貨 ${formatDate(expected)}` : ''));
  body.append(bottom);
  article.append(body);
  return article;
}

function itemList(item: MerchItem, workName: string): HTMLElement {
  const row = el('article', 'item-list-row');
  row.tabIndex = 0;
  row.dataset.action = 'open-item';
  row.dataset.itemId = item.id;
  row.append(cover(item));
  const main = el('div', 'item-list-main');
  const meta = el('div', 'item-meta');
  meta.append(text('span', workName, 'item-work'));
  meta.append(text('span', statusLabel(item.status), `badge ${statusClass(item.status)}`));
  main.append(meta, text('h3', item.title));
  main.append(text('p', [item.characters.join('、'), item.category, item.manufacturer].filter(Boolean).join(' · ')));
  const side = el('div', 'item-list-side');
  side.append(text('b', formatMoney(item)), text('span', item.release.expectedDate ? `預計 ${formatDate(item.release.expectedDate)}` : ''));
  row.append(main, side);
  return row;
}

function shell(state: AppState, route: Route, content: HTMLElement): HTMLElement {
  const root = el('div', 'site-shell');
  const sidebar = el('aside', 'sidebar');
  const brand = document.createElement('a');
  brand.className = 'brand';
  brand.href = '#/home';
  brand.append(text('span', 'CHI', 'brand-mark'));
  const brandCopy = el('span', 'brand-copy');
  brandCopy.append(text('strong', '我的收藏'), text('span', 'MERCH COLLECTION'));
  brand.append(brandCopy);
  sidebar.append(brand);

  const nav = el('nav', 'nav');
  const links: Array<[string, string, string]> = [
    ['home', '⌂', '首頁'], ['collection', '▦', '收藏'], ['statistics', '◫', '統計'],
    ['management', '✎', '管理'], ['settings', '⚙', '設定'],
  ];
  for (const [name, icon, label] of links) {
    const link = document.createElement('a');
    link.className = `nav-item${route.name === name ? ' active' : ''}`;
    link.href = `#/${name}`;
    link.setAttribute('aria-current', route.name === name ? 'page' : 'false');
    link.append(text('span', icon), text('span', label));
    nav.append(link);
  }
  sidebar.append(nav);
  const footer = el('div', 'sidebar-footer');
  footer.append(text('span', 'CHI MERCH'), text('span', state.version ? `v${state.version.version}` : '…'));
  sidebar.append(footer);

  const main = el('div', 'main');
  const header = el('header', 'header');
  const headerCopy = el('div');
  headerCopy.append(text('p', 'CHI MERCH', 'eyebrow'), text('h1', pageTitle(route)), text('p', pageDescription(route)));
  header.append(headerCopy);
  if (route.name === 'collection') {
    const search = el('label', 'header-search');
    search.append(text('span', '⌕'));
    const input = el('input') as HTMLInputElement;
    input.type = 'search'; input.placeholder = '在收藏中搜尋…'; input.value = state.ui.collection.search;
    input.dataset.collectionField = 'search'; input.setAttribute('aria-label', '搜尋收藏');
    search.append(input); header.append(search);
  }
  main.append(header);
  const appMain = el('main', 'content');
  appMain.append(content);
  main.append(appMain);
  root.append(sidebar, main);
  return root;
}

function pageTitle(route: Route): string {
  switch (route.name) {
    case 'home': return '我的收藏';
    case 'collection': return '收藏';
    case 'statistics': return '統計';
    case 'management': return '管理';
    case 'settings': return '設定';
    case 'item': return '收藏詳細';
    default: return '找不到頁面';
  }
}

function pageDescription(route: Route): string {
  switch (route.name) {
    case 'home': return '收藏管理系統';
    case 'collection': return '瀏覽、搜尋與整理目前收藏。';
    case 'statistics': return '快速掌握收藏規模與消費。';
    case 'management': return '收藏與資料管理入口。';
    case 'settings': return '網站與資料連線狀態。';
    case 'item': return '查看單件收藏的完整資訊。';
    default: return '目前路徑不存在。';
  }
}

function heading(eyebrow: string, title: string, description?: string): HTMLElement {
  const wrap = el('div', 'page-heading');
  const left = el('div');
  left.append(text('p', eyebrow, 'eyebrow'), text('h2', title));
  if (description) left.append(text('p', description));
  wrap.append(left);
  return wrap;
}

function stats(items: MerchItem[]): HTMLElement {
  const grid = el('div', 'stat-grid');
  const received = items.filter((item) => item.status === 'received').length;
  const preorder = items.filter((item) => item.status === 'preorder').length;
  const pending = items.filter((item) => item.status === 'pending').length;
  const total = items.reduce((sum, item) => sum + (Number.isFinite(item.purchase.price) ? item.purchase.price : 0), 0);
  for (const [label, value, note] of [
    ['總收藏', String(items.length), '所有作品'],
    ['已收到', String(received), '已完成到貨'],
    ['預購中', String(preorder), '等待發售'],
    ['待到貨', String(pending), `目前 ${pending} 件`],
  ]) {
    const card = el('article', 'stat-card'); card.append(text('span', label), text('strong', value), text('small', note)); grid.append(card);
  }
  const totalCard = el('article', 'stat-card'); totalCard.append(text('span', '已記錄消費'), text('strong', new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(total)), text('small', '以收藏資料中的價格計算')); grid.append(totalCard);
  return grid;
}

export function renderHome(state: AppState): HTMLElement {
  const page = el('section', 'page page-content');
  const hero = el('section', 'hero');
  const copy = el('div'); copy.append(text('p', 'COLLECTION', 'eyebrow'), text('h2', '收藏管理系統'));
  hero.append(copy, text('p', '把收藏、發售、物流與售後資訊集中在同一個地方。'));
  page.append(hero, stats(state.items));

  const two = el('div', 'two-column');
  const worksPanel = el('section', 'panel'); worksPanel.append(heading('WORKS', '作品', '目前資料集中的作品。'));
  const worksList = el('div', 'simple-list');
  for (const work of state.works) {
    const count = state.items.filter((item) => item.workId === work.id).length;
    const row = document.createElement('a'); row.className = 'simple-list-row'; row.href = '#/collection';
    row.append(text('span', work.name), text('span', `${count} 件`, 'muted')); worksList.append(row);
  }
  worksPanel.append(worksList);

  const recentPanel = el('section', 'panel'); recentPanel.append(heading('RECENT', '最近更新'));
  const recent = [...state.items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);
  const recentList = el('div', 'simple-list');
  for (const item of recent) {
    const row = document.createElement('a'); row.className = 'simple-list-row'; row.href = `#/item/${encodeURIComponent(item.id)}`;
    row.append(text('span', item.title), text('span', formatDate(item.updatedAt), 'muted')); recentList.append(row);
  }
  if (!recent.length) recentList.append(text('p', '目前還沒有收藏資料。', 'empty-copy'));
  recentPanel.append(recentList);
  two.append(worksPanel, recentPanel); page.append(two);
  return shell(state, { name: 'home' }, page);
}

function selectOptions(select: HTMLSelectElement, options: string[], selected: string, allLabel = '全部'): void {
  select.append(new Option(allLabel, ''));
  for (const option of options) select.append(new Option(option, option, false, option === selected));
}

export function renderCollection(state: AppState): HTMLElement {
  const page = el('section', 'page page-content');
  page.append(heading('COLLECTION', '收藏', `共 ${state.items.length} 件收藏。`));
  const panel = el('section', 'panel collection-panel');
  const toolbar = el('div', 'toolbar');
  const search = el('input') as HTMLInputElement; search.type = 'search'; search.placeholder = '搜尋標題、角色、作品、廠商…'; search.value = state.ui.collection.search; search.dataset.collectionField = 'search'; toolbar.append(search);
  const status = el('select') as HTMLSelectElement; status.dataset.collectionField = 'status'; selectOptions(status, [...new Set(state.items.map((item) => item.status))], state.ui.collection.status, '全部狀態'); toolbar.append(status);
  const work = el('select') as HTMLSelectElement; work.dataset.collectionField = 'workId'; selectOptions(work, state.works.map((item) => item.name), state.works.find((item) => item.id === state.ui.collection.workId)?.name ?? '', '全部作品');
  for (const option of Array.from(work.options)) {
    const target = state.works.find((candidate) => candidate.name === option.value);
    if (target) option.value = target.id;
  }
  toolbar.append(work);
  const category = el('select') as HTMLSelectElement; category.dataset.collectionField = 'category'; selectOptions(category, [...new Set(state.items.map((item) => item.category).filter(Boolean))].sort(), state.ui.collection.category, '全部類別'); toolbar.append(category);
  panel.append(toolbar);

  const second = el('div', 'toolbar-secondary');
  const character = el('select') as HTMLSelectElement; character.dataset.collectionField = 'character'; selectOptions(character, [...new Set(state.items.flatMap((item) => item.characters))].sort(), state.ui.collection.character, '全部角色'); second.append(character);
  const manufacturer = el('select') as HTMLSelectElement; manufacturer.dataset.collectionField = 'manufacturer'; selectOptions(manufacturer, [...new Set(state.items.map((item) => item.manufacturer).filter(Boolean))].sort(), state.ui.collection.manufacturer, '全部廠商'); second.append(manufacturer);
  const sort = el('select') as HTMLSelectElement; sort.dataset.collectionField = 'sort'; selectOptions(sort, Object.keys(SORT_LABELS).map((key) => SORT_LABELS[key]), SORT_LABELS[state.ui.collection.sort] ?? '', '排序');
  for (const option of Array.from(sort.options)) { const key = Object.entries(SORT_LABELS).find(([, label]) => label === option.value)?.[0]; if (key) option.value = key; }
  second.append(sort);
  const modes = el('div', 'view-toggle'); modes.append(button('卡片', 'view-card', state.ui.collection.viewMode === 'card' ? 'button primary' : 'button'), button('清單', 'view-list', state.ui.collection.viewMode === 'list' ? 'button primary' : 'button')); second.append(modes);
  panel.append(second);

  const filtered = filterItems(state.items, state.ui.collection);
  const meta = el('div', 'collection-meta'); meta.append(text('span', `${filtered.length} / ${state.items.length} 件`), text('span', state.ui.collection.viewMode === 'card' ? 'CARD VIEW' : 'LIST VIEW')); panel.append(meta);
  const grid = el('div', state.ui.collection.viewMode === 'card' ? 'collection-grid' : 'collection-list');
  const workMap = new Map(state.works.map((item) => [item.id, item.name]));
  for (const item of filtered) grid.append(state.ui.collection.viewMode === 'card' ? itemCard(item, workMap.get(item.workId) ?? item.workId) : itemList(item, workMap.get(item.workId) ?? item.workId));
  if (!filtered.length) grid.append(text('div', '沒有符合條件的收藏。', 'empty-state'));
  panel.append(grid); page.append(panel);
  return shell(state, { name: 'collection' }, page);
}

function filterItems(items: MerchItem[], ui: AppState['ui']['collection']): MerchItem[] {
  const query = ui.search.trim().toLocaleLowerCase('zh-TW');
  const filtered = items.filter((item) => {
    const haystack = [item.title, item.series, item.category, item.manufacturer, item.workId, ...item.characters].join(' ').toLocaleLowerCase('zh-TW');
    return (!query || haystack.includes(query)) && (!ui.status || item.status === ui.status) && (!ui.category || item.category === ui.category) && (!ui.character || item.characters.includes(ui.character)) && (!ui.manufacturer || item.manufacturer === ui.manufacturer) && (!ui.workId || item.workId === ui.workId);
  });
  return filtered.sort((a, b) => {
    switch (ui.sort) {
      case 'updated-asc': return a.updatedAt.localeCompare(b.updatedAt);
      case 'price-desc': return b.purchase.price - a.purchase.price;
      case 'price-asc': return a.purchase.price - b.purchase.price;
      case 'title-asc': return a.title.localeCompare(b.title, 'zh-Hant');
      default: return b.updatedAt.localeCompare(a.updatedAt);
    }
  });
}

export function renderItem(state: AppState, id: string): HTMLElement {
  const item = state.items.find((candidate) => candidate.id === id);
  const page = el('section', 'page page-content');
  if (!item) {
    page.append(heading('NOT FOUND', '找不到收藏', '這個 Item ID 不存在。'), button('返回收藏', 'back-collection', 'button primary'));
    return shell(state, { name: 'item', id }, page);
  }
  const work = state.works.find((candidate) => candidate.id === item.workId);
  page.append(heading('ITEM DETAIL', item.title, work?.name));
  const panel = el('section', 'panel detail-panel');
  const gallery = el('div', 'detail-gallery');
  for (const image of item.images) {
    const img = document.createElement('img'); img.src = image.url; img.alt = image.alt || item.title; img.loading = 'lazy';
    img.addEventListener('error', () => img.replaceWith(text('div', 'IMAGE UNAVAILABLE', 'image-error')), { once: true }); gallery.append(img);
  }
  if (!item.images.length) gallery.append(text('div', 'NO IMAGE', 'image-error'));
  const info = el('div', 'detail-info');
  info.append(text('span', statusLabel(item.status), `badge ${statusClass(item.status)}`), text('h3', item.title));
  addField(info, '作品', work?.name ?? item.workId); addField(info, '角色', item.characters.join('、') || '未設定'); addField(info, '類別', item.category || '未設定'); addField(info, '廠商', item.manufacturer || '未設定'); addField(info, '價格', formatMoney(item)); addField(info, '購買平台', item.purchase.platform || '未設定'); addField(info, '購買日期', formatDate(item.purchase.date)); addField(info, '發售日期', formatDate(item.release.date)); addField(info, '預計到貨', formatDate(item.release.expectedDate)); addField(info, '收到日期', formatDate(item.release.receivedDate)); addField(info, '物流', item.shipping.status || '未設定'); addField(info, '售後', item.afterSales.status || '無');
  panel.append(gallery, info); page.append(panel);
  if (item.description || item.notes || item.shipping.note || item.afterSales.note) {
    const notes = el('section', 'panel'); notes.append(heading('NOTES', '備註'));
    for (const [label, value] of [['描述', item.description], ['備註', item.notes], ['物流備註', item.shipping.note], ['售後備註', item.afterSales.note]] as const) if (value) addField(notes, label, value);
    page.append(notes);
  }
  page.append(button('返回收藏', 'back-collection'));
  return shell(state, { name: 'item', id }, page);
}

function addField(parent: HTMLElement, label: string, value: string): void {
  const field = el('div', 'detail-field'); field.append(text('span', label), text('strong', value)); parent.append(field);
}

export function renderStatistics(state: AppState): HTMLElement {
  const page = el('section', 'page page-content'); page.append(heading('STATISTICS', '統計', '先提供穩定的核心數據，圖表與更細緻的分析後續再加入。'), stats(state.items));
  const panel = el('section', 'panel'); panel.append(heading('BY WORK', '按作品')); const list = el('div', 'simple-list');
  for (const work of state.works) { const count = state.items.filter((item) => item.workId === work.id).length; const row = el('div', 'simple-list-row'); row.append(text('span', work.name), text('span', `${count} 件`, 'muted')); list.append(row); }
  panel.append(list); page.append(panel); return shell(state, { name: 'statistics' }, page);
}

export function renderPlaceholder(state: AppState, route: Route): HTMLElement {
  const page = el('section', 'page page-content'); page.append(heading(route.name.toUpperCase(), pageTitle(route), '此區塊已接上新架構，功能依 TODO.md 階段逐步加入。'));
  const notice = el('div', 'notice'); notice.append(text('span', 'INFO', 'notice-label'), text('span', '目前先保留穩定的頁面入口，不會讓未完成的管理功能影響收藏瀏覽。')); page.append(notice);
  if (route.name === 'settings') {
    const panel = el('section', 'panel'); panel.append(heading('SYSTEM', '系統狀態')); addField(panel, '版本', state.version?.version ?? '未知'); addField(panel, '作品數', String(state.works.length)); addField(panel, '收藏數', String(state.items.length)); page.append(panel);
  }
  return shell(state, route, page);
}
