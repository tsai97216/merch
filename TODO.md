# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。已完成且屬於長期規格的內容移至 `RULES.md`。
> 未完成項目不得提前勾選。
> 優先級原則：先處理資料正確性、核心功能與既有 Bug，再處理 UI / UX，最後才是動效與最終驗收。

## P0｜核心功能與正確性

### 目前待處理

- [ ] **API 同步強烈回饋**：上傳圖片、修改周邊、新增周邊等透過 API 同步的操作，開始時明確顯示「同步中／上傳中」，完成後明確顯示成功或失敗；同步未完成前不得讓 UI 誤以為資料已完成寫入。

### Full Repository Audit

- [ ] **Stage 4｜Router / Navigation / Detail**：完成 route、Refresh、Back / Forward、malformed URL、decode、不存在 Item、搜尋狀態轉跳、Detail Modal、focus 與鍵盤行為驗證。
- [ ] **Stage 6｜Form / Management / CRUD**：完成新增、編輯、刪除、搜尋、分類、ID、quantity、validation、表單 state、selector、Modal、confirmation、error handling 與 frozen data 驗證。
- [ ] **Stage 7｜圖片系統**：完成 upload、metadata、cover、reorder、replace、delete、格式／大小限制、路徑、fallback、orphan / missing image、Worker mutation 與 rollback 驗證。

## P1｜UI / UX 與穩定性

### 目前待處理

- [ ] **新增／管理／運費介面排版統一**：統一欄位、間距、按鈕、標題、區塊與響應式排版，修正目前跑版問題。
- [ ] **設定頁介面排版統一**：統一欄位、區塊、間距、按鈕與響應式排版，修正目前跑版問題。
- [ ] **收藏排序切換 Light / Dark 顯示修正**：收藏頁排序切換在淺色模式下避免選取／focus 顏色造成文字不可讀；深色模式修正選取背景的圓角與整體狀態樣式。
- [ ] **UI 文本精簡**：刪除新增表單及網站中不必要的 placeholder、提示、解說與副標，只保留真正有助於理解欄位或操作的文字。

### Full Repository Audit

- [ ] **Stage 5｜UI / CSS / Responsive**：依 Desktop → Tablet → Mobile 檢查頁面、Modal、Toast、Form、Navigation、dark mode、focus、overflow、z-index、breakpoint、dead CSS 與舊 selector。

## P2｜Motion / Animation

- [ ] **統一動效系統**：一次規劃並實作必要的載入、API 同步、圖片上傳、Modal、Toast、按鈕、收藏卡片、搜尋／篩選／排序、統計、Route、Theme 動效，並支援 `prefers-reduced-motion`。

## P3｜最終驗收與收尾

### Full Repository Audit

- [ ] **Stage 8｜API / Worker / GitHub 寫入**：確認 request → validation → read → mutation → transaction → commit、SHA、race condition、rollback、write scope、token 安全與舊 API 殘留。
- [ ] **Stage 9｜Verification / Build / Deployment**：確認 Verify scripts 覆蓋範圍、build、CI 與 production deployment，避免測試綠燈但漏測關鍵行為。
- [ ] **Stage 10｜Dead Code / Legacy / Consistency Sweep**：搜尋舊 function、變數、class、route、欄位、API、TODO / FIXME、debug code、temporary workaround、duplicate implementation，並交叉比對 RULES ↔ TODO ↔ Code ↔ Tests ↔ Data。

### 最終驗收

- [ ] **Item Detail 實機驗證**：Modal、Router、返回、鍵盤與 focus。
- [ ] **Collection 實機驗證**：search / filter / sort。
- [ ] **Desktop smoke test**。
- [ ] **Mobile smoke test**。
- [ ] **Loading / Empty / Error 狀態驗證**。

### Verification

- [ ] **完整 Verify**：目前版本所有自動化檢查通過。
- [ ] **Production build / deployment**：確認最新版本已成功建置並部署。
- [ ] **版本／資料／schema／圖片／Worker contract 一致性**：確認各項契約維持一致。
