import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  X, Plus, Trash2, Image as ImageIcon, Check, ChevronRight,
  ChevronLeft, Package, Layers, Info, Save, Upload, Star, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../lib/clerk-shim';
import {
  getCategories,
  getAttributes,
  createAttribute,
  addAttributeValue,
  getAttributesByCategory
} from '../../../services/productService';
import api from '../../../services/api';
import { uploadSingleImage } from '../../../services/uploadService';
import CategorySearchModal from '../../Shared/CategorySearchModal';

const steps = [
  { id: 'info', title: 'Informations', icon: Info },
  { id: 'images', title: 'Images', icon: ImageIcon },
  { id: 'variantes', title: 'Variantes', icon: Layers },
];

export default function AdminAddProductModal({ supplier, boutique, onClose, onCreated }) {
  const { getToken } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [availableAttributes, setAvailableAttributes] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [selectedValuesMap, setSelectedValuesMap] = useState({});
  const [attrSearchQuery, setAttrSearchQuery] = useState('');
  const [imageFiles, setImageFiles] = useState([]);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '', description: '', category_id: '', price: '', old_price: '',
      stock: 0, variants: [], is_flash_sale: false, flash_sale_end: '',
      supplier_price: ''
    }
  });

  const { fields: variantFields, remove: removeVariant } = useFieldArray({ control, name: 'variants' });
  const selectedCategoryId = watch('category_id');

  useEffect(() => {
    (async () => {
      try { const cats = await getCategories(); setCategories(cats || []); } catch (e) { console.error(e); }
      try { const attrs = await getAttributes(); setAvailableAttributes(attrs || []); } catch (e) { console.error(e); }
    })();
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) return;
    getAttributesByCategory(selectedCategoryId).then(d => setAvailableAttributes(d || [])).catch(console.error);
  }, [selectedCategoryId]);

  const selectedCategory = useMemo(() => categories.find(c => String(c.id) === String(selectedCategoryId)), [categories, selectedCategoryId]);

  const handleImageChange = e => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files.map((file, i) => ({
      file, preview: URL.createObjectURL(file), isMain: prev.length === 0 && i === 0
    }))]);
  };

  const removeImage = index => {
    const imgs = [...imageFiles];
    imgs.splice(index, 1);
    setImageFiles(imgs);
  };

  const setMainImage = index => setImageFiles(imageFiles.map((img, i) => ({ ...img, isMain: i === index })));

  const onSubmit = async (data) => {
    if (!supplier) return toast.error("Erreur: Aucun fournisseur spécifié.");
    setLoading(true);
    try {
      const token = await getToken();
      const finalImages = [];
      for (const img of imageFiles) {
        const url = await uploadSingleImage(img.file, token);
        finalImages.push({ url, isMain: img.isMain });
      }
      const mainImageUrl = finalImages.find(i => i.isMain)?.url || null;

      const payload = {
        ...data,
        supplier_id: supplier.id,
        boutique_id: boutique?.id || null,
        images: finalImages,
        price: parseFloat(data.price),
        old_price: data.old_price ? parseFloat(data.old_price) : null,
        stock: parseInt(data.stock),
        category_id: parseInt(data.category_id),
        supplier_price: parseFloat(data.supplier_price) || null,
        variants: (data.variants || []).map(v => ({
          ...v,
          price: parseFloat(v.price) || parseFloat(data.price),
          stock: parseInt(v.stock) || 0,
          image_url: v.image_url || mainImageUrl
        }))
      };

      await api.post('/products/admin', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Produit ajouté avec succès !');
      onCreated?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Erreur lors de la création');
    } finally { setLoading(false); }
  };

  const nextStep = () => setCurrentStep(p => Math.min(p + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(p => Math.max(p - 1, 0));

  const cartesianProduct = arrays => arrays.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())), [[]]);

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
        return { combination: obj, sku: '', price: parseFloat(watch('price')) || 0, stock: 0 };
      }));
      toast.success(`${combinations.length} variantes générées`);
    } catch (e) { toast.error(e.message); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-5xl max-h-[92vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-100"
      >
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <Plus className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Nouvel Article</h2>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Pour: {boutique?.name || supplier?.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-11 h-11 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar">
          {currentStep === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nom de l'article</label>
                <input {...register('name', { required: true })} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-lg font-black text-slate-900" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Catégorie</label>
                <button type="button" onClick={() => setShowCategoryModal(true)} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-left font-bold text-slate-700">
                  {selectedCategory ? selectedCategory.name : 'Choisir une catégorie'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prix (FCFA)</label>
                  <input type="number" {...register('price')} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-black" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prix de gros</label>
                  <input type="number" {...register('supplier_price')} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-black text-indigo-600" />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                <textarea {...register('description')} rows={3} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 resize-none" />
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-8">
              <label className="flex flex-col items-center justify-center p-12 border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all group">
                <Upload size={32} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                <span className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Importer des photos</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              <div className="grid grid-cols-4 gap-4">
                {imageFiles.map((img, idx) => (
                  <div key={idx} className={`relative aspect-square rounded-2xl overflow-hidden border-2 ${img.isMain ? 'border-indigo-500' : 'border-transparent'}`}>
                    <img src={img.preview} className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 w-6 h-6 bg-rose-500 text-white rounded-lg flex items-center justify-center">
                      <X size={12} />
                    </button>
                    {!img.isMain && <button onClick={() => setMainImage(idx)} className="absolute bottom-2 left-2 px-2 py-1 bg-white/80 text-[8px] font-black uppercase rounded">Cover</button>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white">
                <h3 className="text-xl font-black mb-6">Générer des variantes</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {availableAttributes.map(attr => (
                    <button key={attr.id} onClick={() => setSelectedAttributes(prev => prev.includes(attr) ? prev.filter(a => a !== attr) : [...prev, attr])}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${selectedAttributes.includes(attr) ? 'bg-indigo-500 border-indigo-500' : 'border-white/10'}`}>
                      {attr.name}
                    </button>
                  ))}
                </div>
                {selectedAttributes.map(attr => (
                  <div key={attr.id} className="mb-4">
                    <p className="text-[10px] font-black text-indigo-400 uppercase mb-2">{attr.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {attr.values?.map(v => (
                        <button key={v.id} onClick={() => {
                          const cur = selectedValuesMap[attr.id] || [];
                          setSelectedValuesMap({ ...selectedValuesMap, [attr.id]: cur.includes(v.id) ? cur.filter(id => id !== v.id) : [...cur, v.id] });
                        }}
                        className={`px-3 py-1 rounded-lg text-[10px] border ${(selectedValuesMap[attr.id] || []).includes(v.id) ? 'bg-indigo-500/20 text-indigo-400 border-indigo-400/30' : 'border-white/10'}`}>
                          {v.value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={generateVariants} className="w-full py-4 bg-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest mt-4">Générer les combinaisons</button>
              </div>

              <div className="space-y-4">
                {variantFields.map((field, idx) => (
                  <div key={field.id} className="p-6 bg-slate-50 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-black text-slate-900">{Object.values(field.combination).join(' / ')}</p>
                    </div>
                    <div className="flex gap-4">
                      <input type="number" {...register(`variants.${idx}.price`)} placeholder="Prix" className="w-24 bg-white px-3 py-2 rounded-xl text-xs font-bold" />
                      <input type="number" {...register(`variants.${idx}.stock`)} placeholder="Stock" className="w-24 bg-white px-3 py-2 rounded-xl text-xs font-bold" />
                    </div>
                    <button onClick={() => removeVariant(idx)} className="text-rose-400 hover:text-rose-600"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-slate-50 flex items-center justify-between">
          <button onClick={prevStep} disabled={currentStep === 0} className="px-8 py-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 disabled:opacity-0">Précédent</button>
          <div className="flex gap-3">
            {currentStep < steps.length - 1 ? (
              <button onClick={nextStep} className="px-12 py-4 bg-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl shadow-indigo-200">Suivant</button>
            ) : (
              <button onClick={handleSubmit(onSubmit)} disabled={loading} className="px-16 py-4 bg-emerald-500 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl shadow-emerald-200">
                {loading ? 'Création...' : 'Créer le produit'}
              </button>
            )}
          </div>
        </div>

        <CategorySearchModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onSelect={(id) => {
            setValue('category_id', id);
            setShowCategoryModal(false);
          }}
          categories={categories}
        />
      </motion.div>
    </div>
  );
}
