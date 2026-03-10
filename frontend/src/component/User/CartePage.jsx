import React, { useEffect, useState } from "react";

import { useProfile } from "../context/useProfile";

export default function CartPage() {
  const { user, loading: userLoading } = useProfile();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMeta, setCouponMeta] = useState(null);

  // 🔥 Charger le panier quand le user est prêt
  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    loadCart(user.id);
  }, [user]);

  async function loadCart(userId) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select("id,user_id,product_id,variant_id,quantity,price_snapshot,selected_attributes,image_url,created_at,updated_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setItems(data || []);
    } catch (err) {
      console.error("load cart", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateQty(id, qty) {
    if (!user) return alert("Non authentifié");
    if (qty < 1) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: qty, updated_at: new Date() })
        .eq("id", id);

      if (error) throw error;

      loadCart(user.id);
    } catch (err) {
      console.error("update qty", err);
      alert("Impossible de mettre à jour la quantité.");
    }
  }

  async function remove(id) {
    if (!user) return alert("Non authentifié");
    if (!confirm("Supprimer cet article ?")) return;

    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      loadCart(user.id);
    } catch (err) {
      console.error("remove cart item", err);
      alert("Impossible de supprimer l'article.");
    }
  }

  async function applyCoupon() {
    try {
      if (!coupon) return alert("Entrez un code.");

      const { data, error } = await supabase
        .from("coupons")
        .select("id,code,title,discount_percent,discount_amount,active,starts_at,ends_at,metadata")
        .eq("code", coupon)
        .maybeSingle();

      if (error) throw error;
      if (!data || !data.active) return alert("Coupon invalide ou inactif.");

      if (data.starts_at && new Date(data.starts_at) > new Date())
        return alert("Coupon pas encore actif.");
      if (data.ends_at && new Date(data.ends_at) < new Date())
        return alert("Coupon expiré.");

      if (data.discount_amount != null) {
        setDiscount(Number(data.discount_amount) || 0);
      } else if (data.discount_percent != null) {
        const pct = Number(data.discount_percent) || 0;
        setDiscount(pct > 0 ? pct / 100 : 0);
      } else {
        setDiscount(0);
      }

      setCouponMeta(data);
      alert("Coupon appliqué.");
    } catch (err) {
      console.error("apply coupon", err);
      alert("Impossible d'appliquer le coupon.");
    }
  }

  const subtotal = items.reduce(
    (s, i) => s + ((Number(i.price_snapshot) || 0) * (Number(i.quantity) || 1)),
    0
  );

  const discountAmount =
    typeof discount === "number"
      ? discount < 1
        ? subtotal * discount
        : discount
      : 0;

  const total = Math.max(0, subtotal - (discountAmount || 0));

  if (userLoading || loading) {
    return <div>Chargement...</div>;
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Mon panier</h2>

      {user && (
        <div className="mb-3 text-sm text-gray-600">
          Connecté en tant que: {user.fullname || user.email}
        </div>
      )}

      {!user ? (
        <div>Veuillez vous connecter.</div>
      ) : items.length === 0 ? (
        <div>Votre panier est vide.</div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="card bg-white p-4 flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 flex items-center justify-center overflow-hidden rounded">
                  <img
                    src={it.image_url || "/placeholder.jpg"}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="font-medium">Produit {it.product_id}</div>
                  <div className="text-sm text-gray-600">
                    {it.selected_attributes
                      ? JSON.stringify(it.selected_attributes)
                      : ""}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold">
                    {it.price_snapshot != null
                      ? `${it.price_snapshot} FCFA`
                      : "—"}
                  </div>

                  <div className="flex items-center gap-2 mt-2 justify-end">
                    <button
                      className="btn btn-xs"
                      onClick={() =>
                        updateQty(it.id, (Number(it.quantity) || 1) - 1)
                      }
                    >
                      -
                    </button>
                    <div className="px-2">{it.quantity || 0}</div>
                    <button
                      className="btn btn-xs"
                      onClick={() =>
                        updateQty(it.id, (Number(it.quantity) || 1) + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  <div className="mt-2">
                    <button
                      className="btn btn-xs btn-ghost"
                      onClick={() => remove(it.id)}
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 card bg-white p-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="w-full md:w-1/2 flex gap-2">
                <input
                  className="input input-bordered flex-1"
                  placeholder="Code promo"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                />
                <button className="btn" onClick={applyCoupon}>
                  Appliquer
                </button>
              </div>

              <div className="text-right">
                <div className="text-sm">
                  Sous-total: {subtotal.toLocaleString()} FCFA
                </div>
                <div className="text-sm">
                  Remise:{" "}
                  {discountAmount
                    ? discountAmount.toLocaleString()
                    : 0}{" "}
                  FCFA
                </div>
                <div className="font-semibold mt-1">
                  Total: {total.toLocaleString()} FCFA
                </div>

                <div className="mt-3">
                  <a className="btn btn-primary" href="/checkout">
                    Commander
                  </a>
                </div>

                {couponMeta && (
                  <div className="text-xs text-gray-500 mt-2">
                    Coupon: {couponMeta.code}{" "}
                    {couponMeta.title ? `— ${couponMeta.title}` : ""}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
