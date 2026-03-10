const { Sequelize } = require('sequelize');

const sequelize = process.env.MYSQL_DATABASE_URL
    ? new Sequelize(process.env.MYSQL_DATABASE_URL, {
        dialect: 'mysql',
        logging: console.log,
        define: {
            underscored: true,
            timestamps: true
        }
    })
    : new Sequelize(
        process.env.DB_NAME || 'eshop_db',
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || '',
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            dialect: 'mysql',
            logging: console.log,
            define: {
                underscored: true,
                timestamps: true
            }
        }
    );

module.exports = sequelize;
