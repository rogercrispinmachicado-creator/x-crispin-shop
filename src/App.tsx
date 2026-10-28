import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { ReceptionPanelPage } from './pages/ReceptionPanelPage';
import { SellerPanelPage } from './pages/SellerPanelPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AccountPage } from './pages/AccountPage';
import { SharedWishlistPage } from './pages/SharedWishlistPage';
import { LegalPages } from './pages/LegalPages';
import { OfflineCacheBanner } from './components/common/OfflineCacheBanner';
import { WhatsAppFloatingCTA } from './components/common/WhatsAppFloatingCTA';
import { GeminiChatWidget } from './components/chat/GeminiChatWidget';
import { WishlistToast } from './components/wishlist/WishlistToast';
import { QrScannerModal } from './components/scanner';
import { ComparisonProvider } from './context/ComparisonContext';
import { ComparisonBar, ComparisonModal } from './components/comparison';

function MainApp() {
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [routeParam, setRouteParam] = useState<string | undefined>(undefined);
  const [routeSubparam, setRouteSubparam] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);

  // Initial URL query / hash detection for shared links (wishlist, tracking, etc.)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash;

      const wishlistParam =
        urlParams.get('wishlist') ||
        urlParams.get('shared-wishlist') ||
        urlParams.get('wl_data');

      if (wishlistParam) {
        setCurrentRoute('shared-wishlist');
        setRouteParam(wishlistParam);
        return;
      }

      if (hash && hash.includes('wishlist=')) {
        const code = hash.split('wishlist=')[1]?.split('&')[0];
        if (code) {
          setCurrentRoute('shared-wishlist');
          setRouteParam(code);
          return;
        }
      }

      const pedidoParam = urlParams.get('pedido');
      if (pedidoParam) {
        setCurrentRoute('seguimiento');
        setRouteParam(pedidoParam);
        return;
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentRoute, routeParam, routeSubparam]);

  const handleNavigate = (route: string, param?: string, subparam?: string) => {
    if (route.includes('?pedido=')) {
      const parts = route.split('?pedido=');
      setCurrentRoute('seguimiento');
      setRouteParam(parts[1]);
      setRouteSubparam(undefined);
      return;
    }

    if (route.includes('?wishlist=') || route.includes('?shared-wishlist=')) {
      const parts = route.includes('?wishlist=')
        ? route.split('?wishlist=')
        : route.split('?shared-wishlist=');
      setCurrentRoute('shared-wishlist');
      setRouteParam(parts[1]);
      setRouteSubparam(undefined);
      return;
    }

    setCurrentRoute(route);
    setRouteParam(param);
    setRouteSubparam(subparam);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setCurrentRoute('productos');
    }
  };

  const renderCurrentPage = () => {
    switch (currentRoute) {
      case 'home':
        return (
          <HomePage
            onNavigate={handleNavigate}
            onSelectProduct={(slug) => {
              setCurrentRoute('producto');
              setRouteParam(slug);
            }}
          />
        );

      case 'productos':
        return (
          <CatalogPage
            initialCategoryId={routeParam}
            initialSubcategoryId={routeSubparam}
            searchQuery={searchQuery}
            onSelectProduct={(slug) => {
              setCurrentRoute('producto');
              setRouteParam(slug);
            }}
            onNavigateToCheckout={() => setCurrentRoute('checkout')}
            onOpenQrScanner={() => setIsQrScannerOpen(true)}
          />
        );

      case 'producto':
        return (
          <ProductDetailPage
            slug={routeParam || ''}
            onNavigateToCheckout={() => setCurrentRoute('checkout')}
            onSelectProduct={(slug) => {
              setCurrentRoute('producto');
              setRouteParam(slug);
            }}
            onBackToCatalog={() => setCurrentRoute('productos')}
          />
        );

      case 'checkout':
        return (
          <CheckoutPage
            onOrderCompleted={(orderNum) => {
              setCurrentRoute('seguimiento');
              setRouteParam(orderNum);
            }}
            onNavigate={handleNavigate}
          />
        );

      case 'seguimiento':
        return (
          <OrderTrackingPage
            initialOrderNumber={routeParam}
            onNavigateToCatalog={() => setCurrentRoute('productos')}
          />
        );

      case 'recepcion':
        return <ReceptionPanelPage />;

      case 'vendedor':
        return <SellerPanelPage />;

      case 'admin':
        return <AdminDashboardPage />;

      case 'shared-wishlist':
      case 'wishlist-compartida':
        return (
          <SharedWishlistPage
            wishlistCode={routeParam || ''}
            onSelectProduct={(slug) => {
              setCurrentRoute('producto');
              setRouteParam(slug);
            }}
            onNavigateToCatalog={() => setCurrentRoute('productos')}
            onNavigateToCheckout={() => setCurrentRoute('checkout')}
          />
        );

      case 'cuenta':
      case 'wishlist':
      case 'deseos':
      case 'alertas':
      case 'price-alerts':
      case 'puntos':
      case 'points':
      case 'xpoints':
        return (
          <AccountPage
            initialTab={
              currentRoute === 'wishlist' || currentRoute === 'deseos' || routeParam === 'wishlist'
                ? 'wishlist'
                : currentRoute === 'alertas' || currentRoute === 'price-alerts' || routeParam === 'alerts'
                ? 'alerts'
                : currentRoute === 'puntos' || currentRoute === 'points' || currentRoute === 'xpoints' || routeParam === 'points'
                ? 'points'
                : 'orders'
            }
            onNavigateToTracking={(orderNum) => {
              setCurrentRoute('seguimiento');
              setRouteParam(orderNum);
            }}
            onNavigateToCatalog={() => setCurrentRoute('productos')}
            onSelectProduct={(slug) => {
              setCurrentRoute('producto');
              setRouteParam(slug);
            }}
            onNavigateToCheckout={() => setCurrentRoute('checkout')}
            onNavigateToSharedWishlist={(code) => {
              setCurrentRoute('shared-wishlist');
              setRouteParam(code);
            }}
          />
        );

      case 'terminos':
        return <LegalPages type="terminos" />;

      case 'privacidad':
        return <LegalPages type="privacidad" />;

      case 'cambios-devoluciones':
        return <LegalPages type="cambios" />;

      case 'contacto':
        return <LegalPages type="contacto" />;

      default:
        return (
          <HomePage
            onNavigate={handleNavigate}
            onSelectProduct={(slug) => {
              setCurrentRoute('producto');
              setRouteParam(slug);
            }}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/50 text-slate-900 selection:bg-cyan-500 selection:text-white">
      {/* Sticky Top Navigation */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
      />

      {/* Offline & Cache Status Banner */}
      <OfflineCacheBanner />

      {/* Main Page Area */}
      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      {/* Global Shopping Cart Drawer */}
      <CartDrawer
        onGoToCheckout={() => setCurrentRoute('checkout')}
        onContinueShopping={() => setCurrentRoute('productos')}
      />

      {/* Floating WhatsApp CTA for Customer Support & Information (72902338) */}
      <WhatsAppFloatingCTA />

      {/* Floating Wishlist Feedback Notification Toast */}
      <WishlistToast onNavigateToWishlist={() => handleNavigate('cuenta', 'wishlist')} />

      {/* Live Camera QR Code Product Scanner Modal */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onProductFound={(slug) => {
          setCurrentRoute('producto');
          setRouteParam(slug);
        }}
      />

      {/* Floating AI Chat Assistant Powered by Gemini */}
      <GeminiChatWidget onNavigate={handleNavigate} />

      {/* Floating Comparison Drawer / Bar */}
      <ComparisonBar />

      {/* Product Comparison Full Modal */}
      <ComparisonModal
        onSelectProduct={(slug) => {
          setCurrentRoute('producto');
          setRouteParam(slug);
        }}
        onNavigateToCheckout={() => setCurrentRoute('checkout')}
      />

      {/* Global Footer with Official Bolivian Payments & Logistics */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <ComparisonProvider>
          <CartProvider>
            <MainApp />
          </CartProvider>
        </ComparisonProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
