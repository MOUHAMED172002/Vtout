import { useEffect, useState } from "react";
import Navbar from "../../component/Navbar/Navbar";
import Footer from "../../component/Footer/Footer";
import { getProducts } from "../../services/productService";
import { ProductSkeleton } from "../../component/Shared/Skeleton";
import { Flame, Eye, ShieldAlert, Star, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../component/context/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function FlashSalePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const darkThemes = ["dark", "synthwave", "cyberpunk", "luxury", "dracula"];
  const isDark = darkThemes.includes(theme);

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        setLoading(true);
        const data = await getProducts({ isFlashSale: 'true', limit: 30 });
        setProducts(data.products || data || []);
      } catch (err) {
        console.error("Erreur chargement Ventes Flash:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashSales();
  }, []);

  return (
    <>
      <Navbar />
      <div className={`min-h-screen pb-24 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        
        {/* Background glow accents */}
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-rose-500/10' : 'bg-rose-500/5'}`} />
        <div className={`absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-orange-500/10' : 'bg-orange-500/5'}`} />

        {/* Hero Banner Header */}
        <div className={`relative pt-20 md:pt-28 pb-16 border-b transition-colors duration-500 ${isDark ? 'border-slate-900 bg-slate-950/40' : 'border-slate-200 bg-white'}`}>
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 text-center md:text-left">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex items-center gap-2 font-black uppercase text-xs tracking-[0.2em] px-4 py-2 rounded-full shadow-md border ${
                  isDark 
                    ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' 
                    : 'bg-rose-50 border-rose-100 text-rose-600'
                }`}
              >
                <Flame size={14} className="fill-current animate-pulse text-rose-500" /> Offres Instantanées
              </motion.div>
              <h1 className={`text-4xl md:text-7xl font-black tracking-tighter leading-none ${
                isDark 
                  ? 'bg-gradient-to-r from-white via-slate-100 to-rose-400 bg-clip-text text-transparent' 
                  : 'text-slate-900'
              }`}>
                VENTES <span className="text-rose-500 font-black">FLASH</span>
              </h1>
              <p className={`font-medium text-sm md:text-lg max-w-xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Des baisses de prix massives proposées par nos vendeurs pour une durée limitée. Faites vite, les stocks s'épuisent rapidement !
              </p>
            </div>

          </div>
        </div>

        {/* Product Grid Area */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 relative z-10">
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`p-4 rounded-[2rem] border ${isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <ProductSkeleton dark={isDark} />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 flex flex-col items-center text-center space-y-6 max-w-md mx-auto"
            >
              <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400 shadow-sm'
              }`}>
                <ShieldAlert size={40} />
              </div>
              <div className="space-y-2">
                <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Aucune vente flash active</h3>
                <p className={`font-medium text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Toutes les offres flash en cours ont été épuisées. Revenez très bientôt pour la prochaine vague !
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
            >
              {products.map((p, idx) => {
                const oldPrice = Number(p.old_price || 0);
                const publicPrice = Number(p.price || 0);
                const discount = (oldPrice > publicPrice && oldPrice > 0)
                  ? Math.round(((oldPrice - publicPrice) / oldPrice) * 100)
                  : null;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`group rounded-[2.5rem] p-4 border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between ${
                      isDark 
                        ? 'bg-slate-900/40 border-slate-850 hover:border-rose-500/40 shadow-xl shadow-black/20 hover:shadow-rose-950/10' 
                        : 'bg-white border-slate-200 hover:border-rose-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-2xl hover:shadow-rose-100'
                    }`}
                  >
                    <div>
                      {/* Product Image Panel */}
                      <div className={`relative aspect-square rounded-[1.8rem] overflow-hidden mb-5 flex items-center justify-center border transition-colors ${
                        isDark ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-50 border-slate-100'
                      }`}>
                        {p.images && p.images[0] ? (
                          <img 
                            src={p.images[0].image_url} 
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <span className="text-slate-400 text-xs font-bold">Pas d'image</span>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                          <span className="bg-rose-500 text-white font-black text-[9px] uppercase px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                            <Flame size={10} className="fill-white animate-pulse" /> VITE !
                          </span>
                          {discount && (
                            <span className="bg-slate-950/90 text-rose-400 border border-rose-500/30 font-black text-[10px] px-2.5 py-1 rounded-full shadow-lg">
                              -{discount}%
                            </span>
                          )}
                        </div>

                        {/* Action Overlays on hover */}
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 duration-300">
                          <button
                            onClick={() => navigate(`/promotions/produit/${p.id}?type=flash`)}
                            className="w-10 h-10 rounded-full bg-white text-slate-800 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="space-y-2 px-1">
                        {p.free_delivery_communes && p.free_delivery_communes.length > 0 && (
                          <div className="flex items-center gap-1 min-w-0">
                            <MapPin size={8} strokeWidth={3} className="text-emerald-500 shrink-0" />
                            <span className="text-[9px] font-black uppercase tracking-tight text-emerald-500 truncate">
                              Livraison gratuite · {p.free_delivery_communes.join(' · ')}
                            </span>
                          </div>
                        )}
                        <h3 className={`font-black text-sm md:text-base line-clamp-1 group-hover:text-rose-500 transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          {p.name}
                        </h3>
                        
                        {/* Rating */}
                        {p.average_rating && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                            <Star size={10} fill="currentColor" /> {Number(p.average_rating).toFixed(1)}
                            <span className="text-slate-400/60">•</span>
                            <span className="text-slate-400">Vente Flash</span>
                          </div>
                        )}

                        {/* Pricing */}
                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="font-mono text-lg md:text-2xl font-black text-rose-500">
                            {Number(p.price).toLocaleString()} F
                          </span>
                          {(Number(p.old_price || 0) > Number(p.price || 0)) && (
                            <span className="font-mono text-xs text-slate-400 line-through font-bold">
                              {Number(p.old_price || 0).toLocaleString()} F
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </motion.div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}
