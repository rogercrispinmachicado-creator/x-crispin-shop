import React from 'react';
import { XLogo } from '../common/XLogo';
import { NewsletterSignup } from './NewsletterSignup';
import {
  ShieldCheck,
  Truck,
  QrCode,
  CreditCard,
  MessageCircle,
  MapPin,
  Mail,
  Phone,
  ArrowUpRight,
} from 'lucide-react';
import { storage } from '../../services/storage';

interface FooterProps {
  onNavigate: (route: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const config = storage.getConfig();

  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-900 font-sans">
      {/* Brand Value Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-cyan-950/60 text-cyan-400 rounded-2xl border border-cyan-800/40">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-base mb-1">Envíos a Toda Bolivia</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cobertura en los 9 departamentos: La Paz, Santa Cruz, Cochabamba, Oruro, Potosí, Chuquisaca, Tarija, Beni y Pando.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-950/60 text-emerald-400 rounded-2xl border border-emerald-800/40">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-base mb-1">Pagos Seguros con QR Simple</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paga al instante con cualquier aplicación bancaria boliviana mediante QR interoperable y transferencia bancaria oficial.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-950/60 text-indigo-400 rounded-2xl border border-indigo-800/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-base mb-1">Garantía Real & Soporte</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Productos 100% garantizados con soporte técnico local, factura/recibo oficial y atención directa por WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Signup Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
        <NewsletterSignup />
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Identity */}
          <div className="lg:col-span-2 space-y-4">
            <XLogo size="lg" textColor="text-white" showSlogan={true} />
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed pt-2">
              Plataforma tecnológica de comercio digital de vanguardia. Diseñada para ofrecer la mejor experiencia de compra, velocidad y confianza en Bolivia con miras a toda la región.
            </p>

            <div className="pt-2 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>{config.direccion}, {config.ciudad} - {config.pais}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{config.telefono}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>{config.email}</span>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="pt-2">
              <a
                href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent('Hola X-CRISPIN Soporte, deseo información y atención al cliente.')}`}
                target="_blank"
                rel="noreferrer"
                id="footer-whatsapp-cta"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Soporte & Información WhatsApp: 72902338</span>
              </a>
            </div>
          </div>

          {/* Col 2: Tienda y Catálogo Factor X */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Catálogo</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('productos')} className="hover:text-cyan-400 transition-colors">
                  Todos los Productos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('productos', 'cat-fx-salud-bienestar')}
                  className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors flex items-center gap-1.5"
                >
                  <span>Salud & Bienestar</span>
                  <span className="text-[9px] bg-emerald-950 border border-emerald-700 px-1 py-0.2 rounded text-emerald-300">Top</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('productos', 'cat-fx-cafes')} className="hover:text-cyan-400 transition-colors">
                  Cafés Funcionales & Cappuccinos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('productos', 'cat-fx-nutricion')} className="hover:text-cyan-400 transition-colors">
                  Nutrición & Limpieza Digestiva
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('productos', 'cat-fx-peso')} className="hover:text-cyan-400 transition-colors">
                  Control de Peso & Quema Grasa
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('productos', 'cat-fx-colageno')} className="hover:text-cyan-400 transition-colors">
                  Colágenos Hidrolizados
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('productos', 'cat-fx-packs')} className="hover:text-amber-400 transition-colors text-amber-300 font-medium">
                  Packs de Patrocinio & Bonos
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Clientes & Operaciones */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Servicios</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('seguimiento')} className="hover:text-cyan-400 transition-colors">
                  Seguimiento de Pedido
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('inicio');
                    setTimeout(() => {
                      const el = document.getElementById('testimonios');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  <span>Testimonios de Clientes</span>
                  <span className="text-[9px] bg-cyan-950 border border-cyan-800 px-1 py-0.2 rounded text-cyan-300 font-bold">4.9 ★</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cuenta')} className="hover:text-cyan-400 transition-colors">
                  Mi Cuenta & Compras
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('vendedor')} className="hover:text-amber-400 transition-colors text-amber-300">
                  Portal de Distribuidores
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('recepcion')} className="hover:text-purple-400 transition-colors text-purple-300">
                  Mesa de Recepción de Pagos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-rose-400 transition-colors text-rose-300">
                  Panel Administrativo
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Garantías */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Información Legal</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('terminos')} className="hover:text-cyan-400 transition-colors">
                  Términos y Condiciones
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacidad')} className="hover:text-cyan-400 transition-colors">
                  Política de Privacidad
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cambios-devoluciones')} className="hover:text-cyan-400 transition-colors">
                  Garantía, Cambios & Devoluciones
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contacto')} className="hover:text-cyan-400 transition-colors">
                  Contacto & Sucursales
                </button>
              </li>
            </ul>

            {/* Bolivian Bank logos indicator */}
            <div className="mt-6 pt-4 border-t border-slate-900">
              <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Métodos Habilitados en Bolivia</p>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800 font-mono">QR Simple</span>
                <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800 font-mono">Banco BCP</span>
                <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800 font-mono">Banco BNB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© {new Date().getFullYear()} X-CRISPIN — SHOP THE X. Todos los derechos reservados. Bolivia.</p>
        <div className="flex items-center gap-4">
          <span>Moneda Oficial: Bolivianos (BOB)</span>
          <span>•</span>
          <span>Preparado para Expansión Regional</span>
        </div>
      </div>
    </footer>
  );
};
