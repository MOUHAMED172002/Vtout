import { sequelize } from '../models/index.js';
import 'dotenv/config';

async function fixSchema() {
    console.log("=== RÉPARATION DU SCHÉMA DE LA BASE DE DONNÉES ===");
    try {
        // 1. Vérifier si la colonne emailVerified existe
        const [columns] = await sequelize.query("SHOW COLUMNS FROM `user` LIKE 'emailVerified'");
        
        if (columns.length === 0) {
            console.log("-> Ajout de la colonne 'emailVerified'...");
            await sequelize.query("ALTER TABLE `user` ADD COLUMN `emailVerified` TINYINT(1) DEFAULT 0 AFTER `email` ");
            console.log("✅ Colonne 'emailVerified' ajoutée.");
        } else {
            console.log("✅ La colonne 'emailVerified' existe déjà.");
        }

        // 2. Vérifier les autres colonnes standards de Better Auth
        const [imageCol] = await sequelize.query("SHOW COLUMNS FROM `user` LIKE 'image'");
        if (imageCol.length === 0) {
            console.log("-> Ajout de la colonne 'image'...");
            await sequelize.query("ALTER TABLE `user` ADD COLUMN `image` TEXT AFTER `emailVerified` ");
            console.log("✅ Colonne 'image' ajoutée.");
        }

        console.log("=== RÉPARATION TERMINÉE AVEC SUCCÈS ===");
    } catch (error) {
        console.error("❌ ERREUR LORS DE LA RÉPARATION :", error.message);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

fixSchema();
