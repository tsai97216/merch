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
- `Patch`：任何實際程式碼、設定、規則或資料結構修改，以及 GitHub API 新增／移除收藏或圖片。
- **只要有修改就必須增加 Patch；不得因 reorder、cover replacement 或其他操作語義而省略版本更新。**
- reorder 與 cover replacement 的資料操作本身不應被視為特殊免版本更新事項；只要為其修改程式碼或資料，就照一般修改增加 Patch。
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
