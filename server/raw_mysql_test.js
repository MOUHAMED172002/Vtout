const mysql = require('mysql2/promise');

async function test() {
    console.log('Starting raw mysql2 test...');
    try {
        console.log('Connecting to 127.0.0.1:3306...');
        const connection = await mysql.createConnection('mysql://root:@127.0.0.1:3306/eshop_db');
        console.log('Connected!');
        const [rows] = await connection.execute('SELECT 1 as result');
        console.log('Query result:', rows);
        await connection.end();
        process.exit(0);
    } catch (e) {
        console.error('Connection failed:', e);
        process.exit(1);
    }
}

test();
