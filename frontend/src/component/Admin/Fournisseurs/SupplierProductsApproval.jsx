import React, { useState, useEffect } from 'react';
import { getProducts, updateProduct, mergeProducts, searchProducts, deleteProduct } from '../../../services/productService';
import { useAuth } from '../../../lib/clerk-shim';
import { CheckCircle, XCircle, Clock, Eye, AlertCircle, Save, Edit3, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const SupplierProductsApproval = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [retailPrice, setRetailPrice] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const { getToken } = useAuth();

    const fetchPendingProducts = async () => {
        try {
            setLoading(true);
            // On récupère tous les produits avec le status En attente (en précisant qu'on est admin)
            const data = await getProducts({ approval_status: 'En attente', isAdmin: 'true' });
            setProducts(data);
        } catch (error) {
            console.error('Erreur chargement produits:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingProducts();
    }, []);

    const handleApprove = async (product) => {
        try {
            const token = await getToken();
            const finalPrice = product.supplier_price || 0;
            
            await updateProduct(product.id, {
                approval_status: 'approved',
                price: finalPrice, 
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
                <h2 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Approbation Produits</h2>
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Modération des catalogues fournisseurs</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 text-slate-900">
                {/* List Section */}
                <div className="xl:col-span-2 bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Produit</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Prix Fournisseur</th>
                                    <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {products.length > 0 ? (
                                    products.map((product) => (
                                        <tr
                                            key={product.id}
                                            className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${selectedProduct?.id === product.id ? 'bg-indigo-50/30' : ''}`}
                                            onClick={() => {
                                                setSelectedProduct(product);
                                                setFeedback(product.admin_feedback || '');
                                                setRetailPrice('');
                                            }}
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <img
                                                        src={product.images?.[0]?.image_url || 'https://via.placeholder.com/50'}
                                                        alt={product.name}
                                                        className="w-12 h-12 rounded-xl object-cover bg-slate-100"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">{product.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.category?.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-black text-indigo-600">{product.supplier_price || 0} FCFA</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary transition-colors shadow-sm">
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
                                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Tous les produits sont traités</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detail/Approval Panel */}
                <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-10 h-fit sticky top-8">
                    <AnimatePresence mode="wait">
                        {selectedProduct ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                <div className="border-b border-slate-100 pb-8">
                                    <h3 className="text-2xl font-black tracking-tighter mb-1">Examen du Produit</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Validation de l'offre</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col gap-2">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Prix Fournisseur</span>
                                        <span className="text-xl font-black text-slate-900">{selectedProduct.supplier_price} <span className="text-sm text-slate-400">FCFA</span></span>
                                    </div>

                                    <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex flex-col gap-2">
                                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Prix Final (Public)</span>
                                        <span className="text-xl font-black text-indigo-600">{selectedProduct.supplier_price} <span className="text-sm text-indigo-300">FCFA</span></span>
                                        <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-[0.1em] italic mt-1">Conformément au prix fournisseur.</p>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Message au fournisseur</label>
                                        <textarea
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                            rows="3"
                                            className="w-full bg-slate-50 border-none rounded-3xl px-6 py-5 text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all text-slate-900"
                                            placeholder="Ex: Photos de mauvaise qualité..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 pt-4 text-white">
                                        <button
                                            onClick={() => handleDelete(selectedProduct)}
                                            className="flex items-center justify-center gap-2 py-5 bg-slate-800 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-slate-200"
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
                                            className="flex items-center justify-center gap-2 py-5 bg-primary rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-xl shadow-primary/20"
                                        >
                                            <CheckCircle size={14} /> Approuver
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="py-20 flex flex-col items-center text-center gap-6">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                    <AlertCircle size={40} />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-slate-800">Aucune sélection</p>
                                    <p className="max-w-[200px] text-xs font-bold text-slate-400 leading-relaxed">Cliquez sur un produit dans la liste pour l'examiner.</p>
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
