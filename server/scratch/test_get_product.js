import '../scratch/convert-to-esm.js'; // Assuming this helps with ESM if needed, or just use node with ESM support
import { Product, Category, ProductImage, ProductVariant, ProductVariantPrice, SupplierProduct, Supplier, Boutique, Profile, sequelize } from '../models/index.js';

async function test() {
  try {
    console.log('Starting test...');
    // We can try to get any product or the specific one from the logs
    const id = '888343f4-8c0b-47ed-a456-0af27528225c'; 
    const product = await Product.findByPk(id, {
        include: [
            { model: Category, as: 'category' },
            { model: ProductImage, as: 'images' },
            {
                model: ProductVariant,
                as: 'variants',
                include: [
                    { model: ProductVariantPrice, as: 'priceRows' },
                    {
                        model: SupplierProduct,
                        as: 'supplierLink',
                        include: [{ model: Supplier, as: 'supplier', attributes: ['id', 'name'] }]
                    }
                ]
            },
            {
                model: Supplier,
                as: 'supplier',
                attributes: ['id', 'name'],
                include: [
                    { model: Boutique, as: 'boutiques', attributes: ['id', 'name'] },
                    { model: Profile, as: 'user', attributes: ['id', 'email'] }
                ]
            }
        ]
    });
    console.log('Success fetching product:', product?.name || 'Not found');
  } catch (err) {
    console.error('CRITICAL ERROR:', err);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

test();
