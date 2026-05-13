import React, { useState, useEffect } from 'react';
import { Banknote, CheckCircle2, XCircle, Clock, Search, Filter, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from "../../../lib/AuthHooks";
import api from '../../../services/api';
import toast from 'react-hot-toast';

export default function PayoutManager({ globalSearchQuery = "" }) {
    const { getToken } = useAuth();
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPayouts = async () => {
        try {
            const token = await getToken();
            const { data } = await api.get('/financials/admin/payouts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayouts(data);
        } catch (err) {
            toast.error("Erreur de chargement des demandes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, []);

    const handleAction = async (id, status, notes = "") => {
        try {
            const token = await getToken();
            await api.put(`/financials/admin/payouts/${id}`, { status, admin_notes: notes }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Demande ${status === 'paid' ? 'payée' : 'mise à jour'}`);
            fetchPayouts();
        } catch (err) {
            toast.error("Erreur lors de l'action");
        }
    };

    const filteredPayouts = payouts.filter(p => {
        const query = (searchTerm || globalSearchQuery).toLowerCase();
        const matchesFilter = filter === 'all' || p.status === filter;
        const matchesSearch = (p.user?.fullname || "").toLowerCase().includes(query) || 
                              (p.user?.email || "").toLowerCase().includes(query) ||
                              p.id.toLowerCase().includes(query);
        return matchesFilter && matchesSearch;
    });

    if (loading) return <div className="p-20 text-center"><span className="loading loading-spinner"></span></div>;

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Gestion des Retraits</h2>
                    <p className="text-sm font-bold text-slate-400">Suivre et valider les paiements des partenaires.</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto">
                    <div className="flex items-center gap-2 px-4 border-r border-slate-50">
                        <Search size={18} className="text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-bold text-slate-600 w-40"
                        />
                    </div>
                    <select 
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="bg-transparent border-none outline-none text-xs font-black uppercase text-slate-500 px-4"
                    >
                        <option value="all">Tous</option>
                        <option value="pending">En attente</option>
                        <option value="paid">Payés</option>
                        <option value="rejected">Rejetés</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredPayouts.map(p => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        key={p.id} 
                        className="bg-white rounded-3xl border border-slate-100 p-8 flex flex-col lg:flex-row items-center justify-between gap-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                    >
                        <div className="flex items-center gap-6 flex-1">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${p.status === 'paid' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                                <Banknote size={32} />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <h4 className="text-xl font-black text-slate-900">{Number(p.amount).toLocaleString()} F</h4>
                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                        p.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                                        p.status === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                                    }`}>
                                        {p.status}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-slate-500">
                                    {p.user?.fullname} · <span className="text-slate-400 font-medium">{p.user?.email}</span>
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                                    {p.payment_method} · {p.payment_details}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                            {p.status === 'pending' && (
                                <>
                                    <button 
                                        onClick={() => handleAction(p.id, 'rejected', prompt("Motif du rejet :"))}
                                        className="btn btn-ghost text-rose-500 hover:bg-rose-50 rounded-xl px-6 h-12 font-black text-[10px] uppercase tracking-widest"
                                    >
                                        Rejeter
                                    </button>
                                    <button 
                                        onClick={() => handleAction(p.id, 'paid')}
                                        className="btn bg-slate-900 text-white hover:bg-black rounded-xl px-10 h-12 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200"
                                    >
                                        Marquer comme payé
                                    </button>
                                </>
                            )}
                            {p.status === 'paid' && (
                                <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-widest bg-emerald-50 px-6 py-3 rounded-xl border border-emerald-100">
                                    <CheckCircle2 size={16} /> Payé
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {filteredPayouts.length === 0 && (
                    <div className="py-32 text-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
                        <Banknote size={64} className="mx-auto text-slate-200 mb-6" />
                        <p className="text-xl font-black text-slate-300 italic">Aucune demande trouvée.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
