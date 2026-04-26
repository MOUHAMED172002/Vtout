import { ProductAttribute, AttributeValue, CategoryAttribute, Category, CategoryAttributeValue } from '../models/index.js';


export const getAllAttributes = async (req, res) => {
    try {
        const attributes = await ProductAttribute.findAll({
            include: [{ model: AttributeValue, as: 'values' }]
        });
        res.json(attributes);
    } catch (error) {
        console.error('GetAllAttributes error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des attributs' });
    }
};

export const getAttributesByCategory = async (req, res) => {
    try {
        const { category_id } = req.params;

        // 1. Get all attributes linked to this category through the CategoryAttribute junction
        const categoryAttrs = await CategoryAttribute.findAll({
            where: { category_id },
            include: [
                {
                    model: ProductAttribute,
                    as: 'attribute',
                    include: [{ model: AttributeValue, as: 'values' }]
                },
                {
                    model: CategoryAttributeValue,
                    as: 'attributeValues',
                    include: [{ model: AttributeValue, as: 'value' }]
                }
            ]
        });

        const formatted = categoryAttrs.map(ca => {
            if (!ca.attribute) {
                console.warn(`[getAttributesByCategory] No attribute found for CategoryAttribute link ID: ${ca.id}`);
                return null;
            }

            const attr = ca.attribute.toJSON();
            const filteredValues = ca.attributeValues ? ca.attributeValues.map(v => v.value).filter(v => !!v) : [];

            // If CategoryAttributeValue exists for this category-attribute link, 
            // use only those values. Otherwise, return all values of the attribute.
            return {
                ...attr,
                values: filteredValues.length > 0 ? filteredValues : (attr.values || [])
            };
        }).filter(item => item !== null);

        console.log(`[getAttributesByCategory] Found ${formatted.length} attributes for category ${category_id}`);
        res.json(formatted);
    } catch (error) {
        console.error('GetAttributesByCategory error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des attributs de la catégorie' });
    }
};

export const getAttributeValues = async (req, res) => {
    try {
        const { attribute_id } = req.params;
        const values = await AttributeValue.findAll({
            where: { attribute_id }
        });
        res.json(values);
    } catch (error) {
        console.error('GetAttributeValues error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des valeurs d\'attribut' });
    }
};

export const addAttributeValue = async (req, res) => {
    try {
        const { attribute_id, value, category_id } = req.body;
        if (!attribute_id || !value) {
            return res.status(400).json({ error: 'attribute_id et value sont requis' });
        }

        // 1. Create the value (if it doesn't exist for this attribute)
        const [newValue, created] = await AttributeValue.findOrCreate({
            where: { attribute_id, value }
        });

        // 2. Optional: link to category if provided
        if (category_id) {
            const catAttr = await CategoryAttribute.findOne({
                where: { category_id, attribute_id }
            });

            if (catAttr) {
                await CategoryAttributeValue.findOrCreate({
                    where: {
                        category_attribute_id: catAttr.id,
                        value_id: newValue.id
                    }
                });
            }
        }

        res.status(201).json(newValue);
    } catch (error) {
        console.error('AddAttributeValue error:', error);
        res.status(500).json({ error: 'Erreur lors de l\'ajout de la valeur d\'attribut' });
    }
};

export const createAttribute = async (req, res) => {
    try {
        const { name, categoryIds } = req.body;
        // Check if attribute already exists to avoid duplicates
        let attribute = await ProductAttribute.findOne({ where: { name } });

        if (!attribute) {
            attribute = await ProductAttribute.create({ name });
        }

        // Optional: Keep linking to categories if provided (backward compatibility)
        if (categoryIds && Array.isArray(categoryIds)) {
            const links = categoryIds.map(catId => ({
                category_id: parseInt(catId),
                attribute_id: attribute.id
            }));
            // Use findOrCreate logic for each link to avoid unique constraint errors
            for (const link of links) {
                await CategoryAttribute.findOrCreate({
                    where: { category_id: link.category_id, attribute_id: link.attribute_id }
                });
            }
        }

        res.status(201).json(attribute);
    } catch (error) {
        console.error('CreateAttribute error:', error);
        res.status(500).json({ error: 'Erreur lors de la création de l\'attribut' });
    }
};

export const updateAttribute = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        await ProductAttribute.update({ name }, { where: { id } });
        res.json({ message: 'Attribut mis à jour' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
};

export const deleteAttribute = async (req, res) => {
    try {
        const { id } = req.params;
        // Delete values first
        await AttributeValue.destroy({ where: { attribute_id: id } });
        await ProductAttribute.destroy({ where: { id } });
        res.json({ message: 'Attribut supprimé' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
};

export const updateAttributeValue = async (req, res) => {
    try {
        const { id } = req.params;
        const { value } = req.body;
        await AttributeValue.update({ value }, { where: { id } });
        res.json({ message: 'Valeur mise à jour' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
};

export const deleteAttributeValue = async (req, res) => {
    try {
        const { id } = req.params;
        await AttributeValue.destroy({ where: { id } });
        res.json({ message: 'Valeur supprimée' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
};