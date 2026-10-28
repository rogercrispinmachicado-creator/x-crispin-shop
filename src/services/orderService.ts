import { Order, OrderStatus, OrderItem, PaymentMethodType, InventoryMovement } from '../types';
import { storage } from './storage';
import { loyaltyService } from './loyaltyService';

export const orderService = {
  getAll: (): Order[] => {
    return storage.getOrders();
  },

  getByIdOrNumber: (idOrNumber: string): Order | undefined => {
    const clean = idOrNumber.trim().toUpperCase();
    return storage
      .getOrders()
      .find((o) => o.id === idOrNumber || o.numeroPedido.toUpperCase() === clean);
  },

  getByUserId: (userId: string, email?: string): Order[] => {
    const cleanEmail = email?.trim().toLowerCase();
    return storage.getOrders().filter((o) => {
      if (o.clienteId === userId) return true;
      if (cleanEmail && o.clienteEmail && o.clienteEmail.trim().toLowerCase() === cleanEmail) return true;
      return false;
    });
  },

  getBySellerId: (sellerId: string): Order[] => {
    return storage.getOrders().filter((o) => o.vendedorId === sellerId);
  },

  createOrder: (data: {
    clienteId: string;
    clienteNombre: string;
    clienteApellido: string;
    clienteEmail: string;
    clienteTelefono: string;
    clienteWhatsapp: string;
    vendedorId?: string;
    vendedorNombre?: string;
    departamento: string;
    ciudad: string;
    zona: string;
    direccion: string;
    referencia: string;
    metodoEntregaId: string;
    metodoEntregaNombre: string;
    costoEnvio: number;
    items: OrderItem[];
    subtotal: number;
    descuentoCupon: number;
    codigoCupon?: string;
    total: number;
    metodoPago: PaymentMethodType;
    notas?: string;
  }): { success: boolean; order?: Order; error?: string } => {
    // 1. Stock validation before creating order
    const products = storage.getProducts();
    for (const item of data.items) {
      const prod = products.find((p) => p.id === item.productoId);
      if (!prod) {
        return { success: false, error: `El producto ${item.nombre} ya no está disponible.` };
      }
      const available = prod.stockTotal - prod.stockReservado;
      if (item.cantidad > available) {
        return {
          success: false,
          error: `Stock insuficiente para ${prod.nombre}. Solo quedan ${available} unidades disponibles.`,
        };
      }
    }

    // 2. Generate unique order number
    const orders = storage.getOrders();
    const sequence = (orders.length + 101).toString().padStart(4, '0');
    const orderNumber = `XC-${new Date().getFullYear()}-${sequence}`;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().substring(0, 5);

    // 3. Deduct/Reserve inventory and log movements
    const movements = storage.getMovements();
    data.items.forEach((item) => {
      const prod = products.find((p) => p.id === item.productoId);
      if (prod) {
        prod.stockReservado += item.cantidad;
        const movement: InventoryMovement = {
          id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          productoId: prod.id,
          productoNombre: prod.nombre,
          cantidad: -item.cantidad,
          tipo: 'RESERVA',
          stockAnterior: prod.stockTotal - (prod.stockReservado - item.cantidad),
          stockNuevo: prod.stockTotal - prod.stockReservado,
          usuario: `${data.clienteNombre} ${data.clienteApellido}`,
          motivo: `Reserva por nuevo pedido ${orderNumber}`,
          pedidoId: orderNumber,
          fecha: `${dateStr} ${timeStr}`,
        };
        movements.unshift(movement);
      }
    });
    storage.saveProducts(products);
    storage.saveMovements(movements);

    // 4. Build Order object
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      numeroPedido: orderNumber,
      clienteId: data.clienteId,
      clienteNombre: data.clienteNombre,
      clienteApellido: data.clienteApellido,
      clienteEmail: data.clienteEmail,
      clienteTelefono: data.clienteTelefono,
      clienteWhatsapp: data.clienteWhatsapp,
      vendedorId: data.vendedorId,
      vendedorNombre: data.vendedorNombre,
      departamento: data.departamento,
      ciudad: data.ciudad,
      zona: data.zona,
      direccion: data.direccion,
      referencia: data.referencia,
      metodoEntregaId: data.metodoEntregaId,
      metodoEntregaNombre: data.metodoEntregaNombre,
      costoEnvio: data.costoEnvio,
      items: data.items,
      subtotal: data.subtotal,
      descuentoCupon: data.descuentoCupon,
      codigoCupon: data.codigoCupon,
      total: data.total,
      moneda: 'BOB',
      metodoPago: data.metodoPago,
      estadoPago: 'PENDIENTE',
      estado: 'PAGO_PENDIENTE',
      historialEstados: [
        {
          id: `hist-${Date.now()}`,
          fecha: dateStr,
          hora: timeStr,
          usuario: `${data.clienteNombre} ${data.clienteApellido}`,
          estadoAnterior: 'NUEVO',
          estadoNuevo: 'PAGO_PENDIENTE',
          observacion: `Pedido registrado con método de pago: ${data.metodoPago.replace('_', ' ')}`,
        },
      ],
      xPointsEarned: loyaltyService.calculatePointsForOrder(data.subtotal, data.items),
      notas: data.notas,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    orders.unshift(newOrder);
    storage.saveOrders(orders);

    // Award loyalty X-Points to customer
    loyaltyService.awardPointsForOrder(newOrder);

    // Trigger Notification for Reception/Admin
    const notifs = storage.getNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      titulo: `Nuevo Pedido ${newOrder.numeroPedido}`,
      mensaje: `${newOrder.clienteNombre} ha realizado un pedido por Bs. ${newOrder.total} (${newOrder.departamento})`,
      tipo: 'PEDIDO',
      leida: false,
      fecha: now.toISOString(),
      pedidoId: newOrder.numeroPedido,
    });
    storage.saveNotifications(notifs);

    return { success: true, order: newOrder };
  },

  updateStatus: (
    orderId: string,
    newStatus: OrderStatus,
    usuario: string,
    observacion: string
  ): Order | undefined => {
    const orders = storage.getOrders();
    const idx = orders.findIndex((o) => o.id === orderId || o.numeroPedido === orderId);
    if (idx === -1) return undefined;

    const order = orders[idx];
    const prevStatus = order.estado;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().substring(0, 5);

    // If order is delivered or cancelled, adjust permanent inventory
    const products = storage.getProducts();
    const movements = storage.getMovements();

    if (newStatus === 'ENTREGADO' && prevStatus !== 'ENTREGADO') {
      // Convert reserved to sold
      order.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productoId);
        if (prod) {
          prod.stockTotal = Math.max(0, prod.stockTotal - item.cantidad);
          prod.stockReservado = Math.max(0, prod.stockReservado - item.cantidad);
          movements.unshift({
            id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            productoId: prod.id,
            productoNombre: prod.nombre,
            cantidad: -item.cantidad,
            tipo: 'VENTA',
            stockAnterior: prod.stockTotal + item.cantidad,
            stockNuevo: prod.stockTotal,
            usuario,
            motivo: `Entrega completada de pedido ${order.numeroPedido}`,
            pedidoId: order.numeroPedido,
            fecha: `${dateStr} ${timeStr}`,
          });
        }
      });
      storage.saveProducts(products);
      storage.saveMovements(movements);
    } else if (newStatus === 'CANCELADO' && prevStatus !== 'CANCELADO') {
      // Release reservation back to available
      order.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productoId);
        if (prod) {
          prod.stockReservado = Math.max(0, prod.stockReservado - item.cantidad);
          movements.unshift({
            id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            productoId: prod.id,
            productoNombre: prod.nombre,
            cantidad: item.cantidad,
            tipo: 'LIBERACION',
            stockAnterior: prod.stockTotal - (prod.stockReservado + item.cantidad),
            stockNuevo: prod.stockTotal - prod.stockReservado,
            usuario,
            motivo: `Liberación por cancelación de pedido ${order.numeroPedido}`,
            pedidoId: order.numeroPedido,
            fecha: `${dateStr} ${timeStr}`,
          });
        }
      });
      storage.saveProducts(products);
      storage.saveMovements(movements);
    }

    order.estado = newStatus;
    order.updatedAt = now.toISOString();
    order.historialEstados.push({
      id: `hist-${Date.now()}`,
      fecha: dateStr,
      hora: timeStr,
      usuario,
      estadoAnterior: prevStatus,
      estadoNuevo: newStatus,
      observacion: observacion || `Estado actualizado a ${newStatus}`,
    });

    orders[idx] = order;
    storage.saveOrders(orders);

    // Push notification to user
    const notifs = storage.getNotifications();
    notifs.unshift({
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      titulo: `Pedido ${order.numeroPedido}: ${newStatus.replace(/_/g, ' ')}`,
      mensaje: observacion || `Tu pedido ahora se encuentra en estado: ${newStatus.replace(/_/g, ' ')}`,
      tipo: 'PEDIDO',
      leida: false,
      fecha: now.toISOString(),
      pedidoId: order.numeroPedido,
    });
    storage.saveNotifications(notifs);

    return order;
  },
};
