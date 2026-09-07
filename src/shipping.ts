import './shipping.css';
import { getStore, type MerchStore } from './store';
import type { Item, ShippingRecord } from './types';
import { escapeHtml, qs } from './utils/dom';
import { showToast } from './utils/toast';

let storeRef: MerchStore | null = null;
let editingId = '';
let saving = false;

const allItems = (): Item[] => storeRef?.snapshot.items ?? [];
const allRecords = (): ShippingRecord[] => storeRef?.snapshot.shipping ?? [];
const money = (n: number, currency: string) => `${currency || 'TWD'} ${new Intl.NumberFormat('zh-TW').format(n)}`;

function form(): HTMLFormElement | null { return qs<HTMLFormElement>('#shipping-form'); }
function setBusy(busy: boolean): void {
  const root = qs<HTMLElement>('[data-page="shipping"]');
  root?.toggleAttribute('aria-busy', busy);
  root?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement>('input, textarea, button').forEach(el => {
    if (el.id !== 'shipping-cancel' || !busy) el.disabled = busy;
  });
}

function renderItemChoices(selectedIds: string[] = []): void {
  const root = qs<HTMLElement>('#shipping-item-list');
  if (!root) return;
  const items = allItems();
  root.innerHTML = items.length
    ? items.map(item => `<label class="shipping-item"><input type="checkbox" value="${escapeHtml(item.id)}" ${selectedIds.includes(item.id) ? 'checked' : ''}><span>${escapeHtml(item.id)} · ${escapeHtml(item.title)}</span></label>`).join('')
    : '<span class="muted">目前沒有可關聯的周邊。</span>';
}

function resetForm(): void {
  form()?.reset();
  const currency = qs<HTMLInputElement>('#shipping-currency');
  if (currency) currency.value = 'TWD';
  renderItemChoices();
}

function fillForm(record: ShippingRecord | undefined): void {
  const amount = qs<HTMLInputElement>('#shipping-amount');
  const currency = qs<HTMLInputElement>('#shipping-currency');
  const date = qs<HTMLInputElement>('#shipping-date');
  const carrier = qs<HTMLInputElement>('#shipping-carrier');
  const note = qs<HTMLTextAreaElement>('#shipping-note');
  const title = qs<HTMLElement>('#shipping-form-title');
  const submit = qs<HTMLButtonElement>('#shipping-submit');
  const cancel = qs<HTMLButtonElement>('#shipping-cancel');
  if (!amount || !currency || !date || !carrier || !note || !title || !submit || !cancel) return;
  title.textContent = record ? '編輯運費' : '新增運費';
  submit.textContent = record ? '儲存修改' : '新增運費';
  cancel.hidden = !record;
  amount.value = record ? String(record.amount) : '';
  currency.value = record?.currency || 'TWD';
  date.value = record?.date || '';
  carrier.value = record?.carrier || '';
  note.value = record?.note || '';
  renderItemChoices(record?.itemIds || []);
}

function renderRecords(): void {
  const root = qs<HTMLElement>('#shipping-record-list');
  if (!root) return;
  const records = allRecords();
  root.innerHTML = records.length
    ? records.map(record => `<article class="shipping-card" data-shipping-detail="${escapeHtml(record.id)}"><div><strong>${escapeHtml(money(record.amount, record.currency))}</strong><span>${escapeHtml(record.date || '未填日期')}</span></div><p>${escapeHtml(record.carrier || '未設定物流')}${record.note ? ` · ${escapeHtml(record.note)}` : ''}</p><small>關聯 ${record.itemIds.length} 件周邊</small><div class="shipping-card-actions"><button class="button secondary" type="button" data-shipping-edit="${escapeHtml(record.id)}">編輯</button><button class="button danger" type="button" data-shipping-delete="${escapeHtml(record.id)}">刪除</button></div></article>`).join('')
    : '<div class="empty-state">目前沒有運費紀錄。</div>';
}

function renderDetail(record: ShippingRecord): void {
  const shell = qs<HTMLElement>('#shipping-detail');
  const content = qs<HTMLElement>('#shipping-detail-content');
  if (!shell || !content) return;
  const items = allItems().filter(item => record.itemIds.includes(item.id));
  content.innerHTML = `<div class="shipping-detail-grid"><div><span>金額</span><strong>${escapeHtml(money(record.amount, record.currency))}</strong></div><div><span>日期</span><strong>${escapeHtml(record.date || '未填日期')}</strong></div><div><span>物流／平台</span><strong>${escapeHtml(record.carrier || '未設定')}</strong></div><div><span>關聯周邊</span><strong>${record.itemIds.length} 件</strong></div></div>${record.note ? `<div class="shipping-detail-note"><span>備註</span><p>${escapeHtml(record.note)}</p></div>` : ''}<div class="shipping-detail-items"><h3>關聯周邊</h3>${items.length ? `<ul>${items.map(item => `<li><strong>${escapeHtml(item.id)}</strong><span>${escapeHtml(item.title)}</span></li>`).join('')}</ul>` : '<div class="empty-state">關聯的周邊目前不存在。</div>'}</div>`;
  shell.hidden = false;
  document.body.classList.add('shipping-detail-open');
  qs<HTMLElement>('.shipping-detail-dialog', shell)?.focus();
}

function closeDetail(): void {
  const shell = qs<HTMLElement>('#shipping-detail');
  if (shell) shell.hidden = true;
  document.body.classList.remove('shipping-detail-open');
}

function render(): void {
  if (!storeRef) return;
  const selected = allRecords().find(record => record.id === editingId);
  fillForm(selected);
  renderRecords();
  setBusy(saving);
}

async function save(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  if (!storeRef || saving) return;
  const amount = Number(qs<HTMLInputElement>('#shipping-amount')?.value);
  const currency = qs<HTMLInputElement>('#shipping-currency')?.value.trim() || 'TWD';
  const date = qs<HTMLInputElement>('#shipping-date')?.value || undefined;
  const carrier = qs<HTMLInputElement>('#shipping-carrier')?.value.trim() || undefined;
  const note = qs<HTMLTextAreaElement>('#shipping-note')?.value.trim() || undefined;
  const itemIds = [...document.querySelectorAll<HTMLInputElement>('#shipping-item-list input[type="checkbox"]:checked')].map(input => input.value);
  if (!Number.isFinite(amount) || amount < 0) return showToast('請輸入有效的運費金額。', 'error');
  if (!currency) return showToast('請輸入幣別。', 'error');
  if (!itemIds.length) return showToast('請至少選擇一個關聯周邊。', 'error');
  const record: ShippingRecord = { id: editingId || `ship-${Date.now().toString(36)}`, amount, currency, date, carrier, note, itemIds };
  saving = true;
  render();
  try {
    await storeRef.saveShipping(record);
    editingId = '';
    showToast('運費紀錄已儲存。', 'success');
  } catch (error) {
    showToast(error instanceof Error ? error.message : '儲存運費失敗。', 'error');
  } finally {
    saving = false;
    render();
  }
}

async function remove(id: string): Promise<void> {
  if (!storeRef || saving) return;
  saving = true;
  render();
  try {
    await storeRef.deleteShipping(id);
    if (editingId === id) editingId = '';
    showToast('運費紀錄已刪除。', 'success');
  } catch (error) {
    showToast(error instanceof Error ? error.message : '刪除運費失敗。', 'error');
  } finally {
    saving = false;
    render();
  }
}

function bind(): void {
  const root = qs<HTMLElement>('[data-page="shipping"]');
  if (!root) return;
  root.addEventListener('submit', event => { void save(event as SubmitEvent); });
  root.addEventListener('click', event => {
    const target = event.target as Element;
    const close = target.closest<HTMLElement>('[data-shipping-close]');
    if (close) { closeDetail(); return; }
    const edit = target.closest<HTMLElement>('[data-shipping-edit]');
    if (edit && !saving) { editingId = edit.dataset.shippingEdit || ''; render(); return; }
    const del = target.closest<HTMLElement>('[data-shipping-delete]');
    if (del && !saving) { if (confirm('確定刪除此筆運費紀錄？')) void remove(del.dataset.shippingDelete || ''); return; }
    const card = target.closest<HTMLElement>('[data-shipping-detail]');
    if (card && !target.closest('button') && !saving) {
      const record = allRecords().find(item => item.id === card.dataset.shippingDetail);
      if (record) renderDetail(record);
      return;
    }
    if (target.closest('#shipping-cancel') && !saving) { editingId = ''; resetForm(); render(); }
  });
}

async function init(): Promise<void> {
  storeRef = await getStore();
  storeRef.subscribe(() => { if (!saving) render(); });
  render();
  bind();
}

void init();
