import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Package, Sparkles, ShoppingCart, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../component/Navbar/Navbar";
import Footer from "../../component/Footer/Footer";
import { getKitById } from "../../services/kitService";
import { useCart } from "../../component/context/CartContext";
import { useTheme } from "../../component/context/ThemeContext";
import toast from "react-hot-toast";

export default function KitDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart() || {};
  const { theme } = useTheme();

  const darkThemes = ["dark", "synthwave", "cyberpunk", "luxury", "dracula"];
  const isDark = darkThemes.includes(theme);

  const [kit, setKit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getKitById(id)
      .then(data => setKit(data))
      .catch(() => toast.error("Kit introuvable"))
      .finally(() => setLoading(false));
  }, [id]);

  const components = kit?.components || [];
  const companionsTotal = components.reduce((sum, c) => sum + Number(c.price || 0), 0);
  const bundlePrice = parseFloat(kit?.bundle_price || 0);
  const savings = companionsTotal > bundlePrice ? companionsTotal - bundlePrice : 0;
  const discountPct = savings > 0 ? Math.round((savings / companionsTotal) * 100) : 0;

  const handleBuyKit = () => {
    if (!addToCart || !kit || components.length === 0) return;

    const ratio = companionsTotal > 0 ? bundlePrice / companionsTotal : 1;
    let sharesTotal = 0;
    components.forEach((item, idx) => {
      const isLast = idx === components.length - 1;
      const share = isLast
        ? bundlePrice - sharesTotal
        : Math.round(Number(item.price || 0) * ratio);
      sharesTotal += share;
      addToCart({
        ...item,
        product_id: item.id,
        kit_id: kit.id,
        price_snapshot: Math.max(0, share),
        image_url: item.images?.[0]?.image_url || null,
      }, 1);
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <>
      <Navbar />
      <div className={`min-h-screen pb-24 transition-colors duration-500 ${isDark ? 'bg-slate-950 text-white' : 'bg-base-200 text-base-content'}`}>

        {/* Glow */}
        <div className={`fixed top-0 left-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-emerald-500/8' : 'bg-emerald-500/4'}`} />

        <div className="max-w-[900px] mx-auto px-5 md:px-10 pt-24 md:pt-32 relative z-10">

          {/* Back */}
          <button
            onClick={() => navigate("/promotions/kits")}
            className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-wider mb-10 transition-colors ${isDark ? 'text-base-content/40 hover:text-white' : 'text-base-content/40 hover:text-base-content'}`}
          >
            <ChevronLeft size={14} /> Retour aux kits
          </button>

          {loading ? (
            <div className="space-y-6">
              <div className={`h-12 w-2/3 rounded-2xl animate-pulse ${isDark ? 'bg-neutral/40' : 'bg-base-300'}`} />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className={`h-48 rounded-[2rem] animate-pulse ${isDark ? 'bg-neutral/40' : 'bg-base-300'}`} />)}
              </div>
            </div>
          ) : !kit ? (
            <div className="py-24 flex flex-col items-center text-center gap-4">
              <Package size={48} className="text-base-content/20" />
              <p className="font-black text-base-content/40">Kit introuvable</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={kit.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">

                {/* Header */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                      <Sparkles size={8} /> Lot Vendeur
                    </span>
                    {discountPct > 0 && (
                      <span className="bg-rose-500 text-white text-[9px] font-black px-3 py-1 rounded-full">
                        -{discountPct}%
                      </span>
                    )}
                    {kit.boutique && (
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isDark ? 'bg-neutral/60 text-base-content/40' : 'bg-base-200 text-base-content/50'}`}>
                        {kit.boutique.name}
                      </span>
                    )}
                  </div>
                  <h1 className={`text-3xl md:text-5xl font-black tracking-tight leading-none ${isDark ? 'text-white' : 'text-base-content'}`}>
                    {kit.name}
                  </h1>
                  {kit.description && (
                    <p className={`text-sm font-medium max-w-xl ${isDark ? 'text-base-content/40' : 'text-base-content/60'}`}>
                      {kit.description}
                    </p>
                  )}
                </div>

                {/* Components grid */}
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {components.length} article{components.length > 1 ? 's' : ''} inclus
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {components.map((comp, i) => (
                      <motion.div
                        key={comp.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className={`rounded-[2rem] overflow-hidden border transition-colors ${isDark ? 'bg-neutral/40 border-slate-800' : 'bg-base-100 border-base-200 shadow-sm'}`}
                      >
                        {/* Image */}
                        <div className="h-36 bg-base-200 relative overflow-hidden">
                          {comp.images?.[0]?.image_url ? (
                            <img
                              src={comp.images[0].image_url}
                              alt={comp.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={24} className="text-base-content/20" />
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="p-4 space-y-1">
                          <p className={`text-xs font-black leading-tight line-clamp-2 ${isDark ? 'text-white' : 'text-base-content'}`}>
                            {comp.name}
                          </p>
                          <p className="font-mono text-[10px] text-base-content/40 font-bold">
                            {Number(comp.price || 0).toLocaleString()} F
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Pricing + CTA */}
                <div className={`rounded-[2.5rem] p-6 md:p-8 border flex flex-col md:flex-row items-center justify-between gap-6 ${isDark ? 'bg-neutral/40 border-slate-800' : 'bg-base-100 border-base-200 shadow-lg shadow-emerald-100/50'}`}>
                  <div className="space-y-1 text-center md:text-left">
                    <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-base-content/30' : 'text-base-content/40'}`}>Prix du lot</p>
                    <div className="flex items-baseline gap-3 flex-wrap justify-center md:justify-start">
                      <span className="font-mono text-3xl font-black text-emerald-600">
                        {bundlePrice.toLocaleString()} F
                      </span>
                      {companionsTotal > bundlePrice && (
                        <span className="font-mono text-base text-base-content/30 line-through font-bold">
                          {companionsTotal.toLocaleString()} F
                        </span>
                      )}
                    </div>
                    {savings > 0 && (
                      <p className="text-xs font-black text-emerald-600">
                        Vous économisez {savings.toLocaleString()} F
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleBuyKit}
                    className={`flex items-center gap-2 font-black text-sm uppercase tracking-wider px-8 py-4 rounded-2xl shadow-lg transition-all active:scale-95 ${
                      added
                        ? 'bg-emerald-500 text-white shadow-emerald-200'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-200'
                    }`}
                  >
                    {added ? <><CheckCircle size={16} /> Ajouté !</> : <><ShoppingCart size={16} /> Ajouter au panier</>}
                  </button>
                </div>

              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
