type SyncDetail = { label: string };

let active = 0;
let overlay: HTMLElement | null = null;

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

document.addEventListener('merch:sync-start', (event) => {
  active += 1;
  const detail = (event as CustomEvent<SyncDetail>).detail;
  setVisible(true, detail?.label || '正在同步資料…');
});

document.addEventListener('merch:sync-end', () => {
  active = Math.max(0, active - 1);
  if (active === 0) setVisible(false);
});
