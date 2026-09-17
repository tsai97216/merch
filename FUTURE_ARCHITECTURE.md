# Merch 未來架構方向

> 本文件記錄「未來可能需要演進的方向」，不是目前待辦事項。
> 只有當實際需求、程式複雜度或維護成本證明需要時，才應逐步採用。

## 目前基準

目前 Merch 採：

- TypeScript + Vite + ES Modules
- `data/` 作為 canonical data
- GitHub 作為資料版本與遠端 mutation 邊界
- Cloudflare Worker 作為 API／寫入邊界
- R2 作為圖片 binary asset layer
- `public/data/` 作為 build 產生的 read model
- `src/store.ts` 作為主要資料與 UI state source
- Hash Router + page modules + shared UI foundation

目前不需要因為「未來可能變大」而全面換框架或資料庫。

---

## 1. 前端模組逐步 Feature 化

### 方向

如果 `src/` 持續成長，可逐步由目前的 page-oriented 結構演進為 feature-oriented 結構：

```text
src/
├── app/
│   ├── main.ts
│   ├── router.ts
│   └── store.ts
├── features/
│   ├── collection/
│   ├── statistics/
│   ├── shipping/
│   ├── management/
│   ├── item/
│   └── home/
├── shared/
│   ├── components/
│   ├── utils/
│   ├── validation/
│   └── types/
└── styles/
```

### 觸發條件

只有當單一功能跨越多個 page、utility、state 與 UI 模組，導致尋找與修改成本明顯增加時才拆分。

不要為了「看起來比較現代」而提前搬移所有檔案。

---

## 2. Store 拆分與 Selectors

### 方向

如果 `src/store.ts` 逐漸變成同時處理大量 domain data、UI state、mutation、derived data 與 loading 狀態，應拆成清楚的責任：

```text
Domain State
├── collection
├── item
├── shipping
└── work

UI State
├── modal
├── loading
├── sync
└── navigation
```

同時增加 selectors／derived-data layer，讓 page 不必自行重複計算搜尋、排序、統計與篩選結果。

### 目標

- 保留單一 authoritative state
- 避免 page 建立第二份資料狀態
- 降低 Store 的耦合程度
- 讓 derived data 可以獨立測試

---

## 3. 強化 Read Model

目前已採：

```text
data/
  ↓ build
public/data/
```

未來若前端查詢需求增加，可以讓 build 階段產生更多專用 read model，例如：

```text
public/data/
├── collection.json
├── works.json
├── statistics.json
├── search-index.json
└── ranking.json
```

前端只消費適合顯示與查詢的 read model，而不是每個 page 都重新理解 canonical data 結構。

### 原則

- canonical data 仍只有 `data/`
- read model 永遠是可重建產物
- 不手動修改 generated data
- 不為了方便查詢而讓 generated data 反過來成為寫入來源

---

## 4. Domain Model

當資料與功能進一步增加，可以逐步建立更明確的 domain 概念：

```text
Item
Work
Category
Shipping
Purchase
Image
```

Page 與 UI 不應到處直接操作底層 JSON storage shape。

理想方向是：

```text
UI
 ↓
Application / Commands / Queries
 ↓
Domain
 ↓
Infrastructure
   ├── GitHub
   ├── Worker / API
   └── R2
```

這樣未來即使 storage 從 GitHub data 搬到其他系統，domain 與 UI 仍不需要全面重寫。

不需要現在就實作完整 Clean Architecture。只取其「Domain 不依賴 Infrastructure」與清楚責任邊界的優點即可。

---

## 5. Repository / Storage Abstraction

如果未來真的出現資料庫需求，再加入 repository abstraction：

```text
ItemRepository
WorkRepository
ShippingRepository
```

目前 GitHub canonical data 可以是第一個 implementation。

未來若改成 PostgreSQL、SQLite、Cloudflare D1 或其他 storage，替換 Infrastructure，而不是讓所有 UI／domain code 一起改。

### 不應提前做

不要為了抽象而抽象。只有當存在第二種 storage、需要測試替身，或 storage migration 已經成為實際需求時才建立這層。

---

## 6. 何時考慮資料庫

Item 數量本身不是換資料庫的充分理由。

真正值得考慮 DB 的條件包括：

- 複雜、多維度查詢成為主要瓶頸
- 訂單、物流、付款、庫存等關聯資料大量增加
- 需要真正的 transaction／跨實體一致性
- 多人同時編輯與權限管理成為需求
- 需要完整歷史紀錄、版本紀錄或 audit log
- Git-based JSON 的 mutation 與查詢成本開始明顯影響維護

在沒有上述需求前，維持目前架構反而較容易維護。

---

## 7. 不建議的過度工程化方向

除非需求真的出現，否則不應為了追求「標準全家桶」而一次導入：

- React / Next.js
- TanStack Query
- Zustand 等額外 state framework
- Tailwind 等全新 styling system
- PostgreSQL + ORM
- Redis
- Docker
- 額外 backend framework

技術數量增加不等於架構品質增加。對 Merch 而言，清楚的責任邊界、可驗證的資料流與低維護成本更重要。

---

## 8. 長期目標架構

如果未來規模真的持續成長，理想演進方向為：

```text
┌─────────────────────────────┐
│ UI                          │
│ Home / Collection / Stats…  │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Application                 │
│ Commands / Queries / Selectors│
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Domain                      │
│ Item / Work / Shipping /…   │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Infrastructure              │
│ GitHub / Worker / R2 / DB   │
└─────────────────────────────┘
```

這是演進方向，不是現在必須一次完成的重構目標。

---

## 9. 演進順序

若未來開始感受到架構壓力，優先順序建議：

1. 先修正實際的責任混亂與重複邏輯
2. Store 過大時增加 selectors、拆 domain/UI state
3. 前端功能過大時逐步 feature 化
4. 查詢需求增加時強化 read model
5. domain 與 storage 耦合明顯時加入 domain/application boundary
6. 真的需要替換 storage 時才加入 repository abstraction
7. 真正出現 DB 需求後才遷移資料庫

每一步都應能獨立驗證與回退，不進行沒有實際收益的大型一次性重構。

---

## 核心原則

> **不要為了未來而現在重寫。讓實際痛點決定下一層抽象。**

Merch 的最佳長期路線不是追逐最新框架，而是在目前穩定基礎上，逐步讓 UI、Application、Domain、Infrastructure 的責任更加清楚。
