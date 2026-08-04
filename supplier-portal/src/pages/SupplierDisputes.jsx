import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/clerk-shim';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock, CheckCircle, XCircle, MessageSquare, ChevronRight, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';

const DISPUTE_STATUS = {
    ouvert:   { label: 'Ouvert',   color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',   icon: Clock },
    en_cours: { label: 'En cours', color: 'text-primary',  bg: 'bg-primary/10',  border: 'border-primary/20',  icon: MessageSquare },
    resolu:   { label: 'Résolu',   color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle },
    rejete:   { label: 'Rejeté',   color: 'text-rose-600',    bg: 'bg-rose-50',    border: 'border-rose-200',    icon: XCircle },
    annule:   { label: 'Annulé',   color: 'text-base-content/50',   bg: 'bg-base-200',   border: 'border-base-300',   icon: XCircle },
};

const REASON_LABELS = {
    produit_non_conforme: 'Produit non conforme',
    produit_endommage:    'Produit endommagé',
    commande_incomplete:  'Commande incomplète',
    retard_livraison:     'Retard de livraison',
    autre:                'Autre raison',
};

/* ─── Modal ─────────────────────────────────────────────────────────────── */
const DisputeResponseModal = ({ dispute, onClose, onSuccess }) => {
    const { getToken } = useAuth();
    const [response, setResponse] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!response.trim()) { toast.error('Veuillez rédiger une réponse'); return; }
        setSubmitting(true);
        try {
            const token = await getToken();
            await api.patch(`/suppliers/me/disputes/${dispute.id}/respond`, { response: response.trim() }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Réponse envoyée avec succès');
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.error || "Erreur lors de l'envoi de la réponse");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="bg-base-100 w-full sm:max-w-lg rounded-t-[2rem] sm:rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Handle bar on mobile */}
                <div className="w-10 h-1 bg-base-300 rounded-full mx-auto mb-6 sm:hidden" />

                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-lg sm:text-xl font-black text-base-content">Répondre au litige</h3>
                        <p className="text-[10px] font-bold text-base-content/40 mt-1 uppercase tracking-widest">
                            Commande #{dispute.order_id?.slice(-8).toUpperCase()}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-base-300 rounded-xl text-base-content/40 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="bg-base-200 rounded-2xl p-4 mb-5 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-base-content/40">Motif</span>
                        <span className="text-xs font-bold text-base-content/80">
                            {REASON_LABELS[dispute.reason] || dispute.reason}
                        </span>
                    </div>
                    {dispute.description && (
                        <p className="text-sm text-base-content/70 font-medium leading-relaxed">{dispute.description}</p>
                    )}
                </div>

                {dispute.supplier_response && (
                    <div className="bg-primary/10 border border-primary/10 rounded-2xl p-4 mb-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Votre réponse précédente</p>
                        <p className="text-sm text-primary font-medium">{dispute.supplier_response}</p>
                    </div>
                )}

                <textarea
                    value={response}
                    onChange={e => setResponse(e.target.value)}
                    rows={4}
                    placeholder="Expliquez votre position concernant ce litige..."
                    className="w-full p-4 rounded-2xl ring-1 ring-base-300 focus:ring-2 focus:ring-primary outline-none text-sm font-medium text-base-content placeholder:text-base-content/30 resize-none mb-5"
                />

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 rounded-2xl bg-base-300 text-base-content/70 text-[10px] font-black uppercase tracking-widest hover:brightness-95 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !response.trim()}
                        className="flex-1 py-3.5 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:brightness-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Send size={14} />
                        {submitting ? 'Envoi...' : 'Envoyer'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

/* ─── Card ───────────────────────────────────────────────────────────────── */
const DisputeCard = ({ dispute, onRespond }) => {
    const status = DISPUTE_STATUS[dispute.status] || DISPUTE_STATUS.ouvert;
    const StatusIcon = status.icon;
    const canRespond = ['ouvert', 'en_cours'].includes(dispute.status);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-base-100 rounded-3xl border border-base-300 shadow-sm p-5 flex flex-col gap-4"
        >
            {/* Top row: icon + title + badge */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 flex-shrink-0 ${status.bg} ${status.border} border rounded-2xl flex items-center justify-center`}>
                        <StatusIcon size={18} className={status.color} />
                    </div>
                    <div className="min-w-0">
                        <p className="font-black text-base-content text-sm truncate">
                            Commande #{dispute.order_id?.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs font-bold text-base-content/40 mt-0.5 line-clamp-1">
                            {REASON_LABELS[dispute.reason] || dispute.reason}
                        </p>
                    </div>
                </div>
                <span className={`flex-shrink-0 px-2.5 py-1 ${status.bg} ${status.color} text-[9px] font-black uppercase tracking-wider rounded-full border ${status.border}`}>
                    {status.label}
                </span>
            </div>

            {/* Description */}
            {dispute.description && (
                <p className="text-sm text-base-content/70 font-medium leading-relaxed bg-base-200 rounded-2xl p-4 line-clamp-3">
                    {dispute.description}
                </p>
            )}

            {/* Client + date */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-black uppercase tracking-widest text-base-content/40">
                {dispute.order?.guest_name && (
                    <span className="truncate">Client : {dispute.order.guest_name}</span>
                )}
                <span className="ml-auto">
                    {new Date(dispute.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
            </div>

            {/* Supplier response preview */}
            {dispute.supplier_response && (
                <div className="bg-primary/10 rounded-2xl p-4 border border-primary/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Votre réponse</p>
                    <p className="text-sm text-primary font-medium line-clamp-2">{dispute.supplier_response}</p>
                </div>
            )}

            {canRespond && (
                <button
                    onClick={() => onRespond(dispute)}
                    className="w-full py-3.5 rounded-2xl bg-neutral text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2"
                >
                    <MessageSquare size={13} />
                    {dispute.supplier_response ? 'Modifier ma réponse' : 'Répondre au litige'}
                    <ChevronRight size={13} />
                </button>
            )}
        </motion.div>
    );
};

/* ─── Page ───────────────────────────────────────────────────────────────── */
const FILTER_TABS = ['all', 'ouvert', 'en_cours', 'resolu', 'rejete', 'annule'];

const SupplierDisputes = () => {
    const { getToken } = useAuth();
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedDispute, setSelectedDispute] = useState(null);

    const fetchDisputes = async () => {
        try {
            const token = await getToken();
            const res = await api.get('/suppliers/me/disputes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDisputes(res.data || []);
        } catch {
            toast.error('Erreur de chargement des litiges');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDisputes(); }, []);

    const counts = {
        all:      disputes.length,
        ouvert:   disputes.filter(d => d.status === 'ouvert').length,
        en_cours: disputes.filter(d => d.status === 'en_cours').length,
        resolu:   disputes.filter(d => d.status === 'resolu').length,
        rejete:   disputes.filter(d => d.status === 'rejete').length,
        annule:   disputes.filter(d => d.status === 'annule').length,
    };

    const filtered = filterStatus === 'all' ? disputes : disputes.filter(d => d.status === filterStatus);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center font-black animate-pulse text-base-content/30">
            CHARGEMENT...
        </div>
    );

    return (
        <div className="p-4 sm:p-6 md:p-12 min-h-screen bg-base-200 space-y-6 md:space-y-10 pb-32 md:pb-12">

            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-base-content mb-1">
                    Mes Litiges
                </h1>
                <p className="text-base-content/50 font-bold uppercase tracking-[0.2em] text-[10px]">
                    Réclamations clients sur vos commandes
                </p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { key: 'ouvert',   label: 'Ouverts',  color: 'text-amber-600',   bg: 'bg-amber-50' },
                    { key: 'en_cours', label: 'En cours', color: 'text-primary',  bg: 'bg-primary/10' },
                    { key: 'resolu',   label: 'Résolus',  color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { key: 'rejete',   label: 'Rejetés',  color: 'text-rose-600',    bg: 'bg-rose-50' },
                ].map(({ key, label, color, bg }) => (
                    <button
                        key={key}
                        onClick={() => setFilterStatus(key)}
                        className={`${bg} rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-left transition-all ${filterStatus === key ? 'ring-2 ring-offset-2 ring-base-content' : ''}`}
                    >
                        <p className={`text-2xl sm:text-3xl font-black ${color}`}>{counts[key]}</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${color} opacity-70 mt-1`}>{label}</p>
                    </button>
                ))}
            </div>

            {/* Filter tabs — scrollable single row */}
            <div className="w-full overflow-x-auto no-scrollbar">
                <div className="flex gap-1 bg-base-100 p-1.5 rounded-full ring-1 ring-base-300 flex-nowrap w-max">
                    {FILTER_TABS.map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 sm:px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                                filterStatus === status
                                    ? 'bg-neutral text-white shadow-md'
                                    : 'text-base-content/50 hover:text-base-content hover:bg-base-200'
                            }`}
                        >
                            {status === 'all'
                                ? `Tous (${counts.all})`
                                : DISPUTE_STATUS[status]?.label || status}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-base-300 rounded-3xl flex items-center justify-center mb-6">
                        <AlertCircle size={30} className="text-base-content/30" />
                    </div>
                    <p className="font-black text-base-content text-lg sm:text-xl">Aucun litige</p>
                    <p className="text-sm text-base-content/40 font-medium mt-2 max-w-xs">
                        {filterStatus === 'all'
                            ? "Vous n'avez pas encore de litiges clients."
                            : 'Aucun litige avec ce statut.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {filtered.map(dispute => (
                        <DisputeCard key={dispute.id} dispute={dispute} onRespond={setSelectedDispute} />
                    ))}
                </div>
            )}

            <AnimatePresence>
                {selectedDispute && (
                    <DisputeResponseModal
                        dispute={selectedDispute}
                        onClose={() => setSelectedDispute(null)}
                        onSuccess={fetchDisputes}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default SupplierDisputes;
