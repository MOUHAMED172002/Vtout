const sequelize = require('./config/database');

async function checkColumns() {
    try {
        const [results] = await sequelize.query('DESCRIBE products');
        console.log('Columns in products table:');
        console.log(results.map(r => r.Field).join(', '));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkColumns();
