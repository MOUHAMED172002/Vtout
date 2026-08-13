// Étapes de la visite guidée du portail vendeur — même moteur que le site principal
// (frontend/src/tour/) et l'app mobile (vtout-mobile-app/src/tour/tourSteps.js).
// Chaque étape référence l'id d'une <TourAnchor> posée dans components/Layout.jsx.

// Reprend le même déroulé que la page "Comment ça marche" côté site principal
// (frontend/src/pages/HowItWorks/HowItWorksPage.jsx#userTypes.vendeur.steps) :
// boutique, produits, commandes, remise au livreur, gains, activité. "Remettez
// au livreur" n'a pas d'élément visible sur le portail à cet instant (c'est une
// action physique, pas un écran) : elle s'affiche en carte centrée, sans
// découpe — voir TourOverlay.jsx pour ce comportement.
export const SUPPLIER_TOUR_STEPS = [
  { target: 'tour-supplier-boutiques', icon: 'Store', title: 'Votre boutique', description: 'Complétez vos informations de boutique — logo, description, coordonnées. Indispensable pour vendre vos produits.' },
  { target: 'tour-supplier-products', icon: 'Upload', title: 'Ajoutez vos produits', description: 'Publiez vos articles avec photos, description et prix vendeur — Vtout calcule automatiquement le prix client final.' },
  { target: 'tour-supplier-orders', icon: 'Bell', title: 'Recevez les commandes', description: 'Vous êtes notifié instantanément par WhatsApp et ici dès qu’un client commande vos produits.' },
  { icon: 'Send', title: 'Remettez au livreur', description: 'Préparez le colis et remettez-le au livreur assigné — il s’occupe de la livraison jusqu’au client final.' },
  { target: 'tour-supplier-wallet', icon: 'DollarSign', title: 'Touchez vos gains', description: 'Après chaque livraison réussie, vos gains nets sont crédités ici automatiquement.' },
  { target: 'tour-supplier-dashboard', icon: 'BarChart3', title: 'Gérez votre activité', description: 'Suivez vos ventes, revenus et statistiques en temps réel depuis votre tableau de bord.' },
  { target: 'tour-supplier-badge', icon: 'BadgeCheck', title: 'Vendeur Vérifié', description: 'Obtenez le badge certifié pour renforcer la confiance de vos acheteurs.' },
];
