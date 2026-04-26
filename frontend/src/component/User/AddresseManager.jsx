import React, { useEffect, useState } from "react";
import { useAuth, useUser } from "../../lib/clerk-shim";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Plus, Pencil, Trash2, CheckCircle2, Star, Phone,
  X, AlertTriangle, Home, Loader2
} from "lucide-react";
import { getMyAddresses, createAddress, updateAddress, deleteAddress } from "../../services/addressService";
import AddressSelector from "../context/AddressSelector";

// ─── Skeleton Card ──────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="p-5 rounded-[1.8rem] border border-slate-100 bg-white space-y-4 animate-pulse">
    <div className="h-5 w-32 bg-slate-100 rounded-full" />
    <div className="h-4 w-48 bg-slate-50 rounded-full" />
    <div className="h-3 w-24 bg-slate-50 rounded-full" />
    <div className="flex gap-2 mt-3">
      <div className="h-8 w-8 rounded-xl bg-slate-100" />
      <div className="h-8 w-8 rounded-xl bg-slate-100" />
    </div>
  </div>
);

// ─── Main ────────────────────────────────────────────────────────────────────
export default function AddressesManager() {
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectorOpen, setSelectorOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [busy, setBusy] = useState({
    deleting: null,
    settingDefault: null,
    saving: false,
    loadingList: false,
  });

  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null, label: "" });

  // ── Toast ──
  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Init ──
  useEffect(() => {
    if (isLoaded && user) loadAddresses();
    else if (isLoaded && !user) setLoading(false);
  }, [isLoaded, user]);

  async function loadAddresses() {
    setBusy((b) => ({ ...b, loadingList: true }));
    try {
      const token = await getToken();
      const data = await getMyAddresses(token);
      setAddresses(data || []);
    } catch (e) {
      console.error(e);
      showToast("error", "Impossible de charger les adresses.");
    } finally {
      setBusy((b) => ({ ...b, loadingList: false }));
      setLoading(false);
    }
  }

  const openAdd = () => { setEditingAddress(null); setSelectorOpen(true); };
  const openEdit = (addr) => { setEditingAddress(addr); setSelectorOpen(true); };

  async function handleSave(addr) {
    setSelectorOpen(false);
    setBusy((b) => ({ ...b, saving: true }));
    try {
      const token = await getToken();
      if (addr.id) await updateAddress(addr.id, addr, token);
      else await createAddress(addr, token);
      await loadAddresses();
      showToast("success", "Adresse enregistrée avec succès !");
    } catch (e) {
      console.error(e);
      showToast("error", "Erreur lors de l'enregistrement.");
    } finally {
      setBusy((b) => ({ ...b, saving: false }));
    }
  }

  async function confirmDelete() {
    const id = confirm.id;
    setConfirm({ open: false, id: null, label: "" });
    if (!id) return;
    setBusy((b) => ({ ...b, deleting: id }));
    try {
      const token = await getToken();
      await deleteAddress(id, token);
      await loadAddresses();
      showToast("success", "Adresse supprimée.");
    } catch (e) {
      console.error(e);
      showToast("error", "Erreur lors de la suppression.");
    } finally {
      setBusy((b) => ({ ...b, deleting: null }));
    }
  }

  async function makeDefault(id) {
    setBusy((b) => ({ ...b, settingDefault: id }));
    try {
      const token = await getToken();
      await updateAddress(id, { is_default: true }, token);
      await loadAddresses();
      showToast("success", "Adresse par défaut mise à jour !");
    } catch (e) {
      console.error(e);
      showToast("error", "Impossible de définir l'adresse par défaut.");
    } finally {
      setBusy((b) => ({ ...b, settingDefault: null }));
    }
  }

  const isLooping = busy.loadingList || loading;

  return (
    <section className="space-y-6">

      {/* ── Toast notification ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`flex items-center justify-between gap-4 px-5 py-4 rounded-2xl text-sm font-bold shadow-lg ${toast.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-rose-50 text-rose-700 border border-rose-100"
              }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === "success"
                ? <CheckCircle2 size={18} className="shrink-0" />
                : <AlertTriangle size={18} className="shrink-0" />}
              {toast.text}
            </div>
            <button onClick={() => setToast(null)} className="opacity-50 hover:opacity-100 transition-opacity">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
            <MapPin size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Mes adresses</h2>
            {user && (
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {addresses.length} adresse{addresses.length !== 1 ? "s" : ""} enregistrée{addresses.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openAdd}
          disabled={isLooping || busy.saving}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full shadow-xl shadow-slate-900/20 transition-all disabled:opacity-50"
        >
          <Plus size={14} />
          Nouvelle adresse
        </motion.button>
      </div>

      {/* ── Address List ── */}
      {isLooping ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : addresses.length === 0 ? (
        /* ── Empty State ── */
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center gap-6 py-20 border-4 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30"
        >
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner">
            <Home size={36} className="text-slate-200" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
              Aucune adresse enregistrée
            </p>
            <p className="text-xs text-slate-300 font-bold">
              Ajoutez une adresse pour faciliter vos commandes
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={openAdd}
            className="flex items-center gap-2 bg-slate-900 text-white text-xs font-black uppercase tracking-widest px-8 py-4 rounded-full shadow-xl"
          >
            <Plus size={14} /> Ajouter une adresse
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence>
            {addresses.map((a) => {
              const isDeleting = busy.deleting === a.id;
              const isSetting = busy.settingDefault === a.id;
              return (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative rounded-[1.8rem] border-2 overflow-hidden shadow-sm transition-all duration-300 bg-white ${a.is_default
                      ? "border-emerald-400 shadow-emerald-100 ring-2 ring-emerald-400/20"
                      : "border-slate-100 hover:border-slate-200 hover:shadow-md"
                    }`}
                >
                  {/* Card header */}
                  <div
                    className={`px-6 py-4 flex items-center justify-between ${a.is_default ? "bg-slate-900" : "bg-slate-800"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-slate-900">
                        <MapPin size={15} />
                      </div>
                      <span className="font-black text-slate-900 text-sm truncate max-w-[140px]">
                        {a.label || "Adresse"}
                      </span>
                    </div>
                    {a.is_default && (
                      <div className="flex items-center gap-1.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                        <Star size={9} fill="currentColor" /> Par défaut
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="px-6 py-5 space-y-3">
                    <p className="text-base font-black text-slate-900 leading-tight">
                      {[a.quartier_label, a.commune_label].filter(Boolean).join(", ") || a.address_line}
                    </p>
                    {(a.quartier_label || a.commune_label) && a.address_line && (
                      <p className="text-xs text-slate-500 font-bold">{a.address_line}</p>
                    )}
                    {a.phone && (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Phone size={13} />
                        <span className="text-xs font-bold">{a.phone}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                      {!a.is_default ? (
                        <button
                          onClick={() => makeDefault(a.id)}
                          disabled={isDeleting || isSetting}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-40"
                        >
                          {isSetting
                            ? <Loader2 size={12} className="animate-spin" />
                            : <CheckCircle2 size={12} />}
                          Définir par défaut
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                          <CheckCircle2 size={12} /> Active
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openEdit(a)}
                          disabled={isDeleting || isSetting}
                          className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center transition-all disabled:opacity-40"
                        >
                          <Pencil size={14} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setConfirm({ open: true, id: a.id, label: a.label })}
                          disabled={isDeleting || isSetting}
                          className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition-all disabled:opacity-40"
                        >
                          {isDeleting
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Trash2 size={14} />}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Address Form Modal ── */}
      <AnimatePresence>
        {selectorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-center items-end sm:items-center p-4 sm:p-6"
            style={{ backdropFilter: "blur(12px)", background: "rgba(15,15,26,0.6)" }}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 bg-slate-900">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-slate-900">
                    <MapPin size={18} />
                  </div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    {editingAddress ? "Modifier l'adresse" : "Nouvelle adresse"}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectorOpen(false)}
                  className="w-9 h-9 rounded-xl bg-white/10 text-slate-900/60 hover:bg-white/20 hover:text-slate-900 flex items-center justify-center transition-all"
                >
                  <X size={18} />
                </button>
              </div>
              {/* Modal body */}
              <div className="p-8">
                <AddressSelector
                  initial={editingAddress}
                  onSave={handleSave}
                  onCancel={() => setSelectorOpen(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {confirm.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-center items-center p-4"
            style={{ backdropFilter: "blur(8px)", background: "rgba(15,15,26,0.5)" }}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 space-y-6"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center">
                  <AlertTriangle size={28} className="text-rose-500" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Supprimer l'adresse</h4>
                  <p className="text-sm text-slate-500 font-bold mt-2">
                    Voulez-vous vraiment supprimer{" "}
                    <strong className="text-slate-700">
                      {confirm.label || "cette adresse"}
                    </strong>{" "}
                    ? Cette action est irréversible.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirm({ open: false, id: null, label: "" })}
                  className="flex-1 py-3 rounded-2xl bg-slate-50 text-slate-600 text-sm font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Annuler
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-2xl bg-rose-500 text-white text-sm font-black uppercase tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-200"
                >
                  Supprimer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
