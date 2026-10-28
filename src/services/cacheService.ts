/**
 * X-CRISPIN — SHOP THE X
 * Centralized Cache Service (src/services/cacheService.ts)
 * 
 * Centralized cache service integrating 'localStorage' with multi-tier architecture:
 * - L1: High-speed Memory Cache (0ms instant access)
 * - L2: Persistent LocalStorage Cache (instant render on fresh page loads / reloads)
 * - Stale-While-Revalidate (SWR): Immediate cached response + non-blocking background revalidation
 * - In-flight Request Deduplication: Multiple components asking for products reuse the same background revalidation promise
 * - Reactive Pub/Sub Subscriptions: Automatically updates UI components when fresh data arrives
 * - Multi-Tab Synchronization: Syncs changes between tabs via StorageEvent
 * - Offline Resilient: Graceful fallback to cached catalogs when network is interrupted
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, Category } from '../types';
import { storage } from './storage';
import { productService, ProductFilters } from './productService';
import { FACTOR_X_PRODUCTS, FACTOR_X_CATEGORIES } from '../data/factorXProducts';

export interface CacheEnvelope<T> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number; // in milliseconds
  version: string;
  checksum?: string;
}

export interface CacheOptions {
  forceRefresh?: boolean;
  ttl?: number;
  backgroundRevalidate?: boolean;
  tag?: string;
}

export interface CacheResult<T> {
  data: T;
  fromCache: boolean;
  isStale: boolean;
  isOffline: boolean;
  timestamp: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  revalidations: number;
  lastValidated: number | null;
  productsCount: number;
  categoriesCount: number;
  isOffline: boolean;
  storageSizeBytes: number;
}

export type CacheEventType =
  | 'products_updated'
  | 'categories_updated'
  | 'product_detail_updated'
  | 'cache_invalidated'
  | 'cache_cleared'
  | 'revalidation_started'
  | 'revalidation_completed';

export interface CacheEvent {
  type: CacheEventType;
  tag: 'products' | 'categories' | 'all' | 'product_detail';
  timestamp: number;
  key?: string;
}

export type CacheListener = (event: CacheEvent) => void;

// Storage Keys
export const CACHE_STORAGE_KEYS = {
  PRODUCTS: 'xc_cache_products_v2',
  CATEGORIES: 'xc_cache_categories_v2',
  PRODUCT_PREFIX: 'xc_cache_prod_',
  METADATA: 'xc_cache_metadata_v2',
  // Legacy / cross-sync keys for seamless interop
  LEGACY_BESTSELLERS: 'bestSellingProducts',
  LEGACY_CATEGORIES: 'categories',
} as const;

// Default TTLs (in milliseconds)
export const DEFAULT_CACHE_TTL = {
  PRODUCTS: 5 * 60 * 1000,    // 5 minutes
  CATEGORIES: 15 * 60 * 1000,  // 15 minutes
  PRODUCT_DETAIL: 5 * 60 * 1000,
};

const CACHE_VERSION = '2.1.0';

export class CacheService {
  // L1 In-Memory Cache
  private memoryCache = new Map<string, CacheEnvelope<unknown>>();

  // Active in-flight background promises to avoid duplicate requests
  private inFlightRevalidations = new Map<string, Promise<unknown>>();

  // Registered listeners
  private listeners: Set<CacheListener> = new Set();

  // Statistics
  private hits = 0;
  private misses = 0;
  private revalidationsCount = 0;
  private lastValidatedTime: number | null = null;

  constructor() {
    this.hydrateFromStorage();
    this.initStorageEventListener();
    this.initNetworkListeners();
  }

  // =========================================================================
  // INITIALIZATION & HYDRATION
  // =========================================================================

  /**
   * Hydrates in-memory cache immediately from localStorage
   */
  private hydrateFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      // 1. Hydrate Products
      const cachedProducts = this.readFromLocalStorage<Product[]>(CACHE_STORAGE_KEYS.PRODUCTS);
      if (cachedProducts && cachedProducts.data && Array.isArray(cachedProducts.data) && cachedProducts.data.length > 0) {
        this.memoryCache.set(CACHE_STORAGE_KEYS.PRODUCTS, cachedProducts);
        if (!this.lastValidatedTime || cachedProducts.timestamp > this.lastValidatedTime) {
          this.lastValidatedTime = cachedProducts.timestamp;
        }
      } else {
        // Fallback check legacy keys
        const legacyProds = localStorage.getItem(CACHE_STORAGE_KEYS.LEGACY_BESTSELLERS);
        if (legacyProds) {
          try {
            const parsed = JSON.parse(legacyProds);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const envelope: CacheEnvelope<Product[]> = {
                key: CACHE_STORAGE_KEYS.PRODUCTS,
                data: parsed,
                timestamp: Date.now() - 60000, // mark slightly stale to trigger revalidation
                ttl: DEFAULT_CACHE_TTL.PRODUCTS,
                version: CACHE_VERSION,
              };
              this.memoryCache.set(CACHE_STORAGE_KEYS.PRODUCTS, envelope);
              this.writeToLocalStorage(CACHE_STORAGE_KEYS.PRODUCTS, envelope);
            }
          } catch {
            // Ignore legacy parse error
          }
        }
      }

      // 2. Hydrate Categories
      const cachedCategories = this.readFromLocalStorage<Category[]>(CACHE_STORAGE_KEYS.CATEGORIES);
      if (cachedCategories && cachedCategories.data && Array.isArray(cachedCategories.data) && cachedCategories.data.length > 0) {
        this.memoryCache.set(CACHE_STORAGE_KEYS.CATEGORIES, cachedCategories);
      } else {
        const legacyCats = localStorage.getItem(CACHE_STORAGE_KEYS.LEGACY_CATEGORIES);
        if (legacyCats) {
          try {
            const parsed = JSON.parse(legacyCats);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const envelope: CacheEnvelope<Category[]> = {
                key: CACHE_STORAGE_KEYS.CATEGORIES,
                data: parsed,
                timestamp: Date.now() - 60000,
                ttl: DEFAULT_CACHE_TTL.CATEGORIES,
                version: CACHE_VERSION,
              };
              this.memoryCache.set(CACHE_STORAGE_KEYS.CATEGORIES, envelope);
              this.writeToLocalStorage(CACHE_STORAGE_KEYS.CATEGORIES, envelope);
            }
          } catch {
            // Ignore legacy parse error
          }
        }
      }

      // 3. Hydrate Metadata
      const meta = localStorage.getItem(CACHE_STORAGE_KEYS.METADATA);
      if (meta) {
        try {
          const parsed = JSON.parse(meta);
          if (parsed && parsed.lastValidated) {
            this.lastValidatedTime = parsed.lastValidated;
          }
        } catch {}
      }
    } catch (err) {
      console.warn('[CacheService] Hydration warning:', err);
    }
  }

  /**
   * Listen for changes from other tabs via StorageEvent
   */
  private initStorageEventListener(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('storage', (event: StorageEvent) => {
      if (!event.key) return;

      if (event.key === CACHE_STORAGE_KEYS.PRODUCTS || event.key === 'xc_products') {
        const fresh = this.readFromLocalStorage<Product[]>(CACHE_STORAGE_KEYS.PRODUCTS);
        if (fresh) {
          this.memoryCache.set(CACHE_STORAGE_KEYS.PRODUCTS, fresh);
          this.notify({ type: 'products_updated', tag: 'products', timestamp: Date.now() });
        }
      } else if (event.key === CACHE_STORAGE_KEYS.CATEGORIES || event.key === 'xc_categories') {
        const fresh = this.readFromLocalStorage<Category[]>(CACHE_STORAGE_KEYS.CATEGORIES);
        if (fresh) {
          this.memoryCache.set(CACHE_STORAGE_KEYS.CATEGORIES, fresh);
          this.notify({ type: 'categories_updated', tag: 'categories', timestamp: Date.now() });
        }
      }
    });

    // Listen to custom in-app storage mutations (e.g. from admin updates)
    window.addEventListener('xc_products_mutation', ((event: CustomEvent<Product[]>) => {
      if (event.detail && Array.isArray(event.detail)) {
        this.setProducts(event.detail);
      }
    }) as EventListener);

    window.addEventListener('xc_categories_mutation', ((event: CustomEvent<Category[]>) => {
      if (event.detail && Array.isArray(event.detail)) {
        this.setCategories(event.detail);
      }
    }) as EventListener);
  }

  /**
   * Listen for online/offline events to trigger background revalidations when connection is restored
   */
  private initNetworkListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.revalidateAll().catch((err) => {
        console.warn('[CacheService] Background revalidation after reconnect error:', err);
      });
    });
  }

  // =========================================================================
  // LOCALSTORAGE HELPERS WITH QUOTA HANDLING & SAFETY
  // =========================================================================

  private readFromLocalStorage<T>(key: string): CacheEnvelope<T> | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CacheEnvelope<T>;
      if (!parsed || !parsed.data) return null;
      return parsed;
    } catch (err) {
      console.warn(`[CacheService] Failed reading key "${key}" from localStorage:`, err);
      return null;
    }
  }

  private writeToLocalStorage<T>(key: string, envelope: CacheEnvelope<T>): boolean {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    try {
      localStorage.setItem(key, JSON.stringify(envelope));
      return true;
    } catch (err: any) {
      if (err && (err.name === 'QuotaExceededError' || err.code === 22)) {
        console.warn('[CacheService] Quota exceeded. Pruning old cache entries...');
        this.pruneOldEntries();
        try {
          localStorage.setItem(key, JSON.stringify(envelope));
          return true;
        } catch {
          return false;
        }
      }
      console.warn(`[CacheService] Failed writing key "${key}" to localStorage:`, err);
      return false;
    }
  }

  private pruneOldEntries(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(CACHE_STORAGE_KEYS.PRODUCT_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}
  }

  private saveMetadata(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const meta = {
        lastValidated: this.lastValidatedTime,
        revalidations: this.revalidationsCount,
        version: CACHE_VERSION,
        updatedAt: Date.now(),
      };
      localStorage.setItem(CACHE_STORAGE_KEYS.METADATA, JSON.stringify(meta));
    } catch {}
  }

  // =========================================================================
  // INSTANT SYNCHRONOUS ACCESS (0ms Render on Mount)
  // =========================================================================

  /**
   * Returns products synchronously from cache (Memory or LocalStorage).
   * If not cached yet, initializes and returns fallback products immediately so components never render empty!
   */
  public getInstantProducts(filters?: ProductFilters): Product[] {
    // 1. Check L1 Memory
    const memEntry = this.memoryCache.get(CACHE_STORAGE_KEYS.PRODUCTS) as CacheEnvelope<Product[]> | undefined;
    if (memEntry && Array.isArray(memEntry.data) && memEntry.data.length > 0) {
      this.hits++;
      return this.filterProducts(memEntry.data, filters);
    }

    // 2. Check L2 LocalStorage
    const localEntry = this.readFromLocalStorage<Product[]>(CACHE_STORAGE_KEYS.PRODUCTS);
    if (localEntry && Array.isArray(localEntry.data) && localEntry.data.length > 0) {
      this.memoryCache.set(CACHE_STORAGE_KEYS.PRODUCTS, localEntry);
      this.hits++;
      return this.filterProducts(localEntry.data, filters);
    }

    // 3. Fallback to storage or catalog defaults to ensure 0ms render
    this.misses++;
    const defaultProducts = storage.getProducts();
    const effective = defaultProducts.length > 0 ? defaultProducts : FACTOR_X_PRODUCTS;

    // Cache this initial snapshot immediately
    this.setProducts(effective, DEFAULT_CACHE_TTL.PRODUCTS);
    return this.filterProducts(effective, filters);
  }

  /**
   * Returns categories synchronously from cache (Memory or LocalStorage).
   */
  public getInstantCategories(): Category[] {
    // 1. Check L1 Memory
    const memEntry = this.memoryCache.get(CACHE_STORAGE_KEYS.CATEGORIES) as CacheEnvelope<Category[]> | undefined;
    if (memEntry && Array.isArray(memEntry.data) && memEntry.data.length > 0) {
      this.hits++;
      return memEntry.data;
    }

    // 2. Check L2 LocalStorage
    const localEntry = this.readFromLocalStorage<Category[]>(CACHE_STORAGE_KEYS.CATEGORIES);
    if (localEntry && Array.isArray(localEntry.data) && localEntry.data.length > 0) {
      this.memoryCache.set(CACHE_STORAGE_KEYS.CATEGORIES, localEntry);
      this.hits++;
      return localEntry.data;
    }

    // 3. Fallback to storage or defaults
    this.misses++;
    const defaultCats = storage.getCategories();
    const effective = defaultCats.length > 0 ? defaultCats : FACTOR_X_CATEGORIES;

    this.setCategories(effective, DEFAULT_CACHE_TTL.CATEGORIES);
    return effective;
  }

  /**
   * Returns a single product by slug synchronously from cache
   */
  public getInstantProductBySlug(slug: string): Product | null {
    if (!slug) return null;
    const all = this.getInstantProducts();
    return all.find((p) => p.slug === slug) || null;
  }

  /**
   * Returns a single product by id synchronously from cache
   */
  public getInstantProductById(id: string): Product | null {
    if (!id) return null;
    const all = this.getInstantProducts();
    return all.find((p) => p.id === id) || null;
  }

  // =========================================================================
  // ASYNCHRONOUS STALE-WHILE-REVALIDATE QUERIES (SWR)
  // =========================================================================

  /**
   * Asynchronous products query adhering strictly to Stale-While-Revalidate:
   * 1. Returns cached products immediately if available.
   * 2. If data is stale or forceRefresh is true, asynchronously triggers revalidation in background.
   * 3. When revalidation finishes, components subscribed to CacheService receive the fresh data.
   */
  public async getProducts(
    filters?: ProductFilters,
    options: CacheOptions = {}
  ): Promise<CacheResult<Product[]>> {
    const { forceRefresh = false, ttl = DEFAULT_CACHE_TTL.PRODUCTS, backgroundRevalidate = true } = options;
    const isOffline = this.isOffline();

    // Check existing cache
    let entry = this.memoryCache.get(CACHE_STORAGE_KEYS.PRODUCTS) as CacheEnvelope<Product[]> | undefined;
    if (!entry) {
      entry = this.readFromLocalStorage<Product[]>(CACHE_STORAGE_KEYS.PRODUCTS) || undefined;
      if (entry) {
        this.memoryCache.set(CACHE_STORAGE_KEYS.PRODUCTS, entry);
      }
    }

    const hasCachedData = entry && Array.isArray(entry.data) && entry.data.length > 0;
    const now = Date.now();
    const isStale = !entry || (now - entry.timestamp > (entry.ttl || ttl));

    // Case 1: Force refresh requested and online -> synchronous wait for fresh data
    if (forceRefresh && !isOffline) {
      const freshProducts = await this.revalidateProducts();
      return {
        data: this.filterProducts(freshProducts, filters),
        fromCache: false,
        isStale: false,
        isOffline: false,
        timestamp: Date.now(),
      };
    }

    // Case 2: We have cached data
    if (hasCachedData && entry) {
      this.hits++;
      const filtered = this.filterProducts(entry.data, filters);

      // Trigger asynchronous background revalidation if stale and online
      if (isStale && !isOffline && backgroundRevalidate) {
        this.triggerBackgroundProductsRevalidation();
      }

      return {
        data: filtered,
        fromCache: true,
        isStale,
        isOffline,
        timestamp: entry.timestamp,
      };
    }

    // Case 3: Cache miss -> fetch and store
    this.misses++;
    const fresh = await this.revalidateProducts();
    return {
      data: this.filterProducts(fresh, filters),
      fromCache: false,
      isStale: false,
      isOffline,
      timestamp: Date.now(),
    };
  }

  /**
   * Asynchronous categories query with SWR
   */
  public async getCategories(options: CacheOptions = {}): Promise<CacheResult<Category[]>> {
    const { forceRefresh = false, ttl = DEFAULT_CACHE_TTL.CATEGORIES, backgroundRevalidate = true } = options;
    const isOffline = this.isOffline();

    let entry = this.memoryCache.get(CACHE_STORAGE_KEYS.CATEGORIES) as CacheEnvelope<Category[]> | undefined;
    if (!entry) {
      entry = this.readFromLocalStorage<Category[]>(CACHE_STORAGE_KEYS.CATEGORIES) || undefined;
      if (entry) {
        this.memoryCache.set(CACHE_STORAGE_KEYS.CATEGORIES, entry);
      }
    }

    const hasCachedData = entry && Array.isArray(entry.data) && entry.data.length > 0;
    const now = Date.now();
    const isStale = !entry || (now - entry.timestamp > (entry.ttl || ttl));

    if (forceRefresh && !isOffline) {
      const fresh = await this.revalidateCategories();
      return {
        data: fresh,
        fromCache: false,
        isStale: false,
        isOffline: false,
        timestamp: Date.now(),
      };
    }

    if (hasCachedData && entry) {
      this.hits++;
      if (isStale && !isOffline && backgroundRevalidate) {
        this.triggerBackgroundCategoriesRevalidation();
      }

      return {
        data: entry.data,
        fromCache: true,
        isStale,
        isOffline,
        timestamp: entry.timestamp,
      };
    }

    this.misses++;
    const fresh = await this.revalidateCategories();
    return {
      data: fresh,
      fromCache: false,
      isStale: false,
      isOffline,
      timestamp: Date.now(),
    };
  }

  /**
   * Asynchronous single product query by slug with SWR
   */
  public async getProductBySlug(
    slug: string,
    options: CacheOptions = {}
  ): Promise<CacheResult<Product | null>> {
    const instant = this.getInstantProductBySlug(slug);
    const isOffline = this.isOffline();

    if (instant && !options.forceRefresh) {
      // Trigger background revalidation of catalog if stale
      this.triggerBackgroundProductsRevalidation();
      return {
        data: instant,
        fromCache: true,
        isStale: false,
        isOffline,
        timestamp: Date.now(),
      };
    }

    // Refresh products catalog in background/foreground
    const freshList = await this.revalidateProducts();
    const found = freshList.find((p) => p.slug === slug) || null;

    return {
      data: found,
      fromCache: false,
      isStale: false,
      isOffline,
      timestamp: Date.now(),
    };
  }

  // =========================================================================
  // BACKGROUND REVALIDATION ENGINE (Deduplicated & Non-blocking)
  // =========================================================================

  private triggerBackgroundProductsRevalidation(): void {
    // Non-blocking fire and forget
    Promise.resolve().then(() => {
      this.revalidateProducts().catch((err) => {
        console.warn('[CacheService] Background products revalidation warning:', err);
      });
    });
  }

  private triggerBackgroundCategoriesRevalidation(): void {
    Promise.resolve().then(() => {
      this.revalidateCategories().catch((err) => {
        console.warn('[CacheService] Background categories revalidation warning:', err);
      });
    });
  }

  /**
   * Revalidates products against the authoritative database/storage layer.
   * Deduplicates concurrent revalidation requests.
   */
  public async revalidateProducts(): Promise<Product[]> {
    const IN_FLIGHT_KEY = 'revalidate_products';
    if (this.inFlightRevalidations.has(IN_FLIGHT_KEY)) {
      return this.inFlightRevalidations.get(IN_FLIGHT_KEY) as Promise<Product[]>;
    }

    this.notify({ type: 'revalidation_started', tag: 'products', timestamp: Date.now() });

    const promise = (async () => {
      try {
        // Small async tick to simulate network or I/O boundary
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Authoritative source of products
        const dbProducts = storage.getProducts();
        const freshList = dbProducts.length > 0 ? dbProducts : FACTOR_X_PRODUCTS;

        // Save fresh products to cache
        this.setProducts(freshList, DEFAULT_CACHE_TTL.PRODUCTS);

        this.revalidationsCount++;
        this.lastValidatedTime = Date.now();
        this.saveMetadata();

        this.notify({
          type: 'products_updated',
          tag: 'products',
          timestamp: this.lastValidatedTime,
        });

        return freshList;
      } finally {
        this.inFlightRevalidations.delete(IN_FLIGHT_KEY);
        this.notify({ type: 'revalidation_completed', tag: 'products', timestamp: Date.now() });
      }
    })();

    this.inFlightRevalidations.set(IN_FLIGHT_KEY, promise);
    return promise;
  }

  /**
   * Revalidates categories against authoritative source.
   */
  public async revalidateCategories(): Promise<Category[]> {
    const IN_FLIGHT_KEY = 'revalidate_categories';
    if (this.inFlightRevalidations.has(IN_FLIGHT_KEY)) {
      return this.inFlightRevalidations.get(IN_FLIGHT_KEY) as Promise<Category[]>;
    }

    this.notify({ type: 'revalidation_started', tag: 'categories', timestamp: Date.now() });

    const promise = (async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 50));

        const dbCategories = storage.getCategories();
        const freshList = dbCategories.length > 0 ? dbCategories : FACTOR_X_CATEGORIES;

        this.setCategories(freshList, DEFAULT_CACHE_TTL.CATEGORIES);

        this.revalidationsCount++;
        this.lastValidatedTime = Date.now();
        this.saveMetadata();

        this.notify({
          type: 'categories_updated',
          tag: 'categories',
          timestamp: this.lastValidatedTime,
        });

        return freshList;
      } finally {
        this.inFlightRevalidations.delete(IN_FLIGHT_KEY);
        this.notify({ type: 'revalidation_completed', tag: 'categories', timestamp: Date.now() });
      }
    })();

    this.inFlightRevalidations.set(IN_FLIGHT_KEY, promise);
    return promise;
  }

  /**
   * Revalidates both products and categories in background
   */
  public async revalidateAll(): Promise<{ products: Product[]; categories: Category[] }> {
    const [products, categories] = await Promise.all([
      this.revalidateProducts(),
      this.revalidateCategories(),
    ]);
    return { products, categories };
  }

  // =========================================================================
  // MUTATIONS & DIRECT CACHE UPDATES
  // =========================================================================

  /**
   * Stores products in Memory and LocalStorage, keeping legacy keys synchronized
   */
  public setProducts(products: Product[], ttl: number = DEFAULT_CACHE_TTL.PRODUCTS): void {
    if (!Array.isArray(products)) return;

    const envelope: CacheEnvelope<Product[]> = {
      key: CACHE_STORAGE_KEYS.PRODUCTS,
      data: products,
      timestamp: Date.now(),
      ttl,
      version: CACHE_VERSION,
    };

    // 1. L1 Memory
    this.memoryCache.set(CACHE_STORAGE_KEYS.PRODUCTS, envelope);

    // 2. L2 LocalStorage
    this.writeToLocalStorage(CACHE_STORAGE_KEYS.PRODUCTS, envelope);

    // 3. Synchronize cross-compatible keys
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const bestSellers = products.filter((p) => p.estado === 'DESTACADO' || (p.descuento && p.descuento > 0)).slice(0, 8);
        localStorage.setItem(
          CACHE_STORAGE_KEYS.LEGACY_BESTSELLERS,
          JSON.stringify(bestSellers.length > 0 ? bestSellers : products.slice(0, 6))
        );
      }
    } catch {}

    this.notify({ type: 'products_updated', tag: 'products', timestamp: envelope.timestamp });
  }

  /**
   * Stores categories in Memory and LocalStorage
   */
  public setCategories(categories: Category[], ttl: number = DEFAULT_CACHE_TTL.CATEGORIES): void {
    if (!Array.isArray(categories)) return;

    const envelope: CacheEnvelope<Category[]> = {
      key: CACHE_STORAGE_KEYS.CATEGORIES,
      data: categories,
      timestamp: Date.now(),
      ttl,
      version: CACHE_VERSION,
    };

    this.memoryCache.set(CACHE_STORAGE_KEYS.CATEGORIES, envelope);
    this.writeToLocalStorage(CACHE_STORAGE_KEYS.CATEGORIES, envelope);

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(CACHE_STORAGE_KEYS.LEGACY_CATEGORIES, JSON.stringify(categories));
      }
    } catch {}

    this.notify({ type: 'categories_updated', tag: 'categories', timestamp: envelope.timestamp });
  }

  /**
   * Updates or inserts a single product in the cache
   */
  public updateSingleProduct(product: Product): void {
    if (!product || !product.id) return;

    const current = this.getInstantProducts();
    const index = current.findIndex((p) => p.id === product.id);
    let updated: Product[];

    if (index >= 0) {
      updated = [...current];
      updated[index] = product;
    } else {
      updated = [product, ...current];
    }

    this.setProducts(updated);
    this.notify({
      type: 'product_detail_updated',
      tag: 'product_detail',
      key: product.slug,
      timestamp: Date.now(),
    });
  }

  /**
   * Invalidate products cache
   */
  public invalidateProducts(): void {
    this.memoryCache.delete(CACHE_STORAGE_KEYS.PRODUCTS);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(CACHE_STORAGE_KEYS.PRODUCTS);
      } catch {}
    }
    this.notify({ type: 'cache_invalidated', tag: 'products', timestamp: Date.now() });
  }

  /**
   * Invalidate categories cache
   */
  public invalidateCategories(): void {
    this.memoryCache.delete(CACHE_STORAGE_KEYS.CATEGORIES);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(CACHE_STORAGE_KEYS.CATEGORIES);
      } catch {}
    }
    this.notify({ type: 'cache_invalidated', tag: 'categories', timestamp: Date.now() });
  }

  /**
   * Completely clear all cache entries
   */
  public clear(): void {
    this.memoryCache.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(CACHE_STORAGE_KEYS.PRODUCTS);
        localStorage.removeItem(CACHE_STORAGE_KEYS.CATEGORIES);
        localStorage.removeItem(CACHE_STORAGE_KEYS.METADATA);
        this.pruneOldEntries();
      } catch {}
    }
    this.hits = 0;
    this.misses = 0;
    this.notify({ type: 'cache_cleared', tag: 'all', timestamp: Date.now() });
  }

  // =========================================================================
  // PUBSUB EVENT SUBSCRIBERS
  // =========================================================================

  /**
   * Subscribe to cache updates (products updated, categories updated, revalidations)
   */
  public subscribe(listener: CacheListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(event: CacheEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[CacheService] Error in cache subscriber:', err);
      }
    });
  }

  // =========================================================================
  // OBSERVABILITY & UTILITIES
  // =========================================================================

  public isOffline(): boolean {
    return typeof navigator !== 'undefined' ? !navigator.onLine : false;
  }

  public getStats(): CacheStats {
    let storageSizeBytes = 0;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const prodRaw = localStorage.getItem(CACHE_STORAGE_KEYS.PRODUCTS) || '';
        const catRaw = localStorage.getItem(CACHE_STORAGE_KEYS.CATEGORIES) || '';
        storageSizeBytes = (prodRaw.length + catRaw.length) * 2; // UTF-16 approx 2 bytes
      } catch {}
    }

    const products = this.getInstantProducts();
    const categories = this.getInstantCategories();

    return {
      hits: this.hits,
      misses: this.misses,
      revalidations: this.revalidationsCount,
      lastValidated: this.lastValidatedTime,
      productsCount: products.length,
      categoriesCount: categories.length,
      isOffline: this.isOffline(),
      storageSizeBytes,
    };
  }

  /**
   * Applies client-side filtering and sorting to an array of products
   */
  private filterProducts(products: Product[], filters?: ProductFilters): Product[] {
    if (!filters) return products;
    return productService.getAll(filters);
  }
}

// Singleton centralized instance
export const cacheService = new CacheService();

// =========================================================================
// REACT HOOKS FOR INSTANT CONSUMPTION IN UI COMPONENTS
// =========================================================================

export interface UseCachedProductsResult {
  products: Product[];
  loading: boolean;
  isRevalidating: boolean;
  fromCache: boolean;
  isOffline: boolean;
  error: Error | null;
  lastUpdated: number;
  refresh: () => Promise<void>;
}

/**
 * React Hook for instant retrieval of products with background revalidation (SWR)
 */
export function useCachedProducts(
  filters?: ProductFilters,
  options: CacheOptions = {}
): UseCachedProductsResult {
  const [products, setProducts] = useState<Product[]>(() => cacheService.getInstantProducts(filters));
  const [loading, setLoading] = useState<boolean>(() => products.length === 0);
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);
  const [fromCache, setFromCache] = useState<boolean>(() => products.length > 0);
  const [isOffline, setIsOffline] = useState<boolean>(() => cacheService.isOffline());
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      if (products.length === 0) {
        setLoading(true);
      } else {
        setIsRevalidating(true);
      }

      const res = await cacheService.getProducts(filtersRef.current, {
        ...options,
        forceRefresh,
      });

      setProducts(res.data);
      setFromCache(res.fromCache);
      setIsOffline(res.isOffline);
      setLastUpdated(res.timestamp);
      setError(null);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
      setIsRevalidating(false);
    }
  }, [options, products.length]);

  useEffect(() => {
    loadData(false);
  }, [
    loadData,
    filters?.categoriaId,
    filters?.subcategoriaId,
    filters?.busqueda,
    filters?.minPrecio,
    filters?.maxPrecio,
    filters?.soloEnStock,
    filters?.soloOfertas,
    filters?.soloNuevos,
    filters?.orden,
  ]);

  useEffect(() => {
    const unsub = cacheService.subscribe((event) => {
      if (event.tag === 'products' || event.tag === 'all') {
        const fresh = cacheService.getInstantProducts(filtersRef.current);
        setProducts(fresh);
        setFromCache(true);
        setLastUpdated(Date.now());
      }
    });
    return unsub;
  }, []);

  const refresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  return {
    products,
    loading,
    isRevalidating,
    fromCache,
    isOffline,
    error,
    lastUpdated,
    refresh,
  };
}

export interface UseCachedCategoriesResult {
  categories: Category[];
  loading: boolean;
  isRevalidating: boolean;
  fromCache: boolean;
  isOffline: boolean;
  error: Error | null;
  lastUpdated: number;
  refresh: () => Promise<void>;
}

/**
 * React Hook for instant retrieval of categories with background revalidation (SWR)
 */
export function useCachedCategories(options: CacheOptions = {}): UseCachedCategoriesResult {
  const [categories, setCategories] = useState<Category[]>(() => cacheService.getInstantCategories());
  const [loading, setLoading] = useState<boolean>(() => categories.length === 0);
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);
  const [fromCache, setFromCache] = useState<boolean>(() => categories.length > 0);
  const [isOffline, setIsOffline] = useState<boolean>(() => cacheService.isOffline());
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      if (categories.length === 0) {
        setLoading(true);
      } else {
        setIsRevalidating(true);
      }

      const res = await cacheService.getCategories({
        ...options,
        forceRefresh,
      });

      setCategories(res.data);
      setFromCache(res.fromCache);
      setIsOffline(res.isOffline);
      setLastUpdated(res.timestamp);
      setError(null);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
      setIsRevalidating(false);
    }
  }, [options, categories.length]);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  useEffect(() => {
    const unsub = cacheService.subscribe((event) => {
      if (event.tag === 'categories' || event.tag === 'all') {
        const fresh = cacheService.getInstantCategories();
        setCategories(fresh);
        setFromCache(true);
        setLastUpdated(Date.now());
      }
    });
    return unsub;
  }, []);

  const refresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  return {
    categories,
    loading,
    isRevalidating,
    fromCache,
    isOffline,
    error,
    lastUpdated,
    refresh,
  };
}

export interface UseCachedProductResult {
  product: Product | null;
  loading: boolean;
  isRevalidating: boolean;
  fromCache: boolean;
  isOffline: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * React Hook for instant retrieval of single product detail by slug
 */
export function useCachedProduct(
  slug: string,
  options: CacheOptions = {}
): UseCachedProductResult {
  const [product, setProduct] = useState<Product | null>(() => cacheService.getInstantProductBySlug(slug));
  const [loading, setLoading] = useState<boolean>(() => !product);
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);
  const [fromCache, setFromCache] = useState<boolean>(() => Boolean(product));
  const [isOffline, setIsOffline] = useState<boolean>(() => cacheService.isOffline());
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async (forceRefresh = false) => {
    if (!slug) return;
    try {
      if (!product) {
        setLoading(true);
      } else {
        setIsRevalidating(true);
      }

      const res = await cacheService.getProductBySlug(slug, {
        ...options,
        forceRefresh,
      });

      setProduct(res.data);
      setFromCache(res.fromCache);
      setIsOffline(res.isOffline);
      setError(null);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
      setIsRevalidating(false);
    }
  }, [slug, options, product]);

  useEffect(() => {
    loadData(false);
  }, [loadData, slug]);

  useEffect(() => {
    const unsub = cacheService.subscribe((event) => {
      if (
        event.tag === 'products' ||
        event.tag === 'all' ||
        (event.tag === 'product_detail' && event.key === slug)
      ) {
        const fresh = cacheService.getInstantProductBySlug(slug);
        if (fresh) {
          setProduct(fresh);
          setFromCache(true);
        }
      }
    });
    return unsub;
  }, [slug]);

  const refresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  return {
    product,
    loading,
    isRevalidating,
    fromCache,
    isOffline,
    error,
    refresh,
  };
}

