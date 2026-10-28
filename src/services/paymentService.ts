import { PaymentProof, PaymentStatus } from '../types';
import { storage } from './storage';
import { orderService } from './orderService';

export const paymentService = {
  uploadProof: (
    orderId: string,
    data: {
      numeroOperacion: string;
      fechaPago: string;
      comprobanteUrl: string;
      comprobanteNombre?: string;
      observacion?: string;
      subidoPorUsuario: string;
    }
  ): { success: boolean; error?: string } => {
    const orders = storage.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId || o.numeroPedido === orderId);
    if (idx === -1) {
      return { success: false, error: 'Pedido no encontrado' };
    }

    const order = orders[idx];
    const proof: PaymentProof = {
      id: `proof-${Date.now()}`,
      numeroOperacion: data.numeroOperacion.trim(),
      fechaPago: data.fechaPago || new Date().toISOString(),
      comprobanteUrl: data.comprobanteUrl,
      comprobanteNombre: data.comprobanteNombre || 'comprobante_transferencia.jpg',
      observacion: data.observacion,
      subidoPorUsuario: data.subidoPorUsuario,
    };

    order.comprobante = proof;
    order.estadoPago = 'COMPROBANTE_RECIBIDO';
    order.updatedAt = new Date().toISOString();

    orders[idx] = order;
    storage.saveOrders(orders);

    // Update order status with audit trail
    orderService.updateStatus(
      order.id,
      'PAGO_EN_REVISION',
      data.subidoPorUsuario,
      `Comprobante cargado. Nro Operación: ${proof.numeroOperacion}`
    );

    // Notify Reception Desk
    const notifs = storage.getNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      titulo: `Comprobante recibido: ${order.numeroPedido}`,
      mensaje: `Nro Operación: ${proof.numeroOperacion} por Bs. ${order.total}. Pendiente de validación.`,
      tipo: 'PAGO',
      leida: false,
      fecha: new Date().toISOString(),
      pedidoId: order.numeroPedido,
    });
    storage.saveNotifications(notifs);

    return { success: true };
  },

  reviewPayment: (
    orderId: string,
    approved: boolean,
    revisorNombre: string,
    observacion?: string
  ): { success: boolean; error?: string } => {
    const orders = storage.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId || o.numeroPedido === orderId);
    if (idx === -1) {
      return { success: false, error: 'Pedido no encontrado' };
    }

    const order = orders[idx];
    const now = new Date().toISOString();

    if (order.comprobante) {
      order.comprobante.revisadoPor = revisorNombre;
      order.comprobante.fechaRevision = now;
      if (!approved) {
        order.comprobante.motivoRechazo = observacion || 'Comprobante no coincide con extracto bancario';
      }
    }

    if (approved) {
      order.estadoPago = 'CONFIRMADO';
      orders[idx] = order;
      storage.saveOrders(orders);
      orderService.updateStatus(
        order.id,
        'PAGO_CONFIRMADO',
        revisorNombre,
        observacion || 'Comprobante verificado y fondos acreditados'
      );
    } else {
      order.estadoPago = 'RECHAZADO';
      orders[idx] = order;
      storage.saveOrders(orders);
      orderService.updateStatus(
        order.id,
        'PAGO_PENDIENTE',
        revisorNombre,
        observacion || 'Comprobante rechazado. Por favor subir nuevo comprobante legible.'
      );
    }

    return { success: true };
  },
};
