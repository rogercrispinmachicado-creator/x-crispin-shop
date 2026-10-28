import React, { useState } from 'react';
import { ShieldCheck, RotateCcw, Lock, Phone, Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import { storage } from '../services/storage';

interface LegalPageProps {
  type: 'terminos' | 'privacidad' | 'cambios' | 'contacto';
}

export const LegalPages: React.FC<LegalPageProps> = ({ type }) => {
  const config = storage.getConfig();
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (type === 'contacto') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 font-sans">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Contacto Oficial X-CRISPIN</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Estamos a tu disposición en Bolivia para cualquier consulta, garantía o pedido corporativo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
            <h3 className="text-base font-bold text-slate-900">Canales Directos</h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">Sede Central</p>
                  <p className="text-slate-600">{config.direccion}, {config.ciudad} - Bolivia</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">Teléfono & WhatsApp</p>
                  <p className="text-slate-600">{config.telefono}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-slate-900">Correo Electrónico</p>
                  <p className="text-slate-600">{config.email}</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent('Hola X-CRISPIN, tengo una consulta comercial.')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Hablar por WhatsApp Ahora</span>
              </a>
            </div>
          </div>

          <form
            onSubmit={handleContactSubmit}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">Envíanos un Mensaje</h3>
            {submitted ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl text-center">
                ¡Mensaje recibido! Nos pondremos en contacto contigo a la brevedad.
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mensaje o Consulta</label>
                  <textarea
                    rows={4}
                    required
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Consulta</span>
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 font-sans">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6">
        {type === 'terminos' && (
          <>
            <h1 className="text-2xl font-black text-slate-900">Términos y Condiciones de Uso</h1>
            <p className="text-xs text-slate-500">Última actualización: Enero 2025 • Operaciones en Bolivia</p>
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <p>
                Bienvenido a <strong>X-CRISPIN — SHOP THE X</strong>. Al acceder y realizar compras en nuestra plataforma web, usted acepta expresamente los presentes Términos y Condiciones de conformidad con la normativa vigente en el Estado Plurinacional de Bolivia.
              </p>
              <h4 className="font-bold text-slate-900 text-sm">1. Precios y Moneda Oficial</h4>
              <p>
                Todos los precios listados en X-CRISPIN están expresados en <strong>Bolivianos (BOB / Bs.)</strong> e incluyen todos los impuestos aplicables. La plataforma se reserva el derecho de modificar promociones y precios sin previo aviso.
              </p>
              <h4 className="font-bold text-slate-900 text-sm">2. Métodos de Pago y Confirmación</h4>
              <p>
                Los pagos se efectúan mediante el sistema oficial de <strong>QR Simple interoperable</strong> y transferencias bancarias directas. El despacho de los productos está sujeto a la validación de fondos por parte de nuestra mesa de recepción.
              </p>
              <h4 className="font-bold text-slate-900 text-sm">3. Cobertura de Envíos</h4>
              <p>
                Operamos con envíos a los nueve (9) departamentos de Bolivia: La Paz, Santa Cruz, Cochabamba, Oruro, Potosí, Chuquisaca, Tarija, Beni y Pando.
              </p>
            </div>
          </>
        )}

        {type === 'privacidad' && (
          <>
            <h1 className="text-2xl font-black text-slate-900">Política de Privacidad y Protección de Datos</h1>
            <p className="text-xs text-slate-500">Compromiso de Confidencialidad X-CRISPIN</p>
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <p>
                En <strong>X-CRISPIN</strong> valoramos y protegemos la privacidad de nuestros clientes. Los datos recopilados durante el proceso de compra (nombre, teléfono, correo electrónico y dirección) se utilizan exclusivamente para:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Gestión y entrega de pedidos en Bolivia.</li>
                <li>Notificaciones de estado y seguimiento en tiempo real vía WhatsApp o correo electrónico.</li>
                <li>Generación de comprobantes y recibos de compra oficiales.</li>
              </ul>
              <p>
                No compartimos, vendemos ni cedemos sus datos personales a terceros sin su consentimiento explícito.
              </p>
            </div>
          </>
        )}

        {type === 'cambios' && (
          <>
            <h1 className="text-2xl font-black text-slate-900">Garantía, Cambios y Devoluciones</h1>
            <p className="text-xs text-slate-500">Garantía Oficial en los 9 Departamentos</p>
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <p>
                Todos los productos adquiridos en <strong>X-CRISPIN — SHOP THE X</strong> cuentan con garantía oficial de fábrica contra defectos de fabricación.
              </p>
              <h4 className="font-bold text-slate-900 text-sm">Plazo de Devolución o Cambio</h4>
              <p>
                El cliente dispone de un plazo de hasta <strong>7 días calendario</strong> desde la recepción del producto para solicitar cambio o revisión en caso de fallas técnicas o discrepancias con el producto adquirido.
              </p>
              <h4 className="font-bold text-slate-900 text-sm">Condiciones</h4>
              <p>
                El producto debe presentarse con su empaque original, manuales, accesorios completos y el <strong>recibo oficial de compra emitido por X-CRISPIN</strong>.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
