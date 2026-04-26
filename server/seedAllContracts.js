import { Policy, ProductAttribute, AttributeValue, CategoryAttribute, CategoryAttributeValue, sequelize } from './models/index.js';

async function seedEverything() {
    try {
        await sequelize.authenticate();
        console.log('Connection established.');

        // 1. SEED CONTRACTS (POLICIES)
        console.log('--- Seeding Contracts ---');
        const policies = [
            {
                type: 'general', // Used as CGV
                title: 'Conditions Générales de Vente (CGV)',
                content: `
CONDITIONS GÉNÉRALES DE VENTE - VTOUT BÉNIN (DROPSHIPPING)
1. OBJET: VTOUT agit en tant qu'intermédiaire facilitant la vente entre fournisseurs et clients.
2. PRIX: Le prix affiché est ferme et non négociable.
3. LIVRAISON: Les frais de livraison sont forfaitaires par ligne de commande.
                `.trim()
            },
            {
                type: 'supplier',
                title: 'Contrat de Partenariat Fournisseur',
                content: `
CONTRAT PARTENAIRE FOURNISSEUR
1. ENGAGEMENT: Le fournisseur s'engage à fournir des produits originaux et conformes.
2. PRIX FOURNISSEUR: Le prix fournisseur doit être respecté par la plateforme comme base de calcul.
3. EXPÉDITION: Le fournisseur prépare le colis pour le livreur VTOUT dès réception de la notification.
                `.trim()
            },
            {
                type: 'delivery',
                title: 'Contrat Prestataire de Livraison',
                content: `
CONTRAT LIVREUR INDÉPENDANT
1. COURSES: Le livreur reçoit une commission fixe par course selon les frais de livraison payés par le client.
2. ENCAISSEMENT: Le livreur est responsable des fonds collectés lors des paiements à la livraison.
3. DÉLAIS: Le respect des créneaux horaires est impératif pour la qualité de service.
                `.trim()
            }
        ];

        for (const p of policies) {
            const [record, created] = await Policy.findOrCreate({
                where: { type: p.type },
                defaults: p
            });
            if (!created) await record.update(p);
            console.log(`✅ ${p.title} initialized.`);
        }

        // 2. SEED ATTRIBUTES (Basic subset)
        console.log('--- Seeding Attributes ---');
        const attrs = ['Couleur', 'Taille', 'Pointure', 'Capacité Storage', 'RAM'];
        for (const name of attrs) {
            await ProductAttribute.findOrCreate({ where: { name } });
        }
        console.log('✅ Basic attributes initialized.');

        console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedEverything();
