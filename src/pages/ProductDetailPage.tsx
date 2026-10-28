import React, { useState } from 'react';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle,
  Share2,
  MessageCircle,
  ShoppingBag,
  Zap,
  ChevronDown,
  Info,
  ChevronRight,
  Sparkles,
  Award,
  Layers,
  Leaf,
  QrCode,
} from 'lucide-react';
import { productService } from '../services/productService';
import { ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { whatsappService } from '../services/whatsappService';
import { useProductDetailCache } from '../hooks/useProductsCache';
import { CacheStatusPill } from '../components/common/OfflineCacheBanner';
import { ProductDetailSkeleton } from '../components/common/Skeletons';
import { storage } from '../services/storage';
import { WishlistHeartButton } from '../components/wishlist/WishlistHeartButton';
import { ProductQrModal } from '../components/scanner/ProductQrModal';
import { CompareButton } from '../components/comparison/CompareButton';
import { RecentlyViewedSection } from '../components/common/RecentlyViewedSection';
import { NotifyMeButton } from '../components/product/NotifyMeButton';
import { SizeGuideButton } from '../components/product/SizeGuideButton';
import { ProductReviewsSection } from '../components/reviews/ProductReviewsSection';

interface ProductDetailPageProps {
  slug: string;
  onNavigateToCheckout: () => void;
  onSelectProduct: (slug: string) => void;
  onBackToCatalog: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  slug,
  onNavigateToCheckout,
  onSelectProduct,
  onBackToCatalog,
}) => {
  const { addItem } = useCart();
  const { currentUser } = useAuth();
  const { product, loading, isRevalidating, fromCache, isOffline, refresh } = useProductDetailCache(slug);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  // Sync selected variant when product finishes loading
  React.useEffect(() => {
    if (product && product.variantes && product.variantes.length > 0 && !selectedVariant) {
      setSelectedVariant(product.variantes[0]);
    }
  }, [product, selectedVariant]);

  // Record product interaction in Recently Viewed history
  React.useEffect(() => {
    if (product?.id) {
      storage.addRecentlyViewed(product.id);
    }
  }, [product?.id]);

  if (loading && !product) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Producto no encontrado</h2>
        <p className="text-slate-500 text-sm">El producto que buscas no existe o no se encuentra en la caché local.</p>
        <button
          onClick={onBackToCatalog}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-cyan-600 transition-colors"
        >
          Volver al Catálogo
        </button>
      </div>
    );
  }

  const stockAvailable = selectedVariant
    ? selectedVariant.stock
    : Math.max(0, product.stockTotal - product.stockReservado);

  const isOutOfStock = stockAvailable <= 0;
  const currentPrice = product.precio + (selectedVariant?.priceModifier || 0);

  const relatedProducts = productService.getRelated(product.id, product.categoriaId, 4);

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariant);
  };

  const handleBuyNow = () => {
    addItem(product, quantity, selectedVariant);
    onNavigateToCheckout();
  };

  const handleWhatsAppShare = () => {
    const url = whatsappService.buildProductShareUrl(product);
    window.open(url, '_blank');
  };

  const faqs = [
    {
      q: '¿Cómo se realiza el pago en Bolivia?',
      a: 'Aceptamos transferencias bancarias y pago instantáneo mediante QR Simple (Banco BCP, BNB, Banco Unión, Banco Mercantil Santa Cruz, Bisa y todas las apps bancarias de Bolivia).',
    },
    {
      q: '¿Hacen envíos a departamentos fuera del eje central?',
      a: 'Sí, cubrimos los 9 departamentos de Bolivia mediante courier express local (La Paz, Santa Cruz, Cochabamba) y transporte interdepartamental garantizado (Oruro, Potosí, Chuquisaca, Tarija, Beni, Pando).',
    },
    {
      q: '¿Este producto cuenta con garantía oficial?',
      a: 'Absolutamente. Todos los productos distribuidos por X-CRISPIN cuentan con garantía oficial de funcionamiento y soporte de postventa.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 font-sans">
      {/* Breadcrumbs & Cache Status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <button onClick={onBackToCatalog} className="hover:text-cyan-600 transition-colors">
            Catálogo
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">{product.categoriaNombre}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold truncate max-w-xs">{product.nombre}</span>
        </nav>

        <CacheStatusPill
          fromCache={fromCache}
          isRevalidating={isRevalidating}
          isOffline={isOffline}
          onRefresh={refresh}
        />
      </div>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image Gallery (minimum 3 images) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square bg-slate-50 rounded-3xl overflow-hidden border border-slate-200/90 relative">
            <img
              src={product.imagenes[selectedImageIndex] || product.imagenes[0]}
              alt={product.nombre}
              className="w-full h-full object-cover"
            />
            {product.descuento && product.descuento > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-rose-600 text-white text-xs font-black rounded-xl shadow-md">
                -{product.descuento}% OFERTA
              </span>
            )}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="px-3 py-1 bg-slate-900/80 text-white text-xs font-mono rounded-lg backdrop-blur-xs">
                SKU: {product.sku}
              </span>
              <WishlistHeartButton
                productId={product.id}
                productName={product.nombre}
                size="md"
                className="bg-white/95 shadow-md"
              />
            </div>
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-3">
            {product.imagenes.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selectedImageIndex === idx
                    ? 'border-cyan-500 shadow-md ring-2 ring-cyan-100'
                    : 'border-slate-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Information, Variants & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 bg-cyan-50 text-cyan-700 text-xs font-bold rounded-lg">
                {product.marca}
              </span>
              {product.factorPuntos && (
                <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-black rounded-lg flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  {product.factorPuntos} Factor Puntos
                </span>
              )}
              {product.presentacion && (
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1">
                  <Layers className="w-3 h-3 text-slate-500" />
                  {product.presentacion}
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('product-reviews-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1 text-amber-400 text-xs ml-auto hover:opacity-80 transition-opacity cursor-pointer group"
                title="Ver todas las opiniones y calificaciones de clientes"
              >
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold text-slate-800">{product.rating}</span>
                <span className="text-slate-500 group-hover:text-slate-800 underline underline-offset-2">
                  ({product.reviewsCount} opiniones)
                </span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {product.nombre}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
              {product.descripcionCorta}
            </p>
          </div>

          {/* Price & Stock Display */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-950">Bs. {currentPrice}</span>
              {product.precioAnterior && (
                <span className="text-sm text-slate-400 line-through">
                  Bs. {product.precioAnterior}
                </span>
              )}
              {product.precioUsd && (
                <span className="text-xs text-slate-400 ml-auto font-medium">
                  Ref. USD ${product.precioUsd}
                </span>
              )}
            </div>

            {/* Factor X Bolivia Price Scale */}
            {product.precioAfiliado && (
              <div className="pt-2 border-t border-slate-200/70">
                <p className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-cyan-600" />
                  Escala de Precios Bolivia (Factor X):
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="block text-[10px] text-slate-500 font-medium">Afiliado (-16%)</span>
                    <span className="text-xs font-black text-slate-900">Bs. {product.precioAfiliado}</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="block text-[10px] text-slate-500 font-medium">Minorista (-25%)</span>
                    <span className="text-xs font-black text-slate-900">Bs. {product.precioMinorista}</span>
                  </div>
                  <div className="p-2 bg-cyan-50/80 rounded-xl border border-cyan-200">
                    <span className="block text-[10px] text-cyan-800 font-bold">Mayorista (-32.5%)</span>
                    <span className="text-xs font-black text-cyan-950">Bs. {product.precioMayorista}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isOutOfStock
                      ? 'bg-rose-500'
                      : stockAvailable <= product.stockMinimo
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <span className="font-semibold text-slate-800">
                  {isOutOfStock
                    ? 'Agotado temporalmente'
                    : stockAvailable <= product.stockMinimo
                    ? `¡Últimas ${stockAvailable} unidades en almacén!`
                    : `Stock disponible: ${stockAvailable} unidades`}
                </span>
              </div>
              <span className="text-slate-500">Moneda oficial: Bolivianos (BOB)</span>
            </div>
          </div>

          {/* Notify Me Feature: Price Drop Alert Banner */}
          <NotifyMeButton
            product={product}
            variant="banner"
            onSelectProduct={onSelectProduct}
            onNavigateToCatalog={onBackToCatalog}
          />

          {/* Variants Selector */}
          {product.variantes && product.variantes.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Selecciona Opción / Variante:
                </label>
                <SizeGuideButton
                  product={product}
                  selectedVariant={selectedVariant}
                  onSelectVariant={(v) => setSelectedVariant(v)}
                  variant="link"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variantes.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      selectedVariant?.id === v.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <span>{v.name}</span>
                    {v.priceModifier !== 0 && (
                      <span className="ml-1 text-[10px] opacity-80">
                        ({v.priceModifier > 0 ? `+Bs. ${v.priceModifier}` : `-Bs. ${Math.abs(v.priceModifier)}`})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <SizeGuideButton
                product={product}
                variant="link"
              />
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Cantidad:
            </label>
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center border border-slate-200 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded-lg font-bold"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 text-sm font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(stockAvailable, q + 1))}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded-lg font-bold"
                  disabled={quantity >= stockAvailable}
                >
                  +
                </button>
              </div>
              <span className="text-xs text-slate-500">
                Total parcial: <strong>Bs. {currentPrice * quantity}</strong>
              </span>
            </div>
          </div>

          {/* Core Action Buttons as explicitly requested */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                id="product-buy-now-btn"
                className="w-full py-3.5 bg-slate-900 hover:bg-cyan-600 disabled:opacity-40 text-white text-sm font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>COMPRAR AHORA</span>
              </button>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                id="product-add-to-cart-btn"
                className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>AGREGAR AL CARRITO</span>
              </button>
            </div>

            {/* Actions: Wishlist, Compare, and WhatsApp Share */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <WishlistHeartButton
                productId={product.id}
                productName={product.nombre}
                showLabel={true}
                className="w-full py-3"
              />
              <CompareButton
                productId={product.id}
                productName={product.nombre}
                variant="button"
                className="w-full py-3 text-xs"
              />
              <button
                onClick={handleWhatsAppShare}
                id="product-whatsapp-share-btn"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WHATSAPP</span>
              </button>
            </div>

            {/* Secondary Actions: Price Drop Alert & QR Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <NotifyMeButton
                product={product}
                variant="button"
                onSelectProduct={onSelectProduct}
                onNavigateToCatalog={onBackToCatalog}
              />

              <button
                onClick={() => setShowQrModal(true)}
                id="product-show-qr-btn"
                className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                title="Generar o mostrar código QR de este producto para escaneo móvil"
              >
                <QrCode className="w-4 h-4 text-cyan-600" />
                <span>Ver Código QR</span>
              </button>
            </div>

            {/* Sizing & Fitting Callout for Apparel & Accessories */}
            <SizeGuideButton
              product={product}
              variant="button"
              selectedVariant={selectedVariant}
              onSelectVariant={(v) => setSelectedVariant(v)}
              className="w-full py-2.5 bg-gradient-to-r from-slate-50 to-cyan-50/50 hover:from-cyan-50 hover:to-cyan-100/70 border-slate-200 text-slate-800"
            />
          </div>

          {/* Shipping & Guarantee Value Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <Truck className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-800">Envíos a Bolivia</p>
              <p className="text-[10px] text-slate-500">9 Departamentos</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-800">Garantía X-CRISPIN</p>
              <p className="text-[10px] text-slate-500">Soporte directo</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <RotateCcw className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-800">Cambios Fáciles</p>
              <p className="text-[10px] text-slate-500">Hasta 7 días</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Detailed Specs, Benefits, FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-slate-200">
        <div className="lg:col-span-8 space-y-8">
          {/* Detailed Description */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Descripción Completa</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {product.descripcionCompleta || product.descripcion || product.descripcionCorta}
            </p>
          </div>

          {/* Factor X Modo de Uso */}
          {product.modoUso && (
            <div className="bg-gradient-to-r from-cyan-900 via-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-cyan-800/40 space-y-2 shadow-sm">
              <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                Modo de Consumo Recomendado
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {product.modoUso}
              </p>
            </div>
          )}

          {/* Factor X Ingredientes Liofilizados */}
          {product.ingredientes && product.ingredientes.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-600" />
                Ingredientes 100% Liofilizados & Principios Activos
              </h3>
              <p className="text-xs text-slate-500">
                La liofilización a -50°C conserva el 96.7% de nutrientes, sabor puro y potencia fitoquímica sin preservantes químicos:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {product.ingredientes.map((ing, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-xl"
                  >
                    ✓ {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Technical Benefits */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Beneficios Clave del Producto</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.beneficios?.map((ben, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-700 font-medium">{ben}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Specs Table */}
          {product.especificaciones && Object.keys(product.especificaciones).length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Especificaciones Técnicas</h3>
                <SizeGuideButton product={product} variant="link" />
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <tbody>
                    {Object.entries(product.especificaciones).map(([key, val], idx) => (
                      <tr
                        key={key}
                        className={idx % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'}
                      >
                        <td className="p-3 font-semibold text-slate-600 w-1/3 border-b border-slate-200">
                          {key}
                        </td>
                        <td className="p-3 font-medium text-slate-900 border-b border-slate-200">
                          {String(val)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FAQ Accordion */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-3">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Preguntas Frecuentes</h3>
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 text-left font-bold text-xs text-slate-900 flex items-center justify-between hover:bg-slate-50"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      activeFaq === idx ? 'rotate-180 text-cyan-600' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="p-4 pt-0 text-xs text-slate-600 border-t border-slate-100 bg-slate-50/50 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Shipping In Bolivia Notice */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-b from-cyan-900 to-slate-900 text-white p-6 rounded-3xl space-y-4 shadow-lg">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-cyan-400" />
              <span>Logística en Bolivia</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Todos los envíos se procesan con empaque de alta seguridad y rastreo en tiempo real:
            </p>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span><strong>La Paz / El Alto:</strong> Entrega express en 24 hrs.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span><strong>Santa Cruz y Cochabamba:</strong> 24 a 48 hrs.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span><strong>Resto del país:</strong> 48 a 72 hrs. por courier.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Star-Rating Section */}
      <ProductReviewsSection
        product={product}
        currentUser={currentUser}
        onReviewAdded={() => refresh()}
      />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-10 border-t border-slate-200 space-y-6">
          <h3 className="text-xl font-bold text-slate-900">Productos Relacionados</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectProduct(rel.slug)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer p-4 space-y-3"
              >
                <img
                  src={rel.imagenes[0]}
                  alt={rel.nombre}
                  className="w-full aspect-square object-cover rounded-xl"
                />
                <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{rel.nombre}</h4>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900">Bs. {rel.precio}</span>
                  <span className="text-cyan-600 font-semibold text-[11px]">Ver &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed Products */}
      <div className="pt-6">
        <RecentlyViewedSection
          onSelectProduct={onSelectProduct}
          onNavigateToCheckout={onNavigateToCheckout}
          currentProductId={product.id}
          title="Vistos Recientemente"
          subtitle="Otros productos que has consultado durante tu visita"
          limit={6}
          hideWhenEmpty={false}
        />
      </div>
      {/* Product QR Code Modal */}
      {product && (
        <ProductQrModal
          product={product}
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
};
