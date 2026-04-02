import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function SidebarMenu() {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: "🏠" },
    { name: "Produits", path: "/admin/products", icon: "📦" },
    { name: "Commandes", path: "/admin/orders", icon: "🛒" },
    { name: "Livreurs", path: "/admin/livreurs", icon: "🛵" },
    { name: "Tour de Contrôle", path: "/admin/control-tower", icon: "📡" },
    { name: "Utilisateurs", path: "/admin/users", icon: "👥" },
    { name: "Paramètres", path: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <div className="drawer-side">
      <label htmlFor="admin-drawer" className="drawer-overlay"></label>
      <ul className="menu p-4 w-64 bg-base-200 text-base-content">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`flex items-center gap-2 p-2 rounded-lg ${location.pathname === item.path
                  ? "bg-primary text-primary-content"
                  : "hover:bg-base-300"
                }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
