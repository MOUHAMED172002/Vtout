const { Order, OrderItem, Address } = require('./models');
const sequelize = require('./config/database');

async function check() {
    try {
        console.log("--- ORDERS SCHEMA ---");
        const ordersDesc = await sequelize.query("DESCRIBE orders");
        console.log(JSON.stringify(ordersDesc[0], null, 2));

        console.log("--- ORDER_ITEMS SCHEMA ---");
        const itemsDesc = await sequelize.query("DESCRIBE order_items");
        console.log(JSON.stringify(itemsDesc[0], null, 2));

        console.log("--- ADDRESSES SCHEMA ---");
        const addrDesc = await sequelize.query("DESCRIBE addresses");
        console.log(JSON.stringify(addrDesc[0], null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
