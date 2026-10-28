import { ProductReview, User, Order } from '../types';
import { storage } from './storage';
import { loyaltyService } from './loyaltyService';

export interface RatingBreakdown {
  averageRating: number;
  totalReviews: number;
  verifiedCount: number;
  recommendationRate: number;
  starCounts: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  starPercentages: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export const reviewService = {
  /**
   * Retrieves all approved reviews for a given product, sorted by newest first.
   */
  getReviewsForProduct(productId: string): ProductReview[] {
    const all = storage.getReviews();
    return all.filter((r) => r.productoId === productId && r.aprobado !== false);
  },

  /**
   * Verifies if a user has purchased this product previously in any confirmed order.
   */
  checkVerifiedBuyer(
    productId: string,
    user?: User | null
  ): { isVerified: boolean; orderNumber?: string; purchaseDate?: string } {
    if (!user) return { isVerified: false };

    const orders = storage.getOrders();
    for (const order of orders) {
      const isUserOrder =
        order.clienteId === user.id ||
        order.clienteEmail.toLowerCase() === user.email.toLowerCase();

      if (isUserOrder) {
        const itemMatch = order.items.find((item) => item.productoId === productId);
        if (itemMatch) {
          return {
            isVerified: true,
            orderNumber: order.numeroPedido,
            purchaseDate: order.createdAt,
          };
        }
      }
    }

    return { isVerified: false };
  },

  /**
   * Calculates comprehensive rating metrics and distribution for a product.
   */
  getRatingBreakdown(productId: string): RatingBreakdown {
    const reviews = this.getReviewsForProduct(productId);
    const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let verifiedCount = 0;
    let recommendCount = 0;
    let totalScore = 0;

    for (const r of reviews) {
      const star = Math.min(5, Math.max(1, Math.round(r.calificacion))) as 1 | 2 | 3 | 4 | 5;
      starCounts[star] = (starCounts[star] || 0) + 1;
      totalScore += r.calificacion;
      if (r.compraVerificada) verifiedCount++;
      if (r.recomienda !== false) recommendCount++;
    }

    const total = reviews.length;
    const averageRating = total > 0 ? Number((totalScore / total).toFixed(1)) : 5.0;
    const recommendationRate = total > 0 ? Math.round((recommendCount / total) * 100) : 100;

    const starPercentages = {
      5: total > 0 ? Math.round((starCounts[5] / total) * 100) : 0,
      4: total > 0 ? Math.round((starCounts[4] / total) * 100) : 0,
      3: total > 0 ? Math.round((starCounts[3] / total) * 100) : 0,
      2: total > 0 ? Math.round((starCounts[2] / total) * 100) : 0,
      1: total > 0 ? Math.round((starCounts[1] / total) * 100) : 0,
    };

    return {
      averageRating,
      totalReviews: total,
      verifiedCount,
      recommendationRate,
      starCounts,
      starPercentages,
    };
  },

  /**
   * Adds a new review, recalculates product rating, updates the catalog, and awards loyalty points.
   */
  addReview(params: {
    productoId: string;
    productoNombre?: string;
    usuarioId: string;
    usuarioNombre: string;
    usuarioCiudad?: string;
    calificacion: number;
    titulo: string;
    comentario: string;
    recomienda?: boolean;
    compraVerificada?: boolean;
    orderNumber?: string;
  }): { review: ProductReview; newRating: number; newCount: number } {
    const {
      productoId,
      productoNombre,
      usuarioId,
      usuarioNombre,
      usuarioCiudad,
      calificacion,
      titulo,
      comentario,
      recomienda = true,
      compraVerificada = false,
      orderNumber,
    } = params;

    const newReview: ProductReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productoId,
      usuarioId,
      usuarioNombre,
      usuarioCiudad,
      calificacion: Math.min(5, Math.max(1, calificacion)),
      titulo: titulo.trim(),
      comentario: comentario.trim(),
      recomienda,
      compraVerificada,
      orderNumber,
      votosUtiles: 0,
      aprobado: true,
      createdAt: new Date().toISOString(),
    };

    const currentReviews = storage.getReviews();
    const updatedReviews = [newReview, ...currentReviews];
    storage.saveReviews(updatedReviews);

    // Recalculate average rating & reviewsCount for the product
    const allProdReviews = updatedReviews.filter((r) => r.productoId === productoId && r.aprobado);
    const sum = allProdReviews.reduce((acc, r) => acc + r.calificacion, 0);
    const newRating = Number((sum / allProdReviews.length).toFixed(1));
    const newCount = allProdReviews.length;

    // Update in products database
    const allProducts = storage.getProducts();
    const targetIdx = allProducts.findIndex((p) => p.id === productoId);
    if (targetIdx !== -1) {
      allProducts[targetIdx] = {
        ...allProducts[targetIdx],
        rating: newRating,
        reviewsCount: newCount,
      };
      storage.saveProducts(allProducts);
    }

    // Award loyalty points bonus for verified review
    if (compraVerificada) {
      loyaltyService.addBonusPoints(
        usuarioId,
        25,
        `Bono por reseña verificada de "${productoNombre || 'producto'}"`,
        'CAMPAIGN_BONUS'
      );
    }

    // Send confirmation notification
    storage.addNotification({
      titulo: `¡Reseña publicada! (${calificacion} ★)`,
      mensaje: `Tu opinión sobre "${productoNombre || 'este producto'}" fue publicada con éxito.${
        compraVerificada ? ' Sumaste +25 X-Points por compra verificada.' : ''
      }`,
      tipo: 'SISTEMA',
      productoId,
      leida: false,
    });

    return { review: newReview, newRating, newCount };
  },

  /**
   * Increments the helpful votes counter for a review.
   */
  voteHelpful(reviewId: string): number {
    const reviews = storage.getReviews();
    let updatedVotes = 0;
    const updated = reviews.map((r) => {
      if (r.id === reviewId) {
        updatedVotes = (r.votosUtiles || 0) + 1;
        return { ...r, votosUtiles: updatedVotes };
      }
      return r;
    });
    storage.saveReviews(updated);
    return updatedVotes;
  },

  /**
   * Helper for testers to simulate a verified purchase of a product in one click.
   */
  simulatePurchaseVerification(productId: string, user: User, productTitle: string): { orderNumber: string } {
    const orderNumber = `XC-2025-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const simulatedOrder: Order = {
      id: `ord-sim-${Date.now()}`,
      numeroPedido: orderNumber,
      clienteId: user.id,
      clienteNombre: user.name,
      clienteApellido: user.lastName || '',
      clienteEmail: user.email,
      clienteTelefono: user.phone || '+591 70000000',
      clienteWhatsapp: user.whatsapp || '59170000000',
      departamento: user.department || 'La Paz',
      ciudad: user.city || 'La Paz',
      zona: 'Centro Comercial',
      direccion: 'Av. Principal #100',
      referencia: 'Compra verificada en plataforma',
      metodoEntregaId: 'deliv-loc',
      metodoEntregaNombre: 'Entrega Express Verificada',
      costoEnvio: 0,
      items: [
        {
          productoId: productId,
          sku: `SKU-${productId.toUpperCase()}`,
          nombre: productTitle,
          imagen: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
          precioUnitario: 100,
          cantidad: 1,
          subtotal: 100,
        },
      ],
      subtotal: 100,
      descuentoCupon: 0,
      total: 100,
      moneda: 'BOB',
      metodoPago: 'QR_SIMPLE',
      estadoPago: 'CONFIRMADO',
      estado: 'ENTREGADO',
      historialEstados: [
        {
          id: `h-sim-${Date.now()}`,
          fecha: new Date().toLocaleDateString(),
          hora: new Date().toLocaleTimeString(),
          usuario: 'Sistema de Verificación',
          estadoAnterior: 'NUEVO',
          estadoNuevo: 'ENTREGADO',
          observacion: 'Compra verificada y confirmada en sistema',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const orders = storage.getOrders();
    orders.unshift(simulatedOrder);
    storage.saveOrders(orders);

    storage.addNotification({
      titulo: `¡Compra Verificada Registrada! (#${orderNumber})`,
      mensaje: `Ahora eres un comprador verificado de "${productTitle}". Puedes publicar tu reseña con la insignia oficial.`,
      tipo: 'PEDIDO',
      pedidoId: orderNumber,
      leida: false,
    });

    return { orderNumber };
  },
};
