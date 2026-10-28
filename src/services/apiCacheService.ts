/**
 * X-CRISPIN — SHOP THE X
 * Intelligent Multi-tier API Cache Service
 * 
 * Strategy:
 * - L1: Memory Cache (ultra-fast access)
 * - L2: Persistent Cache (LocalStorage with quota management for offline browsing)
 * - Stale-While-Revalidate (SWR): Return cached data immediately while revalidating in background
 * - Offline Resilient: Gracefully fall back to cached data when network is disconnected
 * - Tag-based Invalidation: Granular invalidation for 'products', 'categories', etc.
 */

export interface CacheEntry<T> {
  key: string;
  tag: string;
  data: T;
  timestamp: number;
  ttl: number; // in milliseconds
  etag?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  revalidations: number;
  lastSyncTime: number | null;
  entryCount: number;
  isOffline: boolean;
}

type CacheListener = (event: { type: 'set' | 'invalidate' | 'revalidate'; key: string; tag?: string }) => void;

class ApiCacheService {
  private memoryCache = new Map<string, CacheEntry<unknown>>();
  private listeners: Set<CacheListener> = new Set();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    revalidations: 0,
    lastSyncTime: null,
    entryCount: 0,
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
  };

  private readonly STORAGE_PREFIX = 'xc_cache_v1_';
  private readonly META_KEY = 'xc_cache_meta_v1';

  constructor() {
    this.initNetworkListeners();
    this.hydrateFromStorage();
  }

  private initNetworkListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.stats.isOffline = false;
      this.notify({ type: 'revalidate', key: '*' });
    });

    window.addEventListener('offline', () => {
      this.stats.isOffline = true;
      this.notify({ type: 'revalidate', key: '*' });
    });
  }

  /**
   * Hydrates memory cache with persistent entries stored in LocalStorage
   */
  private hydrateFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      let count = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.STORAGE_PREFIX)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              const entry = JSON.parse(raw) as CacheEntry<unknown>;
              const internalKey = key.replace(this.STORAGE_PREFIX, '');
              this.memoryCache.set(internalKey, entry);
              count++;
              if (!this.stats.lastSyncTime || entry.timestamp > this.stats.lastSyncTime) {
                this.stats.lastSyncTime = entry.timestamp;
              }
            } catch (err) {
              console.warn('Failed parsing cache entry:', key, err);
            }
          }
        }
      }

      // Pre-sembrar categorías desde la capa persistente si no estuvieran ya en memoria
      const rawCategories =
        localStorage.getItem('categories') || localStorage.getItem('xc_persistent_categories');
      if (rawCategories && !this.memoryCache.has('api/categories')) {
        try {
          const parsed = JSON.parse(rawCategories);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.memoryCache.set('api/categories', {
              key: 'api/categories',
              data: parsed,
              timestamp: Date.now(),
              ttl: 15 * 60 * 1000,
              tag: 'categories',
            });
            count++;
          }
        } catch {
          // ignore
        }
      }

      // Pre-sembrar productos más vendidos desde la capa persistente
      const rawBestSellers =
        localStorage.getItem('bestSellingProducts') || localStorage.getItem('xc_persistent_bestsellers');
      if (rawBestSellers) {
        try {
          const parsed = JSON.parse(rawBestSellers);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.memoryCache.set('api/products/bestsellers?limit=6', {
              key: 'api/products/bestsellers?limit=6',
              data: parsed,
              timestamp: Date.now(),
              ttl: 10 * 60 * 1000,
              tag: 'products',
            });
            if (!this.memoryCache.has('api/products')) {
              this.memoryCache.set('api/products', {
                key: 'api/products',
                data: parsed,
                timestamp: Date.now(),
                ttl: 5 * 60 * 1000,
                tag: 'products',
              });
            }
            count++;
          }
        } catch {
          // ignore
        }
      }

      this.stats.entryCount = count;
    } catch (err) {
      console.warn('Error hydrating cache from storage:', err);
    }
  }

  /**
   * Deterministic cache key generator from endpoint and query object
   */
  public buildKey(endpoint: string, params?: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) {
      return endpoint;
    }
    // Sort keys for deterministic hashing
    const sorted = Object.keys(params)
      .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
      .sort()
      .map((k) => `${k}=${encodeURIComponent(String(params[k]))}`)
      .join('&');
    return sorted ? `${endpoint}?${sorted}` : endpoint;
  }

  /**
   * Check if current environment is offline
   */
  public isOffline(): boolean {
    return typeof navigator !== 'undefined' ? !navigator.onLine : false;
  }

  /**
   * Retrieve cached entry (from Memory or LocalStorage)
   */
  public get<T>(key: string): { data: T | null; isStale: boolean; exists: boolean; age: number } {
    let entry = this.memoryCache.get(key) as CacheEntry<T> | undefined;

    // Check localStorage fallback if not in memory
    if (!entry && typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem(`${this.STORAGE_PREFIX}${key}`);
        if (raw) {
          entry = JSON.parse(raw) as CacheEntry<T>;
          this.memoryCache.set(key, entry);
        } else if (key === 'api/categories') {
          const persistentCats =
            localStorage.getItem('categories') || localStorage.getItem('xc_persistent_categories');
          if (persistentCats) {
            const parsed = JSON.parse(persistentCats);
            entry = {
              key,
              data: parsed as T,
              timestamp: Date.now(),
              ttl: 15 * 60 * 1000,
              tag: 'categories',
            };
            this.memoryCache.set(key, entry as CacheEntry<unknown>);
          }
        } else if (key.includes('bestsellers') || key === 'api/products') {
          const persistentProds =
            localStorage.getItem('bestSellingProducts') ||
            localStorage.getItem('xc_persistent_bestsellers');
          if (persistentProds) {
            const parsed = JSON.parse(persistentProds);
            entry = {
              key,
              data: parsed as T,
              timestamp: Date.now(),
              ttl: 10 * 60 * 1000,
              tag: 'products',
            };
            this.memoryCache.set(key, entry as CacheEntry<unknown>);
          }
        }
      } catch (err) {
        console.warn('Cache read error from storage:', err);
      }
    }

    if (!entry) {
      this.stats.misses++;
      return { data: null, isStale: true, exists: false, age: 0 };
    }

    const now = Date.now();
    const age = now - entry.timestamp;
    const isStale = age > entry.ttl;

    this.stats.hits++;
    return {
      data: entry.data,
      isStale,
      exists: true,
      age,
    };
  }

  /**
   * Store data in Memory and LocalStorage
   */
  public set<T>(key: string, data: T, ttl: number = 300_000, tag: string = 'general'): void {
    const entry: CacheEntry<T> = {
      key,
      tag,
      data,
      timestamp: Date.now(),
      ttl,
    };

    // Store in L1 memory
    this.memoryCache.set(key, entry as CacheEntry<unknown>);
    this.stats.lastSyncTime = entry.timestamp;
    this.stats.entryCount = this.memoryCache.size;

    // Store in L2 persistent storage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(`${this.STORAGE_PREFIX}${key}`, JSON.stringify(entry));

        // Sincronización directa con claves de usePersistentData para asegurar estado inicial
        if (Array.isArray(data) && data.length > 0) {
          if (key === 'api/categories') {
            localStorage.setItem('categories', JSON.stringify(data));
            localStorage.setItem('xc_persistent_categories', JSON.stringify(data));
          } else if (key.includes('bestsellers')) {
            localStorage.setItem('bestSellingProducts', JSON.stringify(data));
            localStorage.setItem('xc_persistent_bestsellers', JSON.stringify(data));
          }
        }
      } catch (err) {
        // Handle storage quota exceeded: purge older entries
        console.warn('LocalStorage quota limit reached, cleaning stale cache entries...', err);
        this.pruneExpiredEntries();
        try {
          localStorage.setItem(`${this.STORAGE_PREFIX}${key}`, JSON.stringify(entry));
        } catch {
          // ignore if still full
        }
      }
    }

    this.notify({ type: 'set', key, tag });
  }

  /**
   * Core Smart-Fetcher implementing Stale-While-Revalidate (SWR)
   */
  public async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T> | T,
    options: {
      ttl?: number;
      tag?: string;
      forceRefresh?: boolean;
    } = {}
  ): Promise<{
    data: T;
    fromCache: boolean;
    isStale: boolean;
    isOffline: boolean;
  }> {
    const { ttl = 300_000, tag = 'general', forceRefresh = false } = options;
    const offline = this.isOffline();
    const cached = this.get<T>(key);

    // If offline, ALWAYS return cached data if present, or attempt fetcher if none
    if (offline) {
      if (cached.exists && cached.data !== null) {
        return {
          data: cached.data,
          fromCache: true,
          isStale: cached.isStale,
          isOffline: true,
        };
      }
    }

    // If forceRefresh is requested and online, bypass cache and fetch directly
    if (forceRefresh && !offline) {
      const freshData = await fetcher();
      this.set(key, freshData, ttl, tag);
      return {
        data: freshData,
        fromCache: false,
        isStale: false,
        isOffline: false,
      };
    }

    // Cache hit and fresh: return immediately
    if (cached.exists && !cached.isStale && cached.data !== null) {
      return {
        data: cached.data,
        fromCache: true,
        isStale: false,
        isOffline: false,
      };
    }

    // Cache hit but stale: Stale-While-Revalidate
    if (cached.exists && cached.isStale && cached.data !== null) {
      if (!offline) {
        // Trigger background revalidation asynchronously
        Promise.resolve().then(async () => {
          try {
            const fresh = await fetcher();
            this.set(key, fresh, ttl, tag);
            this.stats.revalidations++;
            this.notify({ type: 'revalidate', key, tag });
          } catch (err) {
            console.warn(`Background revalidation failed for ${key}:`, err);
          }
        });
      }

      return {
        data: cached.data,
        fromCache: true,
        isStale: true,
        isOffline: offline,
      };
    }

    // Cache miss: execute fetcher synchronously
    try {
      const freshData = await fetcher();
      this.set(key, freshData, ttl, tag);
      return {
        data: freshData,
        fromCache: false,
        isStale: false,
        isOffline: false,
      };
    } catch (err) {
      // If network failed and we have any cached data at all, return it
      if (cached.exists && cached.data !== null) {
        return {
          data: cached.data,
          fromCache: true,
          isStale: true,
          isOffline: true,
        };
      }
      throw err;
    }
  }

  /**
   * Invalidate specific key
   */
  public invalidate(key: string): void {
    this.memoryCache.delete(key);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(`${this.STORAGE_PREFIX}${key}`);
    }
    this.stats.entryCount = this.memoryCache.size;
    this.notify({ type: 'invalidate', key });
  }

  /**
   * Invalidate all keys associated with a tag (e.g., 'products', 'categories')
   */
  public invalidateByTag(tag: string): void {
    const keysToRemove: string[] = [];

    this.memoryCache.forEach((entry, key) => {
      if (entry.tag === tag) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach((k) => {
      this.memoryCache.delete(k);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(`${this.STORAGE_PREFIX}${k}`);
      }
    });

    // Also scan localStorage in case memory cache was unloaded
    if (typeof window !== 'undefined' && window.localStorage) {
      const storageKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.STORAGE_PREFIX)) {
          const raw = localStorage.getItem(k);
          if (raw) {
            try {
              const entry = JSON.parse(raw);
              if (entry.tag === tag) {
                storageKeys.push(k);
              }
            } catch {
              // ignore
            }
          }
        }
      }
      storageKeys.forEach((k) => localStorage.removeItem(k));
    }

    this.stats.entryCount = this.memoryCache.size;
    this.notify({ type: 'invalidate', key: `tag:${tag}`, tag });
  }

  /**
   * Clear all cached API entries
   */
  public clear(): void {
    this.memoryCache.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.STORAGE_PREFIX)) {
          toRemove.push(k);
        }
      }
      toRemove.forEach((k) => localStorage.removeItem(k));
    }
    this.stats.entryCount = 0;
    this.notify({ type: 'invalidate', key: '*' });
  }

  /**
   * Remove expired items from LocalStorage to free up storage space
   */
  private pruneExpiredEntries(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const now = Date.now();
    const toRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(this.STORAGE_PREFIX)) {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            const entry = JSON.parse(raw);
            if (now - entry.timestamp > entry.ttl * 2) {
              toRemove.push(k);
            }
          } catch {
            toRemove.push(k);
          }
        }
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  }

  /**
   * Subscribe to cache updates
   */
  public subscribe(listener: CacheListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(event: { type: 'set' | 'invalidate' | 'revalidate'; key: string; tag?: string }): void {
    this.listeners.forEach((l) => {
      try {
        l(event);
      } catch (err) {
        console.error('Error in cache listener:', err);
      }
    });
  }

  /**
   * Return current telemetry and health stats
   */
  public getStats(): CacheStats {
    return {
      ...this.stats,
      entryCount: this.memoryCache.size,
      isOffline: this.isOffline(),
    };
  }
}

export const apiCacheService = new ApiCacheService();
