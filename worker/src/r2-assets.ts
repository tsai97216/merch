export interface R2AssetResult {
  body: ReadableStream<Uint8Array> | null;
  etag?: string;
  httpMetadata?: R2HTTPMetadata;
  size?: number;
}

function objectKey(path: string): string {
  return path.replace(/^\/+/, '');
}

export async function getR2Asset(bucket: R2Bucket, path: string): Promise<R2AssetResult | null> {
  const object = await bucket.get(objectKey(path));
  if (!object) return null;
  return {
    body: object.body,
    etag: object.httpEtag,
    httpMetadata: object.httpMetadata,
    size: object.size,
  };
}

export async function putR2Asset(bucket: R2Bucket, path: string, body: Uint8Array, contentType: string): Promise<void> {
  await bucket.put(objectKey(path), body, {
    httpMetadata: {
      contentType,
      cacheControl: 'public, max-age=31536000, immutable',
    },
  });
}

export async function deleteR2Asset(bucket: R2Bucket, path: string): Promise<void> {
  await bucket.delete(objectKey(path));
}

export async function hasR2Asset(bucket: R2Bucket, path: string): Promise<boolean> {
  return Boolean(await bucket.head(objectKey(path)));
}
