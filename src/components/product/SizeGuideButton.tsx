import React, { useState } from 'react';
import { Ruler } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { detectProductSizeCategory } from '../../data/sizeGuideData';
import { SizeGuideModal } from './SizeGuideModal';

interface SizeGuideButtonProps {
  product: Product;
  selectedVariant?: ProductVariant;
  onSelectVariant?: (variant: ProductVariant) => void;
  variant?: 'link' | 'button' | 'badge';
  className?: string;
  forceShow?: boolean;
}

export const SizeGuideButton: React.FC<SizeGuideButtonProps> = ({
  product,
  selectedVariant,
  onSelectVariant,
  variant = 'link',
  className = '',
  forceShow = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const detection = detectProductSizeCategory(product);

  // If not sizable and not forced, don't show
  if (!detection.isSizable && !forceShow) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(true);
  };

  return (
    <>
      {variant === 'link' && (
        <button
          type="button"
          onClick={handleClick}
          id={`size-guide-btn-${product.id}`}
          className={`inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 hover:text-cyan-900 underline underline-offset-4 decoration-cyan-400 hover:decoration-cyan-700 transition-colors cursor-pointer group ${className}`}
          title="Ver tabla de conversión de tallas y cómo medirte"
        >
          <Ruler className="w-3.5 h-3.5 text-cyan-600 group-hover:scale-110 transition-transform" />
          <span>Guía de Tallas & Medidas</span>
        </button>
      )}

      {variant === 'button' && (
        <button
          type="button"
          onClick={handleClick}
          id={`size-guide-btn-${product.id}`}
          className={`px-3 py-2 bg-slate-50 hover:bg-cyan-50/80 text-slate-700 hover:text-cyan-900 border border-slate-200/90 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${className}`}
        >
          <Ruler className="w-3.5 h-3.5 text-cyan-600" />
          <span>Guía de Tallas</span>
        </button>
      )}

      {variant === 'badge' && (
        <button
          type="button"
          onClick={handleClick}
          id={`size-guide-btn-${product.id}`}
          className={`p-1.5 bg-white/90 backdrop-blur-xs text-slate-700 hover:text-cyan-700 hover:bg-white rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold ${className}`}
          title="Ver Guía de Tallas"
        >
          <Ruler className="w-3 h-3 text-cyan-600" />
          <span className="hidden sm:inline">Tallas</span>
        </button>
      )}

      <SizeGuideModal
        product={product}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        selectedVariant={selectedVariant}
        onSelectVariant={onSelectVariant}
      />
    </>
  );
};
