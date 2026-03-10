import React, { useEffect, useState } from "react";


/**
 * PaymentsHistory (mis à jour)
 * - Récupère l'utilisateur via supabase.auth.getUser() (supabase-js v2)
 * - Lit auth.users + profiles si possible pour enrichir userInfo (gestion RLS)
 * - Récupère uniquement les paiements liés aux commandes de l'utilisateur (sécurité)
 * - Sélection explicite des colonnes depuis payments conformément au schéma
 */

export default function PaymentsHistory() {
  const [userInfo, setUserInfo] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        // Récupère la session utilisateur (supabase-js v2)
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userData || !userData.user) {
          if (mounted) {
            setUserInfo(null);
            setItems([]);
            setLoading(false);
          }
          return;
        }
        const sessionUser = userData.user;
        const userId = sessionUser.id;

        // Lire auth.users (si RLS le permet) et profiles en parallèle pour enrichir userInfo
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
          phone: (profileData && profileData.phone) || null,
          avatar_url: (profileData && profileData.avatar_url) || null,
          role: (profileData && profileData.role) || "user",
          created_at: (authUserData && authUserData.created_at) || sessionUser.created_at || null
        };

        if (!mounted) return;
        setUserInfo(mergedUser);

        // Pour garantir qu'on ne récupère que les paiements de cet utilisateur,
        // on récupère d'abord les order ids de l'utilisateur, puis on récupère les paiements
        const { data: ordersData, error: ordersErr } = await supabase
          .from("orders")
          .select("id")
          .eq("user_id", userId);

        if (ordersErr) {
          console.error("fetch orders for payments scope error:", ordersErr);
          setItems([]);
          return;
        }

        const orderIds = Array.isArray(ordersData) ? ordersData.map((o) => o.id).filter(Boolean) : [];
        if (orderIds.length === 0) {
          // pas de commandes = pas de paiements
          setItems([]);
          return;
        }

        // Récupérer les paiements pour ces order ids
        // Colonnes sélectionnées explicitement : id,order_id,method,status,transaction_ref,amount,created_at
        const { data: paymentsData, error: paymentsErr } = await supabase
          .from("payments")
          .select("id,order_id,method,status,transaction_ref,amount,created_at")
          .in("order_id", orderIds)
          .order("created_at", { ascending: false })
          .limit(50);

        if (paymentsErr) {
          console.error("fetch payments error:", paymentsErr);
          setItems([]);
          return;
        }

        if (!mounted) return;
        setItems(Array.isArray(paymentsData) ? paymentsData : (paymentsData ? [paymentsData] : []));
      } catch (err) {
        console.error("load payments error", err);
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Historique des paiements</h2>

      {/* En-tête utilisateur optionnelle */}
      {userInfo && (
        <div className="mb-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
            {userInfo.avatar_url ? (
              <img src={userInfo.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-500">{(userInfo.fullname && userInfo.fullname.charAt(0)) || "U"}</span>
            )}
          </div>
          <div>
            <div className="font-medium">{userInfo.fullname || userInfo.email || "Utilisateur"}</div>
            <div className="text-xs text-gray-500">{userInfo.email || ""}</div>
          </div>
        </div>
      )}

      {loading ? (
        <div>Chargement...</div>
      ) : items.length === 0 ? (
        <div>Aucun paiement trouvé.</div>
      ) : (
        <div className="space-y-2">
          {items.map((p) => (
            <div key={p.id} className="card bg-white p-3 flex justify-between items-center">
              <div>
                <div className="font-medium">{p.method || "Méthode inconnue"} • {p.status || "—"}</div>
                <div className="text-xs text-gray-500">Réf: {p.transaction_ref || "—"}</div>
                <div className="text-xs">{p.created_at ? new Date(p.created_at).toLocaleString() : "—"}</div>
              </div>
              <div className="font-semibold">{p.amount != null ? `${p.amount} FCFA` : "—"}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}