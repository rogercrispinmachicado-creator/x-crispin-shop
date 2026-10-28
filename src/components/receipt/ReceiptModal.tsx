import React from 'react';
import { X, Printer, Download, CheckCircle, ShieldCheck, QrCode } from 'lucide-react';
import { Order } from '../../types';
import { XLogo } from '../common/XLogo';
import { storage } from '../../services/storage';
import { pdfInvoiceService } from '../../services/pdfInvoiceService';

interface ReceiptModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen) return null;

  const config = storage.getConfig();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    try {
      pdfInvoiceService.generateAndDownloadInvoice(order);
    } catch (err) {
      console.error('Error generating PDF invoice:', err);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 receipt-modal-overlay">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150 receipt-modal-dialog">
        {/* Actions bar (hidden during print) */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 print:hidden no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Comprobante Oficial de Compra
            </span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
              {order.estadoPago}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              id="print-receipt-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={handleDownload}
              id="download-receipt-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Actual Printable Receipt Container */}
        <div id="printable-receipt" className="space-y-6 text-slate-800 font-sans print-sheet">
          {/* Brand Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-900 gap-4 receipt-header print-avoid-break">
            <div>
              <XLogo size="md" showSlogan={true} />
              <p className="text-[11px] text-slate-500 mt-2">
                {config.direccion}, {config.ciudad} • {config.pais}
              </p>
              <p className="text-[11px] text-slate-500">
                {config.bancoNitCi} • WhatsApp: {config.telefono}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg font-mono text-sm font-bold receipt-order-badge">
                {order.numeroPedido}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Fecha: {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-xs font-semibold text-cyan-700">
                Estado: {order.estado.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          {/* Customer & Delivery Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 receipt-customer-card print-avoid-break">
            <div>
              <h5 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-slate-400 mb-1">
                Datos del Cliente
              </h5>
              <p className="font-semibold text-slate-900">{order.clienteNombre} {order.clienteApellido}</p>
              <p className="text-slate-600">{order.clienteEmail}</p>
              <p className="text-slate-600">Tel/WhatsApp: {order.clienteWhatsapp || order.clienteTelefono}</p>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-slate-400 mb-1">
                Destino de Entrega ({order.departamento})
              </h5>
              <p className="font-semibold text-slate-900">{order.ciudad} - {order.zona}</p>
              <p className="text-slate-600">{order.direccion}</p>
              {order.referencia && <p className="text-slate-500 italic">Ref: {order.referencia}</p>}
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto receipt-items-wrapper">
            <table className="w-full text-left text-xs border-collapse receipt-table">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5">Producto</th>
                  <th className="py-2.5 text-center">Cant.</th>
                  <th className="py-2.5 text-right">Precio Unit.</th>
                  <th className="py-2.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="py-2">
                    <td className="py-2.5 pr-2">
                      <div className="font-semibold text-slate-900">{item.nombre}</div>
                      {item.varianteNombre && (
                        <div className="text-[10px] text-cyan-600 font-medium">
                          Variante: {item.varianteNombre}
                        </div>
                      )}
                      <div className="text-[10px] font-mono text-slate-400">SKU: {item.sku}</div>
                    </td>
                    <td className="py-2.5 text-center font-bold">{item.cantidad}</td>
                    <td className="py-2.5 text-right font-medium">Bs. {item.precioUnitario}</td>
                    <td className="py-2.5 text-right font-bold text-slate-900">Bs. {item.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Payment Method */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 receipt-totals-section print-avoid-break">
            <div className="text-xs space-y-1">
              <p className="text-slate-500">
                Método de Pago: <strong className="text-slate-800">{order.metodoPago.replace(/_/g, ' ')}</strong>
              </p>
              {order.comprobante && (
                <p className="text-slate-500">
                  Nro. Operación Bancaria: <strong className="font-mono text-slate-800">{order.comprobante.numeroOperacion}</strong>
                </p>
              )}
              <p className="text-slate-500">
                Método de Entrega: <strong className="text-slate-800">{order.metodoEntregaNombre}</strong>
              </p>

              {/* Verified Badge */}
              <div className="pt-2 flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                <CheckCircle className="w-4 h-4" />
                <span>Transacción Oficial Verificada X-CRISPIN Bolivia</span>
              </div>
            </div>

            <div className="w-full sm:w-56 space-y-1.5 text-xs text-right receipt-totals-box">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>Bs. {order.subtotal}</span>
              </div>
              {order.descuentoCupon > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Descuento ({order.codigoCupon}):</span>
                  <span>- Bs. {order.descuentoCupon}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Costo de Envío:</span>
                <span>Bs. {order.costoEnvio}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-300 receipt-total-row">
                <span>TOTAL:</span>
                <span className="text-cyan-700">Bs. {order.total}</span>
              </div>
            </div>
          </div>

          {/* Footer note & Security QR */}
          <div className="pt-4 border-t border-dashed border-slate-300 flex items-center justify-between text-[11px] text-slate-400 receipt-footer print-avoid-break">
            <div>
              <p className="font-semibold text-slate-600">¡Gracias por confiar en X-CRISPIN — SHOP THE X!</p>
              <p>Conserva este recibo para reclamos y validación de garantía oficial.</p>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
              <QrCode className="w-5 h-5 text-slate-700" />
              <span>SEG-VAL-{order.numeroPedido}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
