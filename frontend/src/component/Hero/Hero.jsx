import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ArrowRight, ShieldCheck, Lock, Truck, Headphones, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { useTheme } from '../context/ThemeContext';
import defaultHeroImage from '../../assets/hero/hero_shopping.png';

const Hero = () => {
    const navigate = useNavigate();
    const [heroData, setHeroData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    // Determine if theme is dark
    const darkThemes = ["dark", "synthwave", "cyberpunk", "luxury", "dracula"];
    const isDark = darkThemes.includes(theme);

    useEffect(() => {
        const fetchHeroConfig = async () => {
            try {
                const { data } = await api.get('/configs/public');
                const heroConfig = data.find(c => c.key === 'hero_carousel');
                if (heroConfig && heroConfig.value) {
                    setHeroData(JSON.parse(heroConfig.value));
                } else {
                    // Fallback to default premium Benin slide
                    setHeroData([
                        {
                            id: 1,
                            img: defaultHeroImage,
                            subtitle: 'VOTRE ACHAT EN TOUTE CONFIANCE',
                            title: "Le shopping en ligne",
                            title2: "pensé pour le Bénin",
                            description: "Sur Vtout, des milliers de vendeurs de tout le pays proposent une grande variété de produits sur une plateforme simple, sécurisée et fiable.",
                            color: "from-emerald-500/20 to-teal-500/10",
                            textColor: "text-emerald-400"
                        }
                    ]);
                }
            } catch (error) {
                console.error("Erreur chargement config Hero:", error);
                setHeroData([
                    {
                        id: 1,
                        img: defaultHeroImage,
                        subtitle: 'VOTRE ACHAT EN TOUTE CONFIANCE',
                        title: "Le shopping en ligne",
                        title2: "pensé pour le Bénin",
                        description: "Sur Vtout, des milliers de vendeurs de tout le pays proposent une grande variété de produits sur une plateforme simple, sécurisée et fiable.",
                        color: "from-emerald-500/20 to-teal-500/10",
                        textColor: "text-emerald-400"
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchHeroConfig();
    }, []);

    const settings = {
        dots: true,
        infinite: heroData.length > 1,
        speed: 800,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: heroData.length > 1,
        autoplaySpeed: 5000,
        cssEase: "cubic-bezier(0.87, 0, 0.13, 1)",
        pauseOnHover: false,
        dotsClass: "slick-dots custom-dots",
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96 bg-slate-950/5">
                <Loader2 className="animate-spin text-emerald-500 w-10 h-10" />
            </div>
        );
    }

    // Dynamic Classes for theme adaptation
    const bgContainerClass = isDark 
        ? "bg-[#0b1329]/80 border-slate-800/80" 
        : "bg-slate-50/90 border-slate-200/80 shadow-lg";
    
    const textTitleClass = isDark ? "text-white" : "text-slate-900";
    const textSubtitleClass = isDark ? "text-slate-400" : "text-slate-600";
    const propTitleClass = isDark ? "text-white" : "text-slate-800";
    const propDescClass = isDark ? "text-slate-500" : "text-slate-500";
    
    const buttonOutlineClass = isDark 
        ? "border-slate-700 hover:border-slate-500 text-white hover:bg-slate-800/30" 
        : "border-slate-300 hover:border-slate-400 text-slate-800 hover:bg-slate-100/50";

    return (
        <section className={`relative pt-6 md:pt-10 overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
            {/* Background Glows */}
            {isDark && (
                <>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
                </>
            )}

            <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                <div className={`w-full rounded-[2.5rem] md:rounded-[3.5rem] border shadow-2xl relative overflow-hidden transition-all duration-300 ${bgContainerClass}`}>
                    
                    {/* Background Subtle Mesh */}
                    {isDark && (
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
                    )}

                    <Slider {...settings}>
                        {heroData.map((slide) => (
                            <div key={slide.id || slide._id} className="outline-none">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center px-8 md:px-14 py-12 md:py-14 relative">
                                    
                                    {/* Slide Highlight Glow */}
                                    <div className={`absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br ${slide.color || 'from-emerald-500/20 to-teal-500/10'} rounded-full blur-3xl opacity-60 pointer-events-none`}></div>

                                    {/* Left Side: Content */}
                                    <div className="lg:col-span-7 space-y-6 md:space-y-8 text-left relative z-10">
                                        
                                        {/* Confidence Badge */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold tracking-wider uppercase"
                                        >
                                            <ShieldCheck size={16} className="text-emerald-500" />
                                            {slide.subtitle || 'VOTRE ACHAT EN TOUTE CONFIANCE'}
                                        </motion.div>

                                        {/* Main Title */}
                                        <div className="space-y-2">
                                            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight ${textTitleClass}`}>
                                                {slide.title || 'Le shopping en ligne' } <br />
                                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
                                                    {slide.title2 || 'pensé pour le Bénin'}
                                                </span>
                                            </h1>
                                        </div>

                                        {/* Subtitle / Description */}
                                        <p className={`text-sm md:text-base leading-relaxed max-w-2xl font-medium ${textSubtitleClass}`}>
                                            {slide.description || "Sur Vtout, des milliers de vendeurs de tout le pays proposent une grande variété de produits sur une plateforme simple, sécurisée et fiable."}
                                        </p>

                                        {/* Value Props Row */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pt-4 border-t border-slate-500/20">
                                            {/* Prop 1 */}
                                            <div className="flex gap-3">
                                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                    <ShieldCheck size={18} className="text-emerald-500" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <h4 className={`text-xs md:text-sm font-bold ${propTitleClass}`}>Paiement à la réception</h4>
                                                    <p className={`text-[10px] md:text-xs ${propDescClass}`}>Payez quand vous recevez</p>
                                                </div>
                                            </div>

                                            {/* Prop 2 */}
                                            <div className="flex gap-3">
                                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                    <Lock size={16} className="text-emerald-500" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <h4 className={`text-xs md:text-sm font-bold ${propTitleClass}`}>Transactions sécurisées</h4>
                                                    <p className={`text-[10px] md:text-xs ${propDescClass}`}>Données protégées</p>
                                                </div>
                                            </div>

                                            {/* Prop 3 */}
                                            <div className="flex gap-3">
                                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                    <Truck size={18} className="text-emerald-500" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <h4 className={`text-xs md:text-sm font-bold ${propTitleClass}`}>Livraison simplifiée</h4>
                                                    <p className={`text-[10px] md:text-xs ${propDescClass}`}>Suivi & coordination</p>
                                                </div>
                                            </div>

                                            {/* Prop 4 */}
                                            <div className="flex gap-3">
                                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                    <Headphones size={18} className="text-emerald-500" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <h4 className={`text-xs md:text-sm font-bold ${propTitleClass}`}>Support 7j/7</h4>
                                                    <p className={`text-[10px] md:text-xs ${propDescClass}`}>À votre écoute</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex flex-wrap gap-4 pt-4">
                                            <button
                                                onClick={() => navigate(slide.link || '/products-liste')}
                                                className="group inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm md:text-base px-6 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer"
                                            >
                                                {slide.buttonText || "Explorer la marketplace"}
                                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                            <button
                                                onClick={() => navigate(slide.button2Link || '/about')}
                                                className={`inline-flex items-center justify-center border font-bold text-sm md:text-base px-6 py-4 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer ${buttonOutlineClass}`}
                                            >
                                                {slide.button2Text || "Comment ça marche ?"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Right Side: Graphic */}
                                    <div className="lg:col-span-5 flex items-center justify-center relative mt-6 lg:mt-0">
                                        <div className="relative w-full max-w-[320px] md:max-w-[400px]">
                                            {/* Premium backing glows */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 rounded-full blur-3xl scale-125 pointer-events-none animate-pulse" />
                                            
                                            <img
                                                src={slide.img || defaultHeroImage}
                                                className="w-full h-auto object-contain drop-shadow-2xl relative z-10 animate-float"
                                                alt={slide.title || "Vtout Online Shopping Benin"}
                                                style={{ animation: 'float 6s ease-in-out infinite' }}
                                                onError={(e) => {
                                                    e.target.src = defaultHeroImage;
                                                }}
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </Slider>

                </div>
            </div>

            {/* Custom Animations & Slick CSS overrides */}
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .custom-dots {
                    bottom: 25px !important;
                }
                .custom-dots li button:before {
                    content: '' !important;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: ${isDark ? '#334155' : '#cbd5e1'} !important;
                    transition: all 0.3s;
                }
                .custom-dots li.slick-active button:before {
                    background: #10b981 !important;
                    transform: scale(1.4);
                }
            `}</style>
        </section>
    );
};

export default Hero;
