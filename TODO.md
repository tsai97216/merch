# Merch TODO / Architecture Roadmap

## Current state

- **目前開發版本：`1.109.608`。**
- 本輪以現有程式與資料流重新盤點，不進行整體重寫。
- 優先處理資料權威性、版本一致性、驗證覆蓋與架構邊界，再處理效能與清理型工作。

## 1. Version Sync / Release Consistency
- [x] 建立單一版本來源與同步規則。
- [x] Worker mutation 與 `package.json`／`public/data/version.json` 原子同步。
- [x] CI 驗證版本一致性。

## 2. Remote Mutation / Store Authority
- [x] mutation response 進入 Store 前完成 schema validation。
- [x] remote mutation 成功後，以 API authoritative data 更新 Store。
- [x] 避免 UI 自行重建 remote state。

## 3. Remote Data Loading / Read Model
- [x] 盤點 nested request 模式與 static collection fallback。
- [x] 評估 generated collection read model 是否已有實作。
- [x] 保留 Item canonical storage，不以 read model 取代 canonical data。
- [x] 確認 generated read model 的產生時機、fallback 與版本一致性。
- [ ] 補上正式的 loading performance measurement。

## 4. CI / Automation
- [x] 盤點現有 verification workflow。
- [x] 補上缺失的 API／Worker／statistics contract verification。
- [x] 確認 worker read/write/image/transaction 等重要 contract 有 CI entry。
- [ ] 避免「script 存在但 CI 沒有執行」的情況。
- [ ] 驗證 CI 在目前 HEAD 實際通過後再關閉本節。

## 5. Dependency / Build Reproducibility
- [ ] 建立可重現的 dependency lockfile。
- [ ] 重新檢查 CI／deploy 的 install strategy。
- [ ] 驗證 Vite、TypeScript 與 Worker 相關 build／verification 在乾淨環境可重現。

## 6. Event / Lifecycle 架構清理
- [x] 盤點 `image-viewer.ts`、Modal、Page render 等生命週期，確認重複初始化是否可能累積 event listener。
- [ ] 統一共用互動元件的 listener lifecycle，優先使用 delegation 或明確 mount／unmount 邊界。
- [ ] 檢查目前零散的 `dataset.bound` 類型防重複綁定做法，避免同一語意存在多種 lifecycle 實作。
- [x] 驗證反覆進入頁面、開關 Detail／Image Viewer 後沒有 listener 累積或重複觸發。

## 7. Sync Overlay 架構
- [x] 重新評估 `sync-overlay` 目前透過 patch `window.fetch` 攔截 mutation 的方式。
- [x] 改由 API mutation layer 明確控制同步狀態，移除全域 monkey patch `fetch`。
- [x] 保留現有滿版阻塞、loading、success、error 的 UX contract，不因架構清理降低同步狀態可見性。
- [x] 驗證所有 API mutation、圖片操作與非 mutation request 不會被錯誤阻塞或誤判。

## 8. Validation / Schema 單一來源
- [x] 盤點 `src/api.ts`、`src/store.ts`、Worker 與其他資料入口中的重複 schema validation／normalization。
- [ ] 建立明確的 canonical validation／normalization 邊界，避免同一資料格式在不同模組各自定義。
- [ ] 確保外部 API、static data、mutation response、migration 進入 Store 前都經過一致驗證。
- [ ] 保留 `quantity`、Item ID、Category、Work identity 等既有 RULES contract，不因集中化而放寬驗證。

### Validation audit note
- `src/api.ts`、`src/store.ts` 與 `worker/src/index.ts` 確實存在重複的 Item／Shipping／Image 等 schema checks。
- 目前三者並非完全同語意：Store 還負責 canonical storage → enriched Store model 的 normalization；API 負責 untrusted response boundary；Worker 負責 server-side mutation boundary。
- 因此本輪只完成盤點，**沒有直接把三套 validator 強行合併**，避免為了形式上的 single source 而破壞既有 boundary 或放寬驗證。
- 下一步應先抽出真正共通的 primitive/schema contract，再讓三個 boundary 各自保留必要的 context validation。

## 9. innerHTML / Rendering 安全清理
- [x] 全面盤點目前仍存在的 `innerHTML` 使用位置。
- [x] 只優先處理有 API、使用者輸入或其他外部資料插值的高風險位置；目前掃描到的動態插值均經 `escapeHtml`，未發現需要緊急修正的未轉義外部字串。
- [x] 可使用 DOM API、`textContent` 或既有 `escapeHtml` utility 的位置已確認；現有動態 rendering 已採安全 utility。
- [x] 不為了形式上的零 `innerHTML` 而重寫已安全且固定的靜態 markup；sync overlay、viewer、modal 等固定模板保留 `innerHTML`。

## 10. CSS / Foundation 疊加清理
- [ ] 盤點 `styles.css`、`design-tokens.css`、`controls.css`、`shared-components.css`、`responsive-refinement.css`、`theme-refinement.css`、`card-enhancements.css`、feedback／overlay CSS 的責任邊界。
- [ ] 清除已被 shared foundation 取代、但仍殘留的重複 selector 與 legacy override。
- [ ] 不以新增 CSS override 解決既有 foundation 問題，優先移除舊實作並保留單一 canonical 定義。
- [ ] 特別檢查 legacy `toast.css` 與相關 import 是否仍可完全移除。
- [ ] 完成後重新驗證 Desktop、Tablet、Mobile、Light、Dark 的共用控制項。

## 11. Accessibility / UI Contract 最終檢查
- [ ] 盤點 Modal／Detail 的 focus trap、focus return、Escape、`aria-hidden` 與關閉行為。
- [ ] 檢查 Button、Input、Select、Loading、Disabled、Error、Empty 狀態的鍵盤與語意。
- [ ] 驗證 responsive 與 keyboard interaction 不因架構清理退化。

## 12. Final Architecture Acceptance
- [ ] 所有高風險資料／同步／生命週期問題完成。
- [ ] 所有對應 verification scripts 已存在並被 CI 執行。
- [ ] 乾淨 build、verification、deploy path 完成最終驗收。
- [ ] 確認沒有為解決小問題而留下 workaround／duplicate architecture。
