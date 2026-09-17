# Merch Item Schema

> 本文件定義目前正式 Item 的資料契約。它描述「資料長什麼樣」；長期開發規則由 `RULES.md` 管理，類型定義由 `ITEM_TYPES.md` 管理。

## 1. Canonical Item

每個周邊都是獨立 Item，canonical data 固定位於：

```text
data/<work-id>/<category>/<item-id>/
├── data.json
└── images/
```

Item 不再以「整個作品一份 JSON」作為寫入單位。

## 2. 正式欄位

```json
{
  "id": "HSRd001",
  "workId": "honkai-star-rail",
  "title": "流螢 春日手信 1/8比例手辦",
  "series": ["春日手信"],
  "characters": ["流螢"],
  "category": "f",
  "manufacturer": "Myethos",
  "quantity": 1,
  "status": "received",
  "description": "",
  "notes": "",
  "purchase": {
    "price": 1375,
    "currency": "TWD",
    "platform": "米哈遊淘寶",
    "date": "2026-08-05"
  },
  "arrival": {
    "expectedDate": null,
    "receivedDate": "2026-09-14"
  },
  "afterSales": {
    "status": "處理中",
    "note": "待換貨"
  },
  "images": [
    {
      "id": "cover",
      "file": "cover.webp",
      "alt": "流螢立牌",
      "isCover": true
    }
  ]
}
```

### 頂層欄位

| 欄位 | 型別 | 規則 |
|---|---|---|
| `id` | string | 穩定且唯一的 Item ID |
| `workId` | string | 永久 Work ID |
| `title` | string | 周邊名稱 |
| `series` | string[] | 系列名稱，可為空陣列 |
| `characters` | string[] | 角色名稱，可為空陣列 |
| `category` | string | `ITEM_TYPES.md` 定義的 category code |
| `manufacturer` | string | 製造商，可為空字串 |
| `quantity` | integer | `>= 1` |
| `status` | string | 目前收藏／到貨狀態 |
| `description` | string | 描述，可為空字串 |
| `notes` | string | 個人備註，可為空字串 |
| `purchase` | object | 購買資訊 |
| `arrival` | object | 預計／實際到貨日期 |
| `afterSales` | object | 售後狀態與備註 |
| `images` | object[] | Item 圖片 metadata |

## 3. Purchase

`purchase`：

| 欄位 | 型別 | 規則 |
|---|---|---|
| `price` | number | 單件購買價格；統計時乘以 `quantity` |
| `currency` | string | 例如 `TWD`、`CNY` |
| `platform` | string | 購買平台，可為空字串 |
| `date` | string | 日期格式；可依現有資料規則為空 |

不加入 `orderId`、`url` 等非收藏管理必要欄位。

## 4. Arrival

```json
"arrival": {
  "expectedDate": "2026-09-20",
  "receivedDate": null
}
```

- `expectedDate`：預計收到日期，可為 `null`。
- `receivedDate`：實際收到日期，可為 `null`。
- `arrival` 只描述收藏到貨時間，不取代物流系統。

## 5. After-sales

```json
"afterSales": {
  "status": "處理中",
  "note": "待換貨"
}
```

只記錄目前售後狀態與備註，不建立完整訂單／售後歷程系統。

## 6. 明確排除的欄位

正式 Item schema 不包含：

- `material`
- `shipping`
- `workName`
- `workTitle`
- `createdAt`
- `updatedAt`
- 物流追蹤號碼、物流方式、集運資訊
- 未有明確資料契約的自訂欄位

其中 `material` 特別重要：亞克力是材質，不是 category。

## 7. Image metadata

```json
{
  "id": "cover",
  "file": "cover.webp",
  "alt": "流螢立牌",
  "isCover": true
}
```

規則：

- `file` 只能是檔名，不可包含路徑。
- 實體檔案位於同一 Item 的 `images/`。
- 支援格式由目前 image contract 定義：JPG、JPEG、PNG、WebP、GIF、AVIF。
- `isCover` 用來指定封面；資料應維持最多一個有效封面。
- Image metadata 是 Item canonical data；圖片 binary 由 R2 提供服務。

## 8. Category index

`data/<work>/<category>/index.json` 是 category 層索引，不取代 Item `data.json`。

它只保存列表、同步與驗證所需的最小 metadata；詳細 Item 資料仍以各 Item `data.json` 為準。

## 9. Compatibility / validation

- 舊資料缺少 `quantity` 時可相容預設為 `1`。
- 已存在但格式錯誤的 `quantity` 不得靜默轉成 `1`。
- 所有 API response、static data 與 remote mutation result 在進入 Store 前都必須經 validation。
- schema 不允許的欄位不得因方便而寫入 canonical data。
- Item ID、category、workId、path 必須彼此一致。

## 10. 計算語意

- **種類數**：Item 筆數。
- **持有件數**：`Σ quantity`。
- **單項消費**：`purchase.price × quantity`。
- **總消費**：`Σ(purchase.price × quantity)`。

這些語意必須在 Collection、Statistics、Home ranking 與管理頁保持一致。
