import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '../types';
import { storage } from '../services/storage';

const STORAGE_KEY = 'xcrispin_compare_ids';
const MAX_COMPARE_ITEMS = 3;

interface ComparisonContextType {
  compareIds: string[];
  compareProducts: Product[];
  addToCompare: (productId: string) => { success: boolean; message?: string };
  removeFromCompare: (productId: string) => void;
  toggleCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  isCompareModalOpen: boolean;
  openCompareModal: () => void;
  closeCompareModal: () => void;
  toastMessage: string | null;
  clearToast: () => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareIds, setCompareIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, MAX_COMPARE_ITEMS);
        }
      }
    } catch (e) {
      console.warn('Could not read comparison list from localStorage:', e);
    }
    return [];
  });

  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareIds));
    } catch (e) {
      console.warn('Could not persist comparison list:', e);
    }
  }, [compareIds]);

  // Auto clear toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const isInCompare = useCallback(
    (productId: string) => {
      return compareIds.includes(productId);
    },
    [compareIds]
  );

  const addToCompare = useCallback(
    (productId: string): { success: boolean; message?: string } => {
      if (compareIds.includes(productId)) {
        return { success: true };
      }

      if (compareIds.length >= MAX_COMPARE_ITEMS) {
        const msg = `Máximo ${MAX_COMPARE_ITEMS} productos para comparar simultáneamente. Remueve uno para agregar este.`;
        setToastMessage(msg);
        return { success: false, message: msg };
      }

      const allProducts = storage.getProducts();
      const product = allProducts.find((p) => p.id === productId);
      const name = product ? product.nombre : 'Producto';

      setCompareIds((prev) => [...prev, productId]);
      setToastMessage(`"${name}" agregado al comparador (${compareIds.length + 1}/${MAX_COMPARE_ITEMS})`);
      return { success: true };
    },
    [compareIds]
  );

  const removeFromCompare = useCallback((productId: string) => {
    setCompareIds((prev) => {
      const next = prev.filter((id) => id !== productId);
      return next;
    });
  }, []);

  const toggleCompare = useCallback(
    (productId: string) => {
      if (isInCompare(productId)) {
        removeFromCompare(productId);
      } else {
        addToCompare(productId);
      }
    },
    [isInCompare, removeFromCompare, addToCompare]
  );

  const clearCompare = useCallback(() => {
    setCompareIds([]);
    setIsCompareModalOpen(false);
  }, []);

  const openCompareModal = useCallback(() => {
    setIsCompareModalOpen(true);
  }, []);

  const closeCompareModal = useCallback(() => {
    setIsCompareModalOpen(false);
  }, []);

  // Resolve product objects
  const compareProducts = useMemo(() => {
    const all = storage.getProducts();
    return compareIds
      .map((id) => all.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [compareIds]);

  return (
    <ComparisonContext.Provider
      value={{
        compareIds,
        compareProducts,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        clearCompare,
        isInCompare,
        isCompareModalOpen,
        openCompareModal,
        closeCompareModal,
        toastMessage,
        clearToast,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = (): ComparisonContextType => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};
