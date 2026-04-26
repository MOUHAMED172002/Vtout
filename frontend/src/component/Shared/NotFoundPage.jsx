import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center px-6 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 text-center max-w-2xl mx-auto">
                {/* 404 Number */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
                    className="mb-8"
                >
                    <span className="text-[10rem] md:text-[14rem] font-black tracking-tighter leading-none"
                        style={{
                            background: 'linear-gradient(135deg, var(--p) 0%, #6366f1 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        404
                    </span>
                </motion.div>

                {/* Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="space-y-4 mb-12"
                >
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-base-content">
                        Page introuvable
                    </h1>
                    <p className="text-base-content/50 font-medium text-lg max-w-md mx-auto">
                        La page que vous cherchez n'existe pas ou a été déplacée.
                    </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-base-content/70 border border-base-content/10 hover:bg-base-200 transition-all"
                    >
                        <ArrowLeft size={18} />
                        Retour
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black bg-primary text-primary-content shadow-xl shadow-primary/20 hover:opacity-90 transition-all"
                    >
                        <Home size={18} />
                        Accueil
                    </button>

                    <button
                        onClick={() => navigate('/products-liste')}
                        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-base-content/70 border border-base-content/10 hover:bg-base-200 transition-all"
                    >
                        <ShoppingBag size={18} />
                        Boutique
                    </button>
                </motion.div>

                {/* Vtout branding */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 text-[10px] font-black uppercase tracking-[0.3em] text-base-content/20"
                >
                    Vtout — On vend tout
                </motion.p>
            </div>
        </div>
    );
}
