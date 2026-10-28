import React, { useState } from 'react';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ExternalLink,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Share2,
  Gift,
} from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Product } from '../../types';
import { ShareWishlistModal } from './ShareWishlistModal';

interface WishlistSectionProps {
  onSelectProduct?: (slug: string) => void;
  onNavigateToCatalog?: () => void;
  onNavigateToCheckout?: () => void;
  onNavigateToSharedWishlist?: (code: string) => void;
}

export const WishlistSection: React.FC<WishlistSectionProps> = ({
  onSelectProduct,
  onNavigateToCatalog,
  onNavigateToCheckout,
  onNavigateToSharedWishlist,
}) => {
  const { currentUser } = useAuth();
  const { wishlistProducts, removeFromWishlist, clearWishlist, wishlistCount } = useWishlist();
  const { addItem, openCart } = useCart();

  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleAddToCart = (product: Product) => {
    const success = addItem(product, 1);
    if (success) {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
      }, 2000);
    }
  };

  const handleBuyNow = (product: Product) => {
    addItem(product, 1);
    if (onNavigateToCheckout) {
      onNavigateToCheckout();
    } else {
      openCart();
    }
  };

  const handleMoveAllToCart = () => {
    wishlistProducts.forEach((product) => {
      const stock = product.stockTotal - product.stockReservado;
      if (stock > 0) {
        addItem(product, 1);
      }
    });
    openCart();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Section Header */}
      <div className="p-6 sm:p-7 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-rose-50/20">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Mi Lista de Deseos
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
              {wishlistCount} {wishlistCount === 1 ? 'producto' : 'productos'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Artículos guardados en tu perfil de <strong className="text-slate-700 font-semibold">{currentUser?.name}</strong>. Disponibles para compra o seguimiento de precios.
          </p>
        </div>

        {wishlistCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              id="open-share-wishlist-btn"
              className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Compartir enlace para regalos con amigos y familiares"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartir Lista</span>
            </button>
            <button
              type="button"
              onClick={handleMoveAllToCart}
              className="px-3.5 py-2 bg-slate-900 hover:bg-cyan-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Mover todo al carrito</span>
            </button>
            <button
              type="button"
              onClick={clearWishlist}
              className="px-3 py-2 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 font-medium rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
              title="Vaciar toda la lista"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vaciar lista</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-6 sm:p-7">
        {wishlistCount === 0 ? (
          <div className="text-center py-12 px-4 max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-100 text-rose-400 mx-auto flex items-center justify-center shadow-xs">
              <Heart className="w-10 h-10 stroke-1" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Tu lista de deseos está vacía
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Guarda los productos que más te interesen mientras exploras el catálogo de X-CRISPIN haciendo clic en el icono de corazón.
              </p>
            </div>
            {onNavigateToCatalog && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onNavigateToCatalog}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold rounded-2xl text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explorar Catálogo de Productos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistProducts.map((product) => {
              const availableStock = product.stockTotal - product.stockReservado;
              const isOutOfStock = availableStock <= 0;
              const isAdded = addedItemIds[product.id];

              return (
                <div
                  key={product.id}
                  className="group bg-slate-50/50 hover:bg-white rounded-2xl border border-slate-200/90 hover:border-cyan-300 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
                >
                  {/* Product Header / Image */}
                  <div className="relative aspect-square bg-slate-100/80 overflow-hidden flex items-center justify-center">
                    <img
                      src={product.imagenes[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop'}
                      alt={product.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(product.id, product.nombre)}
                      title="Eliminar de mi lista de deseos"
                      aria-label={`Eliminar ${product.nombre} de mi lista de deseos`}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-slate-400 hover:text-rose-600 hover:bg-white shadow-sm flex items-center justify-center transition-colors cursor-pointer border border-slate-200/60"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Category tag */}
                    <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-md">
                      {product.categoriaNombre}
                    </span>

                    {/* Stock badge if out of stock */}
                    {isOutOfStock && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-md">
                        Agotado
                      </span>
                    )}
                  </div>

                  {/* Product Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-mono">{product.sku}</span>
                        {product.marca && (
                          <span className="font-medium text-slate-600">{product.marca}</span>
                        )}
                      </div>

                      <h4
                        onClick={() => onSelectProduct && onSelectProduct(product.slug)}
                        className={`text-sm font-bold text-slate-900 line-clamp-2 ${
                          onSelectProduct ? 'cursor-pointer hover:text-cyan-600 transition-colors' : ''
                        }`}
                        title={product.nombre}
                      >
                        {product.nombre}
                      </h4>

                      <p className="text-xs text-slate-500 line-clamp-2">
                        {product.descripcionCorta}
                      </p>
                    </div>

                    {/* Pricing & Stock status */}
                    <div className="pt-2 border-t border-slate-200/70 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-xs text-slate-500 font-medium mr-1">Bs.</span>
                          <span className="text-lg font-black text-slate-900 tracking-tight font-display">
                            {product.precio.toFixed(2)}
                          </span>
                          {product.precioAnterior && (
                            <span className="text-xs text-slate-400 line-through ml-2">
                              Bs. {product.precioAnterior.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOutOfStock
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isOutOfStock ? 'Sin stock' : `${availableStock} disp.`}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => handleBuyNow(product)}
                          className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            isOutOfStock
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Comprar</span>
                        </button>

                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => handleAddToCart(product)}
                          className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                            isOutOfStock
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                              : isAdded
                              ? 'bg-emerald-500 text-white border-emerald-500'
                              : 'bg-white hover:bg-cyan-50 text-cyan-700 border-cyan-300 hover:border-cyan-400'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-white animate-bounce" />
                              <span>¡Añadido!</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Al Carrito</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* View details link */}
                      {onSelectProduct && (
                        <button
                          type="button"
                          onClick={() => onSelectProduct(product.slug)}
                          className="w-full text-center text-[11px] font-semibold text-slate-500 hover:text-cyan-600 transition-colors pt-0.5 inline-flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Ver ficha completa de especificaciones</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Security & Guarantee Footer Note */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Garantía y entrega oficial con QR Simple en los 9 departamentos de Bolivia.</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Sparkles className="w-3 h-3 text-cyan-500" />
            <span>Los precios se sincronizan en tiempo real con la tienda física y almacén central.</span>
          </div>
        </div>
      </div>

      {/* Share Wishlist Modal */}
      {currentUser && (
        <ShareWishlistModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          currentUser={currentUser}
          wishlistProducts={wishlistProducts}
          onNavigateToPublicView={(code) => {
            if (onNavigateToSharedWishlist) {
              onNavigateToSharedWishlist(code);
            }
          }}
        />
      )}
    </div>
  );
};
