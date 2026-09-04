import { store } from '../store.ts';
import { el, formatCurrency, formatDate } from '../utils/dom.ts';

export function renderCollection(container: HTMLElement): void {
  const { items, works } = store.getState();
  const section = el('section', { className: 'page-content' });
  const heading = el('div', { className: 'page-heading' });
  heading.append(el('div', { className: 'eyebrow', text: 'COLLECTION' }), el('h2', { text: '全部收藏' }));
  section.append(heading);

  const list = el('div', { className: 'item-grid' });
  for (const item of items) {
    const work = works.find((candidate) => candidate.id === item.workId);
    const card = el('a', { className: 'item-card', attrs: { href: `#/item/${encodeURIComponent(item.id)}` } });
    const image = item.images.find((asset) => asset.isCover) ?? item.images[0];
    if (image) card.append(el('img', { className: 'item-cover', attrs: { src: image.url, alt: image.alt || item.title, loading: 'lazy' } }));
    const body = el('div', { className: 'item-card-body' });
    body.append(
      el('span', { className: 'muted', text: work?.name ?? item.workId }),
      el('h3', { text: item.title }),
      el('p', { text: [item.category, item.characters.join('、')].filter(Boolean).join(' · ') || '未分類' }),
      el('strong', { text: item.purchase.price ? formatCurrency(item.purchase.price, item.purchase.currency) : '未記錄價格' }),
      el('span', { className: 'muted', text: `購買 ${formatDate(item.purchase.date)}` }),
    );
    card.append(body);
    list.append(card);
  }
  if (!items.length) list.append(el('p', { className: 'muted', text: '目前沒有收藏資料。' }));
  section.append(list);
  container.replaceChildren(section);
}
