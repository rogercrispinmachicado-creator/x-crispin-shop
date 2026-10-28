import React, { useState, useEffect, useMemo } from 'react';
import {
  Gift,
  Heart,
  Share2,
  Copy,
  Check,
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  MessageCircle,
  ExternalLink,
  Lock,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ShoppingBag,
  UserCheck,
  AlertCircle,
  X,
} from 'lucide-react';
import { Product, SharedWishlist, SharedWishlistItem } from '../types';
import { sharedWishlistService } from '../services/sharedWishlistService';
import { storage } from '../services/storage';
import { useCart } from '../context/CartContext';

interface WishlistItemWithProduct {
  product: Product;
  meta?: SharedWishlistItem;
}

interface SharedWishlistPageProps {
  wishlistCode: string;
  onSelectProduct: (slug: string) => void;
  onNavigateToCatalog: () => void;
  onNavigateToCheckout: () => void;
}

export const SharedWishlistPage: React.FC<SharedWishlistPageProps> = ({
  wishlistCode,
  onSelectProduct,
  onNavigateToCatalog,
  onNavigateToCheckout,
}) => {
  const { addItem, openCart } = useCart();
  const [wishlist, setWishlist] = useState<SharedWishlist | null>(null);
  const [copied, setCopied] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  // Reservation Dialog State
  const [reservingProductId, setReservingProductId] = useState<string | null>(null);
  const [reserverName, setReserverName] = useState('');
  const [reserveSuccessMsg, setReserveSuccessMsg] = useState<string | null>(null);

  // Sync / load wishlist
  const loadWishlist = () => {
    // If empty code, try resolving demo or search params
    const code =
      wishlistCode ||
      new URLSearchParams(window.location.search).get('wishlist') ||
      'WL-CARLOS-2026';

    const resolved = sharedWishlistService.resolveWishlist(code);
    setWishlist(resolved);
    if (resolved) {
      storage.incrementSharedWishlistViews(resolved.id);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, [wishlistCode]);

  // Resolve product objects
  const allProducts = useMemo(() => storage.getProducts(), []);

  const productsWithDetails = useMemo<WishlistItemWithProduct[]>(() => {
    if (!wishlist) return [];
    const result: WishlistItemWithProduct[] = [];
    for (const id of wishlist.productIds) {
      const prod = allProducts.find((p) => p.id === id);
      if (prod) {
        const itemMeta = wishlist.items?.find((i) => i.productId === id);
        result.push({ product: prod, meta: itemMeta });
      }
    }
    return result;
  }, [wishlist, allProducts]);

  const stats = useMemo(() => {
    const total = productsWithDetails.length;
    const reserved = productsWithDetails.filter((p) => p.meta?.reserved).length;
    const available = total - reserved;
    const totalCost = productsWithDetails.reduce((sum, p) => sum + p.product.precio, 0);
    return { total, reserved, available, totalCost };
  }, [productsWithDetails]);

  const handleCopyLink = () => {
    if (!wishlist) return;
    const url = sharedWishlistService.generateShortShareUrl(wishlist);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  const handleBuyNow = (product: Product) => {
    addItem(product, 1);
    onNavigateToCheckout();
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishlist || !reservingProductId || !reserverName.trim()) return;

    sharedWishlistService.reserveItem(wishlist.id, reservingProductId, reserverName.trim());
    setReservingProductId(null);
    setReserverName('');
    setReserveSuccessMsg('¡Regalo apartado con éxito! Se ha marcado como reservado.');
    loadWishlist();
    setTimeout(() => setReserveSuccessMsg(null), 4000);
  };

  const handleUnreserve = (productId: string) => {
    if (!wishlist) return;
    sharedWishlistService.unreserveItem(wishlist.id, productId);
    loadWishlist();
  };

  const handleAddAllAvailableToCart = () => {
    productsWithDetails.forEach(({ product, meta }) => {
      if (!meta?.reserved) {
        addItem(product, 1);
      }
    });
    openCart();
  };

  if (!wishlist) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
          <Gift className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Lista de Deseos no encontrada
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          El código de lista ingresado no existe o el enlace ha caducado. Puedes explorar nuestro catálogo general o ver una lista de demostración.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onNavigateToCatalog}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Explorar Catálogo
          </button>
          <button
            type="button"
            onClick={() => {
              const demo = sharedWishlistService.resolveWishlist('WL-CARLOS-2026');
              setWishlist(demo);
            }}
            className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Ver Lista de Regalos de Ejemplo
          </button>
        </div>
      </div>
    );
  }

  const whatsappUrl = sharedWishlistService.generateWhatsAppShareUrl(
    wishlist,
    productsWithDetails.map((p) => p.product)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
      {/* Toast Confirmation */}
      {reserveSuccessMsg && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{reserveSuccessMsg}</span>
          </div>
          <button
            onClick={() => setReserveSuccessMsg(null)}
            className="p-1 hover:bg-white/20 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Card for Shared Wishlist */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Occasion badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-2xs">
                <Gift className="w-3.5 h-3.5 text-rose-300" />
                <span>Ocasión: {wishlist.occasion}</span>
              </span>
              <span className="px-2.5 py-1 bg-white/10 text-slate-300 text-[11px] font-mono font-bold rounded-full">
                ID: {wishlist.id}
              </span>
              {wishlist.ownerCity && (
                <span className="px-2.5 py-1 bg-white/10 text-slate-300 text-[11px] font-medium rounded-full flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  <span>{wishlist.ownerCity}, Bolivia</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              {wishlist.title}
            </h1>

            {/* Custom message quote */}
            {wishlist.customMessage && (
              <div className="p-4 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                "{wishlist.customMessage}"
                <div className="text-right text-[11px] font-bold text-rose-300 not-italic mt-1">
                  — {wishlist.ownerName}
                </div>
              </div>
            )}
          </div>

          {/* Quick Share & Forwarding Actions */}
          <div className="flex flex-col gap-2 shrink-0 bg-white/5 p-4 rounded-2xl border border-white/10">
            <span className="text-xs font-bold text-slate-300 text-center sm:text-left">
              Compartir con otros familiares:
            </span>
            <div className="flex items-center gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Pill Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10 text-center">
          <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              Total Artículos
            </span>
            <span className="text-lg font-black text-white font-mono">{stats.total}</span>
          </div>

          <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <span className="text-[10px] text-emerald-300 font-bold block uppercase tracking-wider">
              Disponibles para Regalo
            </span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              {stats.available}
            </span>
          </div>

          <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <span className="text-[10px] text-amber-300 font-bold block uppercase tracking-wider">
              Apartados / Reservados
            </span>
            <span className="text-lg font-black text-amber-400 font-mono">
              {stats.reserved}
            </span>
          </div>

          <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              Valor Total Estimado
            </span>
            <span className="text-lg font-black text-rose-300 font-mono">
              Bs. {stats.totalCost}
            </span>
          </div>
        </div>
      </div>

      {/* Main Section Header with "Comprar Todo" CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Artículos Deseados para Regalo</span>
            <span className="text-xs px-2.5 py-0.5 bg-rose-100 text-rose-700 font-bold rounded-full">
              {stats.total} productos
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Selecciona el producto que deseas regalarle a {wishlist.ownerName}. Puedes comprarlo directamente o apartarlo.
          </p>
        </div>

        {stats.available > 1 && (
          <button
            type="button"
            onClick={handleAddAllAvailableToCart}
            id="add-all-gifts-btn"
            className="px-4 py-2.5 bg-slate-900 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Regalar Todo el Pack Disponible ({stats.available})</span>
          </button>
        )}
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {productsWithDetails.map(({ product, meta }) => {
          const isReserved = Boolean(meta?.reserved);
          const isAdded = Boolean(addedItemIds[product.id]);
          const availableStock = product.stockTotal - product.stockReservado;
          const isOutOfStock = availableStock <= 0;

          return (
            <div
              key={product.id}
              className={`rounded-3xl border transition-all duration-200 flex flex-col overflow-hidden bg-white shadow-xs ${
                isReserved
                  ? 'border-amber-300/80 bg-amber-50/20'
                  : 'border-slate-200 hover:border-rose-300 hover:shadow-md'
              }`}
            >
              {/* Product Image & Badges */}
              <div className="relative aspect-square bg-slate-100 overflow-hidden flex items-center justify-center">
                <img
                  src={
                    product.imagenes[0] ||
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop'
                  }
                  alt={product.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Reservation Status Banner */}
                {isReserved ? (
                  <div className="absolute top-3 left-3 right-3 px-3 py-1.5 bg-amber-500/95 backdrop-blur-xs text-slate-950 text-xs font-black rounded-xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-1.5 truncate">
                      <Gift className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        Apartado por {meta?.reservedBy || 'un familiar'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnreserve(product.id)}
                      className="text-[10px] underline underline-offset-2 ml-2 hover:opacity-80 shrink-0 cursor-pointer"
                      title="Liberar reserva"
                    >
                      Liberar
                    </button>
                  </div>
                ) : (
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-emerald-600/90 backdrop-blur-xs text-white text-[11px] font-bold rounded-lg shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Disponible para regalar</span>
                  </div>
                )}

                {/* Category Tag */}
                <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-slate-900/80 text-white text-[10px] font-mono rounded backdrop-blur-xs">
                  {product.categoriaNombre}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>{product.sku}</span>
                    <span className="font-bold text-amber-500">★ {product.rating}</span>
                  </div>

                  <h3
                    onClick={() => onSelectProduct(product.slug)}
                    className="text-sm font-bold text-slate-900 hover:text-rose-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
                  >
                    {product.nombre}
                  </h3>

                  {meta?.notes && (
                    <p className="text-xs text-rose-800 bg-rose-50 border border-rose-200/60 p-2 rounded-xl italic">
                      Nota de {wishlist.ownerName}: "{meta.notes}"
                    </p>
                  )}

                  {/* Price */}
                  <div className="pt-1 flex items-baseline gap-2">
                    <span className="text-lg font-black text-slate-900 font-mono">
                      Bs. {product.precio}
                    </span>
                    {product.precioAnterior && (
                      <span className="text-xs text-slate-400 line-through font-mono">
                        Bs. {product.precioAnterior}
                      </span>
                    )}
                  </div>
                </div>

                {/* Gifting Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {isReserved ? (
                    <div className="space-y-2">
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs text-amber-900 font-medium">
                        🎁 Este artículo ya fue apartado por <strong>{meta?.reservedBy || 'un familiar'}</strong>. Puedes elegir otro producto de la lista.
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectProduct(product.slug)}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ver detalles del producto</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {/* Add to Cart */}
                        <button
                          type="button"
                          onClick={() => handleAddToCart(product)}
                          disabled={isOutOfStock}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>¡En Carrito!</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Regalar</span>
                            </>
                          )}
                        </button>

                        {/* Buy Now Direct */}
                        <button
                          type="button"
                          onClick={() => handleBuyNow(product)}
                          disabled={isOutOfStock}
                          className="py-2 px-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <span>Comprar Ya</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Reserve Item Button */}
                      <button
                        type="button"
                        onClick={() => setReservingProductId(product.id)}
                        className="w-full py-1.5 px-3 bg-white hover:bg-amber-50 text-amber-800 border border-amber-300/80 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Aparta este artículo para que nadie más lo regale repetido"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span>Apartar / Ya lo compraré yo</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gifting Guarantee & Delivery Notice for Bolivia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-slate-900">Envíos a Todo Bolivia</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Entrega directa en La Paz, El Alto, Santa Cruz, Cochabamba y los 9 departamentos.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-slate-900">Empaque & Tarjeta de Regalo</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Puedes solicitar empaque especial y dedicatoria personalizada en la pantalla de pago.
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-slate-900">Pagos Seguros en Bs.</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              QR Simple de cualquier banco boliviano, transferencias o pago contra entrega.
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Apartar / Reservar para Regalo */}
      {reservingProductId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Gift className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  Apartar Regalo para {wishlist.ownerName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReservingProductId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Al apartar este regalo, se mostrará como <strong>"Reservado"</strong> en la lista pública para que otros amigos o familiares no compren el mismo artículo.
            </p>

            <form onSubmit={handleConfirmReservation} className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Tu nombre o parentesco: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={reserverName}
                  onChange={(e) => setReserverName(e.target.value)}
                  placeholder="Ej. Tía Carmen / Primo Jorge / Andrea"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReservingProductId(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition-all shadow-xs cursor-pointer"
                >
                  Confirmar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
