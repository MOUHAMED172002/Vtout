import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  Info,
  User,
  Menu,
  X,
  Search,
  LayoutDashboard,
  LogOut,
  Truck,
  FileText
} from "lucide-react";
import { useUser, UserButton, SignedIn, SignedOut } from "../../lib/clerk-shim";
import { useProfile } from "../context/useProfile";
import SearchBar from '../Shared/SearchBar';
import CartIcon from '../context/CartIcon';
import { motion, AnimatePresence } from "framer-motion";
import { useAppConfig } from "../context/ConfigContext";
import logo from "../../assets/brand/vtout-logo.png";
import ThemeSelector from "../context/ThemeSelector";
import EmailVerificationBanner from "../Shared/EmailVerificationBanner";

const MenuLinks = [
  { id: 1, name: "Accueil", link: "/", icon: <Home size={20} /> },
  { id: 2, name: "Boutique", link: "/products-liste", icon: <ShoppingBag size={20} /> },
  { id: 4, name: "À propos", link: "/about", icon: <Info size={20} /> },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: clerkUser, isSignedIn } = useUser();
  const { user: profileUser } = useProfile();
  const { getConfig } = useAppConfig();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const appName = getConfig('APP_NAME', 'VTOUT');
  const firstLetter = appName.charAt(0);
  const restOfName = appName.slice(1);

  // Dynamic Dashboard Link based on role
  const dashboardLink =
    profileUser?.role === "admin" ? "/admin/dashboard" :
      (profileUser?.role === "fournisseur" || profileUser?.role === "vendeur") ? "/fournisseur/dashboard" :
        profileUser?.role === "livreur" ? "/delivery-rider" :
          "/user/dashboard";

  const isLivreur = profileUser?.role === "livreur";

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? "py-2 glass-nav" : "py-5 bg-transparent"
          }`}
      >
        <EmailVerificationBanner />
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center group"
          >
            <motion.img 
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              src={getConfig('site_logo') || logo} 
              alt={appName} 
              className="h-10 md:h-14 w-auto object-contain transition-transform" 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <ul className="flex items-center gap-8">
              {!isLivreur && MenuLinks.map((item) => (
                <li key={item.id}>
                  <motion.div
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Link
                      to={item.link}
                      className={`text-sm font-bold uppercase tracking-widest transition-colors ${location.pathname === item.link ? "text-primary" : "text-base-content/70 hover:text-base-content"
                        }`}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                </li>
              ))}
              {isLivreur && (
                <li>
                  <span className="text-sm font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-4 py-2 rounded-xl">Espace Livreur</span>
                </li>
              )}
            </ul>

            <div className="h-6 w-px bg-base-300"></div>

            <div className="flex items-center gap-6">
              <ThemeSelector />
              {!isLivreur && <SearchBar />}
              {!isLivreur && <CartIcon />}
              <SignedIn>
                <div className="flex items-center gap-4 pl-2">
                  <Link
                    to={dashboardLink}
                    className="text-sm font-black text-base-content hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </Link>

                  {profileUser?.role === "livreur" && (
                    <Link
                      to="/delivery-rider"
                      className="text-sm font-black text-primary hover:text-primary-focus transition-colors flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-xl"
                    >
                      <Truck size={18} />
                      Livraisons
                    </Link>
                  )}
                  {profileUser?.role === "admin" && (
                    <Link
                      to="/admin/dashboard"
                      className="text-sm font-black text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-xl"
                    >
                      <LayoutDashboard size={18} />
                      Admin
                    </Link>
                  )}
                  {(profileUser?.role === "fournisseur" || profileUser?.role === "vendeur") && (
                    <Link
                      to="/fournisseur/dashboard"
                      className="text-sm font-black text-emerald-500 hover:text-emerald-600 transition-colors flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl"
                    >
                      <LayoutDashboard size={18} />
                      Boutique
                    </Link>
                  )}
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
              <SignedOut>
                <button
                  onClick={() => navigate('/auth/connexion')}
                  className="btn btn-primary btn-sm rounded-full px-6 font-black shadow-lg shadow-primary/20"
                >
                  Se connecter
                </button>
              </SignedOut>
            </div>
          </nav>

          {/* Mobile Right Controls */}
          <div className="flex lg:hidden items-center gap-4">
            {!isLivreur && <SearchBar />}
            {!isLivreur && <CartIcon />}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-base-content"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[80%] max-w-sm bg-base-100 p-8 shadow-2xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-12">
                <img src={getConfig('site_logo') || logo} alt={appName} className="h-10 w-auto object-contain" />
                  <div className="flex items-center gap-2">
                     <ThemeSelector />
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 border border-base-200 rounded-full hover:bg-base-200">
                    <X size={24} />
                  </button>
              </div>

              <nav className="flex-1 space-y-8">
                <ul className="space-y-6">
                  {!isLivreur && MenuLinks.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={item.link}
                        className={`flex items-center gap-4 text-xl font-black group ${location.pathname === item.link ? "text-primary" : "text-base-content"
                          }`}
                      >
                        <span className="p-3 bg-base-200 rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {item.icon}
                        </span>
                        {item.name}
                      </Link>
                    </li>
                  ))}
                  {isLivreur && (
                    <li className="p-6 bg-rose-50 rounded-[2rem] border border-rose-100">
                      <p className="text-rose-500 font-black text-center uppercase tracking-tighter text-2xl">Mode Livreur Actif</p>
                    </li>
                  )}
                </ul>

                <SignedIn>
                  <div className="pt-8 border-t space-y-4">
                    <Link
                      to={dashboardLink}
                      className="flex items-center gap-4 text-xl font-black text-base-content group"
                    >
                      <span className="p-3 bg-base-200 rounded-2xl group-hover:text-primary transition-colors"><LayoutDashboard size={20} /></span>
                      Mon Dashboard
                    </Link>

                    {profileUser?.role === "livreur" && (
                      <Link
                        to="/delivery-rider"
                        className="flex items-center gap-4 text-xl font-black text-primary"
                      >
                        <span className="p-3 bg-primary/10 rounded-2xl"><Truck size={20} /></span>
                        Courses Livreur
                      </Link>
                    )}
                    {profileUser?.role === "admin" && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-4 text-xl font-black text-rose-500"
                      >
                        <span className="p-3 bg-rose-50 rounded-2xl"><LayoutDashboard size={20} /></span>
                        Administration
                      </Link>
                    )}
                  </div>
                </SignedIn>
              </nav>

              <div className="pt-8 border-t">
                <SignedIn>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <UserButton afterSignOutUrl="/" showName />
                    </div>
                  </div>
                </SignedIn>
                <SignedOut>
                  <button
                    onClick={() => navigate('/auth/connexion')}
                    className="btn btn-primary btn-block rounded-2xl h-14 font-black text-lg"
                  >
                    Se connecter
                  </button>
                </SignedOut>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      {!isScrolled && <div className="h-10 lg:h-16"></div>}
    </>
  );
}