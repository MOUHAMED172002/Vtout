import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Zap, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { useTheme } from '../context/ThemeContext';
import defaultPromoImage from '../../assets/hero/promo_offers.png';

const PromotionsBanners = () => {
    const navigate = useNavigate();
    const [promoData, setPromoData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    // Determine if theme is dark
    const darkThemes = ["dark", "synthwave", "cyberpunk", "luxury", "dracula"];
    const isDark = darkThemes.includes(theme);

    useEffect(() => {
        const fetchPromoConfig = async () => {
            try {
                const { data } = await api.get('/configs/public');
                const promoConfig = data.find(c => c.key === 'promotions_carousel');
                if (promoConfig && promoConfig.value) {
                    setPromoData(JSON.parse(promoConfig.value));
                } else {
                    // Fallback to default premium promotions
                    setPromoData([
                        {
                            id: 1,
                            badge: "Offres Spéciales",
                            title: "Les meilleures",
                            titleAccent: "offres du moment",
                            subtitle: "Profitez de réductions exceptionnelles proposées par nos vendeurs partout au Bénin.",
                            circleBadgeText: "Jusqu'à",
                            circleBadgeVal: "-50%",
                            img: defaultPromoImage,
                            buttonText: "Voir les offres",
                            link: "/promotions/flash",
                            button2Text: "Toutes les catégories",
                            button2Link: "/categories"
                        },
                        {
                            id: 2,
                            badge: "Remises en Gros",
                            title: "Plus d'achats,",
                            titleAccent: "moins de frais",
                            subtitle: "Économisez automatiquement par paliers configurés directement par les grossistes.",
                            circleBadgeText: "Gros",
                            circleBadgeVal: "-20%",
                            img: defaultPromoImage,
                            buttonText: "Voir le gros",
                            link: "/promotions/quantite",
                            button2Text: "Toutes les catégories",
                            button2Link: "/categories"
                        },
                        {
                            id: 3,
                            badge: "Packs Tout-en-un",
                            title: "Kits complets",
                            titleAccent: "à prix sacrifié",
                            subtitle: "Achetez des lots d'articles complémentaires en 1-clic avec des remises cumulées importantes.",
                            circleBadgeText: "Pack",
                            circleBadgeVal: "-30%",
                            img: defaultPromoImage,
                            buttonText: "Découvrir",
                            link: "/promotions/kits",
                            button2Text: "Toutes les catégories",
                            button2Link: "/categories"
                        }
                    ]);
                }
            } catch (error) {
                console.error("Erreur chargement config Promotions:", error);
                setPromoData([
                    {
                        id: 1,
                        badge: "Offres Spéciales",
                        title: "Les meilleures",
                        titleAccent: "offres du moment",
                        subtitle: "Profitez de réductions exceptionnelles proposées par nos vendeurs partout au Bénin.",
                        circleBadgeText: "Jusqu'à",
                        circleBadgeVal: "-50%",
                        img: defaultPromoImage,
                        buttonText: "Voir les offres",
                        link: "/promotions/flash",
                        button2Text: "Toutes les catégories",
                        button2Link: "/categories"
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchPromoConfig();
    }, []);

    const settings = {
        dots: true,
        infinite: promoData.length > 1,
        speed: 800,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: promoData.length > 1,
        autoplaySpeed: 5000,
        adaptiveHeight: true,
        arrows: false,
        cssEase: "cubic-bezier(0.87, 0, 0.13, 1)",
        pauseOnHover: false,
        dotsClass: "slick-dots custom-promo-dots",
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-48 bg-slate-950/5">
                <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
            </div>
        );
    }

    // Dynamic Classes for theme adaptation
    const bgContainerClass = isDark 
        ? "bg-[#022c22]/90 border-emerald-900/40" 
        : "bg-emerald-50/90 border-emerald-200/80 shadow-lg";

    const textTitleClass = isDark ? "text-white" : "text-emerald-950";
    const textSubtitleClass = isDark ? "text-emerald-100/70" : "text-emerald-800/80";
    
    const buttonSolidClass = isDark 
        ? "bg-slate-100 hover:bg-white text-slate-950 shadow-xl" 
        : "bg-emerald-900 hover:bg-emerald-950 text-white shadow-lg";
        
    const buttonOutlineClass = isDark 
        ? "border-emerald-800 hover:border-emerald-600 text-white hover:bg-emerald-900/30" 
        : "border-emerald-300 hover:border-emerald-400 text-emerald-900 hover:bg-emerald-100/50";

    const badgeBorderClass = isDark ? "border-[#022c22]" : "border-emerald-50";

    return (
        <section className={`relative py-12 overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
            {/* Background Glows */}
            {isDark && (
                <>
                    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-950/20 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
                </>
            )}

            <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                <div className={`w-full border rounded-[2.5rem] md:rounded-[3.5rem] relative overflow-hidden shadow-2xl transition-all duration-300 ${bgContainerClass}`}>
                    
                    {/* Background Accents (Confetti / Decorative Shapes) */}
                    {isDark && (
                        <>
                            <div className="absolute top-12 left-1/4 w-3 h-3 bg-amber-400 rounded-full opacity-60 animate-bounce" />
                            <div className="absolute bottom-16 left-1/3 w-4 h-4 bg-emerald-400/40 rounded-lg rotate-45 pointer-events-none" />
                            <div className="absolute top-24 right-1/3 w-3 h-6 bg-rose-500/40 rounded-full -rotate-12 pointer-events-none" />
                        </>
                    )}

                    <Slider {...settings}>
                        {promoData.map((slide) => (
                            <div key={slide.id || slide._id} className="outline-none">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-6 md:px-10 py-8 md:py-10 relative">
                                    
                                    {/* Left Side: Content */}
                                    <div className="lg:col-span-7 space-y-5 md:space-y-7 text-left relative z-10 max-w-3xl">
                                        
                                        {/* Special Offers Badge */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-500 text-xs font-black tracking-wider uppercase"
                                        >
                                            <Zap size={14} className="fill-amber-500 animate-pulse text-amber-500" />
                                            {slide.badge || 'Offres Spéciales'}
                                        </motion.div>

                                        {/* Main Title & Circle Badge Wrapper */}
                                        <div className="relative">
                                            <div className="space-y-2">
                                                <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight ${textTitleClass}`}>
                                                    {slide.title || 'Les meilleures'} <br />
                                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-400">
                                                        {slide.titleAccent || 'offres du moment'}
                                                    </span>
                                                </h2>
                                            </div>

                                            {/* Golden Circle Badge (desktop only) */}
                                            {slide.circleBadgeVal && (
                                                <div className={`hidden lg:flex absolute -top-6 right-0 lg:right-[-20px] w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 flex-col items-center justify-center text-center shadow-lg border-4 pointer-events-none z-20 ${badgeBorderClass}`}>
                                                    <span className="text-[10px] font-black uppercase text-[#022c22] tracking-wider leading-none">{slide.circleBadgeText || "Jusqu'à"}</span>
                                                    <span className="text-2xl font-black text-[#022c22] leading-none mt-1">{slide.circleBadgeVal}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Subtitle */}
                                        <p className={`text-sm md:text-base leading-relaxed max-w-2xl font-medium ${textSubtitleClass}`}>
                                            {slide.subtitle || 'Profitez de réductions exceptionnelles proposées par nos vendeurs partout au Bénin.'}
                                        </p>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-4 pt-4">
                                            <button
                                                onClick={() => navigate(slide.link || '/promotions/flash')}
                                                className={`group inline-flex items-center gap-2 font-bold text-sm md:text-base px-6 py-4 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer ${buttonSolidClass}`}
                                            >
                                                {slide.buttonText || 'Voir les offres'}
                                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                            <button
                                                onClick={() => navigate(slide.button2Link || '/categories')}
                                                className={`inline-flex items-center justify-center border font-bold text-sm md:text-base px-6 py-4 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer ${buttonOutlineClass}`}
                                            >
                                                {slide.button2Text || 'Toutes les catégories'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Right Side: Podiums with image shown only on desktop */}
                                    <div className="lg:col-span-5 hidden lg:flex items-center justify-center relative mt-10 lg:mt-0">
                                        <div className="relative w-full max-w-[320px] md:max-w-[400px]">
                                            {/* Platform Backing Glow */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-emerald-500/10 rounded-full blur-3xl scale-125 pointer-events-none animate-pulse" />
                                            
                                            <img
                                                src={slide.img || defaultPromoImage}
                                                className="w-full h-auto object-contain drop-shadow-2xl relative z-10 animate-float"
                                                alt={slide.title || "Les meilleures offres Vtout Bénin"}
                                                style={{ animation: 'float 6s ease-in-out infinite' }}
                                                onError={(e) => {
                                                    e.target.src = defaultPromoImage;
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

            {/* Custom Animations & Overrides */}
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .custom-promo-dots {
                    bottom: 25px !important;
                }
                .custom-promo-dots li button:before {
                    content: '' !important;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: ${isDark ? '#334155' : '#cbd5e1'} !important;
                    transition: all 0.3s;
                }
                .custom-promo-dots li.slick-active button:before {
                    background: #f59e0b !important;
                    transform: scale(1.4);
                }
            `}</style>
        </section>
    );
};

export default PromotionsBanners;
