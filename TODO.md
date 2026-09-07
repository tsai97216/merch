# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。已完成且屬於長期規格的內容移至 `RULES.md`。
> 未完成項目不得提前勾選。
> **流程規則：發現確定問題、可疑邏輯、舊代碼、重複實作或任何需要判斷的地方，必須先加入 TODO，再進行修改或刪除。**
> 優先級原則：先處理資料正確性、核心功能與既有 Bug，再處理 UI / UX，最後才是動效與最終驗收。

## 交接備註｜下一個對話從這裡繼續

- **目前已暫停大量資料輸入，先處理資料載入效能。** 使用者確認目前載入速度已實際影響透過網站新增 Item 與圖片上傳，因此本次可開始進行效能修正。
- **目前正式版本以 `public/data/version.json` 為準；修改前需同步 `package.json`。**
- **資料輸入期間可正常新增、編輯、圖片管理與 Shipping。** 暫時避免刪除仍被 Shipping `itemIds` 參照的 Item。
- 下一次繼續核心正確性工作時，**優先從 P0 Shipping `itemIds` 參照完整性開始**，先確認 Store / API 驗證邊界，再處理 Worker Item deletion 的跨資料參照。
- 若要修改 Worker，注意 `worker/src/index.ts` 曾有過被不完整重寫的回歸風險；不要根據截斷內容盲目整檔重寫，應先取得可靠完整內容或採安全的最小修改方式。

## P0｜核心功能與正確性

1. **Shipping `itemIds` 參照完整性複查**：確認 Store / API 載入與寫入時的驗證邊界，以及刪除 Item 時如何處理仍被 Shipping 參照的 Item，避免產生孤兒運費關聯。Worker 已有遠端存在性驗證，但 Item deletion 的跨資料參照仍待完整確認。
2. **Collection 初始資料載入效能**：目前 Worker `/api/data` 會為建立完整 remote read model 掃描 GitHub tree、所有 category index 與所有 Item `data.json`，造成新增頁／圖片操作前等待時間過長。改為 build-time 產生單一靜態 Collection read model，Frontend 優先直接讀取 GitHub Pages 靜態資料，保留 Worker `/api/data` 作為必要 fallback / mutation authoritative response；不得改變 canonical Item-level 儲存架構，也不得犧牲 Collection 的搜尋、Filter、Sort、狀態篩選功能。
3. **Verify 發現現有 canonical data 結構不完整**：`data/genshin-impact/o/` 存在 Item `GIo001`，但缺少必要的 `index.json`，導致 `verify-data.mjs` / `verify-new-data.mjs` 在 `Verify #862` 於資料完整性步驟直接失敗。需先確認該 Category 是否應保留，以及正確補齊 Category index 的方式，再修改資料或驗證規則。

## P1｜UI / UX 與穩定性

1. **新增／管理／運費介面排版統一**：統一欄位、間距、按鈕、標題、區塊與響應式排版，修正目前跑版問題。
2. **設定頁介面排版統一**：統一欄位、區塊、間距、按鈕與響應式排版，修正目前跑版問題。
3. **收藏排序切換 Light / Dark 顯示修正**：收藏頁排序切換在淺色模式下避免選取／focus 顏色造成文字不可讀；深色模式修正選取背景的圓角與整體狀態樣式。
4. **UI 文本精簡**：刪除新增表單及網站中不必要的 placeholder、提示、解說與副標，只保留真正有助於理解欄位或操作的文字。
5. **Stage 5｜UI / CSS / Responsive**：依 Desktop → Tablet → Mobile 檢查頁面、Modal、Toast、Form、Navigation、dark mode、focus、overflow、z-index、breakpoint、dead CSS 與舊 selector。

## P2｜Motion / Animation

1. **統一動效系統**：一次規劃並實作必要的載入、API 同步、圖片上傳、Modal、Toast、按鈕、收藏卡片、搜尋／篩選／排序、統計、Route、Theme 動效，並支援 `prefers-reduced-motion`。

## P3｜最終驗收與收尾

### Stage 8｜API / Worker / GitHub 寫入

1. **Shipping 參照刪除策略完成實作與驗證**：在確認參照完整性後，決定並實作 Item deletion 遇到 Shipping reference 時的安全處理，避免自動破壞運費／歷史資料。

### Stage 9｜Verification / Build / Deployment

1. **Verification 範圍複查**：確認 Verify scripts 覆蓋核心資料、schema、category、statistics、management、image、Worker architecture / scope / read / image / transaction、version 等契約，避免測試綠燈但漏測關鍵行為。
2. **完整 Verify**：在所有待辦完成後重新執行完整自動化檢查。
3. **Production build / deployment**：最新版本重新確認 Pages build / deploy 與 Worker deploy。

### Stage 10｜Dead Code / Legacy / Consistency Sweep

1. **Dead Code / Legacy / Consistency Sweep**：搜尋舊 function、變數、class、route、欄位、API、TODO / FIXME、debug code、temporary workaround、duplicate implementation，並交叉比對 `RULES.md` ↔ `TODO.md` ↔ Code ↔ Tests ↔ Data。
2. **`merch-old` 相容邏輯持續複查**：保留目前仍有價值的圖片 fallback，但最終驗收時再次確認沒有已失效的舊路徑或舊 selector。

### 最終驗收

1. **Item Detail 實機驗證**：Modal、Router、返回、鍵盤與 focus。
2. **Collection 實機驗證**：search / filter / sort。
3. **Desktop smoke test**。
4. **Mobile smoke test**。
5. **Loading / Empty / Error 狀態驗證**。
6. **版本／資料／schema／圖片／Worker contract 一致性最終確認**。
