const { sequelize } = require('./models');

async function syncDB() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connexion à MySQL réussie.');

        // sync({ alter: true }) mettra à jour les tables existantes sans supprimer les données
        // Use { force: true } uniquement si vous voulez tout écraser au début
        await sequelize.sync({ alter: true });
        console.log('✅ Base de données synchronisée.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur de synchronisation:', error);
        process.exit(1);
    }
}

syncDB();
