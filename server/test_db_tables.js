const mysql = require("mysql2/promise");
require("dotenv").config();

async function run() {
  let connection;
  try {
    const url = process.env.MYSQL_DATABASE_URL || 'mysql://root:@localhost:3306/eshop_db';
    console.log("Connecting to:", url);
    connection = await mysql.createConnection(url);
    const [rows] = await connection.query("SHOW TABLES");
    console.log("TABLES:", JSON.stringify(rows));
    await connection.end();
  } catch (e) {
    console.error("DB ERROR:", e.message);
  } finally {
    process.exit();
  }
}

run();
