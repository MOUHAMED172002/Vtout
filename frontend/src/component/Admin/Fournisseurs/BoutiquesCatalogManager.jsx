import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../lib/clerk-shim';
import { Store, Package, MapPin, Phone, Eye, ChevronRight, LayoutGrid, Plus, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddBoutiqueModal from './AddBoutiqueModal';
import AdminAddProductModal from '../Product/AdminAddProductModal';
import BoutiqueStatsModal from './BoutiqueStatsModal';
import { BarChart3 } from 'lucide-react';


const BoutiquesCatalogManager = () => {
    const [boutiques, setBoutiques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBoutique, setSelectedBoutique] = useState(null);
    const [showAddBoutique, setShowAddBoutique] = useState(false);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const { getToken } = useAuth();


    const fetchBoutiques = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const { data } = await axios.get(`${API_URL}/suppliers/boutiques-all`, config);
            setBoutiques(data);
            if (selectedBoutique) {
                const updated = data.find(b => b.id === selectedBoutique.id);
                if (updated) setSelectedBoutique(updated);
            }
        } catch (error) {
            console.error('Erreur chargement boutiques:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoutiques();
    }, []);

    if (loading && boutiques.length === 0) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Catalogue des Boutiques</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Gestion centralisée des points de vente partenaires</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* List Section */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center justify-between px-4 mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Toutes les boutiques ({boutiques.length})</span>
                        <button 
                            onClick={() => {
                                setSelectedBoutique(null);
                                setShowAddBoutique(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-slate-900 transition-all shadow-lg shadow-primary/20 text-[9px] font-black uppercase tracking-widest"
                        >
                            <Plus size={14} /> Boutique
                        </button>
                    </div>


                    {boutiques.map((btq) => (
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            key={btq.id}
                            onClick={() => setSelectedBoutique(btq)}
                            className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all ${
                                selectedBoutique?.id === btq.id 
                                ? 'bg-white border-primary shadow-xl shadow-primary/10' 
                                : 'bg-white/50 border-slate-100 hover:border-slate-200 shadow-sm'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                    selectedBoutique?.id === btq.id ? 'bg-primary text-white' : 'bg-white text-slate-400 border border-slate-100 shadow-sm'
                                }`}>
                                    <Store size={22} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-sm text-slate-900 truncate">{btq.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{btq.commune_label}</p>
                                </div>
                                <ChevronRight size={16} className={`transition-transform ${selectedBoutique?.id === btq.id ? 'translate-x-1 text-primary' : 'text-slate-300'}`} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Content Section */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {selectedBoutique ? (
                            <motion.div
                                key={selectedBoutique.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 space-y-10"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-50 pb-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-slate-50 rounded-[24px] flex items-center justify-center text-primary shadow-inner">
                                            <Store size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{selectedBoutique.name}</h3>
                                            <div className="flex items-center gap-2 text-slate-400 mt-1">
                                                <MapPin size={14} />
                                                <span className="text-xs font-bold uppercase tracking-widest">{selectedBoutique.commune_label}, {selectedBoutique.departement_label}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-3 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                                            <Phone size={16} className="text-primary" />
                                            <span className="text-sm font-black text-slate-700">{selectedBoutique.phone}</span>
                                        </div>
                                        <div className="flex gap-2 justify-end items-center">
                                            <button 
                                                onClick={() => setShowStats(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"
                                            >
                                                <BarChart3 size={14} /> Performance
                                            </button>
                                            <button 
                                                onClick={() => setShowAddBoutique(true)}
                                                className="text-[9px] font-black uppercase text-primary hover:underline"
                                            >
                                                + Nouvelle boutique
                                            </button>
                                        </div>
                                    </div>


                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            <LayoutGrid size={16} /> Inventaire ({selectedBoutique.supplier?.products?.length || 0})
                                        </h5>
                                        <button 
                                            onClick={() => setShowAddProduct(true)}
                                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-slate-900 transition-all"
                                        >
                                            <Plus size={14} /> Ajouter un produit
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedBoutique.supplier?.products?.map((prod) => (
                                            <div key={prod.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-primary/20 transition-all group relative overflow-hidden">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-black text-sm text-slate-800">{prod.name}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-sm font-black text-primary">{prod.price.toLocaleString()} F</span>
                                                            <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg ${
                                                                prod.approval_status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                                            }`}>
                                                                {prod.approval_status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stock</p>
                                                        <p className="font-black text-sm text-slate-800">{prod.stock}</p>
                                                    </div>
                                                </div>
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 -mr-8 -mt-8 rounded-full"></div>
                                            </div>
                                        ))}

                                        {(!selectedBoutique.supplier?.products || selectedBoutique.supplier.products.length === 0) && (
                                            <div className="col-span-2 py-16 text-center bg-slate-50/50 rounded-3xl border-4 border-dashed border-slate-100">
                                                <Package className="mx-auto text-slate-200 mb-4" size={48} />
                                                <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">Aucun produit répertorié</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full min-h-[500px] bg-slate-50 rounded-[40px] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-12 gap-8 shadow-inner">
                                <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-slate-200 text-primary border-4 border-white">
                                    <Store size={56} />
                                </div>
                                <div className="max-w-xs space-y-3">
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Gestion des Catalogues</h3>
                                    <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest">Sélectionnez une boutique pour gérer son inventaire, modifier ses produits ou en ajouter de nouveaux.</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showAddBoutique && (
                    <AddBoutiqueModal 
                        supplier={selectedBoutique?.supplier}
                        onClose={() => setShowAddBoutique(false)}
                        onCreated={fetchBoutiques}
                    />
                )}

                {showAddProduct && selectedBoutique && (
                    <AdminAddProductModal 
                        supplier={selectedBoutique.supplier}
                        boutique={selectedBoutique}
                        onClose={() => setShowAddProduct(false)}
                        onCreated={fetchBoutiques}
                    />
                )}
                {showStats && selectedBoutique && (
                    <BoutiqueStatsModal 
                        boutique={selectedBoutique}
                        onClose={() => setShowStats(false)}
                    />
                )}
            </AnimatePresence>

        </div>
    );
};

export default BoutiquesCatalogManager;


export default BoutiquesCatalogManager;
