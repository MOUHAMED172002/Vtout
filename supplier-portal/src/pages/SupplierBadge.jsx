import React, { useState, useEffect, useCallback } from 'react';
import { BadgeCheck, ShieldCheck, Clock, History, ChevronRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../components/clerk-shim';
import { getMyBadgeStatus, subscribeToBadge } from '../services/badgeService';

const MONTH_OPTIONS = [1, 3, 6, 12];

export default function SupplierBadge() {
    const { getToken } = useAuth();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);
    const [selectedMonths, setSelectedMonths] = useState(1);

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
            const { checkoutUrl } = await subscribeToBadge(token, selectedMonths);
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
    const monthlyPrice = Number(status?.monthly_price || 0);
    const totalPrice = monthlyPrice * selectedMonths;

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-12">
            {/* Header / Summary Card */}
            <div className="bg-neutral rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl shadow-base-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px] -mr-32 -mt-32 rounded-full"></div>

                <div className="relative z-10 space-y-6 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md ${isCertified ? 'bg-blue-500/20' : 'bg-white/10'}`}>
                            <BadgeCheck size={26} className={isCertified ? 'text-blue-400' : 'text-base-content/40'} />
                        </div>
                        <div className="text-left">
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-base-content/40">Badge Vendeur Certifié</span>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                {isCertified ? 'Votre boutique est certifiée' : 'Pas encore certifié'}
                            </h1>
                        </div>
                    </div>

                    {isCertified ? (
                        <>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-bold text-base-content/30">
                                <Clock size={16} className="text-blue-400" />
                                Actif jusqu'au {expiresAt?.toLocaleDateString('fr-FR')}
                            </div>

                            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-[2rem] px-8 py-5">
                                <CheckCircle2 size={22} className="text-blue-400" />
                                <div className="text-left">
                                    <p className="text-3xl font-black tracking-tighter leading-none">
                                        {daysLeft} <span className="text-sm font-black text-base-content/40 uppercase tracking-widest">jour{daysLeft > 1 ? 's' : ''} restant{daysLeft > 1 ? 's' : ''}</span>
                                    </p>
                                </div>
                            </div>

                            <button
                                disabled
                                className="bg-white/5 text-base-content/40 px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center gap-3 cursor-not-allowed border border-white/10"
                            >
                                Badge déjà actif
                            </button>

                            <p className="text-[11px] font-bold text-base-content/50">
                                Le renouvellement sera possible à l'expiration de votre abonnement actuel.
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-sm font-bold text-base-content/30 max-w-md">
                                Activez le badge "Certifié" pour rassurer vos clients et vous démarquer sur tous vos produits.
                            </p>

                            <div className="space-y-3">
                                <p className="text-[11px] font-black uppercase tracking-widest text-base-content/40">Choisissez la durée</p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                    {MONTH_OPTIONS.map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setSelectedMonths(m)}
                                            className={`px-5 py-3 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${
                                                selectedMonths === m
                                                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                                    : 'border-white/10 text-base-content/40 hover:border-white/20'
                                            }`}
                                        >
                                            {m} mois
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleSubscribe}
                                disabled={subscribing}
                                className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/40 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-60 disabled:hover:scale-100"
                            >
                                {subscribing ? 'Redirection…' : `Activer pour ${totalPrice.toLocaleString('fr-FR')} FCFA`}
                                <ChevronRight size={18} />
                            </button>

                            <p className="text-[11px] font-bold text-base-content/40">
                                {monthlyPrice.toLocaleString('fr-FR')} FCFA / mois × {selectedMonths} mois · Paiement sécurisé via FedaPay
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Avantages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: ShieldCheck, title: 'Confiance client', desc: 'Le badge rassure les acheteurs et augmente le taux de conversion.' },
                    { icon: Sparkles, title: 'Visible partout', desc: 'Affiché automatiquement sur tous vos produits, sans action supplémentaire.' },
                    { icon: BadgeCheck, title: 'Multi-mois', desc: 'Payez pour 1, 3, 6 ou 12 mois en une seule fois, comme vous le souhaitez.' },
                ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="bg-base-100 p-6 rounded-3xl border border-base-200 shadow-sm space-y-3">
                        <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <Icon size={20} />
                        </div>
                        <p className="font-black text-base-content text-sm">{title}</p>
                        <p className="text-xs font-bold text-base-content/40 leading-relaxed">{desc}</p>
                    </div>
                ))}
            </div>

            {/* Historique */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 px-4">
                    <History size={18} className="text-base-content/40" />
                    <h3 className="text-xl font-black text-base-content tracking-tight">Historique des paiements</h3>
                </div>

                <div className="space-y-4">
                    {status?.history?.length > 0 ? status.history.map(h => (
                        <div key={h.id} className="bg-base-100 p-6 rounded-3xl border border-base-200 flex items-center justify-between gap-4 shadow-sm">
                            <div>
                                <p className="font-black text-base-content text-sm">
                                    {new Date(h.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                                <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest mt-1">
                                    {Number(h.amount).toLocaleString('fr-FR')} FCFA · {h.months || 1} mois
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
                        <div className="text-center py-10 bg-base-200 rounded-3xl text-base-content/40 font-bold text-sm">
                            Aucun paiement effectué pour le moment.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
