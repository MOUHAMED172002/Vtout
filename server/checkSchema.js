const { sequelize } = require('./models');

async function checkSchema() {
    try {
        console.log("Connecting to database...");
        await sequelize.authenticate();

        const tableName = 'addresses';
        console.log(`\n--- Schema for '${tableName}' ---`);

        // Check table status (engine, collation)
        const [status] = await sequelize.query(`SHOW TABLE STATUS LIKE '${tableName}'`);
        if (status.length > 0) {
            console.log(`Engine: ${status[0].Engine}`);
            console.log(`Collation: ${status[0].Collation}`);
        } else {
            console.log("Table does not exist.");
        }

        // Check columns
        const [columns] = await sequelize.query(`SHOW FULL COLUMNS FROM ${tableName}`);
        columns.forEach(col => {
            console.log(`${col.Field}: ${col.Type} | Collation: ${col.Collation} | Null: ${col.Null} | Key: ${col.Key}`);
        });

        // Check indexes
        const [indexes] = await sequelize.query(`SHOW INDEX FROM ${tableName}`);
        console.log("Indexes:");
        indexes.forEach(idx => {
            console.log(`- ${idx.Key_name} (${idx.Column_name})`);
        });

    } catch (error) {
        console.error("Diagnostic failed:", error);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
