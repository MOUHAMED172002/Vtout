// Étapes de la visite guidée du site web — miroir de src/tour/tourSteps.js côté mobile.
// Chaque étape référence l'id d'une <TourAnchor> (voir Navbar.jsx, Category.jsx,
// DashboardLayout.jsx...), un titre et une description courte affichés dans l'infobulle.

export const HOME_TOUR_STEPS = [
  { target: 'tour-search', title: 'Recherchez vos produits', description: 'Trouvez rapidement ce que vous cherchez grâce à la barre de recherche.' },
  { target: 'tour-categories', title: 'Parcourez les catégories', description: 'Explorez les rayons pour découvrir tous les produits vendus sur Vtout.' },
  { target: 'tour-cart', title: 'Votre panier', description: 'Retrouvez ici les articles ajoutés avant de passer commande.' },
  { target: 'tour-dashboard', title: 'Votre espace', description: 'Accédez à vos commandes, favoris, adresses et paramètres depuis votre tableau de bord.' },
];

export const DASHBOARD_TOUR_STEPS = [
  { target: 'tour-dash-overview', title: "Vue d'ensemble", description: 'Un résumé de votre activité : commandes récentes, points et actualités du compte.' },
  { target: 'tour-dash-orders', title: 'Vos commandes', description: 'Suivez le statut de chaque commande, du paiement jusqu’à la livraison.' },
  { target: 'tour-dash-favorites', title: 'Vos favoris', description: 'Retrouvez les produits que vous avez mis de côté pour plus tard.' },
  { target: 'tour-dash-addresses', title: 'Vos adresses', description: 'Gérez vos adresses de livraison pour un passage en caisse plus rapide.' },
  { target: 'tour-dash-settings', title: 'Paramètres', description: 'Modifiez vos informations personnelles et vos préférences de compte.' },
];

export const ADMIN_TOUR_STEPS = [
  { target: 'tour-admin-dashboard', title: 'Tableau de bord', description: "Vue d'ensemble : ventes, commandes récentes, alertes stock et analyses." },
  { target: 'tour-admin-produits', title: 'Produits', description: 'Ajoutez des produits, gérez le catalogue, les catégories et les variantes.' },
  { target: 'tour-admin-fournisseurs', title: 'Fournisseurs', description: 'Validez les vendeurs et leurs produits avant leur mise en ligne sur le site.' },
  { target: 'tour-admin-commandes', title: 'Commandes', description: 'Toutes les commandes de la plateforme, avec suivi de livraison et litiges.' },
  { target: 'tour-admin-logistique', title: 'Logistique', description: 'Validation des livreurs, tour de contrôle et contrôle des espèces en circulation.' },
  { target: 'tour-admin-utilisateurs', title: 'Utilisateurs', description: "Gérez l'ensemble des comptes clients de la plateforme." },
];

export const DELIVERY_TOUR_STEPS = [
  { target: 'tour-delivery-available', title: 'Commandes disponibles', description: 'Les livraisons à prendre en charge dans votre zone apparaissent ici.' },
  { target: 'tour-delivery-active', title: 'En cours', description: 'Suivez vos livraisons en cours et confirmez-les avec le code client.' },
  { target: 'tour-delivery-history', title: 'Historique', description: 'Retrouvez toutes vos livraisons terminées.' },
  { target: 'tour-delivery-profile', title: 'Zones & infos', description: 'Gérez vos zones de service et les informations de votre profil livreur.' },
  { target: 'tour-delivery-wallet', title: 'Portefeuille', description: 'Vos gains sont crédités ici après chaque livraison réussie — demandez un retrait à tout moment.' },
];
