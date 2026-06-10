import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../lib/AuthHooks";
import { getOrderById } from "../../services/orderService";
import { generateInvoicePDF, useInvoiceAvailable } from "../context/InvoiceGenerator";
import DisputeModal from "./DisputeModal";
import PlatformReviewModal from "../Popup/PlatformReviewModal";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  Star,
  Calendar,
  Phone,
  Navigation,
  PackageCheck,
  XCircle,
  Store,
  Lock,
  User as UserIcon,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import OrderTrackingMap from "../Shared/OrderTrackingMap";
import { notificationService } from "../../services/notificationService";

/* ── Timeline progression ──────────────────────────────────────────────────── */
const STEPS = [
  {
    key: "en_attente",
    label: "Commande reçue",
    sublabel: "Votre commande a été enregistrée",
    icon: <Clock size={16} />,
    statuses: ["en_attente"],
    color: "amber"
  },
  {
    key: "confirmee",
    label: "Confirmée",
    sublabel: "Paiement validé, préparation en cours",
    icon: <ShieldCheck size={16} />,
    statuses: ["confirmee"],
    color: "blue"
  },
  {
    key: "expediee",
    label: "Expédiée",
    sublabel: "Votre colis est en route",
    icon: <Truck size={16} />,
    statuses: ["expediee"],
    color: "indigo"
  },
  {
    key: "livree",
    label: "Livrée",
    sublabel: "Commande reçue avec succès !",
    icon: <PackageCheck size={16} />,
    statuses: ["livree"],
    color: "emerald"
  },
];

const normalizeStatus = (s) => {
  if (!s) return "en_attente";
  let val = s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, "_"); // replace spaces/special chars with underscores

  if (val.includes("attent")) return "en_attente";
  if (val.includes("confirm") || val.includes("pay") || val.includes("prep") || val.includes("trait")) return "confirmee";
  if (val.includes("expedi") || val.includes("transit") || val.includes("route") || val.includes("cours_de_livr")) return "expediee";
  if (val.includes("livr")) return "livree";
  if (val.includes("annul")) return "annulee";

  return val;
};

const STATUS_CONFIG = {
  en_attente: { label: "En attente", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: <Clock size={13} /> },
  confirmee: { label: "Confirmée", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: <CheckCircle2 size={13} /> },
  expediee: { label: "Expédiée", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", icon: <Truck size={13} /> },
  livree: { label: "Livrée", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: <PackageCheck size={13} /> },
  annulee: { label: "Annulée", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", icon: <XCircle size={13} /> },
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeResponseLoading, setDisputeResponseLoading] = useState(false);
  const [showPlatformReview, setShowPlatformReview] = useState(false);

  const invoiceAvailable = useInvoiceAvailable(order);
  const normalizedStatus = normalizeStatus(order?.status);
  const isDelivered = normalizedStatus === "livree";
  const isCancelled = normalizedStatus === "annulee";

  useEffect(() => {
    async function load() {
      if (!id || id === "undefined") {
        console.warn("OrderDetail: ID is missing or undefined string");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const token = await getToken();
        setOrder(await getOrderById(id, token));
      } catch (err) {
        console.error("OrderDetail error:", err);
        // Special case: 404
        if (err.response?.status === 404) {
          setOrder(null);
        } else {
          toast.error("Impossible de charger la commande.");
        }
      } finally {
        setLoading(false);
      }
    }
    load();

    // Real-time status updates
    const handleStatusUpdate = (data) => {
        if (data.orderId === id) {
            toast.success(data.message);
            // Refresh order data
            load();
        }
    };

    notificationService.subscribe('order_status_updated', handleStatusUpdate);

    return () => {
        notificationService.unsubscribe('order_status_updated', handleStatusUpdate);
    };
  }, [id, getToken]);

  /* ── Loading ── */
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="text-primary w-8 h-8" />
        </div>
      </div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
        Chargement de la commande...
      </p>
    </div>
  );

  /* ── Not found ── */
  if (!order) return (
    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 space-y-8">
      <div className="w-20 h-20 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center mx-auto">
        <AlertCircle size={40} />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-900">Commande introuvable</h2>
        <p className="text-slate-400 font-bold max-w-sm mx-auto">
          Cette commande n'existe pas ou vous n'y avez pas accès.
        </p>
      </div>
      <button onClick={() => navigate("/user/dashboard/orders")} className="btn btn-outline rounded-2xl px-10 h-14 font-black">
        Retour aux commandes
      </button>
    </div>
  );

  const statusCfg = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.en_attente;

  // Logic to find current step index: it's the index in STEPS that contains the current status,
  // or the highest index that "is passed" by the current status.
  // Since we made statuses exclusive in the definitions above, 
  // we just find the match.
  const stepIndexMapping = {
    en_attente: 0,
    confirmee: 1,
    expediee: 2,
    livree: 3
  };
  const stepIndex = isCancelled ? -1 : (stepIndexMapping[normalizedStatus] ?? 0);

  const getStepDate = (step) => {
    const history = order.status_history;
    if (!history || !Array.isArray(history)) return null;
    const entry = history.find(h => step.statuses.some(s => normalizeStatus(h.status) === s));
    if (!entry?.date) return null;
    return new Date(entry.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  // Get current step color
  const activeStepColor = STEPS[stepIndex]?.color || "primary";
  const colorMap = {
    amber: "bg-amber-500 shadow-amber-500/30 text-amber-600 border-amber-500",
    blue: "bg-blue-500 shadow-blue-500/30 text-blue-600 border-blue-500",
    indigo: "bg-indigo-500 shadow-indigo-500/30 text-indigo-600 border-indigo-500",
    emerald: "bg-emerald-500 shadow-emerald-500/30 text-emerald-600 border-emerald-500",
    primary: "bg-primary shadow-primary/30 text-primary border-primary"
  };

  return (
    <>
    <div className="space-y-10 pb-20">

      {/* ── Top Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate("/user/dashboard/orders")}
          className="flex items-center gap-3 px-6 py-3.5 bg-white border border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Mes commandes
        </button>

        <div className="flex flex-wrap items-center gap-3">
          {isDelivered && (
            <Link
              to={`/user/dashboard/orders/${id}/reviews`}
              className="flex items-center gap-2 px-6 py-3.5 bg-amber-50 border border-amber-100 rounded-2xl font-black text-xs uppercase tracking-widest text-amber-600 hover:bg-amber-100 transition-all shadow-sm"
            >
              <Star size={14} fill="currentColor" /> Laisser un avis
            </Link>
          )}
          <div className="relative group/tooltip">
            <button
              onClick={async () => {
                if (!invoiceAvailable) return;
                setDownloading(true);
                try {
                  await generateInvoicePDF(order);
                  toast.success("Reçus téléchargée !");
                } catch {
                  toast.error("Erreur lors de la génération.");
                } finally {
                  setDownloading(false);
                }
              }}
              disabled={!invoiceAvailable || downloading}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm border ${invoiceAvailable
                ? "bg-primary text-white border-primary shadow-primary/20 hover:brightness-110"
                : "bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed"
                }`}
            >
              {downloading ? <span className="loading loading-spinner loading-xs" /> : <Download size={14} />}
              Reçus
              {!invoiceAvailable && (
                <span className="ml-1 text-[9px] opacity-70 normal-case">
                  {order?.payment_method === "delivery" ? "(après livraison)" : "(paiement requis)"}
                </span>
              )}
            </button>

            {/* Tooltip */}
            {!invoiceAvailable && !downloading && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-xl whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
                <div className="flex items-center gap-2">
                  <AlertCircle size={12} className="text-amber-400" />
                  {order?.payment_method === "delivery"
                    ? "Disponible une fois la commande livrée"
                    : "Disponible après confirmation du paiement"}
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Card ── */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/20 overflow-hidden">

        {/* Header */}
        <div className="p-10 md:p-14 border-b border-slate-50 bg-gradient-to-r from-slate-50/60 to-transparent">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-5 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
                <span className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                  {statusCfg.icon} {statusCfg.label}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Calendar className="w-3 h-3" />
                  {(() => {
                    const d = new Date(order.created_at || order.createdAt);
                    return isNaN(d) ? "Date inconnue" : d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
                  })()}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                Détails de <span className="text-slate-400">Commande.</span>
              </h1>
            </div>
            </div>
          </div>
 
          {/* ── Security OTP Card (Visible during delivery) ── */}
          {normalizedStatus === "expediee" && order.delivery_code && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <ShieldCheck size={120} />
              </div>
              
              <div className="relative z-10 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-black tracking-tight">Code de Livraison.</h3>
                  <p className="text-indigo-100 text-xs font-bold leading-relaxed max-w-[240px]">
                    Ne communiquez ce code au livreur qu'après avoir reçu et vérifié votre colis.
                  </p>
                </div>
 
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-md px-8 py-5 rounded-3xl border border-white/30">
                    <span className="text-4xl font-black tracking-[0.2em]">{order.delivery_code}</span>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center animate-pulse">
                    <Lock size={20} />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-200">
                  <span className="w-2 h-2 bg-indigo-300 rounded-full animate-ping" />
                  Sécurisé par Vtout Marketplace
                </div>
              </div>
            </motion.div>
          )}
 
          {/* ── Progress Section ── */}
        {!isCancelled ? (
          <div className="px-10 md:px-14 py-8 border-b border-slate-50 bg-slate-50/30 overflow-x-auto">
            <div className="flex items-start min-w-max gap-0">
              {STEPS.map((step, idx) => {
                const done = stepIndex >= 0 && idx <= stepIndex;
                const current = idx === stepIndex;
                const isLast = idx === STEPS.length - 1;
                const stepColor = step.color;

                let colorClass = "";
                if (current) {
                  colorClass = `${colorMap[stepColor].split(' ')[0]} ${colorMap[stepColor].split(' ')[1]} text-slate-900 scale-110`;
                } else if (done) {
                  colorClass = "bg-slate-900 text-white";
                } else {
                  colorClass = "bg-white text-slate-300 border border-slate-100";
                }

                return (
                  <React.Fragment key={step.key}>
                    <div className="flex flex-col items-center gap-2 w-32">
                      <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${colorClass}`}>
                        {step.icon}
                        {done && !current && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            <CheckCircle2 size={10} className="text-slate-900" />
                          </div>
                        )}
                      </div>
                      <div className="text-center px-1">
                        <p className={`text-[10px] font-black uppercase tracking-widest leading-tight ${done ? (current ? colorMap[stepColor].split(' ')[2] : "text-slate-900") : "text-slate-400"}`}>
                          {step.label}
                        </p>
                        {current && (
                          isDelivered
                            ? <p className="text-[9px] font-bold text-emerald-500 mt-0.5">✓ Fait</p>
                            : <p className={`text-[9px] font-bold mt-0.5 animate-pulse ${colorMap[stepColor].split(' ')[2]}`}>En cours</p>
                        )}
                        {done && !current && (() => {
                          const d = getStepDate(step);
                          return d
                            ? <p className="text-[9px] font-bold text-slate-400 mt-0.5">{d}</p>
                            : <p className="text-[9px] font-bold text-emerald-500 mt-0.5">✓ Fait</p>;
                        })()}
                        {!done && <p className="text-[9px] font-bold text-slate-300 mt-0.5">En attente</p>}
                      </div>
                    </div>
                    {!isLast && (idx < stepIndex ? (
                      <div className="flex items-center mt-6">
                        <div className={`h-1 w-12 rounded-full transition-all duration-700 ${idx < stepIndex ? "bg-slate-900" : "bg-slate-100"}`} />
                      </div>
                    ) : (
                      <div className="flex items-center mt-6">
                        <div className="h-1 w-12 bg-slate-100 rounded-full" />
                      </div>
                    ))}
                  </React.Fragment>
                );
              })}
            </div>
            {stepIndex >= 0 && (
              <p className="mt-4 text-xs font-bold text-slate-400 italic">{STEPS[stepIndex]?.sublabel}</p>
            )}
          </div>
        ) : (
          <div className="px-14 py-6 bg-rose-50/50 border-b border-rose-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center">
              <XCircle size={20} />
            </div>
            <div>
              <p className="font-black text-rose-700 text-sm uppercase tracking-widest">Commande annulée</p>
              <p className="text-xs text-rose-400 font-bold">Cette commande ne sera pas traitée.</p>
            </div>
          </div>
        )}

        {/* ── DELIVERY CODE (Updated) ── */}
        {(normalizedStatus === 'expediee' || normalizedStatus === 'confirmee') && (
          <div className="px-10 md:px-14 py-10 bg-slate-50 border-b border-slate-100 space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 justify-center md:justify-start">
                  <ShieldCheck className="text-primary" size={24} /> 
                  Code de Confirmation.
                </h3>
                <p className="text-xs font-bold text-slate-400">Ce code est unique et servira à valider votre livraison.</p>
              </div>
              <div className="bg-white px-10 py-5 rounded-[2rem] border-2 border-primary/20 shadow-xl shadow-primary/5 text-center min-w-[200px]">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Code Confidentiel</p>
                <p className="text-4xl font-black text-primary tracking-[0.2em]">{order.delivery_code || '----'}</p>
                <p className="text-[9px] font-bold text-slate-400 max-w-[150px] mx-auto mt-2 leading-tight">Présentez ce code au livreur pour recevoir votre colis.</p>
              </div>
            </div>
          </div>
        )}

        {normalizedStatus === 'expediee' && (
          <div className="px-10 md:px-14 py-10 border-b border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Navigation className="text-primary animate-pulse" size={24} /> 
                  Suivi en temps réel.
                </h3>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                   Livreur en route
                </span>
            </div>
            <OrderTrackingMap 
                orderId={order.id} 
                customerPos={order.address?.lat ? [parseFloat(order.address.lat), parseFloat(order.address.lng)] : null}
                supplierPos={order.supplier?.lat ? [parseFloat(order.supplier.lat), parseFloat(order.supplier.lng)] : null}
            />
          </div>
        )}

        {/* ── Body ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12">

          {/* Articles */}
          <div className="lg:col-span-8 p-10 md:p-14 space-y-8 border-b lg:border-b-0 lg:border-r border-slate-50">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Articles
              <span className="text-xs font-black text-slate-400 bg-slate-50 w-8 h-8 rounded-full flex items-center justify-center border border-slate-100">
                {order.items?.length || 0}
              </span>
            </h3>

            <div className="space-y-4">
              {order.items?.map((item, idx) => {
                const itemImage =
                  item.variant?.priceRows?.[0]?.image_url ||
                  item.product?.images?.[0]?.image_url ||
                  "/images/placeholder-rect.png";

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="p-6 bg-slate-50/30 rounded-[2rem] border border-transparent hover:border-slate-100 hover:bg-white transition-all flex items-center gap-6 group"
                  >
                    <div className="w-20 h-20 bg-white rounded-[1.5rem] p-3 flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform border border-slate-50 overflow-hidden">
                      <img
                        src={itemImage}
                        className="w-full h-full object-contain mix-blend-multiply"
                        alt={item.product?.name}
                        onError={(e) => { e.target.src = "/images/placeholder-rect.png"; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                        {item.product?.category?.name || "Produit"}
                      </p>
                      <h4 className="text-lg font-black text-slate-900 tracking-tight truncate">
                        {item.product?.name || `Produit #${item.product_id}`}
                      </h4>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                        <span>Qté : {item.quantity}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span>{item.variant?.name ? `${item.variant.name} · ` : ""}{Number(item.price).toLocaleString()} FCFA / unité</span>
                        {item.original_price && Number(item.original_price) > Number(item.price) && (
                          <span className="line-through text-slate-300">{Number(item.original_price).toLocaleString()} FCFA</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-1">
                      {item.original_price && Number(item.original_price) > Number(item.price) && (
                        <p className="text-xs font-black text-emerald-500">
                          -{Math.round((1 - Number(item.price) / Number(item.original_price)) * 100)}%
                        </p>
                      )}
                      <p className="text-xl font-black text-slate-900 tracking-tighter">
                        {(item.quantity * item.price).toLocaleString()} F
                      </p>
                      <Link to={`/products/${item.product_id}`} className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest block">
                        Voir →
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 p-10 md:p-14 space-y-10">

            {/* Résumé financier */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Résumé.</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-400 uppercase tracking-wide text-xs">Sous-total</span>
                  <span>{(Number(order.total_amount) + Number(order.discount_amount || 0) - Number(order.delivery_fee || 0)).toLocaleString()} F</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-emerald-500 uppercase tracking-wide text-xs flex items-center gap-2">
                      <Zap size={12} /> Réduction {order.coupon_code ? `(${order.coupon_code})` : ""}
                    </span>
                    <span className="text-emerald-500">-{Number(order.discount_amount).toLocaleString()} F</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-400 uppercase tracking-wide text-xs">Livraison</span>
                  {Number(order.delivery_fee) > 0 ? (
                    <span>{Number(order.delivery_fee).toLocaleString()} F</span>
                  ) : (
                    <span className="text-emerald-500 bg-emerald-50 px-3 py-1 rounded-lg text-xs font-black">OFFERT</span>
                  )}
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Total Final</span>
                  <span className="text-3xl font-black text-primary tracking-tighter">
                    {Number(order.total_amount).toLocaleString()} F
                  </span>
                </div>
              </div>
            </div>

            {/* Adresse de livraison */}
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Livraison.</h3>
              <div className="bg-slate-900 rounded-[2.5rem] text-white p-8 space-y-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.06] group-hover:scale-125 transition-transform duration-700 pointer-events-none">
                  <MapPin size={80} />
                </div>

                <div className="space-y-1 relative z-10">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Destinataire</p>
                  <h4 className="text-lg font-black leading-tight">
                    {order.address?.address_line || order.guest_name || "Client Vtout"}
                  </h4>
                </div>

                {order.address ? (
                  <div className="space-y-2.5 relative z-10">
                    {order.address.quartier_label && (
                      <div className="flex items-start gap-3">
                        <Navigation size={13} className="text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300 font-bold text-sm">
                          {order.address.quartier_label}, {order.address.commune_label}
                        </span>
                      </div>
                    )}
                    {order.address.departement_label && (
                      <div className="flex items-start gap-3">
                        <MapPin size={13} className="text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300 font-bold text-sm">{order.address.departement_label}</span>
                      </div>
                    )}
                    {order.address.phone && (
                      <div className="flex items-center gap-3">
                        <Phone size={13} className="text-primary flex-shrink-0" />
                        <span className="text-slate-300 font-bold text-sm">{order.address.phone}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm font-bold italic relative z-10">Adresse non renseignée.</p>
                )}

                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest relative z-10">
                  <ShieldCheck size={13} /> Livraison sécurisée
                </div>
              </div>
            </div>

            {/* Boutique Location (Only info exposed to customer) */}
            {order.boutique && (
              <div className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Expédié de.</h3>
                <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-center gap-4">
                  <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100">
                    <Store size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 leading-none">Boutique Partenaire</p>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5">
                      {order.boutique.commune_label || order.boutique.commune}{order.boutique.departement_label ? `, ${order.boutique.departement_label}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Paiement */}
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Paiement.</h3>
              <div className="p-6 bg-slate-50 rounded-[2rem] flex items-center gap-4 border border-slate-100">
                <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-slate-100">
                  <CreditCard size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 leading-none">
                    {order.payment_method === "fedapay" ? "FedaPay" : "Paiement à la livraison"}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                    {order.payment_status === "payé" ? "Transaction confirmée" : "En attente de règlement"}
                  </p>
                </div>
              </div>
            </div>

            {/* Livreur (Nouveau) */}
            {order.deliveryPerson && (
              <div className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Votre Livreur.</h3>
                <div className="p-6 bg-white rounded-[2rem] border-2 border-primary/10 flex items-center gap-5 shadow-xl shadow-primary/5 group transition-all hover:bg-slate-50">
                  <div className="relative">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200">
                      {order.deliveryPerson.profile?.avatar_url ? (
                        <img src={order.deliveryPerson.profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={30} />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-white rounded-lg flex items-center justify-center border-2 border-white shadow-sm">
                      <Truck size={12} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-slate-900 leading-tight">
                      {order.deliveryPerson.profile?.fullname || "Livreur Assigné"}
                    </h4>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">
                      {order.deliveryPerson.vehicle_type === 'moto' ? 'Coursier à Moto' : 'Livreur Automobile'}
                    </p>
                    <a
                      href={`tel:${order.deliveryPerson.profile?.phone}`}
                      className="inline-flex items-center gap-2 mt-3 text-xs font-black text-slate-900 hover:text-primary transition-colors"
                    >
                      <Phone size={14} className="text-primary" />
                      {order.deliveryPerson.profile?.phone || "Contact non dispo."}
                    </a>
                  </div>
                </div>
              </div>
            )}
 
            {/* Actions */}
            <div className="pt-12 border-t border-slate-100 flex flex-col gap-4">

              {/* Dispute status card */}
              {order.dispute_status && order.dispute_status !== 'annule' && (
                <div className={`rounded-[1.5rem] p-5 border-2 space-y-3 ${
                  order.dispute_status === 'resolu' ? 'bg-emerald-50 border-emerald-200' :
                  order.dispute_status === 'en_cours' ? 'bg-blue-50 border-blue-200' :
                  'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {order.dispute_status === 'resolu' ? <CheckCircle2 size={18} className="text-emerald-500" /> :
                     order.dispute_status === 'en_cours' ? <RefreshCw size={18} className="text-blue-500" /> :
                     <Clock size={18} className="text-amber-500" />}
                    <span className={`font-black text-sm uppercase tracking-wider ${
                      order.dispute_status === 'resolu' ? 'text-emerald-700' :
                      order.dispute_status === 'en_cours' ? 'text-blue-700' : 'text-amber-700'
                    }`}>
                      {order.dispute_status === 'resolu' ? 'Litige résolu — Confirmation requise' :
                       order.dispute_status === 'en_cours' ? 'Litige en cours d\'examen' :
                       'Litige ouvert — En attente de traitement'}
                    </span>
                  </div>
                  {order.dispute_status === 'resolu' && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        disabled={disputeResponseLoading}
                        onClick={async () => {
                          setDisputeResponseLoading(true);
                          try {
                            const token = await getToken();
                            await api.patch(`/orders/${order.id}/dispute/response`, { response: 'confirm' }, { headers: { Authorization: `Bearer ${token}` } });
                            setOrder(prev => ({ ...prev, dispute_status: 'resolu' }));
                            toast?.success?.('Résolution confirmée. Merci !');
                          } catch { toast?.error?.('Erreur'); }
                          finally { setDisputeResponseLoading(false); }
                        }}
                        className="py-3 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
                      >
                        <ThumbsUp size={14} /> Confirmer
                      </button>
                      <button
                        disabled={disputeResponseLoading}
                        onClick={async () => {
                          setDisputeResponseLoading(true);
                          try {
                            const token = await getToken();
                            await api.patch(`/orders/${order.id}/dispute/response`, { response: 'contest' }, { headers: { Authorization: `Bearer ${token}` } });
                            setOrder(prev => ({ ...prev, dispute_status: 'ouvert' }));
                            toast?.success?.('Contestation enregistrée.');
                          } catch { toast?.error?.('Erreur'); }
                          finally { setDisputeResponseLoading(false); }
                        }}
                        className="py-3 bg-white border-2 border-rose-200 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
                      >
                        <ThumbsDown size={14} /> Contester
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Platform review banner — shown only when delivered */}
              {isDelivered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[1.5rem] overflow-hidden border border-amber-100 shadow-sm"
                >
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
                        <Star size={16} className="fill-white text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 text-sm leading-tight">Satisfait de Vtout ?</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-0.5">Partagez votre expérience avec la communauté béninoise</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPlatformReview(true)}
                      className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all shadow-md shadow-primary/20 active:scale-95 whitespace-nowrap"
                    >
                      <Star size={11} fill="currentColor" /> Mon avis
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Show dispute button only if no active dispute */}
              {(!order.dispute_status || order.dispute_status === 'annule') && (
              <button
                className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-slate-200 flex items-center justify-center gap-2 hover:bg-rose-600 transition-all active:scale-95"
                onClick={() => setShowDisputeModal(true)}
              >
                <AlertCircle size={18} />
                Signaler un problème
              </button>
              )}
              <Link 
                to="/"
                className="w-full py-4 bg-slate-50 text-slate-400 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
              >
                <ArrowLeft size={16} />
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>

    {showDisputeModal && order && (
      <DisputeModal
        order={order}
        getToken={getToken}
        onClose={() => setShowDisputeModal(false)}
      />
    )}
    <PlatformReviewModal isOpen={showPlatformReview} onClose={() => setShowPlatformReview(false)} />
    </>
  );
}
