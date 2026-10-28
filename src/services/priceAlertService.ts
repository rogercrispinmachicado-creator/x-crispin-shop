import { PriceDropAlert, Product } from '../types';
import { storage } from './storage';

export interface PriceAlertSubscriptionInput {
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  currentPrice: number;
  targetPrice?: number;
  email: string;
  phone?: string;
  notifyWhatsApp?: boolean;
}

export const priceAlertService = {
  /**
   * Returns all price drop alerts stored in the system.
   */
  getAll(): PriceDropAlert[] {
    return storage.getPriceAlerts();
  },

  /**
   * Returns alerts associated with a specific email.
   */
  getByEmail(email: string): PriceDropAlert[] {
    if (!email) return [];
    const normalized = email.trim().toLowerCase();
    return storage.getPriceAlerts().filter((a) => a.email.toLowerCase() === normalized);
  },

  /**
   * Returns active alerts for a given product.
   */
  getByProduct(productId: string): PriceDropAlert[] {
    return storage.getPriceAlerts().filter((a) => a.productId === productId && a.status === 'ACTIVE');
  },

  /**
   * Checks if an email has an active alert configured for a product.
   */
  getAlertForProductAndEmail(productId: string, email: string): PriceDropAlert | undefined {
    if (!productId || !email) return undefined;
    const normalized = email.trim().toLowerCase();
    return storage.getPriceAlerts().find(
      (a) => a.productId === productId && a.email.toLowerCase() === normalized && a.status === 'ACTIVE'
    );
  },

  /**
   * Creates or updates a price alert subscription.
   */
  subscribe(input: PriceAlertSubscriptionInput): { alert: PriceDropAlert; isNew: boolean } {
    return storage.addPriceAlert({
      productId: input.productId,
      productName: input.productName,
      productSlug: input.productSlug,
      productImage: input.productImage,
      currentPrice: input.currentPrice,
      targetPrice: input.targetPrice,
      email: input.email,
      phone: input.phone,
      notifyWhatsApp: input.notifyWhatsApp,
    });
  },

  /**
   * Cancels/removes a price alert by ID.
   */
  unsubscribe(alertId: string): void {
    storage.removePriceAlert(alertId);
  },

  /**
   * Cancels an alert for a specific product and email.
   */
  unsubscribeByProductAndEmail(productId: string, email: string): void {
    storage.removePriceAlertByProductAndEmail(productId, email);
  },

  /**
   * Interactive simulation: drops the price of a product to trigger price alerts in real time.
   * Useful for testing and immediate feedback in the UI.
   */
  simulatePriceDrop(productId: string, targetNewPrice?: number): {
    success: boolean;
    oldPrice: number;
    newPrice: number;
    productName: string;
    triggeredAlerts: PriceDropAlert[];
    error?: string;
  } {
    const products = storage.getProducts();
    const idx = products.findIndex((p) => p.id === productId);

    if (idx === -1) {
      return {
        success: false,
        oldPrice: 0,
        newPrice: 0,
        productName: '',
        triggeredAlerts: [],
        error: 'Producto no encontrado',
      };
    }

    const product = products[idx];
    const oldPrice = product.precio;
    // Default to 15% discount if no target price is given, or round down to nearest 5 Bs.
    const calculatedDrop = Math.max(1, Math.round(oldPrice * 0.85));
    const newPrice = targetNewPrice !== undefined && targetNewPrice < oldPrice ? targetNewPrice : calculatedDrop;
    const discountPercent = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

    const updatedProduct: Product = {
      ...product,
      precio: newPrice,
      precioAnterior: oldPrice,
      descuento: Math.max(product.descuento || 0, discountPercent),
      estado: 'OFERTA',
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [...products];
    updatedList[idx] = updatedProduct;

    // storage.saveProducts will automatically run checkPriceDropAlerts
    storage.saveProducts(updatedList);

    const triggered = storage
      .getPriceAlerts()
      .filter((a) => a.productId === productId && a.status === 'TRIGGERED');

    return {
      success: true,
      oldPrice,
      newPrice,
      productName: product.nombre,
      triggeredAlerts: triggered,
    };
  },

  /**
   * Restores a product price back to original (for undoing a simulation).
   */
  restorePrice(productId: string, originalPrice: number): void {
    const products = storage.getProducts();
    const idx = products.findIndex((p) => p.id === productId);
    if (idx !== -1) {
      const updatedList = [...products];
      updatedList[idx] = {
        ...updatedList[idx],
        precio: originalPrice,
        precioAnterior: undefined,
        descuento: 0,
        updatedAt: new Date().toISOString(),
      };
      storage.saveProducts(updatedList);
    }
  },
};
