
const { sequelize, Category, Product, Supplier } = require('./server/models/index.js');

async function runProductReady() {
    console.log("🚀 Lancement du Protocole Product Ready...");
    const logs = [];

    try {
        // 1. Check DB Connection
        await sequelize.authenticate();
        logs.push("✅ Connexion base de données OK.");

        // 2. Sync Missing Categories Commissions
        const categories = await Category.findAll();
        let catFixed = 0;
        for (const cat of categories) {
            if (!cat.commission_rate || parseFloat(cat.commission_rate) === 0) {
                await cat.update({ commission_rate: 10.00 });
                catFixed++;
            }
        }
        logs.push(`✅ Commissions : ${catFixed} catégories corrigées (10% par défaut). Total: ${categories.length}`);

        // 3. Product Approval Audit
        const totalProducts = await Product.count();
        const approvedProducts = await Product.count({ where: { approval_status: 'Approuvé' } });
        const pendingProducts = await Product.count({ where: { approval_status: 'En attente' } });
        logs.push(`✅ Audit Produits : ${approvedProducts}/${totalProducts} approuvés (${pendingProducts} en attente).`);

        // 4. Critical Data Check (Suppliers phone)
        const suppliers = await Supplier.findAll({ include: ['user'] });
        let issues = 0;
        suppliers.forEach(s => {
            if (!s.user?.phone) issues++;
        });
        if (issues > 0) {
            logs.push(`⚠️ Alerte : ${issues} vendeurs n'ont pas de numéro de téléphone configuré.`);
        } else {
            logs.push("✅ Tous les vendeurs ont un profil valide.");
        }

        console.log("\n--- RAPPORT FINAL PROTOCOLE PRODUCT READY ---");
        logs.forEach(l => console.log(l));
        console.log("----------------------------------------------");
        process.exit(0);

    } catch (error) {
        console.error("❌ ERREUR CRITIQUE PROTOCOLE :", error);
        process.exit(1);
    }
}

runProductReady();
