import mysql from 'mysql2/promise';

async function testConnection() {
    console.log("Connecting to production MySQL...");
    try {
        const connection = await mysql.createConnection({
            host: '187.77.173.114',
            port: 3307,
            user: 'root',
            password: 'Mouh@med172002',
            database: 'eshop_db'
        });
        console.log("✅ Successfully connected to production database!");
        
        console.log("Checking products table columns...");
        const [columns] = await connection.query("SHOW COLUMNS FROM products");
        console.log("Products Columns:", columns.map(c => `${c.Field} (${c.Type})`));

        console.log("Testing a product query...");
        const [products] = await connection.query("SELECT * FROM products LIMIT 1");
        console.log("Product queried successfully. Length:", products.length);

        console.log("Testing a cart query...");
        const [carts] = await connection.query("SELECT * FROM carts LIMIT 1");
        console.log("Cart queried successfully. Length:", carts.length);

        await connection.end();
    } catch (err) {
        console.error("❌ Database query error:", err);
    }
}

testConnection();
