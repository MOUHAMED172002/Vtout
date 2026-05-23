import { useEffect, useState } from "react";
import Navbar from "../../component/Navbar/Navbar";
import Footer from "../../component/Footer/Footer";
import { getProducts } from "../../services/productService";
import { ProductSkeleton } from "../../component/Shared/Skeleton";
import { Package, ShieldAlert, Plus, Sparkles, CheckCircle, ShoppingBag, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "../../component/context/CartContext";
import { useTheme } from "../../component/context/ThemeContext";
import toast from "react-hot-toast";

// Simulated high-fidelity bundle kits built out of actual product listings
const createMockKits = (products) => {
  if (products.length < 2) return [];
  
  return [
    {
      id: "kit-1",
      name: "Pack Gaming Setup Ultime",
      description: "Le combo ultime complet pour booster vos performances. Contient le clavier mécanique gaming retroéclairé et le casque audio surround basse dynamique.",
      tag: "Populaire",
      discountBadge: "Économie de 8,000 F",
      items: [products[0], products[1] || products[0]],
      originalPrice: parseFloat(products[0]?.price || 0) + parseFloat((products[1] || products[0])?.price || 0),
      kitPrice: Math.round((parseFloat(products[0]?.price || 0) + parseFloat((products[1] || products[0])?.price || 0)) * 0.82), // 18% off
    },
    {
      id: "kit-2",
      name: "Pack Nomade & Mobile",
      description: "Restez connecté et performant partout où vous allez. Combinaison parfaite entre la montre connectée haute définition et les écouteurs sans fil bluetooth.",
      tag: "Meilleure Offre",
      discountBadge: "Économie de 5,500 F",
      items: [products[2] || products[0], products[3] || products[0]],
      originalPrice: parseFloat((products[2] || products[0])?.price || 0) + parseFloat((products[3] || products[0])?.price || 0),
      kitPrice: Math.round((parseFloat((products[2] || products[0])?.price || 0) + parseFloat((products[3] || products[0])?.price || 0)) * 0.85), // 15% off
    }
  ];
};

export default function KitsPage() {
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart() || {};
  const { theme } = useTheme();

  const darkThemes = ["dark", "synthwave", "cyberpunk", "luxury", "dracula"];
  const isDark = darkThemes.includes(theme);

  useEffect(() => {
    const fetchKits = async () => {
      try {
        setLoading(true);
        // 1. Fetch real kit products from database
        const realKitsData = await getProducts({ isKit: 'true', limit: 20 });
        const realKitProducts = realKitsData.products || realKitsData || [];
        
        // 2. Fetch all products to resolve items or to build fallback mock kits
        const allProductsData = await getProducts({ limit: 40 });
        const allProducts = allProductsData.products || allProductsData || [];
        
        let builtKits = [];
        
        if (realKitProducts.length > 0) {
          // Parse and build real kits
          builtKits = realKitProducts.map(p => {
            let itemIds = [];
            if (p.kit_items) {
              try {
                itemIds = typeof p.kit_items === 'string' ? JSON.parse(p.kit_items) : p.kit_items;
              } catch (e) {}
            }
            
            // Find the actual product objects matching the itemIds
            const resolvedItems = Array.isArray(itemIds) 
              ? itemIds.map(id => allProducts.find(item => item.id === id)).filter(Boolean)
              : [];
              
            // If we couldn't resolve any items, gracefully fallback to some random products
            const items = resolvedItems.length > 0 
              ? resolvedItems 
              : allProducts.slice(0, 2);
              
            const originalPrice = items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
            
            return {
              id: p.id,
              name: p.name,
              description: p.description || "Un ensemble d'articles soigneusement sélectionnés par le vendeur pour une expérience ultime à prix réduit.",
              tag: "Offre Vendeur",
              discountBadge: p.old_price && p.price ? `Économie de ${Math.round(p.old_price - p.price)} F` : "Lot Économique",
              items: items,
              originalPrice: originalPrice || parseFloat(p.old_price || p.price),
              kitPrice: parseFloat(p.price),
              isReal: true,
              productObj: p
            };
          });
        }
        
        // If no real kits in database, keep empty
        if (builtKits.length === 0) {
          builtKits = [];
        }
        
        setKits(builtKits);
      } catch (err) {
        console.error("Erreur chargement Kits:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchKits();
  }, []);
  
  const handleBuyKit = (kit) => {
    if (addToCart) {
      if (kit.isReal) {
        // Add the kit product itself to the cart
        addToCart(kit.productObj, 1);
        toast.success(`Félicitations ! Le pack "${kit.name}" a été ajouté à votre panier avec une réduction spéciale !`);
      } else {
        // Fallback for simulated kits
        const ratio = kit.kitPrice / kit.originalPrice;
        kit.items.forEach(item => {
          const itemDiscountedPrice = Math.round(parseFloat(item.price) * ratio);
          addToCart({
            ...item,
            price: itemDiscountedPrice,
            original_base_price: item.price,
            name: `${item.name} (Dans le ${kit.name})`
          }, 1);
        });
        toast.success(`Félicitations ! Les articles du "${kit.name}" ont été ajoutés à votre panier avec une réduction spéciale !`);
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className={`min-h-screen pb-24 relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
        
        {/* Glow Effects */}
        <div className={`absolute top-0 left-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-500/5'}`} />

        {/* Premium Banner */}
        <div className={`relative pt-20 md:pt-28 pb-16 border-b transition-colors duration-500 ${isDark ? 'border-slate-900 bg-slate-950/40' : 'border-slate-200 bg-white'}`}>
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8 z-10 relative">
            <div className="space-y-4 text-center md:text-left">
              <div className={`inline-flex items-center gap-2 font-black uppercase text-xs tracking-[0.2em] px-4 py-2 rounded-full shadow-sm border ${
                isDark 
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-450' 
                  : 'bg-emerald-50 border-emerald-105 text-emerald-600'
              }`}>
                <Package size={14} className="text-emerald-500" /> Lots Prêts
              </div>
              <h1 className={`text-4xl md:text-7xl font-black tracking-tighter leading-none ${
                isDark 
                  ? 'bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent' 
                  : 'text-slate-900'
              }`}>
                PACKS & <span className="text-emerald-600">KITS</span>
              </h1>
              <p className={`font-medium text-sm md:text-lg max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-650'}`}>
                Achetez des ensembles intelligents de produits complémentaires et profitez de réductions incroyables par rapport aux achats séparés !
              </p>
            </div>

            <div className={`rounded-3xl p-6 md:p-8 shadow-2xl max-w-sm shrink-0 flex items-center gap-4 border transition-colors ${
              isDark 
                ? 'bg-slate-900/60 border-emerald-500/30 shadow-emerald-950/10' 
                : 'bg-white border-emerald-100 shadow-emerald-100'
            }`}>
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                <Package size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h4 className={`font-black text-sm uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-800'}`}>Un Seul Clic</h4>
                <p className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tous les articles du kit sont ajoutés automatiquement à votre panier.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Kits Display Grid */}
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-16 space-y-16">
          
          {loading ? (
            <div className="space-y-12">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className={`p-8 rounded-[2.5rem] border animate-pulse space-y-6 ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-150 shadow-sm'}`}>
                  <div className={`h-8 rounded w-1/3 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className={`h-48 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                    <div className={`h-48 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : kits.length === 0 ? (
            <div className="py-24 flex flex-col items-center text-center space-y-6 max-w-md mx-auto">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400 shadow-sm'
              }`}>
                <ShieldAlert size={40} />
              </div>
              <div className="space-y-2">
                <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Aucun pack disponible</h3>
                <p className={`font-medium text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Aucun kit promotionnel n'est configuré en boutique pour le moment.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              {kits.map((kit) => (
                <motion.div
                  key={kit.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-[2.5rem] p-6 md:p-10 border transition-all duration-350 relative overflow-hidden ${
                    isDark 
                      ? 'bg-slate-900/45 border-slate-850 hover:border-emerald-500/30 shadow-xl shadow-black/25' 
                      : 'bg-white border-slate-200 hover:border-emerald-300 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-2xl hover:shadow-emerald-100/30'
                  }`}
                >
                  
                  {/* Promo Badge */}
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white font-black text-xs uppercase px-6 py-2.5 rounded-bl-[1.5rem] shadow-md flex items-center gap-1.5 z-20">
                    <Sparkles size={12} /> {kit.tag}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    {/* Left: Info */}
                    <div className="lg:col-span-5 space-y-4 text-center lg:text-left">
                      <h3 className={`text-2xl md:text-3xl font-black tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {kit.name}
                      </h3>
                      <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {kit.description}
                      </p>
                      
                      {/* Price Section */}
                      <div className={`p-6 rounded-2xl border inline-block w-full transition-colors ${
                        isDark ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-50 border-slate-100'
                      }`}>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Prix Spécial du Kit</span>
                          <span className="font-mono text-3xl font-black text-emerald-550">
                            {Math.round(kit.kitPrice).toLocaleString()} F
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-400 line-through">
                            Au lieu de {Math.round(kit.originalPrice).toLocaleString()} F
                          </span>
                          <span className="text-sm font-black text-emerald-700 mt-2">Économie: {Math.max(0, Math.round(kit.originalPrice - kit.kitPrice)).toLocaleString()} F</span>
                          <span className="inline-block mt-2 bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg text-center">
                            {kit.discountBadge}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBuyKit(kit)}
                        className="w-full bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl py-4 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all duration-300 mt-4 active:scale-[0.98]"
                      >
                        <ShoppingBag size={16} /> Acheter le Pack
                      </button>
                    </div>

                    {/* Right: Products linked together */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch relative mt-6 lg:mt-0">
                      
                      {/* Plus Connector for Desktop */}
                      <div className={`hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center border z-10 shadow-md ${
                        isDark ? 'bg-slate-950 border-slate-850 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}>
                        <Plus size={20} className="stroke-[2.5]" />
                      </div>

                      {kit.items.map((item, idx) => (
                        <div 
                          key={`${item.id}-${idx}`}
                          className={`rounded-[2rem] p-5 flex flex-col justify-between border transition-all duration-300 relative group ${
                            isDark 
                              ? 'bg-slate-950/40 border-slate-850 hover:bg-slate-900/40' 
                              : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'
                          }`}
                        >
                          <div className={`relative h-44 rounded-xl overflow-hidden mb-4 flex items-center justify-center border shadow-sm ${
                            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-150'
                          }`}>
                            {item.images && item.images[0] ? (
                              <img 
                                src={item.images[0].image_url} 
                                alt={item.name}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <span className="text-slate-400 text-xs font-bold">Image</span>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            <h4 className={`font-black tracking-tight text-sm leading-tight transition-colors group-hover:text-emerald-500 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                              {item.name}
                            </h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {item.boutique?.name || "Boutique"}
                            </p>
                          </div>

                          <div className={`flex items-center gap-2 mt-4 pt-3 border-t text-slate-700 ${isDark ? 'border-slate-850' : 'border-slate-100'}`}>
                            <CheckCircle className="text-emerald-500" size={14} />
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-450">Inclus dans le pack</span>
                          </div>
                        </div>
                      ))}

                    </div>

                  </div>

                </motion.div>
              ))}
            </div>
          )}

        </div>
      </div>
      <Footer />
    </>
  );
}
