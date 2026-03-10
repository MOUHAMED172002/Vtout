const { sequelize } = require('./models');

async function cleanupIndexes() {
    try {
        console.log("Analyzing indexes on profiles table...");
        const [results] = await sequelize.query("SHOW INDEX FROM profiles");

        const counts = {};
        for (const res of results) {
            const field = res.Column_name;
            if (!counts[field]) counts[field] = [];
            counts[field].push(res.Key_name);
        }

        console.log("Index counts by field:", Object.keys(counts).map(k => `${k}: ${counts[k].length}`).join(', '));

        // Let's drop redundant duplicate indexes (Key_name starting with profiles_email_unique_...)
        for (const field in counts) {
            if (counts[field].length > 1) {
                console.log(`Field ${field} has ${counts[field].length} indexes. Removing extras...`);
                // Keep the shortest index name or the first one
                const toKeep = counts[field][0];
                for (let i = 1; i < counts[field].length; i++) {
                    const keyName = counts[field][i];
                    console.log(`  Dropping duplicate index: ${keyName}`);
                    await sequelize.query(`ALTER TABLE profiles DROP INDEX ${keyName}`);
                }
            }
        }
        console.log("Cleanup complete!");
    } catch (err) {
        console.error("Cleanup error:", err.message);
    }
    process.exit();
}

cleanupIndexes();
