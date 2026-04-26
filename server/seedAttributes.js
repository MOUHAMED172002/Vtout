import { ProductAttribute, AttributeValue, CategoryAttribute, CategoryAttributeValue, sequelize } from './models/index.js';

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Connection established.');

        console.log('Synchronizing database schema...');
        await sequelize.sync({ alter: true });
        console.log('Schema synchronized.');

        // 1. Define Attributes
        const attrs = [
            { name: 'Couleur' },
            { name: 'Taille' },
            { name: 'Pointure' },
            { name: 'Stockage' },
            { name: 'RAM' },
            { name: 'Processeur' },
            { name: 'SSD' }
        ];

        const attributeMap = {};
        for (const a of attrs) {
            const [attr] = await ProductAttribute.findOrCreate({ where: { name: a.name } });
            attributeMap[a.name] = attr;
        }

        // 2. Define Values
        const values = {
            'Couleur': ['Noir', 'Blanc', 'Argent', 'Bleu', 'Rouge', 'Vert', 'Or'],
            'Taille': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            'Pointure': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
            'Stockage': ['64GB', '128GB', '256GB', '512GB', '1TB'],
            'RAM': ['4GB', '8GB', '12GB', '16GB', '32GB'],
            'Processeur': ['Intel i5', 'Intel i7', 'Apple M1', 'Apple M2', 'Apple M3', 'Snapdragon 8 Gen 2', 'Snapdragon 8 Gen 3'],
            'SSD': ['256GB', '512GB', '1TB', '2TB']
        };

        const valueMap = {};
        for (const [attrName, valList] of Object.entries(values)) {
            valueMap[attrName] = {};
            const attrId = attributeMap[attrName].id;
            for (const v of valList) {
                const [val] = await AttributeValue.findOrCreate({
                    where: { attribute_id: attrId, value: v }
                });
                valueMap[attrName][v] = val;
            }
        }

        // 3. Mapping to Categories
        const mappings = [
            // Mode (112)
            { rootCat: 112, attrs: ['Couleur', 'Taille'], recursive: true },
            // Chaussures (180)
            { rootCat: 180, attrs: ['Couleur', 'Pointure'], recursive: true },
            // Téléphones (2)
            { rootCat: 2, attrs: ['Couleur', 'Stockage', 'RAM'], recursive: true },
            // Ordinateurs (15)
            { rootCat: 15, attrs: ['Couleur', 'RAM', 'SSD', 'Processeur'], recursive: true },
            // Tablettes (26)
            { rootCat: 26, attrs: ['Couleur', 'Stockage', 'RAM'], recursive: true },
            // Audio (31)
            { rootCat: 31, attrs: ['Couleur'], recursive: true },
            // Montres (53)
            { rootCat: 53, attrs: ['Couleur'], recursive: true },
            // Composants PC (82)
            { rootCat: 82, attrs: ['Couleur'], recursive: true }
        ];

        // Helper to get all sub-categories if needed (for now we use the ones provided)
        // Since we don't have a tree-traversal helper easily available, I'll target the main branches.
        const targetCategories = [
            // Electronics
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 53, 54, 55, 56, 57, 58, 61, 62, 63, 64, 65, 66, 67, 68, 72, 73, 74, 75, 76, 77, 78,
            // IT
            81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102,
            // Mode
            112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 123, 124, 125, 126, 127, 131, 132, 133, 134, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 150, 154, 158, 169, 170, 180, 181, 189, 197, 206
        ];

        console.log('Seeding mappings...');

        for (const catId of targetCategories) {
            // Determine relevant attributes for this category
            let relevantAttrs = ['Couleur']; // Default color for everything

            if (catId >= 112 && catId < 180) relevantAttrs.push('Taille');
            if (catId >= 180 && catId < 206) relevantAttrs.push('Pointure');
            if ([2, 3, 4, 5, 6, 26, 27, 28].includes(catId)) {
                relevantAttrs.push('Stockage', 'RAM');
            }
            if ([15, 16, 17, 18, 19, 20, 21, 22, 23, 83, 84, 85, 86, 87, 88].includes(catId)) {
                relevantAttrs.push('RAM', 'SSD', 'Processeur');
            }

            for (const attrName of relevantAttrs) {
                const attrId = attributeMap[attrName].id;

                // Link Category to Attribute
                const [catAttr] = await CategoryAttribute.findOrCreate({
                    where: { category_id: catId, attribute_id: attrId }
                });

                // Link Attribute Values to CategoryAttribute
                const vals = valueMap[attrName];
                for (const [valName, valObj] of Object.entries(vals)) {
                    await CategoryAttributeValue.findOrCreate({
                        where: {
                            category_attribute_id: catAttr.id,
                            value_id: valObj.id
                        }
                    });
                }
            }
        }

        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
