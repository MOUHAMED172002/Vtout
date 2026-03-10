import React, { useEffect, useState } from "react";


/**
 * ReturnsManager (mis à jour)
 * - Utilise supabase.auth.getUser() (supabase-js v2) pour récupérer la session utilisateur.
 * - Tente de lire auth.users et profiles (si RLS le permet) pour enrichir userInfo.
 * - Sélections explicites des colonnes depuis orders, returns, order_items afin de coller au schema.
 * - Vérifie que l'utilisateur possède bien la commande avant de créer une demande de retour.
 * - Gestion robuste des erreurs et des cas non authentifiés.
 */

export default function ReturnsManager() {
  const [userInfo, setUserInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [returnsList, setReturnsList] = useState([]);
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
            setOrders([]);
            setReturnsList([]);
            setLoading(false);
          }
          return;
        }
        const sessionUser = sessionData.user;
        const userId = sessionUser.id;

        // fetch auth.users and profiles in parallel to enrich header (auth.users may be blocked by RLS)
        const [authUsersRes, profileRes] = await Promise.all([
          supabase.from("auth.users").select("id,email,raw_user_meta_data,created_at").eq("id", userId).maybeSingle(),
          supabase.from("profiles").select("id,fullname,phone,avatar_url,role").eq("id", userId).maybeSingle()
        ]);

        const authUserData = authUsersRes && authUsersRes.data !== undefined ? authUsersRes.data : authUsersRes;
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

        // load orders and returns in parallel
        await loadData(userId, mounted);
      } catch (err) {
        console.error("ReturnsManager init error", err);
        if (mounted) {
          setOrders([]);
          setReturnsList([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    return () => { mounted = false; };
  }, []);

  // loader extracted to reuse after mutations
  async function loadData(userIdParam, mountedFlag = true) {
    setLoading(true);
    try {
      const session = await supabase.auth.getUser();
      const userId = userIdParam || (session.data && session.data.user && session.data.user.id);
      if (!userId) {
        setOrders([]);
        setReturnsList([]);
        return;
      }

      // Select explicit columns for orders and returns.
      // For orders we only fetch lightweight info (id, items_count, status, created_at)
      // For returns we fetch the columns defined in schema plus order ref
      const [ordersRes, returnsRes] = await Promise.all([
        supabase
          .from("orders")
          .select("id,items_count,status,created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("returns")
          .select("id,user_id,order_id,order_item_id,reason,status,requested_at,processed_at,refund_amount,metadata")
          .eq("user_id", userId)
          .order("requested_at", { ascending: false })
      ]);

      const o = ordersRes && ordersRes.data !== undefined ? ordersRes.data : ordersRes;
      const r = returnsRes && returnsRes.data !== undefined ? returnsRes.data : returnsRes;

      if (mountedFlag) {
        setOrders(Array.isArray(o) ? o : (o ? [o] : []));
        setReturnsList(Array.isArray(r) ? r : (r ? [r] : []));
      }
    } catch (err) {
      console.error("load returns data error", err);
      setOrders([]);
      setReturnsList([]);
    } finally {
      setLoading(false);
    }
  }

  // create a return request for a whole order (or specific order_item if you pass it)
  async function requestReturn(orderId, orderItemId = null) {
    try {
      const { data: sessionData } = await supabase.auth.getUser();
      if (!sessionData || !sessionData.user) {
        alert("Vous devez être connecté(e) pour demander un retour.");
        return;
      }
      const userId = sessionData.user.id;

      // Verify order belongs to user
      const { data: orderCheck, error: orderErr } = await supabase
        .from("orders")
        .select("id,status")
        .eq("id", orderId)
        .eq("user_id", userId)
        .maybeSingle();

      if (orderErr) {
        console.error("order check error", orderErr);
        return alert("Impossible de vérifier la commande.");
      }
      if (!orderCheck) {
        return alert("Commande introuvable ou n'appartient pas à votre compte.");
      }

      // prompt for reason
      const reason = prompt("Motif du retour");
      if (!reason) return;

      // Optionally validate order_item id belongs to that order
      if (orderItemId) {
        const { data: oi, error: oiErr } = await supabase
          .from("order_items")
          .select("id,order_id,product_id,quantity")
          .eq("id", orderItemId)
          .eq("order_id", orderId)
          .maybeSingle();
        if (oiErr) {
          console.error("order_item fetch error", oiErr);
          return alert("Impossible de vérifier l'article de commande.");
        }
        if (!oi) return alert("Article de commande invalide.");
      }

      // insert return request
      const insertPayload = {
        user_id: userId,
        order_id: orderId,
        order_item_id: orderItemId,
        reason,
        status: "requested",
        requested_at: new Date().toISOString(),
        metadata: {}
      };

      const { data, error } = await supabase.from("returns").insert(insertPayload).select().single();
      if (error) throw error;

      alert("Demande de retour créée.");
      await loadData(userId, true);
    } catch (err) {
      console.error("request return error", err);
      alert("Impossible de créer la demande de retour.");
    }
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Retours</h2>

      {userInfo && (
        <div className="mb-3 text-sm text-gray-600">
          Connecté en tant que: {userInfo.fullname || userInfo.email}
        </div>
      )}

      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card bg-white p-4">
            <h3 className="font-medium mb-2">Mes commandes récentes</h3>
            {orders.length === 0 ? (
              <div>Aucune commande.</div>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between p-2 border-b">
                  <div>
                    <div className="font-medium">Commande #{String(o.id).split("-")[0]}</div>
                    <div className="text-xs">{o.status} • {o.items_count ?? "—"} article(s)</div>
                    <div className="text-xs text-gray-500">{o.created_at ? new Date(o.created_at).toLocaleDateString() : ""}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="btn btn-xs" onClick={() => requestReturn(o.id)}>Demander un retour</button>
                    {/* If you want to request a return for a specific item, extend UI to list order_items and call requestReturn(o.id, order_item_id) */}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="card bg-white p-4">
            <h3 className="font-medium mb-2">Historique des retours</h3>
            {returnsList.length === 0 ? (
              <div>Aucun retour.</div>
            ) : (
              returnsList.map((rt) => (
                <div key={rt.id} className="p-3 mb-2 border rounded">
                  <div className="font-medium">Retour #{String(rt.id).split("-")[0]}</div>
                  <div className="text-xs text-gray-500">
                    {rt.status} • {rt.requested_at ? new Date(rt.requested_at).toLocaleDateString() : "—"}
                  </div>
                  <div className="text-sm mt-1">{rt.reason}</div>
                  {rt.processed_at && <div className="text-xs text-gray-500 mt-1">Traité le: {new Date(rt.processed_at).toLocaleDateString()}</div>}
                  {rt.refund_amount != null && <div className="text-sm mt-1">Montant remboursé: {rt.refund_amount} FCFA</div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}