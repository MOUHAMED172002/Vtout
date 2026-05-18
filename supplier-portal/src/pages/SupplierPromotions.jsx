import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/clerk-shim';
import { getMySupplierProducts } from '../services/supplierService';
import { updateProduct } from '../services/productService';
import { Sparkles, Flame, Percent, Package, Search as SearchIcon, Edit, Trash2, PlusCircle, CheckCircle2, Clock, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const SupplierPromotions = ({ globalSearchQuery }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'flash', 'volume', 'kit'
  const { getToken } = useAuth();

  // Promotions management modal state
  const [activePromoProduct, setActivePromoProduct] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [promoForm, setPromoForm] = useState({
    is_flash_sale: false,
    flash_sale_end: '',
    is_kit: false,
    kit_items: [],
    volume_pricing_enabled: false,
    volume_pricing: [{ qty: 3, discount: 10 }, { qty: 5, discount: 20 }]
  });
  const [savingPromo, setSavingPromo] = useState(false);

  // Load products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const list = await getMySupplierProducts(token);
      setProducts(list || []);
    } catch (err) {
      console.error("Error loading products for promotions:", err);
      toast.error("Erreur de chargement des produits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const searchQuery = globalSearchQuery !== undefined ? globalSearchQuery : localSearch;

  // Filter products that have promotions active
  const promoProducts = products.filter(p => {
    const hasFlash = !!p.is_flash_sale;
    const hasVolume = !!p.volume_pricing;
    const hasKit = !!p.is_kit;
    
    // Match tabs
    if (activeTab === 'flash' && !hasFlash) return false;
    if (activeTab === 'volume' && !hasVolume) return false;
    if (activeTab === 'kit' && !hasKit) return false;
    if (activeTab === 'all' && !hasFlash && !hasVolume && !hasKit) return false;

    // Match search
    if (searchQuery) {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Products available to ADD new promotions
  const eligibleProductsForPromo = products.filter(p => {
    const hasFlash = !!p.is_flash_sale;
    const hasVolume = !!p.volume_pricing;
    const hasKit = !!p.is_kit;
    return !hasFlash && !hasVolume && !hasKit;
  });

  // Calculate statistics
  const stats = {
    total: products.filter(p => p.is_flash_sale || p.volume_pricing || p.is_kit).length,
    flash: products.filter(p => p.is_flash_sale).length,
    volume: products.filter(p => p.volume_pricing).length,
    kit: products.filter(p => p.is_kit).length
  };

  const openPromoModal = (product, isAdding = false) => {
    setActivePromoProduct(product);
    setIsAddMode(isAdding);

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
      toast.success(isAddMode ? "Promotion ajoutée !" : "Promotion mise à jour !");
      setActivePromoProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Save promotions error:", error);
      toast.error("Erreur de mise à jour de la promotion.");
    } finally {
      setSavingPromo(false);
    }
  };

  const handleRemovePromo = async (product) => {
    if (!window.confirm(`Voulez-vous vraiment retirer toutes les promotions actives sur "${product.name}" ?`)) return;
    
    try {
      const token = await getToken();
      const payload = {
        name: product.name,
        description: product.description,
        category_id: product.category_id,
        price: product.price,
        supplier_price: product.supplier_price,
        stock: product.stock,
        boutique_id: product.boutique_id,
        secondary_boutique_ids: product.secondary_boutique_ids,
        variants: product.variants,
        supplierLinks: product.supplierLinks,
        is_flash_sale: false,
        flash_sale_end: null,
        is_kit: false,
        kit_items: null,
        volume_pricing: null
      };

      await updateProduct(product.id, payload, token);
      toast.success("Promotions désactivées avec succès !");
      fetchProducts();
    } catch (err) {
      console.error("Remove promotions error:", err);
      toast.error("Erreur lors de la suppression de la promotion.");
    }
  };

  return (
    <div className="p-6 md:p-12 space-y-8 bg-slate-50 min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 font-black uppercase text-[10px] tracking-wider px-3 py-1 rounded-full shadow-sm">
            <Sparkles size={12} className="fill-indigo-50" /> Espace Promotions
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-2 uppercase">
            Mes Promotions Actives
          </h1>
          <p className="text-slate-500 font-bold text-xs">
            Suivez, modifiez et configurez les promotions (Ventes Flash, Prix Dégressifs, Packs Kits) de vos produits.
          </p>
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Promos */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-full translate-x-4 -translate-y-4 blur-xl pointer-events-none" />
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total en cours</span>
            <p className="font-mono text-3xl font-black text-slate-900 mt-0.5">{stats.total}</p>
          </div>
        </div>

        {/* Flash Sales */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-full translate-x-4 -translate-y-4 blur-xl pointer-events-none" />
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shrink-0">
            <Flame size={20} className="fill-rose-500" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Ventes Flash</span>
            <p className="font-mono text-3xl font-black text-slate-900 mt-0.5">{stats.flash}</p>
          </div>
        </div>

        {/* Volume Pricing */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-full translate-x-4 -translate-y-4 blur-xl pointer-events-none" />
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
            <Percent size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Paliers de quantité</span>
            <p className="font-mono text-3xl font-black text-slate-900 mt-0.5">{stats.volume}</p>
          </div>
        </div>

        {/* Kits */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-full translate-x-4 -translate-y-4 blur-xl pointer-events-none" />
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
            <Package size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Packs & Kits</span>
            <p className="font-mono text-3xl font-black text-slate-900 mt-0.5">{stats.kit}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
        
        {/* Search */}
        <div className="relative group max-w-md flex-1">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input 
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Rechercher une promotion..."
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all outline-none"
          />
        </div>

        {/* Tabs & Trigger */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-50 rounded-2xl p-1 border border-slate-100">
            {[
              { id: 'all', label: 'Toutes' },
              { id: 'flash', label: 'Flash' },
              { id: 'volume', label: 'Remises' },
              { id: 'kit', label: 'Kits' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Create Promotion */}
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn bg-indigo-500 hover:bg-indigo-600 border-none text-white rounded-2xl py-3 px-5 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/25">
              <PlusCircle size={16} /> Créer une Promotion
            </label>
            <ul tabIndex={0} className="dropdown-content menu p-3 shadow-2xl bg-white rounded-3xl border border-slate-100 w-72 mt-2 z-30 space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3 py-1 block">Sélectionnez un produit :</span>
              <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {eligibleProductsForPromo.length > 0 ? (
                  eligibleProductsForPromo.map(product => (
                    <li key={product.id}>
                      <button 
                        onClick={() => openPromoModal(product, true)}
                        className="flex flex-col items-start gap-1 p-2 hover:bg-slate-50 rounded-xl text-left w-full transition-all"
                      >
                        <span className="font-bold text-xs text-slate-800 line-clamp-1">{product.name}</span>
                        <span className="text-[9px] font-mono text-slate-400">{product.price} F CFA</span>
                      </button>
                    </li>
                  ))
                ) : (
                  <p className="text-[10px] text-center text-slate-400 font-bold py-4">Tous vos produits sont déjà en promotion !</p>
                )}
              </div>
            </ul>
          </div>
        </div>

      </div>

      {/* Main Promotions Table */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Produit</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Types de Promotion</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Détails / Règles</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 animate-pulse">
                    <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-1/3" /></td>
                    <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-1/4" /></td>
                    <td className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-1/2" /></td>
                    <td className="px-8 py-6"><div className="h-8 bg-slate-100 rounded w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : promoProducts.length > 0 ? (
                promoProducts.map((p) => (
                  <motion.tr 
                    key={p.id}
                    layout
                    className="border-b border-slate-100/80 hover:bg-slate-50/50 transition-all duration-200"
                  >
                    {/* Product Name & Image */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                          {p.images && p.images[0] ? (
                            <img src={p.images[0].image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={16} className="text-slate-300" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-800 text-sm tracking-tight line-clamp-1">{p.name}</h4>
                          <span className="font-mono text-[10px] font-bold text-slate-400">{p.price} F CFA</span>
                        </div>
                      </div>
                    </td>

                    {/* Promotion Active Badges */}
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-2">
                        {p.is_flash_sale && (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 border border-rose-100 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm animate-pulse">
                            <Flame size={12} className="fill-rose-500" /> Vente Flash
                          </span>
                        )}
                        {p.volume_pricing && (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                            <Percent size={12} /> Dégressif
                          </span>
                        )}
                        {p.is_kit && (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                            <Package size={12} /> Pack Kit
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Promotion Details / Rules Description */}
                    <td className="px-8 py-6">
                      <div className="text-xs font-semibold text-slate-500 space-y-1">
                        {p.is_flash_sale && (
                          <div className="flex items-center gap-1.5 text-rose-600">
                            <Clock size={12} />
                            <span>Fin de vente flash : {p.flash_sale_end ? new Date(p.flash_sale_end).toLocaleString('fr-FR') : "Non configuré"}</span>
                          </div>
                        )}
                        {p.volume_pricing && (
                          <div className="flex items-center gap-1.5 text-blue-600 font-bold">
                            <CheckCircle2 size={12} />
                            <span>Remise active (Volume) : {(() => {
                              try {
                                const tiers = typeof p.volume_pricing === 'string' ? JSON.parse(p.volume_pricing) : p.volume_pricing;
                                return Array.isArray(tiers) ? tiers.map(t => `${t.qty}x: -${t.discount}%`).join(' | ') : "Configuré";
                              } catch(e) { return "Active"; }
                            })()}</span>
                          </div>
                        )}
                        {p.is_kit && (
                          <div className="flex items-center gap-1.5 text-emerald-600">
                            <Package size={12} />
                            <span>Packs d'articles complémentaires configurés et combinés</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Quick Edit Actions */}
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openPromoModal(p)}
                          className="btn btn-sm btn-circle bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 border-none transition-all"
                          title="Modifier la promotion"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleRemovePromo(p)}
                          className="btn btn-sm btn-circle bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 border-none transition-all"
                          title="Supprimer la promotion"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Sparkles size={48} className="text-slate-200" />
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Aucune promotion trouvée</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promotions Unified Custom Modal */}
      {activePromoProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-xl w-full p-8 md:p-10 space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Sparkles className="text-indigo-500 animate-pulse" /> {isAddMode ? "Ajouter une Promotion" : "Modifier la Promotion"}
                </h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                  Produit : {activePromoProduct.name}
                </p>
              </div>
              <button 
                onClick={() => setActivePromoProduct(null)}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all font-black text-xl"
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
                            className="w-12 bg-slate-50 rounded p-1 text-center text-xs font-black outline-none border border-slate-200"
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
                            className="flex-1 bg-slate-50 rounded p-1 text-center text-xs font-black text-blue-600 outline-none border border-slate-200"
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
                            className="w-12 bg-slate-50 rounded p-1 text-center text-xs font-black outline-none border border-slate-200"
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
                            className="flex-1 bg-slate-50 rounded p-1 text-center text-xs font-black text-blue-600 outline-none border border-slate-200"
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
                    className="checkbox checkbox-success rounded-lg"
                  />
                  <div>
                    <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                      <Package size={16} className="text-emerald-500" /> Définir comme Pack Kit
                    </h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Combine plusieurs produits ensemble</p>
                  </div>
                </label>

                {promoForm.is_kit && (
                  <div className="space-y-3 pt-2 border-t border-slate-200/50 animate-in slide-in-from-top-2 duration-200">
                    <span className="text-[9px] font-black uppercase text-emerald-600 block">Produits dans le kit</span>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                      {products.filter(item => item.id !== activePromoProduct.id).map(item => {
                        const isChecked = promoForm.kit_items.includes(item.id);
                        return (
                          <label key={item.id} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-100 cursor-pointer select-none">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const list = e.target.checked 
                                  ? [...promoForm.kit_items, item.id]
                                  : promoForm.kit_items.filter(id => id !== item.id);
                                setPromoForm({ ...promoForm, kit_items: list });
                              }}
                              className="checkbox checkbox-xs rounded"
                            />
                            <span className="text-[10px] font-bold text-slate-700 line-clamp-1">{item.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setActivePromoProduct(null)}
                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black uppercase tracking-wider text-[10px] transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={handleSavePromo}
                disabled={savingPromo}
                className="flex-1 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-wider text-[10px] transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
              >
                {savingPromo ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <span>Enregistrer</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default SupplierPromotions;
