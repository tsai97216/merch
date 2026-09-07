# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。已完成且屬於長期規格的內容移至 `RULES.md`。
> 未完成項目不得提前勾選。
> **流程規則：發現確定問題、可疑邏輯、舊代碼、重複實作或任何需要判斷的地方，必須先加入 TODO，再進行修改或刪除。**
> 優先級原則：先處理資料正確性、核心功能與既有 Bug，再處理 UI / UX，最後才是動效與最終驗收。

## P0｜核心功能與正確性

### 執行順序

1. **Stage 4｜Router / Navigation / Detail**：完成 route、Refresh、Back / Forward、malformed URL、decode、不存在 Item、搜尋狀態轉跳、Detail Modal、focus 與鍵盤行為驗證。
   - [x] **Router malformed / unknown route 行為複查**：確認目前安全回復策略不會破壞 Back / Forward、404 語意或原始路由狀態；已移除會把未知路由強制 replace 成 `#/home` 的行為，保留 `#/404` 語意並交由主畫面處理。
2. **Stage 6｜Form / Management / CRUD**：完成新增、編輯、刪除、搜尋、分類、ID、quantity、validation、表單 state、selector、Modal、confirmation、error handling 與 frozen data 驗證。
   - [x] **Management picker 的 Work value / state key 複查**：確認是否應以永久 `work.id` 而非作品名稱作為 selector value，避免名稱重複或改名造成狀態錯綜。
   - [x] **Category mapping duplicate implementation 複查**：`management.ts`、`category-label.ts` 等是否存在重複 category 定義；確認單一來源後再刪除／改寫舊實作。
   - [x] **Management 未使用欄位常數複查**：確認 `managementCategoryFieldId` 無現存引用，屬歷史殘留，無需保留。
   - [x] **Management schema verifier selector 名稱複查**：`verify-management-schema.mjs` 已改為檢查實際 `management-picker-category` 欄位，並改由 `category-label.ts` 驗證「其他」分類來源。
   - [x] **Management schema verifier 的 category-label 來源檢查仍硬編碼舊陣列字面值**：已改為驗證實際 `categoryName`／`o` 映射來源，Verify 已通過該項。
3. **Stage 7｜圖片系統**：完成 upload、metadata、cover、reorder、replace、delete、格式／大小限制、路徑、fallback、orphan / missing image、Worker mutation 與 rollback 驗證。
   - [x] **Management 圖片列表 scope 複查**：確認目前只渲染部分圖片是否為刻意 UI 限制；若不是，需支援完整 images metadata、cover、reorder、replace、delete。已於 1.109.54 改為渲染完整 `images[]`，支援新增、主圖、排序、替換與刪除；Verify #676 已通過。
   - [x] **圖片操作與 saving / API queue 狀態複查**：已於 1.109.55 讓孤兒圖片清理與 upload / replace / delete / cover / reorder 共用 `imageSaving` 互斥，並為圖片與管理 CRUD 操作補上同步中提示；同時限制前端圖片格式為 JPG/JPEG、PNG、WebP、GIF、AVIF 且副檔名需與 MIME 一致；Verify #681 已通過。
   - [x] **Management 圖片刪除失敗後的一致性複查**：目前 `deleteImage()` 先成功寫入空 `images` metadata，再刪除實體檔；若 `deleteAsset()` 失敗，會留下 orphan 實體檔，違反 metadata / files 一致性與刪除 rollback 規則。已於 1.109.54 增加 metadata rollback；Verify #676 已通過。
   - [x] **Management 圖片替換保留 cover 狀態複查**：替換圖片時已以原圖片的 `isCover` 重建 metadata，保留主圖狀態；Verify #681 已通過。
   - [x] **Management 圖片格式限制與 Worker 支援格式一致性複查**：已限制為 JPG/JPEG、PNG、WebP、GIF、AVIF，且要求副檔名與 MIME 對應；Verify #681 的 build 與 image contract 均通過。
   - [x] **Worker 圖片 mutation 版本語意複查**：`putAsset()` 的新增與替換圖片現在都會產生 Patch version，避免 replace 漏增版本。
   - [x] **Worker 圖片 mutation verifier 與實作版本語意不一致**：已改為驗證新增與替換都會 `bumpPatch`，不再要求舊的 `if (!exists)` 分支形狀；Verify #671 已通過。
4. **API 同步強烈回饋**：上傳圖片、修改周邊、新增周邊等透過 API 同步的操作，開始時明確顯示「同步中／上傳中」，完成後明確顯示成功或失敗；同步未完成前不得讓 UI 誤以為資料已完成寫入。

## P1｜UI / UX 與穩定性

1. **新增／管理／運費介面排版統一**：統一欄位、間距、按鈕、標題、區塊與響應式排版，修正目前跑版問題。
2. **設定頁介面排版統一**：統一欄位、區塊、間距、按鈕與響應式排版，修正目前跑版問題。
3. **收藏排序切換 Light / Dark 顯示修正**：收藏頁排序切換在淺色模式下避免選取／focus 顏色造成文字不可讀；深色模式修正選取背景的圓角與整體狀態樣式。
4. **UI 文本精簡**：刪除新增表單及網站中不必要的 placeholder、提示、解說與副標，只保留真正有助於理解欄位或操作的文字。
5. **Stage 5｜UI / CSS / Responsive**：依 Desktop → Tablet → Mobile 檢查頁面、Modal、Toast、Form、Navigation、dark mode、focus、overflow、z-index、breakpoint、dead CSS 與舊 selector。

## P2｜Motion / Animation

1. **統一動效系統**：一次規劃並實作必要的載入、API 同步、圖片上傳、Modal、Toast、按鈕、收藏卡片、搜尋／篩選／排序、統計、Route、Theme 動效，並支援 `prefers-reduced-motion`。

## P3｜最終驗收與收尾

### Full Repository Audit

1. **Stage 8｜API / Worker / GitHub 寫入**：確認 request → validation → read → mutation → transaction、SHA、race condition、rollback、write scope、token 安全與舊 API 殘留。
   - [x] **Worker Item ID → Work 對應方式複查**：已由 `startsWith(work.code)` 改為解析永久 Item ID 的完整 Work Code 後精確比對，避免作品代碼前綴碰撞誤綁。
   - [x] **Worker 新增 Item 全域 ID 唯一性複查**：新增 Item 前改由完整 repository remote state 驗證 `remote.items.has(id)`，不再只檢查目標 category。
   - [x] **Worker `loadRemote()` 重複 Item ID 複查**：已在建立 remote Item Map 時檢查 `items.has(item.id)`，發現重複 Item ID 立即拒絕資料異常，不再讓後載入項目靜默覆蓋前一筆；Verify #671 已通過。
2. **Stage 9｜Verification / Build / Deployment**：確認 Verify scripts 覆蓋範圍、build、CI 與 production deployment，避免測試綠燈但漏測關鍵行為。
3. **Stage 10｜Dead Code / Legacy / Consistency Sweep**：搜尋舊 function、變數、class、route、欄位、API、TODO / FIXME、debug code、temporary workaround、duplicate implementation，並交叉比對 RULES ↔ TODO ↔ Code ↔ Tests ↔ Data。
   - [x] **`merch-old` 圖片 fallback 舊相容邏輯複查**：目前 canonical data 未引用舊 `merch-old` 圖片路徑，但舊 repo 仍保有舊圖片資料，因此 fallback 仍有相容價值，暫不刪除。

### 最終驗收

4. **Item Detail 實機驗證**：Modal、Router、返回、鍵盤與 focus。
5. **Collection 實機驗證**：search / filter / sort。
6. **Desktop smoke test**。
7. **Mobile smoke test**。
8. **Loading / Empty / Error 狀態驗證**。

### Verification

9. **完整 Verify**：目前版本所有自動化檢查通過。
10. **Production build / deployment**：最新版本需重新確認 Pages build / deploy 與 Worker deploy。
11. **版本／資料／schema／圖片／Worker contract 一致性**：確認各項契約維持一致。