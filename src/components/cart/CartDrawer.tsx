import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Tag,
  ShieldCheck,
  Truck,
  Check,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface CartDrawerProps {
  onGoToCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onGoToCheckout,
  onContinueShopping,
}) => {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    subtotal,
    discountAmount,
    shippingCost,
    total,
    appliedCoupon,
    couponCode,
    setCouponCode,
    applyCoupon,
    removeCoupon,
    validateCartInventory,
    autoAdjustCartToStock,
  } = useCart();

  const [couponFeedback, setCouponFeedback] = useState<{ msg: string; error: boolean } | null>(null);
  const [stockErrors, setStockErrors] = useState<string[] | null>(null);

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyCoupon(couponCode);
    setCouponFeedback({
      msg: res.message,
      error: !res.success,
    });
  };

  const handleProceedToCheckout = () => {
    setStockErrors(null);
    const validation = validateCartInventory();
    if (!validation.valid) {
      setStockErrors(validation.errors);
      return;
    }
    closeCart();
    onGoToCheckout();
  };

  const handleAutoAdjust = () => {
    autoAdjustCartToStock();
    setStockErrors(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyan-600" />
              <h2 className="text-base font-bold text-slate-900">Tu Carrito de Compras</h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">
                {items.length} {items.length === 1 ? 'producto' : 'productos'}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">El carrito está vacío</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Descubre nuestras ofertas en tecnología oficial con garantía en Bolivia.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeCart();
                    onContinueShopping();
                  }}
                  className="px-6 py-2.5 bg-cyan-600 text-white text-xs font-bold rounded-xl hover:bg-cyan-700 transition-colors shadow-sm"
                >
                  Explorar Catálogo X-CRISPIN
                </button>
              </div>
            ) : (
              items.map((item) => {
                const itemPrice = item.producto.precio + (item.variante?.priceModifier || 0);
                const maxStock = item.variante
                  ? item.variante.stock
                  : item.producto.stockTotal - item.producto.stockReservado;

                return (
                  <div key={`${item.producto.id}-${item.variante?.id || 'base'}`} className="py-4 flex gap-4">
                    <img
                      src={item.producto.imagenes[0]}
                      alt={item.producto.nombre}
                      className="w-20 h-20 rounded-xl object-cover border border-slate-200/80 flex-shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                            {item.producto.nombre}
                          </h4>
                          <button
                            onClick={() => removeItem(item.producto.id, item.variante?.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {item.variante && (
                          <span className="inline-block text-[11px] font-medium text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded mt-1">
                            {item.variante.name}
                          </span>
                        )}

                        <div className="text-xs font-bold text-slate-900 mt-1">
                          Bs. {itemPrice}
                          {item.producto.precioAnterior && (
                            <span className="text-[10px] text-slate-400 line-through ml-2 font-normal">
                              Bs. {item.producto.precioAnterior}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Selector & Item Subtotal */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                          <button
                            onClick={() =>
                              updateQuantity(item.producto.id, item.cantidad - 1, item.variante?.id)
                            }
                            className="p-1 text-slate-600 hover:bg-slate-200 rounded-l-md transition-colors"
                            aria-label="Reducir cantidad"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-bold text-slate-800">{item.cantidad}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.producto.id, item.cantidad + 1, item.variante?.id)
                            }
                            disabled={item.cantidad >= maxStock}
                            className="p-1 text-slate-600 hover:bg-slate-200 rounded-r-md transition-colors disabled:opacity-30"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-extrabold text-slate-900">
                          Bs. {itemPrice * item.cantidad}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Order Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-4">
              {/* Coupon Form */}
              <div>
                {!appliedCoupon ? (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cupón (ej. SHOPTHEX)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono uppercase focus:border-cyan-500 outline-hidden"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
                    >
                      Aplicar
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Cupón <strong>{appliedCoupon.codigo}</strong> activado</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-[11px] text-rose-600 hover:underline font-semibold"
                    >
                      Remover
                    </button>
                  </div>
                )}

                {couponFeedback && (
                  <p
                    className={`text-[11px] mt-1.5 font-medium ${
                      couponFeedback.error ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {couponFeedback.msg}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200/70">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">Bs. {subtotal}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Descuento Cupón</span>
                    <span>- Bs. {discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    Envío estimado (Bolivia)
                  </span>
                  <span className="font-semibold text-slate-800">Bs. {shippingCost}</span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-slate-950 pt-2 border-t border-slate-200">
                  <span>Total a Pagar</span>
                  <span className="text-cyan-700">Bs. {total}</span>
                </div>
              </div>

              {/* Stock Validation Error Box */}
              {stockErrors && stockErrors.length > 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-rose-900">
                        Ajuste de inventario requerido
                      </h4>
                      <p className="text-[11px] text-rose-700 mt-0.5">
                        Verificamos el stock real en almacén antes de continuar:
                      </p>
                    </div>
                  </div>
                  <ul className="text-[11px] text-rose-800 list-disc list-inside space-y-1 pl-1 font-medium">
                    {stockErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={handleAutoAdjust}
                    className="w-full mt-1 py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Ajustar carrito al stock disponible</span>
                  </button>
                </div>
              )}

              {/* Checkout CTA */}
              <button
                type="button"
                onClick={handleProceedToCheckout}
                id="cart-checkout-btn"
                className="w-full py-3.5 bg-slate-900 hover:bg-cyan-600 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Proceder al Checkout</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pago seguro mediante QR Simple y Transferencia Oficial</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
