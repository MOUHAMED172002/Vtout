import React, { useState, useEffect } from "react";
import { useAuth } from "../../../lib/clerk-shim";
import { getConfigsByGroup, upsertConfig } from "../../../services/configService";
import toast from "react-hot-toast";
import { MessageSquare, Key, Eye, EyeOff, Save, Loader2, Phone, Hash, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function WhatsAppSettings() {
  const { getToken } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showToken, setShowToken] = useState(false);

  const [whatsapp, setWhatsapp] = useState({
    whatsapp_instance_id: "",
    whatsapp_api_token: "",
    whatsapp_admin_phones: "",
  });

  useEffect(() => {
    const fetchWhatsAppConfig = async () => {
      try {
        const data = await getConfigsByGroup("whatsapp");
        const map = {};
        data.forEach((c) => (map[c.key] = c.value));
        setWhatsapp((prev) => ({ ...prev, ...map }));
      } catch (err) {
        console.error("Erreur chargement config WhatsApp:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWhatsAppConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      for (const key in whatsapp) {
        await upsertConfig({ key, value: String(whatsapp[key]), group: "whatsapp" }, token);
      }
      toast.success("Configuration WhatsApp sauvegardée !");
    } catch (err) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse font-black text-slate-300 uppercase tracking-widest">
        Chargement de la configuration WhatsApp...
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
          type={secret ? (showToken ? "text" : "password") : type}
          value={whatsapp[name]}
          onChange={(e) => setWhatsapp({ ...whatsapp, [name]: e.target.value })}
          placeholder={placeholder}
          className={`w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl ${Icon ? "pl-14" : "px-6"} pr-12 font-bold text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 focus:outline-none transition-all`}
        />
        {secret && (
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
          >
            {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
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
        className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[2rem] p-8 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <MessageSquare size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter">WhatsApp (Green API)</h1>
            <p className="text-white/70 text-sm mt-1">
              Gérez les notifications automatiques et les alertes administratrices via WhatsApp.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Green API Instance Config */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8"
      >
        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
              <Key size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tighter">Paramètres Green API</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Identifiants requis pour l'envoi des messages
              </p>
            </div>
          </div>
          <a
            href="https://console.green-api.com/"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-800 transition-colors border border-emerald-200 px-4 py-2 rounded-xl"
          >
            Console Green API →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <InputField
            label="ID Instance"
            name="whatsapp_instance_id"
            placeholder="7107XXXXXX"
            icon={Hash}
            hint="L'identifiant de votre instance Green API."
          />
          <InputField
            label="Token API"
            name="whatsapp_api_token"
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            secret
            icon={Key}
            hint="Le jeton d'accès de votre instance."
          />
        </div>
      </motion.div>

      {/* Admin WhatsApp Phones */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8"
      >
        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
          <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center">
            <Phone size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tighter">Numéros Admin WhatsApp</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Recevez les alertes de commandes et erreurs système
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <InputField
            label="Numéros Administrateurs"
            name="whatsapp_admin_phones"
            placeholder="22997000000, 229XXXXXXXX"
            icon={Phone}
            hint="Séparez plusieurs numéros par des virgules. Format international sans le +."
          />
          
          <div className="p-5 bg-sky-50 rounded-2xl border border-sky-100 flex gap-3">
            <AlertCircle size={20} className="text-sky-500 shrink-0" />
            <div className="text-xs text-sky-800 space-y-1">
              <p className="font-black uppercase tracking-tight">Format Requis :</p>
              <p className="font-medium opacity-80">
                Utilisez le format complet sans le signe plus. <br />
                Exemple : <strong>22997000000</strong> pour le Bénin.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notification Toggles */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8"
      >
        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
            <AlertCircle size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tighter">Activation des Notifications</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Choisissez qui reçoit des alertes WhatsApp
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: "notif_whatsapp_customer", label: "Clients", sub: "Confirmation & Suivi" },
            { id: "notif_whatsapp_supplier", label: "Fournisseurs", sub: "Nouvelles Commandes" },
            { id: "notif_whatsapp_deliverer", label: "Livreurs", sub: "Assignations" },
          ].map((item) => (
            <label key={item.id} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:border-emerald-200 transition-all group">
              <input
                type="checkbox"
                checked={whatsapp[item.id] !== "false"}
                onChange={(e) => setWhatsapp({ ...whatsapp, [item.id]: String(e.target.checked) })}
                className="w-6 h-6 rounded-lg border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <p className="text-sm font-black text-slate-900">{item.label}</p>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{item.sub}</p>
              </div>
            </label>
          ))}
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
          className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Sauvegarde en cours..." : "Enregistrer la Configuration"}
        </button>
      </motion.div>
    </div>
  );
}
