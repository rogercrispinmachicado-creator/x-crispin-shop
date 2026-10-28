import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, Database, Check, Sparkles } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useCacheStats } from '../../hooks/useProductsCache';

interface OfflineCacheBannerProps {
  showDetails?: boolean;
}

export const OfflineCacheBanner: React.FC<OfflineCacheBannerProps> = ({ showDetails = false }) => {
  const { isOnline, wasOffline } = useNetworkStatus();
  const { stats, syncNow } = useCacheStats();
  const [showReconnectedAlert, setShowReconnectedAlert] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // When connection returns, flash a brief reassurance alert
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnectedAlert(true);
      const timer = setTimeout(() => {
        setShowReconnectedAlert(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    syncNow();
    await new Promise((r) => setTimeout(r, 450));
    setIsSyncing(false);
  };

  // Render reconnected banner
  if (showReconnectedAlert) {
    return (
      <aside
        aria-label="Notificación de red"
        className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-sm transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-200 animate-pulse" />
            <span>
              <strong>Conexión restablecida</strong> — El catálogo de X-CRISPIN se ha sincronizado en tiempo real.
            </span>
          </div>
          <span className="text-[11px] bg-emerald-700/80 px-2 py-0.5 rounded-md text-emerald-100 font-mono">
            Online
          </span>
        </div>
      </aside>
    );
  }

  // If online, don't show the offline banner (unless showDetails is true for debug/admin)
  if (isOnline && !showDetails) {
    return null;
  }

  // Render offline navigation warning
  if (!isOnline) {
    return (
      <aside
        aria-label="Estado de conexión offline"
        className="bg-slate-900 text-slate-100 border-b border-cyan-800/40 px-4 py-2.5 text-xs shadow-md"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <WifiOff className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white">Modo sin conexión activo:</span>{' '}
              <span className="text-slate-300">
                Navegando con el catálogo de productos y categorías guardado en caché inteligente.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[11px] text-cyan-300 font-medium">
              <Database className="w-3.5 h-3.5" />
              <span>{stats.entryCount} recursos guardados</span>
            </span>

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Reintentar'}</span>
            </button>
          </div>
        </div>
      </aside>
    );
  }

  return null;
};

/**
 * Subtle Badge to show in Catalog/Product header for cache status & refresh
 */
export const CacheStatusPill: React.FC<{
  fromCache?: boolean;
  isRevalidating?: boolean;
  isOffline?: boolean;
  onRefresh?: () => void;
  className?: string;
}> = ({ fromCache, isRevalidating, isOffline, onRefresh, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
        isOffline
          ? 'bg-amber-50 text-amber-800 border border-amber-200'
          : isRevalidating
          ? 'bg-cyan-50 text-cyan-800 border border-cyan-200 animate-pulse'
          : fromCache
          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          : 'bg-slate-100 text-slate-700 border border-slate-200'
      } ${className}`}
    >
      {isOffline ? (
        <>
          <WifiOff className="w-3 h-3 text-amber-600" />
          <span>Caché Offline</span>
        </>
      ) : isRevalidating ? (
        <>
          <RefreshCw className="w-3 h-3 text-cyan-600 animate-spin" />
          <span>Actualizando datos...</span>
        </>
      ) : fromCache ? (
        <>
          <Check className="w-3 h-3 text-emerald-600" />
          <span>Caché Activo</span>
        </>
      ) : (
        <>
          <Database className="w-3 h-3 text-slate-500" />
          <span>Catálogo Verificado</span>
        </>
      )}

      {onRefresh && !isOffline && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRefresh();
          }}
          title="Forzar actualización de datos frescos del backend"
          className="ml-0.5 hover:text-cyan-700 text-slate-400 p-0.5 rounded cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${isRevalidating ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
};
