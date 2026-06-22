import { useEffect, useState } from "react";
import Navbar from "../../component/Navbar/Navbar";
import Footer from "../../component/Footer/Footer";
import { getKits } from "../../services/kitService";
import { ProductSkeleton } from "../../component/Shared/Skeleton";
import { Package, ShieldAlert, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../component/context/CartContext";
import { useTheme } from "../../component/context/ThemeContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

/* ── Group kits by boutique preserving order ── */
function groupKitsByBoutique(kits) {
  const order = [];
  const map = {};
  kits.forEach(kit => {
    const id = kit.boutique?.id || '__unknown__';
    if (!map[id]) {
      map[id] = { boutique: kit.boutique || { id, name: 'Boutique inconnue' }, items: [] };
      order.push(id);
    }
    map[id].items.push(kit);
  });
  return order.map(id => map[id]);
}

/* ── Carousel d'images par produit dans le kit ── */
function KitImageCarousel({ items, isDark, discount, tag }) {
  const [idx, setIdx] = useState(0);
  const total = items.length;
  const current = items[idx];

  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + total) % total); };
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % total); };

  return (
    <div className="relative h-36 mb-5 rounded-2xl overflow-hidden">
      {/* Image avec transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0"
        >
          {current?.images?.[0]?.image_url ? (
            <img
              src={current.images[0].image_url}
              alt={current.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-neutral/90' : 'bg-base-200'}`}>
              <Package size={20} className="text-base-content/40" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Gradient bas + nom du produit courant */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-4 z-10">
        <p className="text-white text-[9px] font-black truncate">{current?.name}</p>
      </div>

      {/* Badge tag */}
      <div className="absolute top-2 left-2 z-20">
        <span className="bg-emerald-600 text-white font-black text-[9px] uppercase px-2 py-1 rounded-full shadow flex items-center gap-1">
          <Sparkles size={8} /> {tag}
        </span>
      </div>

      {/* Badge discount */}
      {discount && (
        <div className="absolute top-2 right-2 z-20">
          <span className="bg-rose-500 text-white font-black text-[9px] px-2 py-1 rounded-full shadow">
            -{discount}%
          </span>
        </div>
      )}

      {/* Flèches prev / next */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft size={12} />
          </button>
          <button
            onClick={next}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight size={12} />
          </button>
        </>
      )}

      {/* Indicateurs de position */}
      {total > 1 && (
        <div className="absolute top-2 left-0 right-0 flex justify-center gap-1 z-20 pointer-events-none">
          {items.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-200 ${i === idx ? 'w-3 bg-base-100' : 'w-1.5 bg-base-100/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Carte kit individuelle ── */
function KitCard({ kit, idx, isDark, goToDetail, handleBuyKit }) {
  const discount = kit.originalPrice > kit.kitPrice && kit.originalPrice > 0
    ? Math.round(((kit.originalPrice - kit.kitPrice) / kit.originalPrice) * 100)
    : null;

  return (
    <motion.div
      key={kit.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06 }}
      onClick={() => goToDetail(kit)}
      className={`group rounded-[2.5rem] p-4 border transition-all duration-300 hover:scale-[1.02] cursor-pointer flex flex-col ${
        isDark
          ? 'bg-neutral/40 border-slate-800 hover:border-emerald-500/40 shadow-xl shadow-black/20'
          : 'bg-base-100 border-base-300 hover:border-emerald-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-2xl hover:shadow-emerald-100'
      }`}
    >
      <KitImageCarousel
        items={kit.items}
        isDark={isDark}
        discount={discount}
        tag={kit.tag}
      />

      {/* Info */}
      <div className="space-y-1.5 px-1 flex-1">
        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
          {kit.items.length} article{kit.items.length > 1 ? 's' : ''} inclus
        </p>
        {kit.boutique?.name && (
          <p className={`text-[9px] font-bold truncate ${isDark ? 'text-base-content/30' : 'text-base-content/40'}`}>
            {kit.boutique.name}
          </p>
        )}
        <h3 className={`font-black text-sm leading-tight line-clamp-2 group-hover:text-emerald-600 transition-colors ${isDark ? 'text-white' : 'text-base-content/90'}`}>
          {kit.name}
        </h3>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="font-mono text-base font-black text-emerald-600 whitespace-nowrap">
            {Number(kit.kitPrice).toLocaleString()} F
          </span>
          {kit.originalPrice > kit.kitPrice && (
            <span className="font-mono text-xs text-base-content/40 line-through font-bold whitespace-nowrap">
              {Number(kit.originalPrice).toLocaleString()} F
            </span>
          )}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={(e) => handleBuyKit(kit, e)}
        className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider py-2.5 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
      >
        <Package size={11} /> Ajouter au panier
      </button>
    </motion.div>
  );
}

export default function KitsPage() {
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart() || {};
  const { theme } = useTheme();
  const navigate = useNavigate();

  const darkThemes = ["dark", "synthwave", "cyberpunk", "luxury", "dracula"];
  const isDark = darkThemes.includes(theme);

  useEffect(() => {
    const fetchKits = async () => {
      try {
        setLoading(true);
        const rawKits = await getKits({ active: 'true' });

        const builtKits = rawKits.map((k) => {
          const components = k.components || [];
          const companionsTotal = components.reduce((sum, c) => sum + parseFloat(c.price || 0), 0);
          const kitPrice = parseFloat(k.bundle_price || 0);
          return {
            id: k.id,
            name: k.name,
            description: k.description || "",
            tag: "Offre Vendeur",
            boutique: k.boutique || null,
            discountBadge: companionsTotal > kitPrice
              ? `Économie de ${Math.round(companionsTotal - kitPrice).toLocaleString()} F`
              : "Lot Économique",
            items: components.map(c => ({
              ...c,
              images: c.images || [],
            })),
            originalPrice: companionsTotal,
            kitPrice,
          };
        });

        setKits(builtKits);
      } catch (err) {
        console.error("Erreur chargement Kits:", err);
        toast.error("Impossible de charger les kits.");
      } finally {
        setLoading(false);
      }
    };
    fetchKits();
  }, []);

  const handleBuyKit = (kit, e) => {
    e.stopPropagation();
    if (!addToCart) return;

    const kitId = kit.id;
    const bundlePrice = kit.kitPrice;
    const companionsTotal = kit.items.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const ratio = companionsTotal > 0 ? bundlePrice / companionsTotal : 1;

    // Add all companion items at their proportional share
    let sharesTotal = 0;
    kit.items.forEach((item, idx) => {
      const isLast = idx === kit.items.length - 1;
      // Last item absorbs rounding remainder to guarantee total = bundlePrice
      const share = isLast ? bundlePrice - sharesTotal : Math.round(Number(item.price || 0) * ratio);
      sharesTotal += share;
      addToCart({
        ...item,
        kit_id: kitId,
        price_snapshot: Math.max(0, share),
        image_url: item.image_url || item.images?.[0]?.image_url || null,
      }, 1);
    });
  };

  const goToDetail = (kit) => {
    navigate(`/promotions/kit/${kit.id}`, {
      state: { kitItems: kit.items, kitPrice: kit.kitPrice, kitOriginalPrice: kit.originalPrice }
    });
  };

  return (
    <>
      <Navbar />
      <div className={`min-h-screen pb-24 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-slate-950 text-white' : 'bg-base-200 text-base-content'}`}>

        {/* Glow */}
        <div className={`absolute top-0 left-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-500/5'}`} />

        {/* Header */}
        <div className={`relative pt-20 md:pt-28 pb-16 border-b transition-colors duration-500 ${isDark ? 'border-neutral bg-slate-950/40' : 'border-base-300 bg-base-100'}`}>
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8 z-10 relative">
            <div className="space-y-4 text-center md:text-left">
              <div className={`inline-flex items-center gap-2 font-black uppercase text-xs tracking-[0.2em] px-4 py-2 rounded-full shadow-sm border ${
                isDark ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
              }`}>
                <Package size={14} className="text-emerald-500" /> Lots Prêts
              </div>
              <h1 className={`text-4xl md:text-7xl font-black tracking-tighter leading-none ${
                isDark ? 'bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent' : 'text-base-content'
              }`}>
                PACKS & <span className="text-emerald-600">KITS</span>
              </h1>
              <p className={`font-medium text-sm md:text-lg max-w-2xl ${isDark ? 'text-base-content/40' : 'text-base-content/70'}`}>
                Achetez des ensembles intelligents de produits complémentaires et profitez de réductions incroyables par rapport aux achats séparés !
              </p>
            </div>

            <div className={`rounded-3xl p-6 md:p-8 shadow-2xl max-w-sm shrink-0 flex items-center gap-4 border transition-colors ${
              isDark ? 'bg-neutral/60 border-emerald-500/30' : 'bg-base-100 border-emerald-100 shadow-emerald-100'
            }`}>
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                <Package size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h4 className={`font-black text-sm uppercase tracking-wider ${isDark ? 'text-white' : 'text-base-content/90'}`}>Un Seul Clic</h4>
                <p className={`text-xs mt-1 font-medium ${isDark ? 'text-base-content/40' : 'text-base-content/50'}`}>Tous les articles du kit sont ajoutés automatiquement à votre panier.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 relative z-10">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`rounded-[2.5rem] p-4 border ${isDark ? 'bg-neutral/30 border-slate-800' : 'bg-base-100 border-base-300 shadow-sm'}`}>
                  <ProductSkeleton />
                </div>
              ))}
            </div>
          ) : kits.length === 0 ? (
            <div className="py-24 flex flex-col items-center text-center space-y-6 max-w-md mx-auto">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 ${
                isDark ? 'bg-neutral border-slate-800 text-base-content/50' : 'bg-base-100 border-base-300 text-base-content/40 shadow-sm'
              }`}>
                <ShieldAlert size={40} />
              </div>
              <div className="space-y-2">
                <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-base-content/90'}`}>Aucun pack disponible</h3>
                <p className={`font-medium text-sm ${isDark ? 'text-base-content/40' : 'text-base-content/50'}`}>
                  Aucun kit promotionnel n'est configuré en boutique pour le moment.
                </p>
              </div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
              {groupKitsByBoutique(kits).map(({ boutique, items: boutiqueKits }, sectionIdx) => (
                <div key={boutique.id || sectionIdx}>
                  {/* Boutique section header */}
                  <div className={`flex items-center gap-4 mb-6 pb-4 border-b ${isDark ? 'border-slate-800' : 'border-base-300'}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-50'}`}>
                      <Package size={16} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        Boutique
                      </p>
                      <h2 className={`font-black text-lg leading-tight ${isDark ? 'text-white' : 'text-base-content'}`}>
                        {boutique.name}
                      </h2>
                      {(boutique.commune_label || boutique.departement_label) && (
                        <p className={`text-[10px] font-medium mt-0.5 ${isDark ? 'text-base-content/30' : 'text-base-content/40'}`}>
                          {[boutique.commune_label, boutique.departement_label].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                    <div className={`ml-auto text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${isDark ? 'bg-neutral/60 text-base-content/30' : 'bg-base-200 text-base-content/40'}`}>
                      {boutiqueKits.length} kit{boutiqueKits.length > 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Kits grid for this boutique */}
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {boutiqueKits.map((kit, idx) => (
                      <KitCard
                        key={kit.id}
                        kit={kit}
                        idx={idx}
                        isDark={isDark}
                        goToDetail={goToDetail}
                        handleBuyKit={handleBuyKit}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
