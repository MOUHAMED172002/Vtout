import React, { useState, useEffect } from "react";
import { useAuth } from "../../../lib/clerk-shim";
import { getAllOrders } from "../../../services/orderService";
import OrderTable from "./OrderTable";
import OrderDetailsModal from "./OrderDetailsModal";
import { ShoppingBag, Search, Filter, RefreshCcw, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function OrdersAdmin() {
  const { getToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openOrder, setOpenOrder] = useState(null);

  // Filtering states
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await getAllOrders(token);
      setOrders(data || []);
    } catch (error) {
      console.error(error);
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const normalizeStatus = (s) => {
    if (!s) return "";
    let val = s.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/ee$/, "e")
      .replace(/e$/, "");

    if (val.startsWith("en_attent") || val === "attente") return "en_attente";
    if (val.startsWith("confirm")) return "confirmee";
    if (val.startsWith("expedi") || val === "transit") return "expediee";
    if (val.startsWith("livr")) return "livree";
    if (val.startsWith("annul")) return "annulee";
    return val;
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeFilter === "all" || normalizeStatus(o.status) === normalizeStatus(activeFilter);
    return matchesSearch && matchesStatus;
  });

  const filterTabs = [
    { id: "all", label: "Tous", count: orders.length },
    { id: "en_attente", label: "En attente", count: orders.filter(o => normalizeStatus(o.status) === "en_attente").length },
    { id: "confirmee", label: "Confirmés", count: orders.filter(o => normalizeStatus(o.status) === "confirmee").length },
    { id: "expediee", label: "Expédiés", count: orders.filter(o => normalizeStatus(o.status) === "expediee").length },
    { id: "livree", label: "Livrés", count: orders.filter(o => normalizeStatus(o.status) === "livree").length },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-[0.3em]">
            <ShoppingBag size={14} /> Ventes
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Gestion des <span className="text-slate-400">Commandes</span></h1>
          <p className="text-slate-500 font-bold max-w-lg">Suivez les expéditions, validez les paiements et gérez les retours clients.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Référence ou Client..."
              className="bg-transparent border-none text-sm font-bold text-slate-600 focus:ring-0 w-48"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="text-slate-300 hover:text-rose-500 transition-colors">
                <X size={16} />
              </button>
            )}
          </div>

          <button onClick={fetchOrders} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all text-slate-400">
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === tab.id
              ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
              : 'bg-white text-slate-400 border border-slate-100 hover:border-slate-200'
              }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-lg text-[8px] ${activeFilter === tab.id ? 'bg-white/20 text-slate-900' : 'bg-slate-50 text-slate-400'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Table Content */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-gray-100 p-2 shadow-xl shadow-slate-200/50 overflow-hidden"
      >
        <OrderTable orders={filteredOrders} loading={loading} onView={(o) => setOpenOrder(o)} />
      </motion.div>

      <OrderDetailsModal order={openOrder} isOpen={!!openOrder} onClose={() => setOpenOrder(null)} onUpdated={fetchOrders} />
    </div>
  );
}
