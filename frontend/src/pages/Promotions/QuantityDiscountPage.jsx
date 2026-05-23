import { useEffect, useState } from "react";
import Navbar from "../../component/Navbar/Navbar";
import Footer from "../../component/Footer/Footer";
import { getProducts } from "../../services/productService";
import { ProductSkeleton } from "../../component/Shared/Skeleton";
import { Percent, ShieldAlert, Sparkles, Plus, Minus, ShoppingBag, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "../../component/context/CartContext";
import { useTheme } from "../../component/context/ThemeContext";
import toast from "react-hot-toast";

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
  const [quantities, setQuantities] = useState({});
  const { addToCart } = useCart() || {};
  const { theme } = useTheme();

  const darkThemes = ["dark", "synthwave", "cyberpunk", "luxury", "dracula"];
  const isDark = darkThemes.includes(theme);

  useEffect(() => {
    const fetchVolumePricingProducts = async () => {
      try {
        setLoading(true);
        let data = await getProducts({ hasVolumePricing: 'true', limit: 30 });
        let list = data.products || data || [];
        setProducts(list);
        
        // Initial quantity = 1 for all products
        const initQty = {};
        list.forEach(p => { initQty[p.id] = 1; });
        setQuantities(initQty);
      } catch (err) {
        console.error("Erreur chargement Prix Quantité:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVolumePricingProducts();
  }, []);

  const handleQtyChange = (productId, type, maxStock) => {
    setQuantities(prev => {
      const current = prev[productId] || 1;
      let next = current;
      if (type === 'inc') next = Math.min(maxStock || 99, current + 1);
      if (type === 'dec') next = Math.max(1, current - 1);
      return { ...prev, [productId]: next };
    });
  };

  const handleAddToCart = (product) => {
    if (addToCart) {
      const qty = quantities[product.id] || 1;
      const tiers = getProductVolumePricing(product);
      // Determine applicable price based on quantity
      let applicablePrice = parseFloat(product.price);
      const sortedTiers = [...tiers].sort((a, b) => b.qty - a.qty);
      const matchedTier = sortedTiers.find(t => qty >= t.qty);
      if (matchedTier) {
        applicablePrice = matchedTier.price || (parseFloat(product.price) * (1 - matchedTier.discount / 100));
      }
      
      addToCart({
        ...product,
        price: applicablePrice,
        original_base_price: product.price,
      }, qty);
      
      toast.success(`Ajouté au panier : ${qty}x ${product.name} au prix de ${Math.round(applicablePrice)} F CFA l'unité !`);
    }
  };

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

        {/* Product Simulator Grid */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16">
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`p-6 rounded-[2.5rem] border space-y-4 ${isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className={`h-64 rounded-2xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                  <div className={`h-6 rounded w-2/3 animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                  <div className={`h-4 rounded w-1/2 animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 flex flex-col items-center text-center space-y-6 max-w-md mx-auto">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400 shadow-sm'
              }`}>
                <ShieldAlert size={40} />
              </div>
              <div className="space-y-2">
                <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Aucune remise de quantité active</h3>
                <p className={`font-medium text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Revenez bientôt ! Nos vendeurs travaillent sur de nouveaux tarifs dégressifs.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((p) => {
                const tiers = getProductVolumePricing(p);
                if (tiers.length === 0) return null;
                const selectedQty = quantities[p.id] || 1;
                
                // Determine active price and next tier goal
                const sortedTiers = [...tiers].sort((a, b) => b.qty - a.qty);
                const matchedTier = sortedTiers.find(t => selectedQty >= t.qty);
                const basePrice = parseFloat(p.price);
                const activePrice = matchedTier 
                  ? (matchedTier.price || (basePrice * (1 - matchedTier.discount / 100))) 
                  : basePrice;
                
                const nextTier = [...tiers].sort((a, b) => a.qty - b.qty).find(t => t.qty > selectedQty);

                return (
                  <motion.div
                    key={p.id}
                    layout
                    className={`rounded-[2.5rem] p-6 border transition-all duration-300 flex flex-col justify-between relative group ${
                      isDark 
                        ? 'bg-slate-900/40 border-slate-850 hover:border-blue-500/40 shadow-xl shadow-black/20 hover:shadow-blue-950/10' 
                        : 'bg-white border-slate-200 hover:border-blue-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-2xl'
                    }`}
                  >
                    
                    {/* Visual Card Top */}
                    <div>
                      {/* Product Image & Main Info */}
                      <div className={`relative h-64 rounded-2xl overflow-hidden mb-6 flex items-center justify-center border transition-colors ${
                        isDark ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-50 border-slate-100'
                      }`}>
                        {p.images && p.images[0] ? (
                          <img 
                            src={p.images[0].image_url} 
                            alt={p.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <span className="text-slate-400 text-xs font-bold">Image non disponible</span>
                        )}
                        
                        {/* Dynamic Active Discount Sticker */}
                        {matchedTier && matchedTier.discount > 0 && (
                          <span className="absolute top-4 left-4 bg-blue-600 text-white font-black text-[10px] uppercase px-3.5 py-1.5 rounded-full shadow-lg animate-bounce">
                            -{matchedTier.discount}% de remise débloquée !
                          </span>
                        )}
                      </div>

                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest block mb-1">
                        {p.boutique?.name || "Boutique Partenaire"}
                      </span>
                      <h3 className={`text-base md:text-lg font-black tracking-tight leading-tight group-hover:text-blue-500 transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {p.name}
                      </h3>

                      {/* Tiers display */}
                      <div className={`my-6 space-y-2 border-y py-4 transition-colors ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <span className={`text-[10px] font-black uppercase tracking-wider block mb-2 ${isDark ? 'text-slate-500' : 'text-slate-450'}`}>
                          Paliers de réduction configurés :
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {tiers.map((t) => {
                            const isActive = selectedQty >= t.qty && (!nextTier || t.qty < nextTier.qty);
                            return (
                              <div 
                                key={t.qty}
                                className={`rounded-xl p-2.5 text-center transition-all duration-300 ${
                                  isActive 
                                    ? 'bg-blue-650 text-white shadow-md shadow-blue-500/20' 
                                    : isDark 
                                      ? 'bg-slate-950 text-slate-400 border border-slate-850'
                                      : 'bg-slate-50 text-slate-600 border border-slate-100'
                                }`}
                              >
                                <span className="block font-black text-xs">{t.qty}x+</span>
                                <span className={`block text-[9px] font-bold uppercase tracking-wider mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                                  {t.discount > 0 ? `-${t.discount}%` : 'Normal'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Quantity Simulator Bottom */}
                    <div className="space-y-4">
                      
                      {/* Price simulator display */}
                      <div className={`flex justify-between items-end p-4 rounded-2xl border transition-colors ${
                        isDark ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-50 border-slate-100'
                      }`}>
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Prix Unitaire</span>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className={`font-mono text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {Math.round(activePrice).toLocaleString()} F
                            </span>
                            {matchedTier && matchedTier.discount > 0 && (
                              <span className="font-mono text-[10px] font-bold text-slate-400 line-through">
                                {Math.round(basePrice).toLocaleString()} F
                              </span>
                            )}
                          </div>
                          {matchedTier && (Math.round(basePrice - activePrice) > 0) && (
                            <div className="text-[10px] text-slate-500 mt-2">
                              <span className="font-black">Économie unitaire :</span> {(Math.round(basePrice - activePrice)).toLocaleString()} F
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Total Estimé</span>
                          <span className="font-mono text-xl md:text-2xl font-black text-blue-600 block mt-0.5">
                            {Math.round(activePrice * selectedQty).toLocaleString()} F
                          </span>
                          {matchedTier && (Math.round((basePrice - activePrice) * selectedQty) > 0) && (
                            <div className="text-[10px] text-slate-500 mt-1">
                              <span className="font-black">Économie totale :</span> {(Math.round((basePrice - activePrice) * selectedQty)).toLocaleString()} F
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Goal indicator */}
                      {nextTier ? (
                        <div className={`flex items-center gap-1.5 justify-center py-1.5 px-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider ${
                          isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'
                        }`}>
                          <Info size={12} />
                          <span>
                            Ajoutez <span className="font-black text-blue-500">{nextTier.qty - selectedQty}</span> pour obtenir <span className="font-black text-blue-500">-{nextTier.discount}%</span> !
                          </span>
                        </div>
                      ) : (
                        <div className={`flex items-center gap-1.5 justify-center py-1.5 px-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider ${
                          isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        }`}>
                          <span>🎉 Réduction maximale débloquée !</span>
                        </div>
                      )}

                      {/* Action tools */}
                      <div className="flex gap-3">
                        <div className={`flex items-center rounded-xl px-2 ${isDark ? 'bg-slate-950 border border-slate-850' : 'bg-slate-100'}`}>
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQtyChange(p.id, 'dec'); }}
                            className={`w-9 h-9 flex items-center justify-center transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                          >
                            <Minus size={14} />
                          </button>
                          <span className={`w-8 text-center font-mono font-black text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedQty}</span>
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQtyChange(p.id, 'inc', p.stock); }}
                            className={`w-9 h-9 flex items-center justify-center transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button 
                          type="button"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(p); }}
                          className="flex-1 bg-slate-900 hover:bg-blue-600 text-white rounded-xl py-3 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all duration-300 active:scale-95"
                        >
                          <ShoppingBag size={14} /> Ajouter
                        </button>
                      </div>

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
