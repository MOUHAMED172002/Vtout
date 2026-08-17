import { Config } from './models/index.js';

const initialConfigs = [
    // Branding
    { key: 'APP_NAME', value: 'Vtout', group: 'branding', description: 'Nom de la marketplace' },
    { key: 'site_logo', value: '/logo.png', group: 'branding', description: 'URL du logo' },

    // Social Media
    { key: 'FACEBOOK', value: 'https://facebook.com/vtout', group: 'social', description: 'Lien Facebook' },
    { key: 'WHATSAPP', value: '+229 61 00 00 00', group: 'social', description: 'Numéro WhatsApp' },
    { key: 'INSTAGRAM', value: 'https://instagram.com/vtout', group: 'social', description: 'Lien Instagram' },
    { key: 'TIKTOK', value: '', group: 'social', description: 'Lien TikTok (laisser vide pour masquer le bouton)' },

    // Feature flags
    { key: 'show_how_it_works', value: 'true', group: 'features', description: 'Afficher la page "Comment ça marche" (true/false)' },

    // Supplier portal landing — "Comment ça marche" steps (editable from admin)
    { key: 'supplier_how_it_works_steps', value: JSON.stringify([
        { icon: 'Store',      title: 'Créez votre boutique',   desc: 'Inscrivez-vous gratuitement, complétez votre profil et obtenez votre espace vendeur validé en moins de 24h.' },
        { icon: 'Package',    title: 'Ajoutez vos produits',   desc: 'Publiez vos articles avec photos et prix vendeur. Vtout calcule automatiquement le prix client final.' },
        { icon: 'Truck',      title: 'On gère la logistique',  desc: 'Nos livreurs récupèrent vos commandes chez vous et les livrent chez le client. Vous ne bougez pas.' },
        { icon: 'CreditCard', title: 'Soyez payé rapidement',  desc: 'Vos gains sont crédités sur votre portefeuille Vtout après chaque livraison confirmée.' }
    ]), group: 'supplier_landing', description: 'Étapes "Comment ça marche" vendeur — JSON [{icon, title, desc}]. Icônes: Store, Package, Truck, CreditCard, BarChart3, Zap, ShieldCheck' },

    // Contact Info
    { key: 'CONTACT_EMAIL', value: 'contact@vtout.com', group: 'contact', description: 'Email de support' },
    { key: 'CONTACT_PHONE', value: '+229 61 00 00 00', group: 'contact', description: 'Téléphone de support' },

    // WhatsApp API (WhatChimp) — clés alignées sur whatsappService.js/getWhatsAppConfigs
    { key: 'whatsapp_phone_number_id', value: '', group: 'whatsapp', description: 'Phone Number ID WhatChimp' },
    { key: 'whatsapp_api_token', value: '', group: 'whatsapp', description: 'Token API WhatChimp' },
    { key: 'whatsapp_admin_phones', value: '', group: 'whatsapp', description: 'Numéros admin (séparés par des virgules)' },

    // Cloudinary Config
    { key: 'CLOUDINARY_CLOUD_NAME', value: '', group: 'cloudinary', description: 'Cloudinary Cloud Name' },
    { key: 'CLOUDINARY_API_KEY', value: '', group: 'cloudinary', description: 'Cloudinary API Key' },
    { key: 'CLOUDINARY_API_SECRET', value: '', group: 'cloudinary', description: 'Cloudinary API Secret' },

    // API & Services
    { key: 'api_mapbox_token', value: 'pk.eyJ1IjoibW91aGFtZWQxNzIwMDIiLCJhbiI6ImNsdW8ycG04ejBndG0yaW1vbmF6am1wZzIifQ', group: 'api', description: 'Token Public Mapbox' },
    { key: 'api_fedapay_public', value: 'pk_live_xxxx', group: 'api', description: 'Clé Publique FedaPay' },
    { key: 'site_mode', value: 'live', group: 'api', description: 'Mode du site (live / maintenance)' },

    // Badge "Vendeur Certifié"
    { key: 'seller_badge_monthly_price', value: '5000', group: 'seller_badge', description: 'Montant mensuel (XOF) du badge Vendeur Certifié' },

    // Parrainage — montants à 0 par défaut (aucun coupon n'est généré tant
    // que l'administrateur n'a pas fixé un montant > 0). Voir aussi
    // controllers/referralController.js, qui crée ces mêmes clés à la
    // volée si ce script n'a jamais été exécuté.
    { key: 'referral_referrer_reward', value: '0', group: 'referral', description: "Montant (FCFA) du coupon offert au parrain après la 1ère commande confirmée de son filleul — 0 = désactivé" },
    { key: 'referral_referred_reward', value: '0', group: 'referral', description: "Montant (FCFA) du coupon de bienvenue offert au filleul dès son inscription — 0 = désactivé" },
    { key: 'referral_min_order_amount', value: '5000', group: 'referral', description: "Montant minimum de commande (FCFA) pour utiliser un coupon de parrainage" },
    { key: 'referral_coupon_validity_days', value: '60', group: 'referral', description: "Durée de validité (jours) des coupons de parrainage" },
];

export async function seedConfigs() {
    try {
        console.log('🌱 [SEED] Checking initial configurations...');
        for (const cfg of initialConfigs) {
            const [config, created] = await Config.findOrCreate({
                where: { key: cfg.key },
                defaults: cfg
            });
            if (created) {
                console.log(`+ Added config: ${cfg.key}`);
            }
        }
        console.log('✅ [SEED] Configurations check done.');
    } catch (error) {
        console.error('❌ [SEED] Failed:', error.message);
    }
}
