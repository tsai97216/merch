import './add.css';
import { buildNextItemId } from './item-id';
import { getStore } from './store';
import { showToast } from './utils/toast';
import type { Item } from './types';

const categories = [['b','徽章／吧唧'],['c','卡片'],['d','立牌／擺件'],['e','電子產品'],['f','手辦／模型'],['g','文具'],['h','海報／掛畫／掛軸'],['k','掛件／吊飾'],['l','文件／資料夾'],['m','書籍／漫畫'],['n','明信片'],['o','其他'],['p','毛絨／布偶'],['q','鑰匙圈'],['r','雷射票'],['s','色紙'],['v','服飾'],['w','餐具／生活用品'],['y','特典']] as const;
const qs = <T extends Element>(selector:string, root:ParentNode=document) => root.querySelector<T>(selector);
const value = (id:string) => (qs<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>(`#${id}`)?.value ?? '').trim();

function render():void {
  const root = qs<HTMLElement>('#add-root'); if (!root) return;
  void getStore().then(store => {
    const works = store.snapshot.works;
    root.innerHTML = `<form class="add-form" id="add-form">
      <div class="add-section"><div class="add-section-heading"><span>01</span><div><h2>基本資料</h2><p>建立收藏資料。圖片儲存後可到管理頁處理。</p></div></div>
        <div class="add-grid"><label><span>作品 <b>*</b></span><select id="add-work" required>${works.map(w=>`<option value="${w.id}">${w.name} (${w.code})</option>`).join('')}</select></label>
        <label><span>類型 <b>*</b></span><select id="add-category" required>${categories.map(([c,n])=>`<option value="${c}">${n}</option>`).join('')}</select></label>
        <label class="wide"><span>標題 <b>*</b></span><input id="add-title" required maxlength="200" placeholder="例如：流螢主題立牌"></label>
        <label><span>系列</span><input id="add-series" placeholder="多個項目請用逗號分隔"></label><label><span>角色</span><input id="add-characters" placeholder="多個角色請用逗號分隔"></label>
        <label><span>製造商</span><input id="add-manufacturer"></label><label><span>數量 <b>*</b></span><input id="add-quantity" type="number" min="1" step="1" value="1" required></label>
        <label><span>狀態 <b>*</b></span><select id="add-status"><option value="pending">待到貨</option><option value="preorder">預購中</option><option value="received">已收到</option></select></label></div></div>
      <div class="add-section"><div class="add-section-heading"><span>02</span><div><h2>購買資訊</h2><p>商品價格與運費分開記錄。</p></div></div>
        <div class="add-grid"><label><span>單價</span><input id="add-price" type="number" min="0" step="0.01"></label><label><span>幣別</span><input id="add-currency" value="TWD"></label><label><span>平台</span><input id="add-platform" placeholder="淘寶、蝦皮、官方商店…"></label><label><span>購買日期</span><input id="add-purchase-date" type="date"></label></div></div>
      <div class="add-section"><div class="add-section-heading"><span>03</span><div><h2>到貨與備註</h2></div></div>
        <div class="add-grid"><label><span>預計到貨</span><input id="add-expected-date" type="date"></label><label><span>收到日期</span><input id="add-received-date" type="date"></label><label class="wide"><span>商品描述</span><textarea id="add-description" rows="3"></textarea></label><label class="wide"><span>備註</span><textarea id="add-notes" rows="3"></textarea></label></div></div>
      <div class="add-actions"><a class="button secondary" href="#/management">前往管理</a><button class="button" type="submit">＋ 新增收藏</button></div>
    </form>`;
    qs<HTMLFormElement>('#add-form')?.addEventListener('submit', e => { void submit(e); });
    if (!works.length) showToast('目前沒有可用的作品，請先建立作品。','error');
  }).catch(error => showToast(error instanceof Error ? error.message : '新增頁載入失敗。','error'));
}

async function submit(event:SubmitEvent):Promise<void> {
  event.preventDefault(); const store = await getStore(); const work = store.snapshot.works.find(w=>w.id===value('add-work')) ?? store.snapshot.works[0];
  if (!work) { showToast('目前沒有可用的作品。','error'); return; }
  const title=value('add-title'), quantity=Number(value('add-quantity')), priceText=value('add-price'), category=value('add-category');
  if (!title) { showToast('標題為必填欄位。','error'); return; }
  if (!Number.isInteger(quantity) || quantity<1) { showToast('數量必須是大於等於 1 的整數。','error'); return; }
  if (priceText && (!Number.isFinite(Number(priceText)) || Number(priceText)<0)) { showToast('價格必須是大於等於 0 的數字。','error'); return; }
  const item:Item={id:buildNextItemId(store.snapshot.items.map(x=>x.id),work.code,category),workId:work.id,workName:work.name,title,series:value('add-series').split(',').map(x=>x.trim()).filter(Boolean),characters:value('add-characters').split(',').map(x=>x.trim()).filter(Boolean),category,manufacturer:value('add-manufacturer'),quantity,status:value('add-status') as Item['status'],description:value('add-description'),notes:value('add-notes'),purchase:{price:priceText?Number(priceText):undefined,currency:value('add-currency')||undefined,platform:value('add-platform')||undefined,date:value('add-purchase-date')||undefined},arrival:{expectedDate:value('add-expected-date')||undefined,receivedDate:value('add-received-date')||undefined},afterSales:{},images:[]};
  const button=qs<HTMLButtonElement>('#add-form button[type="submit"]'); if(button) button.disabled=true;
  try { await store.addItem(item); sessionStorage.setItem('merch-management-selected-id',item.id); showToast('收藏已新增。','success'); location.hash='#/management'; }
  catch(error){showToast(error instanceof Error?error.message:'新增收藏失敗。','error');} finally{if(button)button.disabled=false;}
}
void getStore().then(render).catch(()=>undefined);
window.addEventListener('hashchange',()=>{if(location.hash==='#/add'||location.hash==='#add')render();});
