const mysql = require("mysql2/promise");
require("dotenv").config();

async function run() {
    const url = process.env.MYSQL_DATABASE_URL || "mysql://root:@127.0.0.1:3306/eshop_db";
    console.log("Starting DB migration for Better Auth...");
    let connection;
    try {
        connection = await mysql.createConnection(url);
        console.log("Connected to MySQL.");

        const tableQueries = [
            // User table
            `CREATE TABLE IF NOT EXISTS user (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                emailVerified TINYINT(1) DEFAULT 0,
                image TEXT,
                createdAt TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3),
                updatedAt TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                role TEXT
            )`,
            // Session table
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
            // Account table
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
            // Verification table
            `CREATE TABLE IF NOT EXISTS verification (
                id VARCHAR(36) PRIMARY KEY,
                identifier TEXT NOT NULL,
                value TEXT NOT NULL,
                expiresAt DATETIME NOT NULL,
                createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        for (const q of tableQueries) {
            console.log("Executing table creation query...");
            await connection.query(q);
        }

        // Add missing columns if tables existed but were incomplete
        console.log("Checking for missing columns...");
        
        // Add role to user if not exists
        try {
            await connection.query("ALTER TABLE user ADD COLUMN role TEXT");
            console.log("Added role column to user table.");
        } catch (e) {
            // Probably already exists
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
