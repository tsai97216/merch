const SORT_OPTIONS = ['purchase','title','price'] as const;

function setupCollectionControls(): void {
  const tools = document.querySelector<HTMLElement>('.collection-tools');
  const sort = document.querySelector<HTMLSelectElement>('#sort');
  const sortGroup = document.querySelector<HTMLElement>('#collection-sort-buttons');
  if (!tools || !sort || !sortGroup) return;

  ['#filter-work', '#filter-character', '#filter-manufacturer'].forEach((selector) => document.querySelector<HTMLElement>(selector)?.setAttribute('hidden', ''));
  sort.setAttribute('hidden', '');

  const syncSortButtons = () => sortGroup.querySelectorAll<HTMLButtonElement>('.sort-button').forEach(button => {
    const active = SORT_OPTIONS.includes(button.dataset.sort as typeof SORT_OPTIONS[number]) && button.dataset.sort === sort.value;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  sortGroup.querySelectorAll<HTMLButtonElement>('.sort-button').forEach(button => {
    if (button.dataset.bound === '1') return;
    button.dataset.bound = '1';
    button.addEventListener('click', () => {
      const value = button.dataset.sort;
      if (!value || !SORT_OPTIONS.includes(value as typeof SORT_OPTIONS[number]) || sort.value === value) return;
      sort.value = value;
      sort.dispatchEvent(new Event('change', { bubbles: true }));
      syncSortButtons();
    });
  });
  if (sort.dataset.bound !== '1') { sort.dataset.bound='1'; sort.addEventListener('change', syncSortButtons); }
  syncSortButtons();

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
