const {
    Order, OrderItem, Product, Profile, ProductImage, Category,
    ProductVariant, ProductVariantPrice, Supplier, SupplierProduct,
    FailedSearch, sequelize
} = require('../models');
const { Op } = require('sequelize');

exports.getDashboardStats = async (req, res) => {
    try {
        const since = new Date();
        const { period } = req.query;
        if (period === "7J") since.setDate(since.getDate() - 6);
        else if (period === "12M") since.setFullYear(since.getFullYear() - 1);
        else since.setDate(since.getDate() - 29);

        let stats = { revenue: 0, orders: 0, customers: 0, avg_order_value: 0 };
        let salesChart = [], topProducts = [], recentOrders = [], lowStock = [];
        let supplierPerformance = [], topCustomers = [], categoryDistribution = [], fulfillmentQueue = [];

        // 1. Stats de base
        try {
            const orders30 = await Order.findAll({ where: { created_at: { [Op.gte]: since } } });
            stats.revenue = orders30.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
            stats.orders = orders30.length;
            stats.customers = new Set(orders30.map(o => o.user_id)).size;
            stats.avg_order_value = stats.orders > 0 ? stats.revenue / stats.orders : 0;

            recentOrders = await Order.findAll({
                limit: 8,
                order: [['created_at', 'DESC']],
                include: [{ model: Profile, as: 'user', attributes: ['fullname'] }]
            });
        } catch (e) {}

        // 2. Graphique des ventes
        try {
            salesChart = await Order.findAll({
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('created_at')), 'day'],
                    [sequelize.fn('SUM', sequelize.col('total_amount')), 'total'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                where: { created_at: { [Op.gte]: since } },
                group: [sequelize.fn('DATE', sequelize.col('created_at'))],
                order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
            });
        } catch (e) {}

        // 3. Produits les plus vendus
        try {
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
            if (topProductStats.length > 0) {
                const productIds = topProductStats.map(s => s.product_id);
                const productsInfo = await Product.findAll({
                    where: { id: { [Op.in]: productIds } },
                    include: [{ model: ProductImage, as: 'images', where: { is_main: true }, required: false }]
                });
                topProducts = topProductStats.map(s => {
                    const product = productsInfo.find(p => p.id === s.product_id);
                    return {
                        product_id: s.product_id,
                        sold: parseInt(s.sold),
                        product: product ? {
                            id: product.id, name: product.name, price: product.price,
                            image_url: product.images?.length > 0 ? product.images[0].image_url : null
                        } : null
                    };
                });
            }
        } catch (e) {}

        // 4. Stock faible
        try {
            lowStock = await ProductVariantPrice.findAll({
                where: { stock: { [Op.lt]: 10 } },
                include: [{ model: ProductVariant, as: 'variant', include: [{ model: Product, as: 'product', attributes: ['name'] }] }],
                limit: 6,
                order: [['stock', 'ASC']]
            });
        } catch (e) {}

        // 5. Performance fournisseurs
        try {
            supplierPerformance = await Supplier.findAll({ attributes: ['id', 'name'], limit: 5 });
        } catch (e) {}

        // 6. Meilleurs clients
        try {
            topCustomers = await Order.findAll({
                attributes: [
                    'user_id',
                    [sequelize.fn('SUM', sequelize.col('total_amount')), 'spent'],
                    [sequelize.fn('COUNT', sequelize.col('Order.id')), 'orders_count']
                ],
                include: [{ model: Profile, as: 'user', attributes: ['fullname'] }],
                group: ['Order.user_id', 'user.id', 'user.fullname'],
                order: [[sequelize.fn('SUM', sequelize.col('total_amount')), 'DESC']],
                limit: 5
            });
        } catch (e) {}

        // 7. Distribution par catégories
        try {
            const catDist = await OrderItem.findAll({
                include: [{ model: Product, as: 'product', include: [{ model: Category, as: 'category', attributes: ['name'] }] }],
                attributes: [[sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'sold']],
                group: ['product.category_id', 'product.category.id', 'product.category.name'],
                raw: true,
                nest: true
            });
            categoryDistribution = catDist.map(c => ({
                name: c.product?.category?.name || "Sans catégorie",
                sold: parseInt(c.sold || 0)
            }));
        } catch (e) {}

        // 8. File d'attente de traitement
        try {
            fulfillmentQueue = await Order.findAll({
                where: { status: ['en_attente', 'confirmée'] },
                limit: 10,
                order: [['created_at', 'ASC']],
                include: [{ model: Profile, as: 'user', attributes: ['fullname'] }]
            });
        } catch (e) {}

        res.json({ stats, salesChart, topProducts, recentOrders, lowStock, supplierPerformance, topCustomers, categoryDistribution, fulfillmentQueue });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getFailedSearches = async (req, res) => {
    try {
        const searches = await FailedSearch.findAll({ limit: 50, order: [['created_at', 'DESC']] });
        res.json(searches);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des recherches infructueuses' });
    }
};
