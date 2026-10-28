import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'rounded';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rounded',
}) => {
  const variantStyles = {
    rectangular: 'rounded-none',
    circular: 'rounded-full',
    rounded: 'rounded-xl',
  };

  return (
    <div
      aria-hidden="true"
      className={`bg-slate-200/80 animate-pulse ${variantStyles[variant]} ${className}`}
    />
  );
};

export const ProductCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col shadow-xs ${className}`}
      aria-hidden="true"
    >
      {/* Image Skeleton with Badges */}
      <div className="relative aspect-square bg-slate-100/90 overflow-hidden animate-pulse">
        {/* Placeholder discount tag */}
        <div className="absolute top-3 left-3 w-12 h-5 bg-slate-200 rounded-lg" />
        {/* Placeholder category badge */}
        <div className="absolute top-3 right-3 w-16 h-4 bg-slate-200 rounded" />
        {/* Image center icon placeholder */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-16 bg-slate-200/60 rounded-2xl" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2.5">
          {/* SKU & Star Rating */}
          <div className="flex items-center justify-between">
            <Skeleton className="w-16 h-3 rounded" />
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="w-3 h-3 rounded-xs" />
                ))}
              </div>
              <Skeleton className="w-5 h-3 rounded ml-1" />
            </div>
          </div>

          {/* Product Title (2 lines) */}
          <div className="space-y-1.5 pt-0.5">
            <Skeleton className="w-5/6 h-4 rounded-md" />
            <Skeleton className="w-3/5 h-4 rounded-md" />
          </div>

          {/* Factor Points & Presentation Tag */}
          <div className="flex items-center gap-2 pt-0.5">
            <Skeleton className="w-20 h-4 rounded" />
            <Skeleton className="w-24 h-4 rounded" />
          </div>

          {/* Short Description (2 lines) */}
          <div className="space-y-1 pt-1">
            <Skeleton className="w-full h-3 rounded" />
            <Skeleton className="w-4/5 h-3 rounded" />
          </div>
        </div>

        {/* Pricing, Stock & Buttons */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          {/* Price & Stock */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <Skeleton className="w-20 h-6 rounded-md" />
              <Skeleton className="w-12 h-3.5 rounded" />
            </div>
            <Skeleton className="w-16 h-3.5 rounded-full" />
          </div>

          {/* Action Buttons (COMPRAR & AGREGAR) */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Skeleton className="w-full h-8 rounded-xl" />
            <Skeleton className="w-full h-8 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const CategorySidebarSkeleton: React.FC = () => {
  return (
    <aside className="space-y-6" aria-hidden="true">
      {/* Search Input Skeleton */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
        <Skeleton className="w-24 h-3 rounded" />
        <Skeleton className="w-full h-8 rounded-xl" />
      </div>

      {/* Categories List Skeleton */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="w-20 h-3 rounded" />
          <Skeleton className="w-10 h-3 rounded" />
        </div>
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded-xl">
              <Skeleton className="w-3/4 h-3.5 rounded" />
              <Skeleton className="w-5 h-3.5 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Filters Checkboxes Skeleton */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
        <Skeleton className="w-28 h-3 rounded" />
        <div className="space-y-2.5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="w-4/5 h-3 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Price Range Skeleton */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
        <Skeleton className="w-24 h-3 rounded" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="w-full h-8 rounded-xl" />
          <Skeleton className="w-full h-8 rounded-xl" />
        </div>
      </div>
    </aside>
  );
};

export const CatalogGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      role="status"
      aria-label="Cargando productos del catálogo..."
    >
      {[...Array(count)].map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 font-sans"
      role="status"
      aria-label="Cargando información del producto..."
    >
      {/* Top Breadcrumb & Status Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-14 h-3.5 rounded" />
          <span className="text-slate-300">/</span>
          <Skeleton className="w-24 h-3.5 rounded" />
          <span className="text-slate-300">/</span>
          <Skeleton className="w-40 h-3.5 rounded" />
        </div>
        <Skeleton className="w-28 h-6 rounded-full" />
      </div>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Large Image */}
          <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden border border-slate-200/90 relative animate-pulse flex items-center justify-center">
            <div className="absolute top-4 left-4 w-20 h-6 bg-slate-200 rounded-xl" />
            <div className="absolute top-4 right-4 w-24 h-6 bg-slate-200 rounded-lg" />
            <div className="w-28 h-28 bg-slate-200/70 rounded-3xl" />
          </div>

          {/* 4 Thumbnails */}
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, idx) => (
              <div
                key={idx}
                className="aspect-square bg-slate-100 rounded-xl border border-slate-200 animate-pulse flex items-center justify-center"
              >
                <div className="w-8 h-8 bg-slate-200 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Information, Pricing & CTAs */}
        <div className="lg:col-span-6 space-y-6">
          {/* Badges & Rating */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="w-20 h-5 rounded-lg" />
              <Skeleton className="w-28 h-5 rounded-lg" />
              <Skeleton className="w-24 h-5 rounded-lg" />
              <div className="ml-auto flex items-center gap-1.5">
                <Skeleton className="w-20 h-4 rounded" />
                <Skeleton className="w-16 h-4 rounded" />
              </div>
            </div>

            {/* Title (2 lines) */}
            <div className="space-y-2 pt-1">
              <Skeleton className="w-11/12 h-8 rounded-xl" />
              <Skeleton className="w-3/4 h-8 rounded-xl" />
            </div>

            {/* Short Description */}
            <div className="space-y-1.5 pt-2">
              <Skeleton className="w-full h-3.5 rounded" />
              <Skeleton className="w-11/12 h-3.5 rounded" />
              <Skeleton className="w-4/5 h-3.5 rounded" />
            </div>
          </div>

          {/* Pricing & Bolivian Scale Card */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-baseline gap-3">
              <Skeleton className="w-36 h-9 rounded-xl" />
              <Skeleton className="w-24 h-5 rounded" />
              <Skeleton className="w-20 h-4 rounded ml-auto" />
            </div>

            {/* 3-tier Price Scale Placeholder */}
            <div className="pt-3 border-t border-slate-200/70 space-y-2">
              <Skeleton className="w-48 h-3.5 rounded" />
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="w-full h-14 rounded-xl" />
                <Skeleton className="w-full h-14 rounded-xl" />
                <Skeleton className="w-full h-14 rounded-xl" />
              </div>
            </div>

            {/* Stock line */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
              <div className="flex items-center gap-2">
                <Skeleton className="w-2.5 h-2.5 rounded-full" />
                <Skeleton className="w-44 h-3.5 rounded" />
              </div>
              <Skeleton className="w-32 h-3 rounded" />
            </div>
          </div>

          {/* Variants Selector Skeleton */}
          <div className="space-y-2">
            <Skeleton className="w-36 h-3 rounded" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="w-24 h-9 rounded-xl" />
              <Skeleton className="w-28 h-9 rounded-xl" />
              <Skeleton className="w-20 h-9 rounded-xl" />
            </div>
          </div>

          {/* Quantity & Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <Skeleton className="w-32 h-11 rounded-xl" />
              <Skeleton className="flex-1 h-11 rounded-xl" />
            </div>
            <Skeleton className="w-full h-12 rounded-xl" />
          </div>

          {/* Value Pillars Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="w-3/4 h-3 rounded" />
                  <Skeleton className="w-1/2 h-2.5 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs & Details Skeleton */}
      <div className="pt-6 border-t border-slate-200 space-y-6">
        <div className="flex gap-4 border-b border-slate-200 pb-3">
          <Skeleton className="w-28 h-6 rounded-lg" />
          <Skeleton className="w-36 h-6 rounded-lg" />
          <Skeleton className="w-32 h-6 rounded-lg" />
        </div>
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
          <Skeleton className="w-full h-4 rounded" />
          <Skeleton className="w-5/6 h-4 rounded" />
          <Skeleton className="w-4/5 h-4 rounded" />
          <Skeleton className="w-2/3 h-4 rounded" />
        </div>
      </div>

      {/* Related Products Skeleton */}
      <div className="pt-6 space-y-4">
        <Skeleton className="w-48 h-6 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
