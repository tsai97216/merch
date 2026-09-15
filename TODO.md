# Merch TODO / Architecture Roadmap

## Current state

- **目前開發版本：`1.109.638`。**
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
- [x] 建立 `verify:ci-contract`，自動檢查 `package.json` 中所有 `verify*` script 都有對應 CI entry，避免「script 存在但 CI 沒有執行」。
- [x] 驗證 CI 在目前 HEAD 實際通過後再關閉本節。

## 5. Dependency / Build Reproducibility
- [ ] 建立可重現的 dependency lockfile。
- [ ] 重新檢查 CI／deploy 的 install strategy。
- [ ] 驗證 Vite、TypeScript 與 Worker 相關 build／verification 在乾淨環境可重現。

### Dependency audit note
- 目前 `package.json` 僅有 TypeScript 與 Vite devDependencies，版本採 semver range；repository 尚無 `package-lock.json`。
- 本地離線環境無法可靠產生 lockfile，禁止手工偽造 lockfile。
- 已確認 Verify、Pages Deploy 與現有維運 workflow 目前仍使用 `npm install`；待取得真實 registry resolution 後，應以正式 lockfile 統一改為 `npm ci`，再做乾淨環境驗證。

## 6. Event / Lifecycle 架構清理
- [x] 盤點 `image-viewer.ts`、Modal、Page render 等生命週期，確認重複初始化是否可能累積 event listener。
- [x] 統一共用互動元件的 listener lifecycle，優先使用 delegation 或明確 mount／unmount 邊界。
- [x] 檢查目前零散的 `dataset.bound` 類型防重複綁定做法，避免同一語意存在多種 lifecycle 實作。
- [x] 驗證反覆進入頁面、開關 Detail／Image Viewer 後沒有 listener 累積或重複觸發。

### Lifecycle audit note
- `collection-controls.ts` 已改為以 `.collection-tools` 作為穩定 lifecycle 邊界，改用事件 delegation 處理排序、搜尋清除與輸入狀態，不再使用 `dataset.bound`／`dataset.groupsBound` 作為 listener 防重複旗標；控制項包裝也改以 DOM 結構判斷是否已建立。
- `add.ts` 已改為以頁面 DOM 作為明確 mount 邊界，使用 `AbortController` 管理 submit／click delegation，頁面替換時會先解除舊 listener，不再依賴 `dataset.bound`。
- `works-management.ts` 已改為明確 panel mount／unmount lifecycle，以 `AbortController` 管理 submit／click delegation，不再依賴 `dataset.bound`。
- `management.ts` 已改為以 `#management-root` 作為穩定 mount 邊界，所有表單、選擇器、搜尋與圖片操作改用 delegation；`window` 的跨頁選取事件也由同一個 `AbortController` 管理，不再依賴 `dataset.bound`。
- 本輪已完成 `src/` lifecycle pattern 的重新掃描：保留必要的穩定全域 delegation，移除可由 module/root lifecycle 管理的 dataset 防重複旗標；並新增 CI contract 驗證，防止 `dataset.bound` 類型旗標回歸。

## 7. Sync Overlay 架構
- [x] 重新評估 `sync-overlay` 目前透過 patch `window.fetch` 攔截 mutation 的方式。
- [x] 改由 API mutation layer 明確控制同步狀態，移除全域 monkey patch `fetch`。
- [x] 保留現有滿版阻塞、loading、success、error 的 UX contract，不因架構清理降低同步狀態可見性。
- [x] 驗證所有 API mutation、圖片操作與非 mutation request 不會被錯誤阻塞或誤判。

## 8. Validation / Schema 單一來源
- [x] 盤點 `src/api.ts`、`src/store.ts`、Worker 與其他資料入口中的重複 schema validation／normalization。
- [x] 建立明確的 canonical validation／normalization 邊界，避免同一資料格式在不同模組各自定義。
- [x] 確認外部 API、static data、mutation response、migration 產出的資料進入 Store 前都經過一致的資料驗證邊界。
- [x] 保留 `quantity`、Item ID、Category、Work identity 等既有 RULES contract，不因集中化而放寬驗證。

### Validation audit note
- `src/api.ts`、`src/store.ts` 與 `worker/src/index.ts` 各自保留不同責任：API 負責 untrusted response boundary，Store 負責 canonical storage → enriched Store model 的 normalization，Worker 負責 server-side mutation boundary。
- `src/validation.ts` 已提供 frontend shared primitive/schema boundary，API 與 Store 已使用；Worker 則建立獨立的 `worker/src/validation.ts`，不直接把 frontend module 帶入 Worker runtime。
- Worker 現已在 `worker/src/index.ts` 的 Item／Image／Shipping 結構驗證邊界使用 Worker validation module，同時保留 Worker 專屬的 Item ID、Category、Work、Shipping item existence、asset path 等 remote-context checks。
- Static `collection.json`、`shipping.json`、generated category/index/item data 在進入 Store 時均有 schema／結構驗證；API remote data 與 mutation response 亦先經 validation 再由 Store 的 remote-apply flow 接收。
- Migration completion verifier 會檢查新資料布局、schemaVersion、Item/index identity、canonical 欄位、quantity、圖片 metadata／實體檔案一致性與 legacy JSON 清除；Store 載入 migrated data 時仍會再次執行資料邊界驗證。
- `verify:validation` 與 `verify:worker-validation` 已驗證 shared／Worker validator exports、實際 import/use、重複結構檢查未回歸，以及 runtime accepted/rejected cases，並由 CI 執行。

## 9. innerHTML / Rendering 安全清理
- [x] 全面盤點目前仍存在的 `innerHTML` 使用位置。
- [x] 只優先處理有 API、使用者輸入或其他外部資料插值的高風險位置；目前掃描到的動態插值均經 `escapeHtml`，未發現需要緊急修正的未轉義外部字串。
- [x] 可使用 DOM API、`textContent` 或既有 `escapeHtml` utility 的位置已確認；現有動態 rendering 已採安全 utility。
- [x] 不為了形式上的零 `innerHTML` 而重寫已安全且固定的靜態 markup；sync overlay、viewer、modal 等固定模板保留 `innerHTML`。

## 10. CSS / Foundation 疊加清理
- [x] 盤點 `styles.css`、`design-tokens.css`、`controls.css`、`shared-components.css`、`responsive-refinement.css`、`theme-refinement.css`、`card-enhancements.css`、feedback／overlay CSS 的責任邊界。
- [x] 清除已被 shared foundation 取代的 `item-card` 基礎背景、邊框、圓角重複 selector，保留 page-specific layout／hover 行為。
- [x] 不以新增 CSS override 解決既有 foundation 問題，本輪將 `item-card` 的共用視覺基礎集中到 `shared-components.css`。
- [x] 確認目前沒有 `src/toast.css` legacy 檔案或相關 import 需要移除；Toast 狀態樣式已由 shared foundation 提供。
- [ ] 完成後重新驗證 Desktop、Tablet、Mobile、Light、Dark 的共用控制項。

## 11 Accessibility / UI Contract 最終檢查
- [x] 盤點 Modal／Detail 的 focus trap、focus return、Escape、`aria-hidden` 與關閉行為。
- [x] 檢查 Button、Input、Select、Loading、Disabled、Error、Empty 狀態的鍵盤與語意。
- [x] 驗證 responsive 與 keyboard interaction 不因架構清理退化。

### Accessibility audit note
- `image-viewer.ts` 已具備 `role="dialog"`、`aria-modal="true"`、Escape 關閉、Tab focus trap 與關閉後 focus return，可作為共用 Modal lifecycle 的參考基準。
- Item Detail 原有 `detail-focus.ts` 已提供專用 Detail 的 Tab focus trap、開啟 focus 與 hash 關閉後 focus restoration。
- 本輪將同一份 `detail-focus.ts` 抽出 `setupDialogFocus()` primitive，並透過 MutationObserver 自動套用至 Statistics Detail／Work Detail popup，包含初始 focus、Tab trap 與移除後 focus return。
- Button／input／select foundation 已統一提供 `:focus-visible`、disabled、`aria-disabled`、`aria-invalid` 等狀態；主要表單控制項均有對應 label 或 aria-label，form loading 使用 `aria-busy`。
- Item card、Statistics 可互動資料列具備鍵盤啟動語意；圖片動態渲染使用 `alt`，裝飾性 icon／logo 使用 `aria-hidden`；主要導覽使用具名 `nav`，Mobile 狀態仍保留可操作的原生連結與按鈕。
- 本輪乾淨 build 驗證發現 `detail-focus.ts` 的 MutationObserver 節點型別為 `Element`，傳入 `HTMLElement` focus helper 前需要明確型別收窄；已修正，且 1.109.616 的 Verify CI 已實際通過。

## 12. Final Architecture Acceptance
- [ ] 所有高風險資料／同步／生命週期問題完成。
- [ ] 所有對應 verification scripts 已存在並被 CI 執行。
- [ ] 乾淨 build、verification、deploy path 完成最終驗收。
- [ ] 確認沒有為解決小問題而留下 workaround／duplicate architecture。
