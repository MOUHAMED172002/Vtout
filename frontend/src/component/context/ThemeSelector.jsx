import React, { useState } from 'react';
import { useTheme } from './ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, Sparkles } from 'lucide-react';

const ThemeSelector = () => {
    const { theme, setTheme, themes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-primary/20 transition-all shadow-lg"
            >
                <Palette size={18} className="text-primary" />
                <span className="hidden md:inline">Thème</span>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[150]" onClick={() => setIsOpen(false)}></div>
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            style={{ perspective: "1000px" }}
                            className="fixed bottom-0 left-0 right-0 md:absolute md:bottom-auto md:left-auto md:right-0 md:top-full mt-4 w-full md:w-72 bg-base-100 rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.2)] md:shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-t md:border border-base-content/10 z-[160] p-6 pb-10 md:pb-6 flex flex-col max-h-[85vh] md:max-h-none"
                        >
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-content/5">
                                <Sparkles className="text-primary" size={20} />
                                <h3 className="font-black text-sm uppercase tracking-[0.2em] text-base-content">Univers Visuel</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 overflow-y-auto custom-scrollbar pr-2 flex-grow">
                                {themes.map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => {
                                            setTheme(t);
                                            setIsOpen(false);
                                        }}
                                        className={`group relative p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-left transition-all hover:scale-105 active:scale-95 ${
                                            theme === t 
                                            ? 'bg-primary text-primary-content shadow-lg shadow-primary/30' 
                                            : 'bg-base-200 hover:bg-base-300 text-base-content'
                                        }`}
                                    >
                                        <div className="flex flex-col gap-2">
                                            <span className="truncate">{t}</span>
                                            <div className="flex gap-1">
                                                <div className={`w-2 h-2 rounded-full bg-primary ${t === theme ? 'bg-white' : ''}`}></div>
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
                            
                            <p className="mt-6 text-[9px] font-bold text-base-content/40 text-center uppercase tracking-widest">
                                Expérience Vtout 3.0
                            </p>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ThemeSelector;
