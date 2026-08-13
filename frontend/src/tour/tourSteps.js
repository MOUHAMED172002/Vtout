// Étapes de la visite guidée du site web — miroir de src/tour/tourSteps.js côté mobile.
// Chaque étape référence l'id d'une <TourAnchor> (voir Navbar.jsx, Category.jsx,
// DashboardLayout.jsx...), un titre et une description courte affichés dans l'infobulle.

// Le parcours acheteur reprend le même déroulé que la page "Comment ça marche"
// (frontend/src/pages/HowItWorks/HowItWorksPage.jsx#userTypes.acheteur.steps).
// Les 3 premières étapes restent sur l'accueil ; les suivantes changent
// réellement de page (`route`) pour montrer le vrai panier puis la page
// "Comment ça marche" elle-même (dont chaque carte porte sa propre ancre,
// voir HowItWorksPage.jsx) — la visite se termine sur la page qu'elle vient
// de visiter, le Navbar (et son ancre "tour-dashboard") y étant toujours
// présent, pas besoin de revenir à l'accueil.
export const HOME_TOUR_STEPS = [
  { target: 'tour-search', icon: 'Search', title: 'Explorez les produits', description: 'Parcourez des milliers de produits de vendeurs vérifiés partout au Bénin — la recherche vous aide à trouver vite ce qu’il vous faut.' },
  { target: 'tour-categories', icon: 'Search', title: 'Filtrez par catégorie', description: 'Explorez les rayons et filtrez par catégorie, prix ou ville pour affiner votre recherche.' },
  { target: 'tour-cart', icon: 'ShoppingBag', title: 'Ajoutez au panier', description: 'Sélectionnez vos articles, choisissez la quantité et ajoutez-les à votre panier en un clic.' },
  { route: '/cartpage', target: 'tour-cart-checkout', icon: 'CreditCard', title: 'Passez votre commande', description: 'Renseignez votre adresse de livraison et confirmez — paiement à la réception, aucun risque.' },
  { route: '/comment-ca-marche/acheteur', target: 'tour-howitworks-step-4', icon: 'Truck', title: 'Suivez votre livraison', description: 'Un livreur prend en charge votre commande. Vous recevez des notifications WhatsApp à chaque étape, avec suivi en temps réel.' },
  { route: '/comment-ca-marche/acheteur', target: 'tour-howitworks-step-5', icon: 'Package', title: 'Recevez votre colis', description: 'Votre commande arrive à votre porte. Vérifiez le contenu avant de payer — satisfaction garantie.' },
  { route: '/comment-ca-marche/acheteur', target: 'tour-howitworks-step-6', icon: 'Star', title: 'Donnez votre avis', description: 'Notez le vendeur et le produit pour aider la communauté. Vos retours améliorent la plateforme.' },
  { target: 'tour-dashboard', title: 'Votre espace', description: 'Retrouvez ici, à tout moment, toutes vos commandes, vos favoris, vos adresses et vos paramètres.' },
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

// Même principe que HOME_TOUR_STEPS : reprend le déroulé de la page "Comment ça
// marche" pour les livreurs (userTypes.livreur.steps) — inscription, missions,
// récupération/livraison, paiement. Ici les 5 étapes ont toutes un élément
// visible sur le tableau de bord (contrairement à l'acheteur), donc pas besoin
// d'étape "récit" sans target.
export const DELIVERY_TOUR_STEPS = [
  { target: 'tour-delivery-profile', icon: 'UserCheck', title: 'Vos zones & infos', description: 'Votre profil livreur est actif — gérez vos zones de service et vos informations ici, comme lors de votre inscription.' },
  { target: 'tour-delivery-available', icon: 'Bell', title: 'Recevez des missions', description: "Dès qu'une commande est disponible dans votre zone, elle apparaît ici. Acceptez selon vos disponibilités." },
  { target: 'tour-delivery-active', icon: 'Navigation', title: 'Récupérez & livrez', description: 'Rendez-vous chez le vendeur pour récupérer le colis, livrez-le au client, puis confirmez avec son code de livraison.' },
  { target: 'tour-delivery-wallet', icon: 'Wallet', title: 'Soyez payé', description: 'Vos gains sont automatiquement crédités ici après chaque livraison réussie — demandez un retrait à tout moment.' },
  { target: 'tour-delivery-history', title: 'Historique', description: 'Retrouvez toutes vos livraisons terminées.' },
];
