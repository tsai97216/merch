# merch 開發規則與寫法

> 本文件是本專案的長期開發規格與踩坑紀錄。修改前必讀；確立新規則後要同步補進本文件。
>
> 核心原則：**先理解既有規則，再修改；新增功能時要把資料、UI、互動、錯誤處理、版本與 TODO 一起考慮。**

## 0. 修改前必讀

每次開始修改前確認：

1. `RULES.md` 是否已有相關規則。
2. `TODO.md` 是否已有對應項目。
3. `merch-old` 是否有相同或接近的 UI / UX 行為可參考。
4. 現有資料結構、Store、Router、搜尋與 rendering 是否已有可重用邏輯。
5. 是否影響 Item ID、資料格式、版本號或部署。

不要為小功能直接重寫整個專案；優先修改最小必要範圍。

## 1. 專案架構

- 技術基礎：TypeScript + Vite + ES Modules。
- GitHub Pages 為正式部署環境。
- 正式網址：`merch.chi.qzz.io`。
- `merch-old` 僅作 UI/UX 與功能參考，不直接複製程式碼。
- `src/` 放應用程式邏輯；`public/data/` 放可部署資料。
- 不讓單一頁面自行建立與 Store 不一致的資料副本。

## 2. UI/UX 基準

- 新架構重新實作，不直接複製舊版程式碼。
- 可參考舊版視覺語言、間距、圓角、陰影、字體階層與互動方式，但以目前架構與需求為準。
- Sidebar、Navigation、Header、Card、Panel、Button、Badge、Input、Modal、Toast 等元件保持全站一致。
- Desktop、Tablet、Mobile 都要考慮。
- 互動要考慮 hover、focus-visible、disabled、loading、empty、error。

## 3. 版本號

- 唯一正式版本來源：`public/data/version.json`。
- 格式：`Major.Minor.Patch`。
- `Major`：大版本／架構世代重寫。
- `Minor`：完整邏輯／功能修改或明確的功能世代變更。
- **Patch：任何實際程式碼、設定、規則、資料結構修改，以及 GitHub API 新增／移除收藏或圖片。**
- **只要有修改就必須增加 Patch，不因 reorder、cover replacement 或其他操作語義而免除版本更新。**
- reorder 與 cover replacement 的資料操作不享有免版本更新例外；相關程式碼修改照一般修改增加 Patch。
- 不使用版本號作為 module cache，也不使用 `?v=version`、`?build=...` 等 cache hack。
- UI 顯示版本從 Store 載入的正式版本來源取得，不在多個地方硬編版本號。
- 修改完成後必須確認正式版本來源與 `package.json` 同步。

## 4. Work / 作品

- `Work.name` 是使用者看到的完整作品名稱。
- `Work.code` 是內部短代碼。
- UI 優先顯示完整作品名稱；ID 解析與資料處理使用 code。
- 目前作品代碼：`HSR`、`GI`、`ZZZ`、`WW`。
- 新增作品要同步檢查 `works.json`、schema、Item ID、Store、搜尋與 UI。

## 5. Item ID

- Item ID 是永久識別碼，刪除後不可重新編號。
- ID 依「作品 + 類型」分組遞增。
- 格式：`作品代碼 + 類型代碼 + 三位流水號`，例如 `GIa001`、`HSRf001`。
- 不因刪除舊 Item 填補缺號。
- 不因 UI 排序、重新整理或資料搬移改變既有 ID。
- 既有 Item ID 永久保留，即使分類修正也不可重新編號。
- ID 中的歷史類型 code 與目前 `category` 是兩個概念。

## 6. Category / 類型

- 類型 code、顯示名稱與完整分類規則統一記錄於 `ITEM_TYPES.md`。
- `ITEM_TYPES.md` 是目前周邊類型的唯一規格來源。
- 新增、刪除或修改類型前先更新 `ITEM_TYPES.md`，再檢查 categories、type、validation、Item ID、資料路徑、搜尋與 UI。

## 7. Item Quantity / 數量

- `Item` 代表一種收藏資料，不代表固定只有一個實物。
- 複數實物使用同一 Item ID，以 `quantity` 記錄件數。
- `quantity` 必須是大於等於 1 的整數。
- 舊資料缺少 quantity 時相容性預設為 `1`。
- 收藏品種類數 = Item 筆數；實際周邊數量 = `Σ quantity`。
- 單項實際價值 = `purchase.price × quantity`。
- 總消費 = `Σ(purchase.price × quantity)`。
- 統計數量時一律加總 quantity；只有明確描述「種類」才使用 Item 筆數。

### 7.1 Quantity Validation

- 所有進入 Store 的 Item 都經過同一套 quantity validation / normalization。
- 不得用 `quantity || 1` 把非法值靜默轉為合法值。
- 缺少 quantity 可相容性預設為 1；已存在但格式錯誤不可無條件當成 1。
- 新增、編輯、載入、migration、API response 都遵守相同規則。

## 8. Search / 搜尋

- 搜尋應涵蓋使用者可辨識的名稱、角色、作品、類型、廠商、Item ID 等資料。
- 新增可搜尋欄位時同步更新搜尋索引與 UI。
- 搜尋無結果使用 Empty State。
- Search、Filter、Sort 與顯示模式不可各自維護矛盾狀態。
- 多個搜尋詞採 AND 邏輯。

## 9. 跨頁搜尋轉跳

- 統計、排名、摘要或 Dashboard 項目若代表可查看的搜尋條件，應提供搜尋轉跳。
- 流程：`點擊項目 → Collection → 帶入搜尋條件 → 顯示結果`。
- 邏輯集中於 `src/cross-navigation.ts`。
- 不可只修改 hash；必須確認 Collection query / filter state 實際更新並觸發搜尋。
- 複合條件使用相應 Filter / query state，不塞模糊文字。

## 10. Router / Navigation

- 使用 Hash Router。
- 主要 route：`#/home`、`#/collection`、`#/statistics`、`#/management`、`#/settings`、`#/item/:id`。
- 重新整理後應恢復目前 route。
- Back / Forward 正常。
- malformed URL、decode 失敗與多餘 route segments 安全處理。
- 404 不造成整個 App 白屏。
- Route navigation 與 page rendering 保持解耦。

## 11. Data / Store

- Store 是資料與 UI state 的主要來源。
- Page 不持有自己的資料副本。
- State 更新採 immutable 原則。
- 不在 Page、rendering 或 utility 直接修改 Store state。
- Store 維持 subscribe / unsubscribe 生命週期。
- 新增資料欄位至少檢查 type、schema、Store、migration、rendering 與相容性。
- API 回傳資料進 Store 前先驗證 schema。
- 不可信資料不可直接假設合法。

## 12. Rendering / DOM / XSS

- 使用者輸入、API 資料與外部資料一律視為不可信。
- 優先使用 DOM API、`textContent` 與安全 utility。
- 未處理外部字串不得直接放入 `innerHTML`。
- 不使用 MutationObserver 做 UI 狀態、搜尋、排序或資料顯示後處理。
- 動態元素互動優先使用事件 delegation。
- 不在每次 render 重複新增相同 document listener。

## 13. Loading / Empty / Error

每個資料驅動區塊都要考慮：

- Loading：資料尚未完成載入。
- Empty：資料成功載入但沒有可顯示內容。
- Error：資料載入或處理失敗。

Empty 不是 Error。錯誤訊息應可被使用者理解，不直接把原始 exception 當 UI HTML。JS 載入失敗時首頁仍應保有基本可見內容。

## 14. Collection

- 支援全部、作品分類、搜尋、Filter、Sort、狀態篩選。
- 卡片／清單可切換並記住使用者選擇。
- 保持封面、標題、作品、角色、類別、價格、狀態等呈現邏輯。
- 點擊 Item 進入詳細頁。
- 篩選條件組合正確；無結果使用 Empty State。
- 圖片載入失敗使用 fallback。
- 顯示數量使用 quantity；Item 筆數與實際件數分開。

## 15. Statistics / 統計

- 按作品、類別、狀態、總消費等統計明確定義資料來源與計算方式。
- 「數量」預設代表實際持有件數，使用 `Σ quantity`。
- 消費使用 `Σ(purchase.price × quantity)`。
- Item 筆數只有在明確表示「收藏品種類數」時使用。
- 新增統計確認空資料、單一資料、零值、異常值、手機版與搜尋轉跳。

## 16. Management / CRUD

- 管理頁作品、類型、流水號選擇與搜尋狀態保持一致。
- CRUD 必須有表單 validation。
- 新增／編輯不可產生重複 ID 或破壞既有資料。
- 編輯表單應保留使用者輸入，不因無關 render 遺失。
- 刪除有明確確認流程。
- 成功與失敗都提供使用者可理解的回饋。

## 17. GitHub API / Worker

- Frontend 不保存或暴露 GitHub Token。
- GitHub 寫入必須經 API / Worker layer。
- API / Worker 必須驗證輸入與 API response。
- API / Worker 只修改目標 Item、index 或必要的跨檔案資料，不覆寫無關 Item。
- 涉及分類跨檔案搬移時必須有一致性與 rollback 策略。
- 寫入採目標範圍鎖定，避免過時資料覆蓋較新的遠端資料。

## 18. Write Consistency

GitHub 寫入流程固定遵守：

1. 重新取得 remote head 與目標檔案 SHA。
2. 驗證目前資料與操作條件。
3. 建立最小必要 blobs / tree。
4. 建立 atomic commit。
5. 更新 branch ref 時必須確認仍指向預期 head。
6. 發生競爭或中途失敗時不可靜默覆蓋其他修改。

單一 Item 的新增／編輯／刪除應盡可能保持最小範圍寫入；涉及多檔案時必須有明確 rollback 策略。

## 19. Image Management

- 支援 JPG / JPEG / PNG / WebP / GIF / AVIF。
- 單張圖片大小上限依目前 API / UI 契約執行，Frontend 與 Worker 必須一致。
- 圖片路徑固定位於對應 Item 的 `data/<work>/<category>/<item>/images/`。
- 圖片 metadata 必須與實際檔案引用保持一致。
- 設為封面時只能有正確的封面標記。
- 圖片排序只改變 metadata 順序，不改變 Item ID 或檔名。
- 替換圖片需先成功寫入新圖片與 metadata，再清理舊圖片；清理失敗不得讓已成功的新圖片操作被視為失敗。
- 刪除圖片需處理 metadata 與遠端檔案的一致性，失敗時採可恢復策略。
- 管理頁不得直接修改 Store snapshot 中的 frozen image metadata；要建立新的 metadata 物件後再提交。
- **任何圖片管理程式碼修改都必須遵守版本號規則，增加 Patch。**

## 20. TODO / Verification

- 完成實作後才勾選 TODO，不因「看起來應該完成」而勾選。
- 靜態檢查、schema、build、Worker contract 等可由工具驗證的項目應實際驗證後再勾選。
- Desktop、Mobile 與互動 smoke test 若由使用者自行驗證，助手不可宣稱已完成。
- 每次修改後檢查版本號、資料完整性與 production build / deploy 狀態。
