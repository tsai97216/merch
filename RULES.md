# merch 開發規則

> 本文件是專案的長期規格與重要踩坑紀錄。修改前必讀；新的長期規則確立後才加入。已完成的一次性工作不放在這裡，改放 `TODO.md` 的未完成／待驗證項目。

## 1. 修改原則

每次修改前先確認：

1. 本文件是否已有相關規則。
2. `TODO.md` 是否有對應工作。
3. `merch-old` 是否有可參考的 UI / UX 或功能行為。
4. 現有資料、Store、Router、搜尋與 rendering 是否已有可重用邏輯。
5. 是否影響資料格式、Item ID、版本號、圖片或部署。

- 小功能只改最小必要範圍，不為小問題重寫整個專案；但若根因位於共用架構、狀態模型、元件邊界或資料流，必須修正根因，不得以局部 workaround 掩蓋問題。
- UI／功能問題優先修正底層結構與共用邏輯，不以額外 CSS 覆蓋、DOM hack、延遲、重複事件、條件分支或其他補丁方式掩蓋根因。
- 共用 UI 行為應在共用元件、設計 token、狀態模型或正確的 rendering 層解決，避免同一問題在各頁面各自修補。
- 重新設計頁面時應先整理共用 UI 基礎與資訊架構，再由各頁套用，不建立互相獨立且重複的視覺實作。
- **修改既有功能或樣式時，必須先確認是否存在舊實作；若新實作只是疊加、覆蓋或旁路舊實作，應優先清理並徹底替換舊實作，不得讓新舊實作長期並存形成多層 patch。**
- 不以「看起來能用」取代實際驗證。
- 發現確定問題、可疑邏輯、舊代碼、重複實作或任何需要判斷的地方，先加入 `TODO.md`，再修改或刪除。

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
- Store 內涉及遠端資料的寫入操作必須序列化，避免同一份資料在並行 mutation 下產生競爭或 stale overwrite。
- 遠端 mutation 成功後，以 API 回傳結果作為 Store 的權威資料來源，統一經 Store 的 remote-apply 流程回寫，不在 UI 各自建立第二份遠端資料狀態。
- 共用 Store 載入 promise 若載入失敗必須清除，使後續操作仍可重新嘗試載入或進入既定 fallback；不可永久快取失敗結果。
- Work CRUD 不應無故修改 Shipping state；除非操作本身明確針對 Shipping，否則套用 Work 資料時應保留現有運費資料。

### Item ID

- Item ID 是永久識別碼，刪除後不可重新編號、補號或重用。
- 格式為「作品代碼 + 歷史類型 code + 三位流水號」。
- UI 排序、資料搬移或分類修正都不可改變既有 Item ID。
- ID 中的歷史類型 code 與目前 `category` 是不同概念。
- Worker 對既有 Item 的 Work 對應必須解析永久 Item ID 中的完整 Work Code 後精確比對，不得以 `startsWith(work.code)` 等前綴方式判斷，以避免作品代碼碰撞。
- 新增 Item 的 ID 唯一性必須以完整 remote repository 的 Item 集合檢查，不得只在目標 category 內檢查。
- 載入 remote Item Map 時若發現重複 Item ID，必須立即視為資料異常並拒絕繼續，不可讓後載入項目靜默覆蓋前一筆。

### Category

- 類型 code、名稱與分類規則以 `ITEM_TYPES.md` 為唯一規格來源。
- `亞克力` 是材質，不是獨立商品類型；新商品依實際商品型態分類。
- 修改類型前先更新 `ITEM_TYPES.md`，再檢查 validation、Item ID、資料路徑、搜尋與 UI。
- Management 的 category 顯示與驗證應使用既定的單一 category source，不在不同檔案維護重複 category 陣列。
- Management Work selector 的 value / state key 應使用永久 `work.id`，不要使用可能重複或可變動的作品名稱。

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
- API 驅動的新增、編輯、刪除、圖片操作等，在同步尚未完成前必須有明確的同步／上傳狀態；只有成功收到完成結果後才可顯示成功狀態。

### 已確立的共用 UI 基礎

- 全站色彩、Typography、Spacing、Radius、Border、Surface、Focus、Shadow 等視覺基礎以 semantic design tokens 為單一來源；不得重新建立舊式 page-specific token alias。
- Button、Input、Select、Segmented Control、Card、Panel、Modal、Badge、Feedback 等共用元件優先使用 shared foundation，不得為單一頁面重建相同語意的第二套元件。
- 全站 viewport responsive contract 集中於 `src/responsive-refinement.css`；新增 page-specific viewport 規則也必須放在此 responsive layer，不得散落在各頁 CSS。
- Mobile Navigation 採「品牌 Header + 可水平滑動的頁面導覽列」結構；mobile 不保留 Desktop sidebar 的佔位空間，主內容使用可用寬度。
- Responsive 設計以 Desktop、Tablet、Mobile 同時考慮；Mobile 不以單純縮小 Desktop 為唯一策略，應依可用空間重新安排資訊層級與操作方式。

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
- 未知 route 應保留 404 語意，不得為了回復正常而強制 replace 成 `#/home`。
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
- Worker 圖片寫入、Item mutation 與清理操作若同時競爭，必須以觀測到的 remote HEAD 作為 atomic commit parent，並以 `force: false` 更新 branch；過期操作必須失敗而非覆蓋新修改。

## 8. Image Management

- 支援 JPG / JPEG / PNG / WebP / GIF / AVIF。
- 單張圖片大小上限依目前 API / UI 契約，Frontend 與 Worker 必須一致。
- 圖片路徑固定於 `data/<work>/<category>/<item>/images/`。
- 圖片 metadata 必須與實際檔案引用一致。
- 設為封面只能有正確的封面標記；排序只改 metadata 順序，不改 Item ID 或檔名。
- 替換圖片先成功寫入新圖片與 metadata，再清理舊圖片；清理失敗不得讓已成功的新圖片操作被視為失敗。
- 刪除圖片必須處理 metadata 與遠端檔案一致性，失敗時採可恢復策略。
- 新增與替換圖片 mutation 都必須遵守 Patch version 語意，不得只在首次建立圖片時增加版本。
- 任何圖片管理程式碼修改都必須增加 Patch。

## 9. Version / Verification

### Version

- 唯一正式版本來源為 `package.json` 的 `version`；`public/data/version.json` 必須同步。
- 任何會影響正式網站行為的程式碼、設定、規則、資料結構或正式資料變更，都必須增加 Patch version。
- `package.json` 與 `public/data/version.json` 不一致視為錯誤。
- 發布前至少確認 TypeScript、Build、schema / data integrity 與相關 Worker 驗證通過。

### Verification

- 不可只看 diff 判定完成。
- 需要實際執行適用的 build、typecheck、schema、資料完整性與 Worker 驗證。
- 涉及部署的變更必須確認 GitHub Actions 成功。
- 效能改善若涉及使用者實際體感，CI 通過不等於完成；需要實際確認正式網站行為。

## 10. 大量新增周邊資料規範

> 本區塊專門規範「由 ChatGPT 協助一次大量新增周邊」的標準流程。未來即使新增數量很多，也必須依本區塊執行，不得因為資料量大而改用舊式整份作品 JSON、直接修改 `public/data/`，或跳過資料驗證。

### 10.1 資料應新增到哪裡

- 所有正式周邊資料的唯一 canonical source 是 `data/`。
- 新增 Item 必須建立在：`data/<work>/<category>/<item-id>/data.json`。
- 該 Item 的圖片必須放在：`data/<work>/<category>/<item-id>/images/`。
- `data/works.json` 只在新增／修改作品本身時才更新；單純新增周邊不得無故修改。
- `public/data/` 是 build 產物／部署資料，不是 ChatGPT 手動新增周邊的主要寫入位置。不得因為網站目前看不到新資料，就直接把同一批資料複製到 `public/data/`。
- `public/data/collection.json` 是 build 時由 `scripts/generate-collection.mjs` 從 `data/` 產生的靜態 read model。不得手動把 Item 加進去。
- 新增大量周邊後，應由 build 流程執行 `sync-public-data.mjs` 與 `generate-collection.mjs`，讓部署資料自動同步。

### 10.2 ChatGPT 接收的大量新增格式

未來使用者可以直接用自然語言、表格或多筆條列提供資料，但為降低歧義，推薦使用以下格式：

```text
新增作品／周邊
作品：絕區零
作品 ID：zenless-star-zone

1.
角色：伊埃斯
類型：手機架
數量：1
平台：線下活動

2.
角色：愛彌斯
類型：證件照
數量：1
平台：線下活動
```

也可以使用表格：

```text
| 作品 | 角色 | 類型 | 數量 | 平台 |
|---|---|---|---:|---|
| 絕區零 | 伊埃斯 | 手機架 | 1 | 線下活動 |
| 絕區零 | 愛彌斯 | 證件照 | 1 | 線下活動 |
```

- 若使用者省略作品、類型、角色、數量、平台等欄位，ChatGPT 應只在能由既有資料或明確上下文可靠判定時補值；無法可靠判定時必須詢問，不得猜測。
- `quantity` 預設為 1 僅適用於專案既定的相容性規則；若使用者明確提供數量，必須以使用者提供值為準。
- 「平台」是購買／取得來源欄位，不可自行改寫成其他語意。
- 角色、作品、類型名稱應保留使用者原意；如需正規化拼字或對應既有作品資料，先檢查 repo 既有資料與規則。

### 10.3 ChatGPT 新增周邊的標準處理步驟

每次收到「大量新增周邊」要求時，ChatGPT 必須依序執行：

1. **先讀規則與待辦**：先讀 `RULES.md`、`TODO.md`，確認目前資料架構、category 規則、ID 規則與任何尚未完成的資料相關 TODO。
2. **確認作品**：確認每筆 Item 所屬的永久 `work.id`，不能只依作品顯示名稱猜路徑。
3. **確認類型**：依 `ITEM_TYPES.md` 判斷 category 與 category code。`亞克力` 等材質描述不得直接當成 category，必須依實際商品型態分類。
4. **檢查既有資料**：在完整 `data/` Item 集合中檢查角色、標題、類型、既有 ID、同商品或可能重複資料，避免重複新增。
5. **分配 Item ID**：新 ID 必須依目前 ID 規則產生，並以完整 remote repository 的 Item 集合確認唯一。不得因 category 變更而改既有 ID，也不得補號或重用已刪除 ID。
6. **建立 Item 資料**：每筆建立自己的 `data/<work>/<category>/<item-id>/data.json`。canonical Item JSON 不得加入 `workName`、`shipping`、`material`、`release`、`createdAt`、`updatedAt` 等非 schema 欄位。
7. **處理圖片**：若使用者同時提供圖片，圖片只放到該 Item 的 `images/`，並確認 metadata 引用與實際檔名一致。沒有圖片就不要虛構圖片檔案或 metadata。
8. **驗證每筆資料**：新增前後都要檢查 JSON schema、required fields、quantity、category、Item ID、路徑與圖片契約。
9. **批次寫入 canonical `data/`**：大量新增可以一次建立多個 Item 資料夾／檔案，但仍必須以 `data/` 為唯一來源；不得把大量資料塞回舊作品整份 JSON。
10. **同步部署資料**：完成 canonical data 後，讓 build 自動執行 `sync-public-data.mjs` 與 `generate-collection.mjs`。除非專案規則另有明確要求，不手動編輯 generated `public/data/`。
11. **版本更新**：正式資料變更屬於會影響網站行為的 repository change，因此依 Version 規則增加 Patch，並同步 `package.json` 與 `public/data/version.json`。
12. **實際驗證**：至少確認資料完整性、schema、Item ID 唯一性、collection read model 生成結果與 build；若已部署，確認 GitHub Actions 成功。

### 10.4 大量新增時的「先整理、後寫入」原則

- ChatGPT 不應收到一筆資料就立即寫入一筆，尤其是一次有數十筆以上時。應先把使用者提供的全部資料整理成「待新增清單」，完成去重、欄位補全、category 判定與 ID 規劃，再批次寫入。
- 若其中有一筆資料存在歧義，不應影響其他無歧義資料的整理；可以先列出「可直接新增」與「需要確認」兩組。
- 若使用者明確說「直接全部新增」，仍不得跳過 schema、ID 唯一性、category 與資料完整性驗證。
- 如果同一批資料內可能互相產生重複 ID，必須先在記憶中的待新增集合內預檢，再與 remote repository 現有集合合併檢查。
- 大量新增不代表可以降低驗證標準，只能提高批次處理效率。

### 10.5 ChatGPT 回覆格式

每次大量新增周邊完成後，ChatGPT 的回覆應簡潔但可核對，固定包含：

```text
大量新增完成

作品：絕區零
新增：2 筆

- 伊埃斯｜手機架｜數量 1｜平台：線下活動
- 愛彌斯｜證件照｜數量 1｜平台：線下活動

資料位置：data/<work>/<category>/<item-id>/data.json
版本：X.Y.Z
驗證：schema / ID 唯一性 / data integrity / build / GitHub Actions
狀態：完成
```

- 若是多個作品，依作品分組列出新增數量與項目。
- 不需要在回覆中把每個完整 `data.json` 全部貼出，除非使用者要求檢視原始資料。
- 若有無法自動判定的資料，必須明確列在「需要確認」區塊，不可把猜測結果當成已完成。
- 若尚未完成 build、部署或實際驗證，不得寫「完成」；應明確寫「已寫入，待驗證」或對應的實際狀態。
- 若新增過程發現資料結構、category、ID 或 Worker 有問題，依既有規則先記錄到 `TODO.md`，再處理；不得默默繞過規則。

### 10.6 特別禁止事項

- 禁止把新 Item 直接新增到 `public/data/` 當作 canonical data。
- 禁止恢復舊版「整份作品 JSON」作為大量新增的主要方式。
- 禁止為了省時間跳過完整 repository 的 Item ID 唯一性檢查。
- 禁止猜測使用者沒有提供且 repo 無法可靠推導的資料。
- 禁止為了大量新增而關閉 schema validation、data integrity 或 build verification。
- 禁止因為使用者只提供「角色、類型、數量、平台」就自行虛構價格、購買日期、描述、圖片或其他未提供資訊。

## 11. 長期維護

- 新增長期規則前先確認不是一次性 TODO。
- 已經確認且未來會反覆影響開發流程的規則，才加入本文件。
- 規則修改本身也屬正式 repository change，必須遵守版本同步與驗證規則。
