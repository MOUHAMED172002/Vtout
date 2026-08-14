import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Megaphone, CheckCircle2, MessageCircle, Upload, Send, Eye, Wallet,
    ShieldCheck, Smartphone, Sparkles, ArrowRight, Camera, ShieldQuestion
} from "lucide-react";

// Landing marketing pour /devenir-annonceur, affichée AVANT le tableau de
// bord distributeur (/user/dashboard/distribution, protégé — redirige vers
// la connexion si non connecté). Même principe que DevenirLivreurLanding.jsx :
// structure inspirée d'une maquette de référence, mais contenu honnête —
// aucun chiffre ni témoignage inventé.
//
// Le taux de rémunération (FCFA par vue) est fixé PAR CAMPAGNE par l'admin
// (AdCampaign.rate_per_view, voir server/models/AdCampaign.js) — pas un taux
// fixe "1 vue = 1 FCFA" garanti sur tout le site, donc on ne l'affiche pas
// comme une constante. Le paiement est une action MANUELLE de l'admin après
// vérification des captures (voir adAdminController.js), avec un délai
// anti-fraude pour les nouveaux comptes (AdDistributorProfile.trust_level)
// — donc pas de promesse "instantané" ou "dès 1F".
const STEPS = [
    { num: 1, icon: <MessageCircle size={20} />, title: "Vérifiez votre compte", desc: "Confirmez votre numéro WhatsApp par code reçu et renseignez votre numéro Mobile Money pour être payé." },
    { num: 2, icon: <Megaphone size={20} />, title: "Réclamez une campagne", desc: "Choisissez une campagne publiée par Vtout parmi celles disponibles." },
    { num: 3, icon: <Send size={20} />, title: "Publiez en Statut", desc: "Postez le visuel en Statut WhatsApp et envoyez une 1ère capture dans l'heure qui suit." },
    { num: 4, icon: <Eye size={20} />, title: "Capture finale + vues", desc: "Juste avant les 24h, envoyez une 2nde capture avec le nombre de vues affiché sous votre Statut." },
    { num: 5, icon: <Wallet size={20} />, title: "Soyez payé", desc: "Après vérification par notre équipe, vous êtes payé selon les vues validées, sur votre Mobile Money." },
];

const WHY = [
    { icon: <Sparkles size={22} />, title: "Gagnez avec vos statuts", desc: "Ce que vous publiez déjà au quotidien peut aussi vous rapporter." },
    { icon: <Smartphone size={22} />, title: "100% accessible", desc: "Pas besoin d'être connu — tout le monde peut participer." },
    { icon: <ShieldCheck size={22} />, title: "Paiement vérifié", desc: "Chaque soumission est contrôlée avant tout versement." },
    { icon: <ShieldQuestion size={22} />, title: "Système transparent", desc: "Le calcul de votre gain dépend des vues réellement validées." },
];

export default function DevenirAnnonceurLanding() {
    const navigate = useNavigate();

    return (
        <div className="bg-base-100 min-h-screen">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-base-100 to-blue-50 pt-16 pb-20 px-6">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-5xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                            <Sparkles size={14} className="text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Nouveau sur Vtout</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-base-content leading-[1.05]">
                            Transformez votre <span className="text-primary">statut WhatsApp</span> en source de revenus.
                        </h1>
                        <p className="text-base-content/60 font-medium text-lg leading-relaxed">
                            Publiez nos annonces sur votre statut WhatsApp et soyez payé selon les vues validées. Simple, rapide et accessible à tous.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {["Rémunéré selon vos vues", "Paiement sur Mobile Money", "100% accessible à tous", "Vérification rapide de vos captures"].map((t) => (
                                <div key={t} className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                    <span className="text-sm font-bold text-base-content/70">{t}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => navigate('/user/dashboard/distribution')}
                            className="inline-flex items-center gap-2 bg-primary text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl active:scale-95 transition-all text-sm"
                        >
                            Je deviens annonceur maintenant
                            <ArrowRight size={16} />
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="relative"
                    >
                        <div className="aspect-square max-w-sm mx-auto rounded-[3rem] bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-2xl shadow-primary/30 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                            <Megaphone size={140} className="text-white relative z-10" strokeWidth={1.5} />
                        </div>
                        <div className="absolute -bottom-4 -left-4 bg-base-100 rounded-2xl shadow-xl p-4 border border-base-200 max-w-[240px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40 mb-1">Vous publiez, vous gagnez</p>
                            <p className="text-sm font-bold text-base-content/70">Vos contacts voient votre statut, vos vues sont comptabilisées.</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Comment ça marche */}
            <section className="max-w-5xl mx-auto px-6 py-20">
                <div className="text-center mb-12 space-y-3">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-base-content">
                        Comment <span className="text-primary">ça marche</span> ?
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
                    {STEPS.map((s, i) => (
                        <motion.div
                            key={s.num}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.06 }}
                            className="bg-base-200/50 rounded-3xl p-6 border border-base-200 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center">
                                    {s.icon}
                                </div>
                                <span className="text-3xl font-black text-primary/15">{String(s.num).padStart(2, '0')}</span>
                            </div>
                            <h3 className="font-black text-sm text-base-content">{s.title}</h3>
                            <p className="text-xs text-base-content/50 font-medium leading-relaxed">{s.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Des vues réelles, paiements sécurisés */}
            <section className="max-w-5xl mx-auto px-6 pb-20">
                <div className="text-center mb-8 space-y-2">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-base-content">
                        Des vues <span className="text-primary">réelles</span>, des paiements sécurisés
                    </h2>
                    <p className="text-base-content/50 font-medium text-sm max-w-xl mx-auto">
                        Pour garantir la transparence et éviter les fraudes, chaque soumission suit ce processus.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-base-200/50 rounded-3xl p-6 border border-base-200 space-y-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center"><Camera size={18} /></div>
                        <p className="font-black text-sm text-base-content">Capture 1</p>
                        <p className="text-xs text-base-content/50 font-medium">Juste après la publication de votre statut.</p>
                    </div>
                    <div className="bg-base-200/50 rounded-3xl p-6 border border-base-200 space-y-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center"><Camera size={18} /></div>
                        <p className="font-black text-sm text-base-content">Capture 2</p>
                        <p className="text-xs text-base-content/50 font-medium">Juste avant la disparition du statut (moins de 24h), avec le nombre de vues visible.</p>
                    </div>
                    <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 space-y-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center"><ShieldCheck size={18} /></div>
                        <p className="font-black text-sm text-emerald-700">Vérification par notre équipe</p>
                        <p className="text-xs text-emerald-600/70 font-medium">Nous contrôlons les captures et ne validons que les vues réelles avant tout versement.</p>
                    </div>
                </div>
            </section>

            {/* Pourquoi devenir annonceur */}
            <section className="max-w-5xl mx-auto px-6 pb-20">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-base-content">
                        Pourquoi devenir annonceur sur <span className="text-primary">Vtout</span> ?
                    </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {WHY.map((w) => (
                        <div key={w.title} className="text-center space-y-2">
                            <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                {w.icon}
                            </div>
                            <p className="font-black text-sm text-base-content">{w.title}</p>
                            <p className="text-xs text-base-content/50 font-medium leading-snug">{w.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Comment êtes-vous payé */}
            <section className="max-w-5xl mx-auto px-6 pb-20">
                <div className="bg-neutral text-white rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center"><Wallet size={18} /></div>
                        <h3 className="font-black text-lg">Comment êtes-vous payé ?</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { icon: <CheckCircle2 size={18} />, title: "Vérification", desc: "Vos vues sont validées après contrôle de vos deux captures." },
                            { icon: <Upload size={18} />, title: "Calcul du gain", desc: "Le montant est calculé selon les vues validées de la campagne." },
                            { icon: <Wallet size={18} />, title: "Versement", desc: "Vtout effectue le versement sur votre numéro Mobile Money." },
                        ].map((row) => (
                            <div key={row.title} className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2">
                                <span className="text-primary">{row.icon}</span>
                                <p className="font-black text-sm">{row.title}</p>
                                <p className="text-xs text-white/50 font-medium leading-relaxed">{row.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA final */}
            <section className="max-w-5xl mx-auto px-6 pb-20">
                <div className="rounded-[2.5rem] p-10 md:p-14 bg-gradient-to-br from-primary to-orange-400 text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                    <div className="relative z-10 space-y-6">
                        <h3 className="text-3xl md:text-4xl font-black tracking-tighter">Commencez à gagner dès aujourd'hui.</h3>
                        <p className="text-white/80 font-medium text-sm">De nouvelles campagnes sont publiées régulièrement — rejoignez les annonceurs Vtout.</p>
                        <button
                            onClick={() => navigate('/user/dashboard/distribution')}
                            className="inline-flex items-center gap-2 bg-base-100 text-base-content font-black px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all text-sm"
                        >
                            Je deviens annonceur maintenant
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Trust badges */}
            <section className="max-w-5xl mx-auto px-6 pb-16">
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                    {[
                        { icon: <ShieldCheck size={16} />, label: "Vérification avant paiement" },
                        { icon: <Smartphone size={16} />, label: "Accessible à tous" },
                        { icon: <Wallet size={16} />, label: "Versement sur Mobile Money" },
                        { icon: <MessageCircle size={16} />, label: "Support disponible" },
                    ].map((b) => (
                        <div key={b.label} className="flex items-center gap-2 text-base-content/50">
                            <span className="text-primary">{b.icon}</span>
                            <span className="text-xs font-bold">{b.label}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
