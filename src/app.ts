import './styles.css';
import { renderCollection } from './pages/collection.ts';
import { renderHome } from './pages/home.ts';
import { renderItem } from './pages/item.ts';
import { renderManagement } from './pages/management.ts';
import { renderSettings } from './pages/settings.ts';
import { renderStatistics } from './pages/statistics.ts';
import { parseRoute } from './router.ts';
import { store } from './store.ts';

const app = document.querySelector<HTMLElement>('#app');
const status = document.querySelector<HTMLElement>('#app-status');

if (!app || !status) {
  throw new Error('Application shell is incomplete.');
}

function setStatus(text: string): void {
  status.textContent = text;
}

function render(): void {
  const state = store.getState();
  if (state.loading) {
    setStatus('載入中…');
    return;
  }
  if (state.error) {
    setStatus('資料載入失敗');
    app.replaceChildren(message('資料暫時無法載入', state.error));
    return;
  }

  setStatus(state.version ? `v${state.version.version}` : '就緒');
  const route = parseRoute();
  switch (route.name) {
    case 'home': renderHome(app); break;
    case 'collection': renderCollection(app); break;
    case 'statistics': renderStatistics(app); break;
    case 'management': renderManagement(app); break;
    case 'settings': renderSettings(app); break;
    case 'item': renderItem(app, route.id); break;
    case 'not-found': app.replaceChildren(message('找不到頁面', '請從上方導覽重新選擇。')); break;
  }
}

function message(title: string, detail: string): HTMLElement {
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
  section.append(panel);
  return section;
}

window.addEventListener('hashchange', render);
store.subscribe(render);

void store.load();
