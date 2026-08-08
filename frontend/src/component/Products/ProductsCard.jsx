import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { ShoppingCart, Eye, Star, Zap, Truck, MapPin, X } from "lucide-react";
import VerifiedSellerBadge from "../Shared/VerifiedSellerBadge";
import { useAuth, useUser } from "../../lib/AuthHooks";
import { checkFavorite, addFavorite, removeFavorite } from "../../services/favoriteService";
import { motion, AnimatePresence } from "framer-motion";
import { getOptimizedImage } from "../../utils/cloudinaryHelper";
import toast from "react-hot-toast";

// Module-level registry: ensures only one card can cycle images at a time
const hoverRegistry = new Map();

export default function ProductCard({ product, onFavoriteChange }) {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();
  const [imgs, setImgs] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const cardKey = useRef(Symbol());

  // États pour la modale de sélection des variantes avant "Acheter"
  const [showAttrModal, setShowAttrModal] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState({});

  // Register/unregister this card's setter in the global registry
  useEffect(() => {
    const key = cardKey.current;
    hoverRegistry.set(key, setIsHovered);
    return () => hoverRegistry.delete(key);
  }, []);

  const handleHoverEnter = () => {
    // Deactivate all other cards before activating this one
    hoverRegistry.forEach((setter, key) => {
      if (key !== cardKey.current) setter(false);
    });
    setIsHovered(true);
  };

  const handleHoverLeave = () => {
    setIsHovered(false);
  };

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

  const salesCount = Number(product?.total_sold || 0);
  const isPopular = salesCount >= 100;

  const navState = cheapestVariantId ? { selectedVariantId: cheapestVariantId } : undefined;

  // ------------------------------------------------------------------
  // Sélection des variantes avant "Acheter" (même logique que la page produit)
  // ------------------------------------------------------------------
  const parsedVariants = useMemo(() => {
    return (product.variants || []).map(v => ({
      ...v,
      combination: typeof v.combination === 'string' ? JSON.parse(v.combination) : (v.combination || {})
    }));
  }, [product.variants]);

  const getAttributeKeys = (variantList) => {
    const keys = new Set();
    variantList.forEach((v) => {
      Object.keys(v.combination || {}).forEach((k) => keys.add(k));
    });
    return Array.from(keys);
  };

  const uniqueAttributeValues = (variantList, attr) => {
    const s = new Set();
    variantList.forEach((v) => {
      const val = v.combination?.[attr];
      if (val != null) s.add(val);
    });
    return Array.from(s);
  };

  const matchedVariant = useMemo(() => {
    if (!parsedVariants.length || !Object.keys(selectedAttributes).length) return null;
    return parsedVariants.find(v =>
      Object.entries(selectedAttributes).every(([k, val]) => v.combination?.[k] === val)
    ) || null;
  }, [parsedVariants, selectedAttributes]);

  const matchedVariantStock = matchedVariant?.priceRows?.[0]?.stock;
  const matchedVariantOutOfStock = matchedVariant != null && (matchedVariantStock ?? 0) <= 0;

  const proceedToCheckout = (variant = null) => {
    const finalPrice = variant ? Number(variant.priceRows?.[0]?.price || currentPrice) : currentPrice;
    const finalImage = variant?.priceRows?.[0]?.image_url || imgs[0];
    navigate('/checkout', {
      state: {
        items: [{
          id: product.id,
          product_id: product.id,
          variant_id: variant?.id || null,
          name: product.name,
          price: finalPrice,
          price_snapshot: finalPrice,
          quantity: 1,
          image_url: finalImage,
          boutique_id: product.boutique_id,
          boutique: product.boutique,
          selected_attributes: variant?.combination || undefined,
        }],
        total: Number(finalPrice),
      }
    });
  };

  // Clic sur "Acheter" : si le produit a des variantes, on force le choix
  // avant d'aller vers le checkout.
  const handleBuyNow = (e) => {
    e.preventDefault();
    if (parsedVariants.length > 0) {
      setSelectedAttributes({});
      setShowAttrModal(true);
      return;
    }
    proceedToCheckout();
  };

  const handleConfirmVariantAndCheckout = () => {
    if (!matchedVariant || matchedVariantOutOfStock) return;
    setShowAttrModal(false);
    proceedToCheckout(matchedVariant);
  };

  return (
    <>
    <div className="group relative bg-base-100 rounded-2xl sm:rounded-[2rem] overflow-hidden border border-base-content/5 shadow-[0_4px_16px_rgb(0,0,0,0.04)] hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-500 flex flex-col">
      <Link
        to={`/products/${product.id}`}
        state={navState}
        className="block relative aspect-square overflow-hidden bg-base-100"
        onMouseEnter={handleHoverEnter}
        onMouseLeave={handleHoverLeave}
        onTouchStart={handleHoverEnter}
        onTouchEnd={handleHoverLeave}
        onTouchCancel={handleHoverLeave}
      >
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
                className={`h-1 rounded-full transition-all duration-300 ${idx === currentImgIndex ? "w-4 bg-base-100" : "w-1 bg-base-100/50"}`}
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
          className={`absolute top-3 right-3 p-2.5 rounded-2xl backdrop-blur-xl transition-all duration-500 z-10 ${isFavorite ? "bg-rose-500 text-white shadow-xl shadow-rose-500/30 border border-rose-400/50" : "bg-base-100/40 text-base-content/70 hover:bg-base-200 hover:text-rose-500 border border-white/40 shadow-sm"}`}
        >
          {isFavorite ? <AiFillHeart className="w-5 h-5" /> : <AiOutlineHeart className="w-5 h-5" />}
        </motion.button>

        {/* Hover overlay — CSS-only so it can never be stuck on multiple cards */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/30 to-transparent flex gap-2 justify-center items-center z-20 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
          <div className="flex gap-2">
            <button
              className="btn btn-circle btn-sm bg-base-100/90 border-none hover:bg-base-200 text-base-content shadow-lg active:scale-90 transition-transform"
              onClick={(e) => { e.preventDefault(); navigate(`/products/${product.id}`, { state: navState }); }}
            >
              <Eye size={16} />
            </button>
            {!isOutOfStock && (
              <button
                className="btn btn-sm bg-base-100/90 border-none hover:bg-base-200 text-base-content shadow-lg font-bold rounded-2xl px-3 gap-1 active:scale-90 transition-transform"
                onClick={handleBuyNow}
              >
                <Zap size={14} fill="currentColor" className="text-amber-500" /> Acheter
              </button>
            )}
          </div>
        </div>
      </Link>

      {/* ── Info Section ── */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">

        {/* Top: Rating + Name + Free delivery */}
        <div className="space-y-1.5 sm:space-y-2">
          {/* Rating */}
          {product.review_count > 0 && (
            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-orange-400 font-bold uppercase tracking-widest">
              <Star size={9} fill="currentColor" /> {Number(product.average_rating).toFixed(1)}
            </div>
          )}

          {/* Name */}
          <Link to={`/products/${product.id}`} state={navState} className="block">
            <h3 className="font-black text-base-content text-xs sm:text-sm md:text-base line-clamp-2 hover:text-primary transition-colors leading-tight">
              {product.name}
            </h3>
          </Link>

          {/* Vendeur vérifié — sa propre ligne, juste sous le nom */}
          {product.supplier?.is_certified && (
            <VerifiedSellerBadge variant="chip" size={10} />
          )}

          {/* Free delivery badge — single truncated line, never wraps */}
          {product.free_delivery_communes && product.free_delivery_communes.length > 0 && (
            <div className="flex items-center gap-1 min-w-0">
              <MapPin size={8} strokeWidth={3} className="text-emerald-500 shrink-0" />
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tight text-emerald-500 truncate min-w-0">
                Livraison gratuite · {product.free_delivery_communes.join(' · ')}
              </span>
            </div>
          )}
        </div>

        {/* Bottom: Price + Sales bar + Mobile button */}
        <div className="mt-2 space-y-1.5">
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

          {/* Sales bar + Mobile quick-buy button — fixed height so all cards align */}
          <div className="flex items-center gap-2 h-8">
            {/* Sales bar — always visible, grayed when < 100 sales */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-[8px] sm:text-[10px] font-black mb-1 uppercase tracking-tighter">
                <span className="flex items-center gap-0.5 text-orange-500">
                  <Zap size={8} fill="currentColor" /> {salesCount} vendus
                </span>
                {isPopular && <span className="text-primary">Populaire</span>}
              </div>
              <div className="h-1 w-full bg-base-200 rounded-full overflow-hidden">
                {isPopular && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((salesCount / 100) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-primary rounded-full"
                  />
                )}
              </div>
            </div>

            {/* Mobile: always-visible quick buy button (hidden on desktop where hover buttons show) */}
            {!isOutOfStock && (
              <button
                className="md:hidden shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all duration-200 active:scale-90"
              onClick={handleBuyNow}
            >
              <Zap size={14} fill="currentColor" />
            </button>
          )}
          </div>
        </div>

      </div>
    </div>

    {/* Modale de sélection des variantes avant "Acheter" */}
    <AnimatePresence>
      {showAttrModal && (
        <>
          <motion.div
            key="attr-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAttrModal(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            key="attr-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-base-100 rounded-t-[2.5rem] shadow-2xl max-h-[85vh] flex flex-col md:max-w-lg md:mx-auto md:left-0 md:right-0"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-base-200 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <img src={imgs[0]} alt={product?.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-black text-base-content text-sm truncate">{product?.name}</p>
                  <p className="text-primary font-black text-base">
                    {formatPrice(matchedVariant?.priceRows?.[0]?.price ?? currentPrice)} <span className="text-xs">FCFA</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAttrModal(false)}
                className="w-9 h-9 rounded-2xl bg-base-200 flex items-center justify-center text-base-content/50 hover:bg-base-300 flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable attribute groups */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40">Choisissez vos options</p>
              {getAttributeKeys(parsedVariants).map(key => {
                const values = uniqueAttributeValues(parsedVariants, key);
                const selected = selectedAttributes[key];
                return (
                  <div key={key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest text-base-content/60">{key}</span>
                      {selected && <span className="text-xs font-bold text-primary">{selected}</span>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {values.map(val => {
                        const active = selectedAttributes[key] === val;
                        return (
                          <button
                            key={val}
                            onClick={() => setSelectedAttributes(prev => ({ ...prev, [key]: val }))}
                            className={`px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${
                              active
                                ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                                : 'border-base-200 bg-base-100 text-base-content/70 hover:border-primary/30'
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="px-6 pt-4 pb-8 border-t border-base-200 flex-shrink-0 space-y-3">
              {!matchedVariant && Object.keys(selectedAttributes).length > 0 && (
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest text-center">
                  Cette combinaison n'est pas disponible
                </p>
              )}
              {matchedVariant && matchedVariantOutOfStock && (
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest text-center">
                  Cette variante est en rupture de stock
                </p>
              )}
              <button
                onClick={handleConfirmVariantAndCheckout}
                disabled={!matchedVariant || matchedVariantOutOfStock}
                className="w-full h-14 bg-primary text-white rounded-2xl font-black text-base shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-40 disabled:grayscale transition-all active:scale-95"
              >
                <Zap size={20} fill="currentColor" />
                Commander maintenant
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}