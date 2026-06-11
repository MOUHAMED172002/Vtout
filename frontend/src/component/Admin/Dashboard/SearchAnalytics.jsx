import React, { useEffect, useState } from "react";
import { useAuth } from "../../../lib/AuthHooks";
import api from "../../../services/api";
import { Search, Clock, User, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchAnalytics() {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [searches, setSearches] = useState([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = await getToken();
                const { data } = await api.get("/stats/search-analytics", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSearches(data || []);
            } catch (err) {
                console.error("Error fetching search analytics:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [getToken]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-[0.3em]">
                        <Search size={14} /> Analytics
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Recherches <span className="text-base-content/40">Infructueuses</span></h1>
                    <p className="text-base-content/50 font-bold max-w-lg">Identifiez les manques de votre catalogue en observant ce que vos clients cherchent sans succès.</p>
                </div>
            </div>

            <div className="bg-base-100 rounded-[2.5rem] border border-base-200 shadow-2xl shadow-slate-200/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-base-200/50">
                                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-base-content/40">Expression recherchée</th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-base-content/40">Utilisateur</th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-base-content/40">Date</th>
                                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-base-content/40 text-right">Résultats</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence>
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan="4" className="p-8"><div className="h-8 bg-base-200 rounded-xl w-full"></div></td>
                                        </tr>
                                    ))
                                ) : searches.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-20 text-center">
                                            <Search size={48} className="mx-auto text-base-content/20 mb-4" />
                                            <p className="text-base-content/40 font-bold">Aucune donnée pour le moment.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    searches.map((item, idx) => (
                                        <motion.tr
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="hover:bg-base-200/50 transition-colors group"
                                        >
                                            <td className="p-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all">
                                                        <Hash size={18} />
                                                    </div>
                                                    <span className="font-black text-base-content text-lg">"{item.query}"</span>
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <div className="flex items-center gap-2 text-base-content/50 font-bold">
                                                    <User size={14} />
                                                    {item.user_id ? <span className="text-xs">{item.user_id}</span> : <span className="text-xs uppercase tracking-widest italic opacity-50">Invité</span>}
                                                </div>
                                            </td>
                                            <td className="p-8">
                                                <div className="flex items-center gap-2 text-base-content/40 text-xs font-bold">
                                                    <Clock size={14} />
                                                    {new Date(item.createdAt || item.created_at).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="p-8 text-right">
                                                <span className="px-4 py-2 bg-base-200 text-base-content/50 rounded-xl font-black text-xs">
                                                    {item.results_count}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
