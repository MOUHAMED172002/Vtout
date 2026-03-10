const {
    Order, OrderItem, Product, Profile, ProductImage,
    ProductVariant, ProductVariantPrice, Supplier, SupplierProduct,
    sequelize
} = require('./server/models');
const { Op } = require('sequelize');

async function testStats() {
    try {
        const since = new Date();
        since.setDate(since.getDate() - 29);
        console.log("Since:", since);

        const orders30 = await Order.findAll({
            where: { created_at: { [Op.gte]: since } }
        });
        console.log("Orders found:", orders30.length);

        const salesByDay = await Order.findAll({
            attributes: [
                [sequelize.literal("DATE(created_at)"), 'day'],
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'total']
            ],
            where: { created_at: { [Op.gte]: since } },
            group: [sequelize.literal("DATE(created_at)")],
            order: [[sequelize.literal("DATE(created_at)"), 'ASC']]
        });
        console.log("SalesChart days:", salesByDay.length);

        const topProductStats = await OrderItem.findAll({
            attributes: [
                'product_id',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'sold']
            ],
            group: ['product_id'],
            order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
            limit: 5,
            raw: true
        });
        console.log("TopProducts calculated");

        const recentOrders = await Order.findAll({
            limit: 8,
            order: [['created_at', 'DESC']],
            include: [{ model: Profile, as: 'user', attributes: ['fullname'] }]
        });
        console.log("RecentOrders found:", recentOrders.length);

        const lowStockVariants = await ProductVariantPrice.findAll({
            where: { stock: { [Op.lt]: 10 } },
            include: [{
                model: ProductVariant,
                as: 'variant',
                include: [{ model: Product, as: 'product', attributes: ['name'] }]
            }],
            limit: 6,
            order: [['stock', 'ASC']]
        });
        console.log("LowStock alerts:", lowStockVariants.length);

        const supplierPerformance = await Supplier.findAll({
            attributes: [
                'id', 'name',
                [sequelize.fn('COUNT', sequelize.col('suppliedProducts.id')), 'linkedProducts']
            ],
            include: [{
                model: SupplierProduct,
                as: 'suppliedProducts',
                attributes: []
            }],
            group: ['Supplier.id', 'Supplier.name'],
            order: [[sequelize.literal('linkedProducts'), 'DESC']],
            limit: 5
        });
        console.log("Suppliers performance days:", supplierPerformance.length);

        console.log("SUCCESS");
        process.exit(0);
    } catch (err) {
        console.error("DIAGNOSTIC FAILED:", err);
        process.exit(1);
    }
}

testStats();
