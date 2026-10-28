import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  ShieldCheck,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Filter,
  CheckCircle2,
  Calendar,
  MapPin,
  Plus,
  HelpCircle,
  Check,
} from 'lucide-react';
import { Product, ProductReview, User } from '../../types';
import { reviewService, RatingBreakdown } from '../../services/reviewService';
import { storage } from '../../services/storage';
import { WriteReviewModal } from './WriteReviewModal';

interface ProductReviewsSectionProps {
  product: Product;
  currentUser: User;
  onReviewAdded?: () => void;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  product,
  currentUser,
  onReviewAdded,
}) => {
  const [reviews, setReviews] = useState<ProductReview[]>(() =>
    reviewService.getReviewsForProduct(product.id)
  );
  const [breakdown, setBreakdown] = useState<RatingBreakdown>(() =>
    reviewService.getRatingBreakdown(product.id)
  );
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({});

  // Sync reviews when storage updates or product changes
  const syncReviews = () => {
    const list = reviewService.getReviewsForProduct(product.id);
    setReviews(list);
    setBreakdown(reviewService.getRatingBreakdown(product.id));
  };

  useEffect(() => {
    syncReviews();
    const unsubscribe = storage.subscribe(syncReviews);
    return unsubscribe;
  }, [product.id]);

  const verification = useMemo(
    () => reviewService.checkVerifiedBuyer(product.id, currentUser),
    [product.id, currentUser]
  );

  // Filtered and sorted reviews
  const filteredReviews = useMemo(() => {
    return reviews
      .filter((r) => {
        if (filterRating !== 'all' && Math.round(r.calificacion) !== filterRating) {
          return false;
        }
        if (onlyVerified && !r.compraVerificada) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'highest') return b.calificacion - a.calificacion;
        if (sortBy === 'lowest') return a.calificacion - b.calificacion;
        if (sortBy === 'helpful') return (b.votosUtiles || 0) - (a.votosUtiles || 0);
        // newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [reviews, filterRating, onlyVerified, sortBy]);

  const handleHelpfulVote = (reviewId: string) => {
    if (votedMap[reviewId]) return;
    reviewService.voteHelpful(reviewId);
    setVotedMap((prev) => ({ ...prev, [reviewId]: true }));
    syncReviews();
  };

  return (
    <section
      id="product-reviews-section"
      className="space-y-8 scroll-mt-24 pt-8 border-t border-slate-200 font-sans"
    >
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Opiniones & Calificaciones de Clientes
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full">
              {breakdown.totalReviews} opiniones
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reseñas reales y verificadas de compradores en todos los departamentos de Bolivia
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsWriteModalOpen(true)}
          id="open-write-review-btn"
          className="px-5 py-2.5 bg-slate-900 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Escribir una Reseña</span>
        </button>
      </div>

      {/* Rating Breakdown Hero Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-7 bg-white rounded-3xl border border-slate-200 shadow-xs">
        {/* Left: Overall Score Metric */}
        <div className="md:col-span-4 flex flex-col justify-center items-center md:items-start text-center md:text-left space-y-3 md:border-r md:border-slate-100 md:pr-6">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tight text-slate-950 font-mono">
              {breakdown.averageRating.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-slate-400">/ 5.0</span>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(breakdown.averageRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-200 fill-slate-100'
                }`}
              />
            ))}
          </div>

          <p className="text-xs font-medium text-slate-500">
            Basado en <strong className="text-slate-900">{breakdown.totalReviews}</strong> valoraciones de clientes
          </p>

          <div className="pt-2 flex flex-col gap-1.5 w-full">
            <div className="p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-[11px] text-emerald-900 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{breakdown.recommendationRate}% de compradores lo recomiendan</span>
            </div>

            <div className="p-2.5 bg-cyan-50 border border-cyan-200/80 rounded-xl flex items-center gap-2 text-[11px] text-cyan-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0" />
              <span>{breakdown.verifiedCount} compras verificadas oficiales</span>
            </div>
          </div>
        </div>

        {/* Right: Distribution Bars */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-2.5">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
            Distribución de Calificaciones:
          </h4>

          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = breakdown.starCounts[star];
            const pct = breakdown.starPercentages[star];
            const isSelected = filterRating === star;

            return (
              <button
                key={star}
                type="button"
                onClick={() => setFilterRating(filterRating === star ? 'all' : star)}
                className={`flex items-center gap-3 p-1.5 rounded-xl transition-colors text-left cursor-pointer group ${
                  isSelected ? 'bg-amber-50/80 ring-1 ring-amber-300' : 'hover:bg-slate-50'
                }`}
                title={`Filtrar por ${star} estrellas`}
              >
                <div className="flex items-center gap-1 w-14 shrink-0 text-xs font-bold text-slate-700">
                  <span>{star}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                </div>

                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="w-16 text-right shrink-0 text-xs font-mono font-bold text-slate-500">
                  <span>{pct}%</span>
                  <span className="text-[10px] text-slate-400 ml-1">({count})</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Verified Buyer Banner (Contextual info for the current user) */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block">
              {verification.isVerified
                ? `¡Eres un comprador verificado de este producto! (Pedido #${verification.orderNumber})`
                : '¿Compraste este producto en tienda o con un asesor en Bolivia?'}
            </span>
            <p className="text-[11px] text-slate-500">
              {verification.isVerified
                ? 'Tu opinión llevará la insignia oficial de Compra Verificada y sumará +25 X-Points a tu cuenta.'
                : 'Comparte tu opinión para orientar a la comunidad. Si deseas simular la verificación, pulsa "Escribir una Reseña".'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsWriteModalOpen(true)}
          className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 transition-colors shadow-2xs shrink-0 cursor-pointer self-start sm:self-auto"
        >
          Dejar mi Opinión
        </button>
      </div>

      {/* Filters and Sorting Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        {/* Rating filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterRating('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              filterRating === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Todas ({breakdown.totalReviews})
          </button>
          {([5, 4, 3, 2, 1] as const).map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFilterRating(filterRating === star ? 'all' : star)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterRating === star
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{star}</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[10px] opacity-75">({breakdown.starCounts[star]})</span>
            </button>
          ))}
        </div>

        {/* Sorting & Verified toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyVerified}
              onChange={(e) => setOnlyVerified(e.target.checked)}
              className="rounded text-cyan-600 focus:ring-cyan-500 w-3.5 h-3.5"
            />
            <span>Solo Verificadas</span>
          </label>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="newest">Más recientes</option>
            <option value="highest">Mayor calificación</option>
            <option value="lowest">Menor calificación</option>
            <option value="helpful">Más útiles</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-900">
            No se encontraron opiniones con estos filtros
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Sé el primero en calificar este producto o restablece los filtros para ver todas las valoraciones.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setFilterRating('all');
                setOnlyVerified(false);
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Restablecer Filtros
            </button>
            <button
              type="button"
              onClick={() => setIsWriteModalOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Escribir Reseña
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((rev) => {
            const hasVoted = votedMap[rev.id];
            const dateStr = new Date(rev.createdAt).toLocaleDateString('es-BO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <div
                key={rev.id}
                className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-3 transition-all hover:border-slate-300"
              >
                {/* Header: User, Verified Badge, Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {/* User initial avatar */}
                    <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                      {rev.usuarioNombre.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">
                          {rev.usuarioNombre}
                        </span>
                        {rev.usuarioCiudad && (
                          <span className="text-[11px] text-slate-500 flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {rev.usuarioCiudad}
                          </span>
                        )}
                      </div>

                      {rev.compraVerificada && (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-black">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Compra Verificada</span>
                          {rev.orderNumber && (
                            <span className="text-slate-400 font-mono">
                              (Ref. #{rev.orderNumber})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stars & Date */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.calificacion
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 fill-slate-100'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {dateStr}
                    </span>
                  </div>
                </div>

                {/* Review Title & Content */}
                <div className="space-y-1.5 pt-1">
                  <h4 className="text-sm font-black text-slate-900 leading-snug">
                    {rev.titulo}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {rev.comentario}
                  </p>
                </div>

                {/* Recommendation & Helpful Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  {rev.recomienda !== false ? (
                    <span className="text-emerald-700 text-[11px] font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Recomienda este producto</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">
                      No recomienda este producto
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleHelpfulVote(rev.id)}
                    disabled={hasVoted}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      hasVoted
                        ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <ThumbsUp className={`w-3 h-3 ${hasVoted ? 'text-cyan-600 fill-cyan-500' : 'text-slate-400'}`} />
                    <span>¿Útil? ({rev.votosUtiles || 0})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Write Review Modal */}
      <WriteReviewModal
        product={product}
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        currentUser={currentUser}
        onReviewSubmitted={() => {
          syncReviews();
          if (onReviewAdded) onReviewAdded();
        }}
      />
    </section>
  );
};
