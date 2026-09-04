import type { MerchItem, VersionInfo, Work, WorkData, WorksFile } from './types.ts';

export class DataValidationError extends Error {
  constructor(message: string) { super(message); this.name = 'DataValidationError'; }
}
const fail = (path:string, message:string):never => { throw new DataValidationError(`${path}: ${message}`); };
const record = (v:unknown): v is Record<string,unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const obj = (v:unknown,p:string): asserts v is Record<string,unknown> => { if(!record(v)) fail(p,'必須是物件'); };
const arr = (v:unknown,p:string): asserts v is unknown[] => { if(!Array.isArray(v)) fail(p,'必須是陣列'); };
const str = (v:unknown,p:string): asserts v is string => { if(typeof v !== 'string') fail(p,'必須是字串'); };
const num = (v:unknown,p:string): asserts v is number => { if(typeof v !== 'number' || !Number.isFinite(v)) fail(p,'必須是有限數字'); };
const bool = (v:unknown,p:string): asserts v is boolean => { if(typeof v !== 'boolean') fail(p,'必須是布林值'); };

function image(v:unknown,p:string):void { obj(v,p); for(const k of ['id','path','url','sha','alt']) str(v[k],`${p}.${k}`); bool(v.isCover,`${p}.isCover`); }
function item(v:unknown,p:string):asserts v is MerchItem {
  obj(v,p); for(const k of ['id','workId','title','series','category','manufacturer','status','description','notes','createdAt','updatedAt']) str(v[k],`${p}.${k}`);
  arr(v.images,`${p}.images`); v.images.forEach((x,i)=>image(x,`${p}.images[${i}]`));
  arr(v.characters,`${p}.characters`); v.characters.forEach((x,i)=>str(x,`${p}.characters[${i}]`));
  obj(v.purchase,`${p}.purchase`); num(v.purchase.price,`${p}.purchase.price`); for(const k of ['currency','platform','date','url','orderId']) str(v.purchase[k],`${p}.purchase.${k}`);
  obj(v.release,`${p}.release`); for(const k of ['date','expectedDate','receivedDate']) str(v.release[k],`${p}.release.${k}`);
  obj(v.shipping,`${p}.shipping`); for(const k of ['status','method','trackingNumber','note']) str(v.shipping[k],`${p}.shipping.${k}`);
  obj(v.afterSales,`${p}.afterSales`); for(const k of ['status','note','updatedAt']) str(v.afterSales[k],`${p}.afterSales.${k}`);
}

export function validateWorksFile(v:unknown):asserts v is WorksFile { obj(v,'works.json'); num(v.schemaVersion,'works.json.schemaVersion'); arr(v.works,'works.json.works'); const ids=new Set<string>(); v.works.forEach((w,i)=>{const p=`works.json.works[${i}]`;obj(w,p);str(w.id,`${p}.id`);str(w.name,`${p}.name`);str(w.data,`${p}.data`);if(ids.has(w.id))fail(`${p}.id`,'工作 ID 重複');ids.add(w.id);}); }
export function validateWorkData(v:unknown):asserts v is WorkData { obj(v,'work data'); num(v.schemaVersion,'work data.schemaVersion'); for(const k of ['work','name','updatedAt'])str(v[k],`work data.${k}`); arr(v.items,'work data.items'); const ids=new Set<string>(); v.items.forEach((x,i)=>{const p=`work data.items[${i}]`;item(x,p);if(ids.has(x.id))fail(`${p}.id`,'項目 ID 重複');ids.add(x.id);}); }
export function validateVersion(v:unknown):asserts v is VersionInfo { obj(v,'version.json'); str(v.version,'version.json.version'); str(v.updatedAt,'version.json.updatedAt'); if(!/^\d+\.\d+\.\d+$/.test(v.version))fail('version.json.version','版本號格式無效'); }
export function validateDataset(works:Work[],items:MerchItem[]):void { const ids=new Set<string>(); const workIds=new Set(works.map(w=>w.id)); for(const item of items){if(!workIds.has(item.workId))fail(`item.${item.id}.workId`,'指向不存在的作品');if(ids.has(item.id))fail(`item.${item.id}`,'項目 ID 重複');ids.add(item.id);} }
