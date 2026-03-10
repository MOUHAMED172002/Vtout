import React, { useEffect, useState } from "react";


/**
 * CouponsPanel (mis à jour)
 * - Utilise supabase.auth.getUser() (supabase-js v2) pour récupérer l'utilisateur connecté.
 * - Tente de lire auth.users et profiles (si RLS le permet) pour enrichir userInfo.
 * - Sélection explicite des colonnes depuis user_coupons et coupons conformément au schéma.
 * - Gestion robuste des erreurs, protections contre les accès non authentifiés.
 */

export default function CouponsPanel() {
  const [userInfo, setUserInfo] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function init() {
      setLoading(true);
      try {
        const { data: sessionData, error: sessionErr } = await supabase.auth.getUser();
        if (sessionErr || !sessionData || !sessionData.user) {
          if (mounted) {
            setUserInfo(null);
            setCoupons([]);
            setLoading(false);
          }
          return;
        }
        const sessionUser = sessionData.user;
        const userId = sessionUser.id;

        // fetch auth.users (system) and profiles (public) in parallel (may be blocked by RLS)
        const [authUserRes, profileRes] = await Promise.all([
          supabase.from("auth.users").select("id,email,raw_user_meta_data,created_at").eq("id", userId).maybeSingle(),
          supabase.from("profiles").select("id,fullname,phone,avatar_url,role").eq("id", userId).maybeSingle()
        ]);

        const authUserData = authUserRes && authUserRes.data !== undefined ? authUserRes.data : authUserRes;
        const profileData = profileRes && profileRes.data !== undefined ? profileRes.data : profileRes;

        const mergedUser = {
          id: userId,
          email: (authUserData && authUserData.email) || sessionUser.email || null,
          raw_meta: authUserData && authUserData.raw_user_meta_data,
          fullname: (profileData && profileData.fullname) || null,
          phone: (profileData && profileData.phone) || sessionUser.phone || null,
          avatar_url: (profileData && profileData.avatar_url) || null,
          role: (profileData && profileData.role) || "user",
          created_at: (authUserData && authUserData.created_at) || sessionUser.created_at || null
        };

        if (!mounted) return;
        setUserInfo(mergedUser);

        // load user coupons
        await loadUserCoupons(userId, mounted);
      } catch (err) {
        console.error("CouponsPanel init error", err);
        if (mounted) setCoupons([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();
    return () => { mounted = false; };
  }, []);

  // separate loader so we can re-use it after redeem
  async function loadUserCoupons(userIdParam, mountedFlag = true) {
    setLoading(true);
    try {
      const session = await supabase.auth.getUser();
      const userId = userIdParam || (session.data && session.data.user && session.data.user.id);
      if (!userId) {
        setCoupons([]);
        return;
      }

      // select explicit columns and join coupons fields
      const { data, error } = await supabase
        .from("user_coupons")
        .select(`
          id,
          user_id,
          coupon_id,
          redeemed,
          redeemed_at,
          created_at,
          coupons (
            id,
            code,
            title,
            description,
            discount_percent,
            discount_amount,
            active,
            starts_at,
            ends_at
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (mountedFlag) setCoupons(Array.isArray(data) ? data : (data ? [data] : []));
    } catch (err) {
      console.error("load user coupons", err);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  }

  async function redeem(id) {
    try {
      const { data: sessionData } = await supabase.auth.getUser();
      if (!sessionData || !sessionData.user) return alert("Non authentifié");
      const userId = sessionData.user.id;

      // Verify the coupon belongs to this user and is not already redeemed
      const { data: existing, error: fetchErr } = await supabase
        .from("user_coupons")
        .select("id,redeemed,coupon_id")
        .eq("id", id)
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchErr) throw fetchErr;
      if (!existing) return alert("Coupon introuvable.");
      if (existing.redeemed) return alert("Coupon déjà utilisé.");

      // Optionally: validate coupon active/expiry via coupons table
      const { data: couponData, error: couponErr } = await supabase
        .from("coupons")
        .select("id,code,active,starts_at,ends_at,discount_amount,discount_percent")
        .eq("id", existing.coupon_id)
        .maybeSingle();

      if (couponErr) console.warn("coupon fetch warning:", couponErr);
      if (couponData) {
        if (!couponData.active) return alert("Ce coupon n'est plus actif.");
        const now = new Date();
        if (couponData.starts_at && new Date(couponData.starts_at) > now) return alert("Ce coupon n'est pas encore actif.");
        if (couponData.ends_at && new Date(couponData.ends_at) < now) return alert("Ce coupon est expiré.");
      }

      // mark redeemed
      const { error } = await supabase
        .from("user_coupons")
        .update({ redeemed: true, redeemed_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      // reload
      await loadUserCoupons(userId, true);
      alert("Coupon utilisé.");
    } catch (err) {
      console.error("redeem coupon", err);
      alert("Impossible d'utiliser le coupon.");
    }
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Mes coupons</h2>

      {userInfo && (
        <div className="mb-3 text-sm text-gray-600">
          Connecté en tant que: {userInfo.fullname || userInfo.email}
        </div>
      )}

      {loading ? (
        <div>Chargement...</div>
      ) : coupons.length === 0 ? (
        <div>Aucun coupon.</div>
      ) : (
        <div className="space-y-2">
          {coupons.map((cu) => {
            const cp = cu.coupons || {};
            const label = cp.title || cp.code || `Coupon ${cp.id || cu.coupon_id}`;
            const discountLabel = cp.discount_amount != null ? `${cp.discount_amount} FCFA` : (cp.discount_percent != null ? `${cp.discount_percent}%` : "—");
            return (
              <div key={cu.id} className="card bg-white p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">{label}</div>
                  <div className="text-xs text-gray-500">{cp.code} • {discountLabel}</div>
                </div>
                <div>
                  {!cu.redeemed ? (
                    <button className="btn btn-xs" onClick={() => redeem(cu.id)}>Utiliser</button>
                  ) : (
                    <span className="text-sm text-gray-500">Utilisé • {cu.redeemed_at ? new Date(cu.redeemed_at).toLocaleString() : ""}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}