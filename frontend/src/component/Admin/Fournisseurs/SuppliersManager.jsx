import React, { useState, useEffect } from 'react';
import { getSuppliers, updateSupplierStatus } from '../../../services/supplierService';
import { useAuth } from '@clerk/clerk-react';
import { CheckCircle, XCircle, Clock, MapPin, Phone, MessageCircle, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';

const SuppliersManager = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
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
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-wider">
                        <CheckCircle size={14} /> Actif
                    </span>
                );
            case 'pending':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-black uppercase tracking-wider">
                        <Clock size={14} /> En attente
                    </span>
                );
            case 'suspended':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-black uppercase tracking-wider">
                        <XCircle size={14} /> Suspendu
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider">
                        {status}
                    </span>
                );
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
                <h2 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Gestion des Fournisseurs</h2>
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Validation et suivi des partenaires</p>
            </div>

            <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Boutique / Nom</th>
                                <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Localisation</th>
                                <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Contacts</th>
                                <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Statut</th>
                                <th className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {suppliers.length > 0 ? (
                                suppliers.map((supplier) => (
                                    <motion.tr
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        key={supplier.id}
                                        className="hover:bg-slate-50/30 transition-colors group"
                                    >
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border-2 border-white shadow-xl shadow-indigo-100/20 flex items-center justify-center text-indigo-600 font-black text-xl italic group-hover:scale-110 transition-transform">
                                                    {supplier.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">{supplier.name}</p>
                                                    <p className="text-xs font-bold text-slate-400">{supplier.email || supplier.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <MapPin size={16} className="text-slate-400 shrink-0" />
                                                <span className="text-xs font-bold leading-tight max-w-[200px]">
                                                    {supplier.address_line || "Adresse non renseignée"}, {supplier.commune_label}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Phone size={14} className="text-indigo-400 shrink-0" />
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
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {supplier.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(supplier.id, 'active')}
                                                        className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-200"
                                                    >
                                                        Approuver
                                                    </button>
                                                )}
                                                {supplier.status === 'active' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(supplier.id, 'suspended')}
                                                        className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 shadow-lg shadow-amber-200"
                                                    >
                                                        Suspendre
                                                    </button>
                                                )}
                                                {supplier.status === 'suspended' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(supplier.id, 'active')}
                                                        className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-200"
                                                    >
                                                        Réactiver
                                                    </button>
                                                )}
                                                <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all border border-slate-100">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-10 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 border border-slate-100">
                                                <Clock size={40} />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-slate-800">Aucun fournisseur</p>
                                                <p className="text-xs font-bold text-slate-400">La liste des partenaires s'affichera ici.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SuppliersManager;
