import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../lib/AuthHooks";
import { getMyOrders } from "../../services/orderService";
import {
  ShoppingBag,
  ChevronRight,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowUpRight,
  PackageCheck,
  Search,
  Star,
  Box,
  RefreshCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import EmptyState from "../Shared/EmptyState";

const STATUS_FILTERS = [
  { value: "", label: "Toutes", count: null },
  { value: "en_attente", label: "En attente" },
  { value: "confirmee", label: "ConfirmÃ©e" },
  { value: "expediee", label: "En transit" },
  { value: "livree", label: "LivrÃ©e" },
  { value: "annulee", label: "AnnulÃ©e" },
];

const normalizeStatus = (s) => {
  if (!s) return "";
  let val = s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/ee$/, "e") // livree -> livre
    .replace(/e$/, "");  // livre -> livr

  if (val.startsWith("en_attent") || val === "attente") return "en_attente";
  if (val.startsWith("confirm")) return "confirmee";
  if (val.startsWith("expedi") || val === "transit") return "expediee";
  if (val.startsWith("livr")) return "livree";
  if (val.startsWith("annul")) return "annulee";
  return val;
};

const getStatusConfig = (status) => {
  const normalized = normalizeStatus(status);
  switch (normalized) {
    case "confirmee": return { label: "ConfirmÃ©e", icon: <CheckCircle2 size={13} />, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    case "en_attente": return { label: "En attente", icon: <Clock size={13} />, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    case "annulee": return { label: "AnnulÃ©e", icon: <XCircle size={13} />, color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
    case "expediee": return { label: "En transit", icon: <Truck size={13} />, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" };
    case "livree": return { label: "LivrÃ©e", icon: <PackageCheck size={13} />, color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" };
    default: return { label: status, icon: <Box size={13} />, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" };
  }
};

export default function OrdersList() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 6;

  const load = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const data = await getMyOrders(token);
      setOrders(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger vos commandes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [getToken]);

  /* ---------- Filtering ---------- */
  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter ? normalizeStatus(o.status) === normalizeStatus(statusFilter) : true;
    const matchSearch = searchQuery
      ? o.id.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchStatus && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const displayed = filtered.slice((page - 1) * limit, page * limit);

  /* ---------- Status counts ---------- */
  const countFor = (val) =>
    val === "" ? orders.length : orders.filter((o) => normalizeStatus(o.status) === normalizeStatus(val)).length;

  /* ---------- Loading UI ---------- */
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <ShoppingBag className="text-primary w-8 h-8" />
        </div>
      </div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
        Chargement de votre historique...
      </p>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">

      {/* -- Header -- */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.3em]">
            <ShoppingBag size={14} /> Historique
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
            Mes <span className="text-slate-400">Commandes.</span>
          </h1>
          <p className="text-slate-500 font-bold max-w-lg leading-relaxed text-sm">
            Consultez vos achats, téléchargez vos reçus et laissez des avis.
          </p>
        </div>

        {/* Search + Refresh */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher par ID..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="bg-white border border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all w-64"
            />
          </div>
          <button
            onClick={load}
            title="Actualiser"
            className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm"
          >
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      {/* -- Pill Filters -- */}
      <div className="flex flex-wrap gap-3">
        {STATUS_FILTERS.map((f) => {
          const count = countFor(f.value);
          const active = statusFilter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(1); }}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all duration-200 ${active
                ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/10 scale-105"
                : "bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:text-slate-900 shadow-sm"
                }`}
            >
              {f.label}
              <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black ${active ? "bg-white/20 text-slate-900" : "bg-slate-100 text-slate-500"
                }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* -- Grid / Empty -- */}
      {displayed.length === 0 ? (
        <EmptyState
          type="orders"
          title={searchQuery || statusFilter ? "Aucun résultat" : "Aucune commande"}
          description={
            searchQuery || statusFilter
              ? "Modifiez vos filtres pour trouver vos commandes."
              : "Vous n'avez pas encore passé de commande."
          }
          actionLabel="Boutique"
          actionLink="/products-liste"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {displayed.map((o, idx) => {
              const cfg = getStatusConfig(o.status);
              const canReview = o.status === "livree";
              return (
                <motion.div
                  key={o.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  className="group bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl shadow-slate-200/20 hover:border-primary/30 transition-all flex flex-col gap-8 relative overflow-hidden"
                >
                  {/* Decorative bg icon */}
                  <div className="absolute top-8 right-8 text-slate-50 group-hover:text-primary/5 transition-colors pointer-events-none">
                    <ShoppingBag size={110} strokeWidth={3} />
                  </div>

                  <div className="space-y-5 relative z-10 flex-1">
                    {/* ID + Status */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                          Réf. {o.id.slice(0, 8).toUpperCase()}
                        </p>
                        <h4 className="text-xl font-black text-slate-900 tracking-tighter">
                          Commande #{o.id.slice(0, 6)}
                        </h4>
                      </div>
                      <div className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        {cfg.icon} {cfg.label}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-6 py-5 border-y border-slate-50">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tighter">
                          {Number(o.total_amount).toLocaleString()} <span className="text-sm text-slate-400">FCFA</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Articles</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tighter">
                          {o.items_count ?? (o.items?.length ?? "—")}{" "}
                          <span className="text-xs text-slate-400">items</span>
                        </p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      <Clock size={13} className="text-primary" />
                      {(() => {
                        const d = new Date(o.created_at || o.createdAt);
                        return isNaN(d) ? "Date inconnue" : d.toLocaleDateString("fr-FR", {
                          day: "numeric", month: "long", year: "numeric"
                        });
                      })()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 relative z-10">
                    {/* Détails */}
                    <button
                      onClick={() => navigate(`/user/dashboard/orders/${o.id}`)}
                      className="flex-1 btn bg-slate-900 hover:bg-black text-white rounded-2xl h-14 font-black gap-2 shadow-xl shadow-slate-900/10 border-none text-xs"
                    >
                      Détails <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>

                    {/* Laisser un avis (si livré) */}
                    {canReview && (
                      <Link
                        to={`/user/dashboard/orders/${o.id}/reviews`}
                        title="Laisser un avis"
                        className="w-14 h-14 flex items-center justify-center bg-amber-50 border border-amber-100 text-amber-500 rounded-2xl hover:bg-amber-100 transition-all shadow-sm"
                      >
                        <Star size={20} />
                      </Link>
                    )}

                    {/* Reçus */}
                    <button
                      onClick={() => toast.success("Génération de la facture...")}
                      title="Télécharger la facture"
                      className="w-14 h-14 flex items-center justify-center bg-white border border-slate-100 text-slate-400 rounded-2xl hover:text-primary hover:border-primary/20 transition-all shadow-sm"
                    >
                      <FileText size={20} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* -- Pagination -- */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <div className="bg-white p-3 rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/50 flex items-center gap-4">
            <button
              disabled={page === 1}
              onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-primary hover:text-white disabled:opacity-20 transition-all font-black"
            >
              <ChevronRight size={20} className="rotate-180" />
            </button>
            <span className="px-4 text-xs font-black text-slate-700 uppercase tracking-widest">
              {page} <span className="text-slate-300 mx-2">/</span> {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-primary hover:text-white disabled:opacity-20 transition-all font-black"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
