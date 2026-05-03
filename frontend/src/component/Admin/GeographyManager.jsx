import React, { useState, useEffect } from 'react';
import { getHierarchy, upsertLocation, deleteLocation } from '../../services/locationService';
import {
    MapPin, Plus, Edit, Trash2, ChevronDown, Globe,
    Search, Loader2, CheckCircle2, XCircle, Building2, Home, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const TYPE_LABELS = {
    department: 'Département',
    commune: 'Commune',
    arrondissement: 'Arrondissement',
    quartier: 'Quartier',
};

const GeographyManager = () => {
    const [hierarchy, setHierarchy] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedDeps, setExpandedDeps] = useState(new Set());
    const [expandedComs, setExpandedComs] = useState(new Set());
    const [expandedArronds, setExpandedArronds] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [targetItem, setTargetItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', id: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { fetchHierarchy(); }, []);

    const fetchHierarchy = async () => {
        try {
            setLoading(true);
            const data = await getHierarchy();
            setHierarchy(data);
        } catch {
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
        setSubmitting(true);
        try {
            const payload = { type: targetItem.type, parentId: targetItem.parentId, name: formData.name };
            if (formData.id) payload.id = formData.id;
            await upsertLocation(payload);
            toast.success("Enregistré avec succès");
            setShowModal(false);
            fetchHierarchy();
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (type, id, e) => {
        e?.stopPropagation();
        if (!window.confirm("Confirmer la suppression ?")) return;
        try {
            await deleteLocation(type, id);
            toast.success("Supprimé avec succès");
            fetchHierarchy();
        } catch {
            toast.error("Erreur lors de la suppression");
        }
    };

    const openEditModal = (type, parentId, item, e) => {
        e?.stopPropagation();
        setModalMode('edit');
        setTargetItem({ type, parentId, item });
        setFormData({ name: item.name, id: item.id });
        setShowModal(true);
    };

    const openAddModal = (type, parentId, e) => {
        e?.stopPropagation();
        setModalMode('add');
        setTargetItem({ type, parentId });
        setFormData({ name: '', id: '' });
        setShowModal(true);
    };

    // Simple search filter
    const filteredHierarchy = searchQuery.trim()
        ? hierarchy.filter(dep =>
            dep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dep.communes?.some(c =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.arrondissements?.some(a =>
                    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    a.quartiers?.some(q => q.name.toLowerCase().includes(searchQuery.toLowerCase()))
                )
            )
        )
        : hierarchy;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-slate-500 font-semibold text-sm">Chargement...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-24">

            {/* ─── HEADER ──────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                {/* Title row */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <h1 className="text-base font-black text-slate-800 leading-none">Géographie</h1>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Découpage territorial du Bénin</p>
                    </div>
                </div>

                {/* Search bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Rechercher une zone..."
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 border border-slate-100"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Add department button — full width, separate row */}
                <button
                    onClick={(e) => openAddModal('department', null, e)}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-indigo-700 active:scale-95 transition-all"
                >
                    <Plus size={16} />
                    Nouveau Département
                </button>
            </div>

            {/* ─── HIERARCHY ───────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-50 bg-slate-50">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Globe size={12} /> Hiérarchie Territoriale · {filteredHierarchy.length} département{filteredHierarchy.length > 1 ? 's' : ''}
                    </div>
                </div>

                <div className="divide-y divide-slate-50">
                    {filteredHierarchy.length === 0 && (
                        <div className="py-12 text-center text-slate-400 text-sm font-medium">
                            Aucun résultat pour « {searchQuery} »
                        </div>
                    )}

                    {filteredHierarchy.map(dep => (
                        <div key={dep.id}>
                            {/* ── DEPARTMENT ROW ── */}
                            <div
                                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                                onClick={() => toggle(dep.id, expandedDeps, setExpandedDeps)}
                            >
                                {/* Chevron */}
                                <ChevronDown
                                    size={16}
                                    className={`text-slate-400 shrink-0 transition-transform duration-200 ${expandedDeps.has(dep.id) ? 'rotate-0' : '-rotate-90'}`}
                                />
                                {/* Icon */}
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${expandedDeps.has(dep.id) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    <Building2 size={14} />
                                </div>
                                {/* Name + Badge */}
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{dep.name}</span>
                                    <span className="ml-2 text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                                        {dep.communes?.length || 0}
                                    </span>
                                </div>
                                {/* Actions */}
                                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={e => openAddModal('commune', dep.id, e)}
                                        className="w-7 h-7 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-lg"
                                        title="Ajouter commune"
                                    >
                                        <Plus size={13} />
                                    </button>
                                    <button
                                        onClick={e => openEditModal('department', null, dep, e)}
                                        className="w-7 h-7 flex items-center justify-center bg-blue-50 text-blue-500 rounded-lg"
                                    >
                                        <Edit size={12} />
                                    </button>
                                    <button
                                        onClick={e => handleDelete('department', dep.id, e)}
                                        className="w-7 h-7 flex items-center justify-center bg-red-50 text-red-500 rounded-lg"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>

                            {/* ── COMMUNES ── */}
                            <AnimatePresence>
                                {expandedDeps.has(dep.id) && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="border-t border-slate-50 divide-y divide-slate-50/80">
                                            {dep.communes?.length === 0 && (
                                                <div className="pl-14 pr-4 py-2 text-xs text-slate-400 italic">Aucune commune</div>
                                            )}
                                            {dep.communes?.map(com => (
                                                <div key={com.id} className="bg-slate-50/50">
                                                    {/* Commune row */}
                                                    <div
                                                        className="flex items-center gap-3 pl-10 pr-4 py-2.5 cursor-pointer hover:bg-slate-100/50 transition-colors"
                                                        onClick={() => toggle(com.id, expandedComs, setExpandedComs)}
                                                    >
                                                        <ChevronDown
                                                            size={14}
                                                            className={`text-slate-300 shrink-0 transition-transform duration-200 ${expandedComs.has(com.id) ? 'rotate-0' : '-rotate-90'}`}
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-xs font-bold text-slate-600">{com.name}</span>
                                                            <span className="ml-2 text-[9px] font-bold text-slate-400 bg-white px-1 py-0.5 rounded-full border border-slate-100">
                                                                {com.arrondissements?.length || 0}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                                            <button
                                                                onClick={e => openAddModal('arrondissement', com.id, e)}
                                                                className="w-6 h-6 flex items-center justify-center bg-slate-200 text-slate-500 rounded-md"
                                                            >
                                                                <Plus size={11} />
                                                            </button>
                                                            <button
                                                                onClick={e => openEditModal('commune', dep.id, com, e)}
                                                                className="w-6 h-6 flex items-center justify-center bg-blue-50 text-blue-400 rounded-md"
                                                            >
                                                                <Edit size={10} />
                                                            </button>
                                                            <button
                                                                onClick={e => handleDelete('commune', com.id, e)}
                                                                className="w-6 h-6 flex items-center justify-center bg-red-50 text-red-400 rounded-md"
                                                            >
                                                                <Trash2 size={10} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Arrondissements */}
                                                    <AnimatePresence>
                                                        {expandedComs.has(com.id) && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.15 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="border-t border-slate-100 divide-y divide-slate-100">
                                                                    {com.arrondissements?.map(arr => (
                                                                        <div key={arr.id} className="bg-white">
                                                                            {/* Arrondissement row */}
                                                                            <div
                                                                                className="flex items-center gap-2 pl-16 pr-4 py-2 cursor-pointer hover:bg-slate-50 transition-colors"
                                                                                onClick={() => toggle(arr.id, expandedArronds, setExpandedArronds)}
                                                                            >
                                                                                <ChevronDown
                                                                                    size={12}
                                                                                    className={`text-slate-300 shrink-0 transition-transform duration-200 ${expandedArronds.has(arr.id) ? 'rotate-0' : '-rotate-90'}`}
                                                                                />
                                                                                <div className="flex-1 min-w-0">
                                                                                    <span className="text-[11px] font-semibold text-slate-500">{arr.name}</span>
                                                                                    <span className="ml-2 text-[8px] font-bold text-slate-400">
                                                                                        {arr.quartiers?.length || 0} quartier{(arr.quartiers?.length || 0) > 1 ? 's' : ''}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                                                                    <button
                                                                                        onClick={e => openAddModal('quartier', arr.id, e)}
                                                                                        className="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-500 rounded-md"
                                                                                    >
                                                                                        <Plus size={10} />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={e => openEditModal('arrondissement', com.id, arr, e)}
                                                                                        className="w-6 h-6 flex items-center justify-center bg-blue-50 text-blue-400 rounded-md"
                                                                                    >
                                                                                        <Edit size={9} />
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={e => handleDelete('arrondissement', arr.id, e)}
                                                                                        className="w-6 h-6 flex items-center justify-center bg-red-50 text-red-400 rounded-md"
                                                                                    >
                                                                                        <Trash2 size={9} />
                                                                                    </button>
                                                                                </div>
                                                                            </div>

                                                                            {/* Quartiers grid */}
                                                                            <AnimatePresence>
                                                                                {expandedArronds.has(arr.id) && (
                                                                                    <motion.div
                                                                                        initial={{ height: 0, opacity: 0 }}
                                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                                        exit={{ height: 0, opacity: 0 }}
                                                                                        transition={{ duration: 0.15 }}
                                                                                        className="overflow-hidden"
                                                                                    >
                                                                                        <div className="pl-20 pr-4 py-2 pb-3 grid grid-cols-2 gap-1.5">
                                                                                            {arr.quartiers?.map(q => (
                                                                                                <div
                                                                                                    key={q.id}
                                                                                                    className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 min-w-0"
                                                                                                >
                                                                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                                                                        <Home size={9} className="text-slate-300 shrink-0" />
                                                                                                        <span className="text-[10px] font-medium text-slate-600 truncate">{q.name}</span>
                                                                                                    </div>
                                                                                                    <div className="flex gap-0.5 ml-1 shrink-0">
                                                                                                        <button
                                                                                                            onClick={e => openEditModal('quartier', arr.id, q, e)}
                                                                                                            className="p-1 text-blue-400 hover:text-blue-600"
                                                                                                        >
                                                                                                            <Edit size={9} />
                                                                                                        </button>
                                                                                                        <button
                                                                                                            onClick={e => handleDelete('quartier', q.id, e)}
                                                                                                            className="p-1 text-red-400 hover:text-red-600"
                                                                                                        >
                                                                                                            <Trash2 size={9} />
                                                                                                        </button>
                                                                                                    </div>
                                                                                                </div>
                                                                                            ))}
                                                                                            <button
                                                                                                onClick={e => openAddModal('quartier', arr.id, e)}
                                                                                                className="flex items-center justify-center gap-1 border border-dashed border-slate-200 rounded-lg py-2 text-[9px] font-bold text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors col-span-1"
                                                                                            >
                                                                                                <Plus size={9} /> Quartier
                                                                                            </button>
                                                                                        </div>
                                                                                    </motion.div>
                                                                                )}
                                                                            </AnimatePresence>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── MODAL ───────────────────────────────────────────── */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        />

                        {/* Sheet — slides up from bottom on mobile, centered on desktop */}
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
                        >
                            {/* Handle bar — mobile only */}
                            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 sm:hidden" />

                            <div className="p-6 space-y-5">
                                {/* Modal header */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-black text-slate-800">
                                            {modalMode === 'add' ? `Ajouter` : `Modifier`}{' '}
                                            <span className="text-indigo-600">{TYPE_LABELS[targetItem?.type]}</span>
                                        </h2>
                                        {targetItem?.parentId && (
                                            <p className="text-xs text-slate-400 font-medium mt-0.5">Parent ID : {targetItem.parentId}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="w-9 h-9 flex items-center justify-center bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleUpsert} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                                            Nom *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            autoFocus
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                                            placeholder={`Nom du ${TYPE_LABELS[targetItem?.type] || ''}...`}
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                                            Identifiant <span className="normal-case text-slate-300">(optionnel, auto si vide)</span>
                                        </label>
                                        <input
                                            type="number"
                                            disabled={modalMode === 'edit'}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:opacity-40 transition-all"
                                            placeholder="Auto-généré"
                                            value={formData.id}
                                            onChange={e => setFormData({ ...formData, id: e.target.value })}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        {submitting ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <CheckCircle2 size={18} />
                                        )}
                                        {modalMode === 'add' ? 'Créer' : 'Enregistrer'}
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
