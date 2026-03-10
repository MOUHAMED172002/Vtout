const { Policy } = require('./models');

async function check() {
    try {
        console.log("Checking Policies...");
        const policies = await Policy.findAll();
        console.log(`Found ${policies.length} policies.`);
        console.log(JSON.stringify(policies, null, 2));
    } catch (err) {
        console.error("DIAGNOSTIC ERROR:", err);
    } finally {
        process.exit();
    }
}

check();
