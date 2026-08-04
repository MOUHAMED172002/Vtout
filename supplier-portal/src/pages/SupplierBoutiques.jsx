import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/clerk-shim';
import { getMyBoutiques } from '../services/supplierService';
import { Store, Plus, MapPin, Phone, MessageCircle, Edit, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BoutiqueModal from '../components/BoutiqueModal';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const SupplierBoutiques = ({ globalSearchQuery }) => {
    const [boutiques, setBoutiques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBoutique, setSelectedBoutique] = useState(null);
    const { getToken } = useAuth();

    const searchQuery = globalSearchQuery || "";

    const filteredBoutiques = boutiques.filter(b => 
        b.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const fetchBoutiques = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const data = await getMyBoutiques(token);
            setBoutiques(data || []);
        } catch (error) {
            console.error('Erreur chargement boutiques:', error);
            toast.error("Impossible de charger vos boutiques");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoutiques();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer cette boutique ? Cette action est irréversible.')) return;
        try {
            const token = await getToken();
            await axios.delete(`${API_URL}/suppliers/me/boutiques/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Boutique supprimée");
            fetchBoutiques();
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const isComplete = (b) => {
        return b.name && b.phone && b.address_line && b.departement_id && b.commune_id && b.quartier_id;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-12 space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-base-content mb-2">Mes Boutiques</h1>
                    <p className="text-base-content/50 font-bold uppercase tracking-[0.2em] text-[10px]">Gérez vos points de vente et leurs localisations</p>
                </div>
                <button 
                    onClick={() => { setSelectedBoutique(null); setIsModalOpen(true); }}
                    className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl hover:brightness-90 transition-all shadow-xl shadow-primary/20 text-[11px] font-black uppercase tracking-widest"
                >
                    <Plus size={18} /> Ajouter une Boutique
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredBoutiques.length > 0 ? (
                    filteredBoutiques.map((boutique) => (
                        <motion.div 
                            key={boutique.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-base-100 rounded-[2.5rem] border border-base-300 shadow-xl shadow-base-300/50 overflow-hidden flex flex-col group"
                        >
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-neutral text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <Store size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-base-content">{boutique.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                {isComplete(boutique) ? (
                                                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                                                        <CheckCircle size={10} /> Profil Complet
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-500">
                                                        <AlertCircle size={10} /> Informations manquantes
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => { setSelectedBoutique(boutique); setIsModalOpen(true); }}
                                            className="w-10 h-10 rounded-xl bg-base-200 text-base-content/40 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center border border-base-300"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(boutique.id)}
                                            className="w-10 h-10 rounded-xl bg-rose-50 text-rose-300 hover:text-rose-500 hover:bg-rose-100 transition-all flex items-center justify-center border border-rose-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center text-base-content/40 shrink-0">
                                                <MapPin size={16} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest">Localisation</p>
                                                <p className="text-xs font-bold text-base-content leading-snug">
                                                    {boutique.quartier_label}, {boutique.commune_label}<br/>
                                                    <span className="text-base-content/40">{boutique.departement_label}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center text-base-content/40 shrink-0">
                                                <AlertCircle size={16} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest">Adresse précise</p>
                                                <p className="text-xs font-bold text-base-content leading-snug">
                                                    {boutique.address_line || "Non renseignée"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-base-200 flex items-center justify-center text-base-content/40 shrink-0">
                                                <Phone size={16} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest">Contact</p>
                                                <p className="text-xs font-bold text-base-content">{boutique.phone || "Non renseigné"}</p>
                                            </div>
                                        </div>
                                        {boutique.whatsapp && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                                                    <MessageCircle size={16} />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">WhatsApp</p>
                                                    <p className="text-xs font-bold text-base-content">{boutique.whatsapp}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="lg:col-span-2 py-20 bg-base-200 rounded-[3rem] border-2 border-dashed border-base-300 flex flex-col items-center justify-center gap-6 text-base-content/30">
                        <Store size={64} strokeWidth={1} />
                        <div className="text-center space-y-2">
                            <p className="font-black text-base-content/40 uppercase tracking-widest">Aucune boutique pour le moment</p>
                            <button onClick={() => setIsModalOpen(true)} className="text-primary text-xs font-black hover:underline uppercase tracking-widest">Créer ma première boutique</button>
                        </div>
                    </div>
                )}
            </div>

            <BoutiqueModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={fetchBoutiques}
                initialData={selectedBoutique}
            />
        </div>
    );
};

export default SupplierBoutiques;
