const { sequelize } = require('./models');
(async () => {
    try {
        const [results] = await sequelize.query("DESC orders");
        console.log("Orders Table Structure:");
        console.table(results);

        const [results2] = await sequelize.query("DESC order_items");
        console.log("\nOrder Items Table Structure:");
        console.table(results2);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
