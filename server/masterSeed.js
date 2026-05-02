import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
    sequelize, Category, Config, Blog, AttributeValue, 
    ProductAttribute, CategoryAttribute, CategoryAttributeValue,
    Policy, Department, Commune, Arrondissement, Quartier
} from './models/index.js';
import { seedConfigs } from './seedConfigs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMasterSeed() {
    try {
        console.log('🚀 [MASTER SEED] Starting global data loading...');

        // 1. Configs & Branding
        await seedConfigs();

        // 2. Categories (via SQL)
        const sqlPath = path.join(__dirname, 'import_categories.sql');
        if (fs.existsSync(sqlPath)) {
            console.log('🌱 [SEED] Loading Categories...');
            const sql = fs.readFileSync(sqlPath, 'utf8');
            const queries = sql.split(';').map(q => q.trim()).filter(q => q.length > 0);
            for (let query of queries) {
                try { await sequelize.query(query); } catch (err) {}
            }
            console.log('✅ [SEED] Categories loaded.');
        }

        // 3. Contracts & Policies
        console.log('🌱 [SEED] Initializing Contracts (CGV, Supplier, Delivery)...');
        const policies = [
            { type: 'general', title: 'Conditions Générales de Vente (CGV)', content: 'CGV Vtout Bénin...' },
            { type: 'supplier', title: 'Contrat Partenaire Fournisseur', content: 'Contrat Fournisseur...' },
            { type: 'delivery', title: 'Contrat Prestataire de Livraison', content: 'Contrat Livreur...' }
        ];
        for (const p of policies) {
            await Policy.findOrCreate({ where: { type: p.type }, defaults: p });
        }

        // 4. Attributes (Tailles, Couleurs, etc.)
        console.log('🌱 [SEED] Loading Product Attributes...');
        const attrs = ['Couleur', 'Taille', 'Pointure', 'Stockage', 'RAM'];
        for (const name of attrs) {
            await ProductAttribute.findOrCreate({ where: { name } });
        }

        // 5. Géographie (Bénin - Départements principaux)
        console.log('🌱 [SEED] Initializing Geography (Benin)...');
        const depts = ['Littoral', 'Atlantique', 'Ouémé', 'Mono', 'Borgou', 'Zou', 'Collines', 'Alibori', 'Atacora', 'Donga', 'Couffo', 'Plateau'];
        for (const d of depts) {
            await Department.findOrCreate({ where: { name: d } });
        }

        console.log('✅ [MASTER SEED] Global data initialization completed!');

    } catch (error) {
        console.error('❌ [MASTER SEED] Error during data loading:', error.message);
    }
}
