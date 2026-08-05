import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../../../lib/AuthHooks";
import {
    Ticket, Plus, X, Save, RefreshCw, AlertCircle, CheckCircle,
    Trash2, Power, Search, Percent, Tag, Truck, Gift, UserCheck, History, Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    getAllCoupons, createCoupon, updateCoupon, toggleCoupon, deleteCoupon, getCouponUsages
} from "../../../services/couponService";
import { getCategories } from "../../../services/productService";
import { getAllProfiles } from "../../../services/userService";

const TYPE_META = {
    percentage: { label: "Réduction %", icon: Percent, color: "text-blue-600 bg-blue-50 border-blue-100" },
    fixed_amount: { label: "Montant fixe", icon: Tag, color: "text-amber-600 bg-amber-50 border-amber-100" },
    free_shipping: { label: "Livraison gratuite", icon: Truck, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
};

// Section 1 du formulaire — QUOI : la nature de la réduction.
const REWARD_OPTIONS = [
    { key: "percentage", label: "Réduction %", icon: Percent, desc: "Ex : -10% sur la commande" },
    { key: "fixed_amount", label: "Montant fixe", icon: Tag, desc: "Ex : -1000 FCFA" },
    { key: "free_shipping", label: "Livraison gratuite", icon: Truck, desc: "Annule les frais de livraison" },
];

// Section 2 du formulaire — QUI : les 4 façons de restreindre l'usage
// (correspond aux types 1 bienvenue / 7 catégorie / 8 personnel du cahier des charges).
const RESTRICTION_OPTIONS = [
    { key: "none", label: "Tous les clients", icon: Users, desc: "Aucune restriction" },
    { key: "first_order", label: "1ère commande", icon: Gift, desc: "Nouveaux clients (bienvenue)" },
    { key: "category", label: "Une catégorie", icon: Tag, desc: "Articles d'une catégorie" },
    { key: "personal", label: "Un client précis", icon: UserCheck, desc: "Code personnel" },
];

const emptyForm = {
    code: "",
    discount_type: "percentage",
    discount_value: "",
    max_discount_amount: "",
    min_order_amount: "0",
    category_id: "",
    assigned_user_id: "",
    first_order_only: false,
    start_date: "",
    end_date: "",
    usage_limit: "",
};

const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

const restrictionOf = (f) => f.first_order_only ? "first_order" : f.category_id ? "category" : f.assigned_user_id ? "personal" : "none";

export default function CouponManager({ globalSearchQuery = "" }) {
    const { getToken } = useAuth();
    const [coupons, setCoupons] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [restrictionType, setRestrictionType] = useState("none");
    const [saving, setSaving] = useState(false);

    const [customerQuery, setCustomerQuery] = useState("");
    const [customers, setCustomers] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    const [usagesFor, setUsagesFor] = useState(null); // coupon object
    const [usages, setUsages] = useState([]);
    const [loadingUsages, setLoadingUsages] = useState(false);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const [couponsData, categoriesData] = await Promise.all([
                getAllCoupons(token),
                getCategories().catch(() => []),
            ]);
            setCoupons(couponsData || []);
            setCategories(categoriesData || []);
        } catch (err) {
            showToast("Erreur de chargement : " + (err.response?.data?.error || err.message), "error");
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    useEffect(() => {
        if (!showForm || restrictionType !== "personal") return;
        const q = customerQuery.trim();
        if (q.length < 2) { setCustomers([]); return; }
        const timeout = setTimeout(async () => {
            setLoadingCustomers(true);
            try {
                const token = await getToken();
                const all = await getAllProfiles(token);
                const ql = q.toLowerCase();
                setCustomers((all || []).filter(p =>
                    p.fullname?.toLowerCase().includes(ql) ||
                    p.email?.toLowerCase().includes(ql) ||
                    p.phone?.includes(q)
                ).slice(0, 20));
            } catch (err) {
                // silent
            } finally {
                setLoadingCustomers(false);
            }
        }, 350);
        return () => clearTimeout(timeout);
    }, [customerQuery, showForm, restrictionType, getToken]);

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setRestrictionType("none");
        setCustomerQuery("");
        setCustomers([]);
        setShowForm(true);
    };

    const openEdit = (c) => {
        const nextForm = {
            code: c.code,
            discount_type: c.discount_type,
            discount_value: c.discount_value ?? "",
            max_discount_amount: c.max_discount_amount ?? "",
            min_order_amount: c.min_order_amount ?? "0",
            category_id: c.category_id ?? "",
            assigned_user_id: c.assigned_user_id ?? "",
            first_order_only: !!c.first_order_only,
            start_date: toInputDate(c.start_date),
            end_date: toInputDate(c.end_date),
            usage_limit: c.usage_limit ?? "",
        };
        setEditingId(c.id);
        setForm(nextForm);
        setRestrictionType(restrictionOf(nextForm));
        setCustomerQuery(c.assignedUser ? (c.assignedUser.fullname || c.assignedUser.email) : "");
        setCustomers([]);
        setShowForm(true);
    };

    // Les 4 options de la section "Qui peut l'utiliser ?" sont mutuellement
    // exclusives dans l'UI (même si le modèle autoriserait techniquement de
    // les combiner) — bien plus clair pour l'admin que 3 champs indépendants.
    const selectRestriction = (key) => {
        setRestrictionType(key);
        setForm(f => ({
            ...f,
            first_order_only: key === "first_order",
            category_id: key === "category" ? f.category_id : "",
            assigned_user_id: key === "personal" ? f.assigned_user_id : "",
        }));
        if (key !== "personal") { setCustomerQuery(""); setCustomers([]); }
    };

    const handleSave = async () => {
        if (!form.code.trim()) return showToast("Le code est obligatoire", "error");
        if (!form.start_date || !form.end_date) return showToast("Les dates sont obligatoires", "error");
        if (form.discount_type !== "free_shipping" && (!form.discount_value || Number(form.discount_value) <= 0)) {
            return showToast("La valeur de la réduction doit être supérieure à 0", "error");
        }
        if (restrictionType === "category" && !form.category_id) return showToast("Choisissez une catégorie", "error");
        if (restrictionType === "personal" && !form.assigned_user_id) return showToast("Choisissez un client", "error");

        const payload = {
            code: form.code.trim().toUpperCase(),
            discount_type: form.discount_type,
            discount_value: form.discount_type === "free_shipping" ? null : Number(form.discount_value),
            max_discount_amount: form.discount_type === "percentage" && form.max_discount_amount ? Number(form.max_discount_amount) : null,
            min_order_amount: Number(form.min_order_amount) || 0,
            category_id: form.category_id || null,
            assigned_user_id: form.assigned_user_id || null,
            first_order_only: !!form.first_order_only,
            start_date: form.start_date,
            end_date: form.end_date,
            usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        };

        setSaving(true);
        try {
            const token = await getToken();
            if (editingId) {
                await updateCoupon(editingId, payload, token);
                showToast("✅ Coupon mis à jour !");
            } else {
                await createCoupon(payload, token);
                showToast("✅ Coupon créé !");
            }
            setShowForm(false);
            fetchAll();
        } catch (err) {
            showToast("❌ " + (err.response?.data?.error || err.message), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (c) => {
        try {
            const token = await getToken();
            await toggleCoupon(c.id, token);
            fetchAll();
        } catch (err) {
            showToast("❌ " + (err.response?.data?.error || err.message), "error");
        }
    };

    const handleDelete = async (c) => {
        if (!window.confirm(`Supprimer le coupon "${c.code}" ?`)) return;
        try {
            const token = await getToken();
            const res = await deleteCoupon(c.id, token);
            showToast(res.message?.includes("désactivé") ? "Coupon déjà utilisé : désactivé." : "Coupon supprimé.");
            fetchAll();
        } catch (err) {
            showToast("❌ " + (err.response?.data?.error || err.message), "error");
        }
    };

    const openUsages = async (c) => {
        setUsagesFor(c);
        setLoadingUsages(true);
        try {
            const token = await getToken();
            const data = await getCouponUsages(c.id, token);
            setUsages(data || []);
        } catch (err) {
            showToast("Erreur de chargement de l'historique", "error");
        } finally {
            setLoadingUsages(false);
        }
    };

    const q = globalSearchQuery.trim().toLowerCase();
    const filteredCoupons = useMemo(() => {
        if (!q) return coupons;
        return coupons.filter(c => c.code.toLowerCase().includes(q));
    }, [coupons, q]);

    const valueLabel = (c) => {
        if (c.discount_type === "free_shipping") return "Livraison offerte";
        if (c.discount_type === "percentage") {
            const cap = c.max_discount_amount ? ` (max ${Number(c.max_discount_amount).toLocaleString("fr-FR")} F)` : "";
            return `-${c.discount_value}%${cap}`;
        }
        return `-${Number(c.discount_value).toLocaleString("fr-FR")} F`;
    };

    const fieldClass = "w-full px-4 py-2.5 bg-base-100 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";
    const labelClass = "text-xs font-bold text-gray-500";

    return (
        <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                        <Ticket size={20} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Codes Promo</h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Bienvenue, réduction %, livraison gratuite, catégorie, code personnel.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={16} /> Créer un coupon
                    </button>
                    <button
                        onClick={fetchAll}
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

            {/* List */}
            {loading ? (
                <div className="py-12 text-center text-gray-400 text-sm">Chargement…</div>
            ) : filteredCoupons.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm bg-base-100 rounded-3xl border border-gray-100">
                    Aucun coupon pour le moment. Créez-en un avec le bouton ci-dessus.
                </div>
            ) : (
                <div className="bg-base-100 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-50">
                        {filteredCoupons.map(c => {
                            const meta = TYPE_META[c.discount_type] || TYPE_META.percentage;
                            const Icon = meta.icon;
                            return (
                                <div key={c.id} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors flex-wrap">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${meta.color}`}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-black text-sm text-gray-900 tracking-wide">{c.code}</p>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${meta.color}`}>{meta.label}</span>
                                                {c.first_order_only && (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-purple-50 text-purple-600 border border-purple-100">Bienvenue</span>
                                                )}
                                                {c.category && (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100">{c.category.name}</span>
                                                )}
                                                {c.assignedUser && (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-pink-50 text-pink-600 border border-pink-100 flex items-center gap-1">
                                                        <UserCheck size={10} /> {c.assignedUser.fullname || c.assignedUser.email}
                                                    </span>
                                                )}
                                                {!c.active && (
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 border border-gray-200">Inactif</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {valueLabel(c)} · min {Number(c.min_order_amount || 0).toLocaleString("fr-FR")} F ·{" "}
                                                {new Date(c.start_date).toLocaleDateString("fr-FR")} → {new Date(c.end_date).toLocaleDateString("fr-FR")} ·{" "}
                                                {c.used_count || 0}{c.usage_limit ? `/${c.usage_limit}` : ""} utilisé{c.used_count > 1 ? "s" : ""}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button onClick={() => openUsages(c)} title="Historique d'utilisation" className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                                            <History size={15} />
                                        </button>
                                        <button onClick={() => handleToggle(c)} title={c.active ? "Désactiver" : "Activer"} className={`p-2 rounded-xl hover:bg-gray-100 transition-colors ${c.active ? "text-emerald-600" : "text-gray-400"}`}>
                                            <Power size={15} />
                                        </button>
                                        <button onClick={() => openEdit(c)} className="px-3 py-1.5 rounded-xl text-xs font-bold text-primary hover:bg-primary/10 transition-colors">
                                            Modifier
                                        </button>
                                        <button onClick={() => handleDelete(c)} title="Supprimer" className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Modal: Create/Edit */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowForm(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-base-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                                <div>
                                    <h3 className="font-black text-gray-900 text-lg">{editingId ? "Modifier le coupon" : "Créer un coupon"}</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">Trois étapes : la réduction, qui peut l'utiliser, et les conditions.</p>
                                </div>
                                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 shrink-0">
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Body (scrollable) */}
                            <div className="overflow-y-auto px-6 py-5 space-y-6">
                                {/* Code */}
                                <div className="space-y-1.5">
                                    <label className={labelClass}>Code du coupon</label>
                                    <input
                                        type="text"
                                        value={form.code}
                                        onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                                        placeholder="EX : BIENVENUE10"
                                        className="w-full px-4 py-3 bg-base-100 border-2 border-gray-200 rounded-xl text-base font-black uppercase tracking-[0.15em] text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                    />
                                </div>

                                {/* Section 1 — Réduction */}
                                <section className="space-y-3">
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px]">1</span>
                                        Type de réduction
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {REWARD_OPTIONS.map(opt => {
                                            const Icon = opt.icon;
                                            const active = form.discount_type === opt.key;
                                            return (
                                                <button
                                                    type="button"
                                                    key={opt.key}
                                                    onClick={() => setForm(f => ({ ...f, discount_type: opt.key }))}
                                                    className={`p-3 rounded-2xl border-2 text-left transition-all ${active ? "border-primary bg-primary/5" : "border-gray-100 hover:border-gray-200"}`}
                                                >
                                                    <Icon size={17} className={active ? "text-primary" : "text-gray-400"} />
                                                    <p className={`text-xs font-black mt-2 ${active ? "text-primary" : "text-gray-900"}`}>{opt.label}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{opt.desc}</p>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {form.discount_type !== "free_shipping" && (
                                        <div className="grid grid-cols-2 gap-3 pt-1">
                                            <div className="space-y-1.5">
                                                <label className={labelClass}>
                                                    Valeur {form.discount_type === "percentage" ? "(%)" : "(FCFA)"}
                                                </label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={form.discount_value}
                                                    onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))}
                                                    className={fieldClass}
                                                />
                                            </div>
                                            {form.discount_type === "percentage" && (
                                                <div className="space-y-1.5">
                                                    <label className={labelClass}>Plafond (FCFA, optionnel)</label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={form.max_discount_amount}
                                                        onChange={e => setForm(f => ({ ...f, max_discount_amount: e.target.value }))}
                                                        placeholder="Illimité"
                                                        className={fieldClass}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </section>

                                <div className="h-px bg-gray-100" />

                                {/* Section 2 — Restriction (qui peut l'utiliser) */}
                                <section className="space-y-3">
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px]">2</span>
                                        Qui peut l'utiliser ?
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {RESTRICTION_OPTIONS.map(opt => {
                                            const Icon = opt.icon;
                                            const active = restrictionType === opt.key;
                                            return (
                                                <button
                                                    type="button"
                                                    key={opt.key}
                                                    onClick={() => selectRestriction(opt.key)}
                                                    className={`p-3 rounded-2xl border-2 text-left transition-all ${active ? "border-primary bg-primary/5" : "border-gray-100 hover:border-gray-200"}`}
                                                >
                                                    <Icon size={16} className={active ? "text-primary" : "text-gray-400"} />
                                                    <p className={`text-[11px] font-black mt-1.5 ${active ? "text-primary" : "text-gray-900"}`}>{opt.label}</p>
                                                    <p className="text-[9px] text-gray-400 mt-0.5 leading-snug">{opt.desc}</p>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {restrictionType === "category" && (
                                        <select
                                            value={form.category_id}
                                            onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                                            className={fieldClass}
                                        >
                                            <option value="">Choisir une catégorie…</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    )}

                                    {restrictionType === "personal" && (
                                        <div className="space-y-1.5 relative">
                                            {form.assigned_user_id ? (
                                                <div className="flex items-center justify-between px-4 py-2.5 bg-pink-50 border border-pink-100 rounded-xl">
                                                    <span className="text-sm font-bold text-gray-900 truncate">{customerQuery}</span>
                                                    <button onClick={() => { setForm(f => ({ ...f, assigned_user_id: "" })); setCustomerQuery(""); }} className="text-xs font-bold text-pink-600 hover:underline shrink-0 ml-2">Retirer</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="relative">
                                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                                                        <input
                                                            type="text"
                                                            value={customerQuery}
                                                            onChange={e => setCustomerQuery(e.target.value)}
                                                            placeholder="Rechercher un client (nom, email, tél)…"
                                                            className="w-full pl-9 pr-3 py-2.5 bg-base-100 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                                        />
                                                    </div>
                                                    {customerQuery.trim().length >= 2 && (
                                                        <div className="max-h-36 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                                                            {loadingCustomers ? (
                                                                <div className="py-4 text-center text-xs text-gray-400">Recherche…</div>
                                                            ) : customers.length === 0 ? (
                                                                <div className="py-4 text-center text-xs text-gray-400">Aucun client trouvé.</div>
                                                            ) : (
                                                                customers.map(u => (
                                                                    <button
                                                                        key={u.id}
                                                                        onClick={() => { setForm(f => ({ ...f, assigned_user_id: u.id })); setCustomerQuery(u.fullname || u.email); }}
                                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                                                                    >
                                                                        <p className="font-bold text-gray-900 truncate">{u.fullname || "Sans nom"}</p>
                                                                        <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                                                                    </button>
                                                                ))
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </section>

                                <div className="h-px bg-gray-100" />

                                {/* Section 3 — Conditions */}
                                <section className="space-y-3">
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px]">3</span>
                                        Conditions d'utilisation
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className={labelClass}>Montant minimum (FCFA)</label>
                                            <input
                                                type="number"
                                                min={0}
                                                value={form.min_order_amount}
                                                onChange={e => setForm(f => ({ ...f, min_order_amount: e.target.value }))}
                                                className={fieldClass}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className={labelClass}>Limite d'utilisation</label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={form.usage_limit}
                                                onChange={e => setForm(f => ({ ...f, usage_limit: e.target.value }))}
                                                placeholder="Illimité"
                                                className={fieldClass}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className={labelClass}>Date de début</label>
                                            <input
                                                type="date"
                                                value={form.start_date}
                                                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                                                className={fieldClass}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className={labelClass}>Date de fin</label>
                                            <input
                                                type="date"
                                                value={form.end_date}
                                                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                                                className={fieldClass}
                                            />
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-100 shrink-0">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                                >
                                    <Save size={16} /> {saving ? "Enregistrement…" : editingId ? "Mettre à jour" : "Créer le coupon"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal: Usage history */}
            <AnimatePresence>
                {usagesFor && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setUsagesFor(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-base-100 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-gray-900">Utilisations — {usagesFor.code}</h3>
                                <button onClick={() => setUsagesFor(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                                {loadingUsages ? (
                                    <div className="py-8 text-center text-gray-400 text-sm">Chargement…</div>
                                ) : usages.length === 0 ? (
                                    <div className="py-8 text-center text-gray-400 text-sm">Pas encore utilisé.</div>
                                ) : (
                                    usages.map(u => (
                                        <div key={u.id} className="flex items-center justify-between py-2.5">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{u.user?.fullname || u.user?.email || "Invité"}</p>
                                                <p className="text-[10px] text-gray-400">{new Date(u.created_at).toLocaleDateString("fr-FR")}</p>
                                            </div>
                                            <span className="text-sm font-bold text-emerald-600 shrink-0">-{Number(u.discount_amount).toLocaleString("fr-FR")} F</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
