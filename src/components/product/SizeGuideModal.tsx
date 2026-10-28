import React, { useState, useMemo } from 'react';
import {
  Ruler,
  X,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowUpDown,
  Scale,
  Maximize2,
  Shield,
  Scissors,
  Check,
  Shirt,
  Watch,
  ShoppingBag,
  Layers,
  Info,
} from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import {
  SizeCategoryType,
  SIZE_CATEGORY_CONFIGS,
  TOPS_MEASUREMENTS,
  JACKETS_MEASUREMENTS,
  BOTTOMS_MEASUREMENTS,
  WEARABLES_MEASUREMENTS,
  ACCESSORIES_MEASUREMENTS,
  detectProductSizeCategory,
  calculateRecommendedSize,
  SizeMeasurementRow,
} from '../../data/sizeGuideData';

interface SizeGuideModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  selectedVariant?: ProductVariant;
  onSelectVariant?: (variant: ProductVariant) => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  product,
  isOpen,
  onClose,
  selectedVariant,
  onSelectVariant,
}) => {
  // Determine initial category from product
  const productDetection = useMemo(() => detectProductSizeCategory(product), [product]);
  const [activeCategory, setActiveCategory] = useState<SizeCategoryType>(productDetection.category);
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');

  // Interactive Size Finder State
  const [userHeight, setUserHeight] = useState<string>('172');
  const [userWeight, setUserWeight] = useState<string>('70');
  const [userChest, setUserChest] = useState<string>('');
  const [recommendedResult, setRecommendedResult] = useState<{
    recommendedSize: string;
    fitNote: string;
    confidence: 'high' | 'medium';
  } | null>(null);

  // Sync category if product changes and modal re-opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveCategory(productDetection.category);
      setRecommendedResult(null);
    }
  }, [isOpen, productDetection.category]);

  if (!isOpen) return null;

  const currentConfig = SIZE_CATEGORY_CONFIGS[activeCategory] || SIZE_CATEGORY_CONFIGS.tops;

  // Convert CM to IN helper
  const formatVal = (cmVal: number): string => {
    if (unit === 'in') {
      return (cmVal / 2.54).toFixed(1) + '"';
    }
    return `${cmVal} cm`;
  };

  const formatRange = (range: [number, number]): string => {
    if (unit === 'in') {
      const minIn = (range[0] / 2.54).toFixed(1);
      const maxIn = (range[1] / 2.54).toFixed(1);
      return `${minIn}" - ${maxIn}"`;
    }
    return `${range[0]} - ${range[1]} cm`;
  };

  const handleCalculateSize = (e: React.FormEvent) => {
    e.preventDefault();
    const h = userHeight ? Number(userHeight) : undefined;
    const w = userWeight ? Number(userWeight) : undefined;
    const c = userChest ? Number(userChest) : undefined;

    const result = calculateRecommendedSize({
      heightCm: h,
      weightKg: w,
      chestCm: c,
      category: activeCategory,
    });
    setRecommendedResult(result);
  };

  const handleApplyRecommendedSize = (sizeLetter: string) => {
    if (!product.variantes || !onSelectVariant) return;

    // Look for a variant matching this size
    const target = product.variantes.find((v) => {
      const val = (v.attributeValue || v.name).toUpperCase();
      return (
        val === sizeLetter ||
        val.includes(`TALLA ${sizeLetter}`) ||
        val.includes(` ${sizeLetter} `) ||
        val.endsWith(` ${sizeLetter}`) ||
        val.startsWith(`${sizeLetter} `)
      );
    });

    if (target) {
      onSelectVariant(target);
      onClose();
    }
  };

  const getMeasurementRows = (): SizeMeasurementRow[] => {
    if (activeCategory === 'jackets') return JACKETS_MEASUREMENTS;
    if (activeCategory === 'bottoms') return BOTTOMS_MEASUREMENTS;
    return TOPS_MEASUREMENTS;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-modal-title"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Ruler className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="size-guide-modal-title"
                  className="text-base font-black tracking-tight text-white"
                >
                  Guía de Tallas & Medidas Oficial
                </h3>
                <span className="text-[11px] font-mono text-cyan-400 font-bold hidden sm:inline">
                  X-CRISPIN FIT
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate max-w-md">
                {product.nombre}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Unit Switcher */}
            <div className="flex items-center p-0.5 bg-slate-800/90 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setUnit('cm')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  unit === 'cm'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                CM
              </button>
              <button
                type="button"
                onClick={() => setUnit('in')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  unit === 'in'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pulgadas (IN)
              </button>
            </div>

            <button
              onClick={onClose}
              id="close-size-guide-btn"
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              aria-label="Cerrar guía de tallas"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 bg-slate-50 border-b border-slate-200 overflow-x-auto shrink-0">
          {(
            [
              { key: 'tops', label: 'Poleras & Polos', icon: Shirt },
              { key: 'jackets', label: 'Chaquetas & Hoodies', icon: Shield },
              { key: 'bottoms', label: 'Pantalones & Joggers', icon: Layers },
              { key: 'wearables', label: 'Smartwatches & Correas', icon: Watch },
              { key: 'accessories', label: 'Gorras & Morrales', icon: ShoppingBag },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveCategory(tab.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Header Explanation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-cyan-50/70 border border-cyan-200/80 rounded-2xl">
            <div>
              <h4 className="text-xs sm:text-sm font-black text-cyan-950 flex items-center gap-2">
                <span>{currentConfig.title}</span>
                <span className="text-[10px] text-cyan-700 font-bold bg-cyan-100 px-2 py-0.5 rounded-md">
                  Patrón Estándar
                </span>
              </h4>
              <p className="text-xs text-cyan-900/80 mt-0.5 leading-relaxed">
                {currentConfig.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] text-slate-500 block">Unidad de visualización:</span>
              <span className="text-xs font-mono font-black text-slate-800 uppercase">
                {unit === 'cm' ? 'Centímetros (cm)' : 'Pulgadas (in)'}
              </span>
            </div>
          </div>

          {/* Interactive Size Recommender Calculator (Only for Tops / Jackets / Bottoms) */}
          {(activeCategory === 'tops' || activeCategory === 'jackets' || activeCategory === 'bottoms') && (
            <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl shadow-md border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs sm:text-sm font-black text-white">
                    Calculadora Inteligente de Talla
                  </h4>
                </div>
                <span className="text-[11px] text-slate-300">
                  Ingresa tu estatura y peso para recomendación instantánea
                </span>
              </div>

              <form onSubmit={handleCalculateSize} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">
                    Estatura (cm):
                  </label>
                  <input
                    type="number"
                    min="140"
                    max="220"
                    value={userHeight}
                    onChange={(e) => setUserHeight(e.target.value)}
                    placeholder="172"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">
                    Peso (kg):
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="160"
                    value={userWeight}
                    onChange={(e) => setUserWeight(e.target.value)}
                    placeholder="70"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">
                    Pecho (cm opcional):
                  </label>
                  <input
                    type="number"
                    min="70"
                    max="150"
                    value={userChest}
                    onChange={(e) => setUserChest(e.target.value)}
                    placeholder="Ej. 100"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    id="calc-size-btn"
                    className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Calcular Talla</span>
                  </button>
                </div>
              </form>

              {recommendedResult && (
                <div className="p-3.5 bg-cyan-950/80 border border-cyan-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-slate-200">
                        Talla recomendada:{' '}
                        <strong className="text-amber-400 font-mono text-sm uppercase">
                          {recommendedResult.recommendedSize}
                        </strong>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 pl-6">
                      {recommendedResult.fitNote}
                    </p>
                  </div>

                  {product.variantes && product.variantes.length > 0 && onSelectVariant && (
                    <button
                      type="button"
                      onClick={() => handleApplyRecommendedSize(recommendedResult.recommendedSize)}
                      className="px-4 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-xs shrink-0 cursor-pointer self-start sm:self-auto"
                    >
                      Seleccionar Talla {recommendedResult.recommendedSize}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Sizing Conversion Tables */}
          {activeCategory === 'wearables' ? (
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Tabla de Compatibilidad & Ajuste de Muñeca (Smartwatches)
              </h4>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="px-4 py-3">Tamaño de Caja</th>
                      <th className="px-4 py-3">Circunferencia de Muñeca</th>
                      <th className="px-4 py-3">Largo de Correa</th>
                      <th className="px-4 py-3">Recomendado Para</th>
                      <th className="px-4 py-3">Compatibilidad Perno</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                    {WEARABLES_MEASUREMENTS.map((row) => (
                      <tr key={row.size} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">{row.size}</td>
                        <td className="px-4 py-3 font-bold text-cyan-800">
                          {formatRange(row.wristCircumferenceCm)}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{row.strapLengthCm}</td>
                        <td className="px-4 py-3 text-slate-600 font-sans">{row.recommendedWrist}</td>
                        <td className="px-4 py-3 text-slate-500 font-sans">{row.fitsCase}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeCategory === 'accessories' ? (
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Dimensiones & Especificaciones de Accesorios
              </h4>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="px-4 py-3">Artículo</th>
                      <th className="px-4 py-3">Dimensión Evaluada</th>
                      <th className="px-4 py-3">Talla / Capacidad</th>
                      <th className="px-4 py-3">Medidas ({unit === 'cm' ? 'Métrico' : 'Imperial'})</th>
                      <th className="px-4 py-3">Notas de Calce & Ajuste</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                    {ACCESSORIES_MEASUREMENTS.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900 font-sans">{row.itemType}</td>
                        <td className="px-4 py-3 text-slate-600 font-sans">{row.measurementName}</td>
                        <td className="px-4 py-3 font-bold text-cyan-800 font-mono">{row.sizeLabel}</td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">
                          {unit === 'cm' ? row.metricRange : row.imperialRange}
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-sans">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Tabla de Conversión de Tallas & Medidas Corporales
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">
                  Valores en {unit === 'cm' ? 'Centímetros (cm)' : 'Pulgadas (in)'}
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="px-4 py-3 bg-slate-200/60">Talla Internacional</th>
                      <th className="px-3 py-3 text-center">Bolivia / LATAM</th>
                      <th className="px-3 py-3 text-center">US / USA</th>
                      <th className="px-3 py-3 text-center">EU / Europa</th>
                      <th className="px-4 py-3 font-bold text-cyan-900">Pecho / Busto</th>
                      <th className="px-4 py-3">Cintura</th>
                      <th className="px-4 py-3">Largo</th>
                      <th className="px-4 py-3 text-slate-500">Estatura Rec.</th>
                      <th className="px-4 py-3 text-slate-500">Peso Rec.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-mono tabular-nums text-[11px]">
                    {getMeasurementRows().map((row) => {
                      const isVariantSelected =
                        selectedVariant &&
                        (selectedVariant.attributeValue || selectedVariant.name)
                          .toUpperCase()
                          .includes(row.size);

                      return (
                        <tr
                          key={row.size}
                          className={`transition-colors ${
                            isVariantSelected
                              ? 'bg-amber-50/80 font-bold border-l-4 border-amber-500'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="px-4 py-3 font-black text-slate-900 text-xs bg-slate-50/50 flex items-center gap-1.5">
                            <span>{row.size}</span>
                            {isVariantSelected && (
                              <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 text-[9px] font-black rounded-md uppercase">
                                Seleccionada
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center text-slate-600">{row.boliviaLatam}</td>
                          <td className="px-3 py-3 text-center text-slate-600">{row.usSize}</td>
                          <td className="px-3 py-3 text-center text-slate-600">{row.euSize}</td>
                          <td className="px-4 py-3 font-black text-cyan-900 font-mono">
                            {formatRange(row.chestCm)}
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-mono">
                            {formatRange(row.waistCm)}
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-mono">
                            {formatVal(row.lengthCm)}
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-mono">
                            {row.heightRangeCm[0]}-{row.heightRangeCm[1]} cm
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-mono">
                            {row.weightRangeKg[0]}-{row.weightRangeKg[1]} kg
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Fitting Instructions Section (How to Measure) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-cyan-600" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Instrucciones de Calce & Cómo Tomar tus Medidas
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {currentConfig.fittingSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-900">
                      <div className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <h5>{step.title.replace(/^\d+\.\s*/, '')}</h5>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {step.instruction}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-500 flex items-start gap-1">
                    <Info className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                    <span>{step.tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fit Advice & Guarantee Callout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
            {/* Fit Tip */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5 text-xs text-amber-950">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>¿Dudas entre dos tallas?</span>
              </div>
              <p className="text-amber-800/90 leading-relaxed text-[11px]">
                Si tus medidas caen entre dos opciones: elige la talla menor para un calce más ceñido y atlético (Slim Fit) o la talla mayor para mayor holgura y comodidad (Regular / Relaxed Fit).
              </p>
            </div>

            {/* Exchange Guarantee */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1.5 text-xs text-emerald-950">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Garantía de Calce X-CRISPIN Bolivia</span>
              </div>
              <p className="text-emerald-800/90 leading-relaxed text-[11px]">
                Si la talla elegida no te queda perfecta, dispones de 30 días para cambio directo sin costo en nuestras oficinas de La Paz, Santa Cruz y Cochabamba.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-500">
            <Ruler className="w-4 h-4 text-slate-400" />
            <span>Medidas verificadas según estándares de confección en Bolivia</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Entendido, cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
