export interface Testimonial {
  id: string;
  nombre: string;
  iniciales: string;
  ciudad: string;
  departamento: string;
  rating: number; // 1-5
  titulo: string;
  comentario: string;
  productoComprado: string;
  categoria: 'todos' | 'salud' | 'tecnologia' | 'envios';
  verificado: boolean;
  fecha: string;
  utilesCount: number;
}

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    nombre: 'Carlos Méndez',
    iniciales: 'CM',
    ciudad: 'Santa Cruz de la Sierra',
    departamento: 'Santa Cruz',
    rating: 5,
    titulo: 'Despacho el mismo día y pago instantáneo con QR Simple',
    comentario:
      'El pago con QR Simple se acreditó al segundo sin comisiones raras. El Smartwatch X-Fit AMOLED me llegó esa misma tarde en Equipetrol con empaque sellado de fábrica. Excelente servicio.',
    productoComprado: 'Smartwatch X-Fit AMOLED Titanium',
    categoria: 'tecnologia',
    verificado: true,
    fecha: 'Hace 2 días',
    utilesCount: 18,
  },
  {
    id: 'test-2',
    nombre: 'Dra. Valeria Quiroga',
    iniciales: 'VQ',
    ciudad: 'La Paz',
    departamento: 'La Paz',
    rating: 5,
    titulo: 'Calidad farmacéutica certificada en Factor X',
    comentario:
      'Adquirí el Colágeno Marino Hidrolizado Factor X para complementar mi nutrición deportiva. La solubilidad es óptima, sin grumos ni sabor residual. Llegó en 24h a Sopocachi con su sello holográfico intacto.',
    productoComprado: 'Factor X Colágeno Marino Hidrolizado Plus',
    categoria: 'salud',
    verificado: true,
    fecha: 'Hace 4 días',
    utilesCount: 24,
  },
  {
    id: 'test-3',
    nombre: 'Ing. Diego Arancibia',
    iniciales: 'DA',
    ciudad: 'Cochabamba',
    departamento: 'Cochabamba',
    rating: 5,
    titulo: 'Cancelación de ruido real y audio de alta fidelidad',
    comentario:
      'Tenía mis dudas sobre pedir audio de gama alta online en Bolivia, pero los Auriculares Pro X superaron toda expectativa. La batería dura días enteros y el aislamiento acústico en el teleférico o en la calle es de 10.',
    productoComprado: 'Auriculares Inalámbricos Pro X ANC',
    categoria: 'tecnologia',
    verificado: true,
    fecha: 'Hace 6 días',
    utilesCount: 15,
  },
  {
    id: 'test-4',
    nombre: 'Camila Flores',
    iniciales: 'CF',
    ciudad: 'Tarija',
    departamento: 'Tarija',
    rating: 5,
    titulo: 'Atención personalizada por WhatsApp y resultados visibles',
    comentario:
      'El asesor por WhatsApp me resolvió todas las dudas sobre cómo tomar el Café Verde Quemador Factor X. El envío a Tarija fue ultra rápido y los resultados en energía y ligereza se notan desde la primera semana.',
    productoComprado: 'Factor X Café Verde Quemador & Termogénico',
    categoria: 'salud',
    verificado: true,
    fecha: 'Hace 1 semana',
    utilesCount: 31,
  },
  {
    id: 'test-5',
    nombre: 'Fernando Torrico',
    iniciales: 'FT',
    ciudad: 'Sucre',
    departamento: 'Chuquisaca',
    rating: 5,
    titulo: 'Protección anti-impactos y seriedad total',
    comentario:
      'Pedí una estación de carga magnética y accesorios para mi trabajo. Llegaron a Sucre por encomienda perfectamente protegidos con plástico de burbuja reforzado. La factura digital llegó al correo de inmediato.',
    productoComprado: 'Powerbank Magnético 10000mAh Slim Wireless',
    categoria: 'envios',
    verificado: true,
    fecha: 'Hace 1 semana',
    utilesCount: 12,
  },
  {
    id: 'test-6',
    nombre: 'Andrea Mamani',
    iniciales: 'AM',
    ciudad: 'El Alto',
    departamento: 'La Paz',
    rating: 5,
    titulo: 'Excelente pack de bienestar familiar',
    comentario:
      'Compramos el Pack Inmunológico Factor X para mis papás en Ciudad Satélite. Muy agradecida por la puntualidad del repartidor y la facilidad de pagar al momento mediante transferencia bancaria BCP.',
    productoComprado: 'Pack Bienestar Total Factor X Familia',
    categoria: 'salud',
    verificado: true,
    fecha: 'Hace 2 semanas',
    utilesCount: 20,
  },
  {
    id: 'test-7',
    nombre: 'Lic. Roberto Vaca',
    iniciales: 'RV',
    ciudad: 'Trinidad',
    departamento: 'Beni',
    rating: 5,
    titulo: 'Llegada aérea sin demoras a Trinidad',
    comentario:
      'Muchas tiendas no envían directo al Beni o tardan semanas. Con X-CRISPIN coordinaron despacho por avión y al día siguiente ya estaba retirando mi paquete de la terminal. Seguridad y cumplimiento garantizado.',
    productoComprado: 'Teclado Mecánico Inalámbrico RGB Bolivia Edition',
    categoria: 'envios',
    verificado: true,
    fecha: 'Hace 2 semanas',
    utilesCount: 27,
  },
  {
    id: 'test-8',
    nombre: 'Mariana Zeballos',
    iniciales: 'MZ',
    ciudad: 'Potosí',
    departamento: 'Potosí',
    rating: 5,
    titulo: 'Lote oficial verificado y registro sanitario',
    comentario:
      'Para suplementos alimenticios siempre reviso que sean originales. Los productos Factor X vienen con número de registro y fecha de vencimiento visible. Recomendado para toda la gente que busca calidad real.',
    productoComprado: 'Factor X Multivitamínico Activo con Zinc y Magnesio',
    categoria: 'salud',
    verificado: true,
    fecha: 'Hace 3 semanas',
    utilesCount: 14,
  },
  {
    id: 'test-9',
    nombre: 'Gabriel Siles',
    iniciales: 'GS',
    ciudad: 'Oruro',
    departamento: 'Oruro',
    rating: 5,
    titulo: 'Rastreo de pedido en tiempo real muy preciso',
    comentario:
      'La herramienta de seguimiento de pedidos en la web me indicaba exactamente cuándo el paquete salió de almacén y cuándo llegó a Oruro. Cero incertidumbre.',
    productoComprado: 'Cargador Rápido GaN 65W Multi-Puerto Pro',
    categoria: 'envios',
    verificado: true,
    fecha: 'Hace 3 semanas',
    utilesCount: 19,
  },
];

const LOCAL_STORAGE_KEY = 'xc_testimonials_v1';

export function getStoredTestimonials(): Testimonial[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return INITIAL_TESTIMONIALS;
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_TESTIMONIALS));
      return INITIAL_TESTIMONIALS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn('Error reading stored testimonials:', err);
  }
  return INITIAL_TESTIMONIALS;
}

export function saveNewTestimonial(testimonial: Omit<Testimonial, 'id' | 'iniciales' | 'verificado' | 'fecha' | 'utilesCount'>): Testimonial {
  const current = getStoredTestimonials();
  const names = testimonial.nombre.trim().split(' ');
  const iniciales = names.length > 1 
    ? `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
    : testimonial.nombre.slice(0, 2).toUpperCase();

  const newEntry: Testimonial = {
    ...testimonial,
    id: `user-test-${Date.now()}`,
    iniciales,
    verificado: true,
    fecha: 'Reciente',
    utilesCount: 1,
  };

  const updated = [newEntry, ...current];
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Error saving new testimonial to localStorage:', err);
    }
  }

  return newEntry;
}

export function incrementHelpfulVote(id: string): number {
  const current = getStoredTestimonials();
  let newCount = 0;
  const updated = current.map((item) => {
    if (item.id === id) {
      newCount = (item.utilesCount || 0) + 1;
      return { ...item, utilesCount: newCount };
    }
    return item;
  });

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }
  return newCount;
}
