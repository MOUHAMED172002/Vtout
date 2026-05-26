import React, { useState, useEffect } from 'react';
import { useAuth } from "../../lib/AuthHooks";
import { getMySupplierProfile, updateMySupplierProfile, getMySupplierProducts } from '../../services/supplierService';
import { getMySupplierOrders } from '../../services/orderService';
import AddressSelector from '../context/AddressSelector';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { MapPin, CheckCircle, Navigation, Loader2, Package, Plus, Clock, BarChart3, ChevronRight, X, Edit2, LogOut, Bell, Search } from 'lucide-react';
import PortalSwitcher from '../Shared/PortalSwitcher';
import ThemeSelector from '../context/ThemeSelector';
import NotificationCenter from '../Shared/NotificationCenter';
import { useAppConfig } from '../context/ConfigContext';

const SupplierDashboard = () => {
    const { user, getToken, signOut } = useAuth();
    const { getConfig } = useAppConfig();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [updatingLocation, setUpdatingLocation] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBoutiqueModal, setShowBoutiqueModal] = useState(false);
    const [boutiqueData, setBoutiqueData] = useState({ name: '', whatsapp: '', momo_number: '' });
    const [localSearch, setLocalSearch] = useState('');
    const [commissionRate, setCommissionRate] = useState(0.10);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = await getToken();
                
                // Fetch profile
                const prof = await getMySupplierProfile(token);
                setProfile(prof);
                if (prof) {
                    setBoutiqueData({ name: prof.name || '', whatsapp: prof.whatsapp || '', momo_number: prof.momo_number || '' });
                }

                const prods = await getMySupplierProducts(token);
                setProducts(prods.slice(0, 5));

                if (token) {
                    const ords = await getMySupplierOrders(token);
                    setOrders(ords || []);
                }

                // Fetch commission rate
                try {
                    const configRes = await fetch(import.meta.env.VITE_API_URL + '/configs/public', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const configs = await configRes.json();
                    const commConfig = configs.find(c => c.key === 'commission_rate');
                    if (commConfig?.value) {
                        setCommissionRate(parseFloat(commConfig.value) / 100);
                    }
                } catch (err) { console.error("Commission rate fetch error:", err); }
            } catch (error) {
                console.error(error);
                if (error.response?.status === 404) {
                    navigate('/fournisseur/register');
                }
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
            const updateData = {
                departement_label: loc.departement_label,
                departement_id: loc.departement_id,
                commune_label: loc.commune_label,
                commune_id: loc.commune_id,
                quartier_label: loc.quartier_label,
                quartier_id: loc.quartier_id,
                address_line: loc.address_line,
                phone: loc.phone || profile.phone,
                lat: loc.lat || 0,
                lng: loc.lng || 0
            };
            
            await updateMySupplierProfile(updateData, token);
            setProfile(prev => ({ ...prev, ...updateData }));
            toast.success("Adresse de la boutique mise à jour !");
            setShowAddressModal(false);
        } catch (err) {
            console.error(err);
            toast.error("Échec de la mise à jour de l'adresse");
        } finally {
            setUpdatingLocation(false);
        }
    };

    const handleBoutiqueUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = await getToken();
            await updateMySupplierProfile(boutiqueData, token);
            setProfile(prev => ({ ...prev, ...boutiqueData }));
            toast.success("Informations de la boutique mises à jour !");
            setShowBoutiqueModal(false);
        } catch (err) {
            console.error(err);
            toast.error("Échec de la mise à jour");
        }
    };

    const stats = [
        { label: 'Produits en ligne', value: products.filter(p => p.approval_status === 'approved').length, icon: <CheckCircle className="text-emerald-500" />, color: 'bg-emerald-50' },
        { label: 'En attente', value: products.filter(p => p.approval_status === 'En attente').length, icon: <Clock className="text-amber-500" />, color: 'bg-amber-50' },
        { label: 'Total Commandes', value: orders.length, icon: <BarChart3 className="text-indigo-500" />, color: 'bg-indigo-50' },
        { 
            label: 'Gains en attente', 
            value: `${Math.round(orders.filter(o => o.status !== 'livrée' && o.status !== 'livree').reduce((sum, o) => sum + Number(o.supplier_earnings || 0), 0)).toLocaleString()} F`,
            icon: <Navigation className="text-emerald-500" />, 
            color: 'bg-emerald-50' 
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 space-y-12">
            {/* Top Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full justify-between lg:justify-start">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900 mb-2">{getConfig('supplier_dashboard_welcome_title', 'Bienvenue')}, {user?.fullName || user?.firstName}</h1>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">{getConfig('supplier_dashboard_subtitle', 'Espace Gestion Fournisseur')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeSelector />
                        <PortalSwitcher />
                        <NotificationCenter />
                    </div>
                </div>
                
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <button
                        onClick={() => navigate('/fournisseur/ajouter-produit')}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-primary/20"
                    >
                        <Plus size={18} /> {getConfig('supplier_dashboard_new_product_button', 'Produit')}
                    </button>
                    <button
                        onClick={async () => {
                            if (window.confirm("Déconnexion ?")) {
                                await signOut();
                                window.location.href = "/";
                            }
                        }}
                        className="p-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all border border-rose-100"
                        title="Se déconnecter"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
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
                        <div>
                            <h3 className="text-xl font-black tracking-tighter">{getConfig('supplier_dashboard_products_title', 'Mes Produits')}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getConfig('supplier_dashboard_products_subtitle', 'Gestion du catalogue')}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                <Search size={14} className="text-slate-400" />
                                <input 
                                    type="text"
                                    placeholder={getConfig('supplier_dashboard_search_placeholder', 'Rechercher...')}
                                    className="bg-transparent border-none text-xs font-bold text-slate-600 focus:ring-0 w-24 lg:w-40"
                                    value={localSearch}
                                    onChange={(e) => setLocalSearch(e.target.value)}
                                />
                            </div>
                            <button className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline">{getConfig('supplier_dashboard_view_all_button', 'Voir tout')}</button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {products
                            .filter(p => p.name.toLowerCase().includes(localSearch.toLowerCase()))
                            .map((product) => (
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
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-full">{getConfig('supplier_dashboard_status_approved', 'Approuvé')}</span>
                                    ) : (
                                        <span className="px-3 py-1 bg-amber-100 text-amber-600 text-[8px] font-black uppercase tracking-widest rounded-full">{getConfig('supplier_dashboard_status_pending', 'En attente')}</span>
                                    )}
                                    <ChevronRight size={16} className="text-slate-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Orders / Notifications */}
                <div className="space-y-8">
                    {/* Boutique Info Section */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 p-10 space-y-8">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
                                    <Package size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-xl font-black tracking-tighter">{getConfig('supplier_dashboard_shop_title', 'Informations Boutique')}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{getConfig('supplier_dashboard_shop_subtitle', 'Nom et contacts')}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowBoutiqueModal(true)}
                                className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-2xl transition-all"
                                title="Modifier la boutique"
                            >
                                <Edit2 size={18} />
                            </button>
                        </div>
                        {profile && (
                            <div className="space-y-4 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 relative group overflow-hidden">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{getConfig('supplier_dashboard_shop_name_label', 'Nom de la boutique')}</p>
                                    <p className="text-lg font-black text-slate-900 leading-tight">{profile.name || "Ma Boutique"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{getConfig('supplier_dashboard_shop_whatsapp_label', 'Numéro WhatsApp')}</p>
                                    <p className="text-sm font-bold text-emerald-600">{profile.whatsapp || "Non renseigné"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{getConfig('supplier_dashboard_shop_momo_label', 'Mobile Money')}</p>
                                    <p className="text-sm font-bold text-amber-600">{profile.momo_number || "Non renseigné"}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Location Management Section */}
                    <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 p-10 space-y-8">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                    <MapPin size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-xl font-black tracking-tighter">{getConfig('supplier_dashboard_address_title', 'Adresse Professionnelle')}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{getConfig('supplier_dashboard_address_subtitle', 'Renseignement pour la logistique')}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowAddressModal(true)}
                                className="p-3 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
                                title={getConfig('supplier_dashboard_address_edit_button', 'Modifier l\'adresse')}
                            >
                                <Edit2 size={18} />
                            </button>
                        </div>

                        {profile ? (
                            <div className="space-y-6">
                                <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 relative group overflow-hidden">
                                     <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <MapPin size={80} />
                                     </div>
                                     <div className="space-y-4 relative z-10">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{getConfig('supplier_dashboard_address_locality_label', 'Localité')}</p>
                                            <p className="text-lg font-black text-slate-900 leading-tight">
                                                {profile.quartier_label ? `${profile.quartier_label}, ` : ''}
                                                {profile.commune_label}
                                            </p>
                                            <p className="text-[11px] font-bold text-slate-500">{profile.departement_label}</p>
                                        </div>

                                        {profile.address_line && (
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{getConfig('supplier_dashboard_address_details_label', 'Précisions')}</p>
                                                <p className="text-sm font-bold text-slate-700">{profile.address_line}</p>
                                            </div>
                                        )}
                                     </div>
                                </div>

                                {profile.lat && profile.lng && profile.lat !== 0 && (
                                    <div className="flex items-center gap-4">
                                         <a 
                                            href={`https://www.google.com/maps?q=${profile.lat},${profile.lng}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 p-5 bg-white border border-slate-200 text-slate-900 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all font-black uppercase tracking-widest text-[10px]"
                                        >
                                            <Navigation size={18} /> Ouvrir sur Maps
                                        </a>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-10 text-center space-y-4">
                                <p className="text-slate-400 font-bold text-sm italic">{getConfig('supplier_dashboard_no_address_message', 'Aucune adresse configurée')}</p>
                                <button 
                                    onClick={() => setShowAddressModal(true)}
                                    className="px-6 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg"
                                >
                                    {getConfig('supplier_dashboard_address_configure_button', 'Configurer maintenant')}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900 rounded-[40px] shadow-2xl shadow-indigo-200 p-10 text-white space-y-10 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black tracking-tighter mb-8">{getConfig('supplier_dashboard_order_prep_title', 'Commandes à Préparer')}</h3>
                            <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
                                {orders.length === 0 ? (
                                    <>
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/20">
                                            <Package size={40} />
                                        </div>
                                        <p className="text-white/40 font-bold text-xs uppercase tracking-widest leading-loose">
                                            {getConfig('supplier_dashboard_no_orders_title', 'Aucune commande en attente de préparation')}
                                        </p>
                                    </>
                                ) : (
                                    <div className="space-y-4 w-full text-left">
                                        {orders.slice(0, 3).map((ord) => (
                                            <div key={ord.id} className="p-4 bg-white/10 rounded-2xl">
                                                <p className="font-bold text-sm">Commande #{ord.id.substring(0, 8)}</p>
                                                <p className="text-xs text-white/60">{new Date(ord.createdAt || ord.created_at).toLocaleDateString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    {getConfig('supplier_dashboard_refresh_button', 'Actualiser')}
                                </button>
                            </div>
                        </div>
                        {/* Abstract design elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {showAddressModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden p-10 space-y-8"
                        >
                            <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tighter">Modifier l'adresse</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{getConfig('supplier_dashboard_address_modal_header_subtitle', 'Localité et précises pour les livreurs')}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowAddressModal(false)}
                                    className="p-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 text-slate-400 rounded-2xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <AddressSelector 
                                initial={{
                                    departement_label: profile?.departement_label,
                                    commune_label: profile?.commune_label,
                                    quartier_label: profile?.quartier_label,
                                    address_line: profile?.address_line,
                                    phone: profile?.phone
                                }}
                                onSave={handleLocationUpdate}
                                onCancel={() => setShowAddressModal(false)}
                                requirePhone={true}
                            />
                        </motion.div>
                    </motion.div>
                )}

                {showBoutiqueModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden p-10 space-y-8"
                        >
                            <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tighter">{getConfig('supplier_dashboard_boutique_modal_title', 'Boutique')}</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{getConfig('supplier_dashboard_boutique_modal_subtitle', 'Mise à jour')}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowBoutiqueModal(false)}
                                    className="p-3 bg-slate-50 hover:bg-rose-50 hover:text-rose-500 text-slate-400 rounded-2xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleBoutiqueUpdate} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 pl-4">Nom de la boutique</label>
                                    <input
                                        type="text"
                                        required
                                        value={boutiqueData.name}
                                        onChange={(e) => setBoutiqueData({ ...boutiqueData, name: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-3xl px-6 py-4 font-black text-sm text-slate-900 focus:ring-2 focus:ring-primary/20"
                                        placeholder="Ma Jolie Boutique"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 pl-4">Numéro WhatsApp</label>
                                    <input
                                        type="text"
                                        value={boutiqueData.whatsapp}
                                        onChange={(e) => setBoutiqueData({ ...boutiqueData, whatsapp: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-3xl px-6 py-4 font-black text-sm text-slate-900 focus:ring-2 focus:ring-primary/20"
                                        placeholder="+229..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 pl-4">Numéro Mobile Money</label>
                                    <input
                                        type="text"
                                        value={boutiqueData.momo_number}
                                        onChange={(e) => setBoutiqueData({ ...boutiqueData, momo_number: e.target.value })}
                                        className="w-full bg-slate-50 border-none rounded-3xl px-6 py-4 font-black text-sm text-slate-900 focus:ring-2 focus:ring-primary/20"
                                        placeholder="+229..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-primary text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/30 hover:bg-slate-900 transition-all"
                                >
                                    {getConfig('supplier_dashboard_boutique_modal_save_button', 'Enregistrer')}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SupplierDashboard;
