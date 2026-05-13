import 'dotenv/config';
import sequelize from './config/database.js';

async function fixSchema() {
  try {
    const [results] = await sequelize.query("DESCRIBE order_items");
    const boutiqueIdCol = results.find(c => c.Field === 'boutique_id');
    
    if (boutiqueIdCol) {
      console.log(`Current boutique_id type: ${boutiqueIdCol.Type}`);
      if (boutiqueIdCol.Type.toLowerCase().includes('int')) {
        console.log("Altering boutique_id to CHAR(36)...");
        await sequelize.query("ALTER TABLE order_items MODIFY boutique_id CHAR(36)");
        console.log("Alter complete.");
      } else {
        console.log("Type is already compatible (not int).");
      }
    } else {
      console.log("boutique_id column not found. This is unexpected.");
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

fixSchema();
