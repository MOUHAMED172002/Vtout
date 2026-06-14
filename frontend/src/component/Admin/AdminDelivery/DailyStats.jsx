import React, { useEffect, useState } from "react";
import { useAuth } from "../../../lib/AuthHooks";
import { getDeliveryStatsAdmin } from "../../../services/deliveryService";
import toast from "react-hot-toast";
import { BarChart3, TrendingUp, User, Clock, RefreshCw, Truck } from "lucide-react";

export default function DailyStats() {
    const { getToken } = useAuth();
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const data = await getDeliveryStatsAdmin(token);
            setStats(data.dailyDeliveries || []);
        } catch (err) {
            toast.error("Erreur de chargement des statistiques");
        } finally {
            setLoading(false);
        }
    };

    const totalToday = stats.reduce((acc, curr) => acc + Number(curr.count), 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-primary font-black uppercase text-xs tracking-[0.3em]">
                        <TrendingUp size={14} /> Performance
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Livrées <span className="text-base-content/40">aujourd'hui</span></h1>
                    <p className="text-base-content/50 font-bold max-w-lg">Surveillez l'activité en temps réel de votre flotte de livraison.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20 text-primary flex items-center gap-3">
                        <Truck size={20} />
                        <div>
                            <p className="text-[10px] font-black uppercase">Total Journée</p>
                            <p className="text-xl font-black">{totalToday} livraisons</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchStats}
                        className="p-4 bg-base-100 text-base-content/70 rounded-2xl border border-base-200 shadow-sm hover:bg-base-200 transition-all"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && stats.length === 0 ? (
                    <div className="col-span-full text-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>
                ) : stats.length === 0 ? (
                    <div className="col-span-full bg-base-100 rounded-[2rem] border border-dashed border-base-300 p-20 text-center">
                        <BarChart3 size={48} className="mx-auto text-base-content/20 mb-4" />
                        <p className="font-black text-base-content/30 uppercase tracking-widest italic">Aucune livraison enregistrée ce jour</p>
                    </div>
                ) : stats.map((s) => (
                    <div key={s.delivery_person_id} className="bg-base-100 p-8 rounded-[2.5rem] border border-base-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/5 transition-all group">
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-16 h-16 bg-base-200 rounded-2xl flex items-center justify-center text-base-content/40 group-hover:bg-primary group-hover:text-white transition-colors duration-500 mb-4">
                                <User size={28} />
                            </div>
                            <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                Actif
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-base-content mb-1">{s.deliveryPerson?.profile?.fullname || "Livreur"}</h3>
                        <p className="text-base-content/40 font-bold text-sm mb-6 flex items-center gap-2">
                            <Clock size={14} /> Mis à jour à l'instant
                        </p>

                        <div className="h-2 w-full bg-base-200 rounded-full overflow-hidden mb-4">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min((s.count / 10) * 100, 100)}%` }}
                            ></div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-base-content/40">Volume Livraison</span>
                            <span className="text-2xl font-black text-primary">{s.count}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
