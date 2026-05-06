import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Store, Truck } from 'lucide-react';
import { useAuth } from '../../lib/clerk-shim';

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
            active: role === 'user' && !window.location.host.includes('vendeur') && !window.location.pathname.includes('delivery-rider'),
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
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200 backdrop-blur-sm">
            {portals.map((portal) => (
                <button
                    key={portal.name}
                    onClick={() => handleSwitch(portal)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        portal.active 
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                    }`}
                >
                    <portal.icon size={12} className={portal.active ? 'text-indigo-600' : 'text-slate-400'} />
                    <span>{portal.name}</span>
                </button>
            ))}
        </div>
    );

};


export default PortalSwitcher;
