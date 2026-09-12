type SyncDetail = { label: string };

type FetchLike = typeof window.fetch;
let active = 0;
let overlay: HTMLElement | null = null;
let fetchPatched = false;

function ensureOverlay(): HTMLElement {
  if (overlay?.isConnected) return overlay;
  const element = document.createElement('div');
  element.className = 'sync-overlay';
  element.setAttribute('aria-hidden', 'true');
  element.innerHTML = '<div class="sync-overlay-card" role="status" aria-live="polite"><div class="sync-overlay-spinner" aria-hidden="true"><i></i><i></i><i></i></div><strong class="sync-overlay-title">正在同步</strong><span class="sync-overlay-label"></span><small>請稍候，完成前暫時無法操作網站</small></div>';
  document.body.appendChild(element);
  overlay = element;
  return element;
}

function setVisible(visible: boolean, label = '正在同步資料…'): void {
  const element = ensureOverlay();
  const labelNode = element.querySelector<HTMLElement>('.sync-overlay-label');
  if (labelNode) labelNode.textContent = label;
  element.classList.toggle('is-visible', visible);
  element.setAttribute('aria-hidden', String(!visible));
  document.documentElement.classList.toggle('is-syncing', visible);
  document.body.classList.toggle('is-syncing', visible);
}

function syncLabel(input: RequestInfo | URL, init?: RequestInit): string {
  const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
  if (method === 'DELETE') return '正在刪除並同步資料…';
  if (method === 'PUT' || method === 'PATCH') return '正在編輯並同步資料…';
  if (method === 'POST') return '正在新增並同步資料…';
  return '正在同步資料…';
}

function start(label: string): void {
  active += 1;
  setVisible(true, label);
}

function end(): void {
  active = Math.max(0, active - 1);
  if (active === 0) setVisible(false);
}

function patchFetch(): void {
  if (fetchPatched || typeof window === 'undefined' || typeof window.fetch !== 'function') return;
  fetchPatched = true;
  const original = window.fetch.bind(window) as FetchLike;
  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    const mutation = method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';
    if (!mutation) return original(input, init);
    start(syncLabel(input, init));
    try {
      return await original(input, init);
    } finally {
      end();
    }
  }) as FetchLike;
}

patchFetch();
document.addEventListener('merch:sync-start', (event) => start((event as CustomEvent<SyncDetail>).detail?.label || '正在同步資料…'));
document.addEventListener('merch:sync-end', end);
