import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ShoppingBag } from "lucide-react";

/**
 * RecentOrders
 * props:
 *  - orders: [{ id, customer, amount, status, date }]
 *  - darkTheme: boolean
 */
const statusConfig = {
  en_attente: { label: "En Attente", class: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  confirmée: { label: "Confirmée", class: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  livrée: { label: "Livrée", class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  annulée: { label: "Annulée", class: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
};

const RecentOrders = ({ orders = [], darkTheme = false, onOrderClick }) => {
  const textColor = darkTheme ? "text-slate-300" : "text-slate-600";
  const headerColor = darkTheme ? "text-slate-500" : "text-slate-400";
  const borderColor = darkTheme ? "border-slate-800" : "border-slate-100";

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead>
          <tr className={`text-[10px] font-black uppercase tracking-[0.2em] ${headerColor}`}>
            <th className="px-6 py-4">Commande</th>
            <th className="px-6 py-4">Client</th>
            <th className="px-6 py-4">Montant</th>
            <th className="px-6 py-4">Statut</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o, idx) => {
            const status = statusConfig[o.status] || { label: o.status, class: "bg-slate-500/10 text-slate-500" };
            return (
              <motion.tr
                key={o.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onOrderClick?.(o)}
                className={`group cursor-pointer ${darkTheme ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'} transition-all`}
              >
                <td className="px-6 py-4">
                  <span className={`text-sm font-black ${darkTheme ? 'text-white' : 'text-slate-900'} group-hover:text-primary transition-colors`}>
                    #{o.id.substring(0, 8)}
                  </span>
                  <p className={`text-[10px] font-bold ${headerColor} mt-0.5`}>{new Date(o.date).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${darkTheme ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center text-[10px] font-black ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                      {o.customer?.substring(0, 2).toUpperCase()}
                    </div>
                    <span className={`text-sm font-bold ${textColor}`}>{o.customer}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-black ${darkTheme ? 'text-white' : 'text-slate-900'}`}>
                    {Number(o.amount).toLocaleString()} F
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${status.class}`}>
                    {status.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className={`w-8 h-8 rounded-lg ${darkTheme ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-slate-400 border-slate-100'} border flex items-center justify-center group-hover:bg-primary group-hover:text-slate-900 group-hover:border-primary transition-all`}>
                    <ArrowUpRight size={14} />
                  </button>
                </td>
              </motion.tr>
            );
          })}
          {orders.length === 0 && (
            <tr>
              <td colSpan="5" className="px-6 py-20 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center">
                    <ShoppingBag size={24} className="text-slate-600" />
                  </div>
                  <p className={`text-sm font-bold ${headerColor}`}>Aucune commande récente</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RecentOrders;