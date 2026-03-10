import React from "react";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { motion } from "framer-motion";

const StatCard = ({ title, value, icon, color, trend, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-100/50 flex flex-col gap-6 group hover:border-primary/20 transition-all"
  >
    <div className="flex items-start justify-between">
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-slate-900 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
    </div>
  </motion.div>
);

const QuickStats = ({ stats = {} }) => {
  const { revenue = 0, orders = 0, customers = 0, avg_order_value = 0 } = stats;

  const config = [
    { title: "Chiffre d'Affaire", value: `${Number(revenue).toLocaleString()} F`, icon: <TrendingUp size={24} />, color: "bg-indigo-600 shadow-indigo-100", trend: 14.5 },
    { title: "Volume Commandes", value: orders.toLocaleString(), icon: <ShoppingBag size={24} />, color: "bg-primary shadow-orange-100", trend: 8.2 },
    { title: "Membres Actifs", value: customers.toLocaleString(), icon: <Users size={24} />, color: "bg-emerald-600 shadow-emerald-100", trend: -2.4 },
    { title: "Valeur Panier", value: `${Number(avg_order_value).toLocaleString()} F`, icon: <DollarSign size={24} />, color: "bg-amber-500 shadow-amber-100", trend: 3.1 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {config.map((stat, idx) => (
        <StatCard
          key={idx}
          index={idx}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          trend={stat.trend}
        />
      ))}
    </div>
  );
};

export default QuickStats;