# TODO

> 只保留尚未完成、待驗證或值得持續追蹤的工作。已完成且屬於長期規格的內容移至 `RULES.md`。
>
> 未完成項目不得提前勾選。

## 1. Current / 目前待處理

- [ ] 修正管理頁 `management-picker-category` 重複 HTML `id`，並確認作品／類型／流水號選擇與表單同步不受影響
- [ ] 完成 Desktop smoke test
- [ ] 完成 Mobile smoke test
- [ ] 完成 Collection search / filter / sort 實機驗證
- [ ] 完成 Item Detail 實機驗證，包含 Modal、Router、返回、鍵盤與 focus
- [ ] 完成 Loading / Empty / Error 狀態驗證

## 2. Full Repository Audit / 全倉庫分段健檢

- [x] 第 1 段：Repo 基礎與規則，檢查 `RULES.md`、`TODO.md`、`package.json`、TypeScript / Vite 設定、GitHub Actions / Pages、版本與 CI 基線
- [ ] 第 2 段：檔案架構與舊殘留，盤點 `src/`、`public/`、`scripts/`、API / Worker、CSS、HTML、migration，找出未使用檔案、dead code、舊 route、舊 API 與舊資料格式
  - [x] **模組入口／Legacy 依賴**：已確認 `management.ts`、`statistics.ts`、`shipping.ts`、`works-management.ts`、`category-display.ts` 都由 `index.html` 以 module script 載入；`add.ts` 則由目前 production entry 的 `category-display.ts` 直接 import，因此這些模組不是未載入的 dead code。暫不刪除
  - [ ] **HTML / entry loading**：已確認目前 `index.html` 有 Vite module entries，並確認 `add.ts` 的間接載入關係；仍需把所有 entry 與其 CSS／副作用依賴完整交叉整理，確認沒有漏載入或重複載入
  - [ ] **確認並修正 `MutationObserver` 違反既定 UI 規則**：`src/category-display.ts` 目前以 `MutationObserver` 監聽整個 `document.body`，需改為明確的 render／事件流程，避免以後處理 UI 後續狀態
  - [ ] **文件一致性**：`RULES.md` 的主要 route 清單目前未完整列出 `add`、`shipping` 等正式 route，確認是否需要補齊規格文件
- [ ] 第 3 段：Store / State / Data Flow，檢查 API → validation → Store → Router / Page → Render 的一致性、state mutation、stale state、duplicate state、validation 與 race condition
- [ ] 第 4 段：Router / Navigation / Detail，檢查 route、Refresh、Back / Forward、malformed URL、decode、不存在 Item、搜尋狀態轉跳、Detail Modal 與 focus 管理
- [ ] 第 5 段：UI / CSS / Responsive，依 Desktop → Tablet → Mobile 檢查各頁面、Modal、Toast、Form、Header / Navigation、dark mode、focus、overflow、z-index、breakpoint、dead CSS 與舊 selector
- [ ] 第 6 段：Form / Management / CRUD，檢查新增、編輯、刪除、搜尋、分類、ID、quantity、validation、表單 state、selector、Modal、confirmation、error handling 與 frozen data
- [ ] 第 7 段：圖片系統，檢查 upload、metadata、cover、reorder、replace、delete、格式 / 大小限制、路徑、fallback、orphan / missing image、Worker mutation 與 rollback
- [ ] 第 8 段：API / Worker / GitHub 寫入，逐一檢查 request → validation → read → mutation → transaction → commit，確認 SHA、race condition、rollback、write scope、token 安全與舊 API 殘留
- [ ] 第 9 段：Verification / Build / Deployment，逐一確認現有 verify scripts 的實際覆蓋範圍、build、CI、production deployment，避免測試綠燈但漏測關鍵行為
- [ ] 第 10 段：最終 Dead Code / Legacy / Consistency Sweep，全 repo 搜尋舊 function、變數、class、route、欄位、API、TODO / FIXME、debug code、temporary workaround、duplicate implementation，並交叉比對 RULES ↔ TODO ↔ Code ↔ Tests ↔ Data
- [ ] 每一段健檢完成後分類問題為「正常／可改善／疑似 Bug／確定 Bug／舊殘留」，再決定是否修正，不因發現問題就直接大範圍重寫
- [ ] 每次實際修正後遵守版本 Patch 規則，執行對應驗證並重新檢查受影響範圍

## 3. Verification / 驗證

- [ ] 執行完整 Verify，確認目前版本所有自動化檢查通過
- [ ] 確認最新 production build / deployment 狀態
- [ ] 確認版本、資料完整性、schema、圖片與 Worker contract 維持一致
