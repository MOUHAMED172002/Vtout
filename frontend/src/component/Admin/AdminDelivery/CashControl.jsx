import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../../lib/AuthHooks";
import { getDeliveryStatsAdmin, confirmCashRemitted, getCashHistory } from "../../../services/deliveryService";
import toast from "react-hot-toast";
import { DollarSign, User, Check, AlertCircle, RefreshCw, History, CreditCard, Banknote } from "lucide-react";

export default function CashControl() {
    const { getToken } = useAuth();
    const [debts, setDebts] = useState([]);
    const [historyOrders, setHistoryOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("debts");

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const [statsData, historyData] = await Promise.all([
                getDeliveryStatsAdmin(token),
                getCashHistory(token)
            ]);
            setDebts(statsData.debts || []);
            setHistoryOrders(historyData.orders || []);
        } catch (err) {
            toast.error("Erreur de chargement");
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
            fetchAll();
        } catch (err) {
            toast.error("Erreur lors de la validation");
        }
    };

    // Group history orders by delivery_person_id
    const groupedHistory = useMemo(() => {
        const map = {};
        for (const order of historyOrders) {
            const dpId = order.delivery_person_id;
            if (!map[dpId]) {
                map[dpId] = {
                    delivery_person_id: dpId,
                    deliveryPerson: order.deliveryPerson,
                    orders: [],
                    total_paid: 0,
                    total_reversed: 0,
                    fedapay_count: 0,
                    manual_count: 0,
                    last_payment_at: null
                };
            }
            const amount = parseFloat(order.total_amount || 0);
            const fee = parseFloat(order.delivery_fee || 0);
            map[dpId].orders.push(order);
            map[dpId].total_paid += amount;
            map[dpId].total_reversed += Math.max(0, amount - fee);
            if (order.payment_id) map[dpId].fedapay_count++;
            else map[dpId].manual_count++;
            const orderDate = new Date(order.updated_at);
            if (!map[dpId].last_payment_at || orderDate > map[dpId].last_payment_at) {
                map[dpId].last_payment_at = orderDate;
            }
        }
        return Object.values(map).sort((a, b) => b.last_payment_at - a.last_payment_at);
    }, [historyOrders]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-emerald-500 font-black uppercase text-xs tracking-[0.3em]">
                        <DollarSign size={14} /> Finance
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Contrôle <span className="text-base-content/40">du Cash</span></h1>
                    <p className="text-base-content/50 font-bold max-w-lg">Gérez les encaissements des livreurs et débloquez leurs accès.</p>
                </div>

                <button
                    onClick={fetchAll}
                    className="flex items-center gap-2 bg-base-100 text-base-content/70 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-base-200 shadow-sm hover:bg-base-200 transition-all"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Actualiser
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-base-200">
                <button
                    onClick={() => setActiveTab("debts")}
                    className={`flex items-center gap-2 px-6 py-3 font-black text-xs uppercase tracking-widest transition-all border-b-2 -mb-px ${activeTab === "debts" ? "border-rose-500 text-rose-600" : "border-transparent text-base-content/40 hover:text-base-content/60"}`}
                >
                    <AlertCircle size={14} /> Dettes en cours
                    {debts.length > 0 && (
                        <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{debts.length}</span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={`flex items-center gap-2 px-6 py-3 font-black text-xs uppercase tracking-widest transition-all border-b-2 -mb-px ${activeTab === "history" ? "border-emerald-500 text-emerald-600" : "border-transparent text-base-content/40 hover:text-base-content/60"}`}
                >
                    <History size={14} /> Historique des versements
                    {groupedHistory.length > 0 && (
                        <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{groupedHistory.length}</span>
                    )}
                </button>
            </div>

            {/* Pending Debts Tab */}
            {activeTab === "debts" && (
                <div className="bg-base-100 rounded-[2.5rem] border border-base-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table w-full border-collapse">
                            <thead>
                                <tr className="border-b border-base-200 bg-base-200/50">
                                    <th className="text-[10px] font-black uppercase tracking-widest text-base-content/40 py-6 pl-10">Livreur</th>
                                    <th className="text-[10px] font-black uppercase tracking-widest text-base-content/40 py-6 text-center">Commandes non payées</th>
                                    <th className="text-[10px] font-black uppercase tracking-widest text-base-content/40 py-6 text-center">Montant Total</th>
                                    <th className="text-[10px] font-black uppercase tracking-widest text-base-content/40 py-6 text-center">Statut Compte</th>
                                    <th className="text-[10px] font-black uppercase tracking-widest text-base-content/40 py-6 text-right pr-10">Action</th>
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
                                            <p className="font-black text-base-content/30 uppercase tracking-widest text-sm italic py-4">Toutes les caisses sont équilibrées</p>
                                        </td>
                                    </tr>
                                ) : debts.map((d) => (
                                    <tr key={d.delivery_person_id} className="group hover:bg-base-200/80 transition-all duration-300">
                                        <td className="py-8 pl-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-base-200 rounded-2xl flex items-center justify-center text-base-content/40 border border-base-300 shadow-inner">
                                                    <User size={20} />
                                                </div>
                                                <p className="font-black text-base-content text-lg">{d.deliveryPerson?.profile?.fullname || "Inconnu"}</p>
                                            </div>
                                        </td>
                                        <td className="py-8 text-center">
                                            <span className="bg-base-200 text-base-content/70 px-4 py-2 rounded-xl font-bold text-sm border border-base-300">
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
            )}

            {/* History Tab */}
            {activeTab === "history" && (
                <div className="bg-base-100 rounded-[2.5rem] border border-base-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table w-full border-collapse">
                            <thead>
                                <tr className="border-b border-base-200 bg-base-200/50">
                                    <th className="text-[10px] font-black uppercase tracking-widest text-base-content/40 py-6 pl-10">Livreur</th>
                                    <th className="text-[10px] font-black uppercase tracking-widest text-base-content/40 py-6 text-center">Courses réglées</th>
                                    <th className="text-[10px] font-black uppercase tracking-widest text-base-content/40 py-6 text-center">Total encaissé</th>
                                    <th className="text-[10px] font-black uppercase tracking-widest text-base-content/40 py-6 text-center">Montant reversé</th>
                                    <th className="text-[10px] font-black uppercase tracking-widest text-base-content/40 py-6 text-center">Mode</th>
                                    <th className="text-[10px] font-black uppercase tracking-widest text-base-content/40 py-6 text-right pr-10">Dernier versement</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading && groupedHistory.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></td></tr>
                                ) : groupedHistory.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-32 space-y-4">
                                            <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mx-auto text-base-content/20">
                                                <History size={40} />
                                            </div>
                                            <p className="font-black text-base-content/30 uppercase tracking-widest text-sm italic py-4">Aucun versement enregistré</p>
                                        </td>
                                    </tr>
                                ) : groupedHistory.map((g) => (
                                    <tr key={g.delivery_person_id} className="group hover:bg-base-200/80 transition-all duration-300">
                                        <td className="py-8 pl-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-100">
                                                    <User size={20} />
                                                </div>
                                                <p className="font-black text-base-content text-lg">{g.deliveryPerson?.profile?.fullname || "Inconnu"}</p>
                                            </div>
                                        </td>
                                        <td className="py-8 text-center">
                                            <span className="bg-base-200 text-base-content/70 px-4 py-2 rounded-xl font-bold text-sm border border-base-300">
                                                {g.orders.length} courses
                                            </span>
                                        </td>
                                        <td className="py-8 text-center text-lg font-black text-base-content">
                                            {Math.round(g.total_paid).toLocaleString()} FCFA
                                        </td>
                                        <td className="py-8 text-center text-lg font-black text-emerald-600">
                                            {Math.round(g.total_reversed).toLocaleString()} FCFA
                                        </td>
                                        <td className="py-8 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                {g.fedapay_count > 0 && (
                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100 text-[10px] font-black uppercase tracking-widest">
                                                        <CreditCard size={11} /> FedaPay ({g.fedapay_count})
                                                    </div>
                                                )}
                                                {g.manual_count > 0 && (
                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100 text-[10px] font-black uppercase tracking-widest">
                                                        <Banknote size={11} /> Manuel ({g.manual_count})
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-8 text-right pr-10 text-sm font-bold text-base-content/50">
                                            {g.last_payment_at
                                                ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(g.last_payment_at)
                                                : '—'
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
