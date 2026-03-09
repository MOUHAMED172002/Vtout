import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, TrendingUp, ShieldCheck, ChevronRight, Store, DollarSign } from 'lucide-react';
import { SignedOut, SignedIn } from '@clerk/clerk-react';

export default function SupplierLanding() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <Store size={24} className="text-white" />
                    </div>
                    <div>
                        <span className="font-black text-xl tracking-tighter text-slate-900 leading-none block">EShop</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">Partenaires</span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <SignedIn>
                        <button onClick={() => navigate('/dashboard')} className="btn btn-primary rounded-full px-8 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                            Mon Espace
                        </button>
                    </SignedIn>
                    <SignedOut>
                        <button onClick={() => navigate('/inscription')} className="btn btn-primary rounded-full px-8 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                            S'inscrire / Se Connecter
                        </button>
                    </SignedOut>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 overflow-x-hidden">
                <section className="relative px-6 py-20 md:py-32 overflow-hidden flex flex-col items-center justify-center text-center bg-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0,transparent_100%)] pointer-events-none"></div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl relative z-10 space-y-8 px-4"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            Merci pour votre intérêt envers EShop
                        </div>

                        <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[1.1]">
                            Propulsez vos ventes <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-800">en devenant partenaire.</span>
                        </h1>

                        <p className="text-base md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                            Rejoignez la plus grande place de marché multiservices au Bénin. Nous transformons votre stock en revenus tout en gérant toute la logistique.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                            <button
                                onClick={() => navigate('/inscription')}
                                className="w-full sm:w-auto px-10 py-5 bg-indigo-600 hover:bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 hover:-translate-y-1"
                            >
                                Commencer l'Inscription <ChevronRight size={18} />
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="w-full sm:w-auto px-10 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-full font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                                Se Connecter
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* Features / Comment ça marche */}
                <section className="py-24 bg-slate-50 relative border-t border-slate-100">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-slate-900">Le partenariat B2B <span className="text-indigo-500">sans friction.</span></h2>
                            <p className="mt-4 text-slate-500 font-bold uppercase text-[11px] tracking-widest">Comment ça marche ?</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white p-10 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
                                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center">
                                    <Package size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 mb-3">1. Vous proposez</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed font-medium">Vous listez vos produits, vos variantes (couleurs, tailles) disponibles et vous nous indiquez votre prix de gros (confidentiel).</p>
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-white p-10 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center">
                                    <TrendingUp size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 mb-3">2. Nous vendons</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed font-medium">Nos équipes fixent le prix de vente public, subliment vos annonces et gèrent toute l'acquisition de trafic client.</p>
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-white p-10 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
                                <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center">
                                    <DollarSign size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 mb-3">3. Vous êtes payé</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed font-medium">Dès qu'une commande est validée, nos livreurs récupèrent le colis et vous recevez votre paiement directement par Mobile Money.</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Trust / Contract */}
                <section className="py-24 bg-slate-900 text-white relative">
                    <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
                        <ShieldCheck size={64} className="mx-auto text-indigo-400" />
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Partenariat Sécurisé</h2>
                        <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
                            L'excellence de notre plateforme repose sur la confiance. Chaque fournisseur signe un contrat électronique lors de son inscription garantissant la confidentialité de ses prix de gros et le respect des normes de qualité EShop.
                        </p>
                        <button onClick={() => navigate('/inscription')} className="px-10 py-5 bg-white text-slate-900 rounded-full font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-3 mx-auto">
                            Commencer maintenant <ChevronRight size={18} />
                        </button>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-100 py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                © {new Date().getFullYear()} EShop Partenaires. Tous droits réservés.
            </footer>
        </div>
    );
}
