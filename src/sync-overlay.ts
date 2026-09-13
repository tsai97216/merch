import './sync-overlay.css';

type SyncDetail = { label: string };
type FeedbackKind = 'info' | 'success' | 'error';

let active = 0;
let overlay: HTMLElement | null = null;
let fetchPatched = false;
let feedbackTimer: number | null = null;

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
  const titleNode = element.querySelector<HTMLElement>('.sync-overlay-title');
  const smallNode = element.querySelector<HTMLElement>('.sync-overlay-card small');
  const spinner = element.querySelector<HTMLElement>('.sync-overlay-spinner');
  if (titleNode) titleNode.textContent = '正在同步';
  if (labelNode) labelNode.textContent = label;
  if (smallNode) smallNode.textContent = '請稍候，完成前暫時無法操作網站';
  spinner?.classList.remove('is-feedback');
  element.classList.remove('is-feedback', 'feedback-info', 'feedback-success', 'feedback-error');
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
  if (feedbackTimer !== null) {
    window.clearTimeout(feedbackTimer);
    feedbackTimer = null;
  }
  active += 1;
  setVisible(true, label);
}

function end(): void {
  active = Math.max(0, active - 1);
  if (active === 0) setVisible(false);
}

export function showFeedback(message: string, kind: FeedbackKind = 'info', duration = 2200): void {
  const element = ensureOverlay();
  const titleNode = element.querySelector<HTMLElement>('.sync-overlay-title');
  const labelNode = element.querySelector<HTMLElement>('.sync-overlay-label');
  const smallNode = element.querySelector<HTMLElement>('.sync-overlay-card small');
  const spinner = element.querySelector<HTMLElement>('.sync-overlay-spinner');
  if (feedbackTimer !== null) window.clearTimeout(feedbackTimer);
  if (titleNode) titleNode.textContent = kind === 'success' ? '完成' : kind === 'error' ? '操作失敗' : '提示';
  if (labelNode) labelNode.textContent = message;
  if (smallNode) smallNode.textContent = '';
  spinner?.classList.add('is-feedback');
  element.classList.add('is-feedback', `feedback-${kind}`, 'is-visible');
  element.setAttribute('aria-hidden', 'false');
  feedbackTimer = window.setTimeout(() => {
    element.classList.remove('is-visible', 'is-feedback', 'feedback-info', 'feedback-success', 'feedback-error');
    spinner?.classList.remove('is-feedback');
    element.setAttribute('aria-hidden', 'true');
    feedbackTimer = null;
  }, Math.max(900, duration));
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

type FetchLike = typeof window.fetch;

patchFetch();
if (typeof document !== 'undefined') {
  document.addEventListener('merch:sync-start', (event) => start((event as CustomEvent<SyncDetail>).detail?.label || '正在同步資料…'));
  document.addEventListener('merch:sync-end', end);
}
