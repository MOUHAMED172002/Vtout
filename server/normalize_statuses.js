import sequelize from './config/database.js';

async function syncStatuses() {
    try {
        console.log("Starting status normalization...");
        
        const replacements = [
            { from: 'confirmee', to: 'confirmée' },
            { from: 'expediee', to: 'expédiée' },
            { from: 'livree', to: 'livrée' },
            { from: 'annulee', to: 'annulée' },
            { from: 'assignee', to: 'assignée' }
        ];

        for (const r of replacements) {
            const [affectedCount] = await sequelize.query(
                'UPDATE orders SET status = :to WHERE status = :from',
                {
                    replacements: { from: r.from, to: r.to },
                    type: sequelize.QueryTypes.UPDATE
                }
            );
            console.log(`Updated ${affectedCount} orders from "${r.from}" to "${r.to}"`);
        }

        console.log("Status normalization complete.");
        process.exit(0);
    } catch (error) {
        console.error("Normalization error:", error);
        process.exit(1);
    }
}

syncStatuses();
