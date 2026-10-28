import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  ShieldCheck,
  AlertCircle,
  Receipt,
  MessageCircle,
  Upload,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { whatsappService } from '../services/whatsappService';
import { Order, OrderStatus } from '../types';
import { ReceiptModal } from '../components/receipt/ReceiptModal';

interface OrderTrackingPageProps {
  initialOrderNumber?: string;
  onNavigateToCatalog: () => void;
}

const ORDER_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'PAGO_PENDIENTE', label: 'Pedido Recibido', desc: 'Registro en sistema' },
  { status: 'PAGO_CONFIRMADO', label: 'Pago Verificado', desc: 'Fondos acreditados' },
  { status: 'PREPARANDO', label: 'En Preparación', desc: 'Empacado en almacén' },
  { status: 'LISTO_PARA_ENTREGA', label: 'Listo para Entrega', desc: 'Esperando despacho' },
  { status: 'ENVIADO', label: 'En Camino / Despachado', desc: 'En ruta de entrega' },
  { status: 'ENTREGADO', label: 'Entregado con Éxito', desc: 'Recepción confirmada' },
];

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  initialOrderNumber,
  onNavigateToCatalog,
}) => {
  const [searchInput, setSearchInput] = useState(initialOrderNumber || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  // Upload proof in tracking state
  const [showProofForm, setShowProofForm] = useState(false);
  const [opNumber, setOpNumber] = useState('');
  const [proofUrl, setProofUrl] = useState(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'
  );

  const loadOrder = (query: string) => {
    if (!query.trim()) return;
    setSearchAttempted(true);
    const found = orderService.getByIdOrNumber(query.trim());
    setOrder(found || null);
  };

  useEffect(() => {
    if (initialOrderNumber) {
      setSearchInput(initialOrderNumber);
      loadOrder(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrder(searchInput);
  };

  const handleUploadProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !opNumber.trim()) return;

    const res = paymentService.uploadProof(order.id, {
      numeroOperacion: opNumber,
      fechaPago: new Date().toISOString(),
      comprobanteUrl: proofUrl,
      subidoPorUsuario: `${order.clienteNombre} ${order.clienteApellido}`,
      observacion: 'Comprobante cargado desde página de seguimiento',
    });

    if (res.success) {
      alert('Comprobante subido con éxito. El equipo de recepción lo verificará en breve.');
      setShowProofForm(false);
      const updated = orderService.getByIdOrNumber(order.id);
      if (updated) setOrder(updated);
    }
  };

  const getStepIndex = (status: OrderStatus): number => {
    if (status === 'CANCELADO') return -1;
    if (status === 'PAGO_EN_REVISION') return 0; // between 0 and 1
    const idx = ORDER_STEPS.findIndex((s) => s.status === status);
    return idx !== -1 ? idx : 0;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-sans">
      {/* Header & Search */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-600">
          Seguimiento en Vivo
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Rastreo de Pedidos X-CRISPIN
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Ingresa tu número de pedido (ej. <strong className="font-mono text-slate-700">XC-2025-0101</strong>) para conocer el estado exacto de entrega en Bolivia.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="pt-3 max-w-md mx-auto flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Número de pedido (ej. XC-2025-0101)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:bg-white focus:border-cyan-500 outline-hidden"
              id="tracking-search-input"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            id="tracking-search-btn"
            className="px-6 py-3 bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            Consultar
          </button>
        </form>
      </div>

      {/* When no order is searched or found */}
      {!order && searchAttempted && (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-4 max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Pedido no encontrado</h3>
          <p className="text-xs text-slate-500">
            No encontramos ningún pedido registrado con el identificador{' '}
            <strong className="font-mono text-slate-800">{searchInput}</strong>. Por favor verifica el número en tu correo o recibo.
          </p>
        </div>
      )}

      {/* Active Order Details */}
      {order && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Top Status Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Pedido Oficial
                  </span>
                  <span className="font-mono font-black text-slate-900 text-lg">
                    {order.numeroPedido}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Registrado el {new Date(order.createdAt).toLocaleDateString()} a las{' '}
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status Badges */}
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                    order.estado === 'ENTREGADO'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.estado === 'CANCELADO'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-cyan-100 text-cyan-800'
                  }`}
                >
                  {order.estado.replace(/_/g, ' ')}
                </span>

                <button
                  onClick={() => setShowReceipt(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Ver Recibo</span>
                </button>

                <button
                  onClick={() => {
                    const url = whatsappService.buildTrackingShareUrl(order.numeroPedido);
                    window.open(url, '_blank');
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Compartir por WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Visual Step Progress Bar */}
            <div className="py-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {ORDER_STEPS.map((step, idx) => {
                  const currentIdx = getStepIndex(order.estado);
                  const isCompleted = currentIdx >= idx;
                  const isCurrent = currentIdx === idx;

                  return (
                    <div
                      key={step.status}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isCurrent
                          ? 'border-cyan-500 bg-cyan-50/70 shadow-xs ring-2 ring-cyan-100'
                          : isCompleted
                          ? 'border-emerald-200 bg-emerald-50/40 text-slate-800'
                          : 'border-slate-200 bg-slate-50 text-slate-400 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold mb-2 ${
                          isCurrent
                            ? 'bg-cyan-600 text-white animate-pulse'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <h4 className="text-xs font-bold leading-tight text-slate-900">{step.label}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment proof upload alert if pending */}
            {order.estadoPago === 'PENDIENTE' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold text-amber-900">Pago Pendiente de Acreditación</p>
                    <p className="text-amber-700">
                      Transfiere o escanea con QR Simple y adjunta tu comprobante para acelerar la preparación.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowProofForm((prev) => !prev)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl whitespace-nowrap transition-colors"
                >
                  {showProofForm ? 'Cerrar formulario' : 'Adjuntar Comprobante'}
                </button>
              </div>
            )}

            {/* Upload proof form dropdown */}
            {showProofForm && (
              <form
                onSubmit={handleUploadProof}
                className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in"
              >
                <h4 className="text-xs font-bold text-slate-900">
                  Subir Comprobante de Pago Bancario / QR Simple:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Nro. de Operación Bancaria *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. OP-449102"
                      value={opNumber}
                      onChange={(e) => setOpNumber(e.target.value)}
                      required
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      URL del Comprobante / Recibo
                    </label>
                    <input
                      type="text"
                      value={proofUrl}
                      onChange={(e) => setProofUrl(e.target.value)}
                      required
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-600"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Enviar Comprobante a Recepción
                </button>
              </form>
            )}
          </div>

          {/* Audit History Timeline */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Historial Detallado de Auditoría</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
              {order.historialEstados.map((hist, i) => (
                <div key={i} className="relative flex items-start gap-4 pl-6">
                  <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-cyan-600 ring-4 ring-white" />
                  <div className="flex-1 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center justify-between font-medium text-slate-500 mb-1">
                      <span className="font-bold text-slate-900">{hist.estadoNuevo.replace(/_/g, ' ')}</span>
                      <span>
                        {hist.fecha} {hist.hora}
                      </span>
                    </div>
                    <p className="text-slate-700">{hist.observacion}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Registrado por: <strong>{hist.usuario}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary & Destination Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] text-slate-400">
                Destino y Envío en Bolivia
              </h4>
              <p className="font-semibold text-slate-900">
                {order.ciudad}, {order.departamento}
              </p>
              <p className="text-slate-600">Dirección: {order.direccion}</p>
              {order.zona && <p className="text-slate-600">Zona: {order.zona}</p>}
              <p className="text-cyan-700 font-medium pt-1">
                Método de Entrega: {order.metodoEntregaNombre}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] text-slate-400">
                Resumen Económico
              </h4>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>Bs. {order.subtotal}</span>
              </div>
              {order.descuentoCupon > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Descuento:</span>
                  <span>- Bs. {order.descuentoCupon}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Envío:</span>
                <span>Bs. {order.costoEnvio}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-100">
                <span>TOTAL:</span>
                <span className="text-cyan-700">Bs. {order.total}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Recibo */}
      {order && (
        <ReceiptModal order={order} isOpen={showReceipt} onClose={() => setShowReceipt(false)} />
      )}
    </div>
  );
};
