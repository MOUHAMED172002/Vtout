import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/clerk-shim';
import { getMySupplierOrders, updateOrderStatus } from '../services/orderService';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Search, Clock, CheckCircle, Truck, XCircle, MapPin, Phone, Eye, ArrowRight, User } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
    'en_attente': { label: 'Nouvelle', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
    'confirmée': { label: 'En Préparation', icon: Package, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    'confirmee': { label: 'En Préparation', icon: Package, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    'expédiée': { label: 'Expédiée', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
    'expediee': { label: 'Expédiée', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
    'livrée': { label: 'Livrée', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    'livree': { label: 'Livrée', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    'annulée': { label: 'Annulée', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
    'annulee': { label: 'Annulée', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
};

const normalizeStatus = (s) => {
    const map = {
        'confirmee': 'confirmée',
        'expediee': 'expédiée',
        'livree': 'livrée',
        'annulee': 'annulée'
    };
    return map[s] || s;
};

const getEstimatedGain = (order) => {
    let total = 0;
    order.items?.forEach(item => {
        // Le fournisseur gagne le prix vendu moins la commission admin (estimée à 10%)
        const gainPerItem = parseFloat(item.price) * 0.9;
        total += parseFloat(gainPerItem) * item.quantity;
    });
    return total;
};

const SupplierOrders = () => {
    const { getToken } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchOrders = async () => {
        try {
            const token = await getToken();
            const data = await getMySupplierOrders(token);
            setOrders(data || []);
        } catch (error) {
            console.error("fetch orders err:", error);
            toast.error("Erreur de chargement des commandes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleAdvanceStatus = async (orderId, currentStatus) => {
        const flow = ['en_attente', 'confirmée', 'expédiée']; // Removed 'livrée' from supplier flow
        const currentIndex = flow.indexOf(currentStatus);

        if (currentIndex === -1 || currentIndex >= flow.length - 1) return;

        const nextStatus = flow[currentIndex + 1];
        setIsUpdating(true);
        try {
            const token = await getToken();
            await updateOrderStatus(orderId, { status: nextStatus }, token);
            toast.success(`Statut mis à jour : ${STATUS_CONFIG[nextStatus]?.label}`);
            fetchOrders();
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder(prev => ({ ...prev, status: nextStatus }));
            }
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Voulez-vous vraiment annuler cette commande ?")) return;
        setIsUpdating(true);
        try {
            const token = await getToken();
            await updateOrderStatus(orderId, { status: 'annulée' }, token);
            toast.success('Commande annulée');
            fetchOrders();
            if (selectedOrder && selectedOrder.id === orderId) setSelectedOrder(null);
        } catch (error) {
            toast.error("Erreur lors de l'annulation");
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.guest_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'all' || normalizeStatus(order.status) === normalizeStatus(filterStatus);
        return matchSearch && matchStatus;
    });

    if (loading) return <div className="min-h-screen flex items-center justify-center font-black animate-pulse text-slate-300">CHARGEMENT...</div>;

    return (
        <div className="p-6 md:p-12 min-h-screen bg-slate-50 space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Gestion des Commandes</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Traitez et préparez vos livraisons</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher par n° de commande ou client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-3xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 bg-white transition-shadow text-sm font-bold text-slate-700 placeholder:font-medium"
                    />
                </div>
                <div className="flex gap-2 bg-white p-2 rounded-full ring-1 ring-slate-200 overflow-x-auto hide-scrollbar">
                    {['all', 'en_attente', 'confirmée', 'expédiée', 'livrée', 'annulée'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filterStatus === status ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                        >
                            {status === 'all' ? 'Toutes' : STATUS_CONFIG[status]?.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Grid */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 p-6 md:p-10">
                {filteredOrders.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                            <Package size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-2">Aucune commande</h3>
                        <p className="text-slate-400 font-bold text-xs">Modifiez vos filtres ou attendez de nouvelles ventes.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map(order => {
                            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG['en_attente'];
                            const Icon = config.icon;

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-slate-50 hover:bg-slate-100 rounded-3xl transition-colors cursor-pointer gap-6 border border-slate-100/50"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 ${config.bg} ${config.color} rounded-2xl flex items-center justify-center shrink-0 border ${config.border}`}>
                                            <Icon size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-black text-slate-900">#{order.id.substring(0, 8)}</h4>
                                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${config.bg} ${config.color}`}>
                                                    {config.label}
                                                </span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-400">
                                                {new Date(order.created_at || order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} • {order.items_count} article(s)
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between w-full md:w-auto gap-8">
                                        <div className="text-left md:text-right">
                                            <p className="font-black text-slate-900">{getEstimatedGain(order).toLocaleString()} F</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gain Est.</p>
                                        </div>
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm text-slate-400 flex items-center justify-center">
                                            <ArrowRight size={18} />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }}
                            className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white z-50 shadow-2xl flex flex-col"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Commande #{selectedOrder.id.substring(0, 8)}</h2>
                                    <p className="text-xs font-bold text-slate-400">{new Date(selectedOrder.created_at || selectedOrder.createdAt).toLocaleString()}</p>
                                </div>
                                <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100">
                                    <XCircle size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                {/* Status Flow */}
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Statut Actuel</p>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${STATUS_CONFIG[selectedOrder.status]?.bg || 'bg-slate-100'} ${STATUS_CONFIG[selectedOrder.status]?.color || 'text-slate-400'}`}>
                                            {React.createElement(STATUS_CONFIG[selectedOrder.status]?.icon || Clock)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-slate-900 text-lg">{STATUS_CONFIG[selectedOrder.status]?.label}</h4>
                                        </div>

                                        {selectedOrder.status === 'en_attente' && (
                                            <button
                                                onClick={() => handleAdvanceStatus(selectedOrder.id, 'en_attente')}
                                                disabled={isUpdating}
                                                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-indigo-500/30"
                                            >
                                                Accepter & Préparer
                                            </button>
                                        )}
                                        {selectedOrder.status === 'confirmée' && (
                                            <button
                                                onClick={() => handleAdvanceStatus(selectedOrder.id, 'confirmée')}
                                                disabled={isUpdating}
                                                className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-purple-500/30"
                                            >
                                                Marquer Expédiée
                                            </button>
                                        )}

                                    </div>

                                    {['en_attente'].includes(selectedOrder.status) && (
                                        <button
                                            onClick={() => handleCancelOrder(selectedOrder.id)}
                                            className="mt-4 text-[10px] font-black uppercase text-rose-500 hover:text-rose-600 tracking-widest"
                                        >
                                            Annuler cette commande
                                        </button>
                                    )}
                                </div>



                                {/* Products */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white sticky top-0 py-2">
                                        Articles ({selectedOrder.items?.length || 0})
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedOrder.items?.map(item => (
                                            <div key={item.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 text-sm">{item.product?.name || 'Produit inconnu'}</span>
                                                    <span className="text-xs text-slate-400">Qté: {item.quantity}</span>
                                                </div>
                                                <div className="font-black text-emerald-600 text-sm bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                                                    {(parseFloat(item.price) * 0.9 * item.quantity).toLocaleString()} F
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>

                            <div className="p-8 bg-slate-50 border-t border-slate-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Total Gains Estimés</span>
                                    <span className="text-3xl font-black text-indigo-600 tracking-tighter">{getEstimatedGain(selectedOrder).toLocaleString()} F</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SupplierOrders;
