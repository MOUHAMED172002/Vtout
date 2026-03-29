const mysql = require("mysql2/promise");
require("dotenv").config();

async function check() {
    const url = "mysql://root:@127.0.0.1:3306/eshop_db";
    let db;
    try {
        db = await mysql.createConnection(url);
        for (const t of ['user', 'account', 'session', 'verification']) {
            const [desc] = await db.query(`DESCRIBE ${t}`);
            console.log(`SCHEMA_${t}:`, JSON.stringify(desc));
        }
    } catch (e) {
        console.error("SCHEMA_ERROR:", e.message);
    } finally {
        if (db) await db.end();
        process.exit();
    }
}

check();
