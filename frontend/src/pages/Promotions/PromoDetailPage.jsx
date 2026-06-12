import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Navbar from "../../component/Navbar/Navbar";
import Footer from "../../component/Footer/Footer";
import { getProductById } from "../../services/productService";
import { useTheme } from "../../component/context/ThemeContext";
import { useCart } from "../../component/context/CartContext";
import toast from "react-hot-toast";
import {
  ArrowLeft, Flame, Percent, Tag, Star, MapPin, Clock,
  Store, ArrowRight, Truck, ShieldCheck, RotateCcw, Zap,
  ExternalLink, CheckCircle2, TrendingDown, Package,
} from "lucide-react";

const darkThemes = ["dark", "synthwave", "cyberpunk", "luxury", "dracula"];

const parseVolumePricing = (raw) => {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
};

const formatTime = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return { h: String(h).padStart(2, "0"), m: String(m).padStart(2, "0"), s: String(sec).padStart(2, "0") };
};

/* ─────────────────────────────────────────────────────────────
   FLASH SALE DESIGN — urgence, compte à rebours, rouge/orange
───────────────────────────────────────────────────────────── */
function FlashLayout({ product, timeLeft, isDark, navigate }) {
  const [activeImg, setActiveImg] = useState(0);
  const images = product.images || [];
  const mainImg = images[activeImg]?.image_url;
  const price = Number(product.price || 0);
  const oldPrice = Number(product.old_price || 0);
  const hasDiscount = oldPrice > price && oldPrice > 0;
  const pct = hasDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const { h, m, s } = formatTime(timeLeft);
  const stockLeft = Math.max(1, (product.stock || 1) % 8 + 1);
  const stockPct = Math.min(95, Math.max(15, 100 - stockLeft * 11));

  const handleBuy = () => navigate("/checkout", {
    state: {
      items: [{ id: product.id, product_id: product.id, name: product.name, price: product.price, price_snapshot: product.price, quantity: 1, image_url: product.images?.[0]?.image_url, boutique_id: product.boutique_id, boutique: product.boutique }],
      total: Number(product.price)
    }
  });

  return (
    <div className="min-h-screen pb-24 md:pb-20" style={{ background: isDark ? '#0a0a0a' : '#fff5f5' }}>
      {/* Urgency top banner */}
      <div className="w-full pt-20" style={{ background: 'linear-gradient(135deg, #7f1d1d, #dc2626, #ea580c)' }}>
        <div className="max-w-[1100px] mx-auto px-4 md:px-10 py-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/60 hover:text-white text-xs font-black uppercase tracking-widest mb-6 transition-colors">
            <ArrowLeft size={14} /> Retour aux promotions
          </button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-base-100/10 rounded-2xl flex items-center justify-center">
                <Flame size={20} className="text-orange-300 animate-pulse" />
              </div>
              <div>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">Vente Flash</p>
                <p className="text-white font-black text-lg tracking-tight">{product.name}</p>
              </div>
            </div>
            {/* Countdown */}
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-white/50" />
              <div className="flex items-center gap-2">
                {[h, m, s].map((val, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="bg-black/30 backdrop-blur rounded-xl px-4 py-2 text-center min-w-[56px]">
                      <span className="font-mono text-3xl font-black text-white block">{val}</span>
                      <span className="text-white/40 text-[8px] font-black uppercase">{['HRS', 'MIN', 'SEC'][i]}</span>
                    </div>
                    {i < 2 && <span className="text-white/60 text-2xl font-black">:</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-10 pt-8">
        <div className="grid md:grid-cols-[1fr_1fr] gap-8">
          {/* Left — image */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-rose-200 shadow-2xl shadow-rose-500/10">
              {mainImg
                ? <img src={mainImg} alt={product.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-base-content/40 text-sm font-bold bg-base-200">Pas d'image</div>
              }
              {pct > 0 && (
                <div className="absolute top-4 right-4 w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-xl shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #ea580c)' }}>
                  -{pct}%
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-white/80 text-xs font-bold">Stock restant</span>
                  <div className="flex-1 h-1.5 bg-base-100/20 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-rose-400 to-orange-400 rounded-full" style={{ width: `${stockPct}%` }} />
                  </div>
                  <span className="text-rose-300 text-xs font-black">{stockLeft} restant{stockLeft > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-rose-500 scale-105' : 'border-base-300 opacity-60 hover:opacity-100'}`}>
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — info */}
          <div className="flex flex-col gap-5">
            <div>
              {product.average_rating > 0 && (
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mb-2">
                  <Star size={12} fill="currentColor" /> {Number(product.average_rating).toFixed(1)}
                  <span className="text-base-content/40 ml-1">· {product.review_count ?? 0} avis</span>
                </div>
              )}
              <h1 className={`text-3xl md:text-4xl font-black leading-tight tracking-tighter ${isDark ? 'text-white' : 'text-base-content'}`}>{product.name}</h1>
            </div>

            {/* Price */}
            <div className={`rounded-3xl p-6 border border-rose-200 ${isDark ? 'bg-rose-900/10' : 'bg-base-100'} shadow-lg shadow-rose-500/5`}>
              <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Prix flash</p>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-5xl font-black text-rose-600">{price.toLocaleString()}<span className="text-2xl ml-1">F</span></span>
                {hasDiscount && <span className={`text-lg font-bold line-through ${isDark ? 'text-base-content/50' : 'text-base-content/40'}`}>{oldPrice.toLocaleString()} F</span>}
              </div>
              {hasDiscount && (
                <div className="mt-3 inline-flex items-center gap-2 bg-rose-500 text-white px-4 py-1.5 rounded-full text-xs font-black">
                  <TrendingDown size={12} /> Vous économisez {(oldPrice - price).toLocaleString()} F
                </div>
              )}
            </div>

            {/* Steps */}
            <div className={`rounded-2xl p-5 border ${isDark ? 'bg-neutral border-rose-500/20' : 'bg-rose-50 border-rose-100'}`}>
              <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest mb-4">Comment en profiter</p>
              <ol className="space-y-3">
                {["Commandez maintenant avant la fin du compte à rebours", "Le stock est limité — premier arrivé, premier servi", "Le prix flash est garanti à la validation de votre commande"].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center">{i + 1}</span>
                    <span className={`text-sm font-medium ${isDark ? 'text-base-content/30' : 'text-base-content/80'}`}>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Stock */}
            <div className={`flex items-center gap-2 text-xs font-bold ${(product.stock ?? 0) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${(product.stock ?? 0) > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {(product.stock ?? 0) > 0 ? `En stock · ${product.stock} unités disponibles` : 'Rupture de stock'}
            </div>

            {/* CTA — hidden on mobile (sticky bar handles it) */}
            <button onClick={handleBuy}
              className="hidden md:flex w-full py-5 rounded-2xl font-black text-lg text-white items-center justify-center gap-3 shadow-2xl shadow-rose-500/30 active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #dc2626, #ea580c)' }}>
              <Zap size={20} fill="currentColor" /> Acheter maintenant — Offre limitée
            </button>
            <button onClick={() => navigate(`/products/${product.id}`)}
              className={`w-full py-3 rounded-2xl font-black text-sm border flex items-center justify-center gap-2 transition-all active:scale-95 ${isDark ? 'border-slate-700 text-base-content/40 hover:border-slate-500' : 'border-base-300 text-base-content/50 hover:border-base-300'}`}>
              <ExternalLink size={14} /> Voir la fiche complète
            </button>

            <TrustBadges priceColor="text-rose-500" isDark={isDark} />
            <BoutiqueInfo product={product} isDark={isDark} />
          </div>
        </div>

        <DescriptionBlock product={product} isDark={isDark} />
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 pb-5 pt-3 border-t"
        style={{ background: isDark ? 'rgba(10,10,10,0.96)' : 'rgba(255,245,245,0.97)', borderColor: isDark ? '#2d1b1b' : '#fecaca', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className={`text-[11px] font-black truncate ${isDark ? 'text-base-content/30' : 'text-base-content/80'}`}>{product.name}</p>
            <p className="font-mono font-black text-base text-rose-600">{price.toLocaleString()} F</p>
          </div>
          <button onClick={handleBuy}
            className="shrink-0 flex items-center gap-1.5 px-5 py-3 rounded-2xl font-black text-sm text-white shadow-lg active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg, #dc2626, #ea580c)' }}>
            <Zap size={14} fill="currentColor" /> Acheter
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   RÉDUCTION DIRECTE — économies, satisfaction, vert/violet
───────────────────────────────────────────────────────────── */
function ReductionLayout({ product, isDark, navigate }) {
  const [activeImg, setActiveImg] = useState(0);
  const images = product.images || [];
  const mainImg = images[activeImg]?.image_url;
  const price = Number(product.price || 0);
  const oldPrice = Number(product.old_price || 0);
  const savings = oldPrice - price;
  const pct = oldPrice > 0 ? Math.round((savings / oldPrice) * 100) : 0;

  const handleBuy = () => navigate("/checkout", {
    state: {
      items: [{ id: product.id, product_id: product.id, name: product.name, price: product.price, price_snapshot: product.price, quantity: 1, image_url: product.images?.[0]?.image_url, boutique_id: product.boutique_id, boutique: product.boutique }],
      total: Number(product.price)
    }
  });

  return (
    <div className={`min-h-screen pb-24 md:pb-20 ${isDark ? 'bg-slate-950' : 'bg-base-100'}`}>
      {/* Clean top bar */}
      <div className="pt-20 pb-6 border-b" style={{ borderColor: isDark ? '#1e293b' : '#f1f5f9' }}>
        <div className="max-w-[1100px] mx-auto px-4 md:px-10">
          <button onClick={() => navigate(-1)} className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-4 transition-colors ${isDark ? 'text-base-content/50 hover:text-base-content/30' : 'text-base-content/40 hover:text-base-content/80'}`}>
            <ArrowLeft size={13} /> Retour aux promotions
          </button>
          {/* Savings hero */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.1)' }}>
                <Tag size={18} className="text-violet-600" />
              </div>
              <div>
                <p className="text-violet-600 text-[10px] font-black uppercase tracking-[0.3em]">Réduction directe</p>
                <p className={`font-black text-lg ${isDark ? 'text-white' : 'text-base-content'}`}>{product.name}</p>
              </div>
            </div>
            {pct > 0 && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`text-sm font-bold line-through ${isDark ? 'text-base-content/50' : 'text-base-content/40'}`}>{oldPrice.toLocaleString()} F</p>
                  <p className="text-3xl font-black text-violet-600">{price.toLocaleString()} F</p>
                </div>
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-black text-xl shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                  -{pct}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-10 pt-8">
        <div className="grid md:grid-cols-[1fr_1fr] gap-8">
          {/* Left — image */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden border shadow-xl"
              style={{ borderColor: isDark ? '#312e81' : '#ede9fe' }}>
              {mainImg
                ? <img src={mainImg} alt={product.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-base-content/40 text-sm font-bold bg-base-200">Pas d'image</div>
              }
              {pct > 0 && (
                <div className="absolute top-4 left-4 bg-violet-600 text-white font-black text-sm px-4 py-2 rounded-2xl shadow-lg">
                  -{pct}% de réduction
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-violet-500 scale-105' : 'border-base-300 opacity-60 hover:opacity-100'}`}>
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex flex-col gap-5">
            <div>
              {product.average_rating > 0 && (
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mb-2">
                  <Star size={12} fill="currentColor" /> {Number(product.average_rating).toFixed(1)}
                  <span className="text-base-content/40 ml-1">· {product.review_count ?? 0} avis</span>
                </div>
              )}
              <h1 className={`text-3xl md:text-4xl font-black leading-tight tracking-tighter ${isDark ? 'text-white' : 'text-base-content'}`}>{product.name}</h1>
            </div>

            {/* Before / After */}
            <div className={`rounded-3xl p-6 border ${isDark ? 'bg-violet-900/10 border-violet-500/20' : 'bg-violet-50 border-violet-100'}`}>
              <p className="text-violet-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Comparaison des prix</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 text-center">
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-base-content/50' : 'text-base-content/40'}`}>Avant</p>
                  <p className={`text-2xl font-black line-through ${isDark ? 'text-base-content/50' : 'text-base-content/40'}`}>{oldPrice.toLocaleString()} F</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <ArrowRight size={20} className="text-violet-500" />
                  {pct > 0 && <span className="bg-violet-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">-{pct}%</span>}
                </div>
                <div className="flex-1 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-violet-500 mb-1">Maintenant</p>
                  <p className="text-3xl font-black text-violet-600">{price.toLocaleString()} F</p>
                </div>
              </div>
              {savings > 0 && (
                <div className="mt-4 text-center py-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(79,70,229,0.1))' }}>
                  <p className="font-black text-violet-700 text-lg">Vous économisez {savings.toLocaleString()} F</p>
                  <p className="text-violet-500 text-xs font-bold mt-0.5">réduction immédiate, sans condition</p>
                </div>
              )}
            </div>

            {/* Simple steps */}
            <div className={`rounded-2xl p-5 border ${isDark ? 'bg-neutral border-violet-500/10' : 'bg-base-200 border-base-200'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${isDark ? 'text-base-content/40' : 'text-base-content/50'}`}>C'est simple</p>
              <div className="space-y-3">
                {[
                  { icon: <CheckCircle2 size={15} className="text-emerald-500" />, text: "Le prix affiché est déjà le prix réduit" },
                  { icon: <CheckCircle2 size={15} className="text-emerald-500" />, text: "Aucun code promo, aucune condition" },
                  { icon: <CheckCircle2 size={15} className="text-emerald-500" />, text: "Ajoutez au panier et profitez de l'économie" },
                ].map(({ icon, text }, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {icon}
                    <span className={`text-sm font-medium ${isDark ? 'text-base-content/30' : 'text-base-content/80'}`}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`flex items-center gap-2 text-xs font-bold ${(product.stock ?? 0) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${(product.stock ?? 0) > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {(product.stock ?? 0) > 0 ? `En stock · ${product.stock} unités` : 'Rupture de stock'}
            </div>

            <button onClick={handleBuy}
              className="hidden md:flex w-full py-5 rounded-2xl font-black text-lg text-white items-center justify-center gap-3 shadow-xl shadow-violet-500/20 active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              Profiter de la réduction
            </button>
            <button onClick={() => navigate(`/products/${product.id}`)}
              className={`w-full py-3 rounded-2xl font-black text-sm border flex items-center justify-center gap-2 transition-all active:scale-95 ${isDark ? 'border-slate-700 text-base-content/40 hover:border-slate-500' : 'border-base-300 text-base-content/50 hover:border-base-300'}`}>
              <ExternalLink size={14} /> Voir la fiche complète
            </button>

            <TrustBadges priceColor="text-violet-600" isDark={isDark} />
            <BoutiqueInfo product={product} isDark={isDark} />
          </div>
        </div>
        <DescriptionBlock product={product} isDark={isDark} />
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 pb-5 pt-3 border-t"
        style={{ background: isDark ? 'rgba(15,10,30,0.96)' : 'rgba(250,250,255,0.97)', borderColor: isDark ? '#312e81' : '#ede9fe', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className={`text-[11px] font-black truncate ${isDark ? 'text-base-content/30' : 'text-base-content/80'}`}>{product.name}</p>
            <p className="font-mono font-black text-base text-violet-600">{price.toLocaleString()} F</p>
          </div>
          <button onClick={handleBuy}
            className="shrink-0 flex items-center gap-1.5 px-5 py-3 rounded-2xl font-black text-sm text-white shadow-lg active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            Profiter
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   REMISE QUANTITÉ — professionnel, paliers, bleu
───────────────────────────────────────────────────────────── */
function VolumeLayout({ product, isDark, navigate }) {
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const images = product.images || [];
  const mainImg = images[activeImg]?.image_url;
  const price = Number(product.price || 0);
  const tiers = parseVolumePricing(product.volume_pricing)
    .map(t => ({ ...t, min_qty: Math.max(1, t.min_qty ?? t.min ?? t.qty ?? 1) }))
    .sort((a, b) => a.min_qty - b.min_qty);

  const getActiveTier = (q) => {
    let active = null;
    for (const tier of tiers) {
      if (q >= tier.min_qty) active = tier;
    }
    return active;
  };

  const activeTier = getActiveTier(qty);
  const discount = activeTier?.discount ?? 0;
  const unitPrice = discount > 0 ? Math.round(price * (1 - discount / 100)) : price;
  const totalPrice = unitPrice * qty;
  const savings = (price - unitPrice) * qty;
  const nextTier = tiers.find(t => t.min_qty > qty);
  const bestDiscount = tiers.reduce((max, t) => Math.max(max, t.discount ?? 0), 0);

  const handleBuy = () => navigate("/checkout", {
    state: {
      items: [{ id: product.id, product_id: product.id, name: product.name, price: unitPrice, price_snapshot: unitPrice, quantity: qty, image_url: product.images?.[0]?.image_url, boutique_id: product.boutique_id, boutique: product.boutique }],
      total: totalPrice
    }
  });

  return (
    <div className={`min-h-screen pb-24 md:pb-20 ${isDark ? 'bg-slate-950' : 'bg-base-200'}`}>
      {/* Header */}
      <div className="pt-20 pb-6" style={{ background: isDark ? '#0f172a' : 'linear-gradient(135deg, #eff6ff, #f0f9ff)' }}>
        <div className="max-w-[1100px] mx-auto px-4 md:px-10">
          <button onClick={() => navigate(-1)} className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-6 transition-colors ${isDark ? 'text-base-content/50 hover:text-base-content/30' : 'text-base-content/40 hover:text-base-content/80'}`}>
            <ArrowLeft size={13} /> Retour aux promotions
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
            <div>
              <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em]">Remise par quantité</p>
              <p className={`font-black text-lg ${isDark ? 'text-white' : 'text-base-content'}`}>{product.name}</p>
            </div>
            {bestDiscount > 0 && (
              <span className="ml-auto bg-blue-600 text-white font-black text-sm px-4 py-2 rounded-2xl shadow">
                Jusqu'à -{bestDiscount}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-10 pt-8">
        <div className="grid md:grid-cols-[1fr_1fr] gap-8">
          {/* Left — image + tier table */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden border shadow-xl"
              style={{ borderColor: isDark ? '#1e3a5f' : '#bfdbfe' }}>
              {mainImg
                ? <img src={mainImg} alt={product.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-base-content/40 text-sm font-bold bg-base-200">Pas d'image</div>
              }
              <div className="absolute top-4 left-4 bg-blue-600 text-white font-black text-xs px-3 py-1.5 rounded-xl shadow">
                <Percent size={10} className="inline mr-1" />REMISE QUANTITÉ
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-blue-500 scale-105' : 'border-base-300 opacity-60 hover:opacity-100'}`}>
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Tier table */}
            {tiers.length > 0 && (
              <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-slate-700' : 'border-blue-100'}`}>
                <div className={`px-4 py-3 ${isDark ? 'bg-neutral/90' : 'bg-blue-600'}`}>
                  <p className="text-white font-black text-xs uppercase tracking-widest">Paliers de réduction</p>
                </div>
                <div className="divide-y" style={{ borderColor: isDark ? '#334155' : '#dbeafe' }}>
                  {tiers.map((tier, i) => {
                    const min = tier.min_qty;
                    const disc = tier.discount ?? 0;
                    const isActive = activeTier === tier;
                    return (
                      <div key={i} className={`flex items-center justify-between px-4 py-3 transition-colors ${isActive ? (isDark ? 'bg-blue-900/30' : 'bg-blue-50') : (isDark ? 'bg-neutral' : 'bg-base-100')}`}>
                        <div className="flex items-center gap-2">
                          {isActive && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                          <span className={`text-sm font-bold ${isDark ? 'text-base-content/30' : 'text-base-content/80'}`}>
                            {tier.min !== undefined && tier.max !== undefined
                              ? `${tier.min} – ${tier.max ?? '∞'} articles`
                              : `Dès ${min} article${min > 1 ? 's' : ''}`}
                          </span>
                        </div>
                        <span className={`font-black text-sm ${isActive ? 'text-blue-600' : (isDark ? 'text-base-content/40' : 'text-base-content/50')}`}>
                          {disc > 0 ? `-${disc}%` : tier.multiplier ? `×${tier.multiplier}` : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex flex-col gap-5">
            <div>
              {product.average_rating > 0 && (
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mb-2">
                  <Star size={12} fill="currentColor" /> {Number(product.average_rating).toFixed(1)}
                  <span className="text-base-content/40 ml-1">· {product.review_count ?? 0} avis</span>
                </div>
              )}
              <h1 className={`text-3xl md:text-4xl font-black leading-tight tracking-tighter ${isDark ? 'text-white' : 'text-base-content'}`}>{product.name}</h1>
            </div>

            {/* Quantity selector */}
            <div className={`rounded-3xl p-6 border ${isDark ? 'bg-neutral border-blue-500/20' : 'bg-base-100 border-blue-100'} shadow-lg`}>
              <p className="text-blue-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Calculateur de remise</p>
              <div className="flex items-center gap-4 mb-5">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className={`w-10 h-10 rounded-xl font-black text-xl flex items-center justify-center border transition-all ${isDark ? 'border-slate-600 text-base-content/30 hover:bg-neutral/90' : 'border-base-300 text-base-content/70 hover:bg-base-200'}`}>−</button>
                <span className={`text-3xl font-black min-w-[3rem] text-center ${isDark ? 'text-white' : 'text-base-content'}`}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}
                  className="w-10 h-10 rounded-xl font-black text-xl flex items-center justify-center bg-blue-600 text-white hover:bg-blue-500 transition-all">+</button>
                <span className={`text-sm font-bold ${isDark ? 'text-base-content/40' : 'text-base-content/50'}`}>article{qty > 1 ? 's' : ''}</span>
              </div>

              <div className={`rounded-2xl p-4 space-y-3 ${isDark ? 'bg-neutral/90' : 'bg-base-200'}`}>
                <div className="flex justify-between text-sm">
                  <span className={`font-bold ${isDark ? 'text-base-content/40' : 'text-base-content/50'}`}>Prix unitaire</span>
                  <span className={`font-black ${discount > 0 ? 'text-blue-600' : (isDark ? 'text-white' : 'text-base-content')}`}>
                    {unitPrice.toLocaleString()} F{discount > 0 && <span className="text-emerald-500 ml-1 text-xs">(-{discount}%)</span>}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={`font-bold ${isDark ? 'text-base-content/40' : 'text-base-content/50'}`}>Quantité</span>
                  <span className={`font-black ${isDark ? 'text-white' : 'text-base-content'}`}>× {qty}</span>
                </div>
                <div className={`border-t pt-3 flex justify-between ${isDark ? 'border-slate-700' : 'border-base-300'}`}>
                  <span className="font-black text-sm">Total</span>
                  <span className="font-black text-xl text-blue-600">{totalPrice.toLocaleString()} F</span>
                </div>
                {savings > 0 && (
                  <div className="text-center text-emerald-500 font-black text-xs">
                    Économie : {savings.toLocaleString()} F sur cette commande
                  </div>
                )}
              </div>

              {nextTier && (
                <div className={`mt-3 flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl ${isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                  <Package size={12} />
                  Ajoutez {nextTier.min_qty - qty} article{nextTier.min_qty - qty > 1 ? 's' : ''} pour -{nextTier.discount ?? '?'}% !
                </div>
              )}
            </div>

            <div className={`flex items-center gap-2 text-xs font-bold ${(product.stock ?? 0) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${(product.stock ?? 0) > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {(product.stock ?? 0) > 0 ? `En stock · ${product.stock} unités disponibles` : 'Rupture de stock'}
            </div>

            <button onClick={handleBuy}
              className="hidden md:flex w-full py-5 rounded-2xl font-black text-lg text-white items-center justify-center gap-3 shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
              <Package size={20} /> Commander {qty} article{qty > 1 ? 's' : ''}
            </button>
            <button onClick={() => navigate(`/products/${product.id}`)}
              className={`w-full py-3 rounded-2xl font-black text-sm border flex items-center justify-center gap-2 transition-all active:scale-95 ${isDark ? 'border-slate-700 text-base-content/40 hover:border-slate-500' : 'border-base-300 text-base-content/50 hover:border-base-300'}`}>
              <ExternalLink size={14} /> Voir la fiche complète
            </button>

            <TrustBadges priceColor="text-blue-600" isDark={isDark} />
            <BoutiqueInfo product={product} isDark={isDark} />
          </div>
        </div>
        <DescriptionBlock product={product} isDark={isDark} />
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 pb-5 pt-3 border-t"
        style={{ background: isDark ? 'rgba(10,15,30,0.96)' : 'rgba(245,249,255,0.97)', borderColor: isDark ? '#1e3a5f' : '#bfdbfe', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className={`text-[11px] font-black truncate ${isDark ? 'text-base-content/30' : 'text-base-content/80'}`}>{qty} × {product.name}</p>
            <p className="font-mono font-black text-base text-blue-600">{totalPrice.toLocaleString()} F</p>
          </div>
          <button onClick={handleBuy}
            className="shrink-0 flex items-center gap-1.5 px-5 py-3 rounded-2xl font-black text-sm text-white shadow-lg active:scale-95 transition-all"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
            <Package size={14} /> Commander
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PACK & KIT — ensemble de produits complémentaires, vert
───────────────────────────────────────────────────────────── */
function KitLayout({ product, kitItems, isDark, navigate, addToCart }) {
  const price = Number(product.price || 0);
  const oldPrice = Number(product.old_price || 0);
  const items = Array.isArray(kitItems) && kitItems.length > 0 ? kitItems : [];
  const totalOriginal = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const ratio = totalOriginal > 0 ? price / totalOriginal : 1;

  const handleBuy = () => {
    if (!addToCart) return;
    if (items.length === 0) {
      addToCart({ ...product, price, price_snapshot: price }, 1);
    } else {
      items.forEach(item => {
        const itemPrice = Math.round(Number(item.price || 0) * ratio);
        addToCart({ ...item, price: itemPrice, price_snapshot: itemPrice }, 1);
      });
    }
    toast.success(`Pack "${product.name}" ajouté au panier !`);
  };

  return (
    <div className={`min-h-screen pb-24 md:pb-20 ${isDark ? 'bg-slate-950' : 'bg-base-200'}`}>
      {/* Header */}
      <div className="pt-20 pb-6 border-b" style={{ borderColor: isDark ? '#1e293b' : '#d1fae5' }}>
        <div className="max-w-[1100px] mx-auto px-4 md:px-10">
          <button onClick={() => navigate(-1)} className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-4 transition-colors ${isDark ? 'text-base-content/50 hover:text-base-content/30' : 'text-base-content/40 hover:text-base-content/80'}`}>
            <ArrowLeft size={13} /> Retour aux packs
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shrink-0">
              <Package size={18} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em]">Pack & Kit</p>
              <p className={`font-black text-lg truncate ${isDark ? 'text-white' : 'text-base-content'}`}>{product.name}</p>
            </div>
            {oldPrice > price && oldPrice > 0 && (
              <span className="shrink-0 bg-rose-500 text-white font-black text-sm px-4 py-2 rounded-2xl shadow">
                Économie {Math.round(oldPrice - price).toLocaleString()} F
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-10 pt-8 space-y-8">
        {/* Price panel */}
        <div className={`rounded-3xl p-6 border ${isDark ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-base-100 border-emerald-100'} shadow-lg`}>
          <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Prix du pack complet</p>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-5xl font-black text-emerald-600">
              {price.toLocaleString()}<span className="text-2xl ml-1">F</span>
            </span>
            {oldPrice > price && oldPrice > 0 && (
              <span className={`text-lg font-bold line-through ${isDark ? 'text-base-content/50' : 'text-base-content/40'}`}>{oldPrice.toLocaleString()} F</span>
            )}
          </div>
          {oldPrice > price && oldPrice > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-black">
              <TrendingDown size={12} /> Économisez {Math.round(oldPrice - price).toLocaleString()} F sur ce pack
            </div>
          )}
        </div>

        {/* Items included */}
        {items.length > 0 && (
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${isDark ? 'text-base-content/40' : 'text-base-content/50'}`}>
              {items.length} article{items.length > 1 ? 's' : ''} inclus dans ce pack
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((item, i) => {
                const itemPrice = Math.round(Number(item.price || 0) * ratio);
                return (
                  <div key={item.id ?? i} className={`rounded-2xl border p-3 flex flex-col gap-2.5 ${isDark ? 'bg-neutral border-slate-800' : 'bg-base-100 border-base-200 shadow-sm'}`}>
                    <div className="aspect-square rounded-xl overflow-hidden">
                      {item.images?.[0]?.image_url
                        ? <img src={item.images[0].image_url} alt={item.name} className="w-full h-full object-cover" />
                        : <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-neutral/90' : 'bg-base-200'}`}><Package size={18} className="text-base-content/40" /></div>
                      }
                    </div>
                    <p className={`text-xs font-black line-clamp-2 leading-tight ${isDark ? 'text-white' : 'text-base-content/90'}`}>{item.name}</p>
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-emerald-600 font-mono font-black text-sm">{itemPrice.toLocaleString()} F</p>
                      {Number(item.price || 0) !== itemPrice && (
                        <p className={`font-mono font-bold text-[10px] line-through ${isDark ? 'text-base-content/70' : 'text-base-content/40'}`}>{Number(item.price || 0).toLocaleString()} F</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* How it works */}
        <div className={`rounded-2xl p-5 border ${isDark ? 'bg-neutral border-emerald-500/10' : 'bg-emerald-50 border-emerald-100'}`}>
          <p className="text-emerald-700 text-[10px] font-black uppercase tracking-widest mb-4">Comment ça marche</p>
          <div className="space-y-3">
            {[
              { icon: <CheckCircle2 size={15} className="text-emerald-500" />, text: "Tous les articles sont ajoutés à votre panier en un clic" },
              { icon: <CheckCircle2 size={15} className="text-emerald-500" />, text: "Le prix pack est réparti proportionnellement sur chaque article" },
              { icon: <CheckCircle2 size={15} className="text-emerald-500" />, text: "Économisez par rapport aux achats séparés" },
            ].map(({ icon, text }, i) => (
              <div key={i} className="flex items-center gap-3">
                {icon}
                <span className={`text-sm font-medium ${isDark ? 'text-base-content/30' : 'text-base-content/80'}`}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA — desktop only */}
        <button onClick={handleBuy}
          className="hidden md:flex w-full py-5 rounded-2xl font-black text-lg text-white items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all bg-emerald-600 hover:bg-emerald-500">
          <Package size={20} /> Ajouter le Pack au panier
        </button>

        <DescriptionBlock product={product} isDark={isDark} />
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 pb-5 pt-3 border-t"
        style={{ background: isDark ? 'rgba(5,20,15,0.96)' : 'rgba(240,255,245,0.97)', borderColor: isDark ? '#064e3b' : '#a7f3d0', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className={`text-[11px] font-black truncate ${isDark ? 'text-base-content/30' : 'text-base-content/80'}`}>{product.name}</p>
            <p className="font-mono font-black text-base text-emerald-600">{price.toLocaleString()} F</p>
          </div>
          <button onClick={handleBuy}
            className="shrink-0 flex items-center gap-1.5 px-5 py-3 rounded-2xl font-black text-sm text-white shadow-lg active:scale-95 transition-all bg-emerald-600">
            <Package size={14} /> Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Shared sub-components ── */
function TrustBadges({ priceColor, isDark }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {[{ icon: <Truck size={16} />, label: "Livraison 48h" }, { icon: <ShieldCheck size={16} />, label: "Garantie 1 an" }, { icon: <RotateCcw size={16} />, label: "Retour gratuit" }].map(({ icon, label }) => (
        <div key={label} className={`flex flex-col items-center text-center p-3 rounded-2xl space-y-1 ${isDark ? "bg-neutral/90/50" : "bg-base-200"}`}>
          <span className={`mb-0.5 ${priceColor}`}>{icon}</span>
          <span className="text-[9px] font-black uppercase text-base-content/40 leading-tight">{label}</span>
        </div>
      ))}
    </div>
  );
}
function BoutiqueInfo({ product, isDark }) {
  if (!product.boutique?.name && !product.boutique?.commune_label) return null;
  return (
    <div className={`flex items-center gap-4 text-xs font-bold ${isDark ? "text-base-content/50" : "text-base-content/40"}`}>
      {product.boutique?.name && <span className="flex items-center gap-1"><Store size={12} />{product.boutique.name}</span>}
      {product.boutique?.commune_label && <span className="flex items-center gap-1"><MapPin size={12} />{product.boutique.commune_label}</span>}
    </div>
  );
}
function DescriptionBlock({ product, isDark }) {
  if (!product.description) return null;
  return (
    <div className={`mt-10 rounded-2xl border p-5 ${isDark ? "bg-neutral/50 border-slate-800 text-base-content/30" : "bg-base-100 border-base-300 text-base-content/80"}`}>
      <h2 className={`font-black text-sm uppercase tracking-wider mb-3 ${isDark ? "text-white" : "text-base-content/90"}`}>Description</h2>
      <p className="text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
    </div>
  );
}

/* ── Root component ── */
export default function PromoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  const { theme } = useTheme();
  const { addToCart } = useCart() || {};
  const isDark = darkThemes.includes(theme);

  const kitItems = location.state?.kitItems ?? null;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        if (!data) return setNotFound(true);
        setProduct(data);
        if (data.is_flash_sale && data.flash_sale_end) {
          const diff = Math.max(0, Math.floor((new Date(data.flash_sale_end) - Date.now()) / 1000));
          setTimeLeft(diff > 0 ? diff : 21600);
        } else {
          setTimeLeft(21600);
        }
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    })();
  }, [id]);

  useEffect(() => {
    if (!product?.is_flash_sale || (typeParam && typeParam !== "flash")) return;
    const t = setInterval(() => setTimeLeft(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(t);
  }, [product, typeParam]);

  const Skeleton = () => (
    <>
      <Navbar />
      <div className={`min-h-screen pt-24 pb-20 ${isDark ? "bg-slate-950" : "bg-base-200"}`}>
        <div className="max-w-[1100px] mx-auto px-4 md:px-10 space-y-6">
          {[...Array(4)].map((_, i) => <div key={i} className={`h-40 rounded-2xl animate-pulse ${isDark ? "bg-neutral/90" : "bg-base-300"}`} />)}
        </div>
      </div>
      <Footer />
    </>
  );

  if (loading) return <Skeleton />;

  if (notFound || !product) return (
    <>
      <Navbar />
      <div className={`min-h-screen flex flex-col items-center justify-center gap-6 ${isDark ? "bg-slate-950 text-white" : "bg-base-200 text-base-content"}`}>
        <p className="text-lg font-black">Produit introuvable.</p>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-black px-5 py-2.5 rounded-xl border border-base-300 hover:border-slate-500 transition-colors">
          <ArrowLeft size={16} /> Retour aux promotions
        </button>
      </div>
      <Footer />
    </>
  );

  const isFlash = product.is_flash_sale && product.flash_sale_end && new Date(product.flash_sale_end) > Date.now();
  const hasTiers = parseVolumePricing(product.volume_pricing).length > 0;

  const promoType = (() => {
    if (typeParam === "kit") return "kit";
    if (typeParam === "flash" && isFlash) return "flash";
    if (typeParam === "volume" && hasTiers) return "volume";
    if (typeParam === "reduction") return "reduction";
    return isFlash ? "flash" : hasTiers ? "volume" : "reduction";
  })();

  return (
    <>
      <Navbar />
      {promoType === "flash" && <FlashLayout product={product} timeLeft={timeLeft} isDark={isDark} navigate={navigate} />}
      {promoType === "volume" && <VolumeLayout product={product} isDark={isDark} navigate={navigate} />}
      {promoType === "reduction" && <ReductionLayout product={product} isDark={isDark} navigate={navigate} />}
      {promoType === "kit" && <KitLayout product={product} kitItems={kitItems} isDark={isDark} navigate={navigate} addToCart={addToCart} />}
      <Footer />
    </>
  );
}
