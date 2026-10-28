import React, { useState } from 'react';
import { Bell, Check, TrendingDown } from 'lucide-react';
import { Product } from '../../types';
import { usePriceAlerts } from '../../hooks/usePriceAlerts';
import { useAuth } from '../../context/AuthContext';
import { NotifyMeModal } from './NotifyMeModal';

interface NotifyMeButtonProps {
  product: Product;
  variant?: 'button' | 'icon' | 'banner';
  className?: string;
  onSelectProduct?: (slug: string) => void;
  onNavigateToCatalog?: () => void;
}

export const NotifyMeButton: React.FC<NotifyMeButtonProps> = ({
  product,
  variant = 'button',
  className = '',
  onSelectProduct,
  onNavigateToCatalog,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentUser } = useAuth();
  const { getAlertForProduct } = usePriceAlerts();

  const activeAlert = getAlertForProduct(product.id, currentUser?.email);
  const hasAlert = !!activeAlert;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <>
      {variant === 'icon' && (
        <button
          type="button"
          onClick={handleClick}
          title={
            hasAlert
              ? `Alerta activa: Avisar si baja de precio (${activeAlert?.targetPrice ? `Bs. ${activeAlert.targetPrice}` : 'Cualquier rebaja'})`
              : 'Avisarme si baja de precio'
          }
          id={`notify-btn-icon-${product.id}`}
          className={`relative p-2 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center ${
            hasAlert
              ? 'bg-amber-500 text-white shadow-xs hover:bg-amber-600'
              : 'bg-white/90 backdrop-blur-xs text-slate-700 hover:text-cyan-700 hover:bg-white shadow-xs border border-slate-200/60'
          } ${className}`}
          aria-label="Avisarme si baja de precio"
        >
          <Bell className={`w-3.5 h-3.5 ${hasAlert ? 'fill-current animate-pulse' : ''}`} />
          {hasAlert && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
          )}
        </button>
      )}

      {variant === 'button' && (
        <button
          type="button"
          onClick={handleClick}
          id={`notify-btn-main-${product.id}`}
          className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
            hasAlert
              ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 shadow-2xs'
              : 'bg-slate-50 hover:bg-cyan-50/70 text-slate-700 hover:text-cyan-800 border-slate-200/90'
          } ${className}`}
        >
          <Bell
            className={`w-3.5 h-3.5 ${
              hasAlert ? 'text-amber-600 fill-amber-500' : 'text-cyan-600'
            }`}
          />
          <span>
            {hasAlert
              ? activeAlert?.targetPrice
                ? `Alerta activa (Objetivo: Bs. ${activeAlert.targetPrice})`
                : 'Alerta de precio activa'
              : 'Avisarme si baja de precio'}
          </span>
          {hasAlert && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          )}
        </button>
      )}

      {variant === 'banner' && (
        <div
          onClick={handleClick}
          id={`notify-banner-${product.id}`}
          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
            hasAlert
              ? 'bg-gradient-to-r from-amber-50 to-orange-50/60 border-amber-200 text-amber-950'
              : 'bg-gradient-to-r from-cyan-50/70 via-slate-50 to-slate-50 hover:from-cyan-100/60 border-cyan-200/80 text-slate-800'
          } ${className}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                hasAlert ? 'bg-amber-500 text-white' : 'bg-cyan-600 text-white shadow-2xs'
              }`}
            >
              <Bell className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-tight block truncate">
                  {hasAlert ? 'Alerta de precio configurada' : '¿Esperas una rebaja?'}
                </span>
                {hasAlert && (
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded-full uppercase">
                    Activa
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {hasAlert
                  ? `Te avisaremos a ${activeAlert?.email} si el precio baja`
                  : 'Ingresa tu correo y te notificaremos cuando baje de precio'}
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-colors ${
              hasAlert
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                : 'bg-slate-900 text-white hover:bg-cyan-700'
            }`}
          >
            {hasAlert ? 'Ver / Modificar' : 'Avisarme'}
          </span>
        </div>
      )}

      {/* The Modal */}
      <NotifyMeModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNavigateToCatalog={onNavigateToCatalog}
        onSelectProduct={onSelectProduct}
      />
    </>
  );
};
