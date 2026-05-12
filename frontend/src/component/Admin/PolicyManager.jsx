import React, { useEffect, useState } from "react";
import { useAuth } from "../../lib/AuthHooks";
import { getPolicies, createPolicy, updatePolicy, deletePolicy as apiDeletePolicy } from "../../services/contentService";
import toast from "react-hot-toast";
import { ShieldCheck, Save, Trash2, Edit2, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PolicyManager() {
  const { getToken } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [newPolicy, setNewPolicy] = useState({ title: "", content: "", type: "general" });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: "", content: "", type: "general" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const data = await getPolicies();
      setPolicies(data);
    } catch (err) {
      toast.error("Erreur de chargement");
    }
  };

  const addPolicy = async () => {
    if (!newPolicy.title || !newPolicy.content) return toast.error("Remplis tous les champs");
    setLoading(true);
    try {
      const token = await getToken();
      await createPolicy(newPolicy, token);
      toast.success("Politique ajoutée !");
      setNewPolicy({ title: "", content: "", type: "general" });
      fetchPolicies();
    } catch (err) {
      toast.error("Erreur lors de l’ajout");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (policy) => {
    setEditingId(policy.id);
    setEditData({ title: policy.title, content: policy.content, type: policy.type || "general" });
  };

  const saveEdit = async (id) => {
    try {
      const token = await getToken();
      await updatePolicy(id, editData, token);
      toast.success("Mis à jour !");
      setEditingId(null);
      fetchPolicies();
    } catch (err) {
      toast.error("Erreur de mise à jour");
    }
  };

  const deletePolicy = async (id) => {
    if (!confirm("Supprimer cette politique ?")) return;
    try {
      const token = await getToken();
      await apiDeletePolicy(id, token);
      toast.success("Supprimé !");
      fetchPolicies();
    } catch (err) {
      toast.error("Erreur de suppression");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
        <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
          <ShieldCheck className="text-primary" /> Nouvelle Politique
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Titre de la politique (ex: Livraison, Confidentialité)"
            value={newPolicy.title}
            onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold focus:outline-none focus:border-primary/40"
          />
          <select
            value={newPolicy.type}
            onChange={(e) => setNewPolicy({ ...newPolicy, type: e.target.value })}
            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold focus:outline-none focus:border-primary/40 appearance-none"
          >
            <option value="general">CGV / Conditions Générales</option>
            <option value="supplier">Contrat Fournisseur</option>
            <option value="delivery">Contrat Livreur</option>
            <option value="privacy">Politique de Confidentialité</option>
            <option value="return">Règlement des Retours</option>
          </select>
        </div>
        <textarea
          placeholder="Contenu détaillé..."
          value={newPolicy.content}
          onChange={(e) => setNewPolicy({ ...newPolicy, content: e.target.value })}
          className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold h-48 focus:outline-none focus:border-primary/40"
        ></textarea>

        <button
          onClick={addPolicy}
          disabled={loading}
          className="w-full bg-slate-900 text-white h-16 rounded-2xl font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-900/20 disabled:bg-slate-200"
        >
          {loading ? "Création..." : "Enregistrer la Politique"}
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 px-6">Documents Actifs</h2>
        <AnimatePresence>
          {policies.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between gap-6"
            >
              {editingId === p.id ? (
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-primary/20 bg-primary/5 font-bold"
                    />
                    <select
                      value={editData.type}
                      onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-primary/20 bg-primary/5 font-bold appearance-none"
                    >
                      <option value="general">CGV</option>
                      <option value="supplier">Contrat Fournisseur</option>
                      <option value="delivery">Contrat Livreur</option>
                      <option value="privacy">Confidentialité</option>
                      <option value="return">Retours</option>
                    </select>
                  </div>
                  <textarea
                    value={editData.content}
                    onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-primary/20 bg-primary/5 font-bold h-32"
                  ></textarea>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(p.id)} className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase flex items-center gap-2"><Save size={14} /> Enregistrer</button>
                    <button onClick={() => setEditingId(null)} className="px-6 py-2 bg-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase">Annuler</button>
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-black text-slate-900">{p.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${p.type === 'supplier' ? 'bg-indigo-100 text-indigo-600' :
                      p.type === 'delivery' ? 'bg-amber-100 text-amber-600' :
                        'bg-emerald-100 text-emerald-600'
                      }`}>
                      {p.type}
                    </span>
                  </div>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed line-clamp-3">{p.content}</p>
                </div>
              )}

              <div className="flex md:flex-col gap-2">
                <button
                  onClick={() => startEdit(p)}
                  className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => deletePolicy(p.id)}
                  className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div >
  );
}
