import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from "../../lib/AuthHooks";
import { getMySupplierProfile, updateMySupplierProfile, getMySupplierProducts } from '../../services/supplierService';
import { getMySupplierOrders } from '../../services/orderService';
import AddressSelector from '../context/AddressSelector';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { MapPin, CheckCircle, Navigation, Loader2, Package, Plus, Clock, BarChart3, ChevronRight, X, Edit2, LogOut, Bell, Search, AlertCircle, Camera, MessageSquare, ExternalLink, User, Phone, Mail, ShieldAlert } from 'lucide-react';
import PortalSwitcher from '../Shared/PortalSwitcher';
import ThemeSelector from '../context/ThemeSelector';
import NotificationCenter from '../Shared/NotificationCenter';
import { useAppConfig } from '../context/ConfigContext';
import { uploadSingleImage } from '../../services/uploadService';
import api from '../../services/api';

// ── Dispute response modal ───────────────────────────────────────────────────
function DisputeResponseModal({ dispute, getToken, onClose, onUpdated }) {
    const [response, setResponse] = useState(dispute.supplier_response || '');
    const [evidenceFile, setEvidenceFile] = useState(null);
    const [evidencePreview, setEvidencePreview] = useState(dispute.supplier_evidence_url || null);
    const [loading, setLoading] = useState(false);
    const fileRef = useRef();

    const handleFile = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setEvidenceFile(f);
        setEvidencePreview(URL.createObjectURL(f));
    };

    const handleSubmit = async () => {
        if (!response.trim()) return toast.error('Veuillez écrire une réponse');
        setLoading(true);
        try {
            const token = await getToken();
            let evidence_url = dispute.supplier_evidence_url;
            if (evidenceFile) {
                try {
                    const uploaded = await uploadSingleImage(evidenceFile, token);
                    evidence_url = typeof uploaded === 'string' ? uploaded : (uploaded?.url || uploaded?.secure_url || null);
                } catch { /* non bloquant */ }
            }
            await api.patch(`/suppliers/me/disputes/${dispute.id}/respond`,
                { supplier_response: response.trim(), supplier_evidence_url: evidence_url },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Réponse envoyée');
            onUpdated();
            onClose();
        } catch {
            toast.error('Erreur lors de l\'envoi');
        } finally {
            setLoading(false);
        }
    };

    const STATUS_LABEL = { open: 'Ouvert', under_review: 'En examen', resolved: 'Résolu', cancelled: 'Annulé' };
    const STATUS_COLOR = { open: 'bg-amber-50 text-amber-600', under_review: 'bg-blue-50 text-blue-600', resolved: 'bg-emerald-50 text-emerald-600', cancelled: 'bg-base-200 text-base-content/50' };
    const MOTIF_COLOR = { 'Colis non reçu': 'bg-amber-50 text-amber-700', 'Produit endommagé': 'bg-rose-50 text-rose-700', 'Produit différent de l\'annonce': 'bg-violet-50 text-violet-700', 'Autre': 'bg-base-200 text-base-content/70' };

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-2 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-neutral/50 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
                className="relative w-full max-w-lg bg-base-100 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-base-200">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center">
                            <ShieldAlert size={18} className="text-rose-500" />
                        </div>
                        <div>
                            <h3 className="font-black text-base-content text-sm">Litige #{dispute.id.slice(0, 8).toUpperCase()}</h3>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_COLOR[dispute.status] || 'bg-base-200 text-base-content/50'}`}>
                                {STATUS_LABEL[dispute.status] || dispute.status}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-base-200 rounded-xl">
                        <X size={16} className="text-base-content/40" />
                    </button>
                </div>

                <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
                    {/* Motif + description */}
                    <div className="space-y-2">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-base-content/40">Motif du litige</p>
                        <span className={`inline-flex px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide ${MOTIF_COLOR[dispute.motif] || 'bg-base-200 text-base-content/70'}`}>
                            {dispute.motif || dispute.reason}
                        </span>
                        {dispute.description && (
                            <p className="text-sm text-base-content/70 font-medium bg-base-200 rounded-xl p-3 mt-2">{dispute.description}</p>
                        )}
                    </div>

                    {/* Client info */}
                    {dispute.user && (
                        <div className="bg-blue-50 rounded-2xl p-4 space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Client</p>
                            <div className="space-y-1">
                                {dispute.user.fullname && (
                                    <div className="flex items-center gap-2 text-xs font-bold text-base-content/80">
                                        <User size={11} className="text-blue-400" />{dispute.user.fullname}
                                    </div>
                                )}
                                {dispute.user.phone && (
                                    <div className="flex items-center gap-2 text-xs font-bold text-base-content/80">
                                        <Phone size={11} className="text-blue-400" />{dispute.user.phone}
                                    </div>
                                )}
                                {dispute.user.email && (
                                    <div className="flex items-center gap-2 text-xs font-bold text-base-content/50">
                                        <Mail size={11} className="text-blue-400" />{dispute.user.email}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Client photo */}
                    {dispute.photo_url && (
                        <div className="space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-base-content/40">Photo envoyée par le client</p>
                            <a href={dispute.photo_url} target="_blank" rel="noreferrer" className="block rounded-2xl overflow-hidden border-2 border-rose-100 relative group">
                                <img src={dispute.photo_url} alt="preuve client" className="w-full object-cover max-h-48" />
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <ExternalLink size={20} className="text-white" />
                                </div>
                            </a>
                        </div>
                    )}

                    {/* Existing supplier response */}
                    {dispute.supplier_response && (
                        <div className="bg-amber-50 rounded-2xl p-4 space-y-1 border border-amber-100">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-500">Votre réponse précédente</p>
                            <p className="text-xs text-amber-800 font-medium">{dispute.supplier_response}</p>
                        </div>
                    )}

                    {/* Response input */}
                    {dispute.status !== 'resolved' && dispute.status !== 'cancelled' && (
                        <>
                            <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-base-content/40">
                                    {dispute.supplier_response ? 'Modifier votre réponse' : 'Votre réponse'}
                                </p>
                                <textarea
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    placeholder="Expliquez votre position sur ce litige..."
                                    rows={3}
                                    className="w-full bg-base-200 rounded-xl px-4 py-3 text-sm font-medium text-base-content/80 placeholder:text-base-content/30 focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none border-none"
                                />
                            </div>

                            {/* Evidence photo */}
                            <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-base-content/40">Photo de preuve <span className="text-base-content/30">(optionnel)</span></p>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                                {evidencePreview ? (
                                    <div className="relative rounded-xl overflow-hidden aspect-video bg-base-200">
                                        <img src={evidencePreview} alt="preuve" className="w-full h-full object-cover" />
                                        <button onClick={() => { setEvidenceFile(null); setEvidencePreview(null); }}
                                            className="absolute top-2 right-2 w-7 h-7 bg-base-100 rounded-full flex items-center justify-center shadow-md">
                                            <X size={12} className="text-base-content/70" />
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => fileRef.current?.click()}
                                        className="w-full py-3 border-2 border-dashed border-base-300 rounded-xl flex items-center justify-center gap-2 text-base-content/40 hover:border-amber-300 hover:text-amber-400 transition-all">
                                        <Camera size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Ajouter une photo</span>
                                    </button>
                                )}
                            </div>

                            <button onClick={handleSubmit} disabled={!response.trim() || loading}
                                className="w-full py-3.5 bg-neutral text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg hover:bg-amber-600 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2">
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                                {loading ? 'Envoi...' : 'Envoyer ma réponse'}
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

const SupplierDashboard = () => {
    const { user, getToken, signOut } = useAuth();
    const { getConfig } = useAppConfig();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [updatingLocation, setUpdatingLocation] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [disputes, setDisputes] = useState([]);
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBoutiqueModal, setShowBoutiqueModal] = useState(false);
    const [boutiqueData, setBoutiqueData] = useState({ name: '', whatsapp: '', momo_number: '' });
    const [localSearch, setLocalSearch] = useState('');
    const [commissionRate, setCommissionRate] = useState(0.10);

    const fetchDisputes = async () => {
        try {
            const token = await getToken();
            const res = await api.get('/suppliers/me/disputes', { headers: { Authorization: `Bearer ${token}` } });
            setDisputes(Array.isArray(res.data) ? res.data : []);
        } catch { /* silently ignore */ }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = await getToken();

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

                // Fetch real disputes
                await fetchDisputes();

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

    const activeDisputes = disputes.filter(d => !['resolved', 'cancelled'].includes(d.status));

    const stats = [
        { label: 'Produits en ligne', value: products.filter(p => p.approval_status === 'approved').length, icon: <CheckCircle className="text-emerald-500" />, color: 'bg-emerald-50' },
        { label: 'En attente', value: products.filter(p => p.approval_status === 'En attente').length, icon: <Clock className="text-amber-500" />, color: 'bg-amber-50' },
        { label: 'Total Commandes', value: orders.length, icon: <BarChart3 className="text-indigo-500" />, color: 'bg-indigo-50' },
        {
            label: 'Litiges actifs',
            value: activeDisputes.length,
            icon: <AlertCircle className={activeDisputes.length > 0 ? "text-rose-500" : "text-base-content/40"} />,
            color: activeDisputes.length > 0 ? 'bg-rose-50' : 'bg-base-200'
        },
    ];

    return (
        <div className="min-h-screen bg-base-200 p-4 md:p-12 space-y-8 md:space-y-12">
            {/* Top Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6">
                <div className="flex flex-row items-center gap-3 w-full justify-between">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-base-content mb-1">{getConfig('supplier_dashboard_welcome_title', 'Bienvenue')}, {user?.fullName || user?.firstName}</h1>
                        <p className="text-base-content/50 font-bold uppercase tracking-[0.2em] text-[10px]">{getConfig('supplier_dashboard_subtitle', 'Espace Gestion Fournisseur')}</p>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <ThemeSelector />
                        <PortalSwitcher />
                        <NotificationCenter />
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 w-full lg:w-auto">
                    <button
                        onClick={() => navigate('/fournisseur/ajouter-produit')}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 md:px-8 py-3 md:py-4 bg-primary text-white rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-neutral transition-all shadow-xl shadow-primary/20"
                    >
                        <Plus size={16} /> {getConfig('supplier_dashboard_new_product_button', 'Produit')}
                    </button>
                    <button
                        onClick={async () => {
                            if (window.confirm("Déconnexion ?")) {
                                await signOut();
                                window.location.href = "/";
                            }
                        }}
                        className="p-3 md:p-4 bg-rose-50 text-rose-600 rounded-xl md:rounded-2xl hover:bg-rose-100 transition-all border border-rose-100"
                        title="Se déconnecter"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx}
                        className="bg-base-100 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-base-200 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row md:items-center gap-3 md:gap-6"
                    >
                        <div className={`w-10 h-10 md:w-16 md:h-16 ${stat.color} rounded-xl md:rounded-2xl flex items-center justify-center`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-base-content/40 mb-0.5 md:mb-1 leading-tight">{stat.label}</p>
                            <p className="text-2xl md:text-3xl font-black text-base-content tracking-tighter">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-12">
                {/* Product Status */}
                <div className="bg-base-100 rounded-[2rem] md:rounded-[40px] border border-base-200 shadow-2xl shadow-slate-200/50 p-5 md:p-10 space-y-6 md:space-y-8">
                    <div className="flex justify-between items-center border-b border-base-200 pb-8">
                        <div>
                            <h3 className="text-xl font-black tracking-tighter">{getConfig('supplier_dashboard_products_title', 'Mes Produits')}</h3>
                            <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">{getConfig('supplier_dashboard_products_subtitle', 'Gestion du catalogue')}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 bg-base-200 px-4 py-2 rounded-xl border border-base-200 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                <Search size={14} className="text-base-content/40" />
                                <input 
                                    type="text"
                                    placeholder={getConfig('supplier_dashboard_search_placeholder', 'Rechercher...')}
                                    className="bg-transparent border-none text-xs font-bold text-base-content/70 focus:ring-0 w-24 lg:w-40"
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
                            <div key={product.id} className="flex items-center justify-between p-6 rounded-3xl bg-base-200 hover:bg-base-200 transition-colors group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-base-100 rounded-2xl overflow-hidden border border-base-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <img src={product.images?.[0]?.image_url} alt="" className="object-cover w-full h-full" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-base-content">{product.name}</p>
                                        <p className="text-xs font-bold text-base-content/40">{product.supplier_price} FCFA (Gros)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {product.approval_status === 'approved' ? (
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-full">{getConfig('supplier_dashboard_status_approved', 'Approuvé')}</span>
                                    ) : (
                                        <span className="px-3 py-1 bg-amber-100 text-amber-600 text-[8px] font-black uppercase tracking-widest rounded-full">{getConfig('supplier_dashboard_status_pending', 'En attente')}</span>
                                    )}
                                    <ChevronRight size={16} className="text-base-content/30" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Orders / Notifications */}
                <div className="space-y-6 md:space-y-8">
                    {/* Boutique Info Section */}
                    <div className="bg-base-100 rounded-[2rem] md:rounded-[40px] border border-base-200 shadow-2xl shadow-slate-200/50 p-5 md:p-10 space-y-6 md:space-y-8">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
                                    <Package size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-xl font-black tracking-tighter">{getConfig('supplier_dashboard_shop_title', 'Informations Boutique')}</h3>
                                    <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest truncate">{getConfig('supplier_dashboard_shop_subtitle', 'Nom et contacts')}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowBoutiqueModal(true)}
                                className="p-3 bg-base-200 text-base-content/40 hover:text-indigo-500 hover:bg-indigo-50 rounded-2xl transition-all"
                                title="Modifier la boutique"
                            >
                                <Edit2 size={18} />
                            </button>
                        </div>
                        {profile && (
                            <div className="space-y-4 p-8 rounded-[2.5rem] bg-base-200 border border-base-200 relative group overflow-hidden">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40 mb-1">{getConfig('supplier_dashboard_shop_name_label', 'Nom de la boutique')}</p>
                                    <p className="text-lg font-black text-base-content leading-tight">{profile.name || "Ma Boutique"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40 mb-1">{getConfig('supplier_dashboard_shop_whatsapp_label', 'Numéro WhatsApp')}</p>
                                    <p className="text-sm font-bold text-emerald-600">{profile.whatsapp || "Non renseigné"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40 mb-1">{getConfig('supplier_dashboard_shop_momo_label', 'Mobile Money')}</p>
                                    <p className="text-sm font-bold text-amber-600">{profile.momo_number || "Non renseigné"}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Location Management Section */}
                    <div className="bg-base-100 rounded-[2rem] md:rounded-[40px] border border-base-200 shadow-2xl shadow-slate-200/50 p-5 md:p-10 space-y-6 md:space-y-8">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                    <MapPin size={24} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-xl font-black tracking-tighter">{getConfig('supplier_dashboard_address_title', 'Adresse Professionnelle')}</h3>
                                    <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest truncate">{getConfig('supplier_dashboard_address_subtitle', 'Renseignement pour la logistique')}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowAddressModal(true)}
                                className="p-3 bg-base-200 text-base-content/40 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
                                title={getConfig('supplier_dashboard_address_edit_button', 'Modifier l\'adresse')}
                            >
                                <Edit2 size={18} />
                            </button>
                        </div>

                        {profile ? (
                            <div className="space-y-6">
                                <div className="p-8 rounded-[2.5rem] bg-base-200 border border-base-200 relative group overflow-hidden">
                                     <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <MapPin size={80} />
                                     </div>
                                     <div className="space-y-4 relative z-10">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40 mb-1">{getConfig('supplier_dashboard_address_locality_label', 'Localité')}</p>
                                            <p className="text-lg font-black text-base-content leading-tight">
                                                {profile.quartier_label ? `${profile.quartier_label}, ` : ''}
                                                {profile.commune_label}
                                            </p>
                                            <p className="text-[11px] font-bold text-base-content/50">{profile.departement_label}</p>
                                        </div>

                                        {profile.address_line && (
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40 mb-1">{getConfig('supplier_dashboard_address_details_label', 'Précisions')}</p>
                                                <p className="text-sm font-bold text-base-content/80">{profile.address_line}</p>
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
                                            className="flex-1 p-5 bg-base-100 border border-base-300 text-base-content rounded-2xl flex items-center justify-center gap-3 hover:bg-base-200 transition-all font-black uppercase tracking-widest text-[10px]"
                                        >
                                            <Navigation size={18} /> Ouvrir sur Maps
                                        </a>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-10 text-center space-y-4">
                                <p className="text-base-content/40 font-bold text-sm italic">{getConfig('supplier_dashboard_no_address_message', 'Aucune adresse configurée')}</p>
                                <button 
                                    onClick={() => setShowAddressModal(true)}
                                    className="px-6 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg"
                                >
                                    {getConfig('supplier_dashboard_address_configure_button', 'Configurer maintenant')}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-neutral rounded-[2rem] md:rounded-[40px] shadow-2xl shadow-indigo-200 p-5 md:p-10 text-white space-y-6 md:space-y-10 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-black tracking-tighter mb-8">{getConfig('supplier_dashboard_order_prep_title', 'Commandes à Préparer')}</h3>
                            <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
                                {orders.length === 0 ? (
                                    <>
                                        <div className="w-20 h-20 bg-base-100/5 rounded-full flex items-center justify-center text-white/20">
                                            <Package size={40} />
                                        </div>
                                        <p className="text-white/40 font-bold text-xs uppercase tracking-widest leading-loose">
                                            {getConfig('supplier_dashboard_no_orders_title', 'Aucune commande en attente de préparation')}
                                        </p>
                                    </>
                                ) : (
                                    <div className="space-y-4 w-full text-left">
                                        {orders.slice(0, 3).map((ord) => (
                                            <div key={ord.id} className="p-4 bg-base-100/10 rounded-2xl">
                                                <p className="font-bold text-sm">Commande #{ord.id.substring(0, 8)}</p>
                                                <p className="text-xs text-white/60">{new Date(ord.createdAt || ord.created_at).toLocaleDateString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button className="px-8 py-4 bg-base-100/5 hover:bg-base-200/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    {getConfig('supplier_dashboard_refresh_button', 'Actualiser')}
                                </button>
                            </div>
                        </div>
                        {/* Abstract design elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* ── Section Litiges ── */}
            <div className="bg-base-100 rounded-[2rem] md:rounded-[3rem] border border-base-200 shadow-sm overflow-hidden">
              <div className="px-5 md:px-8 py-5 md:py-6 border-b border-base-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${activeDisputes.length > 0 ? 'bg-rose-50' : 'bg-base-200'}`}>
                    <AlertCircle size={18} className={activeDisputes.length > 0 ? 'text-rose-500' : 'text-base-content/40'} />
                  </div>
                  <div>
                    <h3 className="font-black text-base-content text-sm tracking-tight">Mes Litiges</h3>
                    <p className="text-[10px] text-base-content/40 font-bold uppercase tracking-widest">
                      {disputes.length} litige{disputes.length !== 1 ? 's' : ''} · {activeDisputes.length} actif{activeDisputes.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {disputes.length === 0 ? (
                <div className="px-5 md:px-8 py-10 text-center space-y-2">
                  <div className="w-12 h-12 bg-base-200 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle size={22} className="text-base-content/30" />
                  </div>
                  <p className="text-sm font-bold text-base-content/40">Aucun litige sur vos commandes</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {disputes.map(dispute => {
                    const STATUS_LABEL = { open: 'Ouvert', under_review: 'En examen', resolved: 'Résolu', cancelled: 'Annulé' };
                    const STATUS_COLOR = { open: 'text-amber-600 bg-amber-50', under_review: 'text-blue-600 bg-blue-50', resolved: 'text-emerald-600 bg-emerald-50', cancelled: 'text-base-content/50 bg-base-200' };
                    const needsReply = !dispute.supplier_response && ['open', 'under_review'].includes(dispute.status);
                    return (
                      <button
                        key={dispute.id}
                        onClick={() => setSelectedDispute(dispute)}
                        className="w-full px-5 md:px-8 py-4 md:py-5 flex items-center justify-between gap-3 hover:bg-base-200 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 ${needsReply ? 'bg-rose-50' : 'bg-base-200'}`}>
                            <AlertCircle size={15} className={needsReply ? 'text-rose-400' : 'text-base-content/40'} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-black text-base-content text-sm truncate">#{dispute.id.slice(0, 8).toUpperCase()}</p>
                              {needsReply && (
                                <span className="shrink-0 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-rose-100 text-rose-600">
                                  Réponse requise
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-bold text-base-content/40">
                              {dispute.motif || dispute.reason} · {new Date(dispute.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${STATUS_COLOR[dispute.status] || 'text-base-content/50 bg-base-200'}`}>
                            {STATUS_LABEL[dispute.status] || dispute.status}
                          </span>
                          <ChevronRight size={14} className="text-base-content/30 group-hover:text-base-content/50 transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {activeDisputes.length > 0 && (
                <div className="px-5 md:px-8 py-4 bg-rose-50/40 border-t border-rose-100">
                  <p className="text-[10px] font-bold text-rose-500 leading-relaxed">
                    ⚠️ Répondez aux litiges ouverts pour accélérer leur résolution.
                  </p>
                </div>
              )}
            </div>

            <AnimatePresence>
                {selectedDispute && (
                    <DisputeResponseModal
                        dispute={selectedDispute}
                        getToken={getToken}
                        onClose={() => setSelectedDispute(null)}
                        onUpdated={fetchDisputes}
                    />
                )}

                {showAddressModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-neutral/60 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-base-100 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden p-10 space-y-8"
                        >
                            <div className="flex justify-between items-center border-b border-base-200 pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tighter">Modifier l'adresse</h3>
                                        <p className="text-[10px] text-base-content/40 font-bold uppercase tracking-widest">{getConfig('supplier_dashboard_address_modal_header_subtitle', 'Localité et précises pour les livreurs')}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowAddressModal(false)}
                                    className="p-3 bg-base-200 hover:bg-rose-50 hover:text-rose-500 text-base-content/40 rounded-2xl transition-all"
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
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-neutral/60 backdrop-blur-md"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-base-100 w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden p-10 space-y-8"
                        >
                            <div className="flex justify-between items-center border-b border-base-200 pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tighter">{getConfig('supplier_dashboard_boutique_modal_title', 'Boutique')}</h3>
                                        <p className="text-[10px] text-base-content/40 font-bold uppercase tracking-widest">{getConfig('supplier_dashboard_boutique_modal_subtitle', 'Mise à jour')}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowBoutiqueModal(false)}
                                    className="p-3 bg-base-200 hover:bg-rose-50 hover:text-rose-500 text-base-content/40 rounded-2xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleBoutiqueUpdate} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40 mb-2 pl-4">Nom de la boutique</label>
                                    <input
                                        type="text"
                                        required
                                        value={boutiqueData.name}
                                        onChange={(e) => setBoutiqueData({ ...boutiqueData, name: e.target.value })}
                                        className="w-full bg-base-200 border-none rounded-3xl px-6 py-4 font-black text-sm text-base-content focus:ring-2 focus:ring-primary/20"
                                        placeholder="Ma Jolie Boutique"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40 mb-2 pl-4">Numéro WhatsApp</label>
                                    <input
                                        type="text"
                                        value={boutiqueData.whatsapp}
                                        onChange={(e) => setBoutiqueData({ ...boutiqueData, whatsapp: e.target.value })}
                                        className="w-full bg-base-200 border-none rounded-3xl px-6 py-4 font-black text-sm text-base-content focus:ring-2 focus:ring-primary/20"
                                        placeholder="+229..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40 mb-2 pl-4">Numéro Mobile Money</label>
                                    <input
                                        type="text"
                                        value={boutiqueData.momo_number}
                                        onChange={(e) => setBoutiqueData({ ...boutiqueData, momo_number: e.target.value })}
                                        className="w-full bg-base-200 border-none rounded-3xl px-6 py-4 font-black text-sm text-base-content focus:ring-2 focus:ring-primary/20"
                                        placeholder="+229..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-primary text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/30 hover:bg-neutral transition-all"
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
