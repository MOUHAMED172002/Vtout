const {
    Order, OrderItem, Product, Profile, ProductImage, Category,
    ProductVariant, ProductVariantPrice, Supplier, SupplierProduct,
    FailedSearch, sequelize
} = require('../models');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
    try {
        const since = new Date();
        since.setDate(since.getDate() - 29);
        // 1. Basic Stats
        const orders30 = await Order.findAll({
            where: { created_at: { [Op.gte]: since } }
        });

        const totalRevenue = orders30.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
        const totalOrders = orders30.length;
        const uniqueCustomers = new Set(orders30.map(o => o.user_id)).size;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // 2. Sales Chart
        const salesByDay = await Order.findAll({
            attributes: [
                [sequelize.literal("DATE(created_at)"), 'day'],
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'total']
            ],
            where: { created_at: { [Op.gte]: since } },
            group: [sequelize.literal("DATE(created_at)")],
            order: [[sequelize.literal("DATE(created_at)"), 'ASC']]
        });

        // 3. Top Products
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

        const productIds = topProductStats.map(s => s.product_id);
        const productsInfo = await Product.findAll({
            where: { id: { [Op.in]: productIds } },
            attributes: ['id', 'name', 'price'],
            include: [{
                model: ProductImage,
                as: 'images',
                attributes: ['image_url'],
                where: { is_main: true },
                required: false
            }]
        });

        const topProducts = topProductStats.map(s => {
            const product = productsInfo.find(p => p.id === s.product_id);
            return {
                product_id: s.product_id,
                sold: parseInt(s.sold),
                product: product ? {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image_url: product.images?.length > 0 ? product.images[0].image_url : null
                } : null
            };
        });

        // 4. Recent Orders
        const recentOrders = await Order.findAll({
            limit: 8,
            order: [['created_at', 'DESC']],
            include: [{ model: Profile, as: 'user', attributes: ['fullname'] }]
        });

        // 5. Low Stock Alerts
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

        // 6. Supplier Performance
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
            limit: 5,
            subQuery: false
        });

        // 7. Top Customers
        const topCustomers = await Order.findAll({
            attributes: [
                'user_id',
                [sequelize.fn('SUM', sequelize.col('Order.total_amount')), 'spent'],
                [sequelize.fn('COUNT', sequelize.col('Order.id')), 'orders_count']
            ],
            group: ['Order.user_id', 'user.id', 'user.fullname'],
            order: [[sequelize.fn('SUM', sequelize.col('Order.total_amount')), 'DESC']],
            limit: 5,
            include: [{ model: Profile, as: 'user', attributes: ['fullname'] }]
        });

        // 8. Category Distribution
        const categoryDistribution = await OrderItem.findAll({
            include: [{
                model: Product,
                as: 'product',
                include: [{ model: Category, as: 'category', attributes: ['name'] }]
            }],
            attributes: [
                [sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'sold']
            ],
            group: ['product.category_id', 'product.category.id', 'product.category.name'],
            raw: true,
            nest: true
        });

        // 9. Fulfillment Queue
        const fulfillmentQueue = await Order.findAll({
            where: { status: ['en_attente', 'confirmée'] },
            limit: 10,
            order: [['created_at', 'ASC']],
            include: [{ model: Profile, as: 'user', attributes: ['fullname'] }]
        });

        res.json({
            stats: {
                revenue: totalRevenue,
                orders: totalOrders,
                customers: uniqueCustomers,
                avg_order_value: avgOrderValue
            },
            salesChart: salesByDay,
            topProducts,
            recentOrders,
            lowStock: lowStockVariants,
            supplierPerformance,
            topCustomers,
            categoryDistribution,
            fulfillmentQueue
        });
    } catch (error) {
        console.error("[getDashboardStats] Detailed Error:", error);
        res.status(500).json({ error: error.message || 'Erreur lors de la récupération des statistiques' });
    }
};

exports.getFailedSearches = async (req, res) => {
    try {
        const searches = await FailedSearch.findAll({
            limit: 50,
            order: [['created_at', 'DESC']]
        });
        res.json(searches);
    } catch (error) {
        console.error("[getFailedSearches] Error:", error);
        res.status(500).json({ error: 'Erreur lors de la récupération des recherches infructueuses' });
    }
};
