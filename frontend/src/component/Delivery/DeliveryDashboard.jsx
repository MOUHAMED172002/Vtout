import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth, useUser } from "../../lib/clerk-shim";
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
import { initSocket, sendLocation } from "../../services/socketService";
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
    RefreshCcw,
    AlertOctagon
} from "lucide-react";
import NotificationCenter from "../Shared/NotificationCenter";
import PortalSwitcher from "../Shared/PortalSwitcher";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import ThemeSelector from "../context/ThemeSelector";
import api from "../../services/api";

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
    const [walletStats, setWalletStats] = useState({ balance: 0, transactions: [], payoutRequests: [] });
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [payoutMethod, setPayoutMethod] = useState('momo');
    const [paymentDetails, setPaymentDetails] = useState('');
    const [saveDetails, setSaveDetails] = useState(false);

    const abortControllerRef = useRef(null);
    const isFetchingRef = useRef(false);

    const communesParDept = useMemo(() => getCommunesParDepartement(), []);
    const filteredDepts = useMemo(() => {
        if (!zoneSearch.trim()) return communesParDept;
        const q = zoneSearch.toLowerCase();
        return (communesParDept || [])
            .map(d => ({
                ...d,
                communes: (d.communes || []).filter(c => c && c.toLowerCase().includes(q))
            }))
            .filter(d => d.communes && d.communes.length > 0);
    }, [communesParDept, zoneSearch]);

    const stats = [
        { label: "Livrées", value: myself?.total_deliveries || "0", icon: <CheckCircle2 className="text-emerald-500" />, trend: "+12%" },
        { label: "Note", value: myself?.rating || "5.0", icon: <Star className="text-amber-400 fill-amber-400" />, trend: "Stable" },
        { label: "En attente", value: availableOrders.length, icon: <Clock className="text-primary" />, trend: "Nouveau" },
        { label: "Solde Disponible", value: `${Number(walletStats?.balance || 0).toLocaleString()} F`, icon: <Banknote className="text-indigo-500" />, trend: "" },
    ];

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab]);

    async function loadData() {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true);
        isFetchingRef.current = true;

        try {
            const token = await getToken();

            // Fetch both to ensure tab counts are accurate
            const [availableData, myData] = await Promise.all([
                getAvailableOrders(token),
                getMyDeliveries(token)
            ]);

            if (!controller.signal.aborted) {
                setAvailableOrders(Array.isArray(availableData) ? availableData : []);
                setMyOrders(Array.isArray(myData) ? myData : []);
            }

            // Logic to fetch myself for status and zones
            try {
                const me = await getDeliveryProfile(token);
                if (me && !controller.signal.aborted) {
                    setMyself(me);
                    setIsOnline(me.status !== 'hors_ligne');
                }
            } catch (err) {
                if (err.name !== 'CanceledError' && err.message !== 'Request aborted') {
                    console.warn("Could not load delivery profile:", err.message);
                }
            }

            // Always load financials so balance shows everywhere
            if (!controller.signal.aborted) {
                const data = await fetchFinancials(token);
                if (data && !data.error && !controller.signal.aborted) {
                    setWalletStats(data);
                } else if (!controller.signal.aborted) {
                    setWalletStats({ balance: 0, transactions: [], payoutRequests: [] });
                }
            }
        } catch (err) {
            if (err.name === 'CanceledError' || err.message === 'Request aborted') {
                return;
            }
            console.error(err);
            setAvailableOrders([]);
            setMyOrders([]);
            if (err.message !== "Profil livreur non trouvé") {
                toast.error("Erreur de chargement");
            }
        } finally {
            if (abortControllerRef.current === controller) {
                setLoading(false);
                isFetchingRef.current = false;
            }
        }
    }

    const fetchFinancials = async (token) => {
        try {
            const res = await api.get('/financials/my-status');
            return res.data;
        } catch (err) {
            return { error: err.message };
        }
    };

    useEffect(() => {
        if (walletStats.savedPayoutInfo && walletStats.savedPayoutInfo.method === payoutMethod) {
            setPaymentDetails(walletStats.savedPayoutInfo.details);
            setSaveDetails(true);
        } else {
            setPaymentDetails('');
            setSaveDetails(false);
        }
    }, [payoutMethod, walletStats.savedPayoutInfo]);

    const handlePayoutRequest = async (e) => {
        e.preventDefault();
        try {
            const token = await getToken();
            const res = await api.post('/financials/request-payout', {
                amount: payoutAmount,
                payment_method: payoutMethod,
                payment_details: paymentDetails,
                save_details: saveDetails
            });
            const data = res.data;
            if (data.error) throw new Error(data.error);
            toast.success("Demande envoyée");
            setShowPayoutModal(false);
            loadData();
        } catch (err) {
            toast.error(err.message);
        }
    };
    const activeOrders = Array.isArray(myOrders) ? myOrders.filter(o => ['expediee', 'expédiée', 'confirmee', 'confirmée', 'assignee', 'assignée'].includes(o.status)) : [];
    const finishedOrders = Array.isArray(myOrders) ? myOrders.filter(o => ['livree', 'livrée', 'annulee', 'annulée'].includes(o.status)) : [];

    // Check for unremitted cash
    const unremittedCashOrders = Array.isArray(myOrders) ? myOrders.filter(o => ['livree', 'livrée'].includes(o.status) && o.payment_method === 'delivery' && o.payment_status === 'en_attente') : [];
    const unremittedCashAmount = unremittedCashOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const hasDebt = unremittedCashAmount > 0;
    const isFullyBlocked = hasDebt && activeOrders.length === 0;

    useEffect(() => {
        let interval;
        if (isOnline && activeOrders.length > 0) {
            const socket = initSocket(clerkUser?.id);

            interval = setInterval(() => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                        const { latitude, longitude } = pos.coords;
                        // For simplicity, we send for each active order
                        activeOrders.forEach(o => {
                            sendLocation({
                                driverId: myself?.id,
                                lat: latitude,
                                lng: longitude,
                                orderId: o.id
                            });
                        });
                        // Update backend too for persistence
                        getToken().then(token => {
                            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/delivery/location`, {
                                method: 'PUT',
                                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify({ lat: latitude, lng: longitude })
                            }).catch(console.error);
                        });
                    }, (err) => console.warn("GPS error:", err), { enableHighAccuracy: true });
                }
            }, 5000); // Every 5 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isOnline, activeOrders.length, myself?.id, clerkUser?.id, getToken]);

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
        let delivery_code = null;
        let proof_url = null;

        if (status === 'livrée') {
            delivery_code = window.prompt("Veuillez saisir le code confidentiel de livraison du client (4 chiffres) :");
            if (!delivery_code) return;
        }

        try {
            const token = await getToken();
            const res = await updateDeliveryStatus(token, orderId, status, delivery_code, proof_url);
            if (res.error) {
                toast.error(res.error);
                return;
            }
            toast.success("Statut mis à jour");
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.error || err.message || "Erreur de mise à jour");
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



    return (
        <div className="relative space-y-6 md:space-y-10 p-4 md:p-10 bg-[#F8FAFC] min-h-screen">
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
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.3em] mb-2">
                        <Activity size={14} /> LIVE CENTER
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Bienvenue, <span className="text-primary">{clerkUser?.firstName || "Rider"}</span></h1>
                    <p className="text-slate-500 font-bold mt-1 text-sm md:text-base">Gérez vos courses en temps réel.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-2 mr-auto lg:mr-0">
                        <ThemeSelector />
                        <PortalSwitcher />
                        <NotificationCenter />
                    </div>
                    <div className="flex items-center gap-4 bg-white p-1.5 md:p-2 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm w-full sm:w-auto">
                        <button
                            onClick={handleToggleOnline}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${isOnline ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-400'}`}
                        >
                            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-slate-300'}`}></div>
                            {isOnline ? "Disponible" : "Hors Ligne"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map((s, idx) => (
                    <div key={idx} className="bg-white p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col md:flex-row items-start md:items-center justify-between group hover:border-primary/30 transition-all gap-4">
                        <div className="space-y-1 md:space-y-2">
                            <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                            <p className="text-xl md:text-3xl font-black text-slate-900">{s.value}</p>
                        </div>
                        <div className="w-10 h-10 md:w-16 md:h-16 bg-slate-50 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-2xl group-hover:scale-110 transition-transform self-end md:self-auto">
                            {s.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs Layout */}
            <div className="bg-white rounded-3xl md:rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/10 overflow-hidden">
                <div className="flex border-b border-slate-50 p-2 md:p-4 gap-2 md:gap-4 overflow-x-auto custom-scrollbar no-scrollbar">
                    <button
                        onClick={() => {
                            setTab("available");
                            if (tab === 'available') loadData();
                        }}
                        className={`flex-none min-w-[120px] md:flex-1 py-3 md:py-4 px-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${tab === 'available' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        Disponibles ({availableOrders.length})
                    </button>
                    <button
                        onClick={() => {
                            setTab("active");
                            if (tab === 'active') loadData();
                        }}
                        className={`flex-none min-w-[120px] md:flex-1 py-3 md:py-4 px-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${tab === 'active' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        En cours ({activeOrders.length})
                    </button>
                    <button
                        onClick={() => {
                            setTab("history");
                            if (tab === 'history') loadData();
                        }}
                        className={`flex-none min-w-[100px] md:flex-1 py-3 md:py-4 px-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${tab === 'history' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        Historique
                    </button>
                    <button
                        onClick={() => {
                            setTab("profile");
                            if (tab === 'profile') loadData();
                        }}
                        className={`flex-none min-w-[120px] md:flex-1 py-3 md:py-4 px-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${tab === 'profile' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        ZONES & INFOS
                    </button>
                    <button
                        onClick={() => {
                            setTab("wallet");
                            if (tab === 'wallet') loadData();
                        }}
                        className={`flex-none min-w-[120px] md:flex-1 py-3 md:py-4 px-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${tab === 'wallet' ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        PORTEFEUILLE
                    </button>
                </div>

                {/* Manual Refresh & Tab Re-fetch logic */}
                <div className="px-8 py-2 flex justify-end">
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all disabled:opacity-50"
                    >
                        <RefreshCcw size={12} className={loading ? "animate-spin" : ""} />
                        {loading ? "Mise à jour..." : "Actualiser"}
                    </button>
                </div>

                <div className="p-4 md:p-8">
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
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Package size={40} className="text-slate-200" />
                                            </div>
                                            <p className="text-slate-500 font-bold text-lg">Aucune commande disponible.</p>
                                            <p className="text-sm text-slate-400 max-w-xs mx-auto">
                                                Vérifiez l'onglet <span className="font-black text-slate-600">"En cours"</span> pour voir les courses qui vous ont déjà été assignées.
                                            </p>
                                        </div>
                                    ) : (
                                        availableOrders.map(order => (
                                            <div key={order.id} className="bg-slate-50 rounded-3xl p-6 md:p-8 border border-slate-100 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 md:gap-8 group hover:bg-white hover:shadow-xl transition-all duration-500">
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
                                                        <div className="flex flex-wrap gap-2 mt-4 mb-4">
                                                            {order.items?.map(item => (
                                                                <div key={item.id} className="flex items-center gap-3 text-xs font-bold text-slate-600 bg-white/60 px-3 py-2 rounded-2xl border border-slate-100/50 shadow-sm">
                                                                    <div className="w-8 h-8 rounded-lg bg-white overflow-hidden border border-slate-100 shrink-0">
                                                                        {item.product?.images?.[0]?.image_url ? (
                                                                            <img src={item.product.images[0].image_url} alt="" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><Package size={14} /></div>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-primary font-black">x{item.quantity}</span>
                                                                    <span className="truncate max-w-[120px]">{item.product?.name}</span>
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
                                        <div className="py-20 text-center space-y-4 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                                <Truck size={40} className="text-slate-200" />
                                            </div>
                                            <p className="text-slate-500 font-bold text-lg">Aucune course en cours.</p>
                                            <p className="text-sm text-slate-400 max-w-xs mx-auto">
                                                Allez dans l'onglet <span className="font-black text-slate-600">"Disponibles"</span> pour accepter une nouvelle livraison.
                                            </p>
                                        </div>
                                    ) : (
                                        activeOrders.map(order => (
                                            <div key={order.id} className="bg-white rounded-3xl p-6 md:p-8 border-2 border-primary/20 shadow-xl shadow-primary/5 space-y-6 md:space-y-8">
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
                                                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-xs text-primary shadow-sm border border-slate-100 overflow-hidden shrink-0">
                                                                            {item.product?.images?.[0]?.image_url ? (
                                                                                <img src={item.product.images[0].image_url} alt="" className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <span className="text-primary">{item.quantity}</span>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-xs font-black text-primary">x{item.quantity}</span>
                                                                                <p className="text-xs font-black text-slate-700">{item.product?.name}</p>
                                                                            </div>
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

                                                        {/* Client Info */}
                                                        <div className="bg-white rounded-2xl p-5 border-2 border-slate-100 space-y-2 mt-4 shadow-sm">
                                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                                                                <User size={12} /> Client (Destination)
                                                            </p>
                                                            <p className="text-sm font-black text-slate-900">{order.user?.fullname || order.guest_name || "Client"}</p>
                                                            <p className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                                                <MapPin size={12} /> {order.address?.address_line}, {order.address?.city}
                                                            </p>
                                                            <a href={`tel:${order.user?.phone || order.guest_phone || order.address?.phone}`} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase mt-2 hover:bg-primary transition-colors">
                                                                📞 Appeler le client
                                                            </a>
                                                        </div>

                                                        {/* Supplier Info */}
                                                        {['confirmée', 'assignée'].includes(order.status) && (
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
                                                    {['confirmée', 'assignée'].includes(order.status) ? (
                                                        <div className="grid grid-cols-[1fr_auto] gap-2">
                                                            <button
                                                                onClick={() => handleStatusUpdate(order.id, 'expédiée')}
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
                                                            onClick={() => handleStatusUpdate(order.id, 'livrée')}
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
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${['livree', 'livrée'].includes(order.status) ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                                        {['livree', 'livrée'].includes(order.status) ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">Commande #{order.id.slice(0, 8)}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(order.delivered_at || order.updated_at || order.createdAt || order.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <p className="font-black text-slate-900">{Number(order.total_amount).toLocaleString()} F</p>
                                            </div>
                                        ))
                                    )
                                )}

                                {tab === 'profile' && myself && (
                                    <div className="p-4 md:p-10 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

                                {tab === 'wallet' && (
                                    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="bg-slate-900 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 text-white relative overflow-hidden">
                                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Solde Disponible</p>
                                                    <h2 className="text-5xl font-black">{Number(walletStats?.balance || 0).toLocaleString()} <span className="text-xl text-primary">F</span></h2>
                                                </div>
                                                <button
                                                    onClick={() => setShowPayoutModal(true)}
                                                    className="bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase text-xs shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                                                >
                                                    Retirer mes gains
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                                            <div className="space-y-4 md:space-y-6">
                                                <h3 className="text-lg font-black text-slate-900">Demandes de retrait</h3>
                                                <div className="space-y-4">
                                                    {(walletStats?.payoutRequests || []).map(p => (
                                                        <div key={p.id} className="bg-slate-50 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 flex justify-between items-center">
                                                            <div>
                                                                <p className="font-black text-slate-900">{Number(p.amount).toLocaleString()} F</p>
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(p.createdAt || p.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                            <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase ${p.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                                {p.status}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-4 md:space-y-6">
                                                <h3 className="text-lg font-black text-slate-900">Dernières transactions</h3>
                                                <div className="space-y-4">
                                                    {(walletStats?.transactions || []).map(t => (
                                                        <div key={t.id} className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 flex justify-between items-center hover:shadow-lg transition-shadow">
                                                            <div className="flex items-center gap-3 md:gap-4">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'earning' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                                                    <Banknote size={18} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-black text-slate-800">{t.description}</p>
                                                                    <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(t.createdAt || t.created_at).toLocaleDateString()}</p>
                                                                </div>
                                                            </div>
                                                            <p className={`font-black ${t.type === 'earning' ? 'text-emerald-500' : 'text-slate-900'}`}>
                                                                {t.type === 'earning' ? '+' : '-'} {Number(t.amount).toLocaleString()} F
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            {/* Payout Modal */}
            <AnimatePresence>
                {showPayoutModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setShowPayoutModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-lg rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative z-10 space-y-6 md:space-y-8"
                        >
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Retrait d'argent</h3>
                                <p className="text-sm font-bold text-slate-400">Demandez le virement de vos gains.</p>
                            </div>

                            <form onSubmit={handlePayoutRequest} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Montant à retirer (FCFA)</label>
                                    <input
                                        type="number"
                                        required
                                        value={payoutAmount}
                                        onChange={e => setPayoutAmount(e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-2xl px-8 py-5 text-2xl font-black text-slate-900 outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                        placeholder="Ex: 5000"
                                    />
                                    <p className="text-[10px] text-right font-bold text-slate-400">Solde max: {Number(walletStats?.balance || 0).toLocaleString()} F</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button type="button" onClick={() => setPayoutMethod('momo')} className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${payoutMethod === 'momo' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                                        <Truck size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Mobile Money</span>
                                    </button>
                                    <button type="button" onClick={() => setPayoutMethod('bank')} className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${payoutMethod === 'bank' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}>
                                        <Banknote size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Banque</span>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
                                        {payoutMethod === 'momo' ? 'Numéro de téléphone MoMo & Nom' : 'Informations Bancaires (RIB, Nom de la banque)'}
                                    </label>
                                    <textarea
                                        required
                                        value={paymentDetails}
                                        onChange={e => setPaymentDetails(e.target.value)}
                                        rows="2"
                                        className="w-full bg-slate-50 border-none rounded-2xl px-8 py-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none"
                                        placeholder={payoutMethod === 'momo' ? "Ex: 67000000 - Jean Dupont" : "Ex: Société Générale, RIB: 00001..."}
                                    />
                                    <div className="flex items-center gap-2 ml-4 mt-2">
                                        <input
                                            type="checkbox"
                                            id="save_details_rider"
                                            checked={saveDetails}
                                            onChange={e => setSaveDetails(e.target.checked)}
                                            className="checkbox checkbox-xs checkbox-primary"
                                        />
                                        <label htmlFor="save_details_rider" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer select-none">Enregistrer ces informations</label>
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-6 bg-primary text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-3">
                                    Confirmer la demande <ChevronRight size={18} />
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Debug Info (Support) */}
            <div className="fixed bottom-4 left-4 z-[100] bg-slate-900/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Raw: {myOrders.length} | Active: {activeOrders.length} | Tab: {tab} | DP: {myself?.id || 'None'}
                </p>
            </div>
        </div>
    );
}
