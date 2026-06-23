import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './lib/AuthHooks';
import { SignedIn, SignedOut } from './lib/AuthGuards';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { motion, AnimatePresence } from 'framer-motion';

// --- Services ---
import { getProducts } from './services/productService';

// --- Assets ---
import headphone from './assets/hero/headphone.png';
import SmartWatch from './assets/category/smartwatch2-removebg-preview.png';

// --- Components ---
import Navbar from './component/Navbar/Navbar';
import Hero from './component/Hero/Hero';
import PromotionsBanners from './component/Hero/PromotionsBanners';
import Category from './component/Category/Category';
import Category2 from './component/Category/Category2';
import Services from './component/Services/Services';
import Blogs from './component/Blogs/Blogs';
import Partners from './component/Partners/Partners';
import Footer from './component/Footer/Footer';
import ProductGrid from './component/Products/ProductGrid';
import Login from './component/Auth/Login';
import Register from './component/Auth/Register';
import ResetPassword from './component/Auth/ResetPassword';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ProfileSync from './component/Auth/ProfileSync';
import { notificationService } from './services/notificationService';
import SEO from './component/Shared/SEO';

import ScrollToTop from './component/Shared/ScrollToTop';
import CookieConsent from './component/Shared/CookieConsent';
import SupportChat from './component/Shared/SupportChat';
import SupplierBlockModal from './component/Shared/SupplierBlockModal';
import EmailVerificationBanner from './component/Shared/EmailVerificationBanner';



// --- Pages/Routes ---
import ProductsList from './component/Products/ProductsList';
import ProductPages from './component/Products/ProductPages';
import CartPage from './component/context/CartPage';
import CheckoutPage from './component/context/CheckoutPage';
import CheckoutSuccess from './component/context/CheckoutSuccess';
import AddressSelector from './component/context/AddressSelector';
import GuestOrderConfirmationPage from './component/context/GuestOrderConfirmationPage';
import OrderDetail from './component/User/OrderDetail';
import DashboardRoutes from './component/User/DashboardRoutes';
import AdminLayout from './component/Admin/AdminLayaout'; // Note: maintained typo to match existing file
import FaqList from './component/Popup/Faq';
import PolicyPage from './component/Popup/Policypage';
import About from './component/About/About';
import PlatformReviews from './component/Popup/PlatformReviews';
import NotFoundPage from './component/Shared/NotFoundPage';
import BlogDetail from './component/Blogs/BlogDetail';
import MagPage from './component/Blogs/MagPage';
import Privacy from './component/Popup/Privacy';
import MentionsLegales from './pages/MentionsLegales';

// --- How It Works ---
import HowItWorksPage from './pages/HowItWorks/HowItWorksPage';

// --- Promotion Pages ---
import PromotionsHub from './pages/Promotions/PromotionsHub';
import FlashSalePage from './pages/Promotions/FlashSalePage';
import QuantityDiscountPage from './pages/Promotions/QuantityDiscountPage';
// import KitsPage from './pages/Promotions/KitsPage'; // KIT PROMOTIONS — DÉSACTIVÉ
// import KitDetailPage from './pages/Promotions/KitDetailPage'; // KIT PROMOTIONS — DÉSACTIVÉ
import ReductionsPage from './pages/Promotions/ReductionsPage';
import PromoDetailPage from './pages/Promotions/PromoDetailPage';
import SupplierStorePage from './pages/Supplier/SupplierStorePage';

// --- Delivery ---
import DeliveryRoutes from './component/Delivery/DeliveryRoutes';
import DevenirLivreur from './component/Delivery/DevenirLivreur';
import { useProfile } from './component/context/useProfile';

// --- Supplier ---
import SupplierRegister from './component/Supplier/SupplierRegister';
import SupplierDashboard from './component/Supplier/SupplierDashboard';
import AddProductSupplier from './component/Supplier/AddProductSupplier';


const AppContent = ({ products, loading }) => {
  const location = useLocation();
  const { user: profileUser, loading: profileLoading } = useProfile();
  const { signOut } = useAuth();
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  useEffect(() => {
    if (window.fbq) window.fbq('track', 'PageView');
    if (window.gtag) window.gtag('config', 'G-VVET0H2YQ7', { page_path: location.pathname });
  }, [location.pathname]);

    useEffect(() => {
        if (profileUser?.id) {
            notificationService.connect(profileUser.id);
        }
        return () => notificationService.disconnect();
    }, [profileUser]);

  const handleSupplierSignOut = async (redirectToRegister = false) => {
    await signOut();
    setShowSupplierModal(false);
    if (redirectToRegister) {
      window.location.href = '/auth/inscription';
    } else {
      window.location.href = '/auth/connexion';
    }
  };

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  const PageWrapper = ({ children }) => (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );

  const SUPPLIER_PORTAL_URL = import.meta.env.VITE_SUPPLIER_PORTAL_URL || 'http://localhost:5174';

  const ExternalRedirect = ({ url }) => {
    useEffect(() => {
      window.location.replace(url);
    }, [url]);
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  };

  const Home = () => {
    return (
      <>
        <Navbar />
        <Hero />
        <PromotionsBanners />
        <Category />
        <ProductGrid products={products} showButton={true} loading={loading} />
        <Services />
        <Footer />
      </>
    );
  };

  const PublicRoute = ({ children }) => {
    return children;
  };

  if (profileLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="bg-base-100 text-base-content transition-colors duration-300 overflow-hidden min-h-screen">

      <SEO />
      <ProfileSync />

        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />

          {/* Public Routes restricted for Livreur */}
          <Route path="/categories" element={<PublicRoute><><Navbar /><Category2 /><Footer /></></PublicRoute>} />
          <Route path="/products" element={<PublicRoute><><Navbar /><ProductGrid /><Footer /></></PublicRoute>} />
          <Route path="/products/:id" element={<PublicRoute><><Navbar /><ProductPages /><Footer /></></PublicRoute>} />
          <Route path="/vendeur/:supplierId" element={<PublicRoute><><Navbar /><SupplierStorePage /><Footer /></></PublicRoute>} />
          <Route path="/products-liste" element={<PublicRoute><><Navbar /><ProductsList /><Footer /></></PublicRoute>} />
          <Route path="/promotions" element={<PublicRoute><PromotionsHub /></PublicRoute>} />
          <Route path="/promotions/reductions" element={<PublicRoute><ReductionsPage /></PublicRoute>} />
          <Route path="/promotions/flash" element={<PublicRoute><FlashSalePage /></PublicRoute>} />
          <Route path="/promotions/quantite" element={<PublicRoute><QuantityDiscountPage /></PublicRoute>} />
          {/* <Route path="/promotions/kits" element={<PublicRoute><KitsPage /></PublicRoute>} /> */}{/* KIT PROMOTIONS — DÉSACTIVÉ */}
          {/* <Route path="/promotions/kit/:id" element={<PublicRoute><KitDetailPage /></PublicRoute>} /> */}{/* KIT PROMOTIONS — DÉSACTIVÉ */}
          <Route path="/promotions/produit/:id" element={<PublicRoute><PromoDetailPage /></PublicRoute>} />
          <Route path="/about" element={<PublicRoute><><Navbar /><About /><Footer /></></PublicRoute>} />
          <Route path="/comment-ca-marche" element={<PublicRoute><><Navbar /><HowItWorksPage /><Footer /></></PublicRoute>} />
          <Route path="/comment-ca-marche/:tab" element={<PublicRoute><><Navbar /><HowItWorksPage /><Footer /></></PublicRoute>} />
          <Route path="/cartpage" element={<PublicRoute><><Navbar /><CartPage /><Footer /></></PublicRoute>} />
          <Route path="/checkout" element={<PublicRoute><><Navbar /><CheckoutPage /><Footer /></></PublicRoute>} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/checkout/error" element={<><Navbar /><div className="min-h-screen flex items-center justify-center text-rose-500 font-black text-xl">Paiement échoué ou annulé.</div><Footer /></>} />
          <Route path="/temoignages" element={<><Navbar /><PlatformReviews /><Footer /></>} />

          {/* Auth Routes — full-screen, no Navbar/Footer */}
          <Route path="/auth/inscription/*" element={<Register />} />
          <Route path="/auth/connexion/*" element={<Login />} />
          <Route path="/reset-password" element={<><Navbar /><ResetPassword /><Footer /></>} />
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/mag" element={<MagPage />} />

          {/* User Dashboard - Restricted for Livreur */}
          <Route path="/user/dashboard/*" element={
            <PublicRoute>
                <SignedIn>
                  <DashboardRoutes />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/auth/connexion" replace />
                </SignedOut>
            </PublicRoute>
          } />

          {/* Delivery Rider Dashboard */}
          <Route path="/delivery-rider/*" element={
              <>
                <SignedIn>
                  {profileUser?.isDelivery || profileUser?.isAdmin ? (
                    <DeliveryRoutes />
                  ) : (
                    <Navigate to="/" replace />
                  )}
                </SignedIn>
                <SignedOut>
                  <Navigate to="/auth/connexion" replace />
                </SignedOut>
              </>
          } />

          <Route path="/user/address" element={<PublicRoute><><Navbar /><AddressSelector /></></PublicRoute>} />
          <Route path="/Faq" element={<><Navbar /><FaqList /><Footer /></>} />
          <Route path="/Policy" element={<><Navbar /><PolicyPage /><Footer /></>} />
          <Route path="/privacy" element={<><Navbar /><Privacy /><Footer /></>} />
          <Route path="/mentions-legales" element={<><Navbar /><MentionsLegales /><Footer /></>} />
          <Route path="/devenir-livreur" element={<><Navbar /><DevenirLivreur /><Footer /></>} />

          {/* Supplier Routes (Redirecting to external portal) */}
          <Route path="/fournisseur/inscription" element={<SupplierRegister />} />
          <Route path="/fournisseur/dashboard" element={<ExternalRedirect url={import.meta.env.VITE_SUPPLIER_PORTAL_URL || 'https://vendeur.vtout.com'} />} />
          <Route path="/fournisseur/ajouter-produit" element={<ExternalRedirect url={import.meta.env.VITE_SUPPLIER_PORTAL_URL || 'https://vendeur.vtout.com'} />} />

          <Route path="/admin/dashboard/*" element={
              <SignedIn>
                {profileUser?.isAdmin ? <AdminLayout /> : <Navigate to="/" replace />}
              </SignedIn>
          } />

          <Route path="/admin/Dashboard/*" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/order-confirmation/:orderId" element={<><Navbar /><GuestOrderConfirmationPage /><Footer /></>} />
          <Route path="/orders" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/orders/:id" element={
              <>
                <SignedIn>
                  <OrderDetail />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/auth/connexion" replace />
                </SignedOut>
              </>
          } />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

      <CookieConsent />
    </div>

  );
};

const App = () => {
  useEffect(() => {
    AOS.init({ duration: 800, easing: 'ease-in-sine', delay: 100, offset: 100 });
    AOS.refresh();
  }, []);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        setLoading(true);
        const data = await getProducts({ limit: 20 });
        setProducts(data.products || data || []);
      } catch (error) {
        console.error('Erreur produits:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductsData();
  }, []);

  return (
    <div className="app-container">
      <ScrollToTop />
      <AppContent products={products} loading={loading} />
      <SupportChat />
    </div>
  );
};

export default App;
