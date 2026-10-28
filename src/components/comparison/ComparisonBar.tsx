import React from 'react';
import { Scale, X, ArrowRight, Trash2, Plus, AlertCircle } from 'lucide-react';
import { useComparison } from '../../context/ComparisonContext';

export const ComparisonBar: React.FC = () => {
  const {
    compareProducts,
    removeFromCompare,
    clearCompare,
    openCompareModal,
    isCompareModalOpen,
    toastMessage,
    clearToast,
  } = useComparison();

  if (compareProducts.length === 0 || isCompareModalOpen) {
    // If there's a toast message even when 0 items (e.g. max items reached), show toast
    if (toastMessage && !isCompareModalOpen) {
      return (
        <div className="fixed bottom-24 sm:bottom-20 left-1/2 -translate-x-1/2 z-40 max-w-md w-11/12 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-slate-900/95 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between gap-3 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={clearToast}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  const count = compareProducts.length;

  return (
    <aside
      aria-label="Barra de comparación de productos"
      className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
    >
      {/* Optional feedback toast message above bar */}
      {toastMessage && (
        <div className="mb-2 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 text-cyan-300 text-xs font-medium rounded-full border border-slate-700 shadow-md backdrop-blur-xs">
            <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>{toastMessage}</span>
          </span>
        </div>
      )}

      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Left: Indicator & product chips */}
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-2 pl-1 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div className="hidden md:block">
              <span className="text-xs font-black tracking-tight text-white block">
                Comparador
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {count}/3 seleccionados
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-700 hidden md:block shrink-0" />

          {/* Product Thumbnail Chips */}
          <div className="flex items-center gap-2">
            {compareProducts.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center gap-2 p-1.5 pr-2 bg-slate-800/90 rounded-xl border border-slate-700 group hover:border-slate-600 transition-all shrink-0 max-w-[140px] sm:max-w-[170px]"
              >
                <img
                  src={prod.imagenes[0]}
                  alt={prod.nombre}
                  className="w-7 h-7 rounded-lg object-cover bg-slate-950 shrink-0"
                />
                <span className="text-[11px] font-bold text-slate-200 truncate">
                  {prod.nombre}
                </span>
                <button
                  type="button"
                  onClick={() => removeFromCompare(prod.id)}
                  className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition-colors cursor-pointer shrink-0"
                  title="Quitar de la comparación"
                  aria-label={`Quitar ${prod.nombre} de la comparación`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Empty slots indicator up to 3 */}
            {Array.from({ length: 3 - count }).map((_, idx) => (
              <div
                key={`empty-slot-${idx}`}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-slate-700 text-slate-500 rounded-xl text-[11px] font-medium shrink-0"
              >
                <Plus className="w-3 h-3" />
                <span>Espacio libre</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            type="button"
            onClick={clearCompare}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-xs transition-colors cursor-pointer"
            title="Limpiar lista"
            aria-label="Limpiar lista de comparación"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={openCompareModal}
            id="open-comparison-table-btn"
            className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md shadow-cyan-900/30 transition-all cursor-pointer"
          >
            <Scale className="w-4 h-4" />
            <span>Comparar ({count})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
