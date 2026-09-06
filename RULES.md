# merch 開發規則與寫法

> 本文件是本專案的長期開發規格與踩坑紀錄。之後修改前應先閱讀；確立新規則後要同步補進本文件。
>
> 核心原則：**先理解既有規則，再修改；新增功能時要把資料、UI、互動、錯誤處理、版本與 TODO 一起考慮。**

## 0. 修改前必讀

每次開始修改前，先確認：

1. `RULES.md` 是否已有相關規則。
2. `TODO.md` 是否已有對應項目。
3. `merch-old` 是否有相同或接近的 UI / UX 行為可參考。
4. 現有資料結構、Store、Router、搜尋與 rendering 是否已經有可重用的邏輯。
5. 是否會影響既有 Item ID、資料格式、版本號或部署。

**不要為了完成一個小功能直接重寫整個專案。** 優先修改最小必要範圍；只有確認架構本身需要重建時才進行大範圍重寫。

## 1. 專案架構

- 技術基礎：TypeScript + Vite + ES Modules。
- GitHub Pages 為正式部署環境。
- 正式網址：`merch.chi.qzz.io`。
- `merch-old` 是 UI/UX 與功能參考，不直接複製其程式碼。
- `src/` 放應用程式邏輯；`public/data/` 放可部署的資料檔案。
- 不要讓單一頁面自行建立與 Store 不一致的資料副本。

## 2. UI/UX 基準

- `tsai97216/merch-old` 僅作為歷史參考與設計靈感來源，不是硬性 UI/UX 或功能驗收基準。
- 新架構重新實作，不直接複製舊版程式碼。
- 新增元件或頁面時，可參考既有視覺語言、間距、圓角、陰影、字體階層與互動方式，但以目前專案架構與實際需求為準。
- Sidebar、Navigation、Header、Card、Panel、Button、Badge、Input、Modal、Toast 等元件應保持全站一致。
- 不要為單一頁面任意建立另一套視覺規則。
- Desktop、Tablet、Mobile 都要考慮，不可只以桌面畫面判斷功能完成。
- 新增互動時要考慮 hover、focus-visible、disabled、loading、empty、error 等狀態。

## 3. 版本號

- 唯一正式版本來源：`public/data/version.json`。
- 格式：`Major.Minor.Patch`。
- `Major`：大版本／架構世代重寫。
- `Minor`：每次完整邏輯／功能修改。
- `Patch`：GitHub API 新增／移除收藏或圖片。
- reorder 與 cover replacement 不增加 Patch。
- 不使用版本號作為 module cache。
- 不使用 `?v=version`、`?build=...` 等 cache hack。
- UI 顯示版本應從 Store 載入的正式版本來源取得，不要在多個地方硬編版本號。
- 修改完成後要確認版本號是否依規則更新，而不是只看 `package.json`。

## 4. Work / 作品

- 作品「顯示名稱」與「內部代碼」必須分開。
- `Work.name`：使用者看到的完整作品名稱，例如 `崩壞：星穹鐵道`。
- `Work.code`：內部短代碼，例如 `HSR`。
- 不要把 `name` 當作 code 使用。
- 一般 UI 優先顯示完整作品名稱；只有需要識別、解析 ID 或資料處理時才使用 code。
- 目前作品代碼：
  - `HSR` = 崩壞：星穹鐵道
  - `GI` = 原神
  - `ZZZ` = 絕區零
  - `WW` = 鳴潮
- 新增作品時，必須同步考慮 `works.json`、type、schema validation、Item ID、Store、搜尋與 UI 顯示。

## 5. Item ID

- Item ID 是永久識別碼，刪除後不可重新編號。
- ID 依「作品 + 類型」分組遞增。
- 格式：`作品代碼 + 類型代碼 + 三位流水號`，例如 `GIa001`、`HSRf001`。
- 新增 Item 時依現有 ID 規則產生下一個序號。
- 不因刪除舊 Item 而填補中間缺號。
- 不要因 UI 排序、重新整理或資料搬移而改變既有 ID。
- Item ID 與使用者看到的標題是不同概念，不要用標題取代 ID。

## 6. Category / 類型

- 類型有內部 code 與完整顯示名稱，兩者分開保存。
- 目前類型 code：
  - `a` 壓克力／亞克力
  - `b` 徽章／吧唧
  - `c` 卡片／訂金卡
  - `d` 立牌／擺件
  - `e` 電子產品
  - `f` 手辦／模型
  - `g` 文具
  - `h` 海報／掛畫／掛軸
  - `k` 掛件／吊飾
  - `l` 文件／資料夾
  - `m` 書籍／漫畫
  - `n` 明信片
  - `p` 毛絨／布偶
  - `q` 鑰匙圈
  - `r` 雷射票
  - `s` 色紙
  - `v` 服飾
  - `w` 餐具／生活用品
  - `y` 特典
  - `o` 其他
- 新增類型時，必須同步更新 `public/data/categories.json`、相關 type / validation、ID 規則、搜尋與 UI 顯示。
- 類型的顯示名稱應保持使用者友善，不要在一般 UI 直接顯示內部 code。

## 7. Item Quantity / 數量

- `Item` 代表一種收藏資料，不代表固定只有一個實物。
- 同一款、同一版本、同一規格、同一收藏資料的複數實物，使用同一個 Item ID，以 `quantity` 記錄實際持有件數。
- 只有在角色、版本／圖樣、尺寸、附贈內容或其他收藏資料本身不同時，才建立新的 Item ID。
- `quantity` 必須是大於等於 1 的整數。
- 舊資料沒有 `quantity` 時，載入時視為 `1`，不可因此讓既有資料失效。
- **收藏品種類數** = Item 記錄筆數。
- **實際周邊數量** = 所有 Item 的 `quantity` 總和。
- 單項實際價值 = `purchase.price × quantity`。
- 總消費 = 所有 Item 的 `purchase.price × quantity` 加總。
- 按作品、類別、角色、廠商、狀態等統計「數量」時，一律加總 `quantity`，不能只計算 Item 筆數。
- 若統計明確描述「種類」，才使用 Item 筆數。
- UI 顯示單價時仍可顯示原始單價，但若數量大於 1，應讓使用者知道實際數量與該項合計價值。
- 新增或修改數量功能時，必須同步檢查 type、schema validation、Store、既有資料相容性、Collection、Detail、Dashboard、Statistics 與後續 Management CRUD。

### 7.1 Quantity Validation

- 所有進入 Store 的 Item 都必須經過同一套 quantity validation / normalization。
- 不得使用 `quantity || 1` 這類會把非法值靜默轉成合法值的寫法取代正式驗證。
- 缺少 quantity 的舊資料可以相容性預設為 `1`。
- 已存在但格式錯誤的 quantity 不應被無條件當成 `1`。
- 新增、編輯、載入、migration、API response 都必須遵守相同 quantity 規則。

## 8. Search / 搜尋規則

- 搜尋是 Collection 的核心功能之一。
- 搜尋文字應能與使用者看到的名稱、角色、作品、類型、廠商、Item ID 等既有可搜尋資料一致。
- 內部 code 可以作為搜尋識別，但不能因此犧牲完整名稱的可搜尋性。
- 新增可搜尋欄位時，要同步更新搜尋索引／搜尋文字組合邏輯與 UI。
- 搜尋無結果時維持既有 Empty State。
- 搜尋、Filter、Sort 與顯示模式不可各自維護互相矛盾的資料狀態。

## 9. 跨頁搜尋轉跳規則

### 9.1 核心規則

**任何可以代表搜尋條件的統計、排名、摘要或 Dashboard 項目，只要使用者點擊後可以合理查看對應收藏，就必須提供搜尋轉跳。**

不要只做「看起來可以點」的 UI，必須完成完整流程：

`點擊項目 → Collection → 帶入搜尋條件 → 顯示對應結果`

### 9.2 目前既有行為

- 主頁「角色排名」點角色名稱 → `#/collection` → 搜尋該角色。
- 主頁「作品統計」點作品名稱 → `#/collection` → 搜尋該作品。
- 統計頁「作品」點作品名稱 → `#/collection` → 搜尋該作品。
- 統計頁「類型」點類型名稱 → `#/collection` → 搜尋該類型。

### 9.3 未來新增統計時

- 角色統計／排名 → 點角色 → 搜尋角色。
- 廠商統計 → 點廠商 → 搜尋廠商。
- 狀態統計 → 點狀態 → 搜尋對應狀態。
- 作品消費統計 → 若項目代表單一作品 → 點作品 → 搜尋作品。
- 其他可以唯一或合理對應收藏的統計 → 原則上提供搜尋轉跳。

### 9.4 實作規則

- 目前跨頁搜尋邏輯集中於 `src/cross-navigation.ts`。
- 動態 rendering 的統計／排名元素優先使用事件 delegation，不要每次 render 都重新綁定大量 listener。
- 搜尋轉跳不能只修改 hash；必須確認 Collection 搜尋欄位實際收到 query 並觸發搜尋。
- 轉跳後要保持既有搜尋 Empty State、Filter、Sort 與顯示模式行為。
- 搜尋 query 優先使用使用者看到且搜尋系統可識別的值。
- 如果一個統計項目需要複合條件才能準確表示，不能只塞一個模糊文字當 query，應設計相應的 Filter / query state。

## 10. Router / Navigation

- 使用 Hash Router。
- 既有主要 route：
  - `#/home`
  - `#/collection`
  - `#/statistics`
  - `#/management`
  - `#/settings`
  - `#/item/:id`
- 重新整理後應能恢復目前 route。
- Back / Forward 必須保持正常。
- malformed URL、decode 失敗與多餘 route segments 必須安全處理。
- 404 不應造成整個 App 白屏。
- Route navigation 與 page rendering 應保持解耦。
- 從其他頁面跳 Collection 搜尋時，Router 與搜尋狀態都必須正確更新。

## 11. Data / Store

- Store 是資料與 UI state 的主要來源。
- Page 不持有自己的資料副本。
- State 更新採 immutable 原則。
- Store state 應視為唯讀資料，不得讓呼叫端直接修改 nested array / object。
- `Object.freeze()` 若使用，只能視為輔助保護，不可視為完整 immutable 保證。
- 若 nested data 會被修改，必須透過 Store 的更新方法建立新的 array / object。
- 不要在 Page、rendering 或 utility 中直接修改 Store state。
- Store 必須維持 subscribe / unsubscribe 生命週期。
- 新增資料欄位時，至少檢查：type、schema、Store、migration、rendering、既有資料相容性。
- 不要只修改 UI 而忘記 data validation。
- API 回傳資料進 Store 前要先驗證 schema。
- 不可信資料不能直接假設為合法資料。

## 12. Rendering / DOM / XSS

- 使用者輸入、API 資料與外部資料一律視為不可信。
- 優先使用安全 DOM rendering、DOM API、`textContent` 與既有安全 utility。
- 不要把未處理的外部字串直接塞入 `innerHTML`。
- 如果必須使用 `innerHTML`，所有外部／使用者資料必須先經過適當 escaping / sanitization。
- 主要 UI 應由主要 rendering logic 直接產生正確的最終 DOM 結構。
- 不應依賴第二層 DOM 掃描、regex 或其他 post-processing 來修補主要 rendering。
- 不使用 MutationObserver 進行 UI 狀態、搜尋、排序或資料顯示後處理。
- 動態元素需要互動時優先使用事件 delegation。
- 不要在每次 render 重複新增相同 document listener。
- 外部 URL、圖片 URL、API error 原文都不能直接當可信 HTML。

## 13. Loading / Empty / Error

每個資料驅動區塊都要考慮至少三種狀態：

- Loading：資料尚未完成載入。
- Empty：資料成功載入，但沒有可顯示內容。
- Error：資料載入或處理失敗。

規則：

- 不要把 Loading、Empty、Error 混成同一個狀態。
- Empty 不是 Error。
- Error 訊息應對使用者可理解，不要直接把原始 exception 當 UI HTML。
- JS 載入失敗時，首頁仍應保有基本可見內容。
- 新增頁面或資料區塊時不要只處理正常資料狀態。

## 14. Collection

- 支援：全部、作品分類、搜尋、Filter、Sort、狀態篩選。
- 卡片／清單顯示模式需可切換並記住使用者選擇。
- Collection 卡片至少保持既有的封面、標題、作品、角色、類別、價格、狀態資訊呈現邏輯。
- 點擊 Item 應能進入詳細頁。
- 篩選條件組合必須正確。
- 無結果使用 Empty State。
- 圖片載入失敗使用 fallback。
- 未完成的類別／角色／廠商 Filter 不可假裝已完成。
- 新增 Filter 時要檢查與搜尋、Sort、URL / Store state 的互動。
- 顯示數量時使用 `quantity`；Item 筆數與實際持有件數是不同概念。

## 15. Statistics / 統計

目前已存在：

- 按作品統計。
- 按類別統計。
- 總消費。

統計計算規則：

- 所有「數量」統計預設代表實際持有件數，使用 `Σ quantity`。
- 所有消費統計使用 `Σ(purchase.price × quantity)`。
- Item 筆數只有在統計明確表示「收藏品種類數」時才使用。
- 若同一 Item 的 quantity > 1，不可在數量統計中只算 1。

未來新增統計時：

1. 先定義統計資料來源與計算方式。
2. 明確區分「種類數」與「實際件數」。
3. 消費統計確認是否需要 `price × quantity`。
4. 再決定 UI rendering。
5. 若統計項目對應收藏集合，加入搜尋轉跳。
6. 確認空資料、單一資料、零值與異常值。
7. 確認手機版排版。
8. 必要時將計算邏輯與 UI rendering 分離。
9. 更新 TODO.md 與本 RULES.md。

**統計數字本身不是完成條件，互動行為也屬於功能的一部分。**

## 16. Management / CRUD

- 管理頁目前的選擇流程為：`作品 → 周邊類型 → 流水號`，選項應依前一層條件動態縮小範圍。
- 管理頁搜尋應能與作品、類型、流水號及 Item 的既有可搜尋欄位保持一致。
- 作品／類型／流水號選擇與搜尋結果不可互相矛盾；切換條件後應同步目前選取的 Item。
- 管理頁的搜尋輸入不應因無關的 render 而失去焦點或使用者輸入。
- CRUD 功能必須有表單 validation。
- 新增／編輯不可產生重複 ID 或破壞既有資料。
- 編輯表單應保留使用者輸入狀態，不因無關 render 遺失。
- 刪除必須有明確確認流程。
- 成功與失敗都必須有使用者可理解的回饋。

## 17. GitHub API / Worker

- Frontend 不得保存或暴露 GitHub Token。
- GitHub 寫入必須經 API / Worker layer。
- API layer 必須限制可操作 path。
- API 必須驗證 HTTP method、認證資訊與 request payload。
- API response 在進入 Store 前必須驗證 schema。
- API error 不得直接把 GitHub 原始 HTML / response body 當 UI。
- API 必須處理 timeout、network failure、CORS 與認證失敗。
- Worker Secret / GitHub Token 不得進入 frontend bundle。
- GET / PUT / DELETE 等操作必須與實際資料模型一致。

## 18. Write Consistency

GitHub 寫入流程固定為：

`validate → fetch latest remote state → build new state → write remote → update Store → handle version`

- 寫入前必須重新取得最新 remote state，避免以過期 Store 覆蓋他人或其他操作的更新。
- 所有 request payload 必須先 validation。
- Remote write 成功前不得更新 Store 成為「假成功」狀態。
- Remote write 失敗時維持原 Store state，並顯示可理解的失敗提示。
- Version 必須依第 3 節規則處理。
- 涉及圖片寫入時必須額外遵守 Image Management 規則。

## 19. Image Management

- 支援 JPG / PNG / WebP / GIF。
- 單張圖片不得超過 10MB。
- 第一張圖片為預設封面。
- 新增／刪除圖片會增加 Patch。
- 圖片 reorder 不增加 Patch。
- cover replacement 不增加 Patch。
- 圖片新增前應檢查 duplicate SHA。
- 圖片寫入必須處理 SHA mismatch 與 rollback。
- 刪除目前封面後，必須自動選擇有效的新封面。
- 外部圖片 URL 必須經 validation。

## 20. TODO / 完成判定

- TODO `[x]` 代表功能已實際完成並可由目前架構正常使用，不代表「已有部分程式碼」。
- 若功能只有部分完成，維持 `[ ]`。
- 若程式碼存在但與目前 rendering、Store、Router 或 UI 流程沒有真正接通，不得勾選完成。
- 掃描發現既有 `[x]` 與實際狀態不一致時，應優先修正 TODO 狀態，而不是為了維持進度硬將功能視為完成。
- UI 功能完成必須同時考慮 Desktop、Tablet、Mobile。
- 涉及跨模組功能時，必須確認完整流程，而不是只確認單一模組存在。
- 已否決或禁止使用的方案不應作為 TODO 待辦項目；應記錄於本 RULES.md。

## 21. Rendering Architecture

- 主要 rendering 與資料模型、Store、Router 的責任應清楚分離。
- 主要 UI 應由主要 rendering logic 直接產生正確結果。
- 不應透過第二層 DOM 掃描、MutationObserver 或事後 regex 處理來補足主要 UI。
- 若既有 enhancement module 與主要 rendering 結構不一致，優先修正主要 rendering 或移除無必要的 enhancement layer。
- 不為了維持舊有 workaround 而增加更多 DOM post-processing。
- 新增 UI 功能時，優先讓 rendering 一次產生可直接使用的最終 DOM。
