import React, { useState } from 'react';
import {
  Star,
  X,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  ThumbsUp,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Product, User } from '../../types';
import { reviewService } from '../../services/reviewService';

interface WriteReviewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onReviewSubmitted: () => void;
}

const BOLIVIAN_DEPARTMENTS = [
  'La Paz',
  'Santa Cruz',
  'Cochabamba',
  'Oruro',
  'Potosí',
  'Chuquisaca',
  'Tarija',
  'Beni',
  'Pando',
];

const RATING_DESCRIPTIONS: Record<number, string> = {
  5: 'Excelente - Superó todas mis expectativas',
  4: 'Muy Bueno - Lo recomiendo totalmente',
  3: 'Bueno - Cumple adecuadamente su función',
  2: 'Regular - Podría mejorar en varios aspectos',
  1: 'Insatisfecho - Tuve inconvenientes',
};

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  product,
  isOpen,
  onClose,
  currentUser,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [recommend, setRecommend] = useState<boolean>(true);
  const [city, setCity] = useState(currentUser.city || currentUser.department || 'La Paz');
  const [reviewerName, setReviewerName] = useState(
    currentUser.name ? `${currentUser.name} ${currentUser.lastName || ''}`.trim() : 'Comprador'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check verified status
  const verification = reviewService.checkVerifiedBuyer(product.id, currentUser);
  const [isVerified, setIsVerified] = useState(verification.isVerified);
  const [verifiedOrderNumber, setVerifiedOrderNumber] = useState(verification.orderNumber);

  if (!isOpen) return null;

  const handleSimulateVerification = () => {
    const res = reviewService.simulatePurchaseVerification(product.id, currentUser, product.nombre);
    setIsVerified(true);
    setVerifiedOrderNumber(res.orderNumber);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Por favor ingresa un título representativo para tu reseña.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 15) {
      setErrorMsg('Por favor escribe un comentario de al menos 15 caracteres sobre tu experiencia.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      reviewService.addReview({
        productoId: product.id,
        productoNombre: product.nombre,
        usuarioId: currentUser.id,
        usuarioNombre: reviewerName,
        usuarioCiudad: city,
        calificacion: rating,
        titulo: title.trim(),
        comentario: comment.trim(),
        recomienda: recommend,
        compraVerificada: isVerified,
        orderNumber: verifiedOrderNumber,
      });

      setIsSubmitting(false);
      onReviewSubmitted();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg('Error al guardar la reseña. Inténtalo de nuevo.');
    }
  };

  const activeRatingValue = hoverRating || rating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="write-review-title"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h3 id="write-review-title" className="text-base font-black text-white">
                Calificar & Opinar
              </h3>
              <p className="text-xs text-slate-300 truncate max-w-sm">
                {product.nombre}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            aria-label="Cerrar modal de reseña"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Verified Buyer Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
              isVerified
                ? 'bg-emerald-50/80 border-emerald-300/80 text-emerald-950'
                : 'bg-amber-50/80 border-amber-300/80 text-amber-950'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {isVerified ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-black block">
                  {isVerified
                    ? '¡Comprador Verificado X-CRISPIN!'
                    : 'Estado: Opinión de la Comunidad'}
                </span>
                <p className="text-[11px] opacity-90 mt-0.5">
                  {isVerified
                    ? `Compra confirmada (Pedido #${verifiedOrderNumber}). Tu reseña lucirá la insignia oficial de Compra Verificada.`
                    : 'Aún no registras una compra confirmada de este producto con tu cuenta.'}
                </p>
              </div>
            </div>

            {!isVerified && (
              <button
                type="button"
                onClick={handleSimulateVerification}
                className="px-3 py-1.5 bg-slate-900 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs whitespace-nowrap self-start sm:self-auto cursor-pointer"
                title="Simula que compraste este producto para probar la insignia verificada"
              >
                <span>Simular Compra Verificada</span>
              </button>
            )}
          </div>

          {/* Interactive Star Rating Selector */}
          <div className="space-y-2 text-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Tu Calificación General:
            </label>

            <div className="flex items-center justify-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isLit = starVal <= activeRatingValue;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRating(starVal)}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 hover:scale-115 transition-transform cursor-pointer focus:outline-hidden"
                    aria-label={`Calificar con ${starVal} estrellas`}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        isLit
                          ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                          : 'text-slate-300 hover:text-slate-400'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <p className="text-xs font-bold text-slate-800 h-4">
              {RATING_DESCRIPTIONS[activeRatingValue] || 'Selecciona una calificación'}
            </p>
          </div>

          {/* Review Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              Título de tu reseña: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Excelente calidad, superó mis expectativas"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          {/* Review Comment */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-700">
                Tu opinión detallada: <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {comment.length} caracteres
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="¿Qué te pareció el funcionamiento, empaque, tiempo de entrega en Bolivia y calidad del producto?"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none leading-relaxed"
            />
          </div>

          {/* Author Name and Department / City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Nombre a mostrar:
              </label>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Departamento / Ciudad:
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
              >
                {BOLIVIAN_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Would you recommend toggle */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-cyan-600" />
              <span className="text-xs font-bold text-slate-800">
                ¿Recomiendas este producto a otros compradores?
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRecommend(true)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  recommend
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setRecommend(false)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !recommend
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Loyalty X-Points Bonus Incentive Notice */}
          <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-100 border border-amber-300 rounded-xl flex items-center gap-2 text-xs text-amber-950 font-bold">
            <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />
            <span>
              {isVerified
                ? '¡Sumarás +25 X-Points al Club de Fidelidad por dejar tu reseña verificada!'
                : 'Las opiniones verificadas acumulan 25 X-Points de bonificación para tu cuenta.'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              id="submit-review-btn"
              className="px-6 py-2.5 bg-slate-900 hover:bg-cyan-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Publicando...' : 'Publicar Mi Reseña'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
