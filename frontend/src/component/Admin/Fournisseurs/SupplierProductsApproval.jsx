import React, { useState, useEffect } from 'react';
import { getProducts, getProductById, updateProduct, deleteProduct } from '../../../services/productService';
import { useAuth } from "../../../lib/AuthHooks";
import { 
  CheckCircle, XCircle, Eye, AlertCircle, Trash2, 
  Package, Search, User, Calendar, Tag, Info, Layers, ShoppingBag, 
  Truck, Percent, Image as ImageIcon, Store, FileText, 
  Sparkles, Flame, Gift, ChevronDown, ChevronUp, Loader,
  X, ChevronLeft, ChevronRight, ZoomIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Composant Lightbox pour la visualisation des images
const ImageLightbox = ({ images, currentIndex, onClose, onNavigate }) => {
    const [isZoomed, setIsZoomed] = useState(false);

    // Navigation au clavier
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') onNavigate('prev');
            if (e.key === 'ArrowRight') onNavigate('next');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, onNavigate]);

    if (!images || images.length === 0) return null;

    const currentImage = images[currentIndex];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={onClose}
        >
            {/* Bouton fermer */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10 p-2 hover:bg-white/10 rounded-full"
            >
                <X size={32} />
            </button>

            {/* Navigation - Précédent */}
            {images.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
                    className="absolute left-6 text-white/40 hover:text-white transition-colors z-10 p-4 hover:bg-white/10 rounded-full"
                >
                    <ChevronLeft size={40} />
                </button>
            )}

            {/* Image */}
            <motion.div
                key={currentIndex}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 25 }}
                className="relative max-w-[90vw] max-h-[85vh] cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomed(!isZoomed);
                }}
            >
                <img
                    src={currentImage?.image_url || currentImage?.url}
                    alt={`Image ${currentIndex + 1}`}
                    className={`object-contain transition-all duration-300 ${
                        isZoomed ? 'scale-150' : 'scale-100'
                    } max-w-[90vw] max-h-[85vh] rounded-xl shadow-2xl`}
                    onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23333"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23666" font-size="16"%3EImage non disponible%3C/text%3E%3C/svg%3E';
                    }}
                />
                
                {/* Indicateur de zoom */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white/80 text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                    {isZoomed ? '🔍 Dézoomer' : '🔍 Zoomer'} • Cliquez sur l'image
                </div>

                {/* Compteur */}
                {images.length > 1 && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-4 py-1.5 rounded-full backdrop-blur-sm">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}
            </motion.div>

            {/* Navigation - Suivant */}
            {images.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
                    className="absolute right-6 text-white/40 hover:text-white transition-colors z-10 p-4 hover:bg-white/10 rounded-full"
                >
                    <ChevronRight size={40} />
                </button>
            )}

            {/* Miniatures en bas */}
            {images.length > 1 && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto px-4 py-2">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); onNavigate(idx); }}
                            className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                                idx === currentIndex 
                                    ? 'border-white shadow-lg shadow-white/20' 
                                    : 'border-white/20 hover:border-white/50'
                            }`}
                        >
                            <img
                                src={img.image_url || img.url}
                                alt={`Miniature ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        </button>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

// Composant principal
const SupplierProductsApproval = ({ globalSearchQuery = "" }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProductDetails, setSelectedProductDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [localSearch, setLocalSearch] = useState("");
    const [expandedSections, setExpandedSections] = useState({
        variants: true,
        images: true,
    });
    const { getToken } = useAuth();

    // États pour la lightbox
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImages, setLightboxImages] = useState([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const fetchPendingProducts = async () => {
        try {
            setLoading(true);
            const query = localSearch || globalSearchQuery;
            const data = await getProducts({ 
                approval_status: 'En attente', 
                isAdmin: 'true',
                search: query
            });
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

    const loadProductDetails = async (product) => {
        setLoadingDetails(true);
        setSelectedProduct(product);
        try {
            const token = await getToken();
            const fullProduct = await getProductById(product.id, token);
            setSelectedProductDetails(fullProduct);
            setFeedback(fullProduct.admin_feedback || '');
        } catch (error) {
            console.error('Erreur chargement détails:', error);
            setSelectedProductDetails(product);
            toast.error('Impossible de charger tous les détails');
        } finally {
            setLoadingDetails(false);
        }
    };

    // Fonction pour ouvrir la lightbox
    const openLightbox = (images, index = 0) => {
        if (!images || images.length === 0) return;
        setLightboxImages(images);
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    // Fonction pour naviguer dans la lightbox
    const navigateLightbox = (direction) => {
        if (direction === 'next') {
            setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
        } else if (direction === 'prev') {
            setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
        } else if (typeof direction === 'number') {
            setLightboxIndex(direction);
        }
    };

    const handleApprove = async (product) => {
        try {
            const token = await getToken();
            await updateProduct(product.id, {
                approval_status: 'approved',
                admin_feedback: feedback || 'Produit approuvé.',
                isAdmin: 'true'
            }, token);
            setSelectedProduct(null);
            setSelectedProductDetails(null);
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
            setSelectedProductDetails(null);
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
            setSelectedProductDetails(null);
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

    const displayProduct = selectedProductDetails || selectedProduct;

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
                <div className="xl:col-span-2 bg-base-100 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-base-200 overflow-hidden">
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
                                                selectedProduct?.id === product.id ? 'bg-indigo-50/30' : ''
                                            }`}
                                            onClick={() => loadProductDetails(product)}
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    {product.images?.length > 0 ? (
                                                        <img
                                                            src={product.images[0]?.image_url}
                                                            alt={product.name}
                                                            className="w-12 h-12 rounded-xl object-cover bg-base-200 shrink-0"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-xl bg-base-200 flex items-center justify-center shrink-0">
                                                            <Package size={20} className="text-base-content/30" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-black text-base-content line-clamp-1">
                                                            {product.name || 'Sans nom'}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider">
                                                            {product.category?.name || 'Non catégorisé'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-black text-indigo-600">
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
                                                        loadProductDetails(product);
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

                {/* Detail Panel */}
                <div className="bg-base-100 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-base-200 p-8 h-fit sticky top-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {displayProduct ? (
                            <motion.div
                                key={displayProduct.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* Loading indicator */}
                                {loadingDetails && (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader size={24} className="animate-spin text-primary" />
                                        <span className="ml-2 text-sm font-bold text-base-content/60">
                                            Chargement des détails...
                                        </span>
                                    </div>
                                )}

                                {/* Header */}
                                <div className="border-b border-base-200 pb-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-2xl font-black tracking-tighter mb-1">
                                                Détails du Produit
                                            </h3>
                                            <p className="text-xs font-bold text-base-content/40 uppercase tracking-widest">
                                                ID: #{displayProduct.id}
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                            (displayProduct.approval_status || 'En attente') === 'En attente' 
                                                ? 'bg-amber-100 text-amber-700' 
                                                : displayProduct.approval_status === 'approved'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-rose-100 text-rose-700'
                                        }`}>
                                            {displayProduct.approval_status || 'En attente'}
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION 1: Informations Générales */}
                                <div className="bg-base-200/50 rounded-3xl p-6 space-y-4">
                                    <div className="flex items-center gap-2 text-base-content/40">
                                        <Info size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Informations Générales</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-base-content/30">Nom</p>
                                            <p className="text-sm font-black text-base-content">{displayProduct.name || 'Sans nom'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-base-content/30">Catégorie</p>
                                            <div className="flex items-center gap-1">
                                                <Tag size={12} className="text-base-content/30" />
                                                <p className="text-sm font-black text-base-content">
                                                    {displayProduct.category?.name || 'Non catégorisé'}
                                                </p>
                                            </div>
                                        </div>
                                        {displayProduct.description && (
                                            <div>
                                                <p className="text-[9px] font-black uppercase text-base-content/30">Description</p>
                                                <p className="text-sm font-medium text-base-content/80 leading-relaxed bg-base-100 p-4 rounded-2xl">
                                                    {displayProduct.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* SECTION 2: Prix */}
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 space-y-4 border border-indigo-100">
                                    <div className="flex items-center gap-2 text-indigo-400">
                                        <Percent size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Prix & Paiement</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/70 rounded-2xl p-4">
                                            <p className="text-[9px] font-black uppercase text-indigo-400">💰 Prix Public</p>
                                            <p className="text-2xl font-black text-indigo-600">{formatPrice(displayProduct.price)} FCFA</p>
                                        </div>
                                        <div className="bg-white/70 rounded-2xl p-4">
                                            <p className="text-[9px] font-black uppercase text-emerald-400">📦 Payout</p>
                                            <p className="text-2xl font-black text-emerald-600">{formatPrice(displayProduct.supplier_price)} FCFA</p>
                                        </div>
                                    </div>
                                    {displayProduct.old_price && displayProduct.old_price > 0 && (
                                        <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200">
                                            <div className="flex items-center gap-2">
                                                <Flame size={16} className="text-rose-500" />
                                                <span className="text-[9px] font-black uppercase text-rose-500">Promotion</span>
                                            </div>
                                            <p className="text-sm font-black text-rose-600">
                                                Ancien prix: {formatPrice(displayProduct.old_price)} FCFA
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* SECTION 3: Images avec Lightbox */}
                                {displayProduct.images && displayProduct.images.length > 0 && (
                                    <div className="bg-base-200/50 rounded-3xl p-6 space-y-4">
                                        <button
                                            onClick={() => toggleSection('images')}
                                            className="flex items-center justify-between w-full"
                                        >
                                            <div className="flex items-center gap-2 text-base-content/40">
                                                <ImageIcon size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    Images ({displayProduct.images.length})
                                                </span>
                                            </div>
                                            {expandedSections.images ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                        
                                        {expandedSections.images && (
                                            <div className="grid grid-cols-3 gap-2 mt-4">
                                                {displayProduct.images.map((img, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className="relative aspect-square rounded-xl overflow-hidden border-2 border-base-100 cursor-pointer group hover:border-primary transition-all"
                                                        onClick={() => openLightbox(displayProduct.images, idx)}
                                                    >
                                                        <img 
                                                            src={img.image_url} 
                                                            alt={`Product ${idx + 1}`}
                                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                        {/* Overlay au survol */}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <ZoomIn size={24} className="text-white" />
                                                        </div>
                                                        {img.is_main && (
                                                            <div className="absolute top-1 right-1 bg-primary text-white text-[8px] font-black px-1.5 py-0.5 rounded">
                                                                MAIN
                                                            </div>
                                                        )}
                                                        {/* Indicateur de clic */}
                                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[8px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                            Cliquer pour voir
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* SECTION 4: Variantes */}
                                {displayProduct.variants && displayProduct.variants.length > 0 && (
                                    <div className="bg-base-200/50 rounded-3xl p-6 space-y-4">
                                        <button
                                            onClick={() => toggleSection('variants')}
                                            className="flex items-center justify-between w-full"
                                        >
                                            <div className="flex items-center gap-2 text-base-content/40">
                                                <Layers size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">
                                                    Variantes ({displayProduct.variants.length})
                                                </span>
                                            </div>
                                            {expandedSections.variants ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                        
                                        {expandedSections.variants && (
                                            <div className="space-y-3 mt-4">
                                                {displayProduct.variants.map((variant, idx) => (
                                                    <div key={idx} className="bg-base-100 rounded-2xl p-4 border border-base-200">
                                                        <div className="flex items-center gap-3">
                                                            {variant.image_url && (
                                                                <div 
                                                                    className="w-12 h-12 rounded-xl overflow-hidden cursor-pointer group relative flex-shrink-0"
                                                                    onClick={() => {
                                                                        // Si la variante a une image, on l'ouvre dans la lightbox
                                                                        const variantImage = { image_url: variant.image_url };
                                                                        openLightbox([variantImage], 0);
                                                                    }}
                                                                >
                                                                    <img 
                                                                        src={variant.image_url} 
                                                                        alt={`Variant ${idx + 1}`}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                        }}
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <ZoomIn size={14} className="text-white" />
                                                                    </div>
                                                                </div>
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
                                                                    <span className="text-indigo-600">{formatPrice(variant.price)} FCFA</span>
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
                                {displayProduct.stock !== undefined && displayProduct.stock !== null && (
                                    <div className="bg-base-200/50 rounded-3xl p-6 space-y-4">
                                        <div className="flex items-center gap-2 text-base-content/40">
                                            <ShoppingBag size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Stock</span>
                                        </div>
                                        <div className="bg-base-100 rounded-2xl p-4">
                                            <p className={`text-2xl font-black ${displayProduct.stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                {displayProduct.stock} unités
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* SECTION 6: Notes */}
                                {displayProduct.supplier_note && (
                                    <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200">
                                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                                            <FileText size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Note du fournisseur</span>
                                        </div>
                                        <p className="text-sm font-medium text-amber-800">{displayProduct.supplier_note}</p>
                                    </div>
                                )}

                                {displayProduct.admin_feedback && (
                                    <div className="bg-blue-50 rounded-3xl p-6 border border-blue-200">
                                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                                            <AlertCircle size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Feedback précédent</span>
                                        </div>
                                        <p className="text-sm font-medium text-blue-800">{displayProduct.admin_feedback}</p>
                                    </div>
                                )}

                                {/* SECTION 7: Métadonnées */}
                                {(displayProduct.created_at || displayProduct.updated_at) && (
                                    <div className="bg-base-200/30 rounded-3xl p-4 grid grid-cols-2 gap-2 text-[10px]">
                                        {displayProduct.created_at && (
                                            <div>
                                                <p className="font-black text-base-content/30 uppercase">Créé le</p>
                                                <p className="font-bold text-base-content/60">{formatDate(displayProduct.created_at)}</p>
                                            </div>
                                        )}
                                        {displayProduct.updated_at && (
                                            <div>
                                                <p className="font-black text-base-content/30 uppercase">Modifié le</p>
                                                <p className="font-bold text-base-content/60">{formatDate(displayProduct.updated_at)}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* SECTION 8: Feedback */}
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
                                        onClick={() => handleDelete(displayProduct)}
                                        className="flex items-center justify-center gap-2 py-4 bg-neutral/90 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-neutral transition-all shadow-xl shadow-slate-200 text-white"
                                    >
                                        <Trash2 size={14} /> Supprimer
                                    </button>
                                    <button
                                        onClick={() => handleReject(displayProduct)}
                                        className="flex items-center justify-center gap-2 py-4 bg-rose-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 transition-all shadow-xl shadow-rose-100 text-white"
                                    >
                                        <XCircle size={14} /> Rejeter
                                    </button>
                                    <button
                                        onClick={() => handleApprove(displayProduct)}
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

            {/* Lightbox / Visionneuse d'images */}
            <AnimatePresence>
                {lightboxOpen && (
                    <ImageLightbox
                        images={lightboxImages}
                        currentIndex={lightboxIndex}
                        onClose={() => setLightboxOpen(false)}
                        onNavigate={navigateLightbox}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default SupplierProductsApproval;