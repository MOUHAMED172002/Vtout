import React, { useState, useEffect } from "react";
import { useAuth } from "../../../lib/clerk-shim";
import { getConfigsByGroup, upsertConfig } from "../../../services/configService";
import toast from "react-hot-toast";
import { Image, Key, Eye, EyeOff, Save, Loader2, Cloud, HardDrive, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function CloudinarySettings() {
  const { getToken } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSecret, setShowSecret] = useState(false);

  const [cloud, setCloud] = useState({
    CLOUDINARY_CLOUD_NAME: "",
    CLOUDINARY_API_KEY: "",
    CLOUDINARY_API_SECRET: "",
  });

  useEffect(() => {
    const fetchCloudinaryConfig = async () => {
      try {
        const data = await getConfigsByGroup("cloudinary");
        const map = {};
        data.forEach((c) => (map[c.key] = c.value));
        setCloud((prev) => ({ ...prev, ...map }));
      } catch (err) {
        console.error("Erreur chargement config Cloudinary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCloudinaryConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      for (const key in cloud) {
        await upsertConfig({ key, value: String(cloud[key]), group: "cloudinary" }, token);
      }
      toast.success("Configuration Cloudinary sauvegardée !");
    } catch (err) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse font-black text-slate-300 uppercase tracking-widest">
        Chargement de la configuration Cloudinary...
      </div>
    );

  const InputField = ({ label, name, type = "text", placeholder, hint, secret, icon: Icon }) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon size={18} />
          </div>
        )}
        <input
          type={secret ? (showSecret ? "text" : "password") : type}
          value={cloud[name]}
          onChange={(e) => setCloud({ ...cloud, [name]: e.target.value })}
          placeholder={placeholder}
          className={`w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl ${Icon ? "pl-14" : "px-6"} pr-12 font-bold text-sm focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 focus:outline-none transition-all`}
        />
        {secret && (
          <button
            type="button"
            onClick={() => setShowSecret(!showSecret)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
          >
            {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {hint && <p className="text-[10px] text-slate-400 ml-2 mt-1">{hint}</p>}
    </div>
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-[2rem] p-8 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Cloud size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter">Stockage Cloudinary</h1>
            <p className="text-white/70 text-sm mt-1">
              Configurez votre compte Cloudinary pour le stockage des images produits et bannières.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Cloudinary API Config */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8"
      >
        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
              <Key size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tighter">Identifiants API</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Clés d'accès au service de stockage
              </p>
            </div>
          </div>
          <a
            href="https://cloudinary.com/console"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-800 transition-colors border border-orange-200 px-4 py-2 rounded-xl"
          >
            Console Cloudinary →
          </a>
        </div>

        <div className="space-y-6">
          <InputField
            label="Cloud Name"
            name="CLOUDINARY_CLOUD_NAME"
            placeholder="daasozqy4"
            icon={Cloud}
            hint="Le nom de votre compte (Cloud Name)."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputField
              label="API Key"
              name="CLOUDINARY_API_KEY"
              placeholder="628742284252888"
              icon={Key}
              hint="Votre clé API Cloudinary."
            />
            <InputField
              label="API Secret"
              name="CLOUDINARY_API_SECRET"
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              secret
              icon={HardDrive}
              hint="Votre secret API Cloudinary."
            />
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
          <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <p className="font-black">Attention :</p>
            <p className="font-medium opacity-80 mt-1">
              Assurez-vous que votre compte est configuré pour accepter les uploads non-signés si nécessaire, 
              ou que ces clés correspondent bien au projet en cours. Une erreur ici bloquera l'ajout de nouveaux produits.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end"
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-orange-600 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Sauvegarde..." : "Enregistrer les Paramètres Cloud"}
        </button>
      </motion.div>
    </div>
  );
}
