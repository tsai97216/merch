const SORT_OPTIONS = ['purchase','title','price'] as const;

function setupCollectionControls(): void {
  const sort = document.querySelector<HTMLSelectElement>('#sort');
  if (!sort) return;

  ['#filter-work', '#filter-character', '#filter-manufacturer'].forEach((selector) => document.querySelector<HTMLElement>(selector)?.setAttribute('hidden', ''));

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
