import React, { useState } from 'react';
import {
  MessageCircle,
  X,
  Phone,
  HelpCircle,
  Package,
  Send,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { storage } from '../../services/storage';
import { whatsappService } from '../../services/whatsappService';

export const WhatsAppFloatingCTA: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const config = storage.getConfig();
  const rawPhone = (config.whatsapp || '59172902338').replace(/[^0-9]/g, '');
  const displayPhone = config.telefono || '+591 72902338';

  const handleSendCustomMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) {
      const url = whatsappService.buildSupportUrl(undefined, rawPhone);
      window.open(url, '_blank');
      return;
    }
    const url = whatsappService.buildSupportUrl(userQuery.trim(), rawPhone);
    window.open(url, '_blank');
    setUserQuery('');
    setIsOpen(false);
  };

  const handleDirectSupport = () => {
    const url = whatsappService.buildSupportUrl(
      'Hola X-CRISPIN Soporte, requiero asistencia técnica con un producto/pedido.',
      rawPhone
    );
    window.open(url, '_blank');
  };

  const handleDirectInfo = () => {
    const url = whatsappService.buildInformationUrl(
      'productos, stock disponible y envíos en Bolivia',
      rawPhone
    );
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-5 left-5 z-40 flex flex-col items-start font-sans print:hidden">
      {/* Floating Card Modal when opened */}
      {isOpen && (
        <div
          id="whatsapp-support-modal"
          className="mb-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 relative">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-3.5 right-3.5 p-1 rounded-full text-emerald-100 hover:text-white hover:bg-emerald-800/40 transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-white">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-emerald-700 rounded-full"></span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Soporte & Información</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/40 text-emerald-100 rounded-md uppercase font-semibold">
                    En Línea
                  </span>
                </h3>
                <p className="text-[11px] text-emerald-100/90 mt-0.5 font-medium">
                  WhatsApp Oficial: <strong className="text-white">72902338</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3.5 bg-slate-50/50">
            <div className="p-3 bg-white rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1 shadow-2xs">
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Atención Oficial X-CRISPIN Bolivia</span>
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Resuelve dudas de pedidos, seguimiento de envíos nacionales, asesoría técnica y emisión de facturas.
              </p>
            </div>

            {/* Quick Action Options */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleDirectSupport}
                id="btn-whatsapp-soporte"
                className="w-full p-2.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-xl text-left flex items-center justify-between text-xs text-emerald-950 font-bold transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block leading-tight">Soporte Técnico & Post-Venta</span>
                    <span className="text-[10px] font-normal text-emerald-700">
                      Garantías, pedidos y facturas
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={handleDirectInfo}
                id="btn-whatsapp-informacion"
                className="w-full p-2.5 bg-cyan-50 hover:bg-cyan-100/80 border border-cyan-200/80 rounded-xl text-left flex items-center justify-between text-xs text-cyan-950 font-bold transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-cyan-600 text-white rounded-lg">
                    <Package className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="block leading-tight">Información Comercial & Catálogo</span>
                    <span className="text-[10px] font-normal text-cyan-700">
                      Precios en BOB, stock y envíos
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-cyan-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Direct message input */}
            <form onSubmit={handleSendCustomMessage} className="pt-1 space-y-2">
              <label className="text-[11px] font-bold text-slate-700 block">
                Escribe tu consulta personalizada:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Ej: Consulta sobre disponibilidad o garantía..."
                  className="w-full pl-3 pr-10 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-800"
                />
                <button
                  type="submit"
                  title="Enviar por WhatsApp"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Direct Call & Telephone info */}
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-600" />
                <span>Teléfono: <strong>{displayPhone}</strong></span>
              </span>
              <a
                href={`tel:${rawPhone}`}
                className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
              >
                Llamar Directo
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <div className="flex items-center gap-2">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            id="whatsapp-cta-badge"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-xs text-slate-800 text-xs font-bold rounded-full shadow-lg border border-slate-200/80 hover:bg-slate-50 transition-all hover:scale-105 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>WhatsApp Soporte: <strong className="text-emerald-700">72902338</strong></span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          id="btn-whatsapp-floating-cta"
          aria-label="Abrir Soporte e Información por WhatsApp"
          className="relative group p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer"
        >
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white"></span>
          </span>
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
