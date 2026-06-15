import { useEffect, useState } from "react";
import Navbar from "../../component/Navbar/Navbar";
import Footer from "../../component/Footer/Footer";
import { getProducts, getProductById } from "../../services/productService";
import { ProductSkeleton } from "../../component/Shared/Skeleton";
import { Package, ShieldAlert, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../component/context/CartContext";
import { useTheme } from "../../component/context/ThemeContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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
        const realKitsData = await getProducts({ isKit: 'true', limit: 20 });
        const realKitProducts = realKitsData.products || realKitsData || [];

        // Bug 1 fix: fetch each component by its exact ID — never fish in a limited list
        const builtKits = await Promise.all(realKitProducts.map(async (p) => {
          let itemIds = [];
          if (p.kit_items) {
            try { itemIds = typeof p.kit_items === 'string' ? JSON.parse(p.kit_items) : p.kit_items; } catch (e) {}
          }

          const resolvedItems = (
            await Promise.all(itemIds.map(id => getProductById(id).catch(() => null)))
          ).filter(Boolean);

          const originalPrice = resolvedItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);

          // Prefer stored old_price (= total bundle original value after fix) when it
          // represents a genuine saving (old_price > price). Fall back to companions sum.
          const storedOldPrice = parseFloat(p.old_price || 0);
          const effectiveOriginal = storedOldPrice > parseFloat(p.price || 0)
            ? storedOldPrice
            : (originalPrice || storedOldPrice || parseFloat(p.price || 0));

          return {
            id: p.id,
            name: p.name,
            description: p.description || "",
            tag: "Offre Vendeur",
            discountBadge: effectiveOriginal > parseFloat(p.price || 0)
              ? `Économie de ${Math.round(effectiveOriginal - parseFloat(p.price)).toLocaleString()} F`
              : "Lot Économique",
            items: resolvedItems,
            originalPrice: effectiveOriginal,
            kitPrice: parseFloat(p.price),
            isReal: true,
            productObj: p,
          };
        }));

        setKits(builtKits);
      } catch (err) {
        console.error("Erreur chargement Kits:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchKits();
  }, []);

  const handleBuyKit = (kit, e) => {
    e.stopPropagation();
    if (!addToCart) return;

    const stock = kit.productObj.stock;
    if (stock !== null && stock !== undefined && Number(stock) <= 0) {
      toast.error("Ce kit est en rupture de stock.");
      return;
    }

    const kitId = kit.id;
    const bundlePrice = kit.kitPrice;
    const bundleOriginal = kit.originalPrice > 0 ? kit.originalPrice : bundlePrice;
    const ratio = bundleOriginal > 0 ? bundlePrice / bundleOriginal : 1;

    // Add companions first and accumulate their proportional shares
    let companionSharesTotal = 0;
    kit.items.forEach(item => {
      const share = Math.round(Number(item.price || 0) * ratio);
      companionSharesTotal += share;
      addToCart({
        ...item,
        kit_id: kitId,
        price_snapshot: share,
        image_url: item.image_url || item.images?.[0]?.image_url || null,
      }, 1);
    });

    // Main product gets the remainder so cart total = bundle price exactly
    addToCart({
      ...kit.productObj,
      kit_id: kitId,
      price_snapshot: Math.max(0, bundlePrice - companionSharesTotal),
      image_url: kit.productObj.image_url || kit.productObj.images?.[0]?.image_url || null,
    }, 1);
  };

  const goToDetail = (kit) => {
    navigate(`/promotions/produit/${kit.id}?type=kit`, {
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            >
              {kits.map((kit, idx) => (
                <KitCard
                  key={kit.id}
                  kit={kit}
                  idx={idx}
                  isDark={isDark}
                  goToDetail={goToDetail}
                  handleBuyKit={handleBuyKit}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
