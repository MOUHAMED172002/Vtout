import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Layout from './components/Layout';
import SupplierDashboard from './pages/SupplierDashboard';
import AddProductSupplier from './pages/AddProductSupplier';
import SupplierRegister from './pages/SupplierRegister';
import SupplierLanding from './pages/SupplierLanding';
import { Toaster } from 'react-hot-toast';
import ProfileSync from './components/Auth/ProfileSync';
import SupplierPolicies from './pages/SupplierPolicies';

// Pages protégées qui utilisent le Layout avec Sidebar
const ProtectedLayout = ({ children }) => (
  <>
    <SignedIn>
      <Layout>{children}</Layout>
    </SignedIn>
    <SignedOut>
      <Navigate to="/inscription" replace />
    </SignedOut>
  </>
);

function App() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <ProfileSync />
      <Toaster position="top-right" />
      <Routes>
        {/* Route par défaut */}
        <Route path="/" element={
          <>
            <SignedIn>
              <Navigate to="/dashboard" replace />
            </SignedIn>
            <SignedOut>
              <SupplierLanding />
            </SignedOut>
          </>
        } />

        {/* Inscription publique */}
        <Route path="/inscription" element={<SupplierRegister />} />

        {/* Dashboard protégé */}
        <Route path="/dashboard" element={
          <ProtectedLayout>
            <SupplierDashboard />
          </ProtectedLayout>
        } />

        {/* Ajouter un produit — protégé */}
        <Route path="/ajouter-produit" element={
          <ProtectedLayout>
            <AddProductSupplier />
          </ProtectedLayout>
        } />

        {/* Conditions — protégé */}
        <Route path="/conditions" element={
          <ProtectedLayout>
            <SupplierPolicies />
          </ProtectedLayout>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;
