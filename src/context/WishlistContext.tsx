import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../types';
import { useAuth } from './AuthContext';
import { storage } from '../services/storage';

export interface WishlistNotification {
  id: string;
  message: string;
  productName?: string;
  type: 'added' | 'removed';
}

interface WishlistContextType {
  wishlist: string[];
  wishlistProducts: Product[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string, productName?: string) => boolean;
  addToWishlist: (productId: string, productName?: string) => void;
  removeFromWishlist: (productId: string, productName?: string) => void;
  clearWishlist: () => void;
  notification: WishlistNotification | null;
  dismissNotification: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, setCurrentUser } = useAuth();
  
  // Local state for the active user's wishlist
  const [wishlist, setWishlistState] = useState<string[]>(() => {
    return storage.getWishlist(currentUser?.id);
  });

  const [notification, setNotification] = useState<WishlistNotification | null>(null);

  // Sync wishlist when current user changes or when switching personas
  useEffect(() => {
    if (currentUser) {
      const userWishlist = storage.getWishlist(currentUser.id);
      setWishlistState(userWishlist);
    }
  }, [currentUser?.id]);

  // Listen to cross-component or storage events
  useEffect(() => {
    const unsub = storage.subscribe(() => {
      if (currentUser?.id) {
        const userWishlist = storage.getWishlist(currentUser.id);
        setWishlistState(userWishlist);
      }
    });
    return unsub;
  }, [currentUser?.id]);

  // Auto-dismiss toast notification after 3.5 seconds
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [notification]);

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => {
      return wishlist.includes(productId);
    },
    [wishlist]
  );

  const saveWishlist = useCallback(
    (nextList: string[]) => {
      setWishlistState(nextList);
      if (currentUser) {
        storage.setWishlist(nextList, currentUser.id);
        // Ensure user profile in Auth state holds updated wishlist
        setCurrentUser({
          ...currentUser,
          wishlist: nextList,
        });
      }
    },
    [currentUser, setCurrentUser]
  );

  const addToWishlist = useCallback(
    (productId: string, productName?: string) => {
      if (!wishlist.includes(productId)) {
        const next = [...wishlist, productId];
        saveWishlist(next);
        setNotification({
          id: `${Date.now()}`,
          message: productName
            ? `"${productName}" guardado en tu lista de deseos`
            : 'Producto guardado en tu lista de deseos',
          productName,
          type: 'added',
        });
      }
    },
    [wishlist, saveWishlist]
  );

  const removeFromWishlist = useCallback(
    (productId: string, productName?: string) => {
      if (wishlist.includes(productId)) {
        const next = wishlist.filter((id) => id !== productId);
        saveWishlist(next);
        setNotification({
          id: `${Date.now()}`,
          message: productName
            ? `"${productName}" eliminado de tu lista de deseos`
            : 'Producto eliminado de tu lista de deseos',
          productName,
          type: 'removed',
        });
      }
    },
    [wishlist, saveWishlist]
  );

  const toggleWishlist = useCallback(
    (productId: string, productName?: string): boolean => {
      const isCurrentlySaved = wishlist.includes(productId);
      if (isCurrentlySaved) {
        removeFromWishlist(productId, productName);
        return false;
      } else {
        addToWishlist(productId, productName);
        return true;
      }
    },
    [wishlist, addToWishlist, removeFromWishlist]
  );

  const clearWishlist = useCallback(() => {
    saveWishlist([]);
    setNotification({
      id: `${Date.now()}`,
      message: 'Has vaciado tu lista de deseos',
      type: 'removed',
    });
  }, [saveWishlist]);

  // Resolve product objects for all items in the wishlist
  const allProducts = useMemo(() => {
    return storage.getProducts();
  }, [wishlist]);

  const wishlistProducts = useMemo(() => {
    if (!wishlist.length) return [];
    return wishlist
      .map((id) => allProducts.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [wishlist, allProducts]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistProducts,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        notification,
        dismissNotification,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
