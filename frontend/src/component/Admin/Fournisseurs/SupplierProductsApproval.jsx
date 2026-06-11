import React, { useState, useEffect } from 'react';
import { getProducts, updateProduct, mergeProducts, searchProducts, deleteProduct } from '../../../services/productService';
import { useAuth } from "../../../lib/AuthHooks";
import { CheckCircle, XCircle, Clock, Eye, AlertCircle, Save, Edit3, Trash2, Package, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const SupplierProductsApproval = ({ globalSearchQuery = "" }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [retailPrice, setRetailPrice] = useState('');
    const [localSearch, setLocalSearch] = useState("");
    const { getToken } = useAuth();

    const fetchPendingProducts = async () => {
        try {
            setLoading(true);
            // On récupère tous les produits avec le status En attente (en précisant qu'on est admin)
            const query = localSearch || globalSearchQuery;
            const data = await getProducts({ 
                approval_status: 'En attente', 
                isAdmin: 'true',
                search: query
            });
            setProducts(data.products || data || []);
        } catch (error) {
            console.error('Erreur chargement produits:', error);
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
                isAdmin: 'true' // Explicitly pass admin flag
            }, token);
            setSelectedProduct(null);
            fetchPendingProducts();
            toast.success('Produit approuvé !');
        } catch (error) {
            console.error('Erreur approbation:', error);
            toast.error('Erreur lors de l\'approbation');
        }
    };

    const handleReject = async (product) => {
        if (!feedback) {
            toast.error('Veuillez fournir un motif de rejet.');
            return;
        }

        try {
            const token = await getToken();
            await updateProduct(product.id, {
                approval_status: 'rejected',
                admin_feedback: feedback,
                isAdmin: 'true' // Explicitly pass admin flag
            }, token);
            setSelectedProduct(null);
            setFeedback('');
            fetchPendingProducts();
            toast.success('Produit rejeté');
        } catch (error) {
            console.error('Erreur rejet:', error);
            toast.error('Erreur lors du rejet');
        }
    };

    const handleDelete = async (product) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce produit ?")) return;
        
        try {
            const token = await getToken();
            await deleteProduct(product.id, token);
            setSelectedProduct(null);
            fetchPendingProducts();
            toast.success('Produit supprimé définitivement');
        } catch (error) {
            console.error('Erreur suppression:', error);
            toast.error('Erreur lors de la suppression');
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
            <div>
                <h2 className="text-4xl font-black tracking-tighter text-base-content mb-2">Approbation Produits</h2>
                <p className="text-base-content/50 font-bold uppercase tracking-[0.2em] text-[10px]">Modération des catalogues fournisseurs</p>
            </div>

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

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 text-base-content">
                {/* List Section */}
                <div className="xl:col-span-2 bg-base-100 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-base-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-base-200/50">
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-base-content/40 border-b border-base-200">Produit</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-base-content/40 border-b border-base-200">Prix Public / Payout</th>
                                    <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-base-content/40 border-b border-base-200">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-200">
                                {products.length > 0 ? (
                                    products.map((product) => (
                                        <tr
                                            key={product.id}
                                            className={`hover:bg-base-200/50 transition-colors cursor-pointer ${selectedProduct?.id === product.id ? 'bg-indigo-50/30' : ''}`}
                                            onClick={() => {
                                                setSelectedProduct(product);
                                                setFeedback(product.admin_feedback || '');
                                                setRetailPrice('');
                                            }}
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    {product.images?.[0]?.image_url ? (
                                                        <img
                                                            src={product.images[0].image_url}
                                                            alt={product.name}
                                                            className="w-12 h-12 rounded-xl object-cover bg-base-200 shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-xl bg-base-200 flex items-center justify-center shrink-0">
                                                            <Package size={20} className="text-base-content/30" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-black text-base-content">{product.name}</p>
                                                        <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider">{product.category?.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-black text-indigo-600">{product.price || 0} FCFA</p>
                                                <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-wider">Gain: {product.supplier_price || 0} FCFA</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="p-2 bg-base-100 border border-base-300 rounded-lg text-base-content/40 hover:text-primary transition-colors shadow-sm">
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-10 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <CheckCircle size={40} className="text-emerald-200" />
                                                <p className="text-sm font-black text-base-content/40 uppercase tracking-widest">Tous les produits sont traités</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detail/Approval Panel */}
                <div className="bg-base-100 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-base-200 p-10 h-fit sticky top-8">
                    <AnimatePresence mode="wait">
                        {selectedProduct ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                <div className="border-b border-base-200 pb-8">
                                    <h3 className="text-2xl font-black tracking-tighter mb-1">Examen du Produit</h3>
                                    <p className="text-xs font-bold text-base-content/40 uppercase tracking-widest">Validation de l'offre</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 bg-base-200 rounded-3xl border border-base-200 flex flex-col gap-2">
                                        <span className="text-[10px] font-black uppercase text-base-content/40 tracking-widest">Gain Fournisseur (Payout)</span>
                                        <span className="text-xl font-black text-base-content">{selectedProduct.supplier_price} <span className="text-sm text-base-content/40">FCFA</span></span>
                                    </div>

                                    <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex flex-col gap-2">
                                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Prix Final (Public)</span>
                                        <span className="text-xl font-black text-indigo-600">{selectedProduct.price} <span className="text-sm text-indigo-300">FCFA</span></span>
                                        <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-[0.1em] italic mt-1">Le prix affiché aux clients.</p>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-base-content/40 tracking-widest px-2">Message au fournisseur</label>
                                        <textarea
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                            rows="3"
                                            className="w-full bg-base-200 border-none rounded-3xl px-6 py-5 text-sm font-bold placeholder:text-base-content/30 focus:ring-2 focus:ring-primary/20 transition-all text-base-content"
                                            placeholder="Ex: Photos de mauvaise qualité..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 pt-4 text-white">
                                        <button
                                            onClick={() => handleDelete(selectedProduct)}
                                            className="flex items-center justify-center gap-2 py-5 bg-neutral/90 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-neutral transition-all shadow-xl shadow-slate-200"
                                        >
                                            <Trash2 size={14} /> Supprimer
                                        </button>
                                        <button
                                            onClick={() => handleReject(selectedProduct)}
                                            className="flex items-center justify-center gap-2 py-5 bg-red-500 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 transition-all shadow-xl shadow-red-100"
                                        >
                                            <XCircle size={14} /> Rejeter
                                        </button>
                                        <button
                                            onClick={() => handleApprove(selectedProduct)}
                                            className="flex items-center justify-center gap-2 py-5 bg-primary rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-neutral/90 transition-all shadow-xl shadow-primary/20"
                                        >
                                            <CheckCircle size={14} /> Approuver
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="py-20 flex flex-col items-center text-center gap-6">
                                <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center text-base-content/20">
                                    <AlertCircle size={40} />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-base-content/90">Aucune sélection</p>
                                    <p className="max-w-[200px] text-xs font-bold text-base-content/40 leading-relaxed">Cliquez sur un produit dans la liste pour l'examiner.</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default SupplierProductsApproval;
