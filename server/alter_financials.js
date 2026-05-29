import { sequelize } from './models/index.js';

async function run() {
    try {
        await sequelize.query('ALTER TABLE financial_transactions ADD COLUMN source VARCHAR(255) NULL;');
        console.log('Colonne source ajoutée avec succès.');
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
}
run();
