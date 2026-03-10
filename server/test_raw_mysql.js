const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
    try {
        console.log('Connecting to mysql...');
        const connection = await mysql.createConnection(process.env.MYSQL_DATABASE_URL);
        console.log('Connected!');
        const [rows] = await connection.execute('SELECT 1 + 1 AS result');
        console.log('Query result:', rows[0].result);
        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error('Connection error:', err);
        process.exit(1);
    }
}

test();
