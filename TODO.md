# Merch TODO / Architecture Roadmap

## Current state

- **目前開發版本：`1.109.806`。**
- 主要資料、同步、生命週期、CI、Build、Deploy 與共用 UI 架構已完成整理與驗證。
- 長期架構規則與不可回歸的基線統一記錄於 `RULES.md`；本文件只保留尚未完成、需要追蹤或準備執行的工作。
- 目前進入「小幅功能／UI／資料／流程調整」階段，不再進行沒有必要的整體架構重寫。

## Active work

### 1. Repository cleanup
- [x] 清理已完成的一次性 migration / reset workflow、無效 trigger、重複 Worker deploy workflow 與未再使用的 package lock；目前正式部署統一由 `deploy.yml` 管理。
- [x] 重新檢查 `worker/src/r2-entry.ts`，確認目前 source 已採 R2 authoritative store：R2 不存在時視為新上傳，既有 R2 物件保留 rollback；沒有回復舊 GitHub previous-image 依賴。
- [x] 清理 repository 中已無現行責任的 legacy migration script 與 `upload/` 工作目錄殘留。
- [x] 同步 `PROJECT_ARCHITECTURE.md`、`UI_ARCHITECTURE.md` 與目前實際檔案／架構，移除已完成 redesign 仍標示為未完成的舊 roadmap。
- [x] 移除 Worker 中未使用的 asset result 型別，並讓版本驗證同時檢查 frontend 與 Worker source version，避免三處版本再次漂移。
- [x] 修正 Verify workflow 引用了已不存在的 `verify-statistics-contract.mjs`，造成統計年度驗證步驟直接失敗；移除失效的 script 與 workflow 呼叫，保留實際存在且涵蓋年度 contract 的 `verify-statistics-year-contract.mjs`。
- [x] 清理 scripts 目錄中已無現行責任的舊 batch staging note 與重複 schema notes，正式 schema 規格統一以 `ITEM_SCHEMA.md` 等現行文件為準。
- [ ] 發現 `src/detail-focus.ts` 仍以 `MutationObserver` 監看統計 modal，與現行 lifecycle 規則衝突；應改為統計 modal 建立時直接掛載／關閉時清理 focus lifecycle，移除 observer workaround。

### 2. 網站初始載入動畫
- [x] 在資料載入完成前顯示全頁載入過渡。
- [x] 視覺、尺寸、動畫節奏與既有 API 同步 overlay 保持一致，並參考 `tsai97216/nav` 的載入動畫基線。
- [x] Desktop、Tablet、Mobile 均需正常適配，並處理 reduced-motion。

### 3. 新增／管理／運費驗證提示
- [x] 在新增、管理、運費頁加入與設定頁相同語意與視覺的「未驗證／已驗證」提示。
- [x] 驗證狀態沿用現有 Admin Secret / API 驗證來源，不建立第二套驗證機制。
- [x] Desktop、Tablet、Mobile 均需正常適配。
- [x] 修正新增頁手機版標題區因驗證提示加入後造成的跑行／排版問題。

### 4. 首頁作品消費排行與角色區塊
- [x] 完成作品消費排行重新設計，使用清楚的橫向消費進度條與排行榜資訊層級，並支援點擊作品轉跳搜尋。
- [x] 完成角色消費排行重新設計，移除目前卡片式視覺，改為清楚、緊湊的排行榜／進度條呈現。
- [x] 保留既有排行資料與互動能力，避免重建第二套資料計算邏輯。
- [x] Desktop、Tablet、Mobile 均需正常適配。
- [x] 修正平板寬度下角色消費排行的角色名稱過長時超出排行框的問題，調整 Tablet responsive grid 的可壓縮範圍並保留文字省略。
- [x] 修正平板寬度下角色消費排行的消費金額欄位超出框線問題，讓金額欄位可壓縮並在極端寬度下安全省略。

### 5. 圖片上傳 API 500 / 502
- [x] 確認正式 Worker 的實際部署版本與正式網站圖片 PUT 行為，不把 GitHub 資料版本與 Worker 程式版本混為一談。
- [ ] Worker 的 R2 mirror → GitHub mutation chain 需完成正式驗收：小圖、接近 8 MB 圖片、替換既有圖片。
- [ ] 前端單檔限制為 8 MB，而 base64 會膨脹約 33%；Worker GitHub mutation 端目前 10 MB base64 content limit，需完成邊界檔案驗證。
- [x] Worker 已攔截 GitHub mutation 的未處理 exception，失敗時回傳結構化錯誤並執行 R2 rollback。
- [x] R2 PUT 已先完整讀取並保存 JSON request body，再建立新的 Request 傳給 GitHub mutation。
- [x] 確認 500 的實際根因之一：一次性 `repair-lockfile-once.yml` 會在每次使用者 push 後再次修改 `main`，與 Worker 的 atomic commit 發生 HEAD race，造成 `資料在寫入期間已被其他操作更新`。該 workflow 已移除。
- [x] 正式網站已成功完成一般圖片新增，確認 R2 → GitHub mutation → 前端顯示的基本上傳流程可用。
- [x] 一般 CRUD／運費 API 的前端 mutation 現已透過全域 queue 序列化，避免同一頁面同時發出多個 GitHub atomic commit 而互相踩 HEAD。
- [x] 修正 Work／Shipping mutation response contract：前端 mutation validator 現可安全接受 Worker 回傳的 `{ version }` 或完整 authoritative data，避免寫入成功後因 response shape 不一致誤報失敗。
- [x] 修正 repo 版本同步：`package.json`、`public/data/version.json` 與 Worker source version 已更新至 `1.109.805`，且版本驗證器現在會三方檢查。
- [x] 修正圖片 PUT 的根因：R2 已是圖片 authoritative store；R2 不存在時視為新上傳，不再先讀 GitHub previous-image，避免 `R2_PREVIOUS_READ_FAILED • HTTP 502` 的脆弱依賴。既有 R2 圖片仍保留 rollback 能力。
- [x] R2 previous-image 讀取加入最多 3 次的短暫重試；只有連續失敗才回傳 `R2_PREVIOUS_READ_FAILED`，不改變既有圖片 rollback 語意。
- [ ] 正式 Worker 尚需部署 `1.109.805`，並重新驗收新增／替換圖片，確認正式環境不再使用舊 Worker。

### 6. 發布前驗證
- [x] 相關 verification / Build 通過。
- [x] 最新圖片新增 commit 的 GitHub Actions `Verify` 與 `Deploy` 均成功完成。
- [ ] 正式網站行為的完整驗收仍需補上邊界圖片、替換既有圖片等案例。
- [ ] 實際驗收發現的問題，在修正前先記錄於本文件，再回到對應的根因處理。

## Maintenance rule

- 已完成的一次性工作不留在 TODO；若內容是未來每次修改都必須遵守的長期規則，移至 `RULES.md`。
- TODO 只追蹤「現在還沒完成什麼」，不要把歷史驗證紀錄、已封版架構或長期規格重新堆回來。
- 每完成一項工作就立即更新狀態，避免 TODO 與實際專案狀態脫節。
