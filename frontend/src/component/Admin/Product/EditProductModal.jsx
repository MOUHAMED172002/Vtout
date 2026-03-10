import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  X, Plus, Trash2, Image as ImageIcon, Check, ChevronRight,
  ChevronLeft, Package, Layers, Truck, Info, AlertCircle,
  Upload, Star, Sparkles, MapPin, Save, Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';

import {
  getCategories,
  getAttributes,
  updateProduct,
  createCategory,
  createAttribute,
  addAttributeValue
} from '../../../services/productService';
import { getSuppliers, createSupplier } from '../../../services/supplierService';
import { uploadSingleImage } from '../../../services/uploadService';
import CategorySearchModal from '../../Shared/CategorySearchModal';

const steps = [
  { id: 'info', title: 'Informations', icon: Info },
  { id: 'images', title: 'Images', icon: ImageIcon },
  { id: 'variants', title: 'Variantes', icon: Layers },
  { id: 'suppliers', title: 'Logistique', icon: Truck },
];

const InlineAdder = ({ label, onAdd, loading }) => {
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);

  if (!show) return (
    <button type="button" onClick={() => setShow(true)}
      className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:underline transition-all">
      <Plus size={12} /> Ajout rapide {label}
    </button>
  );

  return (
    <div className="flex items-center gap-2 animate-in zoom-in-95 duration-200">
      <input type="text" value={value} onChange={e => setValue(e.target.value)}
        className="input input-xs input-bordered h-8 text-[10px] font-bold"
        placeholder={`Nom ${label}...`} autoFocus />
      <button type="button" disabled={loading || !value}
        onClick={async () => { await onAdd(value); setValue(''); setShow(false); }}
        className={`btn btn-xs btn-primary h-8 px-4 font-black ${loading ? 'loading' : ''}`}>OK</button>
      <button type="button" onClick={() => setShow(false)} className="btn btn-xs btn-ghost h-8 w-8 p-0">×</button>
    </div>
  );
};

export default function EditProductModal({ product: initialProduct, onClose, onUpdated }) {
  const { getToken } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inlineLoading, setInlineLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [availableAttributes, setAvailableAttributes] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [selectedValuesMap, setSelectedValuesMap] = useState({});
  const [attrSearchQuery, setAttrSearchQuery] = useState("");
  const [imageFiles, setImageFiles] = useState([]);

  // Supplier States
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [globalSupplierPrice, setGlobalSupplierPrice] = useState('');
  const [creatingSupplier, setCreatingSupplier] = useState(false);
  const [newSupplierData, setNewSupplierData] = useState({
    name: '', phone: '', email: '', address_line: '',
    departement_label: '', commune_label: '', quartier_label: ''
  });

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', description: '', category_id: '', price: '', old_price: '', stock: 0, variants: [], is_flash_sale: false, flash_sale_end: '', approval_status: 'approved', admin_feedback: '' }
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({ control, name: 'variants' });

  const selectedCategoryId = watch('category_id');
  const variants = watch('variants');

  const selectedCategory = useMemo(() => categories.find(c => String(c.id) === String(selectedCategoryId)), [categories, selectedCategoryId]);
  const categoryPath = useMemo(() => {
    if (!selectedCategory || !categories.length) return '';
    const path = [];
    let cur = selectedCategory;
    while (cur) { path.unshift(cur.name); cur = categories.find(c => c.id === cur.parent_id); }
    return path.join(' > ');
  }, [selectedCategory, categories]);

  const fetchData = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats || []);
    } catch (err) { console.error(err); }
    try {
      const token = await getToken();
      if (token) { const sups = await getSuppliers(token); setSuppliers(sups || []); }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  // Init form with existing product
  useEffect(() => {
    if (!initialProduct) return;
    reset({
      name: initialProduct.name,
      description: initialProduct.description,
      category_id: initialProduct.category_id,
      price: initialProduct.price,
      old_price: initialProduct.old_price,
      stock: initialProduct.stock,
      variants: initialProduct.variants?.map(v => ({
        ...v,
        price: v.priceRows?.[0]?.price || initialProduct.price,
        old_price: v.priceRows?.[0]?.old_price || initialProduct.old_price,
        stock: v.priceRows?.[0]?.stock || 0,
        image_url: v.priceRows?.[0]?.image_url || null,
        supplierLinks: v.supplierLink?.map(sl => ({
          ...sl,
          supplier_id: sl.supplier_id,
          supplier_name: sl.supplier?.name || 'Fournisseur',
          supplier_price: sl.supplier_price,
          supplier_sku: sl.supplier_sku
        })) || []
      })) || [],
      is_flash_sale: initialProduct.is_flash_sale || false,
      flash_sale_end: initialProduct.flash_sale_end ? new Date(initialProduct.flash_sale_end).toISOString().slice(0, 16) : '',
      approval_status: initialProduct.approval_status || 'approved',
      admin_feedback: initialProduct.admin_feedback || ''
    });
    if (initialProduct.images) {
      setImageFiles(initialProduct.images.map(img => ({
        url: img.image_url, preview: img.image_url, isMain: img.is_main, existing: true
      })));
    }
  }, [initialProduct, reset]);

  useEffect(() => {
    (async () => {
      try {
        const attrs = await getAttributes();
        setAvailableAttributes(attrs || []);
      } catch (err) { console.error(err); }
    })();
  }, []);

  // Sync selectedAttributes and valuesMap from product variants when attributes load
  useEffect(() => {
    if (initialProduct?.variants && availableAttributes.length > 0 && selectedAttributes.length === 0) {
      const initialAttrs = [];
      const initialValuesMap = {};

      initialProduct.variants.forEach(v => {
        if (!v.combination) return;
        Object.entries(v.combination).forEach(([attrName, valName]) => {
          const attr = availableAttributes.find(a => a.name === attrName);
          if (attr) {
            if (!initialAttrs.find(ia => ia.id === attr.id)) initialAttrs.push(attr);
            const val = attr.values?.find(vv => vv.value === valName);
            if (val) {
              if (!initialValuesMap[attr.id]) initialValuesMap[attr.id] = [];
              if (!initialValuesMap[attr.id].includes(val.id)) initialValuesMap[attr.id].push(val.id);
            }
          }
        });
      });

      if (initialAttrs.length > 0) {
        setSelectedAttributes(initialAttrs);
        setSelectedValuesMap(initialValuesMap);
      }
    }
  }, [availableAttributes, initialProduct]);

  // --- Same logic as AddProductModal ---
  const addAttributeValueLocal = async (attributeId, value) => {
    setInlineLoading(true);
    try {
      const token = await getToken();
      await addAttributeValue(attributeId, value, token);

      await new Promise(r => setTimeout(r, 400));

      const updatedAttrs = await getAttributes();
      setAvailableAttributes(updatedAttrs);
      setSelectedAttributes(prev => prev.map(a => a.id === attributeId ? updatedAttrs.find(ua => ua.id === attributeId) : a));
      toast.success('Valeur ajoutée');
    } catch { toast.error('Erreur ajout valeur'); } finally { setInlineLoading(false); }
  };

  const createAttributeLocal = async (name) => {
    if (!name.trim()) return;
    setInlineLoading(true);
    try {
      const token = await getToken();
      const newAttrResp = await createAttribute({ name }, token);

      // Delay for DB consistency
      await new Promise(r => setTimeout(r, 500));

      const updatedAttrs = await getAttributes();
      setAvailableAttributes(updatedAttrs);

      const newId = newAttrResp?.id;
      const newAttr = updatedAttrs.find(a => a.id === newId);
      if (newAttr) {
        setSelectedAttributes(prev => {
          if (prev.find(p => p.id === newAttr.id)) return prev;
          return [...prev, newAttr];
        });
      }
      setAttrSearchQuery("");
      toast.success('Attribut créé');
    } catch (err) {
      console.error("[createAttributeLocal Edit] Error:", err);
      toast.error('Erreur création attribut');
    } finally { setInlineLoading(false); }
  };

  const cartesianProduct = (arrays) =>
    arrays.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())), [[]]);

  const generateVariants = () => {
    try {
      if (selectedAttributes.length === 0) throw new Error('Sélectionnez au moins un attribut');
      const combinations = cartesianProduct(selectedAttributes.map(a => {
        const valIds = selectedValuesMap[a.id] || [];
        const chosen = a.values.filter(v => valIds.includes(v.id));
        if (!chosen.length) throw new Error(`Sélectionnez au moins une valeur pour "${a.name}"`);
        return chosen.map(v => ({ attribute: a.name, value: v.value }));
      }));

      const newVariants = combinations.map(combo => {
        const comboObj = {};
        const arr = Array.isArray(combo) ? combo : [combo];
        arr.forEach(item => { comboObj[item.attribute] = item.value; });
        const initialSupplierLinks = selectedSupplierId ? [{
          supplier_id: selectedSupplierId,
          supplier_name: suppliers.find(s => s.id === selectedSupplierId)?.name || 'Fournisseur Global',
          supplier_price: parseFloat(globalSupplierPrice) || parseFloat(watch('price')) || 0,
          supplier_sku: ''
        }] : [];
        return {
          combination: comboObj,
          sku: '',
          price: parseFloat(watch('price')) || 0,
          old_price: parseFloat(watch('old_price')) || null,
          stock: 0,
          supplierLinks: initialSupplierLinks,
          image_url: null
        };
      });

      setValue('variants', newVariants);
      toast.success(`${newVariants.length} variantes générées`);
    } catch (e) { toast.error(e.message); }
  };

  const addSupplierToVariant = (vIndex, supplier) => {
    const cur = [...variants];
    if (!cur[vIndex].supplierLinks) cur[vIndex].supplierLinks = [];
    if (cur[vIndex].supplierLinks.some(l => l.supplier_id === supplier.id)) {
      toast.error('Ce fournisseur est déjà lié'); return;
    }
    cur[vIndex].supplierLinks.push({ supplier_id: supplier.id, supplier_name: supplier.name, supplier_price: 0, supplier_sku: '' });
    setValue('variants', cur);
  };

  const removeSupplierFromVariant = (vIndex, sIndex) => {
    const cur = [...variants];
    cur[vIndex].supplierLinks.splice(sIndex, 1);
    setValue('variants', cur);
  };

  const handleAddSupplier = async (name) => {
    setInlineLoading(true);
    try {
      const token = await getToken();
      const created = await createSupplier({ name }, token);
      toast.success('Fournisseur ajouté');
      setSuppliers(prev => [...prev, created]);
    } catch { toast.error('Erreur ajout fournisseur'); } finally { setInlineLoading(false); }
  };

  const handleAddSupplierInline = async () => {
    setInlineLoading(true);
    try {
      const token = await getToken();
      const created = await createSupplier(newSupplierData, token);
      toast.success('Fournisseur créé');
      setSuppliers(prev => [...prev, created]);
      setSelectedSupplierId(created.id);
      setCreatingSupplier(false);
      setNewSupplierData({ name: '', phone: '', email: '', address_line: '', departement_label: '', commune_label: '', quartier_label: '' });
    } catch { toast.error('Erreur ajout fournisseur'); } finally { setInlineLoading(false); }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file, preview: URL.createObjectURL(file),
      isMain: imageFiles.length === 0 && files.indexOf(file) === 0,
      existing: false
    }));
    setImageFiles([...imageFiles, ...newImages]);
  };

  const removeImage = (index) => {
    const imgs = [...imageFiles];
    const removed = imgs.splice(index, 1)[0];
    if (removed.isMain && imgs.length > 0) imgs[0].isMain = true;
    setImageFiles(imgs);
  };

  const setMainImage = (index) => setImageFiles(imageFiles.map((img, i) => ({ ...img, isMain: i === index })));

  // Same payload logic as AddProductModal
  const onSubmit = async (data) => {
    // Force supplier selection
    if (!selectedSupplierId) {
      setCurrentStep(3); // Jump to logistics step
      toast.error("Veuillez sélectionner un fournisseur pour ce produit.");
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const finalImages = [];
      for (const img of imageFiles) {
        if (img.existing) { finalImages.push({ url: img.url, isMain: img.isMain }); }
        else { const url = await uploadSingleImage(img.file, token); finalImages.push({ url, isMain: img.isMain }); }
      }
      const mainImageUrl = finalImages.find(img => img.isMain)?.url || null;

      const payload = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        old_price: data.old_price ? parseFloat(data.old_price) : null,
        stock: parseInt(data.stock) || 0,
        category_id: parseInt(data.category_id),
        images: finalImages,
        is_flash_sale: data.is_flash_sale,
        flash_sale_end: data.is_flash_sale ? data.flash_sale_end : null,
        variants: (data.variants || []).map(v => ({
          ...v,
          price: parseFloat(v.price) || parseFloat(data.price) || 0,
          old_price: v.old_price ? parseFloat(v.old_price) : (data.old_price ? parseFloat(data.old_price) : null),
          stock: parseInt(v.stock) || 0,
          combination: v.combination,
          image_url: v.image_url || mainImageUrl,
          supplierLinks: (v.supplierLinks || []).map(link => ({
            ...link,
            supplier_price: parseFloat(link.supplier_price) || 0
          }))
        })),
        supplierLinks: selectedSupplierId ? [{
          supplier_id: selectedSupplierId,
          supplier_name: suppliers.find(s => s.id === selectedSupplierId)?.name || 'Fournisseur Global',
          supplier_price: parseFloat(globalSupplierPrice) || parseFloat(data.price) || 0,
          supplier_sku: ''
        }] : [],
        approval_status: data.approval_status,
        admin_feedback: data.admin_feedback
      };

      await updateProduct(initialProduct.id, payload, token);
      toast.success('Produit mis à jour !');
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally { setLoading(false); }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  if (!initialProduct) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-white w-full max-w-5xl max-h-[92vh] rounded-[2.5rem] shadow-[0_20px_100px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-slate-100 z-10"
    >
      {/* Header */}
      <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white relative">
        <div className="absolute top-0 right-32 w-48 h-12 bg-blue-400/5 rounded-full blur-3xl -rotate-12 translate-y-[-50%]" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-500/20 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Package className="w-8 h-8 text-slate-900" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Modifier <span className="text-slate-400">Produit.</span></h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Etape {currentStep + 1} • {steps[currentStep].title}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all group">
          <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      {/* Stepper */}
      <div className="px-10 py-6 bg-slate-50/30 flex justify-between items-center gap-4 overflow-x-auto no-scrollbar border-b border-slate-50">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <button type="button" onClick={() => idx < currentStep && setCurrentStep(idx)}
              className={`flex items-center gap-4 group transition-all ${idx <= currentStep ? 'text-blue-500' : 'text-slate-300'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${idx === currentStep ? 'bg-blue-500 text-slate-900 shadow-xl shadow-blue-500/20 scale-110' : idx < currentStep ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-100 text-slate-300'}`}>
                {idx < currentStep ? <Check size={18} /> : <step.icon size={18} />}
              </div>
              <div className="hidden sm:block text-left">
                <p className={`text-[9px] font-black uppercase tracking-widest ${idx === currentStep ? 'text-blue-500' : 'text-slate-400'}`}>{step.title}</p>
              </div>
            </button>
            {idx < steps.length - 1 && (
              <div className={`h-[2px] min-w-[20px] flex-1 rounded-full transition-all duration-1000 ${idx < currentStep ? 'bg-blue-500/20' : 'bg-slate-100'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-10 md:p-14 space-y-12 custom-scrollbar">
        <AnimatePresence mode="wait">

          {/* STEP 0 — Informations */}
          {currentStep === 0 && (
            <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="md:col-span-2 space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Nom de l'article</label>
                <input {...register('name', { required: true })}
                  className="w-full bg-white border border-slate-100 rounded-3xl px-8 py-5 text-xl font-black text-slate-900 shadow-sm focus:ring-4 focus:ring-blue-500/5 outline-none transition-all" />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Catégorie</label>
                <button type="button" onClick={() => setShowCategoryModal(true)}
                  className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-left flex items-center justify-between group hover:border-blue-500/20 transition-all shadow-sm">
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${selectedCategory ? 'text-slate-900' : 'text-slate-300'}`}>
                      {selectedCategory ? selectedCategory.name : 'Sélectionner une catégorie'}
                    </span>
                    {categoryPath && <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{categoryPath}</span>}
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Prix (FCFA)</label>
                  <div className="relative">
                    <input type="number" {...register('price')}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-xl font-black text-blue-500 shadow-sm outline-none" placeholder="0" />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300">FCFA</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Ancien Prix</label>
                  <div className="relative">
                    <input type="number" {...register('old_price')}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-xl font-black text-slate-400 line-through shadow-sm outline-none" placeholder="0" />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300">FCFA</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Description</label>
                <textarea {...register('description')} placeholder="Décrivez votre produit..."
                  className="w-full bg-white border border-slate-100 rounded-3xl px-8 py-6 text-sm min-h-[160px] focus:ring-4 focus:ring-blue-500/5 outline-none transition-all placeholder:text-slate-200" />
              </div>

              {/* Flash Sale */}
              <div className="md:col-span-2 p-10 bg-rose-50 rounded-[3rem] border border-rose-100/50 space-y-8 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                      <Star size={20} fill="currentColor" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest">Offre Flash</h4>
                      <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Créez de l'urgence</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" {...register('is_flash_sale')} className="sr-only peer" />
                    <div className="w-14 h-8 bg-rose-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-500"></div>
                  </label>
                </div>
                <AnimatePresence>
                  {watch('is_flash_sale') && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 pt-4 border-t border-rose-100">
                      <label className="text-[10px] font-black uppercase tracking-widest text-rose-400">Date de fin de la promotion</label>
                      <input type="datetime-local" {...register('flash_sale_end')}
                        className="w-full bg-white border border-rose-100 rounded-2xl px-6 py-4 text-sm font-bold text-rose-900 focus:ring-4 focus:ring-rose-200/20 outline-none transition-all" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Modération (Admin Only) */}
              <div className="md:col-span-2 p-10 bg-slate-900 rounded-[3rem] border border-slate-800 space-y-8 mt-4 text-white shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/20">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-white">Modération & Statut</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contrôlez la visibilité du produit</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Statut d'approbation</label>
                    <select
                      {...register('approval_status')}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-4 focus:ring-amber-500/10 transition-all"
                    >
                      <option value="pending" className="bg-slate-900 text-amber-500">⏳ En attente</option>
                      <option value="approved" className="bg-slate-900 text-emerald-500">✅ Approuvé</option>
                      <option value="rejected" className="bg-slate-900 text-rose-500">❌ Rejeté</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lien Fournisseur (ID)</label>
                    <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-mono text-slate-500 select-all truncate">
                      {initialProduct.supplier_id || "Aucun ID"}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Commentaire / Feedback admin</label>
                    <textarea
                      {...register('admin_feedback')}
                      placeholder="Expliquez pourquoi le produit est approuvé ou rejeté..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white min-h-[100px] outline-none focus:ring-4 focus:ring-amber-500/10 transition-all"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 1 — Images */}
          {currentStep === 1 && (
            <motion.div key="images" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Galerie <span className="text-slate-400">Visuelle.</span></h3>
                  <p className="text-slate-400 font-bold text-sm">Ajoutez des photos nettes sous plusieurs angles.</p>
                </div>
                <label className="group flex items-center gap-3 px-8 py-4 bg-blue-500 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white hover:bg-slate-900 transition-all shadow-xl shadow-blue-500/20 cursor-pointer">
                  <Upload className="w-4 h-4" /> Ajouter des photos
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
              {imageFiles.length === 0 ? (
                <div className="border-4 border-dashed border-slate-50 rounded-[3rem] p-24 flex flex-col items-center justify-center gap-6 bg-slate-50/30">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner"><ImageIcon size={40} className="text-slate-200" /></div>
                  <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">Aucun visuel importé</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {imageFiles.map((img, idx) => (
                    <motion.div layout key={idx}
                      className={`group relative aspect-square rounded-3xl overflow-hidden border-4 transition-all duration-500 ${img.isMain ? 'border-blue-500 shadow-2xl shadow-blue-500/20' : 'border-white hover:border-slate-200'}`}>
                      <img src={img.preview} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                        <button type="button" onClick={() => setMainImage(idx)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${img.isMain ? 'bg-white text-blue-500' : 'bg-white/20 text-slate-900'}`}>
                          {img.isMain ? 'Favori' : 'Désigner'} <Star size={10} className={img.isMain ? 'fill-current' : ''} />
                        </button>
                        <button type="button" onClick={() => removeImage(idx)}
                          className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {img.isMain && (
                        <div className="absolute top-4 left-4 flex items-center gap-2 border border-white/20 bg-blue-500/95 backdrop-blur px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-tight text-slate-900 shadow-xl">
                          <Sparkles size={10} /> Couverture
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2 — Variantes (même logique qu'AddProductModal) */}
          {currentStep === 2 && (
            <motion.div key="variants" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
              {!selectedCategoryId && (
                <div className="p-6 bg-amber-50 border border-amber-200 rounded-3xl flex items-center gap-4">
                  <AlertCircle size={20} className="text-amber-500 flex-shrink-0" />
                  <p className="text-sm font-bold text-amber-700">Veuillez d'abord sélectionner une catégorie à l'étape 1 pour charger les attributs.</p>
                </div>
              )}

              <div className="bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white flex flex-col gap-10 relative overflow-hidden shadow-2xl">
                <div className="absolute bottom-0 right-0 p-10 opacity-5 -rotate-12 translate-x-1/4 translate-y-1/4"><Layers size={300} /></div>

                <div className="space-y-6 relative z-10">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Générateur <span className="text-blue-400">Intelligent.</span></h3>
                    <p className="text-slate-400 font-bold text-sm mt-2">Sélectionnez les attributs puis choisissez les valeurs à combiner.</p>
                  </div>

                  {/* Attribute pills */}
                  {/* Attribute Search & Selection */}
                  <div className="space-y-4">
                    <div className="relative group">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={20} />
                      <input
                        type="text"
                        value={attrSearchQuery}
                        onChange={(e) => setAttrSearchQuery(e.target.value)}
                        placeholder="Rechercher ou créer un attribut (ex: Couleur, Taille...)"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-8 py-5 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                      {availableAttributes
                        .filter(a => a.name.toLowerCase().includes(attrSearchQuery.toLowerCase()))
                        .slice(0, 8)
                        .map(attr => (
                          <button
                            key={attr.id}
                            type="button"
                            onClick={() => {
                              if (selectedAttributes.find(a => a.id === attr.id)) {
                                setSelectedAttributes(selectedAttributes.filter(a => a.id !== attr.id));
                              } else {
                                setSelectedAttributes([...selectedAttributes, attr]);
                              }
                            }}
                            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedAttributes.find(a => a.id === attr.id)
                              ? 'bg-blue-500 text-slate-900 shadow-lg shadow-blue-500/20 scale-105'
                              : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                              }`}
                          >
                            {attr.name}
                          </button>
                        ))}

                      {attrSearchQuery && !availableAttributes.find(a => a.name.toLowerCase() === attrSearchQuery.toLowerCase()) && (
                        <button
                          type="button"
                          onClick={() => createAttributeLocal(attrSearchQuery)}
                          disabled={inlineLoading}
                          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/20 text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/30 transition-all border border-blue-500/30"
                        >
                          <Plus size={14} /> Créer "{attrSearchQuery}"
                        </button>
                      )}
                    </div>

                    {selectedAttributes.length > 0 && (
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">
                        <Layers size={12} /> {selectedAttributes.length} attribut{selectedAttributes.length > 1 ? 's' : ''} sélectionné{selectedAttributes.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Value pickers */}
                  {selectedAttributes.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedAttributes.map(attr => (
                        <div key={attr.id} className="p-5 bg-white/5 rounded-3xl border border-white/10 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">{attr.name}</span>
                            <span className="text-[9px] font-bold text-slate-500 italic">{(selectedValuesMap[attr.id] || []).length}/{attr.values.length}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {attr.values.map(v => (
                              <button key={v.id} type="button"
                                onClick={() => {
                                  const cur = selectedValuesMap[attr.id] || [];
                                  setSelectedValuesMap({
                                    ...selectedValuesMap,
                                    [attr.id]: cur.includes(v.id) ? cur.filter(id => id !== v.id) : [...cur, v.id]
                                  });
                                }}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${(selectedValuesMap[attr.id] || []).includes(v.id) ? 'bg-blue-500/20 text-blue-400 border-blue-400/30' : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20'}`}>
                                {v.value}
                              </button>
                            ))}
                            <InlineAdder label="valeur" onAdd={(val) => addAttributeValueLocal(attr.id, val)} loading={inlineLoading} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Generate button */}
                <div className="flex justify-center">
                  <button type="button" onClick={generateVariants} disabled={selectedAttributes.length === 0}
                    className="group flex items-center gap-4 px-12 py-5 bg-blue-500 rounded-[2rem] shadow-2xl shadow-blue-500/30 hover:scale-105 transition-all text-slate-900 disabled:opacity-20 disabled:grayscale font-black text-sm uppercase tracking-widest">
                    <Plus size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                    Générer les variantes
                  </button>
                </div>
              </div>

              {/* Variant cards */}
              {variantFields.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    Variantes Générées
                    <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-full text-xs font-black">{variantFields.length}</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    {variantFields.map((field, index) => (
                      <div key={field.id} className="p-8 bg-white rounded-[2rem] border border-slate-100 hover:border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex flex-wrap gap-2">
                            {field.combination && Object.entries(field.combination).map(([attr, val], i) => (
                              <span key={i} className="px-3 py-1.5 bg-blue-500/5 text-blue-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-blue-500/10">{attr}: {val}</span>
                            ))}
                          </div>
                          <button type="button" onClick={() => removeVariant(index)}
                            className="w-9 h-9 rounded-xl bg-slate-50 text-slate-300 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition-all flex-shrink-0">
                            <Trash2 size={15} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 items-start">
                          {/* Image uploader */}
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center relative group/img">
                              {watch(`variants.${index}.image_url`) ? (
                                <img src={watch(`variants.${index}.image_url`)} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <ImageIcon size={28} className="text-slate-300" />
                              )}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                <Upload size={18} className="text-slate-900" />
                              </div>
                            </div>
                            <label className="text-[9px] font-black uppercase tracking-widest text-blue-500 cursor-pointer hover:underline flex items-center gap-1">
                              <input type="file" accept="image/*" className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files[0]; if (!file) return;
                                  try {
                                    const token = await getToken();
                                    const url = await uploadSingleImage(file, token);
                                    setValue(`variants.${index}.image_url`, url);
                                    toast.success('Image variante uploadée');
                                  } catch { toast.error('Erreur upload image variante'); }
                                }} />
                              <Upload size={10} /> Photo variante
                            </label>
                            {watch(`variants.${index}.image_url`) && (
                              <button type="button" onClick={() => setValue(`variants.${index}.image_url`, null)}
                                className="text-[8px] font-black uppercase tracking-widest text-rose-400 hover:underline">Retirer</button>
                            )}
                          </div>

                          {/* Prix / Stock / SKU */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                              { label: 'Prix de vente', field: `variants.${index}.price`, type: 'number', className: 'text-blue-500', suffix: 'F' },
                              { label: 'Ancien prix', field: `variants.${index}.old_price`, type: 'number', className: 'text-slate-400', suffix: 'F' },
                              { label: 'Stock', field: `variants.${index}.stock`, type: 'number', className: 'text-slate-700' },
                              { label: 'SKU', field: `variants.${index}.sku`, type: 'text', className: 'font-mono text-slate-600', placeholder: 'EX-001-...' },
                            ].map(({ label, field: f, type, className, suffix, placeholder }) => (
                              <div key={f} className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</label>
                                <div className="relative">
                                  <input type={type} {...register(f)}
                                    className={`w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none focus:ring-2 focus:ring-blue-500/10 transition-all ${className}`}
                                    placeholder={placeholder || '0'} />
                                  {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300">{suffix}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3 — Logistique (même logique qu'AddProductModal) */}
          {currentStep === 3 && (
            <motion.div key="suppliers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
              <div className="p-10 bg-indigo-50 border border-indigo-100 rounded-[3rem] flex items-center gap-10">
                <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-200/50">
                  <Truck className="w-10 h-10 text-indigo-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Gestion <span className="text-indigo-500">Logistique Multi-Fournisseurs.</span></h3>
                  <p className="text-slate-500 font-bold text-sm">Précisez vos sources d'approvisionnement pour chaque variante.</p>
                </div>
              </div>

              {/* Global Supplier */}
              <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] space-y-6">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Truck size={14} className="text-blue-500" /> Fournisseur Principal / Par Défaut
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <select value={selectedSupplierId}
                    onChange={(e) => { const v = e.target.value; setSelectedSupplierId(v); setCreatingSupplier(v === 'new'); }}
                    className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 shadow-sm outline-none hover:border-blue-500/20 transition-all">
                    <option value="">-- Sélectionner un fournisseur --</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    <option value="new">+ Nouveau fournisseur</option>
                  </select>
                  <div className="relative">
                    <input type="number" value={globalSupplierPrice} onChange={(e) => setGlobalSupplierPrice(e.target.value)}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-sm font-black text-indigo-500 shadow-sm outline-none transition-all"
                      placeholder="Prix d'achat global (Optionnel)" />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300">FCFA</span>
                  </div>
                </div>
                {creatingSupplier && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-lg">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-500">Nouveau Fournisseur</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input placeholder="Nom *" value={newSupplierData.name} onChange={e => setNewSupplierData(d => ({ ...d, name: e.target.value }))} className="input input-bordered rounded-xl text-xs" />
                      <input placeholder="Téléphone" value={newSupplierData.phone} onChange={e => setNewSupplierData(d => ({ ...d, phone: e.target.value }))} className="input input-bordered rounded-xl text-xs" />
                      <input placeholder="Email" value={newSupplierData.email} onChange={e => setNewSupplierData(d => ({ ...d, email: e.target.value }))} className="input input-bordered rounded-xl text-xs" />
                      <input placeholder="Adresse" value={newSupplierData.address_line} onChange={e => setNewSupplierData(d => ({ ...d, address_line: e.target.value }))} className="input input-bordered rounded-xl text-xs" />
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                      <button type="button" onClick={() => setCreatingSupplier(false)} className="btn btn-sm btn-ghost font-black text-[10px] uppercase">Annuler</button>
                      <button type="button" onClick={handleAddSupplierInline} className="btn btn-sm btn-primary rounded-xl font-black text-[10px] uppercase px-6">Créer</button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Per-variant supplier */}
              <div className="space-y-8">
                {variantFields.map((field, vIdx) => (
                  <div key={field.id} className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-8">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400"><Layers size={20} /></div>
                        <div>
                          <p className="text-xs font-black text-slate-900">Variante {vIdx + 1}</p>
                          <div className="flex gap-2 mt-1">
                            {field.combination && Object.entries(field.combination).map(([attr, val], i) => (
                              <span key={i} className="text-[9px] font-bold bg-slate-50 px-2 py-0.5 rounded text-slate-500">{attr}: {val}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU</p>
                        <p className="text-xs font-mono font-bold text-slate-900">{watch(`variants.${vIdx}.sku`) || 'NON DÉFINI'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Fournisseurs Liés</h4>
                        <div className="relative group">
                          <button type="button"
                            className="btn btn-xs btn-primary rounded-xl px-4 flex items-center gap-2 hover:scale-105 transition-all"
                            onClick={() => {
                              const dd = document.getElementById(`sup-dropdown-edit-${vIdx}`);
                              if (dd) dd.classList.toggle('hidden');
                            }}>
                            <Plus size={12} /> Ajouter un fournisseur
                          </button>
                          <div id={`sup-dropdown-edit-${vIdx}`} className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 overflow-hidden hidden animate-in slide-in-from-top-2">
                            <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Rechercher</p>
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {suppliers.length > 0 ? suppliers.map(s => (
                                <button key={s.id} type="button"
                                  onClick={() => {
                                    addSupplierToVariant(vIdx, s);
                                    document.getElementById(`sup-dropdown-edit-${vIdx}`)?.classList.add('hidden');
                                  }}
                                  className="w-full text-left px-5 py-3 text-xs font-bold text-slate-600 hover:bg-blue-500/5 hover:text-blue-500 transition-all flex items-center justify-between border-b border-slate-50 last:border-0">
                                  {s.name} <Plus size={12} />
                                </button>
                              )) : <div className="p-4 text-center text-[10px] font-bold text-slate-400">Aucun fournisseur</div>}
                            </div>
                            <div className="p-3 bg-slate-50 flex flex-col gap-2">
                              <InlineAdder label="fournisseur" onAdd={handleAddSupplier} loading={inlineLoading} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {watch(`variants.${vIdx}.supplierLinks`)?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {watch(`variants.${vIdx}.supplierLinks`).map((link, sIdx) => (
                            <div key={sIdx} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col gap-4 relative group">
                              <button type="button" onClick={() => removeSupplierFromVariant(vIdx, sIdx)}
                                className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                <X size={14} />
                              </button>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm border border-slate-100"><MapPin size={14} /></div>
                                <span className="text-xs font-black text-slate-900">{link.supplier_name}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Prix d'Achat</label>
                                  <input type="number" {...register(`variants.${vIdx}.supplierLinks.${sIdx}.supplier_price`)}
                                    className="w-full bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs font-black text-indigo-500 outline-none" placeholder="0" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">SKU Fournisseur</label>
                                  <input type="text" {...register(`variants.${vIdx}.supplierLinks.${sIdx}.supplier_sku`)}
                                    className="w-full bg-white border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 outline-none" placeholder="REF-..." />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-2">
                          <Truck size={24} className="text-slate-200" />
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Aucun fournisseur lié à cette variante</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-10 border-t border-slate-50 flex items-center justify-between bg-white relative z-10">
        <button type="button" onClick={prevStep} disabled={currentStep === 0}
          className="flex items-center gap-3 px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all disabled:opacity-0">
          <ChevronLeft size={18} /> Précédent
        </button>
        <div className="flex gap-4">
          {currentStep < steps.length - 1 ? (
            <button type="button" onClick={nextStep}
              className="group flex items-center gap-3 px-12 py-5 bg-blue-500 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] text-white shadow-2xl shadow-blue-500/20 hover:bg-slate-900 transition-all">
              Continuer <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button type="submit" onClick={handleSubmit(onSubmit)} disabled={loading}
              className={`group flex items-center gap-3 px-16 py-5 bg-blue-500 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] text-white shadow-2xl shadow-blue-500/20 hover:bg-slate-900 transition-all ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
              {loading ? 'Sauvegarde...' : 'Sauvegarder'} <Save size={18} className="group-hover:scale-125 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <CategorySearchModal categories={categories} onClose={() => setShowCategoryModal(false)}
            onSelect={(cat) => { setValue('category_id', cat.id); setShowCategoryModal(false); }} />
        )}
      </AnimatePresence>
    </motion.div >
  );
}
