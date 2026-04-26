const { sequelize } = require('./models');

async function sync() {
    try {
        console.log('Starting manual sync...');
        await sequelize.sync({ alter: true });
        console.log('✅ Database sync complete with alter:true');
        process.exit(0);
    } catch (err) {
        console.error('❌ Sync failed:', err);
        process.exit(1);
    }
}

sync();
