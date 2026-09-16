# Merch TODO / Architecture Roadmap

## Current state

- **目前開發版本：`1.109.751`。**
- 主要資料、同步、生命週期、CI、Build、Deploy 與共用 UI 架構已完成整理與驗證。
- 長期架構規則與不可回歸的基線統一記錄於 `RULES.md`；本文件只保留尚未完成、需要追蹤或準備執行的工作。
- 目前進入「小幅功能／UI／資料／流程調整」階段，不再進行沒有必要的整體架構重寫。

## Active work

### 1. 網站初始載入動畫
- [x] 在資料載入完成前顯示全頁載入過渡。
- [x] 視覺、尺寸、動畫節奏與既有 API 同步 overlay 保持一致，並參考 `tsai97216/nav` 的載入動畫基線。
- [x] Desktop、Tablet、Mobile 均需正常適配，並處理 reduced-motion。

### 2. 新增／管理／運費驗證提示
- [x] 在新增、管理、運費頁加入與設定頁相同語意與視覺的「未驗證／已驗證」提示。
- [x] 驗證狀態沿用現有 Admin Secret / API 驗證來源，不建立第二套驗證機制。
- [x] Desktop、Tablet、Mobile 均需正常適配。
- [x] 修正新增頁手機版標題區因驗證提示加入後造成的跑行／排版問題。

### 3. 首頁作品消費排行與角色區塊
- [x] 完成作品消費排行重新設計，使用清楚的橫向消費進度條與排行榜資訊層級，並支援點擊作品轉跳搜尋。
- [x] 完成角色消費排行重新設計，移除目前卡片式視覺，改為清楚、緊湊的排行榜／進度條呈現。
- [x] 保留既有排行資料與互動能力，避免重建第二套資料計算邏輯。
- [x] Desktop、Tablet、Mobile 均需正常適配。
- [x] 修正平板寬度下角色消費排行的角色名稱過長時超出排行框的問題，調整 Tablet responsive grid 的可壓縮範圍並保留文字省略。
- [x] 修正平板寬度下角色消費排行的消費金額欄位超出框線問題，讓金額欄位可壓縮並在極端寬度下安全省略。

### 4. 圖片上傳 API 500 / 502
- [x] 確認正式 Worker 的實際部署版本與正式網站圖片 PUT 行為，不把 GitHub 資料版本與 Worker 程式版本混為一談。
- [x] 前端圖片 API 錯誤現在會顯示 Worker version、API error code 與 HTTP status，下一次實測用這些資訊直接定位失敗階段。
- [ ] Worker 的 R2 mirror → GitHub mutation chain 需完成正式驗收：小圖、接近 8 MB 圖片、替換既有圖片。
- [ ] 前端單檔限制為 8 MB，而 base64 會膨脹約 33%；Worker GitHub mutation 端目前 10 MB base64 content limit，需完成邊界檔案驗證。
- [x] Worker 已攔截 GitHub mutation 的未處理 exception，失敗時回傳結構化錯誤並執行 R2 rollback。
- [x] R2 PUT 已先完整讀取並保存 JSON request body，再建立新的 Request 傳給 GitHub mutation。
- [x] 確認 500 的實際根因之一：一次性 `repair-lockfile-once.yml` 會在每次使用者 push 後再次修改 `main`，與 Worker 的 atomic commit 發生 HEAD race，造成 `資料在寫入期間已被其他操作更新`。該 workflow 已移除。
- [x] 正式網站已成功完成一般圖片新增，確認 R2 → GitHub mutation → 前端顯示的基本上傳流程可用。
- [x] 一般 CRUD／運費 API 的前端 mutation 現已透過全域 queue 序列化，避免同一頁面同時發出多個 GitHub atomic commit 而互相踩 HEAD。
- [x] 修正一般 Work／Shipping mutation 成功後仍顯示錯誤的前端 response contract：Worker mutation endpoint 回傳 `{ version }`，前端部分方法卻直接以完整 `ApiData` 驗證，導致寫入成功後在 response validation 階段誤報失敗。
- [ ] **最新驗收發現：正式網站圖片 PUT 回傳 `R2_PREVIOUS_READ_FAILED • HTTP 502`，且錯誤標示 Worker `1.109.674`；目前 repo 的 `package.json` 與 `public/data/version.json` 亦不同步。需修正版本同步、部署 Worker 版本，並修正既有圖片替換時不必要地依賴 GitHub previous-image read 的脆弱路徑。**
- [ ] **最新驗收發現：Work CRUD／Shipping mutation 實際已寫入成功，但前端仍進入 error toast。需繼續定位 mutation promise 在「成功寫入 → authoritative `/data` → Store apply → UI render」鏈中的實際 rejection 點，禁止再以猜測性的 response contract workaround 處理。**

### 5. 發布前驗證
- [x] 相關 verification / Build 通過。
- [x] 最新圖片新增 commit 的 GitHub Actions `Verify` 與 `Deploy` 均成功完成。
- [ ] 正式網站行為的完整驗收仍需補上邊界圖片、替換既有圖片等案例。
- [ ] 實際驗收發現的問題，在修正前先記錄於本文件，再回到對應的根因處理。

## Maintenance rule

- 已完成的一次性工作不留在 TODO；若內容是未來每次修改都必須遵守的長期規則，移至 `RULES.md`。
- TODO 只追蹤「現在還沒完成什麼」，不要把歷史驗證紀錄、已封版架構或長期規格重新堆回來。
- 每完成一項工作就立即更新狀態，避免 TODO 與實際專案狀態脫節。
