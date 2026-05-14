import { 
    sequelize, Category, ProductAttribute, AttributeValue 
} from './models/index.js';

const categories = [
    { id: 1, name: 'Électronique', icon: '📱', parent_id: null },
    { id: 2, name: 'Téléphones & Tablettes', icon: '📲', parent_id: 1 },
    { id: 3, name: 'Smartphones', icon: '🤳', parent_id: 2 },
    { id: 4, name: 'Tablettes', icon: '📟', parent_id: 2 },
    { id: 5, name: 'Ordinateurs', icon: '💻', parent_id: 1 },
    { id: 6, name: 'Laptops', icon: '💻', parent_id: 5 },
    { id: 7, name: 'Ordinateurs de bureau', icon: '🖥️', parent_id: 5 },
    { id: 8, name: 'Composants PC', icon: '⚙️', parent_id: 5 },
    { id: 9, name: 'Audio', icon: '🎧', parent_id: 1 },
    { id: 10, name: 'Écouteurs & Casques', icon: '🎧', parent_id: 9 },
    { id: 11, name: 'Enceintes Bluetooth', icon: '🔊', parent_id: 9 },
    
    { id: 20, name: 'Mode', icon: '👕', parent_id: null },
    { id: 21, name: 'Vêtements Homme', icon: '👔', parent_id: 20 },
    { id: 22, name: 'Vêtements Femme', icon: '👗', parent_id: 20 },
    { id: 23, name: 'Chaussures', icon: '👟', parent_id: 20 },
    { id: 24, name: 'Sacs & Accessoires', icon: '👜', parent_id: 20 },
    { id: 25, name: 'Montres & Bijoux', icon: '⌚', parent_id: 20 },
    
    { id: 40, name: 'Maison & Office', icon: '🏠', parent_id: null },
    { id: 41, name: 'Cuisine', icon: '🍳', parent_id: 40 },
    { id: 42, name: 'Électroménager', icon: '🧺', parent_id: 40 },
    { id: 43, name: 'Meubles', icon: '🪑', parent_id: 40 },
    { id: 44, name: 'Décoration', icon: '🖼️', parent_id: 40 },
    
    { id: 60, name: 'Beauté & Santé', icon: '💄', parent_id: null },
    { id: 61, name: 'Maquillage', icon: '🎨', parent_id: 60 },
    { id: 62, name: 'Soins du corps', icon: '🧴', parent_id: 60 },
    { id: 63, name: 'Parfums', icon: '✨', parent_id: 60 },
    
    { id: 80, name: 'Sport & Loisirs', icon: '⚽', parent_id: null },
    { id: 81, name: 'Fitness', icon: '🏋️', parent_id: 80 },
    { id: 82, name: 'Camping', icon: '⛺', parent_id: 80 },
    { id: 83, name: 'Sports d\'équipe', icon: '🏀', parent_id: 80 },
    
    { id: 100, name: 'Supermarché', icon: '🛒', parent_id: null },
    { id: 101, name: 'Boissons', icon: '🥤', parent_id: 100 },
    { id: 102, name: 'Épicerie', icon: '🍝', parent_id: 100 },
    { id: 103, name: 'Produits Frais', icon: '🍎', parent_id: 100 }
];

const attributes = [
    {
        name: 'Couleur',
        values: ['Noir', 'Blanc', 'Gris', 'Argent', 'Or', 'Bleu', 'Rouge', 'Vert', 'Jaune', 'Rose', 'Violet', 'Marron', 'Orange', 'Beige', 'Multicolore']
    },
    {
        name: 'Taille',
        values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Unique']
    },
    {
        name: 'Pointure',
        values: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']
    },
    {
        name: 'Stockage',
        values: ['8GB', '16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB']
    },
    {
        name: 'RAM',
        values: ['2GB', '4GB', '6GB', '8GB', '12GB', '16GB', '32GB', '64GB']
    },
    {
        name: 'Écran',
        values: ['5"', '5.5"', '6"', '6.1"', '6.5"', '6.7"', '10"', '11"', '13"', '14"', '15"', '15.6"', '17"', '24"', '27"', '32"', '40"', '43"', '50"', '55"', '65"', '75"']
    },
    {
        name: 'Processeur',
        values: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'Apple M1', 'Apple M2', 'Apple M3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Snapdragon 8 Gen 1', 'Snapdragon 8 Gen 2', 'A15 Bionic', 'A16 Bionic']
    },
    {
        name: 'Matière',
        values: ['Coton', 'Cuir', 'Simili Cuir', 'Polyester', 'Soie', 'Laine', 'Plastique', 'Métal', 'Acier Inoxydable', 'Aluminium', 'Bois', 'Verre', 'Céramique']
    },
    {
        name: 'Capacité',
        values: ['500ml', '1L', '1.5L', '2L', '5L', '10L', '20L', '50L', '100L']
    },
    {
        name: 'Voltage',
        values: ['5V', '12V', '24V', '110V', '220V']
    }
];

export async function runComprehensiveSeed() {
    try {
        console.log('🌟 Starting Comprehensive Seed...');

        // 1. Categories
        console.log('📂 Seeding Categories (Safe mode)...');
        for (const cat of categories) {
            await Category.findOrCreate({
                where: { id: cat.id },
                defaults: cat
            });
        }
        console.log('✅ Categories checked/seeded.');

        // 2. Attributes & Values
        console.log('🏷️ Seeding Attributes & Values...');
        for (const attr of attributes) {
            const [productAttr] = await ProductAttribute.findOrCreate({
                where: { name: attr.name }
            });

            for (const val of attr.values) {
                await AttributeValue.findOrCreate({
                    where: { 
                        attribute_id: productAttr.id,
                        value: val
                    }
                });
            }
        }
        console.log('✅ Attributes seeded.');

        console.log('✨ Comprehensive Seed Completed Successfully!');
    } catch (error) {
        console.error('❌ Seed Failed:', error);
    }
}

// Allow running directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runComprehensiveSeed().then(() => process.exit(0));
}
