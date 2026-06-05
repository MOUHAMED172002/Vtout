import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../component/Navbar/Navbar";
import Footer from "../../component/Footer/Footer";
import { getProductById } from "../../services/productService";
import { useTheme } from "../../component/context/ThemeContext";
import {
  ArrowLeft,
  Flame,
  Percent,
  Tag,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  ShoppingCart,
  ExternalLink,
  Info,
  Store,
  ArrowRight,
} from "lucide-react";

const darkThemes = ["dark", "synthwave", "cyberpunk", "luxury", "dracula"];

const parseVolumePricing = (raw) => {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, "0")}h : ${mins
    .toString()
    .padStart(2, "0")}m : ${secs.toString().padStart(2, "0")}s`;
};

export default function PromoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = darkThemes.includes(theme);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        if (!data) {
          setNotFound(true);
        } else {
          setProduct(data);
          // Seed countdown from flash_sale_end if available
          if (data.is_flash_sale && data.flash_sale_end) {
            const diff = Math.max(
              0,
              Math.floor((new Date(data.flash_sale_end) - Date.now()) / 1000)
            );
            setTimeLeft(diff > 0 ? diff : 21600);
          } else {
            setTimeLeft(21600);
          }
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  // Countdown tick
  useEffect(() => {
    if (!product?.is_flash_sale) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [product]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div
          className={`min-h-screen pt-24 pb-20 transition-colors duration-300 ${
            isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
          }`}
        >
          <div className="max-w-[1100px] mx-auto px-4 md:px-10 space-y-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`h-40 rounded-2xl animate-pulse ${
                  isDark ? "bg-slate-800" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (notFound || !product) {
    return (
      <>
        <Navbar />
        <div
          className={`min-h-screen flex flex-col items-center justify-center gap-6 transition-colors duration-300 ${
            isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
          }`}
        >
          <p className="text-lg font-black">Produit introuvable.</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-black px-5 py-2.5 rounded-xl border border-slate-300 hover:border-slate-500 transition-colors"
          >
            <ArrowLeft size={16} /> Retour aux promotions
          </button>
        </div>
        <Footer />
      </>
    );
  }

  // --- Promo type detection ---
  const isFlash =
    product.is_flash_sale &&
    product.flash_sale_end &&
    new Date(product.flash_sale_end) > Date.now();
  const volumeTiers = parseVolumePricing(product.volume_pricing);
  const hasTiers = volumeTiers.length > 0;
  const oldPrice = Number(product.old_price || 0);
  const price = Number(product.price || 0);
  const hasDiscount = oldPrice > price && oldPrice > 0;

  const promoType = isFlash ? "flash" : hasTiers ? "volume" : "reduction";

  const promoColor = {
    flash: "rose",
    volume: "blue",
    reduction: "violet",
  }[promoType];

  const borderColorClass = {
    flash: isDark ? "border-rose-500/40" : "border-rose-300",
    volume: isDark ? "border-blue-500/40" : "border-blue-300",
    reduction: isDark ? "border-violet-500/40" : "border-violet-300",
  }[promoType];

  const priceColorClass = {
    flash: "text-rose-500",
    volume: "text-blue-500",
    reduction: "text-violet-500",
  }[promoType];

  const progressVal = Math.round((product.stock % 7) * 12 + 28);
  const itemsLeft = Math.max(1, product.stock % 5 + 2);

  const images = product.images || [];
  const mainImageUrl = images[activeImg]?.image_url || null;

  // Sorted tiers ascending by min_qty
  const sortedTiers = [...volumeTiers].sort((a, b) => {
    const aMin = a.min_qty ?? a.min ?? 0;
    const bMin = b.min_qty ?? b.min ?? 0;
    return aMin - bMin;
  });

  return (
    <>
      <Navbar />
      <div
        className={`min-h-screen pb-20 transition-colors duration-300 ${
          isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"
        }`}
      >
        <div className="max-w-[1100px] mx-auto px-4 md:px-10 pt-24 pb-20">

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 text-sm font-black mb-6 px-4 py-2 rounded-xl border transition-colors hover:scale-[1.02] active:scale-95 ${
              isDark
                ? "border-slate-700 text-slate-300 hover:border-slate-500"
                : "border-slate-200 text-slate-600 hover:border-slate-400"
            }`}
          >
            <ArrowLeft size={15} />
            Retour aux promotions
          </button>

          {/* Main 2-col grid */}
          <div className="grid md:grid-cols-[1fr_1fr] gap-8 mt-6">

            {/* ---- Left: Image Gallery ---- */}
            <div className="flex flex-col gap-4">
              {/* Main image */}
              <div
                className={`relative aspect-square rounded-2xl overflow-hidden border ${
                  isDark
                    ? "bg-slate-900 border-slate-800"
                    : "bg-slate-100 border-slate-200"
                }`}
              >
                {mainImageUrl ? (
                  <img
                    src={mainImageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm font-bold">
                    Pas d&apos;image
                  </div>
                )}
                {/* Promo badge overlay top-left */}
                <div className="absolute top-3 left-3 z-10">
                  {promoType === "flash" && (
                    <span className="flex items-center gap-1 bg-rose-500 text-white font-black text-[10px] uppercase px-3 py-1.5 rounded-full shadow-lg">
                      <Flame size={10} className="fill-white animate-pulse" />{" "}
                      VENTE FLASH
                    </span>
                  )}
                  {promoType === "volume" && (
                    <span className="flex items-center gap-1 bg-blue-600 text-white font-black text-[10px] uppercase px-3 py-1.5 rounded-full shadow-lg">
                      <Percent size={10} /> REMISE QUANTITÉ
                    </span>
                  )}
                  {promoType === "reduction" && (
                    <span className="flex items-center gap-1 bg-violet-600 text-white font-black text-[10px] uppercase px-3 py-1.5 rounded-full shadow-lg">
                      <Tag size={10} /> RÉDUCTION DIRECTE
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImg === i
                          ? `border-${promoColor}-500`
                          : isDark
                          ? "border-slate-700 opacity-60 hover:opacity-100"
                          : "border-slate-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt={`thumb-${i}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ---- Right: Product info + promo conditions ---- */}
            <div className="flex flex-col gap-4">

              {/* Promo badge chip */}
              <div className="flex items-center gap-2">
                {promoType === "flash" && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isDark
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-rose-50 text-rose-600 border border-rose-200"
                    }`}
                  >
                    <Flame size={11} className="fill-current" /> VENTE FLASH
                  </span>
                )}
                {promoType === "volume" && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isDark
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "bg-blue-50 text-blue-600 border border-blue-200"
                    }`}
                  >
                    <Percent size={11} /> REMISE QUANTITÉ
                  </span>
                )}
                {promoType === "reduction" && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isDark
                        ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                        : "bg-violet-50 text-violet-600 border border-violet-200"
                    }`}
                  >
                    <Tag size={11} /> RÉDUCTION DIRECTE
                  </span>
                )}
              </div>

              {/* Product name */}
              <h1 className={`text-2xl md:text-3xl font-black leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                {product.name}
              </h1>

              {/* Rating */}
              {product.average_rating && (
                <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm">
                  <Star size={14} fill="currentColor" />
                  <span>{Number(product.average_rating).toFixed(1)}</span>
                  <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    ({product.review_count ?? "?"} avis)
                  </span>
                </div>
              )}

              {/* Free delivery zones */}
              {product.free_delivery_communes?.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-emerald-500 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-tight text-emerald-500">
                    LIVRAISON GRATUITE &middot;{" "}
                    {product.free_delivery_communes.join(" · ")}
                  </span>
                </div>
              )}

              {/* ---- PROMO CONDITIONS CARD ---- */}
              <div
                className={`rounded-2xl border p-5 space-y-4 ${borderColorClass} ${
                  isDark ? "bg-slate-900/50" : "bg-white"
                }`}
              >
                {/* Card title */}
                <div className="flex items-center gap-2">
                  <Info size={15} className={priceColorClass} />
                  <span className={`font-black text-sm uppercase tracking-wider ${priceColorClass}`}>
                    Conditions de la Promotion
                  </span>
                </div>

                {/* --- Flash Sale --- */}
                {promoType === "flash" && (
                  <div className="space-y-3">
                    {/* Countdown */}
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-rose-500 shrink-0" />
                      <span className="font-mono text-xl font-black text-rose-500 tracking-widest">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div>
                      <div
                        className={`w-full h-2.5 rounded-full overflow-hidden ${
                          isDark ? "bg-slate-800" : "bg-slate-100"
                        }`}
                      >
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-orange-400 rounded-full transition-all"
                          style={{ width: `${progressVal}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-rose-500 font-black text-xs uppercase tracking-wider">
                      Plus que {itemsLeft} articles restants !
                    </p>
                    <ul className="space-y-2">
                      {[
                        "Offre valable jusqu'à la fin du compte à rebours",
                        "Livraison prioritaire sous 24h",
                        "Stock limité, premier arrivé premier servi",
                      ].map((cond) => (
                        <li key={cond} className="flex items-start gap-2 text-xs font-medium">
                          <CheckCircle2 size={14} className="text-rose-500 shrink-0 mt-0.5" />
                          <span className={isDark ? "text-slate-300" : "text-slate-700"}>{cond}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* --- Volume / Quantity Discount --- */}
                {promoType === "volume" && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {sortedTiers.map((tier, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-black ${
                            isDark ? "bg-slate-800" : "bg-blue-50"
                          }`}
                        >
                          {tier.min_qty !== undefined && tier.discount !== undefined ? (
                            <>
                              <span className={isDark ? "text-slate-300" : "text-slate-700"}>
                                Dès {tier.min_qty} articles
                              </span>
                              <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black">
                                -{tier.discount}%
                              </span>
                            </>
                          ) : tier.min !== undefined ? (
                            <>
                              <span className={isDark ? "text-slate-300" : "text-slate-700"}>
                                De {tier.min} à {tier.max ?? "∞"} articles
                              </span>
                              <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black">
                                ×{tier.multiplier}
                              </span>
                            </>
                          ) : (
                            <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                              Palier {i + 1}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <ul className="space-y-2">
                      {[
                        "Réduction appliquée automatiquement lors du passage en caisse",
                        "Paliers cumulatifs selon la quantité ajoutée au panier",
                        "Valable sur toute la durée de disponibilité du stock",
                      ].map((cond) => (
                        <li key={cond} className="flex items-start gap-2 text-xs font-medium">
                          <CheckCircle2 size={14} className="text-blue-500 shrink-0 mt-0.5" />
                          <span className={isDark ? "text-slate-300" : "text-slate-700"}>{cond}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* --- Direct Reduction --- */}
                {promoType === "reduction" && (
                  <div className="space-y-3">
                    {hasDiscount && (
                      <div
                        className={`flex flex-wrap items-center gap-3 rounded-xl p-3 ${
                          isDark ? "bg-slate-800" : "bg-violet-50"
                        }`}
                      >
                        <span className={`text-base font-black line-through ${isDark ? "text-slate-400" : "text-slate-400"}`}>
                          {oldPrice.toLocaleString()} F
                        </span>
                        <ArrowRight size={14} className={isDark ? "text-slate-500" : "text-slate-400"} />
                        <span className="text-xl font-black text-violet-500">
                          {price.toLocaleString()} F
                        </span>
                        <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                          Vous économisez {(oldPrice - price).toLocaleString()} F !
                        </span>
                      </div>
                    )}
                    <ul className="space-y-2">
                      {[
                        "Réduction appliquée directement sur le prix affiché",
                        "Valable jusqu'à épuisement du stock",
                        "Prix TTC — livraison calculée à la commande",
                      ].map((cond) => (
                        <li key={cond} className="flex items-start gap-2 text-xs font-medium">
                          <CheckCircle2 size={14} className="text-violet-500 shrink-0 mt-0.5" />
                          <span className={isDark ? "text-slate-300" : "text-slate-700"}>{cond}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Price row */}
              <div className="flex items-baseline gap-3">
                <span className={`text-3xl font-black ${priceColorClass}`}>
                  {price.toLocaleString()} F
                </span>
                {hasDiscount && promoType !== "reduction" && (
                  <span className={`text-sm font-bold line-through ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {oldPrice.toLocaleString()} F
                  </span>
                )}
                {hasDiscount && promoType === "reduction" && (
                  <span className={`text-sm font-bold line-through ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {oldPrice.toLocaleString()} F
                  </span>
                )}
              </div>

              {/* Stock */}
              <p className={`text-xs font-bold ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Stock : {product.stock} restants
              </p>

              {/* CTA row */}
              <div className="flex flex-col md:flex-row gap-3 pt-1">
                <button
                  onClick={() =>
                    navigate("/checkout", {
                      state: {
                        items: [
                          {
                            id: product.id,
                            product_id: product.id,
                            name: product.name,
                            price: product.price,
                            price_snapshot: product.price,
                            quantity: 1,
                            image_url: product.images?.[0]?.image_url,
                            boutique_id: product.boutique_id,
                            boutique: product.boutique,
                          },
                        ],
                        total: Number(product.price),
                      },
                    })
                  }
                  className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-black text-sm text-white shadow-lg active:scale-95 transition-all ${
                    promoType === "flash"
                      ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20"
                      : promoType === "volume"
                      ? "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"
                      : "bg-violet-600 hover:bg-violet-500 shadow-violet-600/20"
                  }`}
                >
                  <ShoppingCart size={16} /> Commander maintenant
                </button>
                <button
                  onClick={() => navigate(`/products/${product.id}`)}
                  className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-black text-sm border transition-all active:scale-95 hover:scale-[1.02] ${
                    isDark
                      ? "border-slate-600 text-slate-300 hover:border-slate-400"
                      : "border-slate-300 text-slate-700 hover:border-slate-500"
                  }`}
                >
                  <ExternalLink size={15} /> Voir la fiche produit complète
                </button>
              </div>

              {/* Boutique info */}
              {(product.boutique?.name || product.boutique?.commune_label) && (
                <div className={`flex items-center gap-4 text-xs font-bold pt-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {product.boutique?.name && (
                    <span className="flex items-center gap-1">
                      <Store size={12} />
                      {product.boutique.name}
                    </span>
                  )}
                  {product.boutique?.commune_label && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {product.boutique.commune_label}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Below grid: Description */}
          {product.description && (
            <div
              className={`mt-10 rounded-2xl border p-5 ${
                isDark
                  ? "bg-slate-900/50 border-slate-800 text-slate-300"
                  : "bg-white border-slate-200 text-slate-700"
              }`}
            >
              <h2 className={`font-black text-sm uppercase tracking-wider mb-3 ${isDark ? "text-white" : "text-slate-800"}`}>
                Description
              </h2>
              <p className="text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
