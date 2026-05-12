import sequelize from './server/config/database.js';

async function alterTable() {
    try {
        await sequelize.query('ALTER TABLE products ADD COLUMN secondary_boutique_ids JSON NULL;');
        console.log('Column secondary_boutique_ids added successfully.');
    } catch (e) {
        if (e.name === 'SequelizeDatabaseError' && e.message.includes('Duplicate column name')) {
            console.log('Column already exists.');
        } else {
            console.error('Error adding column:', e);
        }
    } finally {
        process.exit(0);
    }
}

alterTable();
