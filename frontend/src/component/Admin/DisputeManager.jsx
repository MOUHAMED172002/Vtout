import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../lib/AuthHooks";
import {
    AlertCircle, CheckCircle2, Clock, XCircle, User,
    Store, Package, ArrowRight, RefreshCw, Banknote, Eye, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const MOTIF_COLORS = {
    'Colis non reçu':                  'bg-amber-100 text-amber-700',
    'Produit endommagé':               'bg-rose-100 text-rose-700',
    "Produit différent de l'annonce":  'bg-violet-100 text-violet-700',
    'Autre':                           'bg-slate-100 text-slate-600',
};

const statusBadge = (status) => {
    const map = {
        open:         <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> À traiter</span>,
        under_review: <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Eye size={10} /> En examen</span>,
        resolved:     <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={10} /> Résolu</span>,
        cancelled:    <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><XCircle size={10} /> Annulé</span>,
    };
    return map[status] || null;
};

const DisputeManager = () => {
    const { getToken } = useAuth();
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [resolution, setResolution] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => { fetchDisputes(); }, []);

    const fetchDisputes = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const res = await axios.get(`${API_URL}/admin/disputes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDisputes(res.data);
        } catch {
            toast.error("Échec du chargement des litiges");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status, action = null) => {
        setActionLoading(true);
        try {
            const token = await getToken();
            await axios.patch(`${API_URL}/admin/disputes/${id}`, {
                status,
                resolution,
                action,
            }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(action === 'refund' ? "Remboursement effectué et litige résolu !" : "Statut mis à jour");
            fetchDisputes();
            setSelectedDispute(null);
            setResolution('');
        } catch {
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setActionLoading(false);
        }
    };

    const filtered = disputes.filter(d => {
        const matchFilter = filter === 'all' || d.status === filter;
        const q = search.toLowerCase();
        const matchSearch = !q ||
            (d.user?.fullname || '').toLowerCase().includes(q) ||
            (d.motif || d.reason || '').toLowerCase().includes(q) ||
            (d.order_id || '').toLowerCase().includes(q);
        return matchFilter && matchSearch;
    });

    if (loading) return <div className="p-20 text-center animate-pulse font-black text-slate-400 uppercase tracking-widest">Chargement des dossiers...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                        <AlertCircle size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Litiges & Réclamations</h1>
                        <p className="text-slate-400 font-bold text-xs mt-1">{disputes.filter(d => d.status === 'open').length} dossier(s) en attente</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher..."
                            className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-100 w-48"
                        />
                    </div>
                    {/* Filters */}
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 gap-1">
                        {['all', 'open', 'under_review', 'resolved', 'cancelled'].map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                                {f === 'all' ? 'Tous' : f === 'open' ? 'À traiter' : f === 'under_review' ? 'En examen' : f === 'resolved' ? 'Clos' : 'Annulés'}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence>
                    {filtered.map(dispute => (
                        <motion.div key={dispute.id}
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 hover:shadow-xl hover:shadow-slate-200/50 transition-all space-y-5 flex flex-col"
                        >
                            <div className="flex justify-between items-start gap-2">
                                {statusBadge(dispute.status)}
                                <span className="text-[10px] font-bold text-slate-300">#{(dispute.id || '').slice(0, 8)}</span>
                            </div>

                            {/* Motif badge */}
                            {dispute.motif && (
                                <span className={`self-start px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${MOTIF_COLORS[dispute.motif] || 'bg-slate-100 text-slate-500'}`}>
                                    {dispute.motif}
                                </span>
                            )}

                            {dispute.description && (
                                <p className="text-sm text-slate-500 font-medium line-clamp-2 italic">"{dispute.description}"</p>
                            )}

                            {/* Photo thumbnail */}
                            {dispute.photo_url && (
                                <a href={dispute.photo_url} target="_blank" rel="noreferrer" className="block rounded-2xl overflow-hidden aspect-video bg-slate-100">
                                    <img src={dispute.photo_url} alt="preuve" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                </a>
                            )}

                            <div className="p-4 bg-slate-50 rounded-2xl space-y-2.5 flex-1">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-100"><User size={12} /></div>
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest truncate">{dispute.user?.fullname || 'Client Inconnu'}</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-primary/60 border border-slate-100"><Store size={12} /></div>
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest truncate">{dispute.supplier?.name || '—'}</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-100"><Package size={12} /></div>
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">CMD #{(dispute.order_id || '').slice(0, 8)}</span>
                                </div>
                            </div>

                            <button onClick={() => { setSelectedDispute(dispute); setResolution(dispute.resolution || ''); }}
                                className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-600 transition-all flex items-center justify-center gap-2">
                                Examiner <ArrowRight size={14} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <p className="font-black text-slate-400 uppercase tracking-[0.3em]">Aucun dossier trouvé</p>
                </div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedDispute && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setSelectedDispute(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.93, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                            <div className="p-8 md:p-10 space-y-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900">Dossier #{selectedDispute.id.slice(0, 8)}</h2>
                                        <p className="text-xs text-slate-400 font-bold mt-1">Commande #{(selectedDispute.order_id || '').slice(0, 8)}</p>
                                    </div>
                                    {statusBadge(selectedDispute.status)}
                                </div>

                                {/* Motif */}
                                {selectedDispute.motif && (
                                    <div className={`px-4 py-2.5 rounded-2xl font-black text-sm ${MOTIF_COLORS[selectedDispute.motif] || 'bg-slate-100 text-slate-600'}`}>
                                        {selectedDispute.motif}
                                    </div>
                                )}

                                {/* Description */}
                                {selectedDispute.description && (
                                    <div className="p-5 bg-rose-50/60 rounded-[1.5rem] border border-rose-100/50 text-rose-900 font-medium text-sm leading-relaxed italic">
                                        "{selectedDispute.description}"
                                    </div>
                                )}

                                {/* Photo */}
                                {selectedDispute.photo_url && (
                                    <a href={selectedDispute.photo_url} target="_blank" rel="noreferrer" className="block rounded-2xl overflow-hidden">
                                        <img src={selectedDispute.photo_url} alt="preuve" className="w-full object-cover max-h-56 rounded-2xl" />
                                    </a>
                                )}

                                {/* Client info */}
                                <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-400">Client</span>
                                        <span className="text-slate-700">{selectedDispute.user?.fullname || '—'}</span>
                                    </div>
                                    {selectedDispute.user?.phone && (
                                        <div className="flex justify-between text-[10px] font-bold">
                                            <span className="text-slate-400">Téléphone</span>
                                            <span className="text-slate-700">{selectedDispute.user.phone}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-slate-400">Montant commande</span>
                                        <span className="text-slate-700 font-black">{Number(selectedDispute.order?.total_amount || 0).toLocaleString()} F</span>
                                    </div>
                                </div>

                                {/* Action zone */}
                                {selectedDispute.status === 'open' || selectedDispute.status === 'under_review' ? (
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Décision & Résolution</p>
                                        <textarea
                                            value={resolution}
                                            onChange={e => setResolution(e.target.value)}
                                            placeholder="Expliquez la décision (motif de remboursement, rejet, échange...)"
                                            className="w-full p-5 bg-slate-50 rounded-[1.5rem] text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 min-h-[100px] border-none outline-none resize-none"
                                        />
                                        <div className="grid grid-cols-1 gap-3">
                                            <button onClick={() => updateStatus(selectedDispute.id, 'resolved', 'refund')} disabled={actionLoading}
                                                className="py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                                <Banknote size={16} /> Rembourser + Résoudre
                                            </button>
                                            <button onClick={() => updateStatus(selectedDispute.id, 'resolved')} disabled={actionLoading}
                                                className="py-4 bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                                <CheckCircle2 size={16} /> Résoudre sans remboursement
                                            </button>
                                            <button onClick={() => updateStatus(selectedDispute.id, 'under_review')} disabled={actionLoading}
                                                className="py-4 bg-amber-100 text-amber-700 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                                <RefreshCw size={16} /> Mettre en examen
                                            </button>
                                            <button onClick={() => updateStatus(selectedDispute.id, 'cancelled')} disabled={actionLoading}
                                                className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50">
                                                Rejeter / Annuler
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Résolution enregistrée</p>
                                        <div className="p-5 bg-emerald-50/60 rounded-[1.5rem] border border-emerald-100/50 text-emerald-900 font-bold text-sm">
                                            {selectedDispute.resolution || 'Aucune explication fournie.'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DisputeManager;
