import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  Boxes,
  FileText,
  Tag,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Download,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Search,
  Database,
  Wifi,
  WifiOff,
  X,
  Check,
} from 'lucide-react';
import { storage } from '../services/storage';
import { reportService, SalesReportMetrics } from '../services/reportService';
import { inventoryService, InventoryStatusItem } from '../services/inventoryService';
import { couponService } from '../services/couponService';
import { Product, Coupon, AppConfig, Category } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCacheStats } from '../hooks/useProductsCache';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'METRICAS' | 'PRODUCTOS' | 'INVENTARIO' | 'CUPONES' | 'CONFIG'>('METRICAS');

  const [metrics, setMetrics] = useState<SalesReportMetrics>(reportService.getMetrics());
  const [inventoryItems, setInventoryItems] = useState<InventoryStatusItem[]>(inventoryService.getSummary());
  const [coupons, setCoupons] = useState<Coupon[]>(couponService.getAll());
  const [products, setProducts] = useState<Product[]>(storage.getProducts());
  const [categories, setCategories] = useState<Category[]>(storage.getCategories());
  const [config, setConfig] = useState<AppConfig>(storage.getConfig());
  const { stats: cacheStats, clearCache, syncNow } = useCacheStats();

  // Inventory adjustment modal
  const [adjModalProd, setAdjModalProd] = useState<Product | null>(null);
  const [newStockTotal, setNewStockTotal] = useState<number>(0);
  const [adjReason, setAdjReason] = useState<string>('');

  // Stock Inflow modal
  const [inflowModalProd, setInflowModalProd] = useState<Product | null>(null);
  const [inflowQty, setInflowQty] = useState<number>(10);
  const [inflowReason, setInflowReason] = useState<string>('Ingreso de nuevo lote importado a almacén');

  // Product edit/create state
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);

  // New Coupon form
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponValue, setNewCouponValue] = useState(10);
  const [newCouponType, setNewCouponType] = useState<'PORCENTAJE' | 'MONTO_FIJO'>('PORCENTAJE');

  const refreshAll = () => {
    setMetrics(reportService.getMetrics());
    setInventoryItems(inventoryService.getSummary());
    setCoupons(couponService.getAll());
    setProducts(storage.getProducts());
    setCategories(storage.getCategories());
    setConfig(storage.getConfig());
  };

  useEffect(() => {
    refreshAll();
    const unsub = storage.subscribe(() => refreshAll());
    return unsub;
  }, []);

  // Handle Inventory Adjustment
  const handleSaveStockAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjModalProd) return;
    const res = inventoryService.adjustStock({
      productoId: adjModalProd.id,
      nuevoStockTotal: Number(newStockTotal),
      usuario: currentUser.name,
      motivo: adjReason || 'Ajuste manual de inventario físico',
    });
    if (res.success) {
      setAdjModalProd(null);
      refreshAll();
    } else {
      alert(res.error);
    }
  };

  // Handle Stock Inflow
  const handleSaveStockInflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inflowModalProd) return;
    const res = inventoryService.addStockInflow({
      productoId: inflowModalProd.id,
      unidadesAAgregar: Number(inflowQty),
      usuario: currentUser.name,
      motivo: inflowReason,
    });
    if (res.success) {
      setInflowModalProd(null);
      refreshAll();
    } else {
      alert(res.error);
    }
  };

  // Handle Product Save
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const prods = storage.getProducts();
    if (isNewProduct) {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        slug: (editingProduct.nombre || 'producto').toLowerCase().replace(/[^a-z0-9]/g, '-'),
        nombre: editingProduct.nombre || 'Nuevo Producto',
        sku: editingProduct.sku || `SKU-${Date.now().toString().slice(-4)}`,
        marca: editingProduct.marca || 'FACTOR X COMPANY',
        categoriaId: editingProduct.categoriaId || 'cat-fx-salud-bienestar',
        categoriaNombre: editingProduct.categoriaNombre || 'Salud & Bienestar',
        precio: Number(editingProduct.precio) || 100,
        precioAnterior: editingProduct.precioAnterior ? Number(editingProduct.precioAnterior) : undefined,
        descuento: editingProduct.descuento ? Number(editingProduct.descuento) : 0,
        moneda: 'BOB',
        stockTotal: Number(editingProduct.stockTotal) || 20,
        stockReservado: 0,
        stockMinimo: Number(editingProduct.stockMinimo) || 5,
        descripcionCorta: editingProduct.descripcionCorta || '',
        descripcionCompleta: editingProduct.descripcionCompleta || editingProduct.descripcion || '',
        beneficios: ['Garantía oficial en Bolivia', 'Alta durabilidad'],
        especificaciones: { Origen: 'Garantizado', Garantía: '1 año' },
        imagenes: editingProduct.imagenes?.length
          ? editingProduct.imagenes
          : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'],
        rating: 5,
        reviewsCount: 1,
        estado: 'ACTIVO',
        destacado: editingProduct.destacado || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      prods.unshift(newProd);
    } else {
      const idx = prods.findIndex((p) => p.id === editingProduct.id);
      if (idx !== -1) {
        prods[idx] = {
          ...prods[idx],
          ...editingProduct,
          updatedAt: new Date().toISOString(),
        } as Product;
      }
    }
    storage.saveProducts(prods);
    setEditingProduct(null);
    setIsNewProduct(false);
    refreshAll();
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto del catálogo?')) {
      const prods = storage.getProducts().filter((p) => p.id !== id);
      storage.saveProducts(prods);
      refreshAll();
    }
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    couponService.saveOrUpdate({
      codigo: newCouponCode,
      valor: Number(newCouponValue),
      tipo: newCouponType,
      montoMinimoCompra: 100,
    });
    setNewCouponCode('');
    refreshAll();
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveConfig(config);
    alert('Configuración comercial actualizada correctamente.');
    refreshAll();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 font-bold rounded-lg text-xs">
              Mando Central
            </span>
            <span className="text-xs text-slate-400">| Administrador: {currentUser.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Panel de Administración X-CRISPIN
          </h1>
          <p className="text-xs text-slate-500">
            Control de productos, inventario con fórmula estricta, cupones y configuración para Bolivia.
          </p>
        </div>

        <button
          onClick={() => reportService.exportOrdersToCsv()}
          className="px-4 py-2 bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Ventas a CSV</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('METRICAS')}
          className={`px-4 py-2 font-bold rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'METRICAS' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Dashboard & Métricas
        </button>
        <button
          onClick={() => setActiveTab('PRODUCTOS')}
          className={`px-4 py-2 font-bold rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'PRODUCTOS' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Productos ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('INVENTARIO')}
          className={`px-4 py-2 font-bold rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'INVENTARIO' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Kardex & Control de Inventario
        </button>
        <button
          onClick={() => setActiveTab('CUPONES')}
          className={`px-4 py-2 font-bold rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'CUPONES' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Cupones de Descuento ({coupons.length})
        </button>
        <button
          onClick={() => setActiveTab('CONFIG')}
          className={`px-4 py-2 font-bold rounded-xl transition-colors whitespace-nowrap ${
            activeTab === 'CONFIG' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Configuración Comercial
        </button>
      </div>

      {/* TAB 1: METRICAS */}
      {activeTab === 'METRICAS' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-1 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Facturación Total</span>
              <p className="text-2xl font-black text-slate-950">Bs. {metrics.totalVentas}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Pedidos confirmados</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-1 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Pedidos</span>
              <p className="text-2xl font-black text-cyan-700">{metrics.totalPedidos}</p>
              <span className="text-[10px] text-slate-400">{metrics.pedidosEntregados} entregados</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-1 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Ticket Promedio</span>
              <p className="text-2xl font-black text-indigo-600">Bs. {metrics.ticketPromedio}</p>
              <span className="text-[10px] text-slate-400">Por orden de compra</span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-1 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Por Validar</span>
              <p className="text-2xl font-black text-amber-600">{metrics.pedidosPendientes}</p>
              <span className="text-[10px] text-amber-700 font-semibold">En mesa de recepción</span>
            </div>
          </div>

          {/* Department Breakdown & Payment methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales by Department in Bolivia */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Ventas por Departamento en Bolivia
              </h3>
              <div className="space-y-2">
                {metrics.ventasPorDepartamento.map((d) => (
                  <div key={d.departamento} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{d.departamento}</span>
                      <span>Bs. {d.monto} ({d.cantidad} pedidos)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-cyan-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, metrics.totalVentas ? (d.monto / metrics.totalVentas) * 100 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sales by Category & Payment method */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Distribución por Métodos de Pago
              </h3>
              <div className="space-y-3">
                {metrics.ventasPorMetodoPago.map((m) => (
                  <div key={m.metodo} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{m.metodo}</p>
                      <span className="text-[10px] text-slate-400">{m.cantidad} transacciones</span>
                    </div>
                    <span className="font-black text-slate-950">Bs. {m.totalBs}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTOS CRUD */}
      {activeTab === 'PRODUCTOS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Catálogo de Productos</h3>
            <button
              onClick={() => {
                setEditingProduct({});
                setIsNewProduct(true);
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Nuevo Producto</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">SKU / Marca</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Precio (Bs.)</th>
                  <th className="py-3 px-4">Stock Total / Disp.</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={p.imagenes[0]}
                        alt={p.nombre}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{p.nombre}</span>
                        {p.descuento ? (
                          <span className="text-[10px] text-rose-600 font-bold">-{p.descuento}% desc.</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-600 block">{p.sku}</span>
                      <span className="text-[10px] text-slate-400">{p.marca}</span>
                    </td>
                    <td className="py-3 px-4">{p.categoriaNombre}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">Bs. {p.precio}</td>
                    <td className="py-3 px-4 font-semibold">
                      {p.stockTotal} / <span className="text-cyan-700">{p.stockTotal - p.stockReservado}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsNewProduct(false);
                          }}
                          className="p-1.5 text-slate-600 hover:text-cyan-700"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CONTROL DE INVENTARIO (KARDEX & FORMULA) */}
      {activeTab === 'INVENTARIO' && (
        <div className="space-y-6">
          <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-cyan-950">
                Fórmula estricta de inventario: <strong className="font-mono text-cyan-700">STOCK DISPONIBLE = STOCK TOTAL - STOCK RESERVADO</strong>
              </p>
              <p className="text-cyan-700 text-[11px] mt-0.5">
                El stock reservado se incrementa con nuevos pedidos y se deduce permanentemente al entregar o se libera al cancelar.
              </p>
            </div>
            <span className="px-3 py-1 bg-cyan-600 text-white font-bold rounded-lg whitespace-nowrap">
              Kardex Activo
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 text-center">Stock Total</th>
                  <th className="py-3 px-4 text-center">Reservado</th>
                  <th className="py-3 px-4 text-center">Disponible</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventoryItems.map((item) => (
                  <tr key={item.product.id}>
                    <td className="py-3 px-4 font-bold text-slate-900">{item.product.nombre}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{item.product.sku}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-800">{item.stockTotal}</td>
                    <td className="py-3 px-4 text-center font-bold text-amber-600">{item.stockReservado}</td>
                    <td className="py-3 px-4 text-center font-black text-cyan-700">{item.stockDisponible}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          item.estadoAlerta === 'AGOTADO'
                            ? 'bg-rose-100 text-rose-800'
                            : item.estadoAlerta === 'STOCK_BAJO'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.estadoAlerta}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setInflowModalProd(item.product);
                            setInflowQty(10);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold"
                        >
                          + Ingreso Lote
                        </button>
                        <button
                          onClick={() => {
                            setAdjModalProd(item.product);
                            setNewStockTotal(item.stockTotal);
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-cyan-600 text-white rounded-lg text-[10px] font-bold"
                        >
                          Ajustar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CUPONES */}
      {activeTab === 'CUPONES' && (
        <div className="space-y-6">
          {/* Create Coupon Form */}
          <form onSubmit={handleCreateCoupon} className="p-5 bg-white rounded-3xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Crear Nuevo Cupón de Descuento
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="CÓDIGO (ej. DESCUENTO20)"
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                required
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase"
              />
              <select
                value={newCouponType}
                onChange={(e) => setNewCouponType(e.target.value as any)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              >
                <option value="PORCENTAJE">Porcentaje (%)</option>
                <option value="MONTO_FIJO">Monto Fijo en Bs.</option>
              </select>
              <input
                type="number"
                placeholder="Valor (ej. 10)"
                value={newCouponValue}
                onChange={(e) => setNewCouponValue(Number(e.target.value))}
                required
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
              <button
                type="submit"
                className="py-2 bg-slate-900 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Crear Cupón
              </button>
            </div>
          </form>

          {/* Coupons Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Tipo / Valor</th>
                  <th className="py-3 px-4">Vigencia</th>
                  <th className="py-3 px-4">Usos Realizados</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{c.codigo}</td>
                    <td className="py-3 px-4">
                      {c.tipo === 'PORCENTAJE' ? `${c.valor}%` : `Bs. ${c.valor}`}
                    </td>
                    <td className="py-3 px-4">{c.fechaInicio} al {c.fechaFin}</td>
                    <td className="py-3 px-4">{c.usosActuales} / {c.usoMaximo}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {c.activo ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          couponService.delete(c.id);
                          refreshAll();
                        }}
                        className="text-rose-600 hover:underline font-bold text-[11px]"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CONFIGURACIÓN COMERCIAL */}
      {activeTab === 'CONFIG' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <form onSubmit={handleSaveConfig} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Configuración Oficial de Operaciones en Bolivia
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nombre Comercial</label>
              <input
                type="text"
                value={config.tiendaNombre}
                onChange={(e) => setConfig({ ...config, tiendaNombre: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Slogan</label>
              <input
                type="text"
                value={config.slogan}
                onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-cyan-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">WhatsApp de Ventas & Soporte</label>
              <input
                type="text"
                value={config.whatsapp}
                onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">NIT / Carnet de Identidad</label>
              <input
                type="text"
                value={config.bancoNitCi}
                onChange={(e) => setConfig({ ...config, bancoNitCi: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-100">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Banco Oficial</label>
              <input
                type="text"
                value={config.bancoNombre}
                onChange={(e) => setConfig({ ...config, bancoNombre: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nro. de Cuenta Corriente (Bs.)</label>
              <input
                type="text"
                value={config.bancoNroCuenta}
                onChange={(e) => setConfig({ ...config, bancoNroCuenta: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="font-bold text-slate-700 block mb-1">URL Imagen Código QR Simple Oficial</label>
            <input
              type="text"
              value={config.qrImagenUrl}
              onChange={(e) => setConfig({ ...config, qrImagenUrl: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-slate-900 hover:bg-cyan-600 text-white font-bold text-xs rounded-xl transition-colors shadow-xs mt-2"
          >
            Guardar Configuración Oficial
          </button>
        </form>

        {/* Smart Cache & Offline Performance Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Estrategia de Caché Inteligente & Modo Offline
                </h3>
                <p className="text-[11px] text-slate-500">
                  Arquitectura multi-nivel (L1 Memoria + L2 Almacenamiento Persistente) con revalidación en segundo plano (SWR)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  cacheStats.isOffline
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {cacheStats.isOffline ? (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                    <span>Modo Sin Conexión</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Conexión Online Estable</span>
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Recursos Cacheados
              </span>
              <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">
                {cacheStats.entryCount}
              </span>
              <span className="text-[10px] text-cyan-600 font-medium">L1 Memoria + L2 Local</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Peticiones Ahorradas (Hits)
              </span>
              <span className="text-lg font-black text-emerald-600 font-mono mt-0.5 block">
                {cacheStats.hits}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">0ms latencia</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Revalidaciones SWR
              </span>
              <span className="text-lg font-black text-cyan-600 font-mono mt-0.5 block">
                {cacheStats.revalidations}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Background sync</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Última Sincronización
              </span>
              <span className="text-xs font-bold text-slate-800 font-mono mt-1.5 block truncate">
                {cacheStats.lastSyncTime
                  ? new Date(cacheStats.lastSyncTime).toLocaleTimeString('es-BO')
                  : 'Reciente'}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Automático</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="text-xs text-slate-500 max-w-md">
              El catálogo y categorías se mantienen en almacenamiento persistente local para permitir que clientes y distribuidores sigan consultando productos y precios ante micro-cortes de red.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => syncNow()}
                className="px-4 py-2 bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sincronizar Catálogo</span>
              </button>

              <button
                type="button"
                onClick={() => clearCache()}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors cursor-pointer"
              >
                <span>Purgar Caché Local</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Adjust Inventory Modal */}
      {adjModalProd && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveStockAdjustment}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-900">
              Ajuste de Inventario Físico: {adjModalProd.nombre}
            </h3>
            <div className="space-y-3 text-xs">
              <p className="text-slate-500">
                Stock actual: <strong>{adjModalProd.stockTotal}</strong> (Reservado:{' '}
                <strong>{adjModalProd.stockReservado}</strong>)
              </p>
              <div>
                <label className="font-bold block mb-1">Nuevo Stock Total Físico:</label>
                <input
                  type="number"
                  min={adjModalProd.stockReservado}
                  value={newStockTotal}
                  onChange={(e) => setNewStockTotal(Number(e.target.value))}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Motivo del Ajuste:</label>
                <input
                  type="text"
                  placeholder="Ej. Conteo cíclico mensual de bodega central"
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setAdjModalProd(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Confirmar Ajuste
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inflow Modal */}
      {inflowModalProd && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveStockInflow}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-900">
              Registrar Entrada de Lote: {inflowModalProd.nombre}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Unidades a Ingresar:</label>
                <input
                  type="number"
                  min="1"
                  value={inflowQty}
                  onChange={(e) => setInflowQty(Number(e.target.value))}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Motivo / Número de Guía de Importación:</label>
                <input
                  type="text"
                  value={inflowReason}
                  onChange={(e) => setInflowReason(e.target.value)}
                  required
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setInflowModalProd(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Registrar Ingreso
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create / Edit Product Modal (Agregar en el respectivo lugar y área) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveProduct}
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {isNewProduct ? 'Agregar Nuevo Producto' : 'Editar Producto'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete los datos oficiales para registrar el producto en el catálogo de Bolivia.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold block mb-1 text-slate-700">Nombre Oficial del Producto *</label>
                <input
                  type="text"
                  placeholder="Ej. Moringa XPH Plus Limón Liofilizado (Caja 26 Sachets)"
                  value={editingProduct.nombre || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, nombre: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:border-cyan-500 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Área / Categoría *</label>
                <select
                  value={editingProduct.categoriaId || 'cat-fx-salud-bienestar'}
                  onChange={(e) => {
                    const selectedCatId = e.target.value;
                    const catObj = categories.find((c) => c.id === selectedCatId);
                    setEditingProduct({
                      ...editingProduct,
                      categoriaId: selectedCatId,
                      categoriaNombre: catObj?.nombre || 'Salud & Bienestar',
                      linea: catObj?.nombre || 'Salud & Bienestar',
                    });
                  }}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-cyan-500 outline-hidden"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Código SKU *</label>
                <input
                  type="text"
                  placeholder="Ej. FX-SAL-MOR-PLUS"
                  value={editingProduct.sku || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:border-cyan-500 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Precio Público (Bs.) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  placeholder="Ej. 423.70"
                  value={editingProduct.precio !== undefined ? editingProduct.precio : ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, precio: Number(e.target.value) })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 focus:bg-white focus:border-cyan-500 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Precio Anterior / Referencia (Bs.)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ej. 465.00"
                  value={editingProduct.precioAnterior !== undefined ? editingProduct.precioAnterior : ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, precioAnterior: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-cyan-500 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Presentación Oficial</label>
                <input
                  type="text"
                  placeholder="Ej. Caja con 26 sachets de 7g / Frasco 60 cápsulas"
                  value={editingProduct.presentacion || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, presentacion: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-cyan-500 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Factor Puntos (Pts Red)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ej. 16"
                  value={editingProduct.factorPuntos !== undefined ? editingProduct.factorPuntos : ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, factorPuntos: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-cyan-500 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Stock Inicial Total *</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ej. 40"
                  value={editingProduct.stockTotal !== undefined ? editingProduct.stockTotal : ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stockTotal: Number(e.target.value) })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-cyan-500 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">Estado del Producto</label>
                <select
                  value={editingProduct.estado || 'ACTIVO'}
                  onChange={(e) => setEditingProduct({ ...editingProduct, estado: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:bg-white focus:border-cyan-500 outline-hidden"
                >
                  <option value="ACTIVO">Activo en Catálogo</option>
                  <option value="DESTACADO">Destacado (Página de Inicio)</option>
                  <option value="NUEVO">Novedad / Lanzamiento</option>
                  <option value="OFERTA">Oferta Especial</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold block mb-1 text-slate-700">URL de Imagen Principal</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={editingProduct.imagenes && editingProduct.imagenes.length > 0 ? editingProduct.imagenes[0] : ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, imagenes: [e.target.value] })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-cyan-500 outline-hidden text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold block mb-1 text-slate-700">Descripción Corta *</label>
                <input
                  type="text"
                  placeholder="Resumen para la tarjeta de producto (1-2 líneas)"
                  value={editingProduct.descripcionCorta || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, descripcionCorta: e.target.value })}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-cyan-500 outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold block mb-1 text-slate-700">Descripción Detallada / Beneficios</label>
                <textarea
                  rows={3}
                  placeholder="Explicación detallada de ingredientes botánicos, forma de consumo e impacto en la salud..."
                  value={editingProduct.descripcionCompleta || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, descripcionCompleta: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:border-cyan-500 outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isNewProduct ? 'Guardar y Agregar Producto' : 'Actualizar Producto'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
