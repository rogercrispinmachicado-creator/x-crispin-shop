import React, { useState } from 'react';
import { X, QrCode, Copy, Check, Download, Share2 } from 'lucide-react';
import { Product } from '../../types';

interface ProductQrModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductQrModal: React.FC<ProductQrModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // The QR code contains the product slug (which our scanner recognizes instantly)
  const qrData = product.slug;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
    qrData
  )}`;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?producto=${product.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-qr-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col border border-slate-200 text-slate-900">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 id="product-qr-title" className="text-sm font-bold text-slate-900">
                Código QR del Producto
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">SKU: {product.sku}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Presentation */}
        <div className="p-6 flex flex-col items-center text-center space-y-4 bg-slate-50/50">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200/80 relative group">
            <img
              src={qrUrl}
              alt={`Código QR para ${product.nombre}`}
              className="w-56 h-56 object-contain"
            />
          </div>

          <div>
            <h4 className="text-sm font-extrabold text-slate-900 line-clamp-2 px-2">
              {product.nombre}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Escanea este código con cualquier cámara móvil o el escáner de la app para navegar al producto al instante.
            </p>
          </div>

          <div className="w-full flex gap-2 pt-2">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-2.5 px-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Enlace Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copiar Enlace</span>
                </>
              )}
            </button>

            <a
              href={qrUrl}
              download={`qr-${product.sku}.png`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar QR</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
