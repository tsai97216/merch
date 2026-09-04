import './styles.css';
import { renderCollection } from './pages/collection.ts';
import { renderHome } from './pages/home.ts';
import { renderItem } from './pages/item.ts';
import { renderManagement } from './pages/management.ts';
import { renderSettings } from './pages/settings.ts';
import { renderStatistics } from './pages/statistics.ts';
import { parseRoute, type Route } from './router.ts';
import { store } from './store.ts';

const appElement = document.querySelector<HTMLElement>('#app');
const statusElement = document.querySelector<HTMLElement>('#app-status');
const navigationElement = document.querySelector<HTMLElement>('.app-nav');

if (!appElement || !statusElement || !navigationElement) {
  throw new Error('Application shell is incomplete.');
}

const app = appElement;
const status = statusElement;
const navigation = navigationElement;

function setStatus(text: string): void {
  status.textContent = text;
}

function updateActiveNavigation(route: Route): void {
  const currentName = route.name === 'item' ? 'collection' : route.name;
  for (const link of navigation.querySelectorAll<HTMLAnchorElement>('a[href^="#/"]')) {
    const target = link.getAttribute('href')?.replace(/^#\/?/, '').split('/')[0] ?? '';
    const active = target === currentName;
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}

function render(): void {
  const state = store.getState();
  const route = parseRoute();
  updateActiveNavigation(route);

  if (state.loading) {
    setStatus('載入中…');
    return;
  }

  if (state.error) {
    setStatus('資料載入失敗');
    app.replaceChildren(message('資料暫時無法載入', state.error, '重新載入資料', () => void store.load()));
    return;
  }

  setStatus(state.version ? `v${state.version.version}` : '就緒');

  try {
    switch (route.name) {
      case 'home':
        renderHome(app);
        break;
      case 'collection':
        renderCollection(app);
        break;
      case 'statistics':
        renderStatistics(app);
        break;
      case 'management':
        renderManagement(app);
        break;
      case 'settings':
        renderSettings(app);
        break;
      case 'item':
        renderItem(app, route.id);
        break;
      case 'not-found':
        app.replaceChildren(message('找不到頁面', '請從左側導覽重新選擇。'));
        break;
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : '頁面發生未知錯誤。';
    setStatus('頁面錯誤');
    app.replaceChildren(message('這個頁面暫時無法顯示', detail));
    console.error(error);
  }
}

function message(title: string, detail: string, actionLabel?: string, action?: () => void): HTMLElement {
  const section = document.createElement('section');
  section.className = 'page-content';
  const panel = document.createElement('div');
  panel.className = 'panel';
  const heading = document.createElement('h2');
  heading.textContent = title;
  const text = document.createElement('p');
  text.className = 'muted';
  text.textContent = detail;
  panel.append(heading, text);

  if (actionLabel && action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'primary-button';
    button.textContent = actionLabel;
    button.addEventListener('click', action);
    panel.append(button);
  }

  section.append(panel);
  return section;
}

window.addEventListener('hashchange', render);
store.subscribe(render);

void store.load();
