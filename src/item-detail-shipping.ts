import type { ShippingRecord } from './types';
import { getStore } from './store';
import { escapeHtml } from './utils/dom';
import './item-detail-shipping.css';
import './shipping.css';

let shippingRecords: ShippingRecord[] = [];
let storeItems: Array<{ id: string; title: string }> = [];

function money(record: ShippingRecord): string {
  return `${record.currency || 'TWD'} ${new Intl.NumberFormat('zh-TW').format(record.amount)}`;
}

function openShippingDetail(record: ShippingRecord): void {
  const items = record.itemIds
    .map((id) => storeItems.find((item) => item.id === id))
    .filter((item): item is { id: string; title: string } => Boolean(item));
  const modal = document.createElement('div');
  modal.className = 'shipping-detail';
  modal.innerHTML = `<div class="shipping-detail-backdrop" data-shipping-close></div><section class="shipping-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="item-shipping-detail-title" tabindex="-1"><header class="panel-heading"><div><span class="panel-label">SHIPPING DETAIL</span><h2 id="item-shipping-detail-title">運費詳情</h2></div><button type="button" class="button secondary" data-shipping-close>關閉</button></header><div class="shipping-detail-grid"><div><span>金額</span><strong>${escapeHtml(money(record))}</strong></div><div><span>日期</span><strong>${escapeHtml(record.date || '未填日期')}</strong></div><div><span>物流／平台</span><strong>${escapeHtml(record.carrier || '未設定')}</strong></div><div><span>關聯周邊</span><strong>${record.itemIds.length} 件</strong></div></div>${record.note ? `<div class="shipping-detail-note"><span>備註</span><p>${escapeHtml(record.note)}</p></div>` : ''}<div class="shipping-detail-items"><h3>關聯周邊</h3>${items.length ? `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.id)}</strong><span>${escapeHtml(item.title)}</span></li>`).join('')}</ul>` : '<div class="empty-state">關聯的周邊目前不存在。</div>'}</div></section>`;
  document.body.appendChild(modal);
  document.body.classList.add('shipping-detail-open');
  const close = () => {
    modal.remove();
    document.body.classList.remove('shipping-detail-open');
  };
  modal.querySelectorAll<HTMLElement>('[data-shipping-close]').forEach((node) => node.addEventListener('click', close));
  modal.querySelector<HTMLElement>('.shipping-detail-dialog')?.focus();
}

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
  section.innerHTML = `<span class="detail-label">運費</span><div class="item-detail-shipping-list">${records.map((record) => `<article role="button" tabindex="0" data-item-shipping-detail="${escapeHtml(record.id)}" aria-label="查看運費詳情"><div><strong>${escapeHtml(money(record))}</strong>${record.date ? `<span>${escapeHtml(record.date)}</span>` : ''}</div>${record.carrier ? `<p>${escapeHtml(record.carrier)}</p>` : ''}${record.note ? `<small>${escapeHtml(record.note)}</small>` : ''}</article>`).join('')}</div>`;
  const grid = dialog.querySelector('.item-detail-grid');
  if (grid) grid.appendChild(section);
  section.querySelectorAll<HTMLElement>('[data-item-shipping-detail]').forEach((card) => {
    const open = () => {
      const record = shippingRecords.find((entry) => entry.id === card.dataset.itemShippingDetail);
      if (record) openShippingDetail(record);
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      open();
    });
  });
}

function scheduleRender(): void {
  window.setTimeout(render, 0);
}

window.addEventListener('hashchange', scheduleRender);

void getStore().then((store) => {
  shippingRecords = store.snapshot.shipping ?? [];
  storeItems = store.snapshot.items.map((item) => ({ id: item.id, title: item.title }));
  store.subscribe((state) => {
    shippingRecords = state.shipping ?? [];
    storeItems = state.items.map((item) => ({ id: item.id, title: item.title }));
    scheduleRender();
  });
  scheduleRender();
}).catch(() => {
  shippingRecords = [];
  storeItems = [];
});
