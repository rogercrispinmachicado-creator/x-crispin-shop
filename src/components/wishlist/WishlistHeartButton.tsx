import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';

interface WishlistHeartButtonProps {
  productId: string;
  productName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const WishlistHeartButton: React.FC<WishlistHeartButtonProps> = ({
  productId,
  productName,
  className = '',
  size = 'md',
  showLabel = false,
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const saved = isInWishlist(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(productId, productName);
  };

  const sizeClasses = {
    sm: 'w-7 h-7 p-1.5',
    md: 'w-9 h-9 p-2',
    lg: 'w-11 h-11 p-2.5',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (showLabel) {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={saved ? 'Quitar de lista de deseos' : 'Guardar en lista de deseos'}
        title={saved ? 'Quitar de mi lista de deseos' : 'Guardar en mi lista de deseos'}
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
          saved
            ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 shadow-xs'
            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
        } ${className}`}
      >
        <Heart
          className={`${iconSizes[size]} transition-transform duration-200 ${
            saved ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-400 group-hover:text-rose-500'
          }`}
        />
        <span>{saved ? 'En tu Lista de Deseos' : 'Guardar para Después'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? 'Quitar de lista de deseos' : 'Guardar en lista de deseos'}
      title={saved ? 'Quitar de mi lista de deseos' : 'Guardar en mi lista de deseos'}
      className={`rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm hover:scale-110 active:scale-95 ${sizeClasses[size]} ${
        saved
          ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/80 shadow-rose-100'
          : 'bg-white/90 backdrop-blur-xs text-slate-400 hover:text-rose-500 hover:bg-white border border-slate-200/70 hover:border-rose-200'
      } ${className}`}
    >
      <Heart
        className={`${iconSizes[size]} transition-all duration-300 ${
          saved ? 'fill-rose-500 text-rose-500 scale-110' : 'stroke-2'
        }`}
      />
    </button>
  );
};
