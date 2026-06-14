import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { useAuth } from "../../../lib/AuthHooks";
import { getDashboardStats } from "../../../services/statsService";
import {
  TrendingUp,
  Download,
  RefreshCcw,
  BarChart3,
  Users,
  Truck,
  ShoppingCart,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/* ─── Palette ─── */
const ROLE_CONFIG = {
  overview: {
    label: "Chiffre d'Affaires",
    color: "#6366f1",
    colorRgb: "99, 102, 241",
    icon: TrendingUp,
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-200",
    badge: "bg-indigo-600",
  },
  admin: {
    label: "Commissions Admin",
    color: "#f59e0b",
    colorRgb: "245, 158, 11",
    icon: Crown,
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    badge: "bg-amber-500",
  },
  supplier: {
    label: "Gains Vendeurs",
    color: "#10b981",
    colorRgb: "16, 185, 129",
    icon: BarChart3,
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    badge: "bg-emerald-500",
  },
  deliverer: {
    label: "Gains Livreurs",
    color: "#3b82f6",
    colorRgb: "59, 130, 246",
    icon: Truck,
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    badge: "bg-blue-500",
  },
  buyer: {
    label: "Dépenses Acheteurs",
    color: "#8b5cf6",
    colorRgb: "139, 92, 246",
    icon: ShoppingCart,
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-200",
    badge: "bg-violet-500",
  },
};

/* ─── Small inline chart (used by Dashboard overview) ─── */
const InlineChart = ({ data }) => {
  const chartRef = useRef(null);
  const [gradient, setGradient] = useState(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.ctx;
      const gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
      gradientFill.addColorStop(0, "rgba(99, 102, 241, 0.2)");
      gradientFill.addColorStop(1, "rgba(99, 102, 241, 0)");
      setGradient(gradientFill);
    }
  }, []);

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Ventes (F)",
        data: data.values,
        fill: true,
        backgroundColor: gradient,
        borderColor: "#6366f1",
        borderWidth: 4,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#6366f1",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "#6366f1",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 3,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        titleFont: { size: 12, weight: "bold", family: "'Inter', sans-serif" },
        bodyFont: { size: 14, weight: "black", family: "'Inter', sans-serif" },
        padding: 16,
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          label: (ctx) => `${Number(ctx.raw).toLocaleString()} F`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 10, weight: "bold", family: "'Inter', sans-serif" },
          color: "#94a3b8",
        },
      },
      y: {
        grid: { color: "rgba(241, 245, 249, 1)", drawBorder: false },
        ticks: {
          font: { size: 10, weight: "bold", family: "'Inter', sans-serif" },
          color: "#94a3b8",
          callback: (v) => `${v / 1000}k`,
        },
      },
    },
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

/* ─── Format date label ─── */
const formatDateLabel = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
};

/* ─── Stat Card ─── */
const StatCard = ({ config, total, trend, delay = 0 }) => {
  const Icon = config.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`relative overflow-hidden rounded-3xl border ${config.border} ${config.bg} p-5 lg:p-6 group hover:shadow-lg transition-all duration-300`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/50">
            {config.label}
          </p>
          <p className="text-2xl lg:text-3xl font-black text-base-content tracking-tight">
            {Number(total).toLocaleString()} <span className="text-base font-bold text-base-content/40">F</span>
          </p>
        </div>
        <div className={`w-12 h-12 rounded-2xl ${config.badge} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      {trend !== undefined && trend !== null && (
        <div className="mt-3 flex items-center gap-1.5">
          {trend >= 0 ? (
            <ArrowUpRight size={14} className="text-emerald-500" />
          ) : (
            <ArrowDownRight size={14} className="text-rose-500" />
          )}
          <span className={`text-xs font-black ${trend >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {Math.abs(trend).toFixed(1)}%
          </span>
          <span className="text-[10px] font-bold text-base-content/40">vs période préc.</span>
        </div>
      )}
    </motion.div>
  );
};

/* ─── Role Timeline Chart ─── */
const RoleTimelineChart = ({ timeline, config, chartType = "line" }) => {
  const chartRef = useRef(null);
  const [gradient, setGradient] = useState(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.ctx;
      const g = ctx.createLinearGradient(0, 0, 0, 300);
      g.addColorStop(0, `rgba(${config.colorRgb}, 0.15)`);
      g.addColorStop(1, `rgba(${config.colorRgb}, 0)`);
      setGradient(g);
    }
  }, [config.colorRgb]);

  const labels = timeline.map((t) => formatDateLabel(t.day));
  const values = timeline.map((t) => parseFloat(t.total || 0));

  const chartData = {
    labels,
    datasets: [
      {
        label: config.label,
        data: values,
        fill: true,
        backgroundColor: chartType === "bar" ? `rgba(${config.colorRgb}, 0.7)` : gradient,
        borderColor: config.color,
        borderWidth: chartType === "bar" ? 0 : 3,
        pointBackgroundColor: "#fff",
        pointBorderColor: config.color,
        pointBorderWidth: 2,
        pointRadius: chartType === "bar" ? 0 : 3,
        pointHoverRadius: 6,
        tension: 0.4,
        borderRadius: chartType === "bar" ? 8 : 0,
        barPercentage: 0.6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        titleFont: { size: 11, weight: "bold", family: "'Inter', sans-serif" },
        bodyFont: { size: 13, weight: "bold", family: "'Inter', sans-serif" },
        padding: 14,
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          label: (ctx) => `${config.label}: ${Number(ctx.raw).toLocaleString()} F`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 9, weight: "bold", family: "'Inter', sans-serif" },
          color: "#94a3b8",
          maxRotation: 45,
          maxTicksLimit: 15,
        },
      },
      y: {
        grid: { color: "rgba(241, 245, 249, 0.8)", drawBorder: false },
        ticks: {
          font: { size: 9, weight: "bold", family: "'Inter', sans-serif" },
          color: "#94a3b8",
          callback: (v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v),
        },
        beginAtZero: true,
      },
    },
  };

  const ChartComponent = chartType === "bar" ? Bar : Line;

  return (
    <div className="h-[260px] lg:h-[300px]">
      {timeline.length > 0 ? (
        <ChartComponent ref={chartRef} data={chartData} options={options} />
      ) : (
        <div className="h-full flex items-center justify-center text-base-content/30">
          <div className="text-center space-y-3">
            <Activity size={32} className="mx-auto opacity-40" />
            <p className="text-xs font-bold text-base-content/40">Pas de données pour cette période</p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Combined Multi-Line Overview ─── */
const CombinedChart = ({ data }) => {
  const chartRef = useRef(null);

  const labels = (data.adminTimeline || []).map((t) => formatDateLabel(t.day));

  const makeDataset = (timeline, cfg, dashed = false) => ({
    label: cfg.label,
    data: (timeline || []).map((t) => parseFloat(t.total || 0)),
    fill: false,
    borderColor: cfg.color,
    borderWidth: 3,
    borderDash: dashed ? [6, 4] : [],
    pointBackgroundColor: "#fff",
    pointBorderColor: cfg.color,
    pointBorderWidth: 2,
    pointRadius: 2,
    pointHoverRadius: 5,
    tension: 0.4,
  });

  const chartData = {
    labels,
    datasets: [
      makeDataset(data.adminTimeline, ROLE_CONFIG.admin),
      makeDataset(data.supplierTimeline, ROLE_CONFIG.supplier),
      makeDataset(data.delivererTimeline, ROLE_CONFIG.deliverer),
      makeDataset(data.buyerTimeline, ROLE_CONFIG.buyer, true),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: { size: 10, weight: "bold", family: "'Inter', sans-serif" },
          color: "#64748b",
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleFont: { size: 11, weight: "bold", family: "'Inter', sans-serif" },
        bodyFont: { size: 12, weight: "bold", family: "'Inter', sans-serif" },
        padding: 14,
        cornerRadius: 12,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString()} F`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 9, weight: "bold", family: "'Inter', sans-serif" },
          color: "#94a3b8",
          maxRotation: 45,
          maxTicksLimit: 15,
        },
      },
      y: {
        grid: { color: "rgba(241, 245, 249, 0.8)", drawBorder: false },
        ticks: {
          font: { size: 9, weight: "bold", family: "'Inter', sans-serif" },
          color: "#94a3b8",
          callback: (v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v),
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="h-[320px] lg:h-[400px]">
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
const SalesChart = ({ data: propData }) => {
  /* If propData is given, render the simple inline chart (used by Dashboard overview) */
  if (propData && propData.labels && propData.values) {
    return <InlineChart data={propData} />;
  }

  /* ─── Full-page analytics mode ─── */
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30J");
  const [activeTab, setActiveTab] = useState("combined");
  const [dashData, setDashData] = useState(null);

  const fetchData = async (p = period) => {
    setLoading(true);
    try {
      const token = await getToken();
      const result = await getDashboardStats(token, p);
      setDashData(result);
    } catch (e) {
      console.error("SalesChart fetch error:", e);
      toast.error("Erreur de chargement des analyses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  /* Compute totals */
  const totals = useMemo(() => {
    if (!dashData) return { admin: 0, supplier: 0, deliverer: 0, buyer: 0 };
    const sum = (arr) => (arr || []).reduce((s, t) => s + parseFloat(t.total || 0), 0);
    return {
      admin: sum(dashData.adminTimeline),
      supplier: sum(dashData.supplierTimeline),
      deliverer: sum(dashData.delivererTimeline),
      buyer: sum(dashData.buyerTimeline),
    };
  }, [dashData]);

  /* CSV export */
  const handleExportCSV = () => {
    if (!dashData) return;
    const rows = ["Date,Admin Commission,Vendeur,Livreur,Acheteur"];
    const days = (dashData.adminTimeline || []).map((t) => t.day);
    days.forEach((day, i) => {
      rows.push(
        [
          day,
          dashData.adminTimeline?.[i]?.total || 0,
          dashData.supplierTimeline?.[i]?.total || 0,
          dashData.delivererTimeline?.[i]?.total || 0,
          dashData.buyerTimeline?.[i]?.total || 0,
        ].join(",")
      );
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics_${period}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Export CSV généré !");
  };

  const TABS = [
    { key: "combined", label: "Vue Combinée", icon: Activity },
    { key: "admin", label: "Admin", icon: Crown },
    { key: "supplier", label: "Vendeurs", icon: BarChart3 },
    { key: "deliverer", label: "Livreurs", icon: Truck },
    { key: "buyer", label: "Acheteurs", icon: ShoppingCart },
  ];

  return (
    <div className="space-y-8 lg:space-y-12 animate-in fade-in duration-700 pb-16">
      {/* ─── Header ─── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-black uppercase text-[10px] tracking-[0.3em]">
            <BarChart3 size={14} /> Analytics Centre
          </div>
          <h1 className="text-3xl lg:text-5xl font-black text-base-content tracking-tighter">
            Analyses <span className="text-base-content/40">des Ventes</span>
          </h1>
          <p className="text-xs lg:text-sm text-base-content/50 font-bold max-w-lg">
            Performance détaillée par profil — Admin, Vendeurs, Livreurs & Acheteurs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          {/* Period Selector */}
          <div className="flex bg-base-100 rounded-2xl p-1 lg:p-1.5 border border-base-200 shadow-sm">
            {["7J", "30J", "12M"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 lg:px-6 py-1.5 lg:py-2 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all ${
                  period === p
                    ? "bg-neutral text-white shadow-lg shadow-slate-900/10"
                    : "text-base-content/40 hover:text-base-content"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => fetchData()}
            className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-base-100 rounded-2xl border border-base-200 shadow-sm hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all text-base-content/50"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={!dashData}
            className="h-10 lg:h-12 px-4 lg:px-6 bg-indigo-600 text-white rounded-2xl font-black text-xs gap-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center disabled:opacity-40"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* ─── Stat Summary Cards ─── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-base-200 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard config={ROLE_CONFIG.admin} total={totals.admin} delay={0} />
          <StatCard config={ROLE_CONFIG.supplier} total={totals.supplier} delay={0.05} />
          <StatCard config={ROLE_CONFIG.deliverer} total={totals.deliverer} delay={0.1} />
          <StatCard config={ROLE_CONFIG.buyer} total={totals.buyer} delay={0.15} />
        </div>
      )}

      {/* ─── Tab Navigation ─── */}
      <div className="bg-base-100 rounded-3xl border border-base-200 shadow-xl shadow-slate-100/50 overflow-hidden">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-base-200 px-4 lg:px-8 pt-4 gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 lg:px-6 py-3 rounded-t-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-neutral text-white shadow-lg"
                    : "text-base-content/40 hover:text-base-content/80 hover:bg-base-200"
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chart Area */}
        <div className="p-6 lg:p-10">
          {loading ? (
            <div className="h-[350px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-xs font-bold text-base-content/40 uppercase tracking-widest">
                  Chargement des données...
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === "combined" && dashData && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-neutral rounded-xl flex items-center justify-center">
                        <Activity size={16} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-base-content tracking-tight">
                          Vue Combinée
                        </h3>
                        <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">
                          Tous les profils sur un même graphique
                        </p>
                      </div>
                    </div>
                    <CombinedChart data={dashData} />
                  </div>
                )}

                {activeTab === "admin" && dashData && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${ROLE_CONFIG.admin.badge} rounded-xl flex items-center justify-center`}>
                        <Crown size={16} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-base-content tracking-tight">
                          Commissions Admin
                        </h3>
                        <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">
                          Profits de la plateforme par jour
                        </p>
                      </div>
                    </div>
                    <RoleTimelineChart
                      timeline={dashData.adminTimeline || []}
                      config={ROLE_CONFIG.admin}
                      chartType="bar"
                    />
                  </div>
                )}

                {activeTab === "supplier" && dashData && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${ROLE_CONFIG.supplier.badge} rounded-xl flex items-center justify-center`}>
                        <BarChart3 size={16} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-base-content tracking-tight">
                          Revenus Vendeurs
                        </h3>
                        <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">
                          Gains journaliers des marchands partenaires
                        </p>
                      </div>
                    </div>
                    <RoleTimelineChart
                      timeline={dashData.supplierTimeline || []}
                      config={ROLE_CONFIG.supplier}
                    />
                  </div>
                )}

                {activeTab === "deliverer" && dashData && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${ROLE_CONFIG.deliverer.badge} rounded-xl flex items-center justify-center`}>
                        <Truck size={16} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-base-content tracking-tight">
                          Revenus Livreurs
                        </h3>
                        <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">
                          Gains de courses par jour
                        </p>
                      </div>
                    </div>
                    <RoleTimelineChart
                      timeline={dashData.delivererTimeline || []}
                      config={ROLE_CONFIG.deliverer}
                    />
                  </div>
                )}

                {activeTab === "buyer" && dashData && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${ROLE_CONFIG.buyer.badge} rounded-xl flex items-center justify-center`}>
                        <ShoppingCart size={16} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-base-content tracking-tight">
                          Dépenses Acheteurs
                        </h3>
                        <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">
                          Total dépensé par les clients par jour
                        </p>
                      </div>
                    </div>
                    <RoleTimelineChart
                      timeline={dashData.buyerTimeline || []}
                      config={ROLE_CONFIG.buyer}
                      chartType="bar"
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* ─── Breakdown Grid: Individual Role Cards ─── */}
      {!loading && dashData && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {Object.entries({
            admin: dashData.adminTimeline,
            supplier: dashData.supplierTimeline,
            deliverer: dashData.delivererTimeline,
            buyer: dashData.buyerTimeline,
          }).map(([roleKey, timeline], idx) => {
            const cfg = ROLE_CONFIG[roleKey];
            const Icon = cfg.icon;
            const total = (timeline || []).reduce((s, t) => s + parseFloat(t.total || 0), 0);

            return (
              <motion.div
                key={roleKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`bg-base-100 rounded-[2rem] border border-base-200 p-6 lg:p-8 shadow-xl shadow-slate-100/40 hover:shadow-2xl transition-shadow`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${cfg.badge} flex items-center justify-center shadow-lg`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-base-content">{cfg.label}</h3>
                      <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">
                        Derniers {period}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-base-content">
                      {Number(total).toLocaleString()} <span className="text-sm font-bold text-base-content/40">F</span>
                    </p>
                  </div>
                </div>
                <RoleTimelineChart
                  timeline={timeline || []}
                  config={cfg}
                  chartType={roleKey === "admin" || roleKey === "buyer" ? "bar" : "line"}
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SalesChart;