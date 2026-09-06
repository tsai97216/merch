# Item schema mapping

- 基本資料：id, workId, title, series, characters, category, manufacturer, quantity, status, description, notes
- 購買：purchase.price, purchase.currency, purchase.platform, purchase.date
- 到貨：arrival.expectedDate, arrival.receivedDate
- 售後：afterSales.status, afterSales.note
- 圖片：images[] with id, file, alt, isCover, sha/path metadata as required by storage

Legacy persisted fields are forbidden: shipping, material, release, workName, createdAt, updatedAt.