const { sequelize } = require('./models');
console.log("Starting forced sync with alter: true...");
sequelize.sync({ alter: true })
    .then(() => {
        console.log("Sync complete!");
        process.exit(0);
    })
    .catch(err => {
        console.error("Sync failed:", err);
        process.exit(1);
    });
