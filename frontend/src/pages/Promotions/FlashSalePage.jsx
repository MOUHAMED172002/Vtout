import { useEffect, useState } from "react";
import Navbar from "../../component/Navbar/Navbar";
import Footer from "../../component/Footer/Footer";
import { getProducts } from "../../services/productService";
import ProductsCard from "../../component/Products/ProductsCard";
import { ProductSkeleton } from "../../component/Shared/Skeleton";
import { Flame, Clock, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FlashSalePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(21600); // 6 hours initial countdown

  // Tick timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 21600));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}h : ${mins.toString().padStart(2, '0')}m : ${secs.toString().padStart(2, '0')}s`;
  };

  return (
    <>
      <Navbar />
      <div className="bg-slate-900 min-h-screen text-slate-100 pb-20 relative overflow-hidden">
        
        {/* Background glow accents */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-3xl" />

        {/* Hero Banner Header */}
        <div className="relative pt-16 md:pt-24 pb-12 border-b border-slate-800">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-rose-500/20 border border-rose-500/30 text-rose-400 font-black uppercase text-xs tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                <Flame size={14} className="fill-rose-400 animate-pulse" /> Offres Instantanées
              </div>
              <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-none bg-gradient-to-r from-white via-slate-100 to-rose-400 bg-clip-text text-transparent">
                VENTES <span className="text-rose-500 font-extrabold">FLASH</span>
              </h1>
              <p className="text-slate-400 font-bold text-sm md:text-xl max-w-xl">
                Des baisses de prix massives offertes par nos vendeurs sur une durée très limitée. Faites vite !
              </p>
            </div>

            {/* Premium Countdown Clock */}
            <div className="bg-slate-950/80 backdrop-blur-xl border-2 border-rose-500/30 px-8 py-6 rounded-[2rem] shadow-2xl flex flex-col items-center gap-2 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-1.5">
                <Clock size={12} className="text-rose-500 animate-spin" style={{ animationDuration: '3s' }} /> Temps Restant
              </span>
              <span className="font-mono text-2xl md:text-4xl font-black text-rose-500 tracking-wider drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mt-1 animate-pulse">
                Expédition en 24h
              </span>
            </div>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 relative z-10">
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-slate-800/40 p-4 rounded-[2rem] border border-slate-700/30">
                  <ProductSkeleton dark />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 flex flex-col items-center text-center space-y-6 max-w-md mx-auto">
              <div className="w-20 h-20 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-500">
                <ShieldAlert size={36} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">Aucune vente flash active</h3>
                <p className="text-slate-400 font-bold text-sm">
                  Toutes les offres flash en cours ont été épuisées. Revenez très bientôt pour la prochaine vague !
                </p>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8"
            >
              {products.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-slate-800/40 hover:bg-slate-800/80 p-3 md:p-4 rounded-[2rem] border border-slate-700/20 hover:border-rose-500/30 transition-all duration-300 relative group shadow-lg hover:shadow-rose-500/5 flex flex-col justify-between"
                >
                  {/* Top Badges */}
                  <div className="absolute top-6 left-6 z-20 flex flex-col gap-1.5">
                    <span className="bg-rose-500 text-white font-black text-[9px] md:text-xs uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <Flame size={12} className="fill-white animate-bounce" /> VITE !
                    </span>
                    {p.old_price && p.price && (
                      <span className="bg-slate-900/90 text-rose-400 border border-rose-500/20 font-black text-[9px] md:text-xs px-2.5 py-1 rounded-full shadow-md">
                        -{Math.round(((p.old_price - p.price) / p.old_price) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Standard ProductsCard but styled or wrapped beautifully */}
                  <div className="bg-slate-900/50 rounded-2xl overflow-hidden p-2 relative">
                    <ProductsCard product={p} dark />
                  </div>

                  {/* Flash Sale progress simulation */}
                  <div className="mt-4 space-y-1.5 px-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <span>Déjà vendu</span>
                      <span className="text-rose-400">{Math.round((p.stock % 7) * 12 + 28)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full"
                        style={{ width: `${Math.round((p.stock % 7) * 12 + 28)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-rose-400/80 font-black italic mt-1 uppercase tracking-widest text-center">
                      Plus que {Math.max(1, p.stock % 5 + 2)} articles en stock !
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}
