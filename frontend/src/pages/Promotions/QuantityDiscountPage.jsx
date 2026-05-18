import { useEffect, useState } from "react";
import Navbar from "../../component/Navbar/Navbar";
import Footer from "../../component/Footer/Footer";
import { getProducts } from "../../services/productService";
import { ProductSkeleton } from "../../component/Shared/Skeleton";
import { Percent, ShieldAlert, Sparkles, Plus, Minus, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "../../component/context/CartContext";

// Simple local mock of volume discounts if a product doesn't have it set in DB
const getProductVolumePricing = (product) => {
  if (product.volume_pricing) {
    try {
      return typeof product.volume_pricing === 'string' 
        ? JSON.parse(product.volume_pricing) 
        : product.volume_pricing;
    } catch (e) {}
  }
  // Default mock tiers for excellent demo purposes
  const base = parseFloat(product.price);
  return [
    { qty: 1, discount: 0, price: base },
    { qty: 3, discount: 10, price: base * 0.9 },
    { qty: 5, discount: 20, price: base * 0.8 }
  ];
};

export default function QuantityDiscountPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const { addToCart } = useCart() || {};

  useEffect(() => {
    const fetchVolumePricingProducts = async () => {
      try {
        setLoading(true);
        // Fetch products; let's fetch normal products and apply simulated volume prices for the showcase
        const data = await getProducts({ limit: 20 });
        const list = data.products || data || [];
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
      
      alert(`Ajouté au panier : ${qty}x ${product.name} au prix de ${Math.round(applicablePrice)} F CFA l'unité !`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-slate-50 min-h-screen pb-20">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Premium Header */}
        <div className="bg-white border-b border-slate-100 pt-16 md:pt-24 pb-12">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 font-black uppercase text-xs tracking-[0.2em] px-4 py-1.5 rounded-full shadow-sm">
                <Percent size={14} /> Offres de Gros
              </div>
              <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-none text-slate-900">
                REMISES DE <span className="text-blue-600">QUANTITÉ</span>
              </h1>
              <p className="text-slate-500 font-bold text-sm md:text-xl max-w-2xl">
                Plus votre panier grandit, plus les prix diminuent ! Profitez de réductions automatiques exclusives par paliers d'achat.
              </p>
            </div>

            <div className="bg-blue-600 text-white rounded-3xl p-6 md:p-8 shadow-xl shadow-blue-600/10 max-w-sm shrink-0 flex items-center gap-4 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                %
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-wider">Économie Maximale</h4>
                <p className="text-xs text-blue-100 font-bold mt-0.5">La réduction s'applique automatiquement lors de l'ajout au panier.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Simulator Grid */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16">
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                  <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
                  <div className="h-6 bg-slate-100 rounded w-2/3 animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 flex flex-col items-center text-center space-y-6 max-w-md mx-auto">
              <div className="w-20 h-20 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-400">
                <ShieldAlert size={36} />
              </div>
              <h3 className="text-2xl font-black text-slate-800">Aucun produit éligible</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((p) => {
                const tiers = getProductVolumePricing(p);
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
                    className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col justify-between relative group"
                  >
                    
                    {/* Visual Card Top */}
                    <div>
                      {/* Product Image & Main Info */}
                      <div className="relative h-64 bg-slate-50 rounded-2xl overflow-hidden mb-6 flex items-center justify-center border border-slate-100">
                        {p.images && p.images[0] ? (
                          <img 
                            src={p.images[0].image_url} 
                            alt={p.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <span className="text-slate-300 font-bold">Image non disponible</span>
                        )}
                        
                        {/* Dynamic Active Discount Sticker */}
                        {matchedTier && matchedTier.discount > 0 && (
                          <span className="absolute top-4 left-4 bg-blue-600 text-white font-black text-xs uppercase px-3 py-1.5 rounded-full shadow-lg animate-bounce">
                            -{matchedTier.discount}% de remise !
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {p.boutique?.name || "Boutique Partenaire"}
                      </p>

                      {/* Tiers display */}
                      <div className="my-6 space-y-2 border-y border-slate-100 py-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">Paliers de réduction :</span>
                        <div className="grid grid-cols-3 gap-2">
                          {tiers.map((t) => {
                            const isActive = selectedQty >= t.qty && (!nextTier || t.qty < nextTier.qty);
                            return (
                              <div 
                                key={t.qty}
                                className={`rounded-xl p-2.5 text-center transition-all ${
                                  isActive 
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                                    : 'bg-slate-50 text-slate-600 border border-slate-100'
                                }`}
                              >
                                <span className="block font-black text-sm">{t.qty}x+</span>
                                <span className={`block text-[10px] font-bold ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                                  {t.discount > 0 ? `-${t.discount}%` : 'Prix normal'}
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
                      <div className="flex justify-between items-end bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Prix Unitaire</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-xl font-black text-slate-900">
                              {Math.round(activePrice)} F
                            </span>
                            {matchedTier && matchedTier.discount > 0 && (
                              <span className="font-mono text-xs font-bold text-slate-400 line-through">
                                {Math.round(basePrice)} F
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Total Estimé</span>
                          <span className="font-mono text-2xl font-black text-blue-600 block mt-0.5">
                            {Math.round(activePrice * selectedQty)} F
                          </span>
                        </div>
                      </div>

                      {/* Goal indicator */}
                      {nextTier && (
                        <p className="text-[10px] font-black text-slate-400 text-center uppercase tracking-wider">
                          Ajoutez <span className="text-blue-600">{nextTier.qty - selectedQty}</span> de plus pour débloquer <span className="text-blue-600">-{nextTier.discount}%</span> !
                        </p>
                      )}

                      {/* Action tools */}
                      <div className="flex gap-3">
                        <div className="flex items-center bg-slate-100 rounded-xl px-2">
                          <button 
                            onClick={() => handleQtyChange(p.id, 'dec')}
                            className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-mono font-black text-slate-900">{selectedQty}</span>
                          <button 
                            onClick={() => handleQtyChange(p.id, 'inc', p.stock)}
                            className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button 
                          onClick={() => handleAddToCart(p)}
                          className="flex-1 bg-slate-900 hover:bg-blue-600 text-white rounded-xl py-3 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all duration-300"
                        >
                          <ShoppingBag size={14} /> Ajouter au panier
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
