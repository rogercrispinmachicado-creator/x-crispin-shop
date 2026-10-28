export type SizeCategoryType = 'tops' | 'jackets' | 'bottoms' | 'wearables' | 'accessories';

export interface SizeMeasurementRow {
  size: string; // e.g. 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'
  boliviaLatam: string; // e.g. '36', '38', '40', '42', '44', '46'
  usSize: string; // e.g. '34', '36', '38', '40', '42', '44'
  euSize: string; // e.g. '44', '46', '48', '50', '52', '54'
  ukSize: string; // e.g. '34', '36', '38', '40', '42', '44'
  chestCm: [number, number]; // [min, max]
  waistCm: [number, number];
  hipCm?: [number, number];
  lengthCm: number;
  heightRangeCm: [number, number];
  weightRangeKg: [number, number];
}

export interface WearableMeasurementRow {
  size: string; // e.g. '40mm', '42mm', '44mm', '46mm'
  wristCircumferenceCm: [number, number];
  strapLengthCm: string;
  recommendedWrist: string;
  fitsCase: string;
}

export interface AccessoryMeasurementRow {
  itemType: string;
  measurementName: string;
  sizeLabel: string;
  metricRange: string;
  imperialRange: string;
  notes: string;
}

export interface FittingStep {
  title: string;
  instruction: string;
  tip: string;
  iconName: string;
}

export interface SizeGuideCategoryConfig {
  id: SizeCategoryType;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  fittingSteps: FittingStep[];
  measurementsNotes: string[];
}

export const SIZE_CATEGORY_CONFIGS: Record<SizeCategoryType, SizeGuideCategoryConfig> = {
  tops: {
    id: 'tops',
    title: 'Poleras, Polos & Camisetas',
    subtitle: 'Ropa superior y camisetas oficiales',
    icon: 'Shirt',
    description: 'Medidas diseñadas para calce cómodo y ergonómico. Confeccionadas en algodón Pima y tejidos transpirables.',
    fittingSteps: [
      {
        title: '1. Pecho / Busto',
        instruction: 'Pasa la cinta métrica horizontalmente por debajo de las axilas y alrededor de la parte más ancha del pecho.',
        tip: 'Mantén los brazos relajados a los lados y no contengas la respiración.',
        iconName: 'Maximize2',
      },
      {
        title: '2. Cintura',
        instruction: 'Mide la circunferencia en la parte más estrecha de tu torso, generalmente 2-3 cm arriba del ombligo.',
        tip: 'No aprietes la cinta en exceso; deja espacio para un dedo de holgura.',
        iconName: 'Scale',
      },
      {
        title: '3. Largo Total',
        instruction: 'Mide en línea recta vertical desde el punto más alto del hombro (junto al cuello) hasta la base de la cadera.',
        tip: 'Para un calce regular la prenda debe cubrir el cinturón del pantalón.',
        iconName: 'ArrowUpDown',
      },
    ],
    measurementsNotes: [
      'Algodón pre-encogido: encogimiento máximo inferior al 1.5% tras el lavado.',
      'Si dudas entre dos tallas: la menor ofrece calce atlético (Slim Fit), la mayor brinda calce relajado (Regular/Comfort).',
    ],
  },
  jackets: {
    id: 'jackets',
    title: 'Chaquetas, Hoodies & Rompevientos',
    subtitle: 'Abrigos, polerones y prendas de invierno',
    icon: 'Shield',
    description: 'Prendas exteriores con espacio calculado para usar sobre una polera o camisa base.',
    fittingSteps: [
      {
        title: '1. Contorno de Pecho',
        instruction: 'Mide sobre la ropa interior o polera ligera pasando la cinta por la parte más prominente del pecho.',
        tip: 'Considera si planeas llevar prendas gruesas debajo en climas de altura (La Paz, Potosí, Oruro).',
        iconName: 'Maximize2',
      },
      {
        title: '2. Largo de Manga',
        instruction: 'Mide desde la punta del hombro exterior a lo largo del brazo ligeramente doblado hasta la articulación de la muñeca.',
        tip: 'El puño debe descansar cómodamente sin tirar al estirar los brazos.',
        iconName: 'Ruler',
      },
      {
        title: '3. Ancho de Hombros',
        instruction: 'Mide horizontalmente en la espalda desde la costura de un hombro hasta la costura del otro.',
        tip: 'La costura debe alinearse naturalmente con el final del hueso del hombro.',
        iconName: 'Scissors',
      },
    ],
    measurementsNotes: [
      'Tejidos térmicos e impermeables con forro interior aislante.',
      'Diseñadas con ajuste ergonómico que permite libertad total de movimiento.',
    ],
  },
  bottoms: {
    id: 'bottoms',
    title: 'Pantalones, Joggers & Bermudas',
    subtitle: 'Prendas inferiores y deportivas',
    icon: 'Layers',
    description: 'Cintura elástica o con pasadores, tiro medio y corte regular adaptado a contextura latinoamericana.',
    fittingSteps: [
      {
        title: '1. Cintura Natural',
        instruction: 'Rodea con la cinta métrica la zona donde normalmente descansa la pretina de tu pantalón.',
        tip: 'Mantén la cinta horizontal y firme pero cómoda.',
        iconName: 'Scale',
      },
      {
        title: '2. Cadera',
        instruction: 'Ponte de pie con los talones juntos y mide alrededor del punto de mayor volumen de las caderas y glúteos.',
        tip: 'Asegúrate de que la cinta no quede torcida en la parte trasera.',
        iconName: 'Maximize2',
      },
      {
        title: '3. Tiro / Largo de Entrepierna',
        instruction: 'Mide desde el punto más alto de la entrepierna por el interior de la pierna hasta el hueso del tobillo.',
        tip: 'Puedes medir un pantalón que ya te quede perfecto colocado plano sobre una mesa.',
        iconName: 'ArrowUpDown',
      },
    ],
    measurementsNotes: [
      'Los joggers incorporan pretina acanalada con cordón ajustable de alta resistencia.',
    ],
  },
  wearables: {
    id: 'wearables',
    title: 'Smartwatches & Correas de Muñeca',
    subtitle: 'Relojes inteligentes, pulsómetros y accesorios de muñeca',
    icon: 'Watch',
    description: 'Compatibilidad con cajas de 42mm y 46mm y correas intercambiables de cuero, silicona deportiva y acero.',
    fittingSteps: [
      {
        title: '1. Circunferencia de Muñeca',
        instruction: 'Usa una cinta métrica flexible o una tira de papel y rodea tu muñeca justo detrás del hueso.',
        tip: 'Si usas una tira de papel, márcala con un bolígrafo y mídelo contra una regla plana.',
        iconName: 'Watch',
      },
      {
        title: '2. Elección de Caja (42mm vs 46mm)',
        instruction: 'Muñecas de 13 a 17 cm lucen ideales con caja de 42mm. Muñecas de 16 a 21 cm calzan perfecto con 46mm.',
        tip: 'Ambos tamaños admiten correas estándar de liberación rápida (Quick-Release 22mm).',
        iconName: 'Maximize2',
      },
      {
        title: '3. Ajuste para Sensores Cardíacos (ECG / SpO2)',
        instruction: 'Para una lectura precisa del sensor óptico y ECG, el reloj debe estar ceñido sin cortar la circulación.',
        tip: 'Durante entrenamientos ajusta un orificio más apretado; para descanso mantén ajuste holgado.',
        iconName: 'Activity',
      },
    ],
    measurementsNotes: [
      'Todas las correas cuentan con hebilla o broche magnético microajustable.',
    ],
  },
  accessories: {
    id: 'accessories',
    title: 'Gorras, Morrales & Accesorios',
    subtitle: 'Snapbacks, mochilas ejecutivas y shakers',
    icon: 'ShoppingBag',
    description: 'Accesorios oficiales Factor X con ergonomía probada y materiales de alta durabilidad.',
    fittingSteps: [
      {
        title: '1. Gorras Snapback (Circunferencia Craneal)',
        instruction: 'Pasa la cinta métrica 1 cm por encima de las cejas y las orejas, alrededor de la parte más prominente de la cabeza.',
        tip: 'El broche snapback ajustable trasero cubre desde 54 cm hasta 61 cm (Talla Única Universal).',
        iconName: 'User',
      },
      {
        title: '2. Morrales & Mochilas Ejecutivas',
        instruction: 'Verifica la altura y profundidad del compartimento para asegurar que quepan tus catálogos A4 y laptops.',
        tip: 'La correa acolchada distribuye el peso diagonalmente evitando fatiga en los hombros.',
        iconName: 'ShoppingBag',
      },
    ],
    measurementsNotes: [
      'Capacidad y resistencia probadas para uso intensivo diario en Bolivia.',
    ],
  },
};

export const TOPS_MEASUREMENTS: SizeMeasurementRow[] = [
  {
    size: 'XS',
    boliviaLatam: '36',
    usSize: '34',
    euSize: '44',
    ukSize: '34',
    chestCm: [86, 91],
    waistCm: [71, 76],
    hipCm: [86, 91],
    lengthCm: 68,
    heightRangeCm: [160, 168],
    weightRangeKg: [50, 60],
  },
  {
    size: 'S',
    boliviaLatam: '38',
    usSize: '36',
    euSize: '46',
    ukSize: '36',
    chestCm: [91, 96],
    waistCm: [76, 81],
    hipCm: [91, 96],
    lengthCm: 70,
    heightRangeCm: [165, 172],
    weightRangeKg: [58, 68],
  },
  {
    size: 'M',
    boliviaLatam: '40',
    usSize: '38',
    euSize: '48',
    ukSize: '38',
    chestCm: [97, 102],
    waistCm: [81, 86],
    hipCm: [97, 102],
    lengthCm: 72,
    heightRangeCm: [170, 178],
    weightRangeKg: [68, 78],
  },
  {
    size: 'L',
    boliviaLatam: '42',
    usSize: '40',
    euSize: '50',
    ukSize: '40',
    chestCm: [103, 108],
    waistCm: [87, 93],
    hipCm: [103, 108],
    lengthCm: 74,
    heightRangeCm: [175, 183],
    weightRangeKg: [78, 88],
  },
  {
    size: 'XL',
    boliviaLatam: '44',
    usSize: '42',
    euSize: '52',
    ukSize: '42',
    chestCm: [109, 115],
    waistCm: [94, 101],
    hipCm: [109, 115],
    lengthCm: 76,
    heightRangeCm: [178, 188],
    weightRangeKg: [88, 98],
  },
  {
    size: 'XXL',
    boliviaLatam: '46',
    usSize: '44',
    euSize: '54',
    ukSize: '44',
    chestCm: [116, 122],
    waistCm: [102, 110],
    hipCm: [116, 122],
    lengthCm: 78,
    heightRangeCm: [182, 194],
    weightRangeKg: [98, 110],
  },
  {
    size: '3XL',
    boliviaLatam: '48',
    usSize: '46',
    euSize: '56',
    ukSize: '46',
    chestCm: [123, 130],
    waistCm: [111, 120],
    hipCm: [123, 130],
    lengthCm: 80,
    heightRangeCm: [185, 198],
    weightRangeKg: [110, 125],
  },
];

export const JACKETS_MEASUREMENTS: SizeMeasurementRow[] = [
  {
    size: 'S',
    boliviaLatam: '38',
    usSize: '36',
    euSize: '46',
    ukSize: '36',
    chestCm: [94, 99],
    waistCm: [78, 83],
    hipCm: [94, 99],
    lengthCm: 72,
    heightRangeCm: [165, 172],
    weightRangeKg: [60, 70],
  },
  {
    size: 'M',
    boliviaLatam: '40',
    usSize: '38',
    euSize: '48',
    ukSize: '38',
    chestCm: [100, 105],
    waistCm: [84, 89],
    hipCm: [100, 105],
    lengthCm: 74,
    heightRangeCm: [170, 178],
    weightRangeKg: [70, 80],
  },
  {
    size: 'L',
    boliviaLatam: '42',
    usSize: '40',
    euSize: '50',
    ukSize: '40',
    chestCm: [106, 112],
    waistCm: [90, 96],
    hipCm: [106, 112],
    lengthCm: 76,
    heightRangeCm: [175, 183],
    weightRangeKg: [80, 90],
  },
  {
    size: 'XL',
    boliviaLatam: '44',
    usSize: '42',
    euSize: '52',
    ukSize: '42',
    chestCm: [113, 120],
    waistCm: [97, 104],
    hipCm: [113, 120],
    lengthCm: 78,
    heightRangeCm: [178, 188],
    weightRangeKg: [90, 102],
  },
  {
    size: 'XXL',
    boliviaLatam: '46',
    usSize: '44',
    euSize: '54',
    ukSize: '44',
    chestCm: [121, 128],
    waistCm: [105, 114],
    hipCm: [121, 128],
    lengthCm: 80,
    heightRangeCm: [182, 194],
    weightRangeKg: [102, 115],
  },
];

export const BOTTOMS_MEASUREMENTS: SizeMeasurementRow[] = [
  {
    size: 'S',
    boliviaLatam: '38',
    usSize: '30',
    euSize: '46',
    ukSize: '30',
    chestCm: [90, 95],
    waistCm: [74, 80],
    hipCm: [90, 96],
    lengthCm: 100,
    heightRangeCm: [165, 172],
    weightRangeKg: [58, 68],
  },
  {
    size: 'M',
    boliviaLatam: '40',
    usSize: '32',
    euSize: '48',
    ukSize: '32',
    chestCm: [96, 101],
    waistCm: [81, 87],
    hipCm: [97, 103],
    lengthCm: 102,
    heightRangeCm: [170, 178],
    weightRangeKg: [68, 78],
  },
  {
    size: 'L',
    boliviaLatam: '42',
    usSize: '34',
    euSize: '50',
    ukSize: '34',
    chestCm: [102, 107],
    waistCm: [88, 94],
    hipCm: [104, 110],
    lengthCm: 104,
    heightRangeCm: [175, 183],
    weightRangeKg: [78, 88],
  },
  {
    size: 'XL',
    boliviaLatam: '44',
    usSize: '36',
    euSize: '52',
    ukSize: '36',
    chestCm: [108, 114],
    waistCm: [95, 102],
    hipCm: [111, 117],
    lengthCm: 106,
    heightRangeCm: [178, 188],
    weightRangeKg: [88, 98],
  },
  {
    size: 'XXL',
    boliviaLatam: '46',
    usSize: '38',
    euSize: '54',
    ukSize: '38',
    chestCm: [115, 122],
    waistCm: [103, 111],
    hipCm: [118, 125],
    lengthCm: 108,
    heightRangeCm: [182, 194],
    weightRangeKg: [98, 110],
  },
];

export const WEARABLES_MEASUREMENTS: WearableMeasurementRow[] = [
  {
    size: '42mm',
    wristCircumferenceCm: [13.0, 17.5],
    strapLengthCm: '120mm + 80mm',
    recommendedWrist: 'Muñeca Delgada a Mediana',
    fitsCase: 'Caja 42mm (Ancho perno 20mm)',
  },
  {
    size: '46mm',
    wristCircumferenceCm: [16.0, 21.5],
    strapLengthCm: '130mm + 90mm',
    recommendedWrist: 'Muñeca Mediana a Grande',
    fitsCase: 'Caja 46mm (Ancho perno 22mm)',
  },
  {
    size: 'Universal Ajustable',
    wristCircumferenceCm: [14.0, 22.0],
    strapLengthCm: 'Malla Milanesa / Cierre Magnético',
    recommendedWrist: 'Todo tipo de muñeca (Ajuste milimétrico continuo)',
    fitsCase: 'Adaptador Quick-Release 20mm y 22mm',
  },
];

export const ACCESSORIES_MEASUREMENTS: AccessoryMeasurementRow[] = [
  {
    itemType: 'Gorra Snapback Urbana',
    measurementName: 'Circunferencia de Cabeza',
    sizeLabel: 'Talla Única (Ajustable)',
    metricRange: '54.0 cm - 61.0 cm',
    imperialRange: '21.25" - 24.00"',
    notes: 'Broche regulable de 7 posiciones traseras para ajuste personalizado.',
  },
  {
    itemType: 'Morral Ejecutivo Factor X',
    measurementName: 'Dimensiones Exteriores',
    sizeLabel: 'Estándar Ejecutivo',
    metricRange: '32 cm x 24 cm x 10 cm',
    imperialRange: '12.6" x 9.4" x 3.9"',
    notes: 'Capacidad para tablets hasta 11", catálogos A4, shakers y cuadernos.',
  },
  {
    itemType: 'Morral Ejecutivo Factor X',
    measurementName: 'Largo de Correa de Hombro',
    sizeLabel: 'Correa Ajustable',
    metricRange: '80 cm a 145 cm',
    imperialRange: '31.5" a 57.0"',
    notes: 'Acolchado transpirable para hombro con mosquetón giratorio.',
  },
  {
    itemType: 'Large Coffee Shaker',
    measurementName: 'Volumen y Altura',
    sizeLabel: '700 ml',
    metricRange: '22 cm alto x 9.5 cm diámetro',
    imperialRange: '8.6" alto x 3.7" diámetro',
    notes: 'Compartimento inferior desenroscable para 2 sachets liofilizados.',
  },
];

/**
 * Detects whether a product belongs to clothing/apparel, wearables, or sizing accessories,
 * and determines the most appropriate size guide category.
 */
export function detectProductSizeCategory(product: {
  nombre?: string;
  categoriaId?: string;
  categoriaNombre?: string;
  descripcionCorta?: string;
  subcategoriaNombre?: string;
  variantes?: Array<{ name: string; attributeName?: string; attributeValue?: string }>;
}): { isSizable: boolean; category: SizeCategoryType; detectedLabel: string } {
  const text = `${product.nombre || ''} ${product.categoriaId || ''} ${product.categoriaNombre || ''} ${product.subcategoriaNombre || ''} ${product.descripcionCorta || ''}`.toLowerCase();

  // Check variants for size markers
  const hasAlphaSizeVariants = product.variantes?.some((v) => {
    const val = (v.attributeValue || v.name).toUpperCase();
    return ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'].some((s) => val === s || val.includes(`TALLA ${s}`) || val.includes(` ${s} `) || val.endsWith(` ${s}`));
  });

  const hasWatchVariants = product.variantes?.some((v) => {
    const val = (v.attributeValue || v.name).toLowerCase();
    return val.includes('42mm') || val.includes('46mm') || val.includes('correa') || val.includes('silicona');
  });

  // 1. Jackets / Hoodies / Abrigos
  if (
    text.includes('chaqueta') ||
    text.includes('cortaviento') ||
    text.includes('rompeviento') ||
    text.includes('hoodie') ||
    text.includes('poleron') ||
    text.includes('abrigo') ||
    text.includes('campera')
  ) {
    return { isSizable: true, category: 'jackets', detectedLabel: 'Chaquetas & Abrigos' };
  }

  // 2. Tops / Poleras / Camisetas / Polos
  if (
    text.includes('polera') ||
    text.includes('camiseta') ||
    text.includes('polo') ||
    text.includes('t-shirt') ||
    text.includes('remera') ||
    text.includes('chomba') ||
    text.includes('indumentaria') ||
    hasAlphaSizeVariants
  ) {
    return { isSizable: true, category: 'tops', detectedLabel: 'Poleras & Camisetas' };
  }

  // 3. Bottoms / Pantalones / Shorts
  if (
    text.includes('pantalon') ||
    text.includes('pantalón') ||
    text.includes('jogger') ||
    text.includes('bermuda') ||
    text.includes('short')
  ) {
    return { isSizable: true, category: 'bottoms', detectedLabel: 'Pantalones & Joggers' };
  }

  // 4. Smartwatches & Wearables
  if (
    text.includes('smartwatch') ||
    text.includes('reloj') ||
    text.includes('correa') ||
    text.includes('wearable') ||
    text.includes('pulsera') ||
    hasWatchVariants
  ) {
    return { isSizable: true, category: 'wearables', detectedLabel: 'Wearables & Correas' };
  }

  // 5. Caps & Accessories with sizing
  if (
    text.includes('gorra') ||
    text.includes('snapback') ||
    text.includes('morral') ||
    text.includes('mochila') ||
    text.includes('bolso') ||
    text.includes('shaker') ||
    text.includes('merchandising') ||
    text.includes('accesorios')
  ) {
    return { isSizable: true, category: 'accessories', detectedLabel: 'Accesorios & Gorras' };
  }

  return { isSizable: false, category: 'tops', detectedLabel: '' };
}

/**
 * Calculates a recommended size based on user input.
 */
export function calculateRecommendedSize(params: {
  heightCm?: number;
  weightKg?: number;
  chestCm?: number;
  waistCm?: number;
  category: SizeCategoryType;
}): { recommendedSize: string; fitNote: string; confidence: 'high' | 'medium' } {
  const { heightCm, weightKg, chestCm, waistCm } = params;

  // If chest measurement is provided
  if (chestCm && chestCm > 0) {
    const match = TOPS_MEASUREMENTS.find((row) => chestCm >= row.chestCm[0] && chestCm <= row.chestCm[1]);
    if (match) {
      return {
        recommendedSize: match.size,
        fitNote: `Según tu medida de pecho (${chestCm} cm), tu talla ideal es ${match.size} para un calce regular.`,
        confidence: 'high',
      };
    }
    if (chestCm < 86) {
      return { recommendedSize: 'XS', fitNote: 'Medida esbelta: talla XS recomendada.', confidence: 'medium' };
    }
    return { recommendedSize: 'XXL', fitNote: 'Medida amplia: talla XXL o 3XL recomendada.', confidence: 'medium' };
  }

  // If height and weight are provided
  if (heightCm && weightKg) {
    // Height & Weight BMI approximation
    if (weightKg <= 58 && heightCm <= 168) {
      return { recommendedSize: 'XS', fitNote: 'Contextura liviana: calce óptimo en XS.', confidence: 'high' };
    }
    if (weightKg <= 68 && heightCm <= 173) {
      return { recommendedSize: 'S', fitNote: 'Contextura delgada/atlética: talla S recomendada.', confidence: 'high' };
    }
    if (weightKg <= 78 && heightCm <= 180) {
      return { recommendedSize: 'M', fitNote: 'Contextura promedio: talla M estándar.', confidence: 'high' };
    }
    if (weightKg <= 88 && heightCm <= 185) {
      return { recommendedSize: 'L', fitNote: 'Estatura y contextura sólida: talla L recomendada.', confidence: 'high' };
    }
    if (weightKg <= 100) {
      return { recommendedSize: 'XL', fitNote: 'Contextura ancha/muscular: talla XL recomendada.', confidence: 'high' };
    }
    return { recommendedSize: 'XXL', fitNote: 'Contextura amplia: talla XXL recomendada.', confidence: 'high' };
  }

  // Default fallback
  return {
    recommendedSize: 'M',
    fitNote: 'Talla mediana estándar para contextura promedio en Bolivia.',
    confidence: 'medium',
  };
}
