import React, { useState, useEffect } from "react";
import { useAuth } from "../../../lib/AuthHooks";;
import { getConfigsByGroup, upsertConfig } from "../../../services/configService";
import toast from "react-hot-toast";
import { Settings, Globe, Share2, Shield, Save, Loader2, Link2, MapPin, Wrench, CheckCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import AddressSelector from "../../context/AddressSelector";
import api from "../../../services/api";

export default function StoreSettings() {
  const { getToken } = useAuth();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);

  // Grouped inputs
  const [branding, setBranding] = useState({ APP_NAME: "Vtout", LOGO_URL: "" });
  const [socials, setSocials] = useState({ FACEBOOK: "", INSTAGRAM: "", WHATSAPP: "", TWITTER: "" });
  const [location, setLocation] = useState({
    STORE_DEPT_ID: "", STORE_DEPT_LABEL: "",
    STORE_COMMUNE_ID: "", STORE_COMMUNE_LABEL: "",
    STORE_QUARTIER_ID: "", STORE_QUARTIER_LABEL: "",
    STORE_ADDRESS: "", STORE_LAT: "", STORE_LNG: "", STORE_PHONE: ""
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const data = await getConfigsByGroup('branding');
      const soc = await getConfigsByGroup('social');
      const loc = await getConfigsByGroup('location');

      const brandingMap = {};
      data.forEach(c => brandingMap[c.key] = c.value);
      setBranding(prev => ({ ...prev, ...brandingMap }));

      const socialMap = {};
      soc.forEach(c => socialMap[c.key] = c.value);
      setSocials(prev => ({ ...prev, ...socialMap }));

      const locationMap = {};
      loc.forEach(c => locationMap[c.key] = c.value);
      setLocation(prev => ({ ...prev, ...locationMap }));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (group, data) => {
    setSaving(true);
    try {
      const token = await getToken();
      for (const key in data) {
        await upsertConfig({ key, value: String(data[key]), group }, token);
      }
      toast.success("Réglages mis à jour !");
    } catch (err) {
      toast.error("Erreur de sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleFixVariantPrices = async () => {
    if (!window.confirm("⚠️ Cette action va mettre à jour les prix des variantes en base de données pour les aligner sur le prix public du produit. Continuer ?")) return;
    setMigrating(true);
    setMigrationResult(null);
    try {
      const token = await getToken();
      const { data } = await api.post('/admin/fix-variant-prices', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMigrationResult(data);
      toast.success(`✅ ${data.fixed} variante(s) corrigée(s) !`);
    } catch (err) {
      toast.error("Erreur lors de la migration des prix");
      console.error(err);
    } finally {
      setMigrating(false);
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse font-black text-slate-300 uppercase tracking-widest">Initialisation du Centre de Contrôle...</div>;

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-20">

      {/* BRANDING SECTION */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
              <Globe size={24} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Identité Visuelle</h2>
          </div>
          <button
            onClick={() => handleSave('branding', branding)}
            disabled={saving}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-primary transition-all disabled:bg-slate-200"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Enregistrer
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nom de l'Enseigne</label>
            <input
              value={branding.APP_NAME}
              onChange={(e) => setBranding({ ...branding, APP_NAME: e.target.value })}
              className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">URL du Logo Officiel</label>
            <input
              value={branding.LOGO_URL}
              onChange={(e) => setBranding({ ...branding, LOGO_URL: e.target.value })}
              className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* LOCATION SECTION */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
              <MapPin size={24} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Siège & Localisation</h2>
          </div>
          <button
            onClick={() => handleSave('location', location)}
            disabled={saving}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-primary transition-all disabled:bg-slate-200"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Enregistrer
          </button>
        </div>

        <div>
            <AddressSelector 
                initial={{
                    departement_label: location.STORE_DEPT_LABEL,
                    commune_label: location.STORE_COMMUNE_LABEL,
                    quartier_label: location.STORE_QUARTIER_LABEL,
                    address_line: location.STORE_ADDRESS,
                    phone: location.STORE_PHONE
                }}
                onSave={(payload) => {
                    handleSave('location', {
                        STORE_DEPT_ID: payload.departement_id,
                        STORE_DEPT_LABEL: payload.departement_label,
                        STORE_COMMUNE_ID: payload.commune_id,
                        STORE_COMMUNE_LABEL: payload.commune_label,
                        STORE_QUARTIER_ID: payload.quartier_id,
                        STORE_QUARTIER_LABEL: payload.quartier_label,
                        STORE_ADDRESS: payload.address_line,
                        STORE_LAT: payload.lat || 0,
                        STORE_LNG: payload.lng || 0,
                        STORE_PHONE: payload.phone
                    });
                }}
                requirePhone={true}
            />
        </div>
      </motion.div>

      {/* SOCIAL SECTION */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8">
        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
              <Share2 size={24} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Réseaux Sociaux</h2>
          </div>
          <button
            onClick={() => handleSave('social', socials)}
            disabled={saving}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-primary transition-all disabled:bg-slate-200"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Enregistrer
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.keys(socials).map(key => (
            <div key={key} className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{key}</label>
              <div className="relative">
                <Link2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  value={socials[key]}
                  onChange={(e) => setSocials({ ...socials, [key]: e.target.value })}
                  placeholder={`https://${key.toLowerCase()}.com/votre_profil`}
                  className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 font-bold text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* MAINTENANCE SECTION */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-amber-100 space-y-8">
        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
            <Wrench size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Maintenance des Données</h2>
            <p className="text-xs text-slate-400 font-bold mt-1">Outils de correction et de synchronisation de la base de données</p>
          </div>
        </div>

        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 space-y-4">
          <div>
            <h3 className="font-black text-slate-800 text-sm">Corriger les prix des variantes</h3>
            <p className="text-xs text-slate-500 mt-1">
              Certaines variantes en base de données peuvent avoir des prix taxés (ancienne méthode). 
              Cet outil aligne automatiquement les prix des variantes sur le <strong>prix public</strong> du produit parent.
            </p>
          </div>
          
          <button
            onClick={handleFixVariantPrices}
            disabled={migrating}
            className="flex items-center gap-3 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-amber-200"
          >
            {migrating ? <Loader2 className="animate-spin" size={16} /> : <Wrench size={16} />}
            {migrating ? "Migration en cours..." : "Lancer la correction des prix"}
          </button>

          {migrationResult && (
            <div className={`p-5 rounded-2xl border text-sm font-bold space-y-3 ${migrationResult.fixed > 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
              <div className="flex items-center gap-2">
                {migrationResult.fixed > 0 ? <CheckCircle size={18} className="text-emerald-500" /> : <AlertTriangle size={18} className="text-slate-400" />}
                <span>{migrationResult.message}</span>
              </div>
              <div className="text-xs font-bold text-slate-500 grid grid-cols-2 gap-2">
                <span>✅ Variantes corrigées : <strong className="text-slate-800">{migrationResult.fixed}</strong></span>
                <span>⏩ Déjà corrects : <strong className="text-slate-800">{migrationResult.skipped}</strong></span>
              </div>
              {migrationResult.details?.length > 0 && (
                <details className="text-[10px] text-slate-400 cursor-pointer">
                  <summary className="font-black uppercase tracking-widest">Voir le détail ({migrationResult.details.length})</summary>
                  <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                    {migrationResult.details.map((d, i) => (
                      <div key={i} className="flex justify-between gap-2 py-1 border-b border-slate-100">
                        <span className="truncate">{d.product_name}</span>
                        <span className="shrink-0">{d.old_price} F → <strong>{d.new_price} F</strong></span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
}
