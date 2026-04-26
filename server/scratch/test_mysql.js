import mysql from 'mysql2/promise';
import 'dotenv/config';

const MYSQL_DATABASE_URL = process.env.DATABASE_URL || process.env.MYSQL_DATABASE_URL;

async function test() {
    console.log("Connecting to:", MYSQL_DATABASE_URL ? "URL" : "Localhost");
    try {
        const connection = await mysql.createConnection(MYSQL_DATABASE_URL || {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'eshop_db',
            port: process.env.DB_PORT || 3306
        });
        console.log("✅ MySQL Connected!");
        const [rows] = await connection.execute('SELECT 1 + 1 AS result');
        console.log("Query test:", rows[0].result);
        await connection.end();
        console.log("✅ Test finished.");
        process.exit(0);
    } catch (error) {
        console.error("❌ MySQL Error:", error.message);
        process.exit(1);
    }
}

test();
