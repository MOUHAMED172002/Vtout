import { sequelize, Order, OrderItem, Supplier, Product } from '../models/index.js';

async function diag() {
  try {
    await sequelize.authenticate();
    console.log('DB Auth: OK');
    
    const [ordersCols] = await sequelize.query("DESCRIBE orders");
    console.log('Orders Columns:', ordersCols.map(c => c.Field).join(', '));
    
    const [orderItemsCols] = await sequelize.query("DESCRIBE order_items");
    console.log('OrderItem Columns:', orderItemsCols.map(c => c.Field).join(', '));

    const [suppliersCols] = await sequelize.query("DESCRIBE suppliers");
    console.log('Supplier Columns:', suppliersCols.map(c => c.Field).join(', '));

    // Try a sample query for supplier orders
    const sampleSupplier = await Supplier.findOne();
    if (sampleSupplier) {
      console.log('Sample Supplier ID:', sampleSupplier.id);
      try {
        const orders = await Order.findAll({
          where: { supplier_id: sampleSupplier.id },
          include: [
            { model: OrderItem, as: 'items' }
          ]
        });
        console.log('Query success, found:', orders.length);
      } catch (e) {
        console.error('Order query error:', e.message);
      }
    } else {
      console.log('No suppliers found');
    }

  } catch (err) {
    console.error('DIAG ERROR:', err);
  } finally {
    await sequelize.close();
  }
}

diag();
