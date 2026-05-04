import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/clerk-shim';
import { getMySupplierProducts } from '../services/supplierService';
import { deleteProduct } from '../services/productService';

import { Package, Search as SearchIcon, Filter, MoreVertical, Edit, Trash2, CheckCircle, Clock, XCircle, Share2, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const SupplierProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { getToken } = useAuth();

  const fetchProducts = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const data = await getMySupplierProducts(token);
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [getToken]);

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.")) return;
    try {
      const token = await getToken();
      await deleteProduct(id, token);
      toast.success("Produit supprimé avec succès");
      fetchProducts();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("Erreur lors de la suppression");
    }
  };


  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleShare = (productId) => {
    const url = `${window.location.protocol}//${window.location.hostname}:5173/produit/${productId}`;
    if (navigator.share) {
        navigator.share({ title: 'Découvrez ce produit', url }).catch(() => {});
    } else {
        navigator.clipboard.writeText(url);
        toast.success('Lien copié !');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">Approuvé</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-full">Rejeté</span>;
      default:
        return <span className="px-3 py-1 bg-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full">En attente</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Mes Produits</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Gérez votre catalogue d'articles</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 outline-none shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Produit</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Prix Gros</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={product.id} 
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                          {product.images?.[0] ? (
                            <img src={product.images[0].image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-full h-full p-4 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{product.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.category_id || 'Electronique'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-slate-900">{product.supplier_price?.toLocaleString()} F</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <div>{getStatusBadge(product.approval_status)}</div>
                        {product.approval_status === 'rejected' && product.admin_feedback && (
                          <div className="text-[10px] text-rose-500 font-bold flex items-start gap-1 max-w-[200px]">
                            <Info size={12} className="mt-0.5 shrink-0" />
                            <span>{product.admin_feedback}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a href={`/modifier-produit/${product.id}`} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                          <Edit size={18} />
                        </a>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>

                        <button onClick={() => handleShare(product.id)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all">
                          <Share2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Package size={48} className="text-slate-200" />
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Aucun produit trouvé</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierProducts;
