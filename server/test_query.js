const { Order, Profile } = require('./models');

async function testQuery() {
    try {
        console.log('Starting test query...');
        // Find a profile first to get a valid userId
        const profile = await Profile.findOne();
        if (!profile) {
            console.log('No profiles found');
            return;
        }

        console.log('Found profile:', profile.id);
        const orders = await Order.findAll({
            where: { user_id: profile.id },
            order: [['created_at', 'DESC']]
        });
        console.log('Query success, found:', orders.length, 'orders');
    } catch (error) {
        console.error('Query failed:', error);
    } finally {
        process.exit();
    }
}

testQuery();
