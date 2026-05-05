import React, { useState, useEffect } from 'react';
import { getSuppliers, updateSupplierStatus, deleteSupplier } from '../../../services/supplierService';
import { useAuth } from '../../../lib/clerk-shim';
import { CheckCircle, XCircle, Clock, MapPin, Phone, MessageCircle, MoreVertical, Trash2, Ban, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddBoutiqueModal from './AddBoutiqueModal';
import SupplierWalletModal from './SupplierWalletModal';
import AddSupplierModal from './AddSupplierModal';
import { Wallet, UserPlus } from 'lucide-react';

const SuppliersManager = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddSupplier, setShowAddSupplier] = useState(false);
    const [selectedForBoutique, setSelectedForBoutique] = useState(null);
    const [selectedForWallet, setSelectedForWallet] = useState(null);

    const { getToken } = useAuth();



    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const data = await getSuppliers(token);
            setSuppliers(data);
        } catch (error) {
            console.error('Erreur lors du chargement des fournisseurs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const token = await getToken();
            await updateSupplierStatus(id, { status: newStatus }, token);
            fetchSuppliers(); // Refresh list
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            alert('Erreur lors de la mise à jour du statut');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible.')) return;
        try {
            const token = await getToken();
            await deleteSupplier(id, token);
            fetchSuppliers(); // Refresh list
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const getStatusBadge = (status) => {
        const s = status?.toLowerCase() || '';
        if (s === 'active' || s === 'actif') {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider">
                    <CheckCircle size={14} /> Actif
                </span>
            );
        }
        if (s === 'en_attente' || s === 'en attente') {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-black uppercase tracking-wider">
                    <Clock size={14} /> En attente
                </span>
            );
        }
        if (s === 'suspended' || s === 'suspendu') {
            return (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-black uppercase tracking-wider">
                    <XCircle size={14} /> Suspendu
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-black uppercase tracking-wider">
                <Clock size={14} /> En attente
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 lg:space-y-8 pb-20">
            <div className="px-2 lg:px-0">
                <h2 className="text-3xl lg:text-4xl font-black tracking-tighter text-base-content mb-1">Gestion des Marchands</h2>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <p className="text-base-content/70 font-bold uppercase tracking-[0.2em] text-[9px] lg:text-[10px]">Validation et suivi des partenaires</p>
                    <button 
                        onClick={() => setShowAddSupplier(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-primary/20 text-[10px] font-black uppercase tracking-widest"
                    >
                        <UserPlus size={16} /> Nouveau Marchand
                    </button>
                </div>
            </div>


            <div className="bg-base-100 rounded-[2rem] lg:rounded-[40px] shadow-2xl shadow-base-content/5 border border-base-content/10 overflow-hidden mx-2 lg:mx-0">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-base-content min-w-[800px] lg:min-w-0">
                        <thead>
                            <tr className="bg-base-200/50">
                                <th className="px-6 lg:px-10 py-6 lg:py-8 text-left text-[10px] font-black uppercase tracking-widest text-base-content/50 border-b border-base-content/10">Boutique / Nom</th>
                                <th className="px-6 lg:px-10 py-6 lg:py-8 text-left text-[10px] font-black uppercase tracking-widest text-base-content/50 border-b border-base-content/10">Localisation</th>
                                <th className="px-6 lg:px-10 py-6 lg:py-8 text-left text-[10px] font-black uppercase tracking-widest text-base-content/50 border-b border-base-content/10">Contacts</th>
                                <th className="px-6 lg:px-10 py-6 lg:py-8 text-left text-[10px] font-black uppercase tracking-widest text-base-content/50 border-b border-base-content/10">Statut</th>
                                <th className="px-6 lg:px-10 py-6 lg:py-8 text-center text-[10px] font-black uppercase tracking-widest text-base-content/50 border-b border-base-content/10">Gestion</th>
                                <th className="px-6 lg:px-10 py-6 lg:py-8 text-right text-[10px] font-black uppercase tracking-widest text-base-content/50 border-b border-base-content/10">Administration</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-base-content/10">
                            {suppliers.length > 0 ? (
                                suppliers.map((supplier) => (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        key={supplier.id}
                                        className="hover:bg-base-200/50 transition-colors group"
                                    >
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-base-100 shadow-xl shadow-primary/10 flex items-center justify-center text-primary font-black text-xl italic group-hover:scale-110 transition-transform">
                                                    {supplier.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-base-content">{supplier.name}</p>
                                                    <p className="text-xs font-bold text-base-content/50">{supplier.email || supplier.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2 text-base-content/70">
                                                <MapPin size={16} className="text-base-content/50 shrink-0" />
                                                <span className="text-[11px] font-black text-base-content leading-tight block">
                                                    {supplier.quartier_label || "Quartier non défini"}
                                                </span>
                                                <span className="text-[10px] font-bold text-base-content/50 block">
                                                    {supplier.commune_label}, {supplier.departement_label}
                                                </span>
                                                {supplier.address_line && (
                                                    <span className="text-[9px] text-base-content/30 italic block mt-1">{supplier.address_line}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-base-content/70">
                                                    <Phone size={14} className="text-primary shrink-0" />
                                                    <span className="text-xs font-bold">{supplier.phone}</span>
                                                </div>
                                                {supplier.whatsapp && (
                                                    <div className="flex items-center gap-2 text-emerald-600">
                                                        <MessageCircle size={14} className=" shrink-0" />
                                                        <span className="text-xs font-black">{supplier.whatsapp}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            {getStatusBadge(supplier.status)}
                                        </td>
                                        <td className="px-6 lg:px-10 py-8">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setSelectedForBoutique(supplier)}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
                                                >
                                                    <Plus size={14} /> Boutique
                                                </button>
                                                <button
                                                    onClick={() => setSelectedForWallet(supplier)}
                                                    className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center border border-emerald-100"
                                                    title="Portefeuille"
                                                >
                                                    <Wallet size={16} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 lg:px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                {(!supplier.status || !['active', 'actif', 'suspended', 'suspendu'].includes(supplier.status.toLowerCase())) && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(supplier.id, 'active')}
                                                        className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all"
                                                    >
                                                        Approuver
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleDelete(supplier.id)}
                                                    className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>

                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-10 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center text-base-content/20 border border-base-content/10">
                                                <Clock size={40} />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-base-content">Aucun fournisseur</p>
                                                <p className="text-xs font-bold text-base-content/50">La liste des partenaires s'affichera ici.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {showAddSupplier && (
                    <AddSupplierModal 
                        onClose={() => setShowAddSupplier(false)}
                        onCreated={fetchSuppliers}
                    />
                )}
                {selectedForBoutique && (
                    <AddBoutiqueModal 
                        supplier={selectedForBoutique}
                        onClose={() => setSelectedForBoutique(null)}
                        onCreated={fetchSuppliers}
                    />
                )}

                {selectedForWallet && (
                    <SupplierWalletModal 
                        supplier={selectedForWallet}
                        onClose={() => setSelectedForWallet(null)}
                    />
                )}
            </AnimatePresence>

        </div>

    );
};

export default SuppliersManager;
