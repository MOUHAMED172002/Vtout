import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  X, Plus, Trash2, Image as ImageIcon, Check, ChevronRight,
  ChevronLeft, Package, Layers, Truck, Info, AlertCircle,
  Upload, Star, Sparkles, Hash, Search, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../clerk-shim';

import {
  getCategories,
  getAttributes,
  getAttributesByCategory,
  createAttribute,
  addAttributeValue,
  createProduct,
  getProducts,
  updateProduct
} from '../../services/productService';
import { getSuppliers } from '../../services/supplierService';
import { uploadSingleImage } from '../../services/uploadService';
import CategorySearchModal from './CategorySearchModal';
import CustomSelect from '../Shared/CustomSelect';

const baseSteps = [
  { id: 'info', title: 'Informations', icon: Info },
  { id: 'attributes', title: 'Attributs', icon: Hash },
  { id: 'images', title: 'Images', icon: ImageIcon },
  { id: 'variants', title: 'Variantes', icon: Layers },
  { id: 'suppliers', title: 'Logistique', icon: Truck },
];

const InlineAdder = ({ label, onAdd, loading }) => {
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);

  if (!show) return (
    <button
      type="button"
      onClick={() => setShow(true)}
      className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:underline transition-all"
    >
      <Plus size={12} /> Ajout rapide {label}
    </button>
  );

  return (
    <div className="flex items-center gap-2 animate-in zoom-in-95 duration-200">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        className="input input-xs input-bordered h-8 text-[10px] font-bold"
        placeholder={`Nom ${label}...`}
        autoFocus
      />
      <button
        type="button"
        disabled={loading || !value}
        onClick={async () => {
          await onAdd(value);
          setValue('');
          setShow(false);
        }}
        className={`btn btn-xs btn-primary h-8 px-4 font-black ${loading ? 'loading' : ''}`}
      >
        OK
      </button>
      <button type="button" onClick={() => setShow(false)} className="btn btn-xs btn-ghost h-8 w-8 p-0">×</button>
    </div>
  );
};

export default function AddProductModal({ onClose, onCreate, isSupplier = false, layout = 'modal' }) {
  const steps = useMemo(() => {
    return isSupplier
      ? [
        { id: 'info', title: 'Informations', icon: Info },
        { id: 'attributes', title: 'Attributs', icon: Hash },
        { id: 'images', title: 'Images', icon: ImageIcon },
        { id: 'variants', title: 'Variantes', icon: Layers },
        { id: 'suppliers', title: 'Prix & Stock', icon: Truck },
      ]
      : baseSteps;
  }, [isSupplier]);

  const { getToken } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inlineLoading, setInlineLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [availableAttributes, setAvailableAttributes] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [selectedValuesMap, setSelectedValuesMap] = useState({}); // { attrId: [valId1, valId2] }
  const [attrSearchQuery, setAttrSearchQuery] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [existingProduct, setExistingProduct] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(false);

  // Suppliers States
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [globalSupplierPrice, setGlobalSupplierPrice] = useState("");
  const [creatingSupplier, setCreatingSupplier] = useState(false);
  const [newSupplierData, setNewSupplierData] = useState({
    name: "",
    phone: "",
    email: "",
    address_line: "",
    departement_label: "",
    commune_label: "",
    quartier_label: ""
  });

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      description: '',
      category_id: '',
      price: '',
      old_price: '',
      stock: 0,
      variants: [],
      is_flash_sale: false,
      flash_sale_end: '',
      supplier_note: ''
    }
  });

  const productName = watch('name');
  const catId = watch('category_id');

  const productName = watch('name');
  const catId = watch('category_id');

  const variants = watch('variants');

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: "variants"
  });

  const selectedCategoryId = watch('category_id');
  const variants = watch('variants');

  useEffect(() => {
    const fetchAllAttrs = async () => {
      try {
        const allAttrs = await getAttributes();
        setAvailableAttributes(allAttrs || []);
      } catch (err) {
        console.error("Error fetching attributes:", err);
      }
    };
    fetchAllAttrs();
  }, []);

  const selectedCategory = useMemo(() => {
    return categories.find(c => String(c.id) === String(selectedCategoryId));
  }, [categories, selectedCategoryId]);

  const categoryPath = useMemo(() => {
    if (!selectedCategory || categories.length === 0) return '';
    const path = [];
    let current = selectedCategory;
    while (current) {
      path.unshift(current.name);
      current = categories.find(c => c.id === current.parent_id);
    }
    return path.join(' > ');
  }, [selectedCategory, categories]);

  const totalVariantStock = useMemo(() => {
    if (!variants || variants.length === 0) return null;
    return variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
  }, [variants]);

  const fetchData = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats || []);
    } catch (err) {
      console.error("Erreur getCategories:", err);
    }

    try {
      const token = await getToken();
      if (token) {
        const sups = await getSuppliers(token);
        setSuppliers(sups || []);
      }
    } catch (err) {
      console.error("Erreur getSuppliers:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCategory = async (name) => {
    setInlineLoading(true);
    try {
      const token = await getToken();
      await createCategory({ name }, token);
      toast.success("Catégorie ajoutée");
      await fetchData();
    } catch (err) {
      toast.error("Erreur ajout catégorie");
    } finally {
      setInlineLoading(false);
    }
  };

  const addAttributeValueLocal = async (attributeId, value) => {
    setInlineLoading(true);
    try {
      const token = await getToken();
      await addAttributeValue(attributeId, value, token);
      await new Promise(r => setTimeout(r, 400));
      const updatedAttrs = await getAttributes();
      setAvailableAttributes(updatedAttrs);
      setSelectedAttributes(prev => prev.map(a => a.id === attributeId ? updatedAttrs.find(ua => ua.id === attributeId) : a));
      toast.success("Valeur ajoutée");
    } catch (err) {
      toast.error("Erreur ajout valeur");
    } finally {
      setInlineLoading(false);
    }
  };

  const createAttributeLocal = async (name) => {
    if (!name.trim()) return;
    setInlineLoading(true);
    try {
      const token = await getToken();
      const newAttrResp = await createAttribute({ name }, token);
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
      toast.success("Attribut créé");
    } catch (err) {
      toast.error("Erreur création attribut");
    } finally {
      setInlineLoading(false);
    }
  };

  const handleAddSupplierInline = async () => {
    setInlineLoading(true);
    try {
      const token = await getToken();
      const createdSup = await createSupplier(newSupplierData, token);
      toast.success("Fournisseur créé");
      setSuppliers(prev => [...prev, createdSup]);
      setSelectedSupplierId(createdSup.id);
      setCreatingSupplier(false);
      setNewSupplierData({
        name: "", phone: "", email: "", address_line: "",
        departement_label: "", commune_label: "", quartier_label: ""
      });
    } catch (err) {
      toast.error("Erreur ajout fournisseur");
    } finally {
      setInlineLoading(false);
    }
  };

  const handleAddSupplier = async (name) => {
    setInlineLoading(true);
    try {
      const token = await getToken();
      const created = await createSupplier({ name }, token);
      toast.success("Fournisseur ajouté");
      setSuppliers(prev => [...prev, created]);
    } catch (err) {
      toast.error("Erreur ajout fournisseur");
    } finally {
      setInlineLoading(false);
    }
  };

  useEffect(() => {
    async function loadAttrs() {
      try {
        const attrs = await getAttributes();
        setAvailableAttributes(attrs || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadAttrs();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isMain: imageFiles.length === 0 && files.indexOf(file) === 0
    }));
    setImageFiles([...imageFiles, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...imageFiles];
    const removed = newImages.splice(index, 1)[0];
    if (removed.isMain && newImages.length > 0) {
      newImages[0].isMain = true;
    }
    setImageFiles(newImages);
  };

  const setMainImage = (index) => {
    setImageFiles(imageFiles.map((img, i) => ({
      ...img,
      isMain: i === index
    })));
  };

  const generateVariants = () => {
    try {
      if (selectedAttributes.length === 0) {
        throw new Error("Sélectionnez au moins un attribut");
      }
      const combinations = cartesianProduct(selectedAttributes.map(a => {
        const valIds = selectedValuesMap[a.id] || [];
        const chosenValues = a.values.filter(v => valIds.includes(v.id));
        if (chosenValues.length === 0) {
          throw new Error(`Sélectionnez au moins une valeur pour "${a.name}"`);
        }
        return chosenValues.map(v => ({ attribute: a.name, value: v.value }));
      }));

      const newVariants = combinations.map(combo => {
        const comboObj = {};
        const comboArray = Array.isArray(combo) ? combo : [combo];
        comboArray.forEach(item => { comboObj[item.attribute] = item.value; });

        const initialSupplierLinks = [];
        if (selectedSupplierId || isSupplier) {
          initialSupplierLinks.push({
            supplier_id: isSupplier ? 'me' : selectedSupplierId,
            supplier_name: isSupplier ? 'Moi' : (suppliers.find(s => s.id === selectedSupplierId)?.name || 'Fournisseur Global'),
            supplier_price: parseFloat(globalSupplierPrice) || 0,
            supplier_sku: ''
          });
        }

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
    } catch (e) {
      toast.error(e.message);
    }
  };

  const cartesianProduct = (arrays) => {
    return arrays.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())), [[]]);
  };

  const onSubmit = async (data) => {
    if (!selectedSupplierId && !isSupplier) {
      setCurrentStep(3);
      toast.error("Veuillez sélectionner un fournisseur.");
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const uploadedImages = [];

      for (const img of imageFiles) {
        const url = await uploadSingleImage(img.file, token);
        uploadedImages.push({ url, isMain: img.isMain });
      }

      const mainImageUrl = uploadedImages.find(img => img.isMain)?.url || (uploadedImages.length > 0 ? uploadedImages[0].url : null);

      const processedVariants = [];
      for (const v of (data.variants || [])) {
        let vImageUrl = mainImageUrl;
        if (v.image_file) {
          vImageUrl = await uploadSingleImage(v.image_file, token);
        }
        processedVariants.push({
          ...v,
          price: !isSupplier ? (parseFloat(v.price) || parseFloat(data.price) || 0) : 0,
          old_price: !isSupplier ? (v.old_price ? parseFloat(v.old_price) : (data.old_price ? parseFloat(data.old_price) : null)) : null,
          stock: parseInt(v.stock) || 0,
          image_url: vImageUrl,
          supplierLinks: (v.supplierLinks || []).map(link => ({
            ...link,
            supplier_price: parseFloat(link.supplier_price) || 0
          }))
        });
      }

      const payload = {
        name: data.name,
        description: data.description || null,
        price: !isSupplier ? parseFloat(data.price) : 0,
        old_price: !isSupplier && data.old_price ? parseFloat(data.old_price) : null,
        stock: parseInt(data.stock) || 0,
        category_id: parseInt(data.category_id),
        images: uploadedImages,
        is_flash_sale: data.is_flash_sale,
        flash_sale_end: data.is_flash_sale ? data.flash_sale_end : null,
        supplier_note: data.supplier_note || null,
        variants: processedVariants,
        supplier_price: isSupplier ? parseFloat(globalSupplierPrice) || 0 : null
      };

      if (onCreate) {
        await onCreate(payload);
      } else {
        await createProduct(payload, token);
        toast.success("Produit créé avec succès !");
      }
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 0 && !selectedCategoryId) {
      toast.error('Sélectionnez une catégorie.');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const addSupplierToVariant = (vIndex, supplier) => {
    const currentVariants = [...variants];
    const variant = currentVariants[vIndex];
    if (!variant.supplierLinks) variant.supplierLinks = [];
    if (variant.supplierLinks.some(link => link.supplier_id === supplier.id)) {
      toast.error("Déjà lié.");
      return;
    }
    variant.supplierLinks.push({
      supplier_id: supplier.id,
      supplier_name: supplier.name,
      supplier_price: 0,
      supplier_sku: ''
    });
    setValue('variants', currentVariants);
  };

  const removeSupplierFromVariant = (vIndex, sIndex) => {
    const currentVariants = [...variants];
    currentVariants[vIndex].supplierLinks.splice(sIndex, 1);
    setValue('variants', currentVariants);
  };

  return (
    <motion.div
      initial={layout === 'modal' ? { opacity: 0, scale: 0.95, y: 30 } : { opacity: 1 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`${layout === 'modal'
        ? "bg-white w-full max-w-5xl max-h-[92vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-100 z-50 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        : "bg-white w-full min-h-screen flex flex-col"
        }`}
    >
      <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white relative">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-primary/20">
            <Package className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Nouveau <span className="text-slate-400">Produit.</span></h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Etape {currentStep + 1} • {steps[currentStep].title}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="px-10 py-6 bg-slate-50/30 flex justify-between items-center gap-4 overflow-x-auto border-b border-slate-50">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <button
              type="button"
              onClick={() => currentStep > idx && setCurrentStep(idx)}
              className={`flex items-center gap-4 group transition-all ${idx <= currentStep ? 'text-primary' : 'text-slate-300'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${idx === currentStep ? 'bg-primary text-white shadow-lg' : idx < currentStep ? 'bg-emerald-50 text-emerald-500' : 'bg-white border border-slate-100'}`}>
                {idx < currentStep ? <Check size={18} /> : <step.icon size={18} />}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${idx === currentStep ? 'text-slate-900' : 'text-slate-400'}`}>{step.title}</span>
            </button>
            {idx < steps.length - 1 && <div className={`h-px w-8 ${idx < currentStep ? 'bg-emerald-200' : 'bg-slate-100'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-10 md:p-14 space-y-12 custom-scrollbar">
        <AnimatePresence mode="wait">
          {steps[currentStep].id === 'info' && (
            <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="md:col-span-2 space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">Nom de l'article</label>
                <input {...register("name", { required: "Requis" })} autoFocus className="w-full bg-white border border-slate-100 rounded-3xl px-8 py-5 text-xl font-black text-slate-900 shadow-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Catégorie</label>
                  <InlineAdder label="catégorie" onAdd={handleAddCategory} loading={inlineLoading} />
                </div>
                <button type="button" onClick={() => setShowCategoryModal(true)} className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-left flex items-center justify-between group hover:border-primary/20 transition-all shadow-sm">
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${selectedCategory ? 'text-slate-900' : 'text-slate-300'}`}>{selectedCategory ? selectedCategory.name : "Sélectionner une catégorie"}</span>
                    {categoryPath && <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest line-clamp-1">{categoryPath}</span>}
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
                </button>
              </div>

              {isSupplier && (
                <div className="md:col-span-2 space-y-3">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-500">Note pour l'admin (Privé)</label>
                  <textarea {...register("supplier_note")} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-600 outline-none" placeholder="Infos utiles pour l'admin..." rows={3} />
                </div>
              )}

              {!isSupplier && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Prix de vente base (FCFA)</label>
                    <input type="number" {...register("price", { required: !isSupplier })} className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-xl font-black text-primary" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Ancien Prix (FCFA)</label>
                    <input type="number" {...register("old_price")} className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-xl font-black text-slate-400 line-through" />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {steps[currentStep].id === 'attributes' && (
            <motion.div key="attributes" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white space-y-10">
                <div className="space-y-6">
                  <h3 className="text-2xl font-black">Configuration <span className="text-primary">Attributs.</span></h3>
                  <p className="text-xs text-slate-400 font-bold">Sélectionnez les attributs disponibles pour votre produit (Couleur, Taille, etc.)</p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input type="text" value={attrSearchQuery} onChange={e => setAttrSearchQuery(e.target.value)} placeholder="Chercher attribut..." className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-8 py-5" />
                      </div>
                      {attrSearchQuery.trim() && !availableAttributes.find(a => a.name.toLowerCase() === attrSearchQuery.trim().toLowerCase()) && (
                        <button type="button" onClick={() => createAttributeLocal(attrSearchQuery)} disabled={inlineLoading} className="px-8 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] whitespace-nowrap shadow-xl shadow-primary/20">
                          {inlineLoading ? "Création..." : "+ Créer Attribut"}
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableAttributes.filter(a => a.name.toLowerCase().includes(attrSearchQuery.toLowerCase())).map(attr => (
                        <button key={attr.id} type="button" onClick={() => {
                          if (selectedAttributes.find(a => a.id === attr.id)) setSelectedAttributes(selectedAttributes.filter(a => a.id !== attr.id));
                          else setSelectedAttributes([...selectedAttributes, attr]);
                        }} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedAttributes.find(a => a.id === attr.id) ? 'bg-primary text-white border-primary' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                          {attr.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedAttributes.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedAttributes.map(attr => (
                      <div key={attr.id} className="p-5 bg-white/5 rounded-[2rem] border border-white/10 space-y-4">
                        <span className="text-[10px] font-black uppercase text-primary">{attr.name}</span>
                        <div className="flex flex-wrap gap-2">
                          {attr.values.map(v => (
                            <button key={v.id} type="button" onClick={() => {
                              const current = selectedValuesMap[attr.id] || [];
                              if (current.includes(v.id)) setSelectedValuesMap({ ...selectedValuesMap, [attr.id]: current.filter(id => id !== v.id) });
                              else setSelectedValuesMap({ ...selectedValuesMap, [attr.id]: [...current, v.id] });
                            }} className={`px-3 py-1 rounded-lg text-[10px] border ${selectedValuesMap[attr.id]?.includes(v.id) ? 'bg-primary border-primary' : 'bg-white/5 border-white/10'}`}>
                              {v.value}
                            </button>
                          ))}
                          <div className="ml-2 flex items-center">
                            <InlineAdder label="valeur" onAdd={(val) => addAttributeValueLocal(attr.id, val)} loading={inlineLoading} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button type="button" onClick={() => { generateVariants(); nextStep(); }} disabled={selectedAttributes.length === 0} className="w-full py-5 bg-primary rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20">Générer & Continuer</button>
              </div>
            </motion.div>
          )}

          {steps[currentStep].id === 'images' && (
            <motion.div key="images" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div className="flex justify-between items-center">
                <h3 className="text-3xl font-black text-slate-900">Galerie <span className="text-slate-400">Visuelle.</span></h3>
                <label className="flex items-center gap-3 px-8 py-4 bg-primary rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white cursor-pointer">
                  <Upload size={14} /> Ajouter des photos
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {imageFiles.map((img, idx) => (
                  <div key={idx} className={`relative aspect-square rounded-3xl overflow-hidden border-4 ${img.isMain ? 'border-primary' : 'border-white'}`}>
                    <img src={img.preview} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity">
                      <button type="button" onClick={() => setMainImage(idx)} className="px-4 py-2 bg-primary text-white rounded-lg text-[10px] font-black uppercase">Cover</button>
                      <button type="button" onClick={() => removeImage(idx)} className="px-4 py-2 bg-rose-500 text-white rounded-lg text-[10px] font-black uppercase">Supprimer</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {steps[currentStep].id === 'variants' && (
            <motion.div key="variants" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Personnalisation des <span className="text-primary">Variantes.</span></h3>
              
              {variantFields.length > 0 ? (
                <div className="grid grid-cols-1 gap-8">
                  {variantFields.map((field, index) => (
                    <div key={field.id} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                        {/* Variant Image Upload */}
                        <div className="w-full md:w-32 aspect-square relative group/img">
                          <div className="w-full h-full bg-slate-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 overflow-hidden relative">
                            {watch(`variants.${index}.preview_url`) ? (
                              <img src={watch(`variants.${index}.preview_url`)} className="w-full h-full object-cover" />
                            ) : (
                              <>
                                <ImageIcon className="w-8 h-8 text-slate-300" />
                                <span className="text-[8px] font-black uppercase text-slate-400 mt-2">Variante</span>
                              </>
                            )}
                            <input
                              type="file"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setValue(`variants.${index}.image_file`, file);
                                  setValue(`variants.${index}.preview_url`, URL.createObjectURL(file));
                                }
                              }}
                            />
                          </div>
                          {watch(`variants.${index}.preview_url`) && (
                            <button
                              type="button"
                              onClick={() => {
                                setValue(`variants.${index}.image_file`, null);
                                setValue(`variants.${index}.preview_url`, null);
                              }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>

                        <div className="flex-1 space-y-6">
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              {field.combination && Object.entries(field.combination).map(([a, v], i) => (
                                <span key={i} className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase tracking-wider shadow-sm">{a}: {v}</span>
                              ))}
                            </div>
                            <button type="button" onClick={() => removeVariant(index)} className="w-10 h-10 rounded-xl bg-rose-50 text-rose-300 hover:text-rose-500 hover:bg-rose-100 transition-all flex items-center justify-center"><Trash2 size={18} /></button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {!isSupplier && (
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 px-1">Prix Vente</label>
                                <input type="number" {...register(`variants.${index}.price`)} className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-xs font-black" placeholder="0" />
                              </div>
                            )}
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 px-1">Stock</label>
                              <input type="number" {...register(`variants.${index}.stock`)} className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-xs font-black text-primary" placeholder="0" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-slate-400 px-1">SKU / Réf</label>
                              <input type="text" {...register(`variants.${index}.sku`)} className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 text-xs font-black" placeholder="REF-" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-6 text-slate-300">
                  <Layers size={64} strokeWidth={1} />
                  <div className="text-center space-y-2">
                    <p className="font-black text-slate-400 uppercase tracking-widest">Aucune variante générée</p>
                    <button type="button" onClick={() => setCurrentStep(steps.findIndex(s => s.id === 'attributes'))} className="text-primary text-xs font-black hover:underline uppercase tracking-widest">Retourner aux attributs</button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {steps[currentStep].id === 'suppliers' && (
            <motion.div key="suppliers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div className="p-8 bg-indigo-50 rounded-[3rem] space-y-8">
                <div className="flex items-center gap-4">
                  <Truck className="text-indigo-500" />
                  <h3 className="text-xl font-black uppercase tracking-widest">Paiement & Logistique</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {!isSupplier ? (
                    <CustomSelect
                      value={selectedSupplierId}
                      onChange={val => {
                        setSelectedSupplierId(val);
                        setCreatingSupplier(val === 'new');
                      }}
                      options={[
                        ...suppliers.map(s => ({ value: s.id, label: s.name })),
                        { value: 'new', label: '+ Nouveau' }
                      ]}
                      placeholder="Fournisseur..."
                      className="w-full"
                    />
                  ) : (
                    <div className="p-4 bg-white rounded-2xl flex items-center gap-3">
                      <Truck className="text-primary" />
                      <span className="font-black text-sm">Fournisseur Connecté</span>
                    </div>
                  )}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400">Prix de gros (FCFA)</label>
                    <div className="relative">
                      <input type="number" value={globalSupplierPrice} onChange={e => setGlobalSupplierPrice(e.target.value)} className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 font-black" placeholder="Prix Accordé (FCFA)" />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-indigo-300">FCFA</span>
                    </div>
                  </div>
                </div>

                {isSupplier && variantFields.length === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-slate-400">Stock Disponible</label>
                      <input type="number" {...register("stock")} className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 font-black" placeholder="Quantité..." />
                    </div>
                  </div>
                )}

                {variantFields.length > 0 && (
                  <div className="space-y-6">
                    {variantFields.map((field, vIdx) => (
                      <div key={field.id} className="p-6 bg-white rounded-3xl border border-slate-100 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase">Variante {vIdx + 1}</span>
                          <span className="text-[10px] font-mono opacity-50">
                            {watch(`variants.${vIdx}.combination`) ? Object.values(watch(`variants.${vIdx}.combination`)).join(', ') : ''} | {watch(`variants.${vIdx}.sku`)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-400">{isSupplier ? "Prix de Gros/Achat (FCFA)" : "Prix d'Achat"}</label>
                            <input type="number" defaultValue={(watch(`variants.${vIdx}.supplierLinks`) || [{}])[0]?.supplier_price || globalSupplierPrice} onChange={e => {
                              const val = parseFloat(e.target.value) || 0;
                              const current = [...variants];
                              if (!current[vIdx].supplierLinks) current[vIdx].supplierLinks = [{ supplier_id: selectedSupplierId || 'me', supplier_price: val }];
                              else if (current[vIdx].supplierLinks[0]) current[vIdx].supplierLinks[0].supplier_price = val;
                              else current[vIdx].supplierLinks.push({ supplier_id: selectedSupplierId || 'me', supplier_price: val });
                              setValue('variants', current);
                            }} className="input input-bordered rounded-xl text-xs w-full" placeholder="0" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] font-black uppercase text-slate-400">Réf Interne</label>
                            <input type="text" defaultValue={(watch(`variants.${vIdx}.supplierLinks`) || [{}])[0]?.supplier_sku || ''} onChange={e => {
                              const current = [...variants];
                              if (!current[vIdx].supplierLinks) current[vIdx].supplierLinks = [{ supplier_id: selectedSupplierId || 'me', supplier_sku: e.target.value }];
                              else if (current[vIdx].supplierLinks[0]) current[vIdx].supplierLinks[0].supplier_sku = e.target.value;
                              setValue('variants', current);
                            }} className="input input-bordered rounded-xl text-xs w-full" placeholder="REF-" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-10 border-t border-slate-50 flex justify-between bg-white relative z-10">
        <button type="button" onClick={prevStep} disabled={currentStep === 0} className="px-8 py-4 bg-slate-50 rounded-2xl font-black text-xs uppercase text-slate-400 hover:text-slate-900 flex items-center gap-2">
          <ChevronLeft size={18} /> Précédent
        </button>
        <div className="flex gap-4">
          {currentStep < steps.length - 1 ? (
            <button type="button" onClick={nextStep} className="px-12 py-5 bg-primary rounded-2xl font-black text-xs uppercase text-white shadow-xl shadow-primary/20 hover:bg-slate-900 transition-all flex items-center gap-2">
              Continuer <ChevronRight size={18} />
            </button>
          ) : (
            <button type="submit" onClick={handleSubmit(onSubmit)} disabled={loading} className="px-16 py-5 bg-primary rounded-2xl font-black text-xs uppercase text-white shadow-xl shadow-primary/20 hover:bg-slate-900 transition-all flex items-center gap-2">
              {loading ? 'Publication...' : 'Finaliser'} <Check size={18} />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCategoryModal && (
          <CategorySearchModal
            categories={categories}
            onClose={() => setShowCategoryModal(false)}
            onSelect={(cat) => {
              setValue('category_id', cat.id);
              setShowCategoryModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
