# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。已完成且屬於長期規格的內容移至 `RULES.md`。
> 未完成項目不得提前勾選。
> **流程規則：發現確定問題、可疑邏輯、舊代碼、重複實作或任何需要判斷的地方，必須先加入 TODO，再進行修改或刪除。**
> 優先級原則：先處理資料正確性、核心功能與既有 Bug，再處理 UI / UX，最後才是動效與最終驗收。

## 交接備註｜下一個對話從這裡繼續

- **目前已暫停大量資料輸入，先處理資料載入效能。** 使用者確認目前載入速度已實際影響透過網站新增 Item 與圖片上傳，因此本次可開始進行效能修正。
- **目前正式版本以 `public/data/version.json` 為準；修改前需同步 `package.json`。** 目前版本為 `1.109.95`。
- **資料輸入期間可正常新增、編輯、圖片管理與 Shipping。** Item 若仍被 Shipping `itemIds` 參照，Worker 會拒絕刪除。
- **1.109.95 的 GitHub Actions 已確認：Verify、Build、Deploy 全部成功。** Verify job 的所有驗證 steps 均成功，不再視為待確認。
- 若要修改 Worker，注意 `worker/src/index.ts` 曾有過被不完整重寫的回歸風險；不要根據截斷內容盲目整檔重寫，應先取得可靠完整內容或採安全的最小修改方式。
- **目前已完成兩輪 Worker mutation 效能最佳化。** ① `loadRemoteForNewItem()` 已改為只讀 `baseRemote()` + 目標作品 category indexes，並在該作品範圍內確認 Item ID 不重複；② Work / Shipping mutation 已改為 commit 後直接套用 mutation snapshot 產生 response，避免再次完整 `loadRemote()`。
- **Worker 效能最佳化的安全邊界：** 不可拿被截斷的 `worker/src/index.ts` 回傳內容整檔重建；不可把 `public/data/collection.json` 當成 Worker mutation 的權威資料來源；不可用不可靠的 Worker isolate cache 取代 latest-head 驗證；atomic commit、latest-head、完整資料契約與安全驗證必須保留。
- **目前已確認的主要剩餘效能瓶頸：** Item 新增／編輯／刪除在 commit 後仍需要透過 `dataResponse()` 建立完整 Collection response，會再次完整掃描 Git tree、所有 category index 與所有 Item JSON。這是下一個評估目標。
- **Item mutation response 優化必須先完成 API contract / Store mutation semantics 設計與驗證，再決定是否實作。** 不得直接把 target-scoped `RemoteState` 當成完整 Collection response，也不得直接以靜態 `public/data/collection.json` 取代 Worker 權威資料。
- **舊 `loadNewStaticData()` 暫不刪除。** 它仍是 `getRemoteData()` 失敗後的最後 fallback，只有在新的資料載入與 fallback 路徑充分驗證後，才能進行 cleanup。

## P0｜核心功能與正確性

1. **Shipping `itemIds` 參照完整性複查**：程式層修正已完成，且 1.109.95 Verify 已成功；最終仍需在實機驗收中確認使用者流程。
2. **Collection 初始資料載入效能**：目前已建立 build-time 單一靜態 Collection read model，Frontend `getRemoteData()` 優先讀取 `./data/collection.json`，Worker `/api/data` 保留為 fallback / mutation authoritative response。`sync-public-data.mjs` 與 `generate-collection.mjs` 已納入 build。仍需實際確認部署後初始載入、fallback、搜尋、Filter、Sort 與新增／圖片操作等待時間，並清理舊的逐 Item 靜態載入邏輯。
   - **Item mutation response 效能瓶頸**：已確認 Item mutation 完成後仍透過 `dataResponse()` 重新完整載入 Collection。下一步先設計並驗證 API contract / Store 精確更新方案，再決定是否修改。
   - **新增 Item 前置讀取縮減**：已完成最小化讀取，使用 `baseRemote()` + 目標作品 category indexes，避免預先載入所有作品 Item JSON；仍保留該作品範圍的 ID 重複檢查。
3. **Verify #862 發現的 Genshin `o/index.json` 缺失**：已補齊 `data/genshin-impact/o/index.json`，並同步版本至 `1.109.92`；後續完整 Verify 已通過，沒有因此保留未確認狀態。
4. **待新增作品：明日方舟：終末地（Arknights: Endfield）**：ID `arknights-endfield`、代號 `AKE`。目前僅記錄於 TODO，尚未加入正式作品資料。

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

1. **Shipping 參照刪除策略完成實作與驗證**：實作與自動化 Verify 已完成；Item 被 Shipping `itemIds` 參照時安全拒絕刪除，仍需在最終實機流程確認。

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
6. **版本／資料／schema／圖片／Worker contract 一致性最終確認。**
