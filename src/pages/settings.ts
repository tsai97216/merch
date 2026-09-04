import { el } from '../utils/dom.ts';

export function renderSettings(container: HTMLElement): void {
  const section = el('section', { className: 'page-content' });
  const heading = el('div', { className: 'page-heading' });
  heading.append(el('div', { className: 'eyebrow', text: 'SETTINGS' }), el('h2', { text: '設定' }));
  section.append(heading);

  const panel = el('section', { className: 'panel' });
  panel.append(
    el('h3', { text: '系統設定' }),
    el('p', { className: 'muted', text: 'Admin Secret、資料重新載入與同步設定會在管理層完成後接入。' }),
  );
  section.append(panel);
  container.replaceChildren(section);
}
