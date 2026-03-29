const mysql = require("mysql2/promise");
require("dotenv").config({ path: "./.env" });

async function listTables() {
    const url = process.env.MYSQL_DATABASE_URL || `mysql://${process.env.DB_USER || 'root'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || 'eshop_db'}`;
    console.log("Connecting to:", url);
    const connection = await mysql.createConnection(url);
    try {
        const [rows] = await connection.query("SHOW TABLES");
        console.log("Tables found:");
        rows.forEach(row => {
            const tableName = Object.values(row)[0];
            console.log(tableName);
        });
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await connection.end();
    }
}

listTables();
