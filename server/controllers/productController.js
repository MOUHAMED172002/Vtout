import crypto from 'crypto';
import { Product, ProductImage, ProductVariant, ProductVariantPrice, SupplierProduct, Category, FailedSearch, Supplier, Profile, Boutique, Review, Config, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import { sendProductApprovalNotification } from '../services/mailService.js';
import { notifyProductStatusUpdate } from '../services/whatsappService.js';

export const getAllProducts = async (req, res) => {
    try {
        const { category_id, minPrice, maxPrice, sort, limit, isFlashSale, approval_status } = req.query;
        const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
        const userEmail = req.auth?.email?.toLowerCase();
        const isAdmin = req.auth?.role === 'admin' || (userEmail && adminEmails.includes(userEmail));
        const isAdminView = req.query.isAdmin === 'true';
        const where = {};

        if (category_id) where.category_id = category_id;

        // approval_status: approved by default for everyone
        where.approval_status = approval_status || 'approved';

        // Filter out-of-stock products UNLESS it's an explicit admin view
        if (!isAdminView) {
            where[Op.and] = where[Op.and] || [];
            
            // Safeguard: show if price > 0 OR supplier_price > 0 OR variant price > 0
            where[Op.and].push({
                [Op.or]: [
                    { price: { [Op.gt]: 0 } },
                    { supplier_price: { [Op.gt]: 0 } },
                    sequelize.literal(`EXISTS (
                        SELECT 1 FROM \`product_variant_prices\` AS pvp
                        INNER JOIN \`product_variants\` AS pv ON pv.id = pvp.variant_id
                        WHERE pv.product_id = \`Product\`.id
                        AND pvp.price > 0
                    )`)
                ]
            });
            
            where[Op.and].push(
                sequelize.literal(`(
                    \`Product\`.stock > 0
                    OR EXISTS (
                        SELECT 1 FROM \`product_variant_prices\` AS pvp
                        INNER JOIN \`product_variants\` AS pv ON pv.id = pvp.variant_id
                        WHERE pv.product_id = \`Product\`.id
                        AND pvp.stock > 0
                    )
                )`)
            );
        }

        if (minPrice || maxPrice) {
            let min = parseFloat(minPrice);
            let max = parseFloat(maxPrice);
            
            if (isNaN(min)) min = 0;
            if (isNaN(max)) max = 999999999;
            
            // Filter products where (base price matches) OR (at least one variant price matches)
            where[Op.and] = [
                sequelize.literal(`(
                    \`Product\`.price BETWEEN ${min} AND ${max}
                    OR EXISTS (
                        SELECT 1 FROM \`product_variant_prices\` AS pvp
                        INNER JOIN \`product_variants\` AS pv ON pv.id = pvp.variant_id
                        WHERE pv.product_id = \`Product\`.id
                        AND pvp.price BETWEEN ${min} AND ${max}
                    )
                )`)
            ];
        }

        if (isFlashSale === 'true') {
            where.is_flash_sale = true;
            where.flash_sale_end = { [Op.gt]: new Date() };
        }

        let order = [['createdAt', 'DESC']];
        if (sort === 'price_asc') order = [['price', 'ASC']];
        if (sort === 'price_desc') order = [['price', 'DESC']];

        const findOptions = {
            where,
            order,
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*) FROM reviews WHERE reviews.product_id = Product.id
                        )`),
                        'review_count'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT AVG(rating) FROM reviews WHERE reviews.product_id = Product.id
                        )`),
                        'average_rating'
                    ],
                    [
                        sequelize.literal(`(
                            COALESCE((
                                SELECT SUM(pvp.stock) 
                                FROM product_variant_prices AS pvp
                                INNER JOIN product_variants AS pv ON pv.id = pvp.variant_id
                                WHERE pv.product_id = Product.id
                            ), \`Product\`.stock)
                        )`),
                        'total_stock'
                    ]
                ]
            },
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images' },
                { model: SupplierProduct, as: 'supplierLink' },
                { model: ProductVariant, 
                    as: 'variants',
                    include: [{ model: ProductVariantPrice, as: 'priceRows' }]
                },
                { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'commune_label'] },
                { model: Boutique, as: 'boutique', attributes: ['id', 'name', 'commune_label'] }
            ]
        };

        if (limit) findOptions.limit = parseInt(limit);

        const products = await Product.findAll(findOptions);

        // Map secondary boutiques communes
        const processedProducts = await Promise.all(products.map(async (p) => {
            const product = p.toJSON();
            product.free_delivery_communes = [];
            if (product.boutique?.commune_label) {
                product.free_delivery_communes.push(product.boutique.commune_label);
            }
            
            if (product.secondary_boutique_ids && Array.isArray(product.secondary_boutique_ids) && product.secondary_boutique_ids.length > 0) {
                const secBoutiques = await Boutique.findAll({
                    where: { id: product.secondary_boutique_ids },
                    attributes: ['commune_label']
                });
                secBoutiques.forEach(b => {
                    if (b.commune_label && !product.free_delivery_communes.includes(b.commune_label)) {
                        product.free_delivery_communes.push(b.commune_label);
                    }
                });
            }
            return product;
        }));

        res.json(processedProducts);
    } catch (error) {
        console.error("GET_PRODUCTS ERROR:", error);
        res.status(500).json({ error: 'Erreur lors de la récupération des produits', details: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*) FROM reviews WHERE reviews.product_id = Product.id
                        )`),
                        'review_count'
                    ],
                    [
                        sequelize.literal(`(
                            SELECT AVG(rating) FROM reviews WHERE reviews.product_id = Product.id
                        )`),
                        'average_rating'
                    ],
                    [
                        sequelize.literal(`(
                            COALESCE((
                                SELECT SUM(pvp.stock) 
                                FROM product_variant_prices AS pvp
                                INNER JOIN product_variants AS pv ON pv.id = pvp.variant_id
                                WHERE pv.product_id = Product.id
                            ), \`Product\`.stock)
                        )`),
                        'total_stock'
                    ]
                ]
            },
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images' },
                { 
                    model: ProductVariant, 
                    as: 'variants',
                    include: [{ model: ProductVariantPrice, as: 'priceRows' }]
                },
                { model: SupplierProduct, as: 'supplierLink' },
                { 
                    model: Supplier, 
                    as: 'supplier', 
                    attributes: ['id', 'name', 'commune_label'] 
                },
                { model: Boutique, as: 'boutique' }
            ]
        });

        if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

        const productJson = product.toJSON();
        productJson.free_delivery_communes = [];
        if (productJson.boutique?.commune_label) {
            productJson.free_delivery_communes.push(productJson.boutique.commune_label);
        }

        if (productJson.secondary_boutique_ids && Array.isArray(productJson.secondary_boutique_ids) && productJson.secondary_boutique_ids.length > 0) {
            const secBoutiques = await Boutique.findAll({
                where: { id: productJson.secondary_boutique_ids },
                attributes: ['commune_label']
            });
            secBoutiques.forEach(b => {
                if (b.commune_label && !productJson.free_delivery_communes.includes(b.commune_label)) {
                    productJson.free_delivery_communes.push(b.commune_label);
                }
            });
        }

        res.json(productJson);
    } catch (error) {
        console.error('GetProductById Error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du produit' });
    }
};

export const searchProducts = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        const products = await Product.findAll({
            where: {
                approval_status: 'approved',
                price: { [Op.gt]: 0 },
                [Op.and]: [
                    sequelize.literal(`(
                        \`Product\`.stock > 0
                        OR EXISTS (
                            SELECT 1 FROM \`product_variant_prices\` AS pvp
                            INNER JOIN \`product_variants\` AS pv ON pv.id = pvp.variant_id
                            WHERE pv.product_id = \`Product\`.id
                            AND pvp.stock > 0
                        )
                    )`)
                ],
                [Op.or]: [
                    { name: { [Op.like]: `%${q}%` } },
                    { description: { [Op.like]: `%${q}%` } }
                ]
            },
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            COALESCE((
                                SELECT SUM(pvp.stock) 
                                FROM product_variant_prices AS pvp
                                INNER JOIN product_variants AS pv ON pv.id = pvp.variant_id
                                WHERE pv.product_id = Product.id
                            ), \`Product\`.stock)
                        )`),
                        'total_stock'
                    ]
                ]
            },
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images' },
                { model: SupplierProduct, as: 'supplierLink' },
                { 
                    model: ProductVariant, 
                    as: 'variants',
                    include: [{ model: ProductVariantPrice, as: 'priceRows' }]
                },
                { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'commune_label'] }
            ],
            limit: 20
        });

        const matchingCategories = await Category.findAll({
            where: { name: { [Op.like]: `%${q}%` } },
            attributes: ['id']
        });

        if (matchingCategories.length > 0) {
            const catIds = matchingCategories.map(c => c.id);
            const extraProducts = await Product.findAll({
                where: {
                    approval_status: 'approved',
                    price: { [Op.gt]: 0 },
                    category_id: { [Op.in]: catIds },
                    id: { [Op.notIn]: products.map(p => p.id) },
                    [Op.and]: [
                        sequelize.literal(`(
                            \`Product\`.stock > 0
                            OR EXISTS (
                                SELECT 1 FROM \`product_variant_prices\` AS pvp
                                INNER JOIN \`product_variants\` AS pv ON pv.id = pvp.variant_id
                                WHERE pv.product_id = \`Product\`.id
                                AND pvp.stock > 0
                            )
                        )`)
                    ]
                },
                include: [
                    { model: Category, as: 'category' },
                    { model: ProductImage, as: 'images' },
                    { model: SupplierProduct, as: 'supplierLink' },
                    { 
                        model: ProductVariant, 
                        as: 'variants',
                        include: [{ model: ProductVariantPrice, as: 'priceRows' }]
                    },
                    { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'commune_label'] }
                ],
                limit: 20 - products.length
            });
            products.push(...extraProducts);
        }

        // Log search failure if nothing found
        if (products.length === 0) {
            try {
                await FailedSearch.create({
                    query: q,
                    user_id: req.auth?.userId || null,
                    results_count: 0
                });
            } catch (logErr) {
                console.error('Failed to log search:', logErr);
            }
        }

        res.json(products);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Erreur lors de la recherche' });
    }
};

export const createProduct = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            name, description, price, old_price, stock, category_id,
            images, variants, supplierLinks,
            // Flash sale fields
            is_flash_sale, flash_sale_end,
            // Supplier fields
            supplier_id, supplier_price, approval_status, admin_feedback, in_stock_supplier, boutique_id, secondary_boutique_ids
        } = req.body;

        if (!variants || variants.length === 0) {
            if (stock === undefined || stock === null || stock === '') {
                await transaction.rollback();
                return res.status(400).json({ error: 'Le stock est obligatoire pour ce produit.' });
            }
        } else {
            for (const v of variants) {
                if (v.stock === undefined || v.stock === null || v.stock === '') {
                    await transaction.rollback();
                    return res.status(400).json({ error: 'Le stock est obligatoire pour chaque variante.' });
                }
            }
        }

        // Detect if the request comes from an administrator
        const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
        const userEmail = req.auth?.email?.toLowerCase();
        const isAdmin = req.auth?.role === 'admin' || (userEmail && adminEmails.includes(userEmail));
        const isSupplier = req.auth?.role === 'fournisseur' && !isAdmin;

        let finalSupplierId = supplier_id;
        let finalStatus = approval_status || 'En attente';

        // If no supplier_id provided, try to find the current user's supplier profile
        if (!finalSupplierId && req.auth?.userId) {
            const supplierProfile = await Supplier.findOne({ where: { user_id: req.auth.userId } });
            if (supplierProfile) {
                if (isSupplier) {
                    if (supplierProfile.status !== 'active') {
                        await transaction.rollback();
                        return res.status(403).json({ error: 'Votre compte fournisseur doit être approuvé par l’administrateur avant d’ajouter des produits.' });
                    }

                    // Check selected boutique completeness
                    if (!boutique_id) {
                        await transaction.rollback();
                        return res.status(400).json({ error: 'Veuillez sélectionner une boutique pour ce produit.' });
                    }

                    const boutique = await Boutique.findOne({ where: { id: boutique_id, supplier_id: supplierProfile.id } });
                    if (!boutique) {
                        await transaction.rollback();
                        return res.status(404).json({ error: 'Boutique non trouvée ou ne vous appartient pas.' });
                    }

                    const isBoutiqueComplete = boutique.name && boutique.phone && boutique.address_line && 
                                              boutique.departement_id && boutique.commune_id && boutique.quartier_id;
                    
                    if (!isBoutiqueComplete) {
                        await transaction.rollback();
                        return res.status(403).json({ 
                            error: 'Boutique incomplète', 
                            details: `Les informations de la boutique "${boutique.name}" sont incomplètes (Adresse, Téléphone, Ville/Quartier). Veuillez les mettre à jour.` 
                        });
                    }
                }
                
                finalSupplierId = supplierProfile.id;
                // Suppliers always start with 'En attente' unless they are admins
                if (isSupplier) finalStatus = 'En attente';
            }
        }

        // Fetch commission rate for marketplace logic
        let commissionRate = 0.10; 
        try {
            const configRate = await Config.findOne({ where: { key: 'commission_rate' } });
            if (configRate && configRate.value) commissionRate = parseFloat(configRate.value) / 100;
        } catch (err) { console.error('Erreur commission_rate', err); }

        let finalPrice = price;
        let calculatedSupplierPrice = supplier_price;

        // Strictly enforce commission rate calculation on backend (excluding the 1000F delivery fee)
        const DELIVERY_FEE = 1000;
        if (finalPrice !== undefined && finalPrice > DELIVERY_FEE) {
            calculatedSupplierPrice = Math.round((finalPrice - DELIVERY_FEE) * (1 - commissionRate));
        } else if (calculatedSupplierPrice !== undefined && !finalPrice) {
            finalPrice = Math.round(calculatedSupplierPrice / (1 - commissionRate)) + DELIVERY_FEE;
        }


        let finalStock = stock || 0;
        if (variants && variants.length > 0) {
            finalStock = variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
        }

        // 1. Create base product (NEW)
        const productId = crypto.randomUUID();
        const product = await Product.create({
            id: productId,
            name,
            description,
            price: finalPrice || 0,
            old_price: old_price || 0,
            stock: finalStock,
            category_id,
            is_flash_sale: isSupplier ? false : (is_flash_sale || false),
            flash_sale_end: isSupplier ? null : (flash_sale_end || null),
            supplier_id: finalSupplierId || null,
            supplier_price: calculatedSupplierPrice || 0,
            approval_status: finalStatus,
            admin_feedback: admin_feedback || null,
            in_stock_supplier: in_stock_supplier !== undefined ? in_stock_supplier : true,
            boutique_id: boutique_id || null,
            secondary_boutique_ids: secondary_boutique_ids || null
        }, { transaction });

        // 2. Insert Images
        if (images && images.length > 0) {
            const imageRows = images.map((img, idx) => ({
                product_id: productId,
                image_url: img.url || img.image_url,
                is_main: img.isMain || img.is_main || idx === 0
            }));
            await ProductImage.bulkCreate(imageRows, { transaction });
        }

        // 3. Handle Variants (Add new variants to existing or new product)
        if (variants && variants.length > 0) {
            for (let i = 0; i < variants.length; i++) {
                const v = variants[i];
                const submittedComboStr = typeof v.combination === 'string' ? v.combination : JSON.stringify(v.combination || {});
                
                // Check if this variant already exists on the product
                let existingVariant = (product.variants || []).find(ev => {
                    const evComboStr = typeof ev.combination === 'string' ? ev.combination : JSON.stringify(ev.combination || {});
                    return evComboStr === submittedComboStr;
                });

                let variantId;
                if (!existingVariant) {
                    // Create NEW variant
                    variantId = crypto.randomUUID();
                    const variantSku = v.sku || `${productId}-${i}-${Date.now()}`;
                    existingVariant = await ProductVariant.create({
                        id: variantId,
                        product_id: productId,
                        combination: v.combination,
                        sku: variantSku
                    }, { transaction });

                    await ProductVariantPrice.create({
                        variant_id: variantId,
                        price: v.price || price || 0,
                        old_price: v.old_price || old_price || 0,
                        stock: v.stock || 0,
                        image_url: v.image_url || null
                    }, { transaction });
                } else {
                    variantId = existingVariant.id;
                }

                // Add Supplier Link for this variant
                // Calculate variant supplier price if missing or to enforce rate
                let vFinalPrice = v.price || price || 0;
                let vSupplierPrice = v.supplier_price;
                
                if (vSupplierPrice === undefined) {
                    vSupplierPrice = Math.round(vFinalPrice * (1 - commissionRate));
                }

                await SupplierProduct.create({
                    supplier_id: finalSupplierId,
                    product_id: productId,
                    variant_id: variantId,
                    supplier_sku: v.sku || null,
                    supplier_price: vSupplierPrice,
                    available: true,
                    approval_status: finalStatus
                }, { transaction });
            }
        } else {
            // 4. Handle Root Supplier Links (No variants)
            const linksToAdd = supplierLinks && supplierLinks.length > 0 ? supplierLinks : [{ supplier_id: 'me' }];
            
            for (const link of linksToAdd) {
                await SupplierProduct.create({
                    supplier_id: link.supplier_id === 'me' ? finalSupplierId : link.supplier_id,
                    product_id: productId,
                    variant_id: null,
                    supplier_sku: link.supplier_sku || null,
                    supplier_price: link.supplier_price || supplier_price || price || 0,
                    available: true,
                    approval_status: finalStatus
                }, { transaction });
            }
        }

        await transaction.commit();
        res.status(201).json(product);
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('CreateProduct error:', error);
        res.status(500).json({ error: 'Erreur lors de la création du produit' });
    }
};

export const updateProduct = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        let {
            name, description, price, old_price, stock, category_id,
            images, variants, supplierLinks,
            // Flash sale fields
            is_flash_sale, flash_sale_end,
            // Supplier fields
            supplier_id, supplier_price, approval_status, admin_feedback, in_stock_supplier, boutique_id, secondary_boutique_ids
        } = req.body;

        const isApprovalOnly = Object.keys(req.body).every(k => ['approval_status', 'price', 'admin_feedback', 'isAdmin'].includes(k));

        if (!isApprovalOnly) {
            if (!variants || variants.length === 0) {
                if (stock === undefined || stock === null || stock === '') {
                    await transaction.rollback();
                    return res.status(400).json({ error: 'Le stock est obligatoire pour ce produit.' });
                }
            } else {
                for (const v of variants) {
                    if (v.stock === undefined || v.stock === null || v.stock === '') {
                        await transaction.rollback();
                        return res.status(400).json({ error: 'Le stock est obligatoire pour chaque variante.' });
                    }
                }
            }
        }

        const productToEdit = await Product.findByPk(id);
        if (!productToEdit) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Produit non trouvé' });
        }

        const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
        const userEmail = req.auth?.email?.toLowerCase();
        const isAdmin = req.auth?.role === 'admin' || (userEmail && adminEmails.includes(userEmail));
        const isSupplier = req.auth?.role === 'fournisseur';

        if (isSupplier && !isAdmin) {
            const supplierProfile = await Supplier.findOne({ where: { user_id: req.auth.userId } });
            if (!supplierProfile || productToEdit.supplier_id !== supplierProfile.id) {
                await transaction.rollback();
                return res.status(403).json({ error: 'Vous n’avez pas l’autorisation de modifier ce produit' });
            }
        }

        let finalStatus = approval_status;
        if (isSupplier && !isAdmin) {
            finalStatus = 'En attente'; // Reset to En attente if supplier edits
        }

        // Sync price with supplier_price if it's a marketplace product update
        let finalPrice = price;
        
        // Fetch commission rate
        let commissionRate = 0.10;
        try {
            const configRate = await Config.findOne({ where: { key: 'commission_rate' } });
            if (configRate && configRate.value) commissionRate = parseFloat(configRate.value) / 100;
        } catch (err) { console.error('Erreur commission rate', err); }

        const DELIVERY_FEE = 1000;
        if (isSupplier && !isAdmin) {
            if (finalPrice !== undefined && finalPrice > DELIVERY_FEE) {
                supplier_price = Math.round((finalPrice - DELIVERY_FEE) * (1 - commissionRate));
            }
        } else {
            // For admins, allow explicit supplier_price, but sync if missing
            if (finalPrice !== undefined && supplier_price === undefined && finalPrice > DELIVERY_FEE) {
                supplier_price = Math.round((finalPrice - DELIVERY_FEE) * (1 - commissionRate));
            } else if (finalPrice === undefined && supplier_price !== undefined) {
                finalPrice = Math.round(supplier_price / (1 - commissionRate)) + DELIVERY_FEE;
            }
        }

        // Sync approval_status to SupplierProduct if it changed
        if (finalStatus) {
            await SupplierProduct.update(
                { approval_status: finalStatus, admin_feedback },
                { where: { product_id: id }, transaction }
            );
        }

        let finalStock = stock;
        if (variants && variants.length > 0) {
            finalStock = variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
        }

        // 1. Update base product
        const updatePayload = {
            name,
            description,
            category_id,
            approval_status: finalStatus
        };
        if (finalPrice !== undefined) updatePayload.price = finalPrice;
        if (old_price !== undefined) updatePayload.old_price = old_price;
        if (finalStock !== undefined) updatePayload.stock = finalStock;
        if (is_flash_sale !== undefined && (!isSupplier || isAdmin)) updatePayload.is_flash_sale = is_flash_sale;
        if (flash_sale_end !== undefined && (!isSupplier || isAdmin)) updatePayload.flash_sale_end = flash_sale_end;
        if (isAdmin && supplier_id !== undefined) updatePayload.supplier_id = supplier_id;
        if (supplier_price !== undefined) updatePayload.supplier_price = supplier_price;
        if (isAdmin && admin_feedback !== undefined) updatePayload.admin_feedback = admin_feedback;
        if (in_stock_supplier !== undefined) updatePayload.in_stock_supplier = in_stock_supplier;
        if (boutique_id !== undefined) updatePayload.boutique_id = boutique_id;
        if (secondary_boutique_ids !== undefined) updatePayload.secondary_boutique_ids = secondary_boutique_ids;

        const [updatedRows] = await Product.update(updatePayload, {
            where: { id },
            transaction
        });

        // Notify supplier (background)
        if (approval_status && (approval_status === 'approved' || approval_status === 'rejected')) {
            Product.findByPk(id, { include: [{ model: Supplier, as: 'supplier', include: [{ model: Profile, as: 'profile' }] }] }).then(product => {
                if (product && product.supplier) {
                    const email = product.supplier.email;
                    if (email) {
                        sendProductApprovalNotification(email, product, approval_status, admin_feedback).catch(console.error);
                    }
                    
                    const phone = product.supplier.whatsapp || product.supplier.phone || product.supplier.profile?.phone;
                    if (phone) {
                        notifyProductStatusUpdate(phone, product.name, approval_status, admin_feedback).catch(console.error);
                    }
                }
            });
        }

        if (updatedRows === 0) {
            const exists = await Product.findByPk(id);
            if (!exists) {
                await transaction.rollback();
                return res.status(404).json({ error: 'Produit non trouvé' });
            }
        }

        // 2. Sync Images
        if (images) {
            // Delete old images
            await ProductImage.destroy({ where: { product_id: id }, transaction });
            // Insert new images
            if (images.length > 0) {
                const imageRows = images.map((img, idx) => ({
                    product_id: id,
                    image_url: img.url || img.image_url,
                    is_main: img.isMain || img.is_main || idx === 0
                }));
                await ProductImage.bulkCreate(imageRows, { transaction });
            }
        }

        // 3. Sync Variants
        if (variants) {
            // Delete old variants (and cascading prices/suppliers if configured, but let's be explicit)
            const existingVariants = await ProductVariant.findAll({ where: { product_id: id } });
            const variantIds = existingVariants.map(v => v.id);

            if (variantIds.length > 0) {
                await ProductVariantPrice.destroy({ where: { variant_id: { [Op.in]: variantIds } }, transaction });
                await SupplierProduct.destroy({ where: { variant_id: { [Op.in]: variantIds } }, transaction });
                await ProductVariant.destroy({ where: { product_id: id }, transaction });
            }

            // Create new variants
            for (let i = 0; i < variants.length; i++) {
                const v = variants[i];
                const variantId = crypto.randomUUID();
                const variantSku = v.sku || `${id}-${i}`;

                const newVariant = await ProductVariant.create({
                    id: variantId,
                    product_id: id,
                    combination: v.combination,
                    sku: variantSku
                }, { transaction });

                // Price/Stock for variant
                await ProductVariantPrice.create({
                    variant_id: newVariant.id,
                    price: v.price || price,
                    old_price: v.old_price || old_price,
                    stock: v.stock || 0,
                    image_url: v.image_url || null
                }, { transaction });

                // Supplier links for variant
                if (v.supplierLinks && v.supplierLinks.length > 0) {
                    const supplierRows = v.supplierLinks.map(link => {
                        let sid = link.supplier_id;
                        if (sid === 'me' || !sid) {
                            // Use existing product supplier_id as fallback
                            sid = productToEdit.supplier_id;
                        }
                        return {
                            supplier_id: sid,
                            product_id: id,
                            variant_id: newVariant.id,
                            supplier_sku: link.supplier_sku || null,
                            supplier_price: link.supplier_price || Math.round((v.price || price || 0) * (1 - commissionRate)),
                            available: true
                        };
                    });
                    
                    await SupplierProduct.bulkCreate(supplierRows, { transaction });
                }
            }
        } else if (supplierLinks) {
            // 4. Sync Root Supplier Links (only if no variants provided)
            await SupplierProduct.destroy({ where: { product_id: id, variant_id: null }, transaction });
            if (supplierLinks.length > 0) {
                const supplierRows = supplierLinks.map(link => ({
                    supplier_id: link.supplier_id === 'me' ? productToEdit.supplier_id : link.supplier_id,
                    product_id: id,
                    variant_id: null,
                    supplier_sku: link.supplier_sku || null,
                    supplier_price: link.supplier_price || price,
                    available: true
                }));
                await SupplierProduct.bulkCreate(supplierRows, { transaction });
            }
        }

        await transaction.commit();

        // Return updated product with all related data
        const product = await Product.findByPk(id, {
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images' },
                {
                    model: ProductVariant,
                    as: 'variants',
                    include: [
                        { model: ProductVariantPrice, as: 'priceRows' },
                        { model: SupplierProduct, as: 'supplierLink' }
                    ]
                }
            ]
        });
        res.json(product);
    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('UpdateProduct error:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du produit' });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

        const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
        const userEmail = req.auth?.email?.toLowerCase();
        const isAdmin = req.auth?.role === 'admin' || (userEmail && adminEmails.includes(userEmail));
        const isSupplier = req.auth?.role === 'fournisseur';

        if (isSupplier && !isAdmin) {
            const supplierProfile = await Supplier.findOne({ where: { user_id: req.auth.userId } });
            if (!supplierProfile || product.supplier_id !== supplierProfile.id) {
                return res.status(403).json({ error: 'Vous n’avez pas l’autorisation de supprimer ce produit' });
            }
        }

        const OrderItem = (await import('../models/OrderItem.js')).default;
        const hasOrders = await OrderItem.findOne({ where: { product_id: id } });

        if (hasOrders) {
            return res.status(400).json({ 
                error: 'Ce produit ne peut pas être supprimé car il a déjà été commandé.',
                details: 'Veuillez plutôt mettre le stock à 0 pour le rendre indisponible.' 
            });
        }

        await Product.destroy({ where: { id } });
        res.json({ message: 'Produit supprimé' });
    } catch (error) {
        console.error('DeleteProduct error:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression', details: error.message });
    }
};

export const adminCreateProduct = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            name, description, price, old_price, stock, category_id,
            images, is_flash_sale, flash_sale_end, variants,
            supplier_id, boutique_id, supplier_price, approval_status
        } = req.body;

        if (!supplier_id) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Le champ supplier_id est obligatoire pour créer un produit en tant qu\'admin.' });
        }
        if (!name || !price) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Le nom et le prix sont obligatoires.' });
        }

        let finalStock = stock || 0;
        if (variants && variants.length > 0) {
            finalStock = variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
        }

        const product = await Product.create({
            id: crypto.randomUUID(),
            name, description, price, old_price, stock: finalStock, category_id,
            is_flash_sale, flash_sale_end,
            supplier_id,
            supplier_price,
            approval_status: approval_status || 'approved'
        }, { transaction });

        if (images && images.length > 0) {
            await ProductImage.bulkCreate(
                images.map(img => ({
                    id: crypto.randomUUID(),
                    product_id: product.id,
                    image_url: img.url,
                    is_main: img.isMain || false
                })),
                { transaction }
            );
        }

        if (variants && variants.length > 0) {
            for (const v of variants) {
                const variant = await ProductVariant.create({
                    id: crypto.randomUUID(),
                    product_id: product.id,
                    sku: v.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    combination: v.combination
                }, { transaction });

                await ProductVariantPrice.create({
                    id: crypto.randomUUID(),
                    variant_id: variant.id,
                    price: v.price || price,
                    old_price: v.old_price || old_price,
                    stock: v.stock || 0,
                    image_url: v.image_url || null
                }, { transaction });

                await SupplierProduct.create({
                    id: crypto.randomUUID(),
                    supplier_id,
                    product_id: product.id,
                    variant_id: variant.id,
                    boutique_id: boutique_id || null,
                    supplier_price: v.supplier_price || supplier_price,
                    supplier_sku: v.supplier_sku || v.sku
                }, { transaction });
            }
        } else {
            await SupplierProduct.create({
                id: crypto.randomUUID(),
                supplier_id,
                product_id: product.id,
                boutique_id: boutique_id || null,
                supplier_price: supplier_price || null
            }, { transaction });
        }

        await transaction.commit();
        res.status(201).json(product);
    } catch (error) {
        await transaction.rollback();
        console.error('AdminCreateProduct error:', error);
        res.status(500).json({ error: 'Erreur lors de la création du produit par l\'admin' });
    }
};

export const getRelatedProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id, {
            include: [{ model: Category, as: 'category' }]
        });
        if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

        // Build category IDs list: same category + siblings + children
        let categoryIds = [product.category_id];

        if (product.category) {
            // Case 1: Product is in a subcategory -> include parent and other subcategories of that parent
            if (product.category.parent_id) {
                const siblings = await Category.findAll({ where: { parent_id: product.category.parent_id }, attributes: ['id'] });
                categoryIds.push(product.category.parent_id, ...siblings.map(c => c.id));
            } else {
                // Case 2: Product is in a parent category -> include its subcategories
                const children = await Category.findAll({ where: { parent_id: product.category.id }, attributes: ['id'] });
                categoryIds.push(...children.map(c => c.id));
            }
        }

        const related = await Product.findAll({
            where: {
                category_id: { [Op.in]: [...new Set(categoryIds)] },
                id: { [Op.ne]: id },
                approval_status: 'approved',
                [Op.and]: [
                    sequelize.literal(`(
                        \`Product\`.stock > 0
                        OR EXISTS (
                            SELECT 1 FROM \`product_variant_prices\` AS pvp
                            INNER JOIN \`product_variants\` AS pv ON pv.id = pvp.variant_id
                            WHERE pv.product_id = \`Product\`.id
                            AND pvp.stock > 0
                        )
                    )`)
                ]
            },
            attributes: {
                include: [
                    [sequelize.literal(`(SELECT COUNT(*) FROM reviews WHERE reviews.product_id = Product.id)`), 'review_count'],
                    [sequelize.literal(`(SELECT AVG(rating) FROM reviews WHERE reviews.product_id = Product.id)`), 'average_rating']
                ]
            },
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images' },
                {
                    model: ProductVariant,
                    as: 'variants',
                    include: [{ model: ProductVariantPrice, as: 'priceRows' }]
                },
                { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'commune_label'] }
            ],
            limit: 12,
            order: sequelize.literal('RAND()')
        });

        res.json(related);
    } catch (error) {
        console.error('getRelatedProducts error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des produits similaires' });
    }
};

export const getFrequentlyBoughtTogether = async (req, res) => {
    try {
        const { id } = req.params;
        const { OrderItem } = await import('../models/index.js');
        
        // Find all orders that contain this product
        const ordersWithProduct = await OrderItem.findAll({
            where: { product_id: id },
            attributes: ['order_id'],
            raw: true
        });

        if (!ordersWithProduct.length) {
            return res.json([]);
        }

        const orderIds = ordersWithProduct.map(oi => oi.order_id);

        // Find other products in those same orders
        const otherItems = await OrderItem.findAll({
            where: {
                order_id: { [Op.in]: orderIds },
                product_id: { [Op.ne]: id } // exclude the product itself
            },
            attributes: [
                'product_id',
                [sequelize.fn('COUNT', sequelize.col('product_id')), 'freq']
            ],
            group: ['product_id'],
            order: [[sequelize.col('freq'), 'DESC']],
            limit: 4,
            raw: true
        });

        if (!otherItems.length) {
            return res.json([]);
        }

        const topProductIds = otherItems.map(item => item.product_id);

        // Fetch product details
        const products = await Product.findAll({
            where: {
                id: { [Op.in]: topProductIds },
                approval_status: 'approved',
                price: { [Op.gt]: 0 },
                [Op.and]: [
                    sequelize.literal(`(
                        \`Product\`.stock > 0
                        OR EXISTS (
                            SELECT 1 FROM \`product_variant_prices\` AS pvp
                            INNER JOIN \`product_variants\` AS pv ON pv.id = pvp.variant_id
                            WHERE pv.product_id = \`Product\`.id
                            AND pvp.stock > 0
                        )
                    )`)
                ]
            },
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images' }
            ]
        });

        res.json(products);
    } catch (error) {
        console.error('getFrequentlyBoughtTogether error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des produits achetés ensemble' });
    }
};

/**
 * ADMIN MIGRATION: Fix stale variant prices
 * For each product with a valid public price (product.price > 0),
 * update all its variant prices to match, if the variant price is lower than the product price.
 * This corrects old data where variant prices were set to the taxed/net amount.
 */
export const fixVariantPrices = async (req, res) => {
    try {
        // Fetch all products that have a public price > 0 and have variants
        const products = await Product.findAll({
            where: { price: { [Op.gt]: 0 } },
            include: [
                {
                    model: ProductVariant,
                    as: 'variants',
                    include: [{ model: ProductVariantPrice, as: 'priceRows' }]
                }
            ]
        });

        let fixed = 0;
        let skipped = 0;
        const details = [];

        for (const product of products) {
            const publicPrice = parseFloat(product.price);
            if (!product.variants || product.variants.length === 0) {
                skipped++;
                continue;
            }

            for (const variant of product.variants) {
                for (const priceRow of (variant.priceRows || [])) {
                    const variantPrice = parseFloat(priceRow.price || 0);
                    // Fix if variant price is significantly lower than product public price (likely taxed)
                    if (variantPrice > 0 && variantPrice < publicPrice * 0.98) {
                        await priceRow.update({ price: publicPrice });
                        details.push({
                            product_id: product.id,
                            product_name: product.name,
                            variant_id: variant.id,
                            old_price: variantPrice,
                            new_price: publicPrice
                        });
                        fixed++;
                    } else {
                        skipped++;
                    }
                }
            }
        }

        console.log(`[Price Fix] Fixed: ${fixed}, Skipped: ${skipped}`);
        res.json({
            message: `Migration terminée. ${fixed} prix de variantes corrigés.`,
            fixed,
            skipped,
            details
        });
    } catch (error) {
        console.error('fixVariantPrices error:', error);
        res.status(500).json({ error: 'Erreur lors de la migration des prix', details: error.message });
    }
};

