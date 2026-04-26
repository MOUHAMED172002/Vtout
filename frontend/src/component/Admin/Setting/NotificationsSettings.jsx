import React, { useState, useEffect } from "react";
import { useAuth } from "../../../lib/clerk-shim";
import { getConfigsByGroup, upsertConfig } from "../../../services/configService";
import toast from "react-hot-toast";
import { Mail, Key, Eye, EyeOff, Save, Loader2, CheckCircle, AlertTriangle, Send } from "lucide-react";
import { motion } from "framer-motion";

export default function NotificationsSettings() {
  const { getToken } = useAuth();
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);

  const [email, setEmail] = useState({
    RESEND_API_KEY: "",
    ADMIN_NOTIF_EMAIL: "abdoul172002@gmail.com",
    MAIL_FROM_NAME: "Vtout",
    MAIL_FROM_ADDRESS: "noreply@vtout.com",
  });

  useEffect(() => {
    const fetchEmailConfig = async () => {
      try {
        const data = await getConfigsByGroup("email");
        const map = {};
        data.forEach((c) => (map[c.key] = c.value));
        setEmail((prev) => ({ ...prev, ...map }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmailConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await getToken();
      for (const key in email) {
        await upsertConfig({ key, value: String(email[key]), group: "email" }, token);
      }
      toast.success("Configuration email sauvegardée !");
    } catch (err) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!email.ADMIN_NOTIF_EMAIL) {
      toast.error("Veuillez d'abord renseigner l'email de notification.");
      return;
    }
    setTesting(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/config/test-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          credentials: "include",
          body: JSON.stringify({ to: email.ADMIN_NOTIF_EMAIL }),
        }
      );
      if (res.ok) {
        toast.success(`Email de test envoyé à ${email.ADMIN_NOTIF_EMAIL} !`);
      } else {
        toast.error("Échec de l'envoi. Vérifiez la clé API Resend.");
      }
    } catch {
      toast.error("Erreur réseau lors du test.");
    } finally {
      setTesting(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse font-black text-slate-300 uppercase tracking-widest">
        Chargement de la configuration email...
      </div>
    );

  const InputField = ({ label, name, type = "text", placeholder, hint, secret }) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{label}</label>
      <div className="relative">
        <input
          type={secret ? (showKey ? "text" : "password") : type}
          value={email[name]}
          onChange={(e) => setEmail({ ...email, [name]: e.target.value })}
          placeholder={placeholder}
          className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 pr-12 font-bold text-sm focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all"
        />
        {secret && (
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
          >
            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
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
        className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[2rem] p-8 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Mail size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter">Email & Notifications</h1>
            <p className="text-white/70 text-sm mt-1">
              Configurez le service d'envoi d'emails (Resend) et les adresses de notification.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3"
      >
        <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-black">Pour que les emails fonctionnent en production :</p>
          <ol className="list-decimal list-inside mt-1 space-y-1 font-medium">
            <li>
              Créez un compte sur{" "}
              <a href="https://resend.com" target="_blank" rel="noreferrer" className="underline font-black">
                resend.com
              </a>
            </li>
            <li>Ajoutez et vérifiez votre domaine <strong>vtout.com</strong></li>
            <li>Copiez votre clé API ci-dessous</li>
            <li>Mettez à jour l'adresse expéditeur avec un email de votre domaine vérifié</li>
          </ol>
        </div>
      </motion.div>

      {/* Resend API Config */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8"
      >
        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-violet-50 text-violet-500 rounded-2xl flex items-center justify-center">
              <Key size={22} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tighter">Clé API Resend</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Service d'envoi d'emails transactionnels
              </p>
            </div>
          </div>
          <a
            href="https://resend.com/api-keys"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] font-black uppercase tracking-widest text-violet-600 hover:text-violet-800 transition-colors border border-violet-200 px-4 py-2 rounded-xl"
          >
            Générer une clé →
          </a>
        </div>

        <div className="space-y-6">
          <InputField
            label="Clé API Resend (re_...)"
            name="RESEND_API_KEY"
            placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            secret
            hint="Votre clé API Resend. Commence par 're_'. Ne la partagez jamais."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Nom expéditeur"
              name="MAIL_FROM_NAME"
              placeholder="Vtout"
              hint="Le nom affiché dans la boîte de réception du destinataire"
            />
            <InputField
              label="Adresse expéditeur"
              name="MAIL_FROM_ADDRESS"
              type="email"
              placeholder="noreply@vtout.com"
              hint="Doit être un email de votre domaine vérifié sur Resend"
            />
          </div>
        </div>
      </motion.div>

      {/* Notification Email */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8"
      >
        <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
            <Mail size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tighter">Email de Notification Admin</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Adresse qui reçoit les alertes de nouvelles commandes
            </p>
          </div>
        </div>

        <InputField
          label="Email de notification"
          name="ADMIN_NOTIF_EMAIL"
          type="email"
          placeholder="abdoul172002@gmail.com"
          hint="Cet email recevra une alerte à chaque nouvelle commande et événement important."
        />

        {/* Status + Test */}
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-4">
          <CheckCircle size={18} className="text-emerald-500 shrink-0" />
          <div>
            <p className="text-sm font-black text-emerald-700">Email actuel configuré</p>
            <p className="text-xs text-emerald-600 font-medium">{email.ADMIN_NOTIF_EMAIL || "Non configuré"}</p>
          </div>
          <div className="ml-auto">
            <button
              onClick={handleTestEmail}
              disabled={testing}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black hover:bg-emerald-600 transition-all disabled:opacity-60"
            >
              {testing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {testing ? "Envoi..." : "Envoyer un test"}
            </button>
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
          className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-primary transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Sauvegarde en cours..." : "Sauvegarder la configuration"}
        </button>
      </motion.div>
    </div>
  );
}