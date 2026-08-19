import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Package,
  ShoppingBag,
  Settings,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Plus,
  Search,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  MessageCircle,
  Activity,
  DollarSign,
  Store,
  ArrowRight,
  Filter,
  MoreVertical,
  Banknote,
  FileText,
  MapPin,
  PenTool,
  BarChart3,
  UserCircle,
  BadgeCheck,
  Ticket,
  Share2,
  Megaphone,
  Cloud
} from "lucide-react";
import DashboardPage from "./Dashboard/Dashboard";
import SalesChart from "./Dashboard/SalesChart";
import TopProducts from "./Dashboard/TopProducts";
import RecentOrders from "./Dashboard/RecentOrders";
import QuickStats from "./Dashboard/QuickStats";
import SearchAnalytics from "./Dashboard/SearchAnalytics";
import ProductsAdmin from "./Product/ProductsAdmin";
import AddProductModal from "./Product/AddProductModal";
import ProductImagesUploader from "./Product/ProductImagesUploader";
import SuppliersManager from "./Fournisseurs/SuppliersManager";
import SupplierProductsApproval from "./Fournisseurs/SupplierProductsApproval";
import OrdersAdmin from "./Order/OrdersAdmin";
import OrderDetailsModal from "./Order/OrderDetailsModal";
import OrderStatusBadge from "./Order/OrderStatusBadge";
import LivreurManager from "./AdminDelivery/LivreurManager";
import AdminControlTower from "./AdminDelivery/AdminControlTower";
import CashControl from "./AdminDelivery/CashControl";
import DailyStats from "./AdminDelivery/DailyStats";
import UsersAdmin from "./UserAdmin/UsersAdmin";
import UserDetailsModal from "./UserAdmin/UserDetailsModal";
import UserStatusToggle from "./UserAdmin/UserStatusToggle";
import PayoutManager from "./Finance/PayoutManager";
import StoreSettings from "./Setting/StoreSettings";
import PaymentSettings from "./Setting/PaymentSettings";
import ShippingSettings from "./Setting/ShippingSettings";
import AdminAccountSettings from "./Setting/AdminAccountSettings";
import NotificationsSettings from "./Setting/NotificationsSettings";
import WhatsAppSettings from "./Setting/WhatsAppSettings";
import CloudinarySettings from "./Setting/CloudinarySettings";
import FaqManager from "./FaqManager";
import PolicyManager from "./PolicyManager";
import GeographyManager from "./GeographyManager";
import SupportAdmin from "./Support/SupportAdmin";
import ConfigManager from "./ConfigManager";
import BlogManager from "./Blog/BlogManager";
import DeliveryFeeTiersManager from "./Setting/DeliveryFeeTiersManager";
import DeliveryMultiplierManager from "./Setting/DeliveryMultiplierManager";
import CategorySelect from "./Product/CategorySelect";
import VariantManager from "./Product/VariantManager";
import DisputeManager from "./DisputeManager";
import InvoiceButton from "./Order/InvoiceButton";
import DeliveryManager from "./Order/DeliveryManager";
import FournisseurListe from "./Product/FournisseurListe";
import BoutiquesCatalogManager from "./Fournisseurs/BoutiquesCatalogManager";
import SellerBadgeManager from "./Fournisseurs/SellerBadgeManager";
import CouponManager from "./Marketing/CouponManager";
import ReferralAdminManager from "./Marketing/ReferralAdminManager";
import AdDistributionManager from "./Marketing/AdDistributionManager";
// import KitsManager from "./Kits/KitsManager"; // KIT PROMOTIONS — DÉSACTIVÉ
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../lib/AuthHooks";
import { useNavigate } from "react-router-dom";
import PortalSwitcher from "../Shared/PortalSwitcher";
import ThemeSelector from "../context/ThemeSelector";
import NotificationCenter from "../Shared/NotificationCenter";
import TourHelpButton from "../Shared/TourHelpButton";
import TourAnchor from "../../tour/TourAnchor";
import { useTour } from "../../tour/TourContext";
import { ADMIN_TOUR_STEPS } from "../../tour/tourSteps";
import { normalizeSearch } from "../../lib/textSearch";
import AdminHelpCenter from "./Shared/AdminHelpCenter";
import { HelpCircle } from "lucide-react";

// Ancres de la visite guidée (voir src/tour/tourSteps.js#ADMIN_TOUR_STEPS) —
// seules les sections couvertes par une étape ont une entrée ici.
const ADMIN_TOUR_ANCHOR_MAP = {
  Dashboard: "tour-admin-dashboard",
  Produits: "tour-admin-produits",
  Fournisseurs: "tour-admin-fournisseurs",
  Commandes: "tour-admin-commandes",
  Logistique: "tour-admin-logistique",
  Utilisateurs: "tour-admin-utilisateurs",
};

const ADMIN_TOUR_SEEN_KEY = "vtout_tour_admin_seen";

const AdminLayout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { start: startTour } = useTour();
  const [selectedMenu, setSelectedMenu] = useState("Dashboard");

  const [selectedSub, setSelectedSub] = useState("overview");
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Closed by default on mobile
  const [openMenu, setOpenMenu] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Auto-close sidebar on mobile when menu changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Visite guidée : proposée une seule fois, au premier accès à l'admin. On force
  // le tiroir ouvert (utile sur mobile où il est fermé par défaut) avant de démarrer.
  useEffect(() => {
    if (localStorage.getItem(ADMIN_TOUR_SEEN_KEY)) return;
    const t = setTimeout(() => {
      setSidebarOpen(true);
      startTour(ADMIN_TOUR_STEPS);
    }, 600);
    localStorage.setItem(ADMIN_TOUR_SEEN_KEY, "true");
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const menuItems = [
    // ... (rest of menuItems remains same)
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      subItems: [
        { key: "overview", name: "Vue d'ensemble", icon: <Activity size={16} /> },
        { key: "sales", name: "Analyses des ventes", icon: <BarChart3 size={16} /> },
        { key: "searchAnalytics", name: "Mots-clés recherchés", icon: <Search size={16} /> },
      ],
    },
    {
      name: "Produits",
      icon: <Package size={18} />,
      subItems: [
        { key: "productsList", name: "Tous les produits", icon: <Package size={16} /> },
        { key: "addProduct", name: "Ajouter un produit", icon: <Plus size={16} /> },
        { key: "editProduct", name: "Liste des marques", icon: <Plus size={16} /> },
        { key: "categories", name: "Gestion Catégories", icon: <Plus size={16} /> },
        { key: "variants", name: "Gestion Variantes", icon: <Plus size={16} /> },
      ],
    },
    {
      name: "Fournisseurs",
      icon: <Store size={18} />,
      subItems: [
        { key: "suppliersList", name: "Validation Fournisseurs", icon: <Users size={16} /> },
        { key: "productsApproval", name: "Validation Produits", icon: <Package size={16} /> },
        { key: "boutiquesCatalog", name: "Catalogue Boutiques", icon: <Store size={16} /> },
        { key: "sellerBadge", name: "Vendeur Vérifié", icon: <BadgeCheck size={16} /> },
      ],
    },
    {
      name: "Commandes",
      icon: <ShoppingBag size={18} />,
      subItems: [
        { key: "ordersList", name: "Toutes les commandes", icon: <Clock size={16} /> },
        { key: "disputes", name: "Retours & Litiges", icon: <AlertCircle size={16} /> },
        { key: "delivery", name: "Livraison", icon: <Truck size={16} /> },
      ],
    },
    {
      name: "Logistique",
      icon: <Truck size={18} />,
      subItems: [
        { key: "livreurs", name: "Validation Livreurs", icon: <Users size={16} /> },
        { key: "controlTower", name: "Tour de Contrôle", icon: <Activity size={16} /> },
        { key: "cashControl", name: "Contrôle Cash", icon: <DollarSign size={16} /> },
        { key: "dailyStats", name: "Stats Journalières", icon: <BarChart3 size={16} /> },
      ],
    },
    {
      name: "Utilisateurs",
      icon: <Users size={18} />,
      subItems: [
        { key: "usersList", name: "Liste utilisateurs", icon: <UserCircle size={16} /> },
      ],
    },
    {
      name: "Contenu & Blog",
      icon: <FileText size={18} />,
      subItems: [
        { key: "blog", name: "Articles de Blog", icon: <PenTool size={16} /> },
        { key: "faq", name: "FAQ", icon: <FileText size={16} /> },
        { key: 'policy', name: 'Politique de confidentialité', icon: <FileText size={16} /> },
      ],
    },
    /* KIT PROMOTIONS — DÉSACTIVÉ
    {
      name: "Promotions",
      icon: <Package size={18} />,
      subItems: [
        { key: "kitsList", name: "Kits & Packs", icon: <Package size={16} /> },
      ],
    },
    */
    {
      name: "Marketing",
      icon: <Ticket size={18} />,
      subItems: [
        { key: "coupons", name: "Codes Promo", icon: <Ticket size={16} /> },
        { key: "referrals", name: "Parrainage", icon: <Share2 size={16} /> },
        { key: "adDistribution", name: "Distribution WhatsApp", icon: <Megaphone size={16} /> },
      ],
    },
    {
      name: "Finances",
      icon: <DollarSign size={18} />,
      subItems: [
        { key: "payouts", name: "Retraits Partenaires", icon: <Banknote size={16} /> },
      ],
    },
    {
      name: "Paramètres",
      icon: <Settings size={18} />,
      subItems: [
        { key: 'config', name: 'Configuration Royale', icon: <Settings size={16} />, keywords: ['branding', 'reseaux sociaux', 'general'] },
        { key: 'store', name: 'Boutique', icon: <Store size={16} /> },
        { key: 'payment', name: 'Paiement', icon: <Banknote size={16} />, keywords: ['fedapay'] },
        { key: 'shipping', name: 'Livraison', icon: <Truck size={16} />, keywords: ['zones', 'frais'] },
        { key: 'whatsapp', name: 'WhatsApp', icon: <MessageCircle size={16} />, keywords: ['whatchimp', 'green api', 'otp', 'template'] },
        { key: 'cloudinary', name: 'Cloudinary', icon: <Cloud size={16} />, keywords: ['images', 'upload', 'stockage'] },
        { key: 'notifications', name: '📧 Email & Notifications', icon: <MessageCircle size={16} /> },
        { key: 'geography', name: 'Géographie', icon: <MapPin size={16} /> },
        { key: 'supportMessages', name: 'Messages Support', icon: <MessageCircle size={16} /> },
        { key: 'deliveryFeeTiers', name: '🚚 Frais de Livraison', icon: <Truck size={16} /> },
        { key: 'deliveryMultiplier', name: '📦 Coefficient Livreur', icon: <Package size={16} />, keywords: ['multiplicateur'] },
        { key: 'adminAccount', name: 'Compte Admin', icon: <UserCircle size={16} />, keywords: ['mot de passe', 'email admin'] },
      ],
    },
  ];

  // Index plat de TOUTES les sections/sous-sections du menu (Dashboard,
  // Produits, Fournisseurs... jusqu'à Paramètres) — reconstruit à chaque
  // rendu (coût négligeable) pour que la barre de recherche du header
  // puisse naviguer directement vers n'importe quel élément, pas seulement
  // filtrer la page actuellement affichée.
  const adminSearchIndex = useMemo(
    () => menuItems.flatMap((menu) =>
      menu.subItems.map((sub) => ({
        menu: menu.name,
        menuIcon: menu.icon,
        key: sub.key,
        name: sub.name,
        icon: sub.icon,
        keywords: sub.keywords || [],
      }))
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const navResults = useMemo(() => {
    const q = normalizeSearch(searchQuery);
    if (q.length < 2) return [];
    return adminSearchIndex.filter((item) => {
      if (normalizeSearch(item.name).includes(q)) return true;
      if (normalizeSearch(item.menu).includes(q)) return true;
      return item.keywords.some((k) => normalizeSearch(k).includes(q));
    }).slice(0, 8);
  }, [searchQuery, adminSearchIndex]);

  const goToSearchResult = (result) => {
    setSelectedMenu(result.menu);
    setOpenMenu(result.menu);
    setSelectedSub(result.key);
    setSearchQuery("");
    setSearchFocused(false);
    setIsMobileSearchOpen(false);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case "Dashboard":
        switch (selectedSub) {
          case "overview": return <DashboardPage changeTab={(menu, sub) => { setSelectedMenu(menu); setOpenMenu(menu); setSelectedSub(sub); }} />;
          case "sales": return <SalesChart />;
          case "topProducts": return <TopProducts />;
          case "recentOrders": return <RecentOrders />;
          case "quickStats": return <QuickStats />;
          case "searchAnalytics": return <SearchAnalytics />;
          default: return <DashboardPage />;
        }
      case "Produits":
        switch (selectedSub) {
          case "productsList": return <ProductsAdmin globalSearchQuery={searchQuery} />;
          case "addProduct": return <AddProductModal onClose={() => setSelectedSub("productsList")} layout="page" />;
          case "editProduct": return <FournisseurListe globalSearchQuery={searchQuery} />;
          case "categories": return <CategorySelect />;
          case "variants": return <VariantManager />;
          default: return <ProductsAdmin globalSearchQuery={searchQuery} />;
        }
      case "Fournisseurs":
        switch (selectedSub) {
          case "suppliersList": return <SuppliersManager globalSearchQuery={searchQuery} />;
          case "productsApproval": return <SupplierProductsApproval globalSearchQuery={searchQuery} />;
          case "boutiquesCatalog": return <BoutiquesCatalogManager globalSearchQuery={searchQuery} />;
          case "sellerBadge": return <SellerBadgeManager globalSearchQuery={searchQuery} />;
          default: return <SuppliersManager globalSearchQuery={searchQuery} />;
        }
      case "Commandes":
        switch (selectedSub) {
          case "ordersList": return <OrdersAdmin globalSearchQuery={searchQuery} />;
          case "orderDetails": return <OrderDetailsModal />;
          case "orderStatus": return <OrderStatusBadge />;
          case "delivery": return <DeliveryManager globalSearchQuery={searchQuery} />;
          case "invoice": return <InvoiceButton />;
          case "disputes": return <DisputeManager />;
          default: return <OrdersAdmin globalSearchQuery={searchQuery} />;
        }
      case "Logistique":
        switch (selectedSub) {
          case "livreurs": return <LivreurManager globalSearchQuery={searchQuery} />;
          case "controlTower": return <AdminControlTower />;
          case "cashControl": return <CashControl />;
          case "dailyStats": return <DailyStats />;
          default: return <LivreurManager globalSearchQuery={searchQuery} />;
        }
      case "Utilisateurs":
        switch (selectedSub) {
          case "usersList": return <UsersAdmin globalSearchQuery={searchQuery} />;
          case "userDetails": return <UserDetailsModal />;
          case "userStatus": return <UserStatusToggle />;
          default: return <UsersAdmin globalSearchQuery={searchQuery} />;
        }
      /* KIT PROMOTIONS — DÉSACTIVÉ
      case "Promotions":
        switch (selectedSub) {
          case "kitsList": return <KitsManager globalSearchQuery={searchQuery} />;
          default: return <KitsManager globalSearchQuery={searchQuery} />;
        }
      */
      case "Marketing":
        switch (selectedSub) {
          case "coupons": return <CouponManager globalSearchQuery={searchQuery} />;
          case "referrals": return <ReferralAdminManager globalSearchQuery={searchQuery} />;
          case "adDistribution": return <AdDistributionManager globalSearchQuery={searchQuery} />;
          default: return <CouponManager globalSearchQuery={searchQuery} />;
        }
      case "Finances":
        switch (selectedSub) {
          case "payouts": return <PayoutManager globalSearchQuery={searchQuery} />;
          default: return <PayoutManager globalSearchQuery={searchQuery} />;
        }
      case "Contenu & Blog":
        switch (selectedSub) {
           case "blog": return <BlogManager globalSearchQuery={searchQuery} />;
           case "faq": return <FaqManager globalSearchQuery={searchQuery} />;
           case "policy": return <PolicyManager />;
           default: return <BlogManager globalSearchQuery={searchQuery} />;
        }
      case "Paramètres":
        switch (selectedSub) {
          case "store": return <StoreSettings />;
          case "payment": return <PaymentSettings />;
          case "shipping": return <ShippingSettings />;
          case "adminAccount": return <AdminAccountSettings />;
          case "whatsapp": return <WhatsAppSettings />;
          case "cloudinary": return <CloudinarySettings />;
          case "notifications": return <NotificationsSettings />;
          case "geography": return <GeographyManager />;
          case "supportMessages": return <SupportAdmin />;
          case "config": return <ConfigManager />;
          case "deliveryFeeTiers": return <DeliveryFeeTiersManager />;
          case "deliveryMultiplier": return <DeliveryMultiplierManager />;
          default: return <ConfigManager />;
        }
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-base-200 font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-base-100 border-r border-base-200 transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-8 flex items-center justify-between">
            <div 
              onClick={() => navigate("/")} 
              className="flex items-center gap-3 cursor-pointer group"
              title="Retour à l'accueil du site"
            >
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="text-white" size={20} />
              </div>
              <span className="text-xl font-black tracking-tighter text-base-content group-hover:text-indigo-600 transition-colors">Vtout Admin</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-base-content/40 hover:text-base-content">
              <X size={20} />
            </button>
          </div>

          {/* Portal Switcher removed from here, moved to header */}


          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
            {menuItems.map((menu) => {
              const anchorId = ADMIN_TOUR_ANCHOR_MAP[menu.name];
              const menuButton = (
                <button
                  onClick={() => setOpenMenu(openMenu === menu.name ? null : menu.name)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group ${
                    selectedMenu === menu.name
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-base-content/50 hover:bg-base-200 hover:text-base-content"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={selectedMenu === menu.name ? "text-indigo-600" : "group-hover:text-base-content"}>
                      {menu.icon}
                    </span>
                    <span className="font-bold text-sm">{menu.name}</span>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`transition-transform duration-200 ${openMenu === menu.name ? "rotate-90" : ""}`}
                  />
                </button>
              );
              return (
              <div key={menu.name} className="mb-2">
                {anchorId ? <TourAnchor id={anchorId}>{menuButton}</TourAnchor> : menuButton}

                {openMenu === menu.name && (
                  <div className="mt-1 ml-4 pl-4 border-l-2 border-base-200 space-y-1">
                    {menu.subItems.map((sub) => (
                      <button
                        key={sub.key}
                        onClick={() => {
                          setSelectedMenu(menu.name);
                          setSelectedSub(sub.key);
                          if (window.innerWidth < 1024) setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm ${
                          selectedSub === sub.key
                            ? "text-indigo-600 font-black bg-indigo-50/50"
                            : "text-base-content/50 font-bold hover:text-base-content hover:bg-base-200/50"
                        }`}
                      >
                        {sub.icon}
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-6 border-t border-base-200 space-y-4">
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center gap-3 p-4 text-base-content/50 font-bold hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100"
            >
              <Store size={18} />
              Retour au site
            </button>
            <button
              onClick={async () => {
                if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
                  await authClient.signOut();
                  window.location.href = "/";
                }
              }}
              className="w-full flex items-center gap-3 p-4 text-rose-500 font-black hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 uppercase text-[10px] tracking-widest"
            >
              <LogOut size={18} />
              Se déconnecter
            </button>
          </div>


        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? "lg:ml-72" : ""}`}>
        {/* Top Header */}
        <header className="h-20 lg:h-24 bg-base-100/80 backdrop-blur-md border-b border-base-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-2 lg:gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden p-2 bg-base-200 text-base-content rounded-xl transition-opacity ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-lg lg:text-2xl font-black tracking-tighter text-base-content flex items-center">
                <span className="hidden md:inline">{selectedMenu}</span>
                <span className="mx-2 text-base-content/30 text-lg hidden md:inline">/</span>
                <span className="text-indigo-600 truncate max-w-[150px] lg:max-w-none">
                  {menuItems.find(m => m.name === selectedMenu)?.subItems.find(s => s.key === selectedSub)?.name || selectedSub}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-6">
            {/* Search Bar - Desktop */}
            <div className="flex-1 min-w-[140px] max-w-md hidden sm:block">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                  placeholder="Rechercher partout..."
                  className="w-full pl-12 pr-12 py-3 bg-base-200 border border-base-200 rounded-2xl text-base font-medium placeholder:text-base-content/40 focus:bg-base-100 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-base-200 rounded-md text-base-content/40">
                    <X size={14} />
                  </button>
                )}

                {/* Résultats de navigation — apparaissent dès que le texte tapé
                    correspond à une section/sous-section du menu (nom ou
                    mots-clés). Un clic saute directement dessus, sans avoir à
                    chercher dans quel onglet elle se trouve. */}
                <AnimatePresence>
                  {searchFocused && navResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute left-0 top-full mt-2 w-[22rem] max-w-[90vw] bg-base-100 rounded-2xl shadow-2xl border border-base-200 overflow-hidden z-50 max-h-96 overflow-y-auto"
                    >
                      {navResults.map((r) => (
                        <button
                          key={`${r.menu}-${r.key}`}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => goToSearchResult(r)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-base-200 text-left transition-colors border-b border-base-200 last:border-b-0"
                        >
                          <span className="text-indigo-500 shrink-0">{r.icon}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-base-content truncate">{r.name}</p>
                            <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-wide">{r.menu}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Search - Intuitive Overlay */}
            <div className="sm:hidden">
              <button 
                onClick={() => setIsMobileSearchOpen(true)}
                className="p-2 bg-base-200 text-base-content/40 rounded-xl hover:text-indigo-600"
              >
                <Search size={20} />
              </button>
              
              <AnimatePresence>
                {isMobileSearchOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed inset-x-0 top-0 z-[60] bg-base-100 shadow-xl"
                  >
                    <div className="h-20 flex items-center px-4 gap-4">
                      <Search className="text-indigo-600" size={20} />
                      <input
                        autoFocus
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher..."
                        className="flex-1 bg-transparent border-none text-base font-bold text-base-content focus:ring-0"
                      />
                      <button onClick={() => setIsMobileSearchOpen(false)} className="p-2 text-base-content/40">
                        <X size={24} />
                      </button>
                    </div>
                    {navResults.length > 0 && (
                      <div className="max-h-[60vh] overflow-y-auto border-t border-base-200">
                        {navResults.map((r) => (
                          <button
                            key={`m-${r.menu}-${r.key}`}
                            onClick={() => goToSearchResult(r)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-base-200 text-left transition-colors border-b border-base-200 last:border-b-0"
                          >
                            <span className="text-indigo-500 shrink-0">{r.icon}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-base-content truncate">{r.name}</p>
                              <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-wide">{r.menu}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              <button
                onClick={() => setHelpOpen(true)}
                className="p-2 lg:p-2.5 bg-base-200 text-base-content/50 rounded-xl hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="Centre d'aide — comment fonctionne chaque fonctionnalité"
              >
                <HelpCircle size={18} />
              </button>
              <TourHelpButton steps={ADMIN_TOUR_STEPS} onBeforeStart={() => setSidebarOpen(true)} />
              <PortalSwitcher />
              <ThemeSelector />
              <NotificationCenter />
            </div>

            <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-base-200">
              <div className="text-right hidden xl:block">
                <p className="text-sm font-black text-base-content leading-none">Admin Vtout</p>
                <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest mt-1">Super Admin</p>
              </div>
              <div className="w-8 h-8 lg:w-12 lg:h-12 bg-base-200 rounded-xl overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                <img src="https://ui-avatars.com/api/?name=Admin+Vtout&background=4f46e5&color=fff" alt="Avatar" />
              </div>
              <button 
                onClick={async () => {
                  if (window.confirm("Déconnexion ?")) {
                    await signOut();
                    window.location.href = "/";
                  }
                }}
                className="flex items-center justify-center p-2 lg:px-3 lg:py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all border border-rose-100 font-bold text-[10px] uppercase gap-2"
                title="Se déconnecter"
              >
                <LogOut size={18} className="lg:w-3.5 lg:h-3.5" />
                <span className="hidden lg:inline">Déconnexion</span>
              </button>
            </div>

          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-neutral/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        ></div>
      )}

      <AdminHelpCenter open={helpOpen} onClose={() => setHelpOpen(false)} onGoTo={goToSearchResult} />
    </div>
  );
};

export default AdminLayout;
