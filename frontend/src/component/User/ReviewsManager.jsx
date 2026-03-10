import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { getOrderById } from "../../services/orderService";
import { getMyReviews, createReview, deleteReview } from "../../services/reviewService";
import {
  Star,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Send,
  Trash2,
  ShoppingBag,
  Zap,
  Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

/* ─── Note étoilée ─────────────────────────────────────────────────────────── */
function StarRating({ value, onChange, disabled }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onMouseEnter={() => !disabled && setHovered(n)}
          onMouseLeave={() => !disabled && setHovered(0)}
          onClick={() => !disabled && onChange(n)}
          className="transition-transform hover:scale-125"
        >
          <Star
            size={26}
            className={`transition-colors ${n <= (hovered || value)
              ? "text-amber-400 fill-amber-400"
              : "text-slate-200"
              }`}
          />
        </button>
      ))}
    </div>
  );
}

/* ─── Formulaire d'avis pour 1 produit ─────────────────────────────────────── */
function ReviewForm({ item, existingReview, onSubmit, onDelete, submitting, orderId }) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [body, setBody] = useState(existingReview?.body || "");

  const hasReview = !!existingReview;

  function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) { toast.error("Veuillez sélectionner une note."); return; }
    if (!body.trim()) { toast.error("Veuillez écrire un commentaire."); return; }
    onSubmit({
      product_id: item.product_id,
      order_id: orderId,
      rating,
      title,
      body
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/20 space-y-6"
    >
      {/* Product Header */}
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl p-2 flex-shrink-0 overflow-hidden border border-slate-100">
          {item.product?.images?.[0]?.image_url
            ? <img src={item.product.images[0].image_url} alt={item.product?.name} className="w-full h-full object-contain" />
            : <Package size={28} className="text-slate-300 m-auto mt-3" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-primary uppercase tracking-widest">Produit acheté</p>
          <h3 className="text-lg font-black text-slate-900 tracking-tight truncate">
            {item.product?.name || `Produit #${item.product_id}`}
          </h3>
          <p className="text-xs text-slate-400 font-bold">Qté : {item.quantity} · {Number(item.price).toLocaleString()} FCFA</p>
        </div>
      </div>

      {/* Already reviewed badge */}
      {hasReview && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-xs font-black uppercase tracking-widest">
          <CheckCircle2 size={14} /> Avis publié · {new Date(existingReview.created_at).toLocaleDateString("fr-FR")}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Votre note</p>
          <StarRating value={rating} onChange={setRating} disabled={hasReview} />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Titre (optionnel)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={hasReview}
            placeholder="En deux mots..."
            className="w-full bg-slate-50 border border-transparent focus:border-primary/20 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none transition-all placeholder:text-slate-300 disabled:opacity-60"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Votre commentaire *</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={hasReview}
            rows={3}
            placeholder="Partagez votre expérience avec ce produit..."
            className="w-full bg-slate-50 border border-transparent focus:border-primary/20 rounded-2xl px-5 py-4 text-sm font-bold outline-none transition-all resize-none placeholder:text-slate-300 disabled:opacity-60"
          />
        </div>

        {!hasReview && (
          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="w-full btn bg-slate-900 hover:bg-black text-white rounded-2xl h-14 font-black border-none shadow-xl shadow-slate-900/10 gap-3 disabled:opacity-40"
          >
            {submitting ? <span className="loading loading-spinner loading-sm" /> : <><Send size={16} /> Publier mon avis</>}
          </button>
        )}
      </form>
    </motion.div>
  );
}

/* ─── Composant Principal ───────────────────────────────────────────────────── */
export default function ReviewsManager() {
  const { orderId } = useParams();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const token = await getToken();
      const [orderData, reviewsData] = await Promise.all([
        getOrderById(orderId, token),
        getMyReviews(token),
      ]);
      setOrder(orderData);
      setMyReviews(reviewsData || []);
    } catch (err) {
      console.error("ReviewsManager load:", err);
      toast.error("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (orderId) load(); }, [orderId]);

  async function handleSubmit(reviewData) {
    setSubmitting(true);
    try {
      const token = await getToken();
      await createReview(reviewData, token);
      toast.success("Avis publié avec succès ! Merci 🎉");
      await load();
    } catch (err) {
      console.error("createReview:", err);
      toast.error("Impossible de publier l'avis.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Loading ── */
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="text-primary w-8 h-8" />
        </div>
      </div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Chargement des avis...</p>
    </div>
  );

  /* ── Guard: commande non livrée ── */
  if (order && order.status !== "livree" && order.status !== "livrée") return (
    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-amber-100 space-y-8">
      <div className="w-20 h-20 bg-amber-50 text-amber-400 rounded-full flex items-center justify-center mx-auto">
        <AlertCircle size={40} />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-900">Commande non livrée</h2>
        <p className="text-slate-400 font-bold max-w-sm mx-auto">
          Vous pourrez laisser des avis une fois la commande livrée.
        </p>
      </div>
      <button onClick={() => navigate(-1)} className="btn btn-outline rounded-2xl px-10 h-14 font-black">
        Retour
      </button>
    </div>
  );

  const items = order?.items || [];

  return (
    <div className="space-y-10 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <button
            onClick={() => navigate(`/user/dashboard/orders/${orderId}`)}
            className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
          >
            <ArrowLeft size={14} /> Retour à la commande
          </button>
          <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.3em]">
            <Star size={14} /> Vos avis
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            Évaluer vos <span className="text-slate-400">achats.</span>
          </h1>
          <p className="text-slate-500 font-bold text-sm">
            Commande #{orderId?.slice(0, 8).toUpperCase()} · {items.length} produit{items.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Summary */}
        <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-6 py-4 shadow-sm">
          <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
            <Star size={18} fill="currentColor" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avis publiés</p>
            <p className="text-2xl font-black text-slate-900 tracking-tighter">
              {myReviews.filter(r => items.some(i => i.product_id === r.product_id)).length}
              <span className="text-sm text-slate-400 font-bold ml-1">/ {items.length}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Guard: no items */}
      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 space-y-4">
          <ShoppingBag size={48} className="mx-auto text-slate-200" />
          <p className="text-slate-400 font-bold">Aucun produit dans cette commande.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {items.map((item) => {
            const existing = myReviews.find((r) => r.product_id === item.product_id);
            return (
              <ReviewForm
                key={item.id || item.product_id}
                item={item}
                existingReview={existing || null}
                onSubmit={handleSubmit}
                submitting={submitting}
                orderId={orderId}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}