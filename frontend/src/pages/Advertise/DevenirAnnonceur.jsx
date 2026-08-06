import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Megaphone, Smartphone, Eye, ShieldCheck, TrendingUp,
    MessageCircle, ArrowRight, CheckCircle2, Users, Clock,
} from "lucide-react";

// Page publique "Devenir annonceur" — présente le réseau de distribution
// publicitaire via Statuts WhatsApp (voir DistributionPage.jsx côté distributeur
// et AdDistributionManager.jsx côté admin). Les campagnes sont créées par
// l'équipe Vtout : pas d'auto-service pour l'instant, donc cette page
// débouche sur une prise de contact WhatsApp plutôt qu'un formulaire de
// création de campagne.
const ADMIN_WA = import.meta.env.VITE_ADMIN_WHATSAPP || "22900000000";

const benefits = [
    {
        icon: <Users size={22} />,
        title: "Un vrai réseau de diffusion",
        desc: "Votre visuel est publié en Statut WhatsApp par des dizaines de distributeurs vérifiés partout au Bénin — une portée locale que la pub classique n'atteint pas.",
    },
    {
        icon: <Eye size={22} />,
        title: "Vous ne payez que les vues",
        desc: "Le tarif est fixé par vue réellement obtenue sur chaque Statut, avec un plafond par diffusion si vous le souhaitez. Pas de vue, pas de facture.",
    },
    {
        icon: <ShieldCheck size={22} />,
        title: "Anti-fraude intégré",
        desc: "Double capture d'écran, vérification par hash d'image, contrôles aléatoires en direct : chaque diffusion est vérifiée avant validation.",
    },
    {
        icon: <Clock size={22} />,
        title: "Résultats sous 24-48h",
        desc: "Chaque distributeur diffuse votre visuel pendant les 24h du Statut WhatsApp. Les vues remontent et sont vérifiées dans la foulée par notre équipe.",
    },
];

const steps = [
    { num: 1, title: "Contactez-nous", desc: "Décrivez votre produit, votre budget et votre zone cible via WhatsApp." },
    { num: 2, title: "Votre visuel est validé", desc: "Nous préparons la campagne avec votre image, votre tarif par vue et votre budget maximum." },
    { num: 3, title: "Diffusion sur le réseau", desc: "Les distributeurs disponibles réclament votre campagne et la publient en Statut WhatsApp." },
    { num: 4, title: "Vous suivez les résultats", desc: "Nombre de vues vérifiées et coût total vous sont communiqués à la fin de la diffusion." },
];

export default function DevenirAnnonceur() {
    const navigate = useNavigate();

    const goWhatsApp = () => {
        const text = "Bonjour, je souhaite lancer une campagne de distribution publicitaire via Statuts WhatsApp sur Vtout.";
        window.open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(text)}`, "_blank");
    };

    return (
        <div className="min-h-screen bg-base-100">
            {/* Hero */}
            <section className="relative pt-24 pb-16 overflow-hidden bg-blue-50">
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(0,84,166,0.07)' }} />
                <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none" style={{ background: 'rgba(243,112,33,0.06)' }} />

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-12 shadow-xl shadow-primary/5"
                    >
                        <Megaphone size={40} />
                    </motion.div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-5"
                        style={{ background: 'rgba(0,84,166,0.08)', borderColor: 'rgba(0,84,166,0.2)' }}>
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#0054a6' }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#0054a6' }}>Distribution WhatsApp Status</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-base-content tracking-tighter leading-tight">
                        Devenir <span className="text-primary underline decoration-primary/20">Annonceur.</span>
                    </h1>
                    <p className="text-base-content/60 font-bold max-w-lg mx-auto text-lg mt-4">
                        Faites diffuser votre pub sur des centaines de Statuts WhatsApp au Bénin, et ne payez que pour les vues réellement obtenues.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                        <button
                            onClick={goWhatsApp}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            <MessageCircle size={18} />
                            Lancer une campagne
                        </button>
                        <button
                            onClick={() => navigate('/user/dashboard/distribution')}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 font-bold px-8 py-4 rounded-2xl transition-all active:scale-95"
                            style={{ borderColor: 'rgba(243,112,33,0.35)', color: '#f37021' }}
                        >
                            Devenir distributeur plutôt
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-16 max-w-5xl mx-auto px-6">
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-black text-base-content tracking-tighter">Pourquoi diffuser via Vtout ?</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {benefits.map((b, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.07 }}
                            className="bg-base-100 rounded-3xl p-7 border border-base-200 shadow-sm hover:shadow-xl hover:border-base-300 transition-all duration-400"
                        >
                            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                                {b.icon}
                            </div>
                            <h3 className="text-lg font-black text-base-content mb-2 tracking-tight">{b.title}</h3>
                            <p className="text-base-content/50 font-medium leading-relaxed text-sm">{b.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Steps */}
            <section className="py-16 bg-base-200/50">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-black text-base-content tracking-tighter">Comment ça marche ?</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {steps.map((s) => (
                            <div key={s.num} className="bg-base-100 rounded-3xl p-7 border border-base-200 shadow-sm">
                                <span className="text-4xl font-black text-primary opacity-15">{String(s.num).padStart(2, '0')}</span>
                                <h3 className="text-base font-black text-base-content mt-3 mb-2 tracking-tight">{s.title}</h3>
                                <p className="text-base-content/50 font-medium leading-relaxed text-sm">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust points */}
            <section className="py-16 max-w-3xl mx-auto px-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        "Tarif par vue défini par vous",
                        "Plafond de budget par diffusion",
                        "Vues vérifiées par notre équipe",
                    ].map((t, i) => (
                        <div key={i} className="flex items-center gap-3 bg-base-100 border border-base-200 rounded-2xl p-5">
                            <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                            <span className="font-bold text-base-content text-sm">{t}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA banner */}
            <section className="pb-20 max-w-5xl mx-auto px-6">
                <div className="rounded-[2.5rem] p-10 md:p-14 bg-gradient-to-br from-[#0054a6] to-[#1a73e8] text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-base-100/10 rounded-full blur-[60px] pointer-events-none" />
                    <div className="relative z-10">
                        <TrendingUp size={36} className="mx-auto mb-4 text-white/80" />
                        <h3 className="text-3xl md:text-4xl font-black tracking-tighter mb-3">Prêt à lancer votre campagne ?</h3>
                        <p className="text-white/80 font-medium mb-7 max-w-md mx-auto text-sm">
                            Écrivez-nous sur WhatsApp avec votre visuel et votre budget — nous mettons votre campagne en ligne rapidement.
                        </p>
                        <button
                            onClick={goWhatsApp}
                            className="inline-flex items-center gap-2 bg-base-100 text-base-content font-black px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all text-sm"
                        >
                            <Smartphone size={16} />
                            Contacter Vtout sur WhatsApp
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
