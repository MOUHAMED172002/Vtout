const { sequelize } = require('./models');

async function describeTable() {
    try {
        const [results] = await sequelize.query('DESCRIBE orders');
        console.table(results);
    } catch (error) {
        console.error('Failed to describe table:', error.message);
    }
    process.exit();
}

describeTable();
