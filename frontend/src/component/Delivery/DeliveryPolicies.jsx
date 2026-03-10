import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL;

const DeliveryPolicies = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const res = await axios.get(`${API_URL}/policies/type/delivery`);
                setPolicies(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPolicies();
    }, []);

    if (loading) return <div className="p-20 text-center animate-pulse font-black text-slate-300">CHARGEMENT...</div>;

    return (
        <div className="min-h-screen bg-white p-6 md:p-12 space-y-12">
            <div className="max-w-4xl">
                <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2 flex items-center gap-4">
                    <FileText className="text-amber-500" size={32} /> Charte du Livreur
                </h1>
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Règlements & Bonnes pratiques pour les livreurs partenaires</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {policies.length === 0 ? (
                    <div className="bg-slate-50 p-20 rounded-[3rem] text-center border border-slate-100 shadow-xl space-y-4">
                        <div className="w-16 h-16 bg-white text-slate-300 rounded-full flex items-center justify-center mx-auto">
                            <ShieldCheck size={32} />
                        </div>
                        <p className="text-sm font-bold text-slate-400">Aucun document n'a été publié pour l'instant.</p>
                    </div>
                ) : (
                    policies.map((p, idx) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-slate-50 rounded-[3rem] border border-slate-100 p-10 space-y-6"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                                    <ShieldCheck size={20} />
                                </div>
                                <h3 className="text-xl font-black tracking-tighter text-slate-900">{p.title}</h3>
                            </div>
                            <div className="prose prose-slate max-w-none">
                                <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{p.content}</p>
                            </div>
                            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                    <Clock size={12} /> Mise à jour: {new Date(p.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DeliveryPolicies;
