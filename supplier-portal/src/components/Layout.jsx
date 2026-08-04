import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser, useClerk, useAuth } from './clerk-shim';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Package, PlusCircle, LogOut,
    Store, Menu, X, ChevronRight, Bell, FileText, Wallet, TrendingUp, ShoppingBag, Search as SearchIcon, Sparkles, AlertCircle, BadgeCheck
} from 'lucide-react';
import NotificationCenter from './Shared/NotificationCenter';
import ThemeSelector from './Shared/ThemeSelector';
import PortalSwitcher from './Shared/PortalSwitcher';
import LogoText from './Shared/LogoText';
import ProfileReminderModal from './Shared/ProfileReminderModal';



const navLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/mes-boutiques', icon: Store, label: 'Mes Boutiques' },
    { to: '/mes-commandes', icon: ShoppingBag, label: 'Mes Commandes' },
    { to: '/mes-produits', icon: Package, label: 'Mes Produits' },
    { to: '/promotions', icon: Sparkles, label: 'Mes Promotions' },
    { to: '/ajouter-produit', icon: PlusCircle, label: 'Ajouter un produit' },
    { to: '/portefeuille', icon: Wallet, label: 'Mon Portefeuille' },
    { to: '/badge-certifie', icon: BadgeCheck, label: 'Badge Certifié' },
    { to: '/statistiques', icon: TrendingUp, label: 'Statistiques' },
    { to: '/mes-litiges', icon: AlertCircle, label: 'Mes Litiges' },
    { to: '/conditions', icon: FileText, label: 'Conditions & Politiques' },
];

const Sidebar = ({ mobile, onClose }) => {
    const { user } = useUser();
    const { signOut } = useClerk();
    const { getToken } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const handleSwitchRole = async (newRole) => {
        try {
            const token = await getToken();
            await api.post('/profiles/switch-role', { newRole }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Passage au rôle ${newRole} réussi !`);
            window.location.href = '/'; // Refresh to apply changes
        } catch (err) {
            toast.error("Échec du changement de rôle");
        }
    };

    return (
        <aside className="w-72 bg-neutral text-white flex flex-col h-screen overflow-hidden">
            {/* Logo */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div 
                    onClick={() => (window.location.href = import.meta.env.VITE_MAIN_SITE_URL || 'https://vtout.com')} 
                    className="flex items-center gap-3 cursor-pointer group"
                    title="Retour au site principal"
                >
                    <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Store size={20} className="text-white" />
                    </div>
                    <div>
                        <LogoText className="text-sm leading-none group-hover:text-primary transition-colors" />
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Espace Marchand</p>
                    </div>
                </div>
                {mobile && (
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="px-8 py-4">
                <PortalSwitcher />
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
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/20 px-4 mb-3">Menu</p>
                {navLinks.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group ${isActive
                                ? 'bg-primary text-white shadow-xl shadow-primary/30'
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

            <div className="p-4 border-t border-white/5 space-y-2">
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 transition-all"
                >
                    <LogOut size={16} />
                    <span>Déconnexion</span>
                </button>
            </div>
        </aside>
    );
};



const Layout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [supplierProfile, setSupplierProfile] = useState(null);
    const [boutiques, setBoutiques] = useState([]);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    const { getToken } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSupplierData = async () => {
            try {
                const token = await getToken();
                if (!token) return;
                const [profileRes, boutiquesRes] = await Promise.all([
                    api.get('/suppliers/me', { headers: { Authorization: `Bearer ${token}` } }),
                    api.get('/suppliers/me/boutiques', { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setSupplierProfile(profileRes.data);
                setBoutiques(boutiquesRes.data || []);
            } catch (err) {
                console.error("Supplier data fetch error in Layout:", err);
            }
        };
        fetchSupplierData();
    }, [getToken]);

    const isProfileIncomplete = useMemo(() => {
        if (!supplierProfile) return false;
        // Require at least one complete boutique
        if (boutiques.length === 0) return true;
        return !boutiques.some(b => 
            b.name && b.phone && b.address_line && 
            b.departement_id && b.commune_id && b.quartier_id
        );
    }, [supplierProfile, boutiques]);

    useEffect(() => {
        if (isProfileIncomplete) {
            const hasShown = sessionStorage.getItem('profile_reminder_shown');
            if (!hasShown) {
                setShowReminderModal(true);
            }
        }
    }, [isProfileIncomplete]);

    const handleCloseReminder = () => {
        setShowReminderModal(false);
        sessionStorage.setItem('profile_reminder_shown', 'true');
    };

    return (
        <div className="flex h-screen overflow-hidden bg-base-200">
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
                {/* Header / TopBar */}
                <header className="bg-base-100 border-b border-base-300 px-6 md:px-12 py-4 flex items-center justify-between z-30">
                    <div className="flex items-center gap-4 flex-1">
                        <button onClick={() => setSidebarOpen(true)} className="md:hidden text-base-content/70 hover:text-base-content transition-colors">
                            <Menu size={22} />
                        </button>
                        
                        {/* Desktop Search Bar */}
                        <div className="hidden lg:flex items-center flex-1 max-w-md ml-4">
                            <div className="relative w-full group">
                                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary transition-colors" size={18} />
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher une commande, un produit..." 
                                    className="w-full pl-12 pr-4 py-2.5 bg-base-200 border border-base-300 rounded-2xl text-xs font-bold text-base-content placeholder:text-base-content/40 focus:bg-base-100 focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all outline-none"
                                />
                                {searchQuery && (
                                    <button 
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-base-300 rounded-md text-base-content/40"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="lg:hidden flex items-center gap-2">
                            <Store size={18} className="text-primary" />
                            <LogoText className="text-xs" /> <span className="font-black text-xs text-base-content/40">Merchant</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="lg:hidden">
                            <button 
                                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                                className={`p-2 rounded-xl transition-all ${isMobileSearchOpen ? 'bg-primary/10 text-primary' : 'text-base-content/40 hover:text-primary'}`}
                            >
                                <SearchIcon size={20} />
                            </button>
                            
                            <AnimatePresence>
                                {isMobileSearchOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute left-0 right-0 top-full p-4 bg-base-100 border-b border-base-300 shadow-xl"
                                    >
                                        <div className="relative group">
                                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                                            <input 
                                                autoFocus
                                                type="text" 
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Rechercher..." 
                                                className="w-full pl-12 pr-10 py-3 bg-base-200 rounded-2xl text-sm font-bold focus:ring-0 outline-none border-none"
                                            />
                                            {searchQuery && (
                                                <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40">
                                                    <X size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <ThemeSelector />
                        <NotificationCenter />
                    </div>

                </header>

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto">
                    {isProfileIncomplete && (
                        <div className="bg-amber-50 border-b border-amber-100 px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-20">
                            <div className="flex items-center gap-3">
                                <Bell className="text-amber-500 animate-bounce" size={20} />
                                <div>
                                    <p className="text-sm font-black text-amber-900">Action requise : Boutique Incomplète</p>
                                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">
                                        Veuillez créer ou compléter vos informations de boutique pour vendre vos produits.
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate('/mes-boutiques')} 
                                className="px-6 py-2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
                            >
                                Gérer mes boutiques
                            </button>
                        </div>
                    )}
                    {React.Children.map(children, child => {
                        if (React.isValidElement(child)) {
                            return React.cloneElement(child, { globalSearchQuery: searchQuery });
                        }
                        return child;
                    })}
                </main>
            </div>
            
            <ProfileReminderModal 
                isOpen={showReminderModal} 
                onClose={handleCloseReminder} 
            />
        </div>

    );
};

export default Layout;
