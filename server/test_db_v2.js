const mysql = require("mysql2/promise");
require("dotenv").config();

async function check() {
    const url = process.env.MYSQL_DATABASE_URL || "mysql://root:@127.0.0.1:3306/eshop_db";
    console.log("Connecting using:", url);
    try {
        const db = await mysql.createConnection(url);
        console.log("Connected.");
        const [rows] = await db.query("SHOW TABLES;");
        console.log("Tables:", rows.map(r => Object.values(r)[0]).join(", "));
        await db.end();
    } catch (e) {
        console.error("DB Error:", e.message);
    }
}
check();
