import React, { useState, useEffect } from 'react';
import { X, Wallet, ArrowUpRight, ArrowDownLeft, History, PieChart, Banknote, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from "../../../lib/AuthHooks";;
import api from '../../../services/api';
import toast from 'react-hot-toast';

export default function SupplierWalletModal({ supplier, onClose }) {
    const { getToken } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await getToken();
                const res = await api.get(`/financials/admin/user/${supplier.user_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(res.data);
            } catch (err) {
                console.error(err);
                toast.error("Impossible de charger le portefeuille");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [supplier.user_id]);

    if (loading) return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
            <span className="loading loading-spinner loading-lg text-white"></span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-slate-100"
            >
                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                            <Wallet size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Portefeuille Marchand</h2>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{supplier.name} · {supplier.phone}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-11 h-11 rounded-2xl bg-white text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 custom-scrollbar">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-8 bg-slate-900 rounded-[2rem] text-white space-y-2 relative overflow-hidden">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Solde Disponible</p>
                            <h3 className="text-3xl font-black">{Number(data?.balance).toLocaleString()} F</h3>
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 -mr-10 -mt-10 rounded-full"></div>
                        </div>
                        <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Total Gains</p>
                            <h3 className="text-3xl font-black text-emerald-700">
                                {data?.transactions.filter(t => t.type === 'earning').reduce((acc, t) => acc + parseFloat(t.amount), 0).toLocaleString()} F
                            </h3>
                        </div>
                        <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100 space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Retraits Effectués</p>
                            <h3 className="text-3xl font-black text-amber-700">
                                {data?.transactions.filter(t => t.type === 'payout').reduce((acc, t) => acc + parseFloat(t.amount), 0).toLocaleString()} F
                            </h3>
                        </div>
                    </div>

                    {/* History */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                                <History size={16} /> Historique Récent
                            </h4>
                        </div>

                        <div className="space-y-3">
                            {data?.transactions.map(t => (
                                <div key={t.id} className="p-5 bg-white border border-slate-50 rounded-2xl flex items-center justify-between hover:border-slate-200 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'earning' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                                            {t.type === 'earning' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800">{t.description}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar size={12} className="text-slate-300" />
                                                <span className="text-[10px] font-bold text-slate-400">{new Date(t.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-black ${t.type === 'earning' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {t.type === 'earning' ? '+' : '-'}{Number(t.amount).toLocaleString()} F
                                        </p>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{t.status}</span>
                                    </div>
                                </div>
                            ))}

                            {data?.transactions.length === 0 && (
                                <div className="py-20 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                                    <History size={40} className="mx-auto text-slate-200 mb-4" />
                                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Aucune transaction</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
