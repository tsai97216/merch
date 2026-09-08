# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。已完成的一次性工作不留在 TODO；已確立且會長期影響開發的規則放在 `RULES.md`。

## Current state

- **目前正式版本：`1.109.133`。** `package.json` 與 `public/data/version.json` 必須保持同步。
- **目前主要工作：七頁整站 UI 重新設計與共用 Design System 建立。**
- **開發方向：優先修正底層結構與共用元件，不以局部補丁掩蓋根本問題。**

## P0｜核心功能與資料正確性

1. **Collection 初始資料載入與 fallback 最終驗收**
   - 驗證正式網站首次載入、搜尋、Filter、Sort、Detail、Add/Edit/Delete、圖片操作的實際等待時間。
   - 確認 build-time `collection.json` 與 Worker `/api/data` fallback 行為符合預期。
   - 實機驗收完成後，再判斷是否可移除舊 `loadNewStaticData()` fallback。
2. **Shipping `itemIds` 參照完整性實機驗收**
   - 確認被 Shipping 參照的 Item 無法被刪除。
   - 確認一般 Item 刪除流程正常且不破壞其他 Shipping records。
3. **待新增作品：明日方舟：終末地（Arknights: Endfield）**
   - ID：`arknights-endfield`
   - 代號：`AKE`
   - 尚未加入正式作品資料。

## P1｜整站 UI Design System 與七頁同步重構

### 1. 全站 Design System

- **色彩 Token**：建立品牌色、背景、Surface、文字、Border、狀態與語意化色彩 Token。
- **Typography**：統一字體、字級、字重、行高與標題層級。
- **Spacing**：建立全站一致的間距尺度。
- **Radius / Border / Surface**：統一圓角、邊框、表面層級與陰影語意。
- **共用元件**：Button、Input / Select、Segmented Control、Card / Panel、Modal、Badge、Feedback。
- Light / Dark 直接共用 semantic tokens，不再以大量頁面專用 override 疊加。

### 2. 全站 Page Layout

- 統一 Header、Page Heading、Section、Content Width、Grid、Toolbar 與操作區。
- 建立清楚的資訊層級與元件邊界，讓七頁共享同一套版面基礎。

### 3. 七頁同步重新設計

> **首頁／收藏／統計／新增／管理／運費／設定一起進行，不再一頁一頁補丁式修改。**

- **首頁**：重新整理資訊總覽與視覺層級。
- **收藏**：重新設計 View / Sort / Filter 控制列與內容呈現。
- **統計**：重新整理圖表與數據層級。
- **新增**：重新分組長表單、欄位層級與操作區。
- **管理**：重新整理搜尋、選擇器、Editor 與 CRUD 回饋。
- **運費**：重新整理紀錄、金額／日期／物流／關聯 Item 的資訊呈現。
- **設定**：重新整理分類、外觀設定、資料／系統資訊與操作入口。
- 七頁共用同一套 Page Header、Section、Field、Button、Badge、Modal、Feedback 等 UI 基礎。
- 保留既有資料模型、Store、API、Worker 契約，除非確認根因位於資料層才修改資料架構。

### 4. Responsive

- **Desktop / Tablet / Mobile 一次納入設計。**
- 手機版不只是 Desktop 縮小版，而是依螢幕空間重新安排資訊層級、控制項與操作方式。
- 同步驗證各 breakpoint 的 overflow、可讀性與觸控操作空間。

### 5. Light / Dark

- Light / Dark 同時設計。
- 所有共用元件直接使用 semantic tokens，避免「Light 做一套、Dark 再覆蓋一套」。
- 驗證文字對比、Surface 層級、Active / Hover / Focus / Disabled 等狀態。

### 6. 開始前的架構盤點

- 先完整盤點現有 CSS layer、theme tokens、共用 UI refinement 與各頁 CSS。
- 明確標記 **保留／合併／退場** 的樣式與 selector。
- 找出重複、互相覆蓋、legacy CSS、dead selector 與不清楚的元件邊界。
- 先建立共用 UI 基礎，再由七頁同步套用。
- 不在開始前繼續對單一頁面進行視覺補丁，避免破壞整站設計方向。

## P2｜Motion 與視覺精修
- 在 P0 / P1 完成並通過實機驗收後，再統一處理動畫、transition 與細節視覺節奏。

## P3｜Final acceptance
- 手機版與電腦版完整流程驗收。
- 驗收收藏搜尋、Filter、Sort、Detail、Add/Edit/Delete、圖片管理、Shipping、統計、管理、設定與 Light / Dark。
- 驗收部署後初始載入、Worker fallback 與 mutation 同步等待時間。
- 驗收完成後進行最後 legacy / dead-code cleanup。
