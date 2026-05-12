import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  X, Plus, Trash2, Image as ImageIcon, Check, ChevronRight,
  ChevronLeft, Package, Layers, Truck, Info, AlertCircle,
  Upload, Star, Sparkles, Save, ShieldCheck, Search,
  Phone, MessageCircle, CreditCard, MapPin, Store, ExternalLink,
  CheckCircle2, XCircle, Clock, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from "../../../lib/AuthHooks";

import {
  getCategories,
  getAttributes,
  updateProduct,
  createAttribute,
  addAttributeValue,
  getAttributesByCategory
} from '../../../services/productService';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
import { uploadSingleImage } from '../../../services/uploadService';
import CategorySearchModal from '../../Shared/CategorySearchModal';

const DELIVERY_FEE = 1000;

// ─── Étapes ───────────────────────────────────────────────────────────────────
const steps = [
  { id: 'info', title: 'Informations', icon: Info },
  { id: 'images', title: 'Images', icon: ImageIcon },
  { id: 'fournisseur', title: 'Fournisseur', icon: Truck },
  { id: 'variantes', title: 'Variantes', icon: Layers },
];

// ─── Badge statut ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    approved: { label: 'Approuvé', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
    rejected: { label: 'Rejeté', cls: 'bg-rose-100    text-rose-700    border-rose-200', Icon: XCircle },
    'En attente': { label: 'En attente', cls: 'bg-amber-100  text-amber-700   border-amber-200', Icon: Clock },
    draft: { label: 'Brouillon', cls: 'bg-slate-100   text-slate-600   border-slate-200', Icon: Clock },
  };
  const { label, cls, Icon } = map[status] || map['En attente'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${cls}`}>
      <Icon size={12} /> {label}
    </span>
  );
};

// ─── Carte fournisseur ─────────────────────────────────────────────────────────
const SupplierCard = ({ supplier, boutiques = [], supplierPrice }) => {
  if (!supplier) return (
    <div className="p-10 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center gap-4 text-center">
      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
        <Store size={28} className="text-slate-300" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        Aucun fournisseur lié à ce produit
      </p>
    </div>
  );

  const firstBoutique = boutiques[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-6 p-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2.5rem] border border-indigo-100">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 border border-indigo-100 shrink-0">
          <Store size={32} className="text-indigo-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Fournisseur soumis</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter truncate">{supplier.name}</h3>
          <StatusBadge status={supplier.status} />
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prix demandé</p>
          <p className="text-3xl font-black text-indigo-600">{Number(supplierPrice || 0).toLocaleString()}<span className="text-sm ml-1">F</span></p>
        </div>
      </div>

      {/* Contacts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Phone, label: 'Téléphone', value: supplier.phone, cls: 'text-slate-700' },
          { icon: MessageCircle, label: 'WhatsApp', value: supplier.whatsapp, cls: 'text-emerald-600' },
          { icon: CreditCard, label: 'Momo Pay', value: supplier.momo_number, cls: 'text-amber-600' },
        ].map(({ icon: Icon, label, value, cls }) => (
          <div key={label} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
              <Icon size={18} className={cls} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
              <p className="text-sm font-black text-slate-800 truncate">{value || '—'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Boutique / localisation */}
      {firstBoutique && (
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <MapPin size={18} className="text-rose-500" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Boutique principale</p>
            <p className="text-sm font-black text-slate-900">{firstBoutique.name}</p>
            <p className="text-xs font-bold text-slate-500 mt-1">
              {[firstBoutique.quartier_label, firstBoutique.commune_label, firstBoutique.departement_label].filter(Boolean).join(', ')}
            </p>
            {firstBoutique.address_line && (
              <p className="text-xs text-slate-400 mt-0.5 italic">« {firstBoutique.address_line} »</p>
            )}
          </div>
        </div>
      )}

      {/* Note interne */}
      {supplier.supplier_note && (
        <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl">
          <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-2">Note du fournisseur</p>
          <p className="text-sm font-bold text-slate-700">« {supplier.supplier_note} »</p>
        </div>
      )}
    </div>
  );
};

// ─── Inline adder ──────────────────────────────────────────────────────────────
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
    <div className="flex items-center gap-2">
      <input type="text" value={value} onChange={e => setValue(e.target.value)}
        className="input input-xs input-bordered h-8 text-[10px] font-bold" placeholder={`Nom ${label}...`} autoFocus />
      <button type="button" disabled={loading || !value}
        onClick={async () => { await onAdd(value); setValue(''); setShow(false); }}
        className={`btn btn-xs btn-primary h-8 px-4 font-black ${loading ? 'loading' : ''}`}>OK</button>
      <button type="button" onClick={() => setShow(false)} className="btn btn-xs btn-ghost h-8 w-8 p-0">×</button>
    </div>
  );
};

// ─── Composant principal ───────────────────────────────────────────────────────
export default function EditProductModal({ product: initialProduct, onClose, onUpdated }) {
  const { getToken } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inlineLoading, setInlineLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Fournisseur pré-chargé depuis les données du produit (getProductById le fait côté serveur)
  const linkedSupplier = initialProduct?.supplier || null;
  const linkedBoutiques = initialProduct?.supplier?.boutiques || [];

  // Attributes
  const [availableAttributes, setAvailableAttributes] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [selectedValuesMap, setSelectedValuesMap] = useState({});
  const [attrSearchQuery, setAttrSearchQuery] = useState('');
  const [commissionRate, setCommissionRate] = useState(10);
  const [isInternalPriceChange, setIsInternalPriceChange] = useState(false);

  const [imageFiles, setImageFiles] = useState([]);

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      stock: 0, variants: [],
      supplier_price: '', approval_status: 'En attente', admin_feedback: ''
    }
  });

  const { fields: variantFields, remove: removeVariant } = useFieldArray({ control, name: 'variants' });
  const selectedCategoryId = watch('category_id');
  const variants = watch('variants');

  const selectedCategory = useMemo(
    () => categories.find(c => String(c.id) === String(selectedCategoryId)),
    [categories, selectedCategoryId]
  );
  const categoryPath = useMemo(() => {
    if (!selectedCategory || !categories.length) return '';
    const path = [];
    let cur = selectedCategory;
    while (cur) { path.unshift(cur.name); cur = categories.find(c => c.id === cur.parent_id); }
    return path.join(' > ');
  }, [selectedCategory, categories]);

  // ── Chargement initial ─────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try { const cats = await getCategories(); setCategories(cats || []); } catch (e) { console.error(e); }
      try { const attrs = await getAttributes(); setAvailableAttributes(attrs || []); } catch (e) { console.error(e); }
      try {
        const { data } = await axios.get(`${API_URL}/configs/key/commission_rate`, { withCredentials: true });
        if (data && data.value) setCommissionRate(parseFloat(data.value));
      } catch (e) { console.error("Commission rate not found, using 10%"); }
    })();
  }, []);

  // Attributs par catégorie
  useEffect(() => {
    if (!selectedCategoryId) return;
    getAttributesByCategory(selectedCategoryId).then(d => setAvailableAttributes(d || [])).catch(console.error);
  }, [selectedCategoryId]);

  const watchPrice = watch('price');
  const watchSupplierPrice = watch('supplier_price');

  // Logic: When selling price changes, calculate what supplier gets
  useEffect(() => {
    if (isInternalPriceChange) {
      setIsInternalPriceChange(false);
      return;
    }
    if (watchPrice && commissionRate) {
      // Formule: SupplierPrice = (PublicPrice * (1 - CommissionRate/100)) - DELIVERY_FEE
      const calculated = Math.round((parseFloat(watchPrice) * (1 - commissionRate / 100)) - DELIVERY_FEE);
      if (calculated !== parseFloat(watchSupplierPrice)) {
        setIsInternalPriceChange(true);
        setValue('supplier_price', calculated);
      }
    }
  }, [watchPrice, commissionRate]);

  // Logic: Reverse calculation if supplier price is explicitly touched
  useEffect(() => {
    if (isInternalPriceChange) {
      setIsInternalPriceChange(false);
      return;
    }
    if (watchSupplierPrice && commissionRate) {
      // Formule: PublicPrice = (SupplierPrice + DELIVERY_FEE) / (1 - CommissionRate/100)
      const calculated = Math.round((parseFloat(watchSupplierPrice) + DELIVERY_FEE) / (1 - commissionRate / 100));
      if (calculated !== parseFloat(watchPrice)) {
        setIsInternalPriceChange(true);
        setValue('price', calculated);
      }
    }
  }, [watchSupplierPrice, commissionRate]);

  // Initialisation du formulaire avec le produit existant
  useEffect(() => {
    if (!initialProduct) return;
    reset({
      name: initialProduct.name || '',
      description: initialProduct.description || '',
      category_id: initialProduct.category_id || '',
      price: initialProduct.price || '',
      old_price: initialProduct.old_price || '',
      stock: initialProduct.stock || 0,
      approval_status: initialProduct.approval_status || 'En attente',
      admin_feedback: initialProduct.admin_feedback || '',
      supplier_price: initialProduct.supplier_price || '',
      variants: (initialProduct.variants || []).map(v => ({
        ...v,
        price: v.priceRows?.[0]?.price || initialProduct.price,
        old_price: v.priceRows?.[0]?.old_price || initialProduct.old_price,
        stock: v.priceRows?.[0]?.stock || 0,
        image_url: v.priceRows?.[0]?.image_url || null,
        supplierLinks: (v.supplierLink || []).map(sl => ({
          ...sl,
          supplier_name: sl.supplier?.name || 'Fournisseur',
          supplier_price: sl.supplier_price,
          supplier_sku: sl.supplier_sku,
        })),
      })),
    });
    if (initialProduct.images?.length) {
      setImageFiles(initialProduct.images.map(img => ({
        url: img.image_url, preview: img.image_url, isMain: img.is_main, existing: true
      })));
    }
  }, [initialProduct, reset]);

  // Pré-sélection des attributs depuis les variantes existantes
  useEffect(() => {
    if (!initialProduct?.variants?.length || !availableAttributes.length || selectedAttributes.length) return;
    const attrs = []; const valMap = {};
    initialProduct.variants.forEach(v => {
      if (!v.combination) return;
      Object.entries(v.combination).forEach(([attrName, valName]) => {
        const attr = availableAttributes.find(a => a.name === attrName);
        if (attr) {
          if (!attrs.find(a => a.id === attr.id)) attrs.push(attr);
          const val = attr.values?.find(vv => vv.value === valName);
          if (val) {
            if (!valMap[attr.id]) valMap[attr.id] = [];
            if (!valMap[attr.id].includes(val.id)) valMap[attr.id].push(val.id);
          }
        }
      });
    });
    if (attrs.length) { setSelectedAttributes(attrs); setSelectedValuesMap(valMap); }
  }, [availableAttributes, initialProduct]);

  // ── Helpers ────────────────────────────────────────────────────────────────
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
      const newAttr = await createAttribute({ name }, token);
      await new Promise(r => setTimeout(r, 500));
      const updated = await getAttributes();
      setAvailableAttributes(updated);
      const found = updated.find(a => a.id === newAttr?.id);
      if (found) setSelectedAttributes(prev => prev.find(p => p.id === found.id) ? prev : [...prev, found]);
      setAttrSearchQuery('');
      toast.success('Attribut créé');
    } catch { toast.error('Erreur création attribut'); } finally { setInlineLoading(false); }
  };

  const cartesianProduct = arrays =>
    arrays.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())), [[]]);

  const generateVariants = () => {
    try {
      if (!selectedAttributes.length) throw new Error('Sélectionnez au moins un attribut');
      const combinations = cartesianProduct(selectedAttributes.map(a => {
        const chosen = a.values.filter(v => (selectedValuesMap[a.id] || []).includes(v.id));
        if (!chosen.length) throw new Error(`Sélectionnez au moins une valeur pour "${a.name}"`);
        return chosen.map(v => ({ attribute: a.name, value: v.value }));
      }));
      setValue('variants', combinations.map(combo => {
        const obj = {};
        (Array.isArray(combo) ? combo : [combo]).forEach(i => { obj[i.attribute] = i.value; });
        return { combination: obj, sku: '', price: parseFloat(watch('price')) || 0, old_price: null, stock: 0, supplierLinks: [], image_url: null };
      }));
      toast.success(`${combinations.length} variantes générées`);
    } catch (e) { toast.error(e.message); }
  };

  const handleImageChange = e => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files.map((file, i) => ({
      file, preview: URL.createObjectURL(file), isMain: prev.length === 0 && i === 0, existing: false
    }))]);
  };

  const removeImage = index => {
    const imgs = [...imageFiles];
    const removed = imgs.splice(index, 1)[0];
    if (removed.isMain && imgs.length > 0) imgs[0].isMain = true;
    setImageFiles(imgs);
  };

  const setMainImage = index => setImageFiles(imageFiles.map((img, i) => ({ ...img, isMain: i === index })));

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const token = await getToken();
      const finalImages = [];
      for (const img of imageFiles) {
        if (img.existing) finalImages.push({ url: img.url, isMain: img.isMain });
        else { const url = await uploadSingleImage(img.file, token); finalImages.push({ url, isMain: img.isMain }); }
      }
      const mainImageUrl = finalImages.find(i => i.isMain)?.url || null;

      const payload = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price) || 0,
        old_price: data.old_price ? parseFloat(data.old_price) : null,
        stock: parseInt(data.stock) || 0,
        category_id: parseInt(data.category_id),
        images: finalImages,
        approval_status: data.approval_status,
        admin_feedback: data.admin_feedback,
        supplier_price: parseFloat(data.supplier_price) || null,
        variants: (data.variants || []).map(v => ({
          ...v,
          price: parseFloat(v.price) || parseFloat(data.price) || 0,
          old_price: v.old_price ? parseFloat(v.old_price) : null,
          stock: parseInt(v.stock) || 0,
          image_url: v.image_url || mainImageUrl,
          supplierLinks: (v.supplierLinks || []).map(l => ({ ...l, supplier_price: parseFloat(l.supplier_price) || 0 })),
        })),
      };

      await updateProduct(initialProduct.id, payload, token);
      toast.success('Produit mis à jour !');
      onUpdated?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally { setLoading(false); }
  };

  const nextStep = () => setCurrentStep(p => Math.min(p + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(p => Math.max(p - 1, 0));

  if (!initialProduct) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-white w-full max-w-5xl max-h-[92vh] rounded-[2.5rem] shadow-[0_20px_100px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-slate-100 z-10"
    >
      {/* Header */}
      <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Package className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter truncate max-w-xs">
              {initialProduct.name}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <StatusBadge status={initialProduct.approval_status} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Étape {currentStep + 1} / {steps.length} — {steps[currentStep].title}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onClose}
          className="w-11 h-11 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Stepper */}
      <div className="px-8 py-4 bg-slate-50/30 flex justify-between items-center gap-4 overflow-x-auto border-b border-slate-50">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <button type="button" onClick={() => idx < currentStep && setCurrentStep(idx)}
              className={`flex items-center gap-3 transition-all ${idx <= currentStep ? 'text-blue-500' : 'text-slate-300'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${idx === currentStep ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : idx < currentStep ? 'bg-blue-100 text-blue-500' : 'bg-white border border-slate-100 text-slate-300'}`}>
                {idx < currentStep ? <Check size={16} /> : <step.icon size={16} />}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest hidden sm:inline ${idx === currentStep ? 'text-slate-900' : 'text-slate-400'}`}>
                {step.title}
              </span>
            </button>
            {idx < steps.length - 1 && <div className={`h-px flex-1 min-w-[16px] ${idx < currentStep ? 'bg-blue-200' : 'bg-slate-100'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar">
        <AnimatePresence mode="wait">

          {/* ── ÉTAPE 0 : Informations ───────────────────────────────────────── */}
          {currentStep === 0 && (
            <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nom de l'article</label>
                <input {...register('name', { required: true })}
                  className="w-full bg-white border border-slate-100 rounded-3xl px-8 py-5 text-xl font-black text-slate-900 shadow-sm focus:ring-4 focus:ring-blue-500/5 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Catégorie</label>
                <button type="button" onClick={() => setShowCategoryModal(true)}
                  className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-left flex items-center justify-between hover:border-blue-500/20 transition-all shadow-sm">
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${selectedCategory ? 'text-slate-900' : 'text-slate-300'}`}>
                      {selectedCategory ? selectedCategory.name : 'Sélectionner une catégorie'}
                    </span>
                    {categoryPath && <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{categoryPath}</span>}
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prix public (FCFA)</label>
                  <input type="number" {...register('price')}
                    className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-xl font-black text-blue-500 shadow-sm outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ancien prix</label>
                  <input type="number" {...register('old_price')}
                    className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-xl font-black text-slate-400 outline-none" />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                <textarea {...register('description')} rows={4}
                  className="w-full bg-white border border-slate-100 rounded-3xl px-8 py-6 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/5 outline-none resize-none" />
              </div>


              {/* Modération */}
              <div className="md:col-span-2 p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 space-y-6 text-white shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <ShieldCheck size={18} className="text-slate-900" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest">Modération / Approbation</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Contrôlez la visibilité du produit</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</label>
                    <select {...register('approval_status')}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black text-white outline-none focus:ring-4 focus:ring-amber-500/10">
                      <option value="En attente" className="bg-slate-900 text-amber-500">⏳ En attente</option>
                      <option value="approved" className="bg-slate-900 text-emerald-500">✅ Approuvé</option>
                      <option value="rejected" className="bg-slate-900 text-rose-500">❌ Rejeté</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID Fournisseur</label>
                    <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-mono text-slate-500 select-all truncate">
                      {initialProduct.supplier_id || '—'}
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Feedback pour le fournisseur</label>
                    <textarea {...register('admin_feedback')} rows={3}
                      placeholder="Expliquez pourquoi ce produit est approuvé, rejeté, ou ce qui doit être corrigé..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:ring-4 focus:ring-amber-500/10 resize-none" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── ÉTAPE 1 : Images ─────────────────────────────────────────────── */}
          {currentStep === 1 && (
            <motion.div key="images" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Galerie <span className="text-slate-400">Visuelle.</span></h3>
                <label className="flex items-center gap-2 px-8 py-4 bg-blue-500 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white cursor-pointer hover:bg-slate-900 transition-all shadow-lg">
                  <Upload size={14} /> Ajouter
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
              {imageFiles.length === 0 ? (
                <div className="border-4 border-dashed border-slate-100 rounded-[3rem] p-20 flex flex-col items-center gap-6 bg-slate-50/30">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner">
                    <ImageIcon size={36} className="text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Aucun visuel importé</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {imageFiles.map((img, idx) => (
                    <motion.div layout key={idx}
                      className={`group relative aspect-square rounded-3xl overflow-hidden border-4 transition-all ${img.isMain ? 'border-blue-500 shadow-2xl shadow-blue-500/20' : 'border-white hover:border-slate-200'}`}>
                      <img src={img.preview} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                        <button type="button" onClick={() => setMainImage(idx)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${img.isMain ? 'bg-white text-blue-500' : 'bg-white/20 text-white'}`}>
                          {img.isMain ? 'Cover' : 'Définir'} <Star size={10} className={img.isMain ? 'fill-current' : ''} />
                        </button>
                        <button type="button" onClick={() => removeImage(idx)}
                          className="w-9 h-9 bg-rose-500 rounded-xl flex items-center justify-center text-white">
                          <Trash2 size={15} />
                        </button>
                      </div>
                      {img.isMain && (
                        <div className="absolute top-3 left-3 bg-blue-500/90 text-white px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tight flex items-center gap-1">
                          <Sparkles size={9} /> Cover
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── ÉTAPE 2 : Fournisseur pré-chargé ────────────────────────────── */}
          {currentStep === 2 && (
            <motion.div key="fournisseur" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">

              <div className="flex items-center gap-4 p-6 bg-blue-50 rounded-3xl border border-blue-100">
                <Truck size={20} className="text-blue-500 shrink-0" />
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Fiche Fournisseur</h3>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-0.5">
                    Informations soumises automatiquement depuis le portail partenaire
                  </p>
                </div>
              </div>

              <SupplierCard
                supplier={linkedSupplier}
                boutiques={linkedBoutiques}
                supplierPrice={watch('supplier_price') || initialProduct.supplier_price}
              />

              {/* Prix de vente  modifiable par l'admin */}
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <CreditCard size={14} className="text-indigo-500" /> Prix de vente  convenu (modifiable)
                </label>
                <div className="relative">
                  <input type="number" {...register('supplier_price')}
                    className="w-full bg-white border border-slate-100 rounded-2xl px-8 py-5 text-2xl font-black text-indigo-600 shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                  <span className="absolute right-8 top-1/2 -translate-y-1/2 text-sm font-black text-slate-300">FCFA</span>
                </div>

                {/* Breakdown Visualizer */}
                {watchSupplierPrice && (
                  <div className="p-6 bg-white/50 rounded-3xl border border-indigo-100 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={16} className="text-indigo-500" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600">Calcul du prix public (Transparence)</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Gain Net Fourn.</p>
                        <p className="text-sm font-black">{Number(watchSupplierPrice).toLocaleString()} F</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">+ Livraison</p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-black text-emerald-600">{DELIVERY_FEE.toLocaleString()} F</p>
                          <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tighter">Marketing</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">+ Com. ({commissionRate}%)</p>
                        <p className="text-sm font-black text-orange-500">{Math.round((parseFloat(watchPrice) * commissionRate / 100)).toLocaleString()} F</p>
                      </div>
                      <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
                        <p className="text-[9px] font-bold text-indigo-500 uppercase">Prix Client Final</p>
                        <p className="text-base font-black text-indigo-500">{Number(watchPrice).toLocaleString()} F</p>
                      </div>
                    </div>
                    <div className="pt-2 flex items-start gap-2">
                      <Info size={12} className="text-indigo-500 mt-0.5 shrink-0" />
                      <p className="text-[9px] font-bold text-slate-500 leading-relaxed italic">
                        Les <span className="text-emerald-600">1 000 F de livraison</span> sont inclus pour permettre d'afficher <span className="text-emerald-600 uppercase font-black">"Livraison Offerte"</span> sur le site, boostant l'attractivité de votre produit.
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-[10px] font-bold text-slate-400">
                  ✏️ Modifiez ce montant pour corriger le prix négocié avec le fournisseur.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── ÉTAPE 3 : Variantes ──────────────────────────────────────────── */}
          {currentStep === 3 && (
            <motion.div key="variantes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">

              {/* Générateur */}
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white space-y-8">
                <div>
                  <h3 className="text-2xl font-black tracking-tighter">Générateur <span className="text-blue-400">de Variantes.</span></h3>
                  <p className="text-slate-400 text-sm mt-1">Sélectionnez les attributs et générez les combinaisons.</p>
                </div>

                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="text" value={attrSearchQuery} onChange={e => setAttrSearchQuery(e.target.value)}
                    placeholder="Chercher un attribut (Couleur, Taille...)"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white outline-none" />
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  {availableAttributes.filter(a => a.name.toLowerCase().includes(attrSearchQuery.toLowerCase())).map(attr => (
                    <button key={attr.id} type="button"
                      onClick={() => setSelectedAttributes(prev =>
                        prev.find(a => a.id === attr.id) ? prev.filter(a => a.id !== attr.id) : [...prev, attr]
                      )}
                      className={`px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedAttributes.find(a => a.id === attr.id) ? 'bg-blue-500 text-white border-blue-500 shadow-lg' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>
                      {attr.name}
                    </button>
                  ))}
                  {attrSearchQuery && !availableAttributes.find(a => a.name.toLowerCase() === attrSearchQuery.toLowerCase()) && (
                    <button type="button" onClick={() => createAttributeLocal(attrSearchQuery)} disabled={inlineLoading}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/20 text-blue-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-blue-500/30 hover:bg-blue-500/30">
                      <Plus size={12} /> Créer "{attrSearchQuery}"
                    </button>
                  )}
                </div>

                {selectedAttributes.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedAttributes.map(attr => (
                      <div key={attr.id} className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{attr.name}</span>
                        <div className="flex flex-wrap gap-2">
                          {attr.values?.map(v => (
                            <button key={v.id} type="button"
                              onClick={() => {
                                const cur = selectedValuesMap[attr.id] || [];
                                setSelectedValuesMap({ ...selectedValuesMap, [attr.id]: cur.includes(v.id) ? cur.filter(id => id !== v.id) : [...cur, v.id] });
                              }}
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${(selectedValuesMap[attr.id] || []).includes(v.id) ? 'bg-blue-500/20 text-blue-400 border-blue-400/30' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                              {v.value}
                            </button>
                          ))}
                          <InlineAdder label="valeur" onAdd={val => addAttributeValueLocal(attr.id, val)} loading={inlineLoading} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button type="button" onClick={generateVariants} disabled={!selectedAttributes.length}
                  className="w-full py-5 bg-blue-500 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 disabled:opacity-30 transition-all hover:bg-blue-600">
                  Générer les variantes
                </button>
              </div>

              {/* Liste des variantes */}
              {variantFields.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">
                    {variantFields.length} variante{variantFields.length > 1 ? 's' : ''}
                  </h4>
                  {variantFields.map((field, idx) => (
                    <div key={field.id} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex flex-wrap gap-2">
                          {field.combination && Object.entries(field.combination).map(([a, v], i) => (
                            <span key={i} className="px-3 py-1 bg-blue-500/5 text-blue-500 text-[10px] font-black uppercase rounded-xl border border-blue-500/10">{a}: {v}</span>
                          ))}
                        </div>
                        <button type="button" onClick={() => removeVariant(idx)}
                          className="w-8 h-8 rounded-xl bg-slate-50 text-slate-300 hover:bg-rose-50 hover:text-rose-500 flex items-center justify-center transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Prix', field: `variants.${idx}.price`, cls: 'text-blue-500' },
                          { label: 'Ancien prix', field: `variants.${idx}.old_price`, cls: 'text-slate-400' },
                          { label: 'Stock', field: `variants.${idx}.stock`, cls: 'text-slate-700' },
                          { label: 'SKU', field: `variants.${idx}.sku`, cls: 'font-mono text-slate-600', type: 'text' },
                        ].map(({ label, field: f, cls, type = 'number' }) => (
                          <div key={f} className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</label>
                            <input type={type} {...register(f)} placeholder="0"
                              className={`w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-black outline-none ${cls}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-white">
        <button type="button" onClick={prevStep} disabled={currentStep === 0}
          className="flex items-center gap-2 px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all disabled:opacity-0">
          <ChevronLeft size={16} /> Précédent
        </button>
        <div className="flex gap-3">
          {currentStep < steps.length - 1 ? (
            <button type="button" onClick={nextStep}
              className="flex items-center gap-2 px-12 py-4 bg-blue-500 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl shadow-blue-500/20 hover:bg-slate-900 transition-all">
              Continuer <ChevronRight size={16} />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit(onSubmit)} disabled={loading}
              className="flex items-center gap-2 px-16 py-4 bg-emerald-500 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl shadow-emerald-500/20 hover:bg-slate-900 transition-all disabled:opacity-50">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Save size={16} /> Sauvegarder</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <CategorySearchModal categories={categories} onClose={() => setShowCategoryModal(false)}
            onSelect={cat => { setValue('category_id', cat.id); setShowCategoryModal(false); }} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
