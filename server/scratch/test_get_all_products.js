import '../scratch/convert-to-esm.js';
import { Product, Supplier, SupplierProduct, Category, ProductImage, ProductVariant, sequelize } from '../models/index.js';

async function test() {
  try {
    console.log('Fetching products with all includes...');
    const products = await Product.findAll({
      limit: 10,
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images' },
        { model: SupplierProduct, as: 'supplierLink' },
        { model: ProductVariant, as: 'variants' },
        { model: Supplier, as: 'supplier', attributes: ['id', 'name'] }
      ]
    });
    
    console.log('Total Products fetched:', products.length);
    products.forEach(p => {
      const data = p.toJSON();
      console.log(`\n--- Product: ${data.name} ---`);
      console.log(`ID: ${data.id}`);
      console.log(`Supplier ID (fk): ${data.supplier_id}`);
      console.log(`Supplier object exists: ${!!data.supplier}`);
      console.log(`SupplierLink length: ${data.supplierLink?.length || 0}`);
      console.log(`Variants length: ${data.variants?.length || 0}`);
    });
  } catch (err) {
    console.error('ERROR during fetch:', err);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

test();
