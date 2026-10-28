import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  TrendingUp,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Gift,
  ArrowRight,
  Zap,
  ShoppingBag,
  HelpCircle,
  ChevronRight,
  Clock,
  Flame,
} from 'lucide-react';
import { useLoyalty } from '../../hooks/useLoyalty';
import { useAuth } from '../../context/AuthContext';
import { LoyaltyTier } from '../../types';

interface LoyaltyPointsSectionProps {
  onNavigateToCatalog?: () => void;
  onNavigateToTracking?: (orderNumber: string) => void;
}

export const LoyaltyPointsSection: React.FC<LoyaltyPointsSectionProps> = ({
  onNavigateToCatalog,
  onNavigateToTracking,
}) => {
  const { currentUser } = useAuth();
  const {
    balance,
    tier,
    tierProgress,
    monetaryValue,
    transactions,
    allTiers,
    addBonusPoints,
    redeemPoints,
  } = useLoyalty();

  const [simulationSuccess, setSimulationSuccess] = useState<string | null>(null);
  const [redeemAmount, setRedeemAmount] = useState<number>(50);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  const handleSimulatePurchase = () => {
    const randomPoints = 45;
    const res = addBonusPoints(
      randomPoints,
      `Bono por compra simulada de prueba (Bs. ${randomPoints * 10})`
    );
    if (res) {
      setSimulationSuccess(`¡Se acreditaron +${randomPoints} X-Points a tu cuenta! Nuevo saldo: ${res.newBalance} pts.`);
      setTimeout(() => setSimulationSuccess(null), 5000);
    }
  };

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (redeemAmount > balance) {
      alert(`No tienes suficientes puntos. Tu saldo es de ${balance} X-Points.`);
      return;
    }
    const res = redeemPoints(
      redeemAmount,
      `Canje de ${redeemAmount} X-Points por descuento de Bs. ${(redeemAmount / 10).toFixed(2)}`
    );
    if (res.success) {
      setRedeemSuccess(`¡Canje exitoso! Canjeaste ${redeemAmount} X-Points por Bs. ${res.discountBob} de descuento.`);
      setTimeout(() => setRedeemSuccess(null), 5000);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans">
      {/* Simulation Feedback Banner */}
      {simulationSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 text-xs font-bold animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{simulationSuccess}</span>
          </div>
          <button
            onClick={() => setSimulationSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 font-extrabold cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Redeem Feedback Banner */}
      {redeemSuccess && (
        <div className="p-4 bg-cyan-50 border border-cyan-300 rounded-2xl flex items-center justify-between gap-3 text-cyan-900 text-xs font-bold animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>{redeemSuccess}</span>
          </div>
          <button
            onClick={() => setRedeemSuccess(null)}
            className="text-cyan-700 hover:text-cyan-900 font-extrabold cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Main Luxury X-Points Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-white p-7 sm:p-9 shadow-xl border border-slate-800">
        {/* Decorative Background Accents */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          {/* Left: Balance & Equivalence */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-black tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Club X-Points Bolivia</span>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${tier.badgeBg} ${tier.badgeText}`}>
                {tier.nombre}
              </span>
            </div>

            <div>
              <p className="text-xs text-slate-400 font-medium">Saldo Actual Acumulado</p>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono" id="xpoints-balance-display">
                  {balance.toLocaleString()}
                </span>
                <span className="text-lg font-black text-cyan-400 tracking-wider">X-POINTS</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>
                Equivalente a <strong className="text-white">Bs. {monetaryValue.toFixed(2)}</strong> de descuento en compras (10 pts = Bs. 1)
              </span>
            </p>
          </div>

          {/* Right: Tier Status & Progress */}
          <div className="w-full md:max-w-xs p-5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>{tier.nombre}</span>
              </span>
              <span className="text-[11px] text-cyan-300 font-mono font-bold">
                {tierProgress.nextTier ? `${tierProgress.pointsToNext} pts para ${tierProgress.nextTier.nombre}` : '¡Nivel Máximo!'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${tierProgress.progressPercent}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Multiplicador actual: <strong className="text-white">{tier.multiplier}x</strong> en compras. Ganas 1 X-Point por cada Bs. 10 de compra.
            </p>

            {/* Simulation test button */}
            <button
              type="button"
              onClick={handleSimulatePurchase}
              id="simulate-purchase-points-btn"
              className="w-full py-2 px-3 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-200 border border-cyan-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              title="Simula una compra para probar cómo se acreditan puntos"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-300" />
              <span>Simular Compra (+45 X-Points)</span>
            </button>
          </div>
        </div>
      </div>

      {/* How it Works / 3-Step Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-black text-base">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">1. Compra en Tienda</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Acumulas automáticamente 1 X-Point por cada Bs. 10 gastados en todos los productos de tecnología y Factor X.
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-base">
            <Flame className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">2. Puntos Extra Factor X</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Nuestros productos de salud celular y nutrición botánica otorgan puntos factor adicionales inmediatos.
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-base">
            <Gift className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">3. Canje Directo</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Canjea tus X-Points acumulados para reducir el monto total de tus pedidos o acceder a envíos gratis en Bolivia.
          </p>
        </div>
      </div>

      {/* Tiers Grid Showcase */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-600" />
              <span>Niveles del Club X-Points</span>
            </h3>
            <p className="text-xs text-slate-500">
              Mientras más compras realizas, mayores beneficios y multiplicadores desbloqueas
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
            Tu nivel actual: <strong className="text-cyan-800 uppercase">{tier.tier}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(allTiers) as LoyaltyTier[]).map((tKey) => {
            const t = allTiers[tKey];
            const isCurrent = tier.tier === tKey;
            const isUnlocked = balance >= t.minPoints;

            return (
              <div
                key={tKey}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  isCurrent
                    ? 'border-cyan-500 bg-cyan-50/40 shadow-sm ring-2 ring-cyan-500/20'
                    : isUnlocked
                    ? 'border-slate-300 bg-white'
                    : 'border-slate-200 bg-slate-50/60 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${t.badgeBg} ${t.badgeText}`}>
                      {t.nombre}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 bg-cyan-600 text-white text-[9px] font-bold rounded-full uppercase">
                        Actual
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 font-medium">
                    Desde <strong className="text-slate-900 font-mono">{t.minPoints} pts</strong>
                  </p>
                  <p className="text-xs font-bold text-cyan-700 mt-0.5">
                    Multiplicador: {t.multiplier}x
                  </p>

                  <ul className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                    {t.beneficios.map((b, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isUnlocked ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Points Redemption Simulator Card */}
      <div className="bg-gradient-to-r from-cyan-50 via-white to-slate-50 p-6 sm:p-7 rounded-3xl border border-cyan-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-800 uppercase tracking-wider">
            <Coins className="w-4 h-4 text-cyan-600" />
            <span>Canje Inmediato de Puntos</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            ¿Deseas canjear parte de tus X-Points por descuento?
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Puedes canjear bloques de puntos a razón de <strong>10 X-Points = Bs. 1.00</strong>. Tu saldo actual permite canjear hasta <strong>Bs. {monetaryValue.toFixed(2)}</strong>.
          </p>
        </div>

        <form onSubmit={handleRedeem} className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
          <div className="flex items-center gap-2 bg-white px-3 py-2 border border-slate-300 rounded-xl w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500">Pts:</span>
            <input
              type="number"
              min={10}
              max={balance}
              step={10}
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(Number(e.target.value))}
              className="w-20 text-xs font-black text-slate-900 focus:outline-hidden"
            />
            <span className="text-[11px] text-cyan-700 font-bold border-l pl-2">
              = Bs. {(redeemAmount / 10).toFixed(2)}
            </span>
          </div>

          <button
            type="submit"
            disabled={balance < 10 || redeemAmount > balance}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-cyan-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Canjear Puntos</span>
          </button>
        </form>
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-600" />
              <span>Historial de Movimientos de X-Points</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Registro detallado de todas tus compras, bonificaciones y canjes
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {transactions.length} movimientos
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Coins className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">Aún no tienes movimientos de puntos registrados.</p>
            {onNavigateToCatalog && (
              <button
                onClick={onNavigateToCatalog}
                className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-cyan-600 transition-colors cursor-pointer"
              >
                Comenzar a Comprar
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="px-6 py-3">Fecha</th>
                  <th className="px-6 py-3">Tipo / Concepto</th>
                  <th className="px-6 py-3">Referencia</th>
                  <th className="px-6 py-3 text-right">Puntos</th>
                  <th className="px-6 py-3 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {transactions.map((tx) => {
                  const isPositive = tx.points > 0;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{tx.description}</div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                          {tx.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px]">
                        {tx.orderNumber ? (
                          <button
                            type="button"
                            onClick={() => onNavigateToTracking && onNavigateToTracking(tx.orderNumber!)}
                            className="text-cyan-700 hover:text-cyan-900 font-bold underline cursor-pointer"
                          >
                            {tx.orderNumber}
                          </button>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap font-mono font-black">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            isPositive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPositive ? `+${tx.points}` : tx.points} pts
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap font-mono font-bold text-slate-900">
                        {tx.balanceAfter} pts
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
