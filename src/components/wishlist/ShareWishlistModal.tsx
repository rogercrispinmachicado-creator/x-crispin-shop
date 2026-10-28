import React, { useState, useEffect, useMemo } from 'react';
import {
  Share2,
  X,
  Copy,
  Check,
  QrCode,
  Sparkles,
  Gift,
  ExternalLink,
  MessageCircle,
  Send,
  Eye,
  Calendar,
  Lock,
  Globe,
  Info,
} from 'lucide-react';
import { User, Product, WishlistOccasion } from '../../types';
import { sharedWishlistService } from '../../services/sharedWishlistService';

interface ShareWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  wishlistProducts: Product[];
  onNavigateToPublicView?: (wishlistCode: string) => void;
}

const OCCASIONS: Array<{ key: WishlistOccasion; label: string; icon: string }> = [
  { key: 'Cumpleaños', label: 'Cumpleaños', icon: '🎂' },
  { key: 'Navidad / Fiestas', label: 'Navidad / Fiestas', icon: '🎄' },
  { key: 'Graduación', label: 'Graduación', icon: '🎓' },
  { key: 'Boda / Matrimonio', label: 'Boda / Matrimonio', icon: '💍' },
  { key: 'Aniversario', label: 'Aniversario', icon: '🥂' },
  { key: 'Baby Shower', label: 'Baby Shower', icon: '🍼' },
  { key: 'Lista Personal', label: 'Lista Personal', icon: '⭐' },
  { key: 'Otro', label: 'Otra Ocasión', icon: '🎁' },
];

export const ShareWishlistModal: React.FC<ShareWishlistModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  wishlistProducts,
  onNavigateToPublicView,
}) => {
  const [occasion, setOccasion] = useState<WishlistOccasion>('Cumpleaños');
  const [title, setTitle] = useState(`Mis Deseos & Regalos de ${currentUser.name}`);
  const [customMessage, setCustomMessage] = useState(
    '¡Hola familia y amigos! Aquí les comparto los productos que me encantarían como regalo. ¡Muchas gracias por el detalle!'
  );
  const [isPublic, setIsPublic] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // Synchronize or create shared wishlist
  const currentWishlist = useMemo(() => {
    if (!isOpen) return null;
    return sharedWishlistService.getOrCreateForUser({
      owner: currentUser,
      productIds: wishlistProducts.map((p) => p.id),
      title,
      occasion,
      customMessage,
      isPublic,
    });
  }, [isOpen, currentUser, wishlistProducts, occasion, title, customMessage, isPublic]);

  if (!isOpen || !currentWishlist) return null;

  const shareUrl = sharedWishlistService.generateShortShareUrl(currentWishlist);
  const fullShareUrl = sharedWishlistService.generateShareUrl(currentWishlist);
  const whatsappUrl = sharedWishlistService.generateWhatsAppShareUrl(currentWishlist, wishlistProducts);
  const telegramUrl = sharedWishlistService.generateTelegramShareUrl(currentWishlist);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
    fullShareUrl
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveAndPreview = () => {
    if (onNavigateToPublicView) {
      onClose();
      onNavigateToPublicView(currentWishlist.id);
    } else {
      window.open(fullShareUrl, '_blank');
    }
  };

  const totalValue = wishlistProducts.reduce((sum, p) => sum + p.precio, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-wishlist-modal-title"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300">
              <Gift className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="share-wishlist-modal-title" className="text-base font-black text-white">
                  Compartir Lista de Deseos & Regalos
                </h3>
                <span className="text-[10px] font-mono text-rose-300 font-bold bg-rose-900/60 px-2 py-0.5 rounded-full border border-rose-700/50">
                  {currentWishlist.id}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Genera un enlace público para enviar a amigos y familiares por WhatsApp
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
          {/* Main Share Link Box */}
          <div className="p-4 bg-rose-50/70 border border-rose-200/90 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-rose-950 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-rose-600" />
                <span>Enlace Público de tu Lista de Regalos:</span>
              </label>
              <span className="text-[11px] font-mono text-rose-700 font-bold">
                {wishlistProducts.length} {wishlistProducts.length === 1 ? 'artículo' : 'artículos'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3.5 py-2.5 bg-white border border-rose-300 rounded-xl text-xs font-mono text-slate-800 selection:bg-rose-200 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                id="copy-wishlist-link-btn"
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-900 hover:bg-rose-700 text-white'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            {/* Quick Share Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="share-wishlist-whatsapp-btn"
                className="flex-1 min-w-[140px] py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Enviar por WhatsApp</span>
              </a>

              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </a>

              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-slate-600" />
                <span>{showQr ? 'Ocultar QR' : 'Ver QR'}</span>
              </button>
            </div>

            {/* QR Code expansion */}
            {showQr && (
              <div className="pt-3 border-t border-rose-200/80 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left animate-in fade-in duration-200">
                <div className="p-2 bg-white rounded-xl border border-rose-200 shadow-xs shrink-0">
                  <img
                    src={qrImageUrl}
                    alt="Código QR de la Lista de Deseos"
                    className="w-28 h-28 object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <h5 className="text-xs font-black text-slate-900">
                    Escanea para ver la lista en tu teléfono
                  </h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Tus amigos pueden escanear este código QR directamente con su cámara para abrir tu lista de deseos en eventos familiares o reuniones.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Configuration Form */}
          <div className="space-y-4 pt-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>Personalizar Datos de la Lista:</span>
            </h4>

            {/* Occasion Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Motivo / Ocasión del Regalo:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {OCCASIONS.map((occ) => (
                  <button
                    key={occ.key}
                    type="button"
                    onClick={() => setOccasion(occ.key)}
                    className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      occasion === occ.key
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{occ.icon}</span>
                    <span className="truncate">{occ.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Wishlist Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Título de la lista:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Mis Regalos de Cumpleaños 2026"
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Personalized Note */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Mensaje personalizado para tus amigos y familiares:
              </label>
              <textarea
                rows={2}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Escribe un mensaje de saludo..."
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            {/* Gifting Features Explanation */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Gift className="w-4 h-4 text-rose-600" />
                <span>¿Cómo funciona para quienes reciban tu enlace?</span>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4">
                <li>Podrán ver cada producto con sus fotos, precios en Bolivianos y detalles oficiales.</li>
                <li>Podrán <strong>reservar un artículo</strong> para que ningún otro familiar lo compre repetido.</li>
                <li>Podrán comprar el regalo con envío directo a tu ciudad o a su propio domicilio.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            Total estimado de la lista: <strong className="text-slate-900 font-mono">Bs. {totalValue}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleSaveAndPreview}
              id="view-public-wishlist-preview-btn"
              className="px-5 py-2.5 bg-slate-900 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Ver Vista Pública de Regalos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
