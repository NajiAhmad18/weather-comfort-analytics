export interface CacheStats {
  hits: number;
  misses: number;
  keysCount: number;
  ttlSeconds: number;
}

export interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  status: 'HIT' | 'MISS';
}
