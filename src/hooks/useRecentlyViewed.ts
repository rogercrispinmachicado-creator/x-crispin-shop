import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../types';
import { storage } from '../services/storage';

export function useRecentlyViewed() {
  const [viewedIds, setViewedIds] = useState<string[]>(() => storage.getRecentlyViewed());

  useEffect(() => {
    // Subscribe to reactive storage changes
    const unsub = storage.subscribe(() => {
      setViewedIds(storage.getRecentlyViewed());
    });
    return unsub;
  }, []);

  const addViewed = useCallback((productId: string) => {
    if (!productId) return;
    storage.addRecentlyViewed(productId);
  }, []);

  const removeViewed = useCallback((productId: string) => {
    if (!productId) return;
    storage.removeRecentlyViewed(productId);
  }, []);

  const clearAll = useCallback(() => {
    storage.clearRecentlyViewed();
  }, []);

  // Map IDs to product objects preserving recent order
  const viewedProducts = useMemo(() => {
    const allProducts = storage.getProducts();
    const map = new Map(allProducts.map((p) => [p.id, p]));
    return viewedIds
      .map((id) => map.get(id))
      .filter((p): p is Product => Boolean(p));
  }, [viewedIds]);

  return {
    viewedIds,
    viewedProducts,
    addViewed,
    removeViewed,
    clearAll,
  };
}
