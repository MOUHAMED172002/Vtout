import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useClerk } from "../../lib/clerk-shim";
import {
  BarChart3,
  ShoppingBag,
  Heart,
  ShoppingCart,
  MessageCircle,
  Settings,
  LogOut,
  Menu,
  Search,
  MapPin,
  ChevronRight,
  User as UserIcon,
  Bell,
  X as CloseIcon
} from "lucide-react";
import { useProfile } from "../context/useProfile";
import NotificationsBell from "./NotificationsBell";
import ThemeSelector from "../context/ThemeSelector";
import avartar from "../../assets/avatar-placeholder.png";
import { motion, AnimatePresence } from "framer-motion";
import PortalSwitcher from "../Shared/PortalSwitcher";

const NAV_ITEMS = [
  { to: "/user/dashboard", label: "Aperçu", icon: <BarChart3 size={18} /> },
  { to: "/user/dashboard/orders", label: "Mes Commandes", icon: <ShoppingBag size={18} /> },
  { to: "/user/dashboard/favorites", label: "Mes Favoris", icon: <Heart size={18} /> },
  { to: "/user/dashboard/cart", label: "Mon Panier", icon: <ShoppingCart size={18} /> },
  { to: "/user/dashboard/addresses", label: "Mes Adresses", icon: <MapPin size={18} /> },
  { to: "/user/dashboard/settings", label: "Paramètres", icon: <Settings size={18} /> },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut: clerkSignOut } = useClerk();
  const { user, loading } = useProfile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  async function signOut() {
    try {
      await clerkSignOut();
      navigate("/");
    } catch (err) {
      console.error("Sign out error", err);
    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex font-sans text-base-content overflow-x-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-80 bg-base-100 h-screen fixed left-0 top-0 border-r border-base-content/10 z-50 overflow-hidden">
        {/* Decorative Background for Sidebar */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-br from-primary/5 to-transparent -z-10"></div>

        <div className="p-8 mb-4 relative">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
              V
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-800">TOUT</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary -mt-1">Dashboard</span>
            </div>
          </Link>
        </div>

        <div className="flex-1 px-6 space-y-1 overflow-y-auto custom-scrollbar pt-4">
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Compte Client</p>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all duration-300 group ${isActive
                  ? "bg-neutral text-neutral-content shadow-xl shadow-neutral/10"
                  : "text-base-content/70 hover:text-base-content hover:bg-base-200"
                  }`}
              >
                <div className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-primary" : "text-slate-400"}`}>
                  {item.icon}
                </div>
                <span className="text-sm">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="ml-auto"
                  >
                    <ChevronRight size={14} className="text-primary" />
                  </motion.div>
                )}
              </Link>
            );
          })}

          {/* ESPACE PROFESSIONNEL SECTION */}
          {(user?.role === 'fournisseur' || user?.role === 'vendeur' || user?.role === 'livreur') && (
            <div className="mt-8 pt-8 border-t border-base-content/5">
              <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">Espaces Connectés</p>
              <div className="px-2">
                <PortalSwitcher variant="sidebar" />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-50">
          <div className="bg-slate-50 rounded-[2rem] p-6 space-y-4">
            <p className="text-xs font-bold text-slate-500 text-center">Besoin d'aide ?</p>
            <button className="w-full py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              <Link to="/faq">Consulter la FAQ</Link>
            </button>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-4 px-6 py-4 w-full mt-4 rounded-2xl font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all group"
          >
            <div className="group-hover:translate-x-1 transition-transform">
              <LogOut size={18} />
            </div>
            <span className="text-sm">Se Déconnecter</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-80">
        {/* Header */}
        <header className="h-24 bg-base-100/80 backdrop-blur-xl border-b border-base-content/10 flex items-center justify-between px-6 md:px-12 sticky top-0 z-40 transition-all duration-300">
          <div className="flex items-center gap-6 flex-1">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-3 text-base-content bg-base-200 rounded-xl hover:bg-base-300 transition-colors"
            >
              <Menu size={22} />
            </button>
            <div className="hidden lg:block relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" size={18} />
              <input
                type="text"
                placeholder="Chercher un produit, une commande..."
                className="bg-base-200 border-none outline-none rounded-2xl pl-12 pr-6 py-3.5 w-full text-sm font-semibold focus:ring-2 focus:ring-primary/10 bg-base-200/50 hover:bg-base-300 transition-all placeholder:text-base-content/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <ThemeSelector />
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-600 hover:bg-slate-100 transition-all cursor-pointer relative group">
                <NotificationsBell />
              </div>
            </div>

            <div className="h-10 w-px bg-slate-100 hidden sm:block"></div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-base-content group-hover:text-primary transition-colors truncate max-w-[150px]">
                  {user?.fullname || "Client Vtout"}
                </p>
                <div className="flex items-center justify-end gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">En ligne</p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-14 h-14 rounded-2xl p-1 bg-white shadow-xl shadow-slate-200/50 border border-slate-100"
              >
                <img
                  src={user?.avatar_url || avartar}
                  className="w-full h-full object-cover rounded-xl"
                  alt="avatar"
                />
              </motion.div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <main className="flex-1 relative min-w-0 p-4 md:p-12 max-w-7xl mx-auto w-full overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white z-[101] flex flex-col shadow-2xl overflow-hidden lg:hidden"
            >
              <div className="p-8 flex justify-between items-center border-b border-slate-50">
                <Link to="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-primary/30">
                    V
                  </div>
                  <span className="text-xl font-black tracking-tight text-slate-800 uppercase">TOUT</span>
                </Link>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:text-slate-900">
                  <CloseIcon size={24} />
                </button>
              </div>

              <div className="flex-1 p-6 space-y-2 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-4 px-6 py-5 rounded-2xl font-bold transition-all ${isActive
                        ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10"
                        : "text-slate-500"
                        }`}
                    >
                      <div className={isActive ? "text-primary" : "text-slate-400"}>
                        {item.icon}
                      </div>
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="p-8 border-t border-slate-50 space-y-4 bg-slate-50/50">
                <div className="flex items-center gap-4 mb-4">
                  <img src={user?.avatar_url || avartar} className="w-12 h-12 rounded-xl object-cover" alt="user" />
                  <div>
                    <p className="text-sm font-black text-slate-900 line-clamp-1">{user?.fullname || "Client Vtout"}</p>
                    <p className="text-[10px] font-black uppercase text-primary uppercase tracking-widest">Connecté</p>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center gap-4 px-6 py-4 w-full rounded-2xl font-bold text-red-500 bg-red-50 shadow-sm"
                >
                  <LogOut size={20} />
                  <span className="text-sm">Déconnexion</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
