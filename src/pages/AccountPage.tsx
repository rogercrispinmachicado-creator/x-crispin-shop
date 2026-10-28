import React, { useState } from 'react';
import {
  User,
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  HelpCircle,
  ShieldCheck,
  Headphones,
  Package,
  Heart,
  Bell,
  Sparkles,
  Coins,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { usePriceAlerts } from '../hooks/usePriceAlerts';
import { useLoyalty } from '../hooks/useLoyalty';
import { OrderHistory } from '../components/account/OrderHistory';
import { WishlistSection } from '../components/wishlist/WishlistSection';
import { PriceAlertsTab } from '../components/account/PriceAlertsTab';
import { LoyaltyPointsSection } from '../components/account/LoyaltyPointsSection';
import { whatsappService } from '../services/whatsappService';

export interface AccountPageProps {
  onNavigateToTracking: (orderNum: string) => void;
  onNavigateToCatalog?: () => void;
  onSelectProduct?: (slug: string) => void;
  onNavigateToCheckout?: () => void;
  onNavigateToSharedWishlist?: (code: string) => void;
  initialTab?: 'orders' | 'wishlist' | 'alerts' | 'points';
}

export const AccountPage: React.FC<AccountPageProps> = ({
  onNavigateToTracking,
  onNavigateToCatalog,
  onSelectProduct,
  onNavigateToCheckout,
  onNavigateToSharedWishlist,
  initialTab = 'orders',
}) => {
  const { currentUser, switchRole, demoUsers } = useAuth();
  const { wishlistCount } = useWishlist();
  const { userAlerts } = usePriceAlerts();
  const { balance, tier, monetaryValue } = useLoyalty();
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'alerts' | 'points'>(initialTab);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-sans">
      {/* User Profile Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-900 text-cyan-100 flex items-center justify-center font-black text-2xl shadow-xs">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {currentUser.name} {currentUser.lastName || ''}
              </h1>
              <span className="px-2.5 py-0.5 bg-cyan-100 text-cyan-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {currentUser.role}
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('points')}
                id="header-xpoints-badge"
                className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-gradient-to-r from-amber-50 to-yellow-100 border border-amber-300 text-amber-950 rounded-full text-[11px] font-black tracking-wide shadow-2xs hover:scale-105 transition-transform cursor-pointer"
                title="Ver mi saldo y beneficios del Club X-Points"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>{balance.toLocaleString()} X-Points</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {currentUser.email}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {currentUser.phone}
              </span>
              {currentUser.city && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {currentUser.city}, {currentUser.department}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Demo Switcher for Evaluation */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase block">
            Cambiar Rol Demo:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {demoUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => switchRole(u.role)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentUser.role === u.role
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {u.role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Official WhatsApp Support & Information Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-950 text-white p-6 sm:p-7 rounded-3xl shadow-sm border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
              <Headphones className="w-3.5 h-3.5" />
              <span>Canal Oficial de Atención al Cliente</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Soporte e Información WhatsApp:{' '}
              <span className="text-emerald-400">72902338</span>
            </h2>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Atención personalizada para el seguimiento de compras, confirmación de transferencias QR, facturación y envíos a los 9 departamentos de Bolivia.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href={whatsappService.buildSupportUrl()}
              target="_blank"
              rel="noreferrer"
              id="account-page-whatsapp-support"
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-slate-950" />
              <span>Soporte WhatsApp</span>
            </a>

            <a
              href={whatsappService.buildInformationUrl()}
              target="_blank"
              rel="noreferrer"
              id="account-page-whatsapp-info"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-emerald-300" />
              <span>Más Información</span>
            </a>

            <a
              href="tel:72902338"
              id="account-page-call-phone"
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer"
              title="Llamar directamente al 72902338"
            >
              <Phone className="w-4 h-4 text-emerald-300" />
              <span className="hidden sm:inline">Llamar:</span>
              <span>72902338</span>
            </a>
          </div>
        </div>
      </div>

      {/* Loyalty Points Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-cyan-800/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
            <Coins className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-cyan-300">Programa de Fidelidad X-Points</span>
              <span className={`px-2 py-0.2 rounded text-[10px] font-black uppercase ${tier.badgeBg} ${tier.badgeText}`}>
                {tier.nombre}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">{balance.toLocaleString()}</span>
              <span className="text-xs text-amber-400 font-bold">X-Points</span>
              <span className="text-xs text-slate-400 hidden sm:inline">• Equivalente a Bs. {monetaryValue.toFixed(2)} de descuento</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('points')}
          id="account-view-points-club-btn"
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ver Club & Beneficios</span>
        </button>
      </div>

      {/* Navigation Tabs for Account Sections */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          id="account-tab-orders"
          className={`flex items-center gap-2 px-4 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-cyan-600 text-cyan-700 bg-cyan-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Mis Pedidos y Facturas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('points')}
          id="account-tab-points"
          className={`flex items-center gap-2 px-4 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'points'
              ? 'border-amber-500 text-amber-800 bg-amber-50/60 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
          }`}
        >
          <Coins className={`w-4 h-4 ${activeTab === 'points' ? 'text-amber-600 fill-amber-500' : ''}`} />
          <span>Mis X-Points</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'points'
                ? 'bg-amber-200 text-amber-900 font-black'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {balance.toLocaleString()} pts
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wishlist')}
          id="account-tab-wishlist"
          className={`flex items-center gap-2 px-4 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'wishlist'
              ? 'border-rose-500 text-rose-600 bg-rose-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
          }`}
        >
          <Heart className={`w-4 h-4 ${activeTab === 'wishlist' ? 'fill-rose-500' : ''}`} />
          <span>Mi Lista de Deseos</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'wishlist'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {wishlistCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('alerts')}
          id="account-tab-alerts"
          className={`flex items-center gap-2 px-4 py-3 font-bold text-xs sm:text-sm border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'alerts'
              ? 'border-amber-500 text-amber-700 bg-amber-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
          }`}
        >
          <Bell className={`w-4 h-4 ${activeTab === 'alerts' ? 'text-amber-500 fill-amber-500' : ''}`} />
          <span>Alertas de Precio</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'alerts'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {userAlerts.length}
          </span>
        </button>
      </div>

      {/* Tab Content Display */}
      {activeTab === 'orders' && (
        <OrderHistory
          onNavigateToTracking={onNavigateToTracking}
          onNavigateToCatalog={onNavigateToCatalog}
        />
      )}
      {activeTab === 'points' && (
        <LoyaltyPointsSection
          onNavigateToCatalog={onNavigateToCatalog}
          onNavigateToTracking={onNavigateToTracking}
        />
      )}
      {activeTab === 'wishlist' && (
        <WishlistSection
          onSelectProduct={onSelectProduct}
          onNavigateToCatalog={onNavigateToCatalog}
          onNavigateToCheckout={onNavigateToCheckout}
          onNavigateToSharedWishlist={onNavigateToSharedWishlist}
        />
      )}
      {activeTab === 'alerts' && (
        <PriceAlertsTab
          onSelectProduct={onSelectProduct}
          onNavigateToCatalog={onNavigateToCatalog}
        />
      )}
    </div>
  );
};

export { OrderHistory };
