import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './components/clerk-shim';

// Layout
import Layout from './components/Layout';

// Pages
import SupplierLanding from './pages/SupplierLanding';
import SupplierLogin from './pages/SupplierLogin';
import SupplierRegister from './pages/SupplierRegister';
import SupplierDashboard from './pages/SupplierDashboard';
import SupplierProducts from './pages/SupplierProducts';
import SupplierOrders from './pages/SupplierOrders';
import AddProductSupplier from './pages/AddProductSupplier';
import EditProductSupplier from './pages/EditProductSupplier';
import SupplierWallet from './pages/SupplierWallet';
import SupplierStats from './pages/SupplierStats';
import SupplierPolicies from './pages/SupplierPolicies';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
    const { isLoaded, isSignedIn } = useAuth();
    if (!isLoaded) return null;
    if (!isSignedIn) return <Navigate to="/connexion" replace />;
    return <Layout>{children}</Layout>;
};

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<SupplierLanding />} />
            <Route path="/connexion" element={<SupplierLogin />} />
            <Route path="/inscription" element={<SupplierRegister />} />

            {/* Protected Routes (inside Layout) */}
            <Route path="/dashboard" element={<ProtectedRoute><SupplierDashboard /></ProtectedRoute>} />
            <Route path="/mes-produits" element={<ProtectedRoute><SupplierProducts /></ProtectedRoute>} />
            <Route path="/mes-commandes" element={<ProtectedRoute><SupplierOrders /></ProtectedRoute>} />
            <Route path="/ajouter-produit" element={<ProtectedRoute><AddProductSupplier /></ProtectedRoute>} />
            <Route path="/edit-product/:id" element={<ProtectedRoute><EditProductSupplier /></ProtectedRoute>} />
            <Route path="/portefeuille" element={<ProtectedRoute><SupplierWallet /></ProtectedRoute>} />
            <Route path="/statistiques" element={<ProtectedRoute><SupplierStats /></ProtectedRoute>} />
            <Route path="/conditions" element={<ProtectedRoute><SupplierPolicies /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
