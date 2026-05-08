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
                className="flex items-center justify-center gap-2 p-2.5 md:p-3 bg-base-200 md:bg-white/10 backdrop-blur-md border border-base-content/5 md:border-white/20 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-black uppercase tracking-widest hover:bg-primary/20 transition-all shadow-sm md:shadow-lg"
            >
                <Palette size={18} className="text-primary" />
                <span className="hidden lg:inline">Thème</span>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-md"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                            exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                            style={{ perspective: "1000px" }}
                            className="fixed top-1/2 left-1/2 w-[min(calc(100vw-2rem),450px)] bg-base-100 rounded-[2.5rem] shadow-[0_20px_70px_rgba(0,0,0,0.3)] border border-base-content/10 z-[1001] p-6 flex flex-col max-h-[85vh]"
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
