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
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
else init();
