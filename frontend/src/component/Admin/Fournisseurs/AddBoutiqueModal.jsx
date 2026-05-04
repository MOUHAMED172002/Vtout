import React from 'react';
import { useForm } from 'react-hook-form';
import { X, Store, MapPin, Phone, MessageCircle, CreditCard, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import { useAuth } from '../../../lib/clerk-shim';

export default function AddBoutiqueModal({ supplier, onClose, onCreated }) {
    const { getToken } = useAuth();
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            phone: supplier?.phone || '',
            whatsapp: supplier?.whatsapp || '',
            momo_number: supplier?.momo_number || '',
            address_line: supplier?.address_line || '',
            departement_id: supplier?.departement_id || '',
            departement_label: supplier?.departement_label || '',
            commune_id: supplier?.commune_id || '',
            commune_label: supplier?.commune_label || '',
            quartier_id: supplier?.quartier_id || '',
            quartier_label: supplier?.quartier_label || ''
        }
    });

    const onSubmit = async (data) => {
        try {
            const token = await getToken();
            await api.post('/suppliers/boutiques-admin', {
                ...data,
                supplier_id: supplier.id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Boutique créée avec succès !');
            onCreated?.();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Erreur lors de la création');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
            >
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                            <Store size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Nouvelle Boutique</h2>
                            <p className="text-[10px] font-black uppercase text-slate-400">Pour: {supplier?.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nom de la boutique</label>
                        <input {...register('name', { required: true })} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold" placeholder="Ma Boutique #2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Téléphone</label>
                            <input {...register('phone')} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">WhatsApp</label>
                            <input {...register('whatsapp')} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Adresse / Localisation</label>
                        <div className="relative">
                            <MapPin className="absolute left-6 top-4 text-slate-300" size={18} />
                            <textarea {...register('address_line')} className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-bold resize-none" rows={2} />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest">Annuler</button>
                        <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-200 hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
                            <Save size={16} /> Créer la Boutique
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
