import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
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
import Banner from './component/Banner/Banner';
import Blogs from './component/Blogs/Blogs';
import Partners from './component/Partners/Partners';
import Footer from './component/Footer/Footer';
import ProductGrid from './component/Products/ProductGrid';
import Login from './component/Auth/Login';
import Register from './component/Auth/Register';
import ResetPassword from './component/Auth/ResetPassword';
import ProfileSync from './component/Auth/ProfileSync';
import SEO from './component/Shared/SEO';
import FlashSaleSection from './component/Home/FlashSaleSection';
import ScrollToTop from './component/Shared/ScrollToTop';
import CookieConsent from './component/Shared/CookieConsent';

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

// --- Delivery ---
import DeliveryRoutes from './component/Delivery/DeliveryRoutes';
import DevenirLivreur from './component/Delivery/DevenirLivreur';
import { useProfile } from './component/context/useProfile';
import { ConfigProvider } from './component/context/ConfigContext';

// --- Supplier ---
import SupplierRegister from './component/Supplier/SupplierRegister';
import SupplierDashboard from './component/Supplier/SupplierDashboard';
import AddProductSupplier from './component/Supplier/AddProductSupplier';

const BannerData = {
  discount: '30% OFF',
  title: 'Fine Smile',
  date: '10 Jan to 28 Jan',
  image: headphone,
  title2: 'Air Solo Bass',
  title3: 'Winter Sale',
  title4: 'Promotion exclusive sur notre gamme audio premium.',
  bgcolor: '#f42c37'
};

const BannerData2 = {
  discount: '30% OFF',
  title: 'Fine Smile',
  date: '18 Jan to 28 Jan',
  image: SmartWatch,
  title2: 'Smart Solo',
  title3: 'Winter Sale',
  title4: 'La technologie à votre poignet au meilleur prix.',
  bgcolor: '#2dcc6f'
};

const AppContent = ({ products }) => {
  const location = useLocation();
  const { user: profileUser, loading: profileLoading } = useProfile();

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

  const Home = () => {
    // Si l'utilisateur est un livreur, il n'a accès qu'à son dashboard
    if (profileUser?.role === 'livreur') {
      return <Navigate to="/delivery-rider" replace />;
    }
    return (
      <>
        <Navbar />
        <Hero />
        <Category />
        <FlashSaleSection />
        <ProductGrid products={products} showButton={true} />
        <Services />
        <Footer />
      </>
    );
  };

  const PublicRoute = ({ children }) => {
    const isLivreur = profileUser?.role === 'livreur';
    if (isLivreur && !location.pathname.startsWith('/delivery-rider')) {
      return <Navigate to="/delivery-rider" replace />;
    }
    return children;
  };

  if (profileLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:text-slate-900 duration-200 overflow-hidden">
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

          {/* Auth Routes */}
          <Route path="/auth/inscription/*" element={<PageWrapper><><Navbar /><Register /><Footer /></></PageWrapper>} />
          <Route path="/auth/connexion/*" element={<PageWrapper><><Navbar /><Login /><Footer /></></PageWrapper>} />
          <Route path="/reset-password" element={<PageWrapper><><Navbar /><ResetPassword /><Footer /></></PageWrapper>} />

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
                  <><Navbar /><DeliveryRoutes /></>
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
          <Route path="/devenir-livreur" element={<PageWrapper><><Navbar /><DevenirLivreur /><Footer /></></PageWrapper>} />

          {/* Supplier Routes */}
          <Route path="/fournisseur/inscription" element={<PageWrapper><SupplierRegister /></PageWrapper>} />
          <Route path="/fournisseur/dashboard" element={
            <PageWrapper>
              <SignedIn>
                {(profileUser?.role === 'fournisseur' || profileUser?.role === 'admin') ? (
                  <SupplierDashboard />
                ) : (
                  <Navigate to="/fournisseur/inscription" replace />
                )}
              </SignedIn>
              <SignedOut>
                <Navigate to="/fournisseur/inscription" replace />
              </SignedOut>
            </PageWrapper>
          } />
          <Route path="/fournisseur/ajouter-produit" element={
            <PageWrapper>
              <SignedIn>
                {(profileUser?.role === 'fournisseur' || profileUser?.role === 'admin') ? (
                  <AddProductSupplier />
                ) : (
                  <Navigate to="/fournisseur/inscription" replace />
                )}
              </SignedIn>
              <SignedOut>
                <Navigate to="/fournisseur/inscription" replace />
              </SignedOut>
            </PageWrapper>
          } />

          <Route path="/admin/dashboard/*" element={
            <PageWrapper>
              <SignedIn>
                {profileUser?.role === 'admin' ? <AdminLayout /> : <Navigate to="/" replace />}
              </SignedIn>
            </PageWrapper>
          } />

          <Route path="/admin/Dashboard/*" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/order-confirmation/:orderId" element={<PageWrapper><><Navbar /><GuestOrderConfirmationPage /><Footer /></></PageWrapper>} />
          <Route path="/orders/:id" element={<PageWrapper><OrderDetail /></PageWrapper>} />
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

  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        const data = await getProducts({ limit: 20 });
        setProducts(data);
      } catch (error) {
        console.error('Erreur produits:', error);
      }
    };
    fetchProductsData();
  }, []);

  return (
    <Router>
      <ConfigProvider>
        <ScrollToTop />
        <AppContent products={products} />
      </ConfigProvider>
    </Router>
  );
};

export default App;
