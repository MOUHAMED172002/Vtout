import React, { useState } from "react";
import { SignedIn, SignedOut, useUser, useClerk } from "../../lib/clerk-shim";
import { useProfile } from "../context/useProfile";
import {
  Home,
  ShoppingBag,
  Users,
  Settings,
  Package,
  Menu,
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  Truck,
  UserCircle,
  Plus,
  Edit,
  FileText,
  Search,
  LogOut,
  ShieldCheck,
  DollarSign,
  BarChart3,
  Store,
  Activity,
  MessageCircle,
  Banknote,
  MapPin,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeSelector from "../context/ThemeSelector";

// Import supplier section
import SuppliersManager from "./Fournisseurs/SuppliersManager";
import SupplierProductsApproval from "./Fournisseurs/SupplierProductsApproval";
import BoutiquesCatalogManager from "./Fournisseurs/BoutiquesCatalogManager";

// Import dashboard components
import DashboardPage from "../Admin/Dashboard/Dashboard";
import SalesChart from "../Admin/Dashboard/SalesChart";
import TopProducts from "../Admin/Dashboard/TopProducts";
import RecentOrders from "../Admin/Dashboard/RecentOrders";
import QuickStats from "../Admin/Dashboard/QuickStats";
import SearchAnalytics from "../Admin/Dashboard/SearchAnalytics";

// Import product section
import ProductsAdmin from "../Admin/Product/ProductsAdmin";
import AddProductModal from "../Admin/Product/AddProductModal";
import FournisseurListe from "../Admin/Product/FournisseurListe";
import ProductImagesUploader from "../Admin/Product/ProductImagesUploader";
import CategorySelect from "../Admin/Product/CategorySelect";
import VariantManager from "../Admin/Product/VariantManager";

// Import order section
import OrdersAdmin from "../Admin/Order/OrdersAdmin";
import OrderDetailsModal from "../Admin/Order/OrderDetailsModal";
import OrderStatusBadge from "../Admin/Order/OrderStatusBadge";
import DeliveryManager from "../Admin/Order/DeliveryManager";
import InvoiceButton from "../Admin/Order/InvoiceButton";

// Import users section
import UsersAdmin from "../Admin/UserAdmin/UsersAdmin";
import UserDetailsModal from "../Admin/UserAdmin/UserDetailsModal";
import UserStatusToggle from "../Admin/UserAdmin/UserStatusToggle";

// Import settings section
import SettingsAdmin from "../Admin/Setting/SettingsAdmin";
import StoreSettings from "../Admin/Setting/StoreSettings";
import PaymentSettings from "../Admin/Setting/PaymentSettings";
import ShippingSettings from "../Admin/Setting/ShippingSettings";
import AdminAccountSettings from "../Admin/Setting/AdminAccountSettings";
import NotificationsSettings from "../Admin/Setting/NotificationsSettings";
import FaqManager from "./FaqManager";
import PolicyManager from "./PolicyManager";
import LivreurManager from "./AdminDelivery/LivreurManager";
import CashControl from "./AdminDelivery/CashControl";
import DailyStats from "./AdminDelivery/DailyStats";
import AdminControlTower from "./AdminDelivery/AdminControlTower";
import SupportAdmin from "./Support/SupportAdmin";
import PayoutManager from "./Finance/PayoutManager";
import GeographyManager from "./GeographyManager";
import ConfigManager from "./ConfigManager";
import DisputeManager from "./DisputeManager";


export default function AdminLayout() {
  const { signOut } = useClerk();
  const { user } = useProfile();
  const [openMenu, setOpenMenu] = useState("Dashboard");
  const [selectedMenu, setSelectedMenu] = useState("Dashboard");
  const [selectedSub, setSelectedSub] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      icon: <Home size={18} />,
      subItems: [
        { key: "overview", name: "Vue d'ensemble", icon: <Clock size={16} /> },
        { key: "searchAnalytics", name: "Analytics de recherche", icon: <Search size={16} /> }
      ]
    },
    {
      name: "Produits",
      icon: <Package size={18} />,
      subItems: [
        { key: "productsList", name: "Liste des produits", icon: <Package size={16} /> },
        { key: "addProduct", name: "Ajouter un produit", icon: <Plus size={16} /> },
        { key: "editProduct", name: "Listes fournisseurs", icon: <Edit size={16} /> },
        { key: "categories", name: "Catégories", icon: <Star size={16} /> },
        { key: "variants", name: "Variantes", icon: <Settings size={16} /> },
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
        { key: 'faq', name: 'FAQ', icon: <FileText size={16} /> },
        { key: 'policy', name: 'Politique de confidentialité', icon: <FileText size={16} /> },
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
          case "images": return <ProductImagesUploader />;
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
      case "Paramètres":
        switch (selectedSub) {
          case "store": return <StoreSettings />;
          case "payment": return <PaymentSettings />;
          case "shipping": return <ShippingSettings />;
          case "adminAccount": return <AdminAccountSettings />;
          case "notifications": return <NotificationsSettings />;
          case "faq": return <FaqManager />;
          case "policy": return <PolicyManager />;
          case "geography": return <GeographyManager />;
          case "supportMessages": return <SupportAdmin />;
          case "config": return <ConfigManager />;
          default: return <ConfigManager />;
        }
      default: return <DashboardPage />;
    }
  };


  return (
    <div className="min-h-screen bg-base-200 text-base-content flex overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-[300px] bg-neutral text-neutral-content h-screen fixed left-0 top-0 shadow-2xl z-50 overflow-y-auto custom-scrollbar">
        <div className="p-10 border-b border-neutral-content/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-xl italic shadow-lg shadow-primary/20">V</div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white">Vtout <span className="text-primary">Admin</span></h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-neutral-content/50">Master Control</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {menuItems.map((item) => (
            <div key={item.name} className="space-y-1">
              <button
                onClick={() => {
                  setSelectedMenu(item.name);
                  setOpenMenu(openMenu === item.name ? "" : item.name);
                  if (item.subItems) setSelectedSub(item.subItems[0].key);
                }}
                className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl font-black transition-all ${selectedMenu === item.name
                  ? "bg-primary text-primary-content shadow-xl shadow-primary/10"
                  : "text-neutral-content/60 hover:text-white hover:bg-neutral-content/10"
                  }`}
              >
                <div className="flex items-center gap-4">
                  {item.icon}
                  <span className="text-sm">{item.name}</span>
                </div>
                {item.subItems && (openMenu === item.name ? <ChevronDown size={14} className="opacity-50" /> : <ChevronRight size={14} className="opacity-50" />)}
              </button>

              <AnimatePresence>
                {item.subItems && openMenu === item.name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-12 space-y-1"
                  >
                    {item.subItems.map((sub) => (
                      <button
                        key={sub.key}
                        onClick={() => setSelectedSub(sub.key)}
                        className={`w-full text-left py-3 text-xs font-bold transition-all ${selectedSub === sub.key && selectedMenu === item.name
                          ? "text-primary"
                          : "text-slate-500 hover:text-slate-300"
                          }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        <div className="p-8 border-t border-neutral-content/10 space-y-4">
          <div className="bg-neutral-content/5 p-6 rounded-3xl border border-neutral-content/10 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-400">
              <ShieldCheck size={14} /> Système Sécurisé
            </div>
            <p className="text-xs font-bold text-neutral-content/60 leading-tight">Accès restreint aux administrateurs autorisés uniquement.</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen overflow-y-auto lg:ml-[300px]">

        {/* Header */}
        <header className="h-24 bg-base-100 border-b border-base-content/10 flex items-center justify-between px-8 md:px-12 sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-3 bg-base-200 rounded-2xl"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-4 bg-base-200 px-6 py-3 rounded-2xl border border-base-content/5">
              <Search size={18} className="text-base-content/50" />
              <input
                type="text"
                placeholder="Rechercher une commande, un client..."
                className="bg-transparent border-none text-sm font-bold text-base-content focus:ring-0 w-80"
              />
            </div>
          </div>

          <div className="flex items-center gap-8">
            <ThemeSelector />
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Serveur Live</span>
            </div>

            <div className="flex items-center gap-5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-base-content">{user?.fullname || 'Admin'}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Super Admin</p>
              </div>
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-xl shadow-slate-200">
                <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullname || 'Admin')}&background=6366f1&color=fff`} className="w-full h-full object-cover" alt="avatar" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <main className="flex-1 p-8 md:p-12">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-slate-900 text-white p-8 overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="mb-12 flex justify-between items-center">
                <h1 className="text-3xl font-black tracking-tighter">Vtout <span className="text-primary">Admin</span></h1>
                <button onClick={() => setIsSidebarOpen(false)} className="p-3 border border-slate-700 rounded-2xl">
                  <ChevronRight size={20} className="rotate-180" />
                </button>
              </div>

              <nav className="space-y-4">
                {menuItems.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedMenu(item.name);
                        setOpenMenu(openMenu === item.name ? "" : item.name);
                      }}
                      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold ${selectedMenu === item.name ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-slate-400"
                        }`}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </button>
                    {item.subItems && openMenu === item.name && (
                      <div className="pl-14 space-y-4 pt-2">
                        {item.subItems.map((sub) => (
                          <button
                            key={sub.key}
                            onClick={() => {
                              setSelectedSub(sub.key);
                              setIsSidebarOpen(false);
                            }}
                            className={`block w-full text-left text-sm font-bold ${selectedSub === sub.key ? "text-primary" : "text-slate-500"
                              }`}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>

              <div className="mt-12 pt-12 border-t border-slate-800">
                <button 
                  onClick={() => signOut({ redirectUrl: '/' })}
                  className="flex items-center gap-4 px-6 py-4 w-full rounded-2xl font-bold text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={20} />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
