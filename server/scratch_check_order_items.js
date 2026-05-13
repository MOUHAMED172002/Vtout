import sequelize from './config/database.js';

async function checkColumns() {
  try {
    const [results] = await sequelize.query("DESCRIBE order_items");
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkColumns();
