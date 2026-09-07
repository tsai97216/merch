let host: HTMLElement | null = null;
let timer: number | null = null;
let syncObserverInstalled = false;

function ensureHost(): HTMLElement {
  if (host?.isConnected) return host;
  host = document.createElement('div');
  host.className = 'toast-host';
  host.setAttribute('aria-live', 'polite');
  host.setAttribute('aria-atomic', 'true');
  document.body.appendChild(host);
  return host;
}

export function showToast(message: string, kind: 'info' | 'success' | 'error' = 'info', duration = 2600): void {
  const root = ensureHost();
  if (timer !== null) window.clearTimeout(timer);
  root.innerHTML = '';
  const toast = document.createElement('div');
  toast.className = `toast toast-${kind}`;
  toast.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  toast.textContent = message;
  root.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  timer = window.setTimeout(() => {
    toast.classList.remove('is-visible');
    window.setTimeout(() => toast.remove(), 180);
    timer = null;
  }, Math.max(800, duration));
}

function installSyncFeedback(): void {
  if (syncObserverInstalled) return;
  syncObserverInstalled = true;

  const observe = (): void => {
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.type !== 'attributes' || mutation.attributeName !== 'aria-busy') continue;
        const target = mutation.target as HTMLElement;
        if (target.getAttribute('aria-busy') !== 'true') continue;
        const form = target.closest('form');
        if (form?.id === 'add-form') showToast('正在同步新增資料…', 'info', 120000);
        else if (form?.id === 'management-form') showToast('正在同步收藏資料…', 'info', 120000);
        else if (form?.id === 'shipping-form') showToast('正在同步運費資料…', 'info', 120000);
      }
    });
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['aria-busy'] });
  };

  if (document.body) observe();
  else document.addEventListener('DOMContentLoaded', observe, { once: true });

  document.addEventListener('change', event => {
    const input = event.target as HTMLInputElement | null;
    if (input?.type === 'file' && input.accept.includes('image')) showToast('正在上傳圖片…', 'info', 120000);
  }, true);

  document.addEventListener('click', event => {
    const target = (event.target as Element | null)?.closest<HTMLElement>('.management-image-actions .danger');
    if (target) showToast('正在同步圖片刪除…', 'info', 120000);
  }, true);
}

installSyncFeedback();
