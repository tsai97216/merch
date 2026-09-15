import './app-loading.css';
import { loadStore } from './store';

let overlay: HTMLElement | null = null;
let hidden = false;

function ensureOverlay(): HTMLElement {
  if (overlay?.isConnected) return overlay;
  const element = document.createElement('div');
  element.className = 'app-loading-overlay';
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', 'polite');
  element.setAttribute('aria-label', '正在載入 Chi MERCH');
  element.innerHTML = '<div class="app-loading"><div class="app-loading-stage"><div class="app-loading-ring app-loading-ring-a"></div><div class="app-loading-ring app-loading-ring-b"></div><div class="app-loading-core"><span class="app-loading-logo">◇</span></div><div class="app-loading-orbit-dot app-loading-orbit-dot-a"></div><div class="app-loading-orbit-dot app-loading-orbit-dot-b"></div><div class="app-loading-orbit-dot app-loading-orbit-dot-c"></div></div><div class="app-loading-brand">Chi MERCH</div><div class="app-loading-text">正在準備你的收藏<span class="app-loading-ellipsis" aria-hidden="true"><i></i><i></i><i></i></span></div><div class="app-loading-progress" aria-hidden="true"><span></span></div></div>';
  document.body.appendChild(element);
  overlay = element;
  return element;
}

function finish(): void {
  if (hidden) return;
  hidden = true;
  const element = ensureOverlay();
  element.classList.add('is-exiting');
  window.setTimeout(() => {
    element.remove();
    overlay = null;
  }, 450);
}

ensureOverlay();
void loadStore().then(finish, finish);
