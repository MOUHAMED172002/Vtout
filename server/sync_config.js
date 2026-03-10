const { Config } = require('./models');

async function fix() {
    try {
        console.log("Synchronizing Config model (with alter: true)...");
        await Config.sync({ alter: true });
        console.log("Config synchronized successfully.");
    } catch (err) {
        console.error("FIX ERROR:", err);
    } finally {
        process.exit();
    }
}

fix();
