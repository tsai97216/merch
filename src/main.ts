import "./main.css";
import { loadAppData } from "./data.ts";
import type { AppData, MerchItem } from "./types.ts";

const root = document.getElementById("app");
if (!root) throw new Error("Missing #app");

const esc = (v: string) => { const d = document.createElement("div"); d.textContent = v; return d.innerHTML; };
const money = (i: MerchItem) => new Intl.NumberFormat("zh-TW", { style: "currency", currency: i.purchase.currency || "TWD", maximumFractionDigits: 0 }).format(i.purchase.price);
const date = (v: string) => v ? new Intl.DateTimeFormat("zh-TW").format(new Date(v + "T00:00:00")) : "未設定";

function stat(a: string, b: string) { return "<article><small>" + esc(a) + "</small><strong>" + esc(b) + "</strong></article>"; }
function row(i: MerchItem, data: AppData) { const w = data.works.find(x => x.id === i.workId)?.name || i.workId; return '<a class="row" href="#/item/' + encodeURIComponent(i.id) + '"><span>' + esc(w) + '</span><b>' + esc(i.title) + '</b><em>' + money(i) + '</em></a>'; }
function card(i: MerchItem, data: AppData) { const img = i.images.find(x => x.isCover) || i.images[0]; const w = data.works.find(x => x.id === i.workId)?.name || i.workId; return '<a class="card" href="#/item/' + encodeURIComponent(i.id) + '">' + (img ? '<img src="' + esc(img.url) + '" alt="' + esc(img.alt || i.title) + '">' : '<div class="no-image">NO IMAGE</div>') + '<small>' + esc(w) + '</small><h3>' + esc(i.title) + '</h3><p>' + money(i) + " · " + esc(i.status) + "</p></a>"; }

function home(el: HTMLElement, data: AppData) {
 el.innerHTML = '<section class="hero"><small>COLLECTION</small><h1>我的收藏</h1><p>集中管理收藏、發售、物流與售後資訊。</p></section><section class="stats">' + stat("總收藏", data.items.length + " 件") + stat("已收到", data.items.filter(i => i.status === "received").length + " 件") + stat("預購中", data.items.filter(i => i.status === "preorder").length + " 件") + '</section><section class="panel"><h2>最近更新</h2>' + data.items.slice().sort((a,b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0,8).map(i => row(i,data)).join("") + "</section>";
}
function collection(el: HTMLElement, data: AppData) {
 el.innerHTML = '<section class="heading"><small>COLLECTION</small><h1>收藏</h1><input id="q" type="search" placeholder="搜尋標題、角色、作品、廠商"></section><section id="grid" class="grid"></section>";
 const draw = () => { const q = (document.getElementById("q") as HTMLInputElement).value.trim().toLocaleLowerCase(); const xs = data.items.filter(i => [i.title,i.series,i.category,i.manufacturer,i.workId,...i.characters].join(" ").toLocaleLowerCase().includes(q)); document.getElementById("grid")!.innerHTML = xs.map(i => card(i,data)).join("") || "<p>沒有符合條件的收藏。</p>"; };
 document.getElementById("q")!.addEventListener("input", draw); draw();
}
function statistics(el: HTMLElement, data: AppData) {
 const total = data.items.reduce((s,i) => s + i.purchase.price, 0);
 el.innerHTML = '<section class="heading"><small>STATISTICS</small><h1>統計</h1></section><section class="stats">' + stat("收藏數",data.items.length+" 件") + stat("總支出",new Intl.NumberFormat("zh-TW",{style:"currency",currency:"TWD",maximumFractionDigits:0}).format(total)) + "</section>";
}
function detail(el: HTMLElement, data: AppData, id: string) {
 const i = data.items.find(x => x.id === id);
 if (!i) { el.innerHTML = '<section class="panel"><h1>找不到收藏</h1></section>'; return; }
 const w = data.works.find(x => x.id === i.workId)?.name || i.workId;
 el.innerHTML = '<section class="heading"><small>ITEM</small><h1>' + esc(i.title) + '</h1></section><section class="panel detail"><div class="gallery">' + i.images.map(x => '<img src="' + esc(x.url) + '" alt="' + esc(x.alt || i.title) + '">').join("") + '</div><div><p>作品：' + esc(w) + '</p><p>狀態：' + esc(i.status) + '</p><p>價格：' + money(i) + '</p><p>購買日期：' + date(i.purchase.date) + '</p><p>預計發售：' + date(i.release.expectedDate) + '</p><p>物流：' + esc(i.shipping.status) + '</p><p>售後：' + esc(i.afterSales.status) + '</p><p>' + esc(i.description) + '</p></div></section>';
}
function render(data: AppData) {
 root.innerHTML = '<header><b>CHI MERCH</b><nav><a href="#/">首頁</a><a href="#/collection">收藏</a><a href="#/statistics">統計</a></nav></header><main id="page"></main><footer>v' + esc(data.version.version) + '</footer>';
 const page = document.getElementById("page")!;
 const route = location.hash.replace(/^#\/?/, "");
 if (route === "collection") collection(page,data);
 else if (route === "statistics") statistics(page,data);
 else if (route.startsWith("item/")) detail(page,data,decodeURIComponent(route.slice(5)));
 else home(page,data);
}
let cached: AppData | null = null;
async function boot() {
 try { cached = cached || await loadAppData(); render(cached); }
 catch (e) { root.innerHTML = '<div class="error"><h1>載入失敗</h1><p>' + esc(e instanceof Error ? e.message : "未知錯誤") + '</p><button onclick="location.reload()">重新載入</button></div>'; }
}
window.addEventListener("hashchange", () => { if (cached) render(cached); else void boot(); });
void boot();
