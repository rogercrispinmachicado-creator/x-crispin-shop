import React from 'react';
import { Heart, X, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';

interface WishlistToastProps {
  onNavigateToWishlist?: () => void;
}

export const WishlistToast: React.FC<WishlistToastProps> = ({ onNavigateToWishlist }) => {
  const { notification, dismissNotification } = useWishlist();

  if (!notification) return null;

  return (
    <aside
      aria-label="Notificaciones de lista de deseos"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full sm:w-auto animate-in slide-in-from-bottom-5 fade-in duration-200"
    >
      <div className="bg-slate-900/95 text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            notification.type === 'added'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          <Heart
            className={`w-4 h-4 ${
              notification.type === 'added' ? 'fill-rose-400 text-rose-400 animate-pulse' : 'text-slate-400'
            }`}
          />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <p className="text-xs font-semibold text-white leading-tight truncate">
            {notification.message}
          </p>
          {onNavigateToWishlist && (
            <button
              onClick={() => {
                dismissNotification();
                onNavigateToWishlist();
              }}
              className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 mt-0.5 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Ver mi lista de deseos</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <button
          onClick={dismissNotification}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Cerrar notificación"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
