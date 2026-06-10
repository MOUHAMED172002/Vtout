import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/clerk-shim';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock, CheckCircle, XCircle, MessageSquare, Package, ChevronRight, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';

const DISPUTE_STATUS = {
    ouvert:    { label: 'Ouvert',    color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-200',  icon: Clock },
    en_cours:  { label: 'En cours',  color: 'text-indigo-600', bg: 'bg-indigo-50',  border: 'border-indigo-200', icon: MessageSquare },
    resolu:    { label: 'Résolu',    color: 'text-emerald-600',bg: 'bg-emerald-50', border: 'border-emerald-200',icon: CheckCircle },
    rejete:    { label: 'Rejeté',    color: 'text-rose-600',   bg: 'bg-rose-50',    border: 'border-rose-200',   icon: XCircle },
    annule:    { label: 'Annulé',    color: 'text-slate-500',  bg: 'bg-slate-50',   border: 'border-slate-200',  icon: XCircle },
};

const REASON_LABELS = {
    produit_non_conforme: 'Produit non conforme',
    produit_endommage:    'Produit endommagé',
    commande_incomplete:  'Commande incomplète',
    retard_livraison:     'Retard de livraison',
    autre:                'Autre raison',
};

const DisputeResponseModal = ({ dispute, onClose, onSuccess }) => {
    const { getToken } = useAuth();
    const [response, setResponse] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!response.trim()) {
            toast.error('Veuillez rédiger une réponse');
            return;
        }
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
            toast.error(err.response?.data?.error || 'Erreur lors de l\'envoi de la réponse');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Répondre au litige</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                            Commande #{dispute.order_id?.slice(-8).toUpperCase()}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Dispute info */}
                <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Motif</span>
                        <span className="text-xs font-bold text-slate-700">
                            {REASON_LABELS[dispute.reason] || dispute.reason}
                        </span>
                    </div>
                    {dispute.description && (
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{dispute.description}</p>
                    )}
                </div>

                {/* Existing supplier response */}
                {dispute.supplier_response && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Votre réponse précédente</p>
                        <p className="text-sm text-indigo-800 font-medium">{dispute.supplier_response}</p>
                    </div>
                )}

                <textarea
                    value={response}
                    onChange={e => setResponse(e.target.value)}
                    rows={5}
                    placeholder="Expliquez votre position concernant ce litige..."
                    className="w-full p-4 rounded-2xl ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-400 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-300 resize-none mb-6"
                />

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !response.trim()}
                        className="flex-1 py-3.5 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Send size={14} />
                        {submitting ? 'Envoi...' : 'Envoyer'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const DisputeCard = ({ dispute, onRespond }) => {
    const status = DISPUTE_STATUS[dispute.status] || DISPUTE_STATUS.ouvert;
    const StatusIcon = status.icon;
    const canRespond = ['ouvert', 'en_cours'].includes(dispute.status);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${status.bg} ${status.border} border rounded-2xl flex items-center justify-center flex-shrink-0`}>
                        <StatusIcon size={18} className={status.color} />
                    </div>
                    <div>
                        <p className="font-black text-slate-900 text-sm">
                            Commande #{dispute.order_id?.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">
                            {REASON_LABELS[dispute.reason] || dispute.reason}
                        </p>
                    </div>
                </div>
                <span className={`px-3 py-1 ${status.bg} ${status.color} text-[10px] font-black uppercase tracking-widest rounded-full border ${status.border} whitespace-nowrap`}>
                    {status.label}
                </span>
            </div>

            {dispute.description && (
                <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 rounded-2xl p-4">
                    {dispute.description}
                </p>
            )}

            {/* Client + date */}
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                {dispute.order?.guest_name && (
                    <span>Client : {dispute.order.guest_name}</span>
                )}
                <span>{new Date(dispute.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>

            {/* Supplier response preview */}
            {dispute.supplier_response && (
                <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Votre réponse</p>
                    <p className="text-sm text-indigo-800 font-medium line-clamp-2">{dispute.supplier_response}</p>
                </div>
            )}

            {canRespond && (
                <button
                    onClick={() => onRespond(dispute)}
                    className="w-full py-3.5 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                >
                    <MessageSquare size={14} />
                    {dispute.supplier_response ? 'Modifier ma réponse' : 'Répondre au litige'}
                    <ChevronRight size={14} />
                </button>
            )}
        </motion.div>
    );
};

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
        } catch (err) {
            toast.error('Erreur de chargement des litiges');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDisputes();
    }, []);

    const filtered = filterStatus === 'all'
        ? disputes
        : disputes.filter(d => d.status === filterStatus);

    const counts = {
        all: disputes.length,
        ouvert: disputes.filter(d => d.status === 'ouvert').length,
        en_cours: disputes.filter(d => d.status === 'en_cours').length,
        resolu: disputes.filter(d => d.status === 'resolu').length,
        rejete: disputes.filter(d => d.status === 'rejete').length,
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center font-black animate-pulse text-slate-300">
            CHARGEMENT...
        </div>
    );

    return (
        <div className="p-6 md:p-12 min-h-screen bg-slate-50 space-y-10 pb-32 md:pb-12">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Mes Litiges</h1>
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                    Réclamations clients sur vos commandes
                </p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { key: 'ouvert',   label: 'Ouverts',   color: 'text-amber-600',   bg: 'bg-amber-50' },
                    { key: 'en_cours', label: 'En cours',  color: 'text-indigo-600',  bg: 'bg-indigo-50' },
                    { key: 'resolu',   label: 'Résolus',   color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { key: 'rejete',   label: 'Rejetés',   color: 'text-rose-600',    bg: 'bg-rose-50' },
                ].map(({ key, label, color, bg }) => (
                    <div key={key} className={`${bg} rounded-3xl p-5`}>
                        <p className={`text-3xl font-black ${color}`}>{counts[key]}</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${color} opacity-70 mt-1`}>{label}</p>
                    </div>
                ))}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 bg-white p-2 rounded-full ring-1 ring-slate-200 overflow-x-auto no-scrollbar flex-nowrap w-fit">
                {['all', 'ouvert', 'en_cours', 'resolu', 'rejete', 'annule'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                            filterStatus === status
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                        }`}
                    >
                        {status === 'all' ? `Tous (${counts.all})` : (DISPUTE_STATUS[status]?.label || status)}
                    </button>
                ))}
            </div>

            {/* Dispute list */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
                        <AlertCircle size={36} className="text-slate-300" />
                    </div>
                    <p className="font-black text-slate-900 text-xl">Aucun litige</p>
                    <p className="text-sm text-slate-400 font-medium mt-2">
                        {filterStatus === 'all'
                            ? 'Vous n\'avez pas encore de litiges clients.'
                            : 'Aucun litige avec ce statut.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map(dispute => (
                        <DisputeCard
                            key={dispute.id}
                            dispute={dispute}
                            onRespond={setSelectedDispute}
                        />
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
