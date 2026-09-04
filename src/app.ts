import './rebuild.css';
import { navigate, parseRoute, startRouter, type Route } from './router.ts';
import { store } from './store.ts';
import { renderCollection, renderHome, renderItem, renderPlaceholder, renderStatistics, setHomeWorkFilterHandler } from './view.ts';

const mount = document.querySelector<HTMLElement>('#app');
if (!mount) throw new Error('找不到 #app');
const appMount = mount;

document.documentElement.dataset.chiMerchBooted = 'true';

let route: Route = parseRoute();
let lastFocus: { field: string; selectionStart: number | null; selectionEnd: number | null } | null = null;
let imageViewer: HTMLElement | null = null;
let imageViewerPreviousFocus: HTMLElement | null = null;

function captureFocus(): void {
  const active = document.activeElement;
  if (!(active instanceof HTMLInputElement || active instanceof HTMLSelectElement || active instanceof HTMLTextAreaElement)) return;
  const field = active.dataset.collectionField;
  if (!field) return;
  lastFocus = { field, selectionStart: active instanceof HTMLInputElement ? active.selectionStart : null, selectionEnd: active instanceof HTMLInputElement ? active.selectionEnd : null };
}

function restoreFocus(): void {
  if (!lastFocus) return;
  const target = appMount.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[data-collection-field="${CSS.escape(lastFocus.field)}"]`);
  if (!target) { lastFocus = null; return; }
  target.focus();
  if (target instanceof HTMLInputElement && lastFocus.selectionStart !== null && lastFocus.selectionEnd !== null) target.setSelectionRange(lastFocus.selectionStart, lastFocus.selectionEnd);
  lastFocus = null;
}

function loadingScreen(): HTMLElement {
  const section = document.createElement('section'); section.className = 'state-screen'; const copy = document.createElement('div'); copy.className = 'state-copy';
  const eyebrow = document.createElement('p'); eyebrow.className = 'eyebrow'; eyebrow.textContent = 'CHI MERCH'; const title = document.createElement('h1'); title.textContent = '載入收藏中'; const message = document.createElement('p'); message.textContent = '正在讀取作品與收藏資料。';
  copy.append(eyebrow, title, message); section.append(copy); return section;
}
function errorScreen(message: string): HTMLElement {
  const section = document.createElement('section'); section.className = 'state-screen'; const copy = document.createElement('div'); copy.className = 'state-copy'; const eyebrow = document.createElement('p'); eyebrow.className = 'eyebrow'; eyebrow.textContent = 'DATA ERROR'; const title = document.createElement('h1'); title.textContent = '資料載入失敗'; const detail = document.createElement('p'); detail.textContent = message;
  const retry = document.createElement('button'); retry.className = 'button primary'; retry.type = 'button'; retry.dataset.action = 'retry'; retry.textContent = '重新載入'; copy.append(eyebrow, title, detail, retry); section.append(copy); return section;
}

function closeImageViewer(): void {
  if (!imageViewer) return;
  imageViewer.remove();
  imageViewer = null;
  document.body.classList.remove('modal-open');
  imageViewerPreviousFocus?.focus();
  imageViewerPreviousFocus = null;
}

function openImageViewer(url: string, alt: string): void {
  if (!url) return;
  closeImageViewer();
  imageViewerPreviousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const overlay = document.createElement('div');
  overlay.className = 'image-modal';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', '圖片檢視器');
  const panel = document.createElement('div');
  panel.className = 'image-modal-panel';
  const close = document.createElement('button');
  close.className = 'button image-modal-close';
  close.type = 'button';
  close.dataset.action = 'close-image';
  close.setAttribute('aria-label', '關閉圖片檢視器');
  close.textContent = '關閉';
  const image = document.createElement('img');
  image.src = url;
  image.alt = alt || '收藏圖片';
  image.addEventListener('error', () => image.replaceWith(Object.assign(document.createElement('p'), { className: 'image-modal-error', textContent: '圖片載入失敗。' })), { once: true });
  panel.append(close, image);
  overlay.append(panel);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) closeImageViewer(); });
  document.body.append(overlay);
  imageViewer = overlay;
  document.body.classList.add('modal-open');
  close.focus();
}

function render(): void {
  captureFocus(); const state = store.getState(); if (state.loading) { appMount.replaceChildren(loadingScreen()); return; } if (state.error) { appMount.replaceChildren(errorScreen(state.error)); return; }
  let page: HTMLElement;
  switch (route.name) { case 'home': page = renderHome(state); break; case 'collection': page = renderCollection(state); break; case 'statistics': page = renderStatistics(state); break; case 'item': page = renderItem(state, route.id); break; case 'management': case 'settings': case 'not-found': page = renderPlaceholder(state, route); break; }
  appMount.replaceChildren(page); restoreFocus();
}
function handleCollectionField(target: HTMLInputElement | HTMLSelectElement): void {
  const field = target.dataset.collectionField; if (!field) return; const value = target.value;
  if (field === 'search') store.setCollectionUI({ search: value }); else if (field === 'status') store.setCollectionUI({ status: value }); else if (field === 'category') store.setCollectionUI({ category: value }); else if (field === 'character') store.setCollectionUI({ character: value }); else if (field === 'manufacturer') store.setCollectionUI({ manufacturer: value }); else if (field === 'workId') store.setCollectionUI({ workId: value }); else if (field === 'sort') store.setCollectionUI({ sort: value });
}
setHomeWorkFilterHandler((workId) => { store.setCollectionUI({ workId }); navigate({ name: 'collection' }); });
appMount.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-action]') : null; if (!target) return;
  switch (target.dataset.action) {
    case 'open-item': { const id = target.dataset.itemId; if (id) navigate({ name: 'item', id }); break; }
    case 'view-card': store.setCollectionUI({ viewMode: 'card' }); break;
    case 'view-list': store.setCollectionUI({ viewMode: 'list' }); break;
    case 'back-collection': navigate({ name: 'collection' }); break;
    case 'retry': void store.load(); break;
    case 'view-image': openImageViewer(target.dataset.imageUrl ?? '', target.dataset.imageAlt ?? ''); break;
    case 'close-image': closeImageViewer(); break;
  }
});
appMount.addEventListener('keydown', (event) => { if (event.key !== 'Enter') return; const target = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-action="open-item"]') : null; const id = target?.dataset.itemId; if (id) navigate({ name: 'item', id }); });
window.addEventListener('keydown', (event) => { if (event.key === 'Escape' && imageViewer) closeImageViewer(); });
appMount.addEventListener('input', (event) => { if (event.target instanceof HTMLInputElement && event.target.dataset.collectionField === 'search') handleCollectionField(event.target); });
appMount.addEventListener('change', (event) => { const target = event.target; if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) handleCollectionField(target); });
store.subscribe(render); startRouter((nextRoute) => { closeImageViewer(); route = nextRoute; render(); });
window.addEventListener('error', (event) => console.error('CHI MERCH runtime error', event.error ?? event.message));
window.addEventListener('unhandledrejection', (event) => console.error('CHI MERCH unhandled rejection', event.reason));
void store.load();
