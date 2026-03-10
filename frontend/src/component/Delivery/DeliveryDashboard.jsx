import React, { useState, useEffect, useMemo } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
    getAvailableOrders,
    getMyDeliveries,
    getDeliveryProfile,
    assignOrder,
    releaseOrder,
    updateDeliveryStatus,
    toggleDeliveryStatus,
    updateServiceZones
} from "../../services/deliveryService";
import { getCommunesParDepartement } from "../../utils/communes";
import { Search } from "lucide-react";
import DeliveryMapLink from "../Shared/DeliveryMapLink";
import {
    Package,
    MapPin,
    Navigation,
    CheckCircle2,
    Clock,
    ChevronRight,
    TrendingUp,
    Star,
    Activity,
    User,
    Truck,
    X,
    Banknote,
    AlertOctagon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function DeliveryDashboard() {
    const { getToken } = useAuth();
    const { user: clerkUser } = useUser();
    const [availableOrders, setAvailableOrders] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("available"); // available, active, history, profile
    const [isOnline, setIsOnline] = useState(true);
    const [myself, setMyself] = useState(null);
    const [zoneSearch, setZoneSearch] = useState("");

    const communesParDept = useMemo(() => getCommunesParDepartement(), []);
    const filteredDepts = useMemo(() => {
        if (!zoneSearch.trim()) return communesParDept;
        const q = zoneSearch.toLowerCase();
        return communesParDept
            .map(d => ({
                ...d,
                communes: d.communes.filter(c => c.toLowerCase().includes(q))
            }))
            .filter(d => d.communes.length > 0);
    }, [communesParDept, zoneSearch]);

    const stats = [
        { label: "Livrées", value: myself?.total_deliveries || "0", icon: <CheckCircle2 className="text-emerald-500" />, trend: "+12%" },
        { label: "Note", value: myself?.rating || "5.0", icon: <Star className="text-amber-400 fill-amber-400" />, trend: "Stable" },
        { label: "En attente", value: availableOrders.length, icon: <Clock className="text-primary" />, trend: "Nouveau" },
    ];

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab]);

    async function loadData() {
        setLoading(true);
        try {
            const token = await getToken();

            if (tab === "available") {
                const data = await getAvailableOrders(token);
                setAvailableOrders(Array.isArray(data) ? data : []);
            } else if (tab === "active" || tab === "history") {
                const data = await getMyDeliveries(token);
                setMyOrders(Array.isArray(data) ? data : []);
            }
            // Logic to fetch myself for status and zones
            try {
                const me = await getDeliveryProfile(token);
                if (me) {
                    setMyself(me);
                    setIsOnline(me.status !== 'hors_ligne');
                }
            } catch (err) {
                console.warn("Could not load delivery profile:", err.message);
                // Non-bloquant si l'admin regarde
            }

        } catch (err) {
            console.error(err);
            setAvailableOrders([]);
            setMyOrders([]);
            if (err.message !== "Profil livreur non trouvé") {
                toast.error("Erreur de chargement");
            }
        } finally {
            setLoading(false);
        }
    }

    const handleToggleOnline = async () => {
        try {
            const token = await getToken();
            const newStatus = isOnline ? 'hors_ligne' : 'disponible';
            await toggleDeliveryStatus(token, newStatus);
            setIsOnline(!isOnline);
            toast.success(isOnline ? "Vous êtes hors ligne" : "Vous êtes en ligne !");
        } catch (err) {
            toast.error("Erreur de changement de statut");
        }
    };

    const handleUpdateZones = async (zones) => {
        try {
            const token = await getToken();
            await updateServiceZones(token, zones);
            toast.success("Zones mises à jour");
            setMyself({ ...myself, service_zones: zones });
        } catch (err) {
            toast.error("Erreur de mise à jour");
        }
    };

    const handleAssign = async (orderId) => {
        try {
            const token = await getToken();
            await assignOrder(token, orderId);
            toast.success("Commande assignée !");
            loadData();
        } catch (err) {
            toast.error("Erreur l'assignation");
        }
    };

    const handleStatusUpdate = async (orderId, status) => {
        try {
            const token = await getToken();
            await updateDeliveryStatus(token, orderId, status);
            toast.success("Statut mis à jour");
            loadData();
        } catch (err) {
            toast.error("Erreur de mise à jour");
        }
    };

    const handleRelease = async (orderId) => {
        if (!confirm("Voulez-vous vraiment désassigner cette course ?")) return;
        try {
            const token = await getToken();
            await releaseOrder(token, orderId);
            toast.success("Course abandonnée");
            loadData();
        } catch (err) {
            toast.error(err.message || "Erreur lors de la désassignation");
        }
    };

    const activeOrders = Array.isArray(myOrders) ? myOrders.filter(o => o.status === 'expediee' || o.status === 'confirmee') : [];
    const finishedOrders = Array.isArray(myOrders) ? myOrders.filter(o => o.status === 'livree' || o.status === 'annulee') : [];

    // Check for unremitted cash
    const unremittedCashOrders = Array.isArray(myOrders) ? myOrders.filter(o => o.status === 'livree' && o.payment_method === 'delivery' && o.payment_status === 'en_attente') : [];
    const unremittedCashAmount = unremittedCashOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const hasDebt = unremittedCashAmount > 0;
    const isFullyBlocked = hasDebt && activeOrders.length === 0;

    return (
        <div className="relative space-y-10 lg:p-10 bg-[#F8FAFC] min-h-screen">
            <AnimatePresence>
                {isFullyBlocked && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white max-w-md w-full rounded-[3rem] p-10 shadow-2xl space-y-8 border border-rose-100"
                        >
                            <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                <AlertOctagon size={48} />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Compte Suspendu</h2>
                                <p className="text-slate-500 font-bold leading-relaxed">
                                    Votre accès aux nouvelles courses est bloqué car vous avez un montant total de
                                    <span className="text-rose-500 font-black px-2">{unremittedCashAmount.toLocaleString()} F</span>
                                    en espèces non remis à l'administration.
                                </p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Action requise</p>
                                <p className="text-sm font-bold text-slate-700">Rendez-vous au point de collecte principal pour solder votre caisse avec l'administrateur.</p>
                            </div>
                            <button
                                onClick={() => loadData()}
                                className="w-full btn btn-ghost text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
                            >
                                J'ai déjà payé (Actualiser)
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Debt Banner (Global) */}
            {hasDebt && !isFullyBlocked && (
                <div className="bg-rose-500 text-white px-6 py-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-rose-200 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-3 bg-white/20 rounded-2xl">
                            <Banknote size={24} />
                        </div>
                        <div>
                            <p className="font-black text-sm">Caisse non versée : {unremittedCashAmount.toLocaleString()} F</p>
                            <p className="text-[10px] uppercase font-black tracking-widest opacity-80">Veuillez solder votre compte pour éviter la suspension</p>
                        </div>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20">
                        Attention : Suspension imminente
                    </div>
                </div>
            )}

            {/* Header Statique Livreur */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.3em] mb-2">
                        <Activity size={14} /> LIVE CENTER
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Bienvenue, <span className="text-primary">{clerkUser?.firstName || "Rider"}</span></h1>
                    <p className="text-slate-500 font-bold mt-1">Gérez vos courses en temps réel.</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2 rounded-3xl border border-slate-100 shadow-sm">
                    <button
                        onClick={handleToggleOnline}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isOnline ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-400'}`}
                    >
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-slate-300'}`}></div>
                        {isOnline ? "Disponible" : "Hors Ligne"}
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((s, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 flex items-center justify-between group hover:border-primary/30 transition-all">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                            <p className="text-3xl font-black text-slate-900">{s.value}</p>
                        </div>
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            {s.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs Layout */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/10 overflow-hidden">
                <div className="flex border-b border-slate-50 p-4 gap-4">
                    <button
                        onClick={() => setTab("available")}
                        className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${tab === 'available' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        Disponibles ({availableOrders.length})
                    </button>
                    <button
                        onClick={() => setTab("active")}
                        className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${tab === 'active' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        En cours ({activeOrders.length})
                    </button>
                    <button
                        onClick={() => setTab("history")}
                        className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${tab === 'history' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        Historique
                    </button>
                    <button
                        onClick={() => setTab("profile")}
                        className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${tab === 'profile' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        ZONES & INFOS
                    </button>
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="py-20 flex flex-col items-center justify-center gap-6"
                            >
                                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Chargement intelligent...</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {hasDebt && tab === 'available' && (
                                    <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
                                        <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
                                            <AlertOctagon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-rose-600 text-lg mb-1">Caisse à remettre : {unremittedCashAmount.toLocaleString()} F</h3>
                                            <p className="text-sm font-bold text-rose-500/80">
                                                Vous avez des montants encaissés lors de courses précédentes qui n'ont pas encore été soldés avec l'administrateur.
                                                Veuillez vous rapprocher de l'admin pour régler ce montant avant d'accepter de nouvelles courses.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {tab === 'available' && (
                                    availableOrders.length === 0 ? (
                                        <div className="py-20 text-center space-y-4">
                                            <Package size={48} className="mx-auto text-slate-200" />
                                            <p className="text-slate-500 font-bold">Aucune commande disponible pour le moment.</p>
                                        </div>
                                    ) : (
                                        availableOrders.map(order => (
                                            <div key={order.id} className="bg-slate-50 rounded-3xl p-8 border border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-8 group hover:bg-white hover:shadow-xl transition-all duration-500">
                                                <div className="flex items-center gap-6 w-full lg:w-auto">
                                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:rotate-12 transition-transform">
                                                        <Package size={28} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">RÉF. #{order.id.slice(0, 8)}</p>
                                                        <h3 className="text-xl font-black text-slate-900">Livraison Urbaine</h3>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black border border-amber-100 flex items-center gap-2">
                                                                <Truck size={12} /> Collecte : {order.supplier?.name || "Plateforme Centrale"}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-1 mt-2 mb-3">
                                                            {order.items?.map(item => (
                                                                <div key={item.id} className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white/60 px-3 py-1.5 rounded-xl border border-slate-100/50">
                                                                    <span className="text-primary">x{item.quantity}</span>
                                                                    <span className="truncate max-w-[150px]">{item.product?.name}</span>
                                                                    {item.variant && (
                                                                        <span className="text-[10px] bg-primary/10 text-primary px-2 rounded-lg">
                                                                            {item.variant.attribute_values || item.variant.sku}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <p className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                                                            <MapPin size={14} /> {order.address?.city || "Quartier inconnu"}, {order.address?.address_line}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-8 w-full lg:w-auto justify-between border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-8">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commission Est.</p>
                                                        <p className="text-2xl font-black text-slate-900">1,500 F</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAssign(order.id)}
                                                        disabled={hasDebt}
                                                        className="btn btn-primary rounded-2xl h-14 px-8 font-black gap-3 shadow-xl shadow-primary/20 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                                                    >
                                                        Accepter <ChevronRight size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )
                                )}

                                {tab === 'active' && (
                                    activeOrders.length === 0 ? (
                                        <div className="py-20 text-center space-y-4">
                                            <Truck size={48} className="mx-auto text-slate-200" />
                                            <p className="text-slate-500 font-bold">Vous n'avez aucune course en cours.</p>
                                        </div>
                                    ) : (
                                        activeOrders.map(order => (
                                            <div key={order.id} className="bg-white rounded-3xl p-8 border-2 border-primary/20 shadow-xl shadow-primary/5 space-y-8">
                                                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-3 py-1 bg-primary text-white text-[10px] font-black rounded-lg uppercase tracking-widest">En Transit</span>
                                                            <span className="text-[10px] font-bold text-slate-400">Màj il y a 5 min</span>
                                                        </div>
                                                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Vers : {order.address?.city}</h3>
                                                        <p className="text-slate-500 font-bold flex items-center gap-2 mb-4"><MapPin size={16} /> {order.address?.address_line}</p>

                                                        {/* Pickup List */}
                                                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                                                                <Package size={12} /> Liste de colisage
                                                            </p>
                                                            {order.items?.map(item => (
                                                                <div key={item.id} className="flex items-center justify-between group">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-xs text-primary shadow-sm border border-slate-100">
                                                                            {item.quantity}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs font-black text-slate-700">{item.product?.name}</p>
                                                                            {item.variant && (
                                                                                <p className="text-[9px] font-bold text-slate-400 italic">
                                                                                    {item.variant.attribute_values || item.variant.sku}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 group-hover:border-primary transition-colors"></div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Supplier Info */}
                                                        {order.status === 'assignee' && (
                                                            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 space-y-2 mt-4">
                                                                <p className="text-[10px] font-black uppercase text-amber-600 tracking-[0.2em] flex items-center gap-2">
                                                                    <MapPin size={12} /> Point de Collecte
                                                                </p>
                                                                <p className="text-sm font-black text-slate-900">{order.supplier?.name}</p>
                                                                <p className="text-xs font-bold text-slate-500 leading-tight">
                                                                    {order.supplier?.address_line}, {order.supplier?.quartier_label}
                                                                </p>
                                                                <p className="text-xs font-black text-amber-700 pt-1 flex items-center gap-2">
                                                                    📞 {order.supplier?.phone}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {order.payment_method === 'delivery' && (
                                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl font-black text-xs uppercase tracking-widest mt-2 shadow-sm">
                                                                <Banknote size={16} /> ENCAISSER CASH : {Number(order.total_amount).toLocaleString()} F
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="bg-slate-50 p-6 rounded-2xl text-right min-w-[150px]">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valeur colis</p>
                                                        <p className="text-2xl font-black text-primary">{Number(order.total_amount).toLocaleString()} F</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    {order.status === 'confirmee' ? (
                                                        <div className="grid grid-cols-[1fr_auto] gap-2">
                                                            <button
                                                                onClick={() => handleStatusUpdate(order.id, 'expediee')}
                                                                className="w-full btn btn-primary h-16 rounded-2xl font-black gap-3 text-lg"
                                                            >
                                                                <Truck size={24} /> Récupérer le colis
                                                            </button>
                                                            <button
                                                                onClick={() => handleRelease(order.id)}
                                                                className="w-16 h-16 btn bg-rose-50 hover:bg-rose-100 text-rose-500 border-none rounded-2xl"
                                                                title="Désassigner la course"
                                                            >
                                                                <X size={24} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleStatusUpdate(order.id, 'livree')}
                                                            className="w-full btn btn-primary h-16 rounded-2xl font-black gap-3 text-lg"
                                                        >
                                                            <CheckCircle2 size={24} /> Confirmer Livraison
                                                        </button>
                                                    )}

                                                    {/* Google Maps route */}
                                                    <DeliveryMapLink
                                                        supplierLat={order.supplier?.lat}
                                                        supplierLng={order.supplier?.lng}
                                                        supplierAddress={order.supplier?.address_line || order.supplier?.commune_label}
                                                        clientLat={order.address?.lat}
                                                        clientLng={order.address?.lng}
                                                        clientAddress={order.address?.quartier_label
                                                            ? `${order.address.quartier_label}, ${order.address.commune_label}`
                                                            : order.address?.commune_label || order.address?.city}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    )
                                )}

                                {tab === 'history' && (
                                    finishedOrders.length === 0 ? (
                                        <div className="py-20 text-center space-y-4">
                                            <Package size={48} className="mx-auto text-slate-200" />
                                            <p className="text-slate-500 font-bold">Votre historique est vide.</p>
                                        </div>
                                    ) : (
                                        finishedOrders.map(order => (
                                            <div key={order.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${order.status === 'livree' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                                        {order.status === 'livree' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">Commande #{order.id.slice(0, 8)}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(order.delivered_at || order.updated_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <p className="font-black text-slate-900">{Number(order.total_amount).toLocaleString()} F</p>
                                            </div>
                                        ))
                                    )
                                )}

                                {tab === 'profile' && myself && (
                                    <div className="p-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-6">
                                                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                                    <Truck className="text-primary" /> Mon Véhicule
                                                </h3>
                                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                                                    <div className="flex justify-between items-center border-b border-white pb-4">
                                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Type</span>
                                                        <span className="font-bold text-slate-700 uppercase">{myself.vehicle_type}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center border-b border-white pb-4">
                                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Modèle</span>
                                                        <span className="font-bold text-slate-700">{myself.vehicle_model}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Immatriculation</span>
                                                        <span className="font-bold text-slate-700">{myself.license_plate}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                                    <MapPin className="text-primary" /> Zones de Service
                                                </h3>

                                                {/* Search box */}
                                                <div className="relative">
                                                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Rechercher une commune..."
                                                        value={zoneSearch}
                                                        onChange={e => setZoneSearch(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-700 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                                                    />
                                                </div>

                                                {/* Communes grouped by department */}
                                                <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                                                    {filteredDepts.map(dept => (
                                                        <div key={dept.departement}>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                                <span className="inline-block w-5 h-px bg-slate-200"></span>
                                                                {dept.departement}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {dept.communes.map(commune => {
                                                                    const selected = (myself.service_zones || []).includes(commune);
                                                                    return (
                                                                        <button
                                                                            key={commune}
                                                                            onClick={() => {
                                                                                const zones = myself.service_zones || [];
                                                                                const newZones = zones.includes(commune)
                                                                                    ? zones.filter(z => z !== commune)
                                                                                    : [...zones, commune];
                                                                                handleUpdateZones(newZones);
                                                                            }}
                                                                            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all border ${selected
                                                                                ? 'bg-primary/10 border-primary text-primary shadow-md shadow-primary/10'
                                                                                : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300'
                                                                                }`}
                                                                        >
                                                                            {commune}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {filteredDepts.length === 0 && (
                                                        <p className="text-slate-400 text-sm font-bold text-center py-4">Aucune commune trouvée.</p>
                                                    )}
                                                </div>

                                                <p className="text-[10px] text-slate-400 font-bold uppercase italic">
                                                    * Sélectionnez les communes où vous souhaitez recevoir des commandes ({(myself.service_zones || []).length} choisie(s)).
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
