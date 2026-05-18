import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/clerk-shim';
import { getMySupplierProducts, updateProductStock } from '../services/supplierService';
import { deleteProduct, updateProduct } from '../services/productService';

import { useNavigate } from 'react-router-dom';
import { Package, Search as SearchIcon, Filter, MoreVertical, Edit, Trash2, CheckCircle, Clock, XCircle, Share2, Info, Sparkles, Flame, Percent } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const SupplierProducts = ({ globalSearchQuery }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const { getToken } = useAuth();

  const [activePromoProduct, setActivePromoProduct] = useState(null);
  const [promoForm, setPromoForm] = useState({
    is_flash_sale: false,
    flash_sale_end: '',
    is_kit: false,
    kit_items: [],
    volume_pricing_enabled: false,
    volume_pricing: [{ qty: 3, discount: 10 }, { qty: 5, discount: 20 }]
  });
  const [savingPromo, setSavingPromo] = useState(false);

  const openPromoModal = (product) => {
    setActivePromoProduct(product);
    let parsedVolumePricing = [{ qty: 3, discount: 10 }, { qty: 5, discount: 20 }];
    if (product.volume_pricing) {
      try {
        parsedVolumePricing = typeof product.volume_pricing === 'string' 
          ? JSON.parse(product.volume_pricing) 
          : product.volume_pricing;
      } catch (e) {}
    }
    
    let parsedKitItems = [];
    if (product.kit_items) {
      try {
        parsedKitItems = typeof product.kit_items === 'string'
          ? JSON.parse(product.kit_items)
          : product.kit_items;
      } catch (e) {}
    }

    setPromoForm({
      is_flash_sale: !!product.is_flash_sale,
      flash_sale_end: product.flash_sale_end ? new Date(product.flash_sale_end).toISOString().substring(0, 16) : '',
      is_kit: !!product.is_kit,
      kit_items: parsedKitItems || [],
      volume_pricing_enabled: !!product.volume_pricing,
      volume_pricing: parsedVolumePricing
    });
  };

  const handleSavePromo = async () => {
    if (!activePromoProduct) return;
    setSavingPromo(true);
    try {
      const token = await getToken();
      
      const payload = {
        name: activePromoProduct.name,
        description: activePromoProduct.description,
        category_id: activePromoProduct.category_id,
        price: activePromoProduct.price,
        supplier_price: activePromoProduct.supplier_price,
        stock: activePromoProduct.stock,
        boutique_id: activePromoProduct.boutique_id,
        secondary_boutique_ids: activePromoProduct.secondary_boutique_ids,
        variants: activePromoProduct.variants,
        supplierLinks: activePromoProduct.supplierLinks,
        is_flash_sale: promoForm.is_flash_sale,
        flash_sale_end: promoForm.is_flash_sale ? promoForm.flash_sale_end : null,
        is_kit: promoForm.is_kit,
        kit_items: promoForm.is_kit ? promoForm.kit_items : null,
        volume_pricing: promoForm.volume_pricing_enabled ? promoForm.volume_pricing : null
      };

      await updateProduct(activePromoProduct.id, payload, token);
      toast.success("Promotions mises à jour !");
      setActivePromoProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Save promotions error:", error);
      toast.error("Erreur de mise à jour des promotions");
    } finally {
      setSavingPromo(false);
    }
  };

  // Use global search if provided, otherwise fallback to local search
  const searchQuery = globalSearchQuery !== undefined ? globalSearchQuery : localSearch;

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

  const handleStockUpdate = async (productId, newStock) => {
    try {
      const token = await getToken();
      await updateProductStock(productId, newStock, token);
      setProducts(products.map(p => p.id === productId ? { ...p, stock: newStock } : p));
      toast.success("Stock mis à jour");
    } catch (error) {
      toast.error("Erreur mise à jour stock");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.")) return;
    try {
      const token = await getToken();
      await deleteProduct(id, token);
      toast.success("Produit supprimé avec succès");
      fetchProducts();
    } catch (error) {
      console.error('Delete error:', error);
      const msg = error.response?.data?.error || "Erreur lors de la suppression";
      toast.error(msg);
    }
  };


  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShare = (productId) => {
    const url = `${window.location.protocol}//${window.location.hostname}:5173/produit/${productId}`;
    if (navigator.share) {
      navigator.share({ title: 'Découvrez ce produit', url }).catch(() => { });
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
              value={searchQuery}
              onChange={(e) => globalSearchQuery !== undefined ? null : setLocalSearch(e.target.value)}
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
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Prix de vente</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Stock</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Promotions</th>
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
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.category?.name || 'Général'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-slate-900">{product.supplier_price?.toLocaleString()} F</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 group/stock">
                        <span className="text-sm font-black text-slate-900">
                          {product.total_stock !== undefined ? product.total_stock : (product.stock || 0)}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${(product.total_stock !== undefined ? product.total_stock : product.stock) > 10 ? 'bg-emerald-500' : (product.total_stock !== undefined ? product.total_stock : product.stock) > 0 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-1">
                        {product.is_flash_sale && (
                          <span className="inline-flex items-center gap-0.5 px-2.5 py-1 bg-rose-50 border border-rose-100 text-rose-500 rounded-lg text-[9px] font-black uppercase shadow-sm">
                            <Flame size={10} className="fill-rose-500 animate-pulse" /> Flash
                          </span>
                        )}
                        {product.volume_pricing && (
                          <span className="inline-flex items-center gap-0.5 px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-500 rounded-lg text-[9px] font-black uppercase shadow-sm">
                            <Percent size={10} /> Gros
                          </span>
                        )}
                        {product.is_kit && (
                          <span className="inline-flex items-center gap-0.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg text-[9px] font-black uppercase shadow-sm">
                            <Package size={10} /> Kit
                          </span>
                        )}
                        {!product.is_flash_sale && !product.volume_pricing && !product.is_kit && (
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">—</span>
                        )}
                      </div>
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
                        <button
                          onClick={() => openPromoModal(product)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="Gérer les promotions"
                        >
                          <Sparkles size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/edit-product/${product.id}`)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                          title="Modifier le produit"
                        >
                          <Edit size={18} />
                        </button>
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

      {/* Quick Promotions Modal */}
      {activePromoProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-xl w-full p-8 md:p-10 space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Sparkles className="text-indigo-500 animate-pulse" /> Gérer les Promotions
                </h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                  Produit : {activePromoProduct.name}
                </p>
              </div>
              <button 
                onClick={() => setActivePromoProduct(null)}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all font-bold"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <div className="space-y-6 pt-4">
              
              {/* 1. Flash Sales Option */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={promoForm.is_flash_sale}
                    onChange={(e) => setPromoForm({ ...promoForm, is_flash_sale: e.target.checked })}
                    className="checkbox checkbox-rose rounded-lg"
                  />
                  <div>
                    <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                      <Flame size={16} className="text-rose-500 fill-rose-500" /> Activer la Vente Flash
                    </h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Offre à durée limitée</p>
                  </div>
                </label>

                {promoForm.is_flash_sale && (
                  <div className="space-y-2 pt-2 border-t border-slate-200/50 animate-in slide-in-from-top-2 duration-200">
                    <label className="text-[9px] font-black uppercase text-rose-500 block">Fin de la promotion</label>
                    <input 
                      type="datetime-local" 
                      value={promoForm.flash_sale_end}
                      onChange={(e) => setPromoForm({ ...promoForm, flash_sale_end: e.target.value })}
                      className="w-full bg-white border border-rose-100 rounded-xl px-4 py-3 text-xs font-black text-rose-600 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* 2. Volume Pricing Option */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={promoForm.volume_pricing_enabled}
                    onChange={(e) => setPromoForm({ ...promoForm, volume_pricing_enabled: e.target.checked })}
                    className="checkbox checkbox-primary rounded-lg"
                  />
                  <div>
                    <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                      <Percent size={16} className="text-blue-500" /> Activer des remises sur quantité
                    </h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Plus l'acheteur achète, moins il paie</p>
                  </div>
                </label>

                {promoForm.volume_pricing_enabled && (
                  <div className="space-y-4 pt-2 border-t border-slate-200/50 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Tier 1 */}
                      <div className="bg-white p-3 rounded-xl border border-blue-100 space-y-1">
                        <span className="text-[8px] font-black text-slate-400 uppercase block">Palier 1</span>
                        <div className="flex gap-1.5">
                          <input 
                            type="number" 
                            placeholder="Qté" 
                            value={promoForm.volume_pricing[0]?.qty || 3}
                            onChange={(e) => {
                              const newTiers = [...promoForm.volume_pricing];
                              newTiers[0] = { ...newTiers[0], qty: parseInt(e.target.value) || 0 };
                              setPromoForm({ ...promoForm, volume_pricing: newTiers });
                            }}
                            className="w-12 bg-slate-50 rounded p-1 text-center text-xs font-black"
                          />
                          <input 
                            type="number" 
                            placeholder="Remise %" 
                            value={promoForm.volume_pricing[0]?.discount || 10}
                            onChange={(e) => {
                              const newTiers = [...promoForm.volume_pricing];
                              newTiers[0] = { ...newTiers[0], discount: parseInt(e.target.value) || 0 };
                              setPromoForm({ ...promoForm, volume_pricing: newTiers });
                            }}
                            className="flex-1 bg-slate-50 rounded p-1 text-center text-xs font-black text-blue-600"
                          />
                        </div>
                      </div>

                      {/* Tier 2 */}
                      <div className="bg-white p-3 rounded-xl border border-blue-100 space-y-1">
                        <span className="text-[8px] font-black text-slate-400 uppercase block">Palier 2</span>
                        <div className="flex gap-1.5">
                          <input 
                            type="number" 
                            placeholder="Qté" 
                            value={promoForm.volume_pricing[1]?.qty || 5}
                            onChange={(e) => {
                              const newTiers = [...promoForm.volume_pricing];
                              newTiers[1] = { ...newTiers[1], qty: parseInt(e.target.value) || 0 };
                              setPromoForm({ ...promoForm, volume_pricing: newTiers });
                            }}
                            className="w-12 bg-slate-50 rounded p-1 text-center text-xs font-black"
                          />
                          <input 
                            type="number" 
                            placeholder="Remise %" 
                            value={promoForm.volume_pricing[1]?.discount || 20}
                            onChange={(e) => {
                              const newTiers = [...promoForm.volume_pricing];
                              newTiers[1] = { ...newTiers[1], discount: parseInt(e.target.value) || 0 };
                              setPromoForm({ ...promoForm, volume_pricing: newTiers });
                            }}
                            className="flex-1 bg-slate-50 rounded p-1 text-center text-xs font-black text-blue-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Product Kits Option */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={promoForm.is_kit}
                    onChange={(e) => setPromoForm({ ...promoForm, is_kit: e.target.checked })}
                    className="checkbox checkbox-secondary rounded-lg"
                  />
                  <div>
                    <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                      <Package size={16} className="text-emerald-500" /> Vendre comme Kit / Pack
                    </h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Associer ce produit à d'autres</p>
                  </div>
                </label>

                {promoForm.is_kit && (
                  <div className="space-y-2 pt-2 border-t border-slate-200/50 animate-in slide-in-from-top-2 duration-200">
                    <span className="text-[9px] font-black uppercase text-emerald-600 block mb-1">Sélectionner les articles du Kit</span>
                    <div className="max-h-32 overflow-y-auto space-y-1.5 bg-white p-3 rounded-xl border border-emerald-100">
                      {products.filter(p => p.id !== activePromoProduct.id).map(p => (
                        <label key={p.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-slate-50 rounded">
                          <input 
                            type="checkbox" 
                            value={p.id}
                            checked={promoForm.kit_items.includes(p.id)}
                            onChange={(e) => {
                              const current = [...promoForm.kit_items];
                              if (e.target.checked) {
                                setPromoForm({ ...promoForm, kit_items: [...current, p.id] });
                              } else {
                                setPromoForm({ ...promoForm, kit_items: current.filter(id => id !== p.id) });
                              }
                            }}
                            className="checkbox checkbox-secondary checkbox-xs rounded"
                          />
                          <span className="text-xs font-bold text-slate-700">{p.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 pt-6 border-t border-slate-100">
              <button 
                onClick={() => setActivePromoProduct(null)}
                className="flex-1 py-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={handleSavePromo}
                disabled={savingPromo}
                className="flex-1 py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
              >
                {savingPromo ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierProducts;
