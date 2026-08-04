import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from './ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, Sparkles, X } from 'lucide-react';

const ThemeSelector = () => {
    const { theme, setTheme, themes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const modal = (
        <AnimatePresence>
            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <motion.div
                        key="theme-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }}
                        onClick={() => setIsOpen(false)}
                    />
                    <motion.div
                        key="theme-modal"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{ position: 'relative', width: '100%', maxWidth: '450px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', borderRadius: '2rem', overflow: 'hidden' }}
                        className="bg-base-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-base-content/10"
                    >
                        <div className="flex items-center justify-between p-6 pb-4 border-b border-base-content/5 shrink-0">
                            <div className="flex items-center gap-3">
                                <Sparkles className="text-primary" size={20} />
                                <h3 className="font-black text-sm uppercase tracking-[0.2em] text-base-content">Univers Visuel</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-base-200 rounded-full transition-colors text-base-content/30">
                                <X size={18} />
                            </button>
                        </div>

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
                            Espace Marchand Vtout
                        </p>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 rounded-2xl bg-base-100 border border-base-200 shadow-sm text-base-content/40 hover:text-primary hover:shadow-md transition-all"
                title="Changer de thème"
            >
                <Palette size={18} />
            </motion.button>
            {typeof document !== 'undefined' && createPortal(modal, document.body)}
        </div>
    );
};

export default ThemeSelector;
