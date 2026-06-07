import React, { useState, useEffect } from "react";
import { useAuth } from "../../../lib/AuthHooks";
import { getAllOrders } from "../../../services/orderService";
import OrderTable from "./OrderTable";
import OrderDetailsModal from "./OrderDetailsModal";
import { ShoppingBag, Search, Filter, RefreshCcw, X, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../../../services/api";


export default function OrdersAdmin({ globalSearchQuery = "" }) {
  const { getToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openOrder, setOpenOrder] = useState(null);

  // Filtering states
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const [pendingExpanded, setPendingExpanded] = useState(true);
  const [confirming, setConfirming] = useState({});

  const handleConfirm = async (orderId) => {
    setConfirming(prev => ({ ...prev, [orderId]: true }));
    try {
      const token = await getToken();
      await api.patch(`/orders/${orderId}/status`, { status: 'confirmee' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Commande confirmée !");
      fetchOrders();
    } catch {
      toast.error("Erreur lors de la confirmation");
    } finally {
      setConfirming(prev => ({ ...prev, [orderId]: false }));
    }
  };

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

  const exportCSV = () => {
    if (filteredOrders.length === 0) { toast.error("Aucune commande à exporter"); return; }

    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const STATUS_LABELS = { en_attente: "En attente", confirmee: "Confirmée", expediee: "Expédiée", livree: "Livrée", annulee: "Annulée" };

    const rows = [
      ["Référence", "Client", "Email", "Montant (FCFA)", "Statut", "Paiement", "Date"].map(escape).join(","),
      ...filteredOrders.map(o => [
        o.id.slice(0, 8).toUpperCase(),
        o.customer_name || o.guest_name || o.user?.fullname || "—",
        o.user?.email || o.guest_email || "—",
        Number(o.total_amount).toFixed(0),
        STATUS_LABELS[normalizeStatus(o.status)] || o.status,
        o.payment_method || "—",
        new Date(o.created_at || o.createdAt).toLocaleDateString('fr-FR'),
      ].map(escape).join(","))
    ].join("\n");

    const blob = new Blob(["﻿" + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commandes-vtout-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filteredOrders.length} commande(s) exportée(s)`);
  };

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
    const query = (searchTerm || globalSearchQuery).toLowerCase(); const matchesSearch = o.id.toLowerCase().includes(query) ||
      o.user_id.toLowerCase().includes(query) || (o.customer_name && o.customer_name.toLowerCase().includes(query));
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

          <button 
            onClick={async () => {
              try {
                const token = await getToken();
                // This would need a backend route
                await api.post('/orders/check-reminders', {}, { headers: { Authorization: `Bearer ${token}` } });
                toast.success("Rappels envoyés aux boutiques !");
                fetchOrders();
              } catch (e) {
                toast.error("Erreur lors de l'envoi des rappels");
              }
            }} 
            className="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
          >
            <RefreshCcw size={16} />
            Relancer les bloqués
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
            title="Exporter en CSV"
          >
            <Download size={16} /> Export CSV
          </button>

          <button onClick={fetchOrders} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all text-slate-400">
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      {/* Pending orders alert section */}
      {(() => {
        const pendingOrders = orders.filter(o => normalizeStatus(o.status) === "en_attente");
        if (pendingOrders.length === 0) return null;
        return (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-[2rem] overflow-hidden shadow-sm"
          >
            <button
              onClick={() => setPendingExpanded(p => !p)}
              className="w-full flex items-center justify-between px-8 py-5 hover:bg-amber-100/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <AlertTriangle size={18} />
                </div>
                <div className="text-left">
                  <p className="font-black text-amber-800 text-sm uppercase tracking-widest">
                    {pendingOrders.length} commande{pendingOrders.length > 1 ? 's' : ''} en attente de confirmation
                  </p>
                  <p className="text-amber-600 text-xs font-bold">Confirmez-les pour les rendre visibles aux vendeurs</p>
                </div>
              </div>
              {pendingExpanded ? <ChevronUp size={18} className="text-amber-500" /> : <ChevronDown size={18} className="text-amber-500" />}
            </button>

            <AnimatePresence>
              {pendingExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-8 pb-6 space-y-3">
                    {pendingOrders.map(order => (
                      <div key={order.id} className="flex items-center justify-between bg-white rounded-2xl px-6 py-4 border border-amber-100 shadow-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">#{order.id.slice(0, 8).toUpperCase()}</span>
                          <span className="text-sm font-bold text-slate-700">{order.customer_name || order.guest_name || "Client"}</span>
                          <span className="text-xs font-bold text-slate-400">{new Date(order.created_at || order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-black text-slate-900 text-sm">{Number(order.total_amount).toLocaleString('fr-FR')} F</span>
                          <button
                            onClick={() => handleConfirm(order.id)}
                            disabled={confirming[order.id]}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md shadow-emerald-500/20 disabled:opacity-60"
                          >
                            {confirming[order.id] ? <span className="loading loading-spinner loading-xs" /> : <CheckCircle2 size={14} />}
                            Confirmer
                          </button>
                          <button onClick={() => setOpenOrder(order)} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                            Détails
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })()}

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

