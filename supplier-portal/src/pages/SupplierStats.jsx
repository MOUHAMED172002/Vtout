import React, { useState, useEffect } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, Cell
} from 'recharts';
import { 
    TrendingUp, Package, AlertTriangle, DollarSign, 
    ShoppingBag, ArrowUpRight, ArrowDownRight, Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../components/clerk-shim';
import toast from 'react-hot-toast';

export default function SupplierStats() {
    const { getToken } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const token = await getToken();
            const { data } = await api.get('/stats/supplier-performance', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(data);
        } catch (err) {
            toast.error("Erreur lors du chargement des statistiques");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) return <div className="p-20 text-center"><span className="loading loading-spinner"></span></div>;
    if (!data) return <div className="p-20 text-center text-base-content/40 font-bold">Impossible de charger les données.</div>;

    const summaryCards = [
        { label: "Chiffre d'affaires (30j)", value: `${data.revenue.toLocaleString()} F`, icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
        { label: "Commandes (30j)", value: data.orderCount, icon: ShoppingBag, color: "bg-primary/10 text-primary" },
        { label: "Alertes Stock", value: data.lowStock.length, icon: AlertTriangle, color: data.lowStock.length > 0 ? "bg-rose-50 text-rose-600" : "bg-base-200 text-base-content/40" },
    ];

    return (
        <div className="p-8 md:p-12 space-y-12 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-base-content tracking-tighter">Pilotage <span className="text-primary">&</span> Performance</h1>
                    <p className="text-base-content/50 font-bold mt-1">Analysez vos ventes et gérez vos approvisionnements.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-base-100 border border-base-300 px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-black text-base-content/50 hover:bg-base-200 transition-all">
                        <Filter size={16} /> Derniers 30 Jours
                    </button>
                </div>
            </header>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {summaryCards.map((card, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx} 
                        className="bg-base-100 p-8 rounded-[2.5rem] border border-base-300 shadow-xl shadow-base-300/20 flex items-center justify-between group hover:border-primary/30 transition-all"
                    >
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest">{card.label}</p>
                            <p className="text-3xl font-black text-base-content">{card.value}</p>
                        </div>
                        <div className={`w-16 h-16 ${card.color} rounded-2xl flex items-center justify-center`}>
                            <card.icon size={28} />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-base-100 p-10 rounded-[3rem] border border-base-300 shadow-xl shadow-base-300/20 space-y-8">
                    <h3 className="text-xl font-black text-base-content tracking-tight flex items-center gap-3">
                        <TrendingUp className="text-primary" /> Évolution du Chiffre d'Affaires
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.monthlyRevenue}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                                    itemStyle={{ color: '#6366f1', fontWeight: 900 }}
                                />
                                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-neutral rounded-[3rem] p-10 text-white space-y-8 shadow-2xl">
                    <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                        <Package className="text-primary" /> Top Ventes
                    </h3>
                    <div className="space-y-6">
                        {data.topProducts.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 group">
                                <div className="w-12 h-12 bg-white/10 rounded-xl overflow-hidden flex-shrink-0">
                                    {item.product?.images?.[0]?.image_url ? (
                                        <img src={item.product.images[0].image_url} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/20"><Package size={20} /></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate uppercase tracking-tight">{item.product?.name}</p>
                                    <p className="text-[10px] font-black text-neutral-content/50 uppercase tracking-widest">{item.sold} Unités Vendues</p>
                                </div>
                                <div className="text-primary font-black text-sm">#{idx + 1}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Low Stock Section */}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-4">
                    <h3 className="text-2xl font-black text-base-content tracking-tighter flex items-center gap-4">
                        <AlertTriangle className="text-rose-500" /> Alertes de Stock Critiques
                    </h3>
                    <span className="text-[10px] font-black uppercase text-base-content/40 tracking-widest bg-base-200 px-4 py-2 rounded-full">Seuil : &lt; 5 unités</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.lowStock.map(product => (
                        <div key={product.id} className="bg-base-100 border-2 border-rose-50 p-6 rounded-[2rem] flex items-center gap-6 shadow-sm hover:shadow-xl hover:shadow-rose-100/20 transition-all">
                            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0">
                                <Package size={28} />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="font-black text-base-content line-clamp-1">{product.name}</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 flex-1 bg-base-300 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-500" style={{ width: `${((product.total_stock !== undefined ? product.total_stock : product.stock) / 5) * 100}%` }}></div>
                                    </div>
                                    <span className="text-xs font-black text-rose-500">{product.total_stock !== undefined ? product.total_stock : product.stock} restants</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {data.lowStock.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-base-200 rounded-[3rem] border border-dashed border-base-300">
                            <p className="text-base-content/40 font-bold italic">Toutes vos boutiques sont bien approvisionnées !</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
