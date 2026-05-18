import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image1 from '../../assets/hero/headphone.png';
import Image2 from '../../assets/category/vr.png';
import Image3 from '../../assets/category/macbook.png';
import { ArrowRight, Sparkles, Loader2, Flame, Percent, Package, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const HeroData = [
    {
        id: 1,
        img: Image1,
        subtitle: 'Beats Solo Edition',
        title: "Sensation",
        title2: "Wireless",
        color: "from-blue-500/20 to-indigo-500/10",
        textColor: "text-blue-600"
    },
    {
        id: 2,
        img: Image2,
        subtitle: 'Futur Immédiat',
        title: "Réalité",
        title2: "Virtuelle",
        color: "from-emerald-500/20 to-teal-500/10",
        textColor: "text-emerald-600"
    },
    {
        id: 3,
        img: Image3,
        subtitle: 'Performance Pro',
        title: "MacBook",
        title2: "M3 Ultra",
        color: "from-orange-500/20 to-amber-500/10",
        textColor: "text-orange-600"
    },
];

// Helper to format countdown timer
const getCountdownString = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Hero = () => {
    const navigate = useNavigate();
    const [heroData, setHeroData] = useState(HeroData);
    const [loading, setLoading] = useState(true);
    
    // Live countdown starting at 6 hours for visual engagement (resets daily)
    const [timeLeft, setTimeLeft] = useState(21600); 

    useEffect(() => {
        const fetchHeroConfig = async () => {
            try {
                const { data } = await api.get('/configs/public');
                const heroConfig = data.find(c => c.key === 'hero_carousel');
                if (heroConfig && heroConfig.value) {
                    setHeroData(JSON.parse(heroConfig.value));
                }
            } catch (error) {
                console.error("Erreur chargement config Hero:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHeroConfig();
    }, []);

    // Timer effect
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 21600));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const settings = {
        dots: true,
        infinite: true,
        speed: 800,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        cssEase: "cubic-bezier(0.87, 0, 0.13, 1)",
        pauseOnHover: false,
        dotsClass: "slick-dots custom-dots",
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="animate-spin text-primary w-10 h-10" />
            </div>
        );
    }

    return (
        <section className="relative pt-6 md:pt-10 overflow-hidden">
            <div className="container px-4 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    
                    {/* Left Column: Carousel Banner (60%) */}
                    <div className="lg:col-span-7 xl:col-span-8 flex">
                        <div className="w-full hero-bg-color rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl border border-slate-100 relative overflow-hidden flex flex-col justify-between">
                            <Slider {...settings}>
                                {heroData.map((data) => (
                                    <div key={data.id} className="outline-none">
                                        <div className={`grid grid-cols-1 md:grid-cols-12 min-h-[480px] md:min-h-[580px] relative px-8 md:px-14 py-12 md:py-0 items-center`}>

                                            {/* Background Accents */}
                                            <div className={`absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br ${data.color} rounded-full blur-3xl opacity-60`}></div>

                                            {/* Text Content */}
                                            <div className="md:col-span-7 flex flex-col justify-center relative z-10 text-center md:text-left space-y-4 md:space-y-6">
                                                <motion.div
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5 }}
                                                    className={`flex items-center gap-2 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs ${data.textColor} justify-center md:justify-start`}
                                                >
                                                    <Sparkles size={14} /> {data.subtitle}
                                                </motion.div>

                                                <div className="space-y-1">
                                                    <motion.h1
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.6, delay: 0.1 }}
                                                        className="text-4xl md:text-6xl xl:text-7xl font-black text-gray-900 leading-[0.95] tracking-tight"
                                                    >
                                                        {data.title}
                                                    </motion.h1>
                                                    <motion.h2
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.6, delay: 0.2 }}
                                                        className="text-3xl md:text-5xl xl:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-500 to-slate-300 leading-[0.95]"
                                                    >
                                                        {data.title2}
                                                    </motion.h2>
                                                </div>

                                                <motion.div
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.5, delay: 0.3 }}
                                                    className="pt-4"
                                                >
                                                    <button
                                                        onClick={() => navigate('/products-liste')}
                                                        className="group relative inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl text-sm font-black hover:bg-primary transition-all duration-300 shadow-lg hover:shadow-primary/20 active:scale-95"
                                                    >
                                                        Explorer
                                                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                                                    </button>
                                                </motion.div>
                                            </div>

                                            {/* Image Section */}
                                            <div className="md:col-span-5 relative z-10 flex items-center justify-center mt-6 md:mt-0">
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.85 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                                    className="relative w-full max-w-[200px] md:max-w-[340px]"
                                                >
                                                    <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl scale-125"></div>
                                                    <img
                                                        src={data.img}
                                                        className="w-full h-auto object-contain drop-shadow-xl relative z-10"
                                                        alt={data.title}
                                                    />
                                                </motion.div>
                                            </div>

                                        </div>
                                    </div>
                                ))}
                            </Slider>
                        </div>
                    </div>

                    {/* Right Column: Interactive Promotions Hub (40%) */}
                    <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
                        
                        {/* 1. Flash Sales Card */}
                        <div 
                            onClick={() => navigate('/promotions/flash')}
                            className="flex-1 bg-gradient-to-br from-rose-500/10 to-orange-500/5 hover:from-rose-500/20 hover:to-orange-500/10 border border-rose-100 hover:border-rose-200 rounded-[2rem] p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer relative overflow-hidden min-h-[160px]"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full translate-x-4 -translate-y-4 blur-xl pointer-events-none" />
                            
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="inline-flex items-center gap-1.5 bg-rose-500 text-white font-black uppercase text-[10px] tracking-wider px-3 py-1 rounded-full shadow-sm animate-pulse">
                                        <Flame size={12} className="fill-white" /> Vente Flash
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight mt-1">
                                        Baisses de Prix
                                    </h3>
                                    <p className="text-xs font-bold text-slate-500">
                                        Jusqu'à -50% sur une sélection limitée.
                                    </p>
                                </div>
                                
                                {/* Countdown Timer */}
                                <div className="flex items-center gap-1.5 bg-slate-900 text-white font-mono font-black text-xs md:text-sm px-3 py-1.5 rounded-xl shadow-md border border-slate-800">
                                    <Clock size={14} className="text-rose-500 animate-spin" style={{ animationDuration: '3s' }} />
                                    <span>{getCountdownString(timeLeft)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mt-4">
                                <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 bg-rose-50 px-2.5 py-1 rounded-lg">
                                    Offres Chrono
                                </span>
                                <span className="flex items-center gap-1 text-slate-800 font-black text-xs uppercase tracking-wider group-hover:text-primary transition-colors">
                                    Profiter de l'offre
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>
                        </div>

                        {/* 2. Volume Discount Card */}
                        <div 
                            onClick={() => navigate('/promotions/quantite')}
                            className="flex-1 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 hover:from-blue-500/20 hover:to-indigo-500/10 border border-blue-100 hover:border-blue-200 rounded-[2rem] p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer relative overflow-hidden min-h-[160px]"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full translate-x-4 -translate-y-4 blur-xl pointer-events-none" />
                            
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="inline-flex items-center gap-1.5 bg-blue-600 text-white font-black uppercase text-[10px] tracking-wider px-3 py-1 rounded-full shadow-sm">
                                        <Percent size={12} /> Plus tu achètes, moins tu paies
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight mt-1">
                                        Remises sur Quantité
                                    </h3>
                                    <p className="text-xs font-bold text-slate-500">
                                        Économisez automatiquement par paliers d'achat.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mt-4">
                                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                                    Jusqu'à -20% dès 3 articles
                                </span>
                                <span className="flex items-center gap-1 text-slate-800 font-black text-xs uppercase tracking-wider group-hover:text-primary transition-colors">
                                    Simuler
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>
                        </div>

                        {/* 3. Product Kits Card */}
                        <div 
                            onClick={() => navigate('/promotions/kits')}
                            className="flex-1 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 hover:from-emerald-500/20 hover:to-teal-500/10 border border-emerald-100 hover:border-emerald-200 rounded-[2rem] p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer relative overflow-hidden min-h-[160px]"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full translate-x-4 -translate-y-4 blur-xl pointer-events-none" />
                            
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="inline-flex items-center gap-1.5 bg-emerald-600 text-white font-black uppercase text-[10px] tracking-wider px-3 py-1 rounded-full shadow-sm">
                                        <Package size={12} /> Kits complets
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight mt-1">
                                        Packs Économiques
                                    </h3>
                                    <p className="text-xs font-bold text-slate-500">
                                        Des lots de produits complémentaires à prix cassé.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mt-4">
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                    Lots à prix réduit
                                </span>
                                <span className="flex items-center gap-1 text-slate-800 font-black text-xs uppercase tracking-wider group-hover:text-primary transition-colors">
                                    Découvrir
                                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            <style>{`
                .custom-dots {
                    bottom: 25px !important;
                }
                .custom-dots li button:before {
                    content: '' !important;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #cbd5e1;
                    transition: all 0.3s;
                }
                .custom-dots li.slick-active button:before {
                    background: #f97316;
                    transform: scale(1.4);
                }
            `}</style>
        </section>
    );
};

export default Hero;
