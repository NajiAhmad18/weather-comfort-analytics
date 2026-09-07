import NodeCache from 'node-cache';
import { CacheStats } from '../types/cache.types';

export class CacheService {
  private cache: NodeCache;
  private ttlSeconds: number;
  private hits: number = 0;
  private misses: number = 0;

  constructor(ttlSeconds: number = 300) {
    this.ttlSeconds = ttlSeconds;
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: 60,
      useClones: false,
    });
  }

  public get<T>(key: string): { data: T | undefined; status: 'HIT' | 'MISS' } {
    const value = this.cache.get<T>(key);
    if (value !== undefined) {
      this.hits++;
      return { data: value, status: 'HIT' };
    }
    this.misses++;
    return { data: undefined, status: 'MISS' };
  }

  public set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl || this.ttlSeconds);
  }

  public getStats(): CacheStats {
    return {
      hits: this.hits,
      misses: this.misses,
      keysCount: this.cache.keys().length,
      ttlSeconds: this.ttlSeconds,
    };
  }

  public clear(): void {
    this.cache.flushAll();
    this.hits = 0;
    this.misses = 0;
  }
}

export const weatherCacheService = new CacheService(300);
