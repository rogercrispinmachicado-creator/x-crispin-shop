import { Product, Category } from '../types';

export const FACTOR_X_CATEGORIES: Category[] = [
  {
    id: 'cat-fx-cafes',
    nombre: 'Cafés Funcionales & Cappuccino',
    slug: 'cafes-funcionales',
    descripcion: 'Cafés liofilizados premium con Ganoderma, Moringa, Calcio, Algarrobina y Cacao orgánico.',
    icono: 'Coffee',
    imagen: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop',
    destacada: true,
  },
  {
    id: 'cat-fx-nutricion',
    nombre: 'Nutrición & Digestión',
    slug: 'nutricion-digestion',
    descripcion: 'Fórmulas liofilizadas de acción rápida para limpieza de colon, digestión y flora intestinal.',
    icono: 'Apple',
    imagen: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop',
    destacada: true,
  },
  {
    id: 'cat-fx-peso',
    nombre: 'Control de Peso & Grasa',
    slug: 'control-peso-grasa',
    descripcion: 'Metabolizadores de grasa, termogénicos con Garcinia Cambogia, Toronja, Camu Camu y L-Carnitina.',
    icono: 'Flame',
    imagen: 'https://images.unsplash.com/photo-1514995669114-6081e934b693?q=80&w=600&auto=format&fit=crop',
    destacada: true,
  },
  {
    id: 'cat-fx-colageno',
    nombre: 'Colágenos & Rejuvenecimiento',
    slug: 'colagenos-rejuvenecimiento',
    descripcion: 'Colágeno hidrolizado puro enriquecido con Maíz Morado andino, Aguaje amazónico y Zinc.',
    icono: 'Heart',
    imagen: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop',
    destacada: true,
  },
  {
    id: 'cat-fx-energia',
    nombre: 'Energía & Vigor',
    slug: 'energia-vigor',
    descripcion: 'Fórmulas vigorizantes con Guaraná liofilizado, Camu Camu, Maca Negra y soporte prostático integral.',
    icono: 'Zap',
    imagen: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
    destacada: true,
  },
  {
    id: 'cat-fx-salud-bienestar',
    nombre: 'Salud & Bienestar',
    slug: 'salud-bienestar',
    descripcion: 'Nutrición botánica, antioxidantes celulares, moringa liofilizada en caja, omegas puros y protectores hepáticos.',
    icono: 'HeartPulse',
    imagen: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop',
    destacada: true,
    subcategorias: [
      {
        id: 'subcat-moringas-alcalina',
        nombre: 'Moringas & Alcalinizantes',
        slug: 'moringas-alcalinizantes',
        descripcion: 'Moringa oleífera liofilizada de alta pureza, limón alcalino, magnesio bioasimilable y antioxidantes.',
        icono: 'Sparkles',
      },
      {
        id: 'subcat-salud-hepatica',
        nombre: 'Salud Hepática & Digestiva',
        slug: 'salud-hepatica-digestiva',
        descripcion: 'Cardo Mariano puro y Silimarina purificada para regeneración de hepatocitos y digestión de grasas.',
        icono: 'Activity',
      },
      {
        id: 'subcat-omegas-cardio',
        nombre: 'Omegas & Ácidos Grasos',
        slug: 'omegas-acidos-grasos',
        descripcion: 'Ácidos grasos esenciales insaturados DHA, EPA (Omega 3, 6 y 9) para salud cardiovascular y mental.',
        icono: 'Heart',
      },
      {
        id: 'subcat-packs-salud',
        nombre: 'Packs & Tratamientos',
        slug: 'packs-tratamientos-salud',
        descripcion: 'Tratamientos bionutricionales combinados para desintoxicación celular y equilibrio orgánico con ahorro.',
        icono: 'PackageCheck',
      },
    ],
  },
  {
    id: 'cat-fx-packs',
    nombre: 'Packs de Patrocinio',
    slug: 'packs-patrocinio',
    descripcion: 'Packs oficiales de afiliación con Bono Patrocinio directo en Bolivianos y acumulación de Factor Puntos.',
    icono: 'Award',
    imagen: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=600&auto=format&fit=crop',
    destacada: true,
  },
  {
    id: 'cat-fx-merch',
    nombre: 'Herramientas & Merchandising',
    slug: 'herramientas-merchandising',
    descripcion: 'Coffee shakers, lanyards, morrales ejecutivos y trípticos oficiales de Factor X Company.',
    icono: 'ShoppingBag',
    imagen: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop',
    destacada: false,
  },
];

export const FACTOR_X_PRODUCTS: Product[] = [
  // 1. CLN-XX
  {
    id: 'prod-fx-clnxx',
    sku: 'FX-NUT-CLNXX',
    nombre: 'CLN-XX Limpieza de Colon & Digestión (28 Sachets)',
    slug: 'cln-xx-limpieza-colon-digestion',
    descripcionCorta: 'Té herbal liofilizado de Pitahaya, Tamarindo, Ciruela, Dátiles, Mora, Té Verde y Garcinia Cambogia.',
    descripcionCompleta: `¿Qué es CLN-XX?
Es un exquisito té herbal obtenido de la combinación sinérgica de pitahaya, tamarindo, ciruela, dátiles y mora, endulzado naturalmente con stevia, té verde y garcinia cambogia mediante tecnología avanzada de liofilización.

Eficiente en casos de estreñimiento crónico, optimiza y regula el proceso de digestión manteniendo los intestinos y el colon libres de residuos y desechos tóxicos acumulados.

Presentación y Modo de Consumo:
- Caja con 28 sachets de 8 gr (Peso Neto Caja: 224g)
- Disuelva el contenido de 1 stick de 8 gr en una taza con 180 ml de agua caliente antes de acostarse durante 7 días o según requerimiento.
- Contiene Sodio (Na), Vitamina C y Calcio (Ca).`,
    beneficios: [
      'Optimiza y regula el proceso digestivo con funciones limpiadoras y regeneradoras',
      'Mantiene los intestinos y colon completamente libres de toxinas y desechos',
      'Efectivo contra el estreñimiento crónico y la pesadez estomacal',
      'Frutas 100% liofilizadas: conserva el 96.7% de nutrientes activos',
      'Endulzado con stevia natural, sin azúcares añadidos',
    ],
    especificaciones: {
      'Presentación': 'Caja con 28 sachets de 8g',
      'Peso Neto': '224 gramos',
      'Tecnología': 'Liofilización al vacío a -50°C',
      'Ingredientes Clave': 'Pitahaya, Tamarindo, Ciruela, Dátiles, Mora, Garcinia Gamboia, Té Verde, Stevia',
      'Aporte Nutricional': 'Calcio (Ca), Vitamina C, Sodio (Na)',
      'Factor Puntos': '16 Pts',
      'Precio Afiliado (16%)': 'Bs. 316.09',
      'Precio Minorista (25%)': 'Bs. 282.23',
      'Precio Mayorista (32.5%)': 'Bs. 254.00',
    },
    precio: 376.30,
    precioAnterior: 395.00,
    descuento: 5,
    precioUsd: 37.63,
    precioAfiliado: 316.09,
    precioMinorista: 282.23,
    precioMayorista: 254.00,
    factorPuntos: 16,
    presentacion: 'Caja con 28 sachets de 8g',
    contenidoNeto: '224g',
    ingredientes: ['Pitahaya', 'Tamarindo', 'Ciruela', 'Dátiles', 'Mora', 'Té Verde', 'Garcinia Gamboia', 'Stevia'],
    modoUso: 'Disuelva 1 stick (8g) en una taza con 180 ml de agua caliente antes de acostarse.',
    linea: 'Nutrición',
    imagenes: [
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-fx-nutricion',
    categoriaNombre: 'Nutrición & Digestión',
    marca: 'FACTOR X COMPANY',
    stockTotal: 45,
    stockReservado: 2,
    stockMinimo: 5,
    estado: 'DESTACADO',
    destacado: true,
    rating: 4.9,
    reviewsCount: 38,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
  },

  // 2. SLM FACTOR
  {
    id: 'prod-fx-slm',
    sku: 'FX-SLM-METAB',
    nombre: 'SLM Factor X Metabolizador de Grasa (24 Sobres)',
    slug: 'slm-factor-x-metabolizador-grasa',
    descripcionCorta: 'Potente fórmula termogénica con Garcinia Cambogia, Toronja, Camu Camu, Maracuyá, L-Carnitina y Té Verde.',
    descripcionCompleta: `SLM FACTOR X - Rumbo a la Excelencia
Exclusiva fórmula de frutas liofilizadas diseñada para acelerar de forma natural el metabolismo y promover la oxidación de grasas acumuladas.

Combina Garcinia Cambogia (inhibidor natural del apetito y bloqueador de síntesis grasa), Toronja, Camu Camu amazónico rico en Vitamina C, Maracuyá, Té Verde, Té Negro, L-Carnitina, Alcachofa desintoxicante y Stevia.

Beneficios Integrales:
- Estimula la pérdida de peso corporal y reducción de medidas
- Evita el hígado graso y regula los niveles de colesterol y triglicéridos
- Previene la formación de cálculos renales y limpia las vías urinarias
- Regula la presión arterial y controla el cortisol asociado al estrés
- Fortalece el sistema inmunológico y contribuye a atenuar várices

Presentación: Caja con 24 sobres de 10 gr (Peso Neto: 240g).`,
    beneficios: [
      'Estimula la pérdida de peso y activación del metabolismo celular',
      'Previene el hígado graso y reduce el colesterol LDL',
      'Controla los niveles de cortisol, ansiedad y estrés',
      'Con L-Carnitina, Té Verde y Garcinia Cambogia liofilizada',
      'Refuerza las defensas inmunológicas y aporta energía limpia',
    ],
    especificaciones: {
      'Presentación': 'Caja con 24 sobres de 10g',
      'Peso Neto': '240 gramos',
      'Ingredientes Clave': 'Garcinia Cambogia, Toronja, Camu Camu, Maracuyá, L-Carnitina, Té Verde, Té Negro, Alcachofa, Vitamina C',
      'Factor Puntos': '26 Pts',
      'Precio Afiliado (16%)': 'Bs. 355.91',
      'Precio Minorista (25%)': 'Bs. 317.78',
      'Precio Mayorista (32.5%)': 'Bs. 286.00',
    },
    precio: 423.70,
    precioAnterior: 440.00,
    descuento: 4,
    precioUsd: 42.37,
    precioAfiliado: 355.91,
    precioMinorista: 317.78,
    precioMayorista: 286.00,
    factorPuntos: 26,
    presentacion: 'Caja con 24 sobres de 10g',
    contenidoNeto: '240g',
    ingredientes: ['Garcinia Cambogia', 'Toronja Liofilizada', 'Camu Camu', 'Maracuyá', 'Té Verde', 'Té Negro', 'L-Carnitina', 'Alcachofa', 'Vitamina C', 'Stevia'],
    modoUso: 'Disuelva un sobre de 10g en agua tibia o fresca por la mañana o antes del entrenamiento.',
    linea: 'Control de Peso',
    imagenes: [
      'https://images.unsplash.com/photo-1514995669114-6081e934b693?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-fx-peso',
    categoriaNombre: 'Control de Peso & Grasa',
    marca: 'FACTOR X COMPANY',
    stockTotal: 50,
    stockReservado: 3,
    stockMinimo: 5,
    estado: 'DESTACADO',
    destacado: true,
    rating: 5.0,
    reviewsCount: 42,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
  },

  // 3. COFFEE FACTOR X CAPUCCINO 12 EN 1
  {
    id: 'prod-fx-capuccino12',
    sku: 'FX-COF-CAP12',
    nombre: 'Coffee Factor X Capuccino 12 en 1 Premium (20 Sachets)',
    slug: 'coffee-factor-x-capuccino-12-en-1',
    descripcionCorta: 'Café gourmet liofilizado con Moringa, Ganoderma, Algarrobina, Calcio, Leche de Coco, Cúrcuma y Probióticos.',
    descripcionCompleta: `COFFEE FACTOR X CAPUCCINO 12 EN 1 PREMIUM
El café funcional más completo y delicioso de América Latina.

Formulado con:
1. Café natural liofilizado de altura
2. Extracto de Moringa Oleífera
3. Algarrobina pura
4. Leche de Coco
5. Crema vegetal no láctea
6. Ganoderma Lucidum
7. Calcio orgánico fortificado
8. Stevia natural
9. Calostro bovino
10. Cúrcuma longa
11. Hongo Chaga adaptógeno
12. Probióticos y Prebióticos activos

Beneficios Clave:
- Su contenido en calcio fortifica huesos y dientes en personas adultas y en etapa de crecimiento
- La algarrobina regenera el tracto digestivo y regula la acidez
- Disminuye niveles de colesterol y lípidos en sangre
- Eleva la energía vital sin taquicardia ni acidez gástrica
- Recomendado para personas con estrés crónico, fatiga o insomnio

Presentación: Caja con 20 sachets de 18 gr (Peso Neto: 360g).`,
    beneficios: [
      '12 superalimentos en 1 taza: Ganoderma, Moringa, Chaga y Calostro',
      'Fortifica huesos y dientes con alto contenido de Calcio, Magnesio y Potasio',
      'Efecto regenerativo en la mucosa gástrica e intestinal gracias a la algarrobina',
      'Equilibra la flora con probióticos y prebióticos activos',
      'Sabor capuccino espumoso y cremoso endulzado con stevia',
    ],
    especificaciones: {
      'Presentación': 'Caja con 20 sachets de 18g',
      'Peso Neto': '360 gramos',
      'Ingredientes': 'Café liofilizado, Moringa, Algarrobina, Leche de Coco, Ganoderma, Calcio, Calostro, Cúrcuma, Chaga, Probióticos',
      'Minerales': 'Calcio (Ca), Magnesio (Mg), Potasio (K)',
      'Factor Puntos': '26 Pts',
      'Precio Afiliado (16%)': 'Bs. 355.91',
      'Precio Minorista (25%)': 'Bs. 317.78',
      'Precio Mayorista (32.5%)': 'Bs. 286.00',
    },
    precio: 423.70,
    precioAnterior: 450.00,
    descuento: 6,
    precioUsd: 42.37,
    precioAfiliado: 355.91,
    precioMinorista: 317.78,
    precioMayorista: 286.00,
    factorPuntos: 26,
    presentacion: 'Caja con 20 sachets de 18g',
    contenidoNeto: '360g',
    ingredientes: ['Café natural liofilizado', 'Extracto de Moringa', 'Algarrobina', 'Leche de Coco', 'Crema vegetal', 'Ganoderma lucidum', 'Calcio', 'Stevia', 'Calostro', 'Cúrcuma', 'Hongo Chaga', 'Probióticos y Prebióticos'],
    modoUso: 'Disuelva 1 stick de 18g en una taza con 180 ml de agua caliente o al gusto.',
    linea: 'Cafés Funcionales',
    imagenes: [
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-fx-cafes',
    categoriaNombre: 'Cafés Funcionales & Cappuccino',
    marca: 'FACTOR X COMPANY',
    stockTotal: 60,
    stockReservado: 4,
    stockMinimo: 8,
    estado: 'DESTACADO',
    destacado: true,
    rating: 5.0,
    reviewsCount: 56,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
  },

  // 4. COFFEE FACTOR X MOKACCINO
  {
    id: 'prod-fx-mokaccino',
    sku: 'FX-COF-MOKA',
    nombre: 'Coffee Factor X Mokaccino 5 en 1 (20 Sachets)',
    slug: 'coffee-factor-x-mokaccino-5-en-1',
    descripcionCorta: 'Café liofilizado, Cacao orgánico, Leche de coco liofilizada, Moringa, Ganoderma y Stevia. Sin lactosa.',
    descripcionCompleta: `FACTOR X MOKACCINO 5 EN 1
Combinación gourmet de café de especialidad con cacao amazónico puro, leche de coco liofilizada, extracto de moringa y ganoderma lucidum.

Beneficios Notables:
- Mejora el funcionamiento cerebral, la memoria y la agilidad mental
- Su alta concentración de flavonoides y antioxidantes previene enfermedades neurodegenerativas
- Evita el envejecimiento prematuro protegiendo la piel contra los rayos UV
- Incrementa la sensación de saciedad: ideal para controlar el apetito entre comidas
- No contiene lactosa: 100% amigable para personas con intolerancia a los lácteos
- Afrodisíaco natural: intensifica la energía y la libido femenina y masculina
- Aporta Calcio (Ca), Magnesio (Mg) y Potasio (K)

Presentación: Caja con 20 sobres de 20 gr (Peso Neto: 400g).`,
    beneficios: [
      'Sin lactosa: apto para intolerantes a la lactosa con leche de coco liofilizada',
      'Aumenta la saciedad y apoya el control saludable de peso',
      'Mejora la función cerebral y protege la piel contra el envejecimiento',
      'Afrodisíaco natural y energizante suave sin alterar los nervios',
      'Rico en antioxidantes del cacao orgánico y Ganoderma Lucidum',
    ],
    especificaciones: {
      'Presentación': 'Caja con 20 sobres de 20g',
      'Peso Neto': '400 gramos',
      'Ingredientes': 'Café liofilizado, Cacao orgánico, Leche de coco, Moringa, Ganoderma, Stevia, Yacón',
      'Lactosa': '0% (Libre de lactosa)',
      'Factor Puntos': '26 Pts',
      'Precio Afiliado (16%)': 'Bs. 355.91',
      'Precio Minorista (25%)': 'Bs. 317.78',
      'Precio Mayorista (32.5%)': 'Bs. 286.00',
    },
    precio: 423.70,
    precioAnterior: 445.00,
    descuento: 5,
    precioUsd: 42.37,
    precioAfiliado: 355.91,
    precioMinorista: 317.78,
    precioMayorista: 286.00,
    factorPuntos: 26,
    presentacion: 'Caja con 20 sobres de 20g',
    contenidoNeto: '400g',
    ingredientes: ['Café natural liofilizado', 'Cacao orgánico puro', 'Leche de coco liofilizada', 'Extracto de Moringa', 'Ganoderma Lucidum', 'Stevia'],
    modoUso: '1 sachet por servicio disuelto en agua caliente o leche vegetal al gusto.',
    linea: 'Cafés Funcionales',
    imagenes: [
      'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-fx-cafes',
    categoriaNombre: 'Cafés Funcionales & Cappuccino',
    marca: 'FACTOR X COMPANY',
    stockTotal: 40,
    stockReservado: 1,
    stockMinimo: 5,
    estado: 'ACTIVO',
    rating: 4.9,
    reviewsCount: 31,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
  },

  // 5. COFFEE BLACK PREMIUM 5 EN 1
  {
    id: 'prod-fx-black',
    sku: 'FX-COF-BLACK',
    nombre: 'Coffee Factor X Black Premium 5 en 1 (24 Sticks)',
    slug: 'coffee-factor-x-black-premium',
    descripcionCorta: 'Café orgánico liofilizado con Uña de Gato, Sangre de Grado, Ganoderma y Café Verde.',
    descripcionCompleta: `COFFEE FACTOR X BLACK PREMIUM
El café negro medicinal por excelencia. Formulado con la sinergia botánica más potente de la amazonía y los andes: Café Orgánico Liofilizado, Café Verde, Extracto de Moringa, Uña de Gato, Ganoderma Lucidum y Sangre de Grado pura.

Beneficios para la Salud:
- Es un poderoso desintoxicante general del organismo
- Coadyuvante de gran eficacia en casos de colitis, gastritis, reflujo y úlceras gástricas
- La sangre de grado estimula la cicatrización rápida de heridas internas y lesiones de mucosa
- El ganoderma en combinación con el café negro actúa como un potente antioxidante y energizante
- Asociado a menor riesgo de hígado graso y mejor sensibilidad a la insulina
- Aporta Vitamina B, Magnesio (Mg) y Potasio (K)

Presentación: Caja con 24 sachets de 4 gr (Peso Neto: 96g).`,
    beneficios: [
      'Alivio y cicatrización comprobada para gastritis, úlceras y colitis',
      'Con Sangre de Grado pura y Uña de Gato amazónica',
      'Desintoxica el hígado y optimiza la digestión',
      'Energía limpia y sostenida sin acidez',
      'Café negro gourmet con notas profundas y aromáticas',
    ],
    especificaciones: {
      'Presentación': 'Caja con 24 sticks de 4g',
      'Peso Neto': '96 gramos',
      'Ingredientes': 'Café orgánico liofilizado, Café Verde, Moringa, Uña de Gato, Ganoderma, Sangre de Grado',
      'Factor Puntos': '22 Pts',
      'Precio Afiliado (16%)': 'Bs. 323.57',
      'Precio Minorista (25%)': 'Bs. 288.90',
      'Precio Mayorista (32.5%)': 'Bs. 260.01',
    },
    precio: 385.20,
    precioAnterior: 410.00,
    descuento: 6,
    precioUsd: 38.52,
    precioAfiliado: 323.57,
    precioMinorista: 288.90,
    precioMayorista: 260.01,
    factorPuntos: 22,
    presentacion: 'Caja con 24 stick de 4g',
    contenidoNeto: '96g',
    ingredientes: ['Café orgánico liofilizado', 'Café verde', 'Extracto de Moringa', 'Uña de Gato', 'Ganoderma Lucidum', 'Sangre de Grado'],
    modoUso: 'Disuelva 1 stick de 4g en 180 ml de agua caliente o al gusto.',
    linea: 'Cafés Funcionales',
    imagenes: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-fx-cafes',
    categoriaNombre: 'Cafés Funcionales & Cappuccino',
    marca: 'FACTOR X COMPANY',
    stockTotal: 35,
    stockReservado: 1,
    stockMinimo: 4,
    estado: 'ACTIVO',
    rating: 4.9,
    reviewsCount: 29,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
  },

  // 6. ENERGY FULL GUARANÁ
  {
    id: 'prod-fx-energy',
    sku: 'FX-ENE-GUARA',
    nombre: 'Energy Full Guaraná Mix Energizante (24 Sachets)',
    slug: 'energy-full-guarana-mix',
    descripcionCorta: 'Bebida funcional energizante con Guaraná liofilizado, Camu Camu, Fresa y Vitaminas B y C.',
    descripcionCompleta: `ENERGY FULL GUARANÁ - MIX GASIFICADO LIOFILIZADO
La alternativa natural y saludable a las bebidas energéticas tradicionales cargadas de químicos y azúcar.

Formulado con:
- Guaraná liofilizado de absorción prolongada
- Camu Camu amazónico (la mayor fuente natural de Vitamina C)
- Fresa liofilizada
- Complejo de Vitaminas B y Vitamina C
- Calcio y Sodio natural

Beneficios:
- Brinda energía inmediata y estimula las funciones del sistema nervioso central sin provocar bajones posteriores
- Posee propiedades cardiovasculares que mejoran la oxigenación celular y la circulación sanguínea
- Reduce la hinchazón estomacal y mejora el rendimiento atlético
- Actúa como analgésico suave disminuyendo la sensación de fatiga y dolor físico muscular
- Ideal para atletas, estudiantes y personas con jornadas intensas

Presentación: Caja con 24 sachets de 10 gr (o Six Pack latas 310ml).`,
    beneficios: [
      'Energía natural y prolongada sin taquicardias ni azúcares dañinos',
      'Estimula la concentración mental y la lucidez cognitiva',
      'Camu Camu y Fresa liofilizada con alto contenido de Vitamina C',
      'Mejora la circulación y reduce dolores físicos por fatiga',
      'Aporta Calcio (Ca), Sodio (Na) y Complejo B',
    ],
    especificaciones: {
      'Presentación': 'Caja con 24 sachets de 10g',
      'Peso Neto': '240 gramos',
      'Ingredientes': 'Guaraná liofilizado, Camu Camu liofilizado, Fresa liofilizada, Vitaminas B-C, Calcio, Sodio',
      'Factor Puntos': '20 Pts',
      'Precio Afiliado (16%)': 'Bs. 292.32',
      'Precio Minorista (25%)': 'Bs. 261.00',
      'Precio Mayorista (32.5%)': 'Bs. 234.90',
    },
    precio: 348.00,
    precioAnterior: 370.00,
    descuento: 6,
    precioUsd: 34.80,
    precioAfiliado: 292.32,
    precioMinorista: 261.00,
    precioMayorista: 234.90,
    factorPuntos: 20,
    presentacion: 'Caja con 24 sachets de 10g',
    contenidoNeto: '240g',
    ingredientes: ['Guaraná liofilizado', 'Camu Camu liofilizado', 'Fresa liofilizada', 'Vitamina B', 'Vitamina C', 'Calcio', 'Sodio'],
    modoUso: 'Disuelva 1 sachet en 300 ml de agua fría o con hielo cuando requiera un impulso de energía.',
    linea: 'Energía',
    imagenes: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1622597467836-f3285f2131b7?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-fx-energia',
    categoriaNombre: 'Energía & Vigor',
    marca: 'FACTOR X COMPANY',
    stockTotal: 40,
    stockReservado: 2,
    stockMinimo: 5,
    estado: 'ACTIVO',
    rating: 4.8,
    reviewsCount: 24,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
  },

  // 7. SMART FACTOR XXX
  {
    id: 'prod-fx-smartxxx',
    sku: 'FX-SMA-XXX',
    nombre: 'Smart Factor XXX Vigor & Próstata (12 Sachets)',
    slug: 'smart-factor-xxx-vigor-prostata',
    descripcionCorta: '¡Despierta al gigante interior! Con Maca Negra, Espárragos, Tarwi, Mashua, Hoja de Coca y Guaraná.',
    descripcionCompleta: `SMART FACTOR XXX
Despierta al gigante interior y disfruta al máximo cada momento con Smart Factor XXX.

Fórmula andino-amazónica de vanguardia diseñada para potenciar la salud masculina y el vigor general:
- Limón
- Guaraná
- Piña liofilizada
- Espárragos
- Maca Negra pura (potenciador hormonal y de resistencia)
- Miel de Abeja virgen
- Cacao orgánico
- Tarwi (chocho andino de altísima proteína)
- Algarrobina
- Mashua negra (protector prostático milenario)
- Hoja de Coca sagrada desintoxicante
- Té Negro y Canela sabor guaraná

Beneficios:
- Altamente efectivo para aliviar problemas y molestias de la próstata
- Facilita la micción y previene la inflamación prostática
- Ayuda en la disfunción eréctil y trastornos vasculares que dificultan la erección
- Eleva la estamina, la fuerza y el rendimiento físico en todas las áreas de la vida

Presentación: Doypack con 12 sachets de 8 gr.`,
    beneficios: [
      'Alivio y protección preventiva para problemas de próstata y vías urinarias',
      'Maca Negra, Mashua y Espárragos: estimulantes de la testosterona natural',
      'Combate la disfunción eréctil y favorece la circulación pélvica',
      'Mejora el rendimiento físico, mental e íntimo',
      'Doypack resellable de fácil transporte',
    ],
    especificaciones: {
      'Presentación': 'Doypack con 12 sachets de 8g',
      'Peso Neto': '96 gramos',
      'Ingredientes': 'Maca Negra, Mashua, Espárragos, Guaraná, Tarwi, Hoja de Coca, Cacao, Algarrobina, Miel de Abeja, Canela',
      'Factor Puntos': '8 Pts',
      'Precio Afiliado (16%)': 'Bs. 149.60',
      'Precio Minorista (25%)': 'Bs. 133.58',
      'Precio Mayorista (32.5%)': 'Bs. 120.22',
    },
    precio: 178.10,
    precioAnterior: 195.00,
    descuento: 8,
    precioUsd: 17.81,
    precioAfiliado: 149.60,
    precioMinorista: 133.58,
    precioMayorista: 120.22,
    factorPuntos: 8,
    presentacion: 'Doypack 12 sachets de 8g',
    contenidoNeto: '96g',
    ingredientes: ['Maca Negra', 'Mashua', 'Espárragos', 'Guaraná', 'Tarwi', 'Hoja de Coca', 'Miel de Abeja', 'Cacao', 'Algarrobina', 'Té Negro', 'Canela'],
    modoUso: 'Disuelva 1 sachet en un vaso con 200 ml de agua tibia o fría.',
    linea: 'Energía',
    imagenes: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-fx-energia',
    categoriaNombre: 'Energía & Vigor',
    marca: 'FACTOR X COMPANY',
    stockTotal: 45,
    stockReservado: 1,
    stockMinimo: 5,
    estado: 'ACTIVO',
    rating: 4.9,
    reviewsCount: 35,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
  },

  // 8. MORINGA XPH PLUS
  {
    id: 'prod-fx-moringaxph',
    sku: 'FX-MOR-XPH',
    nombre: 'Moringa XPH Plus Caja de 26 Sachets de 7g',
    slug: 'moringa-xph-plus-alcalinizante',
    descripcionCorta: 'Fórmula alcalinizante y vasodilatadora con Limón liofilizado, Hojas de Moringa, Jengibre y Guanábana.',
    descripcionCompleta: `MORINGA XPH PLUS
Bebida alcalina de alto poder regulador metabólico.

Ingredientes activos:
- Limón liofilizado (alcalinizante gástrico)
- Hojas de Moringa seleccionadas
- Jengibre termogénico
- Guanábana (Graviola)
- Carbonato de Sodio y Magnesio mineral

Beneficios:
- Evita la absorción de colesterol nocivo en el intestino delgado
- Regula la presión arterial debido a que posee reconocidas propiedades vasodilatadoras
- Ayuda a relajar las paredes de los vasos sanguíneos y estimula una circulación fluida
- Retrasa el envejecimiento celular mediante su potente carga de micronutrientes
- Aumenta la energía corporal y alcaliniza el pH del organismo

Presentación: Caja con 26 sachets de 7 gr.`,
    beneficios: [
      'Alcaliniza el organismo y neutraliza la acidez celular',
      'Vasodilatador natural que regula la presión arterial',
      'Evita la absorción intestinal de colesterol LDL',
      'Con Guanábana y Jengibre: defensas y desinflamación',
      'Aporte directo de Magnesio bioasimilable',
    ],
    especificaciones: {
      'Presentación': 'Caja con 26 sachets de 7g',
      'Peso Neto': '182 gramos',
      'Ingredientes': 'Limón Liofilizado, Hojas de Moringa, Jengibre, Guanábana, Carbonato de Sodio, Magnesio',
      'Factor Puntos': '26 Pts',
      'Precio Afiliado (16%)': 'Bs. 355.91',
      'Precio Minorista (25%)': 'Bs. 317.78',
      'Precio Mayorista (32.5%)': 'Bs. 286.00',
    },
    precio: 423.70,
    precioAnterior: 440.00,
    descuento: 4,
    precioUsd: 42.37,
    precioAfiliado: 355.91,
    precioMinorista: 317.78,
    precioMayorista: 286.00,
    factorPuntos: 26,
    presentacion: 'Caja con 26 sachets de 7g',
    contenidoNeto: '182g',
    ingredientes: ['Limón liofilizado', 'Hojas de Moringa', 'Jengibre', 'Guanábana', 'Carbonato de Sodio', 'Magnesio'],
    modoUso: 'Disuelva 1 sachet en una taza con 180 ml de agua tibia en ayunas.',
    linea: 'Salud & Bienestar',
    imagenes: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-fx-salud-bienestar',
    categoriaNombre: 'Salud & Bienestar',
    subcategoriaId: 'subcat-moringas-alcalina',
    subcategoriaNombre: 'Moringas & Alcalinizantes',
    marca: 'FACTOR X COMPANY',
    stockTotal: 40,
    stockReservado: 2,
    stockMinimo: 5,
    estado: 'ACTIVO',
    rating: 4.8,
    reviewsCount: 22,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
  },

  // 9. COLÁGENO MAÍZ MORADO
  {
    id: 'prod-fx-colmaiz',
    sku: 'FX-COL-MAIZ',
    nombre: 'Colágeno Hidrolizado Maíz Morado (Doypack 15 Sachets)',
    slug: 'colageno-hidrolizado-maiz-morado',
    descripcionCorta: 'Colágeno hidrolizado puro con Maíz Morado andino, Zinc, Piña liofilizada, Vitamina C y Cartílago de Tiburón.',
    descripcionCompleta: `COLÁGENO HIDROLIZADO MAÍZ MORADO
El maíz morado andino es una de las mayores fuentes de antocianinas y antioxidantes del planeta, promoviendo una circulación sana y protección vascular.

Fórmula enriquecida con:
- Colágeno hidrolizado tipo I y II de alta biodisponibilidad
- Concentrado de Maíz Morado
- Zinc quelado
- Piña liofilizada rica en bromelina
- Magnesio y Calcio
- Vitamina C (catalizador de la síntesis de colágeno)
- Cartílago de tiburón para cartílagos articulares

Beneficios:
- Previene el envejecimiento prematuro y atenúa arrugas
- Fortalece articulaciones, ligamentos, tendones y masa muscular
- Brinda mayor elasticidad, hidratación y firmeza a la piel
- Hidrata, fortalece y engrosa el cabello y uñas quebradizas
- Aporta Fósforo, Hierro (combate la anemia), Calcio (Ca) y Magnesio (Mg)

Presentación: Doypack con 15 sachets de 10 gr (o Caja 30u / Pote 400g).`,
    beneficios: [
      'Antocianinas del Maíz Morado: juventud celular y elasticidad cutánea',
      'Con Cartílago de Tiburón y Zinc: cartílagos y articulaciones sin dolor',
      'Resultados visibles en piel, uñas y cabello en 15 a 60 días',
      'Aporte mineral completo: Hierro (Fe), Calcio (Ca) y Magnesio (Mg)',
      'Excelente sabor frutal con piña liofilizada',
    ],
    especificaciones: {
      'Presentación': 'Doypack con 15 sachets de 10g',
      'Peso Neto': '150 gramos',
      'Ingredientes': 'Colágeno hidrolizado, Maíz Morado, Zinc, Piña liofilizada, Magnesio, Calcio, Vitamina C, Cartílago de Tiburón',
      'Factor Puntos': '14 Pts',
      'Precio Afiliado (16%)': 'Bs. 211.60',
      'Precio Minorista (25%)': 'Bs. 188.93',
      'Precio Mayorista (32.5%)': 'Bs. 170.03',
    },
    precio: 251.90,
    precioAnterior: 275.00,
    descuento: 8,
    precioUsd: 25.19,
    precioAfiliado: 211.60,
    precioMinorista: 188.93,
    precioMayorista: 170.03,
    factorPuntos: 14,
    presentacion: 'Doypack 15 sachets de 10g',
    contenidoNeto: '150g',
    ingredientes: ['Colágeno hidrolizado', 'Maíz Morado', 'Zinc', 'Piña liofilizada', 'Magnesio', 'Calcio', 'Vitamina C', 'Cartílago de tiburón'],
    modoUso: 'Disuelva 1 stick de 10g en 180 ml de agua por la mañana y otro antes de dormir.',
    linea: 'Colágenos',
    imagenes: [
      'https://images.unsplash.com/photo-1556760544-74068565f05c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-fx-colageno',
    categoriaNombre: 'Colágenos & Rejuvenecimiento',
    marca: 'FACTOR X COMPANY',
    stockTotal: 50,
    stockReservado: 3,
    stockMinimo: 5,
    estado: 'DESTACADO',
    destacado: true,
    rating: 5.0,
    reviewsCount: 47,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
  },

  // 10. COLÁGENO AGUAJE AMAZÓNICO
  {
    id: 'prod-fx-colaguaje',
    sku: 'FX-COL-AGUAJE',
    nombre: 'Colágeno Hidrolizado Aguaje Amazónico (25 Sachets)',
    slug: 'colageno-hidrolizado-aguaje-amazonico',
    descripcionCorta: 'Colágeno hidrolizado con extracto atomizado de Aguaje, Maracuyá liofilizado y fibra de Yacón.',
    descripcionCompleta: `COLÁGENO FACTOR X AGUAJE
El aguaje es reconocido como el superfruto amazónico de la feminidad y la belleza natural. Rico en fitoestrógenos que estilizan la silueta, equilibran los ciclos hormonales y aportan brillo inigualable a la piel y el cabello.

Componentes:
- Colágeno hidrolizado de máxima absorción
- Extracto atomizado de Aguaje puro
- Liofilizado de Aguaje y Maracuyá
- Endulzado con Stevia y fibra prebiótica de Yacón

Beneficios:
- Previene y atenúa el envejecimiento cutáneo prematuro
- Fortalece articulaciones, ligamentos y masa muscular magra
- Brinda elasticidad y luminosidad al rostro
- Contiene Vitaminas A y C, Potasio (K) y Fósforo (P)

Presentación: Caja con 25 sachets de 10 gr (Peso Neto: 250g).`,
    beneficios: [
      'Fitoestrógenos naturales del Aguaje para moldear la figura y vitalidad femenina',
      'Máxima hidratación cutánea y suavizado de líneas de expresión',
      'Fortalece ligamentos, cartílagos articulares y tejido óseo',
      'Rico en Provitamina A (betacaroteno), Vitamina C, Fósforo y Potasio',
      'Exquisito sabor a maracuyá y aguaje con fibra de yacón',
    ],
    especificaciones: {
      'Presentación': 'Caja con 25 sachets de 10g',
      'Peso Neto': '250 gramos',
      'Ingredientes': 'Colágeno hidrolizado, Extracto atomizado de Aguaje, Liofilizado de Aguaje, Liofilizado de Maracuyá, Stevia, Yacón',
      'Vitaminas y Minerales': 'Vitamina A, Vitamina C, Potasio (K), Fósforo (P)',
      'Factor Puntos': '26 Pts',
      'Precio Afiliado (16%)': 'Bs. 355.91',
      'Precio Minorista (25%)': 'Bs. 317.78',
      'Precio Mayorista (32.5%)': 'Bs. 286.00',
    },
    precio: 423.70,
    precioAnterior: 450.00,
    descuento: 6,
    precioUsd: 42.37,
    precioAfiliado: 355.91,
    precioMinorista: 317.78,
    precioMayorista: 286.00,
    factorPuntos: 26,
    presentacion: 'Caja con 25 sachets de 10g',
    contenidoNeto: '250g',
    ingredientes: ['Colágeno hidrolizado', 'Extracto de Aguaje', 'Liofilizado de Aguaje', 'Liofilizado de Maracuyá', 'Stevia', 'Fibra de Yacón'],
    modoUso: 'Disuelva 1 stick de 10g en 180 ml de agua por la mañana o noche.',
    linea: 'Colágenos',
    imagenes: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-fx-colageno',
    categoriaNombre: 'Colágenos & Rejuvenecimiento',
    marca: 'FACTOR X COMPANY',
    stockTotal: 40,
    stockReservado: 2,
    stockMinimo: 5,
    estado: 'DESTACADO',
    destacado: true,
    rating: 5.0,
    reviewsCount: 39,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
  },

  // 11. MORINGA C-ULTRA (60 Cápsulas)
  {
    id: 'prod-fx-moringacultra',
    sku: 'FX-CAP-MORC',
    nombre: 'Moringa C-Ultra Concentrado 60 Cápsulas de 500mg',
    slug: 'moringa-c-ultra-concentrado-capsulas',
    descripcionCorta: 'Extracto concentrado de Moringa y Cúrcuma milenaria en cápsulas vegetales para dolores e inflamación.',
    descripcionCompleta: `MORINGA C-ULTRA CONCENTRADO
La moringa, conocida milenariamente como el "árbol milagroso", aporta una riqueza inigualable de antioxidantes, vitaminas y minerales.

Aporta regulación del azúcar en la sangre y balance del colesterol. Por su parte, la cúrcuma ha sido utilizada por más de 2,000 años para aliviar dolores articulares y musculares, desinflamar tejidos, y proteger contra afecciones como artritis, reumas, colitis y psoriasis.

Presentación: Frasco con 60 cápsulas de 500 mg c/u.
Recomendaciones: Ingerir de 1 a 2 cápsulas al día con agua.`,
    beneficios: [
      'Alivio comprobado para dolores e inflamaciones articulares',
      'Coadyuvante en artritis, reumatismo y lesiones musculares',
      'Regula los niveles de glucosa en sangre y colesterol',
      'Soporte digestivo en colitis y estreñimiento',
      'Poderosa acción antioxidante celular',
    ],
    especificaciones: {
      'Presentación': 'Frasco con 60 cápsulas de 500mg',
      'Contenido': '30 gramos netos',
      'Ingredientes': 'Moringa oleífera concentrada, Cúrcuma longa de alta biodisponibilidad',
      'Factor Puntos': '12 Pts',
      'Precio Afiliado (16%)': 'Bs. 192.86',
      'Precio Minorista (25%)': 'Bs. 172.20',
      'Precio Mayorista (32.5%)': 'Bs. 154.98',
    },
    precio: 229.60,
    precioAnterior: 245.00,
    descuento: 6,
    precioUsd: 22.96,
    precioAfiliado: 192.86,
    precioMinorista: 172.20,
    precioMayorista: 154.98,
    factorPuntos: 12,
    presentacion: 'Frasco con 60 cápsulas de 500mg',
    contenidoNeto: '60 cápsulas',
    ingredientes: ['Moringa oleífera pura', 'Cúrcuma longa concentrada', 'Minerales esenciales'],
    modoUso: 'Tomar 1 a 2 cápsulas diarias según requerimiento junto a los alimentos.',
    linea: 'Salud & Bienestar',
    imagenes: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550572017-ed200f5e6343?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-fx-salud-bienestar',
    categoriaNombre: 'Salud & Bienestar',
    subcategoriaId: 'subcat-moringas-alcalina',
    subcategoriaNombre: 'Moringas & Alcalinizantes',
    marca: 'FACTOR X COMPANY',
    stockTotal: 45,
    stockReservado: 1,
    stockMinimo: 5,
    estado: 'ACTIVO',
    rating: 4.8,
    reviewsCount: 19,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
  },

  // 12. OMEFAC OMEGA 3, 6 Y 9 (60 Cápsulas Blandas)
  {
    id: 'prod-fx-omefac',
    sku: 'FX-CAP-OMEFAC',
    nombre: 'Omefac Omega 3, 6 y 9 Concentrado 60 Cápsulas Blandas',
    slug: 'omefac-omega-3-6-9-concentrado',
    descripcionCorta: 'Ácidos grasos esenciales insaturados DHA y EPA para la salud cardiovascular, cerebral e inmune.',
    descripcionCompleta: `OMEFAC OMEGA 3, 6 Y 9
Nutriente fundamental para el correcto funcionamiento del cuerpo humano y prevención de enfermedades degenerativas.

Contiene grasas insaturadas de máxima pureza (DHA y EPA) junto con aminoácidos esenciales.
- Fortalece el sistema inmunitario
- Protege el corazón y la flexibilidad de las arterias
- Favorece la memoria y el enfoque mental
- Regula triglicéridos y equilibra el colesterol

Presentación: Frasco con 60 cápsulas blandas de 500 mg c/u.`,
    beneficios: [
      'Ácidos grasos DHA y EPA de alta pureza y biodisponibilidad',
      'Protección para la salud cardiovascular y arterial',
      'Nutre las membranas neuronales y la concentración mental',
      'Equilibra los niveles de triglicéridos en sangre',
      'Cápsulas blandas de fácil deglución y rápida asimilación',
    ],
    especificaciones: {
      'Presentación': 'Frasco con 60 cápsulas blandas de 500mg',
      'Contenido': '60 softgels',
      'Ingredientes': 'Ácidos grasos Omega 3 (DHA, EPA), Omega 6, Omega 9, Vitamina E',
      'Factor Puntos': '12 Pts',
      'Precio Afiliado (16%)': 'Bs. 199.08',
      'Precio Minorista (25%)': 'Bs. 177.75',
      'Precio Mayorista (32.5%)': 'Bs. 159.98',
    },
    precio: 237.00,
    precioAnterior: 250.00,
    descuento: 5,
    precioUsd: 23.70,
    precioAfiliado: 199.08,
    precioMinorista: 177.75,
    precioMayorista: 159.98,
    factorPuntos: 12,
    presentacion: 'Frasco con 60 cápsulas blandas de 500mg',
    contenidoNeto: '60 cápsulas blandas',
    ingredientes: ['Omega 3 (EPA y DHA)', 'Omega 6', 'Omega 9', 'Aminoácidos esenciales', 'Vitamina E'],
    modoUso: '1 cápsula blanda 2 veces al día con las comidas principales.',
    linea: 'Salud & Bienestar',
    imagenes: [
      'https://images.unsplash.com/photo-1577401239170-897942555fb3?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550572017-ed200f5e6343?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-fx-salud-bienestar',
    categoriaNombre: 'Salud & Bienestar',
    subcategoriaId: 'subcat-omegas-cardio',
    subcategoriaNombre: 'Omegas & Ácidos Grasos',
    marca: 'FACTOR X COMPANY',
    stockTotal: 40,
    stockReservado: 1,
    stockMinimo: 5,
    estado: 'ACTIVO',
    rating: 4.9,
    reviewsCount: 26,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
  },

  // 13. HEPA FACTOR X (HEPA-FX)
  {
    id: 'prod-fx-hepafx',
    sku: 'FX-CAP-HEPA',
    nombre: 'Hepa-FX Concentrado Desintoxicante Hepático 60 Cápsulas',
    slug: 'hepa-fx-concentrado-desintoxicante-hepatico',
    descripcionCorta: 'Fórmula protectora hepática con Cardo Mariano y Semillas de Silimarina purificada.',
    descripcionCompleta: `HEPA FACTOR X (HEPA-FX) - DESINTOXICANTE HEPÁTICO
Compuesto por Cardo Mariano puro y semillas de Silimarina concentrada, reconocidas mundialmente por su capacidad para proteger y regenerar las células del hígado.

Beneficios Hepáticos:
- Combate las afecciones del hígado limpiándolo con sus propiedades desintoxicantes profundas
- Ayuda a la digestión y asimilación adecuada de las grasas
- Previene el hígado graso y afecciones cirróticas causadas por mala alimentación o consumo de grasas
- Protege los hepatocitos contra toxinas químicas, medicamentos agresivos, alcohol y tabaco
- Estimula la síntesis de nuevas proteínas hepáticas fortaleciendo las membranas celulares

Presentación: Frasco con 60 cápsulas de 500 mg c/u.`,
    beneficios: [
      'Cardo Mariano y Silimarina concentrada: regeneración celular del hígado',
      'Protege contra daños por alcohol, tabaco, químicos y medicamentos',
      'Estimula la correcta digestión de grasas pesadas',
      'Previene el hígado graso y desintoxica la vesícula biliar',
      'Cápsulas vegetales de 500mg de rápida absorción',
    ],
    especificaciones: {
      'Presentación': 'Frasco con 60 cápsulas de 500mg',
      'Contenido': '300 gramos peso frasco',
      'Ingredientes': 'Cardo Mariano (Silybum marianum), Silimarina purificada, antioxidantes botánicos',
      'Factor Puntos': '6 Pts',
      'Precio Afiliado (16%)': 'Bs. 149.35',
      'Precio Minorista (25%)': 'Bs. 133.35',
      'Precio Mayorista (32.5%)': 'Bs. 120.02',
    },
    precio: 177.80,
    precioAnterior: 195.00,
    descuento: 8,
    precioUsd: 17.78,
    precioAfiliado: 149.35,
    precioMinorista: 133.35,
    precioMayorista: 120.02,
    factorPuntos: 6,
    presentacion: 'Frasco con 60 cápsulas de 500mg',
    contenidoNeto: '60 cápsulas',
    ingredientes: ['Cardo Mariano', 'Semillas de Silimarina concentrada', 'Extractos vegetales desintoxicantes'],
    modoUso: '1 cápsula antes de las comidas principales con abundante agua.',
    linea: 'Salud & Bienestar',
    imagenes: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-fx-salud-bienestar',
    categoriaNombre: 'Salud & Bienestar',
    subcategoriaId: 'subcat-salud-hepatica',
    subcategoriaNombre: 'Salud Hepática & Digestiva',
    marca: 'FACTOR X COMPANY',
    stockTotal: 40,
    stockReservado: 1,
    stockMinimo: 5,
    estado: 'ACTIVO',
    rating: 4.9,
    reviewsCount: 27,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
  },

  // 13B. PACK DÚO SALUD & BIENESTAR
  {
    id: 'prod-fx-pack-salud-bienestar',
    sku: 'FX-SAL-DUOPACK',
    nombre: 'Pack Dúo Salud & Bienestar (Moringa XPH Caja + Hepa-FX)',
    slug: 'pack-duo-salud-bienestar-moringa-hepa',
    descripcionCorta: 'Tratamiento integral alcalinizante y protector hepático: 1 Caja Moringa XPH Plus (26 sachets) + 1 Frasco Hepa-FX (60 cápsulas).',
    descripcionCompleta: `PACK DÚO OFICIAL SALUD & BIENESTAR FACTOR X
La sinergia terapéutica perfecta para desintoxicar el hígado y equilibrar el pH corporal:

Incluye:
1. MORINGA XPH PLUS (Caja con 26 Sachets de 7g):
   - Limón liofilizado alcalinizante + Hojas de Moringa oleífera seleccionadas.
   - Vasodilatador natural que regula la tensión y aporta magnesio biodisponible.
2. HEPA FACTOR X (Frasco con 60 Cápsulas de 500mg):
   - Cardo Mariano puro y Silimarina purificada para regenerar los hepatocitos.
   - Limpieza de toxinas, asimilación de grasas pesadas y protección contra hígado graso.

Modo de Consumo:
- Mañanas en ayunas: 1 sachet de Moringa XPH disuelto en 180 ml de agua tibia.
- Almuerzo y cena: 1 cápsula de Hepa-FX con las comidas principales.`,
    beneficios: [
      'Depuración hepática y celular intensiva en 30 días',
      'Neutraliza la acidez celular y alcaliniza el torrente sanguíneo',
      'Previene hígado graso, digestiones pesadas y colesterol elevado',
      'Ahorro especial por compra combinada con Factor Puntos acumulables',
      'Despacho inmediato a los 9 departamentos de Bolivia con pago QR Simple',
    ],
    especificaciones: {
      'Contenido': '1 Caja Moringa (26 sachets) + 1 Frasco Hepa-FX (60 cápsulas)',
      'Aporte': 'Magnesio, Silimarina, Cardo Mariano, Vitamina C',
      'Factor Puntos': '32 Pts',
      'Precio Regular Separado': 'Bs. 601.50',
      'Precio Combo Promocional': 'Bs. 545.00',
    },
    precio: 545.00,
    precioAnterior: 601.50,
    descuento: 9,
    precioUsd: 54.50,
    precioAfiliado: 458.00,
    precioMinorista: 410.00,
    precioMayorista: 375.00,
    factorPuntos: 32,
    presentacion: 'Combo: 1 Caja 26 sachets + 1 Frasco 60 cápsulas',
    contenidoNeto: '1 Caja (182g) + 1 Frasco (60 cáps)',
    ingredientes: ['Moringa oleífera', 'Cardo Mariano', 'Silimarina', 'Limón liofilizado', 'Jengibre', 'Magnesio'],
    modoUso: 'Moringa en ayunas (1 sachet) + Hepa-FX en almuerzo/cena (1 cápsula).',
    linea: 'Salud & Bienestar',
    imagenes: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-fx-salud-bienestar',
    categoriaNombre: 'Salud & Bienestar',
    subcategoriaId: 'subcat-packs-salud',
    subcategoriaNombre: 'Packs & Tratamientos',
    marca: 'FACTOR X COMPANY',
    stockTotal: 30,
    stockReservado: 1,
    stockMinimo: 5,
    estado: 'DESTACADO',
    destacado: true,
    rating: 5.0,
    reviewsCount: 31,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
  },

  // 14. SMALL COFFEE SHAKER
  {
    id: 'prod-fx-shaker-s',
    sku: 'FX-MER-SHAKE-S',
    nombre: 'Small Coffee Shaker Factor X',
    slug: 'small-coffee-shaker-factor-x',
    descripcionCorta: 'Mezclador hermético de alta durabilidad con rejilla disolvedora para cafés y batidos Factor X.',
    descripcionCompleta: 'Shaker oficial Factor X Company en tamaño compacto. Fabricado en polipropileno libre de BPA de grado alimenticio. Cuenta con cierre hermético antifugas y rejilla mezcladora para lograr capuccinos espumosos y mezclas liofilizadas perfectas en segundos.',
    beneficios: [
      '100% libre de BPA de grado alimentario',
      'Cierre hermético con rosca de máxima seguridad antiderrame',
      'Rejilla disolvedora especial para bebidas liofilizadas Factor X',
    ],
    especificaciones: {
      'Capacidad': '400 ml',
      'Material': 'Polipropileno libre de BPA',
      'Marca': 'FACTOR X COMPANY',
    },
    precio: 50.00,
    precioUsd: 5.00,
    presentacion: 'Unidad individual',
    linea: 'Merchandising',
    imagenes: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-fx-merch',
    categoriaNombre: 'Herramientas & Merchandising',
    marca: 'FACTOR X COMPANY',
    stockTotal: 60,
    stockReservado: 0,
    stockMinimo: 10,
    estado: 'ACTIVO',
    rating: 4.8,
    reviewsCount: 15,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
  },

  // 15. LARGE COFFEE SHAKER
  {
    id: 'prod-fx-shaker-l',
    sku: 'FX-MER-SHAKE-L',
    nombre: 'Large Coffee Shaker Factor X',
    slug: 'large-coffee-shaker-factor-x',
    descripcionCorta: 'Shaker de gran capacidad con bola mezcladora de acero y compartimento para sachets.',
    descripcionCompleta: 'Shaker profesional de gran capacidad Factor X Company. Ideal para preparar Energy Full Guaraná o Colágeno con abundante agua y hielo durante el día.',
    beneficios: [
      'Gran volumen de 700 ml con medidor en relieve',
      'Resistente a temperaturas frías y calientes',
      'Logo oficial Factor X Company en serigrafía indeleble',
    ],
    especificaciones: {
      'Capacidad': '700 ml',
      'Material': 'Polímero reforzado libre de BPA',
      'Marca': 'FACTOR X COMPANY',
    },
    precio: 70.00,
    precioUsd: 7.00,
    presentacion: 'Unidad individual',
    linea: 'Merchandising',
    imagenes: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-fx-merch',
    categoriaNombre: 'Herramientas & Merchandising',
    marca: 'FACTOR X COMPANY',
    stockTotal: 40,
    stockReservado: 0,
    stockMinimo: 8,
    estado: 'ACTIVO',
    rating: 4.9,
    reviewsCount: 18,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
  },

  // 16. MORRAL DE FACTOR
  {
    id: 'prod-fx-morral',
    sku: 'FX-MER-MORRAL',
    nombre: 'Morral Ejecutivo Factor X Rumbo a la Excelencia',
    slug: 'morral-ejecutivo-factor-x',
    descripcionCorta: 'Morral ergonómico e impermeable para transportar catálogos, muestras y material de negocio.',
    descripcionCompleta: 'Morral oficial para empresarios y distribuidores Factor X Company. Diseñado con compartimentos especiales para transportar cajas de producto, trípticos y cocteleras con máxima elegancia corporativa.',
    beneficios: [
      'Tejido Oxford impermeable de alta resistencia',
      'Correa acolchada y ajustable con mosquetones metálicos',
      'Bordado oficial Factor X Rumbo a la Excelencia',
    ],
    especificaciones: {
      'Dimensiones': '32 x 24 x 10 cm',
      'Material': 'Nylon Oxford reforzado',
    },
    precio: 50.00,
    precioUsd: 5.00,
    presentacion: 'Unidad individual',
    linea: 'Merchandising',
    imagenes: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-fx-merch',
    categoriaNombre: 'Herramientas & Merchandising',
    marca: 'FACTOR X COMPANY',
    stockTotal: 30,
    stockReservado: 0,
    stockMinimo: 5,
    estado: 'ACTIVO',
    rating: 4.8,
    reviewsCount: 12,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
  },

  // 17. TRÍPTICO INFORMATIVO
  {
    id: 'prod-fx-triptico',
    sku: 'FX-MER-TRIPTICO',
    nombre: 'Tríptico Oficial Factor X 2026 (1/2 Ciento - 50 Uds)',
    slug: 'triptico-oficial-factor-x-50-uds',
    descripcionCorta: 'Material impreso a todo color en papel couché brillante con el catálogo de productos y beneficios 2026.',
    descripcionCompleta: 'Herramienta fundamental para socios de red y distribuidores independientes. Incluye información de liofilización, ingredientes, modo de uso y beneficios de toda la línea de nutrición Factor X Company.',
    beneficios: [
      'Impresión offset en papel couché brillante de 150g',
      'Información detallada de los 13 productos estrella de Factor X',
      'Paquete con 50 trípticos listos para prospección',
    ],
    especificaciones: {
      'Contenido': '50 unidades (1/2 ciento)',
      'Formato': 'Tríptico A4 plegado',
    },
    precio: 90.00,
    precioUsd: 9.00,
    presentacion: 'Paquete de 50 unidades',
    linea: 'Merchandising',
    imagenes: [
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-fx-merch',
    categoriaNombre: 'Herramientas & Merchandising',
    marca: 'FACTOR X COMPANY',
    stockTotal: 50,
    stockReservado: 0,
    stockMinimo: 10,
    estado: 'ACTIVO',
    rating: 4.9,
    reviewsCount: 16,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
  },

  // 18. PACK FACTOR CONSUMIDOR (Bono Patrocinio)
  {
    id: 'prod-fx-pack-consumidor',
    sku: 'FX-PACK-CONSUMIDOR',
    nombre: 'Pack Factor Consumidor (78 Factor Puntos)',
    slug: 'pack-factor-consumidor-78-pts',
    descripcionCorta: 'Pack oficial de inicio con 78 Factor Puntos. Precio referencial equivalente a 3 Cappuccinos 12 en 1. Bono: Gana Bs. 205.',
    descripcionCompleta: `PACK FACTOR CONSUMIDOR - BONO PATROCINIO OFICIAL
Inicia tu trayectoria en Factor X Company con el Pack Consumidor.

Detalles del Pack:
- Acumula 78 Factor Puntos
- Precio referencial: equivalente a 3 Cappuccinos 12 en 1 u otros productos de tu elección
- Bono Patrocinio Directo: Gana Bs. 205
- Acceso al sistema educativo no tradicional de salud y liderazgo
- Precios con descuento de afiliado en todas tus compras futuras.`,
    beneficios: [
      'Otorga 78 Factor Puntos de calificación inmediata',
      'Bono de Patrocinio directo: Gana Bs. 205 en efectivo/crédito',
      'Habilita descuentos inmediatos de Afiliado y Minorista',
      'Incluye productos oficiales a elección',
    ],
    especificaciones: {
      'Factor Puntos': '78 Pts',
      'Bono Patrocinio': 'Gana Bs. 205.00',
      'Productos Referenciales': '3 Cajas de Capuccino 12 en 1 o equivalente a elección',
    },
    precio: 1281.00,
    factorPuntos: 78,
    presentacion: 'Pack cerrado de 78 Factor Puntos',
    linea: 'Packs Patrocinio',
    imagenes: [
      'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-fx-packs',
    categoriaNombre: 'Packs de Patrocinio',
    marca: 'FACTOR X COMPANY',
    stockTotal: 30,
    stockReservado: 1,
    stockMinimo: 5,
    estado: 'DESTACADO',
    destacado: true,
    rating: 5.0,
    reviewsCount: 23,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
  },

  // 19. PACK FACTOR EMPRENDEDOR (Bono Patrocinio)
  {
    id: 'prod-fx-pack-emprendedor',
    sku: 'FX-PACK-EMPRENDEDOR',
    nombre: 'Pack Factor Emprendedor (260 Factor Puntos)',
    slug: 'pack-factor-emprendedor-260-pts',
    descripcionCorta: 'Pack para emprendedores con 260 Factor Puntos. Precio referencial equivalente a 10 Cappuccinos. Bono: Gana Bs. 1,092.',
    descripcionCompleta: `PACK FACTOR EMPRENDEDOR - POTENCIA TU NEGOCIO
El pack más recomendado para líderes y emprendedores que desean construir un negocio sólido en Bolivia.

Detalles del Pack:
- Acumula 260 Factor Puntos
- Precio referencial: equivalente a 10 Cappuccinos 12 en 1 u otros productos de tu elección
- Bono Patrocinio Directo: Gana Bs. 1,092
- Acceso a la escala de precios Minorista y Mayorista (hasta 32.5% de margen)
- Suman puntos para el bono equipo binario y liderazgo.`,
    beneficios: [
      '260 Factor Puntos para saltar a rangos de liderazgo',
      'Bono de Patrocinio directo: Gana Bs. 1,092.00',
      'Stock suficiente para degustación, venta directa y consumo familiar',
      'Apertura para calificar a bonos de auto y viajes',
    ],
    especificaciones: {
      'Factor Puntos': '260 Pts',
      'Bono Patrocinio': 'Gana Bs. 1,092.00',
      'Productos Referenciales': '10 Cajas de Capuccino 12 en 1 o equivalente a elección',
    },
    precio: 4272.00,
    factorPuntos: 260,
    presentacion: 'Pack empresarial de 260 Factor Puntos',
    linea: 'Packs Patrocinio',
    imagenes: [
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-fx-packs',
    categoriaNombre: 'Packs de Patrocinio',
    marca: 'FACTOR X COMPANY',
    stockTotal: 25,
    stockReservado: 1,
    stockMinimo: 3,
    estado: 'DESTACADO',
    destacado: true,
    rating: 5.0,
    reviewsCount: 34,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
  },

  // 20. PACK FACTOR EMBAJADOR (Bono Patrocinio)
  {
    id: 'prod-fx-pack-embajador',
    sku: 'FX-PACK-EMBAJADOR',
    nombre: 'Pack Factor Embajador (520 Factor Puntos)',
    slug: 'pack-factor-embajador-520-pts',
    descripcionCorta: 'Máximo nivel de inicio con 520 Factor Puntos. Ref. 20 Cappuccinos. Bono: Gana Bs. 2,184 + Entrada a Evoluxion.',
    descripcionCompleta: `PACK FACTOR EMBAJADOR - RUMBO A LA EXCELENCIA
El paquete máximo para los visionarios de la industria.

Beneficios Exclusivos del Pack Embajador:
- Acumula 520 Factor Puntos
- Precio referencial: equivalente a 20 Cappuccinos 12 en 1 u otros productos a tu elección
- Bono Patrocinio Directo: Gana Bs. 2,184
- Entrada incluida para la convención EVOLUXION
- Calificación directa a viaje nacional Colón Salinas
- Descuento máximo Mayorista (32.5%) inmediato en recompras
- Máxima rentabilidad y posicionamiento en el plan de compensación.`,
    beneficios: [
      '520 Factor Puntos directos para máxima velocidad en la red',
      'Bono de Patrocinio directo: Gana Bs. 2,184.00 en efectivo',
      'Entrada garantizada para el evento nacional EVOLUXION',
      'Calificación a Bono de Auto y Viaje Nacional Colón Salinas',
      'Margen de comercialización mayorista del 32.5%',
    ],
    especificaciones: {
      'Factor Puntos': '520 Pts',
      'Bono Patrocinio': 'Gana Bs. 2,184.00',
      'Beneficio Adicional': 'Entrada para Evoluxion + Viaje Nacional Colón Salinas',
      'Productos Referenciales': '20 Cajas de Capuccino 12 en 1 o equivalente a elección',
    },
    precio: 8400.00,
    factorPuntos: 520,
    presentacion: 'Pack supremo de 520 Factor Puntos',
    linea: 'Packs Patrocinio',
    imagenes: [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=800&auto=format&fit=crop',
    ],
    categoriaId: 'cat-fx-packs',
    categoriaNombre: 'Packs de Patrocinio',
    marca: 'FACTOR X COMPANY',
    stockTotal: 15,
    stockReservado: 0,
    stockMinimo: 2,
    estado: 'DESTACADO',
    destacado: true,
    rating: 5.0,
    reviewsCount: 41,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-03-15T12:00:00.000Z',
  },
];
