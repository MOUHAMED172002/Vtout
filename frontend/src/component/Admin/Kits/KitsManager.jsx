import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Pencil, Trash2, X, Check, ChevronDown, ShieldAlert } from "lucide-react";
import { useAuth } from "../../../lib/AuthHooks";
import { getAllBoutiques } from "../../../services/supplierService";
import { getKits, createKit, updateKit, deleteKit } from "../../../services/kitService";
import api from "../../../services/api";
import toast from "react-hot-toast";

const EMPTY_FORM = { name: "", description: "", bundle_price: "", boutique_id: "", component_ids: [] };

export default function KitsManager({ globalSearchQuery = "" }) {
  const { getToken } = useAuth();
  const [kits, setKits] = useState([]);
  const [boutiques, setBoutiques] = useState([]);
  const [boutiqueProducts, setBoutiqueProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editBoutiqueProducts, setEditBoutiqueProducts] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const [allKits, allBoutiques] = await Promise.all([
        getKits({}),
        getAllBoutiques(token),
      ]);
      setKits(allKits);
      setBoutiques(allBoutiques);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (boutiqueId, setter) => {
    if (!boutiqueId) { setter([]); return; }
    try {
      setProductsLoading(true);
      const { data } = await api.get("/products", { params: { boutique_id: boutiqueId, limit: 200 } });
      setter(Array.isArray(data) ? data : data.products || []);
    } catch {
      toast.error("Erreur chargement produits");
    } finally {
      setProductsLoading(false);
    }
  };

  const handleBoutiqueChange = (boutiqueId) => {
    setForm(f => ({ ...f, boutique_id: boutiqueId, component_ids: [] }));
    loadProducts(boutiqueId, setBoutiqueProducts);
  };

  const toggleComponent = (productId, formKey, setter) => {
    setter(f => {
      const ids = f.component_ids.includes(productId)
        ? f.component_ids.filter(id => id !== productId)
        : [...f.component_ids, productId];
      return { ...f, component_ids: ids };
    });
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return toast.error("Nom requis");
    if (!form.boutique_id) return toast.error("Boutique requise");
    if (form.component_ids.length < 2) return toast.error("Sélectionnez au moins 2 produits");
    if (!form.bundle_price || Number(form.bundle_price) <= 0) return toast.error("Prix du lot requis");
    try {
      setSubmitting(true);
      const token = await getToken();
      await createKit({ ...form, bundle_price: Number(form.bundle_price) }, token);
      toast.success("Kit créé !");
      setForm(EMPTY_FORM);
      setBoutiqueProducts([]);
      setShowCreate(false);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur création");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = async (kit) => {
    setEditingId(kit.id);
    const compIds = (kit.components || []).map(c => String(c.id));
    setEditForm({
      name: kit.name,
      description: kit.description || "",
      bundle_price: String(kit.bundle_price),
      boutique_id: String(kit.boutique_id),
      component_ids: compIds,
    });
    await loadProducts(kit.boutique_id, setEditBoutiqueProducts);
  };

  const handleUpdate = async () => {
    if (!editForm.name.trim()) return toast.error("Nom requis");
    if (editForm.component_ids.length < 2) return toast.error("Au moins 2 produits");
    if (!editForm.bundle_price || Number(editForm.bundle_price) <= 0) return toast.error("Prix requis");
    try {
      setSubmitting(true);
      const token = await getToken();
      await updateKit(editingId, { ...editForm, bundle_price: Number(editForm.bundle_price) }, token);
      toast.success("Kit mis à jour !");
      setEditingId(null);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Erreur mise à jour");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Désactiver ce kit ?")) return;
    try {
      const token = await getToken();
      await deleteKit(id, token);
      toast.success("Kit désactivé");
      fetchData();
    } catch {
      toast.error("Erreur suppression");
    }
  };

  const filtered = kits.filter(k =>
    k.name?.toLowerCase().includes(globalSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-base-content">Gestion des Kits</h2>
          <p className="text-sm text-base-content/50 mt-1">{kits.length} kit{kits.length !== 1 ? 's' : ''} au total</p>
        </div>
        <button
          onClick={() => setShowCreate(v => !v)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          {showCreate ? <X size={14} /> : <Plus size={14} />}
          {showCreate ? "Annuler" : "Nouveau Kit"}
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="bg-base-100 rounded-[2.5rem] p-8 shadow-xl border border-base-200 space-y-6"
          >
            <h3 className="text-lg font-black text-base-content">Créer un nouveau kit</h3>
            <KitForm
              form={form}
              setForm={setForm}
              boutiques={boutiques}
              products={boutiqueProducts}
              productsLoading={productsLoading}
              onBoutiqueChange={handleBoutiqueChange}
              onToggleComponent={(id) => toggleComponent(id, "component_ids", setForm)}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowCreate(false); setForm(EMPTY_FORM); }} className="px-5 py-2.5 rounded-xl border border-base-300 text-sm font-bold hover:bg-base-200 transition-colors">Annuler</button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
              >
                <Check size={13} /> {submitting ? "Création..." : "Créer le Kit"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kit list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 rounded-[2rem] bg-base-200 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center">
            <ShieldAlert size={32} className="text-base-content/30" />
          </div>
          <p className="font-black text-base-content/40">Aucun kit trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map((kit, i) => (
              <motion.div
                key={kit.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.04 }}
                className={`bg-base-100 rounded-[2rem] border p-6 space-y-4 ${editingId === kit.id ? 'border-indigo-300 shadow-lg shadow-indigo-100' : 'border-base-200'}`}
              >
                {editingId === kit.id ? (
                  <>
                    <KitForm
                      form={editForm}
                      setForm={setEditForm}
                      boutiques={boutiques}
                      products={editBoutiqueProducts}
                      productsLoading={productsLoading}
                      onBoutiqueChange={async (id) => {
                        setEditForm(f => ({ ...f, boutique_id: id, component_ids: [] }));
                        await loadProducts(id, setEditBoutiqueProducts);
                      }}
                      onToggleComponent={(id) => toggleComponent(id, "component_ids", setEditForm)}
                      disableBoutique
                    />
                    <div className="flex gap-2 justify-end pt-2">
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-xl border border-base-300 text-xs font-bold hover:bg-base-200 transition-colors">Annuler</button>
                      <button
                        onClick={handleUpdate}
                        disabled={submitting}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs px-5 py-2 rounded-xl transition-all"
                      >
                        <Check size={12} /> {submitting ? "Sauvegarde..." : "Sauvegarder"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${kit.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
                            {kit.is_active ? "Actif" : "Inactif"}
                          </span>
                          <span className="text-[9px] font-black text-base-content/30 uppercase tracking-widest">
                            {(kit.components || []).length} article{(kit.components || []).length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <h4 className="font-black text-base-content text-sm leading-tight line-clamp-2">{kit.name}</h4>
                        {kit.boutique && (
                          <p className="text-[10px] text-base-content/40 font-medium mt-0.5">{kit.boutique.name}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono font-black text-emerald-600 text-base">{Number(kit.bundle_price).toLocaleString()} F</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {(kit.components || []).map(c => (
                        <span key={c.id} className="inline-flex items-center gap-1 bg-base-200 rounded-lg px-2 py-1 text-[9px] font-black text-base-content/60 uppercase tracking-wide">
                          <Package size={8} /> {c.name}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => startEdit(kit)}
                        className="flex items-center gap-1.5 text-xs font-black text-indigo-600 hover:text-indigo-500 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors"
                      >
                        <Pencil size={11} /> Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(kit.id)}
                        className="flex items-center gap-1.5 text-xs font-black text-rose-500 hover:text-rose-400 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors"
                      >
                        <Trash2 size={11} /> Désactiver
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function KitForm({ form, setForm, boutiques, products, productsLoading, onBoutiqueChange, onToggleComponent, disableBoutique = false }) {
  const originalTotal = products
    .filter(p => form.component_ids.includes(String(p.id)))
    .reduce((sum, p) => sum + Number(p.price || 0), 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-base-content/50 mb-1.5 block">Nom du kit *</label>
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Pack Gaming Complet"
            className="input input-bordered w-full text-sm font-bold rounded-2xl"
          />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-base-content/50 mb-1.5 block">Prix du lot (F) *</label>
          <input
            type="number"
            value={form.bundle_price}
            onChange={e => setForm(f => ({ ...f, bundle_price: e.target.value }))}
            placeholder="0"
            className="input input-bordered w-full text-sm font-bold rounded-2xl"
          />
          {originalTotal > 0 && (
            <p className="text-[10px] text-base-content/40 mt-1">
              Total unitaire : <span className="font-black">{originalTotal.toLocaleString()} F</span>
              {Number(form.bundle_price) < originalTotal && (
                <span className="text-emerald-600 font-black ml-2">
                  (-{Math.round((1 - Number(form.bundle_price) / originalTotal) * 100)}%)
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-base-content/50 mb-1.5 block">Description</label>
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Description du kit..."
          rows={2}
          className="textarea textarea-bordered w-full text-sm font-medium rounded-2xl resize-none"
        />
      </div>

      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-base-content/50 mb-1.5 block">Boutique *</label>
        <div className="relative">
          <select
            value={form.boutique_id}
            onChange={e => onBoutiqueChange(e.target.value)}
            disabled={disableBoutique}
            className="select select-bordered w-full text-sm font-bold rounded-2xl appearance-none pr-10 disabled:opacity-60"
          >
            <option value="">Sélectionner une boutique</option>
            {boutiques.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
        </div>
      </div>

      {form.boutique_id && (
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-base-content/50 mb-2 block">
            Produits composants * <span className="text-base-content/30 normal-case font-medium">(min. 2)</span>
          </label>
          {productsLoading ? (
            <div className="flex items-center gap-2 text-xs text-base-content/40 py-4">
              <span className="loading loading-spinner loading-xs" /> Chargement des produits...
            </div>
          ) : products.length === 0 ? (
            <p className="text-xs text-base-content/40 py-4">Aucun produit dans cette boutique.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
              {products.map(p => {
                const selected = form.component_ids.includes(String(p.id));
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onToggleComponent(String(p.id))}
                    className={`text-left p-3 rounded-2xl border-2 transition-all text-xs font-bold leading-tight ${
                      selected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-base-300 bg-base-100 hover:border-base-400 text-base-content/70'
                    }`}
                  >
                    <div className="truncate">{p.name}</div>
                    <div className={`font-mono text-[10px] mt-0.5 ${selected ? 'text-emerald-600' : 'text-base-content/40'}`}>
                      {Number(p.price || 0).toLocaleString()} F
                    </div>
                    {selected && <Check size={10} className="text-emerald-500 mt-1" />}
                  </button>
                );
              })}
            </div>
          )}
          {form.component_ids.length > 0 && (
            <p className="text-[10px] text-base-content/40 mt-2">
              {form.component_ids.length} produit{form.component_ids.length !== 1 ? 's' : ''} sélectionné{form.component_ids.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
