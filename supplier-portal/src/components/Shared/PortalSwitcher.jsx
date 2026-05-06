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

    const portals = [
        {
            name: 'Acheteur',
            role: 'user',
            icon: ShoppingBag,
            url: MAIN_SITE_URL,
            active: role === 'user' && !window.location.host.includes('vendeur'),
            hasRole: true
        }
    ];

    if (isSupplier || isAdmin) {
        portals.push({
            name: 'Vendeur',
            role: 'fournisseur',
            icon: Store,
            url: SUPPLIER_URL + '/dashboard',
            active: window.location.host.includes('vendeur') || role === 'fournisseur',
            hasRole: true
        });
    }

    if (isDelivery || isAdmin) {
        portals.push({
            name: 'Livreur',
            role: 'livreur',
            icon: Truck,
            url: MAIN_SITE_URL + '/delivery-rider/dashboard',
            active: window.location.pathname.includes('delivery-rider') || role === 'livreur',
            hasRole: true
        });
    }

    const handleSwitch = async (portal) => {
        if (!portal.hasRole) {
            window.location.href = portal.url;
            return;
        }

        try {
            const token = await getToken();
            const targetRole = portal.role;
            
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

    return (
        <div className="flex flex-col gap-2 w-full">
            {portals.map((portal) => (
                <button
                    key={portal.name}
                    onClick={() => handleSwitch(portal)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all w-full border ${
                        portal.active 
                        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' 
                        : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10'
                    }`}
                >
                    <portal.icon size={16} className={portal.active ? 'text-indigo-400' : 'text-white/40'} />
                    <span>Portail {portal.name}</span>
                </button>
            ))}
        </div>
    );

};


export default PortalSwitcher;
