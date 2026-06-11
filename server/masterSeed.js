import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
    sequelize, Category, Config, Blog, AttributeValue, 
    ProductAttribute, CategoryAttribute, CategoryAttributeValue,
    Policy, Department, Commune, Arrondissement, Quartier
} from './models/index.js';
import { seedConfigs } from './seedConfigs.js';
import seedBlogs from './seedBlogs.js';
import { runComprehensiveSeed } from './comprehensiveSeed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMasterSeed() {
    try {
        console.log('🚀 [MASTER SEED] Starting global data loading...');

        // 1. Configs & Branding
        await seedConfigs();

        // 1.5 Comprehensive Catalog Seed
        await runComprehensiveSeed();

        // 2. Categories V1 (Électronique, Informatique, Logiciels, Mode)
        const sqlPath = path.join(__dirname, 'import_categories.sql');
        if (fs.existsSync(sqlPath)) {
            console.log('🌱 [SEED] Loading Categories V1...');
            const sql = fs.readFileSync(sqlPath, 'utf8');
            const queries = sql.split(';').map(q => q.trim()).filter(q => q.length > 0);
            for (let query of queries) {
                try { await sequelize.query(query); } catch (err) {}
            }
            console.log('✅ [SEED] Categories V1 loaded.');
        }

        // 2b. Categories V2 (Maison, Beauté, Sport, Alimentation, Jouets, Auto,
        //                    Livres, Art, Animalerie, Bébé, Musique, Énergie,
        //                    Sécurité, Voyage, Bureau, Services)
        const sqlPathV2 = path.join(__dirname, 'import_categories_v2.sql');
        if (fs.existsSync(sqlPathV2)) {
            console.log('🌱 [SEED] Loading Categories V2...');
            const sqlV2 = fs.readFileSync(sqlPathV2, 'utf8');
            const queriesV2 = sqlV2.split(';').map(q => q.trim()).filter(q => q.length > 0);
            for (let query of queriesV2) {
                try { await sequelize.query(query); } catch (err) {}
            }
            console.log('✅ [SEED] Categories V2 loaded.');
        }

        // 3. Contracts & Policies
        console.log('🌱 [SEED] Initializing Contracts...');
        const policies = [
            { type: 'general', title: 'Conditions Générales de Vente (CGV)', content: 'CGV Vtout Bénin...' },
            { type: 'supplier', title: 'Accord Marchand Vtout', content: 'Accord de vente marchand...' },
            { type: 'delivery', title: 'Contrat Prestataire de Livraison', content: 'Contrat Livreur...' }
        ];
        for (const p of policies) {
            await Policy.findOrCreate({ where: { type: p.type }, defaults: p });
        }

        // 4. Attributes
        console.log('🌱 [SEED] Loading Product Attributes...');
        const attrs = ['Couleur', 'Taille', 'Pointure', 'Stockage', 'RAM'];
        for (const name of attrs) {
            await ProductAttribute.findOrCreate({ where: { name } });
        }

        // 5. Géographie du Bénin (JSON Complet)
        const geoPath = path.join(__dirname, '../frontend/src/data/decoupage-territorial-benin.json');
        if (fs.existsSync(geoPath)) {
            console.log('🌱 [SEED] Loading Benin Geography (Full JSON)...');
            const geoData = JSON.parse(fs.readFileSync(geoPath, 'utf8'));
            for (const dep of geoData) {
                await Department.upsert({ id: dep.id_dep, name: dep.lib_dep });
                for (const com of dep.communes) {
                    await Commune.upsert({ id: com.id_com, department_id: dep.id_dep, name: com.lib_com });
                    // On s'arrête aux communes pour la rapidité au boot, 
                    // mais tout est prêt pour charger les arrondissements si besoin.
                }
            }
            console.log('✅ [SEED] Geography loaded.');
        }

        // 6. Blogs
        await seedBlogs();

        console.log('✅ [MASTER SEED] Global data initialization completed!');

    } catch (error) {
        console.error('❌ [MASTER SEED] Error:', error.message);
    }
}
