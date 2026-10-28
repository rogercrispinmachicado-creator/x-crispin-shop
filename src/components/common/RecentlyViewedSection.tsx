import React, { useState } from 'react';
import {
  History,
  Trash2,
  X,
  ShoppingBag,
  Star,
  Sparkles,
  ChevronRight,
  Eye,
  Check,
} from 'lucide-react';
import { Product } from '../../types';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import { useCart } from '../../context/CartContext';
import { WishlistHeartButton } from '../wishlist/WishlistHeartButton';
import { CompareButton } from '../comparison/CompareButton';

interface RecentlyViewedSectionProps {
  onSelectProduct: (slug: string) => void;
  onNavigateToCheckout?: () => void;
  currentProductId?: string;
  title?: string;
  subtitle?: string;
  limit?: number;
  hideWhenEmpty?: boolean;
  className?: string;
}

export const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({
  onSelectProduct,
  onNavigateToCheckout,
  currentProductId,
  title = 'Vistos Recientemente',
  subtitle = 'Basado en los productos con los que has interactuado',
  limit = 6,
  hideWhenEmpty = false,
  className = '',
}) => {
  const { viewedProducts, removeViewed, clearAll, addViewed } = useRecentlyViewed();
  const { addItem } = useCart();
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Filter out the currently viewed product if on ProductDetailPage
  const displayedProducts = viewedProducts
    .filter((p) => !currentProductId || p.id !== currentProductId)
    .slice(0, limit);

  if (hideWhenEmpty && displayedProducts.length === 0) {
    return null;
  }

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    addViewed(product.id);
    setJustAddedId(product.id);
    setTimeout(() => {
      setJustAddedId((prev) => (prev === product.id ? null : prev));
    }, 1800);
  };

  const handleBuyNow = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    addViewed(product.id);
    if (onNavigateToCheckout) {
      onNavigateToCheckout();
    }
  };

  const handleCardClick = (product: Product) => {
    addViewed(product.id);
    onSelectProduct(product.slug);
  };

  return (
    <section
      aria-label="Productos vistos recientemente"
      className={`bg-slate-50/80 rounded-3xl p-6 sm:p-8 border border-slate-200/80 transition-all ${className}`}
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
              <History className="w-4 h-4" />
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{title}</span>
              {displayedProducts.length > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {displayedProducts.length}
                </span>
              )}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p>
        </div>

        {displayedProducts.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
              title="Borrar todo el historial de visualización"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar historial</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid or Empty State */}
      {displayedProducts.length === 0 ? (
        <div className="py-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Eye className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Aún no hay productos en tu historial reciente</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            A medida que explores el catálogo o consultes fichas técnicas, tus productos interactuados aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-5 mt-6">
          {displayedProducts.map((prod) => {
            const stockAvailable = Math.max(0, prod.stockTotal - prod.stockReservado);
            const isOutOfStock = stockAvailable <= 0;
            const isAdded = justAddedId === prod.id;

            return (
              <div
                key={prod.id}
                onClick={() => handleCardClick(prod)}
                className="group relative bg-white rounded-2xl border border-slate-200/90 hover:border-cyan-500/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer p-3"
              >
                {/* Top Action Bar on Card */}
                <div className="flex items-center justify-between gap-1 mb-2 z-10">
                  <div className="flex items-center gap-1">
                    <WishlistHeartButton
                      productId={prod.id}
                      productName={prod.nombre}
                      size="sm"
                      className="bg-white/80 backdrop-blur-xs shadow-2xs hover:bg-white"
                    />
                    <CompareButton
                      productId={prod.id}
                      productName={prod.nombre}
                      variant="icon"
                      size="sm"
                      className="w-7 h-7 p-1 bg-white/80 backdrop-blur-xs shadow-2xs text-[10px]"
                    />
                  </div>

                  {/* Remove Single Item from History */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeViewed(prod.id);
                    }}
                    className="w-6 h-6 rounded-lg bg-slate-100/80 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors flex items-center justify-center cursor-pointer"
                    title="Quitar del historial"
                    aria-label={`Quitar ${prod.nombre} del historial`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Product Image & Badges */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 mb-2.5">
                  <img
                    src={prod.imagenes[0]}
                    alt={prod.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {prod.descuento && prod.descuento > 0 && (
                    <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black tracking-tight shadow-xs">
                      -{prod.descuento}%
                    </span>
                  )}
                </div>

                {/* Product Meta */}
                <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                      <span className="truncate max-w-[110px] font-medium text-slate-500">
                        {prod.categoriaNombre || prod.marca}
                      </span>
                      <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{prod.rating}</span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-cyan-600 transition-colors">
                      {prod.nombre}
                    </h4>

                    {prod.factorPuntos && (
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[9px] font-black rounded">
                          <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                          {prod.factorPuntos} Factor Pts
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price & Stock */}
                  <div className="pt-2 border-t border-slate-100 space-y-2 mt-2">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-sm font-black text-slate-950">Bs. {prod.precio}</span>
                        {prod.precioAnterior && (
                          <span className="text-[10px] text-slate-400 line-through ml-1.5">
                            Bs. {prod.precioAnterior}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[9px] font-bold ${
                          isOutOfStock ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {isOutOfStock ? 'Agotado' : 'En stock'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={(e) => handleBuyNow(prod, e)}
                        disabled={isOutOfStock}
                        className="w-full py-1.5 bg-slate-900 hover:bg-cyan-600 disabled:opacity-40 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Comprar
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(prod, e)}
                        disabled={isOutOfStock}
                        className={`w-full py-1.5 border text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 border-transparent text-slate-800'
                        } disabled:opacity-40`}
                        title="Agregar al carrito"
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3 h-3 text-white" />
                            <span>Listo</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3 h-3" />
                            <span>Agregar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
