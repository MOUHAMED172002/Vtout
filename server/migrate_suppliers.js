const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const url = process.env.MYSQL_DATABASE_URL || 'mysql://root:@127.0.0.1:3306/eshop_db';
    console.log("Connecting to:", url);

    let connection;
    try {
        connection = await mysql.createConnection(url);
        console.log("Connected!");

        const [rows] = await connection.execute("DESCRIBE suppliers");
        const existingCols = rows.map(r => r.Field);
        console.log("Existing columns:", existingCols.join(', '));

        const requiredCols = [
            { name: 'address_line', type: 'VARCHAR(255)' },
            { name: 'whatsapp', type: 'VARCHAR(255)' },
            { name: 'momo_number', type: 'VARCHAR(255)' },
            { name: 'status', type: "ENUM('pending', 'active', 'suspended') DEFAULT 'pending'" },
            { name: 'terms_accepted', type: 'TINYINT(1) DEFAULT 0' },
            { name: 'electronic_signature', type: 'VARCHAR(255)' },
            { name: 'departement_id', type: 'INT' },
            { name: 'departement_label', type: 'VARCHAR(255)' },
            { name: 'commune_id', type: 'INT' },
            { name: 'commune_label', type: 'VARCHAR(255)' },
            { name: 'quartier_id', type: 'INT' },
            { name: 'quartier_label', type: 'VARCHAR(255)' },
            { name: 'lat', type: 'DECIMAL(10, 8)' },
            { name: 'lng', type: 'DECIMAL(11, 8)' }
        ];

        for (const col of requiredCols) {
            if (!existingCols.includes(col.name)) {
                console.log(`Adding column ${col.name}...`);
                await connection.execute(`ALTER TABLE suppliers ADD COLUMN ${col.name} ${col.type}`);
                console.log(`✅ Column ${col.name} added.`);
            }
        }

        console.log("Migration complete!");
    } catch (err) {
        console.error("Migration error:", err.message);
    } finally {
        if (connection) await connection.end();
        process.exit();
    }
}

migrate();
