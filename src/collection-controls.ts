const SORT_OPTIONS = [
  { value: 'purchase', label: '最新' },
  { value: 'title', label: '名稱' },
  { value: 'price', label: '價格' },
] as const;

function setupCollectionControls(): void {
  const tools = document.querySelector<HTMLElement>('.collection-tools');
  const sort = document.querySelector<HTMLSelectElement>('#sort');
  if (!tools || !sort) return;

  ['#filter-work', '#filter-character', '#filter-manufacturer'].forEach((selector) => {
    document.querySelector<HTMLElement>(selector)?.setAttribute('hidden', '');
  });

  sort.setAttribute('hidden', '');

  let sortGroup = document.querySelector<HTMLElement>('#collection-sort-buttons');
  if (!sortGroup) {
    sortGroup = document.createElement('div');
    sortGroup.id = 'collection-sort-buttons';
    sortGroup.className = 'sort-buttons';
    sortGroup.setAttribute('role', 'group');
    sortGroup.setAttribute('aria-label', '排序方式');
    sortGroup.innerHTML = SORT_OPTIONS.map(({ value, label }) =>
      `<button type="button" class="sort-button" data-sort="${value}" aria-pressed="false">${label}</button>`
    ).join('');
    sort.insertAdjacentElement('afterend', sortGroup);
  }

  const syncSortButtons = () => {
    sortGroup?.querySelectorAll<HTMLButtonElement>('.sort-button').forEach((button) => {
      const active = button.dataset.sort === sort.value;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };

  sortGroup.querySelectorAll<HTMLButtonElement>('.sort-button').forEach((button) => {
    if (button.dataset.bound === '1') return;
    button.dataset.bound = '1';
    button.addEventListener('click', () => {
      const value = button.dataset.sort;
      if (!value || sort.value === value) return;
      sort.value = value;
      sort.dispatchEvent(new Event('change', { bubbles: true }));
      syncSortButtons();
    });
  });

  sort.addEventListener('change', syncSortButtons);
  syncSortButtons();

  const search = document.querySelector<HTMLInputElement>('#collection-search');
  const clear = document.querySelector<HTMLButtonElement>('#collection-search-clear');
  if (search && clear && clear.dataset.bound !== '1') {
    clear.dataset.bound = '1';
    const syncClearButton = () => {
      clear.hidden = search.value.length === 0;
    };
    clear.addEventListener('click', () => {
      if (!search.value) return;
      search.value = '';
      search.dispatchEvent(new Event('input', { bubbles: true }));
      search.focus();
    });
    search.addEventListener('input', syncClearButton);
    syncClearButton();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupCollectionControls, { once: true });
} else {
  setupCollectionControls();
}