import React, { useEffect, useState } from "react";
import { useAuth } from "../../../lib/clerk-shim";
import { getProducts, createProduct, updateProduct, deleteProduct, getProductById } from "../../../services/productService";
import ProductTable from "../Product/ProductTable";
import AddProductModal from "../Product/AddProductModal";
import EditProductModal from "../Product/EditProductModal";
import toast from "react-hot-toast";
import { Package, Plus, Search, Filter, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductsAdmin() {
  const { getToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  async function fetchProducts() {
    setLoading(true);
    try {
      // Charge uniquement les produits APPROUVÉS dans la liste générale
      const data = await getProducts({ isAdmin: 'true', approval_status: 'approved' });
      setProducts(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Échec de la synchronisation");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProducts(); }, []);

  async function handleCreate(payload) {
    const token = await getToken();
    await createProduct(payload, token);
    await fetchProducts();
  }

  async function handleUpdate(id, payload) {
    const token = await getToken();
    await updateProduct(id, payload, token);
    await fetchProducts();
  }

  async function handleDelete(id) {
    if (!window.confirm("Voulez-vous vraiment supprimer cet article ?")) return;
    setLoading(true);
    try {
      const token = await getToken();
      await deleteProduct(id, token);
      toast.success("Produit retiré du catalogue");
      await fetchProducts();
    } catch (e) {
      toast.error("Erreur de suppression");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-[0.3em]">
            <Package size={14} /> Inventaire
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Gestion des <span className="text-slate-400">Produits</span></h1>
          <p className="text-slate-500 font-bold max-w-lg">Gérez votre catalogue, mettez à jour les stocks et contrôlez vos prix fournisseurs.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Chercher un produit..."
              className="bg-transparent border-none text-sm font-bold text-slate-600 focus:ring-0 w-48"
            />
          </div>
          <button
            onClick={fetchProducts}
            className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all text-slate-400"
          >
            <RefreshCcw size={18} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary rounded-2xl px-10 h-14 font-black shadow-xl shadow-primary/20 gap-3"
          >
            <Plus size={20} /> Ajouter un produit
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-gray-100 p-2 shadow-xl shadow-slate-200/50 overflow-hidden"
      >
        <ProductTable
          products={products}
          loading={loading}
          onEdit={async (p) => {
            // Charge le produit complet (variants + fournisseur) avant d'ouvrir le modal
            try {
              const full = await getProductById(p.id);
              setEditingProduct(full);
            } catch {
              setEditingProduct(p); // fallback sur les données partielles
            }
            setShowEditModal(true);
          }}
          onDelete={handleDelete}
        />
      </motion.div>

      {/* --- ADD MODAL --- */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowAddModal(false)}
            />
            <AddProductModal
              onCreate={async (payload) => {
                try {
                  await handleCreate(payload);
                  setShowAddModal(false);
                  toast.success("Nouveau produit ajouté !");
                } catch (e) {
                  toast.error(e.message || "Erreur de création");
                  throw e; // rethrow to keep loading state in modal if needed
                }
              }}
              onClose={() => setShowAddModal(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* --- EDIT MODAL --- */}
      <AnimatePresence>
        {showEditModal && editingProduct && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => { setShowEditModal(false); setEditingProduct(null); }}
            />
            <EditProductModal
              product={editingProduct}
              onUpdated={async () => {
                await fetchProducts();
                setShowEditModal(false);
                setEditingProduct(null);
                toast.success("Mise à jour effectuée");
              }}
              onClose={() => {
                setShowEditModal(false);
                setEditingProduct(null);
              }}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
