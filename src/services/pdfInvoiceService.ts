import { jsPDF } from 'jspdf';
import { Order } from '../types';
import { storage } from './storage';

// Helper to convert number to words in Spanish (Bolivianos)
function numberToSpanishWords(amount: number): string {
  const enteros = Math.floor(amount);
  const centavos = Math.round((amount - enteros) * 100);
  const centavosStr = centavos.toString().padStart(2, '0');

  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = [
    '',
    'DIEZ',
    'VEINTE',
    'TREINTA',
    'CUARENTA',
    'CINCUENTA',
    'SESENTA',
    'SETENTA',
    'OCHENTA',
    'NOVENTA',
  ];
  const especiales: { [key: number]: string } = {
    11: 'ONCE',
    12: 'DOCE',
    13: 'TRECE',
    14: 'CATORCE',
    15: 'QUINCE',
    16: 'DIECISEIS',
    17: 'DIECISIETE',
    18: 'DIECIOCHO',
    19: 'DIECINUEVE',
    21: 'VEINTIUNO',
    22: 'VEINTIDOS',
    23: 'VEINTITRES',
    24: 'VEINTICUATRO',
    25: 'VEINTICINCO',
    26: 'VEINTISEIS',
    27: 'VEINTISIETE',
    28: 'VEINTIOCHO',
    29: 'VEINTINUEVE',
  };

  const centenas = [
    '',
    'CIENTO',
    'DOSCIENTOS',
    'TRESCIENTOS',
    'CUATROCIENTOS',
    'QUINIENTOS',
    'SEISCIENTOS',
    'SETECIENTOS',
    'OCHOCIENTOS',
    'NOVECIENTOS',
  ];

  function convertGroup(n: number): string {
    if (n === 0) return '';
    if (n === 100) return 'CIEN';
    if (especiales[n]) return especiales[n];

    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    let res = '';
    if (c > 0) res += centenas[c] + ' ';

    const remainder = n % 100;
    if (especiales[remainder]) {
      res += especiales[remainder];
    } else if (d > 0) {
      res += decenas[d];
      if (u > 0) res += ' Y ' + unidades[u];
    } else if (u > 0) {
      res += unidades[u];
    }

    return res.trim();
  }

  let text = '';
  if (enteros === 0) {
    text = 'CERO';
  } else if (enteros === 1000) {
    text = 'MIL';
  } else if (enteros > 1000) {
    const miles = Math.floor(enteros / 1000);
    const resto = enteros % 1000;
    const milesStr = miles === 1 ? 'MIL' : `${convertGroup(miles)} MIL`;
    const restoStr = convertGroup(resto);
    text = `${milesStr} ${restoStr}`.trim();
  } else {
    text = convertGroup(enteros);
  }

  return `SON: ${text} ${centavosStr}/100 BOLIVIANOS`;
}

export const pdfInvoiceService = {
  generateAndDownloadInvoice: (order: Order) => {
    const config = storage.getConfig();
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    // --- Header Background Accent ---
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, 12, contentWidth, 24, 'F');

    // Brand Name & Slogan
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('X-CRISPIN', margin + 6, 22);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(6, 182, 212); // cyan-400
    doc.text('SHOP THE X  |  TECNOLOGÍA OFICIAL EN BOLIVIA', margin + 6, 29);

    // Invoice Number Badge in Header
    doc.setFillColor(8, 145, 178); // cyan-600
    doc.roundedRect(pageWidth - margin - 58, 16, 52, 16, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('FACTURA COMERCIAL', pageWidth - margin - 32, 21, { align: 'center' });
    doc.setFontSize(10);
    doc.text(order.numeroPedido, pageWidth - margin - 32, 27, { align: 'center' });

    // --- Company & Tax Info Box (Bolivian Fiscal Format) ---
    let y = 42;
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    doc.text(`Razón Social: ${config.nombre || 'X-CRISPIN'} S.R.L.`, margin, y);
    doc.text(`Casa Matriz: ${config.direccion}, ${config.ciudad} - Bolivia`, margin, y + 4);
    doc.text(`Teléfono / WhatsApp: ${config.telefono} | Correo: ${config.email}`, margin, y + 8);

    // Fiscal Control Box on Right
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(pageWidth - margin - 65, y - 3, 65, 17, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`NIT / CI: ${config.bancoNitCi || '1029384756'}`, pageWidth - margin - 60, y + 2);
    doc.setFont('helvetica', 'normal');
    doc.text(`Factura N°: ${order.numeroPedido.replace('XC-', 'FAC-')}`, pageWidth - margin - 60, y + 6);
    doc.text(`Cód. Autorización: 491B-28A3-F47C`, pageWidth - margin - 60, y + 10);

    // Divider Line
    y += 18;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);

    // --- Customer & Delivery Info Section ---
    y += 6;
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(margin, y, contentWidth, 20, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, contentWidth, 20, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('DATOS DEL CLIENTE & FACTURACIÓN', margin + 4, y + 5);
    doc.text('DATOS DE ENTREGA & DESTINO', margin + 95, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Señor(es): ${order.clienteNombre} ${order.clienteApellido}`, margin + 4, y + 10);
    doc.text(`Tel / WhatsApp: ${order.clienteWhatsapp || order.clienteTelefono}`, margin + 4, y + 14);
    doc.text(`Email: ${order.clienteEmail}`, margin + 4, y + 18);

    doc.text(`Ciudad: ${order.ciudad} (${order.departamento}) - ${order.zona}`, margin + 95, y + 10);
    doc.text(`Dirección: ${order.direccion.substring(0, 42)}`, margin + 95, y + 14);
    doc.text(`Método de Envío: ${order.metodoEntregaNombre.substring(0, 40)}`, margin + 95, y + 18);

    // --- Order Items Table ---
    y += 26;

    // Table Header
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, contentWidth, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('CANT.', margin + 4, y + 5);
    doc.text('DESCRIPCIÓN DEL PRODUCTO / ÍTEM', margin + 20, y + 5);
    doc.text('SKU', margin + 115, y + 5);
    doc.text('P. UNIT (BS.)', margin + 142, y + 5, { align: 'right' });
    doc.text('SUBTOTAL (BS.)', pageWidth - margin - 4, y + 5, { align: 'right' });

    y += 7;

    // Table Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    order.items.forEach((item, index) => {
      // Alternate row background
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, 9, 'F');
      }

      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + 9, pageWidth - margin, y + 9);

      // Content
      doc.setFont('helvetica', 'bold');
      doc.text(item.cantidad.toString(), margin + 6, y + 6);

      doc.setFont('helvetica', 'normal');
      const itemTitle = item.varianteNombre
        ? `${item.nombre} [${item.varianteNombre}]`
        : item.nombre;
      doc.text(itemTitle.substring(0, 50), margin + 20, y + 6);

      doc.setFont('courier', 'normal');
      doc.setFontSize(7.5);
      doc.text(item.sku.substring(0, 16), margin + 115, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(item.precioUnitario.toFixed(2), margin + 142, y + 6, { align: 'right' });
      doc.setFont('helvetica', 'bold');
      doc.text(item.subtotal.toFixed(2), pageWidth - margin - 4, y + 6, { align: 'right' });

      y += 9;
    });

    // Space after table
    y += 4;

    // --- Financial Summary & Literal Amount ---
    const summaryBoxY = y;
    const summaryWidth = 65;
    const summaryX = pageWidth - margin - summaryWidth;

    // Left side: Literal amount and Payment Details
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, summaryBoxY, contentWidth - summaryWidth - 6, 32, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('IMPORTE EN LITERAL:', margin + 4, summaryBoxY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(numberToSpanishWords(order.total), margin + 4, summaryBoxY + 11);

    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DE PAGO & VALIDACIÓN:', margin + 4, summaryBoxY + 18);

    doc.setFont('helvetica', 'normal');
    doc.text(`Método de Pago: ${order.metodoPago.replace(/_/g, ' ')}`, margin + 4, summaryBoxY + 23);
    const estadoPagoText = order.estadoPago === 'CONFIRMADO' ? 'PAGO CONFIRMADO (PAGADO)' : order.estadoPago;
    doc.text(`Estado de Pago: ${estadoPagoText}`, margin + 4, summaryBoxY + 27);

    // Right side: Totals Box
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(summaryX, summaryBoxY, summaryWidth, 32, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    doc.text('Subtotal:', summaryX + 4, summaryBoxY + 6);
    doc.text(`Bs. ${order.subtotal.toFixed(2)}`, pageWidth - margin - 4, summaryBoxY + 6, { align: 'right' });

    if (order.descuentoCupon > 0) {
      doc.setTextColor(16, 185, 129); // emerald-600
      doc.text(`Descuento (${order.codigoCupon || 'Cupón'}):`, summaryX + 4, summaryBoxY + 11);
      doc.text(`- Bs. ${order.descuentoCupon.toFixed(2)}`, pageWidth - margin - 4, summaryBoxY + 11, { align: 'right' });
      doc.setTextColor(71, 85, 105);
    } else {
      doc.text('Descuentos:', summaryX + 4, summaryBoxY + 11);
      doc.text('Bs. 0.00', pageWidth - margin - 4, summaryBoxY + 11, { align: 'right' });
    }

    doc.text('Costo de Envío:', summaryX + 4, summaryBoxY + 16);
    doc.text(`Bs. ${order.costoEnvio.toFixed(2)}`, pageWidth - margin - 4, summaryBoxY + 16, { align: 'right' });

    // Total highlight row
    doc.setFillColor(15, 23, 42);
    doc.rect(summaryX, summaryBoxY + 20, summaryWidth, 12, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL A PAGAR:', summaryX + 4, summaryBoxY + 27);
    doc.setFontSize(10);
    doc.setTextColor(6, 182, 212); // cyan-400
    doc.text(`Bs. ${order.total.toFixed(2)}`, pageWidth - margin - 4, summaryBoxY + 27, { align: 'right' });

    // --- Official Bolivian Fiscal Note & Security Stamp ---
    y = summaryBoxY + 38;

    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y, pageWidth - margin, y);

    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      '"ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE ACUERDO A LEY"',
      pageWidth / 2,
      y,
      { align: 'center' }
    );

    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(
      'Ley N° 453: Los servicios deben prestarse en condiciones de inocuidad, calidad y seguridad • Garantía Oficial X-CRISPIN 12 Meses',
      pageWidth / 2,
      y,
      { align: 'center' }
    );

    // Paid Stamp for Completed Purchases
    if (order.estadoPago === 'CONFIRMADO' || order.estado === 'ENTREGADO' || order.estado === 'ENVIADO') {
      doc.setDrawColor(16, 185, 129); // emerald
      doc.setLineWidth(0.8);
      doc.roundedRect(pageWidth - margin - 42, y + 3, 42, 10, 2, 2, 'D');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(16, 185, 129);
      doc.text('PAGADO / CONFIRMADO', pageWidth - margin - 21, y + 9.5, { align: 'center' });
    }

    // Save/Download PDF
    const filename = `Factura_X-CRISPIN_${order.numeroPedido}.pdf`;
    doc.save(filename);
  },
};
