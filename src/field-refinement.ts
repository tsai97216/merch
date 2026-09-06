const managementHiddenFields = new Set([
  'management-purchase-url',
  'management-order-id',
  'management-release-date',
  'management-shipping-status',
  'management-shipping-method',
  'management-shipping-note',
]);

const afterSalesStatusMap: Record<string, string> = {
  '': '', none: '無', pending: '處理中', processing: '處理中', completed: '已完成', refunded: '已退款', returned: '已退貨', exchanged: '已換貨',
  '無': '無', '處理中': '處理中', '已完成': '已完成', '已退款': '已退款', '已退貨': '已退貨', '已換貨': '已換貨',
};

function hideManagementField(id: string): void {
  const field = document.querySelector<HTMLElement>(`#${id}`)?.closest<HTMLElement>('.field');
  if (field) field.remove();
}

function refineManagement(): void {
  const root = document.querySelector<HTMLElement>('#management-root');
  if (!root) return;
  managementHiddenFields.forEach(hideManagementField);
  const afterSales = document.querySelector<HTMLInputElement | HTMLSelectElement>('#management-after-sales-status');
  if (afterSales && afterSales.tagName !== 'SELECT') {
    const select = document.createElement('select');
    select.id = afterSales.id;
    select.name = afterSales.name;
    select.className = afterSales.className;
    const current = afterSalesStatusMap[afterSales.value.trim()] ?? afterSales.value.trim();
    ['', '無', '處理中', '已完成', '已退款', '已退貨', '已換貨'].forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value || '未設定';
      select.appendChild(option);
    });
    if (current) select.value = current;
    afterSales.replaceWith(select);
  }
}

function refineDetail(): void {
  const afterSales = document.querySelector<HTMLElement>('#detail-after-sales');
  const afterSalesLabel = afterSales?.closest('div')?.querySelector('dt');
  if (afterSales && afterSales.dataset.refined !== 'true') {
    const raw = afterSales.textContent?.trim() ?? '';
    afterSales.textContent = afterSalesStatusMap[raw] ?? raw || '未設定';
    afterSales.dataset.refined = 'true';
    if (afterSalesLabel) afterSalesLabel.textContent = '售後狀態';
  }
  document.querySelector<HTMLElement>('#detail-shipping')?.closest('div')?.remove();
  document.querySelector<HTMLElement>('#detail-release-date')?.closest('div')?.remove();
}

function refine(): void {
  refineManagement();
  refineDetail();
}

const observer = new MutationObserver(refine);
observer.observe(document.body, { childList: true, subtree: true });
refine();
