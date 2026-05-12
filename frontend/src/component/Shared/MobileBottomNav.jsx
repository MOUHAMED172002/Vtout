import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Store, Truck, LayoutDashboard, Search, User, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../lib/AuthHooks';

const MobileBottomNav = () => {
    const { role, isAdmin, isSupplier, isDelivery } = useAuth();
    const location = useLocation();

    const isLivreurMode = location.pathname.includes('delivery-rider');
    const isSupplierPortal = window.location.host.includes('vendeur') || window.location.port === '5174';

    const getNavItems = () => {
        if (isLivreurMode) {
            return [
                { icon: LayoutDashboard, label: 'Dashboard', to: '/delivery-rider/dashboard' },
                { icon: Truck, label: 'Livraisons', to: '/delivery-rider/missions' },
                { icon: Wallet, label: 'Gains', to: '/delivery-rider/wallet' },
                { icon: User, label: 'Profil', to: '/user/dashboard' },
            ];
        }

        // Default Buyer items
        return [
            { icon: Home, label: 'Accueil', to: '/' },
            { icon: Search, label: 'Explorer', to: '/products-liste' },
            { icon: ShoppingBag, label: 'Panier', to: '/cartpage' },
            { icon: LayoutDashboard, label: 'Moi', to: '/user/dashboard' },
        ];
    };

    const items = getNavItems();

    return (
        <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden"
        >
            {/* Glass Background */}
            <div className="mx-4 mb-6 bg-white/80 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-[2.5rem] p-2 flex items-center justify-around">
                {items.map((item, idx) => (
                    <NavLink
                        key={idx}
                        to={item.to}
                        className={({ isActive }) => 
                            `relative flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 ${
                                isActive ? 'text-primary scale-110' : 'text-slate-400'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-0 h-0'} transition-all`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeTab"
                                        className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </motion.div>
    );
};

export default MobileBottomNav;
