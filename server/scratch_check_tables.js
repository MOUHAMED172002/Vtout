import sequelize from './config/database.js';

async function checkTables() {
    try {
        const [results] = await sequelize.query("SHOW TABLES");
        console.log("Tables in database:", results);
    } catch (error) {
        console.error("Error listing tables:", error.message);
    } finally {
        await sequelize.close();
    }
}

checkTables();
