import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from './clerk-shim';
import { X, MapPin, Phone, Building2, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import AddressSelector from './Shared/AddressSelector';
import { createBoutique } from '../services/supplierService';
import api from '../services/api';

export default function BoutiqueModal({ isOpen, onClose, onSuccess, initialData = null }) {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        whatsapp: '',
        momo_number: '',
        address_line: '',
        departement_id: null,
        departement_label: '',
        commune_id: null,
        commune_label: '',
        quartier_id: null,
        quartier_label: '',
        lat: 6.3654,
        lng: 2.4183
    });

    React.useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                lat: initialData.lat || 6.3654,
                lng: initialData.lng || 2.4183
            });
        } else {
            setFormData({
                name: '', phone: '', whatsapp: '', momo_number: '', address_line: '',
                departement_id: null, departement_label: '',
                commune_id: null, commune_label: '',
                quartier_id: null, quartier_label: '',
                lat: 6.3654, lng: 2.4183
            });
        }
    }, [initialData, isOpen]);

    // ------------------------------------------------------------------
    // Props stabilisées pour AddressSelector : sans ça, il reçoit un nouvel
    // objet "initial" (et une nouvelle fonction "onChange") à CHAQUE frappe,
    // même dans les champs Nom/Téléphone qui n'ont rien à voir avec l'adresse.
    // Ça déclenche ses effets internes en boucle et ralentit toute la saisie.
    // ------------------------------------------------------------------
    const addressInitial = useMemo(() => ({
        departement_id: formData.departement_id,
        departement_label: formData.departement_label,
        commune_id: formData.commune_id,
        commune_label: formData.commune_label,
        quartier_id: formData.quartier_id,
        quartier_label: formData.quartier_label,
        lat: formData.lat,
        lng: formData.lng,
    }), [
        formData.departement_id, formData.departement_label,
        formData.commune_id, formData.commune_label,
        formData.quartier_id, formData.quartier_label,
        formData.lat, formData.lng
    ]);

    const handleAddressChange = useCallback((addr) => {
        setFormData(prev => ({ ...prev, ...addr }));
    }, []);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.commune_label) return toast.error("Veuillez choisir une localisation");
        
        setLoading(true);
        try {
            const token = await getToken();
            if (initialData?.id) {
                // Update
                await api.patch(`/suppliers/me/boutiques/${initialData.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Boutique mise à jour !");
            } else {
                // Create
                await createBoutique(formData, token);
                toast.success("Boutique ajoutée avec succès !");
            }
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(initialData?.id ? "Erreur lors de la mise à jour" : "Erreur lors de la création");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                onClick={onClose} 
            />
            
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                            <Store size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter">{initialData ? "Modifier Boutique" : "Nouvelle Boutique"}</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{initialData ? "Mettre à jour les infos" : "Ajouter un point de vente"}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Nom de la boutique</label>
                            <input 
                                required
                                value={formData.name}
                                onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                                placeholder="Ma Super Boutique" 
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Téléphone Contact</label>
                                <input 
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData(prev => ({...prev, phone: e.target.value}))}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                                    placeholder="+229 ..." 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Numéro WhatsApp</label>
                                <input 
                                    value={formData.whatsapp}
                                    onChange={e => setFormData(prev => ({...prev, whatsapp: e.target.value}))}
                                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                                    placeholder="+229 ..." 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Localisation & Adresse</label>
                            <AddressSelector 
                                onChange={handleAddressChange} 
                                initial={addressInitial}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Adresse précise (Ruelle, Immeuble...)</label>
                            <input 
                                required
                                value={formData.address_line}
                                onChange={e => setFormData(prev => ({...prev, address_line: e.target.value}))}
                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                                placeholder="Ex: Maison X, face à Y..." 
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-5 bg-primary text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                        >
                            {loading ? <span className="loading loading-spinner"></span> : initialData ? "Enregistrer les modifications" : "Confirmer l'ajout"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}