import { Coupon } from '../types';
import { storage } from './storage';

export const couponService = {
  getAll: (): Coupon[] => {
    return storage.getCoupons();
  },

  validateCoupon: (
    codigo: string,
    subtotal: number
  ): { valid: boolean; coupon?: Coupon; error?: string; descuento: number } => {
    const coupons = storage.getCoupons();
    const cleanCode = codigo.trim().toUpperCase();
    const coupon = coupons.find((c) => c.codigo.toUpperCase() === cleanCode);

    if (!coupon) {
      return { valid: false, error: 'El cupón ingresado no existe.', descuento: 0 };
    }

    if (!coupon.activo) {
      return { valid: false, error: 'Este cupón se encuentra inactivo.', descuento: 0 };
    }

    const today = new Date().toISOString().split('T')[0];
    if (today < coupon.fechaInicio) {
      return { valid: false, error: 'Este cupón aún no ha entrado en vigencia.', descuento: 0 };
    }

    if (today > coupon.fechaFin) {
      return { valid: false, error: 'Este cupón ha expirado.', descuento: 0 };
    }

    if (coupon.usosActuales >= coupon.usoMaximo) {
      return { valid: false, error: 'Este cupón ha alcanzado el límite máximo de usos.', descuento: 0 };
    }

    if (subtotal < coupon.montoMinimoCompra) {
      return {
        valid: false,
        error: `El monto mínimo para aplicar este cupón es de Bs. ${coupon.montoMinimoCompra}.`,
        descuento: 0,
      };
    }

    let descuento = 0;
    if (coupon.tipo === 'PORCENTAJE') {
      descuento = Math.round((subtotal * coupon.valor) / 100);
    } else {
      descuento = Math.min(subtotal, coupon.valor);
    }

    return { valid: true, coupon, descuento };
  },

  applyCouponUsage: (codigo: string): void => {
    const coupons = storage.getCoupons();
    const cleanCode = codigo.trim().toUpperCase();
    const idx = coupons.findIndex((c) => c.codigo.toUpperCase() === cleanCode);
    if (idx !== -1) {
      coupons[idx].usosActuales += 1;
      storage.saveCoupons(coupons);
    }
  },

  saveOrUpdate: (couponData: Partial<Coupon> & { codigo: string; valor: number }): Coupon => {
    const coupons = storage.getCoupons();
    const cleanCode = couponData.codigo.trim().toUpperCase();
    const now = new Date().toISOString().split('T')[0];

    if (couponData.id) {
      const idx = coupons.findIndex((c) => c.id === couponData.id);
      if (idx !== -1) {
        const updated: Coupon = {
          ...coupons[idx],
          ...couponData,
          codigo: cleanCode,
        };
        coupons[idx] = updated;
        storage.saveCoupons(coupons);
        return updated;
      }
    }

    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      codigo: cleanCode,
      tipo: couponData.tipo || 'PORCENTAJE',
      valor: couponData.valor,
      montoMinimoCompra: couponData.montoMinimoCompra || 100,
      fechaInicio: couponData.fechaInicio || now,
      fechaFin: couponData.fechaFin || '2026-12-31',
      usoMaximo: couponData.usoMaximo || 500,
      usosActuales: 0,
      usoPorCliente: 1,
      activo: couponData.activo ?? true,
      descripcion: couponData.descripcion || `Descuento especial con código ${cleanCode}`,
    };

    coupons.unshift(newCoupon);
    storage.saveCoupons(coupons);
    return newCoupon;
  },

  delete: (id: string): void => {
    const coupons = storage.getCoupons().filter((c) => c.id !== id);
    storage.saveCoupons(coupons);
  },
};
