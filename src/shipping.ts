import { getStore, type MerchStore } from './store';
import type { Item, ShippingRecord } from './types';
import { escapeHtml, qs } from './utils/dom';
import { showToast } from './utils/toast';
import { ensureFormErrors, setFormErrors, clearFormErrors } from './utils/form-feedback';
import { openShippingDetail } from './shipping-detail-modal';
import './shipping.css';

let storeRef: MerchStore | null = null;
let editingId = '';
let saving = false;
let itemSearch = '';
let itemPage = 1;
let showSelectedItems = false;
let draftRecordId: string | null = null;
let draftItemIds = new Set<string>();
const ITEM_PAGE_SIZE = 12;
const allItems=()=>storeRef?.snapshot.items??[];
const money=(n:number,c:string)=>`${c||'TWD'} ${new Intl.NumberFormat('zh-TW').format(n)}`;
function setValue(id:string,value:string):void{const el=qs<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>(`#${id}`);if(el)el.value=value;}
function renderItems(selected:ShippingRecord|undefined):void{
  const root=qs<HTMLElement>('[data-shipping-items]');if(!root)return;
  if(draftRecordId!==editingId){draftRecordId=editingId;draftItemIds=new Set(selected?.itemIds??[]);itemPage=1;}
  const query=itemSearch.trim().toLocaleLowerCase('zh-Hant');
  const filtered=allItems().filter(i=>{if(showSelectedItems&&!draftItemIds.has(i.id))return false;if(!query)return true;return [i.id,i.title,i.workId].some(value=>value.toLocaleLowerCase('zh-Hant').includes(query));});
  const totalPages=Math.max(1,Math.ceil(filtered.length/ITEM_PAGE_SIZE));itemPage=Math.min(itemPage,totalPages);
  const start=(itemPage-1)*ITEM_PAGE_SIZE;const pageItems=filtered.slice(start,start+ITEM_PAGE_SIZE);
  root.replaceChildren();
  const toolbar=document.createElement('div');toolbar.className='shipping-items-toolbar';
  const label=document.createElement('label');label.className='shipping-item-search';
  const span=document.createElement('span');span.textContent='搜尋周邊';const input=document.createElement('input');input.type='search';input.value=itemSearch;input.placeholder='搜尋 Item ID、標題、作品…';input.autocomplete='off';input.disabled=saving;input.setAttribute('data-shipping-item-search','true');label.append(span,input);
  const selectedLabel=document.createElement('label');selectedLabel.className='shipping-item-filter';const filterCheckbox=document.createElement('input');filterCheckbox.type='checkbox';filterCheckbox.checked=showSelectedItems;filterCheckbox.disabled=saving;filterCheckbox.setAttribute('data-shipping-show-selected','true');const selectedText=document.createElement('span');selectedText.textContent=`只顯示已選 (${draftItemIds.size})`;selectedLabel.append(filterCheckbox,selectedText);
  toolbar.append(label,selectedLabel);root.appendChild(toolbar);
  const list=document.createElement('div');list.className='shipping-items';
  if(pageItems.length){for(const i of pageItems){const itemLabel=document.createElement('label');itemLabel.className='shipping-item';const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.value=i.id;checkbox.checked=draftItemIds.has(i.id);checkbox.disabled=saving;checkbox.setAttribute('data-shipping-item-checkbox','true');const text=document.createElement('span');text.textContent=`${i.id} · ${i.title}`;itemLabel.append(checkbox,text);list.appendChild(itemLabel);}}else{const empty=document.createElement('span');empty.className='muted';empty.textContent=showSelectedItems?'目前沒有符合條件的已選周邊。':'目前沒有符合搜尋條件的周邊。';list.appendChild(empty);}
  root.appendChild(list);
  const pager=document.createElement('div');pager.className='shipping-items-pagination';
  const summary=document.createElement('span');summary.textContent=`顯示 ${filtered.length?start+1:0}–${Math.min(start+ITEM_PAGE_SIZE,filtered.length)} / ${filtered.length} 件`;
  const prev=document.createElement('button');prev.className='button secondary compact';prev.type='button';prev.textContent='上一頁';prev.disabled=saving||itemPage<=1;prev.dataset.shippingItemPage=String(itemPage-1);
  const pageLabel=document.createElement('span');pageLabel.textContent=`第 ${itemPage} / ${totalPages} 頁`;
  const next=document.createElement('button');next.className='button secondary compact';next.type='button';next.textContent='下一頁';next.disabled=saving||itemPage>=totalPages;next.dataset.shippingItemPage=String(itemPage+1);
  pager.append(summary,prev,pageLabel,next);root.appendChild(pager);
}
function renderRecords():void{
  if(!storeRef)return;
  const listSection=qs<HTMLElement>('.shipping-list');
  if(!listSection)return;
  let root=qs<HTMLElement>('[data-shipping-records]');
  if(!root){
    root=document.createElement('div');
    root.setAttribute('data-shipping-records','true');
    root.className='shipping-records';
    listSection.appendChild(root);
  }
  const records=storeRef.snapshot.shipping??[];
  root.replaceChildren();
  if(!records.length){
    const empty=document.createElement('div');
    empty.className='empty-state';
    empty.textContent='目前沒有運費紀錄。';
    root.appendChild(empty);
    return;
  }
  const fragment=document.createDocumentFragment();
  for(const r of records){
    const card=document.createElement('article');card.className='shipping-card';card.dataset.shippingDetail=r.id;
    const head=document.createElement('div');const amount=document.createElement('strong');amount.textContent=money(r.amount,r.currency);const date=document.createElement('span');date.textContent=r.date||'未填日期';head.append(amount,date);
    const note=document.createElement('p');note.textContent=`${r.carrier||'未設定物流'}${r.note?` · ${r.note}`:''}`;
    const count=document.createElement('small');count.textContent=`關聯 ${r.itemIds.length} 件周邊`;
    const actions=document.createElement('div');actions.className='shipping-card-actions';
    const edit=document.createElement('button');edit.className='button secondary';edit.type='button';edit.dataset.shippingEdit=r.id;edit.disabled=saving;edit.textContent='編輯';
    const del=document.createElement('button');del.className='button danger';del.type='button';del.dataset.shippingDelete=r.id;del.disabled=saving;del.textContent='刪除';
    actions.append(edit,del);card.append(head,note,count,actions);fragment.appendChild(card);
  }
  root.appendChild(fragment);
}
function render():void{if(!storeRef)return;const records=storeRef.snapshot.shipping??[];const selected=records.find(x=>x.id===editingId);const title=qs<HTMLElement>('[data-shipping-editor-title]');if(title)title.textContent=selected?'編輯運費':'新增運費';setValue('shipping-amount',selected?String(selected.amount):'');setValue('shipping-currency',selected?.currency??'TWD');setValue('shipping-date',selected?.date??'');setValue('shipping-carrier',selected?.carrier??'');setValue('shipping-note',selected?.note??'');const form=qs<HTMLFormElement>('#shipping-form');if(form)form.setAttribute('aria-busy',String(saving));form?.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('input,textarea,select').forEach(el=>{if(!el.matches('[data-shipping-item-checkbox],[data-shipping-item-search],[data-shipping-show-selected]'))el.disabled=saving;});const submit=qs<HTMLButtonElement>('#shipping-form button[type="submit"]');if(submit){submit.disabled=saving;submit.textContent=saving?'同步中…':selected?'儲存修改':'新增運費';}const cancel=qs<HTMLButtonElement>('#shipping-cancel');if(cancel){cancel.hidden=!selected;cancel.disabled=saving;}renderItems(selected);renderRecords();}
async function save(e:SubmitEvent){e.preventDefault();if(!storeRef||saving)return;const form=qs<HTMLFormElement>('#shipping-form');const feedback=ensureFormErrors(form);clearFormErrors(feedback);const amountText=qs<HTMLInputElement>('#shipping-amount')?.value.trim()??'';const amount=Number(amountText);const currency=qs<HTMLInputElement>('#shipping-currency')?.value.trim()||'TWD';const itemIds=[...draftItemIds];const availableItemIds=new Set(allItems().map(item=>item.id));const errors:string[]=[];if(!amountText||!Number.isFinite(amount)||amount<0)errors.push('運費金額必須是大於等於 0 的數字。');if(!itemIds.length)errors.push('請至少選擇一個關聯周邊。');else if(itemIds.some(id=>!availableItemIds.has(id)))errors.push('關聯周邊包含不存在的 Item，請重新選擇。');if(errors.length){setFormErrors(feedback,errors);showToast('請先修正表單中的錯誤。','error');return;}const record:ShippingRecord={id:editingId||`ship-${Date.now().toString(36)}`,amount,currency,date:qs<HTMLInputElement>('#shipping-date')?.value||undefined,carrier:qs<HTMLInputElement>('#shipping-carrier')?.value.trim()||undefined,note:qs<HTMLTextAreaElement>('#shipping-note')?.value.trim()||undefined,itemIds};saving=true;render();showToast(editingId?'運費修改同步中，請稍候。':'運費新增同步中，請稍候。','info');try{await storeRef.saveShipping(record);editingId='';draftRecordId=null;clearFormErrors(ensureFormErrors(form));showToast('運費紀錄已儲存。','success');}catch(e){const message=e instanceof Error?e.message:'儲存運費失敗。';setFormErrors(ensureFormErrors(form),[message]);showToast(message,'error');}finally{saving=false;render();}}
async function remove(id:string){if(!storeRef||saving)return;saving=true;render();showToast('運費刪除同步中，請稍候。','info');try{await storeRef.deleteShipping(id);if(editingId===id){editingId='';draftRecordId=null;}showToast('運費紀錄已刪除。','success');}catch(e){showToast(e instanceof Error?e.message:'刪除運費失敗。','error');}finally{saving=false;render();}}
function bind(){const root=qs<HTMLElement>('#shipping-root');if(!root)return;const form=qs<HTMLFormElement>('#shipping-form');if(form){form.noValidate=true;ensureFormErrors(form);}root.addEventListener('submit',e=>{void save(e as SubmitEvent)});root.addEventListener('input',e=>{const t=e.target as HTMLInputElement;if(t.matches('[data-shipping-item-search]')){const cursor=t.selectionStart??t.value.length;itemSearch=t.value;itemPage=1;renderItems(storeRef?.snapshot.shipping.find(x=>x.id===editingId));const next=qs<HTMLInputElement>('[data-shipping-item-search]');if(next){next.focus();const position=Math.min(cursor,next.value.length);next.setSelectionRange(position,position);}}else if(t.matches('#shipping-amount,#shipping-currency,#shipping-date,#shipping-carrier,#shipping-note')){clearFormErrors(ensureFormErrors(form));}});root.addEventListener('change',e=>{const t=e.target as HTMLInputElement;if(t.matches('[data-shipping-item-checkbox]')){if(t.checked)draftItemIds.add(t.value);else draftItemIds.delete(t.value);clearFormErrors(ensureFormErrors(form));const count=root.querySelector('.shipping-item-filter span');if(count)count.textContent=`只顯示已選 (${draftItemIds.size})`;}else if(t.matches('[data-shipping-show-selected]')){showSelectedItems=t.checked;itemPage=1;renderItems(storeRef?.snapshot.shipping.find(x=>x.id===editingId));}});root.addEventListener('click',async e=>{const t=e.target as Element;const page=t.closest<HTMLElement>('[data-shipping-item-page]');if(page&&!saving){itemPage=Math.max(1,Number(page.dataset.shippingItemPage)||1);renderItems(storeRef?.snapshot.shipping.find(x=>x.id===editingId));return}const edit=t.closest<HTMLElement>('[data-shipping-edit]');if(edit&&!saving){editingId=edit.dataset.shippingEdit||'';draftRecordId=null;itemSearch='';showSelectedItems=false;render();return}const del=t.closest<HTMLElement>('[data-shipping-delete]');if(del&&!saving){if(confirm('確定刪除此筆運費紀錄？'))await remove(del.dataset.shippingDelete||'');return}const card=t.closest<HTMLElement>('[data-shipping-detail]');if(card&&!t.closest('button')&&!saving){const record=recordsById(card.dataset.shippingDetail||'');if(record)openShippingDetail(record,allItems());return}if(t.closest('#shipping-cancel')&&!saving){editingId='';draftRecordId=null;itemSearch='';showSelectedItems=false;render();}})}
const recordsById=(id:string)=>storeRef?.snapshot.shipping.find(record=>record.id===id);
async function init(){storeRef=await getStore();storeRef.subscribe(()=>{if(!saving)render()});render();bind()}
void init();
