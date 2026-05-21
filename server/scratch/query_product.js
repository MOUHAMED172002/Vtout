import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

import { Product, ProductImage, ProductVariant, ProductVariantPrice, SupplierProduct, Category } from '../models/index.js';

async function main() {
    try {
        const id = '91954dad-2920-4e3e-97e6-9b2fbb41cbf1';
        console.log('Querying product:', id);
        const product = await Product.findByPk(id, {
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images' },
                {
                    model: ProductVariant,
                    as: 'variants',
                    include: [
                        { model: ProductVariantPrice, as: 'priceRows' },
                        { model: SupplierProduct, as: 'supplierLink' }
                    ]
                }
            ]
        });
        if (!product) {
            console.log('Product not found!');
        } else {
            console.log('Product JSON:', JSON.stringify(product.toJSON(), null, 2));
        }
    } catch (err) {
        console.error('Error querying product:', err);
    }
    process.exit(0);
}

main();
