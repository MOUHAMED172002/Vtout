import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Package, Plus, Clock, CheckCircle, XCircle, ChevronRight, BarChart3, Store, MapPin, Loader2, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import { getProducts } from '../../services/productService';
import { getMySupplierOrders } from '../../services/orderService';
import { getMySupplierProfile, updateMySupplierProfile } from '../../services/supplierService';
import UnifiedLocationPicker from '../Shared/UnifiedLocationPicker';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SupplierDashboard = () => {
    const { user, getToken } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [updatingLocation, setUpdatingLocation] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = await getToken();
                
                // Fetch profile
                const prof = await getMySupplierProfile(token);
                setProfile(prof);

                const prods = await getProducts();
                setProducts(prods.slice(0, 5));

                if (token) {
                    const ords = await getMySupplierOrders(token);
                    setOrders(ords || []);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [getToken]);

    const handleLocationUpdate = async (loc) => {
        setUpdatingLocation(true);
        try {
            const token = await getToken();
            await updateMySupplierProfile({
                lat: loc.lat,
                lng: loc.lng,
                address_line: loc.formattedAddress
            }, token);
            setProfile(prev => ({ ...prev, lat: loc.lat, lng: loc.lng, address_line: loc.formattedAddress }));
            toast.success("Emplacement de la boutique mis à jour !");
        } catch (err) {
            toast.error("Échec de la mise à jour de l'emplacement");
        } finally {
            setUpdatingLocation(false);
        }
    };

    const stats = [
        { label: 'Produits en ligne', value: products.filter(p => p.approval_status === 'approved').length, icon: <CheckCircle className="text-emerald-500" />, color: 'bg-emerald-50' },
        { label: 'En attente', value: products.filter(p => p.approval_status === '  En attente').length, icon: <Clock className="text-amber-500" />, color: 'bg-amber-50' },
        { label: 'Total Commandes', value: orders.length, icon: <BarChart3 className="text-indigo-500" />, color: 'bg-indigo-50' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 space-y-12">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Bienvenue, {user?.firstName}</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Espace Gestion Fournisseur</p>
                </div>
                <button
                    onClick={() => navigate('/fournisseur/ajouter-produit')}
                    className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-primary/20"
                >
                    <Plus size={18} /> Ajouter un Produit
                </button>
            </div>

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
                        <button className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline">Voir tout</button>
                    </div>

                    <div className="space-y-6">
                        {products.map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-colors group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <img src={product.images?.[0]?.image_url} alt="" className="object-cover w-full h-full" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{product.name}</p>
                                        <p className="text-xs font-bold text-slate-400">{product.supplier_price} FCFA (Gros)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {product.approval_status === 'approved' ? (
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-full">Approuvé</span>
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
                <div className="space-y-8">
                    {/* Location Management Section */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 p-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tighter">Votre Point de Retrait</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Utilisé par les livreurs pour vous trouver</p>
                            </div>
                        </div>

                        <UnifiedLocationPicker 
                            onLocationSelect={handleLocationUpdate}
                            initialLat={profile?.lat}
                            initialLng={profile?.lng}
                            label="EMPLACEMENT DE VOTRE BOUTIQUE"
                        />

                        {profile?.lat && (
                            <div className="p-6 bg-slate-50 rounded-3xl flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Dernière adresse enregistrée</p>
                                    <p className="text-sm font-bold text-slate-700 truncate">{profile.address_line || "Adresse non définie"}</p>
                                </div>
                                <a 
                                    href={`https://www.google.com/maps?q=${profile.lat},${profile.lng}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-12 h-12 bg-white border border-slate-200 text-slate-900 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all"
                                >
                                    <Navigation size={20} />
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900 rounded-[40px] shadow-2xl shadow-indigo-200 p-10 text-white space-y-10 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black tracking-tighter mb-8">Commandes à Préparer</h3>
                            <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
                                {orders.length === 0 ? (
                                    <>
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/20">
                                            <Package size={40} />
                                        </div>
                                        <p className="text-white/40 font-bold text-xs uppercase tracking-widest leading-loose">
                                            Aucune commande <br /> en attente de préparation
                                        </p>
                                    </>
                                ) : (
                                    <div className="space-y-4 w-full text-left">
                                        {orders.slice(0, 3).map((ord) => (
                                            <div key={ord.id} className="p-4 bg-white/10 rounded-2xl">
                                                <p className="font-bold text-sm">Commande #{ord.id.substring(0, 8)}</p>
                                                <p className="text-xs text-white/60">{new Date(ord.created_at).toLocaleDateString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    Actualiser
                                </button>
                            </div>
                        </div>
                        {/* Abstract design elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierDashboard;
