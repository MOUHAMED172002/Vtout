import { getCategories, createCategory, deleteCategory } from "../../../services/productService";
import { useAuth } from "../../../lib/AuthHooks";;
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import {
  FolderPlus,
  Trash2,
  RefreshCcw,
  ChevronRight,
  Hash,
  Layers,
  X,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CategorySelect() {
  const { getToken } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [addingOpen, setAddingOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newParent, setNewParent] = useState(null);
  const [adding, setAdding] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const cats = await getCategories();
      setCategories(cats || []);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les catégories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const categoryMap = categories.reduce((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {});

  const handleDelete = async (cat) => {
    const prodCount = (cat.products || []).length;
    if (prodCount > 0) return toast.error("Catégorie utilisée par des produits");
    const childrenCount = (cat.children || []).length;
    if (childrenCount > 0) return toast.error("Cette catégorie a des sous-catégories");

    if (!window.confirm(`Supprimer "${cat.name}" ?`)) return;

    try {
      setDeletingId(cat.id);
      const token = await getToken();
      await deleteCategory(cat.id, token);
      toast.success("Catégorie supprimée");
      fetchAll();
    } catch (err) {
      toast.error("Erreur suppression");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      setAdding(true);
      const token = await getToken();
      await createCategory({
        name: newName.trim(),
        parent_id: newParent === "" ? null : newParent
      }, token);
      toast.success("Catégorie ajoutée");
      setNewName("");
      setNewParent(null);
      setAddingOpen(false);
      fetchAll();
    } catch (err) {
      toast.error("Erreur lors de l'ajout");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 z-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-[0.3em]">
            <Layers size={14} /> Structure
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Gestion des <span className="text-slate-400">Catégories</span></h1>
          <p className="text-slate-500 font-bold max-w-lg">Organisez votre catalogue avec une hiérarchie claire et intuitive.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={fetchAll} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all text-slate-400">
            <RefreshCcw size={18} />
          </button>
          <button
            onClick={() => setAddingOpen(!addingOpen)}
            className={`btn h-14 rounded-2xl px-8 font-black gap-2 shadow-lg transition-all ${addingOpen ? 'btn-ghost bg-white border-slate-100 text-slate-400' : 'btn-primary shadow-primary/20'}`}
          >
            {addingOpen ? <X size={20} /> : <Plus size={20} />}
            {addingOpen ? "Annuler" : "Nouvelle Catégorie"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {addingOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddSubmit} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nom de la catégorie</label>
                <div className="relative">
                  <Layers className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    className="w-full bg-slate-50 border-none rounded-2xl pl-16 pr-8 py-5 text-sm font-bold focus:ring-2 focus:ring-primary/20"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: Électronique, Vêtements..."
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Parent (optionnel)</label>
                <select
                  className="w-full bg-slate-50 border-none rounded-2xl px-8 py-5 text-sm font-bold focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer text-slate-900"
                  value={newParent ?? ""}
                  onChange={(e) => setNewParent(e.target.value === "" ? null : e.target.value)}
                >
                  <option value="">-- Aucun --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-3 flex justify-end">
                <button className="btn btn-primary h-14 rounded-2xl px-12 font-black shadow-xl shadow-primary/20" type="submit" disabled={adding}>
                  {adding ? "Création..." : "Confirmer la création"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center font-bold text-slate-300 uppercase tracking-widest text-xs animate-pulse">Chargement des catégories...</div>
        ) : categories.length > 0 ? (
          categories.map((c) => {
            const parent = c.parent_id ? categoryMap[c.parent_id] : null;
            const prodCount = (c.products || []).length;
            const hasChildren = (c.children || []).length > 0;
            return (
              <motion.div
                key={c.id}
                layout
                className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-50 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <Hash size={24} />
                  </div>
                  <button
                    onClick={() => handleDelete(c)}
                    className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900 leading-tight">{c.name}</h3>
                  {parent && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
                      <span>{parent.name}</span>
                      <ChevronRight size={10} />
                      <span>Sous-catégorie</span>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Produits</span>
                    <span className="text-lg font-black text-slate-900">{prodCount}</span>
                  </div>
                  {hasChildren && (
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Branches</span>
                      <span className="text-lg font-black text-slate-900">{(c.children || []).length}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 text-center">
            <p className="font-black text-slate-400 uppercase tracking-widest">Aucune catégorie définie</p>
          </div>
        )}
      </div>
    </div>
  );
}
