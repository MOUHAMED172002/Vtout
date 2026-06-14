import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Zap, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import defaultPromoImage from '../../assets/hero/promo_offers.png';

const PromotionsBanners = () => {
    const navigate = useNavigate();
    const [promoData, setPromoData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPromoConfig = async () => {
            try {
                const { data } = await api.get('/configs/public');
                const promoConfig = data.find(c => c.key === 'promotions_carousel');
                if (promoConfig && promoConfig.value) {
                    setPromoData(JSON.parse(promoConfig.value));
                } else {
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
                            button2Link: "/promotions"
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
                            button2Link: "/promotions"
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
                            button2Link: "/promotions"
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
                        button2Link: "/promotions"
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
            <div className="flex justify-center items-center h-48 bg-base-200">
                <Loader2 className="animate-spin w-8 h-8 text-primary" />
            </div>
        );
    }

    return (
        <section className="relative py-12 overflow-hidden bg-base-200 transition-colors duration-300">
            <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                <div className="w-full border border-primary/15 rounded-[2.5rem] md:rounded-[3.5rem] relative overflow-hidden shadow-2xl bg-base-100">

                    {/* Decorative glow accents */}
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-40"
                        style={{ background: 'radial-gradient(circle, rgba(243,112,33,0.12) 0%, transparent 70%)' }} />
                    <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none opacity-40"
                        style={{ background: 'radial-gradient(circle, rgba(0,84,166,0.08) 0%, transparent 70%)' }} />

                    <Slider {...settings}>
                        {promoData.map((slide) => (
                            <div key={slide.id || slide._id} className="outline-none">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-6 md:px-10 py-8 md:py-10 relative">

                                    {/* Left: Content */}
                                    <div className="lg:col-span-7 space-y-5 md:space-y-7 text-left relative z-10 max-w-3xl">

                                        {/* Promo Badge */}
                                        <motion.div
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black tracking-wider uppercase bg-primary/10 border border-primary/30 text-primary"
                                        >
                                            <Zap size={14} className="animate-pulse fill-primary" />
                                            {slide.badge || 'Offres Spéciales'}
                                        </motion.div>

                                        {/* Title + Circle Badge */}
                                        <div className="relative">
                                            <div className="space-y-2">
                                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-base-content">
                                                    {slide.title || 'Les meilleures'} <br />
                                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f37021] to-[#0054a6]">
                                                        {slide.titleAccent || 'offres du moment'}
                                                    </span>
                                                </h2>
                                            </div>

                                            {/* Circle Badge */}
                                            {slide.circleBadgeVal && (
                                                <div
                                                    className="hidden lg:flex absolute -top-6 right-0 lg:right-[-20px] w-24 h-24 rounded-full flex-col items-center justify-center text-center shadow-lg border-4 border-base-100 pointer-events-none z-20"
                                                    style={{ background: 'linear-gradient(135deg, #f37021, #0054a6)' }}
                                                >
                                                    <span className="text-[10px] font-black uppercase text-white/90 tracking-wider leading-none">
                                                        {slide.circleBadgeText || "Jusqu'à"}
                                                    </span>
                                                    <span className="text-2xl font-black text-white leading-none mt-1">
                                                        {slide.circleBadgeVal}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Subtitle */}
                                        <p className="text-sm md:text-base leading-relaxed max-w-2xl font-medium text-base-content/70">
                                            {slide.subtitle || 'Profitez de réductions exceptionnelles proposées par nos vendeurs partout au Bénin.'}
                                        </p>

                                        {/* Buttons */}
                                        <div className="flex flex-wrap gap-4 pt-4">
                                            <button
                                                onClick={() => navigate(slide.link || '/promotions/flash')}
                                                className="group inline-flex items-center gap-2 bg-primary text-white font-bold text-sm md:text-base px-6 py-4 rounded-xl hover:brightness-110 transition-all duration-300 active:scale-95 shadow-lg shadow-primary/25"
                                            >
                                                {slide.buttonText || 'Voir les offres'}
                                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                            <button
                                                onClick={() => navigate(slide.button2Link || '/promotions')}
                                                className="inline-flex items-center justify-center border border-base-content/20 text-base-content/80 font-bold text-sm md:text-base px-6 py-4 rounded-xl hover:border-base-content/40 hover:bg-base-200 transition-all duration-300 active:scale-95"
                                            >
                                                {slide.button2Text || 'Toutes les catégories'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Right: Image */}
                                    <div className="lg:col-span-5 hidden lg:flex items-center justify-center relative mt-10 lg:mt-0">
                                        <div className="relative w-full max-w-[320px] md:max-w-[400px]">
                                            <div className="absolute inset-0 rounded-full blur-3xl scale-125 pointer-events-none animate-pulse"
                                                style={{ background: 'linear-gradient(135deg, rgba(243,112,33,0.12), rgba(0,84,166,0.10))' }} />
                                            <img
                                                src={slide.img || defaultPromoImage}
                                                className="w-full h-auto object-contain drop-shadow-2xl relative z-10"
                                                alt={slide.title || "Les meilleures offres Vtout Bénin"}
                                                style={{ animation: 'float 6s ease-in-out infinite' }}
                                                onError={(e) => { e.target.src = defaultPromoImage; }}
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
                    0%   { transform: translateY(0px); }
                    50%  { transform: translateY(-12px); }
                    100% { transform: translateY(0px); }
                }
                .custom-promo-dots { bottom: 25px !important; }
                .custom-promo-dots li button:before {
                    content: '' !important;
                    width: 8px; height: 8px;
                    border-radius: 50%;
                    background: oklch(var(--bc)/0.2) !important;
                    transition: all 0.3s;
                }
                .custom-promo-dots li.slick-active button:before {
                    background: #f37021 !important;
                    transform: scale(1.4);
                }
            `}</style>
        </section>
    );
};

export default PromotionsBanners;
