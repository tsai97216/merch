import './toast.css';
import './management-images.css';
import { cleanupAssets, putAsset, deleteAsset } from './api';
import { resolveAssetUrl } from './image-source';
import { buildNextItemId } from './item-id';
import { getStore, type MerchStore } from './store';
import type { ImageMeta, Item } from './types';
import { qs } from './utils/dom';
import { showToast } from './utils/toast';
import { categoryName } from './category-label';

let storeRef: MerchStore | null = null;
let selectedId = '';
let pickerWork = '';
let pickerCategory = '';
let pickerSerial = '';
let creating = false;
let createCategoryCode = 'o';
let searchQuery = '';
let saving = false;
let imageSaving = false;

const categoryCodes = ['b', 'c', 'd', 'e', 'f', 'g', 'h', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 'v', 'w', 'y'] as const;
const allowedImageTypes = new Map([['image/jpeg', new Set(['jpg', 'jpeg'])], ['image/png', new Set(['png'])], ['image/webp', new Set(['webp'])], ['image/gif', new Set(['gif'])], ['image/avif', new Set(['avif'])]]);
const allItems = (): Item[] => storeRef?.snapshot.items ?? [];
const selectedItem = (): Item | undefined => allItems().find(item => item.id === selectedId);
const workOf = (item: Item): string => item.workId;
const serialOf = (item: Item): string => item.id.match(/(\d+)$/)?.[1] ?? '';
const value = (id: string): string => (qs<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`#${id}`)?.value ?? '').trim();
const setValue = (id: string, next: string): void => { const el = qs<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`#${id}`); if (el) el.value = next; };
const unique = (values: string[]): string[] => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-Hant', { numeric: true }));

function blankItem(): Item | undefined {
  const work = storeRef?.snapshot.works.find(item => item.id === pickerWork) ?? storeRef?.snapshot.works[0];
  if (!work) return undefined;
  const id = buildNextItemId(allItems().map(item => item.id), work.code, createCategoryCode);
  return { id, workId: work.id, workName: work.name, title: '', series: [], characters: [], category: createCategoryCode, manufacturer: '', quantity: 1, status: 'pending', description: '', notes: '', purchase: {}, arrival: {}, afterSales: {}, images: [] };
}
function setOptions(select: HTMLSelectElement | null, options: Array<{ value: string; label: string }>, selected = ''): void { if (!select) return; const fragment = document.createDocumentFragment(); for (const option of options) { const node = document.createElement('option'); node.value = option.value; node.textContent = option.label; fragment.appendChild(node); } select.replaceChildren(fragment); if (selected && options.some(option => option.value === selected)) select.value = selected; else if (options[0]) select.value = options[0].value; }
function fill(item: Item): void {
  selectedId = item.id; pickerWork = item.workId; pickerCategory = item.category; pickerSerial = serialOf(item);
  setValue('management-item-id', item.id); setValue('management-title', item.title); setValue('management-series', item.series.join(', ')); setValue('management-characters', item.characters.join(', ')); setValue('management-manufacturer', item.manufacturer); setValue('management-quantity', String(item.quantity)); setValue('management-status', item.status); setValue('management-description', item.description); setValue('management-notes', item.notes); setValue('management-price', item.purchase?.price == null ? '' : String(item.purchase.price)); setValue('management-currency', item.purchase?.currency ?? 'TWD'); setValue('management-platform', item.purchase?.platform ?? ''); setValue('management-purchase-date', item.purchase?.date ?? ''); setValue('management-expected-date', item.arrival?.expectedDate ?? ''); setValue('management-received-date', item.arrival?.receivedDate ?? ''); setValue('management-after-sales-status', item.afterSales?.status ?? ''); setValue('management-after-sales-note', item.afterSales?.note ?? '');
}
function readFormItem(base: Item): Item {
  const series = value('management-series').split(',').map(item => item.trim()).filter(Boolean); const characters = value('management-characters').split(',').map(item => item.trim()).filter(Boolean); const priceText = value('management-price');
  return { ...base, title: value('management-title'), series, characters, manufacturer: value('management-manufacturer'), quantity: Number(value('management-quantity')), status: value('management-status') || 'pending', description: value('management-description'), notes: value('management-notes'), category: value('management-picker-category') || base.category, purchase: { ...(base.purchase ?? {}), ...(priceText ? { price: Number(priceText) } : { price: undefined }), currency: value('management-currency') || undefined, platform: value('management-platform') || undefined, date: value('management-purchase-date') || undefined }, arrival: { ...(base.arrival ?? {}), expectedDate: value('management-expected-date') || undefined, receivedDate: value('management-received-date') || undefined }, afterSales: { ...(base.afterSales ?? {}), status: value('management-after-sales-status') || undefined, note: value('management-after-sales-note') || undefined } };
}
function validateItem(item: Item): string[] { const errors: string[] = []; if (!item.title.trim()) errors.push('標題為必填欄位。'); if (!Number.isInteger(item.quantity) || item.quantity < 1) errors.push('數量必須是大於等於 1 的整數。'); if (item.purchase?.price !== undefined && (!Number.isFinite(item.purchase.price) || item.purchase.price < 0)) errors.push('價格必須是大於等於 0 的數字。'); return errors; }
function imageList(item: Item): ImageMeta[] { return Array.isArray(item.images) ? item.images.map(image => ({ ...image })) : []; }
function normalizeCover(images: ImageMeta[]): ImageMeta[] {
  if (!images.length) return [];
  const coverIndex = images.findIndex(image => image.isCover === true);
  return images.map((image, index) => ({ ...image, ...(index === (coverIndex >= 0 ? coverIndex : 0) ? { isCover: true } : { isCover: undefined }) }));
}
function imagePath(item: Item, file: File): string { const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/\.[^.]+$/, '').slice(0, 80) || 'image'; const ext = file.name.split('.').pop()?.toLowerCase() ?? ''; return `data/${item.workId}/${item.category}/${item.id}/images/${Date.now()}-${safeName}.${ext}`; }
async function fileToBase64(file: File): Promise<string> { return await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(new Error('圖片讀取失敗。')); reader.onload = () => { const text = String(reader.result ?? ''); const comma = text.indexOf(','); if (comma < 0) reject(new Error('圖片資料格式無效。')); else resolve(text.slice(comma + 1)); }; reader.readAsDataURL(file); }); }
function imageMeta(item: Item, path: string, alt?: string, id?: string, isCover = false): ImageMeta { const file = path.split('/').pop() || path; return { id: id ?? `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, file, ...(alt ? { alt } : {}), ...(isCover ? { isCover: true } : {}) }; }
async function saveImages(item: Item, images: ImageMeta[]): Promise<void> { if (!storeRef) throw new Error('資料庫尚未載入。'); await storeRef.updateItem({ ...item, images: normalizeCover(images) }); }
function validImageFile(file: File): boolean { const extension = file.name.split('.').pop()?.toLowerCase() ?? ''; const extensions = allowedImageTypes.get(file.type); return Boolean(extensions?.has(extension) && file.size <= 8 * 1024 * 1024); }
async function uploadImage(file: File): Promise<void> {
  const item = selectedItem();
  if (!item) return showToast('請先儲存收藏，再上傳圖片。', 'error');
  if (saving || imageSaving) return showToast('目前正在同步資料，請稍後再操作圖片。', 'info');
  if (!validImageFile(file)) return showToast('只允許 JPG/JPEG、PNG、WebP、GIF、AVIF，且不超過 8 MB。', 'error');
  imageSaving = true; render(); showToast('圖片上傳同步中，請稍候。', 'info');
  const path = imagePath(item, file);
  try {
    await putAsset(path, await fileToBase64(file));
    const nextImages = [...imageList(item), imageMeta(item, path, item.title)];
    try { await saveImages(item, nextImages); } catch (error) { try { await deleteAsset(path); } catch {} throw error; }
    showToast(nextImages.length === 1 ? '圖片已上傳並設為主圖。' : '圖片已上傳。', 'success');
  } catch (error) { showToast(error instanceof Error ? error.message : '圖片上傳失敗。', 'error'); }
  finally { imageSaving = false; render(); }
}
async function replaceImage(file: File, imageId: string): Promise<void> {
  const item = selectedItem();
  const current = item ? imageList(item).find(image => image.id === imageId) : undefined;
  if (!item || !current) return;
  if (saving || imageSaving) return showToast('目前正在同步資料，請稍後再操作圖片。', 'info');
  if (!validImageFile(file)) return showToast('只允許 JPG/JPEG、PNG、WebP、GIF、AVIF，且不超過 8 MB。', 'error');
  imageSaving = true; render(); showToast('圖片替換同步中，請稍候。', 'info');
  const path = imagePath(item, file);
  try {
    await putAsset(path, await fileToBase64(file));
    const nextImages = imageList(item).map(image => image.id === imageId ? imageMeta(item, path, image.alt || item.title, image.id, image.isCover === true) : image);
    try { await saveImages(item, nextImages); } catch (error) { try { await deleteAsset(path); } catch {} throw error; }
    try { await deleteAsset(`data/${item.workId}/${item.category}/${item.id}/images/${current.file}`); } catch { showToast('新圖片已套用，但舊圖片清理失敗。可稍後使用「清理孤兒圖片」。', 'error'); }
    showToast('圖片已成功替換。', 'success');
  } catch (error) { showToast(error instanceof Error ? error.message : '圖片替換失敗。', 'error'); }
  finally { imageSaving = false; render(); }
}
async function deleteImage(imageId: string): Promise<void> {
  const item = selectedItem();
  const image = item ? imageList(item).find(entry => entry.id === imageId) : undefined;
  if (!item || !image || saving || imageSaving || !window.confirm(`確定要刪除「${image.file}」？`)) return;
  imageSaving = true; render(); showToast('圖片刪除同步中，請稍候。', 'info');
  const originalImages = imageList(item);
  const nextImages = normalizeCover(originalImages.filter(entry => entry.id !== imageId));
  try {
    await saveImages(item, nextImages);
    try {
      await deleteAsset(`data/${item.workId}/${item.category}/${item.id}/images/${image.file}`);
    } catch (deleteError) {
      try { await saveImages(item, originalImages); } catch { throw new Error('圖片檔案刪除失敗，且 metadata rollback 也失敗，請立即重新載入資料確認。'); }
      throw deleteError;
    }
    showToast('圖片已刪除。', 'success');
  } catch (error) { showToast(error instanceof Error ? error.message : '圖片刪除失敗。', 'error'); }
  finally { imageSaving = false; render(); }
}
async function setCover(imageId: string): Promise<void> {
  const item = selectedItem(); if (!item || saving || imageSaving) return;
  const images = imageList(item); if (!images.some(image => image.id === imageId)) return;
  imageSaving = true; render(); showToast('主圖設定同步中，請稍候。', 'info');
  try { await saveImages(item, images.map(image => ({ ...image, ...(image.id === imageId ? { isCover: true } : { isCover: undefined }) }))); showToast('已設為主圖。', 'success'); }
  catch (error) { showToast(error instanceof Error ? error.message : '主圖設定失敗。', 'error'); }
  finally { imageSaving = false; render(); }
}
async function moveImage(imageId: string, direction: -1 | 1): Promise<void> {
  const item = selectedItem(); if (!item || saving || imageSaving) return;
  const images = imageList(item); const index = images.findIndex(image => image.id === imageId); const target = index + direction;
  if (index < 0 || target < 0 || target >= images.length) return;
  [images[index], images[target]] = [images[target], images[index]];
  imageSaving = true; render(); showToast('圖片排序同步中，請稍候。', 'info');
  try { await saveImages(item, images); showToast('圖片順序已更新。', 'success'); }
  catch (error) { showToast(error instanceof Error ? error.message : '圖片排序失敗。', 'error'); }
  finally { imageSaving = false; render(); }
}
async function cleanupOrphanAssets(): Promise<void> {
  if (saving || imageSaving) return showToast('目前正在同步資料，請稍後再清理圖片。', 'info');
  if (!window.confirm('確定要掃描並刪除未被任何收藏圖片資料引用的孤兒圖片？')) return;
  imageSaving = true; render(); showToast('正在掃描並清理孤兒圖片，請稍候。', 'info');
  try { const result = await cleanupAssets(); showToast(result.count ? `已清理 ${result.count} 張孤兒圖片。` : '掃描完成，沒有孤兒圖片。', 'success'); }
  catch (error) { showToast(error instanceof Error ? error.message : '孤兒圖片清理失敗。', 'error'); }
  finally { imageSaving = false; render(); }
}
function renderImageArea(item: Item | undefined): void {
  const root = qs<HTMLElement>('[data-management-images]'); if (!root) return; root.replaceChildren();
  if (!item) { root.textContent = '請先儲存收藏，再管理圖片。'; return; }
  const images = imageList(item);
  if (!images.length) { const notice = document.createElement('div'); notice.className = 'notice'; notice.textContent = '目前沒有圖片。可從上方上傳圖片。'; root.appendChild(notice); return; }
  images.forEach((image, index) => {
    const row = document.createElement('div'); row.className = 'management-image-row'; row.dataset.imageId = image.id;
    const preview = document.createElement('div'); preview.className = 'management-image-preview';
    const url = resolveAssetUrl(`data/${item.workId}/${item.category}/${item.id}/images/${image.file}`);
    if (url) { const img = document.createElement('img'); img.src = url; img.alt = image.alt || item.title; img.loading = 'lazy'; preview.appendChild(img); } else preview.textContent = '無預覽';
    const info = document.createElement('div'); info.className = 'management-image-info';
    const strong = document.createElement('strong'); strong.textContent = image.isCover ? '主圖' : `圖片 ${index + 1}`;
    const small = document.createElement('small'); small.textContent = image.file; info.append(strong, small);
    const actions = document.createElement('div'); actions.className = 'management-image-actions';
    const cover = document.createElement('button'); cover.className = 'button secondary'; cover.type = 'button'; cover.textContent = image.isCover ? '目前主圖' : '設為主圖'; cover.disabled = imageSaving || Boolean(image.isCover); cover.addEventListener('click', () => void setCover(image.id));
    const up = document.createElement('button'); up.className = 'button secondary'; up.type = 'button'; up.textContent = '↑'; up.title = '上移'; up.setAttribute('aria-label', `將圖片 ${index + 1} 上移`); up.disabled = imageSaving || index === 0; up.addEventListener('click', () => void moveImage(image.id, -1));
    const down = document.createElement('button'); down.className = 'button secondary'; down.type = 'button'; down.textContent = '↓'; down.title = '下移'; down.setAttribute('aria-label', `將圖片 ${index + 1} 下移`); down.disabled = imageSaving || index === images.length - 1; down.addEventListener('click', () => void moveImage(image.id, 1));
    const replaceLabel = document.createElement('label'); replaceLabel.className = 'button secondary management-image-replace'; replaceLabel.appendChild(document.createTextNode('替換')); const replace = document.createElement('input'); replace.type = 'file'; replace.accept = '.jpg,.jpeg,.png,.webp,.gif,.avif,image/jpeg,image/png,image/webp,image/gif,image/avif'; replace.hidden = true; replace.disabled = imageSaving; replace.addEventListener('change', () => { const file = replace.files?.[0]; if (file) void replaceImage(file, image.id); replace.value = ''; }); replaceLabel.appendChild(replace);
    const remove = document.createElement('button'); remove.className = 'button danger'; remove.type = 'button'; remove.textContent = '刪除'; remove.disabled = imageSaving; remove.addEventListener('click', () => void deleteImage(image.id));
    actions.append(cover, up, down, replaceLabel, remove); row.append(preview, info, actions); root.appendChild(row);
  });
}
function render(): void {
  if (!storeRef) return; const works = storeRef.snapshot.works; const items = allItems(); if (!pickerWork || !works.some(work => work.id === pickerWork)) pickerWork = works[0]?.id ?? '';
  const workSelect = qs<HTMLSelectElement>('#management-picker-work'); setOptions(workSelect, works.map(work => ({ value: work.id, label: work.name })), pickerWork); pickerWork = workSelect?.value ?? pickerWork;
  const availableCategoryCodes = creating ? [...categoryCodes] : unique(items.filter(item => workOf(item) === pickerWork).map(item => item.category)); if (!availableCategoryCodes.includes(pickerCategory)) pickerCategory = availableCategoryCodes[0] ?? '';
  const categorySelect = qs<HTMLSelectElement>('#management-picker-category'); setOptions(categorySelect, availableCategoryCodes.map(code => ({ value: code, label: categoryName(code) })), pickerCategory); pickerCategory = categorySelect?.value ?? pickerCategory;
  const serialItems = items.filter(item => workOf(item) === pickerWork && item.category === pickerCategory); if (!pickerSerial || !serialItems.some(item => serialOf(item) === pickerSerial)) pickerSerial = serialOf(serialItems[0]) || ''; const serialSelect = qs<HTMLSelectElement>('#management-picker-serial'); setOptions(serialSelect, serialItems.map(item => ({ value: serialOf(item), label: `${serialOf(item).padStart(3, '0')} · ${item.title}` })), pickerSerial); pickerSerial = serialSelect?.value ?? pickerSerial;
  const target = creating ? blankItem() : serialItems.find(item => serialOf(item) === pickerSerial) ?? items.find(item => item.id === selectedId) ?? items[0]; if (target && !creating && target.id !== selectedId) fill(target); if (creating && target) fill(target);
  const title = qs<HTMLElement>('#management-form-title'); if (title) title.textContent = creating ? '新增收藏' : '編輯收藏'; const submit = qs<HTMLButtonElement>('#management-submit'); if (submit) { submit.textContent = creating ? '＋ 新增收藏' : '儲存修改'; submit.disabled = saving || imageSaving; } const cancel = qs<HTMLButtonElement>('#management-cancel'); if (cancel) { cancel.hidden = !creating; cancel.disabled = saving || imageSaving; } const del = qs<HTMLButtonElement>('#management-delete'); if (del) del.disabled = saving || imageSaving || creating || !selectedItem(); const form = qs<HTMLFormElement>('#management-form'); if (form) form.setAttribute('aria-busy', String(saving || imageSaving)); form?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input,textarea,select,button').forEach(el => { if (el.id !== 'management-cancel' && el.id !== 'management-new') el.disabled = saving || imageSaving; }); renderImageArea(creating ? undefined : selectedItem()); const count = qs<HTMLElement>('#management-search-count'); if (count) count.textContent = searchQuery ? `搜尋「${searchQuery}」` : `共 ${items.length} 筆收藏`; const datalist = qs<HTMLDataListElement>('#management-search-options'); if (datalist) { datalist.replaceChildren(...items.filter(item => `${item.id} ${item.title} ${item.workName ?? ''}`.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase())).slice(0, 30).map(item => { const option = document.createElement('option'); option.value = `${item.id} · ${item.title}`; return option; })); }
}
async function handleSubmit(event: SubmitEvent): Promise<void> { event.preventDefault(); if (!storeRef || saving || imageSaving) return; const base = creating ? blankItem() : selectedItem(); if (!base) return showToast('找不到要操作的收藏。', 'error'); const item = readFormItem(base); const errors = validateItem(item); if (errors.length) return showToast(errors.join('\n'), 'error'); saving = true; render(); showToast(creating ? '收藏新增同步中，請稍候。' : '收藏修改同步中，請稍候。', 'info'); try { if (creating) { await storeRef.addItem(item); selectedId = item.id; creating = false; pickerWork = item.workId; pickerCategory = item.category; pickerSerial = serialOf(item); showToast('收藏已成功新增。', 'success'); } else { await storeRef.updateItem(item); selectedId = item.id; showToast('收藏已成功更新。', 'success'); } } catch (error) { showToast(error instanceof Error ? error.message : '儲存失敗。', 'error'); } finally { saving = false; render(); } }
async function handleDelete(): Promise<void> { const item = selectedItem(); if (!storeRef || !item || saving || imageSaving || creating) return; if (!window.confirm(`確定要刪除「${item.title}」？\n此操作會刪除收藏資料，且 Item ID 不會重新編號。`)) return; saving = true; render(); showToast('收藏刪除同步中，請稍候。', 'info'); try { await storeRef.deleteItem(item.id); selectedId = ''; pickerSerial = ''; showToast('收藏已成功刪除。', 'success'); } catch (error) { showToast(error instanceof Error ? error.message : '刪除失敗。', 'error'); } finally { saving = false; render(); } }
function bind(): void { qs<HTMLFormElement>('#management-form')?.addEventListener('submit', event => void handleSubmit(event)); qs<HTMLButtonElement>('#management-delete')?.addEventListener('click', () => void handleDelete()); qs<HTMLButtonElement>('#management-new')?.addEventListener('click', () => { creating = true; createCategoryCode = 'o'; pickerSerial = ''; render(); }); qs<HTMLButtonElement>('#management-cancel')?.addEventListener('click', () => { creating = false; const item = selectedItem() ?? allItems()[0]; if (item) fill(item); render(); }); qs<HTMLSelectElement>('#management-picker-work')?.addEventListener('change', event => { pickerWork = (event.target as HTMLSelectElement).value; pickerCategory = ''; pickerSerial = ''; if (!creating) selectedId = ''; render(); }); qs<HTMLSelectElement>('#management-picker-category')?.addEventListener('change', event => { pickerCategory = (event.target as HTMLSelectElement).value; pickerSerial = ''; render(); }); qs<HTMLSelectElement>('#management-picker-serial')?.addEventListener('change', event => { pickerSerial = (event.target as HTMLSelectElement).value; const item = allItems().find(entry => serialOf(entry) === pickerSerial && workOf(entry) === pickerWork && entry.category === pickerCategory); if (item) fill(item); render(); }); qs<HTMLInputElement>('#management-search')?.addEventListener('input', event => { searchQuery = (event.target as HTMLInputElement).value.trim(); const first = allItems().find(item => `${item.id} · ${item.title}` === searchQuery); if (first) fill(first); render(); }); qs<HTMLButtonElement>('#management-cleanup-assets')?.addEventListener('click', () => void cleanupOrphanAssets()); qs<HTMLInputElement>('#management-image-upload')?.addEventListener('change', event => { const file = (event.target as HTMLInputElement).files?.[0]; if (file) void uploadImage(file); (event.target as HTMLInputElement).value = ''; }); }
async function init(): Promise<void> { storeRef = await getStore(); const pendingId = sessionStorage.getItem('merch-management-selected-id') || ''; if (pendingId) sessionStorage.removeItem('merch-management-selected-id'); const pendingItem = pendingId ? allItems().find(item => item.id === pendingId) : undefined; if (pendingItem) { searchQuery = `${pendingItem.id} · ${pendingItem.title}`; fill(pendingItem); } storeRef.subscribe(() => { if (!saving && !imageSaving) render(); }); bind(); const first = pendingItem ?? allItems()[0]; if (first) fill(first); render(); }
void init();