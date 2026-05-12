import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, LogOut, ExternalLink } from 'lucide-react';
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
import SupplierBoutiques from './pages/SupplierBoutiques';

// Role Blocker Modal
const RoleBlockModal = ({ role }) => {
    const { signOut } = useAuth();
    
    const handleLogout = async () => {
        await signOut();
        window.location.href = '/connexion';
    };

    const handleContinueToMain = () => {
        window.location.href = import.meta.env.VITE_MAIN_SITE_URL || 'https://vtout.com';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500"></div>
                
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 text-amber-500">
                    <AlertCircle size={32} />
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 mb-2">Accès Non Autorisé</h3>
                <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
                    Vous êtes actuellement connecté avec un compte <span className="font-bold text-slate-800">{role === 'livreur' ? 'Livreur' : 'Client standard'}</span>. 
                    L'Espace Vendeur est exclusivement réservé aux marchands certifiés.
                </p>

                <div className="space-y-3">
                    <button 
                        onClick={handleContinueToMain}
                        className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                        Continuer vers Vtout <ExternalLink size={16} />
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="w-full py-4 px-6 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                        Me déconnecter <LogOut size={16} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
    const { isLoaded, isSignedIn, role } = useAuth();
    if (!isLoaded) return null;
    if (!isSignedIn) return <Navigate to="/connexion" replace />;
    
    // We no longer block 'user' or 'livreur' here.
    // If they don't have a supplier profile, SupplierDashboard will show them the SupplierWelcome onboarding screen.

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
            <Route path="/mes-boutiques" element={<ProtectedRoute><SupplierBoutiques /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
