import dotenv from 'dotenv';
dotenv.config();

import { Product, ProductImage, ProductVariant, ProductVariantPrice, SupplierProduct, Category, sequelize } from '../models/index.js';

async function test() {
    console.log('Testing update of product 91954dad-2920-4e3e-97e6-9b2fbb41cbf1...');
    const transaction = await sequelize.transaction();
    try {
        const id = '91954dad-2920-4e3e-97e6-9b2fbb41cbf1';
        const productToEdit = await Product.findByPk(id);
        if (!productToEdit) {
            console.log('Product not found in DB!');
            await transaction.rollback();
            return;
        }
        console.log('Product found:', productToEdit.name, 'Price:', productToEdit.price);
        
        // Simulating the update payload that supplier portal might send
        // Let's print the actual product variants first
        const variants = await ProductVariant.findAll({ where: { product_id: id } });
        console.log(`Found ${variants.length} variants.`);
        
        // Let's try to update name and price as a test
        const [updatedRows] = await Product.update({
            name: productToEdit.name,
            price: productToEdit.price,
            approval_status: 'En attente'
        }, {
            where: { id },
            transaction
        });
        console.log('Updated rows:', updatedRows);
        
        await transaction.commit();
        console.log('Transaction committed successfully!');
    } catch (err) {
        console.error('ERROR OCCURRED IN TRANSACTION:', err);
        if (transaction) {
            try {
                await transaction.rollback();
                console.log('Rolled back.');
            } catch (e) {
                console.error('Rollback error:', e);
            }
        }
    }
    process.exit(0);
}

test();
