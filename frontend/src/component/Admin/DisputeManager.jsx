import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../lib/clerk-shim';
import { 
    AlertCircle, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    MessageCircle,
    User,
    Store,
    Package,
    ArrowRight,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const DisputeManager = () => {
    const { getToken } = useAuth();
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, open, resolved, cancelled
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [resolution, setResolution] = useState('');

    useEffect(() => {
        fetchDisputes();
    }, []);

    const fetchDisputes = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const res = await axios.get(`${API_URL}/admin/disputes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDisputes(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Échec du chargement des litiges");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status, resolutionText = '') => {
        try {
            const token = await getToken();
            await axios.patch(`${API_URL}/admin/disputes/${id}`, {
                status,
                resolution: resolutionText
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Statut mis à jour");
            fetchDisputes();
            setSelectedDispute(null);
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const filteredDisputes = disputes.filter(d => filter === 'all' ? true : d.status === filter);

    const statusBadge = (status) => {
        switch (status) {
            case 'open': return <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> Ouvert</span>;
            case 'resolved': return <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={10} /> Résolu</span>;
            case 'cancelled': return <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><XCircle size={10} /> Annulé</span>;
            default: return null;
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse font-black text-slate-400 uppercase tracking-widest">Chargement des dossiers...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shadow-inner">
                        <AlertCircle size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestion des Retours & Litiges</h1>
                        <p className="text-slate-400 font-bold text-sm mt-1">Supervisez les réclamations clients et retours fournisseurs</p>
                    </div>
                </div>
                <div className="flex bg-slate-50 p-2 rounded-2xl border border-slate-100 gap-1">
                    {['all', 'open', 'resolved', 'cancelled'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {f === 'all' ? 'Tous' : f === 'open' ? 'À traiter' : f === 'resolved' ? 'Clos' : 'Annulés'}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredDisputes.map(dispute => (
                        <motion.div 
                            key={dispute.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 hover:shadow-xl hover:shadow-slate-200/50 transition-all space-y-6 flex flex-col"
                        >
                            <div className="flex justify-between items-start">
                                {statusBadge(dispute.status)}
                                <span className="text-[10px] font-bold text-slate-300">#{(dispute.id || "").slice(0, 8)}</span>
                            </div>

                            <div className="space-y-4 flex-1">
                                <div className="space-y-1">
                                    <h3 className="font-black text-slate-900 text-lg leading-tight">{dispute.reason}</h3>
                                    <p className="text-sm text-slate-400 font-medium line-clamp-2">{dispute.description}</p>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-100"><User size={14} /></div>
                                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest truncate">{dispute.user?.fullname || 'Client Inconnu'}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary/60 border border-slate-100"><Store size={14} /></div>
                                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest truncate">{dispute.supplier?.name || dispute.supplier_id}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-100"><Package size={14} /></div>
                                        <div className="text-[10px] font-black text-primary uppercase tracking-widest truncate">CMD #{(dispute.order_id || "").slice(0, 8)}</div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedDispute(dispute)}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary transition-all flex items-center justify-center gap-2"
                            >
                                Examiner <ArrowRight size={14} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {filteredDisputes.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <p className="font-black text-slate-400 uppercase tracking-[0.3em]">Aucun dossier trouvé</p>
                </div>
            )}

            {/* Detailed Modal */}
            <AnimatePresence>
                {selectedDispute && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                            onClick={() => setSelectedDispute(null)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-10 md:p-14 space-y-8">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Détails du Litige</h2>
                                    <button onClick={() => setSelectedDispute(null)} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all"><XCircle size={24} className="text-slate-400" /></button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Motif de la réclamation</div>
                                        <div className="p-6 bg-rose-50/50 rounded-[2rem] border border-rose-100/50 text-rose-900 font-bold leading-relaxed italic">
                                            "{selectedDispute.description}"
                                        </div>
                                    </div>

                                    {selectedDispute.status === 'open' ? (
                                        <div className="space-y-4">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Décision & Résolution</div>
                                            <textarea 
                                                value={resolution}
                                                onChange={(e) => setResolution(e.target.value)}
                                                placeholder="Expliquez la décision (remboursement, échange, rejet...)"
                                                className="w-full p-6 bg-slate-50 border-none rounded-[2rem] text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 min-h-[120px]"
                                            />
                                            <div className="grid grid-cols-2 gap-4 pt-4">
                                                <button 
                                                    onClick={() => updateStatus(selectedDispute.id, 'resolved', resolution)}
                                                    className="py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                                                >
                                                    Valider la Résolution
                                                </button>
                                                <button 
                                                    onClick={() => updateStatus(selectedDispute.id, 'cancelled')}
                                                    className="py-4 bg-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                                                >
                                                    Annuler le Litige
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Résolution enregistrée</div>
                                            <div className="p-6 bg-emerald-50/50 rounded-[2rem] border border-emerald-100/50 text-emerald-900 font-bold">
                                                {selectedDispute.resolution || 'Aucune explication fournie.'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DisputeManager;
