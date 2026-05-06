import { sequelize } from './models/index.js';

async function updateDb() {
    try {
        console.log('--- Ajout de la colonne last_abandoned_reminder_at ---');
        const queryInterface = sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('profiles');
        
        if (!tableInfo.last_abandoned_reminder_at) {
            await queryInterface.addColumn('profiles', 'last_abandoned_reminder_at', {
                type: sequelize.Sequelize.DATE,
                allowNull: true
            });
            console.log('✅ Colonne ajoutée avec succès.');
        } else {
            console.log('ℹ️ La colonne existe déjà.');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

updateDb();
