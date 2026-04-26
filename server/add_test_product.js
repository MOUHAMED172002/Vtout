import { sequelize, Product, ProductImage, SupplierProduct, Category, Supplier } from './models/index.js';
import crypto from 'crypto';

async function run() {
    try {
        await sequelize.authenticate();
        
        const cat = await Category.findOne();
        const sup = await Supplier.findOne();

        if (!cat || !sup) {
            console.error("Erreur: Catégorie ou Fournisseur manquant pour le test.");
            process.exit(1);
        }

        const productId = crypto.randomUUID();
        const product = await Product.create({
            id: productId,
            name: "🚀 Produit de Test Premium",
            description: "Ceci est un produit généré automatiquement pour tester le design et l'approbation admin.",
            price: 750000,
            old_price: 850000,
            stock: 50,
            category_id: cat.id,
            approval_status: 'En attente',
            supplier_id: sup.id
        });

        await ProductImage.create({
            id: crypto.randomUUID(),
            product_id: productId,
            image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
            is_main: true
        });

        console.log("✅ Produit de test créé avec succès ! ID:", product.id);
        process.exit(0);
    } catch (err) {
        console.error("Erreur:", err.message);
        process.exit(1);
    }
}

run();
