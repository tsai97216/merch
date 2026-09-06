import { loadStore } from './store';
import type { Item } from './types';
import { escapeHtml, qs } from './utils/dom';

let items: Item[] = [];
let selectedId = '';
const fields: Record<string, (item: Item) => string> = {
  'management-item-id': x => x.id, 'management-title': x => x.title, 'management-series': x => x.series ?? '',
  'management-characters': x => (x.characters ?? []).join(', '), 'management-category': x => x.category ?? '',
  'management-manufacturer': x => x.manufacturer ?? '', 'management-quantity': x => String(x.quantity), 'management-status': x => x.status,
  'management-description': x => x.description ?? '', 'management-notes': x => x.notes ?? '',
  'management-price': x => x.purchase?.price == null ? '' : String(x.purchase.price), 'management-currency': x => x.purchase?.currency ?? 'TWD',
  'management-platform': x => x.purchase?.platform ?? '', 'management-purchase-date': x => x.purchase?.date ?? '',
  'management-purchase-url': x => x.purchase?.url ?? '', 'management-order-id': x => x.purchase?.orderId ?? '',
  'management-release-date': x => x.release?.date ?? '', 'management-expected-date': x => x.release?.expectedDate ?? '',
  'management-received-date': x => x.release?.receivedDate ?? '', 'management-shipping-status': x => x.shipping?.status ?? '',
  'management-shipping-method': x => x.shipping?.method ?? '', 'management-shipping-note': x => x.shipping?.note ?? '',
  'management-after-sales-status': x => x.afterSales?.status ?? '', 'management-after-sales-note': x => x.afterSales?.note ?? '',
  'management-after-sales-updated': x => x.afterSales?.updatedAt ?? '', 'management-created-at': x => x.createdAt ?? '', 'management-updated-at': x => x.updatedAt ?? '',
};
const get = (id: string) => (qs<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`#${id}`)?.value ?? '').trim();
function fill(item: Item) { selectedId = item.id; Object.entries(fields).forEach(([id, read]) => { const el = qs<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`#${id}`); if (el) el.value = read(item); }); }
function pickerValue(item: Item): string { return `${item.id} · ${item.title}`; }
function itemFromPicker(value: string): Item | undefined {
  const normalized = value.trim();
  if (!normalized) return undefined;
  return items.find(x => x.id === normalized) ?? items.find(x => pickerValue(x) === normalized);
}
function render() {
  const root = qs<HTMLElement>('#management-root'); if (!root) return;
  const item = items.find(x => x.id === selectedId) ?? items[0]; if (item && item.id !== selectedId) fill(item);
  const pickerOptions = items.map(x => `<option value="${escapeHtml(pickerValue(x))}"></option>`).join('');
  root.innerHTML = `<div class="management-toolbar"><label class="field compact"><span>編輯收藏</span><input id="management-item-picker" list="management-item-options" autocomplete="off" placeholder="搜尋 ID 或商品名稱…" aria-label="搜尋要編輯的收藏"><datalist id="management-item-options">${pickerOptions}</datalist><small class="management-picker-hint">共 ${items.length} 筆，可直接輸入 ID 或名稱搜尋</small></label><span class="management-readonly">目前只驗證草稿，不直接寫入 GitHub。</span></div>
  <form id="management-form" class="management-form" novalidate><div class="form-section"><h3>基本資訊</h3><div class="form-grid">
  <label class="field"><span>Item ID *</span><input id="management-item-id" readonly></label><label class="field"><span>作品</span><input id="management-work" value="${escapeHtml(item?.workName ?? '')}" readonly></label><label class="field"><span>標題 *</span><input id="management-title" required></label><label class="field"><span>系列</span><input id="management-series"></label><label class="field"><span>角色</span><input id="management-characters" placeholder="以逗號分隔"></label><label class="field"><span>類別</span><input id="management-category"></label><label class="field"><span>廠商</span><input id="management-manufacturer"></label><label class="field"><span>數量 *</span><input id="management-quantity" type="number" min="1" step="1" required></label><label class="field"><span>狀態 *</span><select id="management-status"><option value="received">已收到</option><option value="preorder">預購中</option><option value="pending">待到貨</option></select></label></div></div>
  <div class="form-section"><h3>說明</h3><div class="form-grid single"><label class="field"><span>描述</span><textarea id="management-description" rows="3"></textarea></label><label class="field"><span>備註</span><textarea id="management-notes" rows="3"></textarea></label></div></div>
  <div class="form-section"><h3>購買資訊</h3><div class="form-grid"><label class="field"><span>價格</span><input id="management-price" type="number" min="0" step="1"></label><label class="field"><span>幣別</span><input id="management-currency"></label><label class="field"><span>平台</span><input id="management-platform"></label><label class="field"><span>購買日期</span><input id="management-purchase-date" type="date"></label><label class="field"><span>商品網址</span><input id="management-purchase-url" type="url"></label><label class="field"><span>訂單編號</span><input id="management-order-id"></label></div></div>
  <div class="form-section"><h3>發售／物流／售後</h3><div class="form-grid"><label class="field"><span>發售日期</span><input id="management-release-date" type="date"></label><label class="field"><span>預計到貨</span><input id="management-expected-date" type="date"></label><label class="field"><span>收到日期</span><input id="management-received-date" type="date"></label><label class="field"><span>物流狀態</span><input id="management-shipping-status"></label><label class="field"><span>物流方式</span><input id="management-shipping-method"></label><label class="field"><span>物流備註</span><input id="management-shipping-note"></label><label class="field"><span>售後狀態</span><input id="management-after-sales-status"></label><label class="field"><span>售後更新</span><input id="management-after-sales-updated"></label><label class="field full"><span>售後備註</span><textarea id="management-after-sales-note" rows="2"></textarea></label></div></div>
  <div class="management-actions"><button class="button" type="submit">驗證表單</button><button class="button secondary" type="button" id="management-reset">還原</button></div><div id="management-errors" class="form-errors" role="alert" hidden></div></form>`;
  if (item) fill(item);
  const picker = qs<HTMLInputElement>('#management-item-picker'); if (picker && item) picker.value = pickerValue(item);
  picker?.addEventListener('input', () => { const next = itemFromPicker(picker.value); if (!next) return; fill(next); render(); });
  qs<HTMLButtonElement>('#management-reset')?.addEventListener('click', () => { const next = items.find(x => x.id === selectedId); if (next) { fill(next); render(); } });
  qs<HTMLFormElement>('#management-form')?.addEventListener('submit', e => { e.preventDefault(); const errors: string[] = []; const title = get('management-title'); const quantity = Number(get('management-quantity')); const price = get('management-price'); const url = get('management-purchase-url'); if (!title) errors.push('標題為必填欄位。'); if (!Number.isInteger(quantity) || quantity < 1) errors.push('數量必須是大於等於 1 的整數。'); if (price && (!Number.isFinite(Number(price)) || Number(price) < 0)) errors.push('價格必須是大於等於 0 的數字。'); if (url) { try { new URL(url); } catch { errors.push('商品網址格式無效。'); } } const box = qs<HTMLElement>('#management-errors'); if (!box) return; box.hidden = false; box.classList.toggle('is-success', errors.length === 0); box.innerHTML = errors.length ? `<strong>請修正：</strong><ul>${errors.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>` : '<strong>表單驗證通過。</strong> 草稿資料有效，尚未寫入 GitHub。'; });
}
void loadStore().then(store => { items = store.snapshot.items; render(); }).catch(() => { const root = qs<HTMLElement>('#management-root'); if (root) root.innerHTML = '<div class="notice">管理資料載入失敗，請重試。</div>'; });
