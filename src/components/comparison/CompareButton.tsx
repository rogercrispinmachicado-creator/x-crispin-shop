import React from 'react';
import { Scale, Check } from 'lucide-react';
import { useComparison } from '../../context/ComparisonContext';

interface CompareButtonProps {
  productId: string;
  productName?: string;
  variant?: 'icon' | 'badge' | 'button';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CompareButton: React.FC<CompareButtonProps> = ({
  productId,
  productName,
  variant = 'button',
  size = 'md',
  className = '',
}) => {
  const { isInCompare, toggleCompare } = useComparison();
  const selected = isInCompare(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCompare(productId);
  };

  if (variant === 'badge') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
          selected
            ? 'bg-cyan-600 text-white shadow-2xs'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        } ${className}`}
        title={selected ? 'Quitar del comparador' : 'Agregar al comparador (máx 3)'}
        aria-label={selected ? `Quitar ${productName || ''} de la comparativa` : `Comparar ${productName || ''}`}
      >
        {selected ? (
          <Check className="w-3 h-3 text-white" />
        ) : (
          <Scale className="w-3 h-3 text-slate-500" />
        )}
        <span>{selected ? 'En comparador' : 'Comparar'}</span>
      </button>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
          selected
            ? 'bg-cyan-600 text-white border-cyan-600 shadow-2xs'
            : 'bg-white/90 text-slate-600 border-slate-200 hover:bg-white hover:text-cyan-600'
        } ${className}`}
        title={selected ? 'Quitar de la comparativa' : 'Comparar producto (hasta 3)'}
        aria-label={selected ? `Quitar ${productName || ''} de la comparativa` : `Comparar ${productName || ''}`}
      >
        {selected ? (
          <Check className="w-4 h-4" />
        ) : (
          <Scale className="w-4 h-4" />
        )}
      </button>
    );
  }

  // Default 'button' variant
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
        selected
          ? 'bg-cyan-50 border-cyan-400 text-cyan-800 shadow-2xs'
          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900'
      } ${className}`}
      title={selected ? 'Quitar de la comparativa' : 'Comparar especificaciones lado a lado (hasta 3)'}
      aria-label={selected ? `Quitar ${productName || ''} de la comparativa` : `Comparar ${productName || ''}`}
    >
      {selected ? (
        <>
          <Check className="w-3.5 h-3.5 text-cyan-600" />
          <span className="text-cyan-700">En comparador</span>
        </>
      ) : (
        <>
          <Scale className="w-3.5 h-3.5 text-slate-500" />
          <span>Comparar</span>
        </>
      )}
    </button>
  );
};
