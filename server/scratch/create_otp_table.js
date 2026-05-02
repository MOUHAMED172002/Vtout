import { Otp } from '../models/index.js';

async function syncTable() {
    try {
        console.log("⏳ Création de la table 'otps'...");
        await Otp.sync({ alter: true });
        console.log("✅ Table 'otps' prête !");
        process.exit(0);
    } catch (err) {
        console.error("❌ Erreur :", err);
        process.exit(1);
    }
}

syncTable();
