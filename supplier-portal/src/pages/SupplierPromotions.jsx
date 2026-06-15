import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../components/clerk-shim';
import { getMySupplierProducts } from '../services/supplierService';
import { updateProduct } from '../services/productService';
import { Sparkles, Flame, Percent, Package, Search as SearchIcon, Edit, Trash2, Plus, Clock, CheckCircle2, X, ArrowLeft, Image as ImageIcon, Tag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { getDeliveryFeeTiers, computePublicPrice, reverseSupplierPrice } from '../services/deliveryFeeService';

const SupplierPromotions = ({ globalSearchQuery }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); 
  const [deliveryTiers, setDeliveryTiers] = useState([]);
  const { getToken } = useAuth();

  // Modal & Flow State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1); // 1: Select Product, 2: Configure Promo
  const [productSearch, setProductSearch] = useState('');
  
  const [activePromoProduct, setActivePromoProduct] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  
  const [promoForm, setPromoForm] = useState({
    is_flash_sale: false,
    flash_sale_end: '',
    is_kit: false,
    kit_items: [],
    volume_pricing_enabled: false,
    volume_pricing: [{ qty: 3, discount: 10 }, { qty: 5, discount: 20 }],
    is_promo: false,
    old_supplier_price: '',
    discount_percent: '',
    supplier_price: '',
    kit_price: ''
  });
  const [savingPromo, setSavingPromo] = useState(false);

  // Load products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const [list, tiersData] = await Promise.all([
        getMySupplierProducts(token),
        getDeliveryFeeTiers()
      ]);
      setProducts(list || []);
      setDeliveryTiers(tiersData || []);
    } catch (err) {
      console.error("Error loading products/tiers:", err);
      toast.error("Erreur de chargement des produits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const searchQuery = globalSearchQuery !== undefined ? globalSearchQuery : localSearch;

  // Filter Active Promotions
  const promoProducts = products.filter(p => {
    const hasFlash = !!p.is_flash_sale;
    const hasVolume = !!p.volume_pricing;
    const hasKit = !!p.is_kit;
    const hasPromo = p.old_price && parseFloat(p.old_price) > parseFloat(p.price);
    
    if (activeTab === 'flash' && !hasFlash) return false;
    if (activeTab === 'volume' && !hasVolume) return false;
    if (activeTab === 'kit' && !hasKit) return false;
    if (activeTab === 'promo' && !hasPromo) return false;
    if (activeTab === 'all' && !hasFlash && !hasVolume && !hasKit && !hasPromo) return false;

    if (searchQuery) {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Eligible products for new promos
  const eligibleProductsForPromo = products.filter(p => {
    const hasFlash = !!p.is_flash_sale;
    const hasVolume = !!p.volume_pricing;
    const hasKit = !!p.is_kit;
    const hasPromo = p.old_price && parseFloat(p.old_price) > parseFloat(p.price);
    return !hasFlash && !hasVolume && !hasKit && !hasPromo;
  }).filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));

  const selectedKitProducts = useMemo(() => {
    if (!activePromoProduct || promoForm.kit_items.length === 0) return [];
    return products.filter(item => item.id !== activePromoProduct.id && promoForm.kit_items.includes(item.id));
  }, [activePromoProduct, promoForm.kit_items, products]);

  const kitBundleValue = useMemo(() => {
    if (!activePromoProduct) return 0;
    const baseValue = parseFloat(activePromoProduct.price) || 0;
    return selectedKitProducts.reduce((sum, item) => sum + (parseFloat(item.price) || 0), baseValue);
  }, [activePromoProduct, selectedKitProducts]);

  const kitPublicPreview = computePublicPrice(parseFloat(promoForm.supplier_price) || activePromoProduct?.supplier_price || 0, deliveryTiers);

  const stats = {
    total: products.filter(p => p.is_flash_sale || p.volume_pricing || p.is_kit || (p.old_price && parseFloat(p.old_price) > parseFloat(p.price))).length,
    flash: products.filter(p => p.is_flash_sale).length,
    volume: products.filter(p => p.volume_pricing).length,
    kit: products.filter(p => p.is_kit).length,
    promo: products.filter(p => p.old_price && parseFloat(p.old_price) > parseFloat(p.price)).length
  };

  // Open Modal to Create New Promo
  const handleStartNewPromo = () => {
    setIsAddMode(true);
    setModalStep(1);
    setActivePromoProduct(null);
    setProductSearch('');
    setIsModalOpen(true);
  };

  // Select Product in Step 1
  const handleSelectProduct = (product) => {
    setActivePromoProduct(product);
    setPromoForm({
      is_flash_sale: false,
      flash_sale_end: '',
      is_kit: false,
      kit_items: [],
      volume_pricing_enabled: false,
      volume_pricing: [{ qty: 3, discount: 10 }, { qty: 5, discount: 20 }],
      is_promo: false,
      old_supplier_price: product.supplier_price || '',
      discount_percent: '',
      supplier_price: product.supplier_price || '',
      kit_price: product.price || ''
    });
    setModalStep(2);
  };

  // Open Modal to Edit Existing Promo
  const handleEditPromo = (product) => {
    setIsAddMode(false);
    setActivePromoProduct(product);
    
    let parsedVolumePricing = [{ qty: 3, discount: 10 }, { qty: 5, discount: 20 }];
    if (product.volume_pricing) {
      try {
        const raw = typeof product.volume_pricing === 'string'
          ? JSON.parse(product.volume_pricing)
          : product.volume_pricing;
        parsedVolumePricing = raw.map(t => ({ qty: t.qty ?? t.min_qty ?? t.min ?? 1, discount: t.discount ?? 0 }));
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

    const currentSupPrice = parseFloat(product.supplier_price) || 0;
    const hasPromo = product.old_price && parseFloat(product.old_price) > parseFloat(product.price);
    const oldSupPrice = hasPromo
      ? (reverseSupplierPrice(product.old_price, deliveryTiers) || currentSupPrice)
      : currentSupPrice;
    const isPromoActive = !!hasPromo;
    let calculatedDiscountPercent = '';
    if (isPromoActive && oldSupPrice > currentSupPrice && currentSupPrice > 0) {
      const pct = Math.round(((oldSupPrice - currentSupPrice) / oldSupPrice) * 100);
      if (pct > 0) calculatedDiscountPercent = pct;
    }

    setPromoForm({
      is_flash_sale: !!product.is_flash_sale,
      flash_sale_end: product.flash_sale_end ? new Date(product.flash_sale_end).toISOString().substring(0, 16) : '',
      is_kit: !!product.is_kit,
      kit_items: parsedKitItems || [],
      volume_pricing_enabled: !!product.volume_pricing,
      volume_pricing: parsedVolumePricing,
      is_promo: isPromoActive,
      old_supplier_price: oldSupPrice,
      discount_percent: calculatedDiscountPercent,
      supplier_price: product.supplier_price || '',
      kit_price: product.price || ''
    });
    
    setModalStep(2);
    setIsModalOpen(true);
  };

  const handleSavePromo = async () => {
    if (!activePromoProduct) return;
    if (!promoForm.is_flash_sale && !promoForm.volume_pricing_enabled && !promoForm.is_kit && !promoForm.is_promo) {
      toast.error("Veuillez activer au moins un type de promotion.");
      return;
    }

    // Validate flash sale end date
    if (promoForm.is_flash_sale) {
      if (!promoForm.flash_sale_end) {
        toast.error("Veuillez définir une date de fin pour la vente flash.");
        return;
      }
      if (new Date(promoForm.flash_sale_end) <= new Date()) {
        toast.error("La date de fin de la vente flash doit être dans le futur.");
        return;
      }
    }

    // Validate promo price
    if (promoForm.is_promo) {
      const oldSup = parseFloat(promoForm.old_supplier_price) || 0;
      const newSup = parseFloat(promoForm.supplier_price) || 0;
      if (oldSup <= 0) {
        toast.error("Veuillez saisir l'ancien prix vendeur.");
        return;
      }
      if (newSup <= 0) {
        toast.error("Veuillez saisir le prix vendeur promo.");
        return;
      }
      if (oldSup <= newSup) {
        toast.error("L'ancien prix doit être supérieur au prix promo.");
        return;
      }
    }

    // Validate kit/flash: the promo supplier price must be lower than the original
    if ((promoForm.is_kit || promoForm.is_flash_sale) && !promoForm.is_promo) {
      const promoSup = parseFloat(promoForm.supplier_price) || 0;
      const originalSup = parseFloat(activePromoProduct.supplier_price) || 0;
      if (promoSup <= 0) {
        toast.error("Veuillez saisir le prix vendeur promo.");
        return;
      }
      if (promoSup >= originalSup) {
        toast.error("Le prix vendeur promo doit être inférieur au prix vendeur original.");
        return;
      }
    }

    // Validate volume pricing tiers
    if (promoForm.volume_pricing_enabled) {
      const tiers = promoForm.volume_pricing;
      for (let i = 0; i < tiers.length; i++) {
        const qty = parseInt(tiers[i].qty) || 0;
        const disc = parseInt(tiers[i].discount) || 0;
        if (qty < 1) {
          toast.error(`Palier ${i + 1} : la quantité minimum doit être ≥ 1.`);
          return;
        }
        if (disc <= 0 || disc >= 100) {
          toast.error(`Palier ${i + 1} : la remise doit être entre 1% et 99%.`);
          return;
        }
      }
      if (tiers.length > 1 && parseInt(tiers[0].qty) >= parseInt(tiers[1].qty)) {
        toast.error("Le palier 1 doit avoir une quantité inférieure au palier 2.");
        return;
      }
    }

    setSavingPromo(true);
    try {
      const token = await getToken();
      
      let finalSupplierPrice = parseFloat(promoForm.supplier_price) || activePromoProduct.supplier_price;
      let finalPrice = activePromoProduct.price;
      let finalOldPrice = 0;

      if (promoForm.is_promo) {
        const oldSup = parseFloat(promoForm.old_supplier_price) || 0;
        if (oldSup > 0) {
          finalOldPrice = computePublicPrice(oldSup, deliveryTiers);
          finalPrice = computePublicPrice(finalSupplierPrice, deliveryTiers);
        }
      } else if (promoForm.is_flash_sale || promoForm.is_kit) {
        // For kits: old_price = total bundle original value (main + all companions)
        // so CartPage can compute the real savings. For flash: just the product's own price.
        finalOldPrice = promoForm.is_kit ? kitBundleValue : activePromoProduct.price;
        finalPrice = computePublicPrice(finalSupplierPrice, deliveryTiers);
      } else {
        finalSupplierPrice = activePromoProduct.supplier_price;
        finalPrice = activePromoProduct.price;
      }

      const payload = {
        name: activePromoProduct.name,
        description: activePromoProduct.description,
        category_id: activePromoProduct.category_id,
        price: finalPrice,
        old_price: finalOldPrice || 0,
        supplier_price: finalSupplierPrice,
        stock: activePromoProduct.stock,
        boutique_id: activePromoProduct.boutique_id,
        secondary_boutique_ids: activePromoProduct.secondary_boutique_ids,
        variants: activePromoProduct.variants,
        supplierLinks: activePromoProduct.supplierLinks,
        is_flash_sale: promoForm.is_flash_sale,
        flash_sale_end: promoForm.is_flash_sale ? promoForm.flash_sale_end : null,
        is_kit: promoForm.is_kit,
        kit_items: promoForm.is_kit ? promoForm.kit_items : null,
        preserve_approval: true,
        volume_pricing: promoForm.volume_pricing_enabled
          ? promoForm.volume_pricing.map(t => ({ min_qty: parseInt(t.qty) || parseInt(t.min_qty) || 1, discount: parseInt(t.discount) || 0 }))
          : null
      };

      await updateProduct(activePromoProduct.id, payload, token);
      toast.success(isAddMode ? "Promotion ajoutée avec succès !" : "Promotion mise à jour !");
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Erreur de sauvegarde.");
    } finally {
      setSavingPromo(false);
    }
  };

  const handleRemovePromo = async (product) => {
    if (!window.confirm(`Désactiver toutes les promotions sur "${product.name}" ?`)) return;
    try {
      const token = await getToken();
      const payload = {
        ...product,
        old_price: 0,
        is_flash_sale: false,
        flash_sale_end: null,
        is_kit: false,
        kit_items: null,
        volume_pricing: null
      };
      await updateProduct(product.id, payload, token);
      toast.success("Promotions désactivées !");
      fetchProducts();
    } catch (err) {
      toast.error("Erreur de suppression.");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Sparkles className="text-indigo-500" size={32} />
            Mes Promotions
          </h1>
          <p className="text-slate-500 font-medium mt-2 max-w-xl">
            Boostez vos ventes en créant des offres attractives. Gérez vos ventes flash, remises directes, prix dégressifs et packs.
          </p>
        </div>
        <button 
          onClick={handleStartNewPromo}
          className="group relative px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-indigo-600/40 transition-all flex items-center gap-2 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <Plus size={18} className="relative z-10" />
          <span className="relative z-10">Nouvelle Promotion</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {[
          { label: 'Total Actives', count: stats.total, icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Réductions', count: stats.promo, icon: Tag, color: 'text-violet-500', bg: 'bg-violet-50' },
          { label: 'Ventes Flash', count: stats.flash, icon: Flame, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Prix Dégressifs', count: stats.volume, icon: Percent, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Packs & Kits', count: stats.kit, icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-[2rem] p-5 md:p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">{stat.count}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-2 rounded-2xl md:rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex overflow-x-auto no-scrollbar p-2">
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'promo', label: 'Réductions' },
            { id: 'flash', label: 'Flash' },
            { id: 'volume', label: 'Dégressifs' },
            { id: 'kit', label: 'Kits' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm p-2">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Rechercher une promotion..."
            className="w-full bg-slate-50 border border-transparent rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
          />
        </div>
      </div>

      {/* Grid of Active Promotions */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
             <div key={i} className="bg-white h-64 rounded-[2rem] border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : promoProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promoProducts.map(p => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={p.id} 
              className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="h-40 bg-slate-50 relative flex items-center justify-center p-4">
                 {p.images && p.images[0] ? (
                    <img src={p.images[0].image_url} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                 ) : (
                    <ImageIcon size={48} className="text-slate-200" />
                 )}
                 <div className="absolute top-4 right-4 flex flex-col gap-2">
                    {p.old_price && parseFloat(p.old_price) > parseFloat(p.price) && <div className="w-8 h-8 rounded-full bg-violet-500 text-white flex items-center justify-center shadow-lg"><Tag size={14} /></div>}
                    {p.is_flash_sale && <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg"><Flame size={14} /></div>}
                    {p.volume_pricing && <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg"><Percent size={14} /></div>}
                    {p.is_kit && <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg"><Package size={14} /></div>}
                 </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-black text-slate-900 line-clamp-1">{p.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm font-black text-slate-900">{p.price} F CFA</p>
                  {p.old_price && parseFloat(p.old_price) > parseFloat(p.price) && (
                    <p className="text-xs font-bold text-slate-400 line-through">{p.old_price} F CFA</p>
                  )}
                </div>
                
                <div className="mt-4 space-y-2 flex-1">
                  {p.old_price && parseFloat(p.old_price) > parseFloat(p.price) && (
                    <div className="flex items-center gap-2 text-xs font-bold text-violet-600 bg-violet-50 p-2 rounded-xl">
                      <Tag size={14} /> Réduction active (-{Math.round(((parseFloat(p.old_price) - parseFloat(p.price)) / parseFloat(p.old_price)) * 100)}%)
                    </div>
                  )}
                  {p.is_flash_sale && (
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-xl">
                      <Clock size={14} /> Fin: {p.flash_sale_end ? new Date(p.flash_sale_end).toLocaleDateString() : 'N/A'}
                    </div>
                  )}
                  {p.volume_pricing && (
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 p-2 rounded-xl">
                      <Percent size={14} /> Prix Dégressif actif
                    </div>
                  )}
                  {p.is_kit && (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 p-2 rounded-xl">
                      <Package size={14} /> Kit Promo configuré
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-6">
                  <button onClick={() => handleEditPromo(p)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-black text-xs uppercase tracking-wider transition-colors flex justify-center items-center gap-2">
                    <Edit size={14} /> Modifier
                  </button>
                  <button onClick={() => handleRemovePromo(p)} className="w-12 h-12 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl flex items-center justify-center transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Sparkles size={40} className="text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-900">Aucune promotion active</h3>
          <p className="text-slate-500 mt-2 max-w-sm">Créez votre première promotion pour augmenter la visibilité et les ventes de vos produits.</p>
          <button onClick={handleStartNewPromo} className="mt-8 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
            Créer une promotion
          </button>
        </div>
      )}

      {/* The Master Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-full flex flex-col relative z-10 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  {modalStep === 2 && isAddMode && (
                    <button onClick={() => setModalStep(1)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-200 transition-colors">
                      <ArrowLeft size={18} className="text-slate-600" />
                    </button>
                  )}
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900">
                      {isAddMode ? 'Nouvelle Promotion' : 'Modifier la Promotion'}
                    </h2>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                      {modalStep === 1 ? 'Étape 1: Choix du produit' : 'Étape 2: Configuration'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-slate-50/50">
                
                {modalStep === 1 && (
                  <div className="space-y-6">
                    <div className="relative max-w-md mx-auto">
                      <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Rechercher un produit à promouvoir..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                      />
                    </div>
                    
                    {eligibleProductsForPromo.length === 0 ? (
                      <div className="text-center py-12">
                        <Package size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 font-bold">Aucun produit éligible trouvé.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {eligibleProductsForPromo.map(prod => (
                          <div 
                            key={prod.id}
                            onClick={() => handleSelectProduct(prod)}
                            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer transition-all flex flex-col gap-3 group"
                          >
                            <div className="h-32 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden">
                              {prod.images && prod.images[0] ? (
                                <img src={prod.images[0].image_url} alt={prod.name} className="h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
                              ) : (
                                <ImageIcon size={32} className="text-slate-300" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-black text-slate-800 text-sm line-clamp-1">{prod.name}</h4>
                              <p className="text-xs font-bold text-slate-400 mt-1">{prod.price} F CFA</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {modalStep === 2 && activePromoProduct && (
                  <div className="space-y-8 max-w-3xl mx-auto">
                    {/* Selected Product Banner */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center">
                        {activePromoProduct.images?.[0] ? <img src={activePromoProduct.images[0].image_url} className="w-full h-full object-contain" alt=""/> : <ImageIcon size={24} className="text-slate-300"/>}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Produit sélectionné</p>
                        <h4 className="font-black text-slate-900">{activePromoProduct.name}</h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Simple Discount Toggle Card */}
                      <label className={`cursor-pointer rounded-3xl border-2 p-5 transition-all ${promoForm.is_promo ? 'border-violet-500 bg-violet-50/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${promoForm.is_promo ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30' : 'bg-slate-100 text-slate-400'}`}>
                            <Tag size={24} />
                          </div>
                          <input type="checkbox" className="checkbox checkbox-primary" checked={promoForm.is_promo} onChange={(e) => setPromoForm({...promoForm, is_promo: e.target.checked})} />
                        </div>
                        <h4 className="font-black text-slate-900 text-lg">Réduction</h4>
                        <p className="text-xs font-bold text-slate-500 mt-1">Prix barré simple</p>
                      </label>

                      {/* Flash Sale Toggle Card */}
                      <label className={`cursor-pointer rounded-3xl border-2 p-5 transition-all ${promoForm.is_flash_sale ? 'border-rose-500 bg-rose-50/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${promoForm.is_flash_sale ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-slate-100 text-slate-400'}`}>
                            <Flame size={24} />
                          </div>
                          <input type="checkbox" className="checkbox checkbox-rose" checked={promoForm.is_flash_sale} onChange={(e) => setPromoForm({...promoForm, is_flash_sale: e.target.checked})} />
                        </div>
                        <h4 className="font-black text-slate-900 text-lg">Vente Flash</h4>
                        <p className="text-xs font-bold text-slate-500 mt-1">Durée limitée</p>
                      </label>

                      {/* Volume Pricing Toggle Card */}
                      <label className={`cursor-pointer rounded-3xl border-2 p-5 transition-all ${promoForm.volume_pricing_enabled ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${promoForm.volume_pricing_enabled ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-400'}`}>
                            <Percent size={24} />
                          </div>
                          <input type="checkbox" className="checkbox checkbox-info" checked={promoForm.volume_pricing_enabled} onChange={(e) => setPromoForm({...promoForm, volume_pricing_enabled: e.target.checked})} />
                        </div>
                        <h4 className="font-black text-slate-900 text-lg">Dégressif</h4>
                        <p className="text-xs font-bold text-slate-500 mt-1">Prix par quantité</p>
                      </label>

                      {/* Kit Toggle Card */}
                      <label className={`cursor-pointer rounded-3xl border-2 p-5 transition-all ${promoForm.is_kit ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${promoForm.is_kit ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 text-slate-400'}`}>
                            <Package size={24} />
                          </div>
                          <input type="checkbox" className="checkbox checkbox-success" checked={promoForm.is_kit} onChange={(e) => setPromoForm({...promoForm, is_kit: e.target.checked})} />
                        </div>
                        <h4 className="font-black text-slate-900 text-lg">Pack Kit</h4>
                        <p className="text-xs font-bold text-slate-500 mt-1">Vente groupée</p>
                      </label>
                    </div>

                    {/* Settings Sections */}
                    <div className="space-y-4">
                      {(promoForm.is_promo || promoForm.is_flash_sale || promoForm.is_kit) && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white p-6 rounded-3xl border border-violet-100 space-y-4">
                          <h4 className="font-black text-violet-600 mb-2 flex items-center gap-2"><Tag size={18}/> Configuration du Prix Promo</h4>
                          {promoForm.is_promo && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Ancien Prix Vendeur</label>
                                <input 
                                  type="number" 
                                  placeholder="Ex: 10000"
                                  value={promoForm.old_supplier_price}
                                  onChange={(e) => {
                                    const oldVal = parseFloat(e.target.value) || 0;
                                    const pct = parseFloat(promoForm.discount_percent) || 0;
                                    let newVal = promoForm.supplier_price;
                                    if (oldVal > 0 && pct > 0) {
                                      newVal = Math.round(oldVal * (1 - pct / 100));
                                    }
                                    setPromoForm({ ...promoForm, old_supplier_price: e.target.value, supplier_price: newVal });
                                  }}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-200"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Remise (%)</label>
                                <input 
                                  type="number" 
                                  placeholder="Ex: 15"
                                  value={promoForm.discount_percent}
                                  onChange={(e) => {
                                    const pct = parseFloat(e.target.value) || 0;
                                    const oldVal = parseFloat(promoForm.old_supplier_price) || 0;
                                    let newVal = promoForm.supplier_price;
                                    if (oldVal > 0 && pct > 0 && pct < 100) {
                                      newVal = Math.round(oldVal * (1 - pct / 100));
                                    }
                                    setPromoForm({ ...promoForm, discount_percent: e.target.value, supplier_price: newVal });
                                  }}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-200"
                                />
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase">Prix Vendeur Promo</label>
                              <input 
                                type="number" 
                                placeholder="Ex: 8500"
                                value={promoForm.supplier_price}
                                onChange={(e) => setPromoForm({ ...promoForm, supplier_price: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-emerald-600 outline-none focus:bg-white focus:border-emerald-200"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase">Prix public estimé</label>
                              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-slate-900">
                                {computePublicPrice(parseFloat(promoForm.supplier_price) || activePromoProduct?.supplier_price || 0, deliveryTiers).toLocaleString()} F CFA
                              </div>
                            </div>
                          </div>

                          {promoForm.is_promo && parseFloat(promoForm.old_supplier_price) > 0 && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1">
                              <span className="text-[9px] font-black text-slate-400 uppercase">Aperçu du prix sur l'application :</span>
                              <div className="flex items-baseline gap-3">
                                <span className="text-sm font-bold text-slate-400 line-through">
                                  {computePublicPrice(parseFloat(promoForm.old_supplier_price) || 0, deliveryTiers).toLocaleString()} F CFA
                                </span>
                                <span className="text-xl font-black text-slate-900">
                                  {computePublicPrice(parseFloat(promoForm.supplier_price) || 0, deliveryTiers).toLocaleString()} F CFA
                                </span>
                                {parseFloat(promoForm.old_supplier_price) > parseFloat(promoForm.supplier_price) && (
                                  <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[9px] font-black">
                                    -{Math.round(((parseFloat(promoForm.old_supplier_price) - parseFloat(promoForm.supplier_price)) / parseFloat(promoForm.old_supplier_price)) * 100)}%
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {(!promoForm.is_promo && (promoForm.is_flash_sale || promoForm.is_kit)) && (
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                              Saisissez un prix vendeur réduit pour cette offre. La page affichera ensuite le prix promo correspondant.
                            </p>
                          )}
                        </motion.div>
                      )}

                      {promoForm.is_flash_sale && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white p-6 rounded-3xl border border-rose-100">
                          <h4 className="font-black text-rose-600 mb-4 flex items-center gap-2"><Clock size={18}/> Configuration Vente Flash</h4>
                          <div>
                            <label className="text-xs font-bold text-slate-500 block mb-2">Date et heure de fin</label>
                            <input 
                              type="datetime-local" 
                              value={promoForm.flash_sale_end}
                              onChange={(e) => setPromoForm({ ...promoForm, flash_sale_end: e.target.value })}
                              className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-900 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-50 transition-all"
                            />
                          </div>
                        </motion.div>
                      )}

                      {promoForm.volume_pricing_enabled && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white p-6 rounded-3xl border border-blue-100">
                          <h4 className="font-black text-blue-600 mb-4 flex items-center gap-2"><Percent size={18}/> Configuration Prix Dégressif</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[0, 1].map(index => (
                              <div key={index} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Palier {index + 1}</span>
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Quantité (min)</label>
                                    <input 
                                      type="number" min="1"
                                      value={promoForm.volume_pricing[index]?.qty || ''}
                                      onChange={(e) => {
                                        const newTiers = [...promoForm.volume_pricing];
                                        newTiers[index] = { ...newTiers[index], qty: parseInt(e.target.value) || 0 };
                                        setPromoForm({ ...promoForm, volume_pricing: newTiers });
                                      }}
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-slate-900 outline-none"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Remise (%)</label>
                                    <input 
                                      type="number" min="1" max="99"
                                      value={promoForm.volume_pricing[index]?.discount || ''}
                                      onChange={(e) => {
                                        const newTiers = [...promoForm.volume_pricing];
                                        newTiers[index] = { ...newTiers[index], discount: parseInt(e.target.value) || 0 };
                                        setPromoForm({ ...promoForm, volume_pricing: newTiers });
                                      }}
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-black text-blue-600 outline-none"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-3xl p-4 text-slate-700">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">Aperçu des paliers</p>
                            {promoForm.volume_pricing.map((tier, index) => {
                              const baseSupplier = parseFloat(promoForm.supplier_price) || activePromoProduct.supplier_price || 0;
                              const tierSupplier = baseSupplier * (1 - (parseFloat(tier.discount) || 0) / 100);
                              const tierPublic = computePublicPrice(tierSupplier, deliveryTiers);
                              return (
                                <div key={index} className="mt-3 rounded-2xl bg-white border border-blue-100 p-3 text-[11px] font-bold text-slate-700">
                                  <div className="flex justify-between gap-3">
                                    <span>{tier.qty || 0}+ unités</span>
                                    <span>-{tier.discount || 0}%</span>
                                  </div>
                                  <div className="mt-2 flex justify-between gap-3 text-slate-500">
                                    <span>Prix unitaire env.</span>
                                    <span>{tierPublic.toLocaleString()} F CFA</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}

                      {promoForm.is_kit && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white p-6 rounded-3xl border border-emerald-100">
                          <h4 className="font-black text-emerald-600 mb-4 flex items-center gap-2"><Package size={18}/> Produits Complémentaires (Kit)</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {products.filter(item => item.id !== activePromoProduct.id).map(item => {
                              const isChecked = promoForm.kit_items.includes(item.id);
                              return (
                                <label key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isChecked ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-emerald-200'}`}>
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const list = e.target.checked 
                                        ? [...promoForm.kit_items, item.id]
                                        : promoForm.kit_items.filter(id => id !== item.id);
                                      setPromoForm({ ...promoForm, kit_items: list });
                                    }}
                                    className="checkbox checkbox-success checkbox-sm"
                                  />
                                  <div className="flex-1">
                                    <span className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</span>
                                    <span className="text-[10px] font-bold text-slate-400">{item.price} F CFA</span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                          {promoForm.kit_items.length > 0 && (
                            <div className="mt-4 bg-emerald-50 border border-emerald-100 rounded-3xl p-4 text-slate-700">
                              <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Valeur totale du kit</p>
                              <p className="mt-2 text-lg font-black text-slate-900">{kitBundleValue.toLocaleString()} F CFA</p>
                              <p className="text-[10px] text-slate-500 mt-1">Prix public estimé avec le prix vendeur actuel : <span className="font-black text-slate-900">{kitPublicPreview.toLocaleString()} F CFA</span></p>
                              {kitBundleValue > kitPublicPreview && (
                                <p className="mt-2 text-[11px] font-black text-emerald-600">Économie potentielle : {(kitBundleValue - kitPublicPreview).toLocaleString()} F CFA</p>
                              )}
                            </div>
                          )}
                          <p className="mt-4 text-[10px] text-slate-500 leading-relaxed">
                            Le prix vendeur réduit ci-dessus s'appliquera au kit. Sélectionnez vos produits, puis ajustez le prix vendeur promo pour définir votre offre de pack.
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              {modalStep === 2 && activePromoProduct && (
                <div className="px-8 py-5 border-t border-slate-100 bg-white flex gap-4 shrink-0">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black uppercase tracking-wider text-xs transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleSavePromo}
                    disabled={savingPromo}
                    className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-wider text-xs transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
                  >
                    {savingPromo ? <span className="loading loading-spinner loading-sm"></span> : <span>Sauvegarder la Promotion</span>}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupplierPromotions;
