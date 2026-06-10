import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser, useAuth } from "../../lib/AuthHooks";
import { getMyProfile } from "../../services/userService";
import { getMyOrders } from "../../services/orderService";
import { getUserFavorites } from "../../services/favoriteService";
import { getMyCart } from "../../services/cartService";
import { getMyAddresses } from "../../services/addressService";
import {
  ShoppingBag,
  Heart,
  MapPin,
  Clock,
  ChevronRight,
  PackageCheck,
  CreditCard,
  Crown,
  TrendingUp,
  MapPinned,
  ArrowRight,
  ShieldCheck,
  Zap,
  MessageCircle,
  Wallet
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Skeleton,
  ProductSkeleton,
  CategorySkeleton
} from "../Shared/Skeleton";

export default function HomeCards() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [userInfo, setUserInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);

  const navigate = useNavigate();

  const loadUserData = useCallback(async () => {
    if (!isSignedIn || !user) return;
    setLoading(true);
    try {
      const token = await getToken();
      // Simuler un léger délai pour voir les squelettes (optionnel, mais utile pour l'UX si l'API est trop rapide)
      // await new Promise(r => setTimeout(r, 800)); 

      const [profileData, ordersData, favoritesData, cartData, addressesData, walletData] = await Promise.all([
        getMyProfile(token).catch(() => null),
        getMyOrders(token).catch(() => []),
        getUserFavorites(token).catch(() => []),
        getMyCart(token).catch(() => []),
        getMyAddresses(token).catch(() => []),
        fetch(`${import.meta.env.VITE_API_URL}/financials/my-status`, { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.ok ? r.json() : null)
          .catch(() => null)
      ]);

      setUserInfo(profileData || { fullname: user.fullName, email: user.primaryEmailAddress?.emailAddress, avatar_url: user.imageUrl });
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
      setCart(Array.isArray(cartData) ? cartData : []);
      setAddress(Array.isArray(addressesData) ? addressesData.find(a => a.is_default) || addressesData[0] : null);
      setWalletBalance(walletData?.balance ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, isSignedIn, getToken]);

  useEffect(() => {
    if (isLoaded && isSignedIn) loadUserData();
  }, [isLoaded, isSignedIn, loadUserData]);

  if (loading) return (
    <div className="space-y-12 max-w-[1200px] animate-pulse">
      {/* Hero Skeleton */}
      <div className="bg-slate-100 rounded-[3rem] p-10 md:p-20 h-[400px]">
        <div className="space-y-6 max-w-lg">
          <Skeleton className="w-32 h-8 rounded-full" />
          <Skeleton className="w-full h-16 rounded-2xl" />
          <Skeleton className="w-3/4 h-16 rounded-2xl" />
          <Skeleton className="w-1/2 h-6 rounded-full" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-50 flex justify-between items-center h-40">
            <div className="space-y-3">
              <Skeleton className="w-20 h-3 rounded-full" />
              <Skeleton className="w-12 h-10 rounded-xl" />
            </div>
            <Skeleton className="w-20 h-20 rounded-[2rem]" />
          </div>
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <Skeleton className="w-48 h-10 rounded-2xl ml-4" />
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="w-full h-24 rounded-[2.5rem]" />
          ))}
        </div>
        <div className="lg:col-span-4 space-y-8">
          <Skeleton className="w-48 h-10 rounded-2xl" />
          <Skeleton className="w-full h-64 rounded-[3rem]" />
        </div>
      </div>
    </div>
  );

  const stats = [
    { label: "Mes Commandes", value: orders.length, icon: <ShoppingBag size={22} />, color: "text-blue-600", bg: "bg-blue-50", to: "/user/dashboard/orders" },
    { label: "Liste de souhaits", value: favorites.length, icon: <Heart size={22} />, color: "text-rose-600", bg: "bg-rose-50", to: "/user/dashboard/favorites" },
    { label: "Articles au panier", value: cart.length, icon: <CreditCard size={22} />, color: "text-emerald-600", bg: "bg-emerald-50", to: "/user/dashboard/cart" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-12 max-w-[1200px]"
    >
      {/* Welcome Hero Section */}
      <motion.div
        variants={item}
        className="relative bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-6 sm:p-10 md:p-20 text-white overflow-hidden shadow-[0_20px_100px_rgba(0,0,0,0.15)]"
      >
        {/* Abstract Background Shapes */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-5 md:space-y-8">
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
              <Crown size={14} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900/80">Membre Privilège Vtout</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
              Ravi de vous <br />
              <span className="text-primary">revoir, {userInfo?.fullname?.split(" ")[0]} !</span>
            </h1>

            <p className="text-slate-400 font-bold text-sm md:text-lg max-w-md leading-relaxed">
              Votre dashboard est à jour. Vous avez <span className="text-slate-200">{orders.length} commandes</span> en cours et des offres exclusives vous attendent.
            </p>

            <div className="flex flex-wrap gap-3 md:gap-4 pt-2 md:pt-4">
              <Link to="/products-liste" className="btn btn-primary rounded-2xl px-6 md:px-10 h-12 md:h-16 text-sm font-black shadow-2xl shadow-primary/40 gap-2 group border-none">
                Shopping Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex -space-x-3 items-center">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black italic">
                    {i === 3 ? "+12k" : "U" + i}
                  </div>
                ))}
                <p className="ml-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Clients Trust Us</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Dernier Achat</span>
                <Zap size={16} className="text-yellow-400" />
              </div>
              {orders[0] ? (
                <div className="space-y-1">
                  <p className="text-2xl font-black truncate">#{orders[0].id.slice(0, 10)}</p>
                  <p className="text-primary font-black">{orders[0].total_amount.toLocaleString()} FCFA</p>
                </div>
              ) : (
                <p className="text-slate-500 font-bold italic">Aucun achat récent</p>
              )}
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: "70%" }} className="h-full bg-primary" />
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-400">
                <ShieldCheck size={14} /> Paiement Sécurisé
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 md:gap-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            variants={item}
            whileHover={{ y: -6 }}
            className="bg-white p-4 md:p-10 rounded-[1.5rem] md:rounded-[3rem] border border-slate-100 shadow-[0_10px_50px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center md:justify-between gap-3 group transition-all"
          >
            <div className="space-y-0.5 md:space-y-1">
              <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.1rem] md:tracking-[0.2rem] leading-tight">{stat.label}</p>
              <p className="text-2xl md:text-5xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
              <Link to={stat.to} className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Gérer <ChevronRight size={10} />
              </Link>
            </div>
            <div className={`w-10 h-10 md:w-20 md:h-20 rounded-[1rem] md:rounded-[2rem] ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-all duration-500 shrink-0`}>
              {stat.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Wallet Banner — only shown when balance > 0 */}
      {walletBalance > 0 && (
        <motion.div
          variants={item}
          whileHover={{ y: -4 }}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 text-white shadow-lg shadow-emerald-200/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 sm:w-14 sm:h-14 bg-white/20 rounded-[1rem] sm:rounded-[1.2rem] flex items-center justify-center shrink-0">
              <Wallet size={22} className="text-white sm:hidden" />
              <Wallet size={28} className="text-white hidden sm:block" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100 mb-0.5">Votre portefeuille</p>
              <p className="text-2xl sm:text-4xl font-black tracking-tighter">{walletBalance.toLocaleString("fr-FR")} F</p>
            </div>
          </div>
          <Link
            to="/user/dashboard/wallet"
            className="btn btn-sm bg-white text-emerald-700 hover:bg-emerald-50 border-none font-black rounded-2xl px-5 h-11 shadow-md text-xs whitespace-nowrap w-full sm:w-auto flex items-center justify-center"
          >
            Gérer le portefeuille →
          </Link>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Recent Activity */}
        <div className="lg:col-span-8 space-y-10">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <TrendingUp size={22} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Commandes Récentes</h2>
                <p className="text-xs font-bold text-slate-400">Suivi de vos derniers achats</p>
              </div>
            </div>
            <Link to="/user/dashboard/orders" className="text-xs font-black text-primary hover:underline bg-primary/5 px-6 py-3 rounded-2xl uppercase tracking-widest">Voir Tout</Link>
          </div>

          {/* ── Status helpers ── */}
          {(() => {
            const STATUS_LABEL = { en_attente: 'En attente', confirmee: 'Confirmée', confirmée: 'Confirmée', expediee: 'Expédiée', expédiée: 'Expédiée', livree: 'Livrée', livrée: 'Livrée', annulee: 'Annulée', annulée: 'Annulée' };
            const STATUS_COLOR = { en_attente: 'bg-amber-50 text-amber-600', confirmee: 'bg-emerald-50 text-emerald-600', confirmée: 'bg-emerald-50 text-emerald-600', expediee: 'bg-blue-50 text-blue-600', expédiée: 'bg-blue-50 text-blue-600', livree: 'bg-emerald-50 text-emerald-600', livrée: 'bg-emerald-50 text-emerald-600', annulee: 'bg-rose-50 text-rose-600', annulée: 'bg-rose-50 text-rose-600' };
            return (
          <div className="space-y-3">
            {orders.length > 0 ? (
              orders.slice(0, 4).map((order) => {
                const d = new Date(order.created_at || order.createdAt);
                const dateStr = isNaN(d.getTime()) ? '' : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                const label = STATUS_LABEL[order.status] || order.status;
                const color = STATUS_COLOR[order.status] || 'bg-orange-50 text-orange-600';
                return (
                  <Link key={order.id} to={`/user/dashboard/orders/${order.id}`} className="block">
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="bg-white px-4 py-4 rounded-[1.8rem] border border-slate-100 flex items-center gap-3 hover:shadow-md hover:border-slate-200 transition-all group active:scale-[0.99]"
                    >
                      {/* Icon */}
                      <div className="w-11 h-11 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <ShoppingBag size={18} />
                      </div>

                      {/* Content — two rows */}
                      <div className="flex-1 min-w-0">
                        {/* Row 1 : ref + montant */}
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-black text-slate-900 text-sm tracking-tight truncate">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="font-black text-slate-900 text-sm shrink-0">
                            {Number(order.total_amount).toLocaleString('fr-FR')} F
                          </p>
                        </div>
                        {/* Row 2 : date + badge */}
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-[11px] font-bold text-slate-400">{dateStr}</p>
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${color}`}>
                            {label}
                          </span>
                        </div>
                      </div>

                      {/* Chevron */}
                      <ChevronRight size={14} className="text-slate-300 shrink-0 group-hover:text-primary transition-colors" />
                    </motion.div>
                  </Link>
                );
              })
            ) : (
              <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-100 text-center space-y-6">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <ShoppingBag size={40} className="text-slate-200" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900">Aucune commande</h3>
                  <p className="text-slate-400 font-bold max-w-xs mx-auto text-sm">C'est le moment idéal pour découvrir nos nouvelles pépites technologiques.</p>
                </div>
                <Link to="/products-liste" className="btn btn-primary rounded-2xl px-10 h-14 font-black shadow-lg shadow-primary/20 border-none">Explorer la Boutique</Link>
              </div>
            )}
          </div>
            );
          })()}
        </div>

        {/* Sidebar Mini Column */}
        <div className="lg:col-span-4 space-y-10">
          <div className="space-y-8">
            <div className="flex items-center gap-4 px-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                <MapPinned size={22} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Expédition</h2>
            </div>

            {address ? (
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden relative group">
                {/* Dark header */}
                <div className="bg-slate-900 p-8 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-[0.06] pointer-events-none">
                    <MapPinned size={80} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">
                      {address.is_default ? "Adresse par défaut" : address.label || "Adresse de livraison"}
                    </p>
                    <p className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
                      {address.quartier_label}
                    </p>
                    <p className="text-slate-400 font-bold text-sm mt-1">
                      {address.commune_label}{address.departement_label ? `, ${address.departement_label}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest relative z-10">
                    <PackageCheck size={14} /> Zone livrable
                  </div>
                </div>

                {/* Details */}
                <div className="p-8 space-y-4">
                  {address.phone && (
                    <div className="flex items-center gap-3 text-sm text-slate-600 font-bold">
                      <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-primary">
                        <MapPin size={14} />
                      </div>
                      {address.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-slate-600 font-bold">
                    <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-primary">
                      <PackageCheck size={14} />
                    </div>
                    Livraison estimée : 2448h
                  </div>
                  <Link
                    to="/user/dashboard/addresses"
                    className="flex items-center justify-center gap-2 w-full h-12 mt-2 bg-slate-50 hover:bg-slate-100 rounded-2xl font-black text-slate-700 text-xs uppercase tracking-widest transition-all border border-transparent hover:border-slate-200"
                  >
                    Gérer mes adresses <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white p-10 rounded-[3rem] border-2 border-dashed border-slate-100 space-y-6 text-center">
                <div className="w-16 h-16 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center mx-auto">
                  <MapPinned size={28} />
                </div>
                <div className="space-y-2">
                  <p className="font-black text-slate-900">Aucune adresse</p>
                  <p className="text-slate-400 font-bold text-sm">
                    Ajoutez une adresse de livraison pour recevoir vos commandes.
                  </p>
                </div>
                <Link
                  to="/user/dashboard/addresses"
                  className="btn btn-primary btn-block h-12 rounded-2xl font-black border-none shadow-lg shadow-primary/20 text-sm"
                >
                  Ajouter une adresse
                </Link>
              </div>
            )}
          </div>


          <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <MessageCircle size={100} />
            </div>

            <div className="space-y-3 relative z-10">
              <h3 className="font-black text-2xl tracking-tight">Support <span className="text-primary">Direct.</span></h3>
              <p className="text-slate-400 text-sm font-bold leading-relaxed">
                Une question sur un produit ? <br />
                Nos experts vous répondent en moins de 5 minutes.
              </p>
            </div>

            <button
              onClick={() => window.dispatchEvent(new Event('open-support-chat'))}
              className="btn btn-primary btn-block h-14 rounded-2xl font-black shadow-2xl shadow-primary/30 border-none relative z-10"
            >
              Parler à un agent
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
