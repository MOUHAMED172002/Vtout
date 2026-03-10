const { Order, Address, Supplier, OrderItem, Product, ProductVariant } = require('./models');
const { Op } = require('sequelize');

async function test() {
    try {
        console.log("Testing getAvailableOrders query...");
        const orders = await Order.findAll({
            where: {
                status: 'confirmee',
                delivery_person_id: null,
                supplier_id: { [Op.not]: null }
            },
            include: [
                { model: Address, as: 'address' },
                { model: Supplier, as: 'supplier' },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [
                        { model: Product, as: 'product' },
                        { model: ProductVariant, as: 'variant' }
                    ]
                }
            ],
            order: [['created_at', 'ASC']]
        });
        console.log("Success! Found " + orders.length + " orders.");
    } catch (error) {
        console.error("FAILED:");
        console.error(error);
    }
    process.exit();
}

test();
