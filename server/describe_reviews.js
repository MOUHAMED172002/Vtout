import sequelize from './config/database.js';

async function run() {
    try {
        const [results] = await sequelize.query("DESCRIBE reviews");
        console.log(JSON.stringify(results, null, 2));
    } catch (e) {
        console.error('ERROR:', e.message);
    }
    process.exit();
}
run();
