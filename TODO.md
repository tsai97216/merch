# Merch TODO / Architecture Roadmap

## Current state

- **目前開發版本：`1.109.642`。**
- 1.109.641 已完成主要架構驗證、CI、Build、Pages／Worker Deploy 與實機驗收；目前進入「小幅功能／UI 調整」階段，不再進行整體架構重寫。
- 後續修改仍以根因修正、共用架構與資料權威性為優先，完成每項修改後再重新驗證。

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
- [x] 補上正式的 loading performance measurement。

## 4. CI / Automation
- [x] 盤點現有 verification workflow。
- [x] 補上缺失的 API／Worker／statistics contract verification。
- [x] 確認 worker read/write/image/transaction 等重要 contract 有 CI entry。
- [x] 建立 `verify:ci-contract`，自動檢查 `package.json` 中所有 `verify*` script 都有對應 CI entry。
- [x] 驗證 CI 在目前 HEAD 實際通過。

## 5. Dependency / Build Reproducibility
- [x] 建立可重現的 dependency lockfile。
- [x] 重新檢查 CI／deploy 的 install strategy。
- [x] 驗證 Vite、TypeScript 與 Worker 相關 build／verification 在乾淨環境可重現。

### Dependency audit note
- `package-lock.json` 使用 lockfileVersion 3，並與 `package.json` 保持版本同步。
- Verify、Pages Deploy、Worker deploy build，以及現有維運／migration workflow 的 dependency install 已統一為 `npm ci`。
- 一次性的 lockfile bootstrap／version sync workflow 已在完成同步後移除，不保留額外 workaround。
- 1.109.641 的 Verify 與 Pages／Worker Deploy 已實際以 `npm ci` 完成，Verify 的全部 verification 與 TypeScript／Vite build 成功，Deploy 的 Pages build、Pages deploy、Worker secrets 驗證與 Worker deploy 也全部成功。

## 6. Event / Lifecycle 架構清理
- [x] 盤點 `image-viewer.ts`、Modal、Page render 等生命週期。
- [x] 統一共用互動元件的 listener lifecycle，優先使用 delegation 或明確 mount／unmount 邊界。
- [x] 清理 `dataset.bound` 類型防重複綁定做法。
- [x] 驗證反覆進入頁面、開關 Detail／Image Viewer 後沒有 listener 累積或重複觸發。

## 7. Sync Overlay 架構
- [x] 重新評估 `sync-overlay` 透過 patch `window.fetch` 攔截 mutation 的方式。
- [x] 改由 API mutation layer 明確控制同步狀態，移除全域 monkey patch `fetch`。
- [x] 保留滿版阻塞、loading、success、error 的 UX contract。
- [x] 驗證 API mutation、圖片操作與非 mutation request 不會被錯誤阻塞或誤判。

## 8. Validation / Schema 單一來源
- [x] 盤點 frontend、Store、Worker 與其他資料入口中的重複 schema validation／normalization。
- [x] 建立 canonical validation／normalization 邊界。
- [x] 確認外部 API、static data、mutation response、migration 資料均經一致的驗證邊界。
- [x] 保留 `quantity`、Item ID、Category、Work identity 等既有 RULES contract。

## 9. innerHTML / Rendering 安全清理
- [x] 全面盤點目前仍存在的 `innerHTML` 使用位置。
- [x] 高風險外部資料插值均經 `escapeHtml` 或安全 utility。
- [x] 不為形式上的零 `innerHTML` 而重寫安全且固定的靜態 markup。

## 10. CSS / Foundation 疊加清理
- [x] 盤點各 CSS foundation 與 refinement layer 的責任邊界。
- [x] 清除已被 shared foundation 取代的 `item-card` 重複 selector。
- [x] 不以新增 CSS override 解決 foundation 問題。
- [x] 確認 Toast 狀態樣式已由 shared foundation 提供。
- [x] 完成 Desktop、Tablet、Mobile、Light、Dark 的共用控制項驗證與實機驗收。

## 11. Accessibility / UI Contract 最終檢查
- [x] 盤點 Modal／Detail 的 focus trap、focus return、Escape、`aria-hidden` 與關閉行為。
- [x] 檢查 Button、Input、Select、Loading、Disabled、Error、Empty 狀態的鍵盤與語意。
- [x] 驗證 responsive 與 keyboard interaction 不因架構清理退化。

## 12. Final Architecture Acceptance
- [x] 所有目前已知的高風險資料／同步／生命週期問題完成。
- [x] 所有對應 verification scripts 已存在並被 CI 執行。
- [x] 乾淨 build、verification、deploy path 完成最終驗收。
- [x] 已確認目前沒有已知 workaround／duplicate architecture。

## 13. 後續修改
- [ ] 使用者提出的新功能、UI、資料或流程調整另行建立項目。
- [ ] 每個新項目完成後補充對應 verification，避免已封版的架構規則再次被破壞。
