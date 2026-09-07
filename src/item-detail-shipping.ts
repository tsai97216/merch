import type { Item, ShippingRecord } from './types';
import { escapeHtml } from './utils/dom';
import { openShippingDetail } from './shipping-detail-modal';

export function renderItemDetailShipping(dialog: HTMLElement, item: Item, shipping: ShippingRecord[], items: Item[]): void {
  dialog.querySelector('[data-item-detail-shipping]')?.remove();
  const records = shipping.filter((record) => record.itemIds.includes(item.id));
  if (!records.length) return;

  const section = document.createElement('section');
  section.className = 'item-detail-shipping';
  section.dataset.itemDetailShipping = 'true';
  section.innerHTML = `<span class="detail-label">運費</span><div class="item-detail-shipping-list">${records.map((record) => `<article role="button" tabindex="0" data-item-shipping-detail="${escapeHtml(record.id)}" aria-label="查看運費詳情"><div><strong>${escapeHtml(`${record.currency || 'TWD'} ${new Intl.NumberFormat('zh-TW').format(record.amount)}`)}</strong>${record.date ? `<span>${escapeHtml(record.date)}</span>` : ''}</div>${record.carrier ? `<p>${escapeHtml(record.carrier)}</p>` : ''}${record.note ? `<small>${escapeHtml(record.note)}</small>` : ''}</article>`).join('')}</div>`;

  const grid = dialog.querySelector('.item-detail-grid');
  if (!grid) return;
  grid.appendChild(section);

  const openCard = (card: HTMLElement) => {
    const record = records.find((entry) => entry.id === card.dataset.itemShippingDetail);
    if (record) openShippingDetail(record, items);
  };
  section.addEventListener('click', (event) => {
    const card = (event.target as Element | null)?.closest<HTMLElement>('[data-item-shipping-detail]');
    if (!card || !section.contains(card)) return;
    event.stopPropagation();
    openCard(card);
  });
  section.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = (event.target as Element | null)?.closest<HTMLElement>('[data-item-shipping-detail]');
    if (!card || !section.contains(card)) return;
    event.preventDefault();
    event.stopPropagation();
    openCard(card);
  });
}
