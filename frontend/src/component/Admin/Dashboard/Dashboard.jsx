import React, { useEffect, useState } from "react";
import { useAuth } from "../../../lib/clerk-shim";
import { getDashboardStats } from "../../../services/statsService";
import QuickStats from "../Dashboard/QuickStats";
import SalesChart from "../Dashboard/SalesChart";
import TopProducts from "../Dashboard/TopProducts";
import RecentOrders from "../Dashboard/RecentOrders";
import InventoryAlerts from "../Dashboard/InventoryAlerts";
import TopCustomers from "../Dashboard/TopCustomers";
import CategoryDistribution from "../Dashboard/CategoryDistribution";
import FulfillmentQueue from "../Dashboard/FulfillmentQueue";
import { LayoutDashboard, Download, RefreshCcw, TrendingUp, Package, Users, AlertCircle, PieChart, Star, UserCheck, Check, CheckCircle, Clock, DollarSign, Truck, UserPlus, MessageCircle, Activity, Store } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import OrderDetailsModal from "../Order/OrderDetailsModal";
import { getDeliveryStatsAdmin, confirmCashRemitted } from "../../../services/deliveryService";

export default function Dashboard({ changeTab }) {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: { revenue: 0, orders: 0, customers: 0, avg_order_value: 0 },
    salesChart: [],
    topProducts: [],
    recentOrders: [],
    lowStock: [],
    supplierPerformance: [],
    topCustomers: [],
    categoryDistribution: [],
    fulfillmentQueue: []
  });
  const [deliveryStats, setDeliveryStats] = useState({ debts: [], dailyDeliveries: [] });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const [period, setPeriod] = useState("30J");

  const loadData = async (selectedPeriod = period) => {
    setLoading(true);
    try {
      const token = await getToken();
      // In a real app, passing the period to the API
      const statsData = await getDashboardStats(token, selectedPeriod);
      setData(statsData);

      // Fetch delivery stats
      const dStats = await getDeliveryStatsAdmin(token);
      setDeliveryStats(dStats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (order) => {
    // Check both recent orders and fulfillment queue
    const fullOrder = data.recentOrders.find(r => r.id === order.id) || 
                      data.fulfillmentQueue.find(f => f.id === order.id) || 
                      order;
    if (fullOrder) {
      setSelectedOrder(fullOrder);
      setShowOrderModal(true);
    }
  };

  // Removed getToken from dependencies to prevent infinite loops reported by Clerks behavior
  useEffect(() => { loadData(); }, [period]);

  const handleConfirmCash = async (deliveryPersonId) => {
    try {
      const token = await getToken();
      await confirmCashRemitted(token, deliveryPersonId);
      toast.success("Versement confirmé !");
      loadData(); // Refresh stats
    } catch (err) {
      toast.error("Erreur lors de la confirmation");
    }
  };

  const handleDownloadReport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Date,Revenue,Orders\n"
      + data.salesChart.map(s => `${s.day},${s.total},${s.count || 0}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rapport_ventes_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    toast.success("Rapport généré avec succès !");
  };

  const salesChartData = {
    labels: data.salesChart.map(s => s.day),
    values: data.salesChart.map(s => parseFloat(s.total))
  };

  const topProductsFormatted = data.topProducts.map(tp => ({
    id: tp.product_id,
    name: tp.product?.name || 'Produit',
    image: tp.product?.image_url,
    sold: tp.sold,
    price: tp.product?.price
  }));

  const recentOrdersFormatted = data.recentOrders.map(r => ({
    id: r.id,
    customer: r.user?.fullname || "Invité",
    amount: parseFloat(r.total_amount),
    status: r.status,
    date: r.created_at
  }));

  return (
    <div className="space-y-6 lg:space-y-12 animate-in fade-in duration-1000 pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary font-black uppercase text-[10px] lg:text-xs tracking-[0.3em]">
            <LayoutDashboard size={14} /> Global Insight
          </div>
          <h1 className="text-3xl lg:text-5xl font-black text-gray-900 tracking-tighter">
            Tableau de <span className="text-slate-400">Bord</span>
          </h1>
          <p className="text-xs lg:text-base text-slate-500 font-bold max-w-lg">
            Analysez les performances, suivez vos VIP et gérez la file d'attente en temps réel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          <div className="flex bg-white rounded-2xl p-1 lg:p-1.5 border border-slate-100 shadow-sm">
            {["7J", "30J", "12M"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 lg:px-6 py-1.5 lg:py-2 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all ${period === p
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                  : "text-slate-400 hover:text-slate-900"
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button onClick={() => loadData()} className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-primary hover:text-white transition-all">
            <RefreshCcw size={18} />
          </button>
          <button
            onClick={handleDownloadReport}
            className="btn btn-primary rounded-2xl h-10 lg:h-12 px-4 lg:px-6 font-black text-xs lg:text-sm gap-2 shadow-lg shadow-primary/20"
          >
            <Download size={18} /> <span className="hidden sm:inline">Rapports</span>
          </button>
        </div>
      </div>

      <div className="space-y-6 lg:space-y-12">
        <QuickStats stats={data.stats} />

        {/* Row 1: Sales Chart & Category Distribution */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-8 bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-gray-100 p-6 lg:p-10 shadow-xl shadow-slate-100/50"
          >
            <div className="flex items-center justify-between mb-6 lg:mb-10">
              <div className="space-y-1">
                <h2 className="text-xl lg:text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tighter">
                  Analyse des Ventes <TrendingUp className="text-emerald-500" size={24} />
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Évolution du chiffre d'affaires</p>
              </div>
            </div>
            <div className="h-[300px] lg:h-[400px]">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <span className="loading loading-bars loading-lg text-primary"></span>
                </div>
              ) : <SalesChart data={salesChartData} />}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="xl:col-span-4 bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-gray-100 p-6 lg:p-10 shadow-xl shadow-slate-100/50"
          >
            <div className="space-y-1 mb-6 lg:mb-8">
              <h2 className="text-xl lg:text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tighter">
                Catégories <PieChart className="text-indigo-500" size={24} />
              </h2>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Répartition des ventes</p>
            </div>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <span className="loading loading-spinner text-primary"></span>
              </div>
            ) : <CategoryDistribution distribution={data.categoryDistribution} />}
          </motion.div>
        </div>

        {/* Row 2: Top Customers & Fulfillment Queue */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-4 bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-gray-100 p-6 lg:p-10 shadow-xl shadow-slate-100/50"
          >
            <div className="space-y-1 mb-6 lg:mb-10">
              <h2 className="text-xl lg:text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tighter">
                VIP Clients <UserCheck className="text-emerald-500" size={24} />
              </h2>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Top 5 contributeurs</p>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse"></div>)}
              </div>
            ) : <TopCustomers customers={data.topCustomers} />}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="xl:col-span-8 bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-gray-100 p-6 lg:p-10 shadow-xl shadow-slate-100/50"
          >
            <div className="flex items-center justify-between mb-6 lg:mb-10">
              <div className="space-y-1">
                <h2 className="text-xl lg:text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tighter">
                  File d'Attente <Package className="text-primary" size={24} />
                </h2>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Commandes à traiter</p>
              </div>
              <button onClick={() => changeTab?.("Commandes", "delivery")} className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Voir tout</button>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse"></div>)}
              </div>
            ) : <FulfillmentQueue orders={data.fulfillmentQueue} onOrderClick={handleOrderClick} />}
          </motion.div>
        </div>

        {/* Row 3: Top Products & Inventory Alerts */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="xl:col-span-7 bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-gray-100 p-6 lg:p-10 shadow-xl shadow-slate-100/50"
          >
            <div className="flex items-center justify-between mb-6 lg:mb-10">
              <h2 className="text-xl lg:text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tighter">
                Best-Sellers <Star className="text-amber-500" size={24} />
              </h2>
              <Link to="/products-liste" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Stock</Link>
            </div>
            <div className="space-y-0 text-slate-900">
              {loading ? (
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse"></div>)}
                </div>
              ) : <TopProducts products={topProductsFormatted} />}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="xl:col-span-5 bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-gray-100 p-6 lg:p-10 shadow-xl shadow-slate-100/50"
          >
            <div className="space-y-1 mb-6 lg:mb-8">
              <h2 className="text-xl lg:text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tighter">
                Ruptures Proches <AlertCircle className="text-rose-500" size={24} />
              </h2>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Niveaux critiques</p>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse"></div>)}
              </div>
            ) : <InventoryAlerts items={data.lowStock} />}
          </motion.div>
        </div>

        {/* row 3.5: Performance Partenaires */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-12 bg-white rounded-[2rem] lg:rounded-[2.5rem] border border-gray-100 p-6 lg:p-10 shadow-xl shadow-slate-100/50"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="space-y-1">
                <h2 className="text-xl lg:text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tighter">
                  Performance Marchands <Store className="text-emerald-500" size={24} />
                </h2>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Classement par CA</p>
              </div>
              <button 
                onClick={() => changeTab?.("Fournisseurs", "suppliersList")} 
                className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
              >
                Gérer les marchands
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6">
              {data.supplierPerformance?.length > 0 ? data.supplierPerformance.map((sup, idx) => (
                <div key={idx} className="p-4 lg:p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-primary/20 transition-all group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm font-black text-base lg:text-lg group-hover:scale-110 transition-transform">
                      {sup.name ? sup.name.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900 truncate">{sup.name || "Marchand"}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{sup.orders} ventes</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Chiffre d'Affaires</p>
                    <p className="text-lg lg:text-xl font-black text-emerald-600">{Number(sup.revenue).toLocaleString()} F</p>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  Aucune performance enregistrée.
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Orders Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-900 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-800 p-6 lg:p-10 shadow-2xl overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="p-2 border-b border-slate-800 flex items-center justify-between mb-8 relative z-10">
            <div className="space-y-1">
              <h2 className="text-xl lg:text-2xl font-black text-white flex items-center gap-3 tracking-tighter">
                Dernières Activités <Users className="text-primary" size={24} />
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Temps réel</p>
            </div>
            <button onClick={() => changeTab?.("Commandes", "ordersList")} className="btn btn-primary btn-xs sm:btn-sm rounded-xl font-black shadow-lg shadow-primary/20 uppercase tracking-widest">Journal</button>
          </div>

          <div className="relative z-10">
            {recentOrdersFormatted.length > 0 ? (
               <RecentOrders orders={recentOrdersFormatted} darkTheme={true} onOrderClick={handleOrderClick} />
            ) : (
              <div className="py-20 text-center text-slate-500 text-xs font-bold italic">Aucune commande récente.</div>
            )}
          </div>
        </motion.div>

        {/* Row 4: Logistics & Finance (Livreurs) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-12">
          {/* Cash to collect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="xl:col-span-6 bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-xl shadow-slate-100/50"
          >
            <div className="space-y-1 mb-8">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tighter">
                Cash à Récupérer <DollarSign className="text-amber-500" size={24} />
              </h2>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Paiements à l'arrivée (Dette Livreur)</p>
            </div>

            <div className="space-y-4">
              {deliveryStats.debts?.length > 0 ? deliveryStats.debts.map((debt, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm font-black">
                      {debt.deliveryPerson?.profile?.fullname?.substring(0, 2).toUpperCase() || "L"}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{debt.deliveryPerson?.profile?.fullname}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{debt.order_count} commandes non remises</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-primary">{Number(debt.total_debt).toLocaleString()} F</p>
                    <button
                      onClick={() => handleConfirmCash(debt.delivery_person_id)}
                      className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
                    >
                      Confirmer versement
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-12 flex flex-col items-center justify-center gap-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300">
                    <Check size={24} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tout est à jour</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Activity per day */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="xl:col-span-6 bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-xl shadow-slate-100/50"
          >
            <div className="space-y-1 mb-8">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tighter">
                Courses du Jour <Truck className="text-primary" size={24} />
              </h2>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Performances quotidiennes</p>
            </div>

            <div className="space-y-4">
              {deliveryStats.dailyDeliveries?.length > 0 ? deliveryStats.dailyDeliveries.map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm font-black">
                      {stat.deliveryPerson?.profile?.fullname?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{stat.deliveryPerson?.profile?.fullname}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[8px] font-black uppercase tracking-widest">En ligne</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-2xl font-black text-slate-900">{stat.count}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Livrées</p>
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 rounded-3xl">
                  Aucune livraison terminée aujourd'hui
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* --- NEW: LIVE SUPPORT & LOGISTIQUE --- */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-8 bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tighter">
                Derniers Messages Support <MessageCircle className="text-primary" size={24} />
              </h2>
              <button className="text-xs font-black text-primary uppercase tracking-widest">Ouvrir le Chat</button>
            </div>
            
            <div className="space-y-4">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic text-slate-400 text-xs font-bold text-center py-10">
                Consultez l'onglet "Messages Support" pour répondre aux clients.
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-4 bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-xl"
          >
            <h2 className="text-2xl font-black flex items-center gap-3 tracking-tighter mb-6">
              Live Map <Activity className="text-primary" size={24} />
            </h2>
            <div className="bg-slate-800 rounded-3xl p-8 text-center space-y-4">
              <p className="text-xs font-bold text-slate-400">Suivez les livreurs en mouvement sur la Tour de Contrôle.</p>
              <button className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20">
                Accéder à la carte
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={showOrderModal}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
