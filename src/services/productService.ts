import { Product, ProductVariant } from '../types';
import { storage } from './storage';

export interface ProductFilters {
  categoriaId?: string;
  subcategoriaId?: string;
  busqueda?: string;
  minPrecio?: number;
  maxPrecio?: number;
  soloEnStock?: boolean;
  soloOfertas?: boolean;
  soloNuevos?: boolean;
  orden?: 'relevancia' | 'ventas' | 'precio_menor' | 'precio_mayor' | 'recientes';
}

export const productService = {
  getAll: (filters?: ProductFilters): Product[] => {
    let list = [...storage.getProducts()];

    if (!filters) return list;

    if (filters.categoriaId) {
      if (filters.categoriaId === 'cat-fx-salud-bienestar' || filters.categoriaId === 'cat-fx-suplementos') {
        list = list.filter((p) => p.categoriaId === 'cat-fx-salud-bienestar' || p.categoriaId === 'cat-fx-suplementos');
      } else {
        list = list.filter((p) => p.categoriaId === filters.categoriaId);
      }
    }

    if (filters.subcategoriaId) {
      list = list.filter((p) => p.subcategoriaId === filters.subcategoriaId);
    }

    if (filters.busqueda && filters.busqueda.trim()) {
      const q = filters.busqueda.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.marca.toLowerCase().includes(q) ||
          p.descripcionCorta.toLowerCase().includes(q)
      );
    }

    if (filters.minPrecio !== undefined) {
      list = list.filter((p) => p.precio >= (filters.minPrecio || 0));
    }

    if (filters.maxPrecio !== undefined) {
      list = list.filter((p) => p.precio <= (filters.maxPrecio || Infinity));
    }

    if (filters.soloEnStock) {
      list = list.filter((p) => (p.stockTotal - p.stockReservado) > 0);
    }

    if (filters.soloOfertas) {
      list = list.filter((p) => (p.descuento && p.descuento > 0) || p.estado === 'OFERTA');
    }

    if (filters.soloNuevos) {
      list = list.filter((p) => p.estado === 'NUEVO');
    }

    // Ordenamiento
    switch (filters.orden) {
      case 'precio_menor':
        list.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio_mayor':
        list.sort((a, b) => b.precio - a.precio);
        break;
      case 'recientes':
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'ventas':
        list.sort((a, b) => b.reviewsCount - a.reviewsCount);
        break;
      case 'relevancia':
      default:
        // Featured products first, then by rating
        list.sort((a, b) => (b.estado === 'DESTACADO' ? 1 : 0) - (a.estado === 'DESTACADO' ? 1 : 0) || b.rating - a.rating);
        break;
    }

    return list;
  },

  getBySlug: (slug: string): Product | undefined => {
    return storage.getProducts().find((p) => p.slug === slug);
  },

  getById: (id: string): Product | undefined => {
    return storage.getProducts().find((p) => p.id === id);
  },

  getFeatured: (limit = 4): Product[] => {
    return storage
      .getProducts()
      .filter((p) => p.estado === 'DESTACADO' || (p.descuento && p.descuento > 0))
      .slice(0, limit);
  },

  getDeals: (limit = 4): Product[] => {
    return storage
      .getProducts()
      .filter((p) => p.estado === 'OFERTA' || (p.descuento && p.descuento > 10))
      .slice(0, limit);
  },

  getNewArrivals: (limit = 4): Product[] => {
    return storage
      .getProducts()
      .filter((p) => p.estado === 'NUEVO')
      .slice(0, limit);
  },

  getBestSellers: (limit = 6): Product[] => {
    return [...storage.getProducts()]
      .sort((a, b) => b.reviewsCount - a.reviewsCount || b.rating - a.rating)
      .slice(0, limit);
  },

  getRelated: (categoriaId: string, currentProductId: string, limit = 3): Product[] => {
    return storage
      .getProducts()
      .filter((p) => p.categoriaId === categoriaId && p.id !== currentProductId)
      .slice(0, limit);
  },

  resolveFromScannedCode: (rawCode: string): Product | undefined => {
    if (!rawCode || typeof rawCode !== 'string') return undefined;
    const clean = rawCode.trim();
    if (!clean) return undefined;

    const allProducts = storage.getProducts();

    // 1. Direct match by slug
    const directSlug = allProducts.find((p) => p.slug.toLowerCase() === clean.toLowerCase());
    if (directSlug) return directSlug;

    // 2. Direct match by SKU
    const directSku = allProducts.find((p) => p.sku.toLowerCase() === clean.toLowerCase());
    if (directSku) return directSku;

    // 3. Direct match by ID
    const directId = allProducts.find((p) => p.id.toLowerCase() === clean.toLowerCase());
    if (directId) return directId;

    // 4. Try parsing as JSON
    try {
      if (clean.startsWith('{') && clean.endsWith('}')) {
        const parsed = JSON.parse(clean);
        const candidateKey = parsed.slug || parsed.sku || parsed.id || parsed.productId || parsed.code;
        if (candidateKey) {
          const matched = allProducts.find(
            (p) =>
              p.slug.toLowerCase() === String(candidateKey).toLowerCase() ||
              p.sku.toLowerCase() === String(candidateKey).toLowerCase() ||
              p.id.toLowerCase() === String(candidateKey).toLowerCase()
          );
          if (matched) return matched;
        }
      }
    } catch {
      // Not JSON, continue to next checks
    }

    // 5. Try parsing as URL
    try {
      // Handle relative or full URLs
      const urlToParse = clean.startsWith('http') ? clean : `https://x-crispin.bo/${clean.replace(/^\//, '')}`;
      const parsedUrl = new URL(urlToParse);
      
      // Check query params: ?producto=..., ?p=..., ?sku=..., ?id=..., ?slug=...
      const queryParam =
        parsedUrl.searchParams.get('producto') ||
        parsedUrl.searchParams.get('slug') ||
        parsedUrl.searchParams.get('p') ||
        parsedUrl.searchParams.get('sku') ||
        parsedUrl.searchParams.get('id');

      if (queryParam) {
        const matched = allProducts.find(
          (p) =>
            p.slug.toLowerCase() === queryParam.toLowerCase() ||
            p.sku.toLowerCase() === queryParam.toLowerCase() ||
            p.id.toLowerCase() === queryParam.toLowerCase()
        );
        if (matched) return matched;
      }

      // Check pathname: e.g. /producto/:slug or /productos/:slug
      const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
      for (let i = 0; i < pathSegments.length; i++) {
        const segment = decodeURIComponent(pathSegments[i]);
        const matched = allProducts.find(
          (p) =>
            p.slug.toLowerCase() === segment.toLowerCase() ||
            p.sku.toLowerCase() === segment.toLowerCase() ||
            p.id.toLowerCase() === segment.toLowerCase()
        );
        if (matched) return matched;
      }
    } catch {
      // Not a valid URL, continue
    }

    // 6. Substring or partial search on SKU or slug
    const partialMatch = allProducts.find(
      (p) =>
        clean.toLowerCase().includes(p.sku.toLowerCase()) ||
        clean.toLowerCase().includes(p.slug.toLowerCase())
    );
    if (partialMatch) return partialMatch;

    return undefined;
  },

  saveOrUpdate: (product: Partial<Product> & { nombre: string; precio: number }): Product => {
    const list = storage.getProducts();
    const slug = product.slug || product.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const now = new Date().toISOString();

    if (product.id) {
      const idx = list.findIndex((p) => p.id === product.id);
      if (idx !== -1) {
        const updated: Product = {
          ...list[idx],
          ...product,
          slug,
          updatedAt: now,
        };
        list[idx] = updated;
        storage.saveProducts(list);
        return updated;
      }
    }

    // Create new
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      sku: product.sku || `XC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      nombre: product.nombre,
      slug,
      descripcionCorta: product.descripcionCorta || '',
      descripcionCompleta: product.descripcionCompleta || '',
      beneficios: product.beneficios || ['Garantía oficial X-CRISPIN'],
      precio: product.precio,
      precioAnterior: product.precioAnterior,
      descuento: product.descuento || 0,
      imagenes: product.imagenes && product.imagenes.length ? product.imagenes : ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800&auto=format&fit=crop'],
      categoriaId: product.categoriaId || 'cat-smartphones',
      categoriaNombre: product.categoriaNombre || 'Tecnología',
      marca: product.marca || 'X-TECH',
      variantes: product.variantes || [],
      stockTotal: product.stockTotal ?? 10,
      stockReservado: 0,
      stockMinimo: product.stockMinimo ?? 2,
      estado: product.estado || 'ACTIVO',
      rating: 5.0,
      reviewsCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(newProduct);
    storage.saveProducts(list);
    return newProduct;
  },

  delete: (id: string): void => {
    const list = storage.getProducts().filter((p) => p.id !== id);
    storage.saveProducts(list);
  },

  calculateStockAvailable: (product: Product, variant?: ProductVariant): number => {
    if (variant) {
      return variant.stock;
    }
    return Math.max(0, product.stockTotal - product.stockReservado);
  },
};
