import React, { useState, useEffect } from "react";
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
  UserCircle
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
import FaqManager from "./FaqManager";
import PolicyManager from "./PolicyManager";
import GeographyManager from "./GeographyManager";
import SupportAdmin from "./Support/SupportAdmin";
import ConfigManager from "./ConfigManager";
import BlogManager from "./Blog/BlogManager";
import CategorySelect from "./Product/CategorySelect";
import VariantManager from "./Product/VariantManager";
import DisputeManager from "./DisputeManager";
import InvoiceButton from "./Order/InvoiceButton";
import DeliveryManager from "./Order/DeliveryManager";
import FournisseurListe from "./Product/FournisseurListe";
import BoutiquesCatalogManager from "./Fournisseurs/BoutiquesCatalogManager";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../lib/clerk-shim";
import { useNavigate } from "react-router-dom";
import PortalSwitcher from "../Shared/PortalSwitcher";


const AdminLayout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState("Dashboard");

  const [selectedSub, setSelectedSub] = useState("overview");
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Closed by default on mobile
  const [openMenu, setOpenMenu] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

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
        { key: 'config', name: 'Configuration Royale', icon: <Settings size={16} /> },
        { key: 'notifications', name: '📧 Email & Notifications', icon: <MessageCircle size={16} /> },
        { key: 'geography', name: 'Géographie', icon: <MapPin size={16} /> },
        { key: 'supportMessages', name: 'Messages Support', icon: <MessageCircle size={16} /> },
      ],
    },
  ];

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
          case "productsList": return <ProductsAdmin />;
          case "addProduct": return <AddProductModal onClose={() => setSelectedSub("productsList")} layout="page" />;
          case "editProduct": return <FournisseurListe />;
          case "categories": return <CategorySelect />;
          case "variants": return <VariantManager />;
          default: return <ProductsAdmin />;
        }
      case "Fournisseurs":
        switch (selectedSub) {
          case "suppliersList": return <SuppliersManager />;
          case "productsApproval": return <SupplierProductsApproval />;
          case "boutiquesCatalog": return <BoutiquesCatalogManager />;
          default: return <SuppliersManager />;
        }
      case "Commandes":
        switch (selectedSub) {
          case "ordersList": return <OrdersAdmin />;
          case "orderDetails": return <OrderDetailsModal />;
          case "orderStatus": return <OrderStatusBadge />;
          case "delivery": return <DeliveryManager />;
          case "invoice": return <InvoiceButton />;
          case "disputes": return <DisputeManager />;
          default: return <OrdersAdmin />;
        }
      case "Logistique":
        switch (selectedSub) {
          case "livreurs": return <LivreurManager />;
          case "controlTower": return <AdminControlTower />;
          case "cashControl": return <CashControl />;
          case "dailyStats": return <DailyStats />;
          default: return <LivreurManager />;
        }
      case "Utilisateurs":
        switch (selectedSub) {
          case "usersList": return <UsersAdmin />;
          case "userDetails": return <UserDetailsModal />;
          case "userStatus": return <UserStatusToggle />;
          default: return <UsersAdmin />;
        }
      case "Finances":
        switch (selectedSub) {
          case "payouts": return <PayoutManager />;
          default: return <PayoutManager />;
        }
      case "Contenu & Blog":
        switch (selectedSub) {
           case "blog": return <BlogManager />;
           case "faq": return <FaqManager />;
           case "policy": return <PolicyManager />;
           default: return <BlogManager />;
        }
      case "Paramètres":
        switch (selectedSub) {
          case "store": return <StoreSettings />;
          case "payment": return <PaymentSettings />;
          case "shipping": return <ShippingSettings />;
          case "adminAccount": return <AdminAccountSettings />;
          case "notifications": return <NotificationsSettings />;
          case "geography": return <GeographyManager />;
          case "supportMessages": return <SupportAdmin />;
          case "config": return <ConfigManager />;
          default: return <ConfigManager />;
        }
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transition-all duration-300 ease-in-out lg:translate-x-0 ${
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
              <span className="text-xl font-black tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors">Vtout Admin</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900">
              <X size={20} />
            </button>
          </div>

          <div className="px-8 mb-6">
            <PortalSwitcher />
          </div>


          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
            {menuItems.map((menu) => (
              <div key={menu.name} className="mb-2">
                <button
                  onClick={() => setOpenMenu(openMenu === menu.name ? null : menu.name)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 group ${
                    selectedMenu === menu.name
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={selectedMenu === menu.name ? "text-indigo-600" : "group-hover:text-slate-900"}>
                      {menu.icon}
                    </span>
                    <span className="font-bold text-sm">{menu.name}</span>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`transition-transform duration-200 ${openMenu === menu.name ? "rotate-90" : ""}`}
                  />
                </button>

                {openMenu === menu.name && (
                  <div className="mt-1 ml-4 pl-4 border-l-2 border-slate-50 space-y-1">
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
                            : "text-slate-500 font-bold hover:text-slate-900 hover:bg-slate-50/50"
                        }`}
                      >
                        {sub.icon}
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-6 border-t border-slate-50 space-y-4">
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center gap-3 p-4 text-slate-500 font-bold hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100"
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
        <header className="h-20 lg:h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-2 lg:gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden p-2 bg-slate-50 text-slate-900 rounded-xl transition-opacity ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-lg lg:text-2xl font-black tracking-tighter text-slate-900 flex items-center">
                <span className="hidden md:inline">{selectedMenu}</span>
                <span className="mx-2 text-slate-300 text-lg hidden md:inline">/</span>
                <span className="text-indigo-600 truncate max-w-[150px] lg:max-w-none">
                  {menuItems.find(m => m.name === selectedMenu)?.subItems.find(s => s.key === selectedSub)?.name || selectedSub}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-6">
            {/* Search Bar - Desktop */}
            <div className="flex-1 max-w-md hidden sm:block">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher partout..."
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-base font-medium placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-md text-slate-400">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Search - Intuitive Overlay */}
            <div className="sm:hidden">
              <button 
                onClick={() => setIsMobileSearchOpen(true)}
                className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600"
              >
                <Search size={20} />
              </button>
              
              <AnimatePresence>
                {isMobileSearchOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed inset-x-0 top-0 h-20 bg-white z-[60] flex items-center px-4 gap-4 shadow-xl"
                  >
                    <Search className="text-indigo-600" size={20} />
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher..."
                      className="flex-1 bg-transparent border-none text-base font-bold text-slate-900 focus:ring-0"
                    />
                    <button onClick={() => setIsMobileSearchOpen(false)} className="p-2 text-slate-400">
                      <X size={24} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden sm:block">
              <PortalSwitcher />
            </div>

            <button className="relative p-2 lg:p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-slate-100">
              <div className="text-right hidden xl:block">
                <p className="text-sm font-black text-slate-900 leading-none">Admin Vtout</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Super Admin</p>
              </div>
              <div className="w-8 h-8 lg:w-12 lg:h-12 bg-slate-100 rounded-xl overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                <img src="https://ui-avatars.com/api/?name=Admin+Vtout&background=4f46e5&color=fff" alt="Avatar" />
              </div>
              <button 
                onClick={async () => {
                  if (window.confirm("Déconnexion ?")) {
                    await signOut();
                    window.location.href = "/";
                  }
                }}
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all border border-rose-100 font-bold text-[10px] uppercase"
                title="Se déconnecter"
              >
                <LogOut size={14} />
                <span>Déconnexion</span>
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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;
