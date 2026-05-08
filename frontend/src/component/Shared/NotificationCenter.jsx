import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Trash2, X, Store, Truck, Wallet, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../lib/clerk-shim';
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
        return <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Bell size={16} /></div>;
    };

    const modal = (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        key="notif-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', zIndex: 999998 }}
                        onClick={() => setIsOpen(false)}
                    />
                    <motion.div
                        key="notif-modal"
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '90%',
                            maxWidth: '500px',
                            maxHeight: '85vh',
                            zIndex: 999999,
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: '2.5rem',
                            overflow: 'hidden',
                            background: 'white',
                            boxShadow: '0 20px 70px rgba(0,0,0,0.3)',
                            border: '1px solid #f1f5f9',
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                            <div>
                                <h3 style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#0f172a', margin: 0 }}>Notifications</h3>
                                <p style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginTop: '0.25rem' }}>{unreadCount} non lues</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} style={{ fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-primary, #6366f1)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        Tout marquer lu
                                    </button>
                                )}
                                <button onClick={() => setIsOpen(false)} style={{ padding: '0.5rem', borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1' }}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div style={{ overflowY: 'auto', flexGrow: 1 }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '3rem', textAlign: 'center' }}>
                                    <div style={{ width: '4rem', height: '4rem', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#e2e8f0' }}>
                                        <Bell size={32} />
                                    </div>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>Aucune notification</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                                        style={{ padding: '1.25rem', borderBottom: '1px solid #f8fafc', display: 'flex', gap: '1rem', cursor: 'pointer', background: !notif.is_read ? 'rgba(238,242,255,0.4)' : 'white', position: 'relative' }}
                                    >
                                        <div style={{ flexShrink: 0 }}>{getIcon(notif.type)}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                <p style={{ fontSize: '0.875rem', lineHeight: 1.4, fontWeight: notif.is_read ? 700 : 900, color: notif.is_read ? '#64748b' : '#0f172a', margin: 0 }}>
                                                    {notif.title}
                                                </p>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                                                    style={{ padding: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', flexShrink: 0 }}
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{notif.message}</p>
                                            <p style={{ fontSize: '0.5625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#e2e8f0', marginTop: '0.5rem' }}>
                                                {new Date(notif.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {!notif.is_read && (
                                            <div style={{ width: '0.5rem', height: '0.5rem', background: 'var(--color-primary, #6366f1)', borderRadius: '50%', position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

    return (
        <div className="hidden sm:block relative">
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
            {createPortal(modal, document.body)}
        </div>
    );
};

export default NotificationCenter;
