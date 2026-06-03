import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../../lib/AuthHooks";
import { Plus, Trash2, Save, RefreshCw, Zap, ChevronRight, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API = import.meta.env.VITE_API_URL || "https://api.vtout.com/api";

const DEFAULT_TIERS = [
    { min: 0,     max: 500,   fee: 300  },
    { min: 500,   max: 2000,  fee: 500  },
    { min: 2000,  max: 5000,  fee: 700  },
    { min: 5000,  max: 15000, fee: 1000 },
    { min: 15000, max: null,  fee: 1500 },
];

export default function DeliveryFeeTiersManager() {
    const { getToken } = useAuth();
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [localToast, setLocalToast] = useState(null);
    const [simulation, setSimulation] = useState(null);
    const [simPrice, setSimPrice] = useState("");
    const [simLoading, setSimLoading] = useState(false);

    const showToast = (msg, type = "success") => {
        setLocalToast({ msg, type });
        setTimeout(() => setLocalToast(null), 3500);
    };

    const fetchTiers = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const { data } = await axios.get(`${API}/admin/delivery-fee-tiers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTiers(data.tiers || DEFAULT_TIERS);
        } catch {
            setTiers(DEFAULT_TIERS);
            showToast("Impossible de charger les tranches. Valeurs par défaut affichées.", "error");
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
            const newMin = last ? (last.max ?? last.min + 5000) : 0;
            return [...prev, { min: newMin, max: null, fee: 500 }];
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
                fee: Number(t.fee) || 0,
            }));
            await axios.put(`${API}/admin/delivery-fee-tiers`, { tiers: payload }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            showToast("✅ Tranches sauvegardées avec succès !");
            fetchTiers();
        } catch (err) {
            showToast("❌ Erreur lors de la sauvegarde : " + (err.response?.data?.error || err.message), "error");
        } finally {
            setSaving(false);
        }
    };

    const handleSimulate = async () => {
        if (!simPrice || Number(simPrice) <= 0) return;
        setSimLoading(true);
        try {
            const { data } = await axios.post(`${API}/admin/delivery-fee-simulate`, { supplier_price: Number(simPrice) });
            setSimulation(data);
        } catch (err) {
            showToast("Erreur simulation : " + (err.response?.data?.error || err.message), "error");
        } finally {
            setSimLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">Frais de Livraison par Tranches</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Définissez les frais automatiquement ajoutés au prix vendeur selon le montant du produit.
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

            {/* Tiers Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-0 text-[11px] font-black text-gray-400 uppercase tracking-widest px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <span>Prix vendeur min (F)</span>
                    <span>Prix vendeur max (F)</span>
                    <span>Frais livraison (F)</span>
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
                                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                        min={0}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold pointer-events-none">F</span>
                                </div>

                                {/* Max */}
                                <div className="relative">
                                    {i === tiers.length - 1 ? (
                                        <div className="w-full border border-dashed border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-400 font-semibold bg-gray-50">
                                            ∞ (illimité)
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="number"
                                                value={tier.max ?? ""}
                                                onChange={e => handleChange(i, "max", e.target.value)}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                                min={tier.min + 1}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold pointer-events-none">F</span>
                                        </>
                                    )}
                                </div>

                                {/* Fee */}
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={tier.fee}
                                        onChange={e => handleChange(i, "fee", e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 bg-emerald-50/50 border-emerald-200"
                                        min={0}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-500 font-bold pointer-events-none">F</span>
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

            {/* Example preview */}
            {!loading && tiers.length > 0 && (
                <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 text-xs text-blue-700 font-semibold space-y-1">
                    <p className="font-black text-sm text-blue-900 mb-2">Aperçu de la grille tarifaire</p>
                    {tiers.map((t, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <ChevronRight size={12} className="text-blue-400 shrink-0" />
                            <span>
                                Prix vendeur {t.min.toLocaleString("fr-FR")} F – {t.max != null ? t.max.toLocaleString("fr-FR") : "∞"} F
                                {" "}<strong>→ +{t.fee.toLocaleString("fr-FR")} F</strong> livraison
                                {" "}→ Prix public{" "}
                                <strong>{(t.min + t.fee).toLocaleString("fr-FR")} F à {t.max != null ? (t.max + t.fee).toLocaleString("fr-FR") : "∞"} F</strong>
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Simulator */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h3 className="font-black text-gray-900 flex items-center gap-2">
                    <Zap size={16} className="text-amber-500" fill="currentColor" /> Simulateur de prix
                </h3>
                <p className="text-xs text-gray-400">Entrez un prix vendeur pour voir le prix public calculé.</p>
                <div className="flex gap-3">
                    <input
                        type="number"
                        value={simPrice}
                        onChange={e => setSimPrice(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSimulate()}
                        placeholder="Ex : 250"
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        min={1}
                    />
                    <button
                        onClick={handleSimulate}
                        disabled={simLoading || !simPrice}
                        className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                        {simLoading ? "…" : "Simuler"}
                    </button>
                </div>

                <AnimatePresence>
                    {simulation && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                        >
                            {[
                                { label: "Prix vendeur", value: `${simulation.supplier_price.toLocaleString("fr-FR")} F`, color: "text-gray-900" },
                                { label: "Frais livraison", value: `+${simulation.delivery_fee.toLocaleString("fr-FR")} F`, color: "text-orange-600" },
                                { label: "Prix public", value: `${simulation.public_price.toLocaleString("fr-FR")} F`, color: "text-primary font-black text-lg" },
                                { label: `Gain vendeur (${simulation.commission_rate_pct}% comm.)`, value: `${simulation.supplier_earnings.toLocaleString("fr-FR")} F`, color: "text-emerald-600" },
                            ].map((item) => (
                                <div key={item.label} className="bg-gray-50 rounded-2xl p-3 text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                                    <p className={`text-base font-black ${item.color}`}>{item.value}</p>
                                </div>
                            ))}
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
                {saving ? "Enregistrement…" : "Sauvegarder les tranches"}
            </motion.button>
        </div>
    );
}
