import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  Truck,
  QrCode,
  Building,
  Upload,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Receipt,
  MessageCircle,
  Clock,
  Compass,
  Printer,
  Sparkles,
  Coins,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { whatsappService } from '../services/whatsappService';
import { loyaltyService } from '../services/loyaltyService';
import { Order, PaymentMethodType } from '../types';
import { ReceiptModal } from '../components/receipt/ReceiptModal';
import { XLogo } from '../components/common/XLogo';

interface CheckoutPageProps {
  onOrderCompleted: (orderNumber: string) => void;
  onNavigate: (route: string) => void;
}

const DEPARTAMENTOS_BOLIVIA = [
  'La Paz',
  'Santa Cruz',
  'Cochabamba',
  'Oruro',
  'Potosí',
  'Chuquisaca',
  'Tarija',
  'Beni',
  'Pando',
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onOrderCompleted, onNavigate }) => {
  const {
    items,
    subtotal,
    discountAmount,
    appliedCoupon,
    shippingCost,
    setShippingCost,
    total,
    clearCart,
  } = useCart();
  const { currentUser } = useAuth();
  const config = storage.getConfig();
  const pointsToEarn = loyaltyService.calculatePointsForOrder(subtotal, items);

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [clienteNombre, setClienteNombre] = useState(currentUser.name.split(' ')[0] || '');
  const [clienteApellido, setClienteApellido] = useState(
    currentUser.name.split(' ').slice(1).join(' ') || ''
  );
  const [clienteEmail, setClienteEmail] = useState(currentUser.email || '');
  const [clienteTelefono, setClienteTelefono] = useState(currentUser.phone || '');
  const [clienteWhatsapp, setClienteWhatsapp] = useState(currentUser.phone || '');

  const [departamento, setDepartamento] = useState('La Paz');
  const [ciudad, setCiudad] = useState('La Paz');
  const [zona, setZona] = useState('Sopocachi');
  const [direccion, setDireccion] = useState('Av. 20 de Octubre #1234');
  const [referencia, setReferencia] = useState('Frente a plaza Abaroa');

  const [metodoEntrega, setMetodoEntrega] = useState<'EXPRESS' | 'NACIONAL' | 'RETIRO'>('EXPRESS');

  const [metodoPago, setMetodoPago] = useState<PaymentMethodType>('QR_SIMPLE');

  // Success State
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Proof Upload Form State (after order is created)
  const [numeroOperacion, setNumeroOperacion] = useState('');
  const [comprobanteUrl, setComprobanteUrl] = useState(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'
  );
  const [proofSubmitted, setProofSubmitted] = useState(false);

  // Handle Delivery method cost
  const handleDeliveryChange = (type: 'EXPRESS' | 'NACIONAL' | 'RETIRO') => {
    setMetodoEntrega(type);
    if (type === 'EXPRESS') setShippingCost(15);
    else if (type === 'NACIONAL') setShippingCost(35);
    else setShippingCost(0);
  };

  const validateStep1 = () => {
    if (!clienteNombre.trim() || !clienteApellido.trim() || !clienteEmail.trim() || !clienteTelefono.trim()) {
      setErrorMsg('Por favor completa todos los datos obligatorios del cliente.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const validateStep2 = () => {
    if (!departamento || !ciudad.trim() || !direccion.trim()) {
      setErrorMsg('Por favor ingresa los datos completos de dirección.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const handlePlaceOrder = () => {
    setErrorMsg(null);

    // Prepare order items
    const orderItems = items.map((it) => {
      const unitPrice = it.producto.precio + (it.variante?.priceModifier || 0);
      return {
        productoId: it.producto.id,
        nombre: it.producto.nombre,
        sku: it.producto.sku,
        imagen: it.producto.imagenes[0] || '',
        precioUnitario: unitPrice,
        cantidad: it.cantidad,
        subtotal: unitPrice * it.cantidad,
        varianteId: it.variante?.id,
        varianteNombre: it.variante?.name,
      };
    });

    const deliveryName =
      metodoEntrega === 'EXPRESS'
        ? 'Entrega Express Local (24 hrs)'
        : metodoEntrega === 'NACIONAL'
        ? 'Envío Nacional Courier Interdepartamental'
        : 'Retiro en Sucursal Central';

    const res = orderService.createOrder({
      clienteId: currentUser.id,
      clienteNombre,
      clienteApellido,
      clienteEmail,
      clienteTelefono,
      clienteWhatsapp: clienteWhatsapp || clienteTelefono,
      departamento,
      ciudad,
      zona,
      direccion,
      referencia,
      metodoEntregaId: metodoEntrega,
      metodoEntregaNombre: deliveryName,
      costoEnvio: shippingCost,
      items: orderItems,
      subtotal,
      descuentoCupon: discountAmount,
      codigoCupon: appliedCoupon?.codigo,
      total,
      metodoPago,
      notas: `Pedido generado en Bolivia (${departamento})`,
    });

    if (!res.success || !res.order) {
      setErrorMsg(res.error || 'Ocurrió un error al procesar tu pedido.');
      return;
    }

    // Order created successfully!
    setCreatedOrder(res.order);
    clearCart();
  };

  const handleUploadProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdOrder) return;
    if (!numeroOperacion.trim()) {
      alert('Por favor ingresa el número de operación bancaria');
      return;
    }

    const res = paymentService.uploadProof(createdOrder.id, {
      numeroOperacion,
      fechaPago: new Date().toISOString(),
      comprobanteUrl,
      comprobanteNombre: `comprobante_${createdOrder.numeroPedido}.jpg`,
      subidoPorUsuario: `${clienteNombre} ${clienteApellido}`,
      observacion: `Comprobante cargado por el cliente desde checkout`,
    });

    if (res.success) {
      setProofSubmitted(true);
      const updated = orderService.getByIdOrNumber(createdOrder.id);
      if (updated) setCreatedOrder(updated);
    }
  };

  // If order was created, render the official confirmation screen
  if (createdOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 font-sans checkout-confirmation-container" id="checkout-confirmation-screen">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 text-center space-y-4 shadow-xl checkout-order-summary-view print-container" id="printable-checkout-confirmation">
          {/* Print-Only Official Brand Header */}
          <div className="hidden print:flex items-center justify-between pb-4 mb-4 border-b-2 border-slate-900 text-left print-avoid-break">
            <div>
              <XLogo size="md" showSlogan={true} />
              <p className="text-[11px] text-slate-600 mt-1.5 font-medium">
                {config.direccion}, {config.ciudad} • {config.pais}
              </p>
              <p className="text-[10px] text-slate-500">
                {config.bancoNitCi} • WhatsApp: {config.telefono}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white font-mono text-xs font-bold rounded-md">
                {createdOrder.numeroPedido}
              </span>
              <p className="text-[11px] text-slate-600 mt-1">
                Fecha: {new Date(createdOrder.createdAt).toLocaleDateString()} {new Date(createdOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-[11px] font-bold text-cyan-800 uppercase">
                Estado: {createdOrder.estadoPago} • {createdOrder.estado.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center print:hidden no-print">
            <CheckCircle className="w-10 h-10" />
          </div>

          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider print:hidden no-print">
            ¡Pedido Registrado con Éxito!
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Resumen Oficial de Pedido: {createdOrder.numeroPedido}
          </h1>

          <p className="text-sm text-slate-600 print:text-xs">
            Cliente: <strong className="text-slate-900">{createdOrder.clienteNombre} {createdOrder.clienteApellido}</strong> • Tel: {createdOrder.clienteWhatsapp || createdOrder.clienteTelefono}
          </p>

          {/* X-Points Earned Card */}
          {createdOrder.xPointsEarned && createdOrder.xPointsEarned > 0 && (
            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-amber-500/10 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950 print:hidden no-print">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
                  <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-black text-amber-950 flex items-center gap-1.5">
                    <span>¡Ganaste +{createdOrder.xPointsEarned} X-Points!</span>
                    <span className="px-2 py-0.2 bg-amber-200 text-amber-900 text-[10px] font-black rounded-full uppercase">
                      Acreditados
                    </span>
                  </h4>
                  <p className="text-xs text-amber-800">
                    Puntos acumulados con esta compra listos en tu perfil del Club X-Points.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('cuenta')}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer self-start sm:self-auto"
              >
                Ver Mi Saldo
              </button>
            </div>
          )}

          {/* Customer & Delivery Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 text-left print-avoid-break">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Destinatario</span>
              <p className="font-semibold text-slate-900">{createdOrder.clienteNombre} {createdOrder.clienteApellido}</p>
              <p className="text-slate-600">{createdOrder.clienteEmail}</p>
              <p className="text-slate-600">Tel: {createdOrder.clienteTelefono}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Destino en Bolivia ({createdOrder.departamento})</span>
              <p className="font-semibold text-slate-900">{createdOrder.ciudad} - {createdOrder.zona}</p>
              <p className="text-slate-600">{createdOrder.direccion}</p>
              {createdOrder.referencia && <p className="text-slate-500 italic text-[11px]">Ref: {createdOrder.referencia}</p>}
            </div>
          </div>

          {/* Itemized Products Order Summary */}
          <div className="mt-4 text-left border border-slate-200 rounded-2xl p-4 bg-white checkout-items-summary print-avoid-break">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">
              Detalle de Productos ({createdOrder.items.length} ítems)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2">Producto</th>
                    <th className="py-2 text-center">Cant.</th>
                    <th className="py-2 text-right">P. Unitario</th>
                    <th className="py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {createdOrder.items.map((item, idx) => (
                    <tr key={idx} className="py-2">
                      <td className="py-2 pr-2">
                        <div className="font-semibold text-slate-900">{item.nombre}</div>
                        {item.varianteNombre && (
                          <div className="text-[10px] text-cyan-700">Variante: {item.varianteNombre}</div>
                        )}
                        <div className="text-[10px] font-mono text-slate-400">SKU: {item.sku}</div>
                      </td>
                      <td className="py-2 text-center font-bold">{item.cantidad}</td>
                      <td className="py-2 text-right font-medium">Bs. {item.precioUnitario}</td>
                      <td className="py-2 text-right font-bold text-slate-900">Bs. {item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-slate-200">
                  <tr className="font-medium text-slate-600">
                    <td colSpan={3} className="py-2 text-right">Subtotal:</td>
                    <td className="py-2 text-right">Bs. {createdOrder.subtotal}</td>
                  </tr>
                  {createdOrder.descuentoCupon > 0 && (
                    <tr className="text-emerald-700 font-semibold">
                      <td colSpan={3} className="py-1 text-right">Descuento ({createdOrder.codigoCupon}):</td>
                      <td className="py-1 text-right">- Bs. {createdOrder.descuentoCupon}</td>
                    </tr>
                  )}
                  <tr className="text-slate-600">
                    <td colSpan={3} className="py-1 text-right">Costo de Envío ({createdOrder.metodoEntregaNombre}):</td>
                    <td className="py-1 text-right">Bs. {createdOrder.costoEnvio}</td>
                  </tr>
                  <tr className="border-t-2 border-slate-900 text-sm font-black text-slate-950">
                    <td colSpan={3} className="py-2 text-right">TOTAL A PAGAR:</td>
                    <td className="py-2 text-right text-cyan-800">Bs. {createdOrder.total}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment Instructions according to selected method */}
          <div className="mt-4 p-5 bg-cyan-50/70 border border-cyan-200 rounded-2xl text-left space-y-4 checkout-payment-box print-avoid-break">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-cyan-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Instrucciones de Pago ({createdOrder.metodoPago.replace('_', ' ')})
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Escanea el código QR oficial de X-CRISPIN desde tu aplicación bancaria móvil (BCP, BNB, Banco Unión, BMSC, Bisa, etc.) o transfiere al número de cuenta indicado:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-white p-4 rounded-xl border border-cyan-100 print:border-slate-300">
              <div className="flex justify-center">
                <img
                  src={config.qrSimpleImagen || config.qrImagenUrl}
                  alt="QR Simple Oficial"
                  className="w-36 h-36 object-cover rounded-xl border border-slate-200 shadow-xs print:w-32 print:h-32"
                />
              </div>

              <div className="text-xs space-y-1.5 text-slate-700">
                <p>
                  <strong>Titular:</strong> {config.bancoTitular}
                </p>
                <p>
                  <strong>Banco:</strong> {config.bancoNombre}
                </p>
                <p>
                  <strong>Nro. de Cuenta:</strong>{' '}
                  <span className="font-mono font-bold text-slate-900">
                    {config.bancoNumeroCuenta || config.bancoNroCuenta}
                  </span>
                </p>
                <p>
                  <strong>NIT / CI:</strong> {config.bancoNitCi}
                </p>
                <p className="text-[11px] text-slate-500 pt-1">
                  En el concepto de pago escribe tu pedido: <strong>{createdOrder.numeroPedido}</strong>
                </p>
              </div>
            </div>

            {/* Proof Upload Module (Hidden on paper print) */}
            <div className="pt-2 border-t border-cyan-200/80 print:hidden no-print">
              <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-cyan-600" />
                <span>Adjuntar Comprobante de Pago para Validación Rápida:</span>
              </h4>

              {proofSubmitted || createdOrder.comprobante ? (
                <div className="p-3 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  <span>
                    ¡Comprobante enviado! Número de Operación:{' '}
                    <strong>{createdOrder.comprobante?.numeroOperacion}</strong>. En revisión por recepción.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleUploadProof} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Número de Operación / Transacción:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. OP-984721"
                        value={numeroOperacion}
                        onChange={(e) => setNumeroOperacion(e.target.value)}
                        required
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        URL o Captura del Comprobante:
                      </label>
                      <input
                        type="text"
                        value={comprobanteUrl}
                        onChange={(e) => setComprobanteUrl(e.target.value)}
                        required
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    Registrar Comprobante Bancario
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Action CTAs: Print Summary, View Receipt, Tracking, WhatsApp */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-4 gap-2.5 print:hidden no-print">
            <button
              onClick={() => window.print()}
              id="print-summary-btn"
              className="py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span>Imprimir Resumen</span>
            </button>

            <button
              onClick={() => setShowReceiptModal(true)}
              id="view-receipt-btn"
              className="py-3 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>Ver Recibo Oficial</span>
            </button>

            <button
              onClick={() => onNavigate(`seguimiento?pedido=${createdOrder.numeroPedido}`)}
              id="track-order-success-btn"
              className="py-3 px-3 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Seguimiento</span>
            </button>

            <button
              onClick={() => {
                const url = whatsappService.buildOrderShareUrl(createdOrder);
                window.open(url, '_blank');
              }}
              className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Compartir</span>
            </button>
          </div>
        </div>

        {/* Modal Recibo */}
        <ReceiptModal
          order={createdOrder}
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
        />
      </div>
    );
  }

  // If cart is empty and no order created
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">No hay productos en el checkout</h2>
        <p className="text-slate-500 text-xs">Agrega productos desde el catálogo para continuar con tu compra.</p>
        <button
          onClick={() => onNavigate('productos')}
          className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl"
        >
          Ir al Catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-600">
          Proceso de Compra Seguro
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Checkout X-CRISPIN</h1>
        <p className="text-xs text-slate-500">
          Completa tus datos para despachar tu pedido a cualquier punto de Bolivia.
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-center gap-2 max-w-xl mx-auto checkout-stepper print:hidden no-print">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep === step
                  ? 'bg-cyan-600 text-white ring-4 ring-cyan-100'
                  : currentStep > step
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {step}
            </div>
            {step < 5 && <div className="w-8 sm:w-12 h-0.5 bg-slate-200 mx-1" />}
          </div>
        ))}
      </div>

      {errorMsg && (
        <div className="max-w-2xl mx-auto p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Area (Steps 1 to 5) */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
          {/* STEP 1: Datos del Cliente */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Paso 1: Datos Personales de Contacto
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Apellido *</label>
                  <input
                    type="text"
                    value={clienteApellido}
                    onChange={(e) => setClienteApellido(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  value={clienteEmail}
                  onChange={(e) => setClienteEmail(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Teléfono Móvil *</label>
                  <input
                    type="tel"
                    placeholder="Ej. 70123456"
                    value={clienteTelefono}
                    onChange={(e) => setClienteTelefono(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Número de WhatsApp (notificaciones)
                  </label>
                  <input
                    type="tel"
                    placeholder="Ej. 70123456"
                    value={clienteWhatsapp}
                    onChange={(e) => setClienteWhatsapp(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep1()) setCurrentStep(2);
                  }}
                  className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-cyan-600 transition-colors flex items-center gap-2"
                >
                  <span>Continuar a Dirección</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Dirección en Bolivia */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Paso 2: Dirección de Entrega en Bolivia
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Departamento de Bolivia *
                  </label>
                  <select
                    value={departamento}
                    onChange={(e) => {
                      setDepartamento(e.target.value);
                      setCiudad(e.target.value);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium cursor-pointer"
                  >
                    {DEPARTAMENTOS_BOLIVIA.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Ciudad o Localidad *</label>
                  <input
                    type="text"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Zona / Barrio</label>
                  <input
                    type="text"
                    value={zona}
                    onChange={(e) => setZona(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Dirección exacta (Calle, Av, Número) *
                  </label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Referencia para el repartidor
                </label>
                <input
                  type="text"
                  placeholder="Ej. Casa color beige con portón negro frente a la farmacia"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep2()) setCurrentStep(3);
                  }}
                  className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-cyan-600 transition-colors flex items-center gap-2"
                >
                  <span>Continuar a Entrega</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Método de Entrega */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Paso 3: Método de Entrega
              </h3>

              <div className="space-y-3">
                <div
                  onClick={() => handleDeliveryChange('EXPRESS')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between ${
                    metodoEntrega === 'EXPRESS'
                      ? 'border-cyan-600 bg-cyan-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Entrega Express Urbana (24 hrs)
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Para La Paz, El Alto, Santa Cruz de la Sierra y Cochabamba.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-900">Bs. 15</span>
                </div>

                <div
                  onClick={() => handleDeliveryChange('NACIONAL')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between ${
                    metodoEntrega === 'NACIONAL'
                      ? 'border-cyan-600 bg-cyan-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Envío Nacional Courier Interdepartamental (48 a 72 hrs)
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Cobertura garantizada en Oruro, Potosí, Chuquisaca, Tarija, Beni y Pando.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-900">Bs. 35</span>
                </div>

                <div
                  onClick={() => handleDeliveryChange('RETIRO')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between ${
                    metodoEntrega === 'RETIRO'
                      ? 'border-cyan-600 bg-cyan-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Retiro en Sucursal Central X-CRISPIN
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {config.direccion}, {config.ciudad}. Retiro gratuito.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-600">Gratis (Bs. 0)</span>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-cyan-600 transition-colors flex items-center gap-2"
                >
                  <span>Continuar a Pago</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Método de Pago */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Paso 4: Selecciona tu Método de Pago Oficial en Bolivia
              </h3>

              <div className="space-y-3">
                <div
                  onClick={() => setMetodoPago('QR_SIMPLE')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    metodoPago === 'QR_SIMPLE'
                      ? 'border-cyan-600 bg-cyan-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      QR Simple Interoperable (Recomendado)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Paga al instante escaneando el código QR con cualquier banco boliviano (BCP, BNB, Banco Unión, Fie, Bisa, Fassil, Ganadero, Sol).
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setMetodoPago('TRANSFERENCIA_BCP')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    metodoPago === 'TRANSFERENCIA_BCP'
                      ? 'border-cyan-600 bg-cyan-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Building className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Transferencia Banco BCP (Bolivia)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Transferencia directa cuenta BCP Bolivia sin comisiones.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setMetodoPago('TRANSFERENCIA_BNB')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    metodoPago === 'TRANSFERENCIA_BNB'
                      ? 'border-cyan-600 bg-cyan-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Building className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Transferencia Banco BNB (Bolivia)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Transferencia bancaria oficial a cuenta corriente BNB en Bolivianos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-cyan-600 transition-colors flex items-center gap-2"
                >
                  <span>Revisar y Confirmar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Resumen y Confirmación Final */}
          {currentStep === 5 && (
            <div className="space-y-6 checkout-step-summary" id="checkout-step5-summary">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Paso 5: Resumen y Confirmación de tu Pedido
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200 print-avoid-break">
                <div>
                  <h5 className="font-bold text-slate-900 mb-1">Destinatario:</h5>
                  <p>{clienteNombre} {clienteApellido}</p>
                  <p>{clienteEmail}</p>
                  <p>Tel: {clienteTelefono}</p>
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 mb-1">Entrega & Pago:</h5>
                  <p>Destino: {ciudad}, {departamento}</p>
                  <p>Dirección: {direccion}</p>
                  <p className="font-bold text-cyan-700">Pago: {metodoPago.replace(/_/g, ' ')}</p>
                </div>
              </div>

              {/* Items summary */}
              <div className="space-y-2 print-avoid-break">
                <h5 className="text-xs font-bold text-slate-700 uppercase">Productos a despachar:</h5>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl p-4">
                  {items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{item.producto.nombre}</p>
                        <p className="text-[11px] text-slate-500">
                          {item.cantidad} x Bs. {item.producto.precio}
                          {item.variante && ` (${item.variante.name})`}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900">
                        Bs. {(item.producto.precio + (item.variante?.priceModifier || 0)) * item.cantidad}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center print:hidden no-print">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Atrás</span>
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  id="confirm-place-order-btn"
                  className="px-8 py-3.5 bg-gradient-to-r from-cyan-600 to-slate-900 text-white text-xs font-black rounded-xl hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>CONFIRMAR Y FINALIZAR PEDIDO</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Order Summary Card */}
        <div className="lg:col-span-4 checkout-sidebar-wrapper">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4 sticky top-24 checkout-order-summary print-avoid-break" id="checkout-order-summary">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Resumen de Compra</h4>
              <button
                type="button"
                onClick={() => window.print()}
                id="print-checkout-cart-summary-btn"
                title="Imprimir resumen de compra"
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-cyan-700 bg-white border border-slate-200 hover:border-cyan-300 px-2.5 py-1 rounded-lg transition-colors print:hidden no-print cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 border-b border-slate-200 pb-4">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} artículos)</span>
                <span className="font-semibold text-slate-800">Bs. {subtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Descuento Cupón</span>
                  <span>- Bs. {discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Costo de Envío</span>
                <span className="font-semibold text-slate-800">Bs. {shippingCost}</span>
              </div>
            </div>

            {/* X-Points to be Earned */}
            {pointsToEarn > 0 && (
              <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-100 border border-amber-300/80 rounded-2xl flex items-center justify-between text-xs text-amber-950 font-bold shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />
                  <span>Acumulas con este pedido:</span>
                </div>
                <span className="font-mono font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-lg text-xs">
                  +{pointsToEarn} X-Points
                </span>
              </div>
            )}

            <div className="flex justify-between text-base font-black text-slate-950">
              <span>Total Estimado:</span>
              <span className="text-cyan-700">Bs. {total}</span>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Garantía oficial y soporte técnico en Bolivia</span>
              </div>
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-cyan-600" />
                <span>Pago QR Simple acreditado al instante</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
