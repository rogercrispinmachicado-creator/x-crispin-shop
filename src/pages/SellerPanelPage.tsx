import React, { useState, useEffect } from 'react';
import {
  Store,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Share2,
  MessageCircle,
  PlusCircle,
  Search,
  User,
  CheckCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { storage } from '../services/storage';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { whatsappService } from '../services/whatsappService';
import { useAuth } from '../context/AuthContext';
import { Order, Product } from '../types';

export const SellerPanelPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'METRICAS' | 'CATALOGO' | 'PEDIDOS' | 'NUEVO_PEDIDO'>('METRICAS');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Assisted Order Creation Form
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteApellido, setClienteApellido] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [departamento, setDepartamento] = useState('La Paz');
  const [ciudad, setCiudad] = useState('La Paz');
  const [direccion, setDireccion] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [orderCreatedMsg, setOrderCreatedMsg] = useState<string | null>(null);

  const loadData = () => {
    setOrders(storage.getOrders());
    setProducts(storage.getProducts());
  };

  useEffect(() => {
    loadData();
    const unsub = storage.subscribe(() => loadData());
    return unsub;
  }, []);

  // Filter orders for this seller
  const myOrders = orders.filter((o) => o.vendedorId === currentUser.id || !o.vendedorId);

  // Calculate metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const salesToday = myOrders
    .filter((o) => o.createdAt.startsWith(todayStr))
    .reduce((sum, o) => sum + o.total, 0);

  const totalSales = myOrders.reduce((sum, o) => sum + o.total, 0);
  const deliveredSales = myOrders
    .filter((o) => o.estado === 'ENTREGADO' || o.estadoPago === 'CONFIRMADO')
    .reduce((sum, o) => sum + o.total, 0);

  const handleShareProductWhatsApp = (prod: Product) => {
    const url = whatsappService.buildProductShareUrl(prod);
    window.open(url, '_blank');
  };

  const handleCreateAssistedOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderCreatedMsg(null);

    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) {
      alert('Por favor selecciona un producto');
      return;
    }

    const res = orderService.createOrder({
      clienteId: `lead-${Date.now()}`,
      clienteNombre,
      clienteApellido,
      clienteEmail: `${clienteNombre.toLowerCase()}@contacto.bo`,
      clienteTelefono,
      clienteWhatsapp: clienteTelefono,
      vendedorId: currentUser.id,
      vendedorNombre: currentUser.name,
      departamento,
      ciudad,
      zona: 'Centro',
      direccion,
      referencia: 'Pedido asistido por vendedor X-CRISPIN',
      metodoEntregaId: 'EXPRESS',
      metodoEntregaNombre: 'Entrega Express Bolivia',
      costoEnvio: 15,
      items: [
        {
          productoId: prod.id,
          nombre: prod.nombre,
          sku: prod.sku,
          imagen: prod.imagenes[0] || '',
          precioUnitario: prod.precio,
          cantidad: quantity,
          subtotal: prod.precio * quantity,
        },
      ],
      subtotal: prod.precio * quantity,
      descuentoCupon: 0,
      total: prod.precio * quantity + 15,
      metodoPago: 'QR_SIMPLE',
      notas: `Pedido asistido generado por vendedor ${currentUser.name}`,
    });

    if (res.success && res.order) {
      setOrderCreatedMsg(`¡Pedido ${res.order.numeroPedido} creado con éxito!`);
      setClienteNombre('');
      setClienteApellido('');
      setClienteTelefono('');
      setDireccion('');
      loadData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-lg text-xs">
              Portal de Ventas
            </span>
            <span className="text-xs text-slate-400">| Vendedor: {currentUser.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Panel de Vendedor & Distribución
          </h1>
          <p className="text-xs text-slate-500">
            Gestiona tus clientes, genera pedidos asistidos y comparte enlaces oficiales de WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('NUEVO_PEDIDO')}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Registrar Pedido de Cliente</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('METRICAS')}
          className={`px-4 py-2 font-bold rounded-xl transition-colors ${
            activeTab === 'METRICAS'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Métricas & Comisiones
        </button>
        <button
          onClick={() => setActiveTab('CATALOGO')}
          className={`px-4 py-2 font-bold rounded-xl transition-colors ${
            activeTab === 'CATALOGO'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Catálogo con Enlace WhatsApp
        </button>
        <button
          onClick={() => setActiveTab('PEDIDOS')}
          className={`px-4 py-2 font-bold rounded-xl transition-colors ${
            activeTab === 'PEDIDOS'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Mis Pedidos ({myOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('NUEVO_PEDIDO')}
          className={`px-4 py-2 font-bold rounded-xl transition-colors ${
            activeTab === 'NUEVO_PEDIDO'
              ? 'bg-amber-500 text-slate-950'
              : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
          }`}
        >
          + Crear Pedido Asistido
        </button>
      </div>

      {/* TAB 1: METRICAS */}
      {activeTab === 'METRICAS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-2 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Ventas de Hoy</span>
              <p className="text-2xl font-black text-slate-950">Bs. {salesToday}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Operaciones registradas hoy</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-2 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Ventas Totales</span>
              <p className="text-2xl font-black text-cyan-700">Bs. {totalSales}</p>
              <span className="text-[10px] text-slate-400">{myOrders.length} pedidos gestionados</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-2 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Ventas Cobradas</span>
              <p className="text-2xl font-black text-emerald-600">Bs. {deliveredSales}</p>
              <span className="text-[10px] text-slate-400">Con pago verificado</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-2 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Comisión Estimada (5%)</span>
              <p className="text-2xl font-black text-amber-600">Bs. {Math.round(deliveredSales * 0.05)}</p>
              <span className="text-[10px] text-amber-700 font-semibold">Por cobrar</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATALOGO CON WHATSAPP */}
      {activeTab === 'CATALOGO' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Productos disponibles para compartir con tus clientes
            </h3>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products
              .filter((p) => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between shadow-xs"
                >
                  <div className="flex gap-3">
                    <img
                      src={prod.imagenes[0]}
                      alt={prod.nombre}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <span className="text-[10px] font-mono text-slate-400">{prod.sku}</span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{prod.nombre}</h4>
                      <p className="text-xs font-black text-slate-950 mt-1">Bs. {prod.precio}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleShareProductWhatsApp(prod)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Compartir por WhatsApp con mi enlace</span>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: MIS PEDIDOS */}
      {activeTab === 'PEDIDOS' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Nro. Pedido</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Destino</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myOrders.map((o) => (
                <tr key={o.id}>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{o.numeroPedido}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold">{o.clienteNombre} {o.clienteApellido}</p>
                    <p className="text-[10px] text-slate-500">{o.clienteTelefono}</p>
                  </td>
                  <td className="py-3 px-4">{o.ciudad} ({o.departamento})</td>
                  <td className="py-3 px-4 font-black">Bs. {o.total}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                      {o.estado.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        const url = whatsappService.buildOrderShareUrl(o);
                        window.open(url, '_blank');
                      }}
                      className="text-emerald-600 hover:text-emerald-800 font-bold text-[11px] flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Reenviar a Cliente</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: REGISTRAR PEDIDO ASISTIDO */}
      {activeTab === 'NUEVO_PEDIDO' && (
        <form
          onSubmit={handleCreateAssistedOrder}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 max-w-2xl mx-auto space-y-4 shadow-xs"
        >
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Registrar Nuevo Pedido en Nombre de un Cliente
          </h3>

          {orderCreatedMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{orderCreatedMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nombre del Cliente *</label>
              <input
                type="text"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                required
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Apellido *</label>
              <input
                type="text"
                value={clienteApellido}
                onChange={(e) => setClienteApellido(e.target.value)}
                required
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Teléfono / WhatsApp *</label>
              <input
                type="tel"
                value={clienteTelefono}
                onChange={(e) => setClienteTelefono(e.target.value)}
                required
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Departamento Bolivia *</label>
              <select
                value={departamento}
                onChange={(e) => {
                  setDepartamento(e.target.value);
                  setCiudad(e.target.value);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="La Paz">La Paz</option>
                <option value="Santa Cruz">Santa Cruz</option>
                <option value="Cochabamba">Cochabamba</option>
                <option value="Oruro">Oruro</option>
                <option value="Potosí">Potosí</option>
                <option value="Chuquisaca">Chuquisaca</option>
                <option value="Tarija">Tarija</option>
                <option value="Beni">Beni</option>
                <option value="Pando">Pando</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Dirección de Entrega *</label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              required
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Producto a Vender *</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="">-- Selecciona producto --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} (Bs. {p.precio}) - Stock: {p.stockTotal - p.stockReservado}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Cantidad *</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-slate-900 hover:bg-cyan-600 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
          >
            Registrar Pedido Asistido
          </button>
        </form>
      )}
    </div>
  );
};
