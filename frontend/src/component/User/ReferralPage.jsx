import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../lib/AuthHooks";
import { Share2, Copy, Check, Gift, Users, Clock, MessageCircle, Facebook, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getMyReferralInfo } from "../../services/referralService";

export default function ReferralPage() {
    const { getToken } = useAuth();
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const fetchInfo = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const data = await getMyReferralInfo(token);
            setInfo(data);
        } catch (err) {
            toast.error("Impossible de charger vos informations de parrainage.");
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => { fetchInfo(); }, [fetchInfo]);

    const handleCopy = () => {
        if (!info?.shareUrl) return;
        navigator.clipboard.writeText(info.shareUrl);
        setCopied(true);
        toast.success("Lien copié !");
        setTimeout(() => setCopied(false), 2000);
    };

    const shareWhatsApp = () => {
        if (!info?.shareUrl) return;
        const text = encodeURIComponent(
            `Rejoins-moi sur Vtout, la marketplace N°1 du Bénin ! Inscris-toi avec mon lien et profite d'un avantage de bienvenue 🎁\n${info.shareUrl}`
        );
        window.open(`https://wa.me/?text=${text}`, "_blank");
    };

    const shareFacebook = () => {
        if (!info?.shareUrl) return;
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(info.shareUrl)}`, "_blank");
    };

    const isActive = info && (Number(info.referrerReward) > 0 || Number(info.referredReward) > 0);

    if (loading) {
        return <div className="py-20 text-center text-base-content/40 text-sm">Chargement…</div>;
    }

    if (!isActive) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-3xl flex items-center justify-center">
                    <Share2 size={28} />
                </div>
                <h2 className="text-xl font-black text-base-content">Le parrainage arrive bientôt</h2>
                <p className="text-sm text-base-content/50">
                    Le programme n'est pas encore activé. Revenez bientôt pour inviter vos proches et gagner des récompenses !
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <Share2 size={22} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-base-content">Parrainez vos proches</h1>
                    <p className="text-sm text-base-content/50 mt-0.5">
                        Gagnez {Number(info.referrerReward).toLocaleString("fr-FR")} FCFA pour chaque ami qui commande sur Vtout.
                    </p>
                </div>
            </div>

            <Link
                to="/comment-ca-marche/parrainage"
                className="flex items-center justify-between px-5 py-3 bg-base-100 border border-base-200 rounded-2xl text-sm font-bold text-base-content/70 hover:text-primary hover:border-primary/20 transition-all group"
            >
                Voir le détail des étapes du parrainage
                <ChevronRight size={16} className="text-base-content/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>

            {/* Share card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary to-primary/70 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-primary/20"
            >
                <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">Votre code personnel</p>
                <p className="text-4xl font-black tracking-[0.1em] mb-5">{info.code}</p>

                <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-2xl p-1.5 pl-4">
                    <span className="flex-1 text-sm font-semibold truncate">{info.shareUrl}</span>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 bg-white text-primary px-4 py-2.5 rounded-xl text-sm font-black hover:bg-white/90 transition-colors shrink-0"
                    >
                        {copied ? <Check size={15} /> : <Copy size={15} />}
                        {copied ? "Copié" : "Copier"}
                    </button>
                </div>

                <div className="flex items-center gap-2 mt-4">
                    <button
                        onClick={shareWhatsApp}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-sm font-bold transition-colors"
                    >
                        <MessageCircle size={16} /> WhatsApp
                    </button>
                    <button
                        onClick={shareFacebook}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold transition-colors"
                    >
                        <Facebook size={16} /> Facebook
                    </button>
                </div>
            </motion.div>

            {/* How it works */}
            <div className="bg-base-100 rounded-3xl border border-base-200 shadow-sm p-6 space-y-4">
                <h3 className="font-black text-base-content">Comment ça marche</h3>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { icon: Share2, title: "1. Partagez", desc: "Envoyez votre lien à vos amis et votre famille." },
                        { icon: Gift, title: "2. Ils s'inscrivent", desc: `Votre filleul reçoit ${Number(info.referredReward).toLocaleString("fr-FR")} F de bienvenue.` },
                        { icon: Users, title: "3. Vous gagnez", desc: `À sa 1ère commande confirmée, vous recevez ${Number(info.referrerReward).toLocaleString("fr-FR")} F.` },
                    ].map((s, i) => (
                        <div key={i} className="space-y-2">
                            <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                <s.icon size={16} />
                            </div>
                            <p className="text-sm font-black text-base-content">{s.title}</p>
                            <p className="text-xs text-base-content/50">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Invités", value: info.totalInvited, icon: Users },
                    { label: "Récompensés", value: info.totalRewarded, icon: Gift },
                    { label: "En attente", value: info.pendingCount, icon: Clock },
                ].map((c, i) => (
                    <div key={i} className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-4 text-center">
                        <c.icon size={16} className="mx-auto text-primary mb-1.5" />
                        <p className="text-xl font-black text-base-content">{c.value}</p>
                        <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">{c.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
