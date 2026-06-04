import {
    Order, OrderItem, Product, Profile, ProductImage, Category,
    ProductVariant, ProductVariantPrice, Supplier, SupplierProduct,
    FailedSearch, FinancialTransaction, DeliveryPerson
} from '../models/index.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

export const getDashboardStats = async (req, res) => {
    try {
        const since = new Date();
        const { period } = req.query;
        if (period === "7J") since.setDate(since.getDate() - 6);
        else if (period === "12M") since.setFullYear(since.getFullYear() - 1);
        else since.setDate(since.getDate() - 29);

        let stats = { 
            revenue: 0, 
            admin_profit: 0, 
            delivery_profits: 0, 
            supplier_profits: 0, 
            orders: 0, 
            customers: 0, 
            avg_order_value: 0 
        };
        
        let salesChart = [], topProducts = [], recentOrders = [], lowStock = [];
        let supplierPerformance = [], topCustomers = [], categoryDistribution = [], fulfillmentQueue = [];

        // 1. Stats de base & Gains
        try {
            const orders30 = await Order.findAll({ 
                where: { 
                    createdAt: { [Op.gte]: since },
                    status: ['livree', 'livrée']
                } 
            });
            stats.revenue = orders30.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
            stats.orders = orders30.length;
            stats.customers = new Set(orders30.map(o => o.user_id)).size;
            stats.avg_order_value = stats.orders > 0 ? stats.revenue / stats.orders : 0;
            
            // Calcul des gains par rôle via les FinancialTransactions (basé sur la description)
            const allGains = await FinancialTransaction.findAll({
                where: {
                    type: 'earning',
                    status: 'completed',
                    createdAt: { [Op.gte]: since }
                },
                attributes: ['amount', 'description'],
                raw: true
            });

            allGains.forEach(g => {
                const amount = parseFloat(g.amount || 0);
                const desc = (g.description || '').toLowerCase();
                
                if (desc.startsWith('com. vente') || desc.startsWith('com.vente')) {
                    stats.admin_profit += amount;
                } else if (desc.startsWith('course')) {
                    stats.delivery_profits += amount;
                } else if (desc.startsWith('vente')) {
                    stats.supplier_profits += amount;
                }
            });

            recentOrders = await Order.findAll({
                limit: 8,
                order: [['createdAt', 'DESC']],
                include: [{ model: Profile, as: 'user', attributes: ['fullname'] }]
            });
        } catch (e) {
            console.error("Base stats error:", e);
        }

        // 2. Graphique des ventes
        try {
            salesChart = await Order.findAll({
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('created_at')), 'day'],
                    [sequelize.fn('SUM', sequelize.col('total_amount')), 'total'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                where: {
                    createdAt: { [Op.gte]: since },
                    status: ['livree', 'livrée']
                },
                group: [sequelize.fn('DATE', sequelize.col('created_at'))],
                order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
            });
        } catch (e) { console.error('[Stats] Graphique des ventes:', e.message); }

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
        } catch (e) { console.error('[Stats] Produits les plus vendus:', e.message); }

        // 4. Stock faible
        try {
            lowStock = await ProductVariantPrice.findAll({
                where: { stock: { [Op.lt]: 10 } },
                include: [{ model: ProductVariant, as: 'variant', include: [{ model: Product, as: 'product', attributes: ['name'] }] }],
                limit: 6,
                order: [['stock', 'ASC']]
            });
        } catch (e) { console.error('[Stats] Stock faible:', e.message); }

        // 5. Performance fournisseurs (Chiffre d'Affaires produits uniquement)
        try {
            const supplierSales = await OrderItem.findAll({
                attributes: [
                    [sequelize.col('product.supplier_id'), 'supplier_id'],
                    [sequelize.fn('SUM', sequelize.literal('OrderItem.price * OrderItem.quantity')), 'revenue'],
                    [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('OrderItem.order_id'))), 'orders']
                ],
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['supplier_id'],
                    required: true,
                    include: [{ model: Supplier, as: 'supplier', attributes: ['name'] }]
                }, {
                    model: Order,
                    as: 'order',
                    where: { status: ['livree', 'livrée'], createdAt: { [Op.gte]: since } },
                    attributes: []
                }],
                group: [sequelize.col('product.supplier_id'), 'product.supplier.id', 'product.supplier.name'],
                order: [[sequelize.fn('SUM', sequelize.literal('OrderItem.price * OrderItem.quantity')), 'DESC']],
                limit: 5,
                raw: true,
                nest: true
            });

            supplierPerformance = supplierSales.map(s => ({
                id: s.supplier_id,
                name: s.product?.supplier?.name || "Partenaire",
                revenue: parseFloat(s.revenue || 0),
                orders: parseInt(s.orders || 0)
            }));
        } catch (e) {
            console.error("Supplier performance error:", e);
        }

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
        } catch (e) { console.error('[Stats] Meilleurs clients:', e.message); }

        // 7. Distribution par catégories
        try {
            const catDist = await OrderItem.findAll({
                include: [{ 
                    model: Product, 
                    as: 'product', 
                    include: [{ model: Category, as: 'category', attributes: ['name'] }] 
                }, {
                    model: Order,
                    as: 'order',
                    where: { status: ['livree', 'livrée'], createdAt: { [Op.gte]: since } },
                    attributes: []
                }],
                attributes: [[sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'sold']],
                group: ['product.category_id', 'product.category.id', 'product.category.name'],
                raw: true,
                nest: true
            });
            categoryDistribution = catDist.map(c => ({
                name: c.product?.category?.name || "Sans catégorie",
                sold: parseInt(c.sold || 0)
            }));
        } catch (e) { console.error('[Stats] Distribution par catégories:', e.message); }

        // 8. File d'attente de traitement
        try {
            fulfillmentQueue = await Order.findAll({
                where: { status: ['en_attente', 'confirmée'] },
                limit: 10,
                order: [['createdAt', 'ASC']],
                include: [{ model: Profile, as: 'user', attributes: ['fullname'] }]
            });
        } catch (e) { console.error('[Stats] File d\'attente de traitement:', e.message); }

        // 9. Timeline Analytics by Profile Role (Task 5)
        let adminTimeline = [];
        let supplierTimeline = [];
        let delivererTimeline = [];
        let buyerTimeline = [];

        try {
            const roleTimeline = await FinancialTransaction.findAll({
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('created_at')), 'day'],
                    'source',
                    'description',
                    [sequelize.fn('SUM', sequelize.col('amount')), 'total']
                ],
                where: {
                    status: 'completed',
                    type: 'earning',
                    createdAt: { [Op.gte]: since }
                },
                group: [sequelize.fn('DATE', sequelize.col('created_at')), 'source', 'description'],
                raw: true
            });

            const adminMap = {};
            const supplierMap = {};
            const delivererMap = {};
            const buyerMap = {};

            // Initialize timeline from salesChart to match all days
            salesChart.forEach(s => {
                const day = s.get ? s.get('day') : s.day;
                adminMap[day] = 0;
                supplierMap[day] = 0;
                delivererMap[day] = 0;
                buyerMap[day] = parseFloat(s.get ? s.get('total') : s.total) || 0;
            });

            roleTimeline.forEach(rt => {
                const day = rt.day;
                const amount = parseFloat(rt.total || 0);
                const source = rt.source;
                const desc = (rt.description || '').toLowerCase();

                if (source === 'admin_commission' || desc.startsWith('com. vente') || desc.startsWith('com.vente')) {
                    adminMap[day] = (adminMap[day] || 0) + amount;
                } else if (source === 'deliverer' || desc.startsWith('course')) {
                    delivererMap[day] = (delivererMap[day] || 0) + amount;
                } else if (source === 'supplier' || desc.startsWith('vente')) {
                    supplierMap[day] = (supplierMap[day] || 0) + amount;
                }
            });

            adminTimeline = Object.keys(adminMap).map(day => ({ day, total: adminMap[day] })).sort((a,b) => a.day.localeCompare(b.day));
            supplierTimeline = Object.keys(supplierMap).map(day => ({ day, total: supplierMap[day] })).sort((a,b) => a.day.localeCompare(b.day));
            delivererTimeline = Object.keys(delivererMap).map(day => ({ day, total: delivererMap[day] })).sort((a,b) => a.day.localeCompare(b.day));
            buyerTimeline = Object.keys(buyerMap).map(day => ({ day, total: buyerMap[day] })).sort((a,b) => a.day.localeCompare(b.day));
        } catch (e) {
            console.error("Error creating role timeline stats:", e);
        }

        res.json({ stats, salesChart, topProducts, recentOrders, lowStock, supplierPerformance, topCustomers, categoryDistribution, fulfillmentQueue, adminTimeline, supplierTimeline, delivererTimeline, buyerTimeline });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getFailedSearches = async (req, res) => {
    try {
        const searches = await FailedSearch.findAll({ 
            limit: 50, 
            order: [['created_at', 'DESC']] 
        });
        res.json(searches);
    } catch (error) {
        console.warn('[Stats] search-analytics table may not exist yet:', error.message);
        res.json([]); // Retourne un tableau vide si la table n'existe pas
    }
};

export const getSupplierStats = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const supplier = await Supplier.findOne({ where: { user_id: userId } });
        if (!supplier) return res.status(404).json({ error: 'Profil fournisseur non trouvé' });

        const since = new Date();
        since.setDate(since.getDate() - 30);

        // 1. Revenue and Orders (Last 30 days)
        const stats = await Order.findAll({
            where: {
                supplier_id: supplier.id,
                createdAt: { [Op.gte]: since },
                status: ['livree', 'livrée']
            },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            raw: true
        });

        const revenue = parseFloat(stats[0]?.revenue || 0);
        const orderCount = parseInt(stats[0]?.count || 0);

        // 2. Monthly Revenue Chart (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);

        const monthlyRevenue = await Order.findAll({
            where: {
                supplier_id: supplier.id,
                createdAt: { [Op.gte]: sixMonthsAgo },
                status: ['livree', 'livrée']
            },
            attributes: [
                [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'total']
            ],
            group: ['month'],
            order: [['month', 'ASC']],
            raw: true
        });

        // 3. Top Products
        const topProductStats = await OrderItem.findAll({
            attributes: [
                'product_id',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'sold']
            ],
            include: [{
                model: Order,
                as: 'order',
                where: { supplier_id: supplier.id, status: ['livree', 'livrée'] },
                attributes: []
            }],
            group: ['product_id'],
            order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
            limit: 5,
            raw: true
        });

        let topProducts = [];
        if (topProductStats.length > 0) {
            const productIds = topProductStats.map(s => s.product_id);
            const productsInfo = await Product.findAll({
                where: { id: { [Op.in]: productIds } },
                include: [{ 
                    model: ProductImage, 
                    as: 'images', 
                    where: { is_main: true }, 
                    required: false 
                }]
            });

            topProducts = topProductStats.map(s => {
                const product = productsInfo.find(p => p.id === s.product_id);
                return {
                    sold: parseInt(s.sold),
                    product: product ? {
                        name: product.name,
                        images: product.images
                    } : null
                };
            });
        }

        // 4. Low Stock (Sum of variants < 5)
        const lowStock = await Product.findAll({
            where: {
                supplier_id: supplier.id,
                [Op.and]: [
                    sequelize.literal(`(
                        SELECT COALESCE(SUM(pvp.stock), \`Product\`.stock)
                        FROM product_variant_prices AS pvp
                        INNER JOIN product_variants AS pv ON pv.id = pvp.variant_id
                        WHERE pv.product_id = \`Product\`.id
                    ) < 5`)
                ]
            },
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            COALESCE((
                                SELECT SUM(pvp.stock) 
                                FROM product_variant_prices AS pvp
                                INNER JOIN product_variants AS pv ON pv.id = pvp.variant_id
                                WHERE pv.product_id = Product.id
                            ), \`Product\`.stock)
                        )`),
                        'total_stock'
                    ]
                ]
            },
            limit: 10
        });

        res.json({
            revenue,
            orderCount,
            monthlyRevenue: monthlyRevenue.map(m => ({
                month: m.month,
                total: parseFloat(m.total || 0)
            })),
            topProducts,
            lowStock
        });
    } catch (error) {
        console.error("Supplier stats error:", error);
        res.status(500).json({ error: 'Erreur lors du calcul des stats fournisseur' });
    }
};
export const getLivreurStats = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const lp = await DeliveryPerson.findOne({ where: { user_id: userId } });
        if (!lp) return res.status(404).json({ error: 'Profil livreur non trouvé' });

        const transactions = await FinancialTransaction.findAll({
            where: { user_id: userId, status: 'completed' },
            attributes: ['type', [sequelize.fn('SUM', sequelize.col('amount')), 'total']],
            group: ['type'],
            raw: true
        });

        let balance = 0;
        transactions.forEach(t => {
            const val = parseFloat(t.total || 0);
            if (t.type === 'earning') balance += val;
            if (t.type === 'payout') balance -= val;
            if (t.type === 'adjustment') balance += val;
        });

        // Debt calculation (cash orders delivered but not remitted)
        const unremittedCash = await Order.sum('total_amount', {
            where: {
                delivery_person_id: lp.id,
                status: 'livrée',
                payment_method: 'delivery',
                payment_status: 'en_attente'
            }
        }) || 0;

        res.json({
            balance,
            totalDeliveries: lp.total_deliveries,
            rating: lp.rating,
            unremittedCash
        });
    } catch (error) {
        console.error("Livreur stats error:", error);
        res.status(500).json({ error: 'Erreur lors du calcul des stats livreur' });
    }
};
