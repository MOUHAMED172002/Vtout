import sequelize from './config/database.js';

async function describeTable() {
    try {
        const [results] = await sequelize.query("DESCRIBE user");
        console.log("User table schema:", results);
    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await sequelize.close();
    }
}

describeTable();
