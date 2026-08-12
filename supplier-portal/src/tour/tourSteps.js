// Étapes de la visite guidée du portail vendeur — même moteur que le site principal
// (frontend/src/tour/) et l'app mobile (vtout-mobile-app/src/tour/tourSteps.js).
// Chaque étape référence l'id d'une <TourAnchor> posée dans components/Layout.jsx.

export const SUPPLIER_TOUR_STEPS = [
  { target: 'tour-supplier-dashboard', title: 'Votre tableau de bord', description: "Un coup d'œil sur vos ventes, vos alertes stock et vos dernières commandes." },
  { target: 'tour-supplier-boutiques', title: 'Vos boutiques', description: 'Complétez vos informations de boutique — indispensable pour vendre vos produits.' },
  { target: 'tour-supplier-orders', title: 'Vos commandes', description: 'Suivez et mettez à jour le statut de chaque commande reçue.' },
  { target: 'tour-supplier-products', title: 'Vos produits', description: 'Ajoutez de nouveaux articles et gérez votre catalogue.' },
  { target: 'tour-supplier-wallet', title: 'Votre portefeuille', description: 'Vos gains sont crédités ici après chaque livraison réussie — demandez un retrait à tout moment.' },
  { target: 'tour-supplier-badge', title: 'Vendeur Vérifié', description: 'Obtenez le badge certifié pour renforcer la confiance de vos acheteurs.' },
];
