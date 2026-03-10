import React, { useEffect, useState } from "react";


/**
 * ShipmentsTimeline (mis à jour)
 * - Utilise supabase.auth.getUser() (supabase-js v2) pour récupérer la session.
 * - Tente d'enrichir l'en-tête avec auth.users + profiles si les policies RLS l'autorisent.
 * - Charge uniquement les expéditions liées aux commandes de l'utilisateur (sécurité).
 * - Sélection et affichage des événements de shipment (shipment_events).
 * - Sélections explicites des colonnes pour correspondre au schéma fourni et gestion robuste des erreurs / états non authentifiés.
 */

export default function ShipmentsTimeline() {
  const [userInfo, setUserInfo] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
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
            setShipments([]);
            setLoading(false);
          }
          return;
        }
        const sessionUser = sessionData.user;
        const userId = sessionUser.id;

        // enrich user info (auth.users may be blocked by RLS)
        const [authUsersRes, profileRes] = await Promise.all([
          supabase.from("auth.users").select("id,email,raw_user_meta_data,created_at").eq("id", userId).maybeSingle(),
          supabase.from("profiles").select("id,fullname,phone,avatar_url,role").eq("id", userId).maybeSingle()
        ]);
        const authUserData = authUsersRes && authUsersRes.data !== undefined ? authUsersRes.data : authUsersRes;
        const profileData = profileRes && profileRes.data !== undefined ? profileRes.data : profileRes;

        const mergedUser = {
          id: userId,
          email: (authUserData && authUserData.email) || sessionUser.email || null,
          fullname: (profileData && profileData.fullname) || null,
          phone: (profileData && profileData.phone) || sessionUser.phone || null,
          avatar_url: (profileData && profileData.avatar_url) || null,
          role: (profileData && profileData.role) || "user",
          created_at: (authUserData && authUserData.created_at) || sessionUser.created_at || null
        };

        if (!mounted) return;
        setUserInfo(mergedUser);

        // Load shipments related to user's orders:
        // First fetch user's order ids, then fetch shipments for these orders.
        const { data: ordersData, error: ordersErr } = await supabase
          .from("orders")
          .select("id")
          .eq("user_id", userId);

        if (ordersErr) {
          console.error("fetch orders error:", ordersErr);
          setShipments([]);
          return;
        }

        const orderIds = Array.isArray(ordersData) ? ordersData.map(o => o.id).filter(Boolean) : [];
        if (orderIds.length === 0) {
          setShipments([]);
          return;
        }

        const { data: shipmentsData, error: shipmentsErr } = await supabase
          .from("shipments")
          .select("id,order_id,carrier,tracking_number,tracking_url,status,estimated_delivery,created_at,updated_at,metadata")
          .in("order_id", orderIds)
          .order("created_at", { ascending: false });

        if (shipmentsErr) {
          throw shipmentsErr;
        }

        if (!mounted) return;
        setShipments(Array.isArray(shipmentsData) ? shipmentsData : (shipmentsData ? [shipmentsData] : []));
      } catch (err) {
        console.error("ShipmentsTimeline init error", err);
        setShipments([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    return () => { mounted = false; };
  }, []);

  async function open(s) {
    setSelected(s);
    setEvents([]);
    try {
      const { data: evData, error } = await supabase
        .from("shipment_events")
        .select("id,shipment_id,status,location,description,event_time")
        .eq("shipment_id", s.id)
        .order("event_time", { ascending: true });

      if (error) throw error;
      setEvents(Array.isArray(evData) ? evData : (evData ? [evData] : []));
    } catch (err) {
      console.error("load shipment events", err);
      setEvents([]);
    }
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Suivi des expéditions</h2>

      {userInfo && (
        <div className="mb-3 text-sm text-gray-600">
          Connecté en tant que: {userInfo.fullname || userInfo.email}
        </div>
      )}

      {loading ? (
        <div>Chargement...</div>
      ) : shipments.length === 0 ? (
        <div>Aucune expédition.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 space-y-2">
            {shipments.map((s) => (
              <button
                key={s.id}
                onClick={() => open(s)}
                className={`w-full text-left p-3 bg-white rounded border ${selected?.id === s.id ? "ring-2 ring-primary" : ""}`}
              >
                <div className="font-medium">{s.carrier || "Transporteur"}</div>
                <div className="text-xs">{s.tracking_number || "—"}</div>
                <div className="text-xs text-gray-500">{s.status || "—"}</div>
                {s.estimated_delivery && <div className="text-xs text-gray-400">Livraison estimée: {new Date(s.estimated_delivery).toLocaleDateString()}</div>}
              </button>
            ))}
          </div>

          <div className="md:col-span-2 card bg-white p-4">
            {selected ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium">Tracking: {selected.tracking_number || selected.id}</div>
                    <div className="text-xs text-gray-500">{selected.carrier || ""} • {selected.status || ""}</div>
                  </div>
                  {selected.tracking_url && (
                    <a href={selected.tracking_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">
                      Ouvrir le suivi
                    </a>
                  )}
                </div>

                <div className="space-y-2">
                  {events.length === 0 ? (
                    <div>Aucun événement.</div>
                  ) : (
                    events.map((e) => (
                      <div key={e.id} className="p-2 border rounded">
                        <div className="text-xs text-gray-500">{e.location ? `${e.location} • ` : ""}{e.event_time ? new Date(e.event_time).toLocaleString() : ""}</div>
                        <div className="mt-1 font-medium">{e.status}</div>
                        {e.description && <div className="text-sm text-gray-600 mt-1">{e.description}</div>}
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div>Sélectionnez une expédition pour voir la timeline.</div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}