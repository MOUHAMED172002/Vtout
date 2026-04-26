import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../lib/clerk-shim';
import { Store, Package, MapPin, Phone, Eye, ChevronRight, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BoutiquesCatalogManager = () => {
    const [boutiques, setBoutiques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBoutique, setSelectedBoutique] = useState(null);
    const { getToken } = useAuth();

    const fetchBoutiques = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const { data } = await axios.get(`${API_URL}/suppliers/boutiques-all`, config);
            setBoutiques(data);
        } catch (error) {
            console.error('Erreur chargement boutiques:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoutiques();
    }, []);

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
                <h2 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Catalogue des Boutiques</h2>
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Aperçu des boutiques et de leurs inventaires</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* List Section */}
                <div className="lg:col-span-4 space-y-4">
                    {boutiques.map((btq) => (
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            key={btq.id}
                            onClick={() => setSelectedBoutique(btq)}
                            className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all ${
                                selectedBoutique?.id === btq.id 
                                ? 'bg-white border-primary shadow-xl shadow-primary/10' 
                                : 'bg-white/50 border-slate-100 hover:border-slate-200'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                    selectedBoutique?.id === btq.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                                }`}>
                                    <Store size={22} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-sm text-slate-900 truncate">{btq.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{btq.commune_label}</p>
                                </div>
                                <ChevronRight size={16} className="text-slate-300" />
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
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12 space-y-10"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-50 pb-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-slate-100 rounded-[24px] flex items-center justify-center text-slate-400">
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
                                    <div className="flex items-center gap-3 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                                        <Phone size={16} className="text-primary" />
                                        <span className="text-sm font-black text-slate-700">{selectedBoutique.phone}</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            <LayoutGrid size={16} /> Inventaire ({selectedBoutique.supplier?.products?.length || 0})
                                        </h5>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedBoutique.supplier?.products?.map((prod) => (
                                            <div key={prod.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-primary/20 transition-all group">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-black text-sm text-slate-800">{prod.name}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-xs font-black text-primary">{prod.price} F</span>
                                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg ${
                                                                prod.approval_status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                                            }`}>
                                                                {prod.approval_status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Stock</p>
                                                        <p className="font-black text-sm text-slate-800">{prod.stock}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {(!selectedBoutique.supplier?.products || selectedBoutique.supplier.products.length === 0) && (
                                            <div className="col-span-2 py-10 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                                <Package className="mx-auto text-slate-300 mb-3" size={32} />
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aucun produit dans cette boutique</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full min-h-[500px] bg-slate-50 rounded-[40px] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-12 gap-6">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl shadow-slate-200 text-slate-300">
                                    <Store size={48} />
                                </div>
                                <div className="max-w-xs">
                                    <h3 className="text-xl font-black text-slate-800 mb-2">Sélectionnez une boutique</h3>
                                    <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase tracking-widest text-[10px]">Choisissez un partenaire dans la liste de gauche pour consulter son catalogue complet.</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default BoutiquesCatalogManager;
