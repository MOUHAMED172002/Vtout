import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Store, Truck, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../clerk-shim';

const PortalSwitcher = () => {
    const { isSupplier, isDelivery, isAdmin, isLoaded, isSignedIn, getToken, role } = useAuth();
    
    const MAIN_SITE_URL = import.meta.env.VITE_MAIN_SITE_URL || 'https://vtout.com';
    const SUPPLIER_URL = import.meta.env.VITE_SUPPLIER_PORTAL_URL || 'https://vendeur.vtout.com';

    if (!isLoaded || !isSignedIn) return null;

    // Don't show if they only have one role (and it's just 'user')
    if (!isSupplier && !isDelivery && !isAdmin) return null;

    const handleSwitch = async (portal) => {
        try {
            const token = await getToken();
            const targetRole = portal.role;
            
            // Only call API if role is different from current primary role
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
            console.error("Switch failed:", err);
            window.location.href = portal.url; // Fallback to direct redirect
        }
    };

    const portals = [
        {
            name: 'Acheteur',
            role: 'user',
            icon: ShoppingBag,
            url: MAIN_SITE_URL,
            active: role === 'user' && !window.location.host.includes('vendeur'),
            show: true
        },
        {
            name: 'Vendeur',
            role: 'fournisseur',
            icon: Store,
            url: SUPPLIER_URL + '/dashboard',
            active: window.location.host.includes('vendeur') || role === 'fournisseur',
            show: isSupplier || isAdmin
        },
        {
            name: 'Livreur',
            role: 'livreur',
            icon: Truck,
            url: MAIN_SITE_URL + '/delivery-rider/dashboard',
            active: window.location.pathname.includes('delivery-rider') || role === 'livreur',
            show: isDelivery || isAdmin
        }
    ];

    const activePortals = portals.filter(p => p.show);
    if (activePortals.length <= 1) return null;

    return (
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl border border-white/5 backdrop-blur-md">
            {activePortals.map((portal) => (
                <button
                    key={portal.name}
                    onClick={() => handleSwitch(portal)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        portal.active 
                        ? 'bg-white text-slate-900 shadow-lg' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <portal.icon size={14} className={portal.active ? 'text-slate-900' : 'text-white/40'} />
                    <span>{portal.name}</span>
                </button>
            ))}
        </div>
    );
};


export default PortalSwitcher;
