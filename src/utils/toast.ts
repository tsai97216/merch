let host: HTMLElement | null = null;
let timer: number | null = null;

function ensureHost(kind: 'info' | 'success' | 'error'): HTMLElement {
  if (host?.isConnected) {
    host.className = `toast-host toast-host-${kind}`;
    return host;
  }
  host = document.createElement('div');
  host.className = `toast-host toast-host-${kind}`;
  host.setAttribute('aria-live', 'polite');
  host.setAttribute('aria-atomic', 'true');
  document.body.appendChild(host);
  return host;
}

export function showToast(message: string, kind: 'info' | 'success' | 'error' = 'info', duration = 2600): void {
  const root = ensureHost(kind);
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
