const { auth } = require("./config/auth");
const { toNodeHandler } = require("better-auth/node");
const mysql = require("mysql2/promise");
require("dotenv").config();

async function check() {
    try {
        const pool = await mysql.createPool(process.env.MYSQL_DATABASE_URL || "mysql://root:@localhost:3306/eshop_db");
        const [rows] = await pool.query("SHOW TABLES");
        console.log("Tables in database:", rows.map(r => Object.values(r)[0]).join(", "));
        
        try {
            const [userDesc] = await pool.query("DESCRIBE user");
            // console.log("User table schema:", userDesc);
            console.log("User table exists.");
        } catch (e) {
            console.log("User table DOES NOT exist.");
        }
        
        try {
            const [accountDesc] = await pool.query("DESCRIBE account");
            console.log("Account table exists.");
        } catch (e) {
            console.log("Account table DOES NOT exist.");
        }
        
        try {
            const [sessionDesc] = await pool.query("DESCRIBE session");
            console.log("Session table exists.");
        } catch (e) {
            console.log("Session table DOES NOT exist.");
        }

        try {
            const [verificationDesc] = await pool.query("DESCRIBE verification");
            console.log("Verification table exists.");
        } catch (e) {
            console.log("Verification table DOES NOT exist.");
        }

        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error("Database error:", err.message);
        process.exit(1);
    }
}
check();
