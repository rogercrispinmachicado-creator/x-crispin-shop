import { Product, InventoryMovement, InventoryMovementType } from '../types';
import { storage } from './storage';

export interface InventoryStatusItem {
  product: Product;
  stockTotal: number;
  stockReservado: number;
  stockDisponible: number;
  stockMinimo: number;
  estadoAlerta: 'OK' | 'STOCK_BAJO' | 'AGOTADO';
}

export const inventoryService = {
  getSummary: (): InventoryStatusItem[] => {
    const products = storage.getProducts();
    return products.map((product) => {
      const stockDisponible = Math.max(0, product.stockTotal - product.stockReservado);
      let estadoAlerta: 'OK' | 'STOCK_BAJO' | 'AGOTADO' = 'OK';

      if (stockDisponible === 0) {
        estadoAlerta = 'AGOTADO';
      } else if (stockDisponible <= product.stockMinimo) {
        estadoAlerta = 'STOCK_BAJO';
      }

      return {
        product,
        stockTotal: product.stockTotal,
        stockReservado: product.stockReservado,
        stockDisponible,
        stockMinimo: product.stockMinimo,
        estadoAlerta,
      };
    });
  },

  getMovements: (productoId?: string): InventoryMovement[] => {
    const movements = storage.getMovements();
    if (productoId) {
      return movements.filter((m) => m.productoId === productoId);
    }
    return movements;
  },

  adjustStock: (data: {
    productoId: string;
    nuevoStockTotal: number;
    usuario: string;
    motivo: string;
    tipo?: InventoryMovementType;
  }): { success: boolean; error?: string } => {
    const products = storage.getProducts();
    const idx = products.findIndex((p) => p.id === data.productoId);
    if (idx === -1) {
      return { success: false, error: 'Producto no encontrado' };
    }

    const prod = products[idx];
    const prevStock = prod.stockTotal;
    const diff = data.nuevoStockTotal - prevStock;

    if (data.nuevoStockTotal < prod.stockReservado) {
      return {
        success: false,
        error: `No se puede fijar un stock total menor a las unidades reservadas actualmente (${prod.stockReservado}).`,
      };
    }

    prod.stockTotal = data.nuevoStockTotal;
    prod.updatedAt = new Date().toISOString();
    products[idx] = prod;
    storage.saveProducts(products);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().substring(0, 5);

    const movement: InventoryMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productoId: prod.id,
      productoNombre: prod.nombre,
      cantidad: diff,
      tipo: data.tipo || 'AJUSTE',
      stockAnterior: prevStock,
      stockNuevo: data.nuevoStockTotal,
      usuario: data.usuario,
      motivo: data.motivo,
      fecha: `${dateStr} ${timeStr}`,
    };

    const movements = storage.getMovements();
    movements.unshift(movement);
    storage.saveMovements(movements);

    return { success: true };
  },

  addStockInflow: (data: {
    productoId: string;
    unidadesAAgregar: number;
    usuario: string;
    motivo: string;
  }): { success: boolean; error?: string } => {
    const products = storage.getProducts();
    const idx = products.findIndex((p) => p.id === data.productoId);
    if (idx === -1) return { success: false, error: 'Producto no encontrado' };

    const prod = products[idx];
    const prevStock = prod.stockTotal;
    prod.stockTotal += data.unidadesAAgregar;
    prod.updatedAt = new Date().toISOString();
    products[idx] = prod;
    storage.saveProducts(products);

    const now = new Date();
    const movement: InventoryMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productoId: prod.id,
      productoNombre: prod.nombre,
      cantidad: data.unidadesAAgregar,
      tipo: 'ENTRADA',
      stockAnterior: prevStock,
      stockNuevo: prod.stockTotal,
      usuario: data.usuario,
      motivo: data.motivo || 'Ingreso de nuevo lote al almacén',
      fecha: `${now.toISOString().split('T')[0]} ${now.toTimeString().substring(0, 5)}`,
    };

    const movements = storage.getMovements();
    movements.unshift(movement);
    storage.saveMovements(movements);

    return { success: true };
  },
};
