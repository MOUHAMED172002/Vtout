const mysql = require("mysql2/promise");
require("dotenv").config();

async function migrate() {
    const url = process.env.MYSQL_DATABASE_URL || "mysql://root:@127.0.0.1:3306/eshop_db";
    console.log("Connecting to database...");
    const db = await mysql.createConnection(url);
    
    try {
        console.log("Creating session table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS session (
                id VARCHAR(36) PRIMARY KEY,
                userId VARCHAR(36) NOT NULL,
                token TEXT NOT NULL,
                expiresAt DATETIME NOT NULL,
                ipAddress VARCHAR(255),
                userAgent TEXT,
                createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("Creating account table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS account (
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
            )
        `);

        console.log("Creating verification table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS verification (
                id VARCHAR(36) PRIMARY KEY,
                identifier TEXT NOT NULL,
                value TEXT NOT NULL,
                expiresAt DATETIME NOT NULL,
                createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("Migration completed successfully.");
    } catch (e) {
        console.error("Migration failed:", e.message);
    } finally {
        await db.end();
    }
}

migrate();
 burial: "Create missing Better Auth tables."
