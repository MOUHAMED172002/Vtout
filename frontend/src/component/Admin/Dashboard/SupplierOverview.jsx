import React from 'react';
import { Truck, Star, Box, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SupplierOverview({ suppliers }) {
    if (!suppliers || suppliers.length === 0) return (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50/50 rounded-[2rem] border border-slate-100">
            <Truck className="text-slate-200 mb-4" size={40} />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest italic tracking-tighter">Aucun fournisseur répertorié</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
                {suppliers.map((sup, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={sup.id}
                        className="group p-6 bg-white rounded-3xl border border-slate-50 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex items-center justify-between"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                                <Truck size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-slate-900 tracking-tighter">{sup.name}</h4>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <Box size={12} className="text-slate-300" />
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{sup.linkedProducts} <span className="text-slate-300">Articles</span></span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Star size={12} className="text-amber-400 fill-current" />
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Partenaire</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all">
                            <ChevronRight size={18} />
                        </button>
                    </motion.div>
                ))}
            </div>

            <div className="p-8 bg-indigo-600 rounded-[2rem] text-slate-900 flex items-center justify-between relative overflow-hidden shadow-2xl shadow-indigo-500/20 group cursor-pointer">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                    <Truck size={120} />
                </div>
                <div className="relative z-10 space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60">Gestion Partenaires</p>
                    <h4 className="text-xl font-black tracking-tighter">Voir l'annuaire complet</h4>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md group-hover:bg-white group-hover:text-indigo-600 transition-all duration-300">
                    <ChevronRight size={20} />
                </div>
            </div>
        </div>
    );
}
