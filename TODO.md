# TODO

> This file tracks implementation status. Only completed items are checked.
> 
> 本次資料架構重整以 `v1.99.42` 為基準，先整理規格，再開始實作。未完成項目不得提前勾選。

## 0. Foundation
- [x] Project structure
- [x] TypeScript + Vite + ES Modules
- [x] GitHub Pages deployment
- [x] Formal domain
- [x] Work code / Item ID rules
- [x] Shared Store architecture
- [x] External data validation

## 1. Data Layer
- [x] Works index
- [x] Work data split
- [x] **重建 Item schema：以目前確定的基本／購買／到貨／售後／圖片欄位為唯一規格**
- [ ] **周邊資料改為「一個作品 × 一個類型一個 JSON」的儲存架構**（此項架構方向改由 §16 取代，實作時以 §16 為準）
- [ ] **建立類型 JSON 的路徑／命名規則與 index 對應規則**（此項架構方向改由 §16 取代）
- [ ] **Store 改為讀取並合併各類型 JSON，對 UI 維持單一 Item 集合**（此項架構方向改由 §16 取代）
- [ ] **Store 寫入時只更新受影響的類型 JSON，不再整份作品 JSON 覆寫**（此項架構方向改由 §16 取代）
- [x] Quantity normalization
- [x] Item ID validation
- [x] Duplicate Item ID validation
- [x] Duplicate permanent serial validation
- [x] Local UI state persistence
- [x] Shared Store instance
- [x] Remote data loading with static fallback

## 2. Data Migration
- [x] **完成舊作品 JSON → 新 Item 儲存架構的完整遷移**
- [x] **完成遷移前後 Item 數量、ID、圖片、購買、到貨、售後資料逐項比對**
- [x] **移除舊物流欄位與不再使用的欄位**
- [x] **處理 `亞克力` 為材質而非商品類型的既有資料**
- [x] **建立 migration / rollback 安全流程**
- [x] Legacy data normalization
- [x] Quantity migration
- [x] Image metadata migration

## 3. Version
- [x] version.json
- [x] package.json version sync with official version
- [x] UI version rendering
- [x] API write version bump
- [x] **資料架構重整完成後再次確認版本來源只有 `public/data/version.json`**

## 4. Router
- [x] Hash routes
- [x] Home
- [x] Collection
- [x] Statistics
- [x] Management
- [x] Settings
- [x] Item detail
- [x] Back / forward
- [x] Refresh safety
- [x] Malformed route safety
- [x] 404

## 5. UI System
- [ ] 全站 layout
- [x] Modal
- [x] Toast
- [x] Button
- [x] Input
- [x] Card
- [x] Panel
- [x] Badge

## 6. Dashboard / Home
- [x] 待到貨（合併 `pending + preorder`）
- [x] 作品統計
- [x] 消費統計
- [x] 快速入口
- [x] 主頁狀態統計方塊點擊後導向 Collection，並帶入對應狀態搜尋條件
- [x] 主頁作品統計方塊／項目點擊後導向 Collection，並帶入對應作品搜尋條件
- [x] 主頁其他可對應收藏的統計項目提供搜尋轉跳
- [x] JS 失敗時仍能看到基本首頁
- [x] Home 資料區塊在空資料時仍保持合理排版
- [x] Home 數量統計依 quantity 加總
- [x] Home 消費統計依單價 × quantity 計算
- [x] 作品消費排行
- [x] 作品消費排行完整總排行 Modal
- [x] 角色排行 Top 5
- [x] 角色排行完整總排行 Modal

## 7. Collection
- [x] 全部
- [x] 作品分類
- [x] 搜尋
- [x] 搜尋支援狀態文字：`預購中`、`待到貨`、`已收到` 等使用者可見狀態
- [x] `待到貨` 搜尋結果包含 `pending + preorder`
- [x] `預購中` 搜尋仍可單獨命中 preorder
- [x] `已收到` 搜尋仍可單獨命中 received
- [x] 搜尋支援多個詞條同時搜尋，採 AND 邏輯
- [x] 多詞條支援空白、`,`、`，` 等常見分隔方式
- [x] 搜尋詞條與既有 Item ID／作品／類型／角色／廠商等搜尋邏輯保持相容
- [x] Filter
- [x] Sort
- [x] 狀態篩選
- [x] 類別篩選
- [x] 搜尋下方只保留「類型／狀態」可見篩選
- [x] 角色條件可透過搜尋
- [x] 廠商條件可透過搜尋
- [x] 排序改為按鈕式控制
- [x] 卡片顯示模式
- [x] 清單顯示模式
- [x] 記住卡片／清單選擇
- [x] 顯示封面
- [x] 顯示標題
- [x] 顯示作品
- [x] 顯示角色
- [x] 顯示類別
- [x] 顯示價格
- [x] 顯示數量
- [x] 顯示多件商品的單價 × 數量與合計價值
- [x] 顯示狀態
- [x] 顯示預計到貨日期
- [x] 點擊進入詳細頁
- [x] 篩選條件組合正確
- [x] 搜尋／篩選／排序狀態與 Store 同步
- [x] 無結果 Empty State
- [x] 圖片載入失敗 fallback
- [x] 卡片與清單在手機版保持可用

## 8. Item Detail
- [x] **依新 Item schema 重整完整基本資訊**
- [x] **依新 schema 重整購買資訊**
- [x] 顯示單價
- [x] 顯示數量
- [x] 顯示數量加權後合計價值
- [x] **依新 schema 重整到貨資訊**
- [x] **依新 schema 重整售後資訊**
- [x] 圖片展示
- [x] 圖片載入失敗 fallback
- [x] 編輯
- [x] 刪除
- [x] 返回
- [x] 不存在的 Item 顯示 Not Found
- [x] Modal / Detail 狀態與 Router 狀態一致
- [x] 鍵盤關閉與 focus 管理
- [x] 「已收到」狀態徽章隱藏文字並保留空間

## 9. Statistics
- [x] 按作品統計
- [x] 按類別統計
- [ ] 按角色統計（否決）
- [ ] 按廠商統計（否決）
- [ ] 按狀態統計（否決）
- [x] 總消費
- [x] 總數量統計依 quantity 加總
- [x] 作品數量統計依 quantity 加總
- [x] 類別數量統計依 quantity 加總
- [x] 各作品消費
- [x] 各月份消費（1～12 月完整顯示，無資料月份為 0）
- [x] 移除「每月新增收藏」統計
- [x] 集中使用 Date utility
- [x] 統計計算與 UI rendering 分離
- [x] 空資料狀態
- [x] 金額／數量格式統一
- [x] 消費：大圖長條圖／小圖圓餅圖
- [x] 每月：大圖長條圖／小圖長條圖
- [x] 收藏：大圖長條圖／小圖圓餅圖
- [x] 類別：大圖圓餅圖／小圖圓餅圖
- [x] 大圖與小圖使用獨立圖表配置，而非單純縮放同一圖表
- [x] 月份圖使用垂直長條，X 軸顯示 1～12 月，年份顯示於圖表左上方
- [x] 圓餅圖圖例顏色與切片顏色一致
- [x] 統計詳細分析視圖
- [x] 統計結果邊界案例驗證

## 10. Management
- [x] 作品選擇器
- [x] 周邊類型選擇器
- [x] 流水號選擇器
- [x] 管理頁搜尋
- [x] 作品／類型／流水號選擇與搜尋狀態同步
- [x] 收藏 CRUD
- [x] 表單 validation
- [x] 刪除確認
- [x] 成功提示
- [x] 失敗提示
- [x] 作品管理新增
- [x] 作品管理編輯
- [x] 作品管理移除
- [x] 表單編輯狀態不因重新 render 遺失
- [x] **新增／編輯表單改為完整對應新 Item schema**
- [x] 必填欄位與格式錯誤清楚提示
- [x] 重複 ID / 重複資料安全處理
- [x] 新增／編輯表單支援 quantity
- [x] **分類規則：亞克力是材質，不應作為獨立商品類型；新商品應依實際商品型態分類**
- [x] 管理頁重新排版與 UI/UX 優化
- [ ] 新增專用頁面／流程，與現有管理頁職責清楚分離

## 11. GitHub API / Worker
- [x] API layer
- [x] GitHub service
- [x] Worker service
- [x] GET data
- [x] PUT data
- [x] DELETE data
- [x] GET assets
- [x] PUT assets
- [x] DELETE assets
- [x] auth status
- [x] Admin Secret
- [x] Worker GitHub Token
- [x] path whitelist
- [x] 統一 API errors
- [x] UI 不直接組 GitHub REST API request
- [x] API timeout / network failure handling
- [x] CORS / allowed origin
- [x] request payload validation
- [x] response schema validation
- [x] Worker GitHub Token 實際寫入權限驗證與部署後驗證
- [x] **API / Worker 寫入流程支援新 Item 資料夾與 index 路徑**
- [x] **API / Worker 寫入只修改目標 Item／index 檔案，不覆寫其他 Item 資料**

## 12. Write Consistency
- [x] validate
- [x] 先取得最新 remote state
- [x] 建立新 state
- [x] PUT 成功後才更新 Store
- [x] 寫入失敗不污染 Store
- [x] concurrent write protection
- [x] stale state detection
- [x] write operation error recovery
- [x] **新架構寫入前只重新取得目標 Item／index 的最新 state**
- [x] **同一 Item 的 concurrent write / stale state 保護**
- [x] **新增／刪除 Item 時 index 與 Item 資料夾的多檔案 transaction / rollback 策略**
- [x] **圖片與 Item data 的多檔案寫入順序、失敗回復與一致性策略**

## 13. Image Management
- [x] Image upload
- [x] Image replace
- [x] Image delete
- [x] Cover image control
- [x] Image ordering
- [x] orphan image cleanup
- [x] SHA / filename consistency
- [x] Image write failure recovery
- [x] **確認圖片 metadata 在 Item `data.json` 中的保存方式**
- [x] **圖片實體檔案固定隨 Item 存放於該 Item 的 `images/` 目錄**
- [x] **重新設計 image API path resolution，不再依賴舊作品 JSON 圖片路徑**

## 14. Verification
- [x] TypeScript build
- [ ] Desktop smoke test
- [ ] Mobile smoke test
- [x] Router smoke test
- [ ] Collection search/filter/sort test
- [ ] Detail test
- [x] Statistics test
- [ ] Management test
- [x] GitHub API write test
- [x] Image management test
- [ ] Empty/error/loading test
- [x] Data integrity verification
- [x] Production deploy verification
- [x] **新資料架構 Verify：逐 Item 驗證 schema / ID / quantity / 必填欄位 / 路徑**
- [x] **新資料架構 Migration Verify：遷移前後總筆數與資料內容一致**
- [x] **新資料架構 API 實寫：新增／編輯／刪除只影響目標 Item 與必要 index**
- [x] **新資料架構圖片 Verify：圖片、metadata、cover、ordering、orphan cleanup 一致**

## 15. Final Polish
- [x] desktop / tablet / mobile UI polish
- [ ] desktop / mobile Statistics / Management / Settings layout checks
- [x] spacing / typography / alignment
- [x] interaction states
- [x] accessibility

## 16. New Item Storage Architecture

> **正式目標架構：作品 → 類型 → index.json + 每個周邊獨立資料夾。**
> 
> 這一節是本次資料儲存方式重整的總控清單。實作前後均以此節為檢查表；所有項目完成並驗證後才可勾選。

### 16.1 Directory structure
- [x] **確定正式根目錄結構：`data/<work>/<category>/`**
- [x] **每個類型目錄建立 `index.json`**
- [x] **每個 Item 使用永久 Item ID 作為資料夾名稱，例如 `HSRd001/`**
- [x] **每個 Item 資料夾建立 `data.json`**
- [x] **每個 Item 的圖片固定存放於該 Item 的 `images/`**
- [x] **禁止以標題、角色名稱等可變欄位作為 Item 路徑識別；路徑識別只使用永久 Item ID**

目標範例：

```text
data/
└─ honkai-star-rail/
   └─ d/
      ├─ index.json
      ├─ HSRd001/
      │  ├─ data.json
      │  └─ images/
      │     ├─ cover.webp
      │     └─ 01.webp
      ├─ HSRd002/
      │  ├─ data.json
      │  └─ images/
      └─ HSRd003/
         ├─ data.json
         └─ images/
```

### 16.2 Index responsibility
- [x] **定義 `index.json` schemaVersion 與 schema**
- [x] **index 只負責列出該作品／類型下有哪些 Item 與其資料路徑／必要 metadata**
- [x] **避免 index 重複保存完整 Item 資料，避免雙重資料來源**
- [x] **定義 index 與實際 Item 資料夾不一致時的 Verify / error handling**
- [x] **定義新增、刪除、遷移 Item 時 index 的同步規則**

### 16.3 Item data responsibility
- [x] **將完整 Item schema 放入各自的 `data.json`**
- [x] **確認 `data.json` 不保存不必要的 GitHub／儲存層資訊**
- [x] **Item ID、workId、category 等識別資訊與實際路徑一致性驗證**
- [x] **保留現有永久 Item ID，不因遷移重新編號**
- [x] **保留 quantity、purchase、arrival、afterSales、images 等既定資料語義**

### 16.4 Store
- [x] **重新設計 `src/store.ts` 的載入流程：works index → category index → Item data**
- [x] **Store 對 UI 仍提供單一 `Item[]`，UI 不需要知道檔案分層**
- [x] **Store 建立 Item → data path 的內部映射，供精準寫入使用**
- [x] **載入時驗證 index、Item data、路徑、ID、work/category 一致性**
- [x] **避免因單一 Item 讀取失敗造成整個 Store 無法使用，明確定義錯誤策略**
- [x] **保留 static fallback 與 remote API 的一致資料語義**

### 16.5 API / Worker
- [x] **重新設計 `src/api.ts` 的 Item／asset path 解析與 request payload**
- [x] **重新設計 `worker/src/index.ts` 的資料載入與 GitHub 路徑白名單**
- [x] **GET data 能從新架構組合出前端所需的完整 Store 資料**
- [x] **PUT Item 只修改目標 `data.json`，必要時同步 `index.json`**
- [x] **DELETE Item 正確處理 Item 資料夾、圖片與 index**
- [x] **新增 Item 正確建立 Item 資料夾、`data.json`、圖片目錄與 index**
- [x] **Asset API 以 Item ID／Item path 定位圖片，不再依賴舊作品 JSON 結構**
- [x] **所有新路徑仍受 path whitelist / traversal protection 保護**

### 16.6 Git / atomic write
- [x] **單一 Item 編輯盡可能形成單一 atomic commit**
- [x] **新增／刪除 Item 涉及多個檔案時使用明確的 multi-file transaction**
- [x] **index 與 Item data 任何一方更新失敗時不得留下不一致狀態**
- [x] **stale state detection 改以目標 Item／index 的最新 Git state 為基準**
- [x] **同一 Item 的 concurrent writes 不得互相覆蓋**
- [x] **跨類型移動／分類修正若涉及兩個 category 目錄，定義 rollback / transaction 邏輯**

### 16.7 Images
- [x] **定義 `images` metadata 與實體圖片檔案的對應規則**
- [x] **cover、ordering、filename、SHA 等規則與 Item data 保持一致**
- [x] **圖片新增／替換／刪除只影響目標 Item**
- [x] **Item 刪除時正確處理其全部圖片**
- [x] **重新執行 orphan image cleanup，且不誤刪其他 Item 圖片**

### 16.8 Migration
- [x] **建立舊 `work.json` → 新 `work/category/index.json + Item folders` migration 工具**
- [x] **依現有 Item ID 決定目標 category 與 Item 路徑，不重新編號**
- [x] **完整搬移每個 Item 的 JSON 資料**
- [x] **完整搬移／重新定位每個 Item 的圖片與 metadata**
- [x] **遷移前後逐 Item 比對所有資料欄位**
- [x] **遷移前後比對 Item 數量、quantity 總和、ID 集合與圖片集合**
- [x] **migration 完成前保留舊資料，可安全 rollback**
- [x] **Verify 通過後才移除舊作品 JSON**

### 16.9 Validation / tests
- [x] **新增新架構專用 schema validator**
- [x] **驗證 index ↔ Item folder ↔ data.json 三者一致**
- [x] **驗證 Item ID、work code、category code 與路徑一致**
- [x] **驗證 quantity / 必填欄位 / 圖片 metadata**
- [x] **驗證空類型目錄、空 index、孤立 Item、孤立圖片等邊界情況**
- [x] **測試新增／編輯／刪除 Item**
- [x] **測試新增／替換／刪除圖片**
- [x] **測試 concurrent write / stale state**
- [x] **測試 migration 與 rollback**
- [x] **測試 production build 與部署後 GET / PUT / DELETE**

### 16.10 Affected source files / modules
- [x] **`src/types.ts`：新增 index / storage metadata 型別，確認 Item schema**
- [x] **`src/store.ts`：重寫資料載入、合併、path mapping、寫入前最新 state 邏輯**
- [x] **`src/api.ts`：調整 Item／asset API payload 與新路徑解析**
- [x] **`worker/src/index.ts`：重寫 GitHub data tree、index、Item folder 與 asset 操作**
- [x] **`src/item-id.ts`：確認永久 ID 與新路徑規則相容**
- [x] **`src/image-source.ts`：調整圖片來源與新 Item image path**
- [x] **`src/image-viewer.ts`：確認新圖片 URL／asset path 相容**
- [x] **`scripts/migrate.mjs`：改為完整舊架構 → 新 Item folder 架構 migration**
- [x] **`scripts/verify-data.mjs`：加入 index／Item folder／data.json 一致性驗證**
- [x] **`public/data/works.json`：重新定義 work/category index 對應方式**
- [x] **`public/data/works/*`：遷移為新 category/index + Item folder 結構**
- [x] **`data/*`：圖片實體檔案重新整理至各 Item `images/`**
- [x] **`scripts/verify-statistics-date.mjs`：確認資料來源改變後統計驗證仍正常**
- [x] **`.github/workflows/verify.yml`：加入新資料架構 Verify**
- [x] **`.github/workflows/deploy-worker.yml`：確認 Worker 新路徑部署流程**
- [x] **`vite.config.ts` / `index.html`：僅在新資料路徑需要時調整 static asset handling**

### 16.11 UI / feature compatibility
- [x] **Collection：確認單一 Item[] API 不因儲存層改變而改變既有搜尋／篩選／排序行為**
- [x] **Item Detail：確認詳細頁不直接依賴舊 JSON 路徑**
- [x] **Management：確認 CRUD 透過 Store/API 操作新 Item path**
- [x] **Statistics：確認統計只依賴 Store Item[]，不直接讀取檔案結構**
- [x] **Home / cross-navigation：確認既有 Item 導航不受 storage path 改變影響**

### 16.12 Completion gate
- [x] **所有舊作品 JSON 已完成 migration 且 Verify 通過**
- [x] **所有新架構 schema / path / index 規則已固定並文件化**
- [x] **Store / API / Worker 已全部切換至新架構**
- [ ] **CRUD、圖片管理、concurrent write 全部通過測試**
- [x] **Production deploy 驗證通過**
- [x] **確認 `public/data/version.json` 為唯一正式版本來源**
- [ ] **完成後才移除 §1 中被 §16 取代的舊架構描述**

### 16.13 Implementation Sequence

> **以下為實際開始改檔後的建議執行順序。不要跳過資料層直接先改 UI；每一階段完成並驗證後再進入下一階段。**

#### Phase 1：規格與資料結構
- [x] **`src/types.ts`：先完成新 Item schema、index schema、storage metadata 型別**
- [x] **`public/data/categories.json`：確認正式類型代碼與新分類資料結構**
- [x] **`scripts/migrate.mjs`：準備舊資料 → 新資料架構的轉換邏輯**
- [x] **`scripts/verify-data.mjs`：準備新架構驗證器**

#### Phase 2：正式資料遷移
- [x] **執行實際資料 migration，建立 `data/<work>/<category>/<Item ID>/`**
- [x] **建立各 category 的 `index.json`**
- [x] **建立各 Item 的 `data.json` 與 `images/`**
- [x] **完成 migration 前後資料／ID／數量／圖片比對**
- [x] **Verify 通過後才保留新架構作為正式資料來源**

#### Phase 3：資料讀取與寫入層
- [x] **`src/store.ts`：改為新架構載入、合併與 Item path mapping**
- [x] **`src/api.ts`：改為新 Item／index／asset payload 與路徑**
- [x] **`worker/src/index.ts`：改為新 GitHub 目錄、index、Item data 與 asset 操作**
- [x] **完成精準 Item 寫入與 multi-file atomic write / rollback**

#### Phase 4：圖片系統
- [x] **`src/image-source.ts`：切換新 Item image path**
- [x] **`src/image-viewer.ts`：確認新圖片來源相容**
- [x] **完成圖片新增／替換／刪除／cover／ordering 與 orphan cleanup 的新架構驗證**

#### Phase 5：管理與詳細頁
- [x] **`src/management.ts`：表單全面對應新 Item schema**
- [x] **`src/main.ts`：主 UI／Detail 依新資料語義調整**
- [x] **`src/router.ts`：確認 Detail／路由不依賴舊資料路徑**

#### Phase 6：統計與既有功能相容
- [x] **`src/statistics.ts`：確認統計資料來源與新 Store 相容**
- [x] **`src/statistics-data.ts`：確認統計計算不直接依賴舊檔案結構**
- [x] **`src/item-id.ts`：確認永久 ID 與新 category/path 規則相容**
- [x] **`src/collection-controls.ts`：確認搜尋／篩選／排序維持既有行為**
- [x] **`src/home-enhancements.ts`：確認首頁 Item 導航與統計轉跳正常**
- [x] **`src/cross-navigation.ts`：確認跨頁 Item 導航正常**

#### Phase 7：全面驗證與收尾
- [x] **TypeScript build / production build**
- [ ] **Desktop / Mobile smoke test**
- [ ] **Collection / Detail / Management / Statistics / Home 全流程測試**
- [ ] **GET / PUT / DELETE Item 實寫測試，確認只影響目標 Item／index**
- [ ] **圖片 API 實寫與一致性測試**
- [ ] **concurrent write / stale state / rollback 測試**
- [ ] **migration / rollback 最終驗證**
- [x] **確認 `public/data/version.json` 為唯一正式版本來源並同步必要版本資訊**
- [ ] **全部驗證完成後移除舊作品 JSON 與舊路徑相依程式碼**
- [x] **更新 TODO，僅勾選實際完成並驗證的項目**
