import './styles.css';
import './design-tokens.css';
import './item-detail-modal.css';
import './collection.css';
import './item-detail-shipping';
import { createRouter } from './router';
import { loadStore, MerchStore } from './store';
import { toAppError } from './error';
import { parseItemId } from './item-id';
import { resolveAssetUrl } from './image-source';
import { parseDate } from './utils/date';
import { showToast } from './utils/toast';
import { categoryName } from './category-label';
import { renderItemDetailShipping } from './item-detail-shipping';
import type { Item } from './types';

const $ = <T extends Element>(selector: string, root: ParentNode = document) => root.querySelector<T>(selector);
const $$ = <T extends Element>(selector: string, root: ParentNode = document) => [...root.querySelectorAll<T>(selector)];
const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>\\"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c] as string));
const money = (n?: number) => n == null ? '—' : `NT$ ${new Intl.NumberFormat('zh-TW').format(Number(n))}`;
const statusText = (s: string) => ({ received:'已收到', preorder:'預購中', pending:'待到貨' } as Record<string,string>)[s] || s || '未設定';
const dateText = (s?: string | null) => { const date = parseDate(s || undefined); return date ? date.toLocaleDateString('zh-TW') : '—'; };
const quantityOf = (item: Item) => Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1;
const itemValue = (item: Item) => Number(item.purchase?.price || 0) * quantityOf(item);
const itemDate = (item: Item) => item.purchase?.date || item.arrival?.receivedDate || '';
function getItemIdParts(item: Item) { return parseItemId(item.id); }
