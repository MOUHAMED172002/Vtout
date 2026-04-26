import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '../components/clerk-shim';
import { Package, Plus, Clock, CheckCircle, XCircle, ChevronRight, BarChart3, Store, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMySupplierProducts, getMySupplierProfile } from '../services/supplierService';
import { getMySupplierOrders } from '../services/orderService';
import SupplierWelcome from '../components/SupplierWelcome';
import BoutiqueModal from '../components/BoutiqueModal';

const SupplierDashboard = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isNotSupplier, setIsNotSupplier] = useState(false);
    const [supplierProfile, setSupplierProfile] = useState(null);
    const [boutiques, setBoutiques] = useState([]);
    const [selectedBoutiqueId, setSelectedBoutiqueId] = useState('all');
    const [showBoutiqueModal, setShowBoutiqueModal] = useState(false);
    const [balance, setBalance] = useState(0);

    const fetchSupplierProducts = async () => {
        try {
            const token = await getToken();
            if (!token) return;

            // Check if supplier profile exists
            const profile = await getMySupplierProfile(token);
            setSupplierProfile(profile);

            if (!profile) {
                setIsNotSupplier(true);
                setLoading(false);
                return;
            }

            const [productsData, ordersData, boutiquesData, financialData] = await Promise.all([
                getMySupplierProducts(token),
                getMySupplierOrders(token),
                import('../services/supplierService').then(s => s.getMyBoutiques(token)),
                import('../services/api').then(m => m.default.get('/financials/my-status', { headers: { Authorization: `Bearer ${token}` } }))
            ]);
            setProducts(productsData || []);
            setOrders(ordersData || []);
            setBoutiques(boutiquesData || []);
            setBalance(financialData?.data?.balance || 0);
        } catch (profileError) {
            setIsNotSupplier(true);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSupplierProducts();
    }, [getToken]);

    const filteredProducts = selectedBoutiqueId === 'all' 
        ? products 
        : products.filter(p => p.boutique_id === selectedBoutiqueId);

    const filteredOrders = selectedBoutiqueId === 'all'
        ? orders
        : orders.filter(o => o.boutique_id === selectedBoutiqueId);

    const stats = [
        { label: 'Solde Portefeuille', value: `${balance.toLocaleString()} F`, icon: <Banknote className="text-primary" />, color: 'bg-indigo-50' },
        { label: 'Produits en ligne', value: filteredProducts.filter(p => p.approval_status === 'approved').length, icon: <CheckCircle className="text-emerald-500" />, color: 'bg-emerald-50' },
        { label: 'En attente', value: filteredProducts.filter(p => p.approval_status === 'En attente').length, icon: <Clock className="text-amber-500" />, color: 'bg-amber-50' },
        { label: 'Total Commandes', value: filteredOrders.length, icon: <BarChart3 className="text-indigo-500" />, color: 'bg-indigo-50' },
    ];

    if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-300 uppercase tracking-widest animate-pulse">Chargement de votre espace...</div>;

    if (isNotSupplier) return <SupplierWelcome user={user} />;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 space-y-12">
            {/* Approval Notice */}
            {supplierProfile?.status === 'en_attente' && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-amber-50 border-2 border-amber-200 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-amber-900/5"
                >
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                        <Clock size={32} />
                    </div>
                    <div className="text-center md:text-left">
                        <h4 className="text-xl font-black tracking-tighter text-slate-900">Compte en cours de vérification</h4>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest text-[10px]">L'admin valide actuellement vos informations. Les ventes sont bloquées temporairement.</p>
                    </div>
                </motion.div>
            )}

            {/* Top Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Bienvenue, {user?.firstName}</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Espace Gestion Fournisseur</p>
                </div>
                <button
                    onClick={() => navigate('/ajouter-produit')}
                    disabled={supplierProfile?.status !== 'active'}
                    className={`flex items-center gap-3 px-8 py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl ${supplierProfile?.status === 'active'
                        ? 'bg-primary text-white hover:bg-slate-900 shadow-primary/20'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed grayscale shadow-none'
                        }`}
                >
                    <Plus size={18} /> Ajouter un Produit
                </button>
            </div>

            {/* Boutique Context Switcher */}
            {boutiques.length > 0 && (
                <div className="flex items-center gap-4 bg-white p-2 rounded-full border border-slate-100 shadow-sm w-fit">
                    <button 
                        onClick={() => setSelectedBoutiqueId('all')}
                        className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedBoutiqueId === 'all' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Toutes les boutiques
                    </button>
                    {boutiques.map(b => (
                        <button 
                            key={b.id}
                            onClick={() => setSelectedBoutiqueId(b.id)}
                            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedBoutiqueId === b.id ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {b.name}
                        </button>
                    ))}
                    <button 
                        onClick={() => setShowBoutiqueModal(true)}
                        className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center border border-dashed border-slate-200"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx}
                        className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-6"
                    >
                        <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center text-2xl`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                {/* Product Status */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 p-10 space-y-8">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-8">
                        <h3 className="text-xl font-black tracking-tighter">Mes Produits Récents</h3>
                        <button 
                            onClick={() => navigate('/mes-produits')}
                            className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline"
                        >
                            Voir tout
                        </button>
                    </div>

                    <div className="space-y-6">
                        {filteredProducts.slice(0, 5).map((product) => (
                            <div 
                                key={product.id} 
                                onClick={() => navigate('/mes-produits')}
                                className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-colors group cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <img src={product.images?.[0]?.image_url} alt="" className="object-cover w-full h-full" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{product.name}</p>
                                        <div className="flex items-center gap-3">
                                            <p className="text-[10px] font-bold text-slate-400">{(parseFloat(product.price) * 0.9).toLocaleString()} F (Gain Net)</p>
                                            {product.approval_status === 'approved' && (
                                                <p className="text-[10px] font-black text-primary">Vente: {product.price} F</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {product.approval_status === 'approved' ? (
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-full">Approuvé</span>
                                    ) : product.approval_status === 'rejected' ? (
                                        <span className="px-3 py-1 bg-rose-100 text-rose-600 text-[8px] font-black uppercase tracking-widest rounded-full">Rejeté</span>
                                    ) : (
                                        <span className="px-3 py-1 bg-amber-100 text-amber-600 text-[8px] font-black uppercase tracking-widest rounded-full">En attente</span>
                                    )}
                                    <ChevronRight size={16} className="text-slate-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Orders / Notifications */}
                <div className="bg-slate-900 rounded-[40px] shadow-2xl shadow-indigo-200 p-10 text-white space-y-10 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-black tracking-tighter mb-8">Commandes à Préparer</h3>
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
                             {filteredOrders.length === 0 ? (
                                <>
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/20">
                                        <Package size={40} />
                                    </div>
                                    <p className="text-white/40 font-bold text-xs uppercase tracking-widest leading-loose">
                                        Aucune commande <br /> dans cette boutique
                                    </p>
                                </>
                            ) : (
                                <div className="space-y-4 w-full text-left">
                                    {filteredOrders.slice(0, 3).map((ord) => (
                                        <div key={ord.id} onClick={() => navigate('/mes-commandes')} className="p-4 bg-white/10 hover:bg-white/20 transition-colors cursor-pointer rounded-2xl flex justify-between items-center group">
                                            <div>
                                                <p className="font-bold text-sm flex items-center gap-2">
                                                    Commande #{ord.id.substring(0, 8)} 
                                                    {['en_attente', 'confirmée', 'confirmee'].includes(ord.status) && <span className="bg-amber-500/20 text-amber-300 text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest">Nouv.</span>}
                                                </p>
                                                <p className="text-xs text-white/50 mt-1">{new Date(ord.created_at || ord.createdAt).toLocaleDateString()} • {ord.items_count} article(s)</p>
                                            </div>
                                            <ChevronRight size={16} className="text-white/30 group-hover:text-white transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button onClick={() => navigate('/mes-commandes')} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all w-full md:w-auto">
                                Voir toutes les commandes
                            </button>
                        </div>
                    </div>
                    {/* Abstract design elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
                </div>
            </div>
            
            <BoutiqueModal 
                isOpen={showBoutiqueModal} 
                onClose={() => setShowBoutiqueModal(false)} 
                onSuccess={async () => {
                    const token = await getToken();
                    const boutiquesData = await import('../services/supplierService').then(s => s.getMyBoutiques(token));
                    setBoutiques(boutiquesData || []);
                }} 
            />
        </div>
    );
};

export default SupplierDashboard;
