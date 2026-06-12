import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
    X, Search, ChevronRight, ChevronDown, Check,
    Folder, FolderOpen, Tag, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CategorySearchModal({ categories, onSelect, onClose }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [expanded, setExpanded] = useState(new Set());

    // Build tree structure
    const tree = useMemo(() => {
        const map = {};
        const roots = [];
        categories.forEach(c => {
            map[c.id] = { ...c, children: [] };
        });
        categories.forEach(c => {
            if (c.parent_id && map[c.parent_id]) {
                map[c.parent_id].children.push(map[c.id]);
            } else if (!c.parent_id) {
                roots.push(map[c.id]);
            }
        });
        return roots;
    }, [categories]);

    // Hierarchical search
    const filteredTree = useMemo(() => {
        if (!searchTerm) return tree;

        const filterNode = (node) => {
            const matches = node.name.toLowerCase().includes(searchTerm.toLowerCase());
            const filteredChildren = node.children.map(filterNode).filter(Boolean);

            if (matches || filteredChildren.length > 0) {
                return { ...node, children: filteredChildren };
            }
            return null;
        };

        return tree.map(filterNode).filter(Boolean);
    }, [tree, searchTerm]);

    const toggleExpand = (id) => {
        const newExpanded = new Set(expanded);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setExpanded(newExpanded);
    };

    const renderNode = (node, depth = 0) => {
        const isExpanded = expanded.has(node.id) || searchTerm;
        const hasChildren = node.children && node.children.length > 0;

        return (
            <div key={node.id} className="select-none ">
                <motion.div
                    initial={false}
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer hover:bg-base-200 group ${depth === 0 ? 'mt-2' : ''
                        }`}
                    style={{ touchAction: 'manipulation' }}
                    onClick={() => hasChildren ? toggleExpand(node.id) : onSelect(node)}
                >
                    <div style={{ paddingLeft: `${depth * 24}px` }} className="flex items-center gap-3 flex-1">
                        {hasChildren ? (
                            <div className="w-6 h-6 flex items-center justify-center rounded-lg text-base-content/40">
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </div>
                        ) : (
                            <div className="w-6" />
                        )}

                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400 group-hover:bg-primary/5'
                            }`}>
                            {hasChildren ? (isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />) : <Tag size={16} />}
                        </div>

                        <div className="flex-1">
                            <span className={`text-sm font-bold tracking-tight transition-colors ${isExpanded ? 'text-base-content font-black' : 'text-base-content/70'
                                }`}>
                                {node.name}
                            </span>
                            {node.parent_id && !searchTerm && (
                                <span className="ml-2 text-[8px] font-black uppercase tracking-widest text-base-content/30">Sous-catégorie</span>
                            )}
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                <Check size={14} />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {hasChildren && isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {node.children.map(child => renderNode(child, depth + 1))}
                    </motion.div>
                )}
            </div>
        );
    };

    const modalContent = (
        <div className="category-modal-overlay fixed inset-0 z-[2000000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-2xl" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="bg-white w-full max-w-2xl h-[85vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden relative z-[2000001] border border-white/20"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-10 border-b border-slate-50 bg-gradient-to-b from-slate-50/50 to-transparent">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-primary rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-primary/30">
                                <Sparkles size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Choisir une <span className="text-slate-300">Catégorie.</span></h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mt-1">Précision Absolute</p>
                            </div>
                        </div>
                        <button 
                          onClick={onClose} 
                          className="w-12 h-12 rounded-2xl bg-slate-100/50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:rotate-90 transition-all duration-300"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="relative group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Quelle catégorie recherchez-vous ?"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-100/50 border-2 border-transparent rounded-[1.8rem] pl-16 pr-8 py-5 text-sm font-bold text-slate-700 focus:bg-white focus:border-primary/10 focus:ring-8 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white">
                    {filteredTree.length > 0 ? (
                        filteredTree.map(root => renderNode(root))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-6 py-20">
                            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 shadow-inner">
                                <Search size={40} />
                            </div>
                            <div>
                                <p className="text-lg font-black text-slate-900 tracking-tight">Aucun résultat trouvé</p>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 max-w-[200px] leading-relaxed">Nous n'avons pas trouvé de catégorie correspondant à votre recherche.</p>
                            </div>
                            <button onClick={() => setSearchTerm('')} className="text-primary font-black uppercase text-[10px] tracking-widest hover:underline">Réinitialiser la recherche</button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
                        Une sélection méticuleuse pour votre confort
                    </p>
                </div>
            </motion.div>
        </div>
    );

    const portalTarget = document.getElementById('modal-root');
    if (!portalTarget) return null;

    return createPortal(modalContent, portalTarget);
}
