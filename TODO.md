# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。開發優先處理共用根基與跨頁結構；程式已完成但尚未實機確認的項目集中到最終驗收。已完成的一次性工作移出；已確立且會長期影響開發的規則放在 `RULES.md`。

## Current state

- **目前正式版本：`1.109.252`。**
- `package.json` 與 `public/data/version.json` 已確認同步。
- 最新 HEAD：`bad7268b8b587138bd176a5bc3d287d79bd551d0`。
- 最近一輪已完成多項 shared UI、Responsive、Statistics、Feedback、資料結構與 Management toolbar 結構修正。
- Management 最上方搜尋區已完成第一層分層；第二層作品／類型／流水號／新增已改為 Desktop 四欄、Tablet 二欄、Mobile 一欄的 Responsive contract，仍需實機驗收。
- P1 #14 角色排行平手規則與版面已完成程式修正，保留至最終驗收確認。
- 目前沒有足夠的實機證據可將 Responsive、正式網站 runtime 或整體回歸標記為完成。
- 最新 HEAD 目前沒有可供宣稱「CI 已通過」的 workflow run；發布前仍需重新確認。

# 第一階段｜尚未完成的開發與結構整理

## P0｜共用 UI 與跨頁根基

### 1. Shared Field / Layout 最後收斂
- [ ] 檢查各頁重複 Field、layout、control 尺寸與 spacing 規則。
- [ ] 日期、文字、Select 等共用控制項高度、寬度與對齊統一，尤其處理日期 input 與一般文字 input 的 frame 差異。
- [ ] 持續確認共用 Input 的 focus／outline、Modal / Surface、Toolbar / count 等基礎結構沒有重複實作。
- [ ] Collection 控制項目前仍有頁面專用的 Select／View Button semantic state，需收斂回 shared control foundation。
- [ ] 清理 Responsive layer 中已改為 Grid 後仍殘留的舊 Flex-only 宣告，避免死 CSS 與錯誤結構訊號。
- [ ] 不以 page-specific CSS workaround 掩蓋共用元件問題。

### 2. 全站 Responsive：Mobile / Tablet / iPad 結構整理
- [ ] 依 shared foundation 完成最後 Responsive 結構整理，不新增分散 breakpoint 或 page-specific workaround。
- [ ] 實際確認 360 / 390 / 430 / 768 / 820 / 1024px。
- [ ] 全面確認首頁、收藏、統計、新增、管理、運費、設定七頁。
- [ ] 手機卡片型內容以可讀性優先，必要時由 4 欄降為 2 欄，包含收藏、統計等內容。
- [ ] Mobile landscape 處理橫向滾動、按鈕切割、文字重疊與 Modal 超出 viewport。
- [ ] Header、Mobile Navigation 與主內容維持一致的 frame spacing。
- [ ] 首頁「作品消費排行」的長條與右側金額保留獨立空間。
- [ ] 完成 iPad / Tablet 下各頁控制列、表單與卡片的寬度／換行檢查。

## P1｜各頁控制與頁面結構

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
- [ ] **上方搜尋 Toolbar 第一層結構已修正，保留 Desktop / Tablet / Mobile 最終驗收。**
- [ ] **第二層作品／類型／流水號／新增的 Desktop / Tablet 欄位配置已修正，保留實機驗收確認不擠壓、不產生不合理換行。**
- [ ] Tablet / iPad 確認搜尋、結果數量與選擇器的寬度、間距及換行合理。
- [ ] Mobile 確認搜尋、結果數量與選擇器維持清楚的內容流，不產生文字溢出。
- [ ] 確認底部「作品管理」區塊在 Desktop / Mobile 都位於正確內容流。
- [ ] **本項目前不處理圖片管理區塊布局，避免混入不同問題。**

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

# 第二階段｜最終驗收、回歸與發布

> 以下集中處理已完成程式修正但尚未取得實機證據的項目。不得以靜態檢查代替 runtime 驗收，也不得在沒有 workflow／production 證據時宣稱發布完成。

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

## P2｜全站 UI / 功能回歸

### 19. Responsive 最終實機驗收
- [ ] 依 360 / 390 / 430 / 768 / 820 / 1024px 逐一驗收七頁。
- [ ] 驗收 4→2 卡片、控制列換行、文字溢出、按鈕切割、Modal overflow、landscape 等問題。
- [ ] 驗收 Light / Dark mode 下 shared controls、focus、surface、border、radius 是否一致。

### 20. 完整功能回歸
- [ ] Home / Collection / Statistics / Add / Shipping / Management / Settings 基本流程。
- [ ] Search / Filter / Sort / Detail / Add / Edit / Delete。
- [ ] 圖片新增／替換／刪除／主圖／排序與同步狀態。
- [ ] Work / Category / Serial selectors 與管理資料操作。
- [ ] Shipping 關聯、刪除保護與資料一致性。

### 21. 發布前最終檢查
- [ ] TypeScript、build、schema／data integrity、Worker 相關檢查全部通過。
- [ ] 確認 `package.json`、`public/data/version.json` 與 TODO current state 版本一致。
- [ ] 確認最新 commit 有對應 GitHub Actions workflow run，且結果成功。
- [ ] 確認正式網站實際行為與本地／build 結果一致後才標記完成。

## 執行順序

1. **P0 #1 Shared Field / Layout**
2. **P0 #2 全站 Responsive**
3. **P1 #9 Collection controls**
4. **P1 #10 Add form**
5. **P1 #11 Management toolbar / layout**
6. **P1 #12 Shipping**
7. **P1 #14 Home ranking**
8. **P2 #16～#18 資料與流程驗收**
9. **P2 #19 Responsive 最終實機驗收**
10. **P2 #20 完整功能回歸**
11. **P2 #21 發布前最終檢查**
