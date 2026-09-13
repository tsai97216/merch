# Project Architecture / File Inventory

> 目的：建立 Merch 目前 repository 的「檔案用途地圖」，作為後續清理「新舊實作疊加」問題的基準。
>
> 本文件記錄目前檔案的責任邊界。後續若發現同一責任由多個檔案重複實作，先在 `TODO.md` 記錄，再依 `RULES.md` 徹底整理，而不是再增加一層 patch。

## 1. 整體結構

```text
merch/
├── .github/                 GitHub Actions 與部署／驗證流程
├── data/                    Canonical 周邊與作品資料來源
├── public/                  Vite 靜態資源與 build 後部署資料
├── scripts/                 build、資料同步、schema 與架構驗證工具
├── src/                     前端 TypeScript、CSS 與共用 UI 邏輯
├── worker/                  Cloudflare Worker API / GitHub 寫入層
├── upload/                  本地／工作流程使用的上傳資料目錄
│
├── index.html               SPA HTML shell 與頁面靜態結構
├── package.json             專案 metadata、版本與 npm scripts
├── tsconfig.json            TypeScript 編譯設定
├── vite.config.ts           Vite build / dev 設定
├── CNAME                    正式網站網域設定
│
├── RULES.md                 長期開發規則與架構約束
├── TODO.md                  未完成、待驗證與後續工作
├── ITEM_SCHEMA.md           Item canonical schema 規格
├── ITEM_TYPES.md            Category / 類型規格
├── UI_ARCHITECTURE.md       共用 UI redesign 基準
└── PROJECT_ARCHITECTURE.md  本文件：完整檔案責任地圖
```

## 2. Frontend `src/`

### Core / Application

| 檔案 | 責任 |
|---|---|
| `src/main.ts` | 前端應用入口、頁面初始化、主要跨頁資料與 rendering 協調。 |
| `src/router.ts` | Hash Router、route parsing、navigation 與未知 route 處理。 |
| `src/store.ts` | Remote data、UI state 與 mutation 後資料的主要 Store；維持單一 state source。 |
| `src/api.ts` | Frontend API client、request、response validation 與 Work / Item mutation。 |
| `src/types.ts` | 前端共用 TypeScript 型別與資料模型。 |
| `src/error.ts` | 共用錯誤型別、錯誤正規化與錯誤處理邊界。 |
| `src/dom-compat.d.ts` | DOM / runtime 相容性的 TypeScript 宣告補充。 |

### Data / Identity / Navigation

| 檔案 | 責任 |
|---|---|
| `src/item-id.ts` | Item ID 的解析、組合、驗證與永久識別規則。 |
| `src/category-label.ts` | Category code 與使用者可見名稱的單一轉換邏輯。 |
| `src/cross-navigation.ts` | Dashboard / Statistics / Collection 等頁面間的條件轉跳。 |
| `src/image-source.ts` | Item 圖片 URL、API asset 路徑與 fallback source 邏輯。 |

### Page logic

| 檔案 | 責任 |
|---|---|
| `src/add.ts` | Add page 表單、validation、新增 Item 流程。 |
| `src/collection-controls.ts` | Collection 搜尋、Filter、Sort、顯示模式等控制狀態與 UI。 |
| `src/home-enhancements.ts` | Home 額外互動／視覺 enhancement。 |
| `src/home-ranking.ts` | Home 排名資料與排名區塊邏輯。 |
| `src/management.ts` | Management Work / Item CRUD、搜尋與管理流程。 |
| `src/shipping.ts` | Shipping page 與運費相關資料／操作。 |
| `src/statistics.ts` | Statistics page rendering、圖表與統計 UI。 |
| `src/statistics-data.ts` | Statistics 的資料整理、計算與圖表資料模型。 |
| `src/settings-auth.ts` | Settings 的驗證／授權相關前端邏輯。 |
| `src/item-detail-shipping.ts` | Item Detail 中 Shipping / 到貨資訊的專責邏輯。 |
| `src/shipping-detail-modal.ts` | Shipping detail modal 的開啟、內容與生命週期。 |
| `src/detail-focus.ts` | Item Detail / Dialog focus trap 與 focus restoration。 |

### Image / Detail UI

| 檔案 | 責任 |
|---|---|
| `src/image-viewer.ts` | 圖片檢視器互動、開關、切換與生命週期。 |
| `src/image-viewer.css` | Image viewer 的視覺樣式。 |
| `src/item-detail-modal.css` | Item Detail modal 的視覺結構與欄位樣式。 |
| `src/management-images.css` | Management 圖片管理區域的視覺樣式。 |

### Shared UI / Design system

| 檔案 | 責任 |
|---|---|
| `src/design-tokens.css` | Semantic color、typography、spacing、radius、surface 等設計 token。 |
| `src/shared-components.css` | Button、Card、Panel、Modal、Badge 等 shared component foundation。 |
| `src/controls.css` | Input / Select / Segmented control 等共用控制項。 |
| `src/responsive-refinement.css` | Desktop / Tablet / Mobile 的集中 responsive contract。 |
| `src/theme.ts` | Light / Dark theme 初始化與主題切換。 |
| `src/theme.css` | Theme 基礎樣式入口／必要 theme rules。 |
| `src/theme-refinement.css` | Theme foundation 上的 refinement；後續應避免再堆疊成第二套 theme。 |
| `src/toast.css` | Legacy / shared feedback 視覺樣式；需與目前 animated feedback foundation 一起檢查是否仍有獨立責任。 |
| `src/sync-overlay.ts` | API mutation 的全頁同步狀態與 blocking feedback 邏輯。 |
| `src/sync-overlay.css` | Sync overlay 與 blocking feedback 的視覺樣式。 |

### Page-specific CSS

| 檔案 | 責任 |
|---|---|
| `src/add.css` | Add page 專屬布局／樣式。 |
| `src/collection.css` | Collection page 專屬布局／樣式。 |
| `src/shipping.css` | Shipping page 專屬布局／樣式。 |
| `src/statistics.css` | Statistics page 專屬布局／圖表樣式。 |
| `src/settings-auth.css` | Settings auth 區域專屬樣式。 |
| `src/management-images.css` | Management 圖片區專屬樣式。 |
| `src/card-enhancements.css` | Card 額外 enhancement；**列為後續疊加檢查候選**。 |
| `src/styles.css` | 目前全站主要 legacy / base stylesheet；**列為後續與 shared foundation 重疊檢查重點**。 |

## 3. Data

```text
data/
├── works.json                         作品 canonical index
└── <work-id>/
    └── <category>/
        ├── index.json                 該 category 的 Item index
        └── <item-id>/
            ├── data.json              單一 Item canonical data
            └── images/                該 Item 的圖片
```

`data/` 是正式資料的 canonical source。Item data 不應由 frontend CSS / rendering 邏輯直接修改。

## 4. `public/`

```text
public/
├── data/
│   ├── version.json                   部署版本資訊，必須與 package.json 同步
│   ├── collection.json                build 產生的 collection read model
│   └── ...                            build / deployment data
├── icons/                             favicon / PWA 等網站圖示
├── logo/                              品牌 Logo 資產
└── ...                                其他靜態資源
```

`public/data/` 是部署／build 產物，不是 ChatGPT 新增 canonical Item 的主要寫入位置。

## 5. `scripts/`

主要責任分成四類：

```text
scripts/
├── build / sync
│   ├── sync-public-data.mjs           將 canonical data 同步為部署資料
│   └── generate-collection.mjs        產生 collection read model
│
├── migration
│   ├── migrate.mjs                    舊資料 migration
│   ├── verify-migration-completion.mjs migration 驗證
│   └── verify-new-data.mjs            新資料驗證
│
├── data / schema verification
│   ├── verify-data.mjs
│   ├── verify-schema-contract.mjs
│   ├── verify-category-contract.mjs
│   ├── verify-legacy-fields.mjs
│   ├── verify-image-contract.mjs
│   ├── verify-statistics-date.mjs
│   ├── verify-statistics-year-isolation.mjs
│   ├── verify-statistics-year-contract.mjs
│   └── verify-management-schema.mjs
│
└── Worker / API architecture verification
    ├── verify-worker-architecture.mjs
    ├── verify-worker-write-scope.mjs
    ├── verify-worker-read-scope.mjs
    ├── verify-worker-image-semantics.mjs
    ├── verify-worker-transaction.mjs
    ├── verify-api-load-contract.mjs
    ├── verify-api-mutation-contract.mjs
    ├── verify-work-identity-contract.mjs
    ├── verify-works-management.mjs
    └── verify-home-ranking.mjs
```

## 6. `worker/`

```text
worker/
├── src/index.ts                       Cloudflare Worker API、GitHub read/write、atomic mutation
└── wrangler.toml                      Worker deployment / runtime 設定
```

Worker 是 frontend 與 GitHub repository 寫入之間的 boundary。Frontend 不保存 GitHub token。

## 7. Build / deployment boundary

```text
User
  │
  ▼
index.html + src/*
  │
  ├── Store / API ───────► worker/src/index.ts ─────► GitHub data/
  │
  └── Vite build
          │
          ├── scripts/sync-public-data.mjs
          └── scripts/generate-collection.mjs
                    │
                    ▼
              public/data/*
                    │
                    ▼
              GitHub Pages
                    │
                    ▼
             merch.chi.qzz.io
```

## 8. 疊加實作檢查優先順序

後續要找「改了但其實只是疊上去」時，先檢查：

1. `src/styles.css` ↔ `src/design-tokens.css` / `src/shared-components.css`
2. `src/theme.css` / `src/theme-refinement.css` ↔ shared theme foundation
3. `src/controls.css` ↔ page-specific Select / Input CSS
4. `src/responsive-refinement.css` ↔ 各 page CSS 裡的 viewport rules
5. `src/card-enhancements.css` ↔ Card foundation
6. `src/toast.css` ↔ `src/sync-overlay.*` / animated feedback foundation
7. `src/home-enhancements.ts` ↔ `main.ts` / Home rendering
8. `src/management-images.css` ↔ Management image rendering
9. `src/item-detail-modal.css` ↔ shared Modal / Panel foundation

這些只是「檢查優先順序」，不是預先判定它們一定是錯誤。每項都要查看實際 selector、import、rendering 與責任邊界後才能決定保留、合併或刪除。

## 9. 維護規則

- 新增檔案時，若具有長期責任，必須同步更新本文件。
- 檔案責任改變時，先更新本文件的責任描述，再進行後續架構整理。
- 同一責任若由兩個以上檔案共同實作，必須明確說明分工；若無合理分工，列入 `TODO.md` 後清理。
- 不因「現在能正常顯示」就保留已被新 foundation 取代的舊實作。
- 本文件是架構 inventory，不取代 `RULES.md`、`TODO.md` 或 `UI_ARCHITECTURE.md`。
