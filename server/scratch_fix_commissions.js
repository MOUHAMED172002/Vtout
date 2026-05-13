
import { Category } from './models/index.js';
import sequelize from './config/database.js';

async function fixCommissions() {
  try {
    console.log("🚀 Début de la mise à jour des commissions...");
    
    // 1. On récupère toutes les catégories
    const categories = await Category.findAll();
    console.log(`🔍 ${categories.length} catégories trouvées.`);

    let count = 0;
    for (const cat of categories) {
      // On met 10% par défaut si c'est null ou 0
      if (!cat.commission_rate || parseFloat(cat.commission_rate) === 0) {
        await cat.update({ 
            commission_rate: 10.00,
            commissionRate: 10.00 // Pour la sécurité avec Sequelize
        });
        console.log(`✅ Catégorie "${cat.name}" mise à 10%`);
        count++;
      }
    }

    console.log(`\n✨ Terminé ! ${count} catégories ont été mises à jour.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour :", error);
    process.exit(1);
  }
}

fixCommissions();
