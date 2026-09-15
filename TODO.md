# TODO

> 本檔只保留目前尚未完成、待驗證或值得持續追蹤的工作。已完成的一次性工作移出；長期規格放在 `RULES.md`。
>
> 本輪重新掃描整個專案後重新建立，不沿用舊 TODO 的完成狀態。

## Current state

- **目前開發版本：`1.109.605`。**
- 本輪以現有程式與資料流重新盤點，不進行整體重寫。
- 優先處理資料權威性、版本一致性、驗證覆蓋與架構邊界，再處理效能與清理型工作。

## 1. 版本同步架構【最高優先】
- [x] 修正 Worker mutation 只更新 `public/data/version.json`、未同步 `package.json` 的問題。
- [x] 每次 API mutation 產生新版本號時，讓 `package.json` 與 `public/data/version.json` 使用同一個版本號。
- [x] 版本更新必須與資料 mutation 保持在同一個 atomic Git commit，避免兩個版本短暫或永久不一致。
- [x] 補強 Worker architecture contract，驗證所有會修改 remote data 的 mutation 都同時更新兩個版本檔。
- [x] 修正目前 repository 的版本不一致：`package.json` 與 `public/data/version.json` 必須重新同步。

## 2. Remote mutation 回傳資料權威性【高優先】
- [x] 修正 `src/api.ts` 的 mutation 後續流程，避免 `putItem()`／`deleteItem()` 成功後重新從可能過期的 static `./data/collection.json` 取得資料。
- [x] API mutation 成功後，Store 必須直接以該次 API response 作為 authoritative remote data。
- [x] 統一所有 Work／Item CRUD／圖片等 mutation 的 remote-apply 流程，避免各 UI 頁面自行建立第二份遠端資料狀態。
- [x] 補充 API mutation contract，明確驗證 mutation response 與 Store remote-apply 的資料流。
- [x] 驗證 mutation 後立即搜尋、排序、統計與 Detail 顯示的資料都是最新狀態。

## 3. Remote data 載入效能與 Read Model
- [x] 重新檢視 `store.ts` 目前「categories → 每個 category index → 每個 Item data」的多層 request 模式。
- [x] 評估建立適合前端讀取的 generated read model，降低收藏品增加後的 request 數量。
- [x] 保留目前 Item 級 canonical storage 與既有資料格式，不因效能優化恢復舊作品 JSON 整份覆寫模式。
- [x] 確認 generated read model 的更新時機、失敗 fallback 與版本一致性。
- [ ] 實測小、中、大資料量下的首次載入與重新載入效能，再決定是否正式導入。

## 4. CI / 自動化驗證覆蓋
- [x] 盤點 `.github/workflows/` 目前實際執行的 verification scripts。
- [x] 將目前已有但 CI 未完整覆蓋的關鍵 contract 納入 CI，包括 API mutation、Work identity、Statistics year／contract、Home ranking 等。
- [x] 確保 Worker read／write scope、image semantics、transaction、schema、category 等既有驗證在 CI 中有明確執行入口。
- [ ] 避免「script 已存在但實際 CI 不會跑」造成假性驗收完成。
- [ ] 驗證 CI 通過後再將對應 TODO 結案。

## 5. Dependency / Build 可重現性
- [ ] 檢查目前是否缺少 `package-lock.json`，以及現行 CI 使用 `npm install` 對依賴版本重現性的影響。
- [ ] 若確認需要 lockfile，建立並納入 repository。
- [ ] CI 改用與 lockfile 相容的 deterministic install 流程，例如 `npm ci`。
- [ ] 驗證 Vite、TypeScript 與 Worker 相關 build／verification 在乾淨環境可重現。

## 6. Event / Lifecycle 架構清理
- [x] 盤點 `image-viewer.ts`、Modal、Page render 等生命週期，確認重複初始化是否可能累積 event listener。
- [ ] 統一共用互動元件的 listener lifecycle，優先使用 delegation 或明確 mount／unmount 邊界。
- [ ] 檢查目前零散的 `dataset.bound` 類型防重複綁定做法，避免同一語意存在多種 lifecycle 實作。
- [x] 驗證反覆進入頁面、開關 Detail／Image Viewer 後沒有 listener 累積或重複觸發。

## 7. Sync Overlay 架構
- [ ] 重新評估 `sync-overlay` 目前透過 patch `window.fetch` 攔截 mutation 的方式。
- [ ] 若確認可行，改由 API mutation layer 明確控制同步狀態，避免全域 monkey patch `fetch`。
- [ ] 保留現有滿版阻塞、loading、success、error 的 UX contract，不因架構清理降低同步狀態可見性。
- [ ] 驗證所有 API mutation、圖片操作與非 mutation request 不會被錯誤阻塞或誤判。

## 8. Validation / Schema 單一來源
- [ ] 盤點 `src/api.ts`、`src/store.ts` 及其他資料入口中的重複 schema validation／normalization。
- [ ] 建立明確的 canonical validation／normalization 邊界，避免同一資料格式在不同模組各自定義。
- [ ] 確保外部 API、static data、mutation response、migration 進入 Store 前都經過一致驗證。
- [ ] 保留 `quantity`、Item ID、Category、Work identity 等既有 RULES contract，不因集中化而放寬驗證。

## 9. innerHTML / Rendering 安全清理
- [ ] 全面盤點目前仍存在的 `innerHTML` 使用位置。
- [ ] 只優先處理有 API、使用者輸入或其他外部資料插值的高風險位置。
- [ ] 可使用 `textContent`、DOM API 或既有安全 rendering utility 的地方改為安全方式。
- [ ] 不為了形式上的零 `innerHTML` 而重寫已安全且固定的靜態 markup。

## 10. CSS / Foundation 疊加清理
- [ ] 盤點 `styles.css`、`design-tokens.css`、`controls.css`、`shared-components.css`、`responsive-refinement.css`、`theme-refinement.css`、`card-enhancements.css`、feedback／overlay CSS 的責任邊界。
- [ ] 清除已被 shared foundation 取代、但仍殘留的重複 selector 與 legacy override。
- [ ] 不以新增 CSS override 解決既有 foundation 問題，優先移除舊實作並保留單一 canonical 定義。
- [ ] 特別檢查 legacy `toast.css` 與相關 import 是否仍可完全移除。
- [ ] 完成後重新驗證 Desktop、Tablet、Mobile、Light、Dark 的共用控制項。

## 11. Accessibility / UI Contract 最終檢查
- [ ] 盤點 Modal／Detail 的 focus trap、focus return、Escape、`aria-hidden` 與關閉行為。
- [ ] 檢查 Button、Input、Select、Loading、Disabled、Error、Empty 狀態的鍵盤與語意。
- [ ] 檢查圖片 alt、互動圖片、Mobile Navigation 與 responsive 狀態的可操作性。
- [ ] 確認 Item Detail、Statistics Detail 等 modal 不再互相共用模糊 selector 或 focus 狀態。

## 12. 最終架構驗收
- [ ] 以上項目完成後重新掃描整個 repository，確認沒有因清理而留下新舊架構並存。
- [ ] 執行完整 build 與適用的 verification scripts。
- [ ] 驗證 API mutation、資料載入、搜尋、排序、統計、CRUD、圖片與 Router 主要流程。
- [ ] 確認版本號、資料格式、Item ID、圖片路徑與部署設定均符合 `RULES.md`。
