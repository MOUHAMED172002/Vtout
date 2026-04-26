import { Supplier } from '../models/index.js';

async function check() {
    try {
        const suppliers = await Supplier.findAll();
        console.log('--- Suppliers Status Check ---');
        suppliers.forEach(s => {
            console.log(`ID: ${s.id}, Name: ${s.name}, Status: "${s.status}"`);
        });
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

check();
