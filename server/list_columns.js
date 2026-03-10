const { sequelize } = require('./models');

async function listColumns() {
    try {
        const [results] = await sequelize.query('DESCRIBE orders');
        const columns = results.map(r => r.Field);
        console.log('Columns in orders table:', columns.join(', '));
    } catch (error) {
        console.error('Failed to list columns:', error.message);
    }
    process.exit();
}

listColumns();
