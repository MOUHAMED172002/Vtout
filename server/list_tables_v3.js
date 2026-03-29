const mysql = require("mysql2");
require("dotenv").config();

const url = process.env.DATABASE_URL || process.env.MYSQL_DATABASE_URL || `mysql://${process.env.DB_USER || 'root'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || 'eshop_db'}`;
const connection = mysql.createConnection(url);

connection.connect((err) => {
    if (err) {
        console.error("Error connecting to database:", err.message);
        return;
    }
    console.log("Connected to database.");
    connection.query("SHOW TABLES", (err, rows) => {
        if (err) {
            console.error("Error executing query:", err.message);
            return;
        }
        console.log("Tables in database:", JSON.stringify(rows));
        connection.end();
    });
});
