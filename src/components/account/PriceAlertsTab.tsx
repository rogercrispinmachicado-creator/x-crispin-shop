import React from 'react';
import { Bell, Trash2, ArrowRight, TrendingDown, CheckCircle2, Sparkles } from 'lucide-react';
import { usePriceAlerts } from '../../hooks/usePriceAlerts';
import { useAuth } from '../../context/AuthContext';

interface PriceAlertsTabProps {
  onSelectProduct?: (slug: string) => void;
  onNavigateToCatalog?: () => void;
}

export const PriceAlertsTab: React.FC<PriceAlertsTabProps> = ({
  onSelectProduct,
  onNavigateToCatalog,
}) => {
  const { currentUser } = useAuth();
  const { userAlerts, unsubscribe, simulatePriceDrop, restorePrice } = usePriceAlerts();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-slate-200">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-600" />
            <span>Mis Alertas de Precio</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Productos que estás siguiendo para recibir alertas cuando baje su precio
          </p>
        </div>

        <span className="px-3 py-1 bg-cyan-50 border border-cyan-200 text-cyan-800 rounded-full text-xs font-bold self-start sm:self-auto">
          {userAlerts.length} {userAlerts.length === 1 ? 'alerta activa' : 'alertas activas'}
        </span>
      </div>

      {userAlerts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto">
            <Bell className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-slate-900">No tienes alertas de precio activas</h3>
            <p className="text-xs text-slate-500">
              Explora el catálogo y pulsa &quot;Avisarme si baja de precio&quot; en cualquier producto para recibir avisos de ofertas por correo.
            </p>
          </div>
          {onNavigateToCatalog && (
            <button
              onClick={onNavigateToCatalog}
              className="px-6 py-2.5 bg-slate-900 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Explorar Catálogo
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start gap-4">
                <img
                  src={alert.productImage || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800'}
                  alt={alert.productName}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 bg-slate-50 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        alert.status === 'TRIGGERED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {alert.status === 'TRIGGERED' ? '¡Rebaja Detectada!' : 'Monitoreando'}
                    </span>
                    <button
                      onClick={() => unsubscribe(alert.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar alerta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2">
                    {alert.productName}
                  </h3>

                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-2 text-xs">
                    <span className="text-slate-500">
                      Precio inicial: <strong className="text-slate-900">Bs. {alert.currentPrice}</strong>
                    </span>
                    {alert.targetPrice && (
                      <span className="text-cyan-700 font-bold">
                        Objetivo: Bs. {alert.targetPrice}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Alert details & actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  Notificar a: <strong className="text-slate-600">{alert.email}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => simulatePriceDrop(alert.productId, alert.targetPrice)}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                    title="Simular rebaja de precio de este producto"
                  >
                    Simular Rebaja
                  </button>

                  {onSelectProduct && (
                    <button
                      type="button"
                      onClick={() => onSelectProduct(alert.productSlug)}
                      className="px-3 py-1 bg-slate-900 hover:bg-cyan-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ver</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
