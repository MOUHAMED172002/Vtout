import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth, useUser } from "../../lib/AuthHooks";
import {
    getAvailableOrders,
    getMyDeliveries,
    getDeliveryProfile,
    assignOrder,
    releaseOrder,
    updateDeliveryStatus,
    toggleDeliveryStatus,
    updateServiceZones,
    generateCashPaymentLink
} from "../../services/deliveryService";
import { getCommunesParDepartement } from "../../utils/communes";
import { initSocket, sendLocation } from "../../services/socketService";
import DeliveryMapLink from "../Shared/DeliveryMapLink";
import {
    Search,
    Package,
    MapPin,
    Navigation,
    CheckCircle2,
    Clock,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    TrendingUp,
    Star,
    Activity,
    User,
    Truck,
    X,
    Banknote,
    RefreshCcw,
    AlertOctagon,
    AlertCircle,
    Edit2,
    Phone,
    Map,
    Store,
    Check
} from "lucide-react";
import NotificationCenter from "../Shared/NotificationCenter";
import PortalSwitcher from "../Shared/PortalSwitcher";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import ThemeSelector from "../context/ThemeSelector";
import api from "../../services/api";
import TourHelpButton from "../Shared/TourHelpButton";
import TourAnchor from "../../tour/TourAnchor";
import { useTour } from "../../tour/TourContext";
import { DELIVERY_TOUR_STEPS } from "../../tour/tourSteps";

const DELIVERY_TOUR_SEEN_KEY = "vtout_tour_delivery_seen";

export default function DeliveryDashboard() {
    const { getToken } = useAuth();
    const { user: clerkUser } = useUser();
    const { start: startTour } = useTour();
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
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [vehicleData, setVehicleData] = useState({ vehicle_type: '', vehicle_model: '', license_plate: '' });
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [previewOrder, setPreviewOrder] = useState(null);
    const [generatingLinkId, setGeneratingLinkId] = useState(null);

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

    // Visite guidée : proposée une seule fois, une fois les données du premier onglet chargées.
    useEffect(() => {
        if (loading) return;
        if (localStorage.getItem(DELIVERY_TOUR_SEEN_KEY)) return;
        const t = setTimeout(() => startTour(DELIVERY_TOUR_STEPS), 600);
        localStorage.setItem(DELIVERY_TOUR_SEEN_KEY, "true");
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading]);

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
                    setVehicleData({
                        vehicle_type: me.vehicle_type || '',
                        vehicle_model: me.vehicle_model || '',
                        license_plate: me.license_plate || ''
                    });
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
            const res = await api.get('/financials/my-status', {
                headers: { Authorization: `Bearer ${token}` }
            });
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
            toast.error(err.response?.data?.error || err.message);
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
                            api.put('/delivery/location', { lat: latitude, lng: longitude }, {
                                headers: { Authorization: `Bearer ${token}` }
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

    const handleVehicleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = await getToken();
            // registerLivreur also acts as an update endpoint if the user already exists
            await api.post("/delivery/register", {
                vehicle_type: vehicleData.vehicle_type,
                vehicle_model: vehicleData.vehicle_model,
                license_plate: vehicleData.license_plate,
                service_zones: myself?.service_zones || []
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            toast.success("Informations du véhicule mises à jour");
            setMyself({ ...myself, ...vehicleData });
            setShowVehicleModal(false);
        } catch (err) {
            toast.error("Erreur de mise à jour du véhicule");
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

    const handleGenerateCashLink = async (orderId) => {
        try {
            setGeneratingLinkId(orderId);
            const token = await getToken();
            const { checkoutUrl } = await generateCashPaymentLink(orderId, token);
            window.open(checkoutUrl, '_blank');
        } catch (err) {
            toast.error(err?.response?.data?.error || "Erreur génération du lien de paiement");
        } finally {
            setGeneratingLinkId(null);
        }
    };

    return (
        <div className="relative space-y-6 md:space-y-10 p-4 md:p-10 bg-base-200 min-h-screen text-base-content">
            <AnimatePresence>
                {isFullyBlocked && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-neutral/90 backdrop-blur-xl flex items-center justify-center p-6 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-base-100 max-w-md w-full rounded-[3rem] p-10 shadow-2xl space-y-8 border border-rose-100/20"
                        >
                            <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                <AlertOctagon size={48} />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black text-base-content tracking-tighter">Compte Suspendu</h2>
                                <p className="text-base-content/50 font-bold leading-relaxed">
                                    Votre accès aux nouvelles courses est bloqué car vous avez un montant total de
                                    <span className="text-rose-500 font-black px-2">{unremittedCashAmount.toLocaleString()} F</span>
                                    en espèces non remis à l'administration.
                                </p>
                            </div>
                            <div className="p-6 bg-base-200 rounded-3xl border border-base-content/5 space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40">Action requise</p>
                                <p className="text-sm font-bold text-base-content/80">Rendez-vous au point de collecte principal pour solder votre caisse avec l'administrateur.</p>
                            </div>
                            {/* FedaPay buttons per unremitted order */}
                            <div className="space-y-3 w-full">
                                {unremittedCashOrders.map(o => {
                                    const toReverse = Math.max(0, Number(o.total_amount) - Number(o.deliverer_fee !== undefined ? o.deliverer_fee : (o.delivery_fee || 0)));
                                    return (
                                        <button
                                            key={o.id}
                                            onClick={() => handleGenerateCashLink(o.id)}
                                            disabled={generatingLinkId === o.id}
                                            className="w-full flex items-center justify-between gap-3 py-4 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-2xl font-black text-xs transition-all shadow-lg shadow-indigo-500/20"
                                        >
                                            <span>Reverser #{o.id.slice(0, 8).toUpperCase()}</span>
                                            <span className="bg-white/20 px-3 py-1 rounded-xl">
                                                {generatingLinkId === o.id ? '...' : `${toReverse.toLocaleString()} F`}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <a
                                href={`https://wa.me/${import.meta.env.VITE_ADMIN_WHATSAPP || "22900000000"}?text=${encodeURIComponent(`Bonjour, mon compte livreur est bloqué pour un montant de ${unremittedCashAmount.toLocaleString()} F. Je souhaite régulariser ma situation.`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full flex items-center justify-center gap-3 py-3 bg-base-200 hover:bg-base-300 text-base-content/60 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                            >
                                Contacter l'administration
                            </a>
                            <button
                                onClick={() => loadData()}
                                className="w-full btn btn-ghost text-xs font-black uppercase tracking-widest text-base-content/40 hover:text-primary transition-colors"
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
                        <div className="p-3 bg-base-100/20 rounded-2xl">
                            <Banknote size={24} />
                        </div>
                        <div>
                            <p className="font-black text-sm">Caisse non versée : {unremittedCashAmount.toLocaleString()} F</p>
                            <p className="text-[10px] uppercase font-black tracking-widest opacity-80">Veuillez solder votre compte pour éviter la suspension</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        {unremittedCashOrders.map(o => {
                            const toReverse = Math.max(0, Number(o.total_amount) - Number(o.deliverer_fee !== undefined ? o.deliverer_fee : (o.delivery_fee || 0)));
                            return (
                                <button
                                    key={o.id}
                                    onClick={() => handleGenerateCashLink(o.id)}
                                    disabled={generatingLinkId === o.id}
                                    className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-wider disabled:opacity-60 transition-all hover:bg-rose-50"
                                >
                                    <span>Reverser #{o.id.slice(0, 8).toUpperCase()}</span>
                                    <span>{generatingLinkId === o.id ? '...' : `${toReverse.toLocaleString()} F`}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Header Statique Livreur */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.3em] mb-2">
                        <Activity size={14} /> LIVE CENTER
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-base-content tracking-tighter">Bienvenue, <span className="text-primary">{clerkUser?.firstName || "Rider"}</span></h1>
                    <p className="text-base-content/60 font-bold mt-1 text-sm md:text-base">Gérez vos courses en temps réel.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-2 mr-auto lg:mr-0">
                        <TourHelpButton steps={DELIVERY_TOUR_STEPS} />
                        <ThemeSelector />
                        <PortalSwitcher />
                        <NotificationCenter />
                    </div>
                    <div className="flex items-center gap-4 bg-base-100 p-1.5 md:p-2 rounded-2xl md:rounded-3xl border border-base-content/10 shadow-sm w-full sm:w-auto">
                        <button
                            onClick={handleToggleOnline}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${isOnline ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-base-200 text-base-content/40'}`}
                        >
                            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-base-100 animate-pulse' : 'bg-primary/20'}`}></div>
                            {isOnline ? "Disponible" : "Hors Ligne"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map((s, idx) => (
                    <div key={idx} className="bg-base-100 p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-base-content/5 shadow-xl shadow-base-content/5 flex flex-col md:flex-row items-start md:items-center justify-between group hover:border-primary/30 transition-all gap-4">
                        <div className="space-y-1 md:space-y-2">
                            <p className="text-[8px] md:text-[10px] font-black text-base-content/40 uppercase tracking-widest">{s.label}</p>
                            <p className="text-xl md:text-3xl font-black text-base-content">{s.value}</p>
                        </div>
                        <div className="w-10 h-10 md:w-16 md:h-16 bg-base-200 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-2xl group-hover:scale-110 transition-transform self-end md:self-auto">
                            {s.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs Layout */}
            <div className="bg-base-100 rounded-3xl md:rounded-[3rem] border border-base-content/10 shadow-2xl shadow-base-content/5 overflow-hidden">
                <div className="flex border-b border-base-content/5 p-2 md:p-4 gap-2 md:gap-4 overflow-x-auto custom-scrollbar no-scrollbar">
                    {/* Chaque bouton d'onglet garde ses classes de dimensionnement flex sur la
                        <TourAnchor> (div wrapper) plutôt que sur le <button>, sinon il perd sa
                        place dans le flex row du parent. */}
                    <TourAnchor id="tour-delivery-available" className="flex-none min-w-[120px] md:flex-1">
                    <button
                        onClick={() => {
                            setTab("available");
                            if (tab === 'available') loadData();
                        }}
                        className={`w-full py-3 md:py-4 px-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${tab === 'available' ? 'bg-neutral text-neutral-content shadow-xl shadow-neutral/10' : 'text-base-content/40 hover:bg-base-200'}`}
                    >
                        Disponibles ({availableOrders.length})
                    </button>
                    </TourAnchor>
                    <TourAnchor id="tour-delivery-active" className="flex-none min-w-[120px] md:flex-1">
                    <button
                        onClick={() => {
                            setTab("active");
                            if (tab === 'active') loadData();
                        }}
                        className={`w-full py-3 md:py-4 px-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${tab === 'active' ? 'bg-neutral text-neutral-content shadow-xl shadow-neutral/10' : 'text-base-content/40 hover:bg-base-200'}`}
                    >
                        En cours ({activeOrders.length})
                    </button>
                    </TourAnchor>
                    <TourAnchor id="tour-delivery-history" className="flex-none min-w-[100px] md:flex-1">
                    <button
                        onClick={() => {
                            setTab("history");
                            if (tab === 'history') loadData();
                        }}
                        className={`w-full py-3 md:py-4 px-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${tab === 'history' ? 'bg-neutral text-neutral-content shadow-xl shadow-neutral/10' : 'text-base-content/40 hover:bg-base-200'}`}
                    >
                        Historique
                    </button>
                    </TourAnchor>
                    <TourAnchor id="tour-delivery-profile" className="flex-none min-w-[120px] md:flex-1">
                    <button
                        onClick={() => {
                            setTab("profile");
                            if (tab === 'profile') loadData();
                        }}
                        className={`w-full py-3 md:py-4 px-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${tab === 'profile' ? 'bg-neutral text-neutral-content shadow-xl shadow-neutral/10' : 'text-base-content/40 hover:bg-base-200'}`}
                    >
                        ZONES & INFOS
                    </button>
                    </TourAnchor>
                    <TourAnchor id="tour-delivery-wallet" className="flex-none min-w-[120px] md:flex-1">
                    <button
                        onClick={() => {
                            setTab("wallet");
                            if (tab === 'wallet') loadData();
                        }}
                        className={`w-full py-3 md:py-4 px-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${tab === 'wallet' ? 'bg-neutral text-neutral-content shadow-xl shadow-neutral/10' : 'text-base-content/40 hover:bg-base-200'}`}
                    >
                        PORTEFEUILLE
                    </button>
                    </TourAnchor>
                </div>

                {/* Manual Refresh & Tab Re-fetch logic */}
                <div className="px-8 py-2 flex justify-end">
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-base-content/40 hover:text-primary transition-all disabled:opacity-50"
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
                                <p className="text-xs font-black text-base-content/40 uppercase tracking-widest animate-pulse">Chargement intelligent...</p>
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
                                            <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Package size={40} className="text-base-content/20" />
                                            </div>
                                            <p className="text-base-content/60 font-bold text-lg">Aucune commande disponible.</p>
                                            <p className="text-sm text-base-content/40 max-w-xs mx-auto">
                                                Vérifiez l'onglet <span className="font-black text-base-content/80">"En cours"</span> pour voir les courses qui vous ont déjà été assignées.
                                            </p>
                                        </div>
                                    ) : (
                                        availableOrders.map(order => (
                                            <div key={order.id} className="bg-base-200 rounded-3xl p-6 md:p-8 border border-base-content/10 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 md:gap-8 group hover:bg-base-200 hover:shadow-xl transition-all duration-500">
                                                <div className="flex items-center gap-6 w-full lg:w-auto">
                                                    <div className="w-16 h-16 bg-base-100 rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:rotate-12 transition-transform">
                                                        <Package size={28} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">RÉF. #{order.id.slice(0, 8)}</p>
                                                        <h3 className="text-xl font-black text-base-content">Livraison Urbaine</h3>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black border border-amber-100 flex items-center gap-2">
                                                                <Truck size={12} /> Collecte : {order.boutique?.name || order.supplier?.name || "Plateforme Centrale"}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-4 mb-4">
                                                            {order.items?.map(item => (
                                                                <div key={item.id} className="flex items-center gap-3 text-xs font-bold text-base-content/70 bg-base-100/60 px-3 py-2 rounded-2xl border border-base-content/5 shadow-sm">
                                                                    <div className="w-8 h-8 rounded-lg bg-base-100 overflow-hidden border border-base-content/10 shrink-0">
                                                                        {item.product?.images?.[0]?.image_url ? (
                                                                            <img src={item.product.images[0].image_url} alt="" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-base-content/20 bg-base-200"><Package size={14} /></div>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-primary font-black">x{item.quantity}</span>
                                                                    <span className="truncate max-w-[120px]">{item.product?.name}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <p className="flex items-center gap-2 text-base-content/60 text-sm font-bold">
                                                            <MapPin size={14} /> {order.address?.city || "Quartier inconnu"}, {order.address?.address_line}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-8 w-full lg:w-auto justify-between border-t lg:border-t-0 lg:border-l border-base-content/10 pt-6 lg:pt-0 lg:pl-8">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest">Gain Course</p>
                                                        <p className="text-2xl font-black text-primary">{(order.deliverer_fee !== undefined ? order.deliverer_fee : (order.delivery_fee || 1000)).toLocaleString()} F</p>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                        <button
                                                            onClick={() => setPreviewOrder(order)}
                                                            className="btn btn-outline rounded-2xl h-14 px-6 font-black gap-2 border-2 border-base-content/20 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                                                        >
                                                            <Search size={16} /> Voir détails
                                                        </button>
                                                        <button
                                                            onClick={() => handleAssign(order.id)}
                                                            disabled={hasDebt}
                                                            className="btn btn-primary rounded-2xl h-14 px-8 font-black gap-3 shadow-xl shadow-primary/20 disabled:bg-base-200 disabled:text-base-content/40 disabled:shadow-none"
                                                        >
                                                            Accepter <ChevronRight size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )
                                )}

                                {tab === 'active' && (
                                    activeOrders.length === 0 ? (
                                        <div className="py-20 text-center space-y-4 bg-base-200/50 rounded-[3rem] border border-dashed border-base-content/20">
                                            <div className="w-20 h-20 bg-base-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                                <Truck size={40} className="text-base-content/20" />
                                            </div>
                                            <p className="text-base-content/60 font-bold text-lg">Aucune course en cours.</p>
                                            <p className="text-sm text-base-content/40 max-w-xs mx-auto">
                                                Allez dans l'onglet <span className="font-black text-base-content/80">"Disponibles"</span> pour accepter une nouvelle livraison.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {activeOrders.map(order => {
                                                const isExpanded = expandedOrderId === order.id;
                                                const isPickedUp = ['expediee', 'expédiée'].includes(order.status);
                                                const orderRef = order.id ? order.id.slice(0, 8).toUpperCase() : "";
                                                const totalAmount = Number(order.total_amount || 0);
                                                const deliveryFee = Number(order.deliverer_fee !== undefined ? order.deliverer_fee : (order.delivery_fee || 1000));
                                                const isCod = order.payment_method === 'delivery';

                                                return (
                                                    <div 
                                                        key={order.id} 
                                                        className={`bg-base-100 rounded-[2rem] border transition-all duration-300 overflow-hidden shadow-lg ${
                                                            isExpanded 
                                                                ? 'border-primary shadow-primary/5 ring-1 ring-primary/20' 
                                                                : 'border-base-content/10 hover:border-primary/45 hover:shadow-xl'
                                                        }`}
                                                    >
                                                        {/* Summary Header */}
                                                        <div 
                                                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                                            className="p-5 md:p-6 flex items-center justify-between gap-4 cursor-pointer select-none"
                                                        >
                                                            <div className="flex items-center gap-4 min-w-0">
                                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                                                                    isPickedUp 
                                                                        ? 'bg-emerald-500/10 text-emerald-500' 
                                                                        : 'bg-amber-500/10 text-amber-500'
                                                                }`}>
                                                                    <Truck size={22} className={!isPickedUp ? 'animate-pulse' : ''} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center flex-wrap gap-2">
                                                                        <span className="text-[10px] font-black uppercase tracking-wider text-base-content/40">
                                                                            RÉF. #{orderRef}
                                                                        </span>
                                                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                                                            isPickedUp 
                                                                                ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20' 
                                                                                : 'bg-amber-500/15 text-amber-600 border border-amber-500/20'
                                                                        }`}>
                                                                            {isPickedUp ? "En Transit" : "À Collecter"}
                                                                        </span>
                                                                    </div>
                                                                    <h4 className="text-sm md:text-base font-black text-base-content truncate mt-1">
                                                                        {order.address?.city || "Destination"} - {order.address?.address_line || "Quartier"}
                                                                    </h4>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-4 shrink-0">
                                                                <div className="text-right hidden sm:block">
                                                                    <p className="text-[8px] font-black text-base-content/30 uppercase tracking-widest">Gain estimé</p>
                                                                    <p className="text-base font-black text-primary">{deliveryFee.toLocaleString()} F</p>
                                                                </div>
                                                                <div className={`w-8 h-8 rounded-xl bg-base-200/50 flex items-center justify-center text-base-content/40 hover:text-primary transition-all duration-300 ${isExpanded ? 'rotate-180 text-primary bg-primary/10' : ''}`}>
                                                                    <ChevronDown size={18} />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Mobile stats line */}
                                                        <div className="px-5 pb-4 pt-0 flex sm:hidden items-center justify-between border-t border-dashed border-base-content/5 mt-[-4px]">
                                                            <div className="flex items-center gap-1.5 text-xs text-base-content/50">
                                                                <Store size={12} /> <span className="font-bold truncate max-w-[120px]">{order.boutique?.name || order.supplier?.name || "Vendeur"}</span>
                                                            </div>
                                                            <p className="text-xs font-black text-primary">Gain : {deliveryFee.toLocaleString()} F</p>
                                                        </div>

                                                        {/* Collapsible Content */}
                                                        <AnimatePresence initial={false}>
                                                            {isExpanded && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: "auto", opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.25, ease: "easeInOut" }}
                                                                >
                                                                    <div className="px-5 pb-6 md:px-6 md:pb-8 pt-2 border-t border-base-content/5 space-y-6">
                                                                        
                                                                        {/* Milestones grid */}
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                                            
                                                                            {/* Milestone 1: Pickup */}
                                                                            <div className={`p-5 rounded-2xl border transition-all ${
                                                                                isPickedUp 
                                                                                    ? 'bg-emerald-500/5 border-emerald-500/20 shadow-sm' 
                                                                                    : 'bg-amber-500/5 border-amber-500/20 shadow-sm'
                                                                            }`}>
                                                                                <div className="flex items-center justify-between mb-3">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                                                                                            isPickedUp 
                                                                                                ? 'bg-emerald-500 text-white' 
                                                                                                : 'bg-amber-500 text-white'
                                                                                        }`}>
                                                                                            1
                                                                                        </div>
                                                                                        <h5 className={`text-xs font-black uppercase tracking-wider ${isPickedUp ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                                                            Point de Collecte
                                                                                        </h5>
                                                                                    </div>
                                                                                    {isPickedUp ? (
                                                                                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">Récupéré</span>
                                                                                    ) : (
                                                                                        <span className="text-[9px] font-black text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase animate-pulse">À Récupérer</span>
                                                                                    )}
                                                                                </div>
                                                                                
                                                                                <div className="space-y-3">
                                                                                    <div>
                                                                                        <h4 className="text-sm font-black text-base-content">{order.boutique?.name || order.supplier?.name || "Boutique Vendeur"}</h4>
                                                                                        <p className="text-[11px] text-base-content/60 leading-relaxed font-bold mt-0.5">
                                                                                            {order.boutique
                                                                                                ? `${order.boutique.address_line || ''}, ${order.boutique.quartier_label || order.boutique.commune_label || ''}`
                                                                                                : `${order.supplier?.address_line || ''}, ${order.supplier?.quartier_label || order.supplier?.commune_label || ''}`}
                                                                                        </p>
                                                                                    </div>

                                                                                    <div className="flex flex-wrap gap-2 pt-1">
                                                                                        {(order.boutique?.phone || order.boutique?.whatsapp || order.supplier?.phone) && (
                                                                                            <a
                                                                                                href={`tel:${order.boutique?.phone || order.boutique?.whatsapp || order.supplier?.phone}`}
                                                                                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral hover:bg-primary hover:text-white text-neutral-content rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-sm"
                                                                                            >
                                                                                                <Phone size={11} /> Appeler : {order.boutique?.phone || order.boutique?.whatsapp || order.supplier?.phone}
                                                                                            </a>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Milestone 2: Delivery */}
                                                                            <div className={`p-5 rounded-2xl border transition-all ${
                                                                                isPickedUp 
                                                                                    ? 'bg-emerald-500/5 border-emerald-500/20 shadow-sm' 
                                                                                    : 'bg-blue-500/5 border-blue-500/10 shadow-sm'
                                                                            }`}>
                                                                                <div className="flex items-center justify-between mb-3">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                                                                                            isPickedUp 
                                                                                                ? 'bg-emerald-500 text-white' 
                                                                                                : 'bg-blue-500 text-white'
                                                                                        }`}>
                                                                                            2
                                                                                        </div>
                                                                                        <h5 className={`text-xs font-black uppercase tracking-wider ${isPickedUp ? 'text-emerald-600' : 'text-blue-600'}`}>
                                                                                            Lieu de Livraison
                                                                                        </h5>
                                                                                    </div>
                                                                                    {isPickedUp && (
                                                                                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase animate-pulse">À Livrer</span>
                                                                                    )}
                                                                                </div>

                                                                                <div className="space-y-3">
                                                                                    <div>
                                                                                        <h4 className="text-sm font-black text-base-content">
                                                                                            {order.user?.fullname || order.guest_name || "Client"}
                                                                                        </h4>
                                                                                        <p className="text-[11px] text-base-content/60 leading-relaxed font-bold mt-0.5">
                                                                                            {order.address?.address_line}, {order.address?.city}
                                                                                        </p>
                                                                                    </div>

                                                                                    <div className="flex flex-wrap gap-2 pt-1">
                                                                                        {(order.user?.phone || order.guest_phone || order.address?.phone) && (
                                                                                            <a 
                                                                                                href={`tel:${order.user?.phone || order.guest_phone || order.address?.phone}`}
                                                                                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral hover:bg-primary hover:text-white text-neutral-content rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-sm"
                                                                                            >
                                                                                                <Phone size={11} /> Appeler Client
                                                                                            </a>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                        </div>

                                                                        {/* Colis / Package items */}
                                                                        <div className="bg-base-200/50 p-4 rounded-2xl border border-base-content/5 space-y-3">
                                                                            <p className="text-[9px] font-black uppercase text-base-content/40 tracking-wider flex items-center gap-1.5">
                                                                                <Package size={13} /> Liste des Articles
                                                                            </p>
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                                                                {order.items?.map(item => (
                                                                                    <div 
                                                                                        key={item.id} 
                                                                                        className="flex items-center gap-3 bg-base-100 p-3 rounded-xl border border-base-content/5 shadow-sm"
                                                                                    >
                                                                                        <div className="w-10 h-10 rounded-lg bg-base-200 overflow-hidden border border-base-content/5 shrink-0 flex items-center justify-center">
                                                                                            {item.product?.images?.[0]?.image_url ? (
                                                                                                <img 
                                                                                                    src={item.product.images[0].image_url} 
                                                                                                    alt="" 
                                                                                                    className="w-full h-full object-cover" 
                                                                                                />
                                                                                            ) : (
                                                                                                <Package size={14} className="text-base-content/20" />
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="min-w-0">
                                                                                            <p className="text-xs font-black text-base-content truncate">
                                                                                                {item.product?.name}
                                                                                            </p>
                                                                                            <p className="text-[10px] font-bold text-primary">
                                                                                                Quantité : x{item.quantity}
                                                                                            </p>
                                                                                            {item.variant && (
                                                                                                <p className="text-[8px] font-bold text-base-content/40 truncate italic">
                                                                                                    {item.variant.attribute_values || item.variant.sku}
                                                                                                </p>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>

                                                                        {/* COD Cash Information */}
                                                                        {isCod && (
                                                                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-600">
                                                                                <Banknote size={20} className="shrink-0" />
                                                                                <div>
                                                                                    <p className="text-[9px] font-black uppercase tracking-wider">Montant à Encaisser chez le Client</p>
                                                                                    <p className="text-sm font-bold mt-0.5">Veuillez collecter <span className="font-black text-base underline">{totalAmount.toLocaleString()} F CFA</span> en espèces.</p>
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {/* Navigation link / GPS */}
                                                                        <div className="bg-base-200/50 p-4 rounded-2xl border border-base-content/5">
                                                                            <p className="text-[9px] font-black uppercase text-base-content/40 tracking-wider mb-2 flex items-center gap-1.5">
                                                                                <Navigation size={13} /> Itinéraire GPS de Livraison
                                                                            </p>
                                                                            <DeliveryMapLink
                                                                                supplierLat={order.boutique?.lat || order.supplier?.lat}
                                                                                supplierLng={order.boutique?.lng || order.supplier?.lng}
                                                                                supplierAddress={order.boutique ? (order.boutique.address_line || order.boutique.commune_label) : (order.supplier?.address_line || order.supplier?.commune_label)}
                                                                                clientLat={order.address?.lat}
                                                                                clientLng={order.address?.lng}
                                                                                clientAddress={order.address?.quartier_label
                                                                                    ? `${order.address.quartier_label}, ${order.address.commune_label}`
                                                                                    : order.address?.commune_label || order.address?.city}
                                                                            />
                                                                        </div>

                                                                        {/* Fulfill Action Buttons */}
                                                                        <div className="pt-4 border-t border-dashed border-base-content/5 flex gap-3">
                                                                            {!isPickedUp ? (
                                                                                <>
                                                                                    <button
                                                                                        onClick={() => handleStatusUpdate(order.id, 'expédiée')}
                                                                                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl py-4 px-6 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-all active:scale-[0.98]"
                                                                                    >
                                                                                        <Truck size={16} /> Colis Récupéré
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleRelease(order.id)}
                                                                                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-2xl px-5 font-black text-xs uppercase tracking-wider flex items-center justify-center transition-all active:scale-[0.98]"
                                                                                        title="Désassigner la course"
                                                                                    >
                                                                                        Abandonner
                                                                                    </button>
                                                                                </>
                                                                            ) : (
                                                                                <button
                                                                                    onClick={() => handleStatusUpdate(order.id, 'livrée')}
                                                                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition-all active:scale-[0.98]"
                                                                                >
                                                                                    <CheckCircle2 size={16} /> Confirmer la Livraison (Client)
                                                                                </button>
                                                                            )}
                                                                        </div>

                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>

                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )
                                )}

                                {tab === 'history' && (
                                    finishedOrders.length === 0 ? (
                                        <div className="py-20 text-center space-y-4">
                                            <Package size={48} className="mx-auto text-base-content/20" />
                                            <p className="text-base-content/50 font-bold">Votre historique est vide.</p>
                                        </div>
                                    ) : (
                                        finishedOrders.map(order => {
                                            const isCodPending = ['livree', 'livrée'].includes(order.status) && order.payment_method === 'delivery' && order.payment_status === 'en_attente';
                                            const toReverse = isCodPending ? Math.max(0, Number(order.total_amount) - Number(order.deliverer_fee !== undefined ? order.deliverer_fee : (order.delivery_fee || 0))) : 0;
                                            return (
                                            <div key={order.id} className={`bg-base-100 rounded-[2rem] p-6 border transition-all ${isCodPending ? 'border-rose-200 opacity-100' : 'border-base-content/10 opacity-70 hover:opacity-100'}`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${['livree', 'livrée'].includes(order.status) ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                                            {['livree', 'livrée'].includes(order.status) ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-base-content">Commande #{order.id.slice(0, 8)}</p>
                                                            <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">{new Date(order.delivered_at || order.updated_at || order.createdAt || order.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-base-content text-sm">{Number(order.deliverer_fee !== undefined ? order.deliverer_fee : (order.delivery_fee || 0)).toLocaleString()} F</p>
                                                        <p className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Gain encaissé</p>
                                                    </div>
                                                </div>
                                                {isCodPending && (
                                                    <div className="mt-4 pt-4 border-t border-rose-100">
                                                        <button
                                                            onClick={() => handleGenerateCashLink(order.id)}
                                                            disabled={generatingLinkId === order.id}
                                                            className="w-full flex items-center justify-between py-3 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-2xl font-black text-xs transition-all shadow-md shadow-indigo-500/20"
                                                        >
                                                            <span>💳 Reverser le cash</span>
                                                            <span className="bg-white/20 px-3 py-1 rounded-xl">
                                                                {generatingLinkId === order.id ? 'Génération...' : `${toReverse.toLocaleString()} F`}
                                                            </span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            );
                                        })
                                    )
                                )}

                                {tab === 'profile' && myself && (
                                    <div className="p-4 md:p-10 space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {myself.kyc_status === 'rejected' && (
                                            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 flex gap-4 items-start">
                                                <div className="w-10 h-10 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                                                    <AlertCircle size={20} />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-black text-rose-700 text-sm uppercase tracking-wide">Dossier KYC rejeté</p>
                                                    {myself.kyc_rejection_reason && (
                                                        <p className="text-rose-600 font-bold text-sm leading-relaxed">{myself.kyc_rejection_reason}</p>
                                                    )}
                                                    <p className="text-rose-400 text-xs font-bold pt-1">Contactez le support ou mettez à jour votre dossier.</p>
                                                </div>
                                            </div>
                                        )}
                                        {myself.kyc_status === 'submitted' && (
                                            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex gap-4 items-center">
                                                <div className="w-8 h-8 bg-amber-100 text-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <Clock size={16} />
                                                </div>
                                                <p className="font-bold text-amber-700 text-sm">Votre dossier KYC est en cours d'examen par notre équipe.</p>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="text-xl font-black text-base-content flex items-center gap-3">
                                                        <Truck className="text-primary" /> Mon Véhicule
                                                    </h3>
                                                    <button 
                                                        onClick={() => setShowVehicleModal(true)}
                                                        className="p-3 bg-base-200 text-base-content/40 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                </div>
                                                <div className="bg-base-200 p-6 rounded-3xl border border-base-content/10 space-y-4">
                                                    <div className="flex justify-between items-center border-b border-white pb-4">
                                                        <span className="text-[10px] font-black uppercase text-base-content/40 tracking-widest">Type</span>
                                                        <span className="font-bold text-base-content/80 uppercase">{myself.vehicle_type}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center border-b border-base-content/5 pb-4">
                                                        <span className="text-[10px] font-black uppercase text-base-content/40 tracking-widest">Modèle</span>
                                                        <span className="font-bold text-base-content/80">{myself.vehicle_model}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-black uppercase text-base-content/40 tracking-widest">Immatriculation</span>
                                                        <span className="font-bold text-base-content/80">{myself.license_plate}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <h3 className="text-xl font-black text-base-content flex items-center gap-3">
                                                    <MapPin className="text-primary" /> Zones de Service
                                                </h3>

                                                {/* Search box */}
                                                <div className="relative">
                                                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40" />
                                                    <input
                                                        type="text"
                                                        placeholder="Rechercher une commune..."
                                                        value={zoneSearch}
                                                        onChange={e => setZoneSearch(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-base-content/10 bg-base-200 text-sm font-bold text-base-content/80 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                                                    />
                                                </div>

                                                {/* Communes grouped by department */}
                                                <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                                                    {filteredDepts.map(dept => (
                                                        <div key={dept.departement}>
                                                            <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                                <span className="inline-block w-5 h-px bg-base-300"></span>
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
                                                                                : 'bg-base-200 border-base-content/10 text-base-content/50 hover:border-primary/30'
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
                                                        <p className="text-base-content/40 text-sm font-bold text-center py-4">Aucune commune trouvée.</p>
                                                    )}
                                                </div>

                                                <p className="text-[10px] text-base-content/40 font-bold uppercase italic">
                                                    * Sélectionnez les communes où vous souhaitez recevoir des commandes ({(myself.service_zones || []).length} choisie(s)).
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {tab === 'wallet' && (
                                    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="bg-neutral rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 text-neutral-content relative overflow-hidden">
                                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-content/40 mb-2">Solde Disponible</p>
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
                                                <h3 className="text-lg font-black text-base-content">Demandes de retrait</h3>
                                                <div className="space-y-4">
                                                    {(walletStats?.payoutRequests || []).map(p => (
                                                        <div key={p.id} className="bg-base-200 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-base-content/10 flex justify-between items-center">
                                                            <div>
                                                                <p className="font-black text-base-content">{Number(p.amount).toLocaleString()} F</p>
                                                                <p className="text-[9px] font-bold text-base-content/40 uppercase">{new Date(p.createdAt || p.created_at).toLocaleDateString()}</p>
                                                            </div>
                                                            <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase ${p.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                                {p.status}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-4 md:space-y-6">
                                                <h3 className="text-lg font-black text-base-content">Dernières transactions</h3>
                                                <div className="space-y-4">
                                                    {(walletStats?.transactions || []).map(t => (
                                                        <div key={t.id} className="bg-base-100 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-base-content/10 flex justify-between items-center hover:shadow-lg transition-shadow">
                                                            <div className="flex items-center gap-3 md:gap-4">
                                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'earning' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                                                    <Banknote size={18} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-black text-base-content/90">{t.description}</p>
                                                                        <p className="text-[9px] font-bold text-base-content/40 uppercase">{new Date(t.createdAt || t.created_at).toLocaleDateString()}</p>
                                                                </div>
                                                            </div>
                                                            <p className={`font-black ${t.type === 'earning' ? 'text-emerald-500' : 'text-base-content'}`}>
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
                            className="absolute inset-0 bg-neutral/60 backdrop-blur-sm"
                            onClick={() => setShowPayoutModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-base-100 w-full max-w-lg rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative z-10 space-y-6 md:space-y-8"
                        >
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-base-content tracking-tighter">Retrait d'argent</h3>
                                <p className="text-sm font-bold text-base-content/40">Demandez le virement de vos gains.</p>
                            </div>

                            <form onSubmit={handlePayoutRequest} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-base-content/40 ml-4">Montant à retirer (FCFA)</label>
                                    <input
                                        type="number"
                                        required
                                        value={payoutAmount}
                                        onChange={e => setPayoutAmount(e.target.value)}
                                        className="w-full bg-base-200 border-none rounded-2xl px-8 py-5 text-2xl font-black text-base-content outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                        placeholder="Ex: 5000"
                                    />
                                    <p className="text-[10px] text-right font-bold text-base-content/40">Solde max: {Number(walletStats?.balance || 0).toLocaleString()} F</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button type="button" onClick={() => setPayoutMethod('momo')} className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${payoutMethod === 'momo' ? 'border-primary bg-primary/5 text-primary' : 'border-base-200 text-base-content/40 hover:border-base-300'}`}>
                                        <Truck size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Mobile Money</span>
                                    </button>
                                    <button type="button" onClick={() => setPayoutMethod('bank')} className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${payoutMethod === 'bank' ? 'border-primary bg-primary/5 text-primary' : 'border-base-200 text-base-content/40 hover:border-base-300'}`}>
                                        <Banknote size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Banque</span>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-base-content/40 ml-4">
                                        {payoutMethod === 'momo' ? 'Numéro de téléphone MoMo & Nom' : 'Informations Bancaires (RIB, Nom de la banque)'}
                                    </label>
                                    <textarea
                                        required
                                        value={paymentDetails}
                                        onChange={e => setPaymentDetails(e.target.value)}
                                        rows="2"
                                        className="w-full bg-base-200 border-none rounded-2xl px-8 py-4 text-sm font-bold text-base-content outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none"
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
                                        <label htmlFor="save_details_rider" className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest cursor-pointer select-none">Enregistrer ces informations</label>
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
            
            <AnimatePresence>
                {showVehicleModal && (
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
                            <div className="flex justify-between items-center border-b border-base-content/5 pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                        <Truck size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tighter">Mon Véhicule</h3>
                                        <p className="text-[10px] text-base-content/40 font-bold uppercase tracking-widest">Mise à jour</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowVehicleModal(false)}
                                    className="p-3 bg-base-200 hover:bg-rose-50 hover:text-rose-500 text-base-content/40 rounded-2xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleVehicleUpdate} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40 mb-2 pl-4">Type de véhicule</label>
                                    <select
                                        value={vehicleData.vehicle_type}
                                        onChange={(e) => setVehicleData({ ...vehicleData, vehicle_type: e.target.value })}
                                        className="w-full bg-base-200 border-none rounded-3xl px-6 py-4 font-black text-sm text-base-content focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="moto">Moto</option>
                                        <option value="voiture">Voiture</option>
                                        <option value="camionnette">Camionnette</option>
                                        <option value="velo">Vélo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40 mb-2 pl-4">Modèle</label>
                                    <input
                                        type="text"
                                        required
                                        value={vehicleData.vehicle_model}
                                        onChange={(e) => setVehicleData({ ...vehicleData, vehicle_model: e.target.value })}
                                        className="w-full bg-base-200 border-none rounded-3xl px-6 py-4 font-black text-sm text-base-content focus:ring-2 focus:ring-primary/20"
                                        placeholder="Ex: Bajaj Boxer 150"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40 mb-2 pl-4">Immatriculation</label>
                                    <input
                                        type="text"
                                        required
                                        value={vehicleData.license_plate}
                                        onChange={(e) => setVehicleData({ ...vehicleData, license_plate: e.target.value })}
                                        className="w-full bg-base-200 border-none rounded-3xl px-6 py-4 font-black text-sm text-base-content focus:ring-2 focus:ring-primary/20"
                                        placeholder="Ex: AB 1234 RB"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-primary text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/30 hover:bg-neutral hover:text-neutral-content transition-all"
                                >
                                    Enregistrer
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Order Preview Modal */}
            <AnimatePresence>
                {previewOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-end md:items-center justify-center"
                        onClick={() => setPreviewOrder(null)}
                    >
                        <div className="absolute inset-0 bg-neutral/70 backdrop-blur-sm" />
                        <motion.div
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            onClick={e => e.stopPropagation()}
                            className="relative z-10 bg-base-100 w-full md:max-w-2xl md:rounded-[3rem] rounded-t-[3rem] shadow-2xl max-h-[92vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-base-100 z-10 flex items-center justify-between px-8 pt-8 pb-5 border-b border-base-content/5">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">RÉF. #{previewOrder.id.slice(0, 8)}</p>
                                    <h2 className="text-2xl font-black text-base-content tracking-tighter">Détails de la Commande</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-3 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                                            {previewOrder.status || "disponible"}
                                        </span>
                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                                            Gain : {(previewOrder.deliverer_fee !== undefined ? previewOrder.deliverer_fee : (previewOrder.delivery_fee || 1000)).toLocaleString()} F
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setPreviewOrder(null)}
                                    className="w-12 h-12 bg-base-200 hover:bg-rose-50 hover:text-rose-500 text-base-content/40 rounded-2xl flex items-center justify-center transition-all shrink-0"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="px-8 pb-8 pt-6 space-y-8">
                                {/* Section 2: Produits à collecter */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-base-content/40 uppercase tracking-[0.25em] flex items-center gap-2">
                                        <Package size={13} /> Produits à Collecter
                                    </p>

                                    {/* Product cards grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {(previewOrder.items || []).map(item => (
                                            <div key={item.id} className="flex items-center gap-3 bg-base-200 p-4 rounded-2xl border border-base-content/5">
                                                <div className="w-[50px] h-[50px] rounded-xl bg-base-100 overflow-hidden border border-base-content/10 shrink-0 flex items-center justify-center">
                                                    {item.product?.images?.[0]?.image_url ? (
                                                        <img src={item.product.images[0].image_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={18} className="text-base-content/20" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-base-content truncate">{item.product?.name || "Produit"}</p>
                                                    <p className="text-[10px] font-bold text-primary">Qté : x{item.quantity}</p>
                                                    {item.variant && (
                                                        <p className="text-[9px] font-bold text-base-content/40 italic truncate">{item.variant.attribute_values || item.variant.sku}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pickup location */}
                                    <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl space-y-2">
                                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                                            <Store size={11} /> Point de Collecte
                                        </p>
                                        {/* La boutique retenue pour CETTE commande prime sur l'adresse générale
                                            du vendeur — un vendeur peut avoir plusieurs boutiques à des adresses différentes. */}
                                        <h4 className="text-sm font-black text-base-content">{previewOrder.boutique?.name || previewOrder.supplier?.name || "Boutique Vendeur"}</h4>
                                        {(previewOrder.boutique?.phone || previewOrder.boutique?.whatsapp || previewOrder.supplier?.phone) && (
                                            <a
                                                href={`tel:${previewOrder.boutique?.phone || previewOrder.boutique?.whatsapp || previewOrder.supplier?.phone}`}
                                                className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-600 hover:underline"
                                            >
                                                <Phone size={11} /> {previewOrder.boutique?.phone || previewOrder.boutique?.whatsapp || previewOrder.supplier?.phone}
                                            </a>
                                        )}
                                        {(previewOrder.boutique?.address_line || previewOrder.boutique?.commune_label || previewOrder.supplier?.address_line || previewOrder.supplier?.commune_label) && (
                                            <p className="text-[11px] text-base-content/60 font-bold flex items-start gap-1.5 mt-1">
                                                <MapPin size={11} className="mt-0.5 shrink-0" />
                                                {previewOrder.boutique
                                                    ? [previewOrder.boutique.address_line, previewOrder.boutique.quartier_label || previewOrder.boutique.commune_label].filter(Boolean).join(", ")
                                                    : [previewOrder.supplier.address_line, previewOrder.supplier.quartier_label || previewOrder.supplier.commune_label].filter(Boolean).join(", ")}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Section 3: Adresse de livraison */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-base-content/40 uppercase tracking-[0.25em] flex items-center gap-2">
                                        <MapPin size={13} /> Adresse de Livraison
                                    </p>
                                    <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl space-y-2">
                                        <h4 className="text-sm font-black text-base-content">
                                            {previewOrder.user?.fullname || previewOrder.guest_name || "Client"}
                                        </h4>
                                        <p className="text-[11px] text-base-content/60 font-bold flex items-start gap-1.5">
                                            <MapPin size={11} className="mt-0.5 shrink-0" />
                                            {[
                                                previewOrder.address?.address_line,
                                                previewOrder.address?.quartier_label || previewOrder.address?.quartier,
                                                previewOrder.address?.commune_label || previewOrder.address?.commune,
                                                previewOrder.address?.city
                                            ].filter(Boolean).join(", ")}
                                        </p>
                                        {previewOrder.address?.phone && (
                                            <a
                                                href={`tel:${previewOrder.address.phone}`}
                                                className="inline-flex items-center gap-1.5 text-[10px] font-black text-blue-600 hover:underline mt-1"
                                            >
                                                <Phone size={11} /> {previewOrder.address.phone}
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Section 4: Votre gain */}
                                <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl space-y-2 text-center">
                                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em]">Votre Gain</p>
                                    <p className="text-5xl font-black text-emerald-500">
                                        {(previewOrder.deliverer_fee !== undefined ? previewOrder.deliverer_fee : (previewOrder.delivery_fee || 1000)).toLocaleString()}
                                        <span className="text-2xl ml-1">F</span>
                                    </p>
                                    <p className="text-[10px] text-base-content/40 font-bold">Collectez le paiement à la livraison si applicable</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                    <button
                                        onClick={() => {
                                            handleAssign(previewOrder.id);
                                            setPreviewOrder(null);
                                        }}
                                        disabled={hasDebt}
                                        className="flex-1 btn btn-primary rounded-2xl py-4 h-auto font-black text-sm gap-3 shadow-xl shadow-primary/20 disabled:bg-base-200 disabled:text-base-content/40 disabled:shadow-none"
                                    >
                                        <Check size={18} /> Accepter cette livraison
                                    </button>
                                    <button
                                        onClick={() => setPreviewOrder(null)}
                                        className="sm:w-auto btn btn-ghost rounded-2xl py-4 h-auto font-black text-sm border-2 border-base-content/10 hover:border-base-content/20"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Debug Info (Support) */}
            <div className="fixed bottom-4 left-4 z-[100] bg-neutral/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest">
                    Raw: {myOrders.length} | Active: {activeOrders.length} | Tab: {tab} | DP: {myself?.id || 'None'}
                </p>
            </div>
        </div>
    );
}
