import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
import promoImage from '../../assets/hero/promo_offers.png';

const PromotionsBanners = () => {
    const navigate = useNavigate();

    return (
        <section className="relative py-12 overflow-hidden bg-slate-950">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-950/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                <div className="w-full bg-[#022c22]/90 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-14 border border-emerald-900/40 shadow-2xl relative overflow-hidden">
                    
                    {/* Background Accents (Confetti / Decorative Shapes) */}
                    <div className="absolute top-12 left-1/4 w-3 h-3 bg-amber-400 rounded-full opacity-60 animate-bounce" />
                    <div className="absolute bottom-16 left-1/3 w-4 h-4 bg-emerald-400/40 rounded-lg rotate-45 pointer-events-none" />
                    <div className="absolute top-24 right-1/3 w-3 h-6 bg-rose-500/40 rounded-full -rotate-12 pointer-events-none" />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
                        
                        {/* Left Side: Content */}
                        <div className="lg:col-span-7 space-y-6 md:space-y-8 text-left">
                            
                            {/* Special Offers Badge */}
                            <motion.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-black tracking-wider uppercase"
                            >
                                <Zap size={14} className="fill-amber-400 animate-pulse text-amber-400" />
                                Offres Spéciales
                            </motion.div>

                            {/* Main Title & Circle Badge Wrapper */}
                            <div className="relative">
                                <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                    className="space-y-2"
                                >
                                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                                        Les meilleures <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
                                            offres du moment
                                        </span>
                                    </h2>
                                </motion.div>

                                {/* Golden Circle Badge (Floating) */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -20 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 100, delay: 0.4 }}
                                    className="absolute -top-6 right-0 lg:right-[-20px] w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 flex flex-col items-center justify-center text-center shadow-lg border-4 border-[#022c22] pointer-events-none z-20"
                                >
                                    <span className="text-[10px] font-black uppercase text-[#022c22] tracking-wider leading-none">Jusqu'à</span>
                                    <span className="text-2xl font-black text-[#022c22] leading-none mt-1">-50%</span>
                                </motion.div>
                            </div>

                            {/* Subtitle */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-emerald-100/70 text-sm md:text-base leading-relaxed max-w-2xl font-medium"
                            >
                                Profitez de réductions exceptionnelles proposées par nos vendeurs partout au Bénin.
                            </motion.p>

                            {/* Action Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="flex flex-wrap gap-4 pt-4"
                            >
                                <button
                                    onClick={() => navigate('/promotions/flash')}
                                    className="group inline-flex items-center gap-2 bg-slate-100 hover:bg-white text-slate-950 font-bold text-sm md:text-base px-6 py-4 rounded-xl transition-all duration-300 shadow-xl hover:shadow-slate-100/10 active:scale-95 cursor-pointer"
                                >
                                    Voir les offres
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => navigate('/categories')}
                                    className="inline-flex items-center justify-center border border-emerald-800 hover:border-emerald-600 text-white hover:bg-emerald-900/30 font-bold text-sm md:text-base px-6 py-4 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
                                >
                                    Toutes les catégories
                                </button>
                            </motion.div>
                        </div>

                        {/* Right Side: Podiums with iPhone, Sneaker, Watch & Handbag */}
                        <div className="lg:col-span-5 flex items-center justify-center relative mt-10 lg:mt-0">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="relative w-full max-w-[320px] md:max-w-[400px]"
                            >
                                {/* Platform Backing Glow */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-emerald-500/10 rounded-full blur-3xl scale-125 pointer-events-none animate-pulse" />
                                
                                <img
                                    src={promoImage}
                                    className="w-full h-auto object-contain drop-shadow-2xl relative z-10 animate-float"
                                    alt="Les meilleures offres Vtout Bénin"
                                    style={{ animation: 'float 6s ease-in-out infinite' }}
                                />
                            </motion.div>
                        </div>

                    </div>

                    {/* Sliding dots indicators */}
                    <div className="flex justify-center gap-2 mt-8 md:mt-12">
                        <span className="w-2 h-2 rounded-full bg-slate-700 hover:bg-slate-600 cursor-pointer transition-all duration-300" />
                        <span className="w-6 h-2 rounded-full bg-amber-500 transition-all duration-300" />
                        <span className="w-2 h-2 rounded-full bg-slate-700 hover:bg-slate-600 cursor-pointer transition-all duration-300" />
                    </div>

                </div>
            </div>

            {/* Custom Floating Animation */}
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
        </section>
    );
};

export default PromotionsBanners;
