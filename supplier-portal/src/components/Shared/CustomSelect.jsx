import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({ options, value, onChange, placeholder = "Sélectionner...", className = "" }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(o => String(o.value) === String(value));

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all outline-none flex items-center justify-between shadow-sm hover:shadow-md"
            >
                <span className={selectedOption ? 'text-slate-900' : 'text-slate-400'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 w-full mt-2 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
                    >
                        <div className="max-h-64 overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {options.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-6 py-4 rounded-2xl text-sm font-bold flex items-center justify-between transition-all duration-200 ${
                                        String(value) === String(opt.value) 
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[0.98]' 
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    {opt.label}
                                    {String(value) === String(opt.value) && <Check size={16} strokeWidth={3} />}
                                </button>
                            ))}
                            {options.length === 0 && (
                                <div className="px-6 py-4 text-sm font-bold text-slate-400 text-center">
                                    Aucune option
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
