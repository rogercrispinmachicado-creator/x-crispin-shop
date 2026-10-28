import {
  Product,
  Category,
  Order,
  InventoryMovement,
  Coupon,
  StoreConfig,
  User,
  AppNotification,
  ProductReview,
  PriceDropAlert,
  LoyaltyTransaction,
  LoyaltyTier,
  SharedWishlist,
  SharedWishlistItem,
  WishlistOccasion,
  ScannedItemHistory,
  BackInStockSubscription,
} from '../types';
import { apiCacheService } from './apiCacheService';
import { FACTOR_X_CATEGORIES, FACTOR_X_PRODUCTS } from '../data/factorXProducts';

const STORAGE_KEYS = {
  PRODUCTS: 'xcrispin_products_v1',
  CATEGORIES: 'xcrispin_categories_v1',
  ORDERS: 'xcrispin_orders_v1',
  INVENTORY_MOVEMENTS: 'xcrispin_inventory_movements_v1',
  COUPONS: 'xcrispin_coupons_v1',
  STORE_CONFIG: 'xcrispin_config_v1',
  CURRENT_USER: 'xcrispin_current_user_v1',
  NOTIFICATIONS: 'xcrispin_notifications_v1',
  REVIEWS: 'xcrispin_reviews_v1',
  CART: 'xcrispin_cart_v1',
  WISHLIST: 'xcrispin_wishlist_v1',
  SHARED_WISHLISTS: 'xcrispin_shared_wishlists_v1',
  NEWSLETTER: 'xcrispin_newsletter_v1',
  RECENTLY_VIEWED: 'xcrispin_recently_viewed_v1',
  PRICE_ALERTS: 'xcrispin_price_alerts_v1',
  LOYALTY_TRANSACTIONS: 'xcrispin_loyalty_tx_v1',
  QR_SCAN_HISTORY: 'xcrispin_qr_scan_history_v1',
  BACK_IN_STOCK: 'xcrispin_back_in_stock_v1',
};

export const INITIAL_LOYALTY_TRANSACTIONS: LoyaltyTransaction[] = [
  {
    id: 'tx-loyalty-01',
    userId: 'user_cust_01',
    userEmail: 'carlos.cliente@example.com',
    points: 50,
    balanceAfter: 50,
    type: 'WELCOME_BONUS',
    description: 'Bono de bienvenida al Club X-Points Bolivia',
    createdAt: '2025-01-10T10:05:00.000Z',
  },
  {
    id: 'tx-loyalty-02',
    userId: 'user_cust_01',
    userEmail: 'carlos.cliente@example.com',
    orderId: 'ord-001',
    orderNumber: 'XC-2025-0101',
    points: 87,
    balanceAfter: 137,
    type: 'PURCHASE',
    description: 'X-Points ganados por compra #XC-2025-0101 (Bs. 870)',
    createdAt: '2025-02-10T14:22:00.000Z',
  },
  {
    id: 'tx-loyalty-03',
    userId: 'user_cust_01',
    userEmail: 'carlos.cliente@example.com',
    orderId: 'ord-003',
    orderNumber: 'XC-2025-0102',
    points: 173,
    balanceAfter: 310,
    type: 'PURCHASE',
    description: 'X-Points ganados por compra #XC-2025-0102 (Bs. 1,735)',
    createdAt: '2025-01-20T11:00:00.000Z',
  },
  {
    id: 'tx-loyalty-04',
    userId: 'user_cust_01',
    userEmail: 'carlos.cliente@example.com',
    points: 40,
    balanceAfter: 350,
    type: 'CAMPAIGN_BONUS',
    description: 'Puntos extra por campaña de fidelidad Factor X',
    createdAt: '2025-02-12T09:00:00.000Z',
  },
];

export const INITIAL_PRICE_ALERTS: PriceDropAlert[] = [
  {
    id: 'alert-demo-1',
    productId: 'prod-001',
    productName: 'X-Phone Pro Titan 5G (DEMO)',
    productSlug: 'x-phone-pro-titan-5g',
    productImage: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800&auto=format&fit=crop',
    currentPrice: 4890,
    targetPrice: 4500,
    email: 'carlos.cliente@example.com',
    phone: '+591 71543210',
    notifyWhatsApp: true,
    status: 'ACTIVE',
    createdAt: '2025-02-12T10:00:00.000Z',
  },
  {
    id: 'alert-demo-2',
    productId: 'prod-fx-001',
    productName: 'Factor X Moringa Pura Concentrada',
    productSlug: 'factor-x-moringa-pura-concentrada',
    productImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop',
    currentPrice: 195,
    targetPrice: 180,
    email: 'carlos.cliente@example.com',
    phone: '+591 71543210',
    notifyWhatsApp: true,
    status: 'ACTIVE',
    createdAt: '2025-02-14T11:30:00.000Z',
  },
];

export const INITIAL_STOCK_SUBSCRIPTIONS: BackInStockSubscription[] = [
  {
    id: 'sub-stock-001',
    productId: 'prod-007',
    productName: 'Audífonos In-Ear X-Pro Wireless ANC (Edición Limitada)',
    productSlug: 'audifonos-in-ear-x-pro-wireless-anc',
    productSku: 'XC-AUD-PRO-ANC',
    productImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop',
    productPrice: 620,
    email: 'carlos.cliente@example.com',
    phone: '+591 71543210',
    notifyWhatsApp: true,
    status: 'PENDING',
    createdAt: '2026-03-24T11:00:00.000Z',
    initialStock: 0,
  },
];

export const INITIAL_SCANNED_HISTORY: ScannedItemHistory[] = [
  {
    id: 'scan-001',
    productId: 'prod-001',
    nombre: 'X-Phone Pro Titan 5G',
    slug: 'x-phone-pro-titan-5g',
    sku: 'SKU-XP-TITAN',
    precio: 4890,
    imagen: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800&auto=format&fit=crop',
    categoriaNombre: 'Smartphones & Telefonía',
    rawCode: 'https://x-crispin.bo/p/x-phone-pro-titan-5g',
    scannedAt: '2026-03-27T16:15:00.000Z',
  },
  {
    id: 'scan-002',
    productId: 'prod-004',
    nombre: 'Smartwatch Ultra Trail GPS Dual',
    slug: 'smartwatch-ultra-trail',
    sku: 'SKU-WATCH-TR',
    precio: 1250,
    imagen: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop',
    categoriaNombre: 'Wearables & Relojes',
    rawCode: 'SKU-WATCH-TR',
    scannedAt: '2026-03-27T14:40:00.000Z',
  },
  {
    id: 'scan-003',
    productId: 'prod-fx-clnxx',
    nombre: 'Factor X Clean XX Digestivo (30 Sobres)',
    slug: 'factor-x-clean-xx',
    sku: 'FX-CLN-XX',
    precio: 210,
    imagen: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop',
    categoriaNombre: 'Salud & Bienestar',
    rawCode: 'FX-CLN-XX',
    scannedAt: '2026-03-26T18:20:00.000Z',
  },
];

// Initial Bolivian Store Configuration
export const DEFAULT_CONFIG: StoreConfig = {
  nombre: 'X-CRISPIN',
  eslogan: 'SHOP THE X',
  pais: 'Bolivia',
  moneda: 'BOB',
  simboloMoneda: 'Bs.',
  idioma: 'Español',
  email: 'contacto@x-crispin.bo',
  telefono: '+591 72902338',
  whatsapp: '59172902338',
  direccion: 'Av. Ballivián #1240, Calacoto',
  ciudad: 'La Paz',
  departamento: 'La Paz',
  qrSimpleImagen: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PAGO-QR-SIMPLE-X-CRISPIN-CUENTA-BCP-201-5089234-BOB',
  qrSimpleTitular: 'X-CRISPIN COMERCIO DIGITAL S.R.L.',
  qrSimpleBanco: 'Banco de Crédito de Bolivia (BCP) - QR Simple',
  bancoNombre: 'Banco de Crédito de Bolivia (BCP)',
  bancoNumeroCuenta: '201-5089234-3-19',
  bancoTipoCuenta: 'Cuenta Corriente en Bolivianos (BOB)',
  bancoTitular: 'X-CRISPIN S.R.L.',
  bancoNitCi: 'NIT: 3894012019',
  costoEnvioNacional: 35,
  costoEnvioLocal: 15,
};

// Pre-configured multi-role personas for easy testing
export const DEMO_USERS: User[] = [
  {
    id: 'user_cust_01',
    name: 'Carlos',
    lastName: 'Mamani Gutierrez',
    email: 'carlos.cliente@example.com',
    phone: '+591 71543210',
    whatsapp: '59171543210',
    role: 'CUSTOMER',
    department: 'La Paz',
    city: 'La Paz',
    createdAt: '2025-01-10T10:00:00.000Z',
    wishlist: ['prod-fx-001', 'prod-001'],
    xPoints: 350,
    tier: 'SILVER',
  },
  {
    id: 'user_seller_01',
    name: 'Valentina',
    lastName: 'Rios Torrico',
    email: 'valentina.ventas@x-crispin.bo',
    phone: '+591 76543219',
    whatsapp: '59176543219',
    role: 'SELLER',
    sellerCode: 'VEND-007',
    department: 'Santa Cruz',
    city: 'Santa Cruz de la Sierra',
    createdAt: '2025-01-05T08:30:00.000Z',
    wishlist: ['prod-fx-002', 'prod-003'],
    xPoints: 120,
    tier: 'BRONZE',
  },
  {
    id: 'user_recep_01',
    name: 'Jorge',
    lastName: 'Flores Condori',
    email: 'recepcion@x-crispin.bo',
    phone: '+591 72345678',
    whatsapp: '59172345678',
    role: 'RECEPTION',
    department: 'Cochabamba',
    city: 'Cochabamba',
    createdAt: '2025-01-01T09:00:00.000Z',
    wishlist: ['prod-002'],
    xPoints: 80,
    tier: 'BRONZE',
  },
  {
    id: 'user_admin_01',
    name: 'Admin',
    lastName: 'X-Crispin Master',
    email: 'admin@x-crispin.bo',
    phone: '+591 70011223',
    whatsapp: '59170011223',
    role: 'ADMIN',
    department: 'La Paz',
    city: 'La Paz',
    createdAt: '2025-01-01T00:00:00.000Z',
    wishlist: ['prod-fx-pack-001'],
    xPoints: 500,
    tier: 'GOLD',
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  ...FACTOR_X_CATEGORIES,
  {
    id: 'cat-smartphones',
    nombre: 'Smartphones & Móviles',
    slug: 'smartphones-moviles',
    descripcion: 'Dispositivos inteligentes de última generación con garantía oficial en Bolivia',
    icono: 'Smartphone',
    destacada: true,
  },
  {
    id: 'cat-laptops',
    nombre: 'Laptops & Computación',
    slug: 'laptops-computacion',
    descripcion: 'Equipos ultralivianos y estaciones de trabajo de alto rendimiento',
    icono: 'Laptop',
    destacada: true,
  },
  {
    id: 'cat-audio',
    nombre: 'Audio & Auriculares Hi-Fi',
    slug: 'audio-auriculares',
    descripcion: 'Cancelación de ruido activa, sonido espacial y fidelidad de estudio',
    icono: 'Headphones',
    destacada: true,
  },
  {
    id: 'cat-wearables',
    nombre: 'Smartwatches & Wearables',
    slug: 'smartwatches-wearables',
    descripcion: 'Monitoreo de salud, GPS integrado y autonomía extendida',
    icono: 'Watch',
    destacada: true,
  },
  {
    id: 'cat-gadgets',
    nombre: 'Accesorios & Gadgets X',
    slug: 'accesorios-gadgets',
    descripcion: 'Cargadores GaN ultrarrápidos, soportes magnéticos y periféricos premium',
    icono: 'Cpu',
    destacada: false,
  },
  {
    id: 'cat-clothing',
    nombre: 'Indumentaria & Ropa Oficial',
    slug: 'indumentaria-ropa',
    descripcion: 'Poleras de algodón Pima, chaquetas cortavientos y gorras urbanas oficiales Factor X con guía de tallas',
    icono: 'Shirt',
    destacada: true,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  ...FACTOR_X_PRODUCTS,
  {
    id: 'prod-001',
    sku: 'XC-PH-TITAN15',
    nombre: 'X-Phone Pro Titan 5G (DEMO)',
    slug: 'x-phone-pro-titan-5g',
    descripcionCorta: 'Pantalla OLED 120Hz, procesador Bionic 4nm, triple cámara 108MP con zoom óptico 5x.',
    descripcionCompleta: 'El X-Phone Pro Titan redefine la potencia móvil. Construido en aleación de titanio aeroespacial y cristal reforzado Ceramic Shield. Equipado con el chip Neural X-Core que ofrece un 40% más de eficiencia energética y un procesamiento fotográfico nocturno inigualable en cualquier condición de luz. Soporta doble SIM física + eSIM con conectividad 5G compatible con las redes bolivianas (Entel, Tigo, Viva).',
    beneficios: [
      'Garantía oficial de 12 meses en Bolivia con servicio técnico directo',
      'Carga ultrarrápida de 65W (0 a 100% en 28 minutos)',
      'Resistencia al agua y polvo con certificación IP68',
      'Incluye cargador GaN y funda protectora premium en la caja'
    ],
    precio: 4890,
    precioAnterior: 5490,
    descuento: 11,
    imagenes: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-smartphones',
    categoriaNombre: 'Smartphones & Móviles',
    marca: 'X-TECH',
    variantes: [
      { id: 'v1-1', sku: 'XC-PH-TITAN15-256G-BLK', name: 'Negro Titanio - 256GB', attributeName: 'Versión', attributeValue: '256GB Titanio Negro', priceModifier: 0, stock: 12 },
      { id: 'v1-2', sku: 'XC-PH-TITAN15-512G-BLU', name: 'Azul Cósmico - 512GB', attributeName: 'Versión', attributeValue: '512GB Azul Cósmico', priceModifier: 600, stock: 8 },
    ],
    stockTotal: 20,
    stockReservado: 2,
    stockMinimo: 4,
    estado: 'DESTACADO',
    rating: 4.9,
    reviewsCount: 28,
    isDemo: true,
    createdAt: '2025-01-15T12:00:00.000Z',
    updatedAt: '2025-02-01T10:00:00.000Z',
  },
  {
    id: 'prod-002',
    sku: 'XC-AUD-XSILENCE',
    nombre: 'Auriculares X-Silence Wireless ANC (DEMO)',
    slug: 'auriculares-x-silence-wireless-anc',
    descripcionCorta: 'Cancelación activa de ruido adaptativa de 45dB, sonido Hi-Res LDAC y hasta 40h de batería.',
    descripcionCompleta: 'Sumérgete en un silencio absoluto o disfruta de tu música favorita con fidelidad de estudio. Los X-Silence cuentan con diafragmas de berilio de 40mm calibrados acústicamente, 6 micrófonos beamforming para llamadas nítidas sin eco y almohadillas viscoelásticas de cuero proteico que no fatigan tus oídos.',
    beneficios: [
      'Cancelación de ruido líder en su clase con modo transparencia inteligente',
      '40 horas de reproducción continua y carga rápida por USB-C',
      'Conexión multipunto: conecta simultáneamente tu laptop y celular',
      'Estuche rígido de viaje y cable de audio 3.5mm libre de oxígeno incluido'
    ],
    precio: 950,
    precioAnterior: 1190,
    descuento: 20,
    imagenes: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-audio',
    categoriaNombre: 'Audio & Auriculares Hi-Fi',
    marca: 'X-AUDIO',
    variantes: [
      { id: 'v2-1', sku: 'XC-AUD-XSILENCE-SLV', name: 'Plata Lunar', attributeName: 'Color', attributeValue: 'Plata Lunar', priceModifier: 0, stock: 15 },
      { id: 'v2-2', sku: 'XC-AUD-XSILENCE-MID', name: 'Negro Medianoche', attributeName: 'Color', attributeValue: 'Negro Medianoche', priceModifier: 0, stock: 10 },
    ],
    stockTotal: 25,
    stockReservado: 1,
    stockMinimo: 5,
    estado: 'OFERTA',
    rating: 4.8,
    reviewsCount: 34,
    isDemo: true,
    createdAt: '2025-01-18T14:30:00.000Z',
    updatedAt: '2025-02-05T09:15:00.000Z',
  },
  {
    id: 'prod-003',
    sku: 'XC-LAP-ULTRABOOK14',
    nombre: 'Laptop X-Book Pro 14 M-Series (DEMO)',
    slug: 'laptop-x-book-pro-14-m-series',
    descripcionCorta: 'Pantalla 3K Liquid Retina 120Hz, 32GB RAM, 1TB NVMe, autonomía de 18 horas.',
    descripcionCompleta: 'Diseñada para desarrolladores, arquitectos, creadores de contenido y ejecutivos exigentes. Chasis de aluminio unibody fresado CNC con solo 1.3kg de peso. Su procesador octacore de ultra bajo consumo permite trabajar durante jornadas completas sin necesidad de conectar el cargador.',
    beneficios: [
      'Teclado retroiluminado en español con lector de huella dactilar biométrico',
      'Puertos Thunderbolt 4, HDMI 2.1 y lector de tarjetas SD',
      'Sistema de disipación silenciosa con doble cámara de vapor',
      'Windows 11 Pro con licencia oficial perpetua preinstalada'
    ],
    precio: 7850,
    precioAnterior: 8600,
    descuento: 9,
    imagenes: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-laptops',
    categoriaNombre: 'Laptops & Computación',
    marca: 'X-COMPUTE',
    stockTotal: 8,
    stockReservado: 0,
    stockMinimo: 2,
    estado: 'DESTACADO',
    rating: 5.0,
    reviewsCount: 19,
    isDemo: true,
    createdAt: '2025-01-20T11:00:00.000Z',
    updatedAt: '2025-02-10T16:00:00.000Z',
  },
  {
    id: 'prod-004',
    sku: 'XC-WAT-CHRONO-X',
    nombre: 'Smartwatch X-Chrono Apex ECG & GPS (DEMO)',
    slug: 'smartwatch-x-chrono-apex-ecg-gps',
    descripcionCorta: 'Caja de titanio, bisel cerámico, sensor de ECG médico, GPS satelital de doble banda.',
    descripcionCompleta: 'El compañero de muñeca definitivo para deportistas y ejecutivos. Monitorea tu frecuencia cardíaca, saturación de oxígeno SpO2, variabilidad HRV, niveles de estrés y sueño profundo. Batería de hasta 14 días en uso normal.',
    beneficios: [
      'Resistente al agua hasta 5 ATM (natación en piscina y aguas abiertas)',
      'Compatible con iOS y Android mediante la app oficial X-Sync',
      'Permite responder llamadas directamente desde el reloj con altavoz HD',
      'Más de 100 modos deportivos con reconocimiento automático'
    ],
    precio: 1420,
    precioAnterior: 1650,
    descuento: 14,
    imagenes: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544117518-30df578096a4?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-wearables',
    categoriaNombre: 'Smartwatches & Wearables',
    marca: 'X-WEAR',
    variantes: [
      { id: 'v4-1', sku: 'XC-WAT-CHRONO-X-46-BLK', name: '46mm Correa Silicona Deportiva', attributeName: 'Modelo', attributeValue: '46mm Silicona', priceModifier: 0, stock: 14 },
      { id: 'v4-2', sku: 'XC-WAT-CHRONO-X-46-LEA', name: '46mm Correa Cuero Café Italiano', attributeName: 'Modelo', attributeValue: '46mm Cuero', priceModifier: 120, stock: 6 },
    ],
    stockTotal: 20,
    stockReservado: 1,
    stockMinimo: 3,
    estado: 'NUEVO',
    rating: 4.7,
    reviewsCount: 15,
    isDemo: true,
    createdAt: '2025-01-25T15:00:00.000Z',
    updatedAt: '2025-02-12T11:20:00.000Z',
  },
  {
    id: 'prod-005',
    sku: 'XC-ACC-GAN100W',
    nombre: 'Cargador Rápido GaN X-Power 100W 4-Port (DEMO)',
    slug: 'cargador-rapido-gan-x-power-100w',
    descripcionCorta: 'Tecnología Nitruro de Galio, 3 puertos USB-C PD 3.0 + 1 USB-A, ultra compacto.',
    descripcionCompleta: 'Reemplaza todos tus cargadores pesados con un solo dispositivo del tamaño de una tarjeta de crédito. Capaz de cargar simultáneamente tu laptop, smartphone, tablet y auriculares con distribución inteligente de potencia.',
    beneficios: [
      'Protección avanzada contra sobrevoltaje, cortocircuito y sobrecalentamiento',
      'Compatible con Power Delivery, Quick Charge 4.0 y PPS de Samsung',
      'Enchufe retráctil ideal para viajes internacionales',
      'Incluye cable trenzado de 100W USB-C a USB-C de 1.5 metros'
    ],
    precio: 320,
    precioAnterior: 390,
    descuento: 18,
    imagenes: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1622445262464-84b1456045b6?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-gadgets',
    categoriaNombre: 'Accesorios & Gadgets X',
    marca: 'X-TECH',
    stockTotal: 40,
    stockReservado: 0,
    stockMinimo: 8,
    estado: 'ACTIVO',
    rating: 4.9,
    reviewsCount: 42,
    isDemo: true,
    createdAt: '2025-01-10T10:00:00.000Z',
    updatedAt: '2025-02-01T10:00:00.000Z',
  },
  {
    id: 'prod-006',
    sku: 'XC-CAM-STREAM4K',
    nombre: 'Webcam X-Vision 4K Pro HDR con Anillo de Luz (DEMO)',
    slug: 'webcam-x-vision-4k-pro-hdr',
    descripcionCorta: 'Sensor Sony Starvis 4K 60FPS, autofoco por láser ToF, micrófono dual con IA.',
    descripcionCompleta: 'Lleva tus videoconferencias de trabajo, clases virtuales y streams en vivo al nivel profesional. Anillo de iluminación LED con temperatura de color regulable y tapa de privacidad magnética física.',
    beneficios: [
      'Calidad de imagen cristalina en ambientes de poca iluminación',
      'Montura universal para monitores, laptops o trípodes estándar',
      'Plug & Play en Windows, macOS y Linux sin controladores adicionales',
      'Cancelación de ruido ambiental por IA en los micrófonos'
    ],
    precio: 680,
    precioAnterior: 790,
    descuento: 14,
    imagenes: [
      'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-gadgets',
    categoriaNombre: 'Accesorios & Gadgets X',
    marca: 'X-VISION',
    stockTotal: 15,
    stockReservado: 2,
    stockMinimo: 3,
    estado: 'NUEVO',
    rating: 4.8,
    reviewsCount: 16,
    isDemo: true,
    createdAt: '2025-01-28T09:00:00.000Z',
    updatedAt: '2025-02-14T08:00:00.000Z',
  },
  {
    id: 'prod-007',
    sku: 'XC-AUD-PRO-ANC',
    nombre: 'Audífonos In-Ear X-Pro Wireless ANC (Edición Limitada)',
    slug: 'audifonos-in-ear-x-pro-wireless-anc',
    descripcionCorta: 'Cancelación activa de ruido híbrida de 45dB, audio espacial 360°, drivers de grafeno y estuche de carga Qi.',
    descripcionCompleta: 'La cúspide del sonido portátil inalámbrico para melómanos y deportistas en Bolivia. Desarrollados con diafragmas de grafeno de 11mm para bajos profundos y agudos nítidos sin distorsión. Modos de transparencia ambiental adaptativa para trotar seguro en la calle.',
    beneficios: [
      'Cancelación de ruido activa híbrida hasta 45dB con 6 micrófonos beamforming',
      'Hasta 32 horas de batería total con el estuche de recarga rápida inalámbrica Qi',
      'Certificación IPX7 resistente a sudor intenso y lluvia andina',
      'Latencia ultrabaja de 38ms especial para gaming y video streaming'
    ],
    precio: 620,
    precioAnterior: 750,
    descuento: 17,
    imagenes: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-audio',
    categoriaNombre: 'Audio & Auriculares Hi-Fi',
    marca: 'X-AUDIO',
    stockTotal: 0,
    stockReservado: 0,
    stockMinimo: 5,
    estado: 'AGOTADO',
    rating: 4.9,
    reviewsCount: 28,
    isDemo: true,
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-03-25T10:00:00.000Z',
  },
  {
    id: 'prod-apparel-001',
    sku: 'FX-APP-POL-PIMA',
    nombre: 'Polera Oficial Factor X Pro Team (Algodón Pima)',
    slug: 'polera-oficial-factor-x-pro-team',
    descripcionCorta: 'Confeccionada en 100% Algodón Pima peinado de alta densidad, corte ergonómico y serigrafía de alta durabilidad.',
    descripcionCompleta: 'La polera oficial para socios, distribuidores y líderes Factor X Company. Diseñada con un calce regular estilizado que brinda máxima frescura y confort durante jornadas de presentación y eventos. Algodón peruano Pima de fibra extra larga, prelavado y preencogido para conservar su forma tras múltiples lavadas.',
    beneficios: [
      '100% Algodón Pima premium transpirable y suave al tacto',
      'Costuras reforzadas en hombros y cuello para mayor durabilidad',
      'Logo bordado Factor X en el pecho y manga izquierda',
      'Tallas estándar con guía de medidas precisa'
    ],
    especificaciones: {
      'Material': '100% Algodón Pima Peinado 50/1',
      'Gramaje': '180 g/m² alta densidad',
      'Corte': 'Regular Fit Ergonómico',
      'Origen': 'Confección premium para Bolivia',
      'Cuidados': 'Lavar en frío a mano o ciclo delicado, no usar lejía',
    },
    precio: 140,
    precioAnterior: 175,
    descuento: 20,
    imagenes: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-clothing',
    categoriaNombre: 'Indumentaria & Ropa Oficial',
    marca: 'FACTOR X APPAREL',
    variantes: [
      { id: 'v-pol-s', sku: 'FX-APP-POL-S', name: 'Talla S (Pecho 91-96cm)', attributeName: 'Talla', attributeValue: 'S', priceModifier: 0, stock: 15 },
      { id: 'v-pol-m', sku: 'FX-APP-POL-M', name: 'Talla M (Pecho 97-102cm)', attributeName: 'Talla', attributeValue: 'M', priceModifier: 0, stock: 25 },
      { id: 'v-pol-l', sku: 'FX-APP-POL-L', name: 'Talla L (Pecho 103-108cm)', attributeName: 'Talla', attributeValue: 'L', priceModifier: 0, stock: 20 },
      { id: 'v-pol-xl', sku: 'FX-APP-POL-XL', name: 'Talla XL (Pecho 109-115cm)', attributeName: 'Talla', attributeValue: 'XL', priceModifier: 10, stock: 12 },
      { id: 'v-pol-xxl', sku: 'FX-APP-POL-XXL', name: 'Talla XXL (Pecho 116-122cm)', attributeName: 'Talla', attributeValue: 'XXL', priceModifier: 15, stock: 8 },
    ],
    stockTotal: 80,
    stockReservado: 2,
    stockMinimo: 10,
    estado: 'DESTACADO',
    destacado: true,
    rating: 4.9,
    reviewsCount: 38,
    isDemo: true,
    factorPuntos: 8,
    createdAt: '2026-01-15T12:00:00.000Z',
    updatedAt: '2026-03-20T10:00:00.000Z',
  },
  {
    id: 'prod-apparel-002',
    sku: 'FX-APP-WIND-JKT',
    nombre: 'Chaqueta Cortavientos Factor X Rumbo a la Excelencia',
    slug: 'chaqueta-cortavientos-factor-x',
    descripcionCorta: 'Tejido técnico impermeable repelente al agua, capucha oculta, cierre sellado y forro respirable.',
    descripcionCompleta: 'Prenda de alto rendimiento diseñada para resistir el viento y bajas temperaturas en las ciudades de altura (La Paz, El Alto, Potosí) y viajes corporativos. Incluye bolsillos con cierre hermético y cordones de ajuste inferior.',
    beneficios: [
      'Membrana técnica WindProof impermeable 5.000 mm',
      'Forro interno micropolar antitranspirante',
      'Bolsillos laterales y bolsillo interno de seguridad para celular',
      'Garantía de ajuste con tabla de conversión de tallas oficial'
    ],
    especificaciones: {
      'Impermeabilidad': '5.000 mm columna de agua',
      'Material Exterior': '100% Poliéster Ripstop Antidesgarro',
      'Forro': 'Malla Micro-Mesh Respirable',
      'Ajuste': 'Cordón elástico en cintura y puños con velcro',
    },
    precio: 290,
    precioAnterior: 340,
    descuento: 15,
    imagenes: [
      'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-clothing',
    categoriaNombre: 'Indumentaria & Ropa Oficial',
    marca: 'FACTOR X APPAREL',
    variantes: [
      { id: 'v-jkt-s', sku: 'FX-APP-JKT-S', name: 'Talla S (Pecho 94-99cm)', attributeName: 'Talla', attributeValue: 'S', priceModifier: 0, stock: 10 },
      { id: 'v-jkt-m', sku: 'FX-APP-JKT-M', name: 'Talla M (Pecho 100-105cm)', attributeName: 'Talla', attributeValue: 'M', priceModifier: 0, stock: 18 },
      { id: 'v-jkt-l', sku: 'FX-APP-JKT-L', name: 'Talla L (Pecho 106-112cm)', attributeName: 'Talla', attributeValue: 'L', priceModifier: 0, stock: 14 },
      { id: 'v-jkt-xl', sku: 'FX-APP-JKT-XL', name: 'Talla XL (Pecho 113-120cm)', attributeName: 'Talla', attributeValue: 'XL', priceModifier: 20, stock: 8 },
    ],
    stockTotal: 50,
    stockReservado: 1,
    stockMinimo: 6,
    estado: 'NUEVO',
    destacado: true,
    rating: 4.8,
    reviewsCount: 22,
    isDemo: true,
    factorPuntos: 15,
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-03-22T10:00:00.000Z',
  },
  {
    id: 'prod-apparel-003',
    sku: 'FX-APP-CAP-BLK',
    nombre: 'Gorra Snapback Factor X Black Edition (Ajustable)',
    slug: 'gorra-snapback-factor-x-black',
    descripcionCorta: 'Visera plana estructurada, corona alta, broche ajustable de 7 puntos y bordado 3D de alta densidad.',
    descripcionCompleta: 'Accesorio urbano oficial con diseño unisex. Fabricada en sarga de algodón y poliéster con banda interior absorbente de sudor. Ajuste universal de 54 a 61 cm de circunferencia craneal.',
    beneficios: [
      'Broche trasero snapback regulable para cualquier diámetro de cabeza',
      'Bordado 3D frontal con relieve del isotipo Factor X',
      'Banda interior antisudor de rápida evaporación'
    ],
    especificaciones: {
      'Talla': 'Universal Ajustable (54 a 61 cm)',
      'Material': '80% Acrílico / 20% Lana peinada',
      'Visera': 'Plana de 6 costuras con sticker holográfico',
    },
    precio: 95,
    precioAnterior: 120,
    descuento: 21,
    imagenes: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-clothing',
    categoriaNombre: 'Indumentaria & Ropa Oficial',
    marca: 'FACTOR X APPAREL',
    stockTotal: 40,
    stockReservado: 0,
    stockMinimo: 5,
    estado: 'ACTIVO',
    rating: 4.9,
    reviewsCount: 19,
    isDemo: true,
    factorPuntos: 5,
    createdAt: '2026-02-10T10:00:00.000Z',
    updatedAt: '2026-03-22T10:00:00.000Z',
  },
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-001',
    codigo: 'SHOPTHEX',
    tipo: 'PORCENTAJE',
    valor: 10,
    montoMinimoCompra: 200,
    fechaInicio: '2025-01-01',
    fechaFin: '2026-12-31',
    usoMaximo: 500,
    usosActuales: 43,
    usoPorCliente: 1,
    activo: true,
    descripcion: '10% de descuento de bienvenida en compras mayores a 200 Bs.',
  },
  {
    id: 'coup-002',
    codigo: 'BOLIVIA50',
    tipo: 'MONTO_FIJO',
    valor: 50,
    montoMinimoCompra: 500,
    fechaInicio: '2025-01-01',
    fechaFin: '2026-12-31',
    usoMaximo: 200,
    usosActuales: 29,
    usoPorCliente: 1,
    activo: true,
    descripcion: '50 Bs. de regalo en compras superiores a 500 Bs.',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-001',
    numeroPedido: 'XC-2025-0101',
    clienteId: 'user_cust_01',
    clienteNombre: 'Carlos',
    clienteApellido: 'Mamani Gutierrez',
    clienteEmail: 'carlos.cliente@example.com',
    clienteTelefono: '+591 71543210',
    clienteWhatsapp: '59171543210',
    departamento: 'La Paz',
    ciudad: 'La Paz',
    zona: 'Sopocachi',
    direccion: 'Calle Ecuador #2145, Edif. Illimani Piso 4',
    referencia: 'Frente a la plaza España',
    metodoEntregaId: 'deliv-local',
    metodoEntregaNombre: 'Envío Express Local (Mismo día)',
    costoEnvio: 15,
    items: [
      {
        productoId: 'prod-002',
        sku: 'XC-AUD-XSILENCE-SLV',
        nombre: 'Auriculares X-Silence Wireless ANC (DEMO)',
        imagen: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
        precioUnitario: 950,
        cantidad: 1,
        varianteId: 'v2-1',
        varianteNombre: 'Plata Lunar',
        subtotal: 950,
      },
    ],
    subtotal: 950,
    descuentoCupon: 95,
    codigoCupon: 'SHOPTHEX',
    total: 870,
    moneda: 'BOB',
    metodoPago: 'QR_SIMPLE',
    estadoPago: 'CONFIRMADO',
    comprobante: {
      id: 'proof-001',
      numeroOperacion: 'OP-BCP-984210',
      fechaPago: '2025-02-10 14:22',
      comprobanteUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop',
      comprobanteNombre: 'comprobante_bcp_carlos.jpg',
      observacion: 'Pago recibido correctamente mediante QR Simple',
      subidoPorUsuario: 'Carlos Mamani Gutierrez',
      revisadoPor: 'Jorge Flores (Recepción)',
      fechaRevision: '2025-02-10 14:40',
    },
    estado: 'PREPARANDO',
    historialEstados: [
      {
        id: 'hist-1',
        fecha: '2025-02-10',
        hora: '14:15',
        usuario: 'Carlos Mamani',
        estadoAnterior: 'NUEVO',
        estadoNuevo: 'PAGO_PENDIENTE',
        observacion: 'Pedido creado desde tienda web',
      },
      {
        id: 'hist-2',
        fecha: '2025-02-10',
        hora: '14:25',
        usuario: 'Carlos Mamani',
        estadoAnterior: 'PAGO_PENDIENTE',
        estadoNuevo: 'PAGO_EN_REVISION',
        observacion: 'Comprobante QR cargado por el cliente con Nro de Operación OP-BCP-984210',
      },
      {
        id: 'hist-3',
        fecha: '2025-02-10',
        hora: '14:40',
        usuario: 'Jorge Flores (Recepción)',
        estadoAnterior: 'PAGO_EN_REVISION',
        estadoNuevo: 'PAGO_CONFIRMADO',
        observacion: 'Transferencia confirmada en cuenta BCP',
      },
      {
        id: 'hist-4',
        fecha: '2025-02-10',
        hora: '15:10',
        usuario: 'Jorge Flores (Recepción)',
        estadoAnterior: 'PAGO_CONFIRMADO',
        estadoNuevo: 'PREPARANDO',
        observacion: 'Orden enviada a embalaje y revisión técnica',
      },
    ],
    createdAt: '2025-02-10T14:15:00.000Z',
    updatedAt: '2025-02-10T15:10:00.000Z',
  },
  {
    id: 'ord-002',
    numeroPedido: 'XC-2025-0102',
    clienteId: 'user_cust_02',
    clienteNombre: 'Andrea',
    clienteApellido: 'Suarez Roca',
    clienteEmail: 'andrea.scz@example.com',
    clienteTelefono: '+591 78998877',
    clienteWhatsapp: '59178998877',
    vendedorId: 'user_seller_01',
    vendedorNombre: 'Valentina Rios (Vendedor)',
    departamento: 'Santa Cruz',
    ciudad: 'Santa Cruz de la Sierra',
    zona: 'Equipetrol',
    direccion: 'Calle Los Cusis #320',
    referencia: 'A dos cuadras del Mall Las Brisas',
    metodoEntregaId: 'deliv-nac',
    metodoEntregaNombre: 'Envío Nacional Courier Interdepartamental',
    costoEnvio: 35,
    items: [
      {
        productoId: 'prod-001',
        sku: 'XC-PH-TITAN15-256G-BLK',
        nombre: 'X-Phone Pro Titan 5G (DEMO)',
        imagen: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800&auto=format&fit=crop',
        precioUnitario: 4890,
        cantidad: 1,
        varianteId: 'v1-1',
        varianteNombre: 'Negro Titanio - 256GB',
        subtotal: 4890,
      },
      {
        productoId: 'prod-005',
        sku: 'XC-ACC-GAN100W',
        nombre: 'Cargador Rápido GaN X-Power 100W 4-Port (DEMO)',
        imagen: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=800&auto=format&fit=crop',
        precioUnitario: 320,
        cantidad: 1,
        subtotal: 320,
      },
    ],
    subtotal: 5210,
    descuentoCupon: 50,
    codigoCupon: 'BOLIVIA50',
    total: 5195,
    moneda: 'BOB',
    metodoPago: 'TRANSFERENCIA_BANCARIA',
    estadoPago: 'CONFIRMADO',
    estado: 'ENVIADO',
    historialEstados: [
      {
        id: 'h2-1',
        fecha: '2025-02-08',
        hora: '10:00',
        usuario: 'Valentina Rios (Vendedor)',
        estadoAnterior: 'NUEVO',
        estadoNuevo: 'PAGO_CONFIRMADO',
        observacion: 'Pedido asistido por vendedor y verificado en ventanilla',
      },
      {
        id: 'h2-2',
        fecha: '2025-02-08',
        hora: '16:00',
        usuario: 'Jorge Flores (Recepción)',
        estadoAnterior: 'PAGO_CONFIRMADO',
        estadoNuevo: 'ENVIADO',
        observacion: 'Despachado vía Courier Expreso Bolivia Guía #BOL-9921',
      },
    ],
    createdAt: '2025-02-08T10:00:00.000Z',
    updatedAt: '2025-02-08T16:00:00.000Z',
  },
  {
    id: 'ord-003',
    numeroPedido: 'XC-2025-0090',
    clienteId: 'user_cust_01',
    clienteNombre: 'Carlos',
    clienteApellido: 'Mamani Gutierrez',
    clienteEmail: 'carlos.cliente@example.com',
    clienteTelefono: '+591 71543210',
    clienteWhatsapp: '59171543210',
    departamento: 'La Paz',
    ciudad: 'La Paz',
    zona: 'Sopocachi',
    direccion: 'Calle Ecuador #2145, Edif. Illimani Piso 4',
    referencia: 'Frente a la plaza España',
    metodoEntregaId: 'deliv-local',
    metodoEntregaNombre: 'Envío Express Local (Mismo día)',
    costoEnvio: 15,
    items: [
      {
        productoId: 'prod-004',
        sku: 'XC-WAT-HORIZON2-46-SLV',
        nombre: 'Smartwatch X-Horizon 2 Ultra AMOLED (DEMO)',
        imagen: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
        precioUnitario: 1450,
        cantidad: 1,
        varianteId: 'v4-1',
        varianteNombre: 'Titanio Natural 46mm',
        subtotal: 1450,
      },
      {
        productoId: 'prod-005',
        sku: 'XC-ACC-GAN100W',
        nombre: 'Cargador Rápido GaN X-Power 100W 4-Port (DEMO)',
        imagen: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=800&auto=format&fit=crop',
        precioUnitario: 320,
        cantidad: 1,
        subtotal: 320,
      },
    ],
    subtotal: 1770,
    descuentoCupon: 50,
    codigoCupon: 'BOLIVIA50',
    total: 1735,
    moneda: 'BOB',
    metodoPago: 'QR_SIMPLE',
    estadoPago: 'CONFIRMADO',
    estado: 'ENTREGADO',
    historialEstados: [
      {
        id: 'h3-1',
        fecha: '2025-01-20',
        hora: '11:00',
        usuario: 'Carlos Mamani',
        estadoAnterior: 'NUEVO',
        estadoNuevo: 'PAGO_CONFIRMADO',
        observacion: 'Pago confirmado por QR Simple',
      },
      {
        id: 'h3-2',
        fecha: '2025-01-21',
        hora: '14:30',
        usuario: 'Courier Local Express',
        estadoAnterior: 'EN_CAMINO',
        estadoNuevo: 'ENTREGADO',
        observacion: 'Entregado a cliente en Sopocachi con firma digital y comprobante',
      },
    ],
    createdAt: '2025-01-20T11:00:00.000Z',
    updatedAt: '2025-01-21T14:30:00.000Z',
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    titulo: '¡Bienvenido a X-CRISPIN Bolivia!',
    mensaje: 'Explora el catálogo oficial SHOP THE X con garantía en Bolivia y pagos seguros por QR Simple.',
    tipo: 'SISTEMA',
    leida: false,
    fecha: '2025-02-15T08:00:00.000Z',
  },
  {
    id: 'notif-2',
    titulo: 'Pago Confirmado: Pedido #XC-2025-0101',
    mensaje: 'Tu comprobante de pago QR Simple fue aprobado exitosamente. Tu pedido se encuentra en preparación.',
    tipo: 'PAGO',
    leida: false,
    fecha: '2025-02-10T14:40:00.000Z',
    pedidoId: 'XC-2025-0101',
  },
];

export const INITIAL_REVIEWS: ProductReview[] = [
  {
    id: 'rev-001',
    productoId: 'prod-001',
    usuarioId: 'user_cust_01',
    usuarioNombre: 'Carlos Mamani',
    usuarioCiudad: 'La Paz',
    calificacion: 5,
    titulo: 'Excelente terminal, velocidad insuperable',
    comentario: 'Llegó en menos de 24 horas a Sopocachi. La pantalla OLED y la cámara 108MP superaron mis expectativas. Compatible 100% con 5G de Entel y Tigo en La Paz.',
    recomienda: true,
    compraVerificada: true,
    orderNumber: 'XC-2025-0102',
    votosUtiles: 14,
    aprobado: true,
    createdAt: '2025-02-11T16:20:00.000Z',
  },
  {
    id: 'rev-002',
    productoId: 'prod-002',
    usuarioId: 'user_cust_02',
    usuarioNombre: 'Andrea Suarez',
    usuarioCiudad: 'Santa Cruz de la Sierra',
    calificacion: 5,
    titulo: 'Cancelación de ruido perfecta para viajes',
    comentario: 'La batería rinde las 40 horas prometidas. Muy cómodos para trabajar largas horas sin dolor de cabeza en el calor de Santa Cruz.',
    recomienda: true,
    compraVerificada: true,
    orderNumber: 'XC-2025-0101',
    votosUtiles: 19,
    aprobado: true,
    createdAt: '2025-02-09T18:00:00.000Z',
  },
  {
    id: 'rev-003',
    productoId: 'prod-004',
    usuarioId: 'user_cust_01',
    usuarioNombre: 'Carlos Mamani',
    usuarioCiudad: 'La Paz',
    calificacion: 5,
    titulo: 'Precisión impecable del sensor cardíaco y GPS en altura',
    comentario: 'Lo utilizo para correr en Achumani y la Cota Cota. El GPS satelital de doble banda marca el recorrido exacto y la pantalla se ve con sol radiante.',
    recomienda: true,
    compraVerificada: true,
    orderNumber: 'XC-2025-0103',
    votosUtiles: 8,
    aprobado: true,
    createdAt: '2025-02-14T09:15:00.000Z',
  },
  {
    id: 'rev-004',
    productoId: 'prod-005',
    usuarioId: 'user_cust_01',
    usuarioNombre: 'Carlos Mamani',
    usuarioCiudad: 'La Paz',
    calificacion: 5,
    titulo: 'Carga mi laptop y celular al mismo tiempo sin calentarse',
    comentario: 'Tamaño super compacto para llevar en el maletín. La tecnología GaN realmente marca la diferencia en peso y disipación de calor.',
    recomienda: true,
    compraVerificada: true,
    orderNumber: 'XC-2025-0101',
    votosUtiles: 11,
    aprobado: true,
    createdAt: '2025-02-12T14:30:00.000Z',
  },
  {
    id: 'rev-005',
    productoId: 'prod-fx-clnxx',
    usuarioId: 'user_cust_03',
    usuarioNombre: 'Mariana Gutierrez',
    usuarioCiudad: 'Cochabamba',
    calificacion: 5,
    titulo: 'Alivio digestivo desde el primer sachet, sabor delicioso',
    comentario: 'La pitahaya y ciruela liofilizadas funcionan de maravilla. En dos días sentí una desinflamación abdominal notable. 100% recomendado.',
    recomienda: true,
    compraVerificada: true,
    orderNumber: 'XC-2025-0098',
    votosUtiles: 23,
    aprobado: true,
    createdAt: '2025-02-05T11:00:00.000Z',
  },
  {
    id: 'rev-006',
    productoId: 'prod-apparel-001',
    usuarioId: 'user_cust_01',
    usuarioNombre: 'Carlos Mamani',
    usuarioCiudad: 'La Paz',
    calificacion: 5,
    titulo: 'Calce perfecto siguiendo la Guía de Tallas (Talla L)',
    comentario: 'El algodón Pima es sumamente suave y fresco. Utilicé la guía de tallas de la web y el calce al pecho quedó exacto sin encoger al lavar.',
    recomienda: true,
    compraVerificada: true,
    orderNumber: 'XC-2025-0101',
    votosUtiles: 16,
    aprobado: true,
    createdAt: '2025-02-18T10:20:00.000Z',
  },
];

export const INITIAL_MOVEMENTS: InventoryMovement[] = [
  {
    id: 'mov-001',
    productoId: 'prod-001',
    productoNombre: 'X-Phone Pro Titan 5G',
    cantidad: 20,
    tipo: 'ENTRADA',
    stockAnterior: 0,
    stockNuevo: 20,
    usuario: 'Administrador X-CRISPIN',
    motivo: 'Recepción lote importación inicial #IMP-BO-001',
    fecha: '2025-01-15 09:00',
  },
  {
    id: 'mov-002',
    productoId: 'prod-001',
    productoNombre: 'X-Phone Pro Titan 5G',
    cantidad: -1,
    tipo: 'RESERVA',
    stockAnterior: 20,
    stockNuevo: 19,
    usuario: 'Sistema Checkout',
    motivo: 'Reserva automática por pedido #XC-2025-0102',
    pedidoId: 'XC-2025-0102',
    fecha: '2025-02-08 10:00',
  },
];

// Helper methods with reactive storage
class StorageService {
  private listeners: Set<() => void> = new Set();

  private get<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return fallback;
      return JSON.parse(data) as T;
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return fallback;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
    } catch (e) {
      console.error(`Error writing ${key} to storage:`, e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // Initialization
  public initialize() {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.set(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      this.set(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      this.set(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVENTORY_MOVEMENTS)) {
      this.set(STORAGE_KEYS.INVENTORY_MOVEMENTS, INITIAL_MOVEMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COUPONS)) {
      this.set(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STORE_CONFIG)) {
      this.set(STORAGE_KEYS.STORE_CONFIG, DEFAULT_CONFIG);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      this.set(STORAGE_KEYS.CURRENT_USER, DEMO_USERS[0]); // Customer by default
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      this.set(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
      this.set(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRICE_ALERTS)) {
      this.set(STORAGE_KEYS.PRICE_ALERTS, INITIAL_PRICE_ALERTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOYALTY_TRANSACTIONS)) {
      this.set(STORAGE_KEYS.LOYALTY_TRANSACTIONS, INITIAL_LOYALTY_TRANSACTIONS);
    }
  }

  // Reset to factory demo
  public resetToDemo() {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.INVENTORY_MOVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.COUPONS);
    localStorage.removeItem(STORAGE_KEYS.STORE_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.WISHLIST);
    localStorage.removeItem(STORAGE_KEYS.PRICE_ALERTS);
    localStorage.removeItem(STORAGE_KEYS.LOYALTY_TRANSACTIONS);
    this.initialize();
    this.notify();
  }

  // Products
  public getProducts(): Product[] {
    const list = this.get(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const existingIds = new Set(list.map((p) => p.id));
    let modified = false;
    for (const initProd of INITIAL_PRODUCTS) {
      if (!existingIds.has(initProd.id)) {
        list.push(initProd);
        modified = true;
      }
    }
    // Migration: Ensure existing products in health/supplements area use cat-fx-salud-bienestar & have subcategories
    const initProdMap = new Map(INITIAL_PRODUCTS.map((p) => [p.id, p]));
    for (const p of list) {
      if (p.categoriaId === 'cat-fx-suplementos') {
        p.categoriaId = 'cat-fx-salud-bienestar';
        p.categoriaNombre = 'Salud & Bienestar';
        p.linea = 'Salud & Bienestar';
        modified = true;
      }
      const initialMatch = initProdMap.get(p.id);
      if (initialMatch && initialMatch.subcategoriaId && !p.subcategoriaId) {
        p.subcategoriaId = initialMatch.subcategoriaId;
        p.subcategoriaNombre = initialMatch.subcategoriaNombre;
        modified = true;
      }
    }
    if (modified) {
      this.set(STORAGE_KEYS.PRODUCTS, list);
    }
    return list;
  }

  public saveProducts(products: Product[]): void {
    const prevProducts = this.get<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const prevMap = new Map(prevProducts.map((p) => [p.id, p]));

    this.set(STORAGE_KEYS.PRODUCTS, products);
    apiCacheService.invalidateByTag('products');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('xc_products_mutation', { detail: products }));
    }

    // Trigger price drop alerts if prices dropped
    this.checkPriceDropAlerts(products, prevMap);
  }

  // Categories
  public getCategories(): Category[] {
    const list = this.get(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const existingIds = new Set(list.map((c) => c.id));
    let modified = false;
    for (const initCat of INITIAL_CATEGORIES) {
      if (!existingIds.has(initCat.id)) {
        list.push(initCat);
        modified = true;
      }
    }
    // Migration: Update cat-fx-suplementos to cat-fx-salud-bienestar & sync subcategories
    const initCatMap = new Map(INITIAL_CATEGORIES.map((c) => [c.id, c]));
    for (const c of list) {
      if (c.id === 'cat-fx-suplementos') {
        c.id = 'cat-fx-salud-bienestar';
        c.nombre = 'Salud & Bienestar';
        c.slug = 'salud-bienestar';
        c.descripcion = 'Nutrición botánica, antioxidantes celulares, moringa liofilizada en caja, omegas puros y protectores hepáticos.';
        c.icono = 'HeartPulse';
        modified = true;
      }
      const initialMatch = initCatMap.get(c.id);
      if (initialMatch && initialMatch.subcategorias && (!c.subcategorias || c.subcategorias.length === 0)) {
        c.subcategorias = initialMatch.subcategorias;
        modified = true;
      }
    }
    if (modified) {
      this.set(STORAGE_KEYS.CATEGORIES, list);
    }
    return list;
  }

  public saveCategories(categories: Category[]): void {
    this.set(STORAGE_KEYS.CATEGORIES, categories);
    apiCacheService.invalidateByTag('categories');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('xc_categories_mutation', { detail: categories }));
    }
  }

  // Orders
  public getOrders(): Order[] {
    const list = this.get(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const existingIds = new Set(list.map((o) => o.id));
    let modified = false;
    for (const initOrder of INITIAL_ORDERS) {
      if (!existingIds.has(initOrder.id)) {
        list.push(initOrder);
        modified = true;
      }
    }
    if (modified) {
      this.set(STORAGE_KEYS.ORDERS, list);
    }
    return list;
  }

  public saveOrders(orders: Order[]): void {
    this.set(STORAGE_KEYS.ORDERS, orders);
  }

  // Inventory Movements
  public getMovements(): InventoryMovement[] {
    return this.get(STORAGE_KEYS.INVENTORY_MOVEMENTS, INITIAL_MOVEMENTS);
  }

  public saveMovements(movements: InventoryMovement[]): void {
    this.set(STORAGE_KEYS.INVENTORY_MOVEMENTS, movements);
  }

  // Coupons
  public getCoupons(): Coupon[] {
    return this.get(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
  }

  public saveCoupons(coupons: Coupon[]): void {
    this.set(STORAGE_KEYS.COUPONS, coupons);
  }

  // Config
  public getConfig(): StoreConfig {
    const config = this.get<StoreConfig>(STORAGE_KEYS.STORE_CONFIG, DEFAULT_CONFIG);
    if (config && (config.whatsapp === '59178901234' || config.telefono === '+591 78901234')) {
      const updated = {
        ...config,
        whatsapp: '59172902338',
        telefono: '+591 72902338',
      };
      this.saveConfig(updated);
      return updated;
    }
    return config;
  }

  public saveConfig(config: StoreConfig): void {
    this.set(STORAGE_KEYS.STORE_CONFIG, config);
  }

  // Current User / Role
  public getCurrentUser(): User {
    return this.get(STORAGE_KEYS.CURRENT_USER, DEMO_USERS[0]);
  }

  public setCurrentUser(user: User): void {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
  }

  // Notifications
  public getNotifications(): AppNotification[] {
    const list = this.get(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const seenIds = new Set<string>();
    const uniqueList: AppNotification[] = [];
    let wasCleaned = false;

    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      let id = item.id;
      if (!id || seenIds.has(id)) {
        id = `${id || 'notif'}-${i}-${Math.random().toString(36).substring(2, 7)}`;
        item.id = id;
        wasCleaned = true;
      }
      seenIds.add(id);
      uniqueList.push(item);
    }

    if (wasCleaned) {
      this.set(STORAGE_KEYS.NOTIFICATIONS, uniqueList);
    }
    return uniqueList;
  }

  public saveNotifications(notifs: AppNotification[]): void {
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  public addNotification(notif: Omit<AppNotification, 'id' | 'fecha'> & { id?: string; fecha?: string }): AppNotification {
    const list = this.getNotifications();
    const newNotif: AppNotification = {
      id: notif.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      titulo: notif.titulo,
      mensaje: notif.mensaje,
      tipo: notif.tipo || 'SISTEMA',
      leida: notif.leida || false,
      fecha: notif.fecha || new Date().toISOString(),
      enlace: notif.enlace,
      pedidoId: notif.pedidoId,
      productoSlug: notif.productoSlug,
      productoId: notif.productoId,
    };
    const updated = [newNotif, ...list].slice(0, 50);
    this.saveNotifications(updated);
    return newNotif;
  }

  // Reviews
  public getReviews(): ProductReview[] {
    return this.get(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  }

  public saveReviews(reviews: ProductReview[]): void {
    this.set(STORAGE_KEYS.REVIEWS, reviews);
  }

  // Wishlist - Per user account profile persistence
  public getWishlist(userId?: string): string[] {
    const user = this.getCurrentUser();
    const effectiveUserId = userId || user?.id;
    if (user && user.id === effectiveUserId && Array.isArray(user.wishlist)) {
      return user.wishlist;
    }
    if (effectiveUserId) {
      const perUserKey = `${STORAGE_KEYS.WISHLIST}_${effectiveUserId}`;
      const saved = this.get<string[] | null>(perUserKey, null);
      if (saved && Array.isArray(saved)) return saved;
    }
    return this.get(STORAGE_KEYS.WISHLIST, user?.wishlist || ['prod-fx-001', 'prod-001']);
  }

  public setWishlist(wishlist: string[], userId?: string): void {
    const user = this.getCurrentUser();
    const effectiveUserId = userId || user?.id;
    if (effectiveUserId) {
      const perUserKey = `${STORAGE_KEYS.WISHLIST}_${effectiveUserId}`;
      this.set(perUserKey, wishlist);
    }
    this.set(STORAGE_KEYS.WISHLIST, wishlist);
    if (user && (!userId || user.id === userId)) {
      const updatedUser: User = { ...user, wishlist };
      this.setCurrentUser(updatedUser);
    }
  }

  public toggleWishlist(productId: string, userId?: string): string[] {
    const list = this.getWishlist(userId);
    const next = list.includes(productId)
      ? list.filter((id) => id !== productId)
      : [...list, productId];
    this.setWishlist(next, userId);
    return next;
  }

  // Shared Public Wishlists for Gifting & Friends
  public getSharedWishlists(): SharedWishlist[] {
    const initialList: SharedWishlist[] = [
      {
        id: 'WL-CARLOS-2026',
        title: 'Lista de Deseos & Regalos de Carlos (Cumpleaños)',
        ownerId: 'user_cust_01',
        ownerName: 'Carlos Mamani',
        ownerCity: 'La Paz',
        occasion: 'Cumpleaños',
        customMessage: '¡Hola a todos! Para este cumpleaños comparto algunos de mis artículos favoritos de tecnología e indumentaria que me harían muy feliz. ¡Gracias por el cariño!',
        productIds: ['prod-001', 'prod-004', 'prod-apparel-001'],
        items: [
          {
            productId: 'prod-001',
            notes: 'Versión Negro Titanio - Ideal para trabajo y fotos',
            priority: 'HIGH',
          },
          {
            productId: 'prod-004',
            notes: 'Smartwatch para entrenar en La Paz (Correa Silicona)',
            priority: 'HIGH',
            reserved: true,
            reservedBy: 'Andrea S. (Familiar)',
            reservedAt: '2026-03-20T10:00:00.000Z',
          },
          {
            productId: 'prod-apparel-001',
            notes: 'Talla L en Algodón Pima oficial Factor X',
            priority: 'MEDIUM',
          },
        ],
        createdAt: '2026-03-15T12:00:00.000Z',
        updatedAt: '2026-03-20T10:00:00.000Z',
        isPublic: true,
        viewsCount: 24,
      },
    ];
    return this.get(STORAGE_KEYS.SHARED_WISHLISTS, initialList);
  }

  public getSharedWishlist(idOrCode: string): SharedWishlist | null {
    const list = this.getSharedWishlists();
    const clean = idOrCode.trim().toUpperCase();
    return list.find((w) => w.id.toUpperCase() === clean) || null;
  }

  public saveSharedWishlist(wishlist: SharedWishlist): void {
    const list = this.getSharedWishlists();
    const idx = list.findIndex((w) => w.id === wishlist.id);
    if (idx >= 0) {
      list[idx] = wishlist;
    } else {
      list.unshift(wishlist);
    }
    this.set(STORAGE_KEYS.SHARED_WISHLISTS, list);
  }

  public reserveWishlistItem(wishlistId: string, productId: string, reserverName: string): boolean {
    const wishlist = this.getSharedWishlist(wishlistId);
    if (!wishlist) return false;

    const items: SharedWishlistItem[] =
      wishlist.items || wishlist.productIds.map((pid) => ({ productId: pid }));
    const target = items.find((i) => i.productId === productId);
    if (!target) return false;

    target.reserved = true;
    target.reservedBy = reserverName.trim();
    target.reservedAt = new Date().toISOString();

    wishlist.items = items;
    wishlist.updatedAt = new Date().toISOString();
    this.saveSharedWishlist(wishlist);
    return true;
  }

  public unreserveWishlistItem(wishlistId: string, productId: string): boolean {
    const wishlist = this.getSharedWishlist(wishlistId);
    if (!wishlist) return false;

    if (!wishlist.items) return false;
    const target = wishlist.items.find((i) => i.productId === productId);
    if (!target) return false;

    target.reserved = false;
    target.reservedBy = undefined;
    target.reservedAt = undefined;

    wishlist.updatedAt = new Date().toISOString();
    this.saveSharedWishlist(wishlist);
    return true;
  }

  public incrementSharedWishlistViews(wishlistId: string): void {
    const wishlist = this.getSharedWishlist(wishlistId);
    if (wishlist) {
      wishlist.viewsCount = (wishlist.viewsCount || 0) + 1;
      this.saveSharedWishlist(wishlist);
    }
  }

  // Newsletter Subscriptions
  public getNewsletterSubscribers(): Array<{ email: string; date: string; preferences?: string }> {
    return this.get(STORAGE_KEYS.NEWSLETTER, [
      { email: 'contacto@x-crispin.bo', date: '2026-01-15', preferences: 'todas' }
    ]);
  }

  public addNewsletterSubscriber(email: string, preferences: string = 'todas'): { success: boolean; alreadySubscribed: boolean } {
    const normalized = email.trim().toLowerCase();
    const list = this.getNewsletterSubscribers();
    const existing = list.find((sub) => sub.email.toLowerCase() === normalized);
    
    if (existing) {
      return { success: true, alreadySubscribed: true };
    }

    const updated = [
      {
        email: normalized,
        date: new Date().toISOString().split('T')[0],
        preferences,
      },
      ...list,
    ];
    this.set(STORAGE_KEYS.NEWSLETTER, updated);
    return { success: true, alreadySubscribed: false };
  }

  // Recently Viewed Products
  public getRecentlyViewed(): string[] {
    return this.get<string[]>(STORAGE_KEYS.RECENTLY_VIEWED, ['prod-fx-001', 'prod-001', 'prod-fx-002']);
  }

  public addRecentlyViewed(productId: string): string[] {
    if (!productId) return this.getRecentlyViewed();
    const current = this.getRecentlyViewed();
    const filtered = current.filter((id) => id !== productId);
    const updated = [productId, ...filtered].slice(0, 12);
    this.set(STORAGE_KEYS.RECENTLY_VIEWED, updated);
    return updated;
  }

  public removeRecentlyViewed(productId: string): string[] {
    const current = this.getRecentlyViewed();
    const updated = current.filter((id) => id !== productId);
    this.set(STORAGE_KEYS.RECENTLY_VIEWED, updated);
    return updated;
  }

  public clearRecentlyViewed(): void {
    this.set(STORAGE_KEYS.RECENTLY_VIEWED, []);
  }

  // QR & Barcode Scanned Items History
  public getScannedHistory(): ScannedItemHistory[] {
    return this.get<ScannedItemHistory[]>(STORAGE_KEYS.QR_SCAN_HISTORY, INITIAL_SCANNED_HISTORY);
  }

  public saveScannedHistory(history: ScannedItemHistory[]): void {
    this.set(STORAGE_KEYS.QR_SCAN_HISTORY, history);
  }

  public addScannedItem(
    itemData: Omit<ScannedItemHistory, 'id' | 'scannedAt'> & { id?: string; scannedAt?: string }
  ): ScannedItemHistory[] {
    const list = this.getScannedHistory();
    // Filter out previous scan of the same product to place it at the top
    const filtered = list.filter((i) => i.productId !== itemData.productId);
    const newEntry: ScannedItemHistory = {
      id: itemData.id || `scan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: itemData.productId,
      nombre: itemData.nombre,
      slug: itemData.slug,
      sku: itemData.sku,
      precio: itemData.precio,
      imagen: itemData.imagen,
      categoriaNombre: itemData.categoriaNombre,
      rawCode: itemData.rawCode || itemData.sku,
      scannedAt: itemData.scannedAt || new Date().toISOString(),
    };
    const updated = [newEntry, ...filtered].slice(0, 30);
    this.saveScannedHistory(updated);
    return updated;
  }

  public removeScannedItem(id: string): ScannedItemHistory[] {
    const list = this.getScannedHistory();
    const updated = list.filter((i) => i.id !== id);
    this.saveScannedHistory(updated);
    return updated;
  }

  public clearScannedHistory(): void {
    this.saveScannedHistory([]);
  }

  // Price Drop Alerts
  public getPriceAlerts(): PriceDropAlert[] {
    return this.get<PriceDropAlert[]>(STORAGE_KEYS.PRICE_ALERTS, INITIAL_PRICE_ALERTS);
  }

  public savePriceAlerts(alerts: PriceDropAlert[]): void {
    this.set(STORAGE_KEYS.PRICE_ALERTS, alerts);
  }

  public addPriceAlert(
    alertData: Omit<PriceDropAlert, 'id' | 'createdAt' | 'status'> & { id?: string; targetPrice?: number }
  ): { alert: PriceDropAlert; isNew: boolean } {
    const list = this.getPriceAlerts();
    const cleanEmail = alertData.email.trim().toLowerCase();
    const existingIdx = list.findIndex(
      (a) => a.productId === alertData.productId && a.email.toLowerCase() === cleanEmail && a.status === 'ACTIVE'
    );

    const now = new Date().toISOString();
    if (existingIdx !== -1) {
      const updated: PriceDropAlert = {
        ...list[existingIdx],
        ...alertData,
        email: cleanEmail,
        status: 'ACTIVE',
        targetPrice: alertData.targetPrice,
      };
      list[existingIdx] = updated;
      this.savePriceAlerts(list);
      return { alert: updated, isNew: false };
    }

    const newAlert: PriceDropAlert = {
      id: alertData.id || `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productId: alertData.productId,
      productName: alertData.productName,
      productSlug: alertData.productSlug,
      productImage: alertData.productImage,
      currentPrice: alertData.currentPrice,
      targetPrice: alertData.targetPrice,
      email: cleanEmail,
      phone: alertData.phone,
      notifyWhatsApp: alertData.notifyWhatsApp,
      status: 'ACTIVE',
      createdAt: now,
    };

    const updated = [newAlert, ...list];
    this.savePriceAlerts(updated);
    return { alert: newAlert, isNew: true };
  }

  public removePriceAlert(alertId: string): void {
    const list = this.getPriceAlerts();
    const updated = list.filter((a) => a.id !== alertId);
    this.savePriceAlerts(updated);
  }

  public removePriceAlertByProductAndEmail(productId: string, email: string): void {
    const cleanEmail = email.trim().toLowerCase();
    const list = this.getPriceAlerts();
    const updated = list.filter(
      (a) => !(a.productId === productId && a.email.toLowerCase() === cleanEmail)
    );
    this.savePriceAlerts(updated);
  }

  public checkPriceDropAlerts(products: Product[], prevMap?: Map<string, Product>): PriceDropAlert[] {
    const alerts = this.getPriceAlerts();
    if (!alerts || alerts.length === 0) return [];

    let updatedAlerts = [...alerts];
    let triggeredAny = false;
    const triggeredList: PriceDropAlert[] = [];

    for (const prod of products) {
      const prev = prevMap ? prevMap.get(prod.id) : undefined;
      const prevPrice = prev ? prev.precio : undefined;

      updatedAlerts = updatedAlerts.map((alert) => {
        if (alert.productId === prod.id && alert.status === 'ACTIVE') {
          const target = alert.targetPrice !== undefined ? alert.targetPrice : alert.currentPrice;
          const isTriggered =
            prod.precio < alert.currentPrice ||
            prod.precio <= target ||
            (prevPrice !== undefined && prod.precio < prevPrice);

          if (isTriggered) {
            triggeredAny = true;
            const updatedAlert: PriceDropAlert = {
              ...alert,
              status: 'TRIGGERED',
              triggeredAt: new Date().toISOString(),
              triggeredPrice: prod.precio,
            };
            triggeredList.push(updatedAlert);

            // Add an App Notification
            this.addNotification({
              titulo: `¡Bajó de precio! ${prod.nombre}`,
              mensaje: `El producto que estabas siguiendo bajó a Bs. ${prod.precio} (antes Bs. ${alert.currentPrice}). ¡Aprovecha la oferta!`,
              tipo: 'PRECIO',
              leida: false,
              productoSlug: prod.slug,
              productoId: prod.id,
            });

            return updatedAlert;
          }
        }
        return alert;
      });
    }

    if (triggeredAny) {
      this.set(STORAGE_KEYS.PRICE_ALERTS, updatedAlerts);
    }

    return triggeredList;
  }

  // Loyalty Program / X-Points
  public getLoyaltyTransactions(userId?: string): LoyaltyTransaction[] {
    const list = this.get<LoyaltyTransaction[]>(
      STORAGE_KEYS.LOYALTY_TRANSACTIONS,
      INITIAL_LOYALTY_TRANSACTIONS
    );
    if (!userId) return list;
    return list.filter((tx) => tx.userId === userId);
  }

  public saveLoyaltyTransactions(transactions: LoyaltyTransaction[]): void {
    this.set(STORAGE_KEYS.LOYALTY_TRANSACTIONS, transactions);
  }

  public getXPoints(userId?: string): number {
    const user = this.getCurrentUser();
    if (userId && user.id !== userId) {
      const match = DEMO_USERS.find((u) => u.id === userId);
      return match?.xPoints ?? 0;
    }
    return user.xPoints ?? 350;
  }

  public addXPoints(
    userId: string,
    pointsToAdd: number,
    description: string,
    orderNumber?: string,
    type: LoyaltyTransaction['type'] = 'PURCHASE',
    orderId?: string
  ): { newBalance: number; tx: LoyaltyTransaction } {
    const user = this.getCurrentUser();
    const currentBalance = (user.id === userId ? user.xPoints : 0) ?? 0;
    const newBalance = Math.max(0, currentBalance + pointsToAdd);

    // Calculate tier based on total points
    let tier: LoyaltyTier = 'BRONZE';
    if (newBalance >= 1000) tier = 'TITANIUM';
    else if (newBalance >= 500) tier = 'GOLD';
    else if (newBalance >= 200) tier = 'SILVER';

    if (user.id === userId) {
      const updatedUser: User = {
        ...user,
        xPoints: newBalance,
        tier,
      };
      this.setCurrentUser(updatedUser);
    }

    const tx: LoyaltyTransaction = {
      id: `tx-loyalty-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      userEmail: user.email,
      orderId,
      orderNumber,
      points: pointsToAdd,
      balanceAfter: newBalance,
      type,
      description,
      createdAt: new Date().toISOString(),
    };

    const currentTxs = this.getLoyaltyTransactions();
    const updatedTxs = [tx, ...currentTxs];
    this.saveLoyaltyTransactions(updatedTxs);

    return { newBalance, tx };
  }
}

export const storage = new StorageService();
// Initialize storage immediately
storage.initialize();
