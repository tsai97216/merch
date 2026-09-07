import './shipping.css';
import { deleteShipping, putShipping } from './api';
import { getStore, type MerchStore } from './store';
import type { Item, ShippingRecord } from './types';
import { escapeHtml, qs } from './utils/dom';
import { showToast } from './utils/toast';

let storeRef: MerchStore | null = null;
let editingId = '';
const money = (n: number, currency: string) => `${currency || 'TWD'} ${new Intl.NumberFormat('zh-TW').format(n)}`;
const items = (): Item[] => storeRef?.snapshot.items ?? [];
const nextId = () => `ship-${Date.now().toString(36)}`;
function render() {
  const root = qs<HTMLElement>('#shipping-root'); if (!root || !storeRef) return;
  const records = storeRef.snapshot.shipping ?? [];
  const selected = records.find(x => x.id === editingId);
  root.innerHTML = `<div class="shipping-layout"><section class="shipping-editor"><div class="panel-heading"><div><span class="panel-label">SHIPPING RECORD</span><h2>${selected ? '編輯運費' : '新增運費'}</h2></div></div><form id="shipping-form"><label>金額<input id="shipping-amount" type="number" min="0" step="0.01" required value="${selected?.amount ?? ''}"></label><label>幣別<input id="shipping-currency" value="${escapeHtml(selected?.currency ?? 'TWD')}" required></label><label>日期<input id="shipping-date" type="date" value="${escapeHtml(selected?.date ?? '')}"></label><label>物流／平台<input id="shipping-carrier" value="${escapeHtml(selected?.carrier ?? '')}"></label><label>備註<textarea id="shipping-note">${escapeHtml(selected?.note ?? '')}</textarea></label><div><strong>關聯周邊</strong><div class="shipping-items">${items().map(item => `<label class="shipping-item"><input type="checkbox" value="${escapeHtml(item.id)}" ${selected?.itemIds.includes(item.id) ? 'checked' : ''}><span>${escapeHtml(item.id)} · ${escapeHtml(item.title)}</span></label>`).join('') || '<span class="muted">目前沒有周邊。</span>'}</div></div><div class="shipping-actions"><button class="button" type="submit">${selected ? '儲存修改' : '新增運費'}</button>${selected ? '<button class="button secondary" type="button" id="shipping-cancel">取消</button>' : ''}</div></form></section><section class="shipping-list"><div class="panel-heading"><div><span class="panel-label">RECORDS</span><h2>運費紀錄</h2></div></div>${records.length ? records.map(record => `<article class="shipping-card"><div><strong>${escapeHtml(money(record.amount, record.currency))}</strong><span>${escapeHtml(record.date || '未填日期')}</span></div><p>${escapeHtml(record.carrier || '未設定物流')}${record.note ? ` · ${escapeHtml(record.note)}` : ''}</p><small>關聯 ${record.itemIds.length} 件周邊</small><div class="shipping-card-actions"><button class="button secondary" type="button" data-shipping-edit="${escapeHtml(record.id)}">編輯</button><button class="button danger" type="button" data-shipping-delete="${escapeHtml(record.id)}">刪除</button></div></article>`).join('') : '<div class="empty-state">目前沒有運費紀錄。</div>'}</section></div>`;
}
async function save(event: Event) {
  event.preventDefault(); if (!storeRef) return;
  const amount = Number(qs<HTMLInputElement>('#shipping-amount')?.value); const currency = qs<HTMLInputElement>('#shipping-currency')?.value.trim() || 'TWD';
  const itemIds = [...document.querySelectorAll<HTMLInputElement>('#shipping-form input[type="checkbox"]:checked')].map(x => x.value);
  if (!Number.isFinite(amount) || amount < 0 || !itemIds.length) { showToast('請輸入有效運費，並至少選擇一個周邊。', 'error'); return; }
  const record: ShippingRecord = { id: editingId || nextId(), amount, currency, date: qs<HTMLInputElement>('#shipping-date')?.value || undefined, carrier: qs<HTMLInputElement>('#shipping-carrier')?.value.trim() || undefined, note: qs<HTMLTextAreaElement>('#shipping-note')?.value.trim() || undefined, itemIds };
  try { await putShipping(record); editingId = ''; showToast('運費紀錄已儲存。', 'success'); } catch (e) { showToast(e instanceof Error ? e.message : '儲存運費失敗。', 'error'); }
}
function bind() {
  const root = qs<HTMLElement>('#shipping-root'); if (!root) return;
  root.addEventListener('submit', save); root.addEventListener('click', async event => { const target = event.target as Element; const edit = target.closest<HTMLElement>('[data-shipping-edit]'); if (edit) { editingId = edit.dataset.shippingEdit || ''; render(); bind(); return; } const del = target.closest<HTMLElement>('[data-shipping-delete]'); if (del && confirm('確定刪除此筆運費紀錄？')) { try { await deleteShipping(del.dataset.shippingDelete || ''); showToast('運費紀錄已刪除。', 'success'); } catch (e) { showToast(e instanceof Error ? e.message : '刪除運費失敗。', 'error'); } } if (target.closest('#shipping-cancel')) { editingId = ''; render(); bind(); } });
}
async function init() { storeRef = await getStore(); storeRef.subscribe(() => { if (!document.querySelector('#shipping-root')) return; render(); bind(); }); render(); bind(); }
void init();
