import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { useTheme } from '../context/ThemeContext';
import defaultHeroImage from '../../assets/hero/hero_shopping.png';

const Hero = () => {
    const navigate = useNavigate();
    const [heroData, setHeroData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

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
                    setHeroData([
                        {
                            id: 1,
                            img: defaultHeroImage,
                            subtitle: 'VOTRE ACHAT EN TOUTE CONFIANCE',
                            title: "Le shopping en ligne",
                            title2: "pensé pour le Bénin",
                            description: "Sur Vtout, des milliers de vendeurs de tout le pays proposent une grande variété de produits sur une plateforme simple, sécurisée et fiable.",
                            color: "from-[#0054a6]/20 to-[#f37021]/10",
                            textColor: "text-[#0054a6]"
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
                        color: "from-[#0054a6]/20 to-[#f37021]/10",
                        textColor: "text-[#0054a6]"
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
                <Loader2 className="animate-spin w-10 h-10" style={{ color: '#f37021' }} />
            </div>
        );
    }

    const bgContainerClass = isDark
        ? "bg-[#050d1a]/80 border-[#0054a6]/30"
        : "bg-slate-50/90 border-slate-200/80 shadow-lg";

    const textTitleClass = isDark ? "text-white" : "text-slate-900";
    const textSubtitleClass = isDark ? "text-slate-400" : "text-slate-600";
    const buttonOutlineClass = isDark
        ? "border-slate-700 hover:border-[#0054a6]/60 text-white hover:bg-[#0054a6]/10"
        : "border-slate-300 hover:border-[#0054a6]/40 text-slate-800 hover:bg-[#0054a6]/5";

    return (
        <section className={`relative pt-6 md:pt-10 overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
            {/* Background Glows */}
            {isDark && (
                <>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(0,84,166,0.12)' }} />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(243,112,33,0.08)' }} />
                </>
            )}

            <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                <div className={`w-full rounded-[2.5rem] md:rounded-[3.5rem] border shadow-2xl relative overflow-hidden transition-all duration-300 ${bgContainerClass}`}>

                    {isDark && (
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
                    )}

                    <Slider {...settings}>
                        {heroData.map((slide) => (
                            <div key={slide.id || slide._id} className="outline-none">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-6 md:px-10 py-8 md:py-10 relative">

                                    {/* Slide Glow */}
                                    <div
                                        className={`absolute -top-20 -left-20 w-72 h-72 md:w-96 md:h-96 bg-gradient-to-br ${slide.color || 'from-[#0054a6]/20 to-[#f37021]/10'} rounded-full blur-3xl opacity-60 pointer-events-none`}
                                    />

                                    {/* Left: Content */}
                                    <div className="lg:col-span-7 space-y-5 md:space-y-7 text-left relative z-10 max-w-3xl">

                                        {/* Badge */}
                                        <motion.div
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase"
                                            style={{ background: 'rgba(0,84,166,0.08)', border: '1px solid rgba(0,84,166,0.25)', color: '#0054a6' }}
                                        >
                                            <ShieldCheck size={16} style={{ color: '#0054a6' }} />
                                            {slide.subtitle || 'VOTRE ACHAT EN TOUTE CONFIANCE'}
                                        </motion.div>

                                        {/* Title */}
                                        <div className="space-y-2">
                                            <h1 className={`text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight ${textTitleClass}`}>
                                                {slide.title || 'Le shopping en ligne'} <br />
                                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0054a6] to-[#f37021]">
                                                    {slide.title2 || 'pensé pour le Bénin'}
                                                </span>
                                            </h1>
                                        </div>

                                        {/* Description */}
                                        <p className={`text-sm md:text-base leading-relaxed max-w-2xl font-medium ${textSubtitleClass}`}>
                                            {slide.description || "Sur Vtout, des milliers de vendeurs de tout le pays proposent une grande variété de produits sur une plateforme simple, sécurisée et fiable."}
                                        </p>

                                        {/* Buttons */}
                                        <div className="flex flex-wrap gap-4 pt-4">
                                            <button
                                                onClick={() => navigate(slide.link || '/products-liste')}
                                                className="group inline-flex items-center gap-2 text-white font-bold text-sm md:text-base px-6 py-4 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer"
                                                style={{ background: '#f37021', boxShadow: '0 8px 24px rgba(243,112,33,0.25)' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#d95f0a'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#f37021'}
                                            >
                                                {slide.buttonText || "Explorer la marketplace"}
                                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                            <button
                                                onClick={() => navigate(slide.button2Link || '/comment-ca-marche/acheteur')}
                                                className={`inline-flex items-center justify-center border font-bold text-sm md:text-base px-6 py-4 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer ${buttonOutlineClass}`}
                                            >
                                                {slide.button2Text || "Comment ça marche ?"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Right: Image */}
                                    <div className="lg:col-span-5 hidden lg:flex items-center justify-center relative mt-6 lg:mt-0">
                                        <div className="relative w-full max-w-[320px] md:max-w-[400px]">
                                            <div className="absolute inset-0 rounded-full blur-3xl scale-125 pointer-events-none animate-pulse" style={{ background: 'linear-gradient(135deg, rgba(0,84,166,0.15), rgba(243,112,33,0.1))' }} />
                                            <img
                                                src={slide.img || defaultHeroImage}
                                                className="w-full h-auto object-contain drop-shadow-2xl relative z-10"
                                                alt={slide.title || "Vtout Online Shopping Benin"}
                                                style={{ animation: 'float 6s ease-in-out infinite' }}
                                                onError={(e) => { e.target.src = defaultHeroImage; }}
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </Slider>

                </div>
            </div>

            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                    100% { transform: translateY(0px); }
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
                    background: #f37021 !important;
                    transform: scale(1.4);
                }
            `}</style>
        </section>
    );
};

export default Hero;
