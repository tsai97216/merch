# merch 開發規則

> 本文件是專案的長期規格與重要踩坑紀錄。修改前必讀；新的長期規則確立後才加入。已完成的一次性工作不放在這裡，改放 `TODO.md` 的未完成／待驗證項目。

## 1. 修改原則

每次修改前先確認：

1. 本文件是否已有相關規則。
2. `TODO.md` 是否有對應工作。
3. `merch-old` 是否有可參考的 UI / UX 或功能行為。
4. 現有資料、Store、Router、搜尋與 rendering 是否已有可重用邏輯。
5. 是否影響資料格式、Item ID、版本號、圖片或部署。

- 小功能只改最小必要範圍，不為小問題重寫整個專案。
- 不以「看起來能用」取代實際驗證。

## 2. 架構與資料

- 技術基礎：TypeScript + Vite + ES Modules。
- `src/` 放應用程式邏輯；`public/data/` 放可部署資料。
- GitHub Pages 為正式部署環境，正式網址為 `merch.chi.qzz.io`。
- `merch-old` 僅作 UI/UX 與功能參考，不直接複製舊版程式碼。
- Store 是資料與 UI state 的主要來源；Page 不建立與 Store 不一致的資料副本。
- State 更新採 immutable 原則，不直接修改 Store state。
- API 回傳資料進 Store 前必須驗證 schema；外部資料一律視為不可信。
- 現行資料採 Item 級資料夾／檔案架構；舊作品 JSON 不再作為新的整份寫入目標。
- API / Worker / Store 必須使用目前 Item 與 index 路徑，不得恢復舊作品 JSON 整份覆寫模式。

### Item ID

- Item ID 是永久識別碼，刪除後不可重新編號、補號或重用。
- 格式為「作品代碼 + 歷史類型 code + 三位流水號」。
- UI 排序、資料搬移或分類修正都不可改變既有 Item ID。
- ID 中的歷史類型 code 與目前 `category` 是不同概念。

### Category

- 類型 code、名稱與分類規則以 `ITEM_TYPES.md` 為唯一規格來源。
- `亞克力` 是材質，不是獨立商品類型；新商品依實際商品型態分類。
- 修改類型前先更新 `ITEM_TYPES.md`，再檢查 validation、Item ID、資料路徑、搜尋與 UI。

### Quantity

- `quantity` 必須是大於等於 1 的整數。
- 舊資料缺少 quantity 時相容性預設為 `1`；已存在但格式錯誤不可靜默當成 1。
- 所有進入 Store 的 Item 都經過一致的 quantity validation / normalization。
- 新增、編輯、載入、migration、API response 都遵守相同規則。
- 收藏品種類數 = Item 筆數；實際持有件數 = `Σ quantity`。
- 單項價值 = `purchase.price × quantity`；總消費 = `Σ(purchase.price × quantity)`。

## 3. UI / Rendering

- 全站元件與互動保持一致：Navigation、Header、Card、Panel、Button、Badge、Input、Modal、Toast 等遵循共同視覺語言。
- Desktop、Tablet、Mobile 都必須考慮。
- 互動需考慮 hover、focus-visible、disabled、loading、empty、error。
- 使用者輸入、API 與外部資料不可直接信任。
- 優先使用 DOM API、`textContent` 與安全 utility；未處理外部字串不得直接進入 `innerHTML`。
- 動態互動優先使用事件 delegation，不在每次 render 重複新增相同 document listener。
- HTML `id` 必須唯一；同一語意的控制項不可共用 ID。
- 不使用 MutationObserver 作為 UI 狀態、搜尋、排序或資料顯示的後處理機制。
- 資料驅動區塊都要能處理 Loading、Empty、Error；Empty 不等於 Error。
- 錯誤訊息應讓使用者理解，不直接把原始 exception 當 UI HTML。

## 4. Search / Collection / Statistics

### Search

- 搜尋涵蓋使用者可辨識的名稱、角色、作品、類型、廠商、Item ID 等資料。
- 多個搜尋詞採 AND 邏輯；常見空白、`,`、`，` 分隔需正確處理。
- 使用者可見狀態如 `預購中`、`待到貨`、`已收到` 應與內部狀態搜尋一致；`待到貨` 包含 `pending + preorder`。
- Search、Filter、Sort、顯示模式不可各自維護矛盾狀態。
- 無結果使用 Empty State。

### Collection

- 支援全部、作品分類、搜尋、Filter、Sort、狀態篩選及卡片／清單顯示。
- 顯示數量使用 `quantity`；Item 筆數與實際件數分開。
- 圖片載入失敗使用 fallback。
- 點擊 Item 進入詳細頁。

### Statistics

- 統計資料來源與計算方式必須明確。
- 「數量」預設代表實際持有件數，使用 `Σ quantity`；只有明確表示「種類」時才使用 Item 筆數。
- 消費使用 `Σ(purchase.price × quantity)`。
- 月份消費圖完整處理 1～12 月，無資料月份顯示 0。
- 大圖與小圖使用適合各自尺寸的獨立圖表配置。
- 統計結果應考慮空資料、邊界值、手機版與搜尋轉跳。

## 5. Router / Navigation / Detail

- 使用 Hash Router，正式 route：`#/home`、`#/collection`、`#/statistics`、`#/add`、`#/shipping`、`#/management`、`#/settings`、`#/item/:id`。
- Refresh、Back、Forward 必須正常。
- malformed URL、decode 失敗、多餘 segments 與不存在 Item 必須安全處理，不得造成白屏。
- Route navigation 與 page rendering 保持解耦。
- 統計、排名、Dashboard 等可代表搜尋條件的項目應能正確轉跳到 Collection；不能只改 hash，必須同步更新 Collection query / filter state。
- Item Detail 的 Modal、Router 與 focus 狀態必須一致。
- Detail modal 必須使用專用 dialog selector 識別，不可與其他 modal 共用模糊 selector。

## 6. Management / CRUD

- 作品、類型、流水號選擇器與搜尋狀態保持一致。
- CRUD 必須有表單 validation、刪除確認、成功與失敗回饋。
- 新增／編輯不可產生重複 ID 或破壞既有資料。
- 編輯時不可因無關 render 遺失使用者輸入。
- 表單每個 HTML `id` 必須唯一，selector 不可因重複 ID 而只命中其中一個控制項。
- 管理頁不得直接修改 Store snapshot 中的 frozen data；建立新的資料物件後再提交。

## 7. GitHub API / Worker / 寫入一致性

- Frontend 不保存或暴露 GitHub Token；GitHub 寫入必須經 API / Worker layer。
- API / Worker 必須驗證輸入與 API response。
- 寫入只修改目標 Item、index 或必要的跨檔案資料，不覆寫無關 Item。
- 涉及分類跨檔案搬移時必須具備一致性與 rollback 策略。
- 固定寫入流程：
  1. 取得最新 remote head 與目標檔案 SHA。
  2. 驗證目前資料與操作條件。
  3. 建立最小必要 blobs / tree。
  4. 建立 atomic commit。
  5. 更新 branch ref 時確認仍指向預期 head。
  6. 競爭或中途失敗時不可靜默覆蓋其他修改。
- 單一 Item 新增／編輯／刪除盡可能保持最小範圍寫入。

## 8. Image Management

- 支援 JPG / JPEG / PNG / WebP / GIF / AVIF。
- 單張圖片大小上限依目前 API / UI 契約，Frontend 與 Worker 必須一致。
- 圖片路徑固定於 `data/<work>/<category>/<item>/images/`。
- 圖片 metadata 必須與實際檔案引用一致。
- 設為封面只能有正確的封面標記；排序只改 metadata 順序，不改 Item ID 或檔名。
- 替換圖片先成功寫入新圖片與 metadata，再清理舊圖片；清理失敗不得讓已成功的新圖片操作被視為失敗。
- 刪除圖片必須處理 metadata 與遠端檔案一致性，失敗時採可恢復策略。
- 任何圖片管理程式碼修改都必須增加 Patch。

## 9. Version / Verification

### Version

- 唯一正式版本來源：`public/data/version.json`。
- 格式：`Major.Minor.Patch`。
- Major 用於大版本／架構世代；Minor 用於完整邏輯／功能世代；Patch 用於任何實際程式碼、設定、規則、資料結構修改，以及 GitHub API 新增／移除收藏或圖片。
- 任何實際修改都必須增加 Patch，不因 reorder、cover replacement 或其他操作語義免除版本更新。
- UI 版本從 Store 載入的正式版本取得，不在多處硬編版本號。
- 不使用版本號作 module cache，也不使用 `?v=version`、`?build=...` 等 cache hack。
- 修改完成後確認 `public/data/version.json` 與 `package.json` 同步。

### Verification / TODO

- 完成實作後才勾選 TODO；「應該完成」不可視為完成。
- 可由工具驗證的 schema、build、Worker contract 等必須實際驗證後才算完成。
- Desktop、Mobile、互動 smoke test 若由使用者驗證，助手不可代為宣稱完成。
- 每次修改後檢查版本號、資料完整性與 production build / deploy 狀態。
- `RULES.md` 只保留長期規格與重要踩坑；`TODO.md` 只保留未完成、待驗證或值得持續追蹤的工作。
