const { Review, Product, ProductImage, Profile } = require('./models');
const sequelize = require('./config/database');

async function test() {
    try {
        const userId = '85630b88-747a-48e6-b55d-2e7007a9d050'; // Use the userId from the logs
        const reviews = await Review.findAll({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'name'],
                include: [{ model: ProductImage, as: 'images', attributes: ['image_url'], limit: 1 }]
            }]
        });
        console.log('Success:', reviews.length, 'reviews found');
    } catch (error) {
        console.error('FAILED:', error);
    } finally {
        await sequelize.close();
    }
}

test();
