import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Tag } from 'lucide-react';

// --- Countdown Timer Hook ---
function useCountdown(dateStr) {
    const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        if (!dateStr) return;
        const target = new Date(dateStr).getTime();
        if (isNaN(target)) return;
        setIsValid(true);

        const calc = () => {
            const diff = target - Date.now();
            if (diff <= 0) { setTimeLeft({ d: 0, h: 0, m: 0, s: 0 }); return; }
            setTimeLeft({
                d: Math.floor(diff / 86400000),
                h: Math.floor((diff % 86400000) / 3600000),
                m: Math.floor((diff % 3600000) / 60000),
                s: Math.floor((diff % 60000) / 1000),
            });
        };
        calc();
        const id = setInterval(calc, 1000);
        return () => clearInterval(id);
    }, [dateStr]);

    return { timeLeft, isValid };
}

// --- Countdown Unit ---
const CountUnit = ({ value, label }) => (
    <div className="flex flex-col items-center min-w-[44px]">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-xl font-black text-slate-900 tabular-nums leading-none">
            {String(value).padStart(2, '0')}
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest text-slate-900/50 mt-1">{label}</span>
    </div>
);

const Banner = ({ data }) => {
    const { timeLeft, isValid } = useCountdown(data?.date);

    // Parse accent color from bgcolor
    const accentColor = data?.bgcolor || '#f42c37';

    return (
        <section className="w-full py-6 px-4 sm:px-6 lg:px-8">
            <div
                className="relative w-full max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden min-h-[320px] sm:min-h-[380px]"
                style={{
                    background: `linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 40%, ${accentColor}22 100%)`,
                }}
            >
                {/* Decorative glow blobs */}
                <div
                    className="absolute top-[-60px] left-[-40px] w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none"
                    style={{ background: accentColor }}
                />
                <div
                    className="absolute bottom-[-80px] right-[15%] w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{ background: accentColor }}
                />

                {/* Grid layout: text / image / cta */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center h-full px-8 py-10 md:px-12 md:py-12">

                    {/* ── Col 1: Text ── */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="space-y-4"
                    >
                        {/* Discount badge */}
                        <motion.div
                            animate={{ scale: [1, 1.06, 1] }}
                            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-slate-900 shadow-xl"
                            style={{ background: accentColor }}
                        >
                            <Zap size={12} fill="currentColor" />
                            {data?.discount || 'Offre exclusive'}
                        </motion.div>

                        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter leading-none uppercase">
                            {data?.title || 'Offre Spéciale'}
                        </h2>

                        <p className="text-slate-900/60 font-bold text-sm leading-relaxed">
                            {data?.title4 || 'Offre limitée, profitez-en vite !'}
                        </p>

                        {/* Countdown if dateStr is ISO */}
                        {isValid && (
                            <div className="flex items-center gap-2 pt-2">
                                <CountUnit value={timeLeft.d} label="Jours" />
                                <span className="text-slate-900/30 font-black text-xl mb-4">:</span>
                                <CountUnit value={timeLeft.h} label="Heures" />
                                <span className="text-slate-900/30 font-black text-xl mb-4">:</span>
                                <CountUnit value={timeLeft.m} label="Min" />
                                <span className="text-slate-900/30 font-black text-xl mb-4">:</span>
                                <CountUnit value={timeLeft.s} label="Sec" />
                            </div>
                        )}

                        {/* Show date string when not ISO */}
                        {!isValid && data?.date && (
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-900/40">
                                {data.date}
                            </p>
                        )}
                    </motion.div>

                    {/* ── Col 2: Product Image ── */}
                    <div className="flex items-center justify-center relative">
                        {/* Floating outer ring */}
                        <motion.div
                            animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.3, 0.15] }}
                            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                            className="absolute w-56 h-56 rounded-full border-2 border-dashed pointer-events-none"
                            style={{ borderColor: accentColor }}
                        />

                        {/* Product image — floating up/down */}
                        <motion.img
                            src={data?.image}
                            alt={data?.title || 'produit'}
                            animate={{ y: [0, -12, 0] }}
                            transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                            className="relative z-10 w-48 sm:w-56 lg:w-64 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
                        />

                        {/* Floating discount tag on image */}
                        <motion.div
                            animate={{ rotate: [-4, 2, -4], scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                            className="absolute top-4 right-4 sm:right-6 flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase text-slate-900 shadow-2xl border border-white/20"
                            style={{ background: accentColor }}
                        >
                            <Tag size={10} />
                            {data?.discount || 'PROMO'}
                        </motion.div>
                    </div>

                    {/* ── Col 3: CTA ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
                        className="space-y-5 flex flex-col"
                    >
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-900/40">
                                {data?.title2 || 'Collection'}
                            </p>
                            <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mt-1">
                                {data?.title3 || 'Ventes Spéciales'}
                            </h3>
                        </div>

                        {/* Divider */}
                        <div
                            className="w-16 h-1 rounded-full"
                            style={{ background: accentColor }}
                        />

                        <p className="text-sm text-slate-900/50 font-bold leading-relaxed">
                            Des prix imbattables sur une sélection premium. Stocks limités.
                        </p>

                        {/* CTA Button */}
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                            <Link
                                to="/products-liste"
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-black uppercase tracking-widest text-slate-900 shadow-2xl transition-all group"
                                style={{ background: 'white' }}
                            >
                                Découvrir
                                <motion.span
                                    animate={{ x: [0, 4, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                                >
                                    <ArrowRight size={16} style={{ color: accentColor }} />
                                </motion.span>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Bottom border accent */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-1 opacity-60"
                    style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
                />
            </div>
        </section>
    );
};

export default Banner;
