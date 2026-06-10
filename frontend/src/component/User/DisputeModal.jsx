import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Package, Truck, Tag, HelpCircle, Camera, Loader2, CheckCircle2 } from "lucide-react";
import api from "../../services/api";
import { uploadSingleImage } from "../../services/uploadService";
import toast from "react-hot-toast";

const MOTIFS = [
  { id: "Colis non reçu", label: "Colis non reçu", icon: Truck, color: "text-amber-500 bg-amber-50 border-amber-200" },
  { id: "Produit endommagé", label: "Produit endommagé", icon: Package, color: "text-rose-500 bg-rose-50 border-rose-200" },
  { id: "Produit différent de l'annonce", label: "Produit différent", icon: Tag, color: "text-violet-500 bg-violet-50 border-violet-200" },
  { id: "Autre", label: "Autre problème", icon: HelpCircle, color: "text-slate-500 bg-slate-50 border-slate-200" },
];

export default function DisputeModal({ order, getToken, onClose }) {
  const [motif, setMotif] = useState(null);
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const fileRef = useRef();

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!motif) return toast.error("Choisissez un motif");
    setLoading(true);
    try {
      const token = await getToken();
      let photo_url = null;
      if (photoFile) {
        try {
          const uploaded = await uploadSingleImage(photoFile, token);
          photo_url = typeof uploaded === 'string' ? uploaded : (uploaded?.url || uploaded?.secure_url || null);
        } catch { /* photo non bloquante */ }
      }

      await api.post(
        `/orders/${order.id}/dispute`,
        { motif, description: description.trim() || null, photo_url },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDone(true);
    } catch (err) {
      toast.error("Erreur lors du signalement");
    } finally {
      setLoading(false);
    }
  };

  const goWhatsApp = () => {
    const adminWa = import.meta.env.VITE_ADMIN_WHATSAPP || "22900000000";
    const text = `Bonjour, j'ai un problème avec ma commande #${order.id.slice(0, 8)} — Motif: ${motif}${description ? `. ${description}` : ""}`;
    window.open(`https://wa.me/${adminWa}?text=${encodeURIComponent(text)}`, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center">
              <AlertCircle size={20} className="text-rose-500" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">Signaler un problème</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Commande #{order.id.slice(0, 8)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} className="text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900">Signalement enregistré !</h4>
                  <p className="text-sm text-slate-500 mt-1 font-medium">
                    Notre équipe vous contactera sous 48h. Vous pouvez aussi nous écrire directement sur WhatsApp.
                  </p>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <button
                    onClick={goWhatsApp}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Continuer sur WhatsApp
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-3.5 bg-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
                  >
                    Fermer
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" className="space-y-5">
                {/* Motif */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Quel est le problème ?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {MOTIFS.map(({ id, label, icon: Icon, color }) => (
                      <button
                        key={id}
                        onClick={() => setMotif(id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center ${
                          motif === id
                            ? color + " border-current scale-[1.02] shadow-md"
                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                        }`}
                      >
                        <Icon size={20} />
                        <span className="text-[10px] font-black uppercase tracking-wide leading-tight">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Détails <span className="text-slate-300">(optionnel)</span></p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez le problème en quelques mots..."
                    rows={3}
                    className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-200 resize-none border-none"
                  />
                </div>

                {/* Photo */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Photo de preuve <span className="text-slate-300">(optionnel)</span></p>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                  {photoPreview ? (
                    <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100">
                      <img src={photoPreview} alt="preuve" className="w-full h-full object-cover" />
                      <button
                        onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                        className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
                      >
                        <X size={14} className="text-slate-600" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-rose-300 hover:text-rose-400 transition-all"
                    >
                      <Camera size={18} />
                      <span className="text-xs font-black uppercase tracking-widest">Ajouter une photo</span>
                    </button>
                  )}
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!motif || loading}
                  className="w-full py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-rose-600 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <AlertCircle size={16} />}
                  {loading ? "Envoi en cours..." : "Envoyer le signalement"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
