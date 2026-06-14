import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, User, Phone, MessageCircle, CreditCard, Save, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import { useAuth } from "../../../lib/AuthHooks";
import { getHierarchy } from '../../../services/locationService';

export default function AddSupplierModal({ onClose, onCreated }) {
    const { getToken } = useAuth();
    const [hierarchy, setHierarchy] = useState([]);
    const [communes, setCommunes] = useState([]);
    const [quartiers, setQuartiers] = useState([]);

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
        defaultValues: {
            name: '',
            phone: '',
            whatsapp: '',
            momo_number: '',
            address_line: '',
            status: 'active'
        }
    });

    useEffect(() => {
        (async () => {
            try {
                const data = await getHierarchy();
                setHierarchy(data || []);
            } catch (e) { console.error(e); }
        })();
    }, []);

    const selectedDeptId = watch('departement_id');
    const selectedCommuneId = watch('commune_id');

    useEffect(() => {
        if (selectedDeptId) {
            const dept = hierarchy.find(d => d.id === parseInt(selectedDeptId));
            setCommunes(dept?.communes || []);
            setValue('departement_label', dept?.name || '');
        } else {
            setCommunes([]);
        }
    }, [selectedDeptId, hierarchy]);

    useEffect(() => {
        if (selectedCommuneId) {
            const com = communes.find(c => c.id === parseInt(selectedCommuneId));
            setQuartiers(com?.arrondissements?.flatMap(a => a.quartiers) || []);
            setValue('commune_label', com?.name || '');
        } else {
            setQuartiers([]);
        }
    }, [selectedCommuneId, communes]);

    const handleQuartierChange = (id) => {
        const q = quartiers.find(qt => qt.id === parseInt(id));
        setValue('quartier_label', q?.name || '');
    };

    const onSubmit = async (data) => {
        try {
            const token = await getToken();
            await api.post('/suppliers', data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Marchand créé avec succès !');
            onCreated?.();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Erreur lors de la création');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-base-100 w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-base-200"
            >
                <div className="p-8 border-b border-base-200 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                            <User size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-base-content tracking-tight">Nouveau Marchand</h2>
                            <p className="text-[10px] font-black uppercase text-base-content/40 tracking-widest">Créer un compte partenaire ou votre propre profil vendeur</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl bg-base-200 text-base-content/40 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-base-content/40">Nom Complet / Raison Sociale</label>
                        <input {...register('name', { required: true })} className="w-full bg-base-200 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Ex: Vtout Officiel ou Nom du Partenaire" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-base-content/40">Téléphone de Gestion</label>
                            <input type="tel" {...register('phone', { required: true })} className="w-full bg-base-200 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="+229 00 00 00 00" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-base-content/40">WhatsApp</label>
                            <input type="tel" {...register('whatsapp')} className="w-full bg-base-200 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="+229 00 00 00 00" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-base-content/40">Numéro MoMo (pour les retraits)</label>
                        <div className="relative">
                            <CreditCard className="absolute left-6 top-4 text-base-content/30" size={18} />
                            <input {...register('momo_number')} className="w-full bg-base-200 border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="01XXXXXXXX" />
                        </div>
                    </div>

                    {/* Zone Géographique */}
                    <div className="space-y-4 pt-4 border-t border-base-200">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Siège Social / Zone Principale</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-base-content/40">Département</label>
                                <select {...register('departement_id', { required: true })} className="w-full bg-base-200 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20">
                                    <option value="">Département</option>
                                    {hierarchy.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-base-content/40">Commune</label>
                                <select {...register('commune_id', { required: true })} className="w-full bg-base-200 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20">
                                    <option value="">Commune</option>
                                    {communes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-base-content/40">Quartier</label>
                                <select 
                                    {...register('quartier_id', { required: true })} 
                                    onChange={(e) => {
                                        register('quartier_id').onChange(e);
                                        handleQuartierChange(e.target.value);
                                    }}
                                    className="w-full bg-base-200 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="">Quartier</option>
                                    {quartiers.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-base-content/40">Adresse Siège</label>
                        <div className="relative">
                            <MapPin className="absolute left-6 top-5 text-base-content/30" size={18} />
                            <textarea {...register('address_line', { required: true })} className="w-full bg-base-200 border-none rounded-2xl pl-14 pr-6 py-5 text-sm font-bold resize-none outline-none focus:ring-2 focus:ring-indigo-500/20" rows={2} placeholder="Indiquez l'emplacement du siège..." />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-base-200 flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-base-200 text-base-content/40 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-base-200 transition-colors">Annuler</button>
                        <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-200 hover:bg-neutral transition-all flex items-center justify-center gap-2">
                            <Save size={16} /> Créer le Marchand
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
