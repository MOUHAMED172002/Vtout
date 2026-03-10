import React from 'react';
import { AlertTriangle, ChevronRight, Package, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function InventoryAlerts({ items }) {
    if (!items || items.length === 0) return (
        <div className="flex flex-col items-center justify-center p-12 bg-emerald-50/30 rounded-[2rem] border border-emerald-100/50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner mb-4">
                <Package className="text-emerald-500" size={32} />
            </div>
            <p className="text-emerald-600 font-black uppercase text-[10px] tracking-widest text-center">Stock Optimal • Aucun produit critique</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
                {items.map((item, idx) => {
                    const productName = item.variant?.product?.name || "Produit inconnu";
                    let combination = "";
                    try {
                        const rawComb = item.variant?.combination;
                        const combObj = typeof rawComb === 'string' ? JSON.parse(rawComb) : rawComb;
                        if (Array.isArray(combObj)) {
                            combination = combObj.map(c => c.value || c).join(' / ');
                        } else if (combObj && typeof combObj === 'object') {
                            combination = Object.entries(combObj).map(([k, v]) => `${k}: ${v}`).join(' / ');
                        }
                    } catch (e) {
                        console.error("Error parsing combination:", e);
                    }

                    return (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={item.id}
                            className="group p-5 bg-white rounded-2xl border border-slate-100 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-500/5 transition-all flex items-center gap-5"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center relative ${item.stock === 0 ? 'bg-rose-100 text-rose-600 shadow-rose-200/50 shadow-lg' : 'bg-amber-100 text-amber-600 shadow-amber-200/50 shadow-lg'
                                }`}>
                                {item.stock === 0 ? <AlertTriangle size={20} /> : <ShoppingCart size={20} />}
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-50">
                                    <span className="text-[10px] font-black">{item.stock}</span>
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-black text-slate-900 truncate tracking-tight">{productName}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate mt-0.5">{combination}</p>
                            </div>

                            <div className="text-right">
                                <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border ${item.stock === 0 ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>
                                    {item.stock === 0 ? 'Rupture' : 'Bas'}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <Link
                to="/admin/products"
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-primary transition-all duration-500"
            >
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">Gérer l'inventaire complet</span>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
            </Link>
        </div>
    );
}
