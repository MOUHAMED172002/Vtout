import React, { useState, useEffect, useCallback } from 'react';
import { BadgeCheck, ShieldCheck, Clock, History, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../components/clerk-shim';
import { getMyBadgeStatus, subscribeToBadge } from '../services/badgeService';

export default function SupplierBadge() {
    const { getToken } = useAuth();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);

    const fetchStatus = useCallback(async () => {
        try {
            const token = await getToken();
            const data = await getMyBadgeStatus(token);
            setStatus(data);
        } catch (err) {
            toast.error("Erreur de chargement du statut du badge");
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => { fetchStatus(); }, [fetchStatus]);

    const handleSubscribe = async () => {
        setSubscribing(true);
        try {
            const token = await getToken();
            const { checkoutUrl } = await subscribeToBadge(token);
            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            } else {
                toast.error("Impossible de générer le lien de paiement");
            }
        } catch (err) {
            toast.error(err.response?.data?.error || "Erreur lors de la création du paiement");
        } finally {
            setSubscribing(false);
        }
    };

    if (loading) return <div className="p-20 text-center"><span className="loading loading-spinner loading-lg"></span></div>;

    const isCertified = status?.is_certified;
    const expiresAt = status?.certified_badge_expires_at ? new Date(status.certified_badge_expires_at) : null;
    const daysLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24))) : 0;

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-12">
            {/* Header / Summary Card */}
            <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px] -mr-32 -mt-32 rounded-full"></div>

                <div className="relative z-10 space-y-6 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md ${isCertified ? 'bg-blue-500/20' : 'bg-white/10'}`}>
                            <BadgeCheck size={26} className={isCertified ? 'text-blue-400' : 'text-slate-400'} />
                        </div>
                        <div className="text-left">
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Badge Vendeur Certifié</span>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                {isCertified ? 'Votre boutique est certifiée' : 'Pas encore certifié'}
                            </h1>
                        </div>
                    </div>

                    {isCertified ? (
                        <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-bold text-slate-300">
                            <Clock size={16} className="text-blue-400" />
                            Actif jusqu'au {expiresAt?.toLocaleDateString('fr-FR')} ({daysLeft} jour{daysLeft > 1 ? 's' : ''} restant{daysLeft > 1 ? 's' : ''})
                        </div>
                    ) : (
                        <p className="text-sm font-bold text-slate-300 max-w-md">
                            Activez le badge "Certifié" pour rassurer vos clients et vous démarquer sur tous vos produits.
                        </p>
                    )}

                    <button
                        onClick={handleSubscribe}
                        disabled={subscribing}
                        className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/40 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-60 disabled:hover:scale-100"
                    >
                        {subscribing ? 'Redirection…' : isCertified ? 'Renouveler le badge' : 'Activer le badge'}
                        <ChevronRight size={18} />
                    </button>

                    <p className="text-[11px] font-bold text-slate-400">
                        {Number(status?.monthly_price || 0).toLocaleString('fr-FR')} FCFA / mois · Paiement sécurisé via FedaPay
                    </p>
                </div>
            </div>

            {/* Avantages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: ShieldCheck, title: 'Confiance client', desc: 'Le badge rassure les acheteurs et augmente le taux de conversion.' },
                    { icon: Sparkles, title: 'Visible partout', desc: 'Affiché automatiquement sur tous vos produits, sans action supplémentaire.' },
                    { icon: BadgeCheck, title: 'Renouvelable', desc: 'Valable 30 jours, renouvelable en un clic avant expiration.' },
                ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm space-y-3">
                        <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <Icon size={20} />
                        </div>
                        <p className="font-black text-slate-900 text-sm">{title}</p>
                        <p className="text-xs font-bold text-slate-400 leading-relaxed">{desc}</p>
                    </div>
                ))}
            </div>

            {/* Historique */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 px-4">
                    <History size={18} className="text-slate-400" />
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Historique des paiements</h3>
                </div>

                <div className="space-y-4">
                    {status?.history?.length > 0 ? status.history.map(h => (
                        <div key={h.id} className="bg-white p-6 rounded-3xl border border-slate-50 flex items-center justify-between gap-4 shadow-sm">
                            <div>
                                <p className="font-black text-slate-900 text-sm">
                                    {new Date(h.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    {Number(h.amount).toLocaleString('fr-FR')} FCFA
                                </p>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                h.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                                h.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                'bg-rose-50 text-rose-600'
                            }`}>
                                {h.status === 'paid' ? 'Payé' : h.status === 'pending' ? 'En attente' : 'Échoué'}
                            </span>
                        </div>
                    )) : (
                        <div className="text-center py-10 bg-slate-50 rounded-3xl text-slate-400 font-bold text-sm">
                            Aucun paiement effectué pour le moment.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
