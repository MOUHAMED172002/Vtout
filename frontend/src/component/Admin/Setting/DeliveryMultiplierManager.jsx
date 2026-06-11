import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../../lib/AuthHooks";
import { getMultiplierTiers, updateMultiplierTiers } from "../../../services/deliveryMultiplierService";
import { Plus, Trash2, Save, RefreshCw, Package, ChevronRight, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_MULTIPLIER_TIERS = [
    { min: 0,  max: 5,    multiplier: 1   },
    { min: 5,  max: 10,   multiplier: 1.5 },
    { min: 10, max: null, multiplier: 2   },
];

export default function DeliveryMultiplierManager() {
    const { getToken } = useAuth();
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [localToast, setLocalToast] = useState(null);
    const [simQty, setSimQty] = useState("");

    const showToast = (msg, type = "success") => {
        setLocalToast({ msg, type });
        setTimeout(() => setLocalToast(null), 3500);
    };

    const fetchTiers = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const data = await getMultiplierTiers(token);
            setTiers(data || DEFAULT_MULTIPLIER_TIERS);
        } catch {
            setTiers(DEFAULT_MULTIPLIER_TIERS);
            showToast("Impossible de charger les coefficients. Valeurs par défaut affichées.", "error");
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => { fetchTiers(); }, [fetchTiers]);

    const handleChange = (index, field, value) => {
        setTiers(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value === "" ? "" : Number(value) };
            return copy;
        });
    };

    const addTier = () => {
        setTiers(prev => {
            const last = prev[prev.length - 1];
            const newMin = last ? (last.max ?? last.min + 5) : 0;
            return [...prev, { min: newMin, max: null, multiplier: 1 }];
        });
    };

    const removeTier = (index) => {
        if (tiers.length <= 1) return;
        setTiers(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = await getToken();
            const payload = tiers.map((t, i) => ({
                min: Number(t.min) || 0,
                max: i === tiers.length - 1 ? null : (Number(t.max) || null),
                multiplier: Number(t.multiplier) || 1,
            }));
            await updateMultiplierTiers(payload, token);
            showToast("✅ Coefficients sauvegardés avec succès !");
            fetchTiers();
        } catch (err) {
            showToast("❌ Erreur lors de la sauvegarde : " + (err.response?.data?.error || err.message), "error");
        } finally {
            setSaving(false);
        }
    };

    // Live simulation: find the matching tier for the entered quantity
    const getSimResult = () => {
        const qty = Number(simQty);
        if (!simQty || qty <= 0 || tiers.length === 0) return null;
        for (let i = 0; i < tiers.length; i++) {
            const t = tiers[i];
            const isLast = i === tiers.length - 1;
            const max = isLast ? Infinity : (t.max ?? Infinity);
            if (qty >= t.min && qty < max) {
                return { qty, multiplier: t.multiplier };
            }
        }
        return { qty, multiplier: tiers[tiers.length - 1]?.multiplier ?? 1 };
    };

    const simResult = getSimResult();

    return (
        <div className="max-w-3xl mx-auto space-y-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Coefficient Livreur par Quantité</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Définissez le coefficient appliqué au frais de base selon la quantité totale d'articles livrés.
                    </p>
                </div>
                <button
                    onClick={fetchTiers}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                    title="Recharger"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Toast */}
            <AnimatePresence>
                {localToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold border ${
                            localToast.type === "error"
                                ? "bg-red-50 text-red-700 border-red-100"
                                : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}
                    >
                        {localToast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                        {localToast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Info box */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-800 font-semibold space-y-1">
                <p className="font-black text-amber-900 text-sm mb-1 flex items-center gap-2">
                    <Package size={15} /> Comment fonctionne ce coefficient ?
                </p>
                <p>Chaque produit embarque un frais de livraison dans son prix. Pour N articles, au lieu de payer N × frais, le livreur reçoit :</p>
                <p className="font-black mt-1">Frais unitaire (1 article) × Coefficient(N articles total)</p>
                <p className="text-amber-700 mt-1">Le surplus restant est enregistré comme gain <strong>Marketing</strong> pour l'admin.</p>
            </div>

            {/* Tiers Table */}
            <div className="bg-base-100 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-0 text-[11px] font-black text-gray-400 uppercase tracking-widest px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <span>Qté min (articles)</span>
                    <span>Qté max (articles)</span>
                    <span>Coefficient ×</span>
                    <span></span>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-gray-400 text-sm">Chargement…</div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {tiers.map((tier, i) => (
                            <motion.div
                                key={i}
                                layout
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors"
                            >
                                {/* Min */}
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={tier.min}
                                        onChange={e => handleChange(i, "min", e.target.value)}
                                        className="w-full bg-base-100 border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                        min={0}
                                    />
                                </div>

                                {/* Max */}
                                <div className="relative">
                                    {i === tiers.length - 1 ? (
                                        <div className="w-full border border-dashed border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-400 font-semibold bg-gray-50">
                                            ∞ (illimité)
                                        </div>
                                    ) : (
                                        <input
                                            type="number"
                                            value={tier.max ?? ""}
                                            onChange={e => handleChange(i, "max", e.target.value)}
                                            className="w-full bg-base-100 border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                            min={tier.min + 1}
                                        />
                                    )}
                                </div>

                                {/* Multiplier */}
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={tier.multiplier}
                                        onChange={e => handleChange(i, "multiplier", e.target.value)}
                                        className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-blue-50/50"
                                        min={0.1}
                                        step={0.1}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-blue-400 font-bold pointer-events-none">×</span>
                                </div>

                                {/* Delete */}
                                <button
                                    onClick={() => removeTier(i)}
                                    disabled={tiers.length <= 1}
                                    className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-20"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Add row */}
                <div className="px-5 py-3 border-t border-gray-100">
                    <button
                        onClick={addTier}
                        className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                        <Plus size={15} /> Ajouter une tranche
                    </button>
                </div>
            </div>

            {/* Preview grid */}
            {!loading && tiers.length > 0 && (
                <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 text-xs text-blue-700 font-semibold space-y-1">
                    <p className="font-black text-sm text-blue-900 mb-2">Aperçu de la grille de coefficients</p>
                    {tiers.map((t, i) => {
                        const isLast = i === tiers.length - 1;
                        return (
                            <div key={i} className="flex items-center gap-2">
                                <ChevronRight size={12} className="text-blue-400 shrink-0" />
                                <span>
                                    {t.min} – {isLast ? "∞" : t.max} articles
                                    {" "}<strong>→ coefficient × {t.multiplier}</strong>
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Simulator */}
            <div className="bg-base-100 rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h3 className="font-black text-gray-900 flex items-center gap-2">
                    <Package size={16} className="text-blue-500" /> Simulateur de coefficient
                </h3>
                <p className="text-xs text-gray-400">Entrez un nombre d'articles pour voir le coefficient appliqué.</p>
                <div className="flex gap-3">
                    <input
                        type="number"
                        value={simQty}
                        onChange={e => setSimQty(e.target.value)}
                        placeholder="Ex : 7"
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        min={1}
                    />
                </div>

                <AnimatePresence>
                    {simResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100"
                        >
                            <Package size={20} className="text-blue-500 shrink-0" />
                            <p className="text-sm font-bold text-blue-800">
                                Pour <strong>{simResult.qty} articles</strong> → coefficient{" "}
                                <strong className="text-blue-900 text-base">× {simResult.multiplier}</strong>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Save */}
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white rounded-2xl font-black text-base shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-60 transition-all"
            >
                <Save size={18} />
                {saving ? "Enregistrement…" : "Sauvegarder les coefficients"}
            </motion.button>
        </div>
    );
}
