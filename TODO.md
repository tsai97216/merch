# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。以下順序先處理「共用根基／跨頁影響／後續工作會依賴的結構」，再處理具體頁面功能，最後集中處理實機／回歸／發布驗收。已完成的一次性工作移出；已確立且會長期影響開發的規則放在 `RULES.md`。

## Current state

- **目前正式版本：`1.109.243`。**
- 每次更新 TODO 時，需重新檢查剩餘項目與優先級。
- `package.json` 與 `public/data/version.json` 已確認同步。
- 本輪手機實機已完整逛過七頁；未特別指出的頁面／區域，本輪視為未發現問題，不重複列為工作。
- 本輪已確認問題：Collection 搜尋 focus 重複綠色框、Item Detail 背景透明、Statistics Detail 手機版資訊過度擁擠、Add 日期控制項版面問題、Management「共 N 筆收藏」跑版。
- Shipping 本輪未發現新增問題；Settings 本輪未發現新增問題，相關驗收統一移至本文最後。
- 本次重新排序原則：**共用 foundation → 跨頁 responsive／資訊架構 → 共用 feedback → 具體 UI 問題 → 頁面功能 → 資料／統計 → 新作品 → 最終驗收／發布**。

# 第一階段｜開發與修正

## P0｜共用 UI 與跨頁根基

### 1. Shared Field / Layout 最後收斂
- [ ] 檢查各頁重複 Field、layout、control 尺寸與 spacing 規則。
- [ ] 日期、文字、Select 等共用控制項尺寸與對齊統一。
- [ ] 檢查共用 Input 的 focus／outline、Modal / Surface、Toolbar / count 等基礎結構，確保後續頁面修正都建立在同一 foundation 上。
- [ ] 不以 page-specific CSS workaround 掩蓋共用元件問題。

### 2. 全站 Responsive：Mobile / Tablet / iPad 結構整理
- [ ] 完成全站手機版適配調整；先處理會影響多頁的 responsive foundation，再進入最後驗收。
- [ ] 手機直向卡片型內容以可讀性優先，必要時由 4 欄降為 2 欄，並重新安排資訊層級。
- [ ] 全面整理首頁、收藏、統計、新增、管理、運費、設定七頁的 responsive 結構，不只修已發現的頁面。
- [ ] 手機橫向需處理橫向滾動、按鈕切割、文字重疊、Modal 超出 viewport 等結構問題。
- [ ] Responsive 相關修改集中於 `src/responsive-refinement.css`，不新增分散 breakpoint，也不以 page-specific workaround 修補共用問題。
- [ ] 手機內容框、Header、Mobile Navigation 與主內容維持一致的 mobile frame spacing，內容區可合理放寬。
- [ ] 首頁「作品消費排行」的長條與右側金額需保留獨立空間，避免長條壓縮／擠到金額。

### 3. 新增／管理／運費驗證回饋 foundation
- [ ] 在「新增」、「管理」、「運費」相關表單／流程中明確接入一致的驗證狀態。
- [ ] 沿用 shared Feedback / Badge / Field foundation，不建立各頁獨立版本。
- [ ] Add / Management 使用既有 `.form-errors` 承擔欄位／表單錯誤；Toast 保留同步／操作結果用途。
- [ ] Shipping 的 amount／關聯 Item 驗證失敗接入同一 `form-feedback` foundation；Toast 僅作摘要／同步／操作結果回饋。

## P0｜目前已確認的共用／高影響 UI 問題

### 4. Collection 搜尋 focus
- [ ] 修正 Collection 搜尋框 focus 時出現兩個綠色框的重複 focus／outline 視覺問題。
- [ ] 從共用 Input / focus foundation 或正確 DOM 結構處理，不以 page-specific CSS workaround 掩蓋。

### 5. Item Detail Modal
- [ ] 修正 Item Detail Modal 背景透明導致內容辨識度不足的問題。
- [ ] 沿用既有 shared Modal / Surface foundation，不建立 Detail 專用的第二套 Modal 視覺系統。

### 6. Add 日期控制項
- [ ] 修正 Add 頁日期控制項仍存在的實機版面問題。
- [ ] 從共用 Field / Date control 根因處理，不以 Add page-specific workaround 掩蓋。

### 7. Management「共 N 筆收藏」
- [ ] 修正 Management 手機版「共 N 筆收藏」文字跑版。
- [ ] 從共用 Toolbar / layout 結構處理，不只針對該文字加局部定位。

### 8. Statistics Detail Mobile 重新設計
- [ ] 重新整理 Statistics Detail 的手機版資訊架構與版面。
- [ ] 上方統計資訊不得直接將 Desktop 版壓縮成一團；需重新分層、排列資訊。
- [ ] Detail 內容以手機可讀性、資訊層級與操作空間為優先。
- [ ] 手機版重整不得破壞既有 Desktop / Tablet 結構。

## P1｜各頁共用控制與頁面結構

### 9. 收藏控制列重新設計
- [ ] 重新整理「狀態、類型、排序、顯示方式」四組 Collection controls 的資訊層級與操作方式。
- [ ] 狀態完整支援「全部、待到貨、預購中、已收到」，並與既有 Collection filter state 保持一致。
- [ ] 類型、排序與顯示方式採一致的 shared control 視覺語言，避免原生 Select 與 segmented control 混雜造成操作層級不清。
- [ ] Desktop / Tablet / Mobile 均保持清楚分組、可讀性與觸控尺寸，不以額外 page-specific workaround 修補。
- [ ] Mobile 明確採三列資訊架構：第一列搜尋；第二列狀態／類型；第三列排序／顯示方式。
- [ ] 排序與顯示方式放在同一組並靠右排列，不與狀態／類型互相擠壓。
- [ ] 移除 Collection intro「收藏資料庫的總覽入口。所有收藏都在這裡整理。」避免控制列前資訊過載。

### 10. 新增表單整理
- [ ] 日期、文字、Select 等控制項統一高度、寬度與對齊。
- [ ] 表單欄位結構沿用 shared Field foundation，不建立 Add 專用控制項尺寸。

### 11. 管理頁重新設計
- [ ] 管理表單整體結構與視覺跟「新增」頁一致，沿用 shared foundation。
- [ ] 重新整理上方搜尋 Toolbar，避免 Desktop / Tablet / Mobile 跑版。
- [ ] 修正管理頁底部「作品管理」區塊的位置與版面結構，確保 Desktop / Mobile 都不脫離內容流。

### 12. 運費表單與紀錄重新設計
- [ ] 重新整理運費表單與紀錄的資訊層級與操作流程。
- [ ] 關聯 Item 數量可能達上百筆，需提供搜尋、Filter、分組或其他大量資料選擇方式，不可依賴超長選單滑動。
- [ ] 運費紀錄加入分頁或等效的大量資料呈現機制。
- [ ] 分頁、搜尋／篩選與詳細資訊保持資料一致。

## P1｜統計、首頁與資料功能

### 13. 每月消費趨勢與年度資料
- [ ] 修正每月消費趨勢圖 2026 與 1 月數字重疊問題。
- [ ] 年份切換只控制「每月消費趨勢」，並移到該圖表標題區；圖表標題顯示目前年份，左右箭頭切換年份。
- [ ] 下方明細依年份分開，不可把去年同月份資料混入目前年份。
- [ ] 圖表聚合、月份／年份篩選與明細查詢使用同一套年度邏輯。

### 14. 首頁角色排行平手規則與版面
- [ ] 數量相同的角色顯示相同名次／數字。
- [ ] 後續名次依實際排名規則遞延，不可直接使用陣列索引當名次。
- [ ] 確認排序與顯示邏輯在實作上保持一致。
- [ ] 角色排行區塊與「作品消費排行」使用一致的 Panel 內部結構，標題與排行內容均位於面板上方，不可因 HTML nesting 使排行落到左下角。

### 15. 新增作品：明日方舟：終末地
- [ ] 新增「明日方舟：終末地」及對應作品資料。
- [ ] 檢查所有相關表單、作品選擇器、分類／作品 Filter 與 validation。
- [ ] 統計／圖表納入此作品，不可只新增作品清單。
- [ ] 確認 Work ID、Work Code、資料路徑、schema 與既有資料不衝突。

# 第二階段｜最終驗收與發布

> 以下全部屬於「驗收／回歸／發布」工作。開發修正完成後，集中從這裡由上往下執行，不再把驗收項目穿插在前面的開發 TODO。

## P2｜核心資料與流程驗收

### 16. Schema、資料與統計邏輯驗收
- [ ] 驗證新增／管理修改後仍符合 schema 與 validation contract。
- [ ] 驗證 Work ID、Work Code、資料路徑與既有資料不衝突。
- [ ] 驗證每月消費趨勢的年度切換只影響該圖表，明細沒有跨年度混入。
- [ ] 驗證圖表聚合、月份／年份篩選與明細查詢使用同一套年度邏輯。
- [ ] 驗證角色排行平手時同名次、後續名次正確遞延，且排序與顯示一致。
- [ ] 驗證新增作品「明日方舟：終末地」實際出現在相關作品選擇器、Filter、統計／圖表與資料流程。

### 17. Collection 初始資料載入與 fallback 最終驗收
- [ ] 驗證正式網站首次載入、搜尋、Filter、Sort、Detail、Add/Edit/Delete、圖片操作的實際等待時間。
- [ ] 確認 build-time `collection.json` 與 Worker `/api/data` fallback 行為符合預期。
- [ ] 完成實機驗收後，再決定是否移除舊 `loadNewStaticData()` fallback。

### 18. Shipping `itemIds` 參照完整性實機驗收
- [ ] 被 Shipping 參照的 Item 不可直接刪除。
- [ ] 一般 Item 刪除流程正常，且不破壞其他 Shipping records。

## P2｜表單、主題與 Responsive 驗收

### 19. 新增／管理／運費 Feedback 驗收
- [ ] 驗證中、成功、失敗均有一致的 Feedback 呈現。
- [ ] 驗證 Add / Management 的 `.form-errors` 實際承擔欄位／表單錯誤，Toast 不取代欄位錯誤。
- [ ] 驗證 Shipping 的 amount／關聯 Item 錯誤會進入 `form-feedback`，Toast 僅保留摘要／同步／操作結果用途。

### 20. Light / Dark 與 Settings 功能驗收
- [ ] 驗證文字對比、Surface 層級、Active / Hover / Focus / Disabled 狀態。
- [ ] 驗證 Settings 三種顯示模式切換與目前模式狀態。
- [ ] 驗證 Admin Secret 輸入、驗證、清除與 session 保存。
- [ ] 驗證 Settings 系統資訊、版本顯示及 `theme.ts` / `settings-auth.ts` selector contract。

### 21. 全站 Responsive：Mobile / Tablet / iPad 最終驗收
- [ ] 針對 360 / 390 / 430 / 768 / 820 / 1024px 檢查欄位排列、Toolbar、表格／卡片、Modal、導航與觸控空間。
- [ ] 完整驗收首頁、收藏、統計、新增、管理、運費、設定七頁，不只驗收本輪曾出現問題的頁面。
- [ ] 驗證手機直向卡片內容在必要時由 4 欄降為 2 欄，沒有文字跑出、卡片過度擁擠或資訊層級失衡。
- [ ] 驗證手機橫向沒有橫向滾動、按鈕切割、文字重疊、Modal 超出 viewport。
- [ ] Settings 完成 Desktop / Tablet / Mobile 實機驗收，確認無頂部大片空白、overflow、斷版與觸控問題。
- [ ] 驗證 Collection 控制列符合三列結構：搜尋；狀態／類型；排序／顯示方式，且排序／顯示方式同組靠右。
- [ ] 驗證首頁「作品消費排行」長條與右側金額保留明確獨立空間。
- [ ] 驗證 Header、Mobile Navigation 與主內容的水平留白維持一致 mobile frame spacing。
- [ ] 驗證 Statistics Detail 手機版資訊已重新分層，不是單純把 Desktop 壓縮成一團。
- [ ] 驗證 Item Detail Modal 在 Light / Dark / Mobile 下 surface、遮罩、文字對比與圖片內容均清楚。
- [ ] 驗證 Add 日期 input、外框與原生日期 UI 在手機尺寸下不錯位、不異常佔位。
- [ ] 驗證 Management「共 N 筆收藏」在小尺寸下可正常收縮、換行或重新排列。

### 22. 全站功能回歸
- [ ] 收藏：搜尋、Filter、Sort、分頁、Detail、Add/Edit/Delete、圖片管理。
- [ ] 統計：圖表、年度切換、明細、排名與 Collection 轉跳。
- [ ] 新增：欄位、驗證狀態、預設值、日期／文字控制項一致性。
- [ ] 管理：搜尋、CRUD、驗證狀態、新增跳轉、圖片相關功能。
- [ ] 運費：新增、Item 關聯、驗證狀態、紀錄分頁與詳細資訊。
- [ ] 設定：Theme、Admin Secret、系統資訊。
- [ ] Light / Dark / Desktop / Tablet / Mobile / keyboard / focus regression。
- [ ] 正式網站初始載入、Worker fallback、mutation 同步等待時間。

## P2｜驗證後清理與發布驗證

### 23. 驗證後清理與發布驗證
- [ ] 完成適用的 build、typecheck、schema、data integrity、Worker verification。
- [ ] 涉及部署時確認 GitHub Actions 成功。
- [ ] 實際 UX 驗收完成後，清理已被 shared foundation 吸收的 legacy / dead code。
- [ ] 確認 `package.json` 與 `public/data/version.json` 版本一致。
