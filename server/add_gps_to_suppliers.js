const { sequelize } = require('./models');

async function addGPSToSuppliers() {
    try {
        const [cols] = await sequelize.query("DESCRIBE suppliers");
        const colNames = cols.map(c => c.Field);
        if (!colNames.includes('lat')) {
            await sequelize.query("ALTER TABLE suppliers ADD COLUMN lat DECIMAL(10,8) NULL");
            console.log("✅ Added lat to suppliers");
        } else {
            console.log("ℹ️  lat already exists in suppliers");
        }
        if (!colNames.includes('lng')) {
            await sequelize.query("ALTER TABLE suppliers ADD COLUMN lng DECIMAL(11,8) NULL");
            console.log("✅ Added lng to suppliers");
        } else {
            console.log("ℹ️  lng already exists in suppliers");
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
    process.exit(0);
}
addGPSToSuppliers();
