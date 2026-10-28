import React, { useState } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Tag,
  RotateCcw,
} from 'lucide-react';
import { storage } from '../../services/storage';

interface NewsletterSignupProps {
  className?: string;
  onSuccess?: (email: string) => void;
}

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  className = '',
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [preference, setPreference] = useState<'todas' | 'tecnologia' | 'salud'>('todas');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    submittedEmail: string;
    alreadySubscribed: boolean;
  } | null>(null);

  const validateEmail = (value: string): boolean => {
    // Standard RFC-compliant email pattern
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage('Por favor, ingresa tu correo electrónico.');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setErrorMessage('Ingresa un correo electrónico válido (ejemplo: usuario@correo.com).');
      return;
    }

    setIsSubmitting(true);

    // Simulate snappy network request with storage save
    setTimeout(() => {
      try {
        const result = storage.addNewsletterSubscriber(trimmedEmail, preference);
        setSuccessInfo({
          submittedEmail: trimmedEmail,
          alreadySubscribed: result.alreadySubscribed,
        });
        setEmail('');
        if (onSuccess) {
          onSuccess(trimmedEmail);
        }
      } catch (err) {
        setErrorMessage('Ocurrió un error al procesar tu suscripción. Intenta nuevamente.');
      } finally {
        setIsSubmitting(false);
      }
    }, 400);
  };

  const handleReset = () => {
    setSuccessInfo(null);
    setErrorMessage(null);
    setEmail('');
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl p-6 sm:p-10 ${className}`}
      id="newsletter-section"
    >
      {/* Subtle background glow effects */}
      <div
        className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {successInfo ? (
        /* Success State View */
        <div className="relative z-10 py-4 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {successInfo.alreadySubscribed ? 'Suscripción Confirmada' : '¡Registro Exitoso!'}
          </span>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
            {successInfo.alreadySubscribed
              ? '¡Tu correo ya formaba parte de nuestra lista VIP!'
              : '¡Bienvenido al Club X-CRISPIN VIP!'}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed mb-4">
            Hemos registrado a{' '}
            <strong className="text-cyan-400 font-semibold">{successInfo.submittedEmail}</strong>. Muy
            pronto recibirás alertas de ofertas flash, nuevos lanzamientos Factor X y cupones de
            descuento exclusivos para compras en Bolivia.
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-full border border-slate-700/60 text-slate-400 text-[11px] mb-6">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sin spam · Respetamos tu privacidad y puedes darte de baja en cualquier momento</span>
          </div>

          <button
            onClick={handleReset}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Suscribir otro correo</span>
          </button>
        </div>
      ) : (
        /* Form View */
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Header & Benefits */}
          <div className="lg:col-span-6 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/80 border border-cyan-800/60 rounded-full text-cyan-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ofertas VIP & Lanzamientos Exclusivos</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Suscríbete al Newsletter de <span className="text-cyan-400">X-CRISPIN</span>
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Recibe avisos antes que nadie sobre descuentos relámpago, novedades de productos oficiales
              Factor X y promociones especiales con pagos por QR Simple.
            </p>

            {/* Quick Micro-Perks */}
            <div className="pt-2 flex flex-wrap gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Cupones de descuento</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>Preventas exclusivas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span>0% spam garantizado</span>
              </div>
            </div>
          </div>

          {/* Form & Input Fields */}
          <div className="lg:col-span-6">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Preferences selector */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  ¿Qué temas te interesan más?
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPreference('todas')}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                      preference === 'todas'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    Todas las ofertas
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreference('salud')}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                      preference === 'salud'
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    Salud & Factor X
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreference('tecnologia')}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                      preference === 'tecnologia'
                        ? 'bg-indigo-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    Tecnología & Gadgets
                  </button>
                </div>
              </div>

              {/* Email Input & Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Tu correo electrónico (ej. nombre@dominio.com)"
                    id="newsletter-email-input"
                    disabled={isSubmitting}
                    aria-label="Correo electrónico para boletín de novedades"
                    aria-invalid={errorMessage ? 'true' : 'false'}
                    aria-describedby={errorMessage ? 'newsletter-error-msg' : undefined}
                    className={`w-full pl-10 pr-4 py-3 bg-slate-950/90 border rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 ${
                      errorMessage
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-700/80 focus:border-cyan-500 focus:ring-cyan-500/20'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  id="newsletter-submit-button"
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Suscribirme</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Error Message with alert icon */}
              {errorMessage && (
                <div
                  id="newsletter-error-msg"
                  role="alert"
                  className="flex items-center gap-2 text-xs text-rose-400 font-medium animate-in fade-in duration-200"
                >
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <p className="text-[11px] text-slate-500 leading-normal">
                Al suscribirte, aceptas recibir correos promocionales y ofertas especiales de X-CRISPIN.
                Podrás cancelar tu suscripción en cualquier momento haciendo clic en el enlace al pie de
                nuestros correos.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
