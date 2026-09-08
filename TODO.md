# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。已完成的一次性工作不留在 TODO；已確立且會長期影響開發的規則放在 `RULES.md`。

## Current state

- **目前正式版本：`1.109.103`。** `package.json` 與 `public/data/version.json` 必須保持同步。
- **目前主要工作：UI 基礎整理與新增／管理／運費／設定頁重新設計。**
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

## P1｜UI 基礎與共用架構

### 1. 收藏排序控制器

- 重新整理收藏頁 Sort 控制器的結構與狀態樣式，而非以額外 CSS 覆蓋現有問題。
- Light：修正選取／框選狀態造成文字可讀性下降。
- Dark：修正選取狀態背景與文字對比不足。
- 統一 hover、active、focus-visible、disabled 狀態。
- Desktop / Mobile 都要驗收。
- 優先確認是否應抽成共用 UI 控制器／設計 token，避免各頁各自維護。

### 2. 新增／管理／運費／設定重新設計

> 不是局部換色或補 CSS，而是從頁面結構、共用元件與互動模型重新整理。

- **新增**：重新設計資訊分組、欄位層級、操作區與表單回饋，降低長表單的認知負擔。
- **管理**：重新設計作品／周邊管理資訊架構、搜尋／選擇／編輯操作與 CRUD 回饋。
- **運費**：重新設計運費紀錄、金額／日期／物流／關聯 Item 的資訊呈現與管理流程。
- **設定**：重新設計設定分類、外觀設定、資料／系統資訊與操作入口。
- 四頁共用同一套 Page Header、Section、Field、Button、Badge、Modal、Feedback 等 UI 基礎。
- Desktop / Tablet / Mobile 均須納入設計。
- Light / Dark 使用同一套設計 token 與狀態語意。
- 先建立共用 UI 基礎，再由各頁套用，不製造四套獨立 CSS。
- 保留既有資料模型、Store、API、Worker 契約，除非確認根因位於資料層才修改資料架構。

### 3. 全站 UI 一致性檢查

- Modal、Toast、Loading、Empty、Error、focus、overflow、z-index、responsive breakpoint 等共用互動狀態。
- 清理已確認無用途的 dead CSS / legacy selector。
- 確認 HTML `id` 唯一、selector 邊界清楚，避免重複 ID 與模糊 selector。

### 4. 其他既有 UI 問題

- 暗色模式背景框圓角。
- 設定頁跟隨系統深色模式。
- 手機版統計／管理／設定的 responsive 精修。
- 電腦版標題位置。

## P2｜Motion 與視覺精修

- 在 P0 / P1 完成並通過實機驗收後，再統一處理動畫、transition 與細節視覺節奏。

## P3｜Final acceptance

- 手機版與電腦版完整流程驗收。
- 驗收收藏搜尋、Filter、Sort、Detail、Add/Edit/Delete、圖片管理、Shipping、統計、管理、設定與 Light / Dark。
- 驗收部署後初始載入、Worker fallback 與 mutation 同步等待時間。
- 驗收完成後進行最後 legacy / dead-code cleanup。
