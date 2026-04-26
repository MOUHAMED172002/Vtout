import { Supplier } from '../models/index.js';
import { Op } from 'sequelize';

async function patch() {
    try {
        const [updatedCount] = await Supplier.update(
            { status: 'En attente' },
            { 
                where: { 
                    [Op.or]: [
                        { status: '' },
                        { status: null }
                    ]
                } 
            }
        );
        console.log(`Updated ${updatedCount} suppliers with empty status to "En attente".`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

patch();
