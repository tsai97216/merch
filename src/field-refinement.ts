const managementHiddenFields = new Set([
  'management-purchase-url',
  'management-order-id',
  'management-release-date',
  'management-shipping-note',
]);

const shippingStatusMap: Record<string, string> = {
  '': '',
  pending: '待出貨',
  shipped: '已出貨',
  in_transit: '運送中',
  delivered: '已送達',
  received: '已收貨',
  '待出貨': '待出貨',
  '已出貨': '已出貨',
  '運送中': '運送中',
  '已送達': '已送達',
  '已收貨': '已收貨',
};

const afterSalesStatusMap: Record<string, string> = {
  '': '',
  none: '無',
  pending: '處理中',
  processing: '處理中',
  completed: '已完成',
  refunded: '已退款',
  returned: '已退貨',
  exchanged: '已換貨',
  '無': '無',
  '處理中': '處理中',
  '已完成': '已完成',
  '已退款': '已退款',
  '已退貨': '已退貨',
  '已換貨': '已換貨',
};

function hideManagementField(id: string): void {
  const field = document.querySelector<HTMLElement>(`#${id}`)?.closest<HTMLElement>('.field');
  if (field) field.remove();
}

function replaceStatusInput(id: string, options: string[], map: Record<string, string>): void {
  const input = document.querySelector<HTMLInputElement>(`#${id}`);
  if (!input || input.tagName === 'SELECT') return;
  const select = document.createElement('select');
  select.id = id;
  select.name = input.name;
  select.className = input.className;
  select.setAttribute('aria-label', input.getAttribute('aria-label') || id);
  const raw = input.value.trim();
  const current = map[raw] ?? raw;
  select.innerHTML = options.map((value) => `<option value="${value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}">${value || '未設定'}</option>`).join('');
  if (options.includes(current)) select.value = current;
  else if (current) {
    const option = document.createElement('option');
    option.value = current;
    option.textContent = current;
    select.appendChild(option);
    select.value = current;
  }
  input.replaceWith(select);
}

function refineManagement(): void {
  const root = document.querySelector<HTMLElement>('#management-root');
  if (!root) return;
  managementHiddenFields.forEach(hideManagementField);
  replaceStatusInput('management-shipping-status', ['','待出貨','已出貨','運送中','已送達','已收貨'], shippingStatusMap);
  replaceStatusInput('management-after-sales-status', ['','無','處理中','已完成','已退款','已退貨','已換貨'], afterSalesStatusMap);
}

function refineDetail(): void {
  const shipping = document.querySelector<HTMLElement>('#detail-shipping');
  const afterSales = document.querySelector<HTMLElement>('#detail-after-sales');
  const shippingLabel = shipping?.closest('div')?.querySelector('dt');
  const afterSalesLabel = afterSales?.closest('div')?.querySelector('dt');
  if (shipping && shipping.textContent) {
    const raw = shipping.textContent.trim();
    shipping.textContent = shippingStatusMap[raw] ?? raw;
    if (shippingLabel) shippingLabel.textContent = '物流狀態';
  }
  if (afterSales && afterSales.textContent) {
    const raw = afterSales.textContent.trim();
    afterSales.textContent = afterSalesStatusMap[raw] ?? raw;
    if (afterSalesLabel) afterSalesLabel.textContent = '售後狀態';
  }
  const release = document.querySelector<HTMLElement>('#detail-release-date');
  release?.closest('div')?.remove();
}

function refine(): void {
  refineManagement();
  refineDetail();
}

const observer = new MutationObserver(refine);
observer.observe(document.body, { childList: true, subtree: true });
refine();
