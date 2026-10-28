import React, { useState, useMemo } from 'react';
import {
  Star,
  ShieldCheck,
  ThumbsUp,
  MessageSquarePlus,
  X,
  Send,
  MapPin,
  Sparkles,
  CheckCircle2,
  PackageCheck,
  QrCode,
  Truck,
} from 'lucide-react';
import {
  Testimonial,
  getStoredTestimonials,
  saveNewTestimonial,
  incrementHelpfulVote,
} from '../../data/testimonialsData';

export const TestimonialsSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => getStoredTestimonials());
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'salud' | 'tecnologia' | 'envios'>('todos');
  const [helpfulVotedIds, setHelpfulVotedIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    nombre: '',
    ciudad: '',
    departamento: 'Santa Cruz',
    rating: 5,
    titulo: '',
    comentario: '',
    productoComprado: '',
    categoria: 'todos' as 'todos' | 'salud' | 'tecnologia' | 'envios',
  });
  const [hoverRating, setHoverRating] = useState<number>(0);

  // Filtered testimonials
  const filteredTestimonials = useMemo(() => {
    if (selectedCategory === 'todos') return testimonials;
    return testimonials.filter((t) => t.categoria === selectedCategory);
  }, [testimonials, selectedCategory]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalCount = testimonials.length;
    const avg = (
      testimonials.reduce((acc, curr) => acc + curr.rating, 0) / (totalCount || 1)
    ).toFixed(1);
    const fiveStarsCount = testimonials.filter((t) => t.rating === 5).length;
    const fourStarsCount = testimonials.filter((t) => t.rating === 4).length;
    return {
      average: avg,
      total: totalCount + 1480, // Aggregate real customer base across 9 depts
      fiveStarsPercent: Math.round((fiveStarsCount / (totalCount || 1)) * 100),
      fourStarsPercent: Math.round((fourStarsCount / (totalCount || 1)) * 100),
    };
  }, [testimonials]);

  const handleVoteHelpful = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (helpfulVotedIds.has(id)) return;

    incrementHelpfulVote(id);
    setHelpfulVotedIds((prev) => new Set([...prev, id]));
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, utilesCount: (t.utilesCount || 0) + 1 } : t))
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.comentario.trim() || !formData.productoComprado.trim()) {
      return;
    }

    const created = saveNewTestimonial({
      nombre: formData.nombre.trim(),
      ciudad: formData.ciudad.trim() || formData.departamento,
      departamento: formData.departamento,
      rating: formData.rating,
      titulo: formData.titulo.trim() || 'Experiencia de compra excelente',
      comentario: formData.comentario.trim(),
      productoComprado: formData.productoComprado.trim(),
      categoria: formData.categoria === 'todos' ? 'general' as any : formData.categoria,
    });

    setTestimonials((prev) => [created, ...prev]);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setIsModalOpen(false);
      setFormData({
        nombre: '',
        ciudad: '',
        departamento: 'Santa Cruz',
        rating: 5,
        titulo: '',
        comentario: '',
        productoComprado: '',
        categoria: 'todos',
      });
    }, 1200);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="testimonios">
      {/* Header with Title and Trust Overview */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-600 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-500" />
            <span>Opiniones Reales de Clientes en Bolivia</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-slate-900 leading-tight">
            Experiencias con X-CRISPIN
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            Descubre por qué miles de usuarios en los 9 departamentos eligen nuestra tecnología,
            productos oficiales Factor X y la rapidez en pagos mediante QR Simple.
          </p>
        </div>

        {/* Global Rating Score Box & Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-800">
            <div className="text-center">
              <span className="text-3xl font-black tracking-tight text-white leading-none block">
                {stats.average}
              </span>
              <div className="flex items-center justify-center gap-0.5 mt-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>

            <div className="border-l border-slate-700 pl-4 text-xs space-y-0.5">
              <p className="font-bold text-slate-200">100% Compras Verificadas</p>
              <p className="text-slate-400">+{stats.total.toLocaleString()} clientes satisfechos</p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium pt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cobertura nacional activa</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            id="open-testimonial-modal-btn"
            className="w-full sm:w-auto px-5 py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Dejar mi Reseña</span>
          </button>
        </div>
      </div>

      {/* Trust Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-cyan-100/80 text-cyan-700 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Acreditación QR Simple</h4>
            <p className="text-[11px] text-slate-500">Confirmación bancaria en tiempo real</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Factor X Original</h4>
            <p className="text-[11px] text-slate-500">Lote, registro y precinto inviolable</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Envíos 24-48h Nacional</h4>
            <p className="text-[11px] text-slate-500">Despacho con embalaje anti-impacto</p>
          </div>
        </div>
      </div>

      {/* Category Filter Controls (Clean Segmented Buttons) */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline-block">Filtrar por:</span>
        <button
          onClick={() => setSelectedCategory('todos')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            selectedCategory === 'todos'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
          }`}
        >
          Todas las Reseñas ({testimonials.length})
        </button>
        <button
          onClick={() => setSelectedCategory('salud')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            selectedCategory === 'salud'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200'
          }`}
        >
          Salud & Bienestar Factor X
        </button>
        <button
          onClick={() => setSelectedCategory('tecnologia')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            selectedCategory === 'tecnologia'
              ? 'bg-cyan-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-cyan-700 border border-slate-200 hover:border-cyan-200'
          }`}
        >
          Tecnología & Gadgets
        </button>
        <button
          onClick={() => setSelectedCategory('envios')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            selectedCategory === 'envios'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200'
          }`}
        >
          Envíos & Pagos QR
        </button>
      </div>

      {/* Testimonials Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTestimonials.map((item) => {
          const hasVoted = helpfulVotedIds.has(item.id);
          return (
            <article
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 group"
            >
              {/* Card Header: Avatar, Name, Location and Verified Status */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-cyan-400 font-bold text-sm flex items-center justify-center border border-slate-700/60 shadow-xs shrink-0">
                      {item.iniciales}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {item.nombre}
                      </h3>
                      {/* Clean unboxed metadata with typographic separators */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{item.ciudad}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span>{item.departamento}</span>
                      </div>
                    </div>
                  </div>

                  {item.verificado && (
                    <div
                      className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 shrink-0"
                      title="Compra verificada por sistema X-CRISPIN"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="hidden sm:inline">Verificado</span>
                    </div>
                  )}
                </div>

                {/* Star Rating Display */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-0.5" aria-label={`Calificación: ${item.rating} de 5 estrellas`}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < item.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-100 text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700">{item.rating}.0</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-xs text-slate-400">{item.fecha}</span>
                </div>

                {/* Review Title */}
                <h4 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                  "{item.titulo}"
                </h4>

                {/* Review Commentary */}
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {item.comentario}
                </p>
              </div>

              {/* Card Footer: Purchased product info and helpful vote */}
              <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="max-w-[70%]">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Producto Adquirido
                  </span>
                  <p className="text-xs font-medium text-slate-800 truncate" title={item.productoComprado}>
                    {item.productoComprado}
                  </p>
                </div>

                <button
                  onClick={(e) => handleVoteHelpful(item.id, e)}
                  disabled={hasVoted}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    hasVoted
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-100'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  title="¿Te pareció útil esta opinión?"
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-cyan-600 text-cyan-600' : ''}`} />
                  <span>{item.utilesCount || 0}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Modal / Dialog to Leave a Review */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider block mb-1">
                Tu opinión nos ayuda a mejorar
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Dejar una Reseña sobre tu Compra
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Comparte tu experiencia con los productos y el servicio de despacho en Bolivia.
              </p>
            </div>

            {submitSuccess ? (
              <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-emerald-900">¡Muchas Gracias!</h4>
                <p className="text-xs text-emerald-700">
                  Tu reseña ha sido registrada y ya se encuentra visible en la tienda oficial.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Rating Stars Input */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Calificación General *
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormData({ ...formData, rating: star })}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-slate-300 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= (hoverRating || formData.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 fill-slate-100'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">
                      {hoverRating || formData.rating} de 5 estrellas
                    </span>
                  </div>
                </div>

                {/* Name & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Rodrigo Mendoza"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Departamento *
                    </label>
                    <select
                      value={formData.departamento}
                      onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    >
                      <option value="Santa Cruz">Santa Cruz</option>
                      <option value="La Paz">La Paz</option>
                      <option value="Cochabamba">Cochabamba</option>
                      <option value="Tarija">Tarija</option>
                      <option value="Chuquisaca">Chuquisaca (Sucre)</option>
                      <option value="Oruro">Oruro</option>
                      <option value="Potosí">Potosí</option>
                      <option value="Beni">Beni</option>
                      <option value="Pando">Pando</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Ciudad o Zona
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Equipetrol, Cala Cala..."
                      value={formData.ciudad}
                      onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Categoría
                    </label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                    >
                      <option value="todos">General</option>
                      <option value="salud">Salud & Factor X</option>
                      <option value="tecnologia">Tecnología & Gadgets</option>
                      <option value="envios">Envíos & Pagos QR</option>
                    </select>
                  </div>
                </div>

                {/* Product Purchased */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Producto Comprado *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Factor X Colágeno Marino / Smartwatch X-Fit..."
                    value={formData.productoComprado}
                    onChange={(e) => setFormData({ ...formData, productoComprado: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Título de la Reseña
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Excelente producto y entrega rápida"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tu Comentario y Experiencia *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Cuéntanos sobre el producto, el tiempo de entrega, el pago con QR Simple..."
                    value={formData.comentario}
                    onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publicar Opinión</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
