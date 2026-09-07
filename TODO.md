# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。已完成且屬於長期規格的內容移至 `RULES.md`。
> 未完成項目不得提前勾選。
> 優先級原則：先處理會影響資料正確性、核心功能與既有 Bug 的項目，再處理 UI / UX，最後才是動效與最終驗收。

## P0｜核心功能與正確性

### 1. Current / 目前待處理

- [x] **周邊詳情顯示已綁定的運費**：若該周邊有綁定運費資料，Item Detail 內應顯示對應運費資訊；未綁定時不應顯示空白／誤導性內容
- [ ] **API 同步強烈回饋**：上傳圖片、修改周邊、新增周邊等會透過 API 同步的操作，在同步開始時顯示明確的「同步中／上傳中」狀態；API 完成後明確顯示成功或失敗，且同步未完成前不得讓使用者誤以為資料已完成寫入

### 3. Full Repository Audit / 全倉庫分段健檢

- [ ] 第 4 段：Router / Navigation / Detail，檢查 route、Refresh、Back / Forward、malformed URL、decode、不存在 Item、搜尋狀態轉跳、Detail Modal 與 focus 管理
- [ ] 第 6 段：Form / Management / CRUD，檢查新增、編輯、刪除、搜尋、分類、ID、quantity、validation、表單 state、selector、Modal、confirmation、error handling 與 frozen data
- [ ] 第 7 段：圖片系統，檢查 upload、metadata、cover、reorder、replace、delete、格式 / 大小限制、路徑、fallback、orphan / missing image、Worker mutation 與 rollback

## P1｜UI / UX 與穩定性

### 1. Current / 目前待處理

- [ ] **新增／管理／運費介面排版統一**：統一新增、管理、運費相關表單的欄位、間距、按鈕、標題、區塊與響應式排版，修正目前各介面之間的輕微跑版問題
- [ ] **設定頁介面排版統一**：依統一表單／管理介面規範整理設定頁的欄位、區塊、間距、按鈕與響應式排版，修正目前的跑版問題
- [ ] **UI 文本精簡：新增表單提示文字**：刪除不必要、過度指定或沒有實際幫助的 placeholder／提示；保留真正有助於理解欄位用途的必要提示
- [ ] **UI 文本精簡：網站多餘說明文字**：移除首頁、統計圖表及其他頁面中不必要的解說／副標／入口描述；保留必要的欄位名稱、狀態與操作提示

### 3. Full Repository Audit / 全倉庫分段健檢

- [ ] 第 5 段：UI / CSS / Responsive，依 Desktop → Tablet → Mobile 檢查各頁面、Modal、Toast、Form、Header / Navigation、dark mode、focus、overflow、z-index、breakpoint、dead CSS 與舊 selector

## P2｜Motion / Animation 動效系統

> 統一規劃後一次實作，避免各頁面各自建立不同的動畫與回饋規則。所有動效都應以操作回饋、狀態轉換與可理解性為目的，並支援 `prefers-reduced-motion`。

### 2. Motion / Animation 動效系統

- [ ] **網站初始資料載入過渡動畫**：網站啟動後，在必要資料尚未載入完成前維持進場過渡動畫；待初始資料完整載入後結束過渡並正式展示網站內容，避免白屏、內容閃現或突然跳轉
- [ ] **API 同步狀態動效**：新增、修改、刪除、圖片上傳等 API 寫入操作，統一提供「同步中／上傳中 → 成功／失敗」的明確動畫與結果彈窗；同步完成前不得讓 UI 呈現為已完成狀態
- [ ] **圖片上傳動效**：圖片選取、處理、上傳、完成與失敗提供清楚的進度／狀態回饋，縮圖加入適度淡入與完成狀態動畫
- [ ] **Modal 動效**：新增、編輯、詳情、確認等 Modal 統一開啟／關閉 transition，並確保 focus 與鍵盤行為不受動畫影響
- [ ] **Toast／操作回饋動效**：收藏、排序、篩選、設定變更等輕量操作提供一致的出現／消失與成功／失敗回饋
- [ ] **按鈕互動動效**：統一 Hover、Focus、Press、Loading、Disabled 等狀態的視覺回饋，特別是儲存、新增、刪除等關鍵操作
- [ ] **收藏卡片動效**：Desktop 提供適度 Hover／Focus／Press 回饋；Mobile 不依賴 Hover，避免觸控裝置產生奇怪狀態
- [ ] **搜尋／篩選／排序動效**：資料列表更新、Empty State 與結果變化提供低干擾 transition，不做大幅飛入飛出
- [ ] **統計數字／圖表動效**：統計數值變化與圖表首次呈現提供適度進場／更新動畫，避免影響資訊閱讀
- [ ] **Route／頁面切換動效**：主要頁面切換加入短促、低干擾的 transition，避免內容瞬間跳換
- [ ] **Light／Dark Theme 切換動效**：主題切換提供短暫且穩定的視覺過渡，避免閃爍
- [ ] **Motion Accessibility**：完整支援 `prefers-reduced-motion`，使用者要求減少動畫時降低或停用非必要動效
- [ ] **動效一致性驗證**：統一 duration、easing、transition 規則、狀態語意與 z-index／overlay 行為，避免各頁面自行定義互相衝突的動畫

## P3｜最終驗收與全倉庫收尾

### 3. Full Repository Audit / 全倉庫分段健檢

- [ ] 第 8 段：API / Worker / GitHub 寫入，逐一檢查 request → validation → read → mutation → transaction → commit，確認 SHA、race condition、rollback、write scope、token 安全與舊 API 殘留
- [ ] 第 9 段：Verification / Build / Deployment，逐一確認現有 verify scripts 的實際覆蓋範圍、build、CI、production deployment，避免測試綠燈但漏測關鍵行為
- [ ] 第 10 段：最終 Dead Code / Legacy / Consistency Sweep，全 repo 搜尋舊 function、變數、class、route、欄位、API、TODO / FIXME、debug code、temporary workaround、duplicate implementation，並交叉比對 RULES ↔ TODO ↔ Code ↔ Tests ↔ Data

### 1. Current / 目前待處理

- [ ] 完成 Item Detail 實機驗證，包含 Modal、Router、返回、鍵盤與 focus
- [ ] 完成 Collection search / filter / sort 實機驗證
- [ ] 完成 Desktop smoke test
- [ ] 完成 Mobile smoke test
- [ ] 完成 Loading / Empty / Error 狀態驗證

### 4. Verification / 驗證

- [ ] 執行完整 Verify，確認目前版本所有自動化檢查通過
- [ ] 確認最新 production build / deployment 狀態
- [ ] 確認版本、資料完整性、schema、圖片與 Worker contract 維持一致
