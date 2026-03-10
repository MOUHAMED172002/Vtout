import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { ShoppingCart, Eye, Star, Zap } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { checkFavorite, addFavorite, removeFavorite } from "../../services/favoriteService";
import { motion, AnimatePresence } from "framer-motion";
import { getOptimizedImage } from "../../utils/cloudinaryHelper";
import toast from "react-hot-toast";


export default function ProductCard({ product, onFavoriteChange }) {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();
  const [imgs, setImgs] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Load product images
  useEffect(() => {
    if (product?.images && product.images.length > 0) {
      setImgs(product.images.map(img => getOptimizedImage(img.image_url, 600)));
    } else {
      const baseImg = product?.image_url || "/placeholder.png";
      setImgs([getOptimizedImage(baseImg, 600)]);
    }
  }, [product]);

  // Load favorite state
  useEffect(() => {
    const loadFav = async () => {
      if (!product?.id || !isSignedIn) return;
      try {
        const token = await getToken();
        const fav = await checkFavorite(product.id, token);
        setIsFavorite(fav);
      } catch (err) {
        console.error("loadFav err", err);
      }
    };
    loadFav();
  }, [product?.id, isSignedIn, getToken]);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      toast.error("Veuillez vous connecter pour gérer vos favoris.");
      navigate('/auth/connexion');
      return;
    }

    try {
      const next = !isFavorite;
      setIsFavorite(next);
      const token = await getToken();

      if (next) {
        await addFavorite(product.id, token);
        toast.success("Ajouté aux favoris !");
      } else {
        await removeFavorite(product.id, token);
        toast.success("Retiré des favoris.");
      }
    } catch (err) {
      console.error("toggle favorite err", err);
      setIsFavorite(s => !s);
      toast.error("Une erreur est survenue.");
    }
    if (onFavoriteChange) onFavoriteChange();
  };

  const formatPrice = (v) => {
    if (v == null) return "0";
    return Number(v).toLocaleString("fr-FR");
  };

  const isSaleActive = useMemo(() => {
    if (product?.is_flash_sale && product.flash_sale_end) {
      return new Date(product.flash_sale_end) > new Date();
    }
    // If not marked as flash sale, but has old_price, consider it active
    return product?.old_price > product?.price;
  }, [product]);

  const discount = product?.old_price && product.price && isSaleActive
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0;

  // ── Price Logic ──
  const currentPrice = isSaleActive ? product.price : (product.old_price || product.price);
  const showOldPrice = isSaleActive && product.old_price > product.price;

  // ── Deterministic Sales Count (Visual only) ──
  const salesCount = useMemo(() => {
    if (!product?.id) return 0;
    // Create a stable seed based on product ID characters
    const seed = String(product.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const base = 8;
    const varience = 43; // 8 to 51 range
    return base + (seed % varience);
  }, [product?.id]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -10 }}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50">
        <motion.img
          src={imgs[0]}
          alt={product.name}
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.7 }}
          className="w-full h-full object-cover"
        />

        {/* Glassmorphism Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-4">
          {discount > 0 && (
            <motion.span
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="backdrop-blur-md bg-red-500/80 text-slate-900 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-red-400/30"
            >
              -{discount}%
            </motion.span>
          )}
          {product.is_flash_sale && isSaleActive && (
            <motion.span
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="backdrop-blur-md bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-rose-200 border border-rose-400/30 flex items-center gap-1"
            >
              <Star size={8} fill="currentColor" /> Flash
            </motion.span>
          )}
        </div>

        {/* Favorite Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleFavorite}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 z-10 ${isFavorite
            ? 'bg-red-500 text-slate-900 shadow-lg shadow-red-200'
            : 'bg-white/60 text-gray-700 hover:bg-white hover:text-red-500 border border-white/40'
            }`}
        >
          {isFavorite ? <AiFillHeart className="w-5 h-5 shadow-sm" /> : <AiOutlineHeart className="w-5 h-5" />}
        </motion.button>

        {/* Quick Action Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/30 to-transparent flex gap-2 justify-center items-center"
            >
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="btn btn-circle btn-sm bg-white/90 border-none hover:bg-white text-gray-800 shadow-lg"
                  onClick={(e) => { e.preventDefault(); navigate(`/products/${product.id}`); }}
                >
                  <Eye size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="btn btn-sm bg-white/90 border-none hover:bg-white text-gray-800 shadow-lg font-bold rounded-2xl px-3 gap-1"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/checkout', {
                      state: {
                        items: [{
                          id: product.id,
                          product_id: product.id,
                          name: product.name,
                          price: currentPrice,
                          price_snapshot: currentPrice,
                          quantity: 1,
                          image_url: imgs[0],
                        }],
                        total: Number(currentPrice),
                      }
                    });
                  }}
                >
                  <Zap size={14} fill="currentColor" className="text-amber-500" /> Acheter
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Content Section */}
      <div className="p-4 space-y-2">
        {product.review_count > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-orange-400 font-bold uppercase tracking-widest">
            <Star size={10} fill="currentColor" /> {Number(product.average_rating).toFixed(1)} | <span className="text-gray-400">Certifié</span>
          </div>
        )}

        <Link to={`/products/${product.id}`} className="block">
          <h3 className="font-bold text-gray-800 text-sm md:text-base line-clamp-1 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-xl font-black text-gray-900">{formatPrice(currentPrice)} F</span>
          {showOldPrice && (
            <span className="text-sm text-gray-400 line-through decoration-red-400/50">{formatPrice(product.old_price)} F</span>
          )}
        </div>

        {/* Progress Bar (Sales Scarcity) */}
        <div className="pt-2">
          <div className="flex justify-between text-[10px] font-black text-gray-400 mb-1 uppercase tracking-tighter">
            <span className="flex items-center gap-1 text-orange-500">
              <Zap size={10} fill="currentColor" /> {salesCount} vendus
            </span>
            <span className="text-primary font-bold">Populaire</span>
          </div>
          <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((salesCount / 60) * 100, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
