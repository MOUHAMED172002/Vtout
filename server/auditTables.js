const { sequelize } = require('./models');

async function auditAllTables() {
    try {
        console.log("Connecting to database...");
        await sequelize.authenticate();

        const [tables] = await sequelize.query("SHOW TABLES");
        const dbName = sequelize.config.database;
        const tableList = tables.map(t => Object.values(t)[0]);

        console.log(`Auditing ${tableList.length} tables in ${dbName}...`);

        const results = [];
        for (const tableName of tableList) {
            const [indexes] = await sequelize.query(`SHOW INDEX FROM \`${tableName}\``);
            const uniqueIndexes = [...new Set(indexes.map(i => i.Key_name))];
            results.push({ table: tableName, count: uniqueIndexes.length });
        }

        results.sort((a, b) => b.count - a.count);

        console.log("\nTable Index Counts:");
        results.forEach(r => {
            console.log(`${r.table.padEnd(30)}: ${r.count} indexes ${r.count > 50 ? '!!! DANGER !!!' : ''}`);
        });

    } catch (error) {
        console.error("Audit failed:", error);
    } finally {
        await sequelize.close();
    }
}

auditAllTables();
