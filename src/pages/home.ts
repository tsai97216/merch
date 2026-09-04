import { store } from '../store.ts';
import { el, formatCurrency } from '../utils/dom.ts';

export function renderHome(container: HTMLElement): void {
  const { items, works, version } = store.getState();
  const received = items.filter((item) => item.status === 'received').length;
  const pending = items.filter((item) => item.status === 'pending' || item.status === 'preorder').length;
  const total = items.reduce((sum, item) => sum + (item.purchase?.price ?? 0), 0);

  const section = el('section', { className: 'page-content' });
  section.append(
    el('div', { className: 'page-heading' }),
  );
  const heading = section.querySelector('.page-heading')!;
  heading.append(el('div', { className: 'eyebrow', text: 'DASHBOARD' }), el('h2', { text: '收藏總覽' }));

  const grid = el('div', { className: 'stats-grid' });
  for (const [label, value] of [
    ['作品', String(works.length)],
    ['收藏', String(items.length)],
    ['已收到', String(received)],
    ['待到貨', String(pending)],
    ['已記錄金額', formatCurrency(total)],
  ]) {
    const card = el('article', { className: 'stat-card' });
    card.append(el('span', { className: 'stat-label', text: label }), el('strong', { text: value }));
    grid.append(card);
  }
  section.append(grid);

  const latest = el('section', { className: 'panel' });
  latest.append(el('h3', { text: '最近收藏' }));
  const list = el('div', { className: 'simple-list' });
  [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5).forEach((item) => {
    const row = el('a', { className: 'simple-list-row', attrs: { href: `#/item/${encodeURIComponent(item.id)}` } });
    row.append(el('span', { text: item.title }), el('span', { className: 'muted', text: item.status }));
    list.append(row);
  });
  if (items.length === 0) list.append(el('p', { className: 'muted', text: '目前沒有收藏資料。' }));
  latest.append(list);
  section.append(latest);

  if (version) section.append(el('p', { className: 'version-note', text: `資料版本 ${version.version}` }));
  container.replaceChildren(section);
}
