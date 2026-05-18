import { useEffect, useState } from "react";
import Navbar from "../../component/Navbar/Navbar";
import Footer from "../../component/Footer/Footer";
import { getProducts } from "../../services/productService";
import { ProductSkeleton } from "../../component/Shared/Skeleton";
import { Package, ShieldAlert, Plus, Sparkles, CheckCircle2, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "../../component/context/CartContext";

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

  useEffect(() => {
    const fetchKits = async () => {
      try {
        setLoading(true);
        // Fetch products to construct high-fidelity combo kits
        const data = await getProducts({ limit: 12 });
        const list = data.products || data || [];
        const builtKits = createMockKits(list);
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
      // Add each item in the kit to the cart with the discounted price apportioned
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
      alert(`Félicitations ! Les articles du "${kit.name}" ont été ajoutés à votre panier avec une réduction spéciale !`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-slate-50 min-h-screen pb-20">
        
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Premium Banner */}
        <div className="bg-white border-b border-slate-100 pt-16 md:pt-24 pb-12">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 border border-emerald-100 font-black uppercase text-xs tracking-[0.2em] px-4 py-1.5 rounded-full shadow-sm">
                <Package size={14} /> Lots Prêts
              </div>
              <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-none text-slate-900">
                PACKS & <span className="text-emerald-600">KITS</span>
              </h1>
              <p className="text-slate-500 font-bold text-sm md:text-xl max-w-2xl">
                Achetez des ensembles intelligents de produits complémentaires et profitez de réductions incroyables par rapport aux achats séparés !
              </p>
            </div>

            <div className="bg-emerald-600 text-white rounded-3xl p-6 md:p-8 shadow-xl shadow-emerald-600/10 max-w-sm shrink-0 flex items-center gap-4 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white">
                <Package size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-wider">Un Seul Clic</h4>
                <p className="text-xs text-emerald-100 font-bold mt-0.5">Tous les articles du kit sont ajoutés automatiquement à votre panier.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Kits Display Grid */}
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-16 space-y-16">
          
          {loading ? (
            <div className="space-y-12">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 animate-pulse space-y-6">
                  <div className="h-8 bg-slate-100 rounded w-1/3" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="h-48 bg-slate-100 rounded-2xl" />
                    <div className="h-48 bg-slate-100 rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : kits.length === 0 ? (
            <div className="py-24 flex flex-col items-center text-center space-y-6 max-w-md mx-auto">
              <div className="w-20 h-20 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-400">
                <ShieldAlert size={36} />
              </div>
              <h3 className="text-2xl font-black text-slate-800">Aucun pack disponible</h3>
            </div>
          ) : (
            <div className="space-y-12">
              {kits.map((kit) => (
                <motion.div
                  key={kit.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 p-6 md:p-10 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                >
                  
                  {/* Promo Badge */}
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white font-black text-xs uppercase px-6 py-2.5 rounded-bl-[1.5rem] shadow-md flex items-center gap-1.5 z-20">
                    <Sparkles size={12} /> {kit.tag}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    {/* Left: Info */}
                    <div className="lg:col-span-4 space-y-4 text-center lg:text-left">
                      <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
                        {kit.name}
                      </h3>
                      <p className="text-slate-500 text-sm font-bold">
                        {kit.description}
                      </p>
                      
                      {/* Price Section */}
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 inline-block w-full lg:w-auto">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Prix Spécial du Kit</span>
                          <span className="font-mono text-3xl font-black text-emerald-600">
                            {Math.round(kit.kitPrice)} F
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-400 line-through">
                            Au lieu de {Math.round(kit.originalPrice)} F
                          </span>
                          <span className="inline-block mt-2 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-lg text-center">
                            {kit.discountBadge}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBuyKit(kit)}
                        className="w-full bg-slate-900 hover:bg-emerald-600 text-white rounded-2xl py-4 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all duration-300 mt-4"
                      >
                        <ShoppingBag size={16} /> Acheter le Kit Complet
                      </button>
                    </div>

                    {/* Right: Products linked together */}
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch relative">
                      
                      {/* Plus Connector for Desktop */}
                      <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-slate-100 rounded-full items-center justify-center border border-slate-200 z-10 text-slate-500 shadow-md">
                        <Plus size={20} className="stroke-[2.5]" />
                      </div>

                      {kit.items.map((item, idx) => (
                        <div 
                          key={`${item.id}-${idx}`}
                          className="bg-slate-50 rounded-[2rem] border border-slate-100 p-5 flex flex-col justify-between hover:bg-slate-100/50 transition-all duration-300 relative group"
                        >
                          <div className="relative h-44 bg-white rounded-xl overflow-hidden mb-4 flex items-center justify-center border border-slate-100 shadow-sm">
                            {item.images && item.images[0] ? (
                              <img 
                                src={item.images[0].image_url} 
                                alt={item.name}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <span className="text-slate-300 font-bold">Image</span>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            <h4 className="font-black text-slate-800 tracking-tight text-sm md:text-base leading-tight group-hover:text-emerald-600 transition-colors">
                              {item.name}
                            </h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {item.boutique?.name || "Boutique"}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-slate-700">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Inclus dans le pack</span>
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
