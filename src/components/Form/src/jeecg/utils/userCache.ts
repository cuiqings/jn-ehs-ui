// 通用共享缓存工具：基于 key 的请求去重与结果缓存
// 说明：
// - 以字符串 key 作为缓存与进行中请求的唯一标识
// - 相同 key 的并发调用只会触发一次请求，后续复用同一 Promise 或已缓存的结果

const requestCache = new Map<string, Promise<any[]>>();
const dataCache = new Map<string, any[]>();

// 缓存上限（默认 200，可通过 setSharedCacheMax 配置）
let maxCacheEntries = 100;

function pruneCacheIfNeeded() {
  // 仅对数据缓存进行容量控制；进行中请求不做强制淘汰
  while (dataCache.size > maxCacheEntries) {
    const oldestKey = dataCache.keys().next().value as string | undefined;
    if (oldestKey === undefined) break;
    dataCache.delete(oldestKey);
  }
}

/**
 * 使用共享缓存获取数据
 * @param key 唯一键（建议包含 url/params/ids 等）
 * @param requestFactory 实际发起请求的方法，需返回数组数据
 */
export async function getWithSharedCache<T = any>(key: string, requestFactory: () => Promise<T[]>): Promise<T[]> {
  if (!key) {
    // 无 key 不缓存，直接请求
    return requestFactory();
  }

  // 命中数据缓存
  if (dataCache.has(key)) {
    // LRU: 命中后将条目移动到 Map 末尾，标记为最近使用
    const cached = dataCache.get(key)! as T[];
    dataCache.delete(key);
    dataCache.set(key, cached as any[]);
    return cached;
  }

  // 命中进行中请求
  if (requestCache.has(key)) {
    return requestCache.get(key)! as Promise<T[]>;
  }

  // 创建新请求
  const req = requestFactory()
    .then((res) => {
      dataCache.set(key, (res || []) as any[]);
      pruneCacheIfNeeded();
      requestCache.delete(key);
      return res || [];
    })
    .catch((err) => {
      requestCache.delete(key);
      throw err;
    });

  requestCache.set(key, req as unknown as Promise<any[]>);
  return req;
}

/**
 * 清理共享缓存
 * @param predicate 可选过滤器；不传则清空全部
 */
export function clearSharedCache(predicate?: (key: string) => boolean) {
  if (!predicate) {
    requestCache.clear();
    dataCache.clear();
    return;
  }
  for (const key of Array.from(requestCache.keys())) {
    if (predicate(key)) requestCache.delete(key);
  }
  for (const key of Array.from(dataCache.keys())) {
    if (predicate(key)) dataCache.delete(key);
  }
}

/**
 * 配置共享数据缓存的最大条目数（LRU 策略）
 */
export function setSharedCacheMax(max: number) {
  const normalized = Number.isFinite(max) ? Math.max(0, Math.floor(max)) : 0;
  maxCacheEntries = normalized;
  pruneCacheIfNeeded();
}

/**
 * 构建通用缓存 Key（可选）
 * 建议将请求的重要入参都纳入 key
 */
export function buildSharedKey(parts: Array<string | number | boolean | undefined | null>): string {
  return parts.map((p) => (typeof p === 'object' ? JSON.stringify(p) : String(p ?? ''))).join('|');
}
