import React, { useMemo } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  QrCode,
  Sparkles,
  Zap,
  Tag,
  Star,
  MessageCircle,
  TrendingUp,
  Package,
  HeartPulse,
  Coffee,
  Flame,
  Award,
  Heart,
  Activity,
  Check,
} from 'lucide-react';
import { XLogo } from '../components/common/XLogo';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { whatsappService } from '../services/whatsappService';
import { useProductsCache } from '../hooks/useProductsCache';
import { usePersistentData } from '../hooks/usePersistentData';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { ProductCardSkeleton } from '../components/common/Skeletons';
import { WishlistHeartButton } from '../components/wishlist/WishlistHeartButton';
import { CompareButton } from '../components/comparison/CompareButton';

interface HomePageProps {
  onNavigate: (route: string, param?: string) => void;
  onSelectProduct: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectProduct }) => {
  const { addItem } = useCart();
  
  // Respaldo rápido persistente de categorías y productos más vendidos (localStorage)
  const {
    categories,
    bestSellers,
    hasBackup,
    isRevalidating,
    loading: persistentLoading,
  } = usePersistentData({ bestSellersLimit: 4 });

  const { products: allProducts } = useProductsCache();

  const saludBienestarProducts = useMemo(
    () => allProducts.filter((p) => p.categoriaId === 'cat-fx-salud-bienestar' || p.categoriaId === 'cat-fx-suplementos'),
    [allProducts]
  );

  const featuredProducts = useMemo(
    () => allProducts.filter((p) => p.estado === 'DESTACADO' || (p.descuento && p.descuento > 0)).slice(0, 4),
    [allProducts]
  );
  const dealProducts = useMemo(
    () => allProducts.filter((p) => p.estado === 'OFERTA' || (p.descuento && p.descuento > 10)).slice(0, 4),
    [allProducts]
  );
  const newProducts = useMemo(
    () => allProducts.filter((p) => p.estado === 'NUEVO').slice(0, 4),
    [allProducts]
  );

  const handleQuickBuy = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleWhatsAppShare = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = whatsappService.buildProductShareUrl(product);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-16 pb-20 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-800">
        {/* Subtle grid and ambient backdrop glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Typography & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-cyan-400">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>E-Commerce Oficial • Bolivia</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-tight">
                X-CRISPIN <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400">
                  SHOP THE X
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                La plataforma de comercio electrónico de vanguardia tecnológica. Catálogo exclusivo, pagos seguros mediante <strong className="text-white">QR Simple</strong> y transferencias bancarias con despacho a los 9 departamentos.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigate('productos')}
                  id="hero-explore-catalog-btn"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Explorar Catálogo</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => onNavigate('seguimiento')}
                  id="hero-track-order-btn"
                  className="w-full sm:w-auto px-8 py-4 bg-slate-800/90 hover:bg-slate-700/90 text-white font-bold text-sm rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Rastrear mi Pedido</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800 text-left">
                <div>
                  <p className="text-xl font-bold text-white">100%</p>
                  <p className="text-xs text-slate-400">Garantía en Bolivia</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-white">QR Simple</p>
                  <p className="text-xs text-slate-400">Pago Interbancario</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-white">9 Deptos.</p>
                  <p className="text-xs text-slate-400">Cobertura Nacional</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual featuring the official Multicolor X */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center">
                {/* Rotating decorative halo */}
                <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-[spin_30s_linear_infinite]" />
                <div className="absolute inset-6 rounded-full border border-emerald-500/20 animate-[spin_20s_linear_infinite_reverse]" />

                {/* Central Multi-color X Brand Symbol */}
                <div className="relative p-6 sm:p-8 bg-slate-900/90 rounded-3xl border border-slate-700/80 shadow-2xl backdrop-blur-md transition-transform hover:scale-105 duration-300">
                  <XLogo size="xl" showSlogan={false} variant="icon-only" className="w-48 h-48 sm:w-60 sm:h-60" />
                  <div className="text-center mt-3">
                    <span className="text-xs font-mono font-bold tracking-[0.3em] text-cyan-400 uppercase">
                      SHOP THE X
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Categorías Oficiales
            </h2>
            <p className="text-xs text-slate-500">Selecciona tu categoría para ver inventario disponible</p>
          </div>
          <button
            onClick={() => onNavigate('productos')}
            className="text-xs font-bold text-cyan-600 hover:text-cyan-800 flex items-center gap-1"
          >
            Ver todo el catálogo &rarr;
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const isSalud = cat.id === 'cat-fx-salud-bienestar' || cat.id === 'cat-fx-suplementos';
            return (
              <div
                key={cat.id}
                onClick={() => onNavigate('productos', cat.id)}
                className={`group p-5 bg-white rounded-2xl border transition-all cursor-pointer text-center ${
                  isSalud
                    ? 'border-emerald-300 shadow-xs hover:border-emerald-500 hover:shadow-md bg-gradient-to-b from-white to-emerald-50/20'
                    : 'border-slate-200/80 hover:border-cyan-500/50 hover:shadow-md'
                }`}
              >
                <div
                  className={`w-12 h-12 mx-auto mb-3 rounded-2xl transition-colors flex items-center justify-center ${
                    isSalud
                      ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                      : cat.id === 'cat-fx-cafes'
                      ? 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white'
                      : cat.id === 'cat-fx-peso'
                      ? 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white'
                      : cat.id === 'cat-fx-colageno'
                      ? 'bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white'
                      : cat.id === 'cat-fx-packs'
                      ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'
                      : 'bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white'
                  }`}
                >
                  {isSalud ? (
                    <HeartPulse className="w-6 h-6" />
                  ) : cat.id === 'cat-fx-cafes' ? (
                    <Coffee className="w-6 h-6" />
                  ) : cat.id === 'cat-fx-peso' ? (
                    <Flame className="w-6 h-6" />
                  ) : cat.id === 'cat-fx-colageno' ? (
                    <Heart className="w-6 h-6" />
                  ) : cat.id === 'cat-fx-packs' ? (
                    <Award className="w-6 h-6" />
                  ) : (
                    <Package className="w-6 h-6" />
                  )}
                </div>
                <div className="flex items-center justify-center gap-1">
                  <h3
                    className={`text-xs font-bold transition-colors ${
                      isSalud ? 'text-emerald-950 group-hover:text-emerald-700' : 'text-slate-900 group-hover:text-cyan-700'
                    }`}
                  >
                    {cat.nombre}
                  </h3>
                  {isSalud && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" title="Área destacada" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{cat.descripcion}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* DEDICATED SECTION: ÁREA OFICIAL SALUD & BIENESTAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white relative overflow-hidden shadow-xl border border-emerald-800/60 mb-8">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-5 flex items-center justify-center pointer-events-none">
            <HeartPulse className="w-96 h-96 text-emerald-400" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
              <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
              <span>Área Oficial Factor X Bolivia</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
                  Línea Salud & Bienestar
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl mt-1 leading-relaxed">
                  Nutrición botánica de máxima pureza, moringa liofilizada alcalinizante en caja oficial de 26 sachets, extractos protectores del hígado y omegas concentrados para vitalidad integral.
                </p>
              </div>

              <button
                onClick={() => onNavigate('productos', 'cat-fx-salud-bienestar')}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5"
              >
                <span>Ver Todos en Salud & Bienestar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Health Highlights Tags */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-lg bg-emerald-900/60 border border-emerald-700/60 text-emerald-200 flex items-center gap-1.5 font-medium">
                <Check className="w-3 h-3 text-emerald-400" />
                Moringa XPH Plus (Caja 26 Sachets)
              </span>
              <span className="px-3 py-1 rounded-lg bg-emerald-900/60 border border-emerald-700/60 text-emerald-200 flex items-center gap-1.5 font-medium">
                <Check className="w-3 h-3 text-emerald-400" />
                Hepa-FX Cardo Mariano & Silimarina
              </span>
              <span className="px-3 py-1 rounded-lg bg-emerald-900/60 border border-emerald-700/60 text-emerald-200 flex items-center gap-1.5 font-medium">
                <Check className="w-3 h-3 text-emerald-400" />
                Omefac 3, 6 y 9 Puro
              </span>
              <span className="px-3 py-1 rounded-lg bg-emerald-900/60 border border-emerald-700/60 text-emerald-200 flex items-center gap-1.5 font-medium">
                <Check className="w-3 h-3 text-emerald-400" />
                Moringa C-Ultra Concentrado
              </span>
            </div>
          </div>
        </div>

        {/* Salud & Bienestar Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {saludBienestarProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => onSelectProduct(prod.slug)}
              className="bg-white rounded-2xl border border-emerald-100 hover:border-emerald-400/80 overflow-hidden hover:shadow-xl transition-all duration-200 flex flex-col group cursor-pointer"
            >
              {/* Image & Health Badges */}
              <div className="relative aspect-square overflow-hidden bg-emerald-50/40">
                <img
                  src={prod.imagenes[0]}
                  alt={prod.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-bold rounded-md flex items-center gap-1 shadow-xs">
                  <HeartPulse className="w-3 h-3" />
                  <span>Salud & Bienestar</span>
                </span>
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
                  <WishlistHeartButton
                    productId={prod.id}
                    productName={prod.nombre}
                    size="sm"
                    className="bg-white/90 backdrop-blur-xs hover:bg-white shadow-xs"
                  />
                  <CompareButton
                    productId={prod.id}
                    productName={prod.nombre}
                    variant="icon"
                    className="bg-white/90 backdrop-blur-xs hover:bg-white shadow-xs !p-1.5"
                  />
                </div>
                {prod.presentacion && (
                  <span className="absolute bottom-3 left-3 right-3 px-2 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium rounded-lg text-center truncate">
                    {prod.presentacion}
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-bold text-slate-800">{prod.rating}</span>
                      <span className="text-slate-400 text-[11px]">({prod.reviewsCount})</span>
                    </div>
                    {prod.factorPuntos && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                        {prod.factorPuntos} Pts
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {prod.nombre}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {prod.descripcionCorta}
                  </p>
                </div>

                {/* Pricing & Stock */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-black text-slate-950">Bs. {prod.precio}</span>
                      {prod.precioAnterior && (
                        <span className="text-xs text-slate-400 line-through ml-2">
                          Bs. {prod.precioAnterior}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-emerald-600">
                      En Stock ({prod.stockTotal - prod.stockReservado})
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => handleQuickBuy(prod, e)}
                      id={`salud-buy-btn-${prod.id}`}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                    >
                      Agregar
                    </button>
                    <button
                      onClick={(e) => handleWhatsAppShare(prod, e)}
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
                      title="Consultar por WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Productos Destacados
              </h2>
              <p className="text-xs text-slate-500">Equipos de última generación con disponibilidad inmediata</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('productos')}
            className="text-xs font-bold text-cyan-600 hover:text-cyan-800"
          >
            Ver más &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => (
            <div
              key={prod.id}
              onClick={() => onSelectProduct(prod.slug)}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-xl transition-all duration-200 flex flex-col group cursor-pointer"
            >
              {/* Image & Badges */}
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img
                  src={prod.imagenes[0]}
                  alt={prod.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {prod.descuento && prod.descuento > 0 && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-rose-600 text-white text-[11px] font-extrabold rounded-lg shadow-sm">
                    -{prod.descuento}%
                  </span>
                )}
                <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
                  <WishlistHeartButton
                    productId={prod.id}
                    productName={prod.nombre}
                    size="sm"
                    className="bg-white/90 backdrop-blur-xs hover:bg-white shadow-xs"
                  />
                  <CompareButton
                    productId={prod.id}
                    productName={prod.nombre}
                    variant="icon"
                    className="bg-white/90 backdrop-blur-xs hover:bg-white shadow-xs !p-1.5"
                  />
                </div>
                <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-slate-900/80 text-white text-[10px] font-mono rounded backdrop-blur-xs">
                  {prod.marca}
                </span>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 text-xs mb-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="font-bold text-slate-800">{prod.rating}</span>
                    <span className="text-slate-400 text-[11px]">({prod.reviewsCount})</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-cyan-600 transition-colors line-clamp-2">
                    {prod.nombre}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {prod.descripcionCorta}
                  </p>
                </div>

                {/* Pricing & Stock */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-lg font-black text-slate-950">Bs. {prod.precio}</span>
                      {prod.precioAnterior && (
                        <span className="text-xs text-slate-400 line-through ml-2">
                          Bs. {prod.precioAnterior}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-emerald-600">
                      En Stock ({prod.stockTotal - prod.stockReservado})
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => handleQuickBuy(prod, e)}
                      id={`buy-btn-${prod.id}`}
                      className="w-full py-2 bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                    >
                      Agregar
                    </button>
                    <button
                      onClick={(e) => handleWhatsAppShare(prod, e)}
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
                      title="Consultar por WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Ventas / Más Vendidos (Powered by usePersistentData instant backup) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-600" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Más Vendidos en Bolivia
                </h2>
                {hasBackup && (
                  <span className="hidden sm:inline-flex px-2 py-0.5 bg-cyan-50 text-cyan-700 text-[10px] font-bold rounded-md border border-cyan-100">
                    Carga Instantánea
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Los productos tecnológicos preferidos por nuestra comunidad en los 9 departamentos
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('productos')}
            className="text-xs font-bold text-cyan-600 hover:text-cyan-800"
          >
            Ver catálogo completo &rarr;
          </button>
        </div>

        {persistentLoading && bestSellers.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" role="status" aria-label="Cargando productos destacados...">
            {[1, 2, 3, 4].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((prod, index) => (
              <div
                key={prod.id}
                onClick={() => onSelectProduct(prod.slug)}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-xl transition-all duration-200 flex flex-col group cursor-pointer relative"
              >
                {/* Ranking Position Badge */}
                <span className="absolute top-3 left-3 z-10 px-2 py-0.5 bg-slate-950/90 text-amber-400 text-[10px] font-black rounded-md flex items-center gap-1 shadow-sm backdrop-blur-xs">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>#{index + 1} TOP</span>
                </span>

                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  <img
                    src={prod.imagenes[0]}
                    alt={prod.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 z-10">
                    <WishlistHeartButton
                      productId={prod.id}
                      productName={prod.nombre}
                      size="sm"
                      className="bg-white/90 backdrop-blur-xs hover:bg-white shadow-xs"
                    />
                  </div>
                  <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-slate-900/80 text-white text-[10px] font-mono rounded backdrop-blur-xs">
                    {prod.marca}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-1 text-amber-400 text-xs mb-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-bold text-slate-800">{prod.rating}</span>
                      <span className="text-slate-400 text-[11px]">({prod.reviewsCount} reseñas)</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-cyan-600 transition-colors line-clamp-2">
                      {prod.nombre}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {prod.descripcionCorta}
                    </p>
                  </div>

                  {/* Pricing & Stock */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-lg font-black text-slate-950">Bs. {prod.precio}</span>
                        {prod.precioAnterior && (
                          <span className="text-xs text-slate-400 line-through ml-2">
                            Bs. {prod.precioAnterior}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-emerald-600">
                        Stock: {prod.stockTotal - prod.stockReservado}
                      </span>
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={(e) => handleQuickBuy(prod, e)}
                        id={`bestseller-buy-btn-${prod.id}`}
                        className="w-full py-2 bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                      >
                        Comprar
                      </button>
                      <button
                        onClick={(e) => handleWhatsAppShare(prod, e)}
                        className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
                        title="Consultar por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Customer Feedback & Testimonials Section */}
      <TestimonialsSection />

      {/* Special Deals Banner (Ofertas Relámpago) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center pointer-events-none">
            <XLogo size="xl" showSlogan={false} variant="icon-only" />
          </div>

          <div className="max-w-xl space-y-4 relative z-10">
            <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-bold uppercase tracking-wider inline-block">
              Ofertas de Temporada Bolivia
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight">
              Ahorra hasta 20% con el código{' '}
              <span className="text-cyan-400 font-mono">SHOPTHEX</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Aplica tu cupón en el carrito de compras y obtén descuento directo con entrega garantizada en tu ciudad.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('productos')}
                className="px-6 py-3 bg-white text-slate-950 hover:bg-cyan-400 font-bold text-xs rounded-xl transition-all shadow-md"
              >
                Ver Todas las Ofertas Activas
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
