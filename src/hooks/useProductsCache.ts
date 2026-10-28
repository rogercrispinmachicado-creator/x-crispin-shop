import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, Category } from '../types';
import { ProductFilters } from '../services/productService';
import { productApiClient, CacheableQueryOptions } from '../services/productApiClient';
import { apiCacheService, CacheStats } from '../services/apiCacheService';
import { cacheService } from '../services/cacheService';
import { useNetworkStatus } from './useNetworkStatus';
import {
  usePersistentData,
  getInitialPersistentCategories,
  getInitialPersistentProducts,
} from './usePersistentData';

export interface UseProductsCacheResult {
  products: Product[];
  loading: boolean;
  isRevalidating: boolean;
  fromCache: boolean;
  isOffline: boolean;
  error: Error | null;
  lastUpdated: number;
  refresh: () => Promise<void>;
}

export interface UseCategoriesCacheResult {
  categories: Category[];
  loading: boolean;
  isRevalidating: boolean;
  fromCache: boolean;
  isOffline: boolean;
  error: Error | null;
  lastUpdated: number;
  refresh: () => Promise<void>;
}

export interface UseProductDetailCacheResult {
  product: Product | null;
  loading: boolean;
  isRevalidating: boolean;
  fromCache: boolean;
  isOffline: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Hook reactivo para consultar productos con caché SWR y soporte offline inteligente
 * Utiliza cacheService centralizado para asegurar un estado inicial instantáneo (0ms) desde localStorage.
 */
export const useProductsCache = (
  filters?: ProductFilters,
  options: CacheableQueryOptions = {}
): UseProductsCacheResult => {
  const persistent = usePersistentData({ autoFetch: false });
  const hasSpecificFilter = Boolean(
    filters?.categoriaId ||
    filters?.busqueda ||
    filters?.minPrecio !== undefined ||
    filters?.maxPrecio !== undefined ||
    filters?.soloEnStock ||
    filters?.soloOfertas ||
    filters?.soloNuevos
  );

  // Inicialización instantánea a 0ms desde cacheService (Memory / LocalStorage)
  const [products, setProducts] = useState<Product[]>(() => {
    const cached = cacheService.getInstantProducts(filters);
    if (cached.length > 0) {
      return cached;
    }
    if (!hasSpecificFilter) {
      if (persistent.bestSellingProducts.length > 0) {
        return persistent.bestSellingProducts;
      }
      return getInitialPersistentProducts();
    }
    return [];
  });

  const [loading, setLoading] = useState<boolean>(() => products.length === 0);
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);
  const [fromCache, setFromCache] = useState<boolean>(() => products.length > 0);
  const [isOffline, setIsOffline] = useState<boolean>(() => cacheService.isOffline());
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const network = useNetworkStatus();

  // Keep ref to avoid stale closures in cache subscriber
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Sincronizar si se reciben productos más vendidos desde persistencia
  useEffect(() => {
    if (!hasSpecificFilter && products.length === 0 && persistent.bestSellingProducts.length > 0) {
      setProducts(persistent.bestSellingProducts);
      setLoading(false);
      setFromCache(true);
    }
  }, [hasSpecificFilter, persistent.bestSellingProducts, products.length]);

  const loadData = useCallback(
    async (forceRefresh = false) => {
      try {
        if (!fromCache && products.length === 0) {
          setLoading(true);
        } else {
          setIsRevalidating(true);
        }

        const res = await productApiClient.getProducts(filtersRef.current, {
          ...options,
          forceRefresh,
        });

        setProducts(res.data);
        setFromCache(res.fromCache);
        setIsOffline(res.isOffline);
        setLastUpdated(res.timestamp);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        const fallback = cacheService.getInstantProducts(filtersRef.current);
        if (fallback.length > 0) {
          setProducts(fallback);
          setFromCache(true);
        }
      } finally {
        setLoading(false);
        setIsRevalidating(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      filters?.categoriaId,
      filters?.busqueda,
      filters?.minPrecio,
      filters?.maxPrecio,
      filters?.soloEnStock,
      filters?.soloOfertas,
      filters?.soloNuevos,
      filters?.orden,
    ]
  );

  // Initial fetch and on filter changes
  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // When coming back online, silently revalidate
  useEffect(() => {
    if (network.isOnline && network.wasOffline) {
      loadData(true);
    }
  }, [network.isOnline, network.wasOffline, loadData]);

  // Listen to cache invalidations or revalidation events from cacheService
  useEffect(() => {
    const unsubCacheService = cacheService.subscribe((event) => {
      if (event.tag === 'products' || event.tag === 'all') {
        const fresh = cacheService.getInstantProducts(filtersRef.current);
        setProducts(fresh);
        setFromCache(true);
        setLastUpdated(Date.now());
      }
    });

    const unsubApiCache = apiCacheService.subscribe((event) => {
      if (event.tag === 'products' || event.key === '*' || event.key.includes('api/products')) {
        loadData(false);
      }
    });

    return () => {
      unsubCacheService();
      unsubApiCache();
    };
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  return {
    products,
    loading,
    isRevalidating,
    fromCache,
    isOffline: !network.isOnline || isOffline,
    error,
    lastUpdated,
    refresh,
  };
};

/**
 * Hook reactivo para consultar categorías con caché centralizado y estado inicial a 0ms
 */
export const useCategoriesCache = (
  options: CacheableQueryOptions = {}
): UseCategoriesCacheResult => {
  const persistent = usePersistentData({ autoFetch: false });

  // Inicialización instantánea a 0ms desde cacheService
  const [categories, setCategories] = useState<Category[]>(() => {
    const cached = cacheService.getInstantCategories();
    if (cached.length > 0) {
      return cached;
    }
    if (persistent.categories.length > 0) {
      return persistent.categories;
    }
    return getInitialPersistentCategories();
  });

  const [loading, setLoading] = useState<boolean>(() => categories.length === 0);
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);
  const [fromCache, setFromCache] = useState<boolean>(() => categories.length > 0);
  const [isOffline, setIsOffline] = useState<boolean>(() => cacheService.isOffline());
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const network = useNetworkStatus();

  useEffect(() => {
    if (categories.length === 0 && persistent.categories.length > 0) {
      setCategories(persistent.categories);
      setLoading(false);
      setFromCache(true);
    }
  }, [persistent.categories, categories.length]);

  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      if (categories.length === 0) {
        setLoading(true);
      } else {
        setIsRevalidating(true);
      }

      const res = await productApiClient.getCategories({
        ...options,
        forceRefresh,
      });

      setCategories(res.data);
      setFromCache(res.fromCache);
      setIsOffline(res.isOffline);
      setLastUpdated(res.timestamp);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      const fallback = cacheService.getInstantCategories();
      if (fallback.length > 0) {
        setCategories(fallback);
        setFromCache(true);
      }
    } finally {
      setLoading(false);
      setIsRevalidating(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistent.categories]);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  useEffect(() => {
    const unsubCacheService = cacheService.subscribe((event) => {
      if (event.tag === 'categories' || event.tag === 'all') {
        const fresh = cacheService.getInstantCategories();
        setCategories(fresh);
        setFromCache(true);
        setLastUpdated(Date.now());
      }
    });

    const unsubApiCache = apiCacheService.subscribe((event) => {
      if (event.tag === 'categories' || event.key === '*' || event.key.includes('api/categories')) {
        loadData(false);
      }
    });

    return () => {
      unsubCacheService();
      unsubApiCache();
    };
  }, [loadData]);

  const refresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  return {
    categories,
    loading,
    isRevalidating,
    fromCache,
    isOffline: !network.isOnline || isOffline,
    error,
    lastUpdated,
    refresh,
  };
};

/**
 * Reactive hook to query a single product by slug with 0ms instant display from cache
 */
export const useProductDetailCache = (
  slug: string,
  options: CacheableQueryOptions = {}
): UseProductDetailCacheResult => {
  // Inicialización inmediata si el producto ya está en el catálogo en caché
  const [product, setProduct] = useState<Product | null>(() => {
    return cacheService.getInstantProductBySlug(slug);
  });
  const [loading, setLoading] = useState<boolean>(() => !product);
  const [isRevalidating, setIsRevalidating] = useState<boolean>(false);
  const [fromCache, setFromCache] = useState<boolean>(() => Boolean(product));
  const [isOffline, setIsOffline] = useState<boolean>(() => cacheService.isOffline());
  const [error, setError] = useState<Error | null>(null);
  const network = useNetworkStatus();

  const loadData = useCallback(
    async (forceRefresh = false) => {
      if (!slug) return;
      try {
        if (!product) {
          setLoading(true);
        } else {
          setIsRevalidating(true);
        }

        const res = await productApiClient.getProductBySlug(slug, {
          ...options,
          forceRefresh,
        });

        setProduct(res.data);
        setFromCache(res.fromCache);
        setIsOffline(res.isOffline);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        const fallback = cacheService.getInstantProductBySlug(slug);
        if (fallback) {
          setProduct(fallback);
          setFromCache(true);
        }
      } finally {
        setLoading(false);
        setIsRevalidating(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slug]
  );

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  useEffect(() => {
    const unsubCacheService = cacheService.subscribe((event) => {
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

    const unsubApiCache = apiCacheService.subscribe((event) => {
      if (event.tag === 'products' || event.key === '*' || event.key.includes(slug)) {
        loadData(false);
      }
    });

    return () => {
      unsubCacheService();
      unsubApiCache();
    };
  }, [loadData, slug]);

  const refresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

  return {
    product,
    loading,
    isRevalidating,
    fromCache,
    isOffline: !network.isOnline || isOffline,
    error,
    refresh,
  };
};

/**
 * Observability hook for cache statistics
 */
export const useCacheStats = (): {
  stats: CacheStats;
  clearCache: () => void;
  syncNow: () => void;
} => {
  const [stats, setStats] = useState<CacheStats>(() => apiCacheService.getStats());

  useEffect(() => {
    const updateStats = () => setStats(apiCacheService.getStats());
    updateStats();

    const unsub = apiCacheService.subscribe(updateStats);
    const unsubCentral = cacheService.subscribe(updateStats);
    const interval = setInterval(updateStats, 10_000);

    return () => {
      unsub();
      unsubCentral();
      clearInterval(interval);
    };
  }, []);

  const clearCache = useCallback(() => {
    productApiClient.clearAllCache();
    setStats(apiCacheService.getStats());
  }, []);

  const syncNow = useCallback(() => {
    productApiClient.invalidateProductsCache();
    productApiClient.invalidateCategoriesCache();
    cacheService.revalidateAll().then(() => {
      setStats(apiCacheService.getStats());
    });
  }, []);

  return { stats, clearCache, syncNow };
};

// Re-export hooks from cacheService for centralized access
export {
  useCachedProducts,
  useCachedCategories,
  useCachedProduct,
} from '../services/cacheService';

