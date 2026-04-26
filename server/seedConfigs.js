import { Config } from './models/index.js';

const initialConfigs = [
    // Branding
    { key: 'APP_NAME', value: 'Vtout', group: 'branding', description: 'Nom de la marketplace' },
    { key: 'site_logo', value: '/logo.png', group: 'branding', description: 'URL du logo' },
    
    // Social Media
    { key: 'FACEBOOK', value: 'https://facebook.com/vtout', group: 'social', description: 'Lien Facebook' },
    { key: 'WHATSAPP', value: '+229 61 00 00 00', group: 'social', description: 'Numéro WhatsApp' },
    { key: 'INSTAGRAM', value: 'https://instagram.com/vtout', group: 'social', description: 'Lien Instagram' },
    { key: 'TIKTOK', value: 'https://tiktok.com/@vtout', group: 'social', description: 'Lien TikTok' },
    
    // Contact Info
    { key: 'CONTACT_EMAIL', value: 'contact@vtout.com', group: 'contact', description: 'Email de support' },
    { key: 'CONTACT_PHONE', value: '+229 61 00 00 00', group: 'contact', description: 'Téléphone de support' },
    { key: 'CONTACT_ADDRESS', value: 'Calavi Bidosèssi, Cotonou, Bénin', group: 'contact', description: 'Adresse physique du siège' },
    
    // Business Hours
    { key: 'hours_weekday', value: '08:00 - 18:00', group: 'hours', description: 'Heures en semaine' },
    { key: 'hours_weekend', value: '09:00 - 13:00', group: 'hours', description: 'Heures le weekend' },
    
    // Features
    { key: 'feature_delivery_fee', value: '1000', group: 'features', description: 'Frais de livraison par défaut' },
    { key: 'feature_free_shipping_threshold', value: '50000', group: 'features', description: 'Seuil pour livraison gratuite' },

    // API & Services
    { key: 'api_mapbox_token', value: 'pk.eyJ1IjoibW91aGFtZWQxNzIwMDIiLCJhbiI6ImNsdW8ycG04ejBndG0yaW1vbmF6am1wZzIifQ', group: 'api', description: 'Token Public Mapbox' },
    { key: 'api_fedapay_public', value: 'pk_live_xxxx', group: 'api', description: 'Clé Publique FedaPay' },
    { key: 'site_mode', value: 'live', group: 'api', description: 'Mode du site (live / maintenance)' }
];

async function seedConfigs() {
    try {
        console.log('🌱 Seeding initial configurations...');
        for (const cfg of initialConfigs) {
            await Config.findOrCreate({
                where: { key: cfg.key },
                defaults: cfg
            });
        }
        console.log('✅ Configurations seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedConfigs();
