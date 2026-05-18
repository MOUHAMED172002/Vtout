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
                <div className="w-full hero-bg-color rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl border border-slate-100 relative overflow-hidden">
                    <Slider {...settings}>
                        {heroData.map((data) => (
                            <div key={data.id} className="outline-none">
                                <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px] md:min-h-[580px] relative px-8 md:px-14 py-12 md:py-0 items-center">

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
