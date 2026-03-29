const mysql = require("mysql2/promise");
require("dotenv").config();

(async () => {
    try {
        const url = process.env.DATABASE_URL || process.env.MYSQL_DATABASE_URL || `mysql://${process.env.DB_USER || 'root'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || 'eshop_db'}`;
        const connection = await mysql.createConnection(url);
        const [rows] = await connection.execute("SHOW TABLES;");
        console.log("Tables in database:", rows.map(r => Object.values(r)[0]).join(", "));
        await connection.end();
    } catch (e) {
        console.error("Error connecting to database:", e.message);
    }
})();
