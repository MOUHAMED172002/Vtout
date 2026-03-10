import React from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image1 from '../../assets/hero/headphone.png';
import Image2 from '../../assets/category/vr.png';
import Image3 from '../../assets/category/macbook.png';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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

const Hero = () => {
    const navigate = useNavigate();

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

    return (
        <section className="relative pt-6 md:pt-10 overflow-hidden">
            <div className="container px-4 md:px-8">
                <div className="hero-bg-color rounded-[2.5rem] md:rounded-[4rem] min-h-[500px] md:min-h-[700px] shadow-2xl shadow-slate-100 border border-white/50 relative overflow-hidden">
                    <Slider {...settings}>
                        {HeroData.map((data) => (
                            <div key={data.id} className="outline-none">
                                <div className={`grid grid-cols-1 lg:grid-cols-2 min-h-[500px] md:min-h-[700px] relative px-8 md:px-20 py-16 md:py-0 items-center`}>

                                    {/* Background Accents */}
                                    <div className={`absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br ${data.color} rounded-full blur-3xl opacity-60`}></div>

                                    {/* Text Content */}
                                    <div className="order-2 lg:order-1 flex flex-col justify-center relative z-10 text-center lg:text-left space-y-6 md:space-y-8">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6 }}
                                            className={`flex items-center gap-2 font-black uppercase tracking-[0.4em] text-xs md:text-sm ${data.textColor} justify-center lg:justify-start`}
                                        >
                                            <Sparkles size={16} /> {data.subtitle}
                                        </motion.div>

                                        <div className="space-y-2 md:space-y-0">
                                            <motion.h1
                                                initial={{ opacity: 0, x: -30 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.8, delay: 0.2 }}
                                                className="text-6xl md:text-8xl xl:text-9xl font-black text-gray-900 leading-[0.9]"
                                            >
                                                {data.title}
                                            </motion.h1>
                                            <motion.h2
                                                initial={{ opacity: 0, x: -30 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.8, delay: 0.4 }}
                                                className="text-5xl md:text-7xl xl:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-300 leading-[0.9]"
                                            >
                                                {data.title2}
                                            </motion.h2>
                                        </div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: 0.6 }}
                                            className="pt-6"
                                        >
                                            <button
                                                onClick={() => navigate('/products-liste')}
                                                className="group relative inline-flex items-center gap-3 bg-gray-900 text-white px-10 py-5 rounded-3xl font-black hover:bg-primary transition-all duration-300 shadow-xl shadow-gray-200 hover:shadow-primary/30 active:scale-95"
                                            >
                                                Explorer la collection
                                                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                                            </button>
                                        </motion.div>
                                    </div>

                                    {/* Image Section */}
                                    <div className="order-1 lg:order-2 relative z-10 flex items-center justify-center">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className="relative w-full max-w-[300px] md:max-w-[500px]"
                                        >
                                            <div className="absolute inset-0 bg-white/40 rounded-full blur-3xl scale-125"></div>
                                            <img
                                                src={data.img}
                                                className="w-full h-auto object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)] relative z-10"
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
          bottom: 40px !important;
        }
        .custom-dots li button:before {
          content: '' !important;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #e2e8f0;
          transition: all 0.3s;
        }
        .custom-dots li.slick-active button:before {
          background: #f97316;
          transform: scale(1.5);
        }
      `}</style>
        </section>
    );
};

export default Hero;
