import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Percent, Package, ArrowRight, Clock, ShieldCheck, Sparkles, TrendingDown } from 'lucide-react';

const PromotionsBanners = () => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(21600); // 6 hours

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 21600));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}h : ${mins.toString().padStart(2, '0')}m : ${secs.toString().padStart(2, '0')}s`;
    };

    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
            
            {/* Ambient Background Elements */}
            <div className="absolute top-1/4 left-10 w-72 h-72 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto space-y-10 relative z-10">
                
                {/* Header Title with premium design */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary font-black uppercase text-[10px] tracking-[0.2em] px-3.5 py-1 rounded-full shadow-sm">
                            <Sparkles size={12} className="fill-primary" /> VTout Exclusive Deals
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none uppercase">
                            Nos <span className="text-primary">Super Promotions</span>
                        </h2>
                        <p className="text-slate-500 font-bold text-sm md:text-base max-w-xl">
                            Sélectionnez la formule idéale d'économie proposée par nos vendeurs certifiés.
                        </p>
                    </div>
                </div>

                {/* 3-Column Premium Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                    {/* Banner 1: FLASH SALE */}
                    <motion.div
                        whileHover={{ y: -6, scale: 1.02 }}
                        onClick={() => navigate('/promotions/flash')}
                        className="bg-slate-950 text-white rounded-[2.5rem] p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group cursor-pointer border border-slate-800/80 min-h-[380px]"
                    >
                        {/* Glow Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 via-orange-500/5 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />
                        
                        {/* Interactive floating particles */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full translate-x-6 -translate-y-6 blur-2xl pointer-events-none" />
                        
                        <div className="space-y-6 relative z-10">
                            {/* Card Tag */}
                            <div className="flex justify-between items-center">
                                <span className="bg-rose-500 text-white font-black text-[10px] tracking-[0.15em] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-rose-500/30">
                                    <Flame size={12} className="fill-white animate-bounce" /> VENTES FLASH
                                </span>
                                
                                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                    <ShieldCheck size={12} /> Stock Garanti
                                </span>
                            </div>

                            {/* Main Copy */}
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black tracking-tight leading-none group-hover:text-rose-400 transition-colors">
                                    PRIX CHRONO <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">JUSQU'À -50%</span>
                                </h3>
                                <p className="text-slate-400 font-bold text-xs leading-relaxed max-w-[280px]">
                                    Des baisses de prix massives sur une durée limitée par nos vendeurs de confiance.
                                </p>
                            </div>
                        </div>

                        {/* Interactive Countdown */}
                        <div className="space-y-4 relative z-10 pt-4">
                            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
                                <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-wider">
                                    <Clock size={14} className="text-rose-500 animate-pulse" /> Fin de l'offre :
                                </div>
                                <span className="font-mono font-black text-rose-500 text-sm tracking-wide">
                                    {formatTime(timeLeft)}
                                </span>
                            </div>

                            {/* Discover CTA */}
                            <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform duration-300">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Plus de 20 articles restants
                                </span>
                                <span className="inline-flex items-center gap-1 text-rose-400 font-black text-xs uppercase tracking-widest">
                                    Profiter <ArrowRight size={14} />
                                </span>
                            </div>
                        </div>
                    </motion.div>


                    {/* Banner 2: QUANTITY DISCOUNT */}
                    <motion.div
                        whileHover={{ y: -6, scale: 1.02 }}
                        onClick={() => navigate('/promotions/quantite')}
                        className="bg-white rounded-[2.5rem] p-8 flex flex-col justify-between shadow-xl relative overflow-hidden group cursor-pointer border border-slate-100 min-h-[380px]"
                    >
                        {/* Glow Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-blue-500/5 to-transparent opacity-60 pointer-events-none" />
                        
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full translate-x-6 -translate-y-6 blur-2xl pointer-events-none" />

                        <div className="space-y-6 relative z-10">
                            {/* Card Tag */}
                            <div className="flex justify-between items-center">
                                <span className="bg-indigo-600 text-white font-black text-[10px] tracking-[0.15em] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-indigo-600/20">
                                    <Percent size={12} /> REMISES EN GROS
                                </span>
                                
                                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-1 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100">
                                    <TrendingDown size={12} /> Dégressif
                                </span>
                            </div>

                            {/* Main Copy */}
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                                    PLUS D'ACHATS <br />
                                    <span className="text-indigo-600">MOINS DE FRAIS</span>
                                </h3>
                                <p className="text-slate-500 font-bold text-xs leading-relaxed max-w-[280px]">
                                    Économisez automatiquement par paliers configurés directement par les grossistes.
                                </p>
                            </div>
                        </div>

                        {/* Interactive Tier Simulator Preview */}
                        <div className="space-y-4 relative z-10 pt-4">
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 shadow-inner">
                                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200/60 pb-1">
                                    <span>Quantité</span>
                                    <span>Remise</span>
                                </div>
                                <div className="flex justify-between text-xs font-black text-slate-700">
                                    <span>2 articles</span>
                                    <span className="text-indigo-600 font-extrabold">-5%</span>
                                </div>
                                <div className="flex justify-between text-xs font-black text-slate-800">
                                    <span>3 articles et +</span>
                                    <span className="text-indigo-600 font-black text-sm">-10% à -20%</span>
                                </div>
                            </div>

                            {/* Discover CTA */}
                            <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform duration-300">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Idéal pour revendeurs
                                </span>
                                <span className="inline-flex items-center gap-1 text-indigo-600 font-black text-xs uppercase tracking-widest">
                                    Simuler <ArrowRight size={14} />
                                </span>
                            </div>
                        </div>
                    </motion.div>


                    {/* Banner 3: PRODUCT KITS */}
                    <motion.div
                        whileHover={{ y: -6, scale: 1.02 }}
                        onClick={() => navigate('/promotions/kits')}
                        className="bg-slate-900 text-white rounded-[2.5rem] p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group cursor-pointer border border-slate-800 min-h-[380px]"
                    >
                        {/* Glow Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-teal-500/5 to-transparent opacity-60 pointer-events-none" />
                        
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full translate-x-6 -translate-y-6 blur-2xl pointer-events-none" />

                        <div className="space-y-6 relative z-10">
                            {/* Card Tag */}
                            <div className="flex justify-between items-center">
                                <span className="bg-emerald-600 text-white font-black text-[10px] tracking-[0.15em] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg shadow-emerald-600/30">
                                    <Package size={12} /> PACKS TOUT-EN-UN
                                </span>
                                
                                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                    Livraison Unique
                                </span>
                            </div>

                            {/* Main Copy */}
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black tracking-tight leading-none group-hover:text-emerald-400 transition-colors">
                                    KITS COMPLETS <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">À PRIX SACRIFIÉ</span>
                                </h3>
                                <p className="text-slate-400 font-bold text-xs leading-relaxed max-w-[280px]">
                                    Achetez des lots d'articles complémentaires en 1-clic avec des remises cumulées importantes.
                                </p>
                            </div>
                        </div>

                        {/* Interactive Bundle Visual Element */}
                        <div className="space-y-4 relative z-10 pt-4">
                            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-around shadow-xl">
                                <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center font-black text-emerald-400 text-xs shadow-inner">
                                    Prod A
                                </div>
                                <span className="text-slate-600 font-black">+</span>
                                <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center font-black text-emerald-400 text-xs shadow-inner">
                                    Prod B
                                </div>
                                <span className="text-slate-600 font-black">=</span>
                                <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-center">
                                    <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">ÉCONOMIE</span>
                                    <div className="text-xs font-black text-emerald-400 leading-none mt-0.5">-30%</div>
                                </div>
                            </div>

                            {/* Discover CTA */}
                            <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform duration-300">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Packagé par le vendeur
                                </span>
                                <span className="inline-flex items-center gap-1 text-emerald-400 font-black text-xs uppercase tracking-widest">
                                    Découvrir <ArrowRight size={14} />
                                </span>
                            </div>
                        </div>
                    </motion.div>

                </div>

            </div>
        </section>
    );
};

export default PromotionsBanners;
