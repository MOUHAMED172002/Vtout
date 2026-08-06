import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Store, ChevronRight, Wallet, Truck, Smile, TrendingUp, Users, ShoppingBag,
    ShieldCheck, Headphones, XCircle, CheckCircle2, Search, ShoppingCart,
    CreditCard, Lock, Star, Tag, Clock, FileText, Facebook, Instagram, Youtube
} from 'lucide-react';
import { SignedOut, SignedIn } from '../components/clerk-shim';

const MAIN_SITE_URL = import.meta.env.VITE_MAIN_SITE_URL || 'https://vtout.com';

const HERO_FLOATING_CARDS = [
    { icon: Wallet, color: 'text-primary bg-primary/10', title: 'Paiement rapide après livraison', desc: 'Recevez votre argent sur Mobile Money.' },
    { icon: Truck, color: 'text-blue-600 bg-blue-50', title: 'Livraison incluse partout au Bénin', desc: 'Nous gérons toute la logistique pour vous.' },
    { icon: Smile, color: 'text-amber-600 bg-amber-50', title: 'Zéro stress', desc: 'Concentrez-vous sur vos produits, on gère le reste.' },
    { icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50', title: 'Plus de visibilité', desc: 'Vos produits visibles par des milliers de clients partout au Bénin.' },
];

const STATS = [
    { icon: Users, value: '+1 000', label: 'marchands nous font déjà confiance' },
    { icon: ShoppingBag, value: '+25 000', label: 'commandes livrées chaque mois' },
    { icon: ShieldCheck, value: '100%', label: 'sécurisé et transparent' },
    { icon: Headphones, value: 'Support dédié', label: '7j/7 pour vous accompagner' },
];

const PROBLEMS = [
    'Messages sans fin et clients qui négocient sans acheter',
    'Livraisons compliquées et coûteuses',
    'Paiements en attente ou clients qui ne paient pas',
    'Peu de visibilité et ventes irrégulières',
    'Gestion manuelle de tout votre processus de vente',
];

const SOLUTIONS = [
    'Vos produits sont visibles par des milliers d’acheteurs',
    'Commandes centralisées et organisées',
    'Livraisons prises en charge partout au Bénin',
    'Paiements rapides après chaque livraison',
    'Plus de temps pour développer votre activité',
];

const ECOSYSTEM = [
    { icon: Search, title: 'Visibilité nationale', desc: 'Exposez vos produits à des milliers de clients chaque jour sur notre site et application.' },
    { icon: ShoppingCart, title: 'Vente facilitée', desc: 'Nous gérons tout le tunnel de vente de A à Z. Fini la gestion fastidieuse des messages.' },
    { icon: CreditCard, title: 'Paiement garanti', desc: 'Recevez vos fonds dès la livraison validée directement sur votre compte Mobile Money.' },
    { icon: Truck, title: 'Logistique incluse', desc: 'Nous livrons vos produits à votre place, partout au Bénin.' },
    { icon: Lock, title: 'Sécurité & transparence', desc: 'Charte qualité Vtout, confidentialité de vos infos et versements ponctuels garantis.' },
];

const TESTIMONIALS = [
    { name: 'Adjo S.', role: 'Vendeuse de pagnes', rating: 5, quote: "Avant Vtout, je passais mes journées sur WhatsApp sans vendre. Aujourd'hui, je reçois plus de commandes et je suis payée rapidement.", color: 'bg-rose-100 text-rose-600' },
    { name: 'Hervé K.', role: 'Vendeur d’électroniques', rating: 5, quote: "Les livraisons étaient mon casse-tête. Vtout s'occupe de tout et mes clients sont satisfaits partout au Bénin.", color: 'bg-blue-100 text-blue-600' },
    { name: 'Grace D.', role: 'Vendeuse de vêtements', rating: 4, quote: "Depuis que je suis sur Vtout, mes ventes ont doublé en 3 mois. Meilleur choix pour mon business !", color: 'bg-emerald-100 text-emerald-600' },
];

export default function SupplierLanding() {
    const navigate = useNavigate();

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="min-h-screen bg-base-100 flex flex-col font-sans selection:bg-primary/10 selection:text-primary overflow-x-hidden">
            {/* Header */}
            <header className="bg-base-100/90 backdrop-blur-md border-b border-base-300 px-6 md:px-10 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                        <Store size={20} className="text-white" />
                    </div>
                    <div>
                        <span className="font-black text-lg tracking-tighter text-base-content leading-none block">Vtout</span>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Business</span>
                    </div>
                </div>

                <nav className="hidden md:flex items-center gap-8">
                    <a href={MAIN_SITE_URL} className="text-xs font-bold text-base-content/60 hover:text-primary transition-colors flex items-center gap-1.5">
                        <ShoppingBag size={14} /> Marketplace
                    </a>
                    <button onClick={() => scrollTo('ecosysteme')} className="text-xs font-bold text-base-content/60 hover:text-primary transition-colors">Fonctionnalités</button>
                    <button onClick={() => scrollTo('stats')} className="text-xs font-bold text-base-content/60 hover:text-primary transition-colors">Tarifs</button>
                    <button onClick={() => navigate('/comment-ca-marche')} className="text-xs font-bold text-base-content/60 hover:text-primary transition-colors">Aide</button>
                </nav>

                <div className="flex items-center gap-3">
                    <SignedIn>
                        <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 bg-neutral text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all hover:bg-primary active:scale-95">
                            Tableau de Bord
                        </button>
                    </SignedIn>
                    <SignedOut>
                        <button onClick={() => navigate('/connexion')} className="hidden sm:block text-base-content/50 hover:text-base-content px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-colors">
                            Connexion
                        </button>
                        <button onClick={() => navigate('/inscription')} className="px-5 py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:brightness-90 active:scale-95">
                            Créer ma boutique
                        </button>
                    </SignedOut>
                </div>
            </header>

            <main className="flex-1">
                {/* ── Hero ── */}
                <section className="relative px-6 md:px-10 pt-14 pb-20 md:pt-20 md:pb-28 overflow-hidden">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10 -mr-40 -mt-20"></div>

                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="space-y-7">
                            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.15em]">
                                La plateforme N°1 des commerçants au Bénin
                            </div>

                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-base-content leading-[1.05]">
                                Vous vendez.<br />
                                <span className="text-primary">On s'occupe du reste.</span><br />
                                Vous gagnez plus.
                            </h1>

                            <p className="text-base md:text-lg text-base-content/50 font-medium leading-relaxed max-w-lg">
                                Vtout Business est le partenaire technologique des commerçants béninois. Plus de visibilité, des ventes sécurisées, des livraisons prises en charge et des paiements rapides sur votre compte.
                            </p>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-2">
                                <SignedOut>
                                    <button
                                        onClick={() => navigate('/inscription')}
                                        className="group px-8 py-4 bg-primary hover:brightness-90 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-3 hover:-translate-y-0.5"
                                    >
                                        Créer ma boutique gratuitement <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </SignedOut>
                                <SignedIn>
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="px-8 py-4 bg-neutral text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-base-300/20 transition-all flex items-center justify-center gap-3 hover:-translate-y-0.5"
                                    >
                                        Accéder au Dashboard <ChevronRight size={16} />
                                    </button>
                                </SignedIn>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
                                {['Gratuit', 'Sans engagement', 'Prêt en 2 min'].map((t) => (
                                    <span key={t} className="flex items-center gap-1.5 text-xs font-bold text-base-content/50">
                                        <CheckCircle2 size={14} className="text-emerald-500" /> {t}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        {/* Illustrative hero visual + benefit cards (no overlap, clean at every width) */}
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }} className="space-y-5">
                            <div className="relative aspect-[16/10] rounded-[2.5rem] bg-gradient-to-br from-primary via-primary to-orange-600 shadow-2xl shadow-primary/30 flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 0, transparent 40%)' }}></div>
                                <div className="text-center text-white space-y-3">
                                    <div className="w-16 h-16 mx-auto bg-white/15 backdrop-blur rounded-3xl flex items-center justify-center border border-white/20">
                                        <Store size={32} />
                                    </div>
                                    <p className="font-black text-2xl tracking-tighter">Vtout Business</p>
                                    <p className="text-xs font-bold text-white/70 uppercase tracking-widest">Votre boutique, partout au Bénin</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {HERO_FLOATING_CARDS.map((c, i) => (
                                    <motion.div key={c.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                                        className="bg-base-100 rounded-2xl shadow-md border border-base-200 p-4 flex items-start gap-3">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.color}`}><c.icon size={18} /></div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-base-content leading-tight">{c.title}</p>
                                            <p className="text-[10px] text-base-content/40 font-medium mt-0.5 leading-snug">{c.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ── Stats bar ── */}
                <section id="stats" className="bg-neutral text-white py-10 px-6">
                    <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                        {STATS.map((s) => (
                            <div key={s.label} className="flex items-center gap-3">
                                <div className="w-11 h-11 bg-primary/20 text-primary rounded-2xl flex items-center justify-center shrink-0">
                                    <s.icon size={20} />
                                </div>
                                <div>
                                    <p className="font-black text-lg leading-tight">{s.value}</p>
                                    <p className="text-[10px] font-bold text-white/50 leading-tight">{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Problem / Solution ── */}
                <section className="py-20 px-6 bg-base-200">
                    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
                        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            className="bg-base-100 rounded-[2.5rem] border border-base-300 p-8 md:p-10 space-y-6">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-base-content tracking-tight">Marre de perdre du temps pour peu de résultats ?</h2>
                                <p className="text-sm text-base-content/40 font-bold mt-2">Trop de messages, pas assez de ventes.</p>
                            </div>
                            <ul className="space-y-3.5">
                                {PROBLEMS.map((p) => (
                                    <li key={p} className="flex items-start gap-3">
                                        <XCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                                        <span className="text-sm font-bold text-base-content/60">{p}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                            className="bg-emerald-50 rounded-[2.5rem] border border-emerald-100 p-8 md:p-10 space-y-6">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-base-content tracking-tight">
                                    Avec <span className="text-primary">Vtout Business</span>, votre boutique <span className="text-emerald-600">travaille pour vous.</span>
                                </h2>
                            </div>
                            <ul className="space-y-3.5">
                                {SOLUTIONS.map((s) => (
                                    <li key={s} className="flex items-start gap-3">
                                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span className="text-sm font-bold text-base-content/70">{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </section>

                {/* ── Ecosystem ── */}
                <section id="ecosysteme" className="py-24 px-6 bg-base-100">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-black text-base-content tracking-tighter text-center mb-14">
                            L'écosystème conçu pour <span className="text-primary">booster vos ventes</span>
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                            {ECOSYSTEM.map((f, i) => (
                                <motion.div key={f.title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                    className="bg-base-100 border border-base-300 rounded-3xl p-6 space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all">
                                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                        <f.icon size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-base-content">{f.title}</h3>
                                        <p className="text-xs text-base-content/50 font-medium mt-1.5 leading-relaxed">{f.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Testimonials ── */}
                <section className="py-20 px-6 bg-base-200">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center gap-4 mb-10">
                            <span className="text-4xl text-primary font-black">"</span>
                            <h2 className="text-2xl md:text-3xl font-black text-base-content tracking-tight">
                                Ils ont rejoint Vtout et leurs ventes ont décollé !
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {TESTIMONIALS.map((t) => (
                                <div key={t.name} className="bg-base-100 rounded-[2rem] border border-base-300 p-7 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black shrink-0 ${t.color}`}>
                                            {t.name.split(' ').map(w => w[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} size={13} className={i < t.rating ? 'text-amber-400 fill-amber-400' : 'text-base-300'} />
                                                ))}
                                            </div>
                                            <p className="text-xs font-black text-base-content mt-0.5">{t.name}</p>
                                            <p className="text-[10px] text-base-content/40 font-bold">{t.role}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-base-content/60 font-medium leading-relaxed">"{t.quote}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Bottom CTA banner ── */}
                <section className="px-6 py-4">
                    <div className="max-w-6xl mx-auto bg-primary rounded-[2.5rem] p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl shadow-primary/20">
                        <div className="text-center lg:text-left space-y-2">
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                                Rejoignez dès aujourd'hui l'élite des marchands au Bénin.
                            </h2>
                            <p className="text-sm text-white/70 font-bold">L'inscription est 100% gratuite, rapide et sans engagement.</p>
                        </div>
                        <div className="flex items-center gap-6 shrink-0">
                            <div className="hidden md:flex items-center gap-5">
                                {[
                                    { icon: Tag, label: 'Gratuit', sub: 'Inscription gratuite' },
                                    { icon: Clock, label: 'Rapide', sub: 'Prêt en 2 minutes' },
                                    { icon: FileText, label: 'Simple', sub: 'Aucun document compliqué' },
                                ].map((b) => (
                                    <div key={b.label} className="text-center text-white/90">
                                        <b.icon size={20} className="mx-auto mb-1.5" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">{b.label}</p>
                                        <p className="text-[9px] text-white/60 font-bold">{b.sub}</p>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => navigate('/inscription')}
                                className="px-7 py-4 bg-neutral text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 shrink-0"
                            >
                                Créer ma boutique maintenant <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-base-100 border-t border-base-300 py-10 mt-6">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-neutral rounded-lg flex items-center justify-center">
                            <Store size={16} className="text-white" />
                        </div>
                        <span className="font-black text-sm tracking-tighter text-base-content uppercase">Vtout Business</span>
                    </div>
                    <p className="text-[10px] font-black text-base-content/40 uppercase tracking-[0.2em] text-center">
                        © {new Date().getFullYear()} Vtout Marketplace. Plateforme de vente réservée aux professionnels.
                    </p>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-base-content/40 uppercase tracking-widest mr-1">Suivez-nous</span>
                        {[Facebook, Instagram, Youtube].map((Icon, i) => (
                            <a key={i} href={MAIN_SITE_URL} className="w-8 h-8 rounded-full bg-base-200 text-base-content/50 flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                                <Icon size={14} />
                            </a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}
