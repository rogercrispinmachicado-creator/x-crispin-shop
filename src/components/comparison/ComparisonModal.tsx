import React, { useState, useMemo } from 'react';
import {
  X,
  Scale,
  Plus,
  Trash2,
  ShoppingCart,
  Zap,
  Check,
  Star,
  ShieldCheck,
  Truck,
  ExternalLink,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  Package,
} from 'lucide-react';
import { useComparison } from '../../context/ComparisonContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { storage } from '../../services/storage';
import { Product } from '../../types';
import { WishlistHeartButton } from '../wishlist/WishlistHeartButton';

interface ComparisonModalProps {
  onSelectProduct: (slug: string) => void;
  onNavigateToCheckout: () => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  onSelectProduct,
  onNavigateToCheckout,
}) => {
  const {
    compareProducts,
    removeFromCompare,
    clearCompare,
    addToCompare,
    isCompareModalOpen,
    closeCompareModal,
  } = useComparison();

  const { addItem } = useCart();
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [addingSlotOpen, setAddingSlotOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [addedItemSuccess, setAddedItemSuccess] = useState<string | null>(null);

  // Available products for adding to comparison
  const allProducts = useMemo(() => storage.getProducts(), []);
  const availableToAdd = useMemo(() => {
    const currentIds = compareProducts.map((p) => p.id);
    const filtered = allProducts.filter((p) => !currentIds.includes(p.id));
    if (!productSearchQuery.trim()) return filtered.slice(0, 8);
    const q = productSearchQuery.toLowerCase().trim();
    return filtered.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.marca.toLowerCase().includes(q) ||
        p.categoriaNombre.toLowerCase().includes(q)
    );
  }, [allProducts, compareProducts, productSearchQuery]);

  // Aggregate all unique specification keys across comparing products
  const allSpecKeys = useMemo(() => {
    const keys = new Set<string>();
    compareProducts.forEach((p) => {
      if (p.especificaciones) {
        Object.keys(p.especificaciones).forEach((k) => keys.add(k));
      }
    });
    return Array.from(keys);
  }, [compareProducts]);

  if (!isCompareModalOpen) return null;

  const handleAddToCart = (product: Product) => {
    addItem(product);
    setAddedItemSuccess(product.id);
    setTimeout(() => {
      setAddedItemSuccess(null);
    }, 1500);
  };

  const handleBuyNow = (product: Product) => {
    addItem(product);
    closeCompareModal();
    onNavigateToCheckout();
  };

  const handleViewDetail = (slug: string) => {
    closeCompareModal();
    onSelectProduct(slug);
  };

  const emptySlotsCount = Math.max(0, 3 - compareProducts.length);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="comparison-modal-title" className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Comparador de Productos
                </h2>
                <span className="px-2.5 py-0.5 bg-cyan-100 text-cyan-800 text-xs font-extrabold rounded-full">
                  {compareProducts.length} de 3
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Analiza especificaciones, precios oficiales en Bolivianos (Bs.) y beneficios lado a lado
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Toggle Only Differences */}
            {compareProducts.length >= 2 && (
              <button
                type="button"
                onClick={() => setOnlyDifferences((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  onlyDifferences
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Solo diferencias</span>
              </button>
            )}

            {/* Clear All */}
            {compareProducts.length > 0 && (
              <button
                type="button"
                onClick={clearCompare}
                className="px-3 py-1.5 bg-white text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Vaciar</span>
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={closeCompareModal}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition-colors cursor-pointer"
              aria-label="Cerrar comparador"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {compareProducts.length === 0 ? (
            <div className="py-16 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Scale className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  No hay productos en el comparador
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Selecciona hasta tres productos en el catálogo para ver su tabla comparativa lado a lado.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCompareModal}
                className="px-5 py-2.5 bg-slate-900 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <table className="w-full border-collapse min-w-[700px]">
                {/* 1. PRODUCT CARDS & HEADER ROW */}
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="w-44 p-3 text-left align-top text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 rounded-l-2xl">
                      Producto
                    </th>
                    {compareProducts.map((prod) => (
                      <th
                        key={prod.id}
                        className="p-4 align-top text-left w-64 md:w-80 bg-white"
                      >
                        <div className="flex flex-col space-y-3 relative group">
                          {/* Remove button */}
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-mono font-bold rounded">
                              {prod.sku}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFromCompare(prod.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Remover de la comparativa"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Image */}
                          <div
                            onClick={() => handleViewDetail(prod.slug)}
                            className="aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 cursor-pointer relative"
                          >
                            <img
                              src={prod.imagenes[0]}
                              alt={prod.nombre}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {prod.descuento && prod.descuento > 0 && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded-md">
                                -{prod.descuento}%
                              </span>
                            )}
                          </div>

                          {/* Brand & Name */}
                          <div>
                            <span className="text-[11px] font-bold text-cyan-700 uppercase tracking-wider">
                              {prod.marca}
                            </span>
                            <h3
                              onClick={() => handleViewDetail(prod.slug)}
                              className="text-sm font-extrabold text-slate-900 leading-snug hover:text-cyan-600 transition-colors cursor-pointer line-clamp-2 mt-0.5"
                            >
                              {prod.nombre}
                            </h3>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-1.5 text-xs text-amber-500">
                            <div className="flex items-center">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-bold text-slate-800 ml-1">
                                {prod.rating}
                              </span>
                            </div>
                            <span className="text-slate-400 text-[11px]">
                              ({prod.reviewsCount} opiniones)
                            </span>
                          </div>

                          {/* Direct Actions in Card Header */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleAddToCart(prod)}
                              className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                                addedItemSuccess === prod.id
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-900 hover:bg-cyan-600 text-white'
                              }`}
                            >
                              {addedItemSuccess === prod.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-white" />
                                  <span>¡Agregado!</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                  <span>Al Carrito</span>
                                </>
                              )}
                            </button>

                            <WishlistHeartButton
                              productId={prod.id}
                              productName={prod.nombre}
                              size="md"
                              className="border border-slate-200"
                            />
                          </div>
                        </div>
                      </th>
                    ))}

                    {/* Empty Slot Columns up to 3 */}
                    {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                      <th
                        key={`empty-col-${idx}`}
                        className="p-4 align-top w-64 md:w-80 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200"
                      >
                        <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-4 space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center shadow-2xs">
                            <Plus className="w-6 h-6 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              Agregar otro producto
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Compara hasta 3 productos al mismo tiempo
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAddingSlotOpen(true)}
                            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                          >
                            Seleccionar
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* 2. SPECIFICATION ROWS */}
                <tbody className="divide-y divide-slate-100 text-xs">
                  {/* PRECIO & DESCUENTO */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-600 bg-slate-50/50">
                      Precio Oficial (Bs.)
                    </td>
                    {compareProducts.map((prod) => (
                      <td key={prod.id} className="p-3.5 font-semibold text-slate-900">
                        <div className="space-y-0.5">
                          <div className="flex items-baseline gap-2">
                            <span className="text-base sm:text-lg font-black text-slate-900">
                              Bs. {prod.precio.toLocaleString()}
                            </span>
                            {prod.precioAnterior && (
                              <span className="text-xs text-slate-400 line-through">
                                Bs. {prod.precioAnterior.toLocaleString()}
                              </span>
                            )}
                          </div>
                          {prod.descuento && prod.descuento > 0 && (
                            <span className="inline-block text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                              Ahorras {prod.descuento}%
                            </span>
                          )}
                          {prod.factorPuntos && (
                            <div className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1 mt-1">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>{prod.factorPuntos} Factor Puntos</span>
                            </div>
                          )}
                        </div>
                      </td>
                    ))}
                    {Array.from({ length: emptySlotsCount }).map((_, i) => (
                      <td key={`empty-cell-precio-${i}`} className="p-3.5 bg-slate-50/30" />
                    ))}
                  </tr>

                  {/* DISPONIBILIDAD & STOCK */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-600 bg-slate-50/50">
                      Disponibilidad y Stock
                    </td>
                    {compareProducts.map((prod) => {
                      const availableStock = prod.stockTotal - prod.stockReservado;
                      const inStock = availableStock > 0;
                      return (
                        <td key={prod.id} className="p-3.5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-bold">
                              {inStock ? (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                  <span className="text-emerald-700">
                                    En Stock ({availableStock} disponibles)
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                                  <span className="text-rose-700">Agotado Temporalmente</span>
                                </>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                              <span>Despacho a los 9 departamentos</span>
                            </p>
                          </div>
                        </td>
                      );
                    })}
                    {Array.from({ length: emptySlotsCount }).map((_, i) => (
                      <td key={`empty-cell-stock-${i}`} className="p-3.5 bg-slate-50/30" />
                    ))}
                  </tr>

                  {/* CATEGORÍA */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-600 bg-slate-50/50">
                      Categoría
                    </td>
                    {compareProducts.map((prod) => (
                      <td key={prod.id} className="p-3.5 text-slate-700 font-medium">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-800 font-semibold text-xs">
                          {prod.categoriaNombre}
                        </span>
                      </td>
                    ))}
                    {Array.from({ length: emptySlotsCount }).map((_, i) => (
                      <td key={`empty-cell-cat-${i}`} className="p-3.5 bg-slate-50/30" />
                    ))}
                  </tr>

                  {/* PRESENTACIÓN / CONTENIDO NETO */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-600 bg-slate-50/50">
                      Presentación / Formato
                    </td>
                    {compareProducts.map((prod) => (
                      <td key={prod.id} className="p-3.5 text-slate-700 font-medium">
                        {prod.presentacion || prod.contenidoNeto || (
                          <span className="text-slate-400 italic">Empaque de fábrica original</span>
                        )}
                      </td>
                    ))}
                    {Array.from({ length: emptySlotsCount }).map((_, i) => (
                      <td key={`empty-cell-pres-${i}`} className="p-3.5 bg-slate-50/30" />
                    ))}
                  </tr>

                  {/* DESCRIPCIÓN CORTA */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-600 bg-slate-50/50">
                      Resumen
                    </td>
                    {compareProducts.map((prod) => (
                      <td key={prod.id} className="p-3.5 text-slate-600 leading-relaxed">
                        {prod.descripcionCorta}
                      </td>
                    ))}
                    {Array.from({ length: emptySlotsCount }).map((_, i) => (
                      <td key={`empty-cell-desc-${i}`} className="p-3.5 bg-slate-50/30" />
                    ))}
                  </tr>

                  {/* BENEFICIOS DESTACADOS */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-600 bg-slate-50/50">
                      Beneficios Clave
                    </td>
                    {compareProducts.map((prod) => (
                      <td key={prod.id} className="p-3.5">
                        <ul className="space-y-1.5">
                          {prod.beneficios && prod.beneficios.length > 0 ? (
                            prod.beneficios.map((b, bIdx) => (
                              <li key={bIdx} className="flex items-start gap-1.5 text-slate-700 text-xs">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{b}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-slate-400 italic">No especificado</li>
                          )}
                        </ul>
                      </td>
                    ))}
                    {Array.from({ length: emptySlotsCount }).map((_, i) => (
                      <td key={`empty-cell-ben-${i}`} className="p-3.5 bg-slate-50/30" />
                    ))}
                  </tr>

                  {/* DYNAMIC SPECS ROWS */}
                  {allSpecKeys.map((specKey) => {
                    const values = compareProducts.map((p) => p.especificaciones?.[specKey]);
                    const allEqual = values.every((v) => v === values[0]);

                    if (onlyDifferences && allEqual) return null;

                    return (
                      <tr key={specKey} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 font-bold text-slate-600 bg-slate-50/50">
                          {specKey}
                        </td>
                        {compareProducts.map((prod) => {
                          const val = prod.especificaciones?.[specKey];
                          return (
                            <td key={prod.id} className="p-3.5 text-slate-800">
                              {val ? (
                                <span className="font-medium">{val}</span>
                              ) : (
                                <span className="text-slate-300 font-mono">—</span>
                              )}
                            </td>
                          );
                        })}
                        {Array.from({ length: emptySlotsCount }).map((_, i) => (
                          <td key={`empty-spec-${specKey}-${i}`} className="p-3.5 bg-slate-50/30" />
                        ))}
                      </tr>
                    );
                  })}

                  {/* GARANTÍA Y SOPORTE */}
                  <tr className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-slate-600 bg-slate-50/50">
                      Garantía en Bolivia
                    </td>
                    {compareProducts.map((prod) => (
                      <td key={prod.id} className="p-3.5">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Garantía Oficial X-CRISPIN</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Soporte técnico y factura boliviana con validez tributaria
                        </p>
                      </td>
                    ))}
                    {Array.from({ length: emptySlotsCount }).map((_, i) => (
                      <td key={`empty-cell-gar-${i}`} className="p-3.5 bg-slate-50/30" />
                    ))}
                  </tr>

                  {/* BOTTOM ACTIONS ROW */}
                  <tr className="bg-slate-50/80">
                    <td className="p-3.5 font-bold text-slate-600 bg-slate-50/50 rounded-bl-2xl">
                      Acción
                    </td>
                    {compareProducts.map((prod) => (
                      <td key={prod.id} className="p-4">
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => handleBuyNow(prod)}
                            className="w-full py-2.5 px-3 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>COMPRAR AHORA</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleViewDetail(prod.slug)}
                            className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <span>Ver Ficha Técnica</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>
                      </td>
                    ))}
                    {Array.from({ length: emptySlotsCount }).map((_, i) => (
                      <td key={`empty-action-${i}`} className="p-4 bg-slate-50/30" />
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Todos los productos cuentan con precios oficiales y garantía en Bolivia.</span>
          </div>
          <button
            type="button"
            onClick={closeCompareModal}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Comparador
          </button>
        </div>
      </div>

      {/* Inline Product Picker Popover / Modal to add 2nd or 3rd product */}
      {addingSlotOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Agregar Producto a la Comparativa
                </h3>
                <p className="text-xs text-slate-500">
                  Elige un producto del catálogo para ver sus especificaciones lado a lado
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddingSlotOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o categoría..."
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-cyan-500"
              autoFocus
            />

            {/* Results Grid */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
              {availableToAdd.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">
                  No se encontraron productos disponibles para comparar
                </p>
              ) : (
                availableToAdd.map((p) => (
                  <div
                    key={p.id}
                    className="pt-2 first:pt-0 flex items-center justify-between gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-pointer"
                    onClick={() => {
                      addToCompare(p.id);
                      setAddingSlotOpen(false);
                      setProductSearchQuery('');
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.imagenes[0]}
                        alt={p.nombre}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {p.nombre}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {p.sku} • Bs. {p.precio.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold shrink-0"
                    >
                      Agregar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
