import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../../../lib/AuthHooks";
import {
    Megaphone, Plus, X, Save, RefreshCw, AlertCircle, CheckCircle,
    Trash2, Users, ShieldAlert, ShieldCheck, Clock, Eye, Ban, Wallet, ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    getAllCampaigns, createCampaign, updateCampaign, deleteCampaign,
    getModerationQueue, getPayoutQueue, getSubmissionDetail, approveSubmission, rejectSubmission, requestLiveCheck, markSubmissionPaid,
    getAllDistributors, banDistributor, unbanDistributor
} from "../../../services/adDistributionService";
import { uploadSingleImage } from "../../../services/uploadService";

const TABS = [
    { key: "campaigns", label: "Campagnes", icon: Megaphone },
    { key: "queue", label: "Modération", icon: ShieldCheck },
    { key: "payouts", label: "Paiements", icon: Wallet },
    { key: "distributors", label: "Distributeurs", icon: Users },
];

const TRUST_META = {
    new: { label: "Nouveau", cls: "bg-amber-50 text-amber-600 border-amber-100" },
    trusted: { label: "Confiance", cls: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    banned: { label: "Banni", cls: "bg-rose-50 text-rose-600 border-rose-100" },
};

const emptyCampaignForm = {
    title: "", description: "", creative_url: "", rate_per_view: "", min_views: "", max_reward_amount: "",
    max_distributors: "", start_date: "", end_date: ""
};

export default function AdDistributionManager({ globalSearchQuery = "" }) {
    const { getToken } = useAuth();
    const [tab, setTab] = useState("campaigns");
    const [toast, setToast] = useState(null);
    const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

    // Campaigns
    const [campaigns, setCampaigns] = useState([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyCampaignForm);
    const [uploadingCreative, setUploadingCreative] = useState(false);
    const [saving, setSaving] = useState(false);

    // Queue
    const [queue, setQueue] = useState([]);
    const [loadingQueue, setLoadingQueue] = useState(true);
    const [detail, setDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [viewsInput, setViewsInput] = useState("");

    // Payouts
    const [payouts, setPayouts] = useState([]);
    const [loadingPayouts, setLoadingPayouts] = useState(true);

    // Distributors
    const [distributors, setDistributors] = useState([]);
    const [loadingDistributors, setLoadingDistributors] = useState(true);

    const fetchCampaigns = useCallback(async () => {
        setLoadingCampaigns(true);
        try {
            const token = await getToken();
            setCampaigns(await getAllCampaigns(token) || []);
        } catch (err) { showToast("Erreur de chargement des campagnes", "error"); }
        finally { setLoadingCampaigns(false); }
    }, [getToken]);

    const fetchQueue = useCallback(async () => {
        setLoadingQueue(true);
        try {
            const token = await getToken();
            setQueue(await getModerationQueue(token) || []);
        } catch (err) { showToast("Erreur de chargement de la file", "error"); }
        finally { setLoadingQueue(false); }
    }, [getToken]);

    const fetchPayouts = useCallback(async () => {
        setLoadingPayouts(true);
        try {
            const token = await getToken();
            setPayouts(await getPayoutQueue(token) || []);
        } catch (err) { showToast("Erreur de chargement des paiements", "error"); }
        finally { setLoadingPayouts(false); }
    }, [getToken]);

    const fetchDistributors = useCallback(async () => {
        setLoadingDistributors(true);
        try {
            const token = await getToken();
            setDistributors(await getAllDistributors(token) || []);
        } catch (err) { showToast("Erreur de chargement des distributeurs", "error"); }
        finally { setLoadingDistributors(false); }
    }, [getToken]);

    useEffect(() => {
        if (tab === "campaigns") fetchCampaigns();
        if (tab === "queue") fetchQueue();
        if (tab === "payouts") fetchPayouts();
        if (tab === "distributors") fetchDistributors();
    }, [tab, fetchCampaigns, fetchQueue, fetchPayouts, fetchDistributors]);

    const handleMarkPaid = async (id) => {
        try {
            const token = await getToken();
            await markSubmissionPaid(id, token);
            showToast("✅ Marqué payé !");
            fetchPayouts();
        } catch (err) { showToast("❌ " + (err.response?.data?.error || err.message), "error"); }
    };

    // ── Campaigns CRUD ──
    const openCreate = () => { setEditingId(null); setForm(emptyCampaignForm); setShowForm(true); };
    const openEdit = (c) => {
        setEditingId(c.id);
        setForm({
            title: c.title, description: c.description || "", creative_url: c.creative_url,
            rate_per_view: c.rate_per_view, min_views: c.min_views ?? "", max_reward_amount: c.max_reward_amount ?? "",
            max_distributors: c.max_distributors ?? "",
            start_date: c.start_date?.slice(0, 10), end_date: c.end_date?.slice(0, 10)
        });
        setShowForm(true);
    };

    const handleCreativeUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingCreative(true);
        try {
            const token = await getToken();
            const url = await uploadSingleImage(file, token);
            setForm(f => ({ ...f, creative_url: url }));
        } catch (err) {
            showToast("Échec de l'upload du visuel", "error");
        } finally {
            setUploadingCreative(false);
        }
    };

    const handleSaveCampaign = async () => {
        if (!form.title.trim() || !form.creative_url || !form.rate_per_view || !form.start_date || !form.end_date) {
            return showToast("Remplissez tous les champs obligatoires", "error");
        }
        setSaving(true);
        try {
            const token = await getToken();
            const payload = {
                title: form.title.trim(),
                description: form.description || null,
                creative_url: form.creative_url,
                rate_per_view: Number(form.rate_per_view),
                min_views: form.min_views ? Number(form.min_views) : null,
                max_reward_amount: form.max_reward_amount ? Number(form.max_reward_amount) : null,
                max_distributors: form.max_distributors ? Number(form.max_distributors) : null,
                start_date: form.start_date,
                end_date: form.end_date
            };
            if (editingId) {
                await updateCampaign(editingId, payload, token);
                showToast("✅ Campagne mise à jour !");
            } else {
                await createCampaign(payload, token);
                showToast("✅ Campagne créée !");
            }
            setShowForm(false);
            fetchCampaigns();
        } catch (err) {
            showToast("❌ " + (err.response?.data?.error || err.message), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (c) => {
        try {
            const token = await getToken();
            await updateCampaign(c.id, { status: c.status === "active" ? "paused" : "active" }, token);
            fetchCampaigns();
        } catch (err) { showToast("❌ " + (err.response?.data?.error || err.message), "error"); }
    };

    const handleDeleteCampaign = async (c) => {
        if (!window.confirm(`Supprimer la campagne "${c.title}" ?`)) return;
        try {
            const token = await getToken();
            const res = await deleteCampaign(c.id, token);
            showToast(res.message?.includes("terminée") ? "Campagne déjà réclamée : marquée terminée." : "Campagne supprimée.");
            fetchCampaigns();
        } catch (err) { showToast("❌ " + (err.response?.data?.error || err.message), "error"); }
    };

    // ── Moderation ──
    const openDetail = async (submission) => {
        setLoadingDetail(true);
        setDetail({ submission, history: [] });
        setRejectReason("");
        setViewsInput(submission.views_reported ?? "");
        try {
            const token = await getToken();
            const data = await getSubmissionDetail(submission.id, token);
            setDetail(data);
            setViewsInput(data.submission?.views_reported ?? "");
        } catch (err) { showToast("Erreur de chargement du détail", "error"); }
        finally { setLoadingDetail(false); }
    };

    const handleApprove = async (id) => {
        try {
            const token = await getToken();
            await approveSubmission(id, viewsInput !== "" ? Number(viewsInput) : undefined, token);
            showToast("✅ Soumission validée !");
            setDetail(null);
            fetchQueue();
        } catch (err) { showToast("❌ " + (err.response?.data?.error || err.message), "error"); }
    };

    const handleReject = async (id) => {
        try {
            const token = await getToken();
            await rejectSubmission(id, rejectReason || "Non conforme", token);
            showToast("Soumission rejetée.");
            setDetail(null);
            fetchQueue();
        } catch (err) { showToast("❌ " + (err.response?.data?.error || err.message), "error"); }
    };

    const handleLiveCheck = async (id) => {
        try {
            const token = await getToken();
            await requestLiveCheck(id, token);
            showToast("Vérification live demandée au distributeur.");
            setDetail(null);
            fetchQueue();
        } catch (err) { showToast("❌ " + (err.response?.data?.error || err.message), "error"); }
    };

    // ── Distributors ──
    const handleBan = async (d) => {
        const reason = window.prompt(`Motif du bannissement de ce distributeur :`, "Fraude détectée (captures dupliquées)");
        if (reason === null) return;
        try {
            const token = await getToken();
            await banDistributor(d.id, reason, token);
            showToast("Distributeur banni.");
            fetchDistributors();
        } catch (err) { showToast("❌ " + (err.response?.data?.error || err.message), "error"); }
    };
    const handleUnban = async (d) => {
        try {
            const token = await getToken();
            await unbanDistributor(d.id, token);
            showToast("Distributeur réactivé.");
            fetchDistributors();
        } catch (err) { showToast("❌ " + (err.response?.data?.error || err.message), "error"); }
    };

    const q = globalSearchQuery.trim().toLowerCase();
    const filteredCampaigns = useMemo(() => !q ? campaigns : campaigns.filter(c => c.title.toLowerCase().includes(q)), [campaigns, q]);
    const filteredDistributors = useMemo(() => !q ? distributors : distributors.filter(d =>
        d.user?.fullname?.toLowerCase().includes(q) || d.verified_phone?.includes(q)
    ), [distributors, q]);

    const fieldClass = "w-full px-4 py-2.5 bg-base-100 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";
    const labelClass = "text-xs font-bold text-gray-500";

    return (
        <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                        <Megaphone size={20} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Distribution WhatsApp Status</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Campagnes publicitaires diffusées par les distributeurs, avec anti-fraude intégré.</p>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold border ${toast.type === "error" ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
                        {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-100">
                {TABS.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`px-4 py-2.5 text-sm font-bold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${tab === t.key ? "border-primary text-primary" : "border-transparent text-gray-400 hover:text-gray-700"}`}>
                        <t.icon size={14} /> {t.label}
                        {t.key === "queue" && queue.length > 0 && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-primary text-white">{queue.length}</span>}
                    </button>
                ))}
                <button onClick={() => { if (tab === "campaigns") fetchCampaigns(); if (tab === "queue") fetchQueue(); if (tab === "payouts") fetchPayouts(); if (tab === "distributors") fetchDistributors(); }}
                    className="ml-auto p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                    <RefreshCw size={16} />
                </button>
            </div>

            {/* ── Campaigns tab ── */}
            {tab === "campaigns" && (
                <div className="space-y-4">
                    <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
                        <Plus size={16} /> Créer une campagne
                    </button>
                    {loadingCampaigns ? (
                        <div className="py-12 text-center text-gray-400 text-sm">Chargement…</div>
                    ) : filteredCampaigns.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 text-sm bg-base-100 rounded-3xl border border-gray-100">Aucune campagne pour le moment.</div>
                    ) : (
                        <div className="bg-base-100 rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                            {filteredCampaigns.map(c => (
                                <div key={c.id} className="flex items-center gap-4 px-5 py-4 flex-wrap">
                                    <img src={c.creative_url} alt="" className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0" />
                                    <div className="flex-1 min-w-[200px]">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-black text-sm text-gray-900">{c.title}</p>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${c.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : c.status === "paused" ? "bg-gray-100 text-gray-500 border-gray-200" : "bg-blue-50 text-blue-600 border-blue-100"}`}>
                                                {c.status === "active" ? "Active" : c.status === "paused" ? "En pause" : "Terminée"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {Number(c.rate_per_view).toLocaleString("fr-FR")} F / vue{c.max_reward_amount ? ` (plafond ${Number(c.max_reward_amount).toLocaleString("fr-FR")} F)` : ""}
                                            {c.min_views ? ` · min. ${c.min_views} vues` : ""} · {c.claimed_count}{c.max_distributors ? `/${c.max_distributors}` : ""} réclamées ·{" "}
                                            {new Date(c.start_date).toLocaleDateString("fr-FR")} → {new Date(c.end_date).toLocaleDateString("fr-FR")}
                                        </p>
                                        {c.stats && (
                                            <p className="text-[10px] text-gray-400 mt-0.5">
                                                ✅ {c.stats.verified} validées · 💸 {c.stats.paid} payées {c.stats.flagged > 0 && <span className="text-rose-500 font-bold">· ⚠️ {c.stats.flagged} flaguée(s)</span>}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button onClick={() => handleToggleStatus(c)} className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                                            {c.status === "active" ? "Mettre en pause" : "Activer"}
                                        </button>
                                        <button onClick={() => openEdit(c)} className="px-3 py-1.5 rounded-xl text-xs font-bold text-primary hover:bg-primary/10 transition-colors">Modifier</button>
                                        <button onClick={() => handleDeleteCampaign(c)} className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={15} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Moderation tab ── */}
            {tab === "queue" && (
                <div className="space-y-4">
                    {loadingQueue ? (
                        <div className="py-12 text-center text-gray-400 text-sm">Chargement…</div>
                    ) : queue.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 text-sm bg-base-100 rounded-3xl border border-gray-100">File de modération vide 🎉</div>
                    ) : (
                        <div className="bg-base-100 rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                            {queue.map(s => (
                                <button key={s.id} onClick={() => openDetail(s)} className="w-full text-left flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors flex-wrap">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${s.flagged ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-primary/10 text-primary border-primary/10"}`}>
                                        {s.flagged ? <ShieldAlert size={18} /> : <Clock size={18} />}
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-black text-sm text-gray-900">{s.campaign?.title}</p>
                                            {s.flagged && <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100">Flaguée</span>}
                                            {s.status === "live_check" && <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">Vérif. live demandée</span>}
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {s.distributor?.user?.fullname || s.distributor?.verified_phone || "Distributeur"} · confiance : {TRUST_META[s.distributor?.trust_level]?.label}
                                        </p>
                                    </div>
                                    <Eye size={16} className="text-gray-300 shrink-0" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Payouts tab ── */}
            {tab === "payouts" && (
                <div className="space-y-4">
                    {loadingPayouts ? (
                        <div className="py-12 text-center text-gray-400 text-sm">Chargement…</div>
                    ) : payouts.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 text-sm bg-base-100 rounded-3xl border border-gray-100">Aucun paiement en attente.</div>
                    ) : (
                        <div className="bg-base-100 rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                            {payouts.map(s => {
                                const eligible = !s.payout_eligible_at || new Date(s.payout_eligible_at) <= new Date();
                                return (
                                    <div key={s.id} className="flex items-center gap-4 px-5 py-4 flex-wrap">
                                        <div className="flex-1 min-w-[200px]">
                                            <p className="font-black text-sm text-gray-900">{s.distributor?.user?.fullname || s.distributor?.verified_phone}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {s.campaign?.title} · MoMo {s.distributor?.momo_number || s.distributor?.verified_phone || "—"} ·{" "}
                                                <span className="font-black text-primary">{Number(s.reward_amount).toLocaleString("fr-FR")} F</span>
                                            </p>
                                            {!eligible && (
                                                <p className="text-[10px] text-amber-500 font-bold mt-0.5">
                                                    ⏳ Éligible le {new Date(s.payout_eligible_at).toLocaleString("fr-FR")} (délai anti-fraude nouveau compte)
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleMarkPaid(s.id)}
                                            disabled={!eligible}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                                        >
                                            <Wallet size={14} /> Marquer payé
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── Distributors tab ── */}
            {tab === "distributors" && (
                <div className="space-y-4">
                    {loadingDistributors ? (
                        <div className="py-12 text-center text-gray-400 text-sm">Chargement…</div>
                    ) : filteredDistributors.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 text-sm bg-base-100 rounded-3xl border border-gray-100">Aucun distributeur inscrit.</div>
                    ) : (
                        <div className="bg-base-100 rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                            {filteredDistributors.map(d => {
                                const meta = TRUST_META[d.trust_level] || TRUST_META.new;
                                return (
                                    <div key={d.id} className="flex items-center gap-4 px-5 py-4 flex-wrap">
                                        <div className="flex-1 min-w-[200px]">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-black text-sm text-gray-900">{d.user?.fullname || "Sans nom"}</p>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${meta.cls}`}>{meta.label}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {d.verified_phone || "Numéro non vérifié"} · {d.total_submissions} soumissions · {d.total_verified} validées ·{" "}
                                                {Number(d.total_paid_amount || 0).toLocaleString("fr-FR")} F payés
                                                {d.flag_count > 0 && <span className="text-rose-500 font-bold"> · {d.flag_count} flag(s)</span>}
                                            </p>
                                            {d.ban_reason && <p className="text-[10px] text-rose-500 mt-0.5">Motif : {d.ban_reason}</p>}
                                        </div>
                                        {d.trust_level === "banned" ? (
                                            <button onClick={() => handleUnban(d)} className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition-colors">Réactiver</button>
                                        ) : (
                                            <button onClick={() => handleBan(d)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"><Ban size={13} /> Bannir</button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── Modal: Create/Edit campaign ── */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-base-100 w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-4 my-8">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-gray-900">{editingId ? "Modifier la campagne" : "Créer une campagne"}</h3>
                                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelClass}>Visuel à publier en Statut</label>
                                {form.creative_url ? (
                                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-gray-200">
                                        <img src={form.creative_url} alt="" className="w-full h-full object-cover" />
                                        <button onClick={() => setForm(f => ({ ...f, creative_url: "" }))} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white"><X size={14} /></button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center gap-2 w-full aspect-video rounded-2xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-primary/40 transition-colors text-gray-400">
                                        {uploadingCreative ? <span className="loading loading-spinner loading-sm"></span> : <><ImageIcon size={24} /><span className="text-xs font-bold">Choisir une image</span></>}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleCreativeUpload} disabled={uploadingCreative} />
                                    </label>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelClass}>Titre</label>
                                <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={fieldClass} placeholder="Ex : Promo rentrée Vtout" />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelClass}>Description (optionnel, pour vos notes)</label>
                                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={fieldClass} rows={2} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className={labelClass}>Taux par vue (FCFA)</label>
                                    <input type="number" min={1} step="0.01" value={form.rate_per_view} onChange={e => setForm(f => ({ ...f, rate_per_view: e.target.value }))} className={fieldClass} placeholder="Ex : 5" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelClass}>Plafond par soumission (optionnel)</label>
                                    <input type="number" min={1} value={form.max_reward_amount} onChange={e => setForm(f => ({ ...f, max_reward_amount: e.target.value }))} className={fieldClass} placeholder="Illimité" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelClass}>Vues minimum (optionnel)</label>
                                    <input type="number" min={1} value={form.min_views} onChange={e => setForm(f => ({ ...f, min_views: e.target.value }))} className={fieldClass} placeholder="Aucun minimum" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelClass}>Places (optionnel)</label>
                                    <input type="number" min={1} value={form.max_distributors} onChange={e => setForm(f => ({ ...f, max_distributors: e.target.value }))} className={fieldClass} placeholder="Illimité" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelClass}>Début (nouvelles réclamations)</label>
                                    <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className={fieldClass} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelClass}>Fin (nouvelles réclamations)</label>
                                    <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className={fieldClass} />
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 -mt-2">Ces dates ne fixent que la période où de nouveaux distributeurs peuvent rejoindre. Une fois réclamée, chaque soumission a toujours 24h pour être complétée (précoce + tardive), quelle que soit cette fenêtre.</p>

                            <button onClick={handleSaveCampaign} disabled={saving || uploadingCreative}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors">
                                <Save size={16} /> {saving ? "Enregistrement…" : editingId ? "Mettre à jour" : "Créer la campagne"}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Modal: Submission detail / moderation ── */}
            <AnimatePresence>
                {detail && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetail(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-base-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                                <h3 className="font-black text-gray-900 text-lg">{detail.submission?.campaign?.title || "Soumission"}</h3>
                                <button onClick={() => setDetail(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
                            </div>

                            {loadingDetail ? (
                                <div className="py-16 text-center text-gray-400 text-sm">Chargement…</div>
                            ) : (
                                <div className="overflow-y-auto px-6 py-5 space-y-5">
                                    {detail.submission?.flagged && (
                                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5">
                                            <ShieldAlert size={16} className="text-rose-500 shrink-0 mt-0.5" />
                                            <p className="text-xs font-bold text-rose-700">{detail.submission.flag_reason}</p>
                                        </div>
                                    )}

                                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-black text-indigo-700 uppercase tracking-widest">Vues déclarées par le distributeur</label>
                                            <span className="text-lg font-black text-indigo-700">{detail.submission?.views_reported ?? "—"}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-indigo-500">Vues retenues (corrigez si la capture ne correspond pas)</label>
                                            <input type="number" min={0} value={viewsInput} onChange={e => setViewsInput(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white border border-indigo-200 rounded-xl text-sm font-black text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-300" />
                                        </div>
                                        {detail.submission?.campaign?.rate_per_view && (
                                            <p className="text-xs font-bold text-indigo-600">
                                                Récompense estimée :{" "}
                                                {(() => {
                                                    const v = viewsInput !== "" ? Number(viewsInput) : 0;
                                                    let est = v * Number(detail.submission.campaign.rate_per_view);
                                                    if (detail.submission.campaign.max_reward_amount) est = Math.min(est, Number(detail.submission.campaign.max_reward_amount));
                                                    return est.toLocaleString("fr-FR");
                                                })()} F
                                                {detail.submission.campaign.min_views && Number(viewsInput || 0) < detail.submission.campaign.min_views && (
                                                    <span className="block text-rose-500 mt-1">⚠️ En dessous du minimum requis ({detail.submission.campaign.min_views} vues) — envisagez de rejeter.</span>
                                                )}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                        <div>
                                            <p className="font-black text-sm text-gray-900">{detail.submission?.distributor?.user?.fullname || "Distributeur"}</p>
                                            <p className="text-xs text-gray-400">{detail.submission?.distributor?.verified_phone} · {detail.submission?.distributor?.total_submissions} soumissions · {detail.submission?.distributor?.flag_count} flag(s)</p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${TRUST_META[detail.submission?.distributor?.trust_level]?.cls}`}>
                                            {TRUST_META[detail.submission?.distributor?.trust_level]?.label}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Capture précoce</p>
                                            {detail.submission?.screenshot_early_url ? <img src={detail.submission.screenshot_early_url} className="w-full rounded-xl border border-gray-200" /> : <div className="aspect-[9/16] bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 text-xs">Manquante</div>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Capture tardive</p>
                                            {detail.submission?.screenshot_late_url ? <img src={detail.submission.screenshot_late_url} className="w-full rounded-xl border border-gray-200" /> : <div className="aspect-[9/16] bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 text-xs">Manquante</div>}
                                        </div>
                                        {detail.submission?.live_check_screenshot_url && (
                                            <div className="col-span-2 space-y-1.5">
                                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Capture de vérification live</p>
                                                <img src={detail.submission.live_check_screenshot_url} className="w-full max-w-xs rounded-xl border border-gray-200" />
                                            </div>
                                        )}
                                    </div>

                                    {detail.history?.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Historique de ce distributeur</p>
                                            <div className="divide-y divide-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
                                                {detail.history.map(h => (
                                                    <div key={h.id} className="flex items-center justify-between px-4 py-2.5 text-xs">
                                                        <span className="font-bold text-gray-700">{h.campaign?.title}</span>
                                                        <span className={`font-black ${h.flagged ? "text-rose-500" : "text-gray-400"}`}>{h.status}{h.flagged ? " ⚠️" : ""}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className={labelClass}>Motif de rejet (si applicable)</label>
                                        <input type="text" value={rejectReason} onChange={e => setRejectReason(e.target.value)} className={fieldClass} placeholder="Ex : captures dupliquées" />
                                    </div>
                                </div>
                            )}

                            <div className="px-6 py-4 border-t border-gray-100 shrink-0 grid grid-cols-3 gap-2">
                                <button onClick={() => handleLiveCheck(detail.submission.id)} className="flex items-center justify-center gap-1.5 py-3 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors">
                                    <Clock size={14} /> Vérif. live
                                </button>
                                <button onClick={() => handleReject(detail.submission.id)} className="flex items-center justify-center gap-1.5 py-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors">
                                    <X size={14} /> Rejeter
                                </button>
                                <button onClick={() => handleApprove(detail.submission.id)} className="flex items-center justify-center gap-1.5 py-3 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors">
                                    <CheckCircle size={14} /> Valider
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
