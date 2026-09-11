# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。開發項目優先處理共用根基與跨頁結構；程式已完成但尚未實機確認的項目集中放在第二階段驗收。已完成的一次性工作移出；已確立且會長期影響開發的規則放在 `RULES.md`。

## Current state

- **目前正式版本：`1.109.249`。**
- `package.json` 與 `public/data/version.json` 已確認同步。
- 最新 HEAD：`d0c36b75b71f8fa912ebbe3afef482ac815acd6c`。
- 本輪已完成多項共用 UI、Responsive、Statistics、Feedback 與資料結構修正；目前剩餘工作以最終實機／回歸／發布驗收為主。
- P1 #14 角色排行平手規則與版面已完成程式修正，保留至最終驗收確認。
- P2 #16～#20 已完成主要程式碼／契約檢查；尚未將靜態檢查視為實機驗收結果。
- 正式網站目前無法由本環境可靠執行實機驗收，因此不得在沒有實際證據時標記 runtime 驗收通過。
- 最新 HEAD 目前沒有可供宣稱「CI 已通過」的 workflow run／combined status；發布前仍需重新確認。

# 第一階段｜尚未完成的開發與結構整理

## P0｜共用 UI 與跨頁根基

### 1. Shared Field / Layout 最後收斂
- [ ] 檢查各頁重複 Field、layout、control 尺寸與 spacing 規則。
- [ ] 日期、文字、Select 等共用控制項尺寸與對齊統一。
- [ ] 持續確認共用 Input 的 focus／outline、Modal / Surface、Toolbar / count 等基礎結構沒有重複實作。
- [ ] 不以 page-specific CSS workaround 掩蓋共用元件問題。

### 2. 全站 Responsive：Mobile / Tablet / iPad 結構整理
- [ ] 完成全站 Responsive 的最後結構整理，優先處理 shared foundation，不新增分散 breakpoint 或 page-specific workaround。
- [ ] 手機直向卡片型內容以可讀性優先，必要時由 4 欄降為 2 欄並重新安排資訊層級。
- [ ] 全面確認首頁、收藏、統計、新增、管理、運費、設定七頁的 responsive 結構。
- [ ] 手機橫向處理橫向滾動、按鈕切割、文字重疊、Modal 超出 viewport 等結構問題。
- [ ] Header、Mobile Navigation 與主內容維持一致的 mobile frame spacing。
- [ ] 首頁「作品消費排行」的長條與右側金額保留獨立空間。

## P1｜各頁共用控制與頁面結構

### 9. 收藏控制列重新設計
- [ ] 重新確認「狀態、類型、排序、顯示方式」四組 Collection controls 的資訊層級與操作方式。
- [ ] 狀態完整支援「全部、待到貨、預購中、已收到」，並與既有 Collection filter state 保持一致。
- [ ] 類型、排序與顯示方式維持一致的 shared control 視覺語言。
- [ ] Desktop / Tablet / Mobile 保持清楚分組、可讀性與觸控尺寸。
- [ ] Mobile 採三列資訊架構：第一列搜尋；第二列狀態／類型；第三列排序／顯示方式。
- [ ] 排序與顯示方式同組並靠右排列，不與狀態／類型互相擠壓。
- [ ] 移除 Collection intro 的多餘說明，避免控制列前資訊過載。

### 10. 新增表單整理
- [ ] 日期、文字、Select 等控制項統一高度、寬度與對齊。
- [ ] 表單欄位結構沿用 shared Field foundation，不建立 Add 專用控制項尺寸。

### 11. 管理頁重新設計
- [ ] 管理表單整體結構與視覺跟「新增」頁一致，沿用 shared foundation。
- [ ] 重新確認上方搜尋 Toolbar 在 Desktop / Tablet / Mobile 的結構。
- [ ] 確認底部「作品管理」區塊在 Desktop / Mobile 都位於正確內容流。

### 12. 運費表單與紀錄重新設計
- [ ] 重新確認運費表單與紀錄的資訊層級與操作流程。
- [ ] 關聯 Item 大量資料時提供搜尋、Filter、分組或其他大量資料選擇方式，不依賴超長選單。
- [ ] 運費紀錄加入分頁或等效的大量資料呈現機制。
- [ ] 分頁、搜尋／篩選與詳細資訊保持資料一致。

## P1｜統計、首頁與資料功能

### 14. 首頁角色排行平手規則與版面
- [ ] 驗收數量相同的角色顯示相同名次／數字。
- [ ] 驗收後續名次依競賽排名規則遞延，不直接使用陣列索引當名次。
- [ ] 確認排序與顯示邏輯一致。
- [ ] 確認角色排行與「作品消費排行」的 Panel 內部結構正常，標題與排行內容均位於面板上方。

# 第二階段｜最終驗收與發布

> 以下全部屬於驗收／回歸／發布工作。程式修正完成後，集中由上往下執行，不再把 runtime 驗收穿插到開發 TODO。

## P2｜核心資料與流程驗收

### 16. Schema、資料與統計邏輯驗收
- [ ] 執行新增／管理修改後的 schema 與 validation contract 驗證。
- [ ] 驗證 Work ID、Work Code、資料路徑與既有資料不衝突。
- [ ] 驗證每月消費趨勢年度切換只影響該圖表，明細沒有跨年度混入。
- [ ] 驗證圖表聚合、月份／年份篩選與明細查詢使用同一套年度邏輯。
- [ ] 驗證角色排行平手時同名次、後續名次正確遞延，且排序與顯示一致。

### 17. Collection 初始資料載入與 fallback 最終驗收
- [ ] 驗證正式網站首次載入、搜尋、Filter、Sort、Detail、Add/Edit/Delete、圖片操作的實際等待時間。
- [ ] 確認 build-time `collection.json` 與 Worker `/api/data` fallback 行為符合預期。
- [ ] 確認 Static Store fallback 即使 Remote Data 載入失敗，也會獨立載入 `shipping.json`，不得把既有運費紀錄降為空陣列。
- [ ] 實機驗收後再決定是否移除舊 `loadNewStaticData()` fallback。

### 18. Shipping `itemIds` 參照完整性實機驗收
- [ ] 被 Shipping 參照的 Item 不可直接刪除，並確認錯誤回饋正常。
- [ ] 移除 Shipping 關聯後，Item 刪除流程正常且不破壞其他 Shipping records。

## P2｜表單、主題與 Responsive 驗收

### 19. 新增／管理／運費 Feedback 驗收
- [ ] 驗證中、成功、失敗均有一致的 Feedback 呈現。
- [ ] 驗證 Add / Management 的 `.form-errors` 實際承擔欄位／表單錯誤，Toast 不取代欄位錯誤。
- [ ] 驗證 Shipping 的 amount／關聯 Item 錯誤進入 `form-feedback`，Toast 僅作摘要／同步／操作結果用途。
- [ ] 驗證 API 失敗時表單內容保留，sync 中不可重複提交。

### 20. Light / Dark 與 Settings 功能驗收
- [ ] 驗證文字對比、Surface 層級、Active / Hover / Focus / Disabled 狀態。
- [ ] 驗證 Settings 三種顯示模式切換、目前模式狀態與 Reload 後保存。
- [ ] 驗證 system 模式跟隨 OS 深／淺色切換。
- [ ] 驗證 Admin Secret 輸入、成功／失敗、清除與 session 狀態。
- [ ] 驗證 Settings 系統資訊、版本顯示及 `theme.ts` / `settings-auth.ts` selector contract。

### 21. 全站 Responsive：Mobile / Tablet / iPad 最終驗收
- [ ] 針對 360 / 390 / 430 / 768 / 820 / 1024px 檢查欄位排列、Toolbar、表格／卡片、Modal、導航與觸控空間。
- [ ] 完整驗收首頁、收藏、統計、新增、管理、運費、設定七頁。
- [ ] 驗證手機直向卡片必要時由 4 欄降為 2 欄，沒有文字跑出、卡片過度擁擠或資訊層級失衡。
- [ ] 驗證手機橫向沒有橫向滾動、按鈕切割、文字重疊、Modal 超出 viewport。
- [ ] Settings 完成 Desktop / Tablet / Mobile 實機驗收。
- [ ] 驗證 Collection 控制列三列結構：搜尋；狀態／類型；排序／顯示方式，且排序／顯示方式同組靠右。
- [ ] 驗證首頁「作品消費排行」長條與右側金額保留明確獨立空間。
- [ ] 驗證 Header、Mobile Navigation 與主內容的水平留白維持一致 mobile frame spacing。
- [ ] 驗證 Statistics Detail 手機版資訊重新分層，不是單純壓縮 Desktop。
- [ ] 驗證 Item Detail Modal 在 Light / Dark / Mobile 下 surface、遮罩、文字對比與圖片內容清楚。
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
- [ ] 最終確認版本、HEAD、部署內容與 TODO 狀態一致後，再視為 Release Ready。
