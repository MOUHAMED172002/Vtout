import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth, useUser } from "../../lib/AuthHooks";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { ShoppingCart, Truck, ShieldCheck, RotateCcw, Star, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import SimilarProducts from "./SimilarProducts";
import ProductReviews from "./ProductReviews";
import FrequentlyBoughtTogether from "./FrequentlyBoughtTogether";
import SupplierProducts from "./SupplierProducts";

import { toast } from "react-hot-toast";
import { uniq } from "lodash";
import { getProductById } from "../../services/productService";
import { checkFavorite, addFavorite, removeFavorite } from "../../services/favoriteService";
import { useCart } from "../context/CartContext";

export default function ProductPages() {
  const formatPrice = (v) => {
    if (v == null) return "0";
    return Number(v).toLocaleString("fr-FR");
  };

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();

  const [product, setProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMainImage, setActiveMainImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [variants, setVariants] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [isFav, setIsFav] = useState(false);

  const thumbsRef = useRef(null);
  const actionRef = useRef(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    if (!actionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top > 0);
      },
      { threshold: 0 }
    );

    observer.observe(actionRef.current);
    return () => observer.disconnect();
  }, [loading, product]);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  async function fetchProduct() {
    setLoading(true);
    try {
      const data = await getProductById(id);
      setProduct(data);
      window.gtag?.('event', 'view_item', {
        currency: 'XOF',
        value: Number(data.price || 0),
        items: [{ item_id: data.id, item_name: data.name, item_category: data.category?.name || '', price: Number(data.price || 0) }]
      });
      window.fbq?.('track', 'ViewContent', {
        content_type: 'listing',
        content_ids: [data.id],
        content_name: data.name,
        content_category: data.category?.name || ''
      });
      const enrichedVariants = (data.variants || []).map(v => ({
        ...v,
        combination: typeof v.combination === 'string' ? JSON.parse(v.combination) : (v.combination || {})
      }));
      setVariants(enrichedVariants);

      const imgs = data.images?.map(i => i.image_url) || [];
      if (data.image_url) imgs.unshift(data.image_url);
      const uniqueImgs = uniq(imgs);
      setProductImages(uniqueImgs);

      const attrKeys = getAttributeKeys(enrichedVariants);
      const initialSelection = {};

      const targetVariantId = location.state?.selectedVariantId;
      const targetVariant = enrichedVariants.find(v => v.id === targetVariantId);

      if (targetVariant && targetVariant.combination) {
        Object.assign(initialSelection, targetVariant.combination);
      } else {
        attrKeys.forEach((k) => {
          const values = uniqueAttributeValues(enrichedVariants, k);
          if (values.length) initialSelection[k] = values[0];
        });
      }
      setSelectedAttributes(initialSelection);

      const firstVariantImage = enrichedVariants.find((v) => v?.priceRows?.[0]?.image_url)?.priceRows?.[0]?.image_url;
      setActiveMainImage(firstVariantImage || data.image_url || uniqueImgs[0] || "/placeholder.png");

      if (isSignedIn) {
        const token = await getToken();
        const fav = await checkFavorite(id, token, null);
        setIsFav(fav);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  function getAttributeKeys(variantList) {
    const keys = new Set();
    variantList.forEach((v) => {
      const combo = v.combination || {};
      Object.keys(combo).forEach((k) => keys.add(k));
    });
    return Array.from(keys);
  }

  function uniqueAttributeValues(variantList, attr) {
    const s = new Set();
    variantList.forEach((v) => {
      const val = v.combination?.[attr];
      if (val != null) s.add(val);
    });
    return Array.from(s);
  }

  const attributeValueImages = useMemo(() => {
    const map = {};
    const keys = getAttributeKeys(variants);
    keys.forEach((k) => {
      map[k] = {};
      uniqueAttributeValues(variants, k).forEach((val) => {
        const v = variants.find((vv) => vv.combination?.[k] === val && vv.priceRows?.[0]?.image_url);
        map[k][val] = v ? v.priceRows[0].image_url : null;
      });
    });
    return map;
  }, [variants]);

  const matchedVariant = useMemo(() => {
    if (!variants.length || !Object.keys(selectedAttributes).length) return null;
    return variants.find(v => {
      const combo = v.combination || {};
      return Object.entries(selectedAttributes).every(([k, val]) => combo[k] === val);
    }) || null;
  }, [variants, selectedAttributes]);

  const isSaleActive = useMemo(() => {
    return Number(product?.old_price) > Number(product?.price);
  }, [product]);

  const currentStock = useMemo(() => {
    if (variants.length > 0) {
      return matchedVariant?.priceRows?.[0]?.stock || 0;
    }
    return product?.stock ?? 0;
  }, [matchedVariant, product, variants]);

  const isOutOfStock = currentStock <= 0;

  const displayPrice = useMemo(() => {
    const bPrice = Number(product?.price || 0);
    const bOldPrice = Number(product?.old_price || 0);

    const matchedP = matchedVariant?.priceRows?.[0];
    const vPrice = Number(matchedP?.price || 0);
    const vOldPrice = Number(matchedP?.old_price || 0);

    let finalCurrent = 0;
    let finalOld = 0;

    if (vPrice > 0) {
      finalCurrent = vPrice;
      finalOld = vOldPrice;
    } else if (bPrice > 0) {
      finalCurrent = bPrice;
      finalOld = bOldPrice;
    } else {
      finalCurrent = Number(product?.supplier_price || 0);
      finalOld = bOldPrice;
    }

    return {
      current: finalCurrent,
      old: finalOld
    };
  }, [matchedVariant, product]);

  const isProgrammaticScrollRef = useRef(false);

  useEffect(() => {
    if (matchedVariant) {
      const image = matchedVariant.priceRows?.[0]?.image_url || (product?.image_url || productImages[0]) || null;
      if (image && image !== activeMainImage) {
        isProgrammaticScrollRef.current = true;
        setActiveMainImage(image);
      }
    } else {
      const keys = Object.keys(selectedAttributes);
      let chosen = null;
      for (let k of keys) {
        const val = selectedAttributes[k];
        const img = attributeValueImages?.[k]?.[val];
        if (img) {
          chosen = img;
          break;
        }
      }
      if (!chosen) chosen = product?.image_url || productImages[0] || null;
      if (chosen && chosen !== activeMainImage) {
        isProgrammaticScrollRef.current = true;
        setActiveMainImage(chosen);
      }
    }
  }, [matchedVariant, productImages, attributeValueImages, selectedAttributes, product]);

  const allImages = useMemo(() => {
    return uniq([
      ...variants.map((v) => v.priceRows?.[0]?.image_url).filter(Boolean),
      ...productImages,
    ]);
  }, [variants, productImages]);

  const mobileScrollRef = useRef(null);

  useEffect(() => {
    if (mobileScrollRef.current && allImages.length > 0) {
      const idx = allImages.indexOf(activeMainImage);
      if (idx !== -1 && isProgrammaticScrollRef.current) {
        const container = mobileScrollRef.current;
        const width = container.clientWidth;
        container.scrollTo({ left: idx * width, behavior: 'smooth' });
        isProgrammaticScrollRef.current = false;
      }
    }
  }, [activeMainImage, allImages]);

  const handleMobileScroll = useCallback((e) => {
    const container = e.target;
    const index = Math.round(container.scrollLeft / container.clientWidth);
    if (allImages[index] && allImages[index] !== activeMainImage) {
      setActiveMainImage(allImages[index]);
    }
  }, [allImages, activeMainImage]);

  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    if (!product) return;
    if (variants.length > 0 && !matchedVariant) {
      toast.error("Veuillez sélectionner toutes les options du produit.");
      return;
    }
    if (isOutOfStock) {
      toast.error("Ce produit est en rupture de stock.");
      return;
    }
    const payload = {
      ...product,
      product_id: product.id,
      variant_id: matchedVariant?.id || null,
      price_snapshot: displayPrice.current,
      image_url: activeMainImage || product.image_url,
      selected_attributes: selectedAttributes,
    };
    await addToCart(payload, quantity);
    window.gtag?.('event', 'add_to_cart', {
      currency: 'XOF',
      value: displayPrice.current * quantity,
      items: [{ item_id: product.id, item_name: product.name, item_category: product.category?.name || '', price: displayPrice.current, quantity }]
    });
    window.fbq?.('track', 'AddToCart', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      currency: 'XOF',
      value: displayPrice.current * quantity
    });
    // CartContext already shows "Ajouté au panier!" — no duplicate toast or redirect here.
  };

  const toggleFav = async () => {
    if (!isSignedIn) return navigate("/auth/connexion");
    const prev = isFav;
    setIsFav(!prev);
    try {
      const token = await getToken();
      const vId = matchedVariant?.id || null;
      if (!prev) {
        await addFavorite(id, token, vId);
        window.fbq?.('track', 'AddToWishlist', { content_ids: [id], content_name: product?.name, currency: 'XOF', value: displayPrice.current });
        window.fbq?.('trackCustom', 'AddToFavorites', { content_id: id, content_name: product?.name });
      } else {
        await removeFavorite(id, token, vId);
      }
      toast.success(prev ? "Retiré des favoris" : "Ajouté aux favoris");
    } catch {
      setIsFav(prev);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <span className="loading loading-spinner loading-lg text-primary"></span>
      <p className="text-base-content/40 font-medium animate-pulse">Chargement de votre produit...</p>
    </div>
  );

  if (!product) return <div className="p-20 text-center font-bold text-xl">Produit introuvable</div>;

  return (
    <div className="bg-base-100 min-h-screen">
      <div className="max-w-[1400px] mx-auto pt-4 md:pt-8 pb-32 md:pb-16 px-4 md:px-8">
        {/* Breadcrumbs */}
        <nav aria-label="fil d'ariane" className="mb-4 md:mb-8">
          <ol className="flex items-center flex-wrap gap-x-1 gap-y-1 text-xs md:text-sm text-base-content/50">
            <li>
              <button
                onClick={() => navigate("/")}
                className="hover:text-primary active:text-primary font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all px-2 py-1 bg-base-200 rounded-lg border border-base-200"
              >
                Accueil
              </button>
            </li>
            <li className="select-none text-base-content/30">
              <ChevronRight size={12} />
            </li>
            {product.category && (
              <>
                <li>
                  <button
                    onClick={() => navigate(`/products-liste?category=${product.category_id}`)}
                    className="hover:text-primary active:text-primary font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all px-2 py-1 bg-base-200 rounded-lg border border-base-200"
                  >
                    {product.category.name}
                  </button>
                </li>
                <li className="select-none text-base-content/30">
                  <ChevronRight size={12} />
                </li>
              </>
            )}
            <li className="text-base-content font-black uppercase tracking-widest text-[9px] md:text-[10px] max-w-[150px] md:max-w-none truncate px-1">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Gallery - 7 cols on LG */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-square md:aspect-auto md:h-[600px] bg-base-200 rounded-2xl md:rounded-[2rem] overflow-hidden border border-base-200 group">
              {/* Mobile Carousel */}
              <div
                ref={mobileScrollRef}
                onScroll={handleMobileScroll}
                className="md:hidden flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
              >
                {allImages.map((src, i) => (
                  <div key={i} className="min-w-full h-full flex-shrink-0 snap-center relative">
                    <img
                      src={src}
                      className="w-full h-full object-contain"
                      alt={`${product.name} - Vue ${i + 1}`}
                    />
                  </div>
                ))}
              </div>

              {/* Desktop Main Image */}
              <img
                src={activeMainImage}
                className="hidden md:block w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                alt={product.name}
              />

              {/* Favorite button */}
              <button
                onClick={toggleFav}
                className={`absolute top-4 right-4 md:top-6 md:right-6 p-3 rounded-full backdrop-blur-md border transition-all z-10 ${isFav ? 'bg-red-500 text-white shadow-xl shadow-red-500/30 border-red-400/50' : 'bg-base-100/80 text-base-content border-base-content/20 hover:bg-base-200 hover:text-rose-500'}`}
              >
                {isFav ? <AiFillHeart size={20} /> : <AiOutlineHeart size={20} />}
              </button>

              {/* Mobile Pagination Dots */}
              <div className="md:hidden absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10 pointer-events-none">
                {allImages.map((src, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${activeMainImage === src ? 'w-4 bg-primary' : 'w-1.5 bg-base-content/30'}`}
                  />
                ))}
              </div>
            </div>

            {/* Thumbnails (Desktop Only) */}
            <div className="hidden md:flex items-center gap-2 py-1">
              <button className="btn btn-circle btn-xs btn-ghost" onClick={() => thumbsRef.current.scrollLeft -= 100}><ChevronLeft size={16} /></button>
              <div ref={thumbsRef} className="flex-1 flex gap-3 overflow-x-auto scrollbar-hide py-1 px-1 snap-x">
                {allImages.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      isProgrammaticScrollRef.current = true;
                      setActiveMainImage(src);
                      const v = variants.find((vv) => vv.priceRows?.[0]?.image_url === src);
                      if (v && v.combination) {
                        setSelectedAttributes(v.combination);
                      }
                    }}
                    className={`w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-xl border-2 transition-all p-1 bg-base-100 snap-start ${activeMainImage === src ? 'border-primary ring-4 ring-primary/10' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={src} className="w-full h-full object-contain" alt="thumb" />
                  </button>
                ))}
              </div>
              <button className="btn btn-circle btn-xs btn-ghost" onClick={() => thumbsRef.current.scrollLeft += 100}><ChevronRight size={16} /></button>
            </div>
          </div>

          {/* Details - 5 cols on LG */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {product.review_count > 0 && (
                  <div className="flex items-center gap-2 text-orange-400 font-bold text-xs tracking-widest uppercase">
                    <Star size={14} fill="currentColor" /> {Number(product.average_rating).toFixed(1)} • {product.review_count} Avis clients
                  </div>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-base-content leading-tight">{product.name}</h1>

              {/* Delivery Info Badge */}
              {product.free_delivery_communes && product.free_delivery_communes.length > 0 && (
                <div className="flex items-center gap-4 p-4 bg-success/10 rounded-3xl border border-success/20">
                  <div className="w-12 h-12 bg-success text-white rounded-2xl flex items-center justify-center shadow-lg shadow-success/30">
                    <Truck size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-success">Avantage Client</p>
                    <p className="text-sm font-black text-base-content">
                      Livraison gratuite dans : {product.free_delivery_communes.join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {/* Price section */}
              <div className="flex items-baseline gap-4">
                <div className="flex flex-col">
                  <span className="text-5xl font-black text-base-content tracking-tighter">
                    {formatPrice(displayPrice.current)} <span className="text-xl text-primary">FCFA</span>
                  </span>
                  {displayPrice.old > displayPrice.current && (
                    <span className="text-lg text-base-content/40 line-through font-bold">
                      {formatPrice(displayPrice.old)} FCFA
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Availability Badge */}
            <div className="flex items-center gap-3">
              {isOutOfStock ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-error/10 text-error rounded-full text-xs font-black uppercase tracking-widest border border-error/20">
                  <span className="w-2 h-2 rounded-full bg-error" />
                  Rupture de stock
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-full text-xs font-black uppercase tracking-widest border border-success/20">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  En stock ({currentStock} unités)
                </div>
              )}
              {variants.length > 0 && !matchedVariant && (
                <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                  Veuillez choisir vos options
                </div>
              )}
            </div>

            <div className="divider opacity-50"></div>

            {/* Variants */}
            {variants.length > 0 && (
              <div className="space-y-4">
                {getAttributeKeys(variants).map(key => {
                  const values = uniqueAttributeValues(variants, key);
                  return (
                    <div key={key} className="space-y-2">
                      <span className="text-xs font-black uppercase tracking-widest text-base-content/50">{key}</span>
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {values.map(val => {
                          const active = selectedAttributes[key] === val;
                          return (
                            <button
                              key={val}
                              onClick={() => {
                                setSelectedAttributes(prev => ({ ...prev, [key]: val }));
                                window.fbq?.('track', 'CustomizeProduct', { content_id: product?.id, content_name: product?.name, [`option_${key}`]: val });
                              }}
                              className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl border-2 font-bold transition-all text-sm md:text-base ${active
                                ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                : 'border-base-200 bg-base-100 text-base-content/70 hover:border-base-300'
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
            )}

            {/* Actions */}
            <div ref={actionRef} className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                <div className="join border-2 border-base-200 rounded-2xl overflow-hidden h-14">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="join-item text-base-content/50 hover:text-primary px-5 text-xl transition-colors">-</button>
                  <div className="join-item flex items-center px-4 font-black text-base-content text-xl bg-base-100">{quantity}</div>
                  <button onClick={() => setQuantity(q => q + 1)} className="join-item text-base-content/50 hover:text-primary px-5 text-xl transition-colors">+</button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || (variants.length > 0 && !matchedVariant)}
                  className="flex-1 btn btn-primary h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 gap-3 disabled:opacity-50"
                >
                  <ShoppingCart size={22} /> {isOutOfStock ? "Indisponible" : "Ajouter"}
                </button>
              </div>
              <button
                onClick={() => { handleAddToCart(); navigate("/cartpage"); }}
                disabled={isOutOfStock || (variants.length > 0 && !matchedVariant)}
                className="btn bg-orange-400 text-white btn-block h-14 rounded-2xl text-lg font-black border-none hover:bg-orange-500 disabled:opacity-50"
              >
                {isOutOfStock ? "Produit Épuisé" : "Commander maintenant!"}
              </button>
            </div>

            {/* Mobile Sticky CTA Bar */}
            <AnimatePresence>
              {showSticky && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="lg:hidden fixed bottom-0 left-0 right-0 bg-base-100/90 backdrop-blur-xl border-t border-base-200 p-4 pb-safe z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-black uppercase text-base-content/50 tracking-widest truncate">{product.name}</span>
                      <span className="text-lg font-black text-base-content leading-none">
                        {formatPrice(displayPrice.current)} <span className="text-xs text-primary">F</span>
                      </span>
                    </div>
                    <div className="flex gap-2 flex-1 justify-end">
                        <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock || (variants.length > 0 && !matchedVariant)}
                        className="flex-1 bg-primary text-white h-12 rounded-xl font-black flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 text-xs px-2"
                        >
                        <ShoppingCart size={16} /> {isOutOfStock ? "Épuisé" : "Ajouter"}
                        </button>
                        <button
                        onClick={() => { handleAddToCart(); navigate("/cartpage"); }}
                        disabled={isOutOfStock || (variants.length > 0 && !matchedVariant)}
                        className="px-4 bg-neutral text-neutral-content h-12 rounded-xl font-black flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50 text-xs"
                        >
                        Acheter
                        </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 md:pt-8">
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-base-200 space-y-1">
                <Truck className="text-primary mb-1" size={20} />
                <span className="text-[10px] font-black uppercase text-base-content/50">Livraison 48h</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-base-200 space-y-1">
                <ShieldCheck className="text-primary mb-1" size={20} />
                <span className="text-[10px] font-black uppercase text-base-content/50">Garantie 1 an</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-base-200 space-y-1">
                <RotateCcw className="text-primary mb-1" size={20} />
                <span className="text-[10px] font-black uppercase text-base-content/50">Retour gratuit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Long Description */}
        <div className="mt-16 md:mt-24 space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl md:text-3xl font-black text-base-content">Détails du produit</h3>
            <div className="h-px flex-1 bg-base-200"></div>
          </div>
          <div className="prose whitespace-pre-wrap prose-sm md:prose-lg max-w-none text-base-content/70 leading-relaxed">
            {product.description}
          </div>
        </div>

        {/* Frequently Bought Together */}
        <div className="mt-12 md:mt-16 mb-8 md:mb-12">
          <FrequentlyBoughtTogether productId={product.id} limit={4} />
        </div>

        {/* Same Supplier Products */}
        {product.supplier_id && (
          <SupplierProducts
            supplierId={product.supplier_id}
            currentProductId={product.id}
            limit={8}
          />
        )}

        {/* Reviews Section */}
        <ProductReviews productId={product.id} />

        {/* Similar Products */}
        <div className="mt-16 md:mt-24 mb-8 md:mb-0">
          <SimilarProducts productId={product.id} limit={12} />
        </div>
      </div>
    </div>

  );
}
