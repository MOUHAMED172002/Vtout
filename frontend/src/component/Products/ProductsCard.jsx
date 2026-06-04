import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { ShoppingCart, Eye, Star, Zap, Truck, MapPin } from "lucide-react";
import { useAuth, useUser } from "../../lib/AuthHooks";
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
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  useEffect(() => {
    if (product?.images && product.images.length > 0) {
      setImgs(product.images.map(img => getOptimizedImage(img.image_url, 600)));
    } else {
      const baseImg = product?.image_url || "/placeholder.png";
      setImgs([getOptimizedImage(baseImg, 600)]);
    }
  }, [product]);

  useEffect(() => {
    let interval;
    if (isHovered && imgs.length > 1) {
      interval = setInterval(() => {
        setCurrentImgIndex((prev) => (prev + 1) % imgs.length);
      }, 1200);
    } else {
      setCurrentImgIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, imgs.length]);

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

  const getProductDisplayPrice = () => {
    if (!product) return { currentPrice: 0, basePrice: 0, isSale: false, discountPercent: 0, cheapestVariantId: null };

    const bPrice = Number(product.price || 0);

    let minVariantPrice = Infinity;
    let foundVariant = false;
    let cheapestVariantId = null;

    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(v => {
        const p = Number(v.priceRows?.[0]?.price || 0);
        if (p > 0 && p < minVariantPrice) {
          minVariantPrice = p;
          foundVariant = true;
          cheapestVariantId = v.id;
        }
      });
    }

    let finalCurrent = 0;
    let finalBase = bPrice;

    if (product.old_price && Number(product.old_price) > bPrice) {
      finalBase = Number(product.old_price);
      finalCurrent = bPrice;
    } else if (bPrice > 0 && foundVariant && minVariantPrice < bPrice) {
      finalCurrent = minVariantPrice;
    } else if (bPrice > 0) {
      finalCurrent = bPrice;
    } else if (foundVariant) {
      finalCurrent = minVariantPrice;
      finalBase = 0;
    } else {
      finalCurrent = Number(product.supplier_price || 0);
    }

    const isSale = finalBase > finalCurrent && finalCurrent > 0 && finalBase > 0;
    return {
      currentPrice: finalCurrent,
      basePrice: finalBase,
      isSale,
      discountPercent: isSale ? Math.round(((finalBase - finalCurrent) / finalBase) * 100) : 0,
      cheapestVariantId
    };
  };

  const { currentPrice, basePrice, isSale: isSaleActive, discountPercent: finalDiscount, cheapestVariantId } = useMemo(() => getProductDisplayPrice(), [product]);

  const isOutOfStock = useMemo(() => {
    if (product.total_stock !== undefined) {
      return Number(product.total_stock) <= 0;
    }
    if (product.variants && product.variants.length > 0) {
      return !product.variants.some(v => (v.priceRows?.[0]?.stock || 0) > 0);
    }
    return (product.stock || 0) <= 0;
  }, [product]);

  const showOldPrice = isSaleActive;

  const salesCount = useMemo(() => {
    if (!product?.id) return 0;
    const seed = String(product.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 8 + (seed % 43);
  }, [product?.id]);

  const navState = cheapestVariantId ? { selectedVariantId: cheapestVariantId } : undefined;

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      className="group relative bg-base-100 rounded-2xl sm:rounded-[2rem] overflow-hidden border border-base-content/5 shadow-[0_4px_16px_rgb(0,0,0,0.04)] hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)] transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.id}`} state={navState} className="block relative aspect-square overflow-hidden bg-white">
        {/* Blurred background fills white space with the product's own colors */}
        <div
          className="absolute inset-0 scale-110"
          style={{
            backgroundImage: `url(${imgs[currentImgIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px) brightness(0.85)',
          }}
        />
        {/* Inner shadow overlay for depth */}
        <div className="absolute inset-0 shadow-[inner_0_0_40px_rgba(0,0,0,0.1)] z-[11] pointer-events-none" />
        
        {/* Main image shown fully without cropping */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImgIndex}
            src={imgs[currentImgIndex]}
            alt={product.name}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1, scale: isHovered ? 1.05 : 1 }}
            exit={{ opacity: 0.8 }}
            transition={{ duration: 0.4 }}
            className="relative w-full h-full object-contain z-10"
          />
        </AnimatePresence>
        
        {/* Pagination Dots for multiple images */}
        {imgs.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {imgs.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1 rounded-full transition-all duration-300 ${idx === currentImgIndex ? "w-4 bg-white" : "w-1 bg-white/50"}`}
              />
            ))}
          </div>
        )}

        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {isSaleActive && (
            <motion.span
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="backdrop-blur-xl bg-orange-600/90 text-white text-[10px] font-black px-3 py-1 rounded-xl uppercase tracking-tighter shadow-xl shadow-orange-500/20 border border-white/20"
            >
              -{finalDiscount}%
            </motion.span>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleFavorite}
          className={`absolute top-3 right-3 p-2.5 rounded-2xl backdrop-blur-xl transition-all duration-500 z-10 ${isFavorite ? "bg-rose-500 text-white shadow-xl shadow-rose-500/30 border border-rose-400/50" : "bg-white/40 text-slate-600 hover:bg-white hover:text-rose-500 border border-white/40 shadow-sm"}`}
        >
          {isFavorite ? <AiFillHeart className="w-5 h-5" /> : <AiOutlineHeart className="w-5 h-5" />}
        </motion.button>

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/30 to-transparent flex gap-2 justify-center items-center z-20"
            >
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="btn btn-circle btn-sm bg-white/90 border-none hover:bg-white text-gray-800 shadow-lg"
                  onClick={(e) => { e.preventDefault(); navigate(`/products/${product.id}`, { state: navState }); }}
                >
                  <Eye size={16} />
                </motion.button>
                {!isOutOfStock && (
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
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* ── Info Section ── */}
      <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2">

        {/* Rating */}
        {product.review_count > 0 && (
          <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-orange-400 font-bold uppercase tracking-widest">
            <Star size={9} fill="currentColor" /> {Number(product.average_rating).toFixed(1)}
            <span className="text-gray-300">•</span>
            <span className="text-gray-400">Certifié</span>
          </div>
        )}

        {/* Name */}
        <Link to={`/products/${product.id}`} state={navState} className="block">
          <h3 className="font-black text-base-content text-xs sm:text-sm md:text-base line-clamp-2 sm:line-clamp-1 hover:text-primary transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Free delivery badge — single truncated line, never wraps */}
        {product.free_delivery_communes && product.free_delivery_communes.length > 0 && (
          <div className="flex items-center gap-1 min-w-0">
            <MapPin size={8} strokeWidth={3} className="text-emerald-500 shrink-0" />
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tight text-emerald-500 truncate min-w-0">
              Livraison gratuite · {product.free_delivery_communes.join(' · ')}
            </span>
          </div>
        )}

        {/* Price row */}
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-base sm:text-xl md:text-2xl font-black text-base-content tracking-tighter leading-none">
            {formatPrice(currentPrice)}
            <span className="text-[9px] sm:text-xs text-primary font-black uppercase ml-0.5">F</span>
          </span>
          {showOldPrice && (
            <span className="text-[9px] sm:text-xs text-base-content/40 line-through font-bold">
              {formatPrice(basePrice)} F
            </span>
          )}
        </div>

        {/* Sales bar + Mobile quick-buy button */}
        <div className="flex items-center gap-2">
          {/* Sales bar */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-[8px] sm:text-[10px] font-black text-gray-400 mb-1 uppercase tracking-tighter">
              <span className="flex items-center gap-0.5 text-orange-500">
                <Zap size={8} fill="currentColor" /> {salesCount} vendus
              </span>
              <span className="text-primary">Populaire</span>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((salesCount / 60) * 100, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>

          {/* Mobile: always-visible quick buy button (hidden on desktop where hover buttons show) */}
          {!isOutOfStock && (
            <button
              className="md:hidden shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all duration-200 active:scale-90"
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
              <Zap size={14} fill="currentColor" />
            </button>
          )}
        </div>

      </div>
    </motion.div>
  );
}
