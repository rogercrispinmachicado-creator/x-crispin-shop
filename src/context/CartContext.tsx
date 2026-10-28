import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant, CartItem, Coupon } from '../types';
import { couponService } from '../services/couponService';
import { storage } from '../services/storage';

export interface CartInventoryValidationResult {
  valid: boolean;
  errors: string[];
  hasAdjustments: boolean;
  adjustedItems: {
    nombre: string;
    solicitada: number;
    disponible: number;
  }[];
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (producto: Product, cantidad?: number, variante?: ProductVariant) => boolean;
  updateQuantity: (productoId: string, cantidad: number, varianteId?: string) => void;
  removeItem: (productoId: string, varianteId?: string) => void;
  clearCart: () => void;
  validateCartInventory: () => CartInventoryValidationResult;
  autoAdjustCartToStock: () => void;
  appliedCoupon: Coupon | null;
  couponCode: string;
  setCouponCode: (code: string) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  discountAmount: number;
  subtotal: number;
  shippingCost: number;
  setShippingCost: (cost: number) => void;
  total: number;
  totalItemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'xcrispin_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingCost, setShippingCost] = useState(15); // Default local delivery in Bs.

  // Sync to storage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [items]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addItem = (producto: Product, cantidad = 1, variante?: ProductVariant): boolean => {
    const availableStock = variante
      ? variante.stock
      : Math.max(0, producto.stockTotal - producto.stockReservado);

    let itemExceeded = false;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (it) => it.producto.id === producto.id && it.variante?.id === variante?.id
      );

      if (existingIndex > -1) {
        const currentQty = prevItems[existingIndex].cantidad;
        if (currentQty + cantidad > availableStock) {
          itemExceeded = true;
          return prevItems;
        }
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          cantidad: currentQty + cantidad,
        };
        return updated;
      } else {
        if (cantidad > availableStock) {
          itemExceeded = true;
          return prevItems;
        }
        return [...prevItems, { producto, cantidad, variante }];
      }
    });

    if (itemExceeded) {
      return false;
    }

    openCart();
    return true;
  };

  const updateQuantity = (productoId: string, cantidad: number, varianteId?: string) => {
    if (cantidad <= 0) {
      removeItem(productoId, varianteId);
      return;
    }

    setItems((prevItems) => {
      return prevItems.map((it) => {
        if (it.producto.id === productoId && it.variante?.id === varianteId) {
          const available = it.variante
            ? it.variante.stock
            : Math.max(0, it.producto.stockTotal - it.producto.stockReservado);
          const safeQty = Math.min(cantidad, available);
          return { ...it, cantidad: safeQty };
        }
        return it;
      });
    });
  };

  const removeItem = (productoId: string, varianteId?: string) => {
    setItems((prevItems) =>
      prevItems.filter(
        (it) => !(it.producto.id === productoId && it.variante?.id === varianteId)
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponCode('');
    setDiscountAmount(0);
  };

  /**
   * Valida en tiempo real que cada producto y variante en el carrito
   * cuente con inventario real y suficiente en la base de datos (storage).
   */
  const validateCartInventory = (): CartInventoryValidationResult => {
    const dbProducts = storage.getProducts();
    const errors: string[] = [];
    const adjustedItems: { nombre: string; solicitada: number; disponible: number }[] = [];
    let hasAdjustments = false;

    if (items.length === 0) {
      return {
        valid: false,
        errors: ['El carrito de compras está vacío.'],
        hasAdjustments: false,
        adjustedItems: [],
      };
    }

    for (const item of items) {
      const dbProd = dbProducts.find((p) => p.id === item.producto.id);
      const itemLabel = item.variante
        ? `${item.producto.nombre} (${item.variante.name})`
        : item.producto.nombre;

      if (!dbProd || dbProd.estado === 'INACTIVO') {
        errors.push(`"${itemLabel}" ya no está disponible en el catálogo activo.`);
        hasAdjustments = true;
        adjustedItems.push({
          nombre: itemLabel,
          solicitada: item.cantidad,
          disponible: 0,
        });
        continue;
      }

      let availableStock = 0;
      if (item.variante) {
        const dbVar = dbProd.variantes?.find((v) => v.id === item.variante?.id);
        if (!dbVar) {
          errors.push(`La variante seleccionada para "${itemLabel}" no existe.`);
          hasAdjustments = true;
          adjustedItems.push({
            nombre: itemLabel,
            solicitada: item.cantidad,
            disponible: 0,
          });
          continue;
        }
        availableStock = Math.max(0, dbVar.stock);
      } else {
        availableStock = Math.max(0, dbProd.stockTotal - dbProd.stockReservado);
      }

      if (availableStock <= 0) {
        errors.push(`"${itemLabel}" está agotado en bodega.`);
        hasAdjustments = true;
        adjustedItems.push({
          nombre: itemLabel,
          solicitada: item.cantidad,
          disponible: 0,
        });
      } else if (item.cantidad > availableStock) {
        errors.push(
          `Stock insuficiente para "${itemLabel}": solicitaste ${item.cantidad}, pero solo hay ${availableStock} unidades disponibles.`
        );
        hasAdjustments = true;
        adjustedItems.push({
          nombre: itemLabel,
          solicitada: item.cantidad,
          disponible: availableStock,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      hasAdjustments,
      adjustedItems,
    };
  };

  /**
   * Sincroniza y ajusta automáticamente las cantidades del carrito
   * según el stock real disponible en la base de datos.
   */
  const autoAdjustCartToStock = () => {
    const dbProducts = storage.getProducts();
    setItems((prevItems) => {
      const updated: CartItem[] = [];

      for (const item of prevItems) {
        const dbProd = dbProducts.find((p) => p.id === item.producto.id);
        if (!dbProd || dbProd.estado === 'INACTIVO') {
          // Remueve ítems inexistentes o desactivados
          continue;
        }

        if (item.variante) {
          const dbVar = dbProd.variantes?.find((v) => v.id === item.variante?.id);
          if (!dbVar || dbVar.stock <= 0) {
            continue;
          }
          const safeQty = Math.min(item.cantidad, dbVar.stock);
          updated.push({
            ...item,
            producto: dbProd,
            variante: dbVar,
            cantidad: safeQty,
          });
        } else {
          const availableStock = Math.max(0, dbProd.stockTotal - dbProd.stockReservado);
          if (availableStock <= 0) {
            continue;
          }
          const safeQty = Math.min(item.cantidad, availableStock);
          updated.push({
            ...item,
            producto: dbProd,
            cantidad: safeQty,
          });
        }
      }

      return updated;
    });
  };

  const subtotal = items.reduce((sum, item) => {
    const basePrice = item.producto.precio;
    const modifier = item.variante?.priceModifier || 0;
    return sum + (basePrice + modifier) * item.cantidad;
  }, 0);

  // Recalculate coupon on subtotal change
  useEffect(() => {
    if (appliedCoupon) {
      const res = couponService.validateCoupon(appliedCoupon.codigo, subtotal);
      if (res.valid) {
        setDiscountAmount(res.descuento);
      } else {
        setAppliedCoupon(null);
        setDiscountAmount(0);
      }
    }
  }, [subtotal]);

  const applyCoupon = (code: string) => {
    if (!code.trim()) {
      return { success: false, message: 'Ingresa un código de cupón' };
    }
    const res = couponService.validateCoupon(code, subtotal);
    if (!res.valid) {
      return { success: false, message: res.error || 'Cupón inválido' };
    }
    setAppliedCoupon(res.coupon!);
    setDiscountAmount(res.descuento);
    return {
      success: true,
      message: `¡Cupón aplicado! Descuento de Bs. ${res.descuento}`,
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
  };

  const total = Math.max(0, subtotal - discountAmount + (items.length > 0 ? shippingCost : 0));
  const totalItemsCount = items.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        validateCartInventory,
        autoAdjustCartToStock,
        appliedCoupon,
        couponCode,
        setCouponCode,
        applyCoupon,
        removeCoupon,
        discountAmount,
        subtotal,
        shippingCost,
        setShippingCost,
        total,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
