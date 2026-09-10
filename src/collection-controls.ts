const SORT_OPTIONS = ['purchase','title','price'] as const;
const STATUS_OPTIONS = [
  ['all', '全部狀態'],
  ['pending', '待到貨'],
  ['preorder', '預購中'],
  ['received', '已收到'],
] as const;

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
  if (!tools || !status || !category || !sort || !view || tools.dataset.groupsBound === '1') return;

  tools.dataset.groupsBound = '1';
  wrapCollectionControl(status, '狀態');
  wrapCollectionControl(category, '類型');

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

  const viewGroup = document.createElement('div');
  viewGroup.className = 'collection-control-group collection-view-group';
  const viewLabel = document.createElement('span');
  viewLabel.className = 'collection-control-label';
  viewLabel.textContent = '顯示';
  const viewBody = document.createElement('div');
  viewBody.className = 'collection-control-body';
  viewGroup.append(viewLabel, viewBody);
  viewBody.appendChild(view);
  sortGroup.after(viewGroup);

  if (window.matchMedia('(max-width: 700px)').matches) {
    tools.querySelectorAll<HTMLElement>('.collection-control-label').forEach((label) => {
      label.style.display = 'flex';
      label.style.width = '100%';
      label.style.justifySelf = 'stretch';
      label.style.alignItems = 'center';
      label.style.justifyContent = 'center';
      label.style.textAlign = 'center';
    });
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
  if (!sort) return;

  ['#filter-work', '#filter-character', '#filter-manufacturer'].forEach((selector) => document.querySelector<HTMLElement>(selector)?.setAttribute('hidden', ''));
  ensureStatusOptions();
  setupCollectionControlGroups();

  if (sort.dataset.bound !== '1') {
    sort.dataset.bound = '1';
    sort.addEventListener('change', () => {
      if (!SORT_OPTIONS.includes(sort.value as typeof SORT_OPTIONS[number])) {
        sort.value = SORT_OPTIONS[0];
      }
    });
  }

  const search = document.querySelector<HTMLInputElement>('#collection-search');
  const clear = document.querySelector<HTMLButtonElement>('#collection-search-clear');
  if (search && clear && clear.dataset.bound !== '1') {
    clear.dataset.bound='1';
    const syncClearButton=()=>{clear.hidden=search.value.length===0;};
    clear.addEventListener('click',()=>{if(!search.value)return;search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));search.focus();});
    search.addEventListener('input',syncClearButton); syncClearButton();
  }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setupCollectionControls,{once:true});else setupCollectionControls();
