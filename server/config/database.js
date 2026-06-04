import { Sequelize } from 'sequelize';

const isProd = process.env.NODE_ENV === 'production';

// Configuration du pool adaptée pour éviter les blocages sur XAMPP
const poolConfig = {
    max: isProd ? 20 : 5,
    min: isProd ? 2 : 0,
    acquire: 60000, // Augmenté à 60s pour les sync complexes
    idle: 10000,
    evict: 60000
};

const sharedOptions = {
    dialect: 'mysql',
    logging: isProd ? false : console.log, // On réactive les logs en dev pour voir où ça bloque
    define: {
        underscored: true,
        timestamps: true,
    },
    pool: poolConfig,
    dialectOptions: {
        connectTimeout: 30000,
        allowPublicKeyRetrieval: true,
        ssl: false,
        // Run on every new connection in the pool — fixes French accents stored/read as ?
        init_command: "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
    },
    retry: {
        max: 3,
        match: [
            /ETIMEDOUT/,
            /ECONNRESET/,
            /ECONNREFUSED/,
            /PROTOCOL_CONNECTION_LOST/,
        ]
    }
};

const sequelize = process.env.MYSQL_DATABASE_URL
    ? new Sequelize(process.env.MYSQL_DATABASE_URL, sharedOptions)
    : new Sequelize(
        process.env.DB_NAME || 'eshop_db',
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || '',
        {
            ...sharedOptions,
            host: process.env.DB_HOST || '127.0.0.1',
            port: parseInt(process.env.DB_PORT || '3306'),
        }
    );

export default sequelize;
