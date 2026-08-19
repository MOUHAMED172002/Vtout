// Contenu du Centre d'aide admin — explique, section par section, à quoi
// sert chaque page du dashboard et comment elle fonctionne concrètement.
// La structure (menu / key) reflète volontairement celle de `menuItems`
// dans AdminLayaout.jsx : chaque entrée peut donc être ouverte directement
// depuis le centre d'aide via le même mécanisme que la recherche globale.
//
// keywords : termes additionnels qui doivent faire remonter l'entrée dans
// la recherche du centre d'aide même s'ils n'apparaissent pas dans le titre.
export const ADMIN_HELP_SECTIONS = [
  {
    menu: "Dashboard",
    items: [
      {
        key: "overview",
        title: "Vue d'ensemble",
        summary: "Le tableau de bord principal : chiffre d'affaires, commandes récentes, produits les plus vendus, statistiques clés.",
        details: [
          "Première page vue à la connexion — vue globale de l'activité de la marketplace.",
          "Les widgets se rechargent depuis les vraies données (commandes, ventes) à chaque visite.",
        ],
      },
      {
        key: "sales",
        title: "Analyses des ventes",
        summary: "Graphique d'évolution du chiffre d'affaires et des commandes dans le temps.",
        details: ["Utile pour repérer les tendances (pics, creux) sur une période."],
      },
      {
        key: "searchAnalytics",
        title: "Mots-clés recherchés",
        summary: "Ce que les clients tapent dans la barre de recherche du site — y compris les recherches sans résultat.",
        details: [
          "Sert à identifier des produits à ajouter au catalogue (forte demande, aucun résultat).",
        ],
        keywords: ["mots clés", "recherche client", "produits manquants"],
      },
    ],
  },
  {
    menu: "Produits",
    items: [
      {
        key: "productsList",
        title: "Tous les produits",
        summary: "Liste complète des produits publiés sur Vtout, toutes boutiques confondues, avec recherche/filtre.",
        details: ["Point d'entrée pour éditer, désactiver ou consulter le stock d'un produit existant."],
      },
      {
        key: "addProduct",
        title: "Ajouter un produit",
        summary: "Formulaire de création d'un nouveau produit (nom, images, prix, variantes, catégorie).",
        details: [
          "Un produit créé côté admin peut être rattaché à n'importe quel fournisseur/boutique.",
          "Si le produit a des variantes (taille/couleur…), la combinaison complète doit être renseignée avant publication.",
        ],
      },
      {
        key: "editProduct",
        title: "Liste des marques",
        summary: "Vue des fournisseurs/marques référencés, pour retrouver rapidement à qui appartient un produit.",
        details: [],
      },
      {
        key: "categories",
        title: "Gestion Catégories",
        summary: "Créer, renommer ou réorganiser les catégories/sous-catégories du catalogue.",
        details: ["Les catégories définies ici alimentent les filtres du site client."],
      },
      {
        key: "variants",
        title: "Gestion Variantes",
        summary: "Gère les attributs de variantes (ex: Taille, Couleur) et leurs valeurs possibles, réutilisables sur plusieurs produits.",
        details: [],
      },
    ],
  },
  {
    menu: "Fournisseurs",
    items: [
      {
        key: "suppliersList",
        title: "Validation Fournisseurs",
        summary: "File d'attente des inscriptions fournisseur à approuver, suspendre ou rejeter.",
        details: [
          "Une approbation déclenche une notification WhatsApp + email au fournisseur.",
          "Permet aussi de créer directement un compte fournisseur depuis l'admin (avec prix d'achat vendeur).",
        ],
        keywords: ["approbation", "kyc", "boutique"],
      },
      {
        key: "productsApproval",
        title: "Validation Produits",
        summary: "Modération des produits soumis par les fournisseurs avant qu'ils n'apparaissent sur le site.",
        details: ["Un produit rejeté déclenche une notification au fournisseur avec le motif renseigné."],
      },
      {
        key: "boutiquesCatalog",
        title: "Catalogue Boutiques",
        summary: "Vue par boutique (un fournisseur peut avoir plusieurs boutiques) plutôt que par produit individuel.",
        details: [],
      },
      {
        key: "sellerBadge",
        title: "Vendeur Vérifié",
        summary: "Gère le badge \"Vendeur Certifié\" — abonnement mensuel payant que les fournisseurs souscrivent depuis leur portail, ou attribution manuelle gratuite par l'admin.",
        details: [
          "Le prix mensuel se règle ici (ou dans Configuration Royale).",
          "Un badge expire automatiquement à la fin de sa période s'il n'est pas renouvelé (cron).",
          "L'admin peut distinguer un badge \"payant\" d'un badge \"offert\" manuellement.",
        ],
        keywords: ["badge certifié", "abonnement", "vérifié"],
      },
    ],
  },
  {
    menu: "Commandes",
    items: [
      {
        key: "ordersList",
        title: "Toutes les commandes",
        summary: "Liste de toutes les commandes, avec statut, paiement, filtre et détail complet.",
        details: [
          "Pour un paiement en ligne (FedaPay/Mobile Money/Carte), la commande n'existe dans cette liste qu'UNE FOIS le paiement confirmé — avant ça, elle est en attente (PendingCheckout), invisible ici, mais le stock est déjà réservé.",
          "Chaque commande a un code de livraison (delivery_code) à usage anti-fraude, que le client doit donner au livreur à la réception.",
        ],
        keywords: ["paiement en ligne", "pendingcheckout", "code livraison"],
      },
      {
        key: "disputes",
        title: "Retours & Litiges",
        summary: "Traite les réclamations client (produit différent de l'annonce, non reçu, etc.) avec notes internes non visibles du client.",
        details: ["Chaque litige suit un cycle de statuts (ex: en examen → résolu) et affiche un délai moyen de traitement."],
      },
      {
        key: "delivery",
        title: "Livraison",
        summary: "Suivi et assignation manuelle des livreurs sur les commandes en attente de prise en charge.",
        details: [
          "En temps normal, les livreurs \"prennent\" eux-mêmes une commande disponible (premier arrivé, premier servi) — cette page permet à l'admin d'assigner ou réassigner manuellement si besoin.",
          "Une suggestion de livreurs est proposée, triée par correspondance avec la commune du fournisseur (zones de service déclarées par chaque livreur).",
        ],
        keywords: ["assignation", "livreur", "zone"],
      },
    ],
  },
  {
    menu: "Logistique",
    items: [
      {
        key: "livreurs",
        title: "Validation Livreurs",
        summary: "File d'attente des candidatures livreur (pièce d'identité, véhicule) à approuver ou rejeter.",
        details: ["Filtrable par zone déclarée par le candidat."],
      },
      {
        key: "controlTower",
        title: "Tour de Contrôle",
        summary: "Vue temps réel de l'activité logistique (courses en cours, retards, synchronisation).",
        details: [],
      },
      {
        key: "cashControl",
        title: "Contrôle Cash",
        summary: "Suivi de l'argent collecté en espèces par les livreurs (paiement à la livraison) et validation de son versement à l'admin.",
        details: [
          "Un livreur avec des livraisons cash non remises ne peut pas prendre de nouvelle course tant que ce n'est pas validé ici.",
        ],
        keywords: ["cash", "dette", "paiement livraison"],
      },
      {
        key: "dailyStats",
        title: "Stats Journalières",
        summary: "Statistiques de performance des livreurs au jour le jour (nombre de courses, etc.).",
        details: [],
      },
    ],
  },
  {
    menu: "Utilisateurs",
    items: [
      {
        key: "usersList",
        title: "Liste utilisateurs",
        summary: "Tous les comptes clients de la plateforme — recherche, détail, activation/suspension de compte.",
        details: [],
      },
    ],
  },
  {
    menu: "Contenu & Blog",
    items: [
      {
        key: "blog",
        title: "Articles de Blog",
        summary: "Rédaction et publication d'articles (actualités, guides) affichés sur le site public.",
        details: ["Statuts brouillon / publié."],
      },
      {
        key: "faq",
        title: "FAQ",
        summary: "Questions/réponses affichées sur la page d'aide du site public.",
        details: [],
      },
      {
        key: "policy",
        title: "Politique de confidentialité",
        summary: "Contenu légal (politique de confidentialité) affiché sur le site public.",
        details: [],
      },
    ],
  },
  {
    menu: "Marketing",
    items: [
      {
        key: "coupons",
        title: "Codes Promo",
        summary: "Création et gestion des coupons de réduction (pourcentage, montant fixe, livraison offerte, etc.), avec conditions d'usage.",
        details: [
          "Plusieurs types de coupons possibles selon la nature de la réduction souhaitée.",
          "Un coupon peut être limité en nombre d'usages, en montant minimum de commande, ou dans le temps.",
        ],
        keywords: ["réduction", "promo", "code"],
      },
      {
        key: "referrals",
        title: "Parrainage",
        summary: "Programme de parrainage client : récompense du parrain après la première commande confirmée du filleul, coupon de bienvenue au filleul.",
        details: [
          "Les montants des récompenses se règlent dans Configuration Royale (0 = programme désactivé).",
          "Tableau de bord des parrainages actifs et de leur statut de conversion.",
        ],
        keywords: ["parrain", "filleul", "récompense"],
      },
      {
        key: "adDistribution",
        title: "Distribution WhatsApp",
        summary: "Gère les campagnes de publicité diffusées par les distributeurs via leur statut WhatsApp, et la modération des captures d'écran soumises comme preuve.",
        details: [
          "La récompense d'un distributeur = nombre de vues × taux par vue défini par campagne, après un délai fixe de 24h.",
          "Détection automatique des captures dupliquées par hash perceptif avant validation.",
        ],
        keywords: ["distributeur", "annonceur", "statut whatsapp", "capture"],
      },
    ],
  },
  {
    menu: "Finances",
    items: [
      {
        key: "payouts",
        title: "Retraits Partenaires",
        summary: "Demandes de retrait de solde faites par les fournisseurs, livreurs et distributeurs — à approuver ou rejeter (avec motif).",
        details: [],
      },
    ],
  },
  {
    menu: "Paramètres",
    items: [
      {
        key: "config",
        title: "Configuration Royale",
        summary: "Réglages généraux du site : branding, réseaux sociaux, bannières page d'accueil, clés API publiques (Mapbox, FedaPay), montant du badge certifié, montants de parrainage.",
        details: ["C'est le fourre-tout central pour tout ce qui n'a pas sa propre page dédiée."],
        keywords: ["branding", "api", "bannière", "hero"],
      },
      {
        key: "store",
        title: "Boutique",
        summary: "Informations générales de la boutique/plateforme.",
        details: [],
      },
      {
        key: "payment",
        title: "Paiement",
        summary: "⚠️ Page non fonctionnelle actuellement — les champs affichés (FedaPay, PayPal) ne sont pas encore sauvegardés en base. La vraie configuration FedaPay se fait via variables d'environnement serveur.",
        details: [],
        keywords: ["fedapay", "placeholder", "non implémenté"],
      },
      {
        key: "shipping",
        title: "Livraison",
        summary: "⚠️ Page non fonctionnelle actuellement (interface seule, non connectée à une sauvegarde). Les vrais réglages de frais de livraison sont dans \"Frais de Livraison\" et \"Coefficient Livreur\" ci-dessous.",
        details: [],
        keywords: ["zones", "frais", "placeholder"],
      },
      {
        key: "whatsapp",
        title: "WhatsApp",
        summary: "Identifiants WhatChimp (Phone Number ID + Token API), numéros admin à notifier, et bouton de test d'envoi.",
        details: [
          "WhatChimp repose sur l'API Cloud officielle WhatsApp : texte libre seulement possible dans les 24h après un message du destinataire, sinon un template Meta pré-approuvé est requis.",
          "Le bouton \"Envoyer un test\" permet de vérifier la config sans passer par un vrai flux applicatif.",
        ],
        keywords: ["whatchimp", "green api", "otp", "template", "notification"],
      },
      {
        key: "cloudinary",
        title: "Cloudinary",
        summary: "Identifiants du service d'hébergement d'images utilisé pour les photos produits/boutiques.",
        details: [],
        keywords: ["images", "upload", "stockage"],
      },
      {
        key: "notifications",
        title: "Email & Notifications",
        summary: "Clé API Resend et adresse d'expédition pour les emails automatiques (confirmations, factures, alertes).",
        details: ["Bouton de test d'envoi d'email disponible ici aussi."],
      },
      {
        key: "geography",
        title: "Géographie",
        summary: "Gestion des communes/zones utilisées pour le calcul des frais de livraison et le filtre de zone de service des livreurs.",
        details: [],
      },
      {
        key: "supportMessages",
        title: "Messages Support",
        summary: "Messagerie de support avec les utilisateurs (tickets, réponses) — une réponse envoyée déclenche une notification WhatsApp au client.",
        details: [],
      },
      {
        key: "deliveryFeeTiers",
        title: "Frais de Livraison",
        summary: "Barème des frais de livraison selon le prix vendeur d'un article (paliers configurables).",
        details: ["Ces frais sont ce qui compose la part \"livreur\" du prix final payé par le client."],
      },
      {
        key: "deliveryMultiplier",
        title: "Coefficient Livreur",
        summary: "Coefficient multiplicateur appliqué aux frais de livraison selon la quantité totale d'articles d'une commande.",
        details: [],
        keywords: ["multiplicateur"],
      },
      {
        key: "adminAccount",
        title: "Compte Admin",
        summary: "⚠️ Formulaire local pour email/mot de passe admin — le changement réel de mot de passe doit passer par le système d'authentification (pas cette page à elle seule).",
        details: [],
        keywords: ["mot de passe", "email admin"],
      },
    ],
  },
];
