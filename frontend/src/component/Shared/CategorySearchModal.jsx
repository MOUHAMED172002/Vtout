import React, { useState, useMemo } from 'react';
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

    const toggleExpand = (id, e) => {
        e.stopPropagation();
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
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer hover:bg-slate-50 group ${depth === 0 ? 'mt-2' : ''
                        }`}
                    onClick={() => onSelect(node)}
                >
                    <div style={{ paddingLeft: `${depth * 24}px` }} className="flex items-center gap-3 flex-1">
                        {hasChildren ? (
                            <button
                                onClick={(e) => toggleExpand(node.id, e)}
                                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"
                            >
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                        ) : (
                            <div className="w-6" />
                        )}

                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400 group-hover:bg-primary/5'
                            }`}>
                            {hasChildren ? (isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />) : <Tag size={16} />}
                        </div>

                        <div className="flex-1">
                            <span className={`text-sm font-bold tracking-tight transition-colors ${isExpanded ? 'text-slate-900 font-black' : 'text-slate-600'
                                }`}>
                                {node.name}
                            </span>
                            {node.parent_id && !searchTerm && (
                                <span className="ml-2 text-[8px] font-black uppercase tracking-widest text-slate-300">Sous-catégorie</span>
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

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white w-full max-w-2xl h-[80vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="p-8 border-b border-slate-50">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
                                <Sparkles size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tighter">Choisir une <span className="text-slate-300">Catégorie.</span></h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Navigation hiérarchique</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="relative group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher une catégorie..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-2xl pl-16 pr-6 py-4 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    {filteredTree.length > 0 ? (
                        filteredTree.map(root => renderNode(root))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-20">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                <Search size={32} className="text-slate-200" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900">Aucun résultat</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Essayez une autre recherche</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
                        Astuce : Sélectionnez la catégorie la plus précise possible
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
