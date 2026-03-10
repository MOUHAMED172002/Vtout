const { Product, ProductImage, ProductVariant, ProductVariantPrice, SupplierProduct, Category, FailedSearch, Supplier, Review } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const { sequelize } = require('../models');
const { sendProductApprovalNotification } = require('../services/mailService');

exports.getAllProducts = async (req, res) => {
    try {
        const { category_id, minPrice, maxPrice, sort, limit, isFlashSale, approval_status, isAdmin } = req.query;
        const where = {};

        if (category_id) where.category_id = category_id;

        // Si c'est un administrateur, on montre tout, sinon seulement les approuvés
        if (isAdmin === 'true' || req.auth?.role === 'admin') {
            if (approval_status) where.approval_status = approval_status;
        } else {
            where.approval_status = 'approved';

            // Logic to prevent duplicate (name, category_id) for clients
            // We only show one instance of each (name, category_id) pair
            // This ensures uniqueness by name/category on the storefront
            where.id = {
                [Op.in]: sequelize.literal(`(
                    SELECT MAX(id) FROM products
                    WHERE approval_status = 'approved'
                    GROUP BY name, category_id
                )`)
            };
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = minPrice;
            if (maxPrice) where.price[Op.lte] = maxPrice;
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
                    ]
                ]
            },
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images' }
            ]
        };

        if (limit) findOptions.limit = parseInt(limit);

        const products = await Product.findAll(findOptions);

        res.json(products);
    } catch (error) {
        console.error("GET_PRODUCTS ERROR:", error);
        res.status(500).json({ error: 'Erreur lors de la récupération des produits', details: error.message });
    }
};

exports.getProductById = async (req, res) => {
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
                    ]
                ]
            },
            include: [
                { model: Category, as: 'category' },
                {
                    model: ProductImage,
                    as: 'images'
                },
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

        if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération du produit' });
    }
};

exports.searchProducts = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        const products = await Product.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${q}%` } },
                    { description: { [Op.like]: `%${q}%` } }
                ]
            },
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images' }
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
                    category_id: { [Op.in]: catIds },
                    id: { [Op.notIn]: products.map(p => p.id) }
                },
                include: [
                    { model: Category, as: 'category' },
                    { model: ProductImage, as: 'images' }
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

exports.createProduct = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            name, description, price, old_price, stock, category_id,
            images, variants,
            // Flash sale fields
            is_flash_sale, flash_sale_end,
            // Supplier fields
            supplier_id, supplier_price, approval_status, admin_feedback, in_stock_supplier
        } = req.body;

        const productId = crypto.randomUUID();

        // Detect if the request comes from a supplier
        const isSupplier = req.auth?.role === 'fournisseur';
        let finalSupplierId = supplier_id;
        let finalStatus = approval_status || 'approved';

        if (isSupplier) {
            // Find the supplier ID for this user
            const supplierProfile = await Supplier.findOne({ where: { user_id: req.auth.userId } });
            if (supplierProfile) {
                finalSupplierId = supplierProfile.id;
                finalStatus = 'pending'; // Force pending for suppliers
            }
        }

        // 1. Create base product
        const product = await Product.create({
            id: productId,
            name,
            // Only admin can set the description in the system for agora products
            description: isSupplier ? null : description,
            // If it's a supplier, the retail price is 0 (admin will set it)
            price: isSupplier ? 0 : (price || 0),
            old_price: isSupplier ? 0 : (old_price || 0),
            stock: stock || 0,
            category_id,
            is_flash_sale: isSupplier ? false : (is_flash_sale || false),
            flash_sale_end: isSupplier ? null : (flash_sale_end || null),
            supplier_id: finalSupplierId || null,
            supplier_price: isSupplier ? supplier_price : (supplier_price || null),
            approval_status: finalStatus,
            admin_feedback: admin_feedback || null,
            in_stock_supplier: in_stock_supplier !== undefined ? in_stock_supplier : true
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

        // 3. Handle Variants
        if (variants && variants.length > 0) {
            for (let i = 0; i < variants.length; i++) {
                const v = variants[i];
                const variantId = crypto.randomUUID();
                const variantSku = v.sku || `${productId}-${i}`;

                const newVariant = await ProductVariant.create({
                    id: variantId,
                    product_id: productId,
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
                    const supplierRows = v.supplierLinks.map(link => ({
                        supplier_id: link.supplier_id,
                        product_id: productId,
                        variant_id: newVariant.id,
                        supplier_sku: link.supplier_sku || null,
                        supplier_price: link.supplier_price || v.price || price,
                        available: true
                    }));
                    await SupplierProduct.bulkCreate(supplierRows, { transaction });
                }
            }
        } else {
            // 4. Handle Root Supplier Links (for products without variants)
            const { supplierLinks } = req.body;
            if (supplierLinks && supplierLinks.length > 0) {
                const supplierRows = supplierLinks.map(link => ({
                    supplier_id: link.supplier_id,
                    product_id: productId,
                    variant_id: null,
                    supplier_sku: link.supplier_sku || null,
                    supplier_price: link.supplier_price || price,
                    available: true
                }));
                await SupplierProduct.bulkCreate(supplierRows, { transaction });
            }
        }

        await transaction.commit();
        res.status(201).json(product);
    } catch (error) {
        await transaction.rollback();
        console.error('CreateProduct error:', error);
        res.status(500).json({ error: 'Erreur lors de la création du produit' });
    }
};

exports.updateProduct = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const {
            name, description, price, old_price, stock, category_id,
            images, variants, supplierLinks,
            // Flash sale fields
            is_flash_sale, flash_sale_end,
            // Supplier fields
            supplier_id, supplier_price, approval_status, admin_feedback, in_stock_supplier
        } = req.body;

        const productToEdit = await Product.findByPk(id);
        if (!productToEdit) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Produit non trouvé' });
        }

        const isAdmin = req.auth?.role === 'admin';
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
            finalStatus = 'pending'; // Reset to pending if supplier edits
        }

        // 1. Update base product
        const [updatedRows] = await Product.update({
            name,
            description,
            price: (isSupplier && !isAdmin) ? productToEdit.price : price, // Suppliers can't change final price
            old_price: (isSupplier && !isAdmin) ? productToEdit.old_price : old_price,
            stock: stock || 0,
            category_id,
            is_flash_sale: (isSupplier && !isAdmin) ? productToEdit.is_flash_sale : (is_flash_sale !== undefined ? is_flash_sale : undefined),
            flash_sale_end: (isSupplier && !isAdmin) ? productToEdit.flash_sale_end : (flash_sale_end !== undefined ? flash_sale_end : undefined),
            supplier_id: isAdmin ? supplier_id : undefined,
            supplier_price: supplier_price !== undefined ? supplier_price : undefined,
            approval_status: finalStatus,
            admin_feedback: isAdmin ? admin_feedback : undefined,
            in_stock_supplier: in_stock_supplier !== undefined ? in_stock_supplier : undefined
        }, {
            where: { id },
            transaction
        });

        // Notify supplier (background)
        if (approval_status && (approval_status === 'approved' || approval_status === 'rejected')) {
            Product.findByPk(id, { include: ['supplier'] }).then(product => {
                if (product && product.supplier && product.supplier.email) {
                    sendProductApprovalNotification(product.supplier.email, product, approval_status, admin_feedback).catch(console.error);
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
                    const supplierRows = v.supplierLinks.map(link => ({
                        supplier_id: link.supplier_id,
                        product_id: id,
                        variant_id: newVariant.id,
                        supplier_sku: link.supplier_sku || null,
                        supplier_price: link.supplier_price || v.price || price,
                        available: true
                    }));
                    await SupplierProduct.bulkCreate(supplierRows, { transaction });
                }
            }
        } else if (supplierLinks) {
            // 4. Sync Root Supplier Links (only if no variants provided)
            await SupplierProduct.destroy({ where: { product_id: id, variant_id: null }, transaction });
            if (supplierLinks.length > 0) {
                const supplierRows = supplierLinks.map(link => ({
                    supplier_id: link.supplier_id,
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

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

        const isAdmin = req.auth?.role === 'admin';
        const isSupplier = req.auth?.role === 'fournisseur';

        if (isSupplier && !isAdmin) {
            const supplierProfile = await Supplier.findOne({ where: { user_id: req.auth.userId } });
            if (!supplierProfile || product.supplier_id !== supplierProfile.id) {
                return res.status(403).json({ error: 'Vous n’avez pas l’autorisation de supprimer ce produit' });
            }
        }

        await Product.destroy({ where: { id } });
        res.json({ message: 'Produit supprimé' });
    } catch (error) {
        console.error('DeleteProduct error:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
};

exports.getRelatedProducts = async (req, res) => {
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
                id: { [Op.ne]: id }
            },
            include: [
                { model: Category, as: 'category' },
                { model: ProductImage, as: 'images' }
            ],
            limit: 12, // Increased limit for variety
            order: sequelize.random()
        });

        res.json(related);
    } catch (error) {
        console.error('getRelatedProducts error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des produits similaires' });
    }
};
