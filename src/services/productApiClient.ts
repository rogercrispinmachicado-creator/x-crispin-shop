/**
 * X-CRISPIN — SHOP THE X
 * Intelligent Cached Product & Category API Client
 * 
 * Provides an asynchronous API facade with built-in:
 * - Stale-While-Revalidate caching
 * - Offline navigation support
 * - Cache key normalization & query memoization
 * - Automatic cache invalidation on mutations
 */

import { Product, Category, ProductVariant } from '../types';
import { productService, ProductFilters } from './productService';
import { storage } from './storage';
import { apiCacheService } from './apiCacheService';
import { cacheService } from './cacheService';
import {
  getInitialPersistentCategories,
  getInitialPersistentProducts,
} from '../hooks/usePersistentData';

export interface CacheableQueryOptions {
  forceRefresh?: boolean;
  ttl?: number;
}

export interface CachedApiResponse<T> {
  data: T;
  fromCache: boolean;
  isStale: boolean;
  isOffline: boolean;
  timestamp: number;
}

// Default TTLs (in milliseconds)
export const CACHE_TTL = {
  PRODUCTS_LIST: 5 * 60 * 1000,    // 5 minutes
  PRODUCT_DETAIL: 5 * 60 * 1000,   // 5 minutes
  CATEGORIES: 15 * 60 * 1000,      // 15 minutes
  FEATURED: 10 * 60 * 1000,        // 10 minutes
};

export const productApiClient = {
  /**
   * Fetch products with intelligent caching & offline support
   */
  getProducts: async (
    filters?: ProductFilters,
    options: CacheableQueryOptions = {}
  ): Promise<CachedApiResponse<Product[]>> => {
    try {
      const result = await cacheService.getProducts(filters, {
        ttl: options.ttl || CACHE_TTL.PRODUCTS_LIST,
        forceRefresh: options.forceRefresh,
      });

      return {
        data: result.data,
        fromCache: result.fromCache,
        isStale: result.isStale,
        isOffline: result.isOffline,
        timestamp: result.timestamp,
      };
    } catch (err) {
      // Fallback a recuperación instantánea de productos en caché/persistencia
      const fallback = cacheService.getInstantProducts(filters);
      return {
        data: fallback.length > 0 ? fallback : productService.getAll(filters),
        fromCache: true,
        isStale: true,
        isOffline: true,
        timestamp: Date.now(),
      };
    }
  },

  /**
   * Fetch single product by slug with intelligent caching
   */
  getProductBySlug: async (
    slug: string,
    options: CacheableQueryOptions = {}
  ): Promise<CachedApiResponse<Product | null>> => {
    try {
      const result = await cacheService.getProductBySlug(slug, {
        ttl: options.ttl || CACHE_TTL.PRODUCT_DETAIL,
        forceRefresh: options.forceRefresh,
      });

      return {
        data: result.data,
        fromCache: result.fromCache,
        isStale: result.isStale,
        isOffline: result.isOffline,
        timestamp: result.timestamp,
      };
    } catch (err) {
      const fallback = cacheService.getInstantProductBySlug(slug);
      return {
        data: fallback,
        fromCache: true,
        isStale: true,
        isOffline: true,
        timestamp: Date.now(),
      };
    }
  },

  /**
   * Fetch single product by ID
   */
  getProductById: async (
    id: string,
    options: CacheableQueryOptions = {}
  ): Promise<CachedApiResponse<Product | null>> => {
    const cacheKey = apiCacheService.buildKey(`api/products/id/${id}`);
    const ttl = options.ttl || CACHE_TTL.PRODUCT_DETAIL;

    const result = await apiCacheService.getOrFetch<Product | null>(
      cacheKey,
      async () => {
        const prod = productService.getById(id);
        return prod || null;
      },
      {
        ttl,
        tag: 'products',
        forceRefresh: options.forceRefresh,
      }
    );

    return {
      data: result.data,
      fromCache: result.fromCache,
      isStale: result.isStale,
      isOffline: result.isOffline,
      timestamp: Date.now(),
    };
  },

  /**
   * Fetch categories with intelligent caching & offline support
   */
  getCategories: async (
    options: CacheableQueryOptions = {}
  ): Promise<CachedApiResponse<Category[]>> => {
    try {
      const result = await cacheService.getCategories({
        ttl: options.ttl || CACHE_TTL.CATEGORIES,
        forceRefresh: options.forceRefresh,
      });

      return {
        data: result.data,
        fromCache: result.fromCache,
        isStale: result.isStale,
        isOffline: result.isOffline,
        timestamp: result.timestamp,
      };
    } catch (err) {
      const fallback = cacheService.getInstantCategories();
      return {
        data: fallback.length > 0 ? fallback : storage.getCategories(),
        fromCache: true,
        isStale: true,
        isOffline: true,
        timestamp: Date.now(),
      };
    }
  },

  /**
   * Fetch featured products
   */
  getFeatured: async (
    limit: number = 4,
    options: CacheableQueryOptions = {}
  ): Promise<CachedApiResponse<Product[]>> => {
    const cacheKey = apiCacheService.buildKey('api/products/featured', { limit });
    const ttl = options.ttl || CACHE_TTL.FEATURED;

    const result = await apiCacheService.getOrFetch<Product[]>(
      cacheKey,
      async () => {
        return productService.getFeatured(limit);
      },
      {
        ttl,
        tag: 'products',
        forceRefresh: options.forceRefresh,
      }
    );

    return {
      data: result.data,
      fromCache: result.fromCache,
      isStale: result.isStale,
      isOffline: result.isOffline,
      timestamp: Date.now(),
    };
  },

  /**
   * Fetch best-selling products (más vendidos) with intelligent caching & offline support
   */
  getBestSellers: async (
    limit: number = 6,
    options: CacheableQueryOptions = {}
  ): Promise<CachedApiResponse<Product[]>> => {
    const cacheKey = apiCacheService.buildKey('api/products/bestsellers', { limit });
    const ttl = options.ttl || CACHE_TTL.PRODUCTS_LIST;

    try {
      const result = await apiCacheService.getOrFetch<Product[]>(
        cacheKey,
        async () => {
          return productService.getBestSellers(limit);
        },
        {
          ttl,
          tag: 'products',
          forceRefresh: options.forceRefresh,
        }
      );

      return {
        data: result.data,
        fromCache: result.fromCache,
        isStale: result.isStale,
        isOffline: result.isOffline,
        timestamp: Date.now(),
      };
    } catch (err) {
      const fallback = getInitialPersistentProducts().slice(0, limit);
      return {
        data: fallback.length > 0 ? fallback : productService.getBestSellers(limit),
        fromCache: true,
        isStale: true,
        isOffline: true,
        timestamp: Date.now(),
      };
    }
  },

  /**
   * Fetch deal/promotional products
   */
  getDeals: async (
    limit: number = 4,
    options: CacheableQueryOptions = {}
  ): Promise<CachedApiResponse<Product[]>> => {
    const cacheKey = apiCacheService.buildKey('api/products/deals', { limit });
    const ttl = options.ttl || CACHE_TTL.FEATURED;

    const result = await apiCacheService.getOrFetch<Product[]>(
      cacheKey,
      async () => {
        return productService.getDeals(limit);
      },
      {
        ttl,
        tag: 'products',
        forceRefresh: options.forceRefresh,
      }
    );

    return {
      data: result.data,
      fromCache: result.fromCache,
      isStale: result.isStale,
      isOffline: result.isOffline,
      timestamp: Date.now(),
    };
  },

  /**
   * Fetch new arrival products
   */
  getNewArrivals: async (
    limit: number = 4,
    options: CacheableQueryOptions = {}
  ): Promise<CachedApiResponse<Product[]>> => {
    const cacheKey = apiCacheService.buildKey('api/products/new-arrivals', { limit });
    const ttl = options.ttl || CACHE_TTL.FEATURED;

    const result = await apiCacheService.getOrFetch<Product[]>(
      cacheKey,
      async () => {
        return productService.getNewArrivals(limit);
      },
      {
        ttl,
        tag: 'products',
        forceRefresh: options.forceRefresh,
      }
    );

    return {
      data: result.data,
      fromCache: result.fromCache,
      isStale: result.isStale,
      isOffline: result.isOffline,
      timestamp: Date.now(),
    };
  },

  /**
   * Save or update product and automatically invalidate cached product lists
   */
  saveOrUpdateProduct: (product: Partial<Product> & { nombre: string; precio: number }): Product => {
    const saved = productService.saveOrUpdate(product);
    cacheService.updateSingleProduct(saved);
    cacheService.invalidateProducts();
    apiCacheService.invalidateByTag('products');
    return saved;
  },

  /**
   * Delete product and invalidate cached lists
   */
  deleteProduct: (id: string): void => {
    productService.delete(id);
    cacheService.invalidateProducts();
    apiCacheService.invalidateByTag('products');
  },

  /**
   * Explicitly invalidate products cache
   */
  invalidateProductsCache: (): void => {
    cacheService.invalidateProducts();
    apiCacheService.invalidateByTag('products');
  },

  /**
   * Explicitly invalidate categories cache
   */
  invalidateCategoriesCache: (): void => {
    cacheService.invalidateCategories();
    apiCacheService.invalidateByTag('categories');
  },

  /**
   * Purge all caches
   */
  clearAllCache: (): void => {
    cacheService.clear();
    apiCacheService.clear();
  },

  /**
   * Calculate stock available
   */
  calculateStockAvailable: (product: Product, variant?: ProductVariant): number => {
    return productService.calculateStockAvailable(product, variant);
  },
};
