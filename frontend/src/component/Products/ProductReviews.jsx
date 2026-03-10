import React, { useEffect, useState } from "react"
import { getProductReviews } from "../../services/reviewService";
import ProductReviewsModal from "./ProductReviewsModal";
import { Star } from "lucide-react";

function Stars({ value }) {
  const v = Math.round(Number(value) || 0);
  return (
    <div className="text-yellow-500 text-xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < v ? "★" : "☆"}</span>
      ))}
    </div>
  );
}

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (!productId) return;
    async function load() {
      setLoading(true);
      try {
        const data = await getProductReviews(productId, 4);
        setReviews(data || []);
        setCount(data?.length || 0);
      } catch (err) {
        console.error("load product reviews", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);


  return (
    <div id="reviews-section" className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Avis clients.</h3>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-slate-500 font-bold text-sm">
          <Star size={16} className="text-amber-400 fill-amber-400" />
          {count} avis
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-10 text-slate-400 font-medium">
          <span className="loading loading-spinner loading-sm" />
          Chargement des avis...
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <p className="text-slate-400 font-bold italic">Aucun avis pour le moment.</p>
          <p className="text-xs text-slate-300 uppercase tracking-widest font-black">Soyez le premier à partager votre expérience !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.id} className="p-6 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 transition-all space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-100 overflow-hidden flex items-center justify-center shadow-sm">
                  {r.user?.avatar_url ? (
                    <img src={r.user.avatar_url} alt={r.user?.fullname || "U"} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-black text-primary">{(r.user?.fullname && r.user.fullname.charAt(0)) || "U"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-900 truncate">{r.user?.fullname || "Client anonyme"}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString("fr-FR") : ""}
                  </p>
                </div>
                <Stars value={r.rating} />
              </div>

              {r.body && <p className="text-sm text-slate-600 leading-relaxed italic">"{r.body}"</p>}

              {Array.isArray(r.images) && r.images.length > 0 && (
                <div className="flex gap-2">
                  {r.images.slice(0, 3).map((img, i) => (
                    <div key={i} className="w-12 h-12 rounded-lg overflow-hidden border border-slate-100 bg-white">
                      <img src={img} alt={`rev-${r.id}-${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {count > 4 && (
        <div className="flex justify-center pt-4">
          <button
            className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest text-slate-600 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm"
            onClick={() => setOpenModal(true)}
          >
            Afficher tous les avis ({count})
          </button>
        </div>
      )}

      {openModal && <ProductReviewsModal productId={productId} onClose={() => setOpenModal(false)} />}
    </div>
  );
}