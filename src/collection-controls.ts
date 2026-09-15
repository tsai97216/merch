const SORT_OPTIONS = ['purchase','title','price'] as const;
const STATUS_OPTIONS = [
  ['all', '全部狀態'],
  ['pending', '待到貨'],
  ['preorder', '預購中'],
  ['received', '已收到'],
] as const;

let boundTools: HTMLElement | null = null;

function wrapCollectionControl(element: HTMLElement, label: string): HTMLDivElement {
  const group = document.createElement('div');
  group.className = 'collection-control-group';
  const heading = document.createElement('span');
  heading.className = 'collection-control-label';
  heading.textContent = label;
  const body = document.createElement('div');
  body.className = 'collection-control-body';
  element.parentElement?.insertBefore(group, element);
  group.append(heading, body);
  body.appendChild(element);
  return group;
}

function setupCollectionControlGroups(): void {
  const tools = document.querySelector<HTMLElement>('.collection-tools');
  const status = document.querySelector<HTMLSelectElement>('#filter-status');
  const category = document.querySelector<HTMLSelectElement>('#filter-category');
  const sort = document.querySelector<HTMLSelectElement>('#sort');
  const view = document.querySelector<HTMLElement>('.view-switch');
  if (!tools || !status || !category || !sort || !view) return;

  if (!status.closest('.collection-control-group')) wrapCollectionControl(status, '狀態');
  if (!category.closest('.collection-control-group')) wrapCollectionControl(category, '類型');

  if (!sort.closest('.collection-control-group')) {
    const sortGroup = document.createElement('div');
    sortGroup.className = 'collection-control-group collection-sort-group';
    const sortLabel = document.createElement('span');
    sortLabel.className = 'collection-control-label';
    sortLabel.textContent = '排序';
    const sortBody = document.createElement('div');
    sortBody.className = 'collection-control-body';
    sort.parentElement?.insertBefore(sortGroup, sort);
    sortGroup.append(sortLabel, sortBody);
    sortBody.appendChild(sort);
  }

  if (!view.closest('.collection-control-group')) {
    const viewGroup = document.createElement('div');
    viewGroup.className = 'collection-control-group collection-view-group';
    const viewLabel = document.createElement('span');
    viewLabel.className = 'collection-control-label';
    viewLabel.textContent = '顯示';
    const viewBody = document.createElement('div');
    viewBody.className = 'collection-control-body';
    viewGroup.append(viewLabel, viewBody);
    viewBody.appendChild(view);
    const sortGroup = document.querySelector<HTMLElement>('.collection-sort-group');
    if (sortGroup) sortGroup.after(viewGroup);
    else tools.appendChild(viewGroup);
  }
}

function ensureStatusOptions(): void {
  const status = document.querySelector<HTMLSelectElement>('#filter-status');
  if (!status) return;
  const current = status.value;
  status.replaceChildren(...STATUS_OPTIONS.map(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    return option;
  }));
  status.value = STATUS_OPTIONS.some(([value]) => value === current) ? current : 'all';
}

function setupCollectionControls(): void {
  const sort = document.querySelector<HTMLSelectElement>('#sort');
  const tools = document.querySelector<HTMLElement>('.collection-tools');
  if (!sort || !tools) return;

  ['#filter-work', '#filter-character', '#filter-manufacturer'].forEach((selector) => document.querySelector<HTMLElement>(selector)?.setAttribute('hidden', ''));
  ensureStatusOptions();
  setupCollectionControlGroups();

  if (boundTools === tools) return;
  boundTools = tools;

  tools.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement) || target.id !== 'sort') return;
    if (!SORT_OPTIONS.includes(target.value as typeof SORT_OPTIONS[number])) target.value = SORT_OPTIONS[0];
  });

  tools.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const clear = target.closest<HTMLButtonElement>('#collection-search-clear');
    if (!clear) return;
    const search = document.querySelector<HTMLInputElement>('#collection-search');
    if (!search || !search.value) return;
    search.value = '';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    search.focus();
  });

  tools.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || target.id !== 'collection-search') return;
    const clear = document.querySelector<HTMLButtonElement>('#collection-search-clear');
    if (clear) clear.hidden = target.value.length === 0;
  });

  const search = document.querySelector<HTMLInputElement>('#collection-search');
  const clear = document.querySelector<HTMLButtonElement>('#collection-search-clear');
  if (search && clear) clear.hidden = search.value.length === 0;
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupCollectionControls, { once: true });
else setupCollectionControls();
