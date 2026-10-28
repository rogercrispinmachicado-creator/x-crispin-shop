import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  User,
  Bell,
  Menu,
  X,
  PackageCheck,
  ShieldCheck,
  Store,
  Compass,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  HeartPulse,
  Heart,
  QrCode,
  Camera,
  Scale,
  Sparkles,
  Coins,
} from 'lucide-react';
import { XLogo } from '../common/XLogo';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useComparison } from '../../context/ComparisonContext';
import { storage } from '../../services/storage';
import { AppNotification } from '../../types';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string, param?: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
  onOpenQrScanner?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onOpenQrScanner,
}) => {
  const { toggleCart, totalItemsCount } = useCart();
  const { currentUser, currentRole, switchRole } = useAuth();
  const { wishlistCount } = useWishlist();
  const { compareProducts, openCompareModal } = useComparison();
  const compareCount = compareProducts.length;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNotifications(storage.getNotifications());
    const unsub = storage.subscribe(() => {
      setNotifications(storage.getNotifications());
    });
    return unsub;
  }, []);

  // Close notifications when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.leida).length;

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, leida: true }));
    storage.saveNotifications(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Role Switcher Bar - Crucial for fast multi-role preview testing */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-300">
              Operando en <strong className="text-white">Bolivia (BOB • Bs.)</strong>
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden lg:inline text-slate-400">Envíos a los 9 departamentos</span>
            <span className="hidden lg:inline text-slate-500">•</span>
            <a
              href="https://wa.me/59172902338?text=Hola%20X-CRISPIN%20Soporte%2C%20deseo%20informaci%C3%B3n%20y%20atenci%C3%B3n."
              target="_blank"
              rel="noreferrer"
              id="topbar-whatsapp-link"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
              title="Atención al cliente vía WhatsApp"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>WhatsApp Soporte: 72902338</span>
            </a>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-medium mr-1 hidden sm:inline">Rol activo:</span>
            <button
              onClick={() => switchRole('CUSTOMER')}
              id="role-switch-customer"
              className={`px-2.5 py-0.5 rounded-full transition-all font-medium whitespace-nowrap ${
                currentRole === 'CUSTOMER'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Cliente
            </button>
            <button
              onClick={() => switchRole('SELLER')}
              id="role-switch-seller"
              className={`px-2.5 py-0.5 rounded-full transition-all font-medium whitespace-nowrap ${
                currentRole === 'SELLER'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Vendedor
            </button>
            <button
              onClick={() => switchRole('RECEPTION')}
              id="role-switch-reception"
              className={`px-2.5 py-0.5 rounded-full transition-all font-medium whitespace-nowrap ${
                currentRole === 'RECEPTION'
                  ? 'bg-purple-400 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Recepción
            </button>
            <button
              onClick={() => switchRole('ADMIN')}
              id="role-switch-admin"
              className={`px-2.5 py-0.5 rounded-full transition-all font-medium whitespace-nowrap ${
                currentRole === 'ADMIN'
                  ? 'bg-rose-500 text-white font-bold shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo X-CRISPIN */}
          <div
            onClick={() => onNavigate('home')}
            className="cursor-pointer flex-shrink-0 flex items-center py-1"
            id="nav-logo"
          >
            <XLogo size="md" showSlogan={true} />
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar en X-CRISPIN: smartphones, laptops, audio, accesorios..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-32 py-2.5 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-hidden transition-all text-sm"
                id="main-search-input"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {onOpenQrScanner && (
                  <button
                    type="button"
                    onClick={onOpenQrScanner}
                    id="desktop-qr-scanner-btn"
                    className="p-1.5 text-slate-500 hover:text-cyan-600 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
                    title="Escanear código QR de producto con cámara"
                    aria-label="Escanear código QR"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onSearchSubmit}
                  id="main-search-button"
                  className="px-3 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>

          {/* Nav Links & Actions */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Desktop Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
              <button
                onClick={() => onNavigate('home')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentRoute === 'home' ? 'text-cyan-600 font-semibold bg-cyan-50' : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Inicio
              </button>
              <button
                onClick={() => onNavigate('productos')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentRoute === 'productos' ? 'text-cyan-600 font-semibold bg-cyan-50' : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Catálogo
              </button>
              <button
                onClick={() => onNavigate('productos', 'cat-fx-salud-bienestar')}
                className="px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/80 font-medium"
              >
                <HeartPulse className="w-4 h-4 text-emerald-600" />
                <span>Salud & Bienestar</span>
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">Top</span>
              </button>
              <button
                onClick={() => onNavigate('seguimiento')}
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentRoute === 'seguimiento' ? 'text-cyan-600 font-semibold bg-cyan-50' : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Compass className="w-4 h-4 text-cyan-500" />
                Seguimiento
              </button>

              {/* Contextual Role Portal Shortcuts */}
              {currentRole === 'SELLER' && (
                <button
                  onClick={() => onNavigate('vendedor')}
                  className={`px-3 py-1.5 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 font-semibold flex items-center gap-1.5 border border-amber-200 transition-colors`}
                >
                  <Store className="w-4 h-4" />
                  Panel Vendedor
                </button>
              )}

              {currentRole === 'RECEPTION' && (
                <button
                  onClick={() => onNavigate('recepcion')}
                  className={`px-3 py-1.5 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 font-semibold flex items-center gap-1.5 border border-purple-200 transition-colors`}
                >
                  <PackageCheck className="w-4 h-4" />
                  Recepción Pedidos
                </button>
              )}

              {currentRole === 'ADMIN' && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`px-3 py-1.5 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 font-semibold flex items-center gap-1.5 border border-rose-200 transition-colors`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </button>
              )}
            </nav>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen((prev) => !prev)}
                className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                id="notification-bell-btn"
                aria-label="Notificaciones"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 text-sm">Notificaciones</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">
                          {unreadCount} nuevas
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-cyan-600 hover:text-cyan-800 font-medium"
                      >
                        Marcar leídas
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-6">No tienes notificaciones</p>
                    ) : (
                      notifications.slice(0, 6).map((n, idx) => (
                        <div
                          key={`${n.id || 'notif'}-${idx}`}
                          className={`p-3 hover:bg-slate-50 transition-colors ${
                            !n.leida ? 'bg-cyan-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-semibold text-slate-800">{n.titulo}</h4>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(n.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.mensaje}</p>
                          {n.pedidoId && (
                            <button
                              onClick={() => {
                                onNavigate(`seguimiento?pedido=${n.pedidoId}`);
                                setNotificationsOpen(false);
                              }}
                              className="text-[11px] text-cyan-600 hover:text-cyan-700 font-semibold mt-1.5 inline-flex items-center gap-1"
                            >
                              Ver seguimiento de {n.pedidoId} &rarr;
                            </button>
                          )}
                          {n.productoSlug && (
                            <button
                              onClick={() => {
                                onNavigate('producto', n.productoSlug);
                                setNotificationsOpen(false);
                              }}
                              className="text-[11px] text-amber-600 hover:text-amber-700 font-bold mt-1.5 inline-flex items-center gap-1"
                            >
                              Ver oferta en producto &rarr;
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick QR Scanner Button */}
            {onOpenQrScanner && (
              <button
                onClick={onOpenQrScanner}
                id="nav-qr-scan-btn"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-slate-700 hover:text-cyan-600 hover:bg-cyan-50/70 border border-slate-200/80 rounded-xl transition-all text-xs font-bold shadow-2xs cursor-pointer"
                title="Escanear código QR de producto con cámara"
              >
                <QrCode className="w-4 h-4 text-cyan-600" />
                <span className="hidden xl:inline">Escanear QR</span>
              </button>
            )}

            {/* Wishlist Button */}
            <button
              onClick={() => onNavigate('cuenta', 'wishlist')}
              id="nav-wishlist-btn"
              className="relative p-2.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50/70 rounded-xl transition-colors cursor-pointer"
              aria-label={`Lista de deseos (${wishlistCount})`}
              title="Mi Lista de Deseos"
            >
              <Heart
                className={`w-5 h-5 transition-transform duration-200 ${
                  wishlistCount > 0 ? 'fill-rose-500 text-rose-500 scale-105' : 'text-slate-600'
                }`}
              />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Compare Products Button */}
            <button
              onClick={openCompareModal}
              id="nav-compare-btn"
              className="relative p-2.5 text-slate-600 hover:text-cyan-600 hover:bg-cyan-50/70 rounded-xl transition-colors cursor-pointer"
              aria-label={`Comparador de productos (${compareCount})`}
              title="Comparador de Productos (máx. 3)"
            >
              <Scale
                className={`w-5 h-5 transition-transform duration-200 ${
                  compareCount > 0 ? 'text-cyan-600 scale-105' : 'text-slate-600'
                }`}
              />
              {compareCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-cyan-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs animate-in zoom-in-50">
                  {compareCount}
                </span>
              )}
            </button>

            {/* User Account / Profile */}
            <button
              onClick={() => onNavigate('cuenta')}
              id="nav-account-btn"
              className="hidden sm:flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors text-sm"
            >
              <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-semibold leading-tight text-slate-900">{currentUser.name}</p>
                <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 fill-amber-500" />
                  <span>{(currentUser.xPoints ?? 350).toLocaleString()} X-Points</span>
                </p>
              </div>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={toggleCart}
              id="nav-cart-btn"
              className="relative flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-cyan-600 text-white rounded-xl transition-all shadow-xs"
              aria-label="Abrir carrito"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="font-bold text-xs">{totalItemsCount}</span>
              {totalItemsCount > 0 && (
                <span className="hidden sm:inline text-xs font-medium border-l border-slate-700 pl-2">
                  Carrito
                </span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
              aria-label="Menú principal"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-3">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar en X-CRISPIN..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-28 py-2 bg-slate-100 text-slate-900 rounded-xl border border-slate-200 text-sm focus:bg-white focus:border-cyan-500 outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {onOpenQrScanner && (
                <button
                  type="button"
                  onClick={onOpenQrScanner}
                  id="mobile-search-qr-btn"
                  className="p-1.5 text-slate-600 hover:text-cyan-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  title="Escanear QR de producto con cámara"
                  aria-label="Escanear QR con cámara"
                >
                  <QrCode className="w-4 h-4 text-cyan-600" />
                </button>
              )}
              <button
                onClick={onSearchSubmit}
                className="px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4 space-y-2 animate-in fade-in duration-150">
            {onOpenQrScanner && (
              <button
                onClick={() => {
                  onOpenQrScanner();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-700 text-white font-bold text-xs flex items-center justify-between shadow-xs mb-2 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span>Escanear Código QR de Producto</span>
                </div>
                <QrCode className="w-4 h-4 opacity-80" />
              </button>
            )}

            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-800 font-medium hover:bg-slate-100"
            >
              Inicio
            </button>
            <button
              onClick={() => {
                onNavigate('productos');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-800 font-medium hover:bg-slate-100"
            >
              Catálogo de Productos
            </button>
            <button
              onClick={() => {
                onNavigate('productos', 'cat-fx-salud-bienestar');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-emerald-800 font-semibold bg-emerald-50/70 hover:bg-emerald-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-emerald-600" />
                <span>Área Salud & Bienestar</span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded-full">Oficial</span>
            </button>
            <button
              onClick={() => {
                onNavigate('seguimiento');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-800 font-medium hover:bg-slate-100 flex items-center justify-between"
            >
              <span>Seguimiento de Pedidos</span>
              <Compass className="w-4 h-4 text-cyan-500" />
            </button>
            <button
              onClick={() => {
                onNavigate('cuenta', 'wishlist');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-800 font-medium hover:bg-slate-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                <span>Mi Lista de Deseos</span>
              </div>
              {wishlistCount > 0 && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                openCompareModal();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-800 font-medium hover:bg-slate-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Scale className={`w-4 h-4 ${compareCount > 0 ? 'text-cyan-600' : 'text-slate-400'}`} />
                <span>Comparador de Productos</span>
              </div>
              {compareCount > 0 && (
                <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 text-xs font-bold rounded-full">
                  {compareCount}/3
                </span>
              )}
            </button>
            <button
              onClick={() => {
                onNavigate('puntos');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-800 font-medium hover:bg-slate-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>Mis X-Points</span>
              </div>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-xs font-black rounded-full">
                {(currentUser.xPoints ?? 350).toLocaleString()} pts
              </span>
            </button>
            <button
              onClick={() => {
                onNavigate('cuenta');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-800 font-medium hover:bg-slate-100 flex items-center justify-between"
            >
              <span>Mi Cuenta ({currentUser.name})</span>
              <User className="w-4 h-4 text-slate-400" />
            </button>

            <div className="pt-2 border-t border-slate-100">
              <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Accesos de Gestión
              </p>
              <button
                onClick={() => {
                  onNavigate('vendedor');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-amber-800 font-semibold hover:bg-amber-50 flex items-center gap-2"
              >
                <Store className="w-4 h-4" />
                Panel Vendedor / Distribuidor
              </button>
              <button
                onClick={() => {
                  onNavigate('recepcion');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-purple-800 font-semibold hover:bg-purple-50 flex items-center gap-2"
              >
                <PackageCheck className="w-4 h-4" />
                Recepción y Verificación de Pagos
              </button>
              <button
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-rose-800 font-semibold hover:bg-rose-50 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Panel Administrador
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
