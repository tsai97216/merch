# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。已完成且屬於長期規格的內容移至 `RULES.md`。
>
> 未完成項目不得提前勾選。

## 1. Current / 目前待處理

- [ ] 修正管理頁 `management-picker-category` 重複 HTML `id`，並確認作品／類型／流水號選擇與表單同步不受影響
- [ ] **臨時新增：周邊詳情顯示已綁定的運費**：若該周邊有綁定運費資料，Item Detail 內應顯示對應運費資訊；未綁定時不應顯示空白／誤導性內容
- [ ] **UI 文本精簡：新增表單提示文字**：刪除不必要、過度指定或沒有實際幫助的 placeholder／提示，例如新增周邊標題欄位的「例如：流螢主題立牌」等具體示例；保留真正有助於理解欄位用途的必要提示
- [ ] **UI 文本精簡：網站多餘說明文字**：移除首頁、統計圖表及其他頁面中不必要的解說／副標／入口描述，例如首頁「收藏資料庫的總覽入口。所有收藏都在這裡整理。」這類對操作沒有實質幫助的文字；保留必要的欄位名稱、狀態與操作提示
- [ ] **新增／管理／運費介面排版統一**：統一新增、管理、運費相關表單的欄位、間距、按鈕、標題、區塊與響應式排版，修正目前各介面之間的輕微跑版問題
- [ ] **設定頁介面排版統一**：依統一表單／管理介面規範整理設定頁的欄位、區塊、間距、按鈕與響應式排版，修正目前的跑版問題
- [ ] 完成 Desktop smoke test
- [ ] 完成 Mobile smoke test
- [ ] 完成 Collection search / filter / sort 實機驗證
- [ ] 完成 Item Detail 實機驗證，包含 Modal、Router、返回、鍵盤與 focus
- [ ] 完成 Loading / Empty / Error 狀態驗證

## 2. Full Repository Audit / 全倉庫分段健檢

- [x] 第 1 段：Repo 基礎與規則，檢查 `RULES.md`、`TODO.md`、`package.json`、TypeScript / Vite 設定、GitHub Actions / Pages、版本與 CI 基線
- [ ] 第 2 段：檔案架構與舊殘留，盤點 `src/`、`public/`、`scripts/`、API / Worker、CSS、HTML、migration，找出未使用檔案、dead code、舊 route、舊 API 與舊資料格式
  - [x] **模組入口／Legacy 依賴**：已確認 `management.ts`、`statistics.ts`、`shipping.ts`、`works-management.ts`、`category-display.ts` 都由 `index.html` 以 module script 載入；`add.ts` 則由 `category-display.ts` 直接 import，因此這些功能都有實際載入路徑，不判定為未載入 dead code
  - [x] **HTML / entry loading**：已確認 `index.html` 直接載入目前各功能 entry，包含 `version.ts`、`theme.ts`、`image-source.ts`、`main.ts`、`cross-navigation.ts`、`collection-controls.ts`、`detail-focus.ts`、`image-viewer.ts`、`statistics.ts`、`home-enhancements.ts`、`management.ts`、`shipping.ts`、`works-management.ts`、`category-display.ts`、`settings-auth.ts`；功能模組的 CSS 亦由各 TS entry 以 side-effect import 載入。`vite.config.ts` 使用標準 Vite build，未發現額外或異常 entry 設定
  - [ ] **Entry wrapper cleanup**：`category-display.ts` 現在只剩 `import './add';`，功能上是額外 wrapper entry。可評估改成 `index.html` 直接載入 `add.ts` 後移除 wrapper，但需確認不影響既有部署／載入順序
  - [x] **確認並修正 `MutationObserver` 違反既定 UI 規則**：已移除 `src/category-display.ts` 對整個 `document.body` 的 `MutationObserver`，目前僅保留 `add.ts` entry 載入責任
  - [x] **CSS entry inventory**：已確認 `src/card-enhancements.css` 不是 dead CSS，且已透過 `src/ui-refinement.css` 的正式 CSS import 載入；檔案內的 `.quantity-mark`、`.item-top`、badge 與 list media 規則現在會進入正式樣式鏈
  - [x] **文件一致性**：`RULES.md` 的主要 route 清單已補齊 `add`、`shipping` 等目前正式 route
- [x] 第 3 段：Store / State / Data Flow，檢查 API → validation → Store → Router / Page → Render 的一致性、state mutation、stale state、duplicate state、validation 與 race condition
  - [x] **Store immutable baseline**：已確認 Store state 透過 `structuredClone` + deep freeze 建立 immutable snapshot，`setUi`／`replaceData` 均建立新 state，不直接修改既有 snapshot
  - [x] **寫入序列化**：已確認 Item／Shipping 寫入共用 `writeQueue`，避免 Store 內多個遠端寫入同時競爭
  - [x] **Item 基本寫入防護**：`addItem` 檢查所屬作品、永久 Item ID 格式／作品代碼與重複 ID；`updateItem` 以既有 Item 所屬作品重新確認 ID 與作品一致
  - [x] **API response validation gap｜已修正**：`src/api.ts` 現在在 API 邊界驗證 `works`、Work、Item、Image、Purchase / Arrival / AfterSales、Shipping 與版本等結構；`getShipping()` 亦使用運費結構驗證，不再以單純 TypeScript cast 信任 API 回傳
  - [x] **API → Store 回寫一致性**：已確認 Item／Shipping CRUD 的 Store 寫入流程都將 API 回傳資料交給 `applyRemote()`；Work CRUD 則以 `replaceData(data.works,data.version)` 套用作品資料並保留既有 shipping，符合 Work CRUD 不應改動運費資料的狀態語義
  - [x] **Store fallback / race 深查**：已確認 `sharedStorePromise` 成功時共用、失敗時 reset；遠端 Item／Shipping mutation 經 `writeQueue` 串行。API 不可用時進入靜態資料 fallback 是現有 resilience 設計，API schema 現已在邊界驗證，因此不再存在「未驗證資料直接進 Store」的問題；「把 network / HTTP failure 與 data-contract failure 分開呈現」屬可改善項目，不阻塞本階段完成
  - [x] **UI subscription coverage**：已盤點目前 `store.subscribe` 使用點。Management、Shipping、Statistics、Works Management 會訂閱 Store 並在資料變更後更新；Home enhancements、Add 與 Collection controls 屬於事件／快照讀取流程，不需持續訂閱；主頁由 Router / render 流程控制，未發現確定的永久 stale UI
  - [x] **main detail Store reference｜先前誤判已釐清**：`src/main.ts` 的 `appStore` 會在 `loadStore()` 成功後由 `appStore = store` 正確初始化，Detail Modal 的刪除流程因此有實際 Store reference；原先「未初始化」的疑似 Bug 不成立
- [ ] 第 4 段：Router / Navigation / Detail，檢查 route、Refresh、Back / Forward、malformed URL、decode、不存在 Item、搜尋狀態轉跳、Detail Modal 與 focus 管理
- [ ] 第 5 段：UI / CSS / Responsive，依 Desktop → Tablet → Mobile 檢查各頁面、Modal、Toast、Form、Header / Navigation、dark mode、focus、overflow、z-index、breakpoint、dead CSS 與舊 selector
- [ ] 第 6 段：Form / Management / CRUD，檢查新增、編輯、刪除、搜尋、分類、ID、quantity、validation、表單 state、selector、Modal、confirmation、error handling 與 frozen data
- [ ] 第 7 段：圖片系統，檢查 upload、metadata、cover、reorder、replace、delete、格式 / 大小限制、路徑、fallback、orphan / missing image、Worker mutation 與 rollback
- [ ] 第 8 段：API / Worker / GitHub 寫入，逐一檢查 request → validation → read → mutation → transaction → commit，確認 SHA、race condition、rollback、write scope、token 安全與舊 API 殘留
- [ ] 第 9 段：Verification / Build / Deployment，逐一確認現有 verify scripts 的實際覆蓋範圍、build、CI、production deployment，避免測試綠燈但漏測關鍵行為
- [ ] 第 10 段：最終 Dead Code / Legacy / Consistency Sweep，全 repo 搜尋舊 function、變數、class、route、欄位、API、TODO / FIXME、debug code、temporary workaround、duplicate implementation，並交叉比對 RULES ↔ TODO ↔ Code ↔ Tests ↔ Data
- [ ] 每一段健檢完成後分類問題為「正常／可改善／疑似 Bug／確定 Bug／舊殘留」，再決定是否修正，不因發現問題就直接大範圍重寫
- [ ] 每次實際修正後遵守版本 Patch 規則，執行對應驗證並重新檢查受影響範圍

## 3. Verification / 驗證

- [ ] 執行完整 Verify，確認目前版本所有自動化檢查通過
- [ ] 確認最新 production build / deployment 狀態
- [ ] 確認版本、資料完整性、schema、圖片與 Worker contract 維持一致
