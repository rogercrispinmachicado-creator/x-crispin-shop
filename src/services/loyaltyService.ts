import { LoyaltyTransaction, LoyaltyTier, Order, OrderItem, CartItem } from '../types';
import { storage } from './storage';

export interface TierBenefit {
  tier: LoyaltyTier;
  nombre: string;
  minPoints: number;
  multiplier: number; // e.g., 1x, 1.2x, 1.5x
  color: string;
  badgeBg: string;
  badgeText: string;
  beneficios: string[];
}

export const LOYALTY_TIERS: Record<LoyaltyTier, TierBenefit> = {
  BRONZE: {
    tier: 'BRONZE',
    nombre: 'Nivel Bronce',
    minPoints: 0,
    multiplier: 1.0,
    color: 'from-amber-700 to-amber-900',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    beneficios: [
      'Gana 1 X-Point por cada Bs. 10 gastados',
      'Acceso a ofertas exclusivas de fin de semana',
      'Puntos válidos sin fecha de caducidad',
    ],
  },
  SILVER: {
    tier: 'SILVER',
    nombre: 'Nivel Plata',
    minPoints: 200,
    multiplier: 1.1,
    color: 'from-slate-400 to-slate-600',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    beneficios: [
      '+10% de bono en X-Points acumulados',
      'Envíos locales prioritarios en Bolivia',
      'Notificaciones anticipadas de bajadas de precio',
      'Canje de puntos a Bs. 1 por cada 10 X-Points',
    ],
  },
  GOLD: {
    tier: 'GOLD',
    nombre: 'Nivel Oro VIP',
    minPoints: 500,
    multiplier: 1.25,
    color: 'from-amber-400 to-yellow-600',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    beneficios: [
      '+25% de bono en X-Points por compra',
      'Envío nacional gratuito en compras mayores a Bs. 200',
      'Atención VIP directa por WhatsApp soporte',
      'Acceso anticipado a lanzamientos de tecnología y Factor X',
    ],
  },
  TITANIUM: {
    tier: 'TITANIUM',
    nombre: 'Nivel Titanio Elite',
    minPoints: 1000,
    multiplier: 1.5,
    color: 'from-cyan-600 to-slate-900',
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-950',
    beneficios: [
      '+50% de bono en X-Points en todas tus compras',
      'Envíos gratuitos en todos los 9 departamentos de Bolivia',
      'Regalo de cumpleaños garantizado y asesor personal',
      'Doble puntaje en compras con QR Simple',
    ],
  },
};

export const loyaltyService = {
  /**
   * Calculates X-Points to be earned from an order or cart.
   * Base rate: 1 X-Point per 10 BOB of subtotal.
   * Plus explicit factor points from items if present.
   */
  calculatePointsForOrder(
    subtotal: number,
    items: Array<OrderItem | CartItem | { productoId?: string; cantidad: number; producto?: { id: string; factorPuntos?: number } }> = []
  ): number {
    const basePoints = Math.max(1, Math.round(subtotal / 10));

    // Look up products to check for bonus factorPuntos
    const allProducts = storage.getProducts();
    let bonusFactorPoints = 0;

    for (const item of items) {
      const prodId =
        'productoId' in item && item.productoId
          ? item.productoId
          : 'producto' in item && item.producto
          ? item.producto.id
          : undefined;

      const explicitFactor =
        'producto' in item && item.producto && 'factorPuntos' in item.producto
          ? item.producto.factorPuntos
          : undefined;

      const prod = prodId ? allProducts.find((p) => p.id === prodId) : undefined;
      const factorPuntos = explicitFactor ?? prod?.factorPuntos ?? 0;
      bonusFactorPoints += factorPuntos * (item.cantidad || 1);
    }

    return basePoints + bonusFactorPoints;
  },

  /**
   * Retrieves current user's X-Points balance.
   */
  getBalance(userId?: string): number {
    return storage.getXPoints(userId);
  },

  /**
   * Determines the loyalty tier according to point balance.
   */
  getTier(points: number): TierBenefit {
    if (points >= LOYALTY_TIERS.TITANIUM.minPoints) return LOYALTY_TIERS.TITANIUM;
    if (points >= LOYALTY_TIERS.GOLD.minPoints) return LOYALTY_TIERS.GOLD;
    if (points >= LOYALTY_TIERS.SILVER.minPoints) return LOYALTY_TIERS.SILVER;
    return LOYALTY_TIERS.BRONZE;
  },

  /**
   * Calculates progress percentage towards the next tier.
   */
  getNextTierProgress(points: number): {
    currentTier: TierBenefit;
    nextTier?: TierBenefit;
    pointsToNext: number;
    progressPercent: number;
  } {
    const currentTier = this.getTier(points);

    let nextTier: TierBenefit | undefined;
    if (currentTier.tier === 'BRONZE') nextTier = LOYALTY_TIERS.SILVER;
    else if (currentTier.tier === 'SILVER') nextTier = LOYALTY_TIERS.GOLD;
    else if (currentTier.tier === 'GOLD') nextTier = LOYALTY_TIERS.TITANIUM;
    else nextTier = undefined;

    if (!nextTier) {
      return {
        currentTier,
        nextTier: undefined,
        pointsToNext: 0,
        progressPercent: 100,
      };
    }

    const range = nextTier.minPoints - currentTier.minPoints;
    const gained = points - currentTier.minPoints;
    const progressPercent = Math.min(100, Math.max(0, Math.round((gained / range) * 100)));
    const pointsToNext = Math.max(0, nextTier.minPoints - points);

    return {
      currentTier,
      nextTier,
      pointsToNext,
      progressPercent,
    };
  },

  /**
   * Returns approximate monetary discount value in Bolivianos (10 points = 1 BOB).
   */
  getMonetaryValue(points: number): number {
    return Number((points / 10).toFixed(2));
  },

  /**
   * Awards points when an order is created.
   */
  awardPointsForOrder(order: Order): { pointsEarned: number; newBalance: number } {
    const pointsEarned =
      order.xPointsEarned ?? this.calculatePointsForOrder(order.subtotal, order.items);

    const description = `X-Points ganados por compra #${order.numeroPedido} (Bs. ${order.total})`;
    const res = storage.addXPoints(
      order.clienteId,
      pointsEarned,
      description,
      order.numeroPedido,
      'PURCHASE',
      order.id
    );

    // Also trigger in-app notification
    storage.addNotification({
      titulo: `¡Ganaste +${pointsEarned} X-Points!`,
      mensaje: `Por tu compra #${order.numeroPedido} sumaste ${pointsEarned} X-Points. Tu saldo actual es de ${res.newBalance} puntos.`,
      tipo: 'SISTEMA',
      leida: false,
      pedidoId: order.numeroPedido,
    });

    return { pointsEarned, newBalance: res.newBalance };
  },

  /**
   * Retrieves transaction ledger history for user.
   */
  getTransactions(userId?: string): LoyaltyTransaction[] {
    return storage.getLoyaltyTransactions(userId);
  },

  /**
   * Manually adds points (for bonuses, campaigns, or test simulations).
   */
  addBonusPoints(
    userId: string,
    points: number,
    description: string,
    type: LoyaltyTransaction['type'] = 'CAMPAIGN_BONUS'
  ): { newBalance: number; tx: LoyaltyTransaction } {
    const res = storage.addXPoints(userId, points, description, undefined, type);

    storage.addNotification({
      titulo: `¡Acreditación de +${points} X-Points!`,
      mensaje: `${description}. Nuevo saldo: ${res.newBalance} X-Points.`,
      tipo: 'SISTEMA',
      leida: false,
    });

    return res;
  },

  /**
   * Redeems points for discounts or perks.
   */
  redeemPoints(userId: string, pointsToRedeem: number, description: string): {
    success: boolean;
    discountBob: number;
    newBalance: number;
    error?: string;
  } {
    const current = this.getBalance(userId);
    if (pointsToRedeem > current) {
      return {
        success: false,
        discountBob: 0,
        newBalance: current,
        error: `Saldo insuficiente. Tienes ${current} X-Points.`,
      };
    }

    const discountBob = this.getMonetaryValue(pointsToRedeem);
    const res = storage.addXPoints(
      userId,
      -pointsToRedeem,
      description || `Canje de ${pointsToRedeem} X-Points por Bs. ${discountBob} de descuento`,
      undefined,
      'REDEEM'
    );

    return {
      success: true,
      discountBob,
      newBalance: res.newBalance,
    };
  },
};

