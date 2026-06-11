import React, { useEffect, useState } from "react";


/**
 * InvoicesList (mis à jour)
 * - Utilise supabase.auth.getUser() (supabase-js v2) pour récupérer l'utilisateur connecté.
 * - Tente aussi de lire la table système auth.users (si vos policies RLS l'autorisent)
 *   et la table publique profiles pour enrichir les infos utilisateur si besoin.
 * - Sélection explicite des colonnes depuis invoices selon le schéma fourni.
 * - Gestion robuste des cas où pdf_path est manquant ou l'accès au storage échoue.
 */

export default function InvoicesList() {
  const [userInfo, setUserInfo] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        // Récupère l'utilisateur de session (supabase-js v2)
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userData || !userData.user) {
          if (mounted) {
            setUserInfo(null);
            setInvoices([]);
            setLoading(false);
          }
          return;
        }
        const sessionUser = userData.user;
        const userId = sessionUser.id;

        // On fait les requêtes en parallèle :
        // - auth.users pour email/meta (peut être bloquée par RLS)
        // - profiles si vous stockez des champs publics (fullname, avatar, ...)
        // - invoices (colonnes explicitement listées)
        const [authUsersRes, profileRes, invoicesRes] = await Promise.all([
          supabase.from("auth.users").select("id,email,raw_user_meta_data,created_at").eq("id", userId).maybeSingle(),
          supabase.from("profiles").select("id,fullname,phone,avatar_url,role").eq("id", userId).maybeSingle(),
          supabase
            .from("invoices")
            .select("id,invoice_number,total_amount,tax_amount,status,issued_at,pdf_path,order_id,created_at,updated_at")
            .eq("user_id", userId)
            .order("issued_at", { ascending: false })
        ]);

        const authUserData = authUsersRes && authUsersRes.data !== undefined ? authUsersRes.data : authUsersRes;
        const profileData = profileRes && profileRes.data !== undefined ? profileRes.data : profileRes;
        const invoicesData = invoicesRes && invoicesRes.data !== undefined ? invoicesRes.data : invoicesRes;

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
        setInvoices(Array.isArray(invoicesData) ? invoicesData : (invoicesData ? [invoicesData] : []));
      } catch (err) {
        console.error("Invoices load error", err);
        if (mounted) setInvoices([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  async function download(invoice) {
    try {
      if (!invoice || !invoice.pdf_path) {
        alert("Reçus non générée pour le moment.");
        return;
      }
      const bucket = "invoices";
      // createSignedUrl retourne { data: { signedUrl }, error } ou { data, error } selon client
      const { data: signedData, error } = await supabase.storage.from(bucket).createSignedUrl(invoice.pdf_path, 60 * 5);
      if (error) throw error;
      // signedData peut contenir signedUrl ou signedUrl property
      const signedUrl = signedData?.signedUrl || signedData?.signed_url || (signedData && signedData.signedUrl) || null;
      if (!signedUrl) throw new Error("Signed URL non retournée");
      window.open(signedUrl, "_blank");
    } catch (err) {
      console.error("download invoice error", err);
      alert("Impossible de récupérer la facture. Vérifiez les permissions du bucket et le chemin.");
    }
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Mes reçus</h2>

      {/* En-tête utilisateur optionnel */}
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
      ) : invoices.length === 0 ? (
        <div>Aucune facture trouvée.</div>
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => (
            <div key={inv.id} className="card bg-base-100 p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{inv.invoice_number || `Reçus ${inv.id}`}</div>
                <div className="text-sm text-gray-500">
                  {inv.status || "—"} • {inv.issued_at ? new Date(inv.issued_at).toLocaleDateString() : "—"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="font-semibold">{inv.total_amount != null ? `${inv.total_amount} FCFA` : "—"}</div>
                <button className="btn btn-sm btn-outline" onClick={() => download(inv)}>Télécharger</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}