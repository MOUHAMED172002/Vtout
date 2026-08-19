import React, { useEffect, useState } from "react";
import { useAuth } from "../../../lib/AuthHooks";
import { getProducts, createProduct, updateProduct, deleteProduct, getProductById } from "../../../services/productService";
import ProductTable from "../Product/ProductTable";
import AddProductModal from "../Product/AddProductModal";
import EditProductModal from "../Product/EditProductModal";
import toast from "react-hot-toast";
import { Package, Plus, Search, Filter, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductsAdmin({ globalSearchQuery = "" }) {
  const { getToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [localSearch, setLocalSearch] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Use search if provided, otherwise fetch all admin-viewable products
      const query = localSearch || globalSearchQuery;
      const data = await getProducts({ 
        isAdmin: 'true', 
        approval_status: 'approved',
        search: query 
      });
      
      // Extract products from paginated response
      if (data && data.products) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Erreur chargement produits admin:", error);
      toast.error("Échec de la synchronisation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [globalSearchQuery]);

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
      // Le backend refuse volontairement de supprimer un produit déjà
      // commandé (pour ne pas casser l'historique des commandes existantes)
      // et renvoie un message explicite + une suggestion — on l'affiche tel
      // quel au lieu d'un "Erreur de suppression" générique qui cache la
      // vraie raison.
      const backendError = e?.response?.data?.error;
      const backendDetails = e?.response?.data?.details;
      toast.error(
        backendError
          ? `${backendError}${backendDetails ? ` ${backendDetails}` : ""}`
          : "Erreur de suppression",
        { duration: 6000 }
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 lg:space-y-12 animate-in fade-in duration-700 pb-10">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary font-black uppercase text-[10px] lg:text-xs tracking-[0.3em]">
            <Package size={14} /> Inventaire
          </div>
          <h1 className="text-3xl lg:text-5xl font-black text-gray-900 tracking-tighter">
            Gestion des <span className="text-base-content/40">Produits</span>
          </h1>
          <p className="text-xs lg:text-base text-base-content/50 font-bold max-w-lg">
            Gérez votre catalogue, mettez à jour les stocks et contrôlez vos prix.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:gap-4">
          <div className="flex items-center gap-3 bg-base-100 px-4 lg:px-6 py-2 lg:py-3 rounded-2xl border border-base-200 shadow-sm w-full lg:w-auto">
            <Search size={18} className="text-base-content/40" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
              placeholder="Chercher un produit..."
              className="bg-transparent border-none text-sm font-bold text-base-content/70 focus:ring-0 flex-1 lg:w-48"
            />
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button
              onClick={fetchProducts}
              className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center bg-base-100 rounded-2xl border border-base-200 shadow-sm hover:bg-base-200 transition-all text-base-content/40"
            >
              <RefreshCcw size={18} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 lg:flex-none btn btn-primary rounded-2xl px-6 lg:px-10 h-12 lg:h-14 font-black shadow-xl shadow-primary/20 gap-2 lg:gap-3 text-xs lg:text-sm"
            >
              <Plus size={18} /> <span className="truncate">Ajouter un produit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-base-100/50 backdrop-blur-sm rounded-[2.5rem] border border-gray-100 p-2 shadow-xl shadow-slate-200/50 overflow-hidden"
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
              className="absolute inset-0 bg-neutral/60 backdrop-blur-md"
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
              className="absolute inset-0 bg-neutral/60 backdrop-blur-md"
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
