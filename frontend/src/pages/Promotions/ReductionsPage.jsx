import { useEffect, useState } from "react";
import Navbar from "../../component/Navbar/Navbar";
import Footer from "../../component/Footer/Footer";
import { getProducts } from "../../services/productService";
import { ProductSkeleton } from "../../component/Shared/Skeleton";
import { Tag, ShieldAlert, Eye, Star, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../../component/context/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function ReductionsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const darkThemes = ["dark", "synthwave", "cyberpunk", "luxury", "dracula"];
  const isDark = darkThemes.includes(theme);

  useEffect(() => {
    const fetchReductions = async () => {
      try {
        setLoading(true);
        const data = await getProducts({ isPromo: 'true', limit: 30 });
        setProducts(data.products || data || []);
      } catch (err) {
        console.error("Erreur chargement Réductions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReductions();
  }, []);

  return (
    <>
      <Navbar />
      <div className={`min-h-screen pb-24 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-slate-950 text-white' : 'bg-base-200 text-base-content'}`}>
        
        {/* Background glow accents */}
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-violet-500/10' : 'bg-violet-500/5'}`} />
        <div className={`absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-purple-500/10' : 'bg-purple-500/5'}`} />

        {/* Hero Banner Header */}
        <div className={`relative pt-20 md:pt-28 pb-16 border-b transition-colors duration-500 ${isDark ? 'border-neutral bg-slate-950/40' : 'border-base-300 bg-base-100'}`}>
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 text-center md:text-left">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex items-center gap-2 font-black uppercase text-xs tracking-[0.2em] px-4 py-2 rounded-full shadow-md border ${
                  isDark 
                    ? 'bg-violet-500/20 border-violet-500/30 text-violet-400' 
                    : 'bg-violet-50 border-violet-100 text-violet-600'
                }`}
              >
                <Tag size={14} className="fill-current text-violet-500 animate-pulse" /> Offres Spéciales
              </motion.div>
              <h1 className={`text-4xl md:text-7xl font-black tracking-tighter leading-none ${
                isDark 
                  ? 'bg-gradient-to-r from-white via-slate-100 to-violet-400 bg-clip-text text-transparent' 
                  : 'text-base-content'
              }`}>
                RÉDUCTIONS <span className="text-violet-500 font-black">DIRECTES</span>
              </h1>
              <p className={`font-medium text-sm md:text-lg max-w-xl ${isDark ? 'text-base-content/40' : 'text-base-content/70'}`}>
                Profitez de réductions immédiates appliquées sur une large sélection de produits de qualité. Pas de chichi, juste des prix bas garantis !
              </p>
            </div>

            {/* Quality badge */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`backdrop-blur-xl border px-8 py-6 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-1.5 shrink-0 ${
                isDark 
                  ? 'bg-neutral/60 border-violet-500/30 shadow-violet-950/20' 
                  : 'bg-base-100 border-violet-200 shadow-violet-100'
              }`}
            >
              <Tag size={28} className="text-violet-500 animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-base-content/50 mt-2">
                Économie Immédiate
              </span>
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">
                Meilleurs prix du Bénin
              </span>
            </motion.div>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 relative z-10">
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`p-4 rounded-[2rem] border ${isDark ? 'bg-neutral/30 border-slate-800' : 'bg-base-100 border-base-300 shadow-sm'}`}>
                  <ProductSkeleton />
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
                isDark ? 'bg-neutral border-slate-800 text-base-content/50' : 'bg-base-100 border-base-300 text-base-content/40 shadow-sm'
              }`}>
                <ShieldAlert size={40} />
              </div>
              <div className="space-y-2">
                <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-base-content/90'}`}>Aucune réduction active</h3>
                <p className={`font-medium text-sm ${isDark ? 'text-base-content/40' : 'text-base-content/50'}`}>
                  Aucun article en réduction directe n'est disponible pour l'instant. Revenez très bientôt pour faire de bonnes affaires !
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6"
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
                        ? 'bg-neutral/40 border-slate-850 hover:border-violet-500/40 shadow-xl shadow-black/20 hover:shadow-violet-950/10' 
                        : 'bg-base-100 border-base-300 hover:border-violet-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-2xl hover:shadow-violet-100'
                    }`}
                  >
                    <div>
                      {/* Product Image Panel */}
                      <div className={`relative aspect-square rounded-[1.8rem] overflow-hidden mb-5 flex items-center justify-center border transition-colors ${
                        isDark ? 'bg-slate-950/60 border-slate-850' : 'bg-base-200 border-base-200'
                      }`}>
                        {p.images && p.images[0] ? (
                          <img 
                            src={p.images[0].image_url} 
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <span className="text-base-content/40 text-xs font-bold">Pas d'image</span>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                          {discount && (
                            <span className="bg-violet-600 text-white font-black text-[10px] px-2.5 py-1.5 rounded-full shadow-lg">
                              -{discount}%
                            </span>
                          )}
                        </div>

                        {/* Action Overlays on hover */}
                        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 duration-300">
                          <button
                            onClick={() => navigate(`/promotions/produit/${p.id}?type=reduction`)}
                            className="w-10 h-10 rounded-full bg-base-100 text-base-content/90 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
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
                        <h3 className={`font-black text-sm md:text-base line-clamp-1 group-hover:text-violet-500 transition-colors ${isDark ? 'text-white' : 'text-base-content/90'}`}>
                          {p.name}
                        </h3>
                        
                        {/* Rating */}
                        {p.average_rating && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                            <Star size={10} fill="currentColor" /> {Number(p.average_rating).toFixed(1)}
                            <span className="text-base-content/40/60">•</span>
                            <span className="text-base-content/40">Offre</span>
                          </div>
                        )}

                        {/* Pricing */}
                        <div className="flex items-baseline gap-2 pt-1 flex-wrap">
                          <span className="font-mono text-base font-black text-violet-500 whitespace-nowrap">
                            {Number(p.price).toLocaleString()} F
                          </span>
                          {(Number(p.old_price || 0) > Number(p.price || 0)) && (
                            <span className="font-mono text-xs text-base-content/40 line-through font-bold whitespace-nowrap">
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
