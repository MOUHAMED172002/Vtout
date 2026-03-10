const { Order } = require('./models');
(async () => {
    try {
        const orders = await Order.findAll({ limit: 5, order: [['created_at', 'DESC']] });
        console.log(JSON.stringify(orders, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
