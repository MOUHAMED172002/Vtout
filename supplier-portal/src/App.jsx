import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import SupplierDashboard from './pages/SupplierDashboard';
import AddProductSupplier from './pages/AddProductSupplier';
import EditProductSupplier from './pages/EditProductSupplier';
import SupplierRegister from './pages/SupplierRegister';
import SupplierLogin from './pages/SupplierLogin';
import SupplierLanding from './pages/SupplierLanding';
import { Toaster } from 'react-hot-toast';
import ProfileSync from './components/Auth/ProfileSync';
import SupplierPolicies from './pages/SupplierPolicies';
import SupplierWallet from './pages/SupplierWallet';
import SupplierStats from './pages/SupplierStats';
import SupplierProducts from './pages/SupplierProducts';
import SupplierOrders from './pages/SupplierOrders';
import { useAuth, useUser } from './components/clerk-shim';
import { Loader2 } from 'lucide-react';
import UserBlockModal from './components/Shared/UserBlockModal';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Guard : protège toutes les routes du dashboard ──────────────────────────
const ProtectedLayout = ({ children }) => {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const [showBlockModal, setShowBlockModal] = useState(false);
  const navigate = useNavigate();

  const role = clerkUser?.publicMetadata?.role;

  useEffect(() => {
    // Bloquer tout rôle qui n'est pas strictement 'fournisseur'
    if (isLoaded && isSignedIn && role && role !== 'fournisseur') {
      setShowBlockModal(true);
    }
  }, [isLoaded, isSignedIn, role]);

    const MAIN_SITE_URL = import.meta.env.VITE_MAIN_SITE_URL || 'http://localhost:5173';
    await signOut();
    setShowBlockModal(false);
    if (toRegister) {
      window.location.href = `${MAIN_SITE_URL}/auth/inscription`;
    } else {
      navigate('/connexion');
    }

  // Chargement initial
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vérification de la session...</p>
      </div>
    );
  }

  // Pas connecté → page de connexion (pas inscription)
  if (!isSignedIn) {
    return <Navigate to="/connexion" replace />;
  }

  return (
    <Layout>
      {children}
      <UserBlockModal
        isOpen={showBlockModal}
        onClose={() => handleSignOut(false)}
        onAction={() => handleSignOut(true)}
      />
    </Layout>
  );
};

import SupportChat from './components/Shared/SupportChat';

// ── App ──────────────────────────────────────────────────────────────────────
function App() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <div className="bg-slate-50 min-h-screen">
      <ProfileSync />
      <Toaster position="top-right" />
      <Routes>
        {/* Page d'accueil : si connecté → dashboard, sinon → landing */}
        <Route path="/" element={
          !isLoaded ? (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
          ) : isSignedIn ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <SupplierLanding />
          )
        } />

        {/* Inscription multi-étapes (publique) */}
        <Route path="/inscription" element={<SupplierRegister />} />

        {/* Connexion seule (publique) */}
        <Route path="/connexion" element={<SupplierLogin />} />

        {/* ── Routes protégées ── */}
        <Route path="/dashboard" element={
          <ProtectedLayout><SupplierDashboard /></ProtectedLayout>
        } />
        <Route path="/mes-produits" element={
          <ProtectedLayout><SupplierProducts /></ProtectedLayout>
        } />
        <Route path="/mes-commandes" element={
          <ProtectedLayout><SupplierOrders /></ProtectedLayout>
        } />
        <Route path="/ajouter-produit" element={
          <ProtectedLayout><AddProductSupplier /></ProtectedLayout>
        } />
        <Route path="/modifier-produit/:id" element={
          <ProtectedLayout><EditProductSupplier /></ProtectedLayout>
        } />
        <Route path="/conditions" element={
          <ProtectedLayout><SupplierPolicies /></ProtectedLayout>
        } />
        <Route path="/portefeuille" element={
          <ProtectedLayout><SupplierWallet /></ProtectedLayout>
        } />
        <Route path="/statistiques" element={
          <ProtectedLayout><SupplierStats /></ProtectedLayout>
        } />

        {/* Catch-all → connexion si pas connecté, dashboard si connecté */}
        <Route path="*" element={
          isSignedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/connexion" replace />
        } />
      </Routes>
      <SupportChat />
    </div>
  );
}

export default App;
