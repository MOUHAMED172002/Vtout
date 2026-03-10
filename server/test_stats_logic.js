const { Order, OrderItem, Product, Profile, ProductImage, sequelize } = require('./models');
const { Op } = require('sequelize');

async function testStats() {
    try {
        console.log('Testing Basic Stats...');
        const since = new Date();
        since.setDate(since.getDate() - 29);
        const orders30 = await Order.findAll({
            where: { created_at: { [Op.gte]: since } }
        });
        console.log('Orders found:', orders30.length);

        console.log('Testing Sales Chart...');
        const salesByDay = await Order.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('created_at')), 'day'],
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'total']
            ],
            where: { created_at: { [Op.gte]: since } },
            group: [sequelize.fn('DATE', sequelize.col('created_at'))],
            order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
        });
        console.log('Sales chart data points:', salesByDay.length);

        console.log('Testing Top Products...');
        let topProducts = await OrderItem.findAll({
            attributes: [
                'product_id',
                [sequelize.fn('SUM', sequelize.col('quantity')), 'sold']
            ],
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'price'],
                include: [{
                    model: ProductImage,
                    as: 'images',
                    attributes: ['image_url'],
                    where: { is_main: true },
                    required: false
                }]
            }],
            group: [
                'OrderItem.product_id',
                'product.id',
                'product.name',
                'product.price'
            ],
            order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
            limit: 10
        });
        console.log('Top products found:', topProducts.length);

        process.exit(0);
    } catch (error) {
        console.error('DIAGNOSTIC ERROR:', error);
        process.exit(1);
    }
}

testStats();
