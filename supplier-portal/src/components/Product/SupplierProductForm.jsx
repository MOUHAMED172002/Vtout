import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
    X, Plus, Trash2, Image as ImageIcon, Check, ChevronRight,
    ChevronLeft, Package, Layers, Truck, Info, AlertCircle,
    Upload, Star, Sparkles, Hash, Search as SearchIcon, Percent, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../clerk-shim';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

import {
    getCategories,
    getAttributes,
    createAttribute,
    addAttributeValue,
    getAttributesByCategory,
    createProduct,
    updateProduct,
    searchProducts,
    getProducts
} from '../../services/productService';
import { uploadSingleImage } from '../../services/uploadService';
import { getDeliveryFeeTiers, computeDeliveryFee, computePublicPrice, reverseSupplierPrice } from '../../services/deliveryFeeService';
import CategorySearchModal from './CategorySearchModal';
import CustomSelect from '../Shared/CustomSelect';

const steps = [
    { id: 'info', title: 'Informations', icon: Info },
    { id: 'attributes', title: 'Attributs', icon: Hash },
    { id: 'images', title: 'Images', icon: ImageIcon },
    { id: 'variants', title: 'Variantes & Prix', icon: Layers },
];

const InlineAdder = ({ label, onAdd, loading }) => {
    const [value, setValue] = useState('');
    const [show, setShow] = useState(false);

    if (!show) return (
        <button
            type="button"
            onClick={() => setShow(true)}
            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:underline transition-all"
        >
            <Plus size={12} /> {label}
        </button>
    );

    return (
        <div className="flex items-center gap-2 animate-in zoom-in-95 duration-200">
            <input
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                className="input input-xs input-bordered h-7 text-[10px] font-bold"
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
                className={`btn btn-xs btn-primary h-7 px-3 font-black ${loading ? 'loading' : ''}`}
            >
                OK
            </button>
            <button type="button" onClick={() => setShow(false)} className="btn btn-xs btn-ghost h-7 w-7 p-0">×</button>
        </div>
    );
};

export default function SupplierProductForm({ onClose, initialData = null }) {
    const { getToken, userId } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [categories, setCategories] = useState([]);
    const [boutiques, setBoutiques] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [myProducts, setMyProducts] = useState([]);
    
    // Attributes handling
    const [availableAttributes, setAvailableAttributes] = useState([]);
    const [selectedAttributes, setSelectedAttributes] = useState([]);
    const [selectedValuesMap, setSelectedValuesMap] = useState({});
    const [attrSearchQuery, setAttrSearchQuery] = useState("");
    const [inlineLoading, setInlineLoading] = useState(false);
    const [commissionRate, setCommissionRate] = useState(10);
    const [selectedBoutiques, setSelectedBoutiques] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [deliveryTiers, setDeliveryTiers] = useState([]);

    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
        defaultValues: initialData ? {
            name: initialData.name,
            description: initialData.description || '',
            category_id: initialData.category_id || '',
            boutique_id: initialData.boutique_id || '',
            variants: initialData.variants || [],
            supplier_price: initialData.supplier_price || '',
            stock: initialData.stock || 0,
            supplier_note: initialData.supplier_note || '',
            is_flash_sale: initialData.is_flash_sale || false,
            flash_sale_end: initialData.flash_sale_end ? new Date(initialData.flash_sale_end).toISOString().substring(0, 16) : '',
            is_kit: initialData.is_kit || false,
            kit_items: initialData.kit_items || [],
            volume_pricing_enabled: !!initialData.volume_pricing,
            volume_pricing: initialData.volume_pricing ? (typeof initialData.volume_pricing === 'string' ? JSON.parse(initialData.volume_pricing) : initialData.volume_pricing) : [{ qty: 3, discount: 10 }, { qty: 5, discount: 20 }],
            is_promo: initialData.old_price && parseFloat(initialData.old_price) > parseFloat(initialData.price) ? true : false,
            old_supplier_price: '',
            discount_percent: ''
        } : {
            name: '',
            description: '',
            category_id: '',
            boutique_id: '',
            variants: [],
            supplier_price: '',
            stock: 0,
            supplier_note: '',
            is_flash_sale: false,
            flash_sale_end: '',
            is_kit: false,
            kit_items: [],
            volume_pricing_enabled: false,
            volume_pricing: [{ qty: 3, discount: 10 }, { qty: 5, discount: 20 }],
            is_promo: false,
            old_supplier_price: '',
            discount_percent: ''
        }
    });

    const selectedCategoryId = watch('category_id');
    const variants = watch('variants');
    const globalSupplierPrice = watch('supplier_price');
    const watchedKitItems = watch('kit_items') || [];
    const currentProductPublicPrice = computePublicPrice(parseFloat(globalSupplierPrice) || 0, deliveryTiers);
    const selectedKitProducts = myProducts.filter(p => watchedKitItems.includes(p.id) && p.id !== initialData?.id);
    const kitItemsPublicValue = selectedKitProducts.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    const kitBundleValue = currentProductPublicPrice + kitItemsPublicValue;

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            const token = await getToken();
            const [catData, boutData, attrData, tiersData, productsResp] = await Promise.all([
                getCategories(),
                import('../../services/supplierService').then(s => s.getMyBoutiques(token)),
                getAttributes(),
                getDeliveryFeeTiers(),
                getProducts({ limit: 200, my_products: true }).catch(e => ({ products: [] }))
            ]);
            setCategories(catData || []);
            setBoutiques(boutData || []);
            setAvailableAttributes(attrData || []);
            setDeliveryTiers(tiersData || []);
            setMyProducts(productsResp?.products || productsResp || []);

            const commData = await axios.get(`${API_URL}/configs/public`).catch(e => ({ data: [] }));
            const commissionConfig = commData.data.find(c => c.key === 'commission_rate');
            if (commissionConfig && commissionConfig.value) setCommissionRate(parseFloat(commissionConfig.value));
            
            // Initialize selected boutiques
            if (initialData) {
                let initialBoutiques = [initialData.boutique_id];
                if (initialData.secondary_boutique_ids && Array.isArray(initialData.secondary_boutique_ids)) {
                    initialBoutiques = [...initialBoutiques, ...initialData.secondary_boutique_ids];
                }
                setSelectedBoutiques(initialBoutiques.filter(Boolean));
            } else if (boutData && boutData.length > 0) {
                setSelectedBoutiques([boutData[0].id]);
            }

            if (initialData?.images?.length > 0) {
                setImageFiles(initialData.images.map(img => ({
                    file: null,
                    preview: img.image_url || img.url,
                    isMain: img.is_main,
                    existingUrl: img.image_url || img.url
                })));
            }
            if (initialData && initialData.old_price && parseFloat(initialData.old_price) > parseFloat(initialData.price)) {
                const oldSupPrice = reverseSupplierPrice(initialData.old_price, tiersData || []);
                setValue('old_supplier_price', oldSupPrice);
                setValue('is_promo', true);
                const currentSupPrice = parseFloat(initialData.supplier_price) || 0;
                if (oldSupPrice > 0 && currentSupPrice > 0) {
                    const pct = Math.round(((oldSupPrice - currentSupPrice) / oldSupPrice) * 100);
                    setValue('discount_percent', pct);
                }
            }
        };
        fetchInitialData();
    }, [getToken, setValue, initialData]);

    // Update commission rate with inheritance (search up the tree)
    useEffect(() => {
        if (!selectedCategoryId || !categories.length) return;

        const findEffectiveRate = (id) => {
            let current = categories.find(c => String(c.id) === String(id));
            while (current) {
                if (current.commission_rate != null) return parseFloat(current.commission_rate);
                if (!current.parent_id) break;
                current = categories.find(c => c.id === current.parent_id);
            }
            return null;
        };

        const effectiveRate = findEffectiveRate(selectedCategoryId);
        if (effectiveRate !== null) {
            setCommissionRate(prev => prev !== effectiveRate ? effectiveRate : prev);
        }
    }, [selectedCategoryId, categories]);

    const isPromo = watch('is_promo');
    const watchedOldPrice = watch('old_supplier_price');
    const watchedDiscount = watch('discount_percent');

    // Sync supplier_price based on old_supplier_price and discount_percent
    useEffect(() => {
        if (!isPromo) return;
        const oldP = parseFloat(watchedOldPrice) || 0;
        const pct = parseFloat(watchedDiscount) || 0;
        if (oldP > 0 && pct > 0 && pct < 100) {
            const calculatedNewPrice = Math.round(oldP * (1 - pct / 100));
            if (Math.abs((parseFloat(globalSupplierPrice) || 0) - calculatedNewPrice) > 2) {
                setValue('supplier_price', calculatedNewPrice);
            }
        }
    }, [isPromo, watchedOldPrice, watchedDiscount]);

    const computedPercentage = useMemo(() => {
        const oldP = parseFloat(watchedOldPrice) || 0;
        const newP = parseFloat(globalSupplierPrice) || 0;
        if (oldP > 0 && newP > 0 && oldP > newP) {
            return Math.round(((oldP - newP) / oldP) * 100);
        }
        return 0;
    }, [watchedOldPrice, globalSupplierPrice]);

    const addAttributeValueLocal = async (attributeId, value) => {
        setInlineLoading(true);
        try {
            const token = await getToken();
            await addAttributeValue(attributeId, value, token);
            const updatedAttrs = await getAttributes();
            setAvailableAttributes(updatedAttrs);
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
            const updatedAttrs = await getAttributes();
            setAvailableAttributes(updatedAttrs);
            const newId = newAttrResp?.id;
            const newAttr = updatedAttrs.find(a => a.id === newId);
            if (newAttr) {
                setSelectedAttributes(prev => [...prev, newAttr]);
            }
            setAttrSearchQuery("");
            toast.success("Attribut créé");
        } catch (err) {
            toast.error("Erreur création attribut");
        } finally {
            setInlineLoading(false);
        }
    };

    const selectedCategory = useMemo(() => {
        return categories.find(c => String(c.id) === String(selectedCategoryId));
    }, [categories, selectedCategoryId]);

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

                return {
                    combination: comboObj,
                    sku: '',
                    supplier_price: parseFloat(globalSupplierPrice) || 0,
                    stock: 0,
                    image_file: null,
                    preview_url: null
                };
            });

            setValue('variants', newVariants);
            // When variants are generated, we prioritize their prices
            toast.success(`${newVariants.length} variantes générées. Les prix seront gérés par variante.`);
        } catch (e) {
            toast.error(e.message);
        }
    };

    const cartesianProduct = (arrays) => {
        return arrays.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())), [[]]);
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const token = await getToken();
            const uploadedImages = [];
            for (const img of imageFiles) {
                if (img.existingUrl) {
                    uploadedImages.push({ url: img.existingUrl, isMain: img.isMain });
                } else if (img.file) {
                    const url = await uploadSingleImage(img.file, token);
                    uploadedImages.push({ url, isMain: img.isMain });
                }
            }

            const mainImageUrl = uploadedImages.find(img => img.isMain)?.url || (uploadedImages.length > 0 ? uploadedImages[0].url : null);

            const processedVariants = [];
            for (const v of (data.variants || [])) {
                let vImageUrl = v.image_url || mainImageUrl;
                if (v.image_file) {
                    vImageUrl = await uploadSingleImage(v.image_file, token);
                }
                const vSupplierPrice = parseFloat(v.supplier_price) || parseFloat(data.supplier_price) || 0;
                const vPublicPrice = computePublicPrice(vSupplierPrice, deliveryTiers);
                
                processedVariants.push({
                    combination: v.combination,
                    sku: v.sku,
                    stock: parseInt(v.stock) || 0,
                    price: vPublicPrice,
                    image_url: vImageUrl,
                    supplierLinks: [{
                        supplier_id: 'me',
                        supplier_price: vSupplierPrice,
                        supplier_sku: v.sku
                    }]
                });
            }

            let finalSupplierPrice = parseFloat(data.supplier_price) || 0;
            if (processedVariants && processedVariants.length > 0) {
                const minVariant = processedVariants.reduce((prev, curr) => (prev.price < curr.price) ? prev : curr);
                finalSupplierPrice = minVariant.supplierLinks[0].supplier_price;
            }
            
            const finalPublicPrice = computePublicPrice(finalSupplierPrice, deliveryTiers);

            let finalOldPrice = 0;
            if (data.is_promo) {
                const oldSupplierPriceVal = parseFloat(data.old_supplier_price) || 0;
                if (oldSupplierPriceVal > 0) {
                    finalOldPrice = computePublicPrice(oldSupplierPriceVal, deliveryTiers);
                }
            }

            const payload = {
                name: data.name,
                description: data.description,
                category_id: parseInt(data.category_id),
                images: uploadedImages,
                supplier_note: data.supplier_note,
                price: finalPublicPrice,
                old_price: finalOldPrice || 0,
                supplier_price: finalSupplierPrice,
                stock: parseInt(data.stock) || 0,
                status: 'draft',
                approval_status: 'En attente',
                boutique_id: selectedBoutiques.length > 0 ? selectedBoutiques[0] : null,
                secondary_boutique_ids: selectedBoutiques.slice(1),
                variants: processedVariants,
                supplierLinks: processedVariants.length === 0 ? [{
                    supplier_id: 'me',
                    supplier_price: finalSupplierPrice,
                    supplier_sku: data.sku || null
                }] : [],
                is_flash_sale: data.is_flash_sale,
                flash_sale_end: data.is_flash_sale ? data.flash_sale_end : null,
                is_kit: data.is_kit,
                kit_items: data.is_kit ? data.kit_items : null,
                volume_pricing: data.volume_pricing_enabled ? data.volume_pricing : null
            };

            if (initialData?.id) {
                await updateProduct(initialData.id, payload, token);
                toast.success("Produit mis à jour et envoyé pour validation !");
            } else {
                await createProduct(payload, token);
                toast.success("Produit envoyé pour validation !");
            }
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.error || "Erreur lors de la création");
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (currentStep === 0 && (!selectedCategoryId || !watch('name'))) {
            toast.error('Nom et Catégorie requis.');
            return;
        }
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden min-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Plus size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tighter">{initialData ? 'Modifier le produit' : 'Ajouter un produit'}</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Section Vendeur</p>
                    </div>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
                    <X size={20} />
                </button>
            </div>

            {/* Stepper */}
            <div className="px-8 py-4 bg-slate-50/50 flex items-center justify-between border-b border-slate-50">
                {steps.map((step, idx) => (
                    <React.Fragment key={step.id}>
                        <div className={`flex items-center gap-3 transition-all ${idx <= currentStep ? 'text-indigo-500' : 'text-slate-300'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${idx === currentStep ? 'bg-indigo-500 text-white shadow-md' : idx < currentStep ? 'bg-emerald-500 text-white' : 'bg-white border'}`}>
                                {idx < currentStep ? <Check size={14} /> : idx + 1}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{step.title}</span>
                        </div>
                        {idx < steps.length - 1 && <div className={`flex-1 h-px mx-4 ${idx < currentStep ? 'bg-emerald-200' : 'bg-slate-200'}`} />}
                    </React.Fragment>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                    {currentStep === 0 && (
                        <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Nom de l'article</label>
                                <input {...register("name", { required: true })} className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 text-lg font-black text-slate-900 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none" placeholder="Ex: iPhone 15 Pro Max..." />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Catégorie</label>
                                <button type="button" onClick={() => setShowCategoryModal(true)} className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 text-left flex items-center justify-between group transition-all">
                                    <span className={`font-bold ${selectedCategory ? 'text-slate-900' : 'text-slate-300'}`}>
                                        {selectedCategory ? selectedCategory.name : "Choisir une catégorie..."}
                                    </span>
                                    <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4 flex items-center gap-2">
                                    <Truck size={14} className="text-primary" /> Zones de Livraison Gratuite (Vos Boutiques)
                                </label>
                                <div className="space-y-2">
                                    {boutiques.length > 0 ? (
                                        boutiques.map(b => (
                                            <label key={b.id} className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border ${selectedBoutiques.includes(b.id) ? 'bg-primary/5 border-primary text-primary' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'}`}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedBoutiques.includes(b.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedBoutiques([...selectedBoutiques, b.id]);
                                                        } else {
                                                            // At least one must be selected if it's the primary one
                                                            if (selectedBoutiques.length > 1) {
                                                                setSelectedBoutiques(selectedBoutiques.filter(id => id !== b.id));
                                                            } else {
                                                                toast.error("Au moins une boutique doit être sélectionnée.");
                                                            }
                                                        }
                                                    }}
                                                    className="checkbox checkbox-primary checkbox-sm rounded-lg"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold">{b.name}</p>
                                                    <p className="text-[10px] font-medium opacity-60 italic">{b.address_line || 'Adresse non spécifiée'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full border border-current">{b.commune_label}</span>
                                                </div>
                                            </label>
                                        ))
                                    ) : (
                                        <div className="p-8 bg-amber-50 rounded-[1.5rem] border border-amber-100 text-center space-y-2">
                                            <AlertCircle size={24} className="text-amber-500 mx-auto" />
                                            <p className="text-xs font-bold text-amber-600">Aucune boutique enregistrée.</p>
                                            <p className="text-[10px] text-amber-400">Veuillez d'abord créer une boutique dans vos paramètres.</p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold ml-4 italic">Note: Le produit sera considéré comme expédié depuis la première boutique sélectionnée. Les communes de toutes les boutiques sélectionnées bénéficieront de la livraison gratuite.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Description (Optionnel)</label>
                                <textarea {...register("description")} rows={4} className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 text-sm font-bold text-slate-600 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none" placeholder="Détails du produit..." />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Note pour l'Admin</label>
                                <input {...register("supplier_note")} className="w-full bg-slate-50 border-none rounded-3xl px-8 py-5 text-sm font-bold text-slate-600 outline-none" placeholder="Ex: Disponible seulement en pack de 10..." />
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                            <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white space-y-10">
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-black text-white">Sélection des <span className="text-indigo-400">Attributs.</span></h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                                <input type="text" value={attrSearchQuery} onChange={e => setAttrSearchQuery(e.target.value)} placeholder="Chercher ou créer attribut..." className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-8 py-4 text-xs font-bold" />
                                            </div>
                                            {attrSearchQuery.trim() && !availableAttributes.find(a => a.name.toLowerCase() === attrSearchQuery.trim().toLowerCase()) && (
                                                <button type="button" onClick={() => createAttributeLocal(attrSearchQuery)} disabled={inlineLoading} className="px-6 py-4 bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] whitespace-nowrap shadow-xl">
                                                    {inlineLoading ? "..." : "+ Créer"}
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {availableAttributes.filter(a => a.name.toLowerCase().includes(attrSearchQuery.toLowerCase())).map(attr => (
                                                <button key={attr.id} type="button" onClick={() => {
                                                    if (selectedAttributes.find(a => a.id === attr.id)) setSelectedAttributes(selectedAttributes.filter(a => a.id !== attr.id));
                                                    else setSelectedAttributes([...selectedAttributes, attr]);
                                                }} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${selectedAttributes.find(a => a.id === attr.id) ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white/5 text-slate-400 border-white/10'}`}>
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
                                                <span className="text-[10px] font-black uppercase text-indigo-400">{attr.name}</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {attr.values.map(v => (
                                                        <button key={v.id} type="button" onClick={() => {
                                                            const current = selectedValuesMap[attr.id] || [];
                                                            if (current.includes(v.id)) setSelectedValuesMap({ ...selectedValuesMap, [attr.id]: current.filter(id => id !== v.id) });
                                                            else setSelectedValuesMap({ ...selectedValuesMap, [attr.id]: [...current, v.id] });
                                                        }} className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${selectedValuesMap[attr.id]?.includes(v.id) ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white/5 text-white border-white/10'}`}>
                                                            {v.value}
                                                        </button>
                                                    ))}
                                                    <div className="ml-2 flex items-center">
                                                        <InlineAdder label="Valeur" onAdd={(val) => addAttributeValueLocal(attr.id, val)} loading={inlineLoading} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button type="button" onClick={() => { generateVariants(); nextStep(); }} disabled={selectedAttributes.length === 0} className="w-full py-5 bg-indigo-500 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl">Générer & Continuer</button>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Photos du produit</h3>
                                <label className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-slate-900 transition-all">
                                    <Upload size={14} /> Ajouter
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                {imageFiles.map((img, idx) => (
                                    <div key={idx} className={`relative aspect-square rounded-[1.5rem] overflow-hidden border-4 group ${img.isMain ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-slate-50'}`}>
                                        <img src={img.preview} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <button type="button" onClick={() => removeImage(idx)} className="bg-rose-500 text-white p-2 rounded-full hover:scale-110 transition-transform"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                                {imageFiles.length === 0 && (
                                    <div className="col-span-full py-20 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-slate-300">
                                        <ImageIcon size={48} strokeWidth={1} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Aucune image ajoutée</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                            {/* Global Supplier Info */}
                            {variants.length === 0 && (
                            <div className="p-8 bg-indigo-50 rounded-[2.5rem] grid grid-cols-1 sm:grid-cols-2 gap-8 shadow-inner">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 px-4">Votre prix de vente souhaité (FCFA)</label>
                                        <input type="number" {...register("supplier_price")} className="w-full bg-white border-none rounded-3xl px-8 py-5 font-black text-lg text-indigo-600 shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" placeholder="Ex: 7000" />
                                    </div>
                                    <div className="space-y-2 px-4">
                                        <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
                                            <span>Frais de livraison (Marketing) :</span>
                                            <span className="text-indigo-500">+ {computeDeliveryFee(globalSupplierPrice, deliveryTiers).toLocaleString()} F</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
                                            <span>Commission Vtout ({commissionRate}%) :</span>
                                            <span className="text-orange-500">- {Math.round((globalSupplierPrice || 0) * (commissionRate / 100)).toLocaleString()} F</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-black text-slate-900 pt-2 border-t border-indigo-100">
                                            <span>Prix affiché aux clients :</span>
                                            <span className="text-lg text-primary">{computePublicPrice(globalSupplierPrice, deliveryTiers).toLocaleString()} F</span>
                                        </div>
                                        {globalSupplierPrice && (
                                            <div className="mt-4 p-3 bg-emerald-50 rounded-2xl flex justify-between items-center border border-emerald-100">
                                                <span className="text-[9px] font-black uppercase text-emerald-600">Votre gain net ({Math.round(100 - commissionRate)}%) :</span>
                                                <span className="text-sm font-black text-emerald-600">{Math.round(globalSupplierPrice * (1 - commissionRate / 100)).toLocaleString()} F</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 px-4">Stock Total</label>
                                    <input type="number" {...register("stock")} className="w-full bg-white border-none rounded-3xl px-8 py-5 font-black text-lg text-slate-900 shadow-sm outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                                    <p className="text-[9px] font-bold text-slate-400 px-4 mt-2 italic">Note: Le prix final inclut les frais de livraison calculés selon la grille. Le client verra "Livraison Gratuite".</p>
                                </div>
                            </div>
                            )}

                            <div className="space-y-6">
                                <h4 className="text-xl font-black text-slate-900 tracking-tighter">Personnalisation des Variantes</h4>
                                {variants.length > 0 ? (
                                    <div className="space-y-6">
                                        {variants.map((v, idx) => {
                                            const vPrice = watch(`variants.${idx}.supplier_price`);
                                            const vFee = computeDeliveryFee(vPrice, deliveryTiers);
                                            const vPublic = computePublicPrice(vPrice, deliveryTiers);
                                            
                                            return (
                                            <div key={idx} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 group hover:shadow-2xl hover:shadow-slate-100 transition-all">
                                                {/* Variant Image Selector */}
                                                <div className="w-32 h-32 relative group/img">
                                                    <div className="w-full h-full bg-slate-50 rounded-[1.5rem] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 overflow-hidden relative">
                                                        {watch(`variants.${idx}.preview_url`) ? (
                                                            <img src={watch(`variants.${idx}.preview_url`)} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <>
                                                                <ImageIcon className="w-6 h-6 text-slate-300" />
                                                                <span className="text-[8px] font-black uppercase text-slate-400 mt-1">Image</span>
                                                            </>
                                                        )}
                                                        <input 
                                                            type="file" 
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    setValue(`variants.${idx}.image_file`, file);
                                                                    setValue(`variants.${idx}.preview_url`, URL.createObjectURL(file));
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex-1 space-y-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.entries(v.combination).map(([a, val], i) => (
                                                            <span key={i} className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">{a}: {val}</span>
                                                        ))}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-black uppercase text-slate-400">Votre prix souhaité</label>
                                                            <input type="number" {...register(`variants.${idx}.supplier_price`)} className="w-full bg-slate-50 border-none rounded-xl px-5 py-3 text-xs font-black text-indigo-500" placeholder="Prix" />
                                                            <div className="flex flex-col gap-1 mt-2">
                                                                <div className="text-[8px] font-bold text-slate-400">
                                                                    + {vFee.toLocaleString()} F Livr. = <span className="text-primary">{vPublic.toLocaleString()} F (Public)</span>
                                                                </div>
                                                                {vPrice && (
                                                                    <div className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg self-start">
                                                                        Gain net : {Number(vPrice).toLocaleString()} F
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-black uppercase text-slate-400">Stock</label>
                                                            <input type="number" {...register(`variants.${idx}.stock`)} className="w-full bg-slate-50 border-none rounded-xl px-5 py-3 text-xs font-black" placeholder="Stock" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-4 text-slate-300 text-center">
                                        <Layers size={48} strokeWidth={1} />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aucune variante générée</p>
                                        <button type="button" onClick={() => setCurrentStep(1)} className="text-indigo-500 text-[10px] font-black uppercase underline">Retourner aux attributs</button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}


                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-slate-50 bg-white flex justify-between">
                <button onClick={prevStep} disabled={currentStep === 0} className="px-8 py-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all disabled:opacity-0">
                    Précédent
                </button>
                <div className="flex gap-4">
                    {currentStep < steps.length - 1 ? (
                        <button onClick={nextStep} className="px-10 py-4 bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-500/20">
                            Continuer
                        </button>
                    ) : (
                        <button onClick={handleSubmit(onSubmit)} disabled={loading} className="px-16 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl flex items-center gap-2">
                            {loading ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : <><Check size={14} /> Envoyer</>}
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
                            toast.success(`Catégorie : ${cat.name}`);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
