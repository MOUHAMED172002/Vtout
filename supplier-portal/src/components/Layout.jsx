import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Package, PlusCircle, LogOut,
    Store, Menu, X, ChevronRight, Bell, FileText
} from 'lucide-react';

const navLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/ajouter-produit', icon: PlusCircle, label: 'Ajouter un produit' },
    { to: '/conditions', icon: FileText, label: 'Conditions & Politiques' },
];

const Sidebar = ({ mobile, onClose }) => {
    const { user } = useUser();
    const { signOut } = useClerk();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <aside className="w-72 bg-slate-900 text-white flex flex-col h-screen overflow-hidden">
            {/* Logo */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center">
                        <Store size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="font-black text-sm leading-none">Portail</p>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Fournisseur</p>
                    </div>
                </div>
                {mobile && (
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* User Info */}
            <div className="p-6 mx-4 my-4 bg-white/5 rounded-2xl flex items-center gap-3">
                <img
                    src={user?.imageUrl}
                    alt={user?.firstName}
                    className="w-10 h-10 rounded-xl object-cover"
                />
                <div className="overflow-hidden">
                    <p className="font-black text-sm truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-[10px] text-white/40 font-bold truncate">{user?.primaryEmailAddress?.emailAddress}</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/20 px-4 mb-3">Menu</p>
                {navLinks.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group ${isActive
                                ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/30'
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <Icon size={18} />
                        <span className="flex-1">{label}</span>
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all"
                >
                    <LogOut size={18} />
                    <span>Se déconnecter</span>
                </button>
            </div>
        </aside>
    );
};

const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-shrink-0">
                <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        />
                        <motion.div
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed left-0 top-0 h-full z-50 md:hidden"
                        >
                            <Sidebar mobile onClose={() => setSidebarOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                    <button onClick={() => setSidebarOpen(true)} className="text-slate-600 hover:text-slate-900 transition-colors">
                        <Menu size={22} />
                    </button>
                    <div className="flex items-center gap-2">
                        <Store size={18} className="text-indigo-500" />
                        <span className="font-black text-sm">Portail Fournisseur</span>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <Bell size={20} />
                    </button>
                </header>

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
