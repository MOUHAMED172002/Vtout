import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Store, Truck, ChevronDown } from 'lucide-react';
import { useAuth } from '../clerk-shim';

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

    // PORTAL LOGIC: Filter based on actual user capabilities (profiles)
    const allPortals = [];

    // 1. Buyer Portal (Always available)
    const isBuyerPortalActive = !window.location.host.includes('vendeur') && !window.location.pathname.includes('delivery-rider');
    allPortals.push({
        id: 'user',
        name: 'Acheteur',
        icon: ShoppingBag,
        url: MAIN_SITE_URL + '/user/dashboard',
        isActive: isBuyerPortalActive,
        color: 'text-primary',
        bg: 'bg-primary/10'
    });

    // 2. Seller Portal (Only if isSupplier or Admin)
    if (isSupplier || isAdmin) {
        const isSellerPortalActive = window.location.host.includes('vendeur');
        allPortals.push({
            id: 'fournisseur',
            name: 'Vendeur',
            icon: Store,
            url: SUPPLIER_URL + '/dashboard',
            isActive: isSellerPortalActive,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100'
        });
    }

    // 3. Delivery Portal (Only if isDelivery or Admin)
    if (isDelivery || isAdmin) {
        const isDeliveryPortalActive = window.location.pathname.includes('delivery-rider');
        allPortals.push({
            id: 'livreur',
            name: 'Livreur',
            icon: Truck,
            url: MAIN_SITE_URL + '/delivery-rider/dashboard',
            isActive: isDeliveryPortalActive,
            color: 'text-rose-600',
            bg: 'bg-rose-100'
        });
    }

    // Determine current and available portals
    const currentPortal = allPortals.find(p => p.isActive) || allPortals[0];
    const availablePortals = allPortals.filter(p => !p.isActive);

    const handleSwitch = (portal) => {
        setIsOpen(false);
        // Direct navigation. Role switching in DB is removed as backend 
        // now checks profiles (isSupplier/isDelivery) regardless of session role.
        window.location.href = portal.url;
    };

    if (availablePortals.length === 0) return null;

    return (
        <div className="relative z-[9999]" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl shadow-sm transition-all"
            >
                <div className={`p-1.5 rounded-xl ${currentPortal.bg} ${currentPortal.color}`}>
                    <currentPortal.icon size={16} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col items-start hidden sm:flex">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Espace actuel</span>
                    <span className="text-sm font-bold text-slate-900 leading-tight">{currentPortal.name}</span>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
                    >
                        <div className="p-3 bg-slate-50 border-b border-slate-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Basculer vers</p>
                        </div>
                        <div className="p-2 space-y-1">
                            {availablePortals.map((portal) => (
                                <button
                                    key={portal.id}
                                    onClick={() => handleSwitch(portal)}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors group text-left"
                                >
                                    <div className={`p-2 rounded-xl transition-transform group-hover:scale-110 ${portal.bg} ${portal.color}`}>
                                        <portal.icon size={16} strokeWidth={2.5} />
                                    </div>
                                    <span className="font-bold text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                                        Espace {portal.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PortalSwitcher;
