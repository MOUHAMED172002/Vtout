import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, PlusCircle, Wallet, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileBottomNav = () => {
    const navigate = useNavigate();

    const items = [
        { icon: LayoutDashboard, label: 'Bord', to: '/dashboard' },
        { icon: ShoppingBag, label: 'Ventes', to: '/mes-commandes' },
        { icon: PlusCircle, label: 'Ajouter', to: '/ajouter-produit' },
        { icon: Package, label: 'Stocks', to: '/mes-produits' },
        { icon: AlertCircle, label: 'Litiges', to: '/mes-litiges' },
    ];

    return (
        <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[100] md:hidden"
        >
            <div className="mx-4 mb-6 bg-neutral/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[2.5rem] p-2 flex items-center justify-around text-white">
                {items.map((item, idx) => (
                    <NavLink
                        key={idx}
                        to={item.to}
                        className={({ isActive }) => 
                            `relative flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 ${
                                isActive ? 'text-primary scale-110' : 'text-white/40'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-0 h-0'} transition-all`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeTabSeller"
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
