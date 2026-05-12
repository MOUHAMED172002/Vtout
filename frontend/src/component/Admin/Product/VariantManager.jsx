import React, { useState, useEffect } from "react";
import {
  getAttributes,
  getAttributeValues,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  addAttributeValue,
  updateAttributeValue,
  deleteAttributeValue
} from "../../../services/productService";
import { useAuth } from "../../../lib/AuthHooks";
import toast from "react-hot-toast";
import {
  Plus,
  Edit3,
  Trash2,
  ChevronRight,
  ChevronDown,
  RefreshCcw,
  Tag,
  Layers,
  X,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VariantManager() {
  const { getToken } = useAuth();
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAttrId, setOpenAttrId] = useState(null);
  const [addingAttr, setAddingAttr] = useState(false);
  const [newAttrName, setNewAttrName] = useState("");
  const [editingAttrId, setEditingAttrId] = useState(null);
  const [editingAttrName, setEditingAttrName] = useState("");
  const [values, setValues] = useState([]);
  const [valueLoading, setValueLoading] = useState(false);
  const [addingValue, setAddingValue] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [editingValueId, setEditingValueId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const data = await getAttributes();
      setAttributes(data || []);
    } catch (err) {
      toast.error("Erreur lors du chargement des attributs");
      setAttributes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchValues = async (attributeId) => {
    setValueLoading(true);
    try {
      const data = await getAttributeValues(attributeId);
      setValues(data || []);
    } catch (err) {
      toast.error("Erreur lors du chargement des valeurs");
      setValues([]);
    } finally {
      setValueLoading(false);
    }
  };

  useEffect(() => { fetchAttributes(); }, []);

  useEffect(() => {
    if (openAttrId) fetchValues(openAttrId);
    else setValues([]);
    setAddingValue(false);
    setNewValue("");
    setEditingValueId(null);
    setEditingValue("");
  }, [openAttrId]);

  const handleAddAttribute = async (e) => {
    e?.preventDefault?.();
    if (!newAttrName.trim()) return;
    setAddingAttr(true);
    try {
      const token = await getToken();
      await createAttribute({ name: newAttrName.trim() }, token);
      toast.success("Attribut créé");
      setNewAttrName("");
      setAddingAttr(false);
      fetchAttributes();
    } catch (err) {
      toast.error("Erreur ajout attribut");
      setAddingAttr(false);
    }
  };

  const saveEditAttribute = async (attrId) => {
    if (!editingAttrName.trim()) return;
    try {
      const token = await getToken();
      await updateAttribute(attrId, { name: editingAttrName.trim() }, token);
      toast.success("Modifié");
      setEditingAttrId(null);
      fetchAttributes();
    } catch (err) {
      toast.error("Erreur modification");
    }
  };

  const deleteAttributeHandler = async (attrId) => {
    if (!window.confirm("Supprimer cet attribut et toutes ses valeurs ?")) return;
    try {
      const token = await getToken();
      await deleteAttribute(attrId, token);
      toast.success("Supprimé");
      if (openAttrId === attrId) setOpenAttrId(null);
      fetchAttributes();
    } catch (err) {
      toast.error("Erreur suppression");
    }
  };

  const handleAddValue = async (e) => {
    e?.preventDefault?.();
    if (!newValue.trim()) return;
    try {
      const token = await getToken();
      await addAttributeValue(openAttrId, newValue.trim(), token);
      setNewValue("");
      fetchValues(openAttrId);
    } catch (err) {
      toast.error("Erreur ajout valeur");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-[0.3em]">
            <Layers size={14} /> Catalogue
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Gestion des <span className="text-slate-400">Variantes</span></h1>
          <p className="text-slate-500 font-bold max-w-lg">Définissez les attributs comme la couleur, la taille ou la matière pour vos produits.</p>
        </div>
        <button onClick={fetchAttributes} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all text-slate-400">
          <RefreshCcw size={18} />
        </button>
      </div>

      {/* Add New Attribute Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50">
        <form onSubmit={handleAddAttribute} className="flex gap-4">
          <div className="flex-1 relative">
            <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400"
              placeholder="Ex: Taille, Couleur, Matière..."
              value={newAttrName}
              onChange={(e) => setNewAttrName(e.target.value)}
              disabled={addingAttr}
            />
          </div>
          <button
            className="btn btn-primary h-14 rounded-2xl px-8 font-black gap-2 shadow-lg shadow-primary/20"
            type="submit"
            disabled={addingAttr || !newAttrName.trim()}
          >
            <Plus size={20} /> Créer l'attribut
          </button>
        </form>
      </div>

      {/* Attributes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center font-bold text-slate-300 uppercase tracking-widest text-xs animate-pulse">Chargement des attributs...</div>
        ) : (
          attributes.map((attr) => (
            <div key={attr.id} className={`group bg-white rounded-[2rem] border transition-all duration-300 flex flex-col ${openAttrId === attr.id ? 'border-primary shadow-2xl ring-4 ring-primary/5' : 'border-slate-50 hover:border-slate-200 shadow-sm'}`}>
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${openAttrId === attr.id ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'}`}>
                    <Layers size={20} />
                  </div>
                  {editingAttrId === attr.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        autoFocus
                        className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm font-bold focus:ring-1 focus:ring-primary/20"
                        value={editingAttrName}
                        onChange={(e) => setEditingAttrName(e.target.value)}
                      />
                      <button onClick={() => saveEditAttribute(attr.id)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg"><Check size={16} /></button>
                      <button onClick={() => setEditingAttrId(null)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><X size={16} /></button>
                    </div>
                  ) : (
                    <div onClick={() => setOpenAttrId(openAttrId === attr.id ? null : attr.id)} className="cursor-pointer">
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors">{attr.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">#{attr.id}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {!editingAttrId && (
                    <>
                      <button onClick={() => { setEditingAttrId(attr.id); setEditingAttrName(attr.name); }} className="p-3 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"><Edit3 size={18} /></button>
                      <button onClick={() => deleteAttributeHandler(attr.id)} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                    </>
                  )}
                  <button onClick={() => setOpenAttrId(openAttrId === attr.id ? null : attr.id)} className={`p-3 rounded-xl transition-all ${openAttrId === attr.id ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-50'}`}>
                    {openAttrId === attr.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                </div>
              </div>

              {/* Values Subsection */}
              <AnimatePresence>
                {openAttrId === attr.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-50 bg-slate-50/50"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {valueLoading ? (
                          <div className="text-[10px] font-bold text-slate-400 animate-pulse">Chargement...</div>
                        ) : values.map(v => (
                          <div key={v.id} className="group/val relative flex items-center gap-2 bg-white border border-slate-100 rounded-xl pl-4 pr-3 py-2 shadow-sm hover:border-primary transition-all">
                            <span className="text-xs font-bold text-slate-600">{v.value}</span>
                            <button onClick={() => deleteValueHandler(v.id)} className="p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover/val:opacity-100 transition-all"><X size={12} /></button>
                          </div>
                        ))}
                        {values.length === 0 && !valueLoading && <p className="text-[10px] font-bold text-slate-300 italic">Aucune valeur définie</p>}
                      </div>

                      <form onSubmit={handleAddValue} className="flex gap-2">
                        <input
                          className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold focus:ring-1 focus:ring-primary/20"
                          placeholder="Nouvelle valeur..."
                          value={newValue}
                          onChange={(e) => setNewValue(e.target.value)}
                        />
                        <button type="submit" disabled={!newValue.trim()} className="bg-slate-900 text-white p-2 rounded-xl disabled:opacity-50"><Plus size={16} /></button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
