const { auth } = require("./config/auth");

(async () => {
    try {
        console.log("Generating migration...");
        // Better auth generate schema via internal method
        const { getMigration } = require("better-auth/db");
        const migration = await getMigration(auth);
        console.log("SQL Migration:");
        console.log(migration.sql);
    } catch (e) {
        console.error("Migration Error:", e.message);
    }
})();
