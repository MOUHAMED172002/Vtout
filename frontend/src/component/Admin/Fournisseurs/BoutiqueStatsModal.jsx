import React, { useState, useEffect } from 'react';
import { X, TrendingUp, DollarSign, ShoppingBag, PieChart, Activity, ArrowUpRight, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from "../../../lib/AuthHooks";
import api from '../../../services/api';
import toast from 'react-hot-toast';

export default function BoutiqueStatsModal({ boutique, onClose }) {
    const { getToken } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = await getToken();
                const res = await api.get(`/financials/admin/boutique/${boutique.id}/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data);
            } catch (err) {
                console.error(err);
                toast.error("Impossible de charger les statistiques");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [boutique.id]);

    if (loading) return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-neutral/60 backdrop-blur-sm">
            <span className="loading loading-spinner loading-lg text-white"></span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-neutral/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-base-100 w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-base-200"
            >
                {/* Header */}
                <div className="p-8 border-b border-base-200 flex items-center justify-between bg-indigo-600 text-white">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-base-100/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                            <BarChart3 size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tighter">Performance Boutique</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{boutique.name} · Rapport Analytique</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-11 h-11 rounded-2xl bg-base-100/10 text-white flex items-center justify-center hover:bg-base-200 hover:text-indigo-600 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-12 custom-scrollbar">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-8 bg-base-200 rounded-[2.5rem] border border-base-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40">Ventes Brutes</p>
                                <DollarSign size={16} className="text-indigo-500" />
                            </div>
                            <h3 className="text-3xl font-black text-base-content">{data?.stats.totalSales.toLocaleString()} F</h3>
                            <p className="text-[10px] font-bold text-base-content/40">Chiffre d'affaires généré</p>
                        </div>

                        <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Revenus Marchand</p>
                                <TrendingUp size={16} className="text-emerald-500" />
                            </div>
                            <h3 className="text-3xl font-black text-emerald-700">{data?.stats.totalEarnings.toLocaleString()} F</h3>
                            <p className="text-[10px] font-bold text-emerald-400">Part nette du partenaire (90%)</p>
                        </div>

                        <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Commissions Admin</p>
                                <PieChart size={16} className="text-indigo-500" />
                            </div>
                            <h3 className="text-3xl font-black text-indigo-700">{data?.stats.totalCommissions.toLocaleString()} F</h3>
                            <p className="text-[10px] font-bold text-indigo-400">Revenus plateforme (10%)</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Stats Details */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-black uppercase tracking-widest text-base-content/40 flex items-center gap-2">
                                <Activity size={16} /> Statistiques de Volume
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-base-100 border border-base-200 rounded-3xl shadow-sm">
                                    <p className="text-2xl font-black text-base-content">{data?.stats.ordersCount}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-base-content/40">Commandes Livrées</p>
                                </div>
                                <div className="p-6 bg-base-100 border border-base-200 rounded-3xl shadow-sm">
                                    <p className="text-2xl font-black text-base-content">{data?.stats.itemsCount}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-base-content/40">Articles Vendus</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="space-y-6">
                            <h4 className="text-sm font-black uppercase tracking-widest text-base-content/40 flex items-center gap-2">
                                <ShoppingBag size={16} /> Ventes Récentes
                            </h4>
                            <div className="space-y-3">
                                {data?.recentTransactions.map((tx, i) => (
                                    <div key={i} className="p-4 bg-base-200 rounded-2xl flex items-center justify-between border border-transparent hover:border-indigo-100 transition-all">
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-base-content/90 truncate">{tx.product_name}</p>
                                            <p className="text-[9px] font-bold text-base-content/40">ID: #{tx.order_id.slice(0, 8)}</p>
                                        </div>
                                        <p className="text-xs font-black text-indigo-600 whitespace-nowrap">+{tx.amount.toLocaleString()} F</p>
                                    </div>
                                ))}
                                {data?.recentTransactions.length === 0 && (
                                    <p className="text-xs font-bold text-base-content/30 italic text-center py-4">Aucune vente enregistrée.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
