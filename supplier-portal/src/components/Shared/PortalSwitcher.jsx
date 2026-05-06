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
            hasRole: true // Everyone is a buyer
        },
        {
            name: isSupplier || isAdmin ? 'Vendeur' : 'Vendre',
            role: 'fournisseur',
            icon: Store,
            url: isSupplier || isAdmin ? SUPPLIER_URL + '/dashboard' : MAIN_SITE_URL + '/fournisseur/inscription',
            active: window.location.host.includes('vendeur') || role === 'fournisseur',
            hasRole: isSupplier || isAdmin
        },
        {
            name: isDelivery || isAdmin ? 'Livreur' : 'Livrer',
            role: 'livreur',
            icon: Truck,
            url: isDelivery || isAdmin ? MAIN_SITE_URL + '/delivery-rider/dashboard' : MAIN_SITE_URL + '/devenir-livreur',
            active: window.location.pathname.includes('delivery-rider') || role === 'livreur',
            hasRole: isDelivery || isAdmin
        }
    ];

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
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl border border-white/5 backdrop-blur-md">
            {portals.map((portal) => (
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
