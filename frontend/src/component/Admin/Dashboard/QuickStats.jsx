import React from "react";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  Truck,
  Megaphone
} from "lucide-react";
import { motion } from "framer-motion";

const StatCard = ({ title, value, icon, color, trend, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-base-100 p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-slate-100/50 flex flex-col gap-4 group hover:border-primary/20 transition-all"
  >
    <div className="flex items-start justify-between">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {trend > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div>
      <p className="text-[9px] font-black text-base-content/40 uppercase tracking-[0.2em] mb-1">{title}</p>
      <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
    </div>
  </motion.div>
);

const QuickStats = ({ stats = {} }) => {
  const {
    revenue = 0,
    admin_profit = 0,
    delivery_profits = 0,
    supplier_profits = 0,
    marketing_profits = 0,
    orders = 0,
    customers = 0
  } = stats;

  const config = [
    { title: "Ventes Globales", value: `${Number(revenue).toLocaleString()} F`, icon: <TrendingUp size={20} />, color: "bg-neutral shadow-slate-200" },
    { title: "Commission Admin", value: `${Number(admin_profit).toLocaleString()} F`, icon: <DollarSign size={20} />, color: "bg-purple-600 shadow-purple-100" },
    { title: "Gains Livreurs", value: `${Number(delivery_profits).toLocaleString()} F`, icon: <Truck size={20} />, color: "bg-blue-600 shadow-blue-100" },
    { title: "Gains Fournisseurs", value: `${Number(supplier_profits).toLocaleString()} F`, icon: <Store size={20} />, color: "bg-emerald-600 shadow-emerald-100" },
    { title: "Frais Marketing", value: `${Number(marketing_profits).toLocaleString()} F`, icon: <Megaphone size={20} />, color: "bg-rose-500 shadow-rose-100" },
    { title: "Commandes", value: orders.toLocaleString(), icon: <ShoppingBag size={20} />, color: "bg-primary shadow-orange-100" },
    { title: "Clients", value: customers.toLocaleString(), icon: <Users size={20} />, color: "bg-amber-500 shadow-amber-100" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-6">
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