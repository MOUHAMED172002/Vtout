import React, { useEffect, useState } from 'react';
import { getPoliciesByType } from '../services/contentService';
import { FileText, ShieldCheck, ChevronRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const SupplierPolicies = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const data = await getPoliciesByType('supplier');
                setPolicies(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPolicies();
    }, []);

    if (loading) return <div className="p-20 text-center animate-pulse font-black text-slate-300">CHARGEMENT DES DOCUMENTS...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 space-y-12">
            <div className="max-w-4xl">
                <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2 flex items-center gap-4">
                    <FileText className="text-indigo-500" size={32} /> Conditions & Politiques
                </h1>
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Règlements officiels pour les partenaires Vtout</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {policies.length === 0 ? (
                    <div className="bg-white p-20 rounded-[3rem] text-center border border-slate-100 shadow-xl space-y-4">
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
                            <ShieldCheck size={32} />
                        </div>
                        <p className="text-sm font-bold text-slate-400">Aucun document n'a encore été publié pour les fournisseurs.</p>
                    </div>
                ) : (
                    policies.map((p, idx) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-10 space-y-6 overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50/50 rounded-full blur-3xl -mr-20 -mt-20"></div>

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                                    <ShieldCheck size={20} />
                                </div>
                                <h3 className="text-xl font-black tracking-tighter text-slate-900">{p.title}</h3>
                            </div>

                            <div className="prose prose-slate max-w-none relative z-10">
                                <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                                    {p.content}
                                </p>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    <Clock size={12} /> Dernière mise à jour: {new Date(p.updatedAt).toLocaleDateString()}
                                </div>
                                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Document Officiel</span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SupplierPolicies;
