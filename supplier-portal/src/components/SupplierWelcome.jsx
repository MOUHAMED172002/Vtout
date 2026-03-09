import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Store, CheckCircle, Rocket, ShieldCheck, ChevronRight } from 'lucide-react';

export default function SupplierWelcome({ user }) {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100 flex flex-col md:flex-row"
            >
                {/* Left Side: Branding */}
                <div className="bg-slate-900 md:w-5/12 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 mb-8">
                            <Store size={32} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter leading-tight mb-4">
                            Bienvenue sur le <br />Portail Partenaires
                        </h2>
                        <p className="text-slate-400 font-bold text-sm leading-relaxed">
                            Nous sommes ravis de vous compter parmi nous, {user?.firstName}.
                        </p>
                    </div>

                    <div className="relative z-10 mt-12 space-y-4">
                        <div className="flex items-center gap-3 text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                            <CheckCircle size={14} /> Validation E-Signature
                        </div>
                        <div className="flex items-center gap-3 text-indigo-400 font-bold text-[10px] uppercase tracking-widest">
                            <ShieldCheck size={14} /> Paiements Garantis
                        </div>
                    </div>

                    {/* Decor */}
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
                </div>

                {/* Right Side: Welcome Message */}
                <div className="flex-1 p-12 flex flex-col justify-center space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                            Prêt à lancer <br />votre boutique ?
                        </h3>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            Merci d'avoir choisi EShop pour propulser votre activité. Pour commencer à vendre vos produits, nous avons besoin de quelques informations sur votre entreprise et votre position géographique.
                        </p>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-5">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm shrink-0">
                            <Rocket size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 mb-1">Inscription Rapide</p>
                            <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-wider">Moins de 2 minutes pour configurer votre compte de vente.</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/inscription')}
                        className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20 hover:bg-slate-900 hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                    >
                        Créer mon Profil Fournisseur <ChevronRight size={18} />
                    </button>

                    <p className="text-center text-[9px] font-black uppercase text-slate-300 tracking-[0.3em]">
                        Securisé par EShop Infrastructure
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
