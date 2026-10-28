import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Star,
  Check,
  Tag,
  Sparkles,
  ArrowUpDown,
  ShoppingBag,
  Zap,
  RefreshCw,
  HeartPulse,
  Layers,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  Scale,
} from 'lucide-react';
import { productService, ProductFilters } from '../services/productService';
import { storage } from '../services/storage';
import { cacheService } from '../services/cacheService';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useComparison } from '../context/ComparisonContext';
import { useProductsCache, useCategoriesCache } from '../hooks/useProductsCache';
import { usePersistentData } from '../hooks/usePersistentData';
import { CacheStatusPill } from '../components/common/OfflineCacheBanner';
import { CatalogGridSkeleton, Skeleton } from '../components/common/Skeletons';
import { WishlistHeartButton } from '../components/wishlist/WishlistHeartButton';
import { CompareButton } from '../components/comparison/CompareButton';
import { RecentlyViewedSection } from '../components/common/RecentlyViewedSection';
import { NotifyMeButton } from '../components/product/NotifyMeButton';
import { SizeGuideButton } from '../components/product/SizeGuideButton';

interface CatalogPageProps {
  initialCategoryId?: string;
  initialSubcategoryId?: string;
  searchQuery: string;
  onSelectProduct: (slug: string) => void;
  onNavigateToCheckout: () => void;
  onOpenQrScanner?: () => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  initialCategoryId,
  initialSubcategoryId,
  searchQuery,
  onSelectProduct,
  onNavigateToCheckout,
  onOpenQrScanner,
}) => {
  const { addItem } = useCart();
  const { compareProducts, openCompareModal } = useComparison();

  // 1. Capa de persistencia instantánea y sincronizada (localStorage a 0ms)
  const {
    categories: persistentCategories,
    bestSellingProducts,
    hasBackup,
    isRevalidating: isPersistentRevalidating,
    refresh: refreshPersistent,
  } = usePersistentData({ autoFetch: true });

  // 2. Consulta reactiva de categorías con caché en memoria
  const { categories: cachedCategories } = useCategoriesCache();
  // Se renderizan inmediatamente las categorías persistidas si la API aún no ha respondido
  const categories = cachedCategories.length > 0 ? cachedCategories : persistentCategories;

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryId || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(initialSubcategoryId || '');
  const [localSearch, setLocalSearch] = useState<string>(searchQuery);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [onlyDeals, setOnlyDeals] = useState<boolean>(false);
  const [onlyNew, setOnlyNew] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<ProductFilters['orden']>('relevancia');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    if (initialCategoryId !== undefined) {
      setSelectedCategory(initialCategoryId === 'cat-fx-suplementos' ? 'cat-fx-salud-bienestar' : initialCategoryId);
    }
  }, [initialCategoryId]);

  useEffect(() => {
    if (initialSubcategoryId !== undefined) {
      setSelectedSubcategory(initialSubcategoryId);
    }
  }, [initialSubcategoryId]);

  useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalSearch(searchQuery);
    }
  }, [searchQuery]);

  const handleSelectCategory = (catId: string) => {
    if (selectedCategory === catId) {
      // Toggle off if already selected
      setSelectedCategory('');
      setSelectedSubcategory('');
    } else {
      setSelectedCategory(catId);
      setSelectedSubcategory('');
    }
  };

  const currentCategoryObj = useMemo(() => {
    return categories.find(
      (c) => c.id === selectedCategory || (selectedCategory === 'cat-fx-salud-bienestar' && c.id === 'cat-fx-suplementos')
    );
  }, [categories, selectedCategory]);

  const subcatCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const allProds = cacheService.getInstantProducts();
    const relevantProducts = allProds.filter(
      (p) => p.categoriaId === selectedCategory || (selectedCategory === 'cat-fx-salud-bienestar' && p.categoriaId === 'cat-fx-suplementos')
    );
    for (const p of relevantProducts) {
      if (p.subcategoriaId) {
        counts[p.subcategoriaId] = (counts[p.subcategoriaId] || 0) + 1;
      }
    }
    return counts;
  }, [selectedCategory]);

  const categoryTotalCount = useMemo(() => {
    const allProds = cacheService.getInstantProducts();
    return allProds.filter(
      (p) => p.categoriaId === selectedCategory || (selectedCategory === 'cat-fx-salud-bienestar' && p.categoriaId === 'cat-fx-suplementos')
    ).length;
  }, [selectedCategory]);

  const activeSubcategoryObj = useMemo(() => {
    if (!currentCategoryObj || !currentCategoryObj.subcategorias || !selectedSubcategory) return null;
    return currentCategoryObj.subcategorias.find((s) => s.id === selectedSubcategory) || null;
  }, [currentCategoryObj, selectedSubcategory]);

  const filters: ProductFilters = useMemo(
    () => ({
      categoriaId: selectedCategory || undefined,
      subcategoriaId: selectedSubcategory || undefined,
      busqueda: localSearch || undefined,
      minPrecio: minPrice,
      maxPrecio: maxPrice,
      soloEnStock: onlyInStock,
      soloOfertas: onlyDeals,
      soloNuevos: onlyNew,
      orden: sortOrder,
    }),
    [selectedCategory, selectedSubcategory, localSearch, minPrice, maxPrice, onlyInStock, onlyDeals, onlyNew, sortOrder]
  );

  // 3. Consulta de productos a través del servicio de caché inteligente
  const {
    products: queryProducts,
    loading: productsLoading,
    isRevalidating: isProductsRevalidating,
    fromCache,
    isOffline,
    refresh: refreshProducts,
  } = useProductsCache(filters);

  // Determinar si los filtros están en su estado por defecto
  const isDefaultFilter =
    !selectedCategory &&
    !selectedSubcategory &&
    !localSearch &&
    minPrice === undefined &&
    maxPrice === undefined &&
    !onlyInStock &&
    !onlyDeals &&
    !onlyNew;

  // Renderizado instantáneo: si la petición del catálogo está en curso pero tenemos
  // respaldo persistente local (bestSellingProducts o productos guardados), los mostramos inmediatamente
  const displayProducts = useMemo(() => {
    if (queryProducts.length > 0) {
      return queryProducts;
    }
    if (isDefaultFilter && bestSellingProducts.length > 0) {
      return bestSellingProducts;
    }
    return queryProducts;
  }, [queryProducts, isDefaultFilter, bestSellingProducts]);

  const isBackgroundUpdating = isProductsRevalidating || isPersistentRevalidating;

  const handleRefresh = async () => {
    await Promise.all([refreshProducts(), refreshPersistent()]);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    storage.addRecentlyViewed(product.id);
  };

  const handleBuyNow = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    storage.addRecentlyViewed(product.id);
    onNavigateToCheckout();
  };

  const handleProductClick = (prod: Product) => {
    storage.addRecentlyViewed(prod.id);
    onSelectProduct(prod.slug);
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setLocalSearch('');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setOnlyInStock(false);
    setOnlyDeals(false);
    setOnlyNew(false);
    setSortOrder('relevancia');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
            Catálogo de Productos
          </h1>
          {productsLoading && displayProducts.length === 0 ? (
            <div className="flex items-center gap-2 mt-1.5">
              <Skeleton className="h-4 w-44 rounded-md" />
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Mostrando {displayProducts.length} productos con disponibilidad oficial para Bolivia (BOB)
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Smart Cache & Offline Status Pill */}
          <CacheStatusPill
            fromCache={fromCache || hasBackup}
            isRevalidating={isBackgroundUpdating}
            isOffline={isOffline}
            onRefresh={handleRefresh}
          />

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-200 rounded-xl shadow-xs text-xs font-semibold text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Ordenar por:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as ProductFilters['orden'])}
              className="bg-transparent font-bold text-slate-900 focus:outline-hidden cursor-pointer"
              id="catalog-sort-select"
            >
              <option value="relevancia">Relevancia</option>
              <option value="ventas">Más vendidos</option>
              <option value="precio_menor">Precio menor</option>
              <option value="precio_mayor">Precio mayor</option>
              <option value="recientes">Más recientes</option>
            </select>
          </div>

          {/* QR Scanner Trigger */}
          {onOpenQrScanner && (
            <button
              type="button"
              onClick={onOpenQrScanner}
              id="catalog-qr-scanner-btn"
              className="px-3.5 py-2 bg-slate-900 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              title="Escanear código QR de producto físico con tu cámara"
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Escanear QR</span>
            </button>
          )}

          {/* Quick Comparison Modal Trigger */}
          <button
            type="button"
            onClick={openCompareModal}
            id="catalog-compare-modal-btn"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer border ${
              compareProducts.length > 0
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-600'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Abrir tabla comparativa de especificaciones"
          >
            <Scale className={`w-4 h-4 ${compareProducts.length > 0 ? 'text-white' : 'text-cyan-600'}`} />
            <span>Comparar</span>
            {compareProducts.length > 0 && (
              <span className="px-1.5 py-0.2 bg-white text-cyan-900 text-[10px] font-black rounded-full shadow-2xs">
                {compareProducts.length}/3
              </span>
            )}
          </button>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            className="md:hidden px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Indicador sutil de actualización en segundo plano */}
      {isBackgroundUpdating && (
        <div className="flex items-center gap-2 px-3.5 py-2 bg-cyan-50/90 border border-cyan-200/80 text-cyan-900 rounded-xl text-xs font-medium animate-pulse">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-600" />
          </span>
          <span>Sincronizando catálogo en segundo plano con el servidor...</span>
          <span className="text-[11px] text-cyan-700/80 ml-auto hidden sm:inline">
            Navegación instantánea con datos locales en caché
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Sidebar: Filters */}
        <aside
          className={`space-y-6 md:block ${
            mobileFiltersOpen ? 'block fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'
          }`}
        >
          {mobileFiltersOpen && (
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 md:hidden">
              <span className="font-bold text-base text-slate-900">Filtros de Búsqueda</span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="text-xs font-bold text-slate-500 px-3 py-1 bg-slate-100 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          )}

          {/* Search Box */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Buscar Producto
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nombre, marca o SKU..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-cyan-500 outline-hidden"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Categories Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Categorías
              </label>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory('')}
                  className="text-[11px] text-cyan-600 hover:underline font-semibold"
                >
                  Todas
                </button>
              )}
            </div>
            <div className="space-y-1.5">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  !selectedCategory
                    ? 'bg-cyan-50 text-cyan-800 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Todas las Categorías
              </button>
              {categories.length === 0 ? (
                <div className="space-y-1.5 py-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2">
                      <Skeleton className="w-3/4 h-3.5 rounded" />
                      <Skeleton className="w-4 h-3.5 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (
                categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === cat.id
                        ? 'bg-cyan-50 text-cyan-800 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.nombre}</span>
                    {selectedCategory === cat.id && <Check className="w-3.5 h-3.5 text-cyan-600" />}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* State / Tag Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Disponibilidad y Ofertas
            </label>

            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
              />
              <span>Solo productos con stock disponible</span>
            </label>

            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyDeals}
                onChange={(e) => setOnlyDeals(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
              />
              <span>Solo ofertas y descuentos</span>
            </label>

            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyNew}
                onChange={(e) => setOnlyNew(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
              />
              <span>Nuevos ingresos</span>
            </label>
          </div>

          {/* Price Range Filter */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Rango de Precio (Bs.)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400">Mínimo</span>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice ?? ''}
                  onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Máximo</span>
                <input
                  type="number"
                  placeholder="10000"
                  value={maxPrice ?? ''}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={clearAllFilters}
            className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-100 font-semibold transition-colors"
          >
            Limpiar Filtros
          </button>
        </aside>

        {/* Right Content: Product Grid */}
        <main className="md:col-span-3 space-y-6">
          {productsLoading && displayProducts.length === 0 ? (
            <CatalogGridSkeleton count={6} />
          ) : displayProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                No se encontraron productos con esos criterios
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Intenta ajustar o limpiar los filtros seleccionados para ver más resultados del catálogo X-CRISPIN.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-cyan-600 transition-colors"
              >
                Restablecer Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayProducts.map((prod) => {
                const stockAvailable = prod.stockTotal - prod.stockReservado;
                const isOutOfStock = stockAvailable <= 0;

                return (
                  <div
                    key={prod.id}
                    onClick={() => handleProductClick(prod)}
                    className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:shadow-xl transition-all duration-200 flex flex-col group cursor-pointer"
                  >
                    {/* Image & Tags */}
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
                        <NotifyMeButton
                          product={prod}
                          variant="icon"
                          onSelectProduct={onSelectProduct}
                          className="!p-1.5"
                        />
                        <SizeGuideButton
                          product={prod}
                          variant="badge"
                          className="!p-1.5"
                        />
                      </div>
                      <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-slate-900/80 text-white text-[10px] font-mono rounded backdrop-blur-xs">
                        {prod.categoriaNombre}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-mono text-[10px] text-slate-400">{prod.sku}</span>
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span className="font-bold text-slate-800">{prod.rating}</span>
                          </div>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-cyan-600 transition-colors line-clamp-2">
                          {prod.nombre}
                        </h3>

                        {/* Factor X Tags */}
                        {(prod.factorPuntos || prod.presentacion) && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {prod.factorPuntos && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black rounded">
                                <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                                {prod.factorPuntos} Factor Pts
                              </span>
                            )}
                            {prod.presentacion && (
                              <span className="text-[10px] text-slate-500 font-medium truncate max-w-[180px]">
                                {prod.presentacion}
                              </span>
                            )}
                          </div>
                        )}

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
                          <span
                            className={`text-[11px] font-bold ${
                              isOutOfStock
                                ? 'text-rose-600'
                                : stockAvailable <= prod.stockMinimo
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {isOutOfStock ? 'Agotado' : `Stock: ${stockAvailable}`}
                          </span>
                        </div>

                        {/* Compare Selector Button */}
                        <CompareButton
                          productId={prod.id}
                          productName={prod.nombre}
                          variant="button"
                          className="w-full py-1.5"
                        />

                        {/* Mandatory Action Buttons: COMPRAR and AGREGAR AL CARRITO */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={(e) => handleBuyNow(prod, e)}
                            disabled={isOutOfStock}
                            id={`catalog-buy-now-${prod.id}`}
                            className="w-full py-2 bg-slate-900 hover:bg-cyan-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                          >
                            COMPRAR
                          </button>
                          <button
                            onClick={(e) => handleAddToCart(prod, e)}
                            disabled={isOutOfStock}
                            id={`catalog-add-cart-${prod.id}`}
                            className="w-full py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-900 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>AGREGAR</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Recently Viewed Section on Catalog Page */}
      <div className="pt-6 border-t border-slate-200">
        <RecentlyViewedSection
          onSelectProduct={onSelectProduct}
          onNavigateToCheckout={onNavigateToCheckout}
          title="Tus Productos Vistos Recientemente"
          subtitle="Continúa explorando los artículos que has consultado o interactuado"
          limit={6}
          hideWhenEmpty={false}
        />
      </div>
    </div>
  );
};

