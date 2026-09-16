# Project Architecture / Current File Map

> 本文件記錄 Merch 目前 repository 的責任邊界與資料／部署流向。長期規則以 `RULES.md` 為準；未完成事項以 `TODO.md` 為準。

## 1. Repository structure

```text
merch/
├── .github/workflows/
│   ├── verify.yml              CI 驗證
│   └── deploy.yml              GitHub Pages + Cloudflare Worker 部署
├── data/                       canonical 周邊資料
├── public/                     Vite 靜態資源與 build 讀取資料
├── scripts/                    build / sync / schema / architecture verification
├── src/                        前端 TypeScript / CSS
├── worker/
│   ├── src/                    Cloudflare Worker API + R2 image boundary
│   └── wrangler.toml           Worker deployment 設定
├── index.html                  SPA shell
├── package.json                專案 metadata、scripts、版本
├── tsconfig.json               TypeScript 設定
├── vite.config.ts              Vite 設定
├── CNAME                       正式網域
├── RULES.md                    長期開發規則
├── TODO.md                     未完成／待驗證工作
├── ITEM_SCHEMA.md              Item schema 規格
├── ITEM_TYPES.md               Category 規格
├── UI_ARCHITECTURE.md          共用 UI 架構基線
└── PROJECT_ARCHITECTURE.md     本文件
```

Repository 不保留已完成的一次性 migration / reset workflow，也不保留本地 `upload/` 工作目錄或未使用的 package lock。

## 2. Data architecture

```text
data/
├── works.json
└── <work-id>/
    └── <category>/
        ├── index.json
        └── <item-id>/
            ├── data.json
            └── images/
```

- `data/` 是 canonical repository data。
- Work 使用 `works.json` index。
- Item 使用 category index + 單一 Item `data.json`。
- Item ID 是穩定識別碼，不能因排序或分類而改變。
- 圖片 metadata 屬於 Item data；圖片 binary 正式由 Cloudflare R2 提供。
- `public/data/` 是部署／build 使用的 read model，不是新的 canonical Item 寫入目標。

## 3. Frontend architecture

### Application core

| File | Responsibility |
|---|---|
| `src/main.ts` | Application entry、頁面初始化與主要 rendering 協調 |
| `src/router.ts` | Hash Router、route parsing、navigation、404 handling |
| `src/store.ts` | Remote data + UI state 的 single source of truth、remote apply |
| `src/api.ts` | API request、response validation、Item / Work / Shipping / asset mutation |
| `src/error.ts` | 共用錯誤型別與錯誤正規化 |
| `src/dom-compat.d.ts` | DOM / runtime TypeScript 相容宣告 |

### Identity / navigation / data helpers

| File | Responsibility |
|---|---|
| `src/item-id.ts` | Item ID parse / compose / validation |
| `src/category-label.ts` | Category code → visible label |
| `src/cross-navigation.ts` | 跨頁搜尋／Filter 條件轉跳 |
| `src/image-source.ts` | Item image URL、R2 asset path、fallback |

### Page modules

- `src/add.ts` / `src/add.css`：新增 Item。
- `src/collection-controls.ts` / `src/collection.css`：Collection search / filter / sort / view controls。
- `src/home-enhancements.ts` / `src/home-enhancements.css`：首頁額外互動與視覺 enhancement。
- `src/home-ranking.ts`：首頁排行資料與 rendering 邏輯。
- `src/management.ts`：Work / Item CRUD 與管理流程。
- `src/shipping.ts` / `src/shipping.css`：運費頁與運費操作。
- `src/statistics.ts` / `src/statistics-data.ts` / `src/statistics.css`：統計資料、計算、圖表與 UI。
- `src/settings-auth.ts` / `src/settings-auth.css`：設定頁驗證。
- `src/item-detail-shipping.ts`：Item Detail 的 shipping / arrival 邏輯。
- `src/shipping-detail-modal.ts`：Shipping detail modal。
- `src/detail-focus.ts`：Detail / Dialog focus lifecycle。

### Image / detail UI

- `src/image-viewer.ts` / `src/image-viewer.css`：圖片 viewer。
- `src/item-detail-modal.css`：Item Detail modal。
- `src/management-images.css`：Management 圖片區。

### Shared UI foundation

- `src/design-tokens.css`：semantic design tokens。
- `src/shared-components.css`：Button、Card、Panel、Modal、Badge、Feedback 等共用 foundation。
- `src/controls.css`：Input、Select、Segmented Control 等共用控制項。
- `src/theme.ts` / `src/theme.css` / `src/theme-refinement.css`：Light / Dark theme。
- `src/responsive-refinement.css`：Desktop / Tablet / Mobile responsive contract。
- `src/app-loading.ts` / `src/app-loading.css`：初始載入過渡。
- `src/sync-overlay.ts` / `src/sync-overlay.css`：API mutation blocking sync overlay。
- `src/page-auth-status.ts` / `src/page-auth-status.css`：頁面驗證狀態提示。
- `src/utils/toast.ts`：舊 `showToast()` API 的相容轉送，不建立第二套 Toast 視覺層。

`src/styles.css`、`src/card-enhancements.css` 等較舊的 base / enhancement 檔案仍屬現行前端的一部分；若未來確認與 shared foundation 有責任重疊，依 `RULES.md` 先記錄 TODO，再做實際合併／移除，不因檔名直接判定為可刪除。

## 4. Worker architecture

```text
worker/
├── src/index.ts        GitHub API read/write、atomic mutation、authorization
├── src/r2-entry.ts     R2 image request boundary + GitHub mutation mirror
├── src/r2-assets.ts    R2 object helpers
├── src/validation.ts   Worker input / schema validation
└── wrangler.toml       Cloudflare Worker configuration
```

Image PUT flow：

```text
Frontend
  │
  ▼
Cloudflare Worker /api/assets/*
  │
  ├── validate request
  ├── read previous object from R2 when present
  ├── write + verify R2
  ├── mirror metadata mutation to GitHub
  └── rollback R2 if GitHub mutation fails
```

R2 是圖片 binary 的 authoritative store；不存在 previous R2 object 時視為新圖片，不依賴舊 GitHub image binary 進行前置讀取。

## 5. Build / deployment

```text
GitHub push main
  │
  ├── Verify
  │     ├── data / schema / category / image checks
  │     ├── Worker / API contract checks
  │     └── TypeScript + Vite build
  │
  └── Deploy
        ├── Vite build → GitHub Pages
        └── Wrangler deploy → Cloudflare Worker
```

- `package.json` 的 `build` 會先同步 `public/data`，再產生 collection read model，最後執行 TypeScript / Vite build。
- `verify.yml` 與 `deploy.yml` 都使用 `npm install --no-package-lock`，因此 repository 不需要提交 `package-lock.json`。
- Worker credentials / secrets 由 `deploy.yml` 驗證與設定，不進 repository。

## 6. Scripts responsibilities

主要分為：

- **Build / sync**：`sync-public-data.mjs`、`generate-collection.mjs`
- **Data / schema verification**：data、schema、category、legacy fields、image、statistics、management 等 verifier
- **API / Worker verification**：API load / mutation、Worker architecture / scope / image / transaction / validation 等 verifier
- **CI contract**：確認 repository 的 CI 約束與 scripts wiring

Migration verifier 只保留目前 CI 所需的 `verify-migration-completion.mjs` 等現行驗證；已無現行責任的舊 migration equivalence script 已移除。

## 7. Responsibility rules

1. Canonical data：`data/`
2. Frontend state：`src/store.ts`
3. Remote mutation boundary：`src/api.ts` → Worker
4. GitHub write boundary：Worker
5. Image binary：R2
6. Deployment read model：`public/data/`
7. Shared UI foundation：shared CSS / theme / responsive layers
8. 未完成工作：`TODO.md`
9. 長期規則：`RULES.md`

同一責任若出現多層實作，不以額外 patch 解決；先確認實際 selector、import、資料流與 rendering 邊界，再合併或移除重複責任。
