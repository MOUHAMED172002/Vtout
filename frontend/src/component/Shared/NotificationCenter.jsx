import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Trash2, X, Store, Truck, Wallet, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../lib/AuthHooks';
import toast from 'react-hot-toast';

const NotificationCenter = () => {
    const { getToken } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const token = await getToken();
            const { data } = await api.get('/notifications/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(data || []);
            setUnreadCount((data || []).filter(n => !n.is_read).length);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        try {
            const token = await getToken();
            await api.put(`/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
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
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
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
            const target = notifications.find(n => n.id === id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (target && !target.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            toast.error("Erreur");
        }
    };

    const getIcon = (type) => {
        if (type?.includes('seller') || type === 'order_vendeur') return <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Store size={16} /></div>;
        if (type?.includes('delivery')) return <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Truck size={16} /></div>;
        if (type === 'financial' || type === 'wallet') return <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Wallet size={16} /></div>;
        if (type === 'order') return <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><ShoppingBag size={16} /></div>;
        return <div className="p-2 bg-base-200 text-base-content/70 rounded-lg"><Bell size={16} /></div>;
    };

    const modal = (
        <AnimatePresence>
            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <motion.div
                        key="notif-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }}
                        onClick={() => setIsOpen(false)}
                    />
                    <motion.div
                        key="notif-modal"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '480px',
                            maxHeight: '80vh',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: '2rem',
                            overflow: 'hidden',
                            background: 'white',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            border: '1px solid #f1f5f9',
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                            <div>
                                <h3 style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#0f172a', margin: 0 }}>Notifications</h3>
                                <p style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginTop: '0.25rem' }}>{unreadCount} non lues</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} style={{ fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary, #6366f1)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        Tout lu
                                    </button>
                                )}
                                <button onClick={() => setIsOpen(false)} style={{ padding: '0.5rem', borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1' }}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div style={{ overflowY: 'auto', flexGrow: 1, padding: '0.5rem' }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                                    <div style={{ width: '3.5rem', height: '3.5rem', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#e2e8f0' }}>
                                        <Bell size={24} />
                                    </div>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>Aucune notification</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                                        style={{ 
                                            padding: '1rem', 
                                            margin: '0.25rem',
                                            borderRadius: '1.25rem',
                                            display: 'flex', 
                                            gap: '1rem', 
                                            cursor: 'pointer', 
                                            background: !notif.is_read ? 'rgba(238,242,255,0.5)' : 'transparent', 
                                            position: 'relative',
                                            transition: 'background 0.2s'
                                        }}
                                        className="hover:bg-base-200"
                                    >
                                        <div style={{ flexShrink: 0 }}>{getIcon(notif.type)}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                <p style={{ fontSize: '0.8125rem', lineHeight: 1.4, fontWeight: notif.is_read ? 700 : 900, color: notif.is_read ? '#64748b' : '#0f172a', margin: 0 }}>
                                                    {notif.title}
                                                </p>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                                    style={{ padding: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', flexShrink: 0 }}
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem', lineHeight: 1.5 }}>{notif.message}</p>
                                            <p style={{ fontSize: '0.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#cbd5e1', marginTop: '0.5rem' }}>
                                                {new Date(notif.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {!notif.is_read && (
                                            <div style={{ width: '0.375rem', height: '0.375rem', background: 'var(--color-primary, #6366f1)', borderRadius: '50%', position: 'absolute', right: '0.75rem', top: '1.25rem' }} />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 rounded-2xl bg-base-200 border border-base-content/10 shadow-sm text-base-content/50 hover:text-base-content hover:shadow-md transition-all"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>
            {typeof document !== 'undefined' && createPortal(modal, document.body)}
        </div>
    );
};

export default NotificationCenter;
