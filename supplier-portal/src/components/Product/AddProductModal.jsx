import React, { useState, useEffect } from 'react';
import { getProducts, updateProduct, deleteProduct } from '../../../services/productService';
import { useAuth } from "../../../lib/AuthHooks";
import { 
  CheckCircle, XCircle, Clock, Eye, AlertCircle, Save, Edit3, Trash2, 
  Package, Search, User, Calendar, Tag, Info, Layers, ShoppingBag, 
  Truck, Hash, Percent, Image as ImageIcon, Store, FileText, 
  Sparkles, Flame, Gift, Star, Archive, MapPin, Phone, Mail,
  ChevronDown, ChevronUp, Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const AddProductModal = ({ globalSearchQuery = "" }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [localSearch, setLocalSearch] = useState("");
    const [expandedSections, setExpandedSections] = useState({
        variants: true,
        images: true,
        supplier: true,
        pricing: true
    });
    const { getToken } = useAuth();

    const fetchPendingProducts = async () => {
        try {
            setLoading(true);
            const query = localSearch || globalSearchQuery;
            const data = await getProducts({ 
                approval_status: 'En attente', 
                isAdmin: 'true',
                search: query
            });
            // S'assurer que les données sont un tableau
            const productsData = data.products || data || [];
            setProducts(productsData);
        } catch (error) {
            console.error('Erreur chargement produits:', error);
            toast.error('Erreur lors du chargement des produits');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingProducts();
    }, [globalSearchQuery]);

    const handleApprove = async (product) => {
        try {
            const token = await getToken();
            await updateProduct(product.id, {
                approval_status: 'approved',
                admin_feedback: feedback || 'Produit approuvé.',
                isAdmin: 'true'
            }, token);
            setSelectedProduct(null);
            fetchPendingProducts();
            toast.success('✅ Produit approuvé !');
        } catch (error) {
            console.error('Erreur approbation:', error);
            toast.error('❌ Erreur lors de l\'approbation');
        }
    };

    const handleReject = async (product) => {
        if (!feedback) {
            toast.error('⚠️ Veuillez fournir un motif de rejet.');
            return;
        }

        try {
            const token = await getToken();
            await updateProduct(product.id, {
                approval_status: 'rejected',
                admin_feedback: feedback,
                isAdmin: 'true'
            }, token);
            setSelectedProduct(null);
            setFeedback('');
            fetchPendingProducts();
            toast.success('❌ Produit rejeté');
        } catch (error) {
            console.error('Erreur rejet:', error);
            toast.error('❌ Erreur lors du rejet');
        }
    };

    const handleDelete = async (product) => {
        if (!window.confirm("⚠️ Êtes-vous sûr de vouloir supprimer définitivement ce produit ?")) return;
        
        try {
            const token = await getToken();
            await deleteProduct(product.id, token);
            setSelectedProduct(null);
            fetchPendingProducts();
            toast.success('🗑️ Produit supprimé définitivement');
        } catch (error) {
            console.error('Erreur suppression:', error);
            toast.error('❌ Erreur lors de la suppression');
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'N/A';
        }
    };

    const formatPrice = (price) => {
        if (!price && price !== 0) return '0';
        return Number(price).toLocaleString('fr-FR');
    };

    // Fonction pour récupérer une propriété en toute sécurité
    const getSafe = (obj, path, defaultValue = null) => {
        try {
            const keys = path.split('.');
            let current = obj;
            for (const key of keys) {
                if (current === null || current === undefined) return defaultValue;
                current = current[key];
            }
            return current !== undefined && current !== null ? current : defaultValue;
        } catch {
            return defaultValue;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div>
                <h2 className="text-4xl font-black tracking-tighter text-base-content mb-2">
                    Approbation Produits
                </h2>
                <p className="text-base-content/50 font-bold uppercase tracking-[0.2em] text-[10px]">
                    Modération des catalogues fournisseurs • {products.length} en attente
                </p>
            </div>

            {/* Search Bar */}
            <div className="flex items-center justify-between gap-4 bg-base-100 p-6 rounded-[32px] border border-base-200 shadow-sm mb-6">
                <div className="flex items-center gap-3 bg-base-200 px-5 py-3 rounded-2xl border border-base-200 w-full max-w-md focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <Search size={18} className="text-base-content/40" />
                    <input 
                        type="text" 
                        placeholder="Rechercher un produit en attente..."
                        className="bg-transparent border-none text-sm font-bold text-base-content/70 focus:ring-0 w-full"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchPendingProducts()}
                    />
                </div>
                <button 
                    onClick={fetchPendingProducts}
                    className="p-3 bg-base-200 text-base-content/40 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
                >
                    <Package size={18} />
                </button>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 text-base-content">
                {/* List Section */}
                <div className="xl:col-span-2 bg-base-100 rounded-[40px] shadow-2xl shadow-base-300/50 border border-base-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-base-200/50">
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-base-content/40 border-b border-base-200">
                                        Produit
                                    </th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-base-content/40 border-b border-base-200">
                                        Prix / Payout
                                    </th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-base-content/40 border-b border-base-200">
                                        Stock
                                    </th>
                                    <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-base-content/40 border-b border-base-200">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-200">
                                {products.length > 0 ? (
                                    products.map((product) => (
                                        <tr
                                            key={product.id}
                                            className={`hover:bg-base-200/50 transition-colors cursor-pointer ${
                                                selectedProduct?.id === product.id ? 'bg-primary/30' : ''
                                            }`}
                                            onClick={() => {
                                                setSelectedProduct(product);
                                                setFeedback(product.admin_feedback || '');
                                            }}
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    {product.images?.length > 0 ? (
                                                        <img
                                                            src={product.images[0].image_url}
                                                            alt={product.name}
                                                            className="w-12 h-12 rounded-xl object-cover bg-base-200 shrink-0"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : null}
                                                    {(!product.images || product.images.length === 0) && (
                                                        <div className="w-12 h-12 rounded-xl bg-base-200 flex items-center justify-center shrink-0">
                                                            <Package size={20} className="text-base-content/30" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-black text-base-content line-clamp-1">
                                                            {product.name || 'Sans nom'}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider">
                                                            {getSafe(product, 'category.name', 'Non catégorisé')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-black text-primary">
                                                    {formatPrice(product.price)} FCFA
                                                </p>
                                                <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider">
                                                    Gain: {formatPrice(product.supplier_price)} FCFA
                                                </p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`text-sm font-black ${
                                                    (product.stock || 0) > 0 ? 'text-emerald-600' : 'text-rose-500'
                                                }`}>
                                                    {product.stock || 0}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button 
                                                    className="p-2 bg-base-100 border border-base-300 rounded-lg text-base-content/40 hover:text-primary transition-colors shadow-sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedProduct(product);
                                                    }}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-10 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <CheckCircle size={40} className="text-emerald-200" />
                                                <p className="text-sm font-black text-base-content/40 uppercase tracking-widest">
                                                    Tous les produits sont traités
                                                </p>
                                                <p className="text-[10px] text-base-content/30">
                                                    Aucun produit en attente d'approbation
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detail Panel - VERSION AVEC VÉRIFICATIONS */}
                <div className="bg-base-100 rounded-[40px] shadow-2xl shadow-base-300/50 border border-base-200 p-8 h-fit sticky top-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {selectedProduct ? (
                            <motion.div
                                key={selectedProduct.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* Header avec statut */}
                                <div className="border-b border-base-200 pb-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-2xl font-black tracking-tighter mb-1">
                                                Détails du Produit
                                            </h3>
                                            <p className="text-xs font-bold text-base-content/40 uppercase tracking-widest">
                                                ID: #{selectedProduct.id}
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                            getSafe(selectedProduct, 'approval_status', 'En attente') === 'En attente' 
                                                ? 'bg-amber-100 text-amber-700' 
                                                : getSafe(selectedProduct, 'approval_status') === 'approved'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-rose-100 text-rose-700'
                                        }`}>
                                            {getSafe(selectedProduct, 'approval_status', 'En attente')}
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 1: Informations Générales */}
                                <div className="bg-base-200/50 rounded-3xl p-6 space-y-4">
                                    <div className="flex items-center gap-2 text-base-content/40">
                                        <Info size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Informations Générales</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-base-content/30">Nom</p>
                                            <p className="text-sm font-black text-base-content">{selectedProduct.name || 'Sans nom'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-base-content/30">Catégorie</p>
                                            <div className="flex items-center gap-1">
                                                <Tag size={12} className="text-base-content/30" />
                                                <p className="text-sm font-black text-base-content">
                                                    {getSafe(selectedProduct, 'category.name', 'Non catégorisé')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {selectedProduct.description && (
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-base-content/30">Description</p>
                                            <p className="text-sm font-medium text-base-content/80 leading-relaxed bg-base-100 p-4 rounded-2xl">
                                                {selectedProduct.description}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* SECTION 2: Prix et Paiement */}
                                <div className="bg-gradient-to-br from-primary/10 to-purple-50 rounded-3xl p-6 space-y-4 border border-primary/10">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Percent size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Prix & Paiement</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/70 rounded-2xl p-4">
                                            <p className="text-[9px] font-black uppercase text-primary">💰 Prix Public</p>
                                            <p className="text-2xl font-black text-primary">{formatPrice(selectedProduct.price)} FCFA</p>
                                        </div>
                                        <div className="bg-white/70 rounded-2xl p-4">
                                            <p className="text-[9px] font-black uppercase text-emerald-400">📦 Payout</p>
                                            <p className="text-2xl font-black text-emerald-600">{formatPrice(selectedProduct.supplier_price)} FCFA</p>
                                        </div>
                                    </div>
                                    {selectedProduct.old_price && selectedProduct.old_price > 0 && (
                                        <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200">
                                            <div className="flex items-center gap-2">
                                                <Flame size={16} className="text-rose-500" />
                                                <span className="text-[9px] font-black uppercase text-rose-500">Promotion</span>
                                            </div>
                                            <p className="text-sm font-black text-rose-600">
                                                Ancien prix: {formatPrice(selectedProduct.old_price)} FCFA
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* SECTION 3: Images */}
                                {selectedProduct.images && selectedProduct.images.length > 0 && (
                                    <div className="bg-base-200/50 rounded-3xl p-6 space-y-4">
                                        <button
                                            onClick={() => toggleSection('images')}
                                            className="flex items-center justify-between w-full"
                                        >
                                            <div className="flex items-center gap-2 text-base-content/40">
                                                <ImageIcon size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    Images ({selectedProduct.images.length})
                                                </span>
                                            </div>
                                            {expandedSections.images ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                        
                                        {expandedSections.images && (
                                            <div className="grid grid-cols-3 gap-2 mt-4">
                                                {selectedProduct.images.map((img, idx) => (
                                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border-2 border-base-100">
                                                        <img 
                                                            src={img.image_url} 
                                                            alt={`Product ${idx + 1}`}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                        {img.is_main && (
                                                            <div className="absolute top-1 right-1 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded">
                                                                MAIN
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* SECTION 4: Variantes */}
                                {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                                    <div className="bg-base-200/50 rounded-3xl p-6 space-y-4">
                                        <button
                                            onClick={() => toggleSection('variants')}
                                            className="flex items-center justify-between w-full"
                                        >
                                            <div className="flex items-center gap-2 text-base-content/40">
                                                <Layers size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    Variantes ({selectedProduct.variants.length})
                                                </span>
                                            </div>
                                            {expandedSections.variants ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                        
                                        {expandedSections.variants && (
                                            <div className="space-y-3 mt-4">
                                                {selectedProduct.variants.map((variant, idx) => (
                                                    <div key={idx} className="bg-base-100 rounded-2xl p-4 border border-base-200">
                                                        <div className="flex items-center gap-3">
                                                            {variant.image_url && (
                                                                <img 
                                                                    src={variant.image_url} 
                                                                    alt={`Variant ${idx + 1}`}
                                                                    className="w-12 h-12 rounded-xl object-cover"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                    }}
                                                                />
                                                            )}
                                                            <div className="flex-1">
                                                                {variant.combination && Object.keys(variant.combination).length > 0 && (
                                                                    <div className="flex flex-wrap gap-1 mb-2">
                                                                        {Object.entries(variant.combination).map(([attr, val]) => (
                                                                            <span key={attr} className="px-2 py-0.5 bg-base-200 rounded-lg text-[8px] font-black uppercase">
                                                                                {attr}: {val}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                <div className="flex gap-4 text-xs font-bold">
                                                                    <span className="text-primary">{formatPrice(variant.price)} FCFA</span>
                                                                    <span className="text-base-content/40">|</span>
                                                                    <span className={variant.stock > 0 ? 'text-emerald-600' : 'text-rose-500'}>
                                                                        Stock: {variant.stock || 0}
                                                                    </span>
                                                                    {variant.sku && (
                                                                        <>
                                                                            <span className="text-base-content/40">|</span>
                                                                            <span className="text-base-content/40">SKU: {variant.sku}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* SECTION 5: Stock */}
                                {selectedProduct.stock !== undefined && selectedProduct.stock !== null && (
                                    <div className="bg-base-200/50 rounded-3xl p-6 space-y-4">
                                        <div className="flex items-center gap-2 text-base-content/40">
                                            <ShoppingBag size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Stock</span>
                                        </div>
                                        <div className="bg-base-100 rounded-2xl p-4">
                                            <p className={`text-2xl font-black ${selectedProduct.stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                {selectedProduct.stock} unités
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* SECTION 6: Métadonnées */}
                                {(selectedProduct.created_at || selectedProduct.updated_at) && (
                                    <div className="bg-base-200/30 rounded-3xl p-4 grid grid-cols-2 gap-2 text-[10px]">
                                        {selectedProduct.created_at && (
                                            <div>
                                                <p className="font-black text-base-content/30 uppercase">Créé le</p>
                                                <p className="font-bold text-base-content/60">{formatDate(selectedProduct.created_at)}</p>
                                            </div>
                                        )}
                                        {selectedProduct.updated_at && (
                                            <div>
                                                <p className="font-black text-base-content/30 uppercase">Modifié le</p>
                                                <p className="font-bold text-base-content/60">{formatDate(selectedProduct.updated_at)}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* SECTION 7: Notes */}
                                {selectedProduct.supplier_note && (
                                    <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200">
                                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                                            <FileText size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Note du fournisseur</span>
                                        </div>
                                        <p className="text-sm font-medium text-amber-800">{selectedProduct.supplier_note}</p>
                                    </div>
                                )}

                                {selectedProduct.admin_feedback && (
                                    <div className="bg-blue-50 rounded-3xl p-6 border border-blue-200">
                                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                                            <AlertCircle size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Feedback précédent</span>
                                        </div>
                                        <p className="text-sm font-medium text-blue-800">{selectedProduct.admin_feedback}</p>
                                    </div>
                                )}

                                {/* SECTION 8: Zone de feedback */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-base-content/40 tracking-widest px-2">
                                        ✏️ Message au fournisseur
                                    </label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        rows="3"
                                        className="w-full bg-base-200 border-none rounded-3xl px-6 py-5 text-sm font-bold placeholder:text-base-content/30 focus:ring-2 focus:ring-primary/20 transition-all text-base-content"
                                        placeholder="Ex: Photos de mauvaise qualité, description incomplète, prix trop élevé..."
                                    />
                                </div>

                                {/* SECTION 9: Actions */}
                                <div className="grid grid-cols-3 gap-3 pt-4">
                                    <button
                                        onClick={() => handleDelete(selectedProduct)}
                                        className="flex items-center justify-center gap-2 py-4 bg-neutral/90 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:brightness-90 transition-all shadow-xl shadow-base-300 text-white"
                                    >
                                        <Trash2 size={14} /> Supprimer
                                    </button>
                                    <button
                                        onClick={() => handleReject(selectedProduct)}
                                        className="flex items-center justify-center gap-2 py-4 bg-rose-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 transition-all shadow-xl shadow-rose-100 text-white"
                                    >
                                        <XCircle size={14} /> Rejeter
                                    </button>
                                    <button
                                        onClick={() => handleApprove(selectedProduct)}
                                        className="flex items-center justify-center gap-2 py-4 bg-primary rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-neutral/90 transition-all shadow-xl shadow-primary/20 text-white"
                                    >
                                        <CheckCircle size={14} /> Approuver
                                    </button>
                                </div>

                            </motion.div>
                        ) : (
                            <div className="py-20 flex flex-col items-center text-center gap-6">
                                <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center text-base-content/20">
                                    <AlertCircle size={40} />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-base-content/90">Aucune sélection</p>
                                    <p className="max-w-[200px] text-xs font-bold text-base-content/40 leading-relaxed">
                                        Cliquez sur un produit dans la liste pour voir tous les détails.
                                    </p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AddProductModal;