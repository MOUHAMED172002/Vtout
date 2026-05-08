import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Store, Truck, ChevronDown } from 'lucide-react';
import { useAuth } from '../../lib/clerk-shim';

const PortalSwitcher = () => {
    const { isSupplier, isDelivery, isAdmin, isLoaded, isSignedIn, getToken, role } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    const MAIN_SITE_URL = import.meta.env.VITE_MAIN_SITE_URL || 'https://vtout.com';
    const SUPPLIER_URL = import.meta.env.VITE_SUPPLIER_PORTAL_URL || 'https://vendeur.vtout.com';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isLoaded || !isSignedIn) return null;

    // Only show switcher if user has more than just the basic 'user' role
    if (!isSupplier && !isDelivery && !isAdmin) return null;

    const allPortals = [];

    // Always add Buyer
    allPortals.push({
        id: 'user',
        name: 'Acheteur',
        icon: ShoppingBag,
        url: MAIN_SITE_URL + '/user/dashboard',
        isActive: window.location.pathname.startsWith('/user/') || (!window.location.host.includes('vendeur') && !window.location.pathname.includes('delivery-rider') && !window.location.pathname.startsWith('/admin')),
        color: 'text-primary',
        bg: 'bg-primary/10'
    });

    // Add Seller if they have the role
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

    // Add Delivery if they have the role
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
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ newRole: targetRole })
                });
            }
            window.location.href = portal.url;
        } catch (err) {
            window.location.href = portal.url;
        }
    };

    if (availablePortals.length === 0) return null;

    return (
        <div className="relative z-[9999]" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-base-100 border border-base-content/10 hover:border-primary/30 rounded-xl sm:rounded-2xl shadow-sm transition-all"
            >
                <div className={`p-1.5 rounded-xl ${currentPortal.bg} ${currentPortal.color}`}>
                    <currentPortal.icon size={16} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col items-start hidden xs:flex">
                    <span className="text-[9px] font-black uppercase tracking-widest text-base-content/40 leading-none">Espace actuel</span>
                    <span className="text-sm font-bold text-base-content leading-tight">{currentPortal.name}</span>
                </div>
                <ChevronDown size={14} className={`text-base-content/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99998] md:hidden"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="fixed bottom-4 left-4 right-4 md:absolute md:bottom-auto md:left-auto md:right-0 md:mt-2 md:w-64 bg-base-100 rounded-[2rem] md:rounded-2xl shadow-2xl shadow-base-content/10 border border-base-content/10 z-[99999] overflow-hidden flex flex-col max-h-[80vh]"
                        >
                            <div className="p-4 md:p-3 bg-base-200/50 border-b border-base-content/5 flex justify-between items-center shrink-0">
                                <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40">Basculer vers</p>
                            </div>
                            <div className="p-2 space-y-1 overflow-y-auto">
                                {availablePortals.map((portal) => (
                                    <button
                                        key={portal.id}
                                        onClick={() => handleSwitch(portal)}
                                        className="w-full flex items-center gap-4 md:gap-3 px-4 md:px-3 py-4 md:py-3 rounded-2xl md:rounded-xl hover:bg-base-200 transition-colors group text-left"
                                    >
                                        <div className={`p-3 md:p-2 rounded-2xl md:rounded-xl transition-transform group-hover:scale-110 ${portal.bg} ${portal.color}`}>
                                            <portal.icon size={20} strokeWidth={2.5} />
                                        </div>
                                        <span className="font-bold text-base md:text-sm text-base-content/70 group-hover:text-base-content transition-colors">
                                            Espace {portal.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div className="p-2 border-t border-base-content/5 mt-1 shrink-0">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        window.location.href = MAIN_SITE_URL + '/user/dashboard/settings';
                                    }}
                                    className="w-full flex items-center gap-4 md:gap-3 px-4 md:px-3 py-4 md:py-3 rounded-2xl md:rounded-xl hover:bg-base-200 transition-colors group text-left"
                                >
                                    <div className="p-3 md:p-2 rounded-2xl md:rounded-xl transition-transform group-hover:scale-110 bg-slate-100 text-slate-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    </div>
                                    <span className="font-bold text-base md:text-sm text-base-content/70 group-hover:text-base-content transition-colors">
                                        Paramètres du profil
                                    </span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PortalSwitcher;
