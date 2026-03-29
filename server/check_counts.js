const mysql = require("mysql2/promise");
require("dotenv").config();

async function check() {
    const url = "mysql://root:@127.0.0.1:3306/eshop_db";
    let db;
    try {
        db = await mysql.createConnection(url);
        const [rows] = await db.query("SELECT COUNT(*) as count FROM user");
        console.log("USERS_COUNT:", rows[0].count);
        
        const [rowsAccounts] = await db.query("SELECT COUNT(*) as count FROM account");
        console.log("ACCOUNTS_COUNT:", rowsAccounts[0].count);
    } catch (e) {
        console.error("CHECK_ERROR:", e.message);
    } finally {
        if (db) await db.end();
        process.exit();
    }
}

check();
