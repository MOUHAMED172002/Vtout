import React, { useEffect, useState } from "react";
import { useAuth } from "../../../lib/AuthHooks";;
import { getDeliveryStatsAdmin, confirmCashRemitted } from "../../../services/deliveryService";
import toast from "react-hot-toast";
import { DollarSign, User, Check, AlertCircle, Clock, RefreshCw } from "lucide-react";

export default function CashControl() {
    const { getToken } = useAuth();
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const data = await getDeliveryStatsAdmin(token);
            setDebts(data.debts || []);
        } catch (err) {
            toast.error("Erreur de chargement des dettes");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmCash = async (deliveryPersonId) => {
        if (!window.confirm("Confirmez-vous avoir reçu l'intégralité du cash de ce livreur ?")) return;

        try {
            const token = await getToken();
            await confirmCashRemitted(token, deliveryPersonId);
            toast.success("Cash validé ! Le compte du livreur est débloqué.");
            fetchStats();
        } catch (err) {
            toast.error("Erreur lors de la validation");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-emerald-500 font-black uppercase text-xs tracking-[0.3em]">
                        <DollarSign size={14} /> Finance
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Contrôle <span className="text-slate-400">du Cash</span></h1>
                    <p className="text-slate-500 font-bold max-w-lg">Gérez les encaissements des livreurs et débloquez leurs accès.</p>
                </div>

                <button
                    onClick={fetchStats}
                    className="flex items-center gap-2 bg-white text-slate-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-100 shadow-sm hover:bg-slate-50 transition-all"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Actualiser
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table w-full border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50 bg-slate-50/50">
                                <th className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6 pl-10">Livreur</th>
                                <th className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6 text-center">Commandes non payées</th>
                                <th className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6 text-center">Montant Total</th>
                                <th className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6 text-center">Statut Compte</th>
                                <th className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-6 text-right pr-10">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading && debts.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></td></tr>
                            ) : debts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-32 space-y-4">
                                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-200">
                                            <Check size={40} />
                                        </div>
                                        <p className="font-black text-slate-300 uppercase tracking-widest text-sm italic py-4">Toutes les caisses sont équilibrées</p>
                                    </td>
                                </tr>
                            ) : debts.map((d) => (
                                <tr key={d.delivery_person_id} className="group hover:bg-slate-50/80 transition-all duration-300">
                                    <td className="py-8 pl-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200 shadow-inner">
                                                <User size={20} />
                                            </div>
                                            <p className="font-black text-slate-900 text-lg">{d.deliveryPerson?.profile?.fullname || "Inconnu"}</p>
                                        </div>
                                    </td>
                                    <td className="py-8 text-center">
                                        <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm border border-slate-200">
                                            {d.order_count} courses
                                        </span>
                                    </td>
                                    <td className="py-8 text-center text-xl font-black text-rose-600">
                                        {Number(d.total_debt).toLocaleString()} FCFA
                                    </td>
                                    <td className="py-8 text-center">
                                        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full border border-rose-100 text-[10px] font-black uppercase tracking-widest">
                                            <AlertCircle size={14} /> Bloqué (Dette)
                                        </div>
                                    </td>
                                    <td className="py-8 text-right pr-10">
                                        <button
                                            onClick={() => handleConfirmCash(d.delivery_person_id)}
                                            className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                                        >
                                            Valider encaissement
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
