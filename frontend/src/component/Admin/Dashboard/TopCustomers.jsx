import React from "react";
import { User, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const TopCustomers = ({ customers = [] }) => {
    return (
        <div className="space-y-6">
            {customers.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-base-content/40 font-bold">Aucune donnée client</p>
                </div>
            ) : (
                customers.map((c, idx) => (
                    <motion.div
                        key={c.user_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-2xl bg-base-200 border border-base-200 group hover:bg-base-200 hover:border-primary/20 hover:shadow-lg transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-base-100 border border-base-200 flex items-center justify-center text-base-content/40 group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-base-content group-hover:text-primary transition-colors">
                                    {c.user?.fullname || "Client Inconnu"}
                                </p>
                                <p className="text-[10px] font-black uppercase text-base-content/40 tracking-widest">
                                    {c.orders_count} commandes
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black text-base-content">
                                {Number(c.spent).toLocaleString()} F
                            </p>
                            <div className="flex items-center justify-end gap-1 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                <Award size={10} /> VIP
                            </div>
                        </div>
                    </motion.div>
                ))
            )}
        </div>
    );
};

export default TopCustomers;
