const { sequelize } = require("./models");

async function migrate() {
    try {
        console.log("Creating missing Better Auth tables via Sequelize...");
        
        // Session table
        await sequelize.query(`
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
        console.log("- session table checked/created");

        // Account table
        await sequelize.query(`
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
        console.log("- account table checked/created");

        // Verification table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS verification (
                id VARCHAR(36) PRIMARY KEY,
                identifier TEXT NOT NULL,
                value TEXT NOT NULL,
                expiresAt DATETIME NOT NULL,
                createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("- verification table checked/created");

        console.log("Migration finished.");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e.message);
        process.exit(1);
    }
}

migrate();
 burial: "Create missing Better Auth tables."
