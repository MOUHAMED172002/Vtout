import React, { useState } from "react";
import { useCart } from "./CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import EmptyState from "../Shared/EmptyState";

export default function CartPage() {
  const { cart: displayCart, loading, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname.startsWith("/user/dashboard");

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const getDiscountInfo = (item) => {
    // For variant products use price_snapshot (set to variant price at add time).
    // For non-variant products use item.product.price (current DB price).
    const baseFromVariant = item.variant_id ? parseFloat(item.price_snapshot || 0) : 0;
    let originalPrice = baseFromVariant > 0
      ? baseFromVariant
      : parseFloat(item.product?.price || item.price_snapshot || item.price || 0);
    let discountedPrice = originalPrice;
    let discountPercent = 0;
    let isVolumeDiscount = false;
    let isKitDiscount = false;

    // Bundle/promo discount: product.old_price > product.price means a reduction is active
    // (covers kit bundles, flash sales, and direct promos displayed in the cart).
    if (!item.variant_id && !item.kit_id) {
      const productOldPrice = parseFloat(item.product?.old_price || 0);
      if (productOldPrice > 0 && productOldPrice > originalPrice) {
        return {
          originalPrice: productOldPrice,
          discountedPrice: Math.round(originalPrice),
          discountPercent: Math.round(((productOldPrice - originalPrice) / productOldPrice) * 100),
          isVolumeDiscount: false,
          isKitDiscount: true
        };
      }
    }

    // Legacy kit companion pricing via kit_id (kept for backwards-compat).
    if (item.kit_id && item.price_snapshot) {
      const kitPrice = parseFloat(item.price_snapshot);
      if (kitPrice > 0 && kitPrice < originalPrice) {
        discountedPrice = kitPrice;
        discountPercent = Math.round(((originalPrice - kitPrice) / originalPrice) * 100);
        isKitDiscount = true;
      }
      return {
        originalPrice,
        discountedPrice: Math.round(discountedPrice),
        discountPercent,
        isVolumeDiscount,
        isKitDiscount
      };
    }

    if (item.product && item.product.volume_pricing) {
      try {
        const raw = typeof item.product.volume_pricing === 'string'
          ? JSON.parse(item.product.volume_pricing)
          : item.product.volume_pricing;

        if (Array.isArray(raw) && raw.length > 0) {
          const normalizedTiers = raw
            .map(t => ({ ...t, min_qty: Math.max(1, t.min_qty ?? t.min ?? t.qty ?? 1) }))
            .sort((a, b) => b.min_qty - a.min_qty);
          const metTier = normalizedTiers.find(t => item.quantity >= t.min_qty);
          if (metTier) {
            discountPercent = parseFloat(metTier.discount || 0);
            if (discountPercent > 0) {
              discountedPrice = originalPrice * (1 - discountPercent / 100);
              isVolumeDiscount = true;
            }
          }
        }
      } catch (e) {
        console.error("Error parsing volume pricing in cart:", e);
      }
    }
    return {
      originalPrice,
      discountedPrice: Math.round(discountedPrice),
      discountPercent,
      isVolumeDiscount,
      isKitDiscount
    };
  };

  const total = displayCart.reduce((sum, item) => {
    const { discountedPrice } = getDiscountInfo(item);
    return sum + discountedPrice * item.quantity;
  }, 0);

  const selectedTotal = displayCart
    .filter((i) => selectedIds.has(i.id))
    .reduce((sum, item) => {
      const { discountedPrice } = getDiscountInfo(item);
      return sum + discountedPrice * item.quantity;
    }, 0);

  function toggleSelect(id) {
    setSelectedIds((s) => {
      const copy = new Set(s);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  }

  function toggleSelectAll() {
    if (selectAll) {
      setSelectAll(false);
      setSelectedIds(new Set());
    } else {
      setSelectAll(true);
      setSelectedIds(new Set(displayCart.map((i) => i.id)));
    }
  }

  function handleCheckout() {
    if (!displayCart.length) return toast.error("Votre panier est vide.");
    
    // Map items to include their actual computed promotional/volume price snapshot for downstream checkout validation
    const items = (selectedIds.size > 0 ? displayCart.filter(i => selectedIds.has(i.id)) : displayCart).map(item => {
      const { discountedPrice } = getDiscountInfo(item);
      return {
        ...item,
        price_snapshot: discountedPrice // Use calculated dynamic promotional price
      };
    });
    
    const finalTotal = selectedIds.size > 0 ? selectedTotal : total;
    navigate("/checkout", { state: { items, total: finalTotal } });
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  );

  return (
    <div className={isDashboard ? "pb-12" : "bg-base-200 min-h-screen pt-12 pb-24"}>
      <div className={isDashboard ? "w-full" : "max-w-[1200px] mx-auto px-6"}>
        <div className={`flex flex-col ${isDashboard ? "xl:flex-row" : "lg:flex-row"} gap-12`}>

          {/* List Section */}
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Votre Panier</h1>
              <span className="bg-base-100 px-4 py-1 rounded-full border border-gray-100 text-sm font-bold text-gray-500 shadow-sm">
                {displayCart.length} Article{displayCart.length > 1 ? 's' : ''}
              </span>
            </div>

            {displayCart.length === 0 ? (
              <EmptyState
                type="cart"
                title="Votre panier est vide"
                description="Parcourez notre collection et trouvez votre bonheur dès aujourd'hui."
                actionLabel="Continuer vos achats"
                actionLink="/products-liste"
              />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4 px-6 py-4 bg-base-100 rounded-3xl border border-gray-100 shadow-sm">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary rounded-lg"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                  />
                  <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Tout sélectionner</span>
                </div>

                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {displayCart.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`group relative bg-base-100 p-6 rounded-[2rem] border transition-all duration-300 flex flex-col md:flex-row items-center gap-6 ${selectedIds.has(item.id) ? 'border-primary ring-4 ring-primary/5 shadow-xl' : 'border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md'}`}
                      >
                        <div className="flex items-center gap-6 w-full md:w-auto">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary rounded-lg"
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleSelect(item.id)}
                          />
                          <div className="w-24 h-24 md:w-32 md:h-32 bg-base-200 rounded-2xl p-4 flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                            <img
                              src={item.image_url || "/images/placeholder-rect.png"}
                              alt={item.name}
                              className="w-full h-full object-contain mix-blend-multiply"
                            />
                          </div>
                        </div>

                        <div className="flex-1 space-y-2 min-w-0 text-center md:text-left">
                          <h3 className="text-xl font-black text-gray-900 truncate leading-tight">{item.name}</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {(() => {
                              try {
                                const attrs = typeof item.selected_attributes === 'string'
                                  ? JSON.parse(item.selected_attributes)
                                  : (item.selected_attributes || {});

                                const entries = Object.entries(attrs);
                                if (entries.length === 0) throw new Error("empty");

                                return entries.map(([key, val]) => {
                                  // Clean value: remove brackets, braces, and quotes
                                  const cleanVal = String(val)
                                    .replace(/[\[\]{}"]/g, '')
                                    .trim();

                                  return (
                                    <div key={key} className="flex items-center bg-base-200 border border-base-200 rounded-full px-3 py-1 gap-2 shadow-sm">
                                      <span className="text-[9px] font-black text-base-content/40 uppercase tracking-tighter">{key}</span>
                                      <span className="text-[10px] font-black text-primary uppercase">{cleanVal}</span>
                                    </div>
                                  );
                                });
                              } catch (e) {
                                return (
                                  <span className="text-[10px] font-black text-base-content/40 uppercase tracking-widest bg-base-200 py-1.5 px-3 rounded-xl border border-base-200">
                                    Standard Edition
                                  </span>
                                );
                              }
                            })()}
                          </div>
                          {(() => {
                            const { originalPrice, discountedPrice, discountPercent, isVolumeDiscount, isKitDiscount } = getDiscountInfo(item);
                            if (isVolumeDiscount || isKitDiscount) {
                              return (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-3 justify-center md:justify-start">
                                    <span className="text-2xl font-black text-primary">
                                      {discountedPrice.toLocaleString()} F
                                    </span>
                                    <span className="text-sm font-bold text-base-content/40 line-through">
                                      {originalPrice.toLocaleString()} F
                                    </span>
                                  </div>
                                  <span className="inline-block text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase tracking-tighter">
                                    {isVolumeDiscount
                                      ? `🎉 Offre de Gros (-${discountPercent}%)`
                                      : item.product?.is_kit
                                        ? `📦 Prix Pack (-${discountPercent}%)`
                                        : item.product?.is_flash_sale
                                          ? `⚡ Prix Flash (-${discountPercent}%)`
                                          : `🏷️ Prix Promo (-${discountPercent}%)`}
                                  </span>
                                </div>
                              );
                            }
                            return (
                              <p className="text-2xl font-black text-primary pt-1">
                                {originalPrice.toLocaleString()} F
                              </p>
                            );
                          })()}
                        </div>

                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                          <div className="flex items-center bg-base-200 rounded-2xl p-2 gap-4">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-base-200 text-gray-900 transition-colors shadow-sm active:scale-90"
                            >
                              <Minus size={18} />
                            </button>
                            <span className="text-lg font-black w-6 text-blue-400 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-base-200 text-gray-900 transition-colors shadow-sm active:scale-90"
                            >
                              <Plus size={18} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-4 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={24} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          {/* Summary Section */}
          {displayCart.length > 0 && (
            <div className={`w-full ${isDashboard ? "xl:w-[400px]" : "lg:w-[400px]"}`}>
              <div className="sticky top-24 space-y-6">
                <div className="bg-base-100 border border-base-200 p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700"></div>

                  <h2 className="text-2xl font-black mb-8 relative z-10 flex items-center gap-3 text-base-content">
                    Résumé <CheckCircle2 className="text-primary" size={24} />
                  </h2>

                  <div className="space-y-4 mb-8 relative z-10">
                    <div className="flex justify-between font-bold">
                      <span className="text-base-content/50">Articles ({displayCart.length})</span>
                      <span className="text-base-content font-black">{total.toLocaleString()} F</span>
                    </div>
                    <div className="flex justify-between font-bold items-center">
                      <div className="flex flex-col">
                        <span className="text-base-content/50">Frais de livraison</span>
                        <span className="text-[10px] font-medium text-base-content/40 mt-0.5 italic">Calculés à l'étape suivante</span>
                      </div>
                      <span className="text-primary text-sm italic font-black">À définir</span>
                    </div>
                    <div className="h-px bg-base-200 my-6"></div>
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="font-black text-sm uppercase tracking-widest text-base-content">Total partiel</span>
                        <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider mt-1">Hors livraison</span>
                      </div>
                      <span className="text-4xl font-black text-base-content">{(selectedIds.size > 0 ? selectedTotal : total).toLocaleString()} F</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full btn btn-primary rounded-2xl h-16 font-black text-lg shadow-xl shadow-primary/20 gap-3 group"
                  >
                    Passer à la caisse <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>

                <div className="bg-base-100 p-8 rounded-3xl border border-gray-100 space-y-4 shadow-sm">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Besoin d'aide ?</p>
                  <p className="text-sm font-bold text-gray-600">Nos experts sont disponibles 24/7 pour vous accompagner dans votre achat.</p>
                  <button
                    onClick={() => window.dispatchEvent(new Event('open-support-chat'))}
                    className="text-primary font-black text-sm hover:underline"
                  >
                    Contacter le support
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
