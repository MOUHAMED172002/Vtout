import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../../../lib/AuthHooks";
import { BadgeCheck, Save, RefreshCw, AlertCircle, CheckCircle, XCircle, History, Gift, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API = import.meta.env.VITE_API_URL || "https://api.vtout.com/api";

export default function SellerBadgeManager({ globalSearchQuery = "" }) {
    const { getToken } = useAuth();
    const [price, setPrice] = useState("");
    const [loadingPrice, setLoadingPrice] = useState(true);
    const [priceLoadError, setPriceLoadError] = useState(false);
    const [saving, setSaving] = useState(false);
    const [certified, setCertified] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loadingLists, setLoadingLists] = useState(true);
    const [tab, setTab] = useState("certified");
    const [toast, setToast] = useState(null);

    const [showGrantModal, setShowGrantModal] = useState(false);
    const [allSuppliers, setAllSuppliers] = useState([]);
    const [loadingSuppliers, setLoadingSuppliers] = useState(false);
    const [grantQuery, setGrantQuery] = useState("");
    const [grantSupplierId, setGrantSupplierId] = useState("");
    const [grantDays, setGrantDays] = useState("30");
    const [granting, setGranting] = useState(false);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const authHeaders = useCallback(async () => {
        const token = await getToken();
        return { Authorization: `Bearer ${token}` };
    }, [getToken]);

    const fetchPrice = useCallback(async () => {
        setLoadingPrice(true);
        setPriceLoadError(false);
        try {
            const headers = await authHeaders();
            const { data } = await axios.get(`${API}/badge/price`, { headers });
            setPrice(String(data.amount ?? ""));
        } catch (err) {
            setPriceLoadError(true);
            showToast("Impossible de charger le prix : " + (err.response?.data?.error || err.message), "error");
        } finally {
            setLoadingPrice(false);
        }
    }, [authHeaders]);

    const fetchLists = useCallback(async () => {
        setLoadingLists(true);
        try {
            const headers = await authHeaders();
            const [certifiedRes, subsRes] = await Promise.all([
                axios.get(`${API}/badge/admin/certified`, { headers }),
                axios.get(`${API}/badge/admin/subscriptions`, { headers }),
            ]);
            setCertified(certifiedRes.data || []);
            setSubscriptions(subsRes.data || []);
        } catch (err) {
            showToast("Erreur de chargement : " + (err.response?.data?.error || err.message), "error");
        } finally {
            setLoadingLists(false);
        }
    }, [authHeaders]);

    useEffect(() => { fetchPrice(); fetchLists(); }, [fetchPrice, fetchLists]);

    const handleSavePrice = async () => {
        if (priceLoadError) {
            showToast("Le prix actuel n'a pas pu être chargé — rechargez avant d'enregistrer pour éviter d'écraser la valeur existante.", "error");
            return;
        }
        const numericPrice = Number(price);
        if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
            showToast("Le montant doit être supérieur à 0", "error");
            return;
        }
        setSaving(true);
        try {
            const headers = await authHeaders();
            await axios.patch(`${API}/badge/price`, { amount: numericPrice }, { headers });
            showToast("✅ Prix mis à jour avec succès !");
        } catch (err) {
            showToast("❌ Erreur : " + (err.response?.data?.error || err.message), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleRevoke = async (supplierId, supplierName) => {
        if (!window.confirm(`Révoquer le badge vérifié de "${supplierName}" ?`)) return;
        try {
            const headers = await authHeaders();
            await axios.patch(`${API}/badge/admin/${supplierId}/revoke`, {}, { headers });
            showToast("Badge révoqué.");
            fetchLists();
        } catch (err) {
            showToast("❌ Erreur : " + (err.response?.data?.error || err.message), "error");
        }
    };

    const openGrantModal = async () => {
        setShowGrantModal(true);
        setGrantSupplierId("");
        setGrantQuery("");
        setGrantDays("30");
        if (allSuppliers.length === 0) {
            setLoadingSuppliers(true);
            try {
                const headers = await authHeaders();
                const { data } = await axios.get(`${API}/suppliers`, { headers });
                setAllSuppliers(data || []);
            } catch (err) {
                showToast("Impossible de charger la liste des fournisseurs.", "error");
            } finally {
                setLoadingSuppliers(false);
            }
        }
    };

    const handleGrant = async () => {
        if (!grantSupplierId) {
            showToast("Sélectionnez un fournisseur", "error");
            return;
        }
        const numericDays = parseInt(grantDays, 10);
        if (!Number.isFinite(numericDays) || numericDays <= 0) {
            showToast("Durée invalide", "error");
            return;
        }
        setGranting(true);
        try {
            const headers = await authHeaders();
            await axios.post(`${API}/badge/admin/grant`, { supplier_id: grantSupplierId, days: numericDays }, { headers });
            showToast("🎁 Badge attribué avec succès !");
            setShowGrantModal(false);
            fetchLists();
        } catch (err) {
            showToast("❌ Erreur : " + (err.response?.data?.error || err.message), "error");
        } finally {
            setGranting(false);
        }
    };

    const gq = grantQuery.trim().toLowerCase();
    const filteredGrantSuppliers = useMemo(() => {
        if (!gq) return allSuppliers.slice(0, 30);
        return allSuppliers.filter(s => s.name?.toLowerCase().includes(gq) || s.email?.toLowerCase().includes(gq)).slice(0, 30);
    }, [allSuppliers, gq]);

    const selectedGrantSupplier = allSuppliers.find(s => s.id === grantSupplierId);

    const q = globalSearchQuery.trim().toLowerCase();
    const filteredCertified = q
        ? certified.filter(s => s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q))
        : certified;

    const statusBadge = (status) => {
        const map = {
            paid: { label: "Payé", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
            pending: { label: "En attente", cls: "bg-amber-50 text-amber-700 border-amber-100" },
            failed: { label: "Échoué", cls: "bg-red-50 text-red-700 border-red-100" },
        };
        const s = map[status] || map.pending;
        return <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${s.cls}`}>{s.label}</span>;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center">
                        <BadgeCheck size={20} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Badge Vendeur Vérifié</h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Abonnement mensuel payant qui affiche un badge "Vérifié" sur tous les produits du vendeur.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={openGrantModal}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                    >
                        <Gift size={16} /> Attribuer un badge
                    </button>
                    <button
                        onClick={() => { fetchPrice(); fetchLists(); }}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                        title="Recharger"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold border ${
                            toast.type === "error"
                                ? "bg-red-50 text-red-700 border-red-100"
                                : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}
                    >
                        {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Price setting */}
            <div className="bg-base-100 rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h3 className="font-black text-gray-900">Prix mensuel</h3>
                <div className="flex gap-3">
                    <div className="relative flex-1 max-w-xs">
                        <input
                            type="number"
                            value={loadingPrice ? "" : price}
                            onChange={e => setPrice(e.target.value)}
                            placeholder={loadingPrice ? "Chargement…" : "Ex : 5000"}
                            disabled={loadingPrice || priceLoadError}
                            min={1}
                            className="w-full bg-base-100 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold pointer-events-none">FCFA / mois</span>
                    </div>
                    <button
                        onClick={handleSavePrice}
                        disabled={saving || loadingPrice || priceLoadError}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                        <Save size={15} /> {saving ? "Enregistrement…" : "Enregistrer"}
                    </button>
                </div>
                <p className="text-xs text-gray-400">
                    Ce montant est prélevé via FedaPay lorsqu'un fournisseur active ou renouvelle son badge (30 jours).
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-100">
                <button
                    onClick={() => setTab("certified")}
                    className={`px-4 py-2.5 text-sm font-bold transition-colors border-b-2 -mb-px ${tab === "certified" ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-gray-700"}`}
                >
                    Vendeurs vérifiés ({certified.length})
                </button>
                <button
                    onClick={() => setTab("history")}
                    className={`px-4 py-2.5 text-sm font-bold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${tab === "history" ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-gray-700"}`}
                >
                    <History size={14} /> Historique paiements
                </button>
            </div>

            {loadingLists ? (
                <div className="py-12 text-center text-gray-400 text-sm">Chargement…</div>
            ) : tab === "certified" ? (
                <div className="bg-base-100 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {filteredCertified.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 text-sm">Aucun vendeur vérifié pour le moment.</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filteredCertified.map(s => (
                                <div key={s.id} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <BadgeCheck size={18} className="text-blue-600 shrink-0" />
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-sm text-gray-900 truncate">{s.name}</p>
                                                {s.is_admin_granted ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-purple-50 text-purple-600 border border-purple-100 shrink-0">Offert</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">Payant</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                Expire le {s.certified_badge_expires_at ? new Date(s.certified_badge_expires_at).toLocaleDateString("fr-FR") : "—"}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRevoke(s.id, s.name)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors shrink-0"
                                    >
                                        <XCircle size={14} /> Révoquer
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-base-100 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {subscriptions.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 text-sm">Aucun paiement enregistré.</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {subscriptions.map(sub => (
                                <div key={sub.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-sm text-gray-900 truncate">{sub.supplier?.name || "Fournisseur supprimé"}</p>
                                            {sub.granted_by_admin_id && (
                                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-purple-50 text-purple-600 border border-purple-100 shrink-0">Offert par admin</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            {new Date(sub.created_at).toLocaleDateString("fr-FR")} · {sub.granted_by_admin_id ? "Gratuit" : `${Number(sub.amount).toLocaleString("fr-FR")} F`} · {sub.months || 1} mois
                                        </p>
                                    </div>
                                    {statusBadge(sub.status)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modal: Attribuer un badge */}
            <AnimatePresence>
                {showGrantModal && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowGrantModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-base-100 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-5"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Gift size={18} className="text-blue-600" />
                                    <h3 className="font-black text-gray-900">Attribuer un badge</h3>
                                </div>
                                <button onClick={() => setShowGrantModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500">Fournisseur</label>
                                {selectedGrantSupplier ? (
                                    <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                                        <span className="text-sm font-bold text-gray-900 truncate">{selectedGrantSupplier.name}</span>
                                        <button onClick={() => setGrantSupplierId("")} className="text-xs font-bold text-blue-600 hover:underline shrink-0 ml-2">Changer</button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                                            <input
                                                type="text"
                                                value={grantQuery}
                                                onChange={e => setGrantQuery(e.target.value)}
                                                placeholder="Rechercher un fournisseur…"
                                                className="w-full pl-9 pr-3 py-2.5 bg-base-100 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                            />
                                        </div>
                                        <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                                            {loadingSuppliers ? (
                                                <div className="py-6 text-center text-xs text-gray-400">Chargement…</div>
                                            ) : filteredGrantSuppliers.length === 0 ? (
                                                <div className="py-6 text-center text-xs text-gray-400">Aucun fournisseur trouvé.</div>
                                            ) : (
                                                filteredGrantSuppliers.map(s => (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => setGrantSupplierId(s.id)}
                                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                                                    >
                                                        <p className="font-bold text-gray-900 truncate">{s.name}</p>
                                                        <p className="text-[10px] text-gray-400 truncate">{s.email}</p>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500">Durée (jours)</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={grantDays}
                                    onChange={e => setGrantDays(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-base-100 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                />
                                <p className="text-[10px] text-gray-400">Ex : 30 jours = 1 mois. Le badge est activé immédiatement, sans paiement.</p>
                            </div>

                            <button
                                onClick={handleGrant}
                                disabled={granting || !grantSupplierId}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                <Gift size={16} /> {granting ? "Attribution…" : "Attribuer le badge"}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
