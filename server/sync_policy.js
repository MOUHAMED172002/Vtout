const { Policy } = require('./models');

async function fix() {
    try {
        console.log("Synchronizing Policy model (with alter: true)...");
        await Policy.sync({ alter: true });
        console.log("Policy synchronized successfully.");
    } catch (err) {
        console.error("FIX ERROR:", err);
    } finally {
        process.exit();
    }
}

fix();
