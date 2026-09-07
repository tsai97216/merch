import './theme.css';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'merch-theme';

function getSystemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    return null;
  }
}

function renderThemePanel(): void {
  const page = document.querySelector<HTMLElement>('[data-page="settings"]');
  const statusPanel = page?.querySelector('.settings-list')?.closest<HTMLElement>('.panel');
  if (!page || !statusPanel || page.querySelector('.settings-theme-panel')) return;
  const panel = document.createElement('section');
  panel.className = 'panel settings-theme-panel';
  panel.setAttribute('aria-labelledby', 'settings-theme-title');
  panel.innerHTML = `<div class="settings-theme-controls"><div><span class="panel-label">APPEARANCE</span><h2 id="settings-theme-title">顯示模式</h2><p class="settings-theme-copy">選擇網站外觀。未選擇時會跟隨裝置的系統設定。</p></div><span data-theme-status class="muted">—</span></div><div class="theme-choice-group" role="group" aria-label="顯示模式"><button type="button" class="theme-choice" data-theme-choice="light" aria-pressed="false">☀️ 淺色</button><button type="button" class="theme-choice" data-theme-choice="dark" aria-pressed="false">🌙 深色</button></div>`;
  statusPanel.insertAdjacentElement('afterend', panel);
}

function applyTheme(theme: Theme, persist = true): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.querySelectorAll<HTMLButtonElement>('[data-theme-choice]').forEach((button) => {
    const active = button.dataset.themeChoice === theme;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  const status = document.querySelector<HTMLElement>('[data-theme-status]');
  if (status) status.textContent = theme === 'dark' ? '深色模式' : '淺色模式';
  if (persist) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* storage may be unavailable */ }
  }
}

function init(): void {
  const initial = getStoredTheme() || getSystemTheme();
  applyTheme(initial, false);
  renderThemePanel();
  document.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    const button = target?.closest<HTMLButtonElement>('[data-theme-choice]');
    if (!button) return;
    const theme = button.dataset.themeChoice;
    if (theme === 'dark' || theme === 'light') applyTheme(theme);
  });
  const media = window.matchMedia?.('(prefers-color-scheme: dark)');
  media?.addEventListener('change', () => {
    if (!getStoredTheme()) applyTheme(getSystemTheme(), false);
  });
  window.addEventListener('hashchange', () => window.setTimeout(renderThemePanel, 0));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
