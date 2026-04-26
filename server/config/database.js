import { Sequelize } from 'sequelize';

const isDev = process.env.NODE_ENV !== 'production';

// Pool conservateur pour XAMPP local (max_connections MySQL = 100 par défaut)
const poolConfig = {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
};

const sharedOptions = {
    dialect: 'mysql',
    logging: false, // Désactivé pour éviter saturation lors du sync
    define: {
        underscored: true,
        timestamps: true
    },
    pool: poolConfig,
    dialectOptions: {
        connectTimeout: 20000,
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
