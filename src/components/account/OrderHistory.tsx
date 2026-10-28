import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Package,
  Receipt,
  FileDown,
  Printer,
  ExternalLink,
  CheckCircle2,
  Clock,
  Truck,
  Check,
  Search,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Building2,
  RefreshCw,
  LayoutGrid,
  LayoutList,
  MessageCircle,
  PackageOpen,
  ArrowRight,
  RotateCcw,
  Laptop,
  Cpu,
  Monitor,
  Tag,
} from 'lucide-react';
import { Order } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { storage } from '../../services/storage';
import { pdfInvoiceService } from '../../services/pdfInvoiceService';
import { whatsappService } from '../../services/whatsappService';
import { ReceiptModal } from '../receipt/ReceiptModal';
import { XLogo } from '../common/XLogo';

export interface OrderHistoryProps {
  onNavigateToTracking: (orderNum: string) => void;
  onNavigateToCatalog?: () => void;
  className?: string;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  onNavigateToTracking,
  onNavigateToCatalog,
  className = '',
}) => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>(() =>
    orderService.getByUserId(currentUser.id, currentUser.email)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterType, setFilterType] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
  const [downloadSuccessOrderId, setDownloadSuccessOrderId] = useState<string | null>(null);
  const [printingOrderId, setPrintingOrderId] = useState<string | null>(null);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [printTargetOrder, setPrintTargetOrder] = useState<Order | null>(null);

  // Synchronize orders automatically whenever storage updates or currentUser changes
  useEffect(() => {
    const fetchUserOrders = () => {
      setLoading(true);
      try {
        const userOrders = orderService.getByUserId(currentUser.id, currentUser.email);
        // Sort descending by creation date
        userOrders.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
        setOrders(userOrders);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();

    const unsubscribe = storage.subscribe(() => {
      fetchUserOrders();
    });

    return unsubscribe;
  }, [currentUser.id, currentUser.email]);

  // Determine if an order is completed/confirmed for invoicing
  const isCompletedOrder = (order: Order): boolean => {
    return (
      order.estadoPago === 'CONFIRMADO' ||
      order.estado === 'ENTREGADO' ||
      order.estado === 'ENVIADO' ||
      order.estado === 'PREPARANDO' ||
      order.estado === 'LISTO_PARA_ENTREGA'
    );
  };

  /**
   * Dynamic handler for downloading the official PDF invoice
   */
  const handleDownloadPdfInvoice = async (order: Order) => {
    try {
      setDownloadingOrderId(order.id);
      // Brief animated delay for UI feedback
      await new Promise((resolve) => setTimeout(resolve, 400));
      pdfInvoiceService.generateAndDownloadInvoice(order);
      setDownloadSuccessOrderId(order.id);
      setTimeout(() => {
        setDownloadSuccessOrderId(null);
      }, 3500);
    } catch (err) {
      console.error('Error generating PDF invoice:', err);
    } finally {
      setDownloadingOrderId(null);
    }
  };

  /**
   * Dynamic handler to generate and trigger the printer-friendly receipt
   * using the exact print styles in index.css (#printable-receipt & @media print)
   */
  const handlePrintReceipt = (order: Order) => {
    setPrintingOrderId(order.id);
    setPrintTargetOrder(order);

    // Give React one render tick to mount the #printable-receipt element
    setTimeout(() => {
      window.print();
      setPrintingOrderId(null);
    }, 150);
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Filter and search logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Status Filter
      if (filterType === 'COMPLETED' && !isCompletedOrder(order)) return false;
      if (filterType === 'PENDING' && isCompletedOrder(order)) return false;

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNumber = order.numeroPedido.toLowerCase().includes(q);
        const matchesCity = order.ciudad.toLowerCase().includes(q);
        const matchesDepartment = order.departamento.toLowerCase().includes(q);
        const matchesItem = order.items.some((item) =>
          item.nombre.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q)
        );
        return matchesNumber || matchesCity || matchesDepartment || matchesItem;
      }

      return true;
    });
  }, [orders, filterType, searchQuery]);

  // Statistics
  const completedOrdersCount = useMemo(
    () => orders.filter(isCompletedOrder).length,
    [orders]
  );
  const totalSpent = useMemo(
    () =>
      orders
        .filter(isCompletedOrder)
        .reduce((acc, order) => acc + (order.total || 0), 0),
    [orders]
  );

  // Status Badge UI
  const renderStatusBadge = (order: Order) => {
    switch (order.estado) {
      case 'ENTREGADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Entregado</span>
          </span>
        );
      case 'ENVIADO':
      case 'EN_CAMINO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300 shadow-2xs">
            <Truck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>En Camino</span>
          </span>
        );
      case 'PREPARANDO':
      case 'LISTO_PARA_ENTREGA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800 border border-cyan-300 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
            <span>Preparando Despacho</span>
          </span>
        );
      case 'CANCELADO':
      case 'DEVUELTO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Cancelado</span>
          </span>
        );
      case 'NUEVO':
      case 'PAGO_PENDIENTE':
      case 'PAGO_EN_REVISION':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Pendiente</span>
          </span>
        );
    }
  };

  const renderPaymentBadge = (order: Order) => {
    if (order.estadoPago === 'CONFIRMADO') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Check className="w-3 h-3 text-emerald-600" />
          <span>Pago Verificado</span>
        </span>
      );
    }
    if (order.estadoPago === 'EN_REVISION' || order.estadoPago === 'COMPROBANTE_RECIBIDO') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
          <Clock className="w-3 h-3 text-cyan-600" />
          <span>Comprobante en Revisión</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <span>Pendiente de Pago</span>
      </span>
    );
  };

  const config = storage.getConfig();

  return (
    <section
      id="order-history-section"
      className={`bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs ${className}`}
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-cyan-50 text-cyan-700 rounded-2xl">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Historial de Pedidos (Order History)
              </h2>
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                Compras Oficiales de {currentUser.name} {currentUser.lastName || ''}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 max-w-xl">
            Gestiona tus pedidos registrados, realiza el seguimiento en tiempo real y descarga tu factura oficial en formato PDF para cada compra completada.
          </p>
        </div>

        {orders.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Layout Mode Switcher (Grid / List) */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                id="orderhistory-view-list-btn"
                title="Vista en Lista Detallada"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Lista</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                id="orderhistory-view-grid-btn"
                title="Vista en Cuadrícula"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cuadrícula</span>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterType === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('COMPLETED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterType === 'COMPLETED'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completados ({completedOrdersCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('PENDING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterType === 'PENDING'
                    ? 'bg-white text-cyan-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                En Proceso ({orders.length - completedOrdersCount})
              </button>
            </div>
          </div>
        ) : (
          <div className="self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200/80">
              <PackageOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>0 Pedidos Registrados</span>
            </span>
          </div>
        )}
      </div>

      {orders.length === 0 ? (
        /* Visually Appealing Empty State when User has No Previous Orders */
        <div
          id="order-history-empty-state"
          className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-b from-slate-50/90 via-white to-cyan-50/30 p-8 sm:p-14 text-center shadow-xs"
        >
          {/* Ambient Soft Glow Accents */}
          <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-cyan-200/40 blur-3xl opacity-60" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-emerald-200/40 blur-3xl opacity-60" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            {/* Multi-layered Icon Composition */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              {/* Outer Glow Ring */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-cyan-400/20 via-teal-400/20 to-emerald-400/20 blur-xl scale-125" />

              {/* Stylized Badge Box */}
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-600 via-teal-600 to-emerald-600 p-0.5 shadow-xl shadow-cyan-950/10 flex items-center justify-center transform transition-transform duration-300 hover:scale-105">
                <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center relative overflow-hidden">
                  <PackageOpen className="w-11 h-11 text-cyan-600" />
                </div>
              </div>

              {/* Floating Accent 1: Top Right */}
              <span className="absolute -top-1.5 -right-3 px-2.5 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-[10px] font-black rounded-full shadow-xs flex items-center gap-1 border border-amber-200 uppercase tracking-wider animate-bounce">
                <Sparkles className="w-3 h-3 text-amber-950 shrink-0" />
                <span>¡Comienza!</span>
              </span>

              {/* Floating Accent 2: Bottom Left */}
              <span className="absolute -bottom-1.5 -left-3 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full shadow-xs flex items-center gap-1 border border-emerald-300">
                <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Garantía Oficial</span>
              </span>
            </div>

            {/* Title & Copy */}
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-cyan-100 text-cyan-900 border border-cyan-200">
                <ShoppingBag className="w-3.5 h-3.5 text-cyan-700" />
                <span>Historial Vacío • Primer Pedido</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Aún no tienes pedidos registrados
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Tu cuenta está lista para registrar tu primera orden. Explora nuestro catálogo oficial de tecnología de alto rendimiento, laptops gamer, componentes y periféricos con factura legal y entrega garantizada en Bolivia.
              </p>
            </div>

            {/* Actions: 'Shop Now' + WhatsApp Support */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                id="order-history-shop-now-btn"
                onClick={() => {
                  if (onNavigateToCatalog) {
                    onNavigateToCatalog();
                  } else {
                    window.location.hash = '#productos';
                  }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:via-teal-500 hover:to-emerald-500 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-cyan-700/20 hover:shadow-cyan-600/30 hover:scale-[1.02] active:scale-98 cursor-pointer group"
              >
                <ShoppingBag className="w-4 h-4 transition-transform group-hover:-rotate-12" />
                <span>Comprar Ahora • Shop Now</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <a
                href="https://wa.me/59172902338?text=Hola%20X-CRISPIN%20Bolivia%2C%20quisiera%20asesoramiento%20y%20precios%20para%20mi%20primera%20compra."
                target="_blank"
                rel="noreferrer"
                id="order-history-whatsapp-inquiry-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl text-xs font-bold transition-all shadow-2xs hover:border-slate-300 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Asesoría WhatsApp: 72902338</span>
              </a>
            </div>

            {/* Quick Category Chips */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                O explora por categorías populares:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { label: 'Laptops Gamer', icon: Laptop },
                  { label: 'Componentes PC', icon: Cpu },
                  { label: 'Monitores', icon: Monitor },
                  { label: 'Ofertas & Descuentos', icon: Tag },
                ].map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => {
                        if (onNavigateToCatalog) {
                          onNavigateToCatalog();
                        } else {
                          window.location.hash = '#productos';
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <Icon className="w-3.5 h-3.5 text-cyan-600" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trust & Guarantee Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-200/70 text-left">
              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Envíos a 9 Departamentos</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                    Despachos a La Paz, Santa Cruz, Cochabamba y todo el país.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Garantía & Factura Legal</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                    Facturación oficial con NIT/CI y soporte técnico local boliviano.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Pago QR Simple y Ágil</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                    Transferencias bancarias instantáneas en Bolivianos sin comisiones.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Pedidos Registrados
              </span>
              <p className="text-2xl font-black text-slate-900 mt-1">{orders.length}</p>
              <span className="text-[10px] text-slate-400">Total histórico en tu cuenta</span>
            </div>

            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Facturas PDF Habilitadas
              </span>
              <p className="text-2xl font-black text-emerald-900 mt-1">{completedOrdersCount}</p>
              <span className="text-[10px] text-emerald-600">Compras con comprobante listo</span>
            </div>

            <div className="p-4 bg-cyan-50/70 rounded-2xl border border-cyan-100">
              <span className="text-[11px] font-bold text-cyan-800 uppercase tracking-wider block">
                Inversión Confirmada
              </span>
              <p className="text-2xl font-black text-cyan-950 mt-1">
                Bs. {totalSpent.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-cyan-700">Monto total con validez comercial</span>
            </div>
          </div>

          {/* Search Input Filter */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por N° de pedido (ej. XC-2025), producto o ciudad..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all text-slate-800"
            />
          </div>

          {/* Filtered Empty State (search with 0 results) */}
          {filteredOrders.length === 0 ? (
            <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-4 bg-slate-50/50">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6 text-slate-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">
                  {searchQuery
                    ? `No se encontraron pedidos para "${searchQuery}"`
                    : filterType === 'COMPLETED'
                    ? 'No tienes compras completadas aún'
                    : 'No tienes pedidos pendientes de confirmación'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery
                    ? 'Prueba buscar con otros términos como el número de pedido, ciudad o producto.'
                    : 'Puedes cambiar el filtro para ver todos tus pedidos registrados.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('ALL');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer Filtros</span>
                </button>
                {onNavigateToCatalog && (
                  <button
                    type="button"
                    id="order-history-filtered-shop-now-btn"
                    onClick={onNavigateToCatalog}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Ir al Catálogo</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* WhatsApp Support & Assistance Banner */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                      <span>Atención, Soporte e Información Oficial</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                        WhatsApp: 72902338
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      ¿Tienes dudas sobre la entrega, garantías o facturación? Te atendemos directamente en línea en Bolivia.
                    </p>
                  </div>
                </div>
                <a
                  href="https://wa.me/59172902338?text=Hola%20X-CRISPIN%20Soporte%2C%20deseo%20asistencia%20e%20informaci%C3%B3n%20sobre%20mis%20pedidos."
                  target="_blank"
                  rel="noreferrer"
                  id="btn-orderhistory-whatsapp-support"
                  className="self-start sm:self-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chatear al 72902338</span>
                </a>
              </div>

              {/* Orders Container (List or Grid layout) */}
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                    : 'space-y-4'
                }
              >
            {filteredOrders.map((order) => {
              const isCompleted = isCompletedOrder(order);
              const isExpanded = expandedOrders[order.id] ?? true;
              const isDownloading = downloadingOrderId === order.id;
              const isDownloadSuccess = downloadSuccessOrderId === order.id;
              const isPrinting = printingOrderId === order.id;

              return (
                <div
                  key={order.id}
                  id={`order-history-card-${order.numeroPedido}`}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                {/* Order Card Top Bar */}
                <div className="p-4 sm:p-5 bg-slate-50/90 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-black text-slate-900 text-sm tracking-tight bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
                      {order.numeroPedido}
                    </span>
                    {renderStatusBadge(order)}
                    {renderPaymentBadge(order)}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>
                      Fecha:{' '}
                      <strong className="text-slate-700">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('es-BO', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Reciente'}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Destino:{' '}
                      <strong className="text-slate-700">
                        {order.ciudad} ({order.departamento})
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Order Card Main Content */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Items list */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Artículos del Pedido ({order.items.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleOrderExpand(order.id)}
                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <span>{isExpanded ? 'Ocultar Detalle' : 'Ver Detalle'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl p-3 bg-slate-50/60 space-y-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="pt-2.5 first:pt-0 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={item.imagen}
                                alt={item.nombre}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=400';
                                }}
                              />
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                                  {item.nombre}
                                </h4>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                  {item.varianteNombre && (
                                    <span className="text-cyan-700 font-medium">
                                      {item.varianteNombre}
                                    </span>
                                  )}
                                  <span className="font-mono text-slate-400 text-[10px]">
                                    SKU: {item.sku}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-slate-900">
                                Bs. {item.subtotal.toFixed(2)}
                              </span>
                              <span className="text-[11px] text-slate-500 block">
                                {item.cantidad} × Bs. {item.precioUnitario.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Financial Details & Delivery info */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5 text-slate-600">
                      <p>
                        <span className="text-slate-400">Entrega:</span>{' '}
                        <strong className="text-slate-800">{order.metodoEntregaNombre}</strong>
                      </p>
                      <p>
                        <span className="text-slate-400">Pago:</span>{' '}
                        <strong className="text-slate-800">
                          {order.metodoPago.replace(/_/g, ' ')}
                        </strong>
                      </p>
                      {order.comprobante?.numeroOperacion && (
                        <p className="text-[11px] text-slate-500">
                          Ref. Bancaria:{' '}
                          <strong className="font-mono text-slate-700">
                            {order.comprobante.numeroOperacion}
                          </strong>
                        </p>
                      )}
                    </div>

                    <div className="text-right flex items-baseline justify-between sm:justify-end gap-3 bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-xl">
                      <div className="text-slate-500 text-[11px]">
                        <span>Subtotal: Bs. {order.subtotal.toFixed(2)}</span>
                        {order.descuentoCupon > 0 && (
                          <span className="text-emerald-700 font-medium ml-2">
                            • Descuento: -Bs. {order.descuentoCupon.toFixed(2)}
                          </span>
                        )}
                        <span className="ml-2">• Envío: Bs. {order.costoEnvio.toFixed(2)}</span>
                      </div>
                      <div className="font-black text-slate-950 text-base">
                        Total:{' '}
                        <span className="text-cyan-800">Bs. {order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Action Buttons Bar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    {/* Invoice Status Info */}
                    <div className="text-xs">
                      {isCompleted ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Factura comercial disponible con validez legal</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Factura descargable tras confirmación de recepción</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center flex-wrap gap-2">
                      {/* Dynamic 'Download PDF Invoice' Button */}
                      {isCompleted ? (
                        <div className="inline-flex items-center rounded-xl shadow-xs overflow-hidden border border-cyan-600">
                          <button
                            type="button"
                            onClick={() => handleDownloadPdfInvoice(order)}
                            disabled={isDownloading}
                            id={`download-pdf-invoice-btn-${order.numeroPedido}`}
                            title="Descargar Factura Comercial en formato PDF"
                            className={`px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isDownloadSuccess
                                ? 'bg-emerald-600 text-white'
                                : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                            }`}
                          >
                            {isDownloading ? (
                              <>
                                <Clock className="w-3.5 h-3.5 animate-spin" />
                                <span>Generando PDF...</span>
                              </>
                            ) : isDownloadSuccess ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>¡Factura Descargada!</span>
                              </>
                            ) : (
                              <>
                                <FileDown className="w-3.5 h-3.5" />
                                <span>Descargar Factura PDF</span>
                              </>
                            )}
                          </button>

                          {/* Print Receipt button using existing print styles in index.css */}
                          <button
                            type="button"
                            onClick={() => handlePrintReceipt(order)}
                            id={`print-invoice-btn-${order.numeroPedido}`}
                            title="Imprimir o Guardar como PDF con estilos de impresión optimizados (index.css)"
                            className="px-2.5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white text-xs border-l border-cyan-500/50 flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Imprimir</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled
                          title="La factura se habilita cuando el pago haya sido verificado"
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center gap-1.5 opacity-80"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>Factura Pendiente</span>
                        </button>
                      )}

                      {/* Interactive Receipt Preview */}
                      <button
                        type="button"
                        onClick={() => setSelectedReceiptOrder(order)}
                        id={`view-receipt-btn-${order.numeroPedido}`}
                        className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5 text-slate-500" />
                        <span>Ver Recibo</span>
                      </button>

                      {/* Track Order */}
                      <button
                        type="button"
                        onClick={() => onNavigateToTracking(order.numeroPedido)}
                        id={`track-order-btn-${order.numeroPedido}`}
                        className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Seguimiento</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      {/* Direct WhatsApp Support (72902338) */}
                      <a
                        href={whatsappService.buildOrderSupportUrl(order.numeroPedido)}
                        target="_blank"
                        rel="noreferrer"
                        id={`order-whatsapp-support-${order.numeroPedido}`}
                        title="Contactar a Soporte por WhatsApp (72902338)"
                        className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-800 border border-emerald-200/90 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Soporte WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}
        </>
      )}

      {/* Hidden container dedicated to native print / Save as PDF using index.css print styles */}
      {printTargetOrder && (
        <div id="printable-receipt" className="hidden print:block print-sheet">
          <div className="receipt-header pb-4 border-b-2 border-slate-900 mb-4 print-avoid-break">
            <div className="flex justify-between items-start">
              <div>
                <XLogo size="md" showSlogan={true} />
                <p className="text-[11px] text-slate-500 mt-2">
                  {config.direccion}, {config.ciudad} • {config.pais}
                </p>
                <p className="text-[11px] text-slate-500">
                  NIT/CI: {config.bancoNitCi} • WhatsApp: {config.telefono}
                </p>
              </div>
              <div className="text-right">
                <div className="receipt-order-badge inline-block px-3 py-1 bg-slate-900 text-white font-mono font-bold text-sm">
                  {printTargetOrder.numeroPedido}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Fecha:{' '}
                  {printTargetOrder.createdAt
                    ? new Date(printTargetOrder.createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
                <p className="text-xs font-semibold text-cyan-700">
                  Estado: {printTargetOrder.estado.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          </div>

          <div className="receipt-customer-card bg-slate-50 p-4 border border-slate-200 rounded-lg mb-4 print-avoid-break grid grid-cols-2 gap-4 text-xs">
            <div>
              <h5 className="font-bold text-slate-900 uppercase text-[10px] mb-1">
                Datos del Cliente
              </h5>
              <p className="font-semibold text-slate-900">
                {printTargetOrder.clienteNombre} {printTargetOrder.clienteApellido}
              </p>
              <p className="text-slate-600">{printTargetOrder.clienteEmail}</p>
              <p className="text-slate-600">
                Tel/WhatsApp: {printTargetOrder.clienteWhatsapp || printTargetOrder.clienteTelefono}
              </p>
            </div>
            <div>
              <h5 className="font-bold text-slate-900 uppercase text-[10px] mb-1">
                Destino de Entrega ({printTargetOrder.departamento})
              </h5>
              <p className="font-semibold text-slate-900">
                {printTargetOrder.ciudad} - {printTargetOrder.zona}
              </p>
              <p className="text-slate-600">{printTargetOrder.direccion}</p>
              {printTargetOrder.referencia && (
                <p className="text-slate-500 italic">Ref: {printTargetOrder.referencia}</p>
              )}
            </div>
          </div>

          <table className="receipt-table w-full text-left text-xs border-collapse mb-4">
            <thead>
              <tr className="border-b border-slate-300">
                <th className="py-2 font-bold uppercase text-[10px]">Producto</th>
                <th className="py-2 text-center font-bold uppercase text-[10px]">Cant.</th>
                <th className="py-2 text-right font-bold uppercase text-[10px]">P. Unit.</th>
                <th className="py-2 text-right font-bold uppercase text-[10px]">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {printTargetOrder.items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-2 font-medium">
                    {item.nombre}
                    {item.varianteNombre && (
                      <span className="text-[10px] block text-cyan-700">
                        {item.varianteNombre}
                      </span>
                    )}
                    <span className="text-[9px] font-mono text-slate-400 block">
                      SKU: {item.sku}
                    </span>
                  </td>
                  <td className="py-2 text-center font-bold">{item.cantidad}</td>
                  <td className="py-2 text-right">Bs. {item.precioUnitario.toFixed(2)}</td>
                  <td className="py-2 text-right font-bold">Bs. {item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="receipt-totals-section border-t border-slate-300 pt-3 flex justify-between items-end text-xs print-avoid-break">
            <div>
              <p className="text-slate-600">
                Método de Pago:{' '}
                <strong>{printTargetOrder.metodoPago.replace(/_/g, ' ')}</strong>
              </p>
              <p className="text-slate-600">
                Entrega: <strong>{printTargetOrder.metodoEntregaNombre}</strong>
              </p>
              <p className="text-[10px] text-emerald-700 font-bold mt-1">
                ✓ Comprobante Oficial Verificado X-CRISPIN Bolivia
              </p>
            </div>
            <div className="receipt-totals-box text-right w-48 space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Bs. {printTargetOrder.subtotal.toFixed(2)}</span>
              </div>
              {printTargetOrder.descuentoCupon > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Descuento:</span>
                  <span>- Bs. {printTargetOrder.descuentoCupon.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Envío:</span>
                <span>Bs. {printTargetOrder.costoEnvio.toFixed(2)}</span>
              </div>
              <div className="receipt-total-row flex justify-between font-black text-sm pt-1 border-t border-slate-900 text-cyan-700">
                <span>TOTAL:</span>
                <span>Bs. {printTargetOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="receipt-footer border-t border-dashed border-slate-300 pt-3 mt-4 text-[10px] text-slate-500 print-avoid-break text-center">
            <p className="font-semibold text-slate-700">
              ¡Gracias por confiar en X-CRISPIN — SHOP THE X!
            </p>
            <p>
              Factura oficial con validez fiscal conforme a la normativa vigente del Estado
              Plurinacional de Bolivia.
            </p>
          </div>
        </div>
      )}

      {/* Official Receipt Modal View */}
      {selectedReceiptOrder && (
        <ReceiptModal
          order={selectedReceiptOrder}
          isOpen={!!selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      )}
    </section>
  );
};
