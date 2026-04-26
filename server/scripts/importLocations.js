import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Department, Commune, Arrondissement, Quartier, sequelize } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '../../frontend/src/data/decoupage-territorial-benin.json');

async function importData() {
    try {
        console.log('Reading JSON file...');
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

        console.log('Starting import...');
        
        await sequelize.transaction(async (t) => {
            for (const dep of data) {
                console.log(`Importing Department: ${dep.lib_dep}`);
                await Department.upsert({
                    id: dep.id_dep,
                    name: dep.lib_dep
                }, { transaction: t });

                for (const com of dep.communes) {
                    await Commune.upsert({
                        id: com.id_com,
                        department_id: dep.id_dep,
                        name: com.lib_com
                    }, { transaction: t });

                    for (const arr of com.arrondissements) {
                        await Arrondissement.upsert({
                            id: arr.id_arrond,
                            commune_id: com.id_com,
                            name: arr.lib_arrond
                        }, { transaction: t });

                        for (const quart of arr.quartiers) {
                            await Quartier.upsert({
                                id: quart.id_quart,
                                arrondissement_id: arr.id_arrond,
                                name: quart.lib_quart
                            }, { transaction: t });
                        }
                    }
                }
            }
        });

        console.log('Import completed successfully!');
    } catch (error) {
        console.error('Import failed:', error);
    } finally {
        await sequelize.close();
    }
}

importData();
