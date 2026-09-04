import './styles.css';
import { navigate, parseRoute, startRouter, type Route } from './router.ts';
import { store } from './store.ts';
import {
  renderCollection,
  renderHome,
  renderItem,
  renderPlaceholder,
  renderStatistics,
  setHomeWorkFilterHandler,
} from './view.ts';

const mount = document.querySelector<HTMLElement>('#app');
if (!mount) throw new Error('找不到 #app');

let route: Route = parseRoute();
let imageViewer: HTMLElement | null = null;
let previousFocus: HTMLElement | null = null;
let lastFocus: { field: string; start: number | null; end: number | null } | null = null;

function captureFocus(): void {
  const active = document.activeElement;
  if (!(active instanceof HTMLInputElement || active instanceof HTMLSelectElement || active instanceof HTMLTextAreaElement)) return;
  const field = active.dataset.collectionField;
  if (!field) return;
  lastFocus = {
    field,
    start: active instanceof HTMLInputElement ? active.selectionStart : null,
    end: active instanceof HTMLInputElement ? active.selectionEnd : null,
  };
}

function restoreFocus(): void {
  if (!lastFocus) return;
  const selector = `[data-collection-field="${CSS.escape(lastFocus.field)}"]`;
  const target = mount.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(selector);
  if (!target) {
    lastFocus = null;
    return;
  }
  target.focus();
  if (target instanceof HTMLInputElement && lastFocus.start !== null && lastFocus.end !== null) {
    target.setSelectionRange(lastFocus.start, lastFocus.end);
  }
  lastFocus = null;
}

function stateScreen(title: string, message: string, retry = false): HTMLElement {
  const section = document.createElement('section');
  section.className = 'state-screen';
  const copy = document.createElement('div');
  copy.className = 'state-copy';
  const eyebrow = document.createElement('p');
  eyebrow.className = 'eyebrow';
  eyebrow.textContent = retry ? 'DATA ERROR' : 'CHI MERCH';
  const heading = document.createElement('h1');
  heading.textContent = title;
  const detail = document.createElement('p');
  detail.textContent = message;
  copy.append(eyebrow, heading, detail);
  if (retry) {
    const button = document.createElement('button');
    button.className = 'button primary';
    button.type = 'button';
    button.dataset.action = 'retry';
    button.textContent = '重新載入';
    copy.append(button);
  }
  section.append(copy);
  return section;
}

function closeImageViewer(): void {
  if (!imageViewer) return;
  imageViewer.remove();
  imageViewer = null;
  document.body.classList.remove('modal-open');
  previousFocus?.focus();
  previousFocus = null;
}

function openImageViewer(url: string, alt: string): void {
  if (!url) return;
  closeImageViewer();
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

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
  image.addEventListener('error', () => {
    const fallback = document.createElement('p');
    fallback.className = 'image-modal-error';
    fallback.textContent = '圖片載入失敗。';
    image.replaceWith(fallback);
  }, { once: true });

  panel.append(close, image);
  overlay.append(panel);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeImageViewer();
  });
  document.body.append(overlay);
  imageViewer = overlay;
  document.body.classList.add('modal-open');
  close.focus();
}

function render(): void {
  captureFocus();
  const state = store.getState();

  if (state.loading) {
    mount.replaceChildren(stateScreen('載入收藏中', '正在讀取作品與收藏資料。'));
    document.documentElement.dataset.chiMerchBooted = 'true';
    return;
  }

  if (state.error) {
    mount.replaceChildren(stateScreen('資料載入失敗', state.error, true));
    document.documentElement.dataset.chiMerchBooted = 'true';
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
    case 'not-found':
      page = renderPlaceholder(state, route);
      break;
  }

  mount.replaceChildren(page);
  restoreFocus();
  document.documentElement.dataset.chiMerchBooted = 'true';
}

function updateCollectionField(target: HTMLInputElement | HTMLSelectElement): void {
  const field = target.dataset.collectionField;
  if (!field) return;
  const value = target.value;
  const patch = {
    search: field === 'search' ? value : undefined,
    status: field === 'status' ? value : undefined,
    category: field === 'category' ? value : undefined,
    character: field === 'character' ? value : undefined,
    manufacturer: field === 'manufacturer' ? value : undefined,
    workId: field === 'workId' ? value : undefined,
    sort: field === 'sort' ? value : undefined,
  };
  const cleanPatch = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
  store.setCollectionUI(cleanPatch);
}

setHomeWorkFilterHandler((workId) => {
  store.setCollectionUI({ workId });
  navigate({ name: 'collection' });
});

mount.addEventListener('click', (event) => {
  const element = event.target instanceof Element
    ? event.target.closest<HTMLElement>('[data-action]')
    : null;
  if (!element) return;

  switch (element.dataset.action) {
    case 'open-item': {
      const id = element.dataset.itemId;
      if (id) navigate({ name: 'item', id });
      break;
    }
    case 'view-card': store.setCollectionUI({ viewMode: 'card' }); break;
    case 'view-list': store.setCollectionUI({ viewMode: 'list' }); break;
    case 'back-collection': navigate({ name: 'collection' }); break;
    case 'retry': void store.load(); break;
    case 'view-image': openImageViewer(element.dataset.imageUrl ?? '', element.dataset.imageAlt ?? ''); break;
    case 'close-image': closeImageViewer(); break;
  }
});

mount.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const target = event.target instanceof HTMLElement
    ? event.target.closest<HTMLElement>('[data-action="open-item"]')
    : null;
  const id = target?.dataset.itemId;
  if (!id) return;
  event.preventDefault();
  navigate({ name: 'item', id });
});

mount.addEventListener('input', (event) => {
  if (event.target instanceof HTMLInputElement && event.target.dataset.collectionField === 'search') {
    updateCollectionField(event.target);
  }
});

mount.addEventListener('change', (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) {
    updateCollectionField(target);
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && imageViewer) closeImageViewer();
});

store.subscribe(render);
startRouter((nextRoute) => {
  closeImageViewer();
  route = nextRoute;
  render();
});

void store.load();
