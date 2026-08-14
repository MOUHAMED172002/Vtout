import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Truck, CheckCircle2, MapPin, Wallet, Bell, Navigation, Package,
    ShieldCheck, Smartphone, Clock, Users, HeadphonesIcon, ArrowRight,
    Zap, Ban
} from "lucide-react";

// Page d'atterrissage marketing affichée sur /devenir-livreur AVANT le
// formulaire d'inscription (déplacé sur /devenir-livreur/inscription) —
// inspirée d'une maquette de référence fournie par l'équipe, structure
// reprise (hero, avantages, étapes, exemple de gains, CTA final) mais avec
// un contenu volontairement honnête : pas de témoignages ni de compteurs
// d'utilisateurs inventés (aucune donnée réelle disponible pour ça), et pas
// de promesse "100% des frais pour vous" — le modèle réel de rémunération
// (voir server/services/financialService.js) ne reverse pas l'intégralité
// du frais de livraison embarqué au livreur, donc on décrit le mécanisme
// sans chiffre non vérifiable.
const ADVANTAGES = [
    { icon: <MapPin size={22} />, title: "Des courses près de vous", desc: "Consultez les livraisons disponibles dans les communes que vous couvrez." },
    { icon: <Wallet size={22} />, title: "Gain visible à l'avance", desc: "Le montant de la course est affiché avant que vous ne l'acceptiez." },
    { icon: <CheckCircle2 size={22} />, title: "Vous choisissez", desc: "Acceptez uniquement les courses qui vous conviennent, personne ne vous impose rien." },
    { icon: <Zap size={22} />, title: "Paiement après chaque livraison", desc: "Vos gains sont crédités sur votre portefeuille Vtout dès la livraison confirmée." },
];

const STEPS = [
    { num: 1, icon: <Smartphone size={20} />, title: "Consultez les courses", desc: "Connectez-vous et voyez les livraisons disponibles près de vous." },
    { num: 2, icon: <Navigation size={20} />, title: "Vérifiez les infos", desc: "Lieu de récupération, destination et montant de la course avant d'accepter." },
    { num: 3, icon: <CheckCircle2 size={20} />, title: "Acceptez la course", desc: "Si la course vous convient, acceptez-la en un clic." },
    { num: 4, icon: <Package size={20} />, title: "Récupérez le colis", desc: "Rendez-vous chez le vendeur et récupérez la commande." },
    { num: 5, icon: <Truck size={20} />, title: "Livrez au client", desc: "Remettez la commande au client, encaissez si paiement à la réception." },
    { num: 6, icon: <Wallet size={20} />, title: "Recevez votre gain", desc: "Une fois la livraison confirmée par le code client, vos gains sont crédités." },
];

const WHY_VTOUT = [
    "Rémunération versée à chaque livraison confirmée",
    "Courses proches de votre zone de service",
    "Application simple, accessible depuis votre téléphone",
    "Support Vtout disponible en cas de souci",
];

const TRUST_BADGES = [
    { icon: <ShieldCheck size={16} />, label: "Inscription gratuite" },
    { icon: <Ban size={16} />, label: "Aucun frais pour s'inscrire" },
    { icon: <Wallet size={16} />, label: "Retraits sur Mobile Money" },
    { icon: <HeadphonesIcon size={16} />, label: "Support disponible" },
];

export default function DevenirLivreurLanding() {
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
                            <Truck size={14} className="text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Devenir livreur Vtout</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-base-content leading-[1.05]">
                            Votre trajet peut vous <span className="text-primary">rapporter de l'argent.</span>
                        </h1>
                        <p className="text-base-content/60 font-medium text-lg leading-relaxed">
                            Livrez près de chez vous, choisissez les courses qui vous conviennent et gagnez à chaque livraison confirmée.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {["Inscription gratuite et rapide", "Travaillez quand vous voulez", "Choisissez vos courses", "Paiement après chaque livraison"].map((t) => (
                                <div key={t} className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                    <span className="text-sm font-bold text-base-content/70">{t}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => navigate('/devenir-livreur/inscription')}
                            className="inline-flex items-center gap-2 bg-primary text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl active:scale-95 transition-all text-sm"
                        >
                            Je deviens livreur maintenant
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
                            <Truck size={140} className="text-white relative z-10" strokeWidth={1.5} />
                        </div>
                        <div className="absolute -bottom-4 -left-4 bg-base-100 rounded-2xl shadow-xl p-4 border border-base-200 max-w-[220px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40 mb-1">Comment vous êtes payé</p>
                            <p className="text-sm font-bold text-base-content/70">Crédité sur votre portefeuille Vtout après chaque livraison confirmée.</p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Avantages */}
            <section className="max-w-5xl mx-auto px-6 -mt-8 relative z-10">
                <div className="bg-base-100 rounded-[2rem] shadow-xl border border-base-200 p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {ADVANTAGES.map((a) => (
                        <div key={a.title} className="text-center space-y-2">
                            <div className="w-11 h-11 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                {a.icon}
                            </div>
                            <p className="font-black text-sm text-base-content">{a.title}</p>
                            <p className="text-xs text-base-content/50 font-medium leading-snug">{a.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Comment ça marche */}
            <section className="max-w-5xl mx-auto px-6 py-20">
                <div className="text-center mb-12 space-y-3">
                    <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-base-content">
                        Comment <span className="text-primary">ça marche</span> ?
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                            <h3 className="font-black text-base-content">{s.title}</h3>
                            <p className="text-sm text-base-content/50 font-medium leading-relaxed">{s.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Travaillez à votre façon / Pourquoi Vtout */}
            <section className="max-w-5xl mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-base-200/50 rounded-3xl p-8 border border-base-200 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center"><Clock size={18} /></div>
                            <h3 className="font-black text-lg text-base-content">Travaillez à votre façon</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                "Connectez-vous quand vous voulez",
                                "Choisissez vos heures de travail",
                                "Acceptez les courses selon votre disponibilité",
                                "Refusez librement une course",
                            ].map((t) => (
                                <div key={t} className="flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                    <span className="text-sm font-bold text-base-content/70">{t}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-base-200/50 rounded-3xl p-8 border border-base-200 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><Users size={18} /></div>
                            <h3 className="font-black text-lg text-base-content">Pourquoi choisir Vtout ?</h3>
                        </div>
                        <div className="space-y-3">
                            {WHY_VTOUT.map((t) => (
                                <div key={t} className="flex items-center gap-3">
                                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                    <span className="text-sm font-bold text-base-content/70">{t}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Exemple de gains — illustratif, pas une promesse chiffrée */}
                <div className="mt-6 bg-neutral text-white rounded-3xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center"><Wallet size={18} /></div>
                        <h3 className="font-black text-lg">Exemple illustratif</h3>
                    </div>
                    <p className="text-sm text-white/60 font-medium mb-5">
                        Le montant de chaque course dépend de la distance et du type de livraison — voici un ordre de grandeur, pas une garantie.
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { deliveries: "5 livraisons", label: "dans votre journée" },
                            { deliveries: "10 livraisons", label: "dans votre journée" },
                            { deliveries: "20 livraisons", label: "dans votre journée" },
                        ].map((row) => (
                            <div key={row.deliveries} className="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
                                <p className="font-black text-lg">{row.deliveries}</p>
                                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mt-1">{row.label}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-white/40 font-bold mt-4 text-center">
                        Plus vous livrez, plus vous gagnez — le total réel varie selon les courses disponibles dans votre zone.
                    </p>
                </div>
            </section>

            {/* CTA final */}
            <section className="max-w-5xl mx-auto px-6 pb-20">
                <div className="rounded-[2.5rem] p-10 md:p-14 bg-gradient-to-br from-primary to-orange-400 text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                    <div className="relative z-10 space-y-6">
                        <h3 className="text-3xl md:text-4xl font-black tracking-tighter">Prêt à transformer vos trajets en revenus ?</h3>
                        <p className="text-white/80 font-medium text-sm">Inscription gratuite · Rapide · Ouvert à tous (moto, vélo, voiture)</p>
                        <button
                            onClick={() => navigate('/devenir-livreur/inscription')}
                            className="inline-flex items-center gap-2 bg-base-100 text-base-content font-black px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all text-sm"
                        >
                            Je m'inscris maintenant
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Trust badges */}
            <section className="max-w-5xl mx-auto px-6 pb-16">
                <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                    {TRUST_BADGES.map((b) => (
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
