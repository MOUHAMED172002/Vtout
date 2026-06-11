import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from "../../lib/AuthHooks";
import {
    AlertCircle, CheckCircle2, Clock, XCircle, User,
    Store, Package, ArrowRight, RefreshCw, Banknote, Eye,
    Search, TrendingUp, MessageSquare, Camera, ChevronDown,
    ChevronUp, FileText, History, Truck, Phone, Mail, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const MOTIF_COLORS = {
    'Colis non reçu':                  'bg-amber-100 text-amber-700',
    'Produit endommagé':               'bg-rose-100 text-rose-700',
    "Produit différent de l'annonce":  'bg-violet-100 text-violet-700',
    'Autre':                           'bg-base-200 text-base-content/70',
};

const statusBadge = (status) => {
    const map = {
        open:         <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> À traiter</span>,
        under_review: <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Eye size={10} /> En examen</span>,
        resolved:     <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={10} /> Résolu</span>,
        cancelled:    <span className="px-3 py-1 bg-base-200 text-base-content/40 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><XCircle size={10} /> Annulé</span>,
    };
    return map[status] || null;
};

function StatCard({ label, value, color, icon: Icon }) {
    const colorMap = {
        amber:   'bg-amber-50 text-amber-600',
        blue:    'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        slate:   'bg-base-200 text-base-content/50',
    };
    return (
        <div className="bg-base-100 rounded-[2rem] p-5 border border-base-200 shadow-sm flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
                <Icon size={18} />
            </div>
            <div>
                <p className="text-2xl font-black text-base-content">{value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40">{label}</p>
            </div>
        </div>
    );
}

function InfoRow({ label, value, icon: Icon }) {
    return (
        <div className="flex items-start justify-between gap-3 text-[10px]">
            <span className="font-bold text-base-content/40 shrink-0 flex items-center gap-1">
                {Icon && <Icon size={9} className="opacity-60" />}{label}
            </span>
            <span className="font-black text-base-content/80 text-right break-all">{value}</span>
        </div>
    );
}

const DisputeManager = () => {
    const { getToken } = useAuth();
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [resolution, setResolution] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [refundAmount, setRefundAmount] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        fetchDisputes();
        fetchStats();
    }, []);

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

    const fetchStats = async () => {
        try {
            const token = await getToken();
            const res = await axios.get(`${API_URL}/admin/disputes/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch {
            // Stats are non-critical; fail silently
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
                admin_notes: adminNotes || undefined,
                refund_amount: refundAmount ? Number(refundAmount) : undefined,
            }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success(
                action === 'refund'
                    ? `Remboursement${refundAmount ? ` de ${Number(refundAmount).toLocaleString()} F` : ' total'} effectué !`
                    : "Statut mis à jour"
            );
            fetchDisputes();
            fetchStats();
            setSelectedDispute(null);
            setResolution('');
            setAdminNotes('');
            setRefundAmount('');
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

    if (loading) return <div className="p-20 text-center animate-pulse font-black text-base-content/40 uppercase tracking-widest">Chargement des dossiers...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-base-100 p-8 rounded-[3rem] shadow-sm border border-base-200">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                        <AlertCircle size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-base-content tracking-tight">Litiges & Réclamations</h1>
                        <p className="text-base-content/40 font-bold text-xs mt-1">{disputes.filter(d => d.status === 'open').length} dossier(s) en attente</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher..."
                            className="pl-10 pr-4 py-2.5 bg-base-200 border border-base-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-100 w-48"
                        />
                    </div>
                    {/* Filters */}
                    <div className="flex bg-base-200 p-1.5 rounded-2xl border border-base-200 gap-1">
                        {['all', 'open', 'under_review', 'resolved', 'cancelled'].map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-base-100 text-base-content shadow-sm' : 'text-base-content/40 hover:text-base-content/70'}`}>
                                {f === 'all' ? 'Tous' : f === 'open' ? 'À traiter' : f === 'under_review' ? 'En examen' : f === 'resolved' ? 'Clos' : 'Annulés'}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Stats row */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="À traiter" value={stats.byStatus?.open || 0} color="amber" icon={Clock} />
                    <StatCard label="En examen" value={stats.byStatus?.under_review || 0} color="blue" icon={Eye} />
                    <StatCard label="Résolus" value={stats.byStatus?.resolved || 0} color="emerald" icon={CheckCircle2} />
                    <StatCard label="Délai moyen" value={stats.avgResolutionHours ? `${Math.round(stats.avgResolutionHours)}h` : '—'} color="slate" icon={TrendingUp} />
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence>
                    {filtered.map(dispute => (
                        <motion.div key={dispute.id}
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-base-100 p-6 rounded-[2.5rem] shadow-sm border border-base-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all space-y-5 flex flex-col"
                        >
                            <div className="flex justify-between items-start gap-2">
                                {statusBadge(dispute.status)}
                                <span className="text-[10px] font-bold text-base-content/30">#{(dispute.id || '').slice(0, 8)}</span>
                            </div>

                            {/* Motif badge */}
                            {dispute.motif && (
                                <span className={`self-start px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${MOTIF_COLORS[dispute.motif] || 'bg-base-200 text-base-content/50'}`}>
                                    {dispute.motif}
                                </span>
                            )}

                            {dispute.description && (
                                <p className="text-sm text-base-content/50 font-medium line-clamp-2 italic">"{dispute.description}"</p>
                            )}

                            {/* Photo thumbnail */}
                            {dispute.photo_url && (
                                <a href={dispute.photo_url} target="_blank" rel="noreferrer" className="block rounded-2xl overflow-hidden aspect-video bg-base-200">
                                    <img src={dispute.photo_url} alt="preuve" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                </a>
                            )}

                            <div className="p-4 bg-base-200 rounded-2xl space-y-2.5 flex-1">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 bg-base-100 rounded-lg flex items-center justify-center text-base-content/40 border border-base-200"><User size={12} /></div>
                                    <span className="text-[10px] font-black text-base-content/70 uppercase tracking-widest truncate">{dispute.user?.fullname || 'Client Inconnu'}</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 bg-base-100 rounded-lg flex items-center justify-center text-primary/60 border border-base-200"><Store size={12} /></div>
                                    <span className="text-[10px] font-black text-base-content/70 uppercase tracking-widest truncate">{dispute.supplier?.name || '—'}</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 bg-base-100 rounded-lg flex items-center justify-center text-base-content/40 border border-base-200"><Package size={12} /></div>
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">CMD #{(dispute.order_id || '').slice(0, 8)}</span>
                                </div>
                            </div>

                            {/* Auto-clôture indicator for resolved disputes */}
                            {dispute.status === 'resolved' && dispute.resolved_at && (() => {
                                const days = Math.max(0, 7 - Math.floor((Date.now() - new Date(dispute.resolved_at)) / 86400000));
                                if (days === 0) return <span className="text-[9px] text-base-content/40 font-bold">Auto-clôturé</span>;
                                return <span className="text-[9px] text-amber-500 font-bold">Auto-clôture dans {days}j</span>;
                            })()}

                            <button onClick={() => { setSelectedDispute(dispute); setResolution(dispute.resolution || ''); setAdminNotes(''); setRefundAmount(''); setShowHistory(false); }}
                                className="w-full py-3.5 bg-neutral text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-600 transition-all flex items-center justify-center gap-2">
                                Examiner <ArrowRight size={14} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 bg-base-200 rounded-[3rem] border-2 border-dashed border-base-300">
                    <p className="font-black text-base-content/40 uppercase tracking-[0.3em]">Aucun dossier trouvé</p>
                </div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedDispute && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-neutral/40 backdrop-blur-md" onClick={() => setSelectedDispute(null)} />
                        <motion.div initial={{ opacity: 0, scale: 0.93, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 20 }}
                            className="relative w-full max-w-lg bg-base-100 rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                            <div className="p-8 md:p-10 space-y-6">
                                {/* Header */}
                                <div className="flex justify-between items-start gap-2">
                                    <div>
                                        <h2 className="text-2xl font-black text-base-content">Dossier #{selectedDispute.id.slice(0, 8)}</h2>
                                        <p className="text-xs text-base-content/40 font-bold mt-1">Commande #{(selectedDispute.order_id || '').slice(0, 8)} · {Number(selectedDispute.order?.total_amount || 0).toLocaleString()} F</p>
                                    </div>
                                    {statusBadge(selectedDispute.status)}
                                </div>

                                {/* Motif */}
                                {selectedDispute.motif && (
                                    <div className={`px-4 py-2.5 rounded-2xl font-black text-sm ${MOTIF_COLORS[selectedDispute.motif] || 'bg-base-200 text-base-content/70'}`}>
                                        {selectedDispute.motif}
                                    </div>
                                )}

                                {/* Description */}
                                {selectedDispute.description && (
                                    <div className="p-5 bg-rose-50/60 rounded-[1.5rem] border border-rose-100/50 text-rose-900 font-medium text-sm leading-relaxed italic">
                                        "{selectedDispute.description}"
                                    </div>
                                )}

                                {/* Photo preuve — full-width prominent */}
                                {selectedDispute.photo_url && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest flex items-center gap-1.5"><Camera size={11}/> Photo preuve du client</p>
                                        <a href={selectedDispute.photo_url} target="_blank" rel="noreferrer" className="block rounded-2xl overflow-hidden ring-2 ring-rose-100">
                                            <img src={selectedDispute.photo_url} alt="preuve client" className="w-full object-cover max-h-64 hover:scale-[1.02] transition-transform duration-300" />
                                        </a>
                                    </div>
                                )}

                                {/* ── Parties impliquées ── */}
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest">Parties impliquées</p>

                                    {/* Client */}
                                    <div className="p-4 bg-base-200 rounded-2xl border border-base-200 space-y-2.5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-6 h-6 bg-blue-100 text-blue-500 rounded-lg flex items-center justify-center"><User size={11}/></div>
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Client</span>
                                        </div>
                                        <InfoRow label="Nom" value={selectedDispute.user?.fullname || '—'} />
                                        {selectedDispute.user?.email && <InfoRow label="Email" value={selectedDispute.user.email} icon={Mail} />}
                                        {selectedDispute.user?.phone && <InfoRow label="Téléphone" value={selectedDispute.user.phone} icon={Phone} />}
                                    </div>

                                    {/* Vendeur */}
                                    {selectedDispute.supplier && (
                                        <div className="p-4 bg-base-200 rounded-2xl border border-base-200 space-y-2.5">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-6 h-6 bg-amber-100 text-amber-500 rounded-lg flex items-center justify-center"><Store size={11}/></div>
                                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Vendeur</span>
                                            </div>
                                            <InfoRow label="Boutique" value={selectedDispute.supplier.name || '—'} />
                                            {selectedDispute.supplier.email && <InfoRow label="Email" value={selectedDispute.supplier.email} icon={Mail} />}
                                            {selectedDispute.supplier.whatsapp && <InfoRow label="WhatsApp" value={selectedDispute.supplier.whatsapp} icon={Phone} />}
                                        </div>
                                    )}

                                    {/* Livreur */}
                                    {selectedDispute.order?.deliveryPerson ? (
                                        <div className="p-4 bg-base-200 rounded-2xl border border-base-200 space-y-2.5">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-6 h-6 bg-emerald-100 text-emerald-500 rounded-lg flex items-center justify-center"><Truck size={11}/></div>
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Livreur</span>
                                            </div>
                                            <InfoRow label="Nom" value={selectedDispute.order.deliveryPerson.profile?.fullname || '—'} />
                                            {selectedDispute.order.deliveryPerson.profile?.phone && <InfoRow label="Téléphone" value={selectedDispute.order.deliveryPerson.profile.phone} icon={Phone} />}
                                            {selectedDispute.order.deliveryPerson.whatsapp && <InfoRow label="WhatsApp" value={selectedDispute.order.deliveryPerson.whatsapp} icon={Phone} />}
                                            {selectedDispute.order.deliveryPerson.vehicle_type && (
                                                <InfoRow label="Véhicule" value={`${selectedDispute.order.deliveryPerson.vehicle_type}${selectedDispute.order.deliveryPerson.vehicle_model ? ` · ${selectedDispute.order.deliveryPerson.vehicle_model}` : ''}${selectedDispute.order.deliveryPerson.license_plate ? ` (${selectedDispute.order.deliveryPerson.license_plate})` : ''}`} icon={Truck} />
                                            )}
                                            {selectedDispute.order.deliveryPerson.rating && (
                                                <InfoRow label="Note" value={`${Number(selectedDispute.order.deliveryPerson.rating).toFixed(1)} / 5 · ${selectedDispute.order.deliveryPerson.total_deliveries || 0} livraisons`} icon={Star} />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-base-200 rounded-2xl border border-dashed border-base-300 flex items-center gap-3">
                                            <div className="w-6 h-6 bg-base-200 text-base-content/30 rounded-lg flex items-center justify-center"><Truck size={11}/></div>
                                            <span className="text-[10px] font-bold text-base-content/30 uppercase tracking-widest">Aucun livreur assigné</span>
                                        </div>
                                    )}
                                </div>

                                {/* Action zone */}
                                {(selectedDispute.status === 'open' || selectedDispute.status === 'under_review') ? (
                                    <div className="space-y-4">
                                        {/* Supplier response */}
                                        {selectedDispute.supplier_response && (
                                            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Store size={10}/> Réponse du fournisseur</p>
                                                <p className="text-sm font-medium text-blue-900">{selectedDispute.supplier_response}</p>
                                                {selectedDispute.supplier_evidence_url && (
                                                    <a href={selectedDispute.supplier_evidence_url} target="_blank" rel="noreferrer" className="mt-2 block">
                                                        <img src={selectedDispute.supplier_evidence_url} className="w-full max-h-40 object-cover rounded-xl" alt="preuve fournisseur"/>
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        {/* History collapsible */}
                                        <button onClick={() => setShowHistory(h => !h)} className="flex items-center gap-2 text-[10px] font-black text-base-content/40 uppercase tracking-widest">
                                            <History size={12}/> Historique {showHistory ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                                        </button>
                                        {showHistory && selectedDispute.status_history?.length > 0 && (
                                            <div className="space-y-1.5">
                                                {selectedDispute.status_history.map((h, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-base-content/50">
                                                        <span className="w-1.5 h-1.5 bg-base-300 rounded-full shrink-0"/>
                                                        <span className="capitalize">{h.status.replace('_', ' ')}</span>
                                                        <span className="text-base-content/30">—</span>
                                                        <span>{new Date(h.date).toLocaleDateString('fr-FR', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Partial refund amount */}
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest">Montant à rembourser (laisser vide = total)</p>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={refundAmount}
                                                    onChange={e => setRefundAmount(e.target.value)}
                                                    placeholder={`Max: ${Number(selectedDispute.order?.total_amount || 0).toLocaleString()} F`}
                                                    className="flex-1 bg-base-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-200 border-none"
                                                />
                                                <span className="text-xs font-black text-base-content/40">FCFA</span>
                                            </div>
                                        </div>

                                        {/* Resolution textarea */}
                                        <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest">Décision & Résolution</p>
                                        <textarea
                                            value={resolution}
                                            onChange={e => setResolution(e.target.value)}
                                            placeholder="Expliquez la décision (motif de remboursement, rejet, échange...)"
                                            className="w-full p-5 bg-base-200 rounded-[1.5rem] text-sm font-bold text-base-content placeholder:text-base-content/30 focus:ring-2 focus:ring-primary/20 min-h-[100px] border-none outline-none resize-none"
                                        />

                                        {/* Admin internal notes */}
                                        <textarea
                                            value={adminNotes}
                                            onChange={e => setAdminNotes(e.target.value)}
                                            placeholder="Notes internes (non visible par le client)..."
                                            rows={2}
                                            className="w-full p-4 bg-amber-50 rounded-[1.5rem] text-sm font-medium text-amber-900 placeholder:text-amber-300 focus:ring-2 focus:ring-amber-200 border-none outline-none resize-none"
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
                                                className="py-4 bg-base-200 text-base-content/50 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all disabled:opacity-50">
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
