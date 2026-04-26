import sequelize from './config/database.js';

async function patch() {
  try {
     await sequelize.query(`ALTER TABLE supplier_products ADD COLUMN approval_status ENUM('En attente', 'approved', 'rejected') DEFAULT 'En attente'`);
     await sequelize.query(`ALTER TABLE supplier_products ADD COLUMN admin_feedback TEXT`);
     console.log('PATCH SUCCESS');
  } catch(e) {
     console.log('Error:', e.message);
  }
  process.exit();
}
patch();
