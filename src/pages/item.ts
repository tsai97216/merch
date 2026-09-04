import { store } from '../store.ts';
import { el, formatCurrency, formatDate } from '../utils/dom.ts';

export function renderItem(container: HTMLElement, id: string): void {
  const item = store.findItem(id);
  if (!item) {
    renderMessage(container, '找不到這件收藏。');
    return;
  }

  const work = store.findWork(item.workId);
  const section = el('section', { className: 'page-content' });
  const heading = el('div', { className: 'page-heading' });
  heading.append(el('div', { className: 'eyebrow', text: work?.name ?? item.workId }), el('h2', { text: item.title }));
  section.append(heading);

  const layout = el('div', { className: 'detail-layout' });
  const gallery = el('div', { className: 'gallery' });
  for (const image of item.images) gallery.append(el('img', { attrs: { src: image.url, alt: image.alt || item.title, loading: 'lazy' } }));
  if (!item.images.length) gallery.append(el('div', { className: 'empty-media', text: '尚無圖片' }));

  const panel = el('section', { className: 'panel detail-panel' });
  addField(panel, '狀態', item.status);
  addField(panel, '角色', item.characters.join('、') || '未設定');
  addField(panel, '類別', item.category || '未設定');
  addField(panel, '廠商', item.manufacturer || '未設定');
  addField(panel, '價格', item.purchase.price ? formatCurrency(item.purchase.price, item.purchase.currency) : '未記錄');
  addField(panel, '購買平台', item.purchase.platform || '未設定');
  addField(panel, '購買日期', formatDate(item.purchase.date));
  addField(panel, '預計到貨', formatDate(item.release.expectedDate));
  addField(panel, '實際收到', formatDate(item.release.receivedDate));
  if (item.notes) addField(panel, '備註', item.notes);
  layout.append(gallery, panel);
  section.append(layout);
  container.replaceChildren(section);
}

function addField(panel: HTMLElement, label: string, value: string): void {
  const row = el('div', { className: 'detail-field' });
  row.append(el('span', { className: 'muted', text: label }), el('strong', { text: value }));
  panel.append(row);
}

function renderMessage(container: HTMLElement, message: string): void {
  const section = el('section', { className: 'page-content' });
  section.append(el('div', { className: 'panel', text: message }));
  container.replaceChildren(section);
}
