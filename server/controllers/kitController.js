import crypto from 'crypto';
import { Op } from 'sequelize';
import { sequelize, Kit, KitComponent, Product, ProductImage, Boutique, Supplier } from '../models/index.js';

// Shared include for single-kit lookups (getKitById, createKit, updateKit)
const kitIncludes = [
    {
        model: Product,
        as: 'components',
        attributes: ['id', 'name', 'price', 'old_price', 'supplier_price', 'boutique_id', 'is_flash_sale', 'flash_sale_end'],
        include: [{ model: ProductImage, as: 'images', where: { is_main: true }, required: false }]
    },
    { model: Boutique, as: 'boutique', required: false, attributes: ['id', 'name', 'commune_label', 'departement_label'] }
];

export const getKits = async (req, res) => {
    try {
        const { boutique_id, supplier_id, active } = req.query;
        const where = {};
        if (boutique_id) where.boutique_id = boutique_id;
        if (supplier_id) where.supplier_id = supplier_id;
        where.is_active = active === 'false' ? false : true;

        // Step 1 — fetch kits + boutique (simple belongsTo join, no belongsToMany)
        const kits = await Kit.findAll({
            where,
            include: [{ model: Boutique, as: 'boutique', required: false, attributes: ['id', 'name', 'commune_label', 'departement_label'] }],
            order: [['created_at', 'DESC']]
        });

        if (kits.length === 0) return res.json([]);

        // Step 2 — fetch all components in one raw SQL query (avoids Sequelize belongsToMany quirks)
        const kitIds = kits.map(k => k.id);
        const [compRows] = await sequelize.query(
            `SELECT kc.kit_id,
                    p.id, p.name, p.price, p.old_price, p.supplier_price,
                    p.boutique_id, p.is_flash_sale, p.flash_sale_end,
                    pi.image_url
             FROM kit_components kc
             INNER JOIN products p ON p.id = kc.product_id
             LEFT  JOIN product_images pi ON pi.product_id = p.id AND pi.is_main = 1
             WHERE kc.kit_id IN (${kitIds.map(() => '?').join(',')})`,
            { replacements: kitIds }
        );

        // Group components by kit_id
        const byKit = {};
        for (const row of compRows) {
            if (!byKit[row.kit_id]) byKit[row.kit_id] = [];
            if (!byKit[row.kit_id].find(c => c.id === row.id)) {
                const { kit_id, image_url, ...product } = row;
                byKit[row.kit_id].push({ ...product, images: image_url ? [{ image_url, is_main: 1 }] : [] });
            }
        }

        const result = kits.map(k => ({ ...k.toJSON(), components: byKit[k.id] || [] }));
        res.json(result);
    } catch (err) {
        console.error('GET KITS ERROR:', err);
        res.status(500).json({ error: 'Erreur serveur', details: err.message });
    }
};

export const getKitById = async (req, res) => {
    try {
        const kit = await Kit.findByPk(req.params.id, { include: kitIncludes });
        if (!kit) return res.status(404).json({ error: 'Kit introuvable' });
        res.json(kit);
    } catch (err) {
        console.error('GET KIT ERROR:', err);
        res.status(500).json({ error: 'Erreur serveur', details: err.message });
    }
};

export const createKit = async (req, res) => {
    try {
        const { name, description, bundle_price, boutique_id, supplier_id, component_ids } = req.body;

        if (!name || !bundle_price || !boutique_id || !component_ids?.length) {
            return res.status(400).json({ error: 'Champs requis manquants (name, bundle_price, boutique_id, component_ids).' });
        }

        // Non-admin: verify the boutique belongs to the authenticated supplier
        const { supplierId } = req.auth;
        if (supplierId) {
            const ownedBoutique = await Boutique.findOne({ where: { id: boutique_id, supplier_id: supplierId } });
            if (!ownedBoutique) {
                return res.status(403).json({ error: "Cette boutique n'appartient pas à votre compte fournisseur." });
            }
        }

        // Validate all components belong to the same boutique
        const components = await Product.findAll({
            where: { id: { [Op.in]: component_ids } },
            attributes: ['id', 'boutique_id']
        });

        if (components.length !== component_ids.length) {
            return res.status(400).json({ error: 'Un ou plusieurs produits sont introuvables.' });
        }

        const wrongBoutique = components.filter(c => String(c.boutique_id) !== String(boutique_id));
        if (wrongBoutique.length > 0) {
            return res.status(400).json({
                error: 'Tous les composants doivent appartenir à la même boutique.',
                invalid_ids: wrongBoutique.map(c => c.id)
            });
        }

        const kit = await Kit.create({
            id: crypto.randomUUID(),
            name,
            description: description || null,
            bundle_price: parseFloat(bundle_price),
            boutique_id,
            supplier_id: supplier_id || null,
            is_active: true
        });

        await KitComponent.bulkCreate(
            component_ids.map(product_id => ({ kit_id: kit.id, product_id }))
        );

        const full = await Kit.findByPk(kit.id, { include: kitIncludes });
        res.status(201).json(full);
    } catch (err) {
        console.error('CREATE KIT ERROR:', err);
        res.status(500).json({ error: 'Erreur serveur', details: err.message });
    }
};

export const updateKit = async (req, res) => {
    try {
        const kit = await Kit.findByPk(req.params.id);
        if (!kit) return res.status(404).json({ error: 'Kit introuvable' });

        // Non-admin: verify the kit's boutique belongs to the authenticated supplier
        const { supplierId } = req.auth;
        if (supplierId) {
            const ownedBoutique = await Boutique.findOne({ where: { id: kit.boutique_id, supplier_id: supplierId } });
            if (!ownedBoutique) {
                return res.status(403).json({ error: "Ce kit n'appartient pas à votre compte fournisseur." });
            }
        }

        const { name, description, bundle_price, is_active, component_ids } = req.body;

        if (component_ids?.length) {
            const components = await Product.findAll({
                where: { id: { [Op.in]: component_ids } },
                attributes: ['id', 'boutique_id']
            });

            const wrongBoutique = components.filter(c => String(c.boutique_id) !== String(kit.boutique_id));
            if (wrongBoutique.length > 0) {
                return res.status(400).json({
                    error: 'Tous les composants doivent appartenir à la boutique du kit.',
                    invalid_ids: wrongBoutique.map(c => c.id)
                });
            }

            await KitComponent.destroy({ where: { kit_id: kit.id } });
            await KitComponent.bulkCreate(
                component_ids.map(product_id => ({ kit_id: kit.id, product_id }))
            );
        }

        await kit.update({
            ...(name !== undefined && { name }),
            ...(description !== undefined && { description }),
            ...(bundle_price !== undefined && { bundle_price: parseFloat(bundle_price) }),
            ...(is_active !== undefined && { is_active })
        });

        const full = await Kit.findByPk(kit.id, { include: kitIncludes });
        res.json(full);
    } catch (err) {
        console.error('UPDATE KIT ERROR:', err);
        res.status(500).json({ error: 'Erreur serveur', details: err.message });
    }
};

export const deleteKit = async (req, res) => {
    try {
        const kit = await Kit.findByPk(req.params.id);
        if (!kit) return res.status(404).json({ error: 'Kit introuvable' });

        // Non-admin: verify ownership before deactivating
        const { supplierId } = req.auth;
        if (supplierId) {
            const ownedBoutique = await Boutique.findOne({ where: { id: kit.boutique_id, supplier_id: supplierId } });
            if (!ownedBoutique) {
                return res.status(403).json({ error: "Ce kit n'appartient pas à votre compte fournisseur." });
            }
        }

        await kit.update({ is_active: false });
        res.json({ message: 'Kit désactivé.' });
    } catch (err) {
        console.error('DELETE KIT ERROR:', err);
        res.status(500).json({ error: 'Erreur serveur', details: err.message });
    }
};
