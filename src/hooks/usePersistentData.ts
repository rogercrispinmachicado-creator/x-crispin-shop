/**
 * X-CRISPIN — SHOP THE X
 * Hook Personalizado: usePersistentData (src/hooks/usePersistentData.ts)
 * 
 * Gestiona el guardado y la recuperación sincronizada de productos más vendidos
 * ('bestSellingProducts') y categorías ('categories') en 'localStorage'.
 * 
 * Incluye:
 * 1. Recuperación inmediata (0ms) en el render inicial desde localStorage.
 * 2. Lógica de suscripción reactiva para que múltiples componentes reciban
 *    actualizaciones en tiempo real sin recargar la página (Store Pub/Sub con useSyncExternalStore).
 * 3. Petición asíncrona de actualización al backend en segundo plano (SWR)
 *    para mantener la UI siempre interactiva con datos frescos.
 * 4. Sincronización multi-pestaña mediante eventos de almacenamiento ('storage').
 */

import { useEffect, useCallback, useSyncExternalStore } from 'react';
import { Category, Product } from '../types';
import { productApiClient } from '../services/productApiClient';
import { apiCacheService } from '../services/apiCacheService';
import { useNetworkStatus } from './useNetworkStatus';

// Claves oficiales de almacenamiento local para persistencia temporal
export const PERSISTENT_STORAGE_KEYS = {
  BEST_SELLING_PRODUCTS: 'bestSellingProducts',
  CATEGORIES: 'categories',
  METADATA: 'persistent_data_metadata',
  // Claves heredadas para retrocompatibilidad
  LEGACY_BEST_SELLERS: 'xc_persistent_bestsellers',
  LEGACY_CATEGORIES: 'xc_persistent_categories',
} as const;

export interface PersistentDataMetadata {
  savedAt: number;
  categoriesCount: number;
  bestSellingProductsCount: number;
  version: string;
}

export interface PersistentDataStoreState {
  categories: Category[];
  bestSellingProducts: Product[];
  metadata: PersistentDataMetadata | null;
  loading: boolean;
  isRevalidating: boolean;
  error: string | null;
}

export interface UsePersistentDataOptions {
  /** Límite de productos más vendidos a solicitar al backend (por defecto 6) */
  bestSellersLimit?: number;
  /** Si debe disparar la petición de actualización al backend automáticamente al montar (por defecto true) */
  autoFetch?: boolean;
  /** Forzar revalidación con el backend */
  forceRefresh?: boolean;
}

export interface UsePersistentDataReturn {
  /** Lista de productos más vendidos recuperados desde localStorage y validados con el backend */
  bestSellingProducts: Product[];
  /** Alias para retrocompatibilidad con componentes existentes */
  bestSellers: Product[];
  /** Categorías recuperadas desde localStorage y validadas con el backend */
  categories: Category[];
  /** Indica si aún no se cuenta ni con datos locales ni de backend */
  loading: boolean;
  /** Indica si se están mostrando datos de respaldo recuperados de localStorage */
  hasBackup: boolean;
  /** Indica si la petición asíncrona de actualización al backend está en ejecución en segundo plano */
  isRevalidating: boolean;
  /** Estado de conectividad offline */
  isOffline: boolean;
  /** Error reportado si la actualización del backend falla */
  error: string | null;
  /** Marca de tiempo de la última sincronización persistida */
  lastUpdated: number | null;
  /** Función para forzar la actualización asíncrona contra el backend */
  refresh: () => Promise<void>;
  /** Función para guardar de forma sincronizada categorías y productos más vendidos en localStorage */
  saveData: (categories: Category[], bestSellingProducts: Product[]) => void;
  /** Guardar sincronizadamente las categorías en localStorage */
  saveCategories: (categories: Category[]) => void;
  /** Guardar sincronizadamente los productos más vendidos en localStorage */
  saveBestSellingProducts: (bestSellingProducts: Product[]) => void;
  /** Alias de guardado para compatibilidad */
  saveBestSellers: (bestSellers: Product[]) => void;
  /** Limpiar el respaldo en localStorage */
  clearBackup: () => void;
}

/**
 * Lectura segura de un valor JSON desde localStorage con soporte para clave primaria y heredada
 */
function readStorage<T>(primaryKey: string, legacyKey: string | null, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) return fallback;
  try {
    let raw = localStorage.getItem(primaryKey);
    if (!raw && legacyKey) {
      raw = localStorage.getItem(legacyKey);
    }
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[usePersistentData] Error al leer ${primaryKey} de localStorage:`, err);
    return fallback;
  }
}

/**
 * Escritura atómica en localStorage
 */
function writeStorage<T>(key: string, value: T, legacyKey?: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    if (legacyKey) {
      localStorage.setItem(legacyKey, serialized);
    }
    return true;
  } catch (err) {
    console.warn(`[usePersistentData] Error al escribir ${key} en localStorage:`, err);
    return false;
  }
}

/**
 * Store reactivo singleton (Pub/Sub) para sincronizar todos los componentes suscritos
 */
class PersistentDataStore {
  private state: PersistentDataStoreState;
  private listeners = new Set<() => void>();
  private activeFetchPromise: Promise<void> | null = null;

  constructor() {
    // 1. Hidratación síncrona inmediata desde localStorage
    const initialCategories = readStorage<Category[]>(
      PERSISTENT_STORAGE_KEYS.CATEGORIES,
      PERSISTENT_STORAGE_KEYS.LEGACY_CATEGORIES,
      []
    );
    const initialBestSelling = readStorage<Product[]>(
      PERSISTENT_STORAGE_KEYS.BEST_SELLING_PRODUCTS,
      PERSISTENT_STORAGE_KEYS.LEGACY_BEST_SELLERS,
      []
    );
    const initialMetadata = readStorage<PersistentDataMetadata | null>(
      PERSISTENT_STORAGE_KEYS.METADATA,
      null,
      null
    );

    const hasStoredData = initialCategories.length > 0 || initialBestSelling.length > 0;

    this.state = {
      categories: initialCategories,
      bestSellingProducts: initialBestSelling,
      metadata: initialMetadata,
      loading: !hasStoredData,
      isRevalidating: false,
      error: null,
    };

    this.setupListeners();
  }

  private setupListeners(): void {
    if (typeof window === 'undefined') return;

    // Sincronización multi-pestaña
    window.addEventListener('storage', (event) => {
      if (
        event.key === PERSISTENT_STORAGE_KEYS.CATEGORIES ||
        event.key === PERSISTENT_STORAGE_KEYS.BEST_SELLING_PRODUCTS ||
        event.key === PERSISTENT_STORAGE_KEYS.METADATA ||
        event.key === PERSISTENT_STORAGE_KEYS.LEGACY_CATEGORIES ||
        event.key === PERSISTENT_STORAGE_KEYS.LEGACY_BEST_SELLERS
      ) {
        this.reloadFromStorage();
      }
    });

    // Suscripción al sistema central de caché para invalidaciones de productos o categorías
    apiCacheService.subscribe((event) => {
      if (
        event.type === 'invalidate' &&
        (event.tag === 'products' ||
          event.tag === 'categories' ||
          event.key === '*' ||
          event.key.startsWith('tag:products') ||
          event.key.startsWith('tag:categories'))
      ) {
        this.revalidate(6, true);
      }
    });
  }

  public getState(): PersistentDataStoreState {
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('[usePersistentData] Error en suscriptor:', e);
      }
    });
  }

  public reloadFromStorage(): void {
    const categories = readStorage<Category[]>(
      PERSISTENT_STORAGE_KEYS.CATEGORIES,
      PERSISTENT_STORAGE_KEYS.LEGACY_CATEGORIES,
      []
    );
    const bestSellingProducts = readStorage<Product[]>(
      PERSISTENT_STORAGE_KEYS.BEST_SELLING_PRODUCTS,
      PERSISTENT_STORAGE_KEYS.LEGACY_BEST_SELLERS,
      []
    );
    const metadata = readStorage<PersistentDataMetadata | null>(
      PERSISTENT_STORAGE_KEYS.METADATA,
      null,
      null
    );

    this.state = {
      ...this.state,
      categories,
      bestSellingProducts,
      metadata,
      loading: categories.length === 0 && bestSellingProducts.length === 0,
    };
    this.notify();
  }

  /**
   * Guarda de manera sincronizada categorías y productos más vendidos en localStorage
   * y notifica inmediatamente a todos los componentes suscritos.
   */
  public saveData(categories: Category[], bestSellingProducts: Product[]): void {
    const now = Date.now();
    writeStorage(
      PERSISTENT_STORAGE_KEYS.CATEGORIES,
      categories,
      PERSISTENT_STORAGE_KEYS.LEGACY_CATEGORIES
    );
    writeStorage(
      PERSISTENT_STORAGE_KEYS.BEST_SELLING_PRODUCTS,
      bestSellingProducts,
      PERSISTENT_STORAGE_KEYS.LEGACY_BEST_SELLERS
    );

    const newMetadata: PersistentDataMetadata = {
      savedAt: now,
      categoriesCount: categories.length,
      bestSellingProductsCount: bestSellingProducts.length,
      version: '1.0',
    };
    writeStorage(PERSISTENT_STORAGE_KEYS.METADATA, newMetadata);

    this.state = {
      ...this.state,
      categories,
      bestSellingProducts,
      metadata: newMetadata,
      loading: false,
      error: null,
    };

    this.notify();
  }

  public saveCategories(categories: Category[]): void {
    this.saveData(categories, this.state.bestSellingProducts);
  }

  public saveBestSellingProducts(bestSellingProducts: Product[]): void {
    this.saveData(this.state.categories, bestSellingProducts);
  }

  public clearBackup(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(PERSISTENT_STORAGE_KEYS.CATEGORIES);
      localStorage.removeItem(PERSISTENT_STORAGE_KEYS.BEST_SELLING_PRODUCTS);
      localStorage.removeItem(PERSISTENT_STORAGE_KEYS.METADATA);
      localStorage.removeItem(PERSISTENT_STORAGE_KEYS.LEGACY_CATEGORIES);
      localStorage.removeItem(PERSISTENT_STORAGE_KEYS.LEGACY_BEST_SELLERS);
    }

    this.state = {
      ...this.state,
      categories: [],
      bestSellingProducts: [],
      metadata: null,
      loading: true,
    };

    this.notify();
  }

  /**
   * Petición asíncrona de actualización al backend en segundo plano
   * Implementa deduplicación de peticiones (request coalescing) y prevención de peticiones redundantes.
   */
  public async revalidate(bestSellersLimit: number = 6, force: boolean = false): Promise<void> {
    // Si ya hay una petición en curso hacia el backend, reutilizarla (evita peticiones duplicadas paralelas)
    if (this.activeFetchPromise) {
      return this.activeFetchPromise;
    }

    // Evita peticiones redundantes si se validó recientemente (ventana de 45 segundos) salvo que se fuerce
    if (!force && this.state.metadata && Date.now() - this.state.metadata.savedAt < 45_000) {
      return;
    }

    // Si no hay conexión, conservamos los datos persistidos sin fallar
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.state = {
        ...this.state,
        loading: false,
        isRevalidating: false,
      };
      this.notify();
      return;
    }

    this.state = {
      ...this.state,
      isRevalidating: true,
      error: null,
    };
    this.notify();

    this.activeFetchPromise = (async () => {
      try {
        const [categoriesResp, bestSellersResp] = await Promise.all([
          productApiClient.getCategories({ forceRefresh: force }),
          productApiClient.getBestSellers(bestSellersLimit, { forceRefresh: force }),
        ]);

        const freshCategories = categoriesResp.data;
        const freshBestSelling = bestSellersResp.data;

        // Guardado atómico en localStorage y notificación inmediata
        this.saveData(freshCategories, freshBestSelling);

        this.state = {
          ...this.state,
          isRevalidating: false,
          loading: false,
        };
        this.notify();
      } catch (err: any) {
        console.error('[usePersistentData] Error en petición asíncrona al backend:', err);
        this.state = {
          ...this.state,
          isRevalidating: false,
          loading: false,
          error: err?.message || 'Error al sincronizar con el backend',
        };
        this.notify();
      } finally {
        this.activeFetchPromise = null;
      }
    })();

    return this.activeFetchPromise;
  }
}

// Instancia única compartida del store reactivo
export const persistentStore = new PersistentDataStore();

/**
 * Función auxiliar para obtener de inmediato las categorías respaldadas
 */
export function getInitialPersistentCategories(): Category[] {
  return persistentStore.getState().categories;
}

/**
 * Función auxiliar para obtener de inmediato los productos más vendidos respaldados
 */
export function getInitialPersistentProducts(): Product[] {
  return persistentStore.getState().bestSellingProducts;
}

/**
 * Hook personalizado usePersistentData
 * 
 * Permite a los componentes mostrar datos de inmediato al cargar desde 'localStorage'
 * mientras se realiza la validación asíncrona con el backend en segundo plano.
 */
export function usePersistentData(
  options: UsePersistentDataOptions = {}
): UsePersistentDataReturn {
  const { bestSellersLimit = 6, autoFetch = true, forceRefresh = false } = options;
  const { isOnline } = useNetworkStatus();

  // Suscripción reactiva sincronizada
  const storeState = useSyncExternalStore(
    (listener) => persistentStore.subscribe(listener),
    () => persistentStore.getState(),
    () => persistentStore.getState()
  );

  // Petición asíncrona de actualización al backend en segundo plano
  useEffect(() => {
    if (autoFetch) {
      persistentStore.revalidate(bestSellersLimit, forceRefresh);
    }
  }, [autoFetch, bestSellersLimit, forceRefresh]);

  const refresh = useCallback(async () => {
    await persistentStore.revalidate(bestSellersLimit, true);
  }, [bestSellersLimit]);

  const saveData = useCallback((newCategories: Category[], newBestSelling: Product[]) => {
    persistentStore.saveData(newCategories, newBestSelling);
  }, []);

  const saveCategories = useCallback((newCategories: Category[]) => {
    persistentStore.saveCategories(newCategories);
  }, []);

  const saveBestSellingProducts = useCallback((newBestSelling: Product[]) => {
    persistentStore.saveBestSellingProducts(newBestSelling);
  }, []);

  const clearBackup = useCallback(() => {
    persistentStore.clearBackup();
  }, []);

  const hasBackup = storeState.categories.length > 0 || storeState.bestSellingProducts.length > 0;

  return {
    bestSellingProducts: storeState.bestSellingProducts,
    bestSellers: storeState.bestSellingProducts,
    categories: storeState.categories,
    loading: storeState.loading,
    hasBackup,
    isRevalidating: storeState.isRevalidating,
    isOffline: !isOnline,
    error: storeState.error,
    lastUpdated: storeState.metadata ? storeState.metadata.savedAt : null,
    refresh,
    saveData,
    saveCategories,
    saveBestSellingProducts,
    saveBestSellers: saveBestSellingProducts,
    clearBackup,
  };
}
