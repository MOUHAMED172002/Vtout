import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { getConfigsByGroup, upsertConfig } from "../../../services/configService";
import toast from "react-hot-toast";
import { Settings, Globe, Share2, Shield, Save, Loader2, Link2 } from "lucide-react";
import { motion } from "framer-motion";

export default function StoreSettings() {
  const { getToken } = useAuth();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Grouped inputs
  const [branding, setBranding] = useState({ APP_NAME: "EShop", LOGO_URL: "" });
  const [socials, setSocials] = useState({ FACEBOOK: "", INSTAGRAM: "", WHATSAPP: "", TWITTER: "" });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const data = await getConfigsByGroup('branding');
      const soc = await getConfigsByGroup('social');

      const brandingMap = {};
      data.forEach(c => brandingMap[c.key] = c.value);
      setBranding(prev => ({ ...prev, ...brandingMap }));

      const socialMap = {};
      soc.forEach(c => socialMap[c.key] = c.value);
      setSocials(prev => ({ ...prev, ...socialMap }));

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
        await upsertConfig({ key, value: data[key], group }, token);
      }
      toast.success("Réglages mis à jour !");
    } catch (err) {
      toast.error("Erreur de sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse font-black text-slate-300">CHARGEMENT DES RÉGLAGES...</div>;

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-20">

      {/* BRANDING SECTION */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8">
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
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nom de l'Application</label>
            <input
              value={branding.APP_NAME}
              onChange={(e) => setBranding({ ...branding, APP_NAME: e.target.value })}
              className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-sm focus:border-primary/40 focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">URL du Logo (SVG ou PNG)</label>
            <input
              value={branding.LOGO_URL}
              onChange={(e) => setBranding({ ...branding, LOGO_URL: e.target.value })}
              className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-sm focus:border-primary/40 focus:outline-none"
            />
          </div>
        </div>
      </motion.div>

      {/* SOCIAL SECTION */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8">
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
                  className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 font-bold text-sm focus:border-primary/40 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}