import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Lock, Truck, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';
import heroImage from '../../assets/hero/hero_shopping.png';

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="relative pt-6 md:pt-10 overflow-hidden bg-slate-950">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                <div className="w-full bg-[#0b1329]/80 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-14 border border-slate-800/80 shadow-2xl relative overflow-hidden">
                    
                    {/* Background Subtle Mesh */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
                        
                        {/* Left Side: Content */}
                        <div className="lg:col-span-7 space-y-6 md:space-y-8 text-left">
                            
                            {/* Confidence Badge */}
                            <motion.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wider uppercase"
                            >
                                <ShieldCheck size={16} className="text-emerald-400" />
                                Votre achat en toute confiance
                            </motion.div>

                            {/* Main Title */}
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="space-y-2"
                            >
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                                    Le shopping en ligne <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                                        pensé pour le Bénin
                                    </span>
                                </h1>
                            </motion.div>

                            {/* Subtitle */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl font-medium"
                            >
                                Sur Vtout, des milliers de vendeurs de tout le pays proposent une grande variété 
                                de produits sur une plateforme simple, sécurisée et fiable.
                            </motion.p>

                            {/* Value Props Row */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-4 border-t border-slate-800/80"
                            >
                                {/* Prop 1 */}
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <ShieldCheck size={18} className="text-emerald-400" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-white text-xs md:text-sm font-bold">Paiement à la réception</h4>
                                        <p className="text-slate-500 text-[10px] md:text-xs">Payez quand vous recevez votre commande</p>
                                    </div>
                                </div>

                                {/* Prop 2 */}
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <Lock size={16} className="text-emerald-400" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-white text-xs md:text-sm font-bold">Transactions sécurisées</h4>
                                        <p className="text-slate-500 text-[10px] md:text-xs">Vos données et vos paiements sont protégés</p>
                                    </div>
                                </div>

                                {/* Prop 3 */}
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <Truck size={18} className="text-emerald-400" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-white text-xs md:text-sm font-bold">Livraison simplifiée</h4>
                                        <p className="text-slate-500 text-[10px] md:text-xs">Suivi et coordination des commandes</p>
                                    </div>
                                </div>

                                {/* Prop 4 */}
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <Headphones size={18} className="text-emerald-400" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-white text-xs md:text-sm font-bold">Support 7j/7</h4>
                                        <p className="text-slate-500 text-[10px] md:text-xs">Une équipe à votre écoute à tout moment</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="flex flex-wrap gap-4 pt-4"
                            >
                                <button
                                    onClick={() => navigate('/products-liste')}
                                    className="group inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm md:text-base px-6 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer"
                                >
                                    Explorer la marketplace
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => navigate('/about')}
                                    className="inline-flex items-center justify-center border border-slate-700 hover:border-slate-500 text-white hover:bg-slate-800/30 font-bold text-sm md:text-base px-6 py-4 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
                                >
                                    Comment ça marche ?
                                </button>
                            </motion.div>
                        </div>

                        {/* Right Side: Graphic */}
                        <div className="lg:col-span-5 flex items-center justify-center relative mt-6 lg:mt-0">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="relative w-full max-w-[320px] md:max-w-[400px]"
                            >
                                {/* Premium backing glows */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 rounded-full blur-3xl scale-125 pointer-events-none animate-pulse" />
                                
                                <img
                                    src={heroImage}
                                    className="w-full h-auto object-contain drop-shadow-2xl relative z-10 animate-float"
                                    alt="Vtout Online Shopping Benin"
                                    style={{ animation: 'float 6s ease-in-out infinite' }}
                                />
                            </motion.div>
                        </div>

                    </div>

                    {/* Sliding dots indicators */}
                    <div className="flex justify-center gap-2 mt-8 md:mt-12">
                        <span className="w-6 h-2 rounded-full bg-emerald-500 transition-all duration-300" />
                        <span className="w-2 h-2 rounded-full bg-slate-700 hover:bg-slate-600 cursor-pointer transition-all duration-300" />
                        <span className="w-2 h-2 rounded-full bg-slate-700 hover:bg-slate-600 cursor-pointer transition-all duration-300" />
                    </div>

                </div>
            </div>

            {/* Custom Animations */}
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

export default Hero;
