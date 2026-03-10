require('dotenv').config();
const { sequelize, Category, Product, ProductImage, Profile } = require('./models');
const crypto = require('crypto');

async function seed() {
    try {
        console.log('⏳ Désactivation des contraintes de clés étrangères...');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        console.log('⏳ Synchronisation de la base de données (force: true)...');
        await sequelize.sync({ force: true });

        console.log('⏳ Réactivation des contraintes de clés étrangères...');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('✅ Base de données réinitialisée.');

        // 1. Créer un profil de test (optionnel mais utile pour UUID)
        console.log('⏳ Création d\'un profil test...');
        const profileId = crypto.randomUUID();
        await Profile.create({
            id: profileId,
            email: 'test@example.com',
            fullname: 'Utilisateur Test',
            role: 'admin',
            clerk_id: 'user_2bdZ...' // Un ID fictif pour le dev
        });

        // 2. Créer des catégories
        console.log('⏳ Création des catégories...');
        const cat1 = await Category.create({
            name: 'Électronique',
            icon: '📱'
        });

        const cat2 = await Category.create({
            name: 'Montres',
            icon: '⌚'
        });

        // 3. Créer des produits
        console.log('⏳ Création des produits...');
        const p1Id = crypto.randomUUID();
        const p1 = await Product.create({
            id: p1Id,
            name: 'Casques Audio Premium',
            description: 'Un son exceptionnel avec réduction de bruit active.',
            price: 150000,
            old_price: 180000,
            category_id: cat1.id,
            stock: 10
        });

        const p2Id = crypto.randomUUID();
        const p2 = await Product.create({
            id: p2Id,
            name: 'Montre Connectée Sport',
            description: 'Suivez vos performances sportives en temps réel.',
            price: 75000,
            category_id: cat2.id,
            stock: 25
        });

        // 4. Ajouter des images (la table separate)
        console.log('⏳ Ajout des images...');
        await ProductImage.create({
            product_id: p1.id,
            image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
            is_main: true
        });

        await ProductImage.create({
            product_id: p1.id,
            image_url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944',
            is_main: false
        });

        await ProductImage.create({
            product_id: p2.id,
            image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
            is_main: true
        });

        console.log('✅ Données de test insérées avec succès !');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors du seeding:', error);
        process.exit(1);
    }
}

seed();
