import './add.css';
import './layout-refinement.css';
import { buildNextItemId } from './item-id';
import { getStore } from './store';
import { showToast } from './utils/toast';
import type { Item } from './types';

const qs = <T extends Element>(selector: string, root: ParentNode = document) => root.querySelector<T>(selector);
const value = (id: string) => (qs<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`#${id}`)?.value ?? '').trim();
let submitting = false;

function setBusy(busy: boolean): void {
  submitting = busy;
  const form = qs<HTMLFormElement>('#add-form');
  if (!form) return;
  form.setAttribute('aria-busy', String(busy));
  form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLButtonElement>('input,textarea,select,button').forEach(control => {
    control.disabled = busy;
  });
  const button = qs<HTMLButtonElement>('#add-form button[type="submit"]');
  if (button) button.textContent = busy ? '儲存中…' : '＋ 新增收藏';
}

function populateWorkOptions(): void {
  const select = qs<HTMLSelectElement>('#add-work');
  if (!select) return;
  void getStore().then(store => {
    const current = select.value;
    select.replaceChildren(...store.snapshot.works.map(work => {
      const option = document.createElement('option');
      option.value = work.id;
      option.textContent = `${work.name} (${work.code})`;
      return option;
    }));
    if (current && store.snapshot.works.some(work => work.id === current)) select.value = current;
    if (!store.snapshot.works.length) showToast('目前沒有可用的作品，請先建立作品。', 'error');
  }).catch(error => showToast(error instanceof Error ? error.message : '新增頁載入失敗。', 'error'));
}

function clearForm(): void {
  const form = qs<HTMLFormElement>('#add-form');
  if (!form) return;
  form.reset();
  const quantity = qs<HTMLInputElement>('#add-quantity');
  const currency = qs<HTMLInputElement>('#add-currency');
  if (quantity) quantity.value = '1';
  if (currency) currency.value = 'TWD';
}

async function submit(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  if (submitting) return;
  const store = await getStore();
  const work = store.snapshot.works.find(item => item.id === value('add-work')) ?? store.snapshot.works[0];
  if (!work) {
    showToast('目前沒有可用的作品。', 'error');
    return;
  }
  const title = value('add-title');
  const quantity = Number(value('add-quantity'));
  const priceText = value('add-price');
  const category = value('add-category');
  if (!title) {
    showToast('標題為必填欄位。', 'error');
    return;
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    showToast('數量必須是大於等於 1 的整數。', 'error');
    return;
  }
  if (priceText && (!Number.isFinite(Number(priceText)) || Number(priceText) < 0)) {
    showToast('價格必須是大於等於 0 的數字。', 'error');
    return;
  }
  const item: Item = {
    id: buildNextItemId(store.snapshot.items.map(x => x.id), work.code, category),
    workId: work.id,
    workName: work.name,
    title,
    series: value('add-series').split(',').map(x => x.trim()).filter(Boolean),
    characters: value('add-characters').split(',').map(x => x.trim()).filter(Boolean),
    category,
    manufacturer: value('add-manufacturer'),
    quantity,
    status: value('add-status') as Item['status'],
    description: value('add-description'),
    notes: value('add-notes'),
    purchase: {
      price: priceText ? Number(priceText) : undefined,
      currency: value('add-currency') || undefined,
      platform: value('add-platform') || undefined,
      date: value('add-purchase-date') || undefined,
    },
    arrival: {
      expectedDate: value('add-expected-date') || undefined,
      receivedDate: value('add-received-date') || undefined,
    },
    afterSales: {},
    images: [],
  };
  setBusy(true);
  try {
    await store.addItem(item);
    sessionStorage.setItem('merch-management-selected-id', item.id);
    showToast('收藏已新增。', 'success');
    const result = qs<HTMLElement>('#add-result');
    const resultText = qs<HTMLElement>('#add-result-item');
    if (resultText) resultText.textContent = `${item.id} · ${item.title}`;
    if (result) result.hidden = false;
    qs<HTMLButtonElement>('#add-result-management')?.focus();
  } catch (error) {
    showToast(error instanceof Error ? error.message : '新增收藏失敗。', 'error');
  } finally {
    setBusy(false);
  }
}

function closeResult(): void {
  const result = qs<HTMLElement>('#add-result');
  if (result) result.hidden = true;
}

function bind(): void {
  const form = qs<HTMLFormElement>('#add-form');
  if (!form || form.dataset.bound === 'true') return;
  form.dataset.bound = 'true';
  form.addEventListener('submit', event => { void submit(event); });
  qs<HTMLButtonElement>('#add-result-close')?.addEventListener('click', closeResult);
  qs<HTMLElement>('#add-result-backdrop')?.addEventListener('click', closeResult);
  qs<HTMLButtonElement>('#add-result-management')?.addEventListener('click', () => {
    closeResult();
    location.hash = '#/management';
  });
  qs<HTMLButtonElement>('#add-result-cancel')?.addEventListener('click', closeResult);
}

function render(): void {
  const page = qs<HTMLElement>('[data-page="add"]');
  if (!page) return;
  page.hidden = location.hash !== '#/add' && location.hash !== '#add';
  if (page.hidden) return;
  bind();
  populateWorkOptions();
}

render();
window.addEventListener('hashchange', render);
