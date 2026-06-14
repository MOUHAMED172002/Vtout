import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../lib/AuthHooks";
import { getUserFavorites, toggleFavorite } from "../../services/favoriteService";
import ProductCard from "../../component/Products/ProductsCard";
import toast from "react-hot-toast";
import { Heart, Trash2, ShoppingBag, ArrowLeft, Stars } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Favorites() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const data = await getUserFavorites(token);
      // Map wrapper objects [{product: {...}}] to product objects
      setFavoriteProducts(data?.map(f => f.product).filter(Boolean) || []);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger vos favoris");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const removeFavorite = async (productId) => {
    try {
      const token = await getToken();
      await toggleFavorite(productId, token);
      toast.success("Retiré des favoris");
      setFavoriteProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression");
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-rose-50 border-t-rose-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart className="text-rose-500 w-8 h-8 fill-rose-500" />
        </div>
      </div>
      <p className="text-xs font-black text-base-content/40 uppercase tracking-[0.3em] animate-pulse">Récupération de vos envies...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-rose-500 font-black uppercase text-[10px] tracking-[0.3em]">
            <Stars size={14} /> Wishlist
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-base-content tracking-tighter">Mes <span className="text-base-content/40">Favoris.</span></h1>
          <p className="text-base-content/50 font-bold max-w-lg leading-relaxed">Retrouvez tous les articles qui vous ont fait craquer et gérez votre liste de souhaits.</p>
        </div>

        <button
          onClick={() => navigate('/products-liste')}
          className="group flex items-center gap-3 px-8 py-4 bg-base-100 border border-base-200 rounded-2xl font-black text-xs uppercase tracking-widest text-base-content/70 hover:text-primary hover:border-primary/20 transition-all shadow-sm"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Retour shopping
        </button>
      </div>

      <AnimatePresence mode="wait">
        {favoriteProducts.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-base-100 rounded-[3rem] border border-base-200 p-24 text-center space-y-8 relative overflow-hidden"
          >
            {/* Decorative element */}
            <div className="absolute top-0 right-0 p-10 opacity-5 text-rose-500 rotate-12">
              <Heart size={200} fill="currentColor" />
            </div>

            <div className="w-24 h-24 bg-rose-50 text-rose-300 rounded-full flex items-center justify-center mx-auto shadow-inner relative z-10">
              <Heart size={40} className="group-hover:scale-110 transition-transform" />
            </div>
            <div className="space-y-3 relative z-10">
              <h3 className="text-2xl font-black text-base-content">Votre liste est vide</h3>
              <p className="text-base-content/40 font-bold max-w-sm mx-auto leading-relaxed">Naviguez sur le site et ajoutez des produits à vos favoris pour les retrouver plus tard.</p>
            </div>
            <button
              onClick={() => navigate('/products-liste')}
              className="btn btn-primary rounded-2xl px-12 h-16 font-black shadow-2xl shadow-primary/30 border-none relative z-10"
            >
              <ShoppingBag size={20} className="mr-2" /> Explorer le catalogue
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8"
          >
            <AnimatePresence>
              {favoriteProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                  whileHover={{ y: -10 }}
                  className="group relative"
                >
                  <ProductCard
                    product={product}
                    onFavoriteChange={() => removeFavorite(product.id)}
                  />

                  {/* Absolute remove button for quicker access on dashboard */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      removeFavorite(product.id);
                    }}
                    className="absolute top-4 right-4 w-12 h-12 bg-base-100/90 backdrop-blur-md rounded-2xl shadow-2xl flex items-center justify-center text-rose-500 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-rose-500 hover:text-white border border-rose-50"
                  >
                    <Trash2 size={20} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
