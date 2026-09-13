import './management-images.css';
import { putAsset, deleteAsset } from './api';
import { resolveAssetUrl } from './image-source';
import { getStore, type MerchStore } from './store';
import type { ImageMeta, Item } from './types';
import { qs } from './utils/dom';
import { showToast } from './utils/toast';
import { ensureFormErrors, setFormErrors, clearFormErrors } from './utils/form-feedback';
import { categoryName } from './category-label';

let storeRef: MerchStore | null = null;
let selectedId = '';
let pickerWork = '';
let pickerCategory = '';
let pickerSerial = '';
let searchQuery = '';
let saving = false;
let imageSaving = false;

const allowedImageTypes = new Map([['image/jpeg', new Set(['jpg', 'jpeg'])], ['image/png', new Set(['png'])], ['image/webp', new Set(['webp'])], ['image/gif', new Set(['gif'])], ['image/avif', new Set(['avif'])]]);
const allItems = (): Item[] => storeRef?.snapshot.items ?? [];
const selectedItem = (): Item | undefined => allItems().find(item => item.id === selectedId);
const workOf = (item: Item): string => item.workId;
const serialOf = (item: Item): string => item.id.match(/(\d+)$/)?.[1] ?? '';
const value = (id: string): string => (qs<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`#${id}`)?.value ?? '').trim();
const setValue = (id: string, next: string): void => { const el = qs<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`#${id}`); if (el) el.value = next; };
const unique = (values: string[]): string[] => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-Hant', { numeric: true }));

function setOptions(select: HTMLSelectElement | null, options: Array<{ value: string; label: string }>, selected = ''): void { if (!select) return; const fragment = document.createDocumentFragment(); for (const option of options) { const node = document.createElement('option'); node.value = option.value; node.textContent = option.label; fragment.appendChild(node); } select.replaceChildren(fragment); if (selected && options.some(option => option.value === selected)) select.value = selected; else if (options[0]) select.value = options[0].value; }