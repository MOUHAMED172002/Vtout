import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, Trash2, ChevronRight, X, Store, Truck, Wallet, ShoppingBag } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../lib/clerk-shim';
import toast from 'react-hot-toast';

const NotificationCenter = () => {
    const { getToken } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const token = await getToken();
            const { data } = await api.get('/notifications/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(data || []);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            const token = await getToken();
            await api.put(`/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Mark as read error:", error);
        }
    };

    const markAllRead = async () => {
        try {
            const token = await getToken();
            await api.put('/notifications/mark-all-read', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
            toast.success("Tout est lu !");
        } catch (error) {
            toast.error("Erreur");
        }
    };

    const deleteNotification = async (id) => {
        try {
            const token = await getToken();
            await api.delete(`/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.filter(n => n.id !== id));
            if (!notifications.find(n => n.id === id).is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            toast.error("Erreur");
        }
    };

    const getIcon = (type) => {
        // Dynamic detection based on type or content keywords
        const isSeller = type?.includes('seller') || type === 'order_vendeur';
        const isDelivery = type?.includes('delivery');
        const isWallet = type === 'financial' || type === 'wallet';

        if (isSeller) return <div className="p-2 bg-amber-100 text-amber-600 rounded-lg" title="Vendeur"><Store size={16} /></div>;
        if (isDelivery) return <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg" title="Livreur"><Truck size={16} /></div>;
        if (isWallet) return <div className="p-2 bg-green-100 text-green-600 rounded-lg" title="Finances"><Wallet size={16} /></div>;

        switch (type) {
            case 'order': return <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg" title="Achat"><ShoppingBag size={16} /></div>;
            case 'system': return <div className="p-2 bg-rose-100 text-rose-600 rounded-lg" title="Système"><Bell size={16} /></div>;
            default: return <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Bell size={16} /></div>;
        }
    };


    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-slate-600 hover:shadow-md transition-all"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[99998]"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                            exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
                            className="fixed top-1/2 left-1/2 w-[min(calc(100vw-2rem),500px)] bg-white rounded-[2.5rem] shadow-[0_20px_70px_rgba(0,0,0,0.3)] border border-slate-100 z-[99999] overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Notifications</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{unreadCount} non lues</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {unreadCount > 0 && (
                                        <button 
                                            onClick={markAllRead}
                                            className="text-[10px] font-black uppercase text-primary hover:underline tracking-widest"
                                        >
                                            Tout marquer lu
                                        </button>
                                    )}
                                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-300">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-y-auto flex-grow custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="py-12 text-center space-y-4">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                                            <Bell size={32} />
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aucune notification</p>
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div 
                                            key={notif.id}
                                            onClick={() => !notif.is_read && markAsRead(notif.id)}
                                            className={`p-5 border-b border-slate-50 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer relative group ${!notif.is_read ? 'bg-indigo-50/30' : ''}`}
                                        >
                                            <div className="shrink-0">
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2">
                                                    <p className={`text-sm leading-tight ${!notif.is_read ? 'font-black text-slate-900' : 'font-bold text-slate-500'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2">
                                                    {new Date(notif.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            {!notif.is_read && (
                                                <div className="w-2 h-2 bg-primary rounded-full absolute right-4 top-1/2 -translate-y-1/2"></div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
