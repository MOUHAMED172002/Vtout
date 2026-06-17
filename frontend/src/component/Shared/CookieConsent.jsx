import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Cookie, ExternalLink } from 'lucide-react';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptAll = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        window.gtag?.('config', 'G-VVET0H2YQ7');
        window.fbq?.('init', '2483353495522576');
        window.fbq?.('track', 'PageView');
        setIsVisible(false);
    };

    const declineAll = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:right-12 md:w-[450px] z-[9999]"
                >
                    <div className="bg-neutral rounded-[2.5rem] p-8 shadow-2xl border border-white/10 relative overflow-hidden group">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all"></div>

                        <div className="relative z-10 flex flex-col gap-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                                        <Cookie size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tight">Expérience personnalisée</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Gestion des cookies</p>
                                    </div>
                                </div>
                                <button
                                    onClick={declineAll}
                                    className="text-white/40 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <p className="text-sm font-medium text-white/60 leading-relaxed">
                                Nous utilisons des cookies pour améliorer votre navigation, analyser le trafic du site et personnaliser votre expérience d'achat.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={acceptAll}
                                    className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-base-200 hover:text-base-content transition-all shadow-xl shadow-primary/10"
                                >
                                    Accepter tout
                                </button>
                                <div className="flex gap-3">
                                    <button
                                        onClick={declineAll}
                                        className="flex-1 py-4 bg-base-100/5 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-base-200/10 transition-all border border-white/10"
                                    >
                                        Refuser
                                    </button>
                                    <Link
                                        to="/privacy"
                                        className="flex-1 py-4 bg-transparent text-white/40 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        Politique <ExternalLink size={12} />
                                    </Link>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] font-bold text-white/30">
                                <ShieldCheck size={14} className="text-emerald-500" />
                                Vos données sont protégées et cryptées.
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
