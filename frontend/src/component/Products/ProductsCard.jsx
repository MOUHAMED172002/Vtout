import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { ShoppingCart, Eye, Star, Zap } from "lucide-react";
import { useAuth, useUser } from "../../lib/clerk-shim";
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

  // ── Price Logic ──
  const getProductDisplayPrice = () => {
    const bPrice = Number(product?.price) > 0 ? Number(product?.price) : Number(product?.supplier_price || 0);
    const bOldPrice = Number(product?.old_price || 0);

    // Check first variant if base price is 0
    const firstVariantPrice = product?.variants?.[0]?.priceRows?.[0];
    const vPrice = firstVariantPrice ? (Number(firstVariantPrice.price) > 0 ? Number(firstVariantPrice.price) : Number(product?.supplier_price || 0)) : 0;
    const vOldPrice = firstVariantPrice ? Number(firstVariantPrice.old_price) : 0;

    const finalCurrent = bPrice > 0 ? bPrice : vPrice;
    const finalOld = bOldPrice > 0 ? bOldPrice : vOldPrice;

    return {
      currentPrice: finalCurrent,
      oldPrice: finalOld,
      isSale: finalOld > finalCurrent && finalCurrent > 0,
      discountPercent: (finalOld > finalCurrent && finalCurrent > 0)
        ? Math.round(((finalOld - finalCurrent) / finalOld) * 100)
        : 0
    };
  };

  const { currentPrice, oldPrice, isSale: isSaleActive, discountPercent: finalDiscount } = useMemo(() => getProductDisplayPrice(), [product]);
  const showOldPrice = isSaleActive;

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
      whileHover={{ y: -8 }}
      className="group relative bg-base-100 rounded-[2rem] overflow-hidden border border-base-content/5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] transition-all duration-700"
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
          {finalDiscount > 0 && (
            <motion.span
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="backdrop-blur-xl bg-orange-600/90 text-white text-[10px] font-black px-3 py-1 rounded-xl uppercase tracking-tighter shadow-xl shadow-orange-500/20 border border-white/20"
            >
              -{finalDiscount}%
            </motion.span>
          )}

        </div>

        {/* Favorite Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleFavorite}
          className={`absolute top-3 right-3 p-2.5 rounded-2xl backdrop-blur-xl transition-all duration-500 z-10 ${isFavorite
            ? "bg-rose-500 text-white shadow-xl shadow-rose-500/30 border border-rose-400/50"
            : "bg-white/40 text-slate-600 hover:bg-white hover:text-rose-500 border border-white/40 shadow-sm"
            }`}
        >
          {isFavorite ? <AiFillHeart className="w-5 h-5" /> : <AiOutlineHeart className="w-5 h-5" />}
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
          <h3 className="font-black text-base-content text-sm md:text-base line-clamp-1 hover:text-primary transition-colors tracking-tight">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-base-content tracking-tighter">{formatPrice(currentPrice)} <span className="text-xs text-primary font-black uppercase ml-0.5">F</span></span>
          {showOldPrice && (
            <span className="text-xs text-base-content/50 line-through decoration-base-content/20 font-bold">{formatPrice(oldPrice)} F</span>
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
