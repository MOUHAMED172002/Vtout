import "dotenv/config";
import { sequelize } from "../models/index.js";

async function diagnostic() {
    console.log("🔍 Starting Database Diagnostic...");
    try {
        await sequelize.authenticate();
        console.log("✅ Connection has been established successfully.");

        const [tables] = await sequelize.query("SHOW TABLES");
        console.log("📊 Tables in database:", tables.map(t => Object.values(t)[0]));

        if (tables.length > 0) {
            const tableName = Object.values(tables[0])[0];
            const [columns] = await sequelize.query(`DESCRIBE ${tableName}`);
            console.log(`📝 Columns in ${tableName}:`, columns.map(c => c.Field).join(", "));
        }
    } catch (error) {
        console.error("❌ Unable to connect to the database:", error.message);
    } finally {
        await sequelize.close();
    }
}

diagnostic();
