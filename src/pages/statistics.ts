import { store } from '../store.ts';
import { el, formatCurrency } from '../utils/dom.ts';

export function renderStatistics(container: HTMLElement): void {
  const { items, works } = store.getState();
  const total = items.reduce((sum, item) => sum + (item.purchase?.price ?? 0), 0);
  const byWork = works.map((work) => ({
    work,
    count: items.filter((item) => item.workId === work.id).length,
    amount: items.filter((item) => item.workId === work.id).reduce((sum, item) => sum + (item.purchase?.price ?? 0), 0),
  }));

  const section = el('section', { className: 'page-content' });
  const heading = el('div', { className: 'page-heading' });
  heading.append(el('div', { className: 'eyebrow', text: 'STATISTICS' }), el('h2', { text: '收藏統計' }));
  section.append(heading);

  const summary = el('div', { className: 'stats-grid' });
  summary.append(
    stat('收藏數', String(items.length)),
    stat('已記錄金額', formatCurrency(total)),
    stat('已收到', String(items.filter((item) => item.status === 'received').length)),
    stat('待到貨／預購', String(items.filter((item) => item.status === 'pending' || item.status === 'preorder').length)),
  );
  section.append(summary);

  const panel = el('section', { className: 'panel' });
  panel.append(el('h3', { text: '依作品' }));
  for (const entry of byWork) {
    const row = el('div', { className: 'metric-row' });
    row.append(el('span', { text: entry.work.name }), el('span', { text: `${entry.count} 件 · ${formatCurrency(entry.amount)}` }));
    panel.append(row);
  }
  section.append(panel);
  container.replaceChildren(section);
}

function stat(label: string, value: string): HTMLElement {
  const card = el('article', { className: 'stat-card' });
  card.append(el('span', { className: 'stat-label', text: label }), el('strong', { text: value }));
  return card;
}
