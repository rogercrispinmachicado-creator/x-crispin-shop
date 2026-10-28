import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Mail,
  CheckCircle2,
  TrendingDown,
  Trash2,
  Sparkles,
  Phone,
  MessageCircle,
  HelpCircle,
  ArrowRight,
  ListFilter,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Product, PriceDropAlert } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { usePriceAlerts } from '../../hooks/usePriceAlerts';

interface NotifyMeModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCatalog?: () => void;
  onSelectProduct?: (slug: string) => void;
}

export const NotifyMeModal: React.FC<NotifyMeModalProps> = ({
  product,
  isOpen,
  onClose,
  onNavigateToCatalog,
  onSelectProduct,
}) => {
  const { currentUser } = useAuth();
  const {
    getAlertForProduct,
    subscribe,
    unsubscribe,
    userAlerts,
    simulatePriceDrop,
    restorePrice,
  } = usePriceAlerts();

  const existingAlert = getAlertForProduct(product.id, currentUser?.email);

  const [activeTab, setActiveTab] = useState<'form' | 'my-alerts'>('form');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [alertType, setAlertType] = useState<'ANY' | 'TARGET'>('ANY');
  const [targetPrice, setTargetPrice] = useState<number>(
    Math.max(1, Math.round(product.precio * 0.9))
  );
  const [submitted, setSubmitted] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    success: boolean;
    oldPrice: number;
    newPrice: number;
    simulated: boolean;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill user data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (currentUser?.email) {
        setEmail(currentUser.email);
      }
      if (currentUser?.whatsapp || currentUser?.phone) {
        setPhone(currentUser.whatsapp || currentUser.phone || '');
      }
      if (existingAlert) {
        setEmail(existingAlert.email);
        if (existingAlert.phone) setPhone(existingAlert.phone);
        if (existingAlert.notifyWhatsApp !== undefined) setNotifyWhatsApp(existingAlert.notifyWhatsApp);
        if (existingAlert.targetPrice) {
          setAlertType('TARGET');
          setTargetPrice(existingAlert.targetPrice);
        } else {
          setAlertType('ANY');
        }
      } else {
        setSubmitted(false);
        setSimulationResult(null);
        setErrorMsg('');
      }
    }
  }, [isOpen, currentUser, existingAlert, product.precio]);

  if (!isOpen) return null;

  const currentPrice = product.precio;

  const handleApplyPreset = (percent: number) => {
    setAlertType('TARGET');
    const calculated = Math.round(currentPrice * (1 - percent / 100));
    setTargetPrice(Math.max(1, calculated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Por favor introduce un correo electrónico válido');
      return;
    }

    if (alertType === 'TARGET') {
      if (!targetPrice || targetPrice >= currentPrice) {
        setErrorMsg(`El precio objetivo debe ser menor al precio actual (Bs. ${currentPrice})`);
        return;
      }
    }

    subscribe({
      productId: product.id,
      productName: product.nombre,
      productSlug: product.slug,
      productImage: product.imagenes[0] || '',
      currentPrice: product.precio,
      targetPrice: alertType === 'TARGET' ? targetPrice : undefined,
      email: cleanEmail,
      phone: phone.trim() || undefined,
      notifyWhatsApp,
    });

    setSubmitted(true);
  };

  const handleCancelAlert = (alertId: string) => {
    unsubscribe(alertId);
    setSubmitted(false);
    setSimulationResult(null);
  };

  const handleRunSimulation = () => {
    const desiredTarget = alertType === 'TARGET' && targetPrice < currentPrice ? targetPrice : undefined;
    const res = simulatePriceDrop(product.id, desiredTarget);
    if (res.success) {
      setSimulationResult({
        success: true,
        oldPrice: res.oldPrice,
        newPrice: res.newPrice,
        simulated: true,
      });
    }
  };

  const handleResetSimulation = () => {
    if (simulationResult) {
      restorePrice(product.id, simulationResult.oldPrice);
      setSimulationResult(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notify-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Bell className="w-5 h-5 animate-bounce-short" />
            </div>
            <div>
              <h3 id="notify-modal-title" className="text-base font-black tracking-tight text-white flex items-center gap-2">
                Avisarme si baja de precio
              </h3>
              <p className="text-xs text-slate-300">
                Alerta inteligente de descuentos y ofertas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer relative z-10"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers if user has alerts */}
        <div className="flex items-center border-b border-slate-100 bg-slate-50/80 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'form'
                ? 'border-cyan-600 text-cyan-800 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Configurar Alerta</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('my-alerts')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'my-alerts'
                ? 'border-cyan-600 text-cyan-800 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Mis Alertas ({userAlerts.length})</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'form' ? (
            <>
              {/* Product Summary Card */}
              <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <img
                  src={product.imagenes[0] || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800'}
                  alt={product.nombre}
                  className="w-16 h-16 object-cover rounded-xl border border-slate-200 bg-white shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono text-slate-400 block">{product.sku}</span>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{product.nombre}</h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xs text-slate-500">Precio actual:</span>
                    <span className="text-sm font-black text-slate-900">
                      Bs. {product.precio}
                    </span>
                    {product.precioAnterior && (
                      <span className="text-[11px] text-slate-400 line-through">
                        Bs. {product.precioAnterior}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Already Subscribed State Banner */}
              {existingAlert && !submitted && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-bold text-emerald-900">
                        ¡Ya tienes una alerta activa para este producto!
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-800 text-[10px] font-black rounded-full uppercase">
                      Activa
                    </span>
                  </div>

                  <div className="text-[11px] text-emerald-800/90 pl-6 space-y-1">
                    <p>
                      <strong>Correo:</strong> {existingAlert.email}
                    </p>
                    <p>
                      <strong>Condición:</strong>{' '}
                      {existingAlert.targetPrice
                        ? `Avisar si baja a Bs. ${existingAlert.targetPrice} o menos`
                        : `Avisar con cualquier rebaja por debajo de Bs. ${existingAlert.currentPrice}`}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2 pl-6">
                    <button
                      type="button"
                      onClick={() => handleCancelAlert(existingAlert.id)}
                      className="text-[11px] text-rose-600 hover:text-rose-800 font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancelar suscripción</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRunSimulation}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                      title="Simula un cambio de precio para verificar la alerta"
                    >
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>Probar rebaja ahora</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Simulation Result Toast inside Modal */}
              {simulationResult && (
                <div className="p-4 bg-cyan-50 border border-cyan-300 rounded-2xl space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-cyan-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-cyan-600" />
                    <span>¡Simulación ejecutada con éxito!</span>
                  </div>
                  <p className="text-xs text-cyan-800">
                    El precio se redujo de <strong>Bs. {simulationResult.oldPrice}</strong> a{' '}
                    <strong className="text-cyan-950 font-black">Bs. {simulationResult.newPrice}</strong>. Se ha generado una notificación instantánea en la campana del menú superior.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleResetSimulation}
                      className="text-xs text-cyan-700 hover:text-cyan-900 underline font-semibold cursor-pointer"
                    >
                      Restaurar precio original (Bs. {simulationResult.oldPrice})
                    </button>
                  </div>
                </div>
              )}

              {/* Success Notification after Submitting */}
              {submitted && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 text-center">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">¡Alerta Guardada con Éxito!</h4>
                    <p className="text-xs text-emerald-700 mt-1">
                      Te enviaremos un correo a <strong>{email}</strong> tan pronto como el precio disminuya.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleRunSimulation}
                      className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <TrendingDown className="w-4 h-4" />
                      <span>Probar alerta ahora (Simular rebaja)</span>
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Listo, cerrar
                    </button>
                  </div>
                </div>
              )}

              {/* The Input Form */}
              {!submitted && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Email Input - The Primary Requirement */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                      Tu Correo Electrónico <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ejemplo@correo.com"
                        id="notify-email-input"
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-medium"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      No compartiremos tu correo con nadie más ni te enviaremos spam.
                    </p>
                  </div>

                  {/* Threshold Selection */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                      ¿Cuándo deseas recibir la alerta?
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          alertType === 'ANY'
                            ? 'bg-cyan-50/80 border-cyan-500 text-cyan-950 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="alertType"
                          checked={alertType === 'ANY'}
                          onChange={() => setAlertType('ANY')}
                          className="mt-0.5 text-cyan-600 focus:ring-cyan-500"
                        />
                        <div>
                          <span className="text-xs font-bold block">Cualquier rebaja</span>
                          <span className="text-[11px] text-slate-500">
                            Avisarme con cualquier descuento menor a Bs. {currentPrice}
                          </span>
                        </div>
                      </label>

                      <label
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          alertType === 'TARGET'
                            ? 'bg-cyan-50/80 border-cyan-500 text-cyan-950 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="alertType"
                          checked={alertType === 'TARGET'}
                          onChange={() => setAlertType('TARGET')}
                          className="mt-0.5 text-cyan-600 focus:ring-cyan-500"
                        />
                        <div>
                          <span className="text-xs font-bold block">Precio objetivo</span>
                          <span className="text-[11px] text-slate-500">
                            Solo si baja a un precio específico
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Target Price input & chips if TARGET selected */}
                    {alertType === 'TARGET' && (
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2.5 mt-2 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">Avisarme si el precio es igual o menor a:</span>
                          <span className="font-black text-cyan-900">Bs. {targetPrice}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500">Bs.</span>
                          <input
                            type="number"
                            min={1}
                            max={currentPrice - 1}
                            value={targetPrice}
                            onChange={(e) => setTargetPrice(Number(e.target.value))}
                            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                          />
                        </div>

                        {/* Presets */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Sugerencias:</span>
                          {[5, 10, 15, 20].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => handleApplyPreset(pct)}
                              className="px-2 py-0.5 bg-white hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 border border-slate-200 rounded text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              -{pct}% (Bs. {Math.round(currentPrice * (1 - pct / 100))})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Optional WhatsApp alert */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800">
                          Recibir copia por WhatsApp (Bolivia)
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifyWhatsApp}
                        onChange={(e) => setNotifyWhatsApp(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                    </label>

                    {notifyWhatsApp && (
                      <div className="relative pt-1 animate-in fade-in duration-150">
                        <span className="absolute left-3 top-3.5 text-xs font-bold text-slate-400">
                          +591
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="71234567"
                          className="w-full pl-14 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    id="notify-submit-btn"
                    className="w-full py-3.5 bg-gradient-to-r from-slate-900 via-cyan-900 to-slate-900 hover:from-cyan-700 hover:to-cyan-600 text-white rounded-xl text-xs sm:text-sm font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    <span>{existingAlert ? 'ACTUALIZAR MI ALERTA DE PRECIO' : 'ACTIVAR ALERTA DE PRECIO'}</span>
                  </button>
                </form>
              )}
            </>
          ) : (
            /* User's Price Alerts List */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Alertas configuradas con tu correo:</span>
                <span className="font-bold text-slate-700">{userAlerts.length} productos</span>
              </div>

              {userAlerts.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500">Aún no tienes alertas de precio guardadas.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {userAlerts.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                    >
                      <img
                        src={a.productImage || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800'}
                        alt={a.productName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-100 bg-slate-50 shrink-0"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <h5 className="font-bold text-slate-900 truncate">{a.productName}</h5>
                        <p className="text-slate-500 text-[11px]">
                          Inicial: Bs. {a.currentPrice}
                          {a.targetPrice && ` • Objetivo: Bs. ${a.targetPrice}`}
                        </p>
                        <span
                          className={`inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] font-bold ${
                            a.status === 'TRIGGERED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {a.status === 'TRIGGERED' ? '¡Rebaja detectada!' : 'Activa'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {onSelectProduct && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectProduct(a.productSlug);
                              onClose();
                            }}
                            className="p-1.5 text-slate-500 hover:text-cyan-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="Ver producto"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCancelAlert(a.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Eliminar alerta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Monitoreo 24/7 en moneda boliviana (Bs.)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
