import './styles.css';
import { navigate, parseRoute, startRouter, type Route } from './router.ts';
import { store } from './store.ts';
import { renderCollection, renderHome, renderItem, renderPlaceholder, renderStatistics } from './view.ts';

const mount = document.querySelector<HTMLElement>('#app');
if (!mount) throw new Error('找不到 #app');

let route: Route = parseRoute();
let unsubscribeStore: (() => void) | undefined;
let stopRouter: (() => void) | undefined;
let lastFocus: { field: string; selectionStart: number | null; selectionEnd: number | null } | null = null;

function captureFocus(): void {
  const active = document.activeElement;
  if (!(active instanceof HTMLInputElement || active instanceof HTMLSelectElement || active instanceof HTMLTextAreaElement)) return;
  const field = active.dataset.collectionField;
  if (!field) return;
  lastFocus = { field, selectionStart: active instanceof HTMLInputElement ? active.selectionStart : null, selectionEnd: active instanceof HTMLInputElement ? active.selectionEnd : null };
}

function restoreFocus(): void {
  if (!lastFocus) return;
  const selector = `[data-collection-field="${CSS.escape(lastFocus.field)}"]`;
  const target = mount.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(selector);
  if (!target) { lastFocus = null; return; }
  target.focus();
  if (target instanceof HTMLInputElement && lastFocus.selectionStart !== null && lastFocus.selectionEnd !== null) target.setSelectionRange(lastFocus.selectionStart, lastFocus.selectionEnd);
  lastFocus = null;
}

function render(): void {
  captureFocus();
  const state = store.getState();
  if (state.loading) {
    mount.replaceChildren(loadingScreen());
    return;
  }
  if (state.error) {
    mount.replaceChildren(errorScreen(state.error));
    return;
  }

  let page: HTMLElement;
  switch (route.name) {
    case 'home': page = renderHome(state); break;
    case 'collection': page = renderCollection(state); break;
    case 'statistics': page = renderStatistics(state); break;
    case 'item': page = renderItem(state, route.id); break;
    case 'management':
    case 'settings':
    case 'not-found': page = renderPlaceholder(state, route); break;
  }
  mount.replaceChildren(page);
  restoreFocus();
}

function loadingScreen(): HTMLElement {
  const section = document.createElement('section'); section.className = 'state-screen';
  const copy = document.createElement('div'); copy.className = 'state-copy';
  const eyebrow = document.createElement('p'); eyebrow.className = 'eyebrow'; eyebrow.textContent = 'CHI MERCH';
  const title = document.createElement('h1'); title.textContent = '載入收藏中';
  const message = document.createElement('p'); message.textContent = '正在讀取作品與收藏資料。';
  copy.append(eyebrow, title, message); section.append(copy); return copy.parentElement!;
}

function errorScreen(message: string): HTMLElement {
  const section = document.createElement('section'); section.className = 'state-screen';
  const copy = document.createElement('div'); copy.className = 'state-copy';
  const eyebrow = document.createElement('p'); eyebrow.className = 'eyebrow'; eyebrow.textContent = 'DATA ERROR';
  const title = document.createElement('h1'); title.textContent = '資料載入失敗';
  const detail = document.createElement('p'); detail.textContent = message;
  const retry = document.createElement('button'); retry.className = 'button primary'; retry.type = 'button'; retry.dataset.action = 'retry'; retry.textContent = '重新載入';
  copy.append(eyebrow, title, detail, retry); section.append(copy); return section;
}

function handleCollectionField(target: HTMLInputElement | HTMLSelectElement): void {
  const field = target.dataset.collectionField;
  if (!field) return;
  if (field === 'search') store.setCollectionUI({ search: target.value });
  else if (field === 'status') store.setCollectionUI({ status: target.value });
  else if (field === 'category') store.setCollectionUI({ category: target.value });
  else if (field === 'character') store.setCollectionUI({ character: target.value });
  else if (field === 'manufacturer') store.setCollectionUI({ manufacturer: target.value });
  else if (field === 'workId') store.setCollectionUI({ workId: target.value });
  else if (field === 'sort') store.setCollectionUI({ sort: target.value });
}

mount.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-action]') : null;
  if (!target) return;
  const action = target.dataset.action;
  if (action === 'open-item') {
    const id = target.dataset.itemId;
    if (id) navigate({ name: 'item', id });
  } else if (action === 'view-card') store.setCollectionUI({ viewMode: 'card' });
  else if (action === 'view-list') store.setCollectionUI({ viewMode: 'list' });
  else if (action === 'back-collection') navigate({ name: 'collection' });
  else if (action === 'retry') store.load();
});

mount.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  const target = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-action="open-item"]') : null;
  const id = target?.dataset.itemId;
  if (id) navigate({ name: 'item', id });
});

mount.addEventListener('input', (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement && target.dataset.collectionField === 'search') handleCollectionField(target);
});

mount.addEventListener('change', (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) handleCollectionField(target);
});

unsubscribeStore = store.subscribe(() => render());
stopRouter = startRouter((nextRoute) => { route = nextRoute; render(); });

window.addEventListener('error', (event) => {
  console.error('CHI MERCH runtime error', event.error ?? event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('CHI MERCH unhandled rejection', event.reason);
});

void unsubscribeStore;
void stopRouter;
void store.load();
