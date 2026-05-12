import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Store, Truck, ChevronDown, X } from 'lucide-react';
import { useAuth } from '../../lib/AuthHooks';

const PortalSwitcher = () => {
    const { isSupplier, isDelivery, isAdmin, isLoaded, isSignedIn, getToken, role } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const MAIN_SITE_URL = import.meta.env.VITE_MAIN_SITE_URL || 'https://vtout.com';
    const SUPPLIER_URL = import.meta.env.VITE_SUPPLIER_PORTAL_URL || 'https://vendeur.vtout.com';

    if (!isLoaded || !isSignedIn) return null;
    if (!isSupplier && !isDelivery && !isAdmin) return null;

    const allPortals = [];

    allPortals.push({
        id: 'user',
        name: 'Acheteur',
        icon: ShoppingBag,
        url: MAIN_SITE_URL + '/user/dashboard',
        isActive: window.location.pathname.startsWith('/user/') || (!window.location.host.includes('vendeur') && !window.location.pathname.includes('delivery-rider') && !window.location.pathname.startsWith('/admin')),
        color: 'text-primary',
        bg: 'bg-primary/10'
    });

    if (isSupplier || isAdmin) {
        allPortals.push({
            id: 'fournisseur',
            name: 'Vendeur',
            icon: Store,
            url: SUPPLIER_URL + '/dashboard',
            isActive: window.location.host.includes('vendeur'),
            color: 'text-emerald-600',
            bg: 'bg-emerald-100'
        });
    }

    if (isDelivery || isAdmin) {
        allPortals.push({
            id: 'livreur',
            name: 'Livreur',
            icon: Truck,
            url: MAIN_SITE_URL + '/delivery-rider/dashboard',
            isActive: window.location.pathname.includes('delivery-rider'),
            color: 'text-rose-600',
            bg: 'bg-rose-100'
        });
    }

    const currentPortal = allPortals.find(p => p.isActive) || allPortals[0];
    const availablePortals = allPortals.filter(p => !p.isActive);

    const handleSwitch = async (portal) => {
        setIsOpen(false);
        try {
            const token = await getToken();
            const targetRole = portal.id;
            if (role !== targetRole && targetRole !== 'admin') {
                await fetch(`${import.meta.env.VITE_API_URL}/profiles/switch-role`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ newRole: targetRole })
                });
            }
            window.location.href = portal.url;
        } catch (err) {
            window.location.href = portal.url;
        }
    };

    if (availablePortals.length === 0) return null;

    // AnimatePresence MUST be inside createPortal
    const modal = (
        <AnimatePresence>
            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <motion.div
                        key="ps-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)' }}
                        onClick={() => setIsOpen(false)}
                    />
                    <motion.div
                        key="ps-modal"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '420px',
                            maxHeight: '80vh',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: '2rem',
                            overflow: 'hidden',
                        }}
                        className="bg-base-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-base-content/10"
                    >
                        {/* Header */}
                        <div className="p-6 bg-base-200/50 border-b border-base-content/5 flex justify-between items-center shrink-0">
                            <p className="text-xs font-black uppercase tracking-widest text-base-content/40">Basculer vers</p>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-base-300 rounded-full transition-colors text-base-content/40">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Portal list */}
                        <div className="p-4 space-y-2 overflow-y-auto flex-grow">
                            {availablePortals.map((portal) => (
                                <button
                                    key={portal.id}
                                    onClick={() => handleSwitch(portal)}
                                    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-base-200 transition-all group text-left"
                                >
                                    <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${portal.bg} ${portal.color}`}>
                                        <portal.icon size={24} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-base text-base-content group-hover:text-primary transition-colors">
                                            Espace {portal.name}
                                        </span>
                                        <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Ouvrir le portail</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-base-content/5 shrink-0">
                            <button
                                onClick={() => { setIsOpen(false); window.location.href = MAIN_SITE_URL + '/user/dashboard/settings'; }}
                                className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-base-200 transition-all group text-left"
                            >
                                <div className="p-3 rounded-2xl transition-transform group-hover:scale-110 bg-slate-100 text-slate-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1-1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-sm text-base-content/70 group-hover:text-base-content transition-colors">Paramètres du profil</span>
                                    <span className="text-[10px] font-bold text-base-content/30 uppercase tracking-widest">Gérer mon compte</span>
                                </div>
                            </button>
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
                className="flex items-center gap-2 px-3 py-2 bg-base-100 border border-base-content/10 hover:border-primary/30 rounded-xl shadow-sm transition-all"
            >
                <div className={`p-1.5 rounded-xl ${currentPortal.bg} ${currentPortal.color}`}>
                    <currentPortal.icon size={16} strokeWidth={2.5} />
                </div>
                <ChevronDown size={14} className={`text-base-content/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {typeof document !== 'undefined' && createPortal(modal, document.body)}
        </div>
    );
};

export default PortalSwitcher;
