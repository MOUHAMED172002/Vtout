import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from './ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, Sparkles, X } from 'lucide-react';

const ThemeSelector = () => {
    const { theme, setTheme, themes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    // AnimatePresence MUST be inside createPortal, not outside
    const modal = (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        key="theme-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', zIndex: 999998 }}
                        onClick={() => setIsOpen(false)}
                    />
                    <motion.div
                        key="theme-modal"
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '90%',
                            maxWidth: '450px',
                            maxHeight: '85vh',
                            zIndex: 999999,
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: '2.5rem',
                            overflow: 'hidden',
                        }}
                        className="bg-base-100 shadow-[0_20px_70px_rgba(0,0,0,0.3)] border border-base-content/10"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 pb-4 border-b border-base-content/5 shrink-0">
                            <div className="flex items-center gap-3">
                                <Sparkles className="text-primary" size={20} />
                                <h3 className="font-black text-sm uppercase tracking-[0.2em] text-base-content">Univers Visuel</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-base-200 rounded-full transition-colors text-base-content/30">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-2 gap-3 overflow-y-auto p-6 pt-4 flex-grow">
                            {themes.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => { setTheme(t); setIsOpen(false); }}
                                    className={`relative p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-left transition-all hover:scale-105 active:scale-95 ${
                                        theme === t
                                            ? 'bg-primary text-primary-content shadow-lg shadow-primary/30'
                                            : 'bg-base-200 hover:bg-base-300 text-base-content'
                                    }`}
                                >
                                    <div className="flex flex-col gap-2">
                                        <span className="truncate">{t}</span>
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                                            <div className="w-2 h-2 rounded-full bg-secondary"></div>
                                            <div className="w-2 h-2 rounded-full bg-accent"></div>
                                        </div>
                                    </div>
                                    {theme === t && (
                                        <div className="absolute top-2 right-2">
                                            <Check size={12} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <p className="p-4 pt-0 text-[9px] font-bold text-base-content/40 text-center uppercase tracking-widest shrink-0">
                            Expérience Vtout 3.0
                        </p>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center gap-2 p-2.5 md:p-3 bg-base-200 border border-base-content/5 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-black uppercase tracking-widest hover:bg-primary/20 transition-all shadow-sm"
            >
                <Palette size={18} className="text-primary" />
                <span className="hidden lg:inline">Thème</span>
            </motion.button>
            {typeof document !== 'undefined' && createPortal(modal, document.body)}
        </div>
    );
};

export default ThemeSelector;
