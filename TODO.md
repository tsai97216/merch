# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。以下順序即目前建議執行順序，依「先修共用根基 → 核心資料／功能 → 各頁功能 → 最終驗收」排列。已完成的一次性工作移出；已確立且會長期影響開發的規則放在 `RULES.md`。

## Current state

- **目前正式版本：`1.109.178`**。
- `package.json` 與 `public/data/version.json` 必須保持同步。
- 目前主軸：Responsive / Design System 收尾，以及 Collection / Statistics / Add / Management / Shipping 功能整理。

## P0｜先處理共用根基與核心資料正確性

### 1. 全站 Responsive：Mobile / Tablet / iPad

- [ ] 完成全站手機版適配調整。
- [ ] 針對 iPad / Tablet viewport 檢查七頁欄位排列、Toolbar、表格／卡片、Modal、導航與觸控空間。
- [ ] 確認 Mobile 不是單純縮小 Desktop，而是依空間重新安排資訊層級與操作方式。
- [ ] Settings 完成 Desktop / Tablet / Mobile 實機驗收，確認無頂部大片空白、overflow、斷版與觸控問題。
- [ ] Responsive 相關修改集中於既定 responsive layer，不新增分散 breakpoint。

### 2. Shared Field / Layout 最後收斂

- [ ] 檢查各頁重複 Field、layout、control 尺寸與 spacing 規則。
- [ ] 日期、文字、Select 等共用控制項尺寸與對齊統一。
- [ ] 管理頁 `.management-actions .button` 目前額外覆寫 `min-height:40px`，圖片操作按鈕另有 `38px` 固定高度；需改為沿用 shared control / compact token，避免 page-specific control 尺寸分叉。
- [x] 清理已被 shared foundation 吸收、且經驗證確定可移除的 legacy / duplicate selector。
- [ ] 不以 page-specific CSS workaround 掩蓋共用元件問題。

### 3. Collection 初始資料載入與 fallback 最終驗收

- [ ] 驗證正式網站首次載入、搜尋、Filter、Sort、Detail、Add/Edit/Delete、圖片操作的實際等待時間。
- [ ] 確認 build-time `collection.json` 與 Worker `/api/data` fallback 行為符合預期。
- [ ] 完成實機驗收後，再決定是否移除舊 `loadNewStaticData()` fallback。

### 4. Shipping `itemIds` 參照完整性實機驗收

- [ ] 被 Shipping 參照的 Item 不可直接刪除。
- [ ] 一般 Item 刪除流程正常，且不破壞其他 Shipping records。

## P1｜共用功能與表單

### 5. Light / Dark 與 Settings 功能驗收
- [ ] 驗證文字對比、Surface 層級、Active / Hover / Focus / Disabled 狀態。
- [ ] 驗證 Settings 三種顯示模式切換與目前模式狀態。
- [ ] 驗證 Admin Secret 輸入、驗證、清除與 session 保存。
- [ ] 驗證 Settings 系統資訊、版本顯示及 `theme.ts` / `settings-auth.ts` selector contract。

### 6. 新增／管理／運費顯示驗證狀態
- [ ] 在「新增」、「管理」、「運費」相關表單／流程中明確顯示驗證狀態。
- [ ] 驗證中、成功、失敗需有一致的 Feedback 呈現。
- [ ] 沿用 shared Feedback / Badge / Field foundation，不建立各頁獨立版本。

### 7. 新增表單整理
- [ ] 日期、文字、Select 等控制項統一高度、寬度與對齊。
- [ ] 「狀態」最上方預設為「已收到」。
- [ ] 移除「例如：流螢主題立牌」等提示文字。
- [ ] 確認修改後仍符合 schema 與 validation contract。

### 8. 管理頁重新設計
- [ ] 管理表單整體結構與視覺跟「新增」頁一致，沿用 shared foundation。
- [ ] 重新整理上方搜尋 Toolbar，避免 Desktop / Tablet / Mobile 跑版。
- [ ] 「新增」按鈕改為直接跳轉 `#/add`，不再在管理頁切換新增表單。
- [ ] 移除「清理孤兒照片」UI；若仍存在相關專用程式碼，先依規則確認 dead code 後再清理。

### 9. 運費表單與紀錄重新設計
- [ ] 重新整理運費表單與紀錄的資訊層級與操作流程。
- [ ] 關聯 Item 數量可能達上百筆，需提供搜尋、Filter、分組或其他大量資料選擇方式，不可依賴超長選單滑動。
- [ ] 運費紀錄加入分頁或等效的大量資料呈現機制。
- [ ] 分頁、搜尋／篩選與詳細資訊保持資料一致。

## P1｜資料與頁面功能

### 10. 每月消費趨勢與年度資料
- [ ] 修正每月消費趨勢圖 2026 與 1 月數字重疊問題。
- [ ] 詳細圖表加入年份切換。
- [ ] 下方明細依年份分開，不可把去年同月份資料混入目前年份。
- [ ] 圖表聚合、月份／年份篩選與明細查詢使用同一套年度邏輯。

### 11. 收藏分頁
- [ ] 收藏頁加入分頁或等效的分批呈現機制，避免單頁資料過多。
- [ ] 與搜尋、Filter、Sort、View、Detail 正確整合。
- [ ] 條件切換後目前頁碼、總筆數與資料內容保持一致。

### 12. 首頁角色排行平手規則
- [ ] 數量相同的角色顯示相同名次／數字。
- [ ] 後續名次依實際排名規則遞延，不可直接使用陣列索引當名次。
- [ ] 確認排序與顯示邏輯一致。

### 13. 新增作品：明日方舟：終末地
- [ ] 新增「明日方舟：終末地」及對應作品資料。
- [ ] 檢查所有相關表單、作品選擇器、分類／作品 Filter 與 validation。
- [ ] 統計／圖表納入此作品，不可只新增作品清單。
- [ ] 確認 Work ID、Work Code、資料路徑、schema 與既有資料不衝突。

## P2｜最終驗收與清理

### 14. 全站功能回歸
- [ ] 收藏：搜尋、Filter、Sort、分頁、Detail、Add/Edit/Delete、圖片管理。
- [ ] 統計：圖表、年度切換、明細、排名與 Collection 轉跳。
- [ ] 新增：欄位、驗證狀態、預設值、日期／文字控制項一致性。
- [ ] 管理：搜尋、CRUD、驗證狀態、新增跳轉、圖片相關功能。
- [ ] 運費：新增、Item 關聯、驗證狀態、紀錄分頁與詳細資訊。
- [ ] 設定：Theme、Admin Secret、系統資訊。
- [ ] Light / Dark / Desktop / Tablet / Mobile / keyboard / focus regression。
- [ ] 正式網站初始載入、Worker fallback、mutation 同步等待時間。

### 15. 驗證後清理與發布驗證
- [ ] 完成適用的 build、typecheck、schema、data integrity、Worker verification。
- [ ] 涉及部署時確認 GitHub Actions 成功。
- [ ] 實際 UX 驗收完成後，清理已被 shared foundation 吸收的 legacy / dead code。
- [ ] 確認 `package.json` 與 `public/data/version.json` 版本一致。
