const { sequelize } = require('./models');

async function checkIndexes() {
    try {
        console.log("Connecting to database...");
        await sequelize.authenticate();

        console.log("Checking indexes for 'profiles' table...");
        const [results] = await sequelize.query("SHOW INDEX FROM profiles");

        const indexNames = [...new Set(results.map(r => r.Key_name))];
        console.log(`Found ${results.length} total index entries mapped to ${indexNames.length} unique index names.`);

        if (indexNames.length > 30) {
            console.log("WARNING: Many indexes detected. Starting cleanup of redundant 'UNIQUE' indexes...");
            for (const name of indexNames) {
                // Drop indexes that look like Sequelize auto-generated duplicates (e.g. email_2, phone_4)
                // EXCEPT for PRIMARY
                if (name !== 'PRIMARY' && (name.includes('_') || indexNames.filter(n => name.startsWith(n) && n !== name).length > 0)) {
                    try {
                        console.log(`Dropping index: ${name}`);
                        // Use backticks for table and index names to avoid reserved word issues
                        await sequelize.query(`ALTER TABLE \`profiles\` DROP INDEX \`${name}\``);
                    } catch (e) {
                        console.log(`  Failed to drop ${name}: ${e.message}`);
                    }
                }
            }
            console.log("Cleanup complete.");
        } else {
            console.log("Index count is within safe limits.");
            indexNames.forEach(n => console.log(`- ${n}`));
        }

    } catch (error) {
        console.error("Maintenance task failed:", error);
    } finally {
        await sequelize.close();
    }
}

checkIndexes();
