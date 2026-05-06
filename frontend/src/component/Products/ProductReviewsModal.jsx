import React, { useEffect, useState } from "react";
import { getProductReviews } from "../../services/reviewService";
import { ShieldCheck } from "lucide-react";

function Stars({ value }) {
  const v = Math.round(Number(value) || 0);
  return (
    <div className="text-yellow-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < v ? "★" : "☆"}</span>
      ))}
    </div>
  );
}

export default function ProductReviewsModal({ productId, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(20);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (!productId) return;
    async function load(limit = pageSize) {
      setLoading(true);
      try {
        const data = await getProductReviews(productId, limit);
        setReviews(data || []);
        setHasMore(data?.length === limit);
      } catch (err) {
        console.error("load product reviews modal", err);
      } finally {
        setLoading(false);
      }
    }
    load(pageSize);
  }, [productId, pageSize]);


  async function loadMore() {
    setPageSize((s) => s + 20);
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 md:p-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl shadow-black/20 flex flex-col max-h-full overflow-hidden border border-white"
      >
        {/* Header */}
        <div className="p-8 md:p-12 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Tous les <span className="text-slate-400">avis.</span></h3>
            <p className="text-sm font-bold text-slate-400 mt-1">{reviews.length} témoignages clients</p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm hover:shadow-md"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar">
          {loading && reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <span className="loading loading-spinner loading-lg text-primary" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Chargement...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold italic">Aucun avis pour ce produit.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8">
              {reviews.map((r, idx) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex flex-col md:flex-row gap-6 items-start p-8 rounded-[2rem] bg-slate-50/30 border border-transparent hover:border-slate-100 transition-all"
                >
                  <div className="flex md:flex-col items-center gap-4 min-w-[120px]">
                    <div className="w-16 h-16 rounded-3xl bg-white border border-slate-100 overflow-hidden flex items-center justify-center shadow-sm">
                      {r.author?.avatar_url ? (
                        <img src={r.author.avatar_url} alt={r.author?.fullname || "U"} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-black text-primary">{(r.author?.fullname && r.author.fullname.charAt(0)) || "U"}</span>
                      )}
                    </div>
                    <div className="text-center md:text-center flex-1 flex flex-col items-center">
                      <p className="text-sm font-black text-slate-900 truncate max-w-[100px]">{r.author?.fullname || "Client"}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {r.createdAt || r.created_at ? new Date(r.createdAt || r.created_at).toLocaleDateString("fr-FR") : ""}
                      </p>
                      {r.is_verified && (
                        <span className="mt-1.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                          <ShieldCheck size={12} /> Achat Vérifié
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <Stars value={r.rating} />
                    {r.title && <h4 className="text-lg font-black text-slate-900 tracking-tight">{r.title}</h4>}
                    {r.body && <p className="text-slate-600 leading-relaxed font-medium italic">"{r.body}"</p>}

                    {Array.isArray(r.images) && r.images.length > 0 && (
                      <div className="flex flex-wrap gap-3 pt-2">
                        {r.images.map((img, i) => (
                          <div key={i} className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-100 bg-white group cursor-zoom-in">
                            <img src={img} alt={`rev-${r.id}-${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 md:p-10 border-t border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Affichage de {reviews.length} avis
          </div>
          <div className="flex items-center gap-4">
            {hasMore && (
              <button
                className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/10"
                onClick={loadMore}
              >
                Charger plus
              </button>
            )}
            <button
              className="px-8 py-3.5 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-all"
              onClick={onClose}
            >
              Fermer
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}