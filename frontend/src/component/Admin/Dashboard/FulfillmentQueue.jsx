import React from "react";
import { Clock, CheckCircle, ArrowRight, Package } from "lucide-react";
import { motion } from "framer-motion";

const FulfillmentQueue = ({ orders = [], onOrderClick }) => {
    return (
        <div className="space-y-4">
            {orders.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <CheckCircle className="mx-auto text-emerald-400 mb-2" size={32} />
                    <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Tout est à jour !</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {orders.map((order, idx) => {
                        const isGroupable = orders.filter(o => (o.user?.fullname === order.user?.fullname || o.guest_phone === order.guest_phone) && o.user?.fullname).length > 1;
                        return (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => onOrderClick?.(order)}
                                className="group cursor-pointer bg-white p-5 rounded-3xl border border-slate-100 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all flex items-center justify-between"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-black text-slate-900">#{order.id.substring(0, 8)}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${order.status === 'en_attente' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                {order.status}
                                            </span>
                                            {isGroupable && (
                                                <span className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase animate-pulse">
                                                    Groupement Possible
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-bold text-slate-500">{order.user?.fullname || "Client"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Montant</p>
                                        <p className="text-sm font-black text-slate-900">{Number(order.total_amount).toLocaleString()} F</p>
                                    </div>
                                    <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                        <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FulfillmentQueue;
