import React from 'react';
import { useForm } from 'react-hook-form';
import { X, Store, MapPin, Phone, MessageCircle, CreditCard, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import { useAuth } from '../../../lib/clerk-shim';

export default function AddBoutiqueModal({ supplier: initialSupplier, onClose, onCreated }) {
    const { getToken } = useAuth();
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplierId, setSelectedSupplierId] = useState(initialSupplier?.id || '');

    const { register, handleSubmit, formState: { errors }, setValue } = useForm({
        defaultValues: {
            name: '',
            phone: initialSupplier?.phone || '',
            whatsapp: initialSupplier?.whatsapp || '',
            momo_number: initialSupplier?.momo_number || '',
            address_line: initialSupplier?.address_line || '',
            departement_id: initialSupplier?.departement_id || '',
            departement_label: initialSupplier?.departement_label || '',
            commune_id: initialSupplier?.commune_id || '',
            commune_label: initialSupplier?.commune_label || '',
            quartier_id: initialSupplier?.quartier_id || '',
            quartier_label: initialSupplier?.quartier_label || ''
        }
    });

    useEffect(() => {
        if (!initialSupplier) {
            (async () => {
                try {
                    const token = await getToken();
                    const { data } = await api.get('/suppliers', { headers: { Authorization: `Bearer ${token}` } });
                    setSuppliers(data || []);
                } catch (e) { console.error(e); }
            })();
        }
    }, [initialSupplier]);

    const onSubmit = async (data) => {
        const supplierId = selectedSupplierId;
        if (!supplierId) return toast.error('Veuillez sélectionner un marchand');
        
        try {
            const token = await getToken();
            await api.post('/suppliers/boutiques-admin', {
                ...data,
                supplier_id: supplierId
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
                className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-100"
            >
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                            <Store size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Nouvelle Boutique</h2>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                {initialSupplier ? `Pour: ${initialSupplier.name}` : 'Assigner à un marchand'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    {!initialSupplier && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sélectionner le Marchand</label>
                            <select 
                                value={selectedSupplierId}
                                onChange={(e) => setSelectedSupplierId(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="">Choisir un marchand...</option>
                                {suppliers.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.phone})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nom de la boutique</label>
                        <input {...register('name', { required: true })} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Ex: Boutique Principale" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Téléphone Direct</label>
                            <input {...register('phone')} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lien WhatsApp</label>
                            <input {...register('whatsapp')} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Adresse Physique / Localisation</label>
                        <div className="relative">
                            <MapPin className="absolute left-6 top-5 text-slate-300" size={18} />
                            <textarea {...register('address_line')} className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-5 text-sm font-bold resize-none outline-none focus:ring-2 focus:ring-indigo-500/20" rows={2} placeholder="Indiquez l'emplacement précis..." />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-colors">Annuler</button>
                        <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-200 hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
                            <Save size={16} /> Enregistrer la Boutique
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

