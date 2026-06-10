import React, { useEffect, useState } from "react";
import { useAuth } from "../../lib/AuthHooks";
import { getFaqs, createFaq, updateFaq, deleteFaq as apiDeleteFaq } from "../../services/contentService";
import toast from "react-hot-toast";
import { HelpCircle, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FaqManager() {
    const { getToken } = useAuth();
    const [faqs, setFaqs] = useState([]);
    const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ question: "", answer: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFaqs();
    }, []);

    const fetchFaqs = async () => {
        try {
            const data = await getFaqs();
            setFaqs(data);
        } catch (err) {
            toast.error("Erreur de chargement");
        }
    };

    const addFaq = async () => {
        if (!newFaq.question || !newFaq.answer) return toast.error("Remplis tous les champs");
        setLoading(true);
        try {
            const token = await getToken();
            await createFaq(newFaq, token);
            toast.success("FAQ ajoutée !");
            setNewFaq({ question: "", answer: "" });
            fetchFaqs();
        } catch (err) {
            toast.error("Erreur lors de l’ajout");
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (faq) => {
        setEditingId(faq.id);
        setEditData({ question: faq.question, answer: faq.answer });
    };

    const saveEdit = async (id) => {
        try {
            const token = await getToken();
            await updateFaq(id, editData, token);
            toast.success("Mis à jour !");
            setEditingId(null);
            fetchFaqs();
        } catch (err) {
            toast.error("Erreur de mise à jour");
        }
    };

    const deleteFaq = async (id) => {
        if (!confirm("Supprimer cette question ?")) return;
        try {
            const token = await getToken();
            await apiDeleteFaq(id, token);
            toast.success("Supprimé !");
            fetchFaqs();
        } catch (err) {
            toast.error("Erreur de suppression");
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <HelpCircle className="text-primary" /> Ajouter une question
                </h2>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Question"
                        value={newFaq.question}
                        onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold focus:outline-none focus:border-primary/40"
                    />
                    <textarea
                        placeholder="Réponse"
                        value={newFaq.answer}
                        onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold h-32 focus:outline-none focus:border-primary/40"
                    ></textarea>

                    <button
                        onClick={addFaq}
                        disabled={loading}
                        className="w-full bg-slate-900 text-white h-16 rounded-2xl font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-900/20 disabled:bg-slate-200"
                    >
                        {loading ? "Ajout en cours..." : "Publier la FAQ"}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-900 px-6">Questions publiées</h2>
                <AnimatePresence>
                    {faqs.map((faq) => (
                        <motion.div
                            key={faq.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between gap-6"
                        >
                            {editingId === faq.id ? (
                                <div className="flex-1 space-y-4">
                                    <input
                                        value={editData.question}
                                        onChange={(e) => setEditData({ ...editData, question: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-primary/20 bg-primary/5 font-bold"
                                    />
                                    <textarea
                                        value={editData.answer}
                                        onChange={(e) => setEditData({ ...editData, answer: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-primary/20 bg-primary/5 font-bold h-24"
                                    ></textarea>
                                    <div className="flex gap-2">
                                        <button onClick={() => saveEdit(faq.id)} className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase"><Save size={16} /></button>
                                        <button onClick={() => setEditingId(null)} className="px-6 py-2 bg-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase"><X size={16} /></button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1">
                                    <h3 className="font-black text-slate-900 mb-2">{faq.question}</h3>
                                    <p className="text-slate-500 font-medium text-sm leading-relaxed">{faq.answer}</p>
                                </div>
                            )}

                            <div className="flex md:flex-col gap-2">
                                <button
                                    onClick={() => startEdit(faq)}
                                    className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => deleteFaq(faq.id)}
                                    className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
