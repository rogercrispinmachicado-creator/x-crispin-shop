import React, { useState, useEffect } from 'react';
import {
  PackageCheck,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Printer,
  Clock,
  Truck,
  Filter,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Receipt,
  User,
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { Order, OrderStatus } from '../types';
import { ReceiptModal } from '../components/receipt/ReceiptModal';

export const ReceptionPanelPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'TODOS' | 'REVISION_PAGO' | 'PREPARANDO' | 'LISTOS' | 'ENVIADOS' | 'ENTREGADOS'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Status Change Dialog State
  const [statusModalOrder, setStatusModalOrder] = useState<Order | null>(null);
  const [nextStatus, setNextStatus] = useState<OrderStatus>('PREPARANDO');
  const [statusNote, setStatusNote] = useState('');

  // Payment Proof Modal State
  const [proofModalOrder, setProofModalOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const loadData = () => {
    setOrders(storage.getOrders());
  };

  useEffect(() => {
    loadData();
    const unsub = storage.subscribe(() => {
      loadData();
    });
    return unsub;
  }, []);

  const filteredOrders = orders.filter((o) => {
    // Search
    const matchSearch =
      o.numeroPedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${o.clienteNombre} ${o.clienteApellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.clienteTelefono.includes(searchTerm);

    if (!matchSearch) return false;

    // Tabs
    if (activeTab === 'REVISION_PAGO') {
      return o.estado === 'PAGO_EN_REVISION' || o.estado === 'PAGO_PENDIENTE';
    }
    if (activeTab === 'PREPARANDO') return o.estado === 'PREPARANDO';
    if (activeTab === 'LISTOS') return o.estado === 'LISTO_PARA_ENTREGA';
    if (activeTab === 'ENVIADOS') return o.estado === 'ENVIADO';
    if (activeTab === 'ENTREGADOS') return o.estado === 'ENTREGADO';
    return true;
  });

  const handleApprovePayment = (order: Order) => {
    const res = paymentService.reviewPayment(
      order.id,
      true,
      currentUser.name,
      'Pago verificado exitosamente con extracto bancario en recepción'
    );
    if (res.success) {
      setProofModalOrder(null);
      loadData();
    }
  };

  const handleRejectPayment = (order: Order) => {
    if (!rejectReason.trim()) {
      alert('Por favor especifica el motivo del rechazo del comprobante.');
      return;
    }
    const res = paymentService.reviewPayment(
      order.id,
      false,
      currentUser.name,
      rejectReason
    );
    if (res.success) {
      setProofModalOrder(null);
      setShowRejectInput(false);
      setRejectReason('');
      loadData();
    }
  };

  const handleSaveStatusChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalOrder) return;

    orderService.updateStatus(
      statusModalOrder.id,
      nextStatus,
      currentUser.name,
      statusNote || `Estado cambiado a ${nextStatus.replace(/_/g, ' ')} por recepción`
    );

    setStatusModalOrder(null);
    setStatusNote('');
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 font-bold rounded-lg text-xs">
              Mesa de Operaciones
            </span>
            <span className="text-xs text-slate-400">| Operador: {currentUser.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Panel de Recepción & Logística
          </h1>
          <p className="text-xs text-slate-500">
            Control de comprobantes de pago, aprobación bancaria y despacho de pedidos en Bolivia.
          </p>
        </div>

        {/* Quick Counters */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center">
            <span className="text-base font-black text-amber-800">
              {orders.filter((o) => o.estado === 'PAGO_EN_REVISION' || o.estado === 'PAGO_PENDIENTE').length}
            </span>
            <p className="text-[10px] text-amber-700 font-bold uppercase">Por Verificar</p>
          </div>
          <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-2xl text-center">
            <span className="text-base font-black text-cyan-800">
              {orders.filter((o) => o.estado === 'PREPARANDO').length}
            </span>
            <p className="text-[10px] text-cyan-700 font-bold uppercase">En Almacén</p>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 text-xs">
          <button
            onClick={() => setActiveTab('TODOS')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-colors whitespace-nowrap ${
              activeTab === 'TODOS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('REVISION_PAGO')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-colors whitespace-nowrap ${
              activeTab === 'REVISION_PAGO'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Revisión Pagos ({orders.filter((o) => o.estadoPago === 'COMPROBANTE_RECIBIDO' || o.estado === 'PAGO_PENDIENTE').length})
          </button>
          <button
            onClick={() => setActiveTab('PREPARANDO')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-colors whitespace-nowrap ${
              activeTab === 'PREPARANDO'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Preparando ({orders.filter((o) => o.estado === 'PREPARANDO').length})
          </button>
          <button
            onClick={() => setActiveTab('LISTOS')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-colors whitespace-nowrap ${
              activeTab === 'LISTOS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Listos para Entrega
          </button>
          <button
            onClick={() => setActiveTab('ENVIADOS')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-colors whitespace-nowrap ${
              activeTab === 'ENVIADOS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Enviados
          </button>
          <button
            onClick={() => setActiveTab('ENTREGADOS')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-colors whitespace-nowrap ${
              activeTab === 'ENTREGADOS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Entregados
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Buscar por pedido, cliente o tel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-cyan-500 outline-hidden"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Pedido / Fecha</th>
                <th className="py-3 px-4">Cliente / Teléfono</th>
                <th className="py-3 px-4">Destino Bolivia</th>
                <th className="py-3 px-4">Método Pago / Estado</th>
                <th className="py-3 px-4 text-right">Monto</th>
                <th className="py-3 px-4">Estado Pedido</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No hay pedidos en esta categoría o filtro
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Order / Date */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{o.numeroPedido}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(o.createdAt).toLocaleDateString()} {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {o.clienteNombre} {o.clienteApellido}
                      </span>
                      <span className="text-[10px] text-slate-500">{o.clienteTelefono}</span>
                    </td>

                    {/* Destination */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 block">
                        {o.ciudad} ({o.departamento})
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-xs block">
                        {o.direccion}
                      </span>
                    </td>

                    {/* Payment Status & Proof badge */}
                    <td className="py-3 px-4">
                      <span className="text-slate-600 block text-[11px] font-medium">
                        {o.metodoPago.replace(/_/g, ' ')}
                      </span>
                      {o.comprobante ? (
                        <button
                          onClick={() => setProofModalOrder(o)}
                          className="mt-1 px-2 py-0.5 bg-purple-100 hover:bg-purple-200 text-purple-800 text-[10px] font-bold rounded flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ver Comprobante</span>
                        </button>
                      ) : (
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.estadoPago === 'CONFIRMADO'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {o.estadoPago}
                        </span>
                      )}
                    </td>

                    {/* Total */}
                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      Bs. {o.total}
                    </td>

                    {/* Order Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                          o.estado === 'ENTREGADO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.estado === 'ENVIADO'
                            ? 'bg-blue-100 text-blue-800'
                            : o.estado === 'PREPARANDO'
                            ? 'bg-cyan-100 text-cyan-800'
                            : o.estado === 'CANCELADO'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {o.estado.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setStatusModalOrder(o);
                            setNextStatus(o.estado);
                          }}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-cyan-600 text-white rounded-lg text-[11px] font-bold transition-colors"
                          title="Actualizar estado logístico"
                        >
                          Cambiar Estado
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(o);
                            setShowReceipt(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                          title="Imprimir Hoja de Despacho / Recibo"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Inspection Modal */}
      {proofModalOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Verificación de Comprobante: {proofModalOrder.numeroPedido}
              </h3>
              <button
                onClick={() => setProofModalOrder(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p>
                  <strong>Cliente:</strong> {proofModalOrder.clienteNombre} {proofModalOrder.clienteApellido}
                </p>
                <p>
                  <strong>Monto del Pedido:</strong> Bs. {proofModalOrder.total}
                </p>
                <p>
                  <strong>Nro. Operación Declarado:</strong>{' '}
                  <span className="font-mono font-bold text-cyan-700">
                    {proofModalOrder.comprobante?.numeroOperacion}
                  </span>
                </p>
                <p>
                  <strong>Fecha de Carga:</strong> {proofModalOrder.comprobante?.fechaPago}
                </p>
              </div>

              {/* Proof Image */}
              <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={proofModalOrder.comprobante?.comprobanteUrl}
                  alt="Comprobante Bancario"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Reject reason input */}
              {showRejectInput && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <label className="font-bold text-rose-800 text-[11px] block">
                    Motivo del Rechazo del Comprobante:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. El número de operación no coincide con el extracto bancario"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full p-2 bg-white border border-rose-300 rounded-lg text-xs"
                  />
                  <button
                    onClick={() => handleRejectPayment(proofModalOrder)}
                    className="px-4 py-1.5 bg-rose-600 text-white rounded-lg font-bold text-[11px]"
                  >
                    Confirmar Rechazo
                  </button>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              {!showRejectInput && (
                <button
                  onClick={() => setShowRejectInput(true)}
                  className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors"
                >
                  Rechazar Comprobante
                </button>
              )}

              <button
                onClick={() => handleApprovePayment(proofModalOrder)}
                className="ml-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Aprobar Pago y Confirmar Fondos</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {statusModalOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveStatusChange}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 animate-in fade-in"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Cambiar Estado: {statusModalOrder.numeroPedido}
              </h3>
              <button
                type="button"
                onClick={() => setStatusModalOrder(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nuevo Estado:</label>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold cursor-pointer"
                >
                  <option value="PAGO_PENDIENTE">Pago Pendiente</option>
                  <option value="PAGO_EN_REVISION">Pago en Revisión</option>
                  <option value="PAGO_CONFIRMADO">Pago Confirmado</option>
                  <option value="PREPARANDO">Preparando en Almacén</option>
                  <option value="LISTO_PARA_ENTREGA">Listo para Entrega</option>
                  <option value="ENVIADO">Enviado / En Ruta</option>
                  <option value="ENTREGADO">Entregado con Éxito</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Observación / Nota de Auditoría:
                </label>
                <textarea
                  rows={3}
                  placeholder="Ej. Paquete empacado y entregado a courier nacional con guía #BOL-9921"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500">
                Responsable del cambio: <strong>{currentUser.name}</strong> ({currentUser.role})
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStatusModalOrder(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Guardar Actualización
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedOrder && (
        <ReceiptModal
          order={selectedOrder}
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};
