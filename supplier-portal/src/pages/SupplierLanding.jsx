import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, TrendingUp, ShieldCheck, ChevronRight, Store, DollarSign, Rocket, BarChart3, Globe2, CreditCard, Zap } from 'lucide-react';
import { SignedOut, SignedIn } from '../components/clerk-shim';

export default function SupplierLanding() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-5 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <Store size={22} className="text-white" />
                    </div>
                    <div>
                        <span className="font-black text-xl tracking-tighter text-slate-900 leading-none block">Vtout</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Business</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <SignedIn>
                        <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 transition-all hover:bg-indigo-600 active:scale-95">
                            Tableau de Bord
                        </button>
                    </SignedIn>
                    <SignedOut>
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/connexion')} className="text-slate-500 hover:text-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors">
                                Connexion
                            </button>
                            <button onClick={() => navigate('/inscription')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all hover:bg-slate-900 active:scale-95">
                                Devenir Vendeur
                            </button>
                        </div>
                    </SignedOut>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 overflow-x-hidden">
                <section className="relative px-6 py-24 md:py-36 overflow-hidden flex flex-col items-center justify-center text-center bg-white">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-50/50 to-transparent rounded-full blur-3xl -z-10"></div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl relative z-10 space-y-10 px-4"
                    >
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                            <Rocket size={14} className="text-indigo-500" />
                            Rejoignez l'élite des marchands au Bénin
                        </div>

                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 leading-[0.95]">
                            Vendez plus,<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-800">Vendez partout.</span>
                        </h1>

                        <p className="text-lg md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                            Vtout Business est le partenaire technologique des marques et commerçants. Nous gérons la visibilité, les paiements et la livraison, vous gérez vos stocks.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-6">
                            <SignedOut>
                                <button
                                    onClick={() => navigate('/inscription')}
                                    className="group w-full sm:w-auto px-12 py-6 bg-indigo-600 hover:bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-4 hover:-translate-y-1"
                                >
                                    Ouvrir ma boutique <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </SignedOut>
                            <SignedIn>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="w-full sm:w-auto px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 transition-all flex items-center justify-center gap-4 hover:-translate-y-1"
                                >
                                    Accéder au Dashboard <BarChart3 size={18} />
                                </button>
                            </SignedIn>
                        </div>

                        <div className="flex items-center justify-center gap-8 pt-12 border-t border-slate-50">
                            <div className="text-center">
                                <p className="text-2xl font-black text-slate-900 tracking-tighter">24h</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paiement Rapide</p>
                            </div>
                            <div className="w-px h-8 bg-slate-100"></div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-slate-900 tracking-tighter">100%</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logistique Incluse</p>
                            </div>
                            <div className="w-px h-8 bg-slate-100"></div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-slate-900 tracking-tighter">Gratuit</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inscription</p>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Comment ça marche — CTA vers page dédiée */}
                <section className="py-16 bg-slate-50 border-t border-slate-100">
                    <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full">
                            <Zap size={12} className="text-indigo-500" fill="currentColor" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Simple & Rapide</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900">
                            Comment ça <span className="text-indigo-600">marche ?</span>
                        </h2>
                        <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                            En 4 étapes, votre boutique est ouverte et vos premières commandes arrivent.
                        </p>
                        <button
                            onClick={() => navigate('/comment-ca-marche')}
                            className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all"
                        >
                            Voir comment ça marche <ChevronRight size={16} />
                        </button>
                    </div>
                </section>

                {/* Value Propositions */}
                <section className="py-32 bg-slate-50 relative border-t border-slate-100">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                            <div className="max-w-2xl">
                                <p className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4">L'écosystème Vtout</p>
                                <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900">Une croissance<br /><span className="text-slate-400">sans compromis.</span></h2>
                            </div>
                            <p className="text-slate-500 font-medium max-w-sm leading-relaxed">
                                Nous avons conçu une infrastructure robuste pour permettre aux commerçants béninois de passer au digital sans friction logistique.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <Globe2 size={32} />,
                                    title: "Visibilité Nationale",
                                    desc: "Vos produits sont exposés à des milliers de clients quotidiens sur notre application et site web.",
                                    color: "blue"
                                },
                                {
                                    icon: <TrendingUp size={32} />,
                                    title: "Vente Facilitée",
                                    desc: "Fini la gestion fastidieuse des MP. Nous gérons le tunnel de vente de A à Z.",
                                    color: "emerald"
                                },
                                {
                                    icon: <DollarSign size={32} />,
                                    title: "Cash-flow Garanti",
                                    desc: "Recevez vos fonds dès la livraison validée directement sur votre compte Mobile Money.",
                                    color: "indigo"
                                }
                            ].map((feature, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }} 
                                    whileInView={{ opacity: 1, y: 0 }} 
                                    viewport={{ once: true }} 
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100 space-y-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all hover:-translate-y-2 group"
                                >
                                    <div className={`w-20 h-20 bg-${feature.color}-50 text-${feature.color}-600 rounded-[2rem] flex items-center justify-center transition-transform group-hover:rotate-6`}>
                                        {feature.icon}
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{feature.title}</h3>
                                        <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Trust / Contract */}
                <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -mb-64 -mr-32"></div>
                    
                    <div className="max-w-4xl mx-auto px-6 text-center space-y-12 relative z-10">
                        <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 border border-white/10">
                            <ShieldCheck size={48} className="text-indigo-400" />
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-4xl md:text-7xl font-black tracking-tighter">Transparence & Sécurité</h2>
                            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
                                Chaque marchand signe une charte de qualité Vtout. Nous garantissons la confidentialité de vos informations commerciales et la ponctualité de vos versements.
                            </p>
                        </div>
                        <button 
                            onClick={() => navigate('/inscription')} 
                            className="px-12 py-6 bg-white text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-4 mx-auto shadow-2xl shadow-white/5"
                        >
                            Ouvrir mon compte marchand <ChevronRight size={18} />
                        </button>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-100 py-12">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                            <Store size={16} className="text-white" />
                        </div>
                        <span className="font-black text-sm tracking-tighter text-slate-900 uppercase">Vtout Business</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                        © {new Date().getFullYear()} Vtout Marketplace. Plateforme de vente réservée aux professionnels.
                    </p>
                </div>
            </footer>
        </div>
    );
}
