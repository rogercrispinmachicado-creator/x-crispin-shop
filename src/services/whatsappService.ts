import { Product, Order } from '../types';
import { storage } from './storage';

export const whatsappService = {
  buildProductShareUrl: (product: Product, targetPhone?: string): string => {
    const config = storage.getConfig();
    const phone = targetPhone || config.whatsapp;
    const currentUrl = window.location.origin + `/producto/${product.slug}`;
    const ofertaTexto =
      product.descuento && product.descuento > 0
        ? `🔥 ¡OFERTA ESPECIAL! ${product.descuento}% de descuento (Antes Bs. ${product.precioAnterior})`
        : '✨ Producto con garantía oficial en Bolivia';

    const text = `Hola, mira este producto de X-CRISPIN — SHOP THE X:

📱 *${product.nombre}*
💰 *Precio:* Bs. ${product.precio}
${ofertaTexto}

🔗 *Ver en tienda:* ${currentUrl}

_X-CRISPIN • Bolivia_`;

    return `https://wa.me/${phone ? phone.replace(/[^0-9]/g, '') : ''}?text=${encodeURIComponent(text)}`;
  },

  buildOrderShareUrl: (order: Order, targetPhone?: string): string => {
    const config = storage.getConfig();
    const phone = targetPhone || config.whatsapp;
    const trackingUrl = window.location.origin + `/seguimiento?pedido=${order.numeroPedido}`;

    const itemsSummary = order.items
      .map((it) => `• ${it.cantidad}x ${it.nombre} (Bs. ${it.subtotal})`)
      .join('\n');

    const text = `*X-CRISPIN — SHOP THE X*
📦 *Detalles de tu Pedido: ${order.numeroPedido}*

👤 *Cliente:* ${order.clienteNombre} ${order.clienteApellido}
📍 *Destino:* ${order.ciudad}, ${order.departamento}
💳 *Método de Pago:* ${order.metodoPago.replace('_', ' ')}
🏷️ *Estado:* ${order.estado.replace(/_/g, ' ')}

🛒 *Artículos:*
${itemsSummary}

💵 *Total:* Bs. ${order.total}

🔍 *Seguimiento en línea en vivo:*
${trackingUrl}`;

    return `https://wa.me/${phone ? phone.replace(/[^0-9]/g, '') : ''}?text=${encodeURIComponent(text)}`;
  },

  buildTrackingShareUrl: (orderNumber: string, targetPhone?: string): string => {
    const config = storage.getConfig();
    const phone = targetPhone || config.whatsapp;
    const trackingUrl = window.location.origin + `/seguimiento?pedido=${orderNumber}`;

    const text = `Hola, aquí puedes consultar el estado actualizado de tu pedido *${orderNumber}* en X-CRISPIN — SHOP THE X:

🔗 *Enlace de seguimiento:*
${trackingUrl}`;

    return `https://wa.me/${phone ? phone.replace(/[^0-9]/g, '') : ''}?text=${encodeURIComponent(text)}`;
  },

  buildSupportUrl: (customMessage?: string, targetPhone?: string): string => {
    const config = storage.getConfig();
    const phone = targetPhone || config.whatsapp || '59172902338';
    const text =
      customMessage ||
      `Hola X-CRISPIN Bolivia, me comunico para solicitar soporte técnico y asistencia con mi cuenta/pedido.`;

    return `https://wa.me/${phone ? phone.replace(/[^0-9]/g, '') : '59172902338'}?text=${encodeURIComponent(text)}`;
  },

  buildInformationUrl: (queryTopic?: string, targetPhone?: string): string => {
    const config = storage.getConfig();
    const phone = targetPhone || config.whatsapp || '59172902338';
    const topic = queryTopic ? ` sobre ${queryTopic}` : '';
    const text = `Hola X-CRISPIN Bolivia, deseo recibir información comercial${topic} y asesoramiento para envíos nacionales.`;

    return `https://wa.me/${phone ? phone.replace(/[^0-9]/g, '') : '59172902338'}?text=${encodeURIComponent(text)}`;
  },

  buildOrderSupportUrl: (orderNumber: string, targetPhone?: string): string => {
    const config = storage.getConfig();
    const phone = targetPhone || config.whatsapp || '59172902338';
    const text = `Hola Soporte X-CRISPIN, necesito asistencia con mi pedido con código *${orderNumber}*. ¿Podrían orientarme por favor?`;

    return `https://wa.me/${phone ? phone.replace(/[^0-9]/g, '') : '59172902338'}?text=${encodeURIComponent(text)}`;
  },
};
