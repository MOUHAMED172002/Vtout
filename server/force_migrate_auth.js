const mysql = require("mysql2/promise");
require("dotenv").config();

async function run() {
    const url = "mysql://root:@127.0.0.1:3306/eshop_db"; // Hardcoded to match .env
    console.log("Starting DB migration for Better Auth...");
    let connection;
    try {
        connection = await mysql.createConnection(url);
        console.log("Connected to MySQL.");

        // Check if tables already exist
        const [tables] = await connection.query("SHOW TABLES");
        const tableList = tables.map(t => Object.values(t)[0]);
        console.log("Existing tables:", tableList);

        const queries = [
            `CREATE TABLE IF NOT EXISTS session (
                id VARCHAR(36) PRIMARY KEY,
                userId VARCHAR(36) NOT NULL,
                token TEXT NOT NULL,
                expiresAt DATETIME NOT NULL,
                ipAddress VARCHAR(255),
                userAgent TEXT,
                createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS account (
                id VARCHAR(36) PRIMARY KEY,
                userId VARCHAR(36) NOT NULL,
                accountId TEXT NOT NULL,
                providerId TEXT NOT NULL,
                accessToken TEXT,
                refreshToken TEXT,
                accessTokenExpiresAt DATETIME,
                refreshTokenExpiresAt DATETIME,
                scope TEXT,
                idToken TEXT,
                password TEXT,
                createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS verification (
                id VARCHAR(36) PRIMARY KEY,
                identifier TEXT NOT NULL,
                value TEXT NOT NULL,
                expiresAt DATETIME NOT NULL,
                createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        for (const q of queries) {
            console.log("Executing query...");
            await connection.query(q);
        }

        console.log("Migration successful.");
    } catch (e) {
        console.error("Migration fatal error:", e.message);
    } finally {
        if (connection) await connection.end();
        process.exit();
    }
}

run();
