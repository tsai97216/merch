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
function workBars(state: AppState): HTMLElement {
  const bars = el('div', 'bars'); const counts = state.works.map((work) => ({ name: work.name, count: state.items.filter((item) => item.workId === work.id).length })); const max = Math.max(1, ...counts.map((entry) => entry.count));
  for (const entry of counts) { const row = el('div', 'bar-row'); const line = el('div'); line.append(text('span', entry.name), text('b', formatCount(entry.count))); const bar = el('i'); bar.style.width = `${Math.max(4, entry.count / max * 100)}%`; row.append(line, bar); bars.append(row); }
  if (!counts.length) bars.append(text('p', '目前沒有作品資料。', 'empty-copy')); return bars;
}
function characterRanking(state: AppState): HTMLElement {
  const counts = new Map<string, number>(); for (const item of state.items) for (const character of item.characters) counts.set(character, (counts.get(character) ?? 0) + 1);
  const ranking = el('ol', 'ranking'); const entries = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hant')).slice(0, 5);
  entries.forEach(([name, count], index) => { const row = el('li'); row.append(text('span', String(index + 1).padStart(2, '0')), text('strong', name), text('b', formatCount(count))); ranking.append(row); });
  if (!entries.length) ranking.append(text('li', '目前沒有角色資料。', 'empty-copy')); return ranking;
}

export function renderHome(state: AppState): HTMLElement {
  const page = el('section', 'page page-content'); const hero = el('section', 'hero'); const copy = el('div'); copy.append(text('p', 'COLLECTION', 'eyebrow'), text('h2', '我的收藏')); const accent = text('span', 'Collection.'); accent.className = 'home-hero-accent'; copy.querySelector('h2')?.append(document.createElement('br'), accent); hero.append(copy, text('p', '收藏資料庫的總覽入口。\n資料會在載入後由收藏資料庫填入。')); page.append(hero, homeStats(state.items));
  const two = el('div', 'two-column'); const works = el('section', 'panel'); works.append((() => { const h = heading('BY WORK', '作品分布'); return h; })(), workBars(state));
  const rankingPanel = el('section', 'panel'); rankingPanel.append(heading('CHARACTERS', '角色排行'), characterRanking(state)); two.append(works, rankingPanel); page.append(two);
  const recent = el('section', 'section'); const recentHeading = el('div', 'section-heading'); const recentLeft = el('div'); recentLeft.append(text('p', 'RECENT', 'panel-label'), text('h3', '最近收藏')); recentHeading.append(recentLeft, (() => { const link = document.createElement('a'); link.href = '#/collection'; link.textContent = '查看全部  →'; return link; })()); recent.append(recentHeading);
  const recentGrid = el('div', 'card-grid'); const workMap = new Map(state.works.map((work) => [work.id, work.name]));
  for (const item of [...state.items].sort((a, b) => toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt)).slice(0, 4)) recentGrid.append(itemCard(item, workMap.get(item.workId) ?? item.workId));
  if (!state.items.length) recentGrid.append(text('div', '目前沒有收藏資料。', 'empty-state')); recent.append(recentGrid); page.append(recent);
  return shell(state, { name: 'home' }, page);
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
