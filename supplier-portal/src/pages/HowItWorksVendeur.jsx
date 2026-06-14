import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, Package, Truck, CreditCard, BarChart3, Zap, ShieldCheck, TrendingUp, DollarSign, ChevronRight, ArrowLeft } from 'lucide-react';
import { SignedOut, SignedIn } from '../components/clerk-shim';
import api from '../services/api';

const ICON_MAP = { Store, Package, Truck, CreditCard, BarChart3, Zap, ShieldCheck, TrendingUp, DollarSign };

const DEFAULT_STEPS = [
    { icon: 'Store',      title: 'Créez votre boutique',   desc: 'Inscrivez-vous gratuitement, complétez votre profil et obtenez votre espace vendeur validé en moins de 24h. Ajoutez votre logo, votre description et vos coordonnées.' },
    { icon: 'Package',    title: 'Ajoutez vos produits',   desc: 'Publiez vos articles avec photos, description et prix vendeur. Vtout calcule automatiquement le prix client final en incluant les frais de livraison.' },
    { icon: 'Truck',      title: 'On gère la logistique',  desc: 'Dès qu\'une commande est passée, nos livreurs vous contactent pour récupérer le colis. Vous n\'avez qu\'à préparer la commande — on s\'occupe du reste.' },
    { icon: 'CreditCard', title: 'Soyez payé rapidement',  desc: 'Vos gains sont crédités automatiquement sur votre portefeuille Vtout après chaque livraison confirmée. Retirez sur Mobile Money à tout moment.' },
];

export default function HowItWorksVendeur() {
    const navigate = useNavigate();
    const [steps, setSteps] = useState(DEFAULT_STEPS);

    useEffect(() => {
        api.get('/configs/public').then(({ data }) => {
            const raw = data.find(c => c.key === 'supplier_how_it_works_steps')?.value;
            if (raw) { try { setSteps(JSON.parse(raw)); } catch {} }
        }).catch(() => {});
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-5 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Store size={20} className="text-white" />
                        </div>
                        <div>
                            <span className="font-black text-lg tracking-tighter text-slate-900 leading-none block">Vtout</span>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600">Business</span>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                        <ArrowLeft size={14} /> Retour
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-16">
                {/* Title */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full">
                        <Zap size={12} className="text-indigo-500" fill="currentColor" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Simple & Rapide</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900">
                        Comment ça <span className="text-indigo-600">marche ?</span>
                    </h1>
                    <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed text-lg">
                        Vendez sur Vtout en 4 étapes simples. De l'inscription à votre première vente, on vous guide.
                    </p>
                </div>

                {/* Steps */}
                <div className="space-y-6 mb-16">
                    {steps.map((step, i) => {
                        const Icon = ICON_MAP[step.icon] || Store;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex gap-8 items-start"
                            >
                                {/* Step number + icon */}
                                <div className="shrink-0 flex flex-col items-center gap-2">
                                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 relative">
                                        <Icon size={28} />
                                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-indigo-200">
                                            {i + 1}
                                        </span>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className="w-0.5 h-8 bg-indigo-100 mt-2" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 pt-2">
                                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-3">{step.title}</h2>
                                    <p className="text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* CTA */}
                <div className="bg-indigo-600 rounded-[3rem] p-10 md:p-14 text-center relative overflow-hidden shadow-2xl shadow-indigo-200">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 space-y-6">
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
                            Prêt à commencer ?
                        </h2>
                        <p className="text-white/70 font-medium max-w-sm mx-auto">
                            Inscription gratuite. Première vente possible dès aujourd'hui.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                            <SignedOut>
                                <button
                                    onClick={() => navigate('/inscription')}
                                    className="px-10 py-4 bg-white text-indigo-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-50 shadow-xl transition-all flex items-center justify-center gap-2"
                                >
                                    Créer ma boutique <ChevronRight size={16} />
                                </button>
                            </SignedOut>
                            <SignedIn>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="px-10 py-4 bg-white text-indigo-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-50 shadow-xl transition-all flex items-center justify-center gap-2"
                                >
                                    Accéder au dashboard <ChevronRight size={16} />
                                </button>
                            </SignedIn>
                            <button
                                onClick={() => navigate('/')}
                                className="px-10 py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={14} /> Retour à l'accueil
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
