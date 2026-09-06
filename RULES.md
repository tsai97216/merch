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
- Desktop、Tablet、Mobile 都要考慮。
- 新增互動時要考慮 hover、focus-visible、disabled、loading、empty、error 等狀態。

## 3. 版本號

- 唯一正式版本來源：`public/data/version.json`。
- 格式：`Major.Minor.Patch`。
- `Major`：大版本／架構世代重寫。
- `Minor`：每次完整邏輯／功能修改。
- `Patch`：GitHub API 新增／移除收藏或圖片。
- reorder 與 cover replacement 不增加 Patch。
- 不使用版本號作為 module cache，也不使用 `?v=version`、`?build=...` 等 cache hack。
- UI 顯示版本應從 Store 載入的正式版本來源取得，不要在多個地方硬編版本號。
- 修改完成後要確認版本號是否依規則更新，而不是只看 `package.json`。

## 4. Work / 作品

- 作品「顯示名稱」與「內部代碼」必須分開。
- `Work.name`：使用者看到的完整作品名稱。
- `Work.code`：內部短代碼。
- 一般 UI 優先顯示完整作品名稱；需要識別、解析 ID 或資料處理時才使用 code。
- 目前作品代碼：`HSR`、`GI`、`ZZZ`、`WW`。
- 新增作品時，必須同步考慮 `works.json`、schema validation、Item ID、Store、搜尋與 UI 顯示。

## 5. Item ID

- Item ID 是永久識別碼，刪除後不可重新編號。
- ID 依「作品 + 類型」分組遞增。
- 格式：`作品代碼 + 類型代碼 + 三位流水號`，例如 `GIa001`、`HSRf001`。
- 不因刪除舊 Item 而填補中間缺號。
- 不要因 UI 排序、重新整理或資料搬移而改變既有 ID。
- 既有 Item ID 永久保留，即使未來修正商品分類，也不可為了讓 ID 與新分類一致而重新編號。
- ID 中的歷史類型 code 與目前 `category` 欄位是兩個概念；舊 ID 可以保留已淘汰的歷史 code。
- Item ID 與使用者看到的標題是不同概念，不要用標題取代 ID。

## 6. Category / 類型

- 類型 code、顯示名稱與完整分類規則統一記錄於 **`ITEM_TYPES.md`**。
- **`ITEM_TYPES.md` 是目前周邊類型的唯一規格來源。**
- 本文件不再重複列出類型清單，避免出現兩份互相矛盾的分類規則。
- 新增、刪除或修改類型時，必須先更新 `ITEM_TYPES.md`，再同步檢查 `public/data/categories.json`、type / validation、Item ID、資料路徑、搜尋與 UI。

## 7. Item Quantity / 數量

- `Item` 代表一種收藏資料，不代表固定只有一個實物。
- 同一款、同一版本、同一規格、同一收藏資料的複數實物，使用同一個 Item ID，以 `quantity` 記錄實際持有件數。
- `quantity` 必須是大於等於 1 的整數。
- 舊資料沒有 `quantity` 時，載入時視為 `1`。
- 收藏品種類數 = Item 記錄筆數。
- 實際周邊數量 = 所有 Item 的 `quantity` 總和。
- 單項實際價值 = `purchase.price × quantity`。
- 總消費 = 所有 Item 的 `purchase.price × quantity` 加總。
- 按作品、類別、角色、廠商、狀態等統計「數量」時，一律加總 `quantity`。
- 若統計明確描述「種類」，才使用 Item 筆數。

### 7.1 Quantity Validation

- 所有進入 Store 的 Item 都必須經過同一套 quantity validation / normalization。
- 不得使用 `quantity || 1` 將非法值靜默轉成合法值。
- 缺少 quantity 的舊資料可以相容性預設為 `1`。
- 已存在但格式錯誤的 quantity 不應被無條件當成 `1`。
- 新增、編輯、載入、migration、API response 都必須遵守相同 quantity 規則。

## 8. Search / 搜尋規則

- 搜尋是 Collection 的核心功能之一。
- 搜尋文字應能與使用者看到的名稱、角色、作品、類型、廠商、Item ID 等可搜尋資料一致。
- 新增可搜尋欄位時，要同步更新搜尋索引與 UI。
- 搜尋無結果時維持 Empty State。
- 搜尋、Filter、Sort 與顯示模式不可各自維護互相矛盾的資料狀態。

## 9. 跨頁搜尋轉跳規則

- 任何可以代表搜尋條件的統計、排名、摘要或 Dashboard 項目，只要使用者點擊後可以合理查看對應收藏，就必須提供搜尋轉跳。
- 完整流程：`點擊項目 → Collection → 帶入搜尋條件 → 顯示對應結果`。
- 目前跨頁搜尋邏輯集中於 `src/cross-navigation.ts`。
- 動態 rendering 優先使用事件 delegation。
- 搜尋轉跳不能只修改 hash；必須確認 Collection 搜尋欄位實際收到 query 並觸發搜尋。
- 複合條件應使用相應 Filter / query state，而不是塞一個模糊文字。

## 10. Router / Navigation

- 使用 Hash Router。
- 主要 route：`#/home`、`#/collection`、`#/statistics`、`#/management`、`#/settings`、`#/item/:id`。
- 重新整理後應能恢復目前 route。
- Back / Forward 必須正常。
- malformed URL、decode 失敗與多餘 route segments 必須安全處理。
- 404 不應造成整個 App 白屏。
- Route navigation 與 page rendering 應保持解耦。

## 11. Data / Store

- Store 是資料與 UI state 的主要來源。
- Page 不持有自己的資料副本。
- State 更新採 immutable 原則。
- 不要在 Page、rendering 或 utility 中直接修改 Store state。
- Store 必須維持 subscribe / unsubscribe 生命週期。
- 新增資料欄位時至少檢查 type、schema、Store、migration、rendering 與既有資料相容性。
- API 回傳資料進 Store 前要先驗證 schema。
- 不可信資料不能直接假設為合法資料。

## 12. Rendering / DOM / XSS

- 使用者輸入、API 資料與外部資料一律視為不可信。
- 優先使用安全 DOM rendering、DOM API、`textContent` 與既有安全 utility。
- 不要把未處理的外部字串直接塞入 `innerHTML`。
- 不使用 MutationObserver 進行 UI 狀態、搜尋、排序或資料顯示後處理。
- 動態元素需要互動時優先使用事件 delegation。
- 不要在每次 render 重複新增相同 document listener。

## 13. Loading / Empty / Error

每個資料驅動區塊都要考慮：

- Loading：資料尚未完成載入。
- Empty：資料成功載入，但沒有可顯示內容。
- Error：資料載入或處理失敗。

Empty 不是 Error。Error 訊息應對使用者可理解，不要直接把原始 exception 當 UI HTML。JS 載入失敗時，首頁仍應保有基本可見內容。

## 14. Collection

- 支援全部、作品分類、搜尋、Filter、Sort、狀態篩選。
- 卡片／清單顯示模式需可切換並記住使用者選擇。
- Collection 至少保持封面、標題、作品、角色、類別、價格、狀態資訊呈現邏輯。
- 點擊 Item 應能進入詳細頁。
- 篩選條件組合必須正確。
- 無結果使用 Empty State。
- 圖片載入失敗使用 fallback。
- 顯示數量時使用 `quantity`；Item 筆數與實際持有件數是不同概念。

## 15. Statistics / 統計

- 按作品統計、按類別統計、總消費等統計都必須明確定義資料來源與計算方式。
- 所有「數量」統計預設代表實際持有件數，使用 `Σ quantity`。
- 所有消費統計使用 `Σ(purchase.price × quantity)`。
- Item 筆數只有在統計明確表示「收藏品種類數」時才使用。
- 新增統計時確認空資料、單一資料、零值、異常值、手機版排版與搜尋轉跳。

## 16. Management / CRUD

- 管理頁的作品、類型、流水號選擇與搜尋狀態必須保持一致。
- CRUD 必須有表單 validation。
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
- Worker Secret / GitHub Token 不得進入 frontend bundle。
- GET / PUT / DELETE 等操作必須與實際資料模型一致。

### 17.1 新資料架構寫入規則

- 周邊資料的新儲存架構依 `TODO.md` §16 與後續正式架構文件執行。
- API / Worker 必須只修改目標 Item、index 或必要的跨檔案資料，不覆寫無關 Item。
- 若分類變更涉及跨檔案搬移，必須有一致性與 rollback 策略。

## 18. Write Consistency

GitHub 寫入流程固定為：

`validate → fetch latest remote state → build new state → write remote → update Store → handle version`

- 寫入前必須重新取得最新 remote state。
- Remote write 成功前不得更新 Store 成為假成功狀態。
- Remote write 失敗時維持原 Store state。
- Version 必須依第 3 節規則處理。
- 單一 Item 的新增／編輯／刪除應盡可能保持最小範圍寫入。
- 涉及多檔案時必須有明確 rollback 策略。

## 19. Image Management

- 支援 JPG / PNG / WebP / GIF。
- 單張圖片不得超過 10MB。
- 第一張圖片為預設封面。
- 新增／刪除圖片會增加 Patch。
- 圖片 reorder 與 cover replacement 不增加 Patch。
- 圖片新增前應檢查 duplicate SHA。
- 圖片寫入必須處理 SHA mismatch 與 rollback。
- 刪除目前封面後，必須自動選擇有效的新封面。
- 外部圖片 URL 必須經 validation。

## 20. TODO / 完成判定

- TODO `[x]` 代表功能已實際完成並可由目前架構正常使用，不代表已有部分程式碼。
- 若功能只有部分完成，維持 `[ ]`。
- 若程式碼存在但與目前 rendering、Store、Router 或 UI 流程沒有真正接通，不得勾選完成。
- UI 功能完成必須同時考慮 Desktop、Tablet、Mobile。
- 涉及跨模組功能時，必須確認完整流程。
- 已否決或禁止使用的方案不應作為 TODO 待辦項目。

## 21. Rendering Architecture

- 主要 rendering 與資料模型、Store、Router 的責任應清楚分離。
- 主要 UI 應由主要 rendering logic 直接產生正確結果。
- 不應透過第二層 DOM 掃描、MutationObserver 或事後 regex 處理來補足主要 UI。
- 不為了維持舊有 workaround 而增加更多 DOM post-processing。
- 新增 UI 功能時，優先讓 rendering 一次產生可直接使用的最終 DOM。

## 22. Data Architecture v2 / 周邊資料新架構

### 22.1 唯一目標

新架構的核心是讓資料責任邊界清楚：

`作品索引 → 類型索引／資料 → Item`

- `works.json`：作品索引與作品 metadata。
- `categories.json`：類型 code、名稱與分類規則。
- Item 儲存架構依新架構文件與 TODO §16 執行。
- Item 本身只描述商品資料，不再混入舊版不一致的物流結構。

### 22.2 Item 欄位基準

正式 Item 欄位以 **`ITEM_SCHEMA.md`** 為唯一規格來源。

- 不在本文件重複維護 Item schema。
- `ITEM_SCHEMA.md` 已明確排除材質、物流、訂單編號、購買網址及售後更新時間等非核心欄位。

### 22.3 Migration 原則

- 先建立新 schema，再建立 migration，再切換 Store，最後才清理舊格式。
- migration 必須可重複執行且不應破壞已完成資料。
- 遷移前後必須能比對 Item ID、數量、圖片與主要資料欄位。
- 任何資料遺失都視為 migration failure。
- 分類修正不得改寫永久 Item ID。
- 遷移完成後才可刪除舊資料結構與舊欄位。

### 22.4 寫入模型

- API / Worker 的 path whitelist 必須知道新資料架構的路徑。
- 新增、編輯、刪除 Item 都只能修改必要的目標資料。
- 修改 category 時執行跨資料位置搬移，成功後才完成 Store 更新。
- 圖片檔案依 Image Management 規則管理，不把圖片 binary 直接塞進資料 JSON。

### 22.5 驗證與部署

- Verify 必須能逐檔檢查新資料架構中的資料。
- 空陣列是合法資料狀態，不應因沒有 Item 而誤判錯誤。
- 不存在的資料檔與空資料檔要有明確規則，不可在 runtime 隨意猜測。
- 資料架構大改期間，每完成一個階段都要先通過 GitHub Actions，再進下一階段。

### 22.6 實作順序

固定按照以下順序進行：

1. 定義新 schema / types。
2. 定義資料路徑與類型 index。
3. 寫 migration / verify。
4. 先遷移一個類型做驗證。
5. 通過 Verify / Deploy 後再擴大到其他類型。
6. 更新 Store 讀取。
7. 更新 API / Worker 寫入。
8. 更新 Management CRUD。
9. 更新 Detail / Collection / Home / Statistics 對應欄位。
10. 完成全站回歸後才清理舊 schema。

**不要一次把 schema、migration、Store、API、Management、UI 全部改掉。** 每一階段都要能獨立驗證與回復。
