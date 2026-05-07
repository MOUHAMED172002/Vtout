import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, useAuth } from './lib/clerk-shim';
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

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />

          {/* Public Routes restricted for Livreur */}
          <Route path="/categories" element={<PublicRoute><PageWrapper><><Navbar /><Category2 /><Footer /></></PageWrapper></PublicRoute>} />
          <Route path="/products" element={<PublicRoute><PageWrapper><><Navbar /><ProductGrid /><Footer /></></PageWrapper></PublicRoute>} />
          <Route path="/products/:id" element={<PublicRoute><PageWrapper><><Navbar /><ProductPages /><Footer /></></PageWrapper></PublicRoute>} />
          <Route path="/products-liste" element={<PublicRoute><PageWrapper><><Navbar /><ProductsList /><Footer /></></PageWrapper></PublicRoute>} />
          <Route path="/about" element={<PublicRoute><PageWrapper><><Navbar /><About /><Footer /></></PageWrapper></PublicRoute>} />
          <Route path="/cartpage" element={<PublicRoute><PageWrapper><><Navbar /><CartPage /><Footer /></></PageWrapper></PublicRoute>} />
          <Route path="/checkout" element={<PublicRoute><PageWrapper><><Navbar /><CheckoutPage /><Footer /></></PageWrapper></PublicRoute>} />
          <Route path="/temoignages" element={<PageWrapper><><Navbar /><PlatformReviews /><Footer /></></PageWrapper>} />

          {/* Auth Routes */}
          <Route path="/auth/inscription/*" element={<PageWrapper><><Navbar /><Register /><Footer /></></PageWrapper>} />
          <Route path="/auth/connexion/*" element={<PageWrapper><><Navbar /><Login /><Footer /></></PageWrapper>} />
          <Route path="/reset-password" element={<PageWrapper><><Navbar /><ResetPassword /><Footer /></></PageWrapper>} />
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          <Route path="/blog/:slug" element={<PageWrapper><BlogDetail /></PageWrapper>} />
          <Route path="/mag" element={<PageWrapper><MagPage /></PageWrapper>} />

          {/* User Dashboard - Restricted for Livreur */}
          <Route path="/user/dashboard/*" element={
            <PublicRoute>
              <PageWrapper>
                <SignedIn>
                  <DashboardRoutes />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/auth/connexion" replace />
                </SignedOut>
              </PageWrapper>
            </PublicRoute>
          } />

          {/* Delivery Rider Dashboard */}
          <Route path="/delivery-rider/*" element={
            <PageWrapper>
              <SignedIn>
                {profileUser?.role === 'livreur' || profileUser?.role === 'admin' ? (
                  <DeliveryRoutes />
                ) : (
                  <Navigate to="/" replace />
                )}
              </SignedIn>
              <SignedOut>
                <Navigate to="/auth/connexion" replace />
              </SignedOut>
            </PageWrapper>
          } />

          <Route path="/user/address" element={<PublicRoute><PageWrapper><><Navbar /><AddressSelector /></></PageWrapper></PublicRoute>} />
          <Route path="/Faq" element={<PageWrapper><><Navbar /><FaqList /><Footer /></></PageWrapper>} />
          <Route path="/Policy" element={<PageWrapper><><Navbar /><PolicyPage /><Footer /></></PageWrapper>} />
          <Route path="/privacy" element={<PageWrapper><><Navbar /><Privacy /><Footer /></></PageWrapper>} />
          <Route path="/devenir-livreur" element={<PageWrapper><><Navbar /><DevenirLivreur /><Footer /></></PageWrapper>} />

          {/* Supplier Routes (Redirecting to external portal) */}
          <Route path="/fournisseur/inscription" element={<PageWrapper><SupplierRegister /></PageWrapper>} />
          <Route path="/fournisseur/dashboard" element={<ExternalRedirect url={import.meta.env.VITE_SUPPLIER_PORTAL_URL || 'https://vendeur.vtout.com'} />} />
          <Route path="/fournisseur/ajouter-produit" element={<ExternalRedirect url={import.meta.env.VITE_SUPPLIER_PORTAL_URL || 'https://vendeur.vtout.com'} />} />

          <Route path="/admin/dashboard/*" element={
            <PageWrapper>
              <SignedIn>
                {profileUser?.role === 'admin' ? <AdminLayout /> : <Navigate to="/" replace />}
              </SignedIn>
            </PageWrapper>
          } />

          <Route path="/admin/Dashboard/*" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/order-confirmation/:orderId" element={<PageWrapper><><Navbar /><GuestOrderConfirmationPage /><Footer /></></PageWrapper>} />
          <Route path="/orders" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/orders/:id" element={
            <PageWrapper>
              <SignedIn>
                <OrderDetail />
              </SignedIn>
              <SignedOut>
                <Navigate to="/auth/connexion" replace />
              </SignedOut>
            </PageWrapper>
          } />

          {/* Catch-all 404 */}
          <Route path="*" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
        </Routes>
      </AnimatePresence>

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
        setProducts(data);
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
