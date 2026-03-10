const { sequelize } = require('./models');
(async () => {
    try {
        await sequelize.query("ALTER TABLE orders MODIFY user_id CHAR(36) NULL");
        console.log("SUCCESS: Changed orders.user_id to allow NULL.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
