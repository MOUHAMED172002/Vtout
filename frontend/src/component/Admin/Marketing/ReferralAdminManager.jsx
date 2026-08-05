import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../../../lib/AuthHooks";
import { Share2, Save, RefreshCw, AlertCircle, CheckCircle, Users, Gift, Clock, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getReferralSettings, updateReferralSettings, getAllReferrals, getReferralStats } from "../../../services/referralService";

export default function ReferralAdminManager({ globalSearchQuery = "" }) {
    const { getToken } = useAuth();
    const [settings, setSettings] = useState(null);
    const [form, setForm] = useState({ referrerReward: "", referredReward: "", minOrderAmount: "", validityDays: "" });
    const [stats, setStats] = useState(null);
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const [s, st, list] = await Promise.all([
                getReferralSettings(token),
                getReferralStats(token),
                getAllReferrals(token),
            ]);
            setSettings(s);
            setForm({
                referrerReward: String(s.referrerReward ?? 0),
                referredReward: String(s.referredReward ?? 0),
                minOrderAmount: String(s.minOrderAmount ?? 0),
                validityDays: String(s.validityDays ?? 60),
            });
            setStats(st);
            setReferrals(list || []);
        } catch (err) {
            showToast("Erreur de chargement : " + (err.response?.data?.error || err.message), "error");
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const isActive = settings && (Number(settings.referrerReward) > 0 || Number(settings.referredReward) > 0);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = await getToken();
            const updated = await updateReferralSettings({
                referrerReward: Number(form.referrerReward) || 0,
                referredReward: Number(form.referredReward) || 0,
                minOrderAmount: Number(form.minOrderAmount) || 0,
                validityDays: Number(form.validityDays) || 60,
            }, token);
            setSettings(updated);
            showToast("✅ Paramètres de parrainage enregistrés !");
            fetchAll();
        } catch (err) {
            showToast("❌ " + (err.response?.data?.error || err.message), "error");
        } finally {
            setSaving(false);
        }
    };

    const q = globalSearchQuery.trim().toLowerCase();
    const filteredReferrals = useMemo(() => {
        if (!q) return referrals;
        return referrals.filter(r =>
            r.referrer?.fullname?.toLowerCase().includes(q) || r.referrer?.email?.toLowerCase().includes(q) ||
            r.referred?.fullname?.toLowerCase().includes(q) || r.referred?.email?.toLowerCase().includes(q)
        );
    }, [referrals, q]);

    return (
        <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                        <Share2 size={20} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                            Programme de Parrainage
                            {isActive ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">Actif</span>
                            ) : (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 border border-gray-200">Inactif</span>
                            )}
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Tant que les récompenses sont à 0, le parrainage ne génère aucun coupon.
                        </p>
                    </div>
                </div>
                <button onClick={fetchAll} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors" title="Recharger">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold border ${
                            toast.type === "error" ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}
                    >
                        {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: "Filleuls invités", value: stats.totalInvites, icon: Users, color: "text-blue-600 bg-blue-50" },
                        { label: "Parrainages récompensés", value: stats.totalRewarded, icon: Gift, color: "text-emerald-600 bg-emerald-50" },
                        { label: "En attente", value: stats.totalPending, icon: Clock, color: "text-amber-600 bg-amber-50" },
                        { label: "Coupons distribués (parrains)", value: `${Number(stats.estimatedPayout || 0).toLocaleString("fr-FR")} F`, icon: Wallet, color: "text-purple-600 bg-purple-50" },
                    ].map((c, i) => (
                        <div key={i} className="bg-base-100 rounded-2xl border border-gray-100 shadow-sm p-4">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${c.color}`}>
                                <c.icon size={15} />
                            </div>
                            <p className="text-xl font-black text-gray-900">{c.value}</p>
                            <p className="text-[11px] text-gray-400 font-semibold">{c.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Settings */}
            <div className="bg-base-100 rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h3 className="font-black text-gray-900">Réglages des récompenses</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500">Récompense du parrain (FCFA)</label>
                        <input
                            type="number" min={0}
                            value={form.referrerReward}
                            onChange={e => setForm(f => ({ ...f, referrerReward: e.target.value }))}
                            placeholder="0 = désactivé"
                            className="w-full px-4 py-2.5 bg-base-100 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                        <p className="text-[10px] text-gray-400">Offert au parrain dès la 1ère commande confirmée de son filleul.</p>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500">Récompense du filleul (FCFA)</label>
                        <input
                            type="number" min={0}
                            value={form.referredReward}
                            onChange={e => setForm(f => ({ ...f, referredReward: e.target.value }))}
                            placeholder="0 = désactivé"
                            className="w-full px-4 py-2.5 bg-base-100 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                        <p className="text-[10px] text-gray-400">Offert au filleul dès son inscription avec un code de parrainage.</p>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500">Montant minimum de commande (FCFA)</label>
                        <input
                            type="number" min={0}
                            value={form.minOrderAmount}
                            onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-base-100 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500">Validité des coupons (jours)</label>
                        <input
                            type="number" min={1}
                            value={form.validityDays}
                            onChange={e => setForm(f => ({ ...f, validityDays: e.target.value }))}
                            className="w-full px-4 py-2.5 bg-base-100 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                    <Save size={15} /> {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
            </div>

            {/* Referrals list */}
            <div className="bg-base-100 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-50">
                    <h3 className="font-black text-gray-900 text-sm">Filleuls ({filteredReferrals.length})</h3>
                </div>
                {loading ? (
                    <div className="py-12 text-center text-gray-400 text-sm">Chargement…</div>
                ) : filteredReferrals.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-sm">Aucun parrainage pour le moment.</div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filteredReferrals.map(r => (
                            <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-3.5 flex-wrap">
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">
                                        {r.referrer?.fullname || r.referrer?.email || "—"} <span className="text-gray-300 font-normal">→</span> {r.referred?.fullname || r.referred?.email || "—"}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        {new Date(r.created_at).toLocaleDateString("fr-FR")}
                                        {r.referrer_coupon_code && ` · Coupon parrain: ${r.referrer_coupon_code}`}
                                        {r.referred_coupon_code && ` · Coupon filleul: ${r.referred_coupon_code}`}
                                    </p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shrink-0 ${
                                    r.status === "rewarded"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                        : "bg-amber-50 text-amber-700 border-amber-100"
                                }`}>
                                    {r.status === "rewarded" ? "Récompensé" : "En attente"}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
