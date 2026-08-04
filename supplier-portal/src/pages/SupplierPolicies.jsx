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

    if (loading) return <div className="p-20 text-center animate-pulse font-black text-base-content/30">CHARGEMENT DES DOCUMENTS...</div>;

    return (
        <div className="min-h-screen bg-base-200 p-6 md:p-12 space-y-12">
            <div className="max-w-4xl">
                <h1 className="text-4xl font-black tracking-tighter text-base-content mb-2 flex items-center gap-4">
                    <FileText className="text-primary" size={32} /> Conditions & Politiques
                </h1>
                <p className="text-base-content/50 font-bold uppercase tracking-[0.2em] text-[10px]">Règlements officiels pour les marchands Vtout</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {policies.length === 0 ? (
                    <div className="bg-base-100 p-20 rounded-[3rem] text-center border border-base-300 shadow-xl space-y-4">
                        <div className="w-16 h-16 bg-base-200 text-base-content/30 rounded-full flex items-center justify-center mx-auto">
                            <ShieldCheck size={32} />
                        </div>
                        <p className="text-sm font-bold text-base-content/40">Aucun document n'a encore été publié pour les marchands.</p>
                    </div>
                ) : (
                    policies.map((p, idx) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-base-100 rounded-[3rem] border border-base-300 shadow-xl shadow-base-300/50 p-10 space-y-6 overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/50 rounded-full blur-3xl -mr-20 -mt-20"></div>

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                    <ShieldCheck size={20} />
                                </div>
                                <h3 className="text-xl font-black tracking-tighter text-base-content">{p.title}</h3>
                            </div>

                            <div className="prose prose-slate max-w-none relative z-10">
                                <p className="text-base-content/70 font-medium leading-relaxed whitespace-pre-wrap">
                                    {p.content}
                                </p>
                            </div>

                            <div className="pt-6 border-t border-base-200 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-base-content/40 tracking-widest">
                                    <Clock size={12} /> Dernière mise à jour: {new Date(p.updatedAt).toLocaleDateString()}
                                </div>
                                <span className="text-[10px] font-black uppercase text-primary tracking-widest">Document Officiel</span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SupplierPolicies;
