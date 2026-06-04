import { useEffect, useState } from "react";
import Navbar from "../../component/Navbar/Navbar";
import Footer from "../../component/Footer/Footer";
import { getProducts } from "../../services/productService";
import { ProductSkeleton } from "../../component/Shared/Skeleton";
import { Percent, ShieldAlert, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../../component/context/ThemeContext";
import { useNavigate } from "react-router-dom";

// Helper to parse volume discounts set in DB
const getProductVolumePricing = (product) => {
  if (product.volume_pricing) {
    try {
      return typeof product.volume_pricing === 'string' 
        ? JSON.parse(product.volume_pricing) 
        : product.volume_pricing;
    } catch (e) {}
  }
  return [];
};

export default function QuantityDiscountPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const darkThemes = ["dark", "synthwave", "cyberpunk", "luxury", "dracula"];
  const isDark = darkThemes.includes(theme);

  useEffect(() => {
    const fetchVolumePricingProducts = async () => {
      try {
        setLoading(true);
        const data = await getProducts({ hasVolumePricing: 'true', limit: 30 });
        setProducts(data.products || data || []);
      } catch (err) {
        console.error("Erreur chargement Prix Quantité:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVolumePricingProducts();
  }, []);

  return (
    <>
      <Navbar />
      <div className={`min-h-screen pb-24 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        
        {/* Glow Decor */}
        <div className={`absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-blue-500/10' : 'bg-blue-500/5'}`} />

        {/* Premium Header */}
        <div className={`relative pt-20 md:pt-28 pb-16 border-b transition-colors duration-500 ${isDark ? 'border-slate-900 bg-slate-950/40' : 'border-slate-200 bg-white'}`}>
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8 z-10 relative">
            <div className="space-y-4 text-center md:text-left">
              <div className={`inline-flex items-center gap-2 font-black uppercase text-xs tracking-[0.2em] px-4 py-2 rounded-full shadow-sm border ${
                isDark 
                  ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' 
                  : 'bg-blue-50 border-blue-100 text-blue-600'
              }`}>
                <Percent size={14} className="text-blue-500" /> Offres de Gros
              </div>
              <h1 className={`text-4xl md:text-7xl font-black tracking-tighter leading-none ${
                isDark 
                  ? 'bg-gradient-to-r from-white via-slate-100 to-blue-400 bg-clip-text text-transparent' 
                  : 'text-slate-900'
              }`}>
                REMISES DE <span className="text-blue-600">QUANTITÉ</span>
              </h1>
              <p className={`font-medium text-sm md:text-lg max-w-xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Plus votre panier grandit, plus les prix diminuent ! Profitez de réductions automatiques exclusives par paliers d'achat.
              </p>
            </div>

            <div className={`rounded-3xl p-6 md:p-8 shadow-2xl max-w-sm shrink-0 flex items-center gap-4 border transition-colors ${
              isDark 
                ? 'bg-slate-900/60 border-blue-500/30 shadow-blue-950/10' 
                : 'bg-white border-blue-100 shadow-blue-100'
            }`}>
              <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-black shrink-0 shadow-lg shadow-blue-500/20">
                %
              </div>
              <div>
                <h4 className={`font-black text-sm uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-800'}`}>Économie Automatique</h4>
                <p className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>La réduction s'applique directement lors de l'ajout au panier.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-12">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className={`aspect-square animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                  <div className="p-3 space-y-2">
                    <div className={`h-4 rounded w-3/4 animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                    <div className={`h-4 rounded w-1/2 animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 flex flex-col items-center text-center space-y-6 max-w-md mx-auto">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 ${isDark ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400 shadow-sm'}`}>
                <ShieldAlert size={40} />
              </div>
              <div className="space-y-2">
                <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Aucune remise de quantité active</h3>
                <p className={`font-medium text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Revenez bientôt !</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {products.map((p, idx) => {
                const tiers = getProductVolumePricing(p);
                if (tiers.length === 0) return null;
                const bestTier = [...tiers].sort((a, b) => b.discount - a.discount)[0];
                const basePrice = parseFloat(p.price);
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => navigate(`/products/${p.id}`)}
                    className={`group rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex flex-col ${
                      isDark
                        ? 'bg-slate-900/40 border-slate-800 hover:border-blue-500/40'
                        : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
                    }`}
                  >
                    {/* Image */}
                    <div className={`relative aspect-square overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
                      {p.images?.[0] ? (
                        <img src={p.images[0].image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-bold">Pas d'image</div>
                      )}
                      {bestTier?.discount > 0 && (
                        <span className="absolute top-2 left-2 bg-blue-600 text-white font-black text-[10px] uppercase px-2 py-1 rounded-full shadow">
                          Jusqu'à -{bestTier.discount}%
                        </span>
                      )}
                    </div>
                    {/* Info */}
                    <div className="p-3 flex flex-col gap-1 flex-1">
                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest truncate">{p.boutique?.name || "Boutique"}</span>
                      <h3 className={`text-xs sm:text-sm font-black line-clamp-2 leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{p.name}</h3>
                      <p className={`text-xs sm:text-sm font-black mt-auto pt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {basePrice.toLocaleString()} F
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
