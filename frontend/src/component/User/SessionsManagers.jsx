import React, { useEffect, useState } from "react";


/**
 * SessionsManager (mis à jour)
 * - Utilise supabase.auth.getUser() (supabase-js v2) pour récupérer la session utilisateur.
 * - Tente de lire auth.users et profiles (si RLS le permet) pour enrichir userInfo en tête.
 * - Sélection explicite des colonnes depuis user_sessions selon le schéma.
 * - Vérifie la propriété de la session avant révocation et gère proprement les erreurs / états de chargement.
 */

export default function SessionsManager() {
  const [userInfo, setUserInfo] = useState(null);
  const [sessions, setSessions] = useState([]);
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
            setSessions([]);
            setLoading(false);
          }
          return;
        }
        const sessionUser = sessionData.user;
        const userId = sessionUser.id;

        // Attempt to enrich user info from auth.users and profiles (profiles is your public table)
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

        await loadSessions(userId, mounted);
      } catch (err) {
        console.error("SessionsManager init error", err);
        if (mounted) {
          setSessions([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    return () => { mounted = false; };
  }, []);

  // extracted loader to reuse after revoke
  async function loadSessions(userIdParam, mountedFlag = true) {
    setLoading(true);
    try {
      const session = await supabase.auth.getUser();
      const userId = userIdParam || (session.data && session.data.user && session.data.user.id);
      if (!userId) {
        setSessions([]);
        return;
      }

      const { data, error } = await supabase
        .from("user_sessions")
        .select("id,user_id,device,ip,user_agent,last_active,created_at,revoked")
        .eq("user_id", userId)
        .order("last_active", { ascending: false });

      if (error) throw error;
      if (mountedFlag) setSessions(Array.isArray(data) ? data : (data ? [data] : []));
    } catch (err) {
      console.error("load sessions", err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }

  async function revoke(id) {
    if (!confirm("Terminer cette session ?")) return;
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getUser();
      if (!sessionData || !sessionData.user) {
        alert("Vous devez être connecté(e) pour gérer les sessions.");
        return;
      }
      const userId = sessionData.user.id;

      // verify session belongs to user
      const { data: existing, error: fetchErr } = await supabase
        .from("user_sessions")
        .select("id,user_id,revoked")
        .eq("id", id)
        .maybeSingle();

      if (fetchErr) throw fetchErr;
      if (!existing) {
        alert("Session introuvable.");
        return;
      }
      if (existing.user_id !== userId) {
        alert("Vous n'avez pas la permission de révoquer cette session.");
        return;
      }
      if (existing.revoked) {
        alert("Cette session est déjà révoquée.");
        await loadSessions(userId);
        return;
      }

      const { error } = await supabase.from("user_sessions").update({ revoked: true }).eq("id", id);
      if (error) throw error;
      await loadSessions(userId);
    } catch (err) {
      console.error("revoke session", err);
      alert("Impossible de révoquer la session.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Sessions actives</h2>

      {userInfo && (
        <div className="mb-3 text-sm text-gray-600">
          Connecté en tant que: {userInfo.fullname || userInfo.email}
        </div>
      )}

      {loading ? (
        <div>Chargement...</div>
      ) : sessions.length === 0 ? (
        <div>Aucune session enregistrée.</div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div key={s.id} className="card bg-white p-3 flex justify-between items-center">
              <div>
                <div className="font-medium">{s.device || "Appareil"}</div>
                <div className="text-xs text-gray-500">
                  {s.ip || "—"} • {s.last_active ? new Date(s.last_active).toLocaleString() : (s.created_at ? new Date(s.created_at).toLocaleString() : "—")}
                </div>
                <div className="text-xs text-gray-400">{s.user_agent || ""}</div>
              </div>
              <div>
                {!s.revoked ? (
                  <button className="btn btn-xs btn-outline" onClick={() => revoke(s.id)}>Révoquer</button>
                ) : (
                  <span className="text-sm text-gray-500">Révoqué</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}