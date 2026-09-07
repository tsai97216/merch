import type { ShippingRecord } from './types';
import { getStore } from './store';
import { escapeHtml } from './utils/dom';
import './item-detail-shipping.css';

let shippingRecords: ShippingRecord[] = [];

function render(): void {
  const dialog = document.querySelector<HTMLElement>('.item-detail-modal:not([hidden]) .item-detail-dialog[data-detail-item-id]');
  if (!dialog) return;
  const itemId = dialog.dataset.detailItemId || '';
  const records = shippingRecords.filter((record) => record.itemIds.includes(itemId));
  dialog.querySelector('[data-item-detail-shipping]')?.remove();
  if (!records.length) return;
  const section = document.createElement('section');
  section.className = 'item-detail-shipping';
  section.dataset.itemDetailShipping = 'true';
  section.innerHTML = `<span class="detail-label">運費</span><div class="item-detail-shipping-list">${records.map((record) => `<article><div><strong>${escapeHtml(`${record.currency || 'TWD'} ${new Intl.NumberFormat('zh-TW').format(record.amount)}`)}</strong>${record.date ? `<span>${escapeHtml(record.date)}</span>` : ''}</div>${record.carrier ? `<p>${escapeHtml(record.carrier)}</p>` : ''}${record.note ? `<small>${escapeHtml(record.note)}</small>` : ''}</article>`).join('')}</div>`;
  const grid = dialog.querySelector('.item-detail-grid');
  if (grid) grid.appendChild(section);
}

function scheduleRender(): void {
  window.setTimeout(render, 0);
}

window.addEventListener('hashchange', scheduleRender);

void getStore().then((store) => {
  shippingRecords = store.snapshot.shipping ?? [];
  store.subscribe((state) => {
    shippingRecords = state.shipping ?? [];
    scheduleRender();
  });
  scheduleRender();
}).catch(() => {
  shippingRecords = [];
});
