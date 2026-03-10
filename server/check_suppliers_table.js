const { sequelize } = require('./models');

async function checkTable() {
    try {
        const [results] = await sequelize.query("DESCRIBE suppliers");
        console.log("Table 'suppliers' structure:");
        console.table(results);
    } catch (error) {
        console.error("Error describing table:", error);
    } finally {
        process.exit();
    }
}

checkTable();
