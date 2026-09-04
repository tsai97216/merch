import { el } from '../utils/dom.ts';

export function renderManagement(container: HTMLElement): void {
  const section = el('section', { className: 'page-content' });
  const heading = el('div', { className: 'page-heading' });
  heading.append(el('div', { className: 'eyebrow', text: 'MANAGEMENT' }), el('h2', { text: '管理' }));
  section.append(heading);

  const panel = el('section', { className: 'panel' });
  panel.append(
    el('h3', { text: '管理功能正在建置' }),
    el('p', { className: 'muted', text: 'CRUD、GitHub 同步與圖片管理會在後續階段接入。這一層只負責 UI，不直接呼叫 GitHub API。' }),
  );
  section.append(panel);
  container.replaceChildren(section);
}
