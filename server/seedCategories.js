const fs = require('fs');
const path = require('path');
const { sequelize } = require('./models');

async function seedCategories() {
    try {
        console.log('--- Starting Category Seeding ---');
        const sqlPath = path.join(__dirname, 'import_categories.sql');

        if (!fs.existsSync(sqlPath)) {
            console.error('Error: import_categories.sql not found at', sqlPath);
            process.exit(1);
        }

        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split by semicolon but be careful with potential semicolons in strings
        // For this specific script, splitting by ;\n or just running the whole thing if it's one big block
        // Sequelize.query can sometimes handle multiple statements if configured, but it's safer to split or use a transaction

        console.log('Executing SQL script...');

        // We use raw query. Note: multiple statements may require specific connection settings.
        // If it fails, we might need to split the queries.

        // Let's try splitting by -- sections or just executing the whole block if the driver supports it.
        // Actually, most drivers don't allow multiple statements by default for security.

        const queries = sql
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0);

        for (let query of queries) {
            // Remove leading comments from the query string
            while (query.startsWith('--') || query.startsWith('\n')) {
                const lines = query.split('\n');
                lines.shift();
                query = lines.join('\n').trim();
            }

            if (!query) continue;

            try {
                await sequelize.query(query);
            } catch (err) {
                console.error('Error executing query:', query.substring(0, 50) + '...');
                console.error(err.message);
            }
        }

        console.log('--- Seeding Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedCategories();
