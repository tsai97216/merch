import './toast.css';
import { getStore, type MerchStore } from './store';
import type { Item } from './types';
import { escapeHtml, qs } from './utils/dom';
import { showToast } from './utils/toast';

let storeRef: MerchStore | null = null;
let unsubscribe: (() => void) | null = null;
let selectedId = '';
let pickerWork = '';
let pickerCategory = '';
let pickerSerial = '';
let searchQuery = '';

const fields: Record<string, (item: Item) => string> = {
  'management-item-id': x => x.id,
  'management-work': x => x.workName ?? '',
  'management-title': x => x.title,
  'management-series': x => x.series ?? '',
  'management-characters': x => (x.characters ?? []).join(', '),
  'management-category': x => x.category ?? '',
  'management-manufacturer': x => x.manufacturer ?? '',
  'management-quantity': x => String(x.quantity),
  'management-status': x => x.status,
  'management-description': x => x.description ?? '',
  'management-notes': x => x.notes ?? '',
  'management-price': x => x.purchase?.price == null ? '' : String(x.purchase.price),
  'management-currency': x => x.purchase?.currency ?? 'TWD',
  'management-platform': x => x.purchase?.platform ?? '',
  'management-purchase-date': x => x.purchase?.date ?? '',
  'management-purchase-url': x => x.purchase?.url ?? '',
  'management-order-id': x => x.purchase?.orderId ?? '',
  'management-release-date': x => x.release?.date ?? '',
  'management-expected-date': x => x.release?.expectedDate ?? '',
  'management-received-date': x => x.release?.receivedDate ?? '',
  'management-shipping-status': x => x.shipping?.status ?? '',
  'management-shipping-method': x => x.shipping?.method ?? '',
  'management-shipping-note': x => x.shipping?.note ?? '',
  'management-after-sales-status': x => x.afterSales?.status ?? '',
  'management-after-sales-note': x => x.afterSales?.note ?? '',
  'management-after-sales-updated': x => x.afterSales?.updatedAt ?? '',
  'management-created-at': x => x.createdAt ?? '',
  'management-updated-at': x => x.updatedAt ?? '',
};

const get = (id: string) => (qs<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`#${id}`)?.value ?? '').trim();
const allItems = (): Item[] => storeRef?.snapshot.items ?? [];
function workOf(item: Item): string { return item.workName ?? ''; }
function categoryOf(item: Item): string { return item.category ?? '未分類'; }
function serialOf(item: Item): string { return item.id.match(/(\d+)$/)?.[1] ?? ''; }
function pickerValue(item: Item): string { return `${item.id} · ${item.title}`; }
function sortText(a: string, b: string): number { return a.localeCompare(b, 'zh-Hant', { numeric: true }); }
function unique(values: string[]): string[] { return [...new Set(values.filter(Boolean))].sort(sortText); }

function fill(item: Item): void {
  selectedId = item.id;
  pickerWork = workOf(item);
  pickerCategory = categoryOf(item);
  pickerSerial = serialOf(item);
  Object.entries(fields).forEach(([id, read]) => {
    const el = qs<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`#${id}`);
    if (el) el.value = read(item);
  });
}

function searchItems(): Item[] {
  const query = searchQuery.trim().toLocaleLowerCase();
  if (!query) return [];
  return allItems().filter(item => [item.id, item.title, workOf(item), categoryOf(item), item.series, item.manufacturer, ...(item.characters ?? [])].filter(Boolean).join(' ').toLocaleLowerCase().includes(query)).slice(0, 30);
}
function pickerItems(): Item[] { return allItems().filter(item => workOf(item) === pickerWork && categoryOf(item) === pickerCategory); }
function renderSearchResults(): void {
  const results = searchItems();
  const datalist = qs<HTMLDataListElement>('#management-search-options');
  if (datalist) datalist.innerHTML = results.map(x => `<option value="${escapeHtml(pickerValue(x))}"></option>`).join('');
  const count = qs<HTMLElement>('#management-search-count');
  if (count) count.textContent = searchQuery ? `找到 ${results.length} 筆` : `共 ${allItems().length} 筆收藏`;
}

function readFormItem(base: Item): Item {
  const characters = get('management-characters').split(',').map(x => x.trim()).filter(Boolean);
  const priceText = get('management-price');
  const purchase = { ...(base.purchase ?? {}), price: priceText ? Number(priceText) : undefined, currency: get('management-currency') || undefined, platform: get('management-platform') || undefined, date: get('management-purchase-date') || undefined, url: get('management-purchase-url') || undefined, orderId: get('management-order-id') || undefined };
  const release = { ...(base.release ?? {}), date: get('management-release-date') || undefined, expectedDate: get('management-expected-date') || undefined, receivedDate: get('management-received-date') || undefined };
  const shipping = { ...(base.shipping ?? {}), status: get('management-shipping-status') || undefined, method: get('management-shipping-method') || undefined, note: get('management-shipping-note') || undefined };
  const afterSales = { ...(base.afterSales ?? {}), status: get('management-after-sales-status') || undefined, note: get('management-after-sales-note') || undefined, updatedAt: get('management-after-sales-updated') || undefined };
  return { ...base, title: get('management-title'), series: get('management-series') || undefined, characters: characters.length ? characters : undefined, category: get('management-category') || undefined, manufacturer: get('management-manufacturer') || undefined, quantity: Number(get('management-quantity')), status: get('management-status') || 'pending', description: get('management-description') || undefined, notes: get('management-notes') || undefined, purchase, release, shipping, afterSales, updatedAt: new Date().toISOString() };
}

function validateItem(item: Item): string[] {
  const errors: string[] = [];
  if (!item.title.trim()) errors.push('標題為必填欄位。');
  if (!Number.isInteger(item.quantity) || item.quantity < 1) errors.push('數量必須是大於等於 1 的整數。');
  if (item.purchase?.price !== undefined && (!Number.isFinite(item.purchase.price) || item.purchase.price < 0)) errors.push('價格必須是大於等於 0 的數字。');
  if (item.purchase?.url) { try { new URL(item.purchase.url); } catch { errors.push('商品網址格式無效。'); } }
  return errors;
}

function render(): void {
  const root = qs<HTMLElement>('#management-root');
  if (!root || !storeRef) return;
  const items = allItems();
  const current = items.find(x => x.id === selectedId) ?? items[0];
  if (current && !items.some(x => x.id === selectedId)) selectedId = current.id;
  const works = unique(items.map(workOf));
  if (!pickerWork || !works.includes(pickerWork)) pickerWork = workOf(current ?? items[0]);
  const categories = unique(items.filter(x => workOf(x) === pickerWork).map(categoryOf));
  if (!pickerCategory || !categories.includes(pickerCategory)) pickerCategory = categories[0] ?? '';
  const matching = pickerItems();
  if (!pickerSerial || !matching.some(x => serialOf(x) === pickerSerial)) pickerSerial = serialOf(matching[0]) || '';
  const selectedPickerItem = matching.find(x => serialOf(x) === pickerSerial) ?? current;
  if (selectedPickerItem) selectedId = selectedPickerItem.id;
  const formItem = selectedPickerItem ?? current;
  const searchResults = searchItems();
  const workOptions = works.map(x => `<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join('');
  const categoryOptions = categories.map(x => `<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join('');
  const serialOptions = matching.map(x => `<option value="${escapeHtml(serialOf(x))}">${escapeHtml(serialOf(x).padStart(3, '0'))} · ${escapeHtml(x.title)}</option>`).join('');
  const searchOptions = searchResults.map(x => `<option value="${escapeHtml(pickerValue(x))}"></option>`).join('');
  root.innerHTML = `<div class="management-toolbar"><div class="management-picker-grid"><label class="field compact"><span>作品</span><select id="management-picker-work" aria-label="選擇作品">${workOptions}</select></label><label class="field compact"><span>周邊類型</span><select id="management-picker-category" aria-label="選擇周邊類型">${categoryOptions}</select></label><label class="field compact"><span>流水號</span><select id="management-picker-serial" aria-label="選擇流水號">${serialOptions}</select></label></div><div class="management-search-row"><label class="field compact management-search-field"><span>搜尋</span><input id="management-item-search" list="management-search-options" autocomplete="off" placeholder="搜尋 ID、名稱、角色、類型…" aria-label="搜尋收藏"><datalist id="management-search-options">${searchOptions}</datalist></label><span id="management-search-count" class="management-search-count">${searchQuery ? `找到 ${searchResults.length} 筆` : `共 ${items.length} 筆收藏`}</span></div><div class="management-selected">${formItem ? `目前：<strong>${escapeHtml(pickerValue(formItem))}</strong>` : '尚未選擇收藏'}</div></div><form id="management-form" class="management-form" novalidate><div class="form-section"><h3>基本資訊</h3><div class="form-grid"><label class="field"><span>Item ID *</span><input id="management-item-id" readonly></label><label class="field"><span>作品</span><input id="management-work" readonly></label><label class="field"><span>標題 *</span><input id="management-title" required></label><label class="field"><span>系列</span><input id="management-series"></label><label class="field"><span>角色</span><input id="management-characters" placeholder="以逗號分隔"></label><label class="field"><span>類別</span><input id="management-category"></label><label class="field"><span>廠商</span><input id="management-manufacturer"></label><label class="field"><span>數量 *</span><input id="management-quantity" type="number" min="1" step="1" required></label><label class="field"><span>狀態 *</span><select id="management-status"><option value="received">已收到</option><option value="preorder">預購中</option><option value="pending">待到貨</option></select></label></div></div><div class="form-section"><h3>說明</h3><div class="form-grid single"><label class="field"><span>描述</span><textarea id="management-description" rows="3"></textarea></label><label class="field"><span>備註</span><textarea id="management-notes" rows="3"></textarea></label></div></div><div class="form-section"><h3>購買資訊</h3><div class="form-grid"><label class="field"><span>價格</span><input id="management-price" type="number" min="0" step="1"></label><label class="field"><span>幣別</span><input id="management-currency"></label><label class="field"><span>平台</span><input id="management-platform"></label><label class="field"><span>購買日期</span><input id="management-purchase-date" type="date"></label><label class="field"><span>商品網址</span><input id="management-purchase-url" type="url"></label><label class="field"><span>訂單編號</span><input id="management-order-id"></label></div></div><div class="form-section"><h3>發售／物流／售後</h3><div class="form-grid"><label class="field"><span>發售日期</span><input id="management-release-date" type="date"></label><label class="field"><span>預計到貨</span><input id="management-expected-date" type="date"></label><label class="field"><span>收到日期</span><input id="management-received-date" type="date"></label><label class="field"><span>物流狀態</span><input id="management-shipping-status"></label><label class="field"><span>物流方式</span><input id="management-shipping-method"></label><label class="field"><span>物流備註</span><input id="management-shipping-note"></label><label class="field"><span>售後狀態</span><input id="management-after-sales-status"></label><label class="field"><span>售後更新</span><input id="management-after-sales-updated"></label><label class="field full"><span>售後備註</span><textarea id="management-after-sales-note" rows="2"></textarea></label></div></div><div class="management-actions"><button class="button" type="submit">儲存修改</button><button class="button secondary" type="button" id="management-reset">還原</button><button class="button danger" type="button" id="management-delete">刪除收藏</button></div><div id="management-errors" class="form-errors" role="alert" hidden></div></form>`;
  if (formItem) fill(formItem);
  const workSelect = qs<HTMLSelectElement>('#management-picker-work'); const categorySelect = qs<HTMLSelectElement>('#management-picker-category'); const serialSelect = qs<HTMLSelectElement>('#management-picker-serial');
  if (workSelect) workSelect.value = pickerWork; if (categorySelect) categorySelect.value = pickerCategory; if (serialSelect) serialSelect.value = pickerSerial;
  workSelect?.addEventListener('change', () => { pickerWork = workSelect.value; pickerCategory = ''; pickerSerial = ''; render(); });
  categorySelect?.addEventListener('change', () => { pickerCategory = categorySelect.value; pickerSerial = ''; render(); });
  serialSelect?.addEventListener('change', () => { pickerSerial = serialSelect.value; const next = pickerItems().find(x => serialOf(x) === pickerSerial); if (next) { selectedId = next.id; render(); } });
  const search = qs<HTMLInputElement>('#management-item-search');
  search?.addEventListener('input', () => { searchQuery = search.value; renderSearchResults(); const normalized = search.value.trim(); const next = searchItems().find(x => pickerValue(x) === normalized || x.id === normalized); if (next) { selectedId = next.id; searchQuery = ''; render(); } });
  qs<HTMLButtonElement>('#management-reset')?.addEventListener('click', () => { const next = allItems().find(x => x.id === selectedId); if (next) { searchQuery = ''; render(); showToast('已還原目前收藏資料。', 'info'); } });
  qs<HTMLFormElement>('#management-form')?.addEventListener('submit', event => { void handleSubmit(event); });
  qs<HTMLButtonElement>('#management-delete')?.addEventListener('click', () => { void handleDelete(); });
}

async function handleSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const base = allItems().find(x => x.id === selectedId);
  if (!base || !storeRef) { showToast('找不到目前收藏。', 'error'); return; }
  const draft = readFormItem(base);
  const errors = validateItem(draft);
  const box = qs<HTMLElement>('#management-errors');
  if (errors.length) { if (box) { box.hidden = false; box.classList.remove('is-success'); box.innerHTML = `<strong>請修正：</strong><ul>${errors.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>`; } showToast('儲存失敗，請檢查欄位。', 'error'); return; }
  const button = qs<HTMLButtonElement>('#management-form button[type="submit"]'); if (button) button.disabled = true;
  try { await storeRef.updateItem(draft); selectedId = draft.id; if (box) { box.hidden = false; box.classList.add('is-success'); box.textContent = '修改已成功寫入遠端資料。'; } showToast('收藏修改已儲存。', 'success'); }
  catch (error) { const message = error instanceof Error ? error.message : '收藏修改失敗。'; if (box) { box.hidden = false; box.classList.remove('is-success'); box.textContent = message; } showToast(message, 'error'); }
  finally { if (button) button.disabled = false; }
}

async function handleDelete(): Promise<void> {
  const base = allItems().find(x => x.id === selectedId);
  if (!base || !storeRef) { showToast('找不到目前收藏。', 'error'); return; }
  if (!window.confirm(`確定要刪除「${base.title}」？\n此操作會寫入遠端資料，且無法直接復原。`)) return;
  const button = qs<HTMLButtonElement>('#management-delete'); if (button) button.disabled = true;
  try { await storeRef.deleteItem(base.id); selectedId = ''; pickerSerial = ''; showToast('收藏已成功刪除。', 'success'); }
  catch (error) { showToast(error instanceof Error ? error.message : '刪除收藏失敗。', 'error'); }
  finally { if (button) button.disabled = false; }
}

void getStore().then(store => {
  storeRef = store;
  const pendingSelection = sessionStorage.getItem('merch-management-selected-id');
  if (pendingSelection) { selectedId = pendingSelection; sessionStorage.removeItem('merch-management-selected-id'); }
  unsubscribe?.(); unsubscribe = store.subscribe(() => render()); render();
}).catch(() => { const root = qs<HTMLElement>('#management-root'); if (root) root.innerHTML = '<div class="notice">管理資料載入失敗，請重試。</div>'; });