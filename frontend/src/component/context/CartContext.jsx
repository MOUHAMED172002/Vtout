import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth, useUser } from "../../lib/AuthHooks";
import { getMyCart, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart, updateCartItemQuantity as apiUpdateCartItemQuantity } from "../../services/cartService";
import toast from "react-hot-toast";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();

  // Charge le panier initial (Server si connecté, sinon Local)
  const refreshCart = useCallback(async (silent = false) => {
    if (!isLoaded) return;

    if (user) {
      if (!silent) setLoading(true);
      try {
        const token = await getToken();
        const items = await getMyCart(token);
        setCart(items || []);
      } catch (err) {
        if (err.name !== 'CanceledError' && err.message !== 'Request aborted') {
          console.error("refreshCart error", err);
        }
      } finally {
        if (!silent) setLoading(false);
      }
    } else {
      const saved = localStorage.getItem("cart");
      if (saved) setCart(JSON.parse(saved));
      else setCart([]);
    }
  }, [isLoaded, user, getToken]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Sauvegarde locale uniquement pour les invités
  useEffect(() => {
    if (!user && isLoaded) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, user, isLoaded]);

  const addToCart = async (productData, quantity = 1) => {
    if (user) {
      try {
        const token = await getToken();
        // Le backend gère déjà l'incrémentation si l'item existe
        await apiAddToCart({
          product_id: productData.product_id || productData.id,
          variant_id: productData.variant_id || null,
          quantity,
          price_snapshot: productData.price_snapshot || productData.price,
          image_url: productData.image_url || (productData.images?.[0]?.image_url),
          selected_attributes: productData.selected_attributes || {},
          kit_id: productData.kit_id || null
        }, token);
        toast.success("Ajouté au panier !");
        await refreshCart(true); // Silent refresh
      } catch (err) {
        console.error("addToCart error", err);
        toast.error("Erreur lors de l'ajout au panier.");
      }
    } else {
      setCart(prev => {
        const index = prev.findIndex(item => item.id === productData.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index].quantity += quantity;
          return updated;
        } else {
          return [...prev, { ...productData, quantity }];
        }
      });
      toast.success("Ajouté au panier (local) !");
    }
  };

  const removeFromCart = async (itemId) => {
    // Optimistic UI update
    setCart(prev => prev.filter(item => item.id !== itemId));

    if (user) {
      try {
        const token = await getToken();
        await apiRemoveFromCart(itemId, token);
        await refreshCart(true); // Silent refresh
        toast.success("Retiré du panier.");
      } catch (err) {
        console.error("removeFromCart error", err);
        refreshCart(); // Rollback/full reload on error
      }
    } else {
      toast.success("Retiré du panier.");
    }
  };

  const updateQuantity = async (itemId, newQty) => {
    if (newQty < 1) return;

    // Optimistic UI update
    setCart(prev => prev.map(item => item.id === itemId ? { ...item, quantity: newQty } : item));

    if (user) {
      try {
        const token = await getToken();
        await apiUpdateCartItemQuantity(itemId, newQty, token);
        await refreshCart(true); // Silent refresh
      } catch (err) {
        console.error("updateQuantity error", err);
        refreshCart(); // Rollback/full reload on error
      }
    }
  };

  const clearCart = () => {
    setCart([]);
    if (!user) localStorage.removeItem("cart");
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

