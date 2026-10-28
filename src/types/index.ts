export type UserRole = 'CUSTOMER' | 'SELLER' | 'RECEPTION' | 'ADMIN';

export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'TITANIUM';

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  userEmail: string;
  orderId?: string;
  orderNumber?: string;
  points: number; // positive for earned, negative for redeemed
  balanceAfter: number;
  type: 'PURCHASE' | 'WELCOME_BONUS' | 'CAMPAIGN_BONUS' | 'REDEEM' | 'MANUAL_ADJUSTMENT';
  description: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  city?: string;
  sellerCode?: string;
  createdAt: string;
  wishlist?: string[];
  xPoints?: number;
  tier?: LoyaltyTier;
}

export interface CustomerAddress {
  id: string;
  label: string; // e.g. 'Casa', 'Oficina'
  department: string;
  city: string;
  zone: string;
  address: string;
  reference: string;
  isDefault: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string; // e.g. "Negro / 256GB" or "Azul / XL"
  attributeName: string; // e.g. "Color", "Almacenamiento", "Presentación"
  attributeValue: string;
  priceModifier: number; // additional cost or 0
  stock: number;
}

export interface Product {
  id: string;
  sku: string;
  nombre: string;
  slug: string;
  descripcionCorta: string;
  descripcionCompleta: string;
  descripcion?: string; // alias
  beneficios: string[];
  especificaciones?: Record<string, string>;
  precio: number; // en Bs (BOB)
  precioAnterior?: number;
  descuento?: number; // porcentaje ej 15
  imagenes: string[];
  video?: string;
  categoriaId: string;
  categoriaNombre: string;
  marca: string;
  variantes?: ProductVariant[];
  stockTotal: number;
  stockReservado: number;
  stockMinimo: number;
  estado: 'ACTIVO' | 'INACTIVO' | 'DESTACADO' | 'OFERTA' | 'NUEVO';
  destacado?: boolean;
  moneda?: string;
  rating: number;
  reviewsCount: number;
  isDemo?: boolean;
  factorPuntos?: number;
  precioUsd?: number;
  precioAfiliado?: number;
  precioMinorista?: number;
  precioMayorista?: number;
  presentacion?: string;
  ingredientes?: string[];
  modoUso?: string;
  contenidoNeto?: string;
  subcategoriaId?: string;
  subcategoriaNombre?: string;
  linea?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  icono?: string;
}

export interface Category {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  icono: string;
  imagen?: string;
  destacada: boolean;
  subcategorias?: Subcategory[];
}

export type OrderStatus =
  | 'NUEVO'
  | 'PAGO_PENDIENTE'
  | 'PAGO_EN_REVISION'
  | 'PAGO_CONFIRMADO'
  | 'PREPARANDO'
  | 'LISTO_PARA_ENTREGA'
  | 'ENVIADO'
  | 'EN_CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO'
  | 'DEVUELTO';

export type PaymentMethodType =
  | 'QR_SIMPLE'
  | 'TRANSFERENCIA_BANCARIA'
  | 'TRANSFERENCIA_BCP'
  | 'TRANSFERENCIA_BNB'
  | 'EFECTIVO_CONTRA_ENTREGA';

export type PaymentStatus =
  | 'PENDIENTE'
  | 'COMPROBANTE_RECIBIDO'
  | 'EN_REVISION'
  | 'CONFIRMADO'
  | 'RECHAZADO'
  | 'REEMBOLSADO';

export interface PaymentProof {
  id: string;
  numeroOperacion: string;
  fechaPago: string;
  comprobanteUrl: string; // Base64 o URL de imagen
  comprobanteNombre?: string;
  observacion?: string;
  subidoPorUsuario: string;
  revisadoPor?: string;
  fechaRevision?: string;
  motivoRechazo?: string;
}

export interface OrderItem {
  productoId: string;
  sku: string;
  nombre: string;
  imagen: string;
  precioUnitario: number;
  cantidad: number;
  varianteId?: string;
  varianteNombre?: string;
  subtotal: number;
}

export interface OrderStatusHistoryEvent {
  id: string;
  fecha: string;
  hora: string;
  usuario: string;
  estadoAnterior: OrderStatus;
  estadoNuevo: OrderStatus;
  observacion: string;
}

export interface Order {
  id: string;
  numeroPedido: string; // e.g. "XC-2025-0012"
  clienteId: string;
  clienteNombre: string;
  clienteApellido: string;
  clienteEmail: string;
  clienteTelefono: string;
  clienteWhatsapp: string;
  vendedorId?: string;
  vendedorNombre?: string;
  
  // Dirección
  departamento: string;
  ciudad: string;
  zona: string;
  direccion: string;
  referencia: string;
  
  // Entrega
  metodoEntregaId: string;
  metodoEntregaNombre: string;
  costoEnvio: number;
  
  // Items y Totales
  items: OrderItem[];
  subtotal: number;
  descuentoCupon: number;
  codigoCupon?: string;
  total: number;
  moneda: string; // "BOB"
  
  // Pago
  metodoPago: PaymentMethodType;
  estadoPago: PaymentStatus;
  comprobante?: PaymentProof;
  
  // Estado General
  estado: OrderStatus;
  historialEstados: OrderStatusHistoryEvent[];
  
  // Fidelidad
  xPointsEarned?: number;

  notas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  producto: Product;
  variante?: ProductVariant;
  cantidad: number;
}

export type InventoryMovementType =
  | 'ENTRADA'
  | 'VENTA'
  | 'RESERVA'
  | 'LIBERACION'
  | 'AJUSTE'
  | 'DEVOLUCION';

export interface InventoryMovement {
  id: string;
  productoId: string;
  productoNombre: string;
  cantidad: number; // positivo o negativo según movimiento
  tipo: InventoryMovementType;
  stockAnterior: number;
  stockNuevo: number;
  usuario: string;
  motivo: string;
  pedidoId?: string;
  fecha: string;
}

export interface Coupon {
  id: string;
  codigo: string;
  tipo: 'PORCENTAJE' | 'MONTO_FIJO';
  valor: number; // ej: 10 (%) o 50 (Bs.)
  montoMinimoCompra: number;
  fechaInicio: string;
  fechaFin: string;
  usoMaximo: number;
  usosActuales: number;
  usoPorCliente: number;
  activo: boolean;
  descripcion: string;
}

export interface ProductReview {
  id: string;
  productoId: string;
  usuarioId: string;
  usuarioNombre: string;
  usuarioCiudad?: string;
  calificacion: number; // 1 to 5
  titulo: string;
  comentario: string;
  recomienda?: boolean;
  compraVerificada: boolean;
  orderNumber?: string;
  votosUtiles?: number;
  aprobado: boolean;
  createdAt: string;
}

export interface PriceDropAlert {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  currentPrice: number;
  targetPrice?: number;
  email: string;
  phone?: string;
  notifyWhatsApp?: boolean;
  status: 'ACTIVE' | 'TRIGGERED' | 'CANCELLED';
  createdAt: string;
  triggeredAt?: string;
  triggeredPrice?: number;
}

export interface AppNotification {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: 'PEDIDO' | 'PAGO' | 'INVENTARIO' | 'SISTEMA' | 'PRECIO' | 'OFERTA' | 'STOCK';
  leida: boolean;
  fecha: string;
  enlace?: string;
  pedidoId?: string;
  productoSlug?: string;
  productoId?: string;
}

export interface StoreConfig {
  nombre: string;
  eslogan: string;
  tiendaNombre?: string;
  slogan?: string;
  pais: string;
  moneda: string;
  simboloMoneda: string;
  idioma: string;
  email: string;
  telefono: string;
  whatsapp: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  qrSimpleImagen: string;
  qrImagenUrl?: string;
  qrSimpleTitular: string;
  qrSimpleBanco: string;
  bancoNombre: string;
  bancoNumeroCuenta: string;
  bancoNroCuenta?: string;
  bancoTipoCuenta: string;
  bancoTitular: string;
  bancoNitCi: string;
  costoEnvioNacional: number;
  costoEnvioLocal: number;
}

export type AppConfig = StoreConfig;

export type WishlistOccasion =
  | 'Cumpleaños'
  | 'Boda / Matrimonio'
  | 'Graduación'
  | 'Navidad / Fiestas'
  | 'Aniversario'
  | 'Baby Shower'
  | 'Lista Personal'
  | 'Otro';

export interface SharedWishlistItem {
  productId: string;
  notes?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  reserved?: boolean;
  reservedBy?: string; // Nombre del amigo o familiar que aparta o regala el ítem
  reservedAt?: string;
}

export interface SharedWishlist {
  id: string; // Código público único, ej: "WL-CARLOS-789"
  title: string;
  ownerId: string;
  ownerName: string;
  ownerCity?: string;
  occasion: WishlistOccasion;
  customMessage?: string;
  productIds: string[];
  items?: SharedWishlistItem[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  viewsCount?: number;
}

export interface ScannedItemHistory {
  id: string;
  productId: string;
  nombre: string;
  slug: string;
  sku: string;
  precio: number;
  imagen: string;
  categoriaNombre?: string;
  rawCode: string;
  scannedAt: string;
}

export interface BackInStockSubscription {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productSku: string;
  productImage: string;
  productPrice: number;
  variantId?: string;
  variantName?: string;
  email: string;
  phone?: string;
  notifyWhatsApp?: boolean;
  status: 'PENDING' | 'NOTIFIED' | 'CANCELLED';
  createdAt: string;
  notifiedAt?: string;
  initialStock: number;
}
