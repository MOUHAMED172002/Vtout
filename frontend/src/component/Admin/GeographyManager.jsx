import React, { useState, useEffect } from 'react';
import { getHierarchy, upsertLocation, deleteLocation } from '../../services/locationService';
import { 
    MapPin, 
    Plus, 
    Edit, 
    Trash2, 
    ChevronRight, 
    ChevronDown, 
    Globe,
    Search,
    Loader2,
    CheckCircle2,
    XCircle,
    Building2,
    Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const GeographyManager = () => {
    const [hierarchy, setHierarchy] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedDeps, setExpandedDeps] = useState(new Set());
    const [expandedComs, setExpandedComs] = useState(new Set());
    const [expandedArronds, setExpandedArronds] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [targetItem, setTargetItem] = useState(null); // { type, parentId, item }
    const [formData, setFormData] = useState({ name: '', id: '' });

    useEffect(() => {
        fetchHierarchy();
    }, []);

    const fetchHierarchy = async () => {
        try {
            setLoading(true);
            const data = await getHierarchy();
            setHierarchy(data);
        } catch (error) {
            toast.error("Erreur lors du chargement des données géographiques");
        } finally {
            setLoading(false);
        }
    };

    const toggle = (id, set, updateSet) => {
        const newSet = new Set(set);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        updateSet(newSet);
    };

    const handleUpsert = async (e) => {
        e.preventDefault();
        try {
            await upsertLocation({
                type: targetItem.type,
                parentId: targetItem.parentId,
                name: formData.name,
                id: formData.id
            });
            toast.success("Enregistré avec succès");
            setShowModal(false);
            fetchHierarchy();
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
        }
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;
        try {
            await deleteLocation(type, id);
            toast.success("Supprimé avec succès");
            fetchHierarchy();
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const openEditModal = (type, parentId, item) => {
        setModalMode('edit');
        setTargetItem({ type, parentId, item });
        setFormData({ name: item.name, id: item.id });
        setShowModal(true);
    };

    const openAddModal = (type, parentId) => {
        setModalMode('add');
        // Generate a temporary ID or let the user provide one? 
        // For import compatibility, let's let the user provide ID
        setTargetItem({ type, parentId });
        setFormData({ name: '', id: '' });
        setShowModal(true);
    };

    const ActionButtons = ({ type, id, item, parentId }) => (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
                onClick={(e) => { e.stopPropagation(); openEditModal(type, parentId, item); }}
                className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                title="Modifier"
            >
                <Edit size={14} />
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(type, id); }}
                className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                title="Supprimer"
            >
                <Trash2 size={14} />
            </button>
        </div>
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-slate-500 font-bold">Chargement du découpage territorial...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                        <MapPin size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gestion Géographique</h1>
                        <p className="text-sm font-bold text-slate-400">Gérez les départements, communes et quartiers du Bénin</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Rechercher une ville..."
                            className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 w-64 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => openAddModal('department')}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus size={18} />
                        Département
                    </button>
                </div>
            </header>

            {/* Hierarchy View */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                        <Globe size={14} /> Hiérarchie Territoriale
                    </div>
                </div>

                <div className="p-8 space-y-4 max-h-[1000px] overflow-y-auto custom-scrollbar">
                    {hierarchy.map(dep => (
                        <div key={dep.id} className="group">
                            <div 
                                onClick={() => toggle(dep.id, expandedDeps, setExpandedDeps)}
                                className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all ${expandedDeps.has(dep.id) ? 'bg-indigo-50 border-indigo-100 shadow-sm' : 'hover:bg-slate-50 border-transparent'} border`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`transition-transform duration-200 ${expandedDeps.has(dep.id) ? 'rotate-90' : ''}`}>
                                        <ChevronRight size={18} className="text-slate-400" />
                                    </div>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${expandedDeps.has(dep.id) ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}>
                                        <Building2 size={18} />
                                    </div>
                                    <span className={`text-sm font-black uppercase tracking-tight ${expandedDeps.has(dep.id) ? 'text-indigo-900' : 'text-slate-700'}`}>
                                        {dep.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-black px-2 py-1 bg-white/50 rounded-full text-slate-400 border border-slate-100">
                                        {dep.communes?.length || 0} communes
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); openAddModal('commune', dep.id); }}
                                            className="p-1.5 hover:bg-indigo-200 text-indigo-600 rounded-lg transition-colors"
                                            title="Ajouter une commune"
                                        >
                                            <Plus size={14} />
                                        </button>
                                        <ActionButtons type="department" id={dep.id} item={dep} />
                                    </div>
                                </div>
                            </div>

                            {/* Communes Level */}
                            <AnimatePresence>
                                {expandedDeps.has(dep.id) && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="ml-12 mt-2 space-y-2 border-l-2 border-slate-100 pl-4"
                                    >
                                        {dep.communes?.map(com => (
                                            <div key={com.id} className="group/com">
                                                <div 
                                                    onClick={() => toggle(com.id, expandedComs, setExpandedComs)}
                                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-all"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`transition-transform duration-200 ${expandedComs.has(com.id) ? 'rotate-90' : ''}`}>
                                                            <ChevronRight size={16} className="text-slate-300" />
                                                        </div>
                                                        <span className="text-xs font-black text-slate-600 italic">
                                                            {com.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-bold text-slate-400">
                                                            {com.arrondissements?.length || 0} arronds.
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); openAddModal('arrondissement', com.id); }}
                                                                className="p-1 text-slate-400 hover:text-primary transition-colors"
                                                            >
                                                                <Plus size={12} />
                                                            </button>
                                                            <ActionButtons type="commune" id={com.id} item={com} parentId={dep.id} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Arrondissements Level */}
                                                {expandedComs.has(com.id) && (
                                                    <div className="ml-10 mt-1 space-y-1 border-l-2 border-slate-50 pl-3">
                                                        {com.arrondissements?.map(arr => (
                                                            <div key={arr.id} className="group/arr">
                                                                <div 
                                                                    onClick={() => toggle(arr.id, expandedArronds, setExpandedArronds)}
                                                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-[11px]"
                                                                >
                                                                    <div className="flex items-center gap-2 text-slate-500 font-bold">
                                                                        <ChevronRight size={14} className={expandedArronds.has(arr.id) ? 'rotate-90  text-primary' : ''} />
                                                                        {arr.name}
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <button 
                                                                            onClick={(e) => { e.stopPropagation(); openAddModal('quartier', arr.id); }}
                                                                            className="p-1 text-slate-300 hover:text-primary"
                                                                        >
                                                                            <Plus size={10} />
                                                                        </button>
                                                                        <ActionButtons type="arrondissement" id={arr.id} item={arr} parentId={com.id} />
                                                                    </div>
                                                                </div>

                                                                {/* Quartiers Level */}
                                                                {expandedArronds.has(arr.id) && (
                                                                    <div className="ml-8 mt-1 grid grid-cols-2 md:grid-cols-3 gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100/50">
                                                                        {arr.quartiers?.map(q => (
                                                                            <div key={q.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-100 group/q hover:shadow-sm transition-all">
                                                                                <div className="flex items-center gap-2 truncate">
                                                                                    <Home size={10} className="text-slate-300" />
                                                                                    <span className="text-[10px] font-bold text-slate-600 truncate">{q.name}</span>
                                                                                </div>
                                                                                <div className="flex gap-1 opacity-0 group-hover/q:opacity-100">
                                                                                    <button onClick={() => openEditModal('quartier', arr.id, q)} className="text-blue-400 hover:text-blue-600"><Edit size={10} /></button>
                                                                                    <button onClick={() => handleDelete('quartier', q.id)} className="text-red-400 hover:text-red-600"><Trash2 size={10} /></button>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                        <button 
                                                                            onClick={() => openAddModal('quartier', arr.id)}
                                                                            className="flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg py-2 hover:border-primary hover:text-primary transition-all text-[10px] font-black"
                                                                        >
                                                                            <Plus size={10} /> Ajouter un quartier
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upsert Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                            {modalMode === 'add' ? 'Ajouter un' : 'Modifier le'} {targetItem?.type}
                                        </h2>
                                        <p className="text-sm font-bold text-slate-400 mt-1">Saisissez les informations détaillées ci-dessous</p>
                                    </div>
                                    <button onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors">
                                        <XCircle size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleUpsert} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-4">Identifiant (Optionnel)</label>
                                        <input 
                                            type="number"
                                            disabled={modalMode === 'edit'}
                                            className="w-full px-8 py-4 bg-slate-50 border-none rounded-3xl text-sm font-black text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner disabled:opacity-50"
                                            placeholder="Généré automatiquement si vide"
                                            value={formData.id}
                                            onChange={e => setFormData({ ...formData, id: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-4">Nom de l'entité</label>
                                        <input 
                                            type="text"
                                            required
                                            autoFocus
                                            className="w-full px-8 py-4 bg-slate-50 border-none rounded-3xl text-sm font-black text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                                            placeholder={`Nom du ${targetItem?.type}...`}
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200">
                                        <p className="text-xs text-slate-500 font-bold leading-relaxed">
                                            L'enregistrement sera effectué dans la catégorie <span className="text-primary uppercase">{targetItem?.type}</span>. 
                                            {targetItem?.parentId && ` Sous-catégorie de l'ID parent: ${targetItem.parentId}.`}
                                        </p>
                                    </div>

                                    <button 
                                        type="submit"
                                        className="w-full py-5 bg-primary text-white rounded-3xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <CheckCircle2 size={24} />
                                        {modalMode === 'add' ? 'Créer maintenant' : 'Enregistrer les modifications'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GeographyManager;
