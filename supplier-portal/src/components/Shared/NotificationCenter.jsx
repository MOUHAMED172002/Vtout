import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, Trash2, ChevronRight, X, Store, Truck, Wallet, ShoppingBag } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../clerk-shim';
import toast from 'react-hot-toast';

const NotificationCenter = () => {
    const { getToken } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
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
        // Detection based on type keywords
        const isSeller = type?.includes('seller') || type === 'order_vendeur';
        const isDelivery = type?.includes('delivery');
        const isWallet = type === 'financial' || type === 'wallet';

        if (isSeller) return <div className="p-2 bg-amber-100 text-amber-600 rounded-lg" title="Vendeur"><Store size={16} /></div>;
        if (isDelivery) return <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg" title="Livreur"><Truck size={16} /></div>;
        if (isWallet) return <div className="p-2 bg-green-100 text-green-600 rounded-lg" title="Finances"><Wallet size={16} /></div>;

        switch (type) {
            case 'order': return <div className="p-2 bg-primary/10 text-primary rounded-lg" title="Achat"><ShoppingBag size={16} /></div>;
            case 'system': return <div className="p-2 bg-rose-100 text-rose-600 rounded-lg" title="Système"><Bell size={16} /></div>;
            default: return <div className="p-2 bg-base-300 text-base-content/70 rounded-lg"><Bell size={16} /></div>;
        }
    };


    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 rounded-2xl bg-base-100 border border-base-300 shadow-sm text-base-content/40 hover:text-base-content/70 hover:shadow-md transition-all"
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
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-96 bg-base-100 rounded-[2rem] shadow-2xl border border-base-300 z-50 overflow-hidden"
                    >
                        <div className="p-6 border-b border-base-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-base-content">Notifications</h3>
                                <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest mt-1">{unreadCount} non lues</p>
                            </div>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markAllRead}
                                    className="text-[10px] font-black uppercase text-primary hover:underline tracking-widest"
                                >
                                    Tout marquer lu
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="py-12 text-center space-y-4">
                                    <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto text-base-content/20">
                                        <Bell size={32} />
                                    </div>
                                    <p className="text-xs font-bold text-base-content/40 uppercase tracking-widest">Rien à signaler pour l'instant</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div 
                                        key={notif.id}
                                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                                        className={`p-5 border-b border-base-200 flex gap-4 hover:bg-base-200 transition-colors cursor-pointer relative group ${!notif.is_read ? 'bg-primary/30' : ''}`}
                                    >
                                        <div className="shrink-0">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <p className={`text-sm leading-tight ${!notif.is_read ? 'font-black text-base-content' : 'font-bold text-base-content/50'}`}>
                                                    {notif.title}
                                                </p>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-base-content/30 hover:text-rose-500 transition-all"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                            <p className="text-xs text-base-content/40 mt-1 line-clamp-2">{notif.message}</p>
                                            <p className="text-[9px] font-black text-base-content/30 uppercase tracking-widest mt-2">
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

                        {notifications.length > 0 && (
                            <div className="p-4 bg-base-200 border-t border-base-300">
                                <button className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-base-content/40 hover:text-base-content/70 transition-colors">
                                    Voir tout l'historique
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
