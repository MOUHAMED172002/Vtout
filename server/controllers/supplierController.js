import { Op } from 'sequelize';
import { Supplier, SupplierProduct, Product, ProductVariant, ProductVariantPrice, ProductImage, Category, Profile, Boutique, sequelize, Dispute, Order } from '../models/index.js';
import crypto from 'crypto';
import { sendSupplierApprovalNotification } from '../services/mailService.js';
import { notifySupplierStatusUpdate, notifyAdmin } from '../services/whatsappService.js';
import { auth } from '../config/auth.js';

export const getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.findAll({
            include: [{
                model: Profile,
                as: 'user',
                attributes: ['email', 'first_name', 'last_name', 'phone']
            }],
            order: [['created_at', 'DESC']]
        });
        res.json(suppliers);
    } catch (error) {
        console.error('GetAllSuppliers error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des fournisseurs' });
    }
};

export const getAllSupplierProducts = async (req, res) => {
    try {
        const rows = await SupplierProduct.findAll({
            include: [
                { model: Supplier, as: 'supplier' },
                { 
                    model: Product, 
                    as: 'product', 
                    attributes: ['id', 'name'],
                    where: { approval_status: 'approved' } // Filtre uniquement les approuvés
                },
                { model: ProductVariant, as: 'variant', attributes: ['id', 'sku', 'combination'] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(rows);
    } catch (error) {
        console.error('GetAllSupplierProducts error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des liaisons produits-fournisseurs' });
    }
};

// Crée un marchand DEPUIS l'admin, avec un vrai compte de connexion (email + mot de
// passe) — pas une simple fiche : ce compte doit pouvoir se connecter au supplier-portal
// et avoir exactement les mêmes privilèges qu'un vendeur inscrit normalement (boutique,
// produits, commandes, portefeuille…), immédiatement actif sans passer par la validation.
export const createSupplier = async (req, res) => {
    try {
        const { email, password, name, ...rest } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe sont obligatoires pour créer un compte marchand.' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' });
        }

        const existingProfile = await Profile.findOne({ where: { email: email.trim().toLowerCase() } });
        if (existingProfile) {
            return res.status(409).json({ error: 'Un compte existe déjà avec cet email. Utilisez une autre adresse.' });
        }

        // 1. Compte de connexion (Better Auth) — même chemin que l'inscription classique,
        // donc le mot de passe est haché de façon compatible avec la connexion normale.
        let authResult;
        try {
            authResult = await auth.api.signUpEmail({
                body: { email: email.trim().toLowerCase(), password, name: name || 'Marchand' }
            });
        } catch (authErr) {
            console.error('CreateSupplier — signUpEmail error:', authErr);
            return res.status(400).json({ error: authErr.message || "Impossible de créer le compte de connexion (email déjà utilisé ?)" });
        }

        const authUserId = authResult?.user?.id;
        if (!authUserId) {
            return res.status(500).json({ error: "Le compte de connexion n'a pas pu être créé." });
        }

        // 2. Profil applicatif — rôle fournisseur direct, email considéré vérifié
        // (c'est l'admin qui crée le compte, pas d'auto-inscription à confirmer).
        await Profile.upsert({
            id: authUserId,
            email: email.trim().toLowerCase(),
            fullname: name || 'Marchand',
            role: 'fournisseur',
            email_verified: true
        });

        // 3. Fiche fournisseur, liée au compte, active immédiatement.
        // created_by_admin=true (jamais falsifiable par rest, réglé après le spread)
        // conditionne l'accès au mémo Product.cost_price.
        const supplier = await Supplier.create({
            ...rest,
            id: crypto.randomUUID(),
            user_id: authUserId,
            name,
            status: 'active',
            created_by_admin: true
        });

        res.status(201).json({ ...supplier.toJSON(), account_created: true });
    } catch (error) {
        console.error('CreateSupplier error:', error);
        res.status(500).json({ error: 'Erreur lors de la création du fournisseur' });
    }
};

export const getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findByPk(req.params.id);
        if (!supplier) return res.status(404).json({ error: 'Fournisseur non trouvé' });
        res.json(supplier);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const supplier = await Supplier.findByPk(id, {
            include: [{ model: Profile, as: 'user', attributes: ['email'] }]
        });
        
        if (!supplier) return res.status(404).json({ error: 'Fournisseur non trouvé' });

        const oldStatus = supplier.status;
        await supplier.update({
            name:             req.body.name,
            email:            req.body.email,
            phone:            req.body.phone,
            address_line:     req.body.address_line,
            status:           req.body.status,
            is_verified:      req.body.is_verified,
            admin_notes:      req.body.admin_notes,
            lat:              req.body.lat,
            lng:              req.body.lng,
            departement_id:   req.body.departement_id,
            departement_label:req.body.departement_label,
            commune_id:       req.body.commune_id,
            commune_label:    req.body.commune_label,
            quartier_id:      req.body.quartier_id,
            quartier_label:   req.body.quartier_label
        });


        // Synchronize user role when supplier becomes active
        if (status && status !== oldStatus) {
            if (status === 'active' && supplier.user_id) {
                try {
                    const profile = await Profile.findByPk(supplier.user_id);
                    if (profile) {
                        await profile.update({ role: 'fournisseur' });
                        await sequelize.query(
                            'UPDATE user SET role = :role WHERE id = :id',
                            {
                                replacements: { role: 'fournisseur', id: supplier.user_id },
                                type: sequelize.QueryTypes.UPDATE
                            }
                        );
                    }
                } catch (roleErr) {
                    console.error('Failed to sync supplier role:', roleErr);
                }
            } else if (status === 'suspended' && supplier.user_id) {
                try {
                    const profile = await Profile.findByPk(supplier.user_id);
                    if (profile && profile.role === 'fournisseur') {
                        await profile.update({ role: 'user' });
                        await sequelize.query(
                            'UPDATE user SET role = :role WHERE id = :id',
                            {
                                replacements: { role: 'user', id: supplier.user_id },
                                type: sequelize.QueryTypes.UPDATE
                            }
                        );
                    }
                } catch (roleErr) {
                    console.error('Failed to reset supplier role:', roleErr);
                }
            }

            const email = supplier.user?.email;
            if (email) {
                sendSupplierApprovalNotification(email, supplier, status).catch(err => 
                    console.error('Failed to send supplier notification:', err)
                );
            }
            
            // WhatsApp Notification
            const phone = supplier.whatsapp || supplier.phone || supplier.user?.phone;
            if (phone) {
                notifySupplierStatusUpdate(phone, status).catch(err => 
                    console.error('Failed to send WhatsApp supplier notification:', err)
                );
            }
        }

        res.json(supplier);
    } catch (error) {
        console.error('UpdateSupplier error:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
};

export const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Supprimer les entités dépendantes pour éviter les erreurs de contrainte de clé étrangère
        await Boutique.destroy({ where: { supplier_id: id } });
        await SupplierProduct.destroy({ where: { supplier_id: id } });
        
        const deleted = await Supplier.destroy({
            where: { id }
        });
        if (!deleted) return res.status(404).json({ error: 'Fournisseur non trouvé' });
        res.json({ message: 'Fournisseur supprimé' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
};

export const updateSupplierProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await SupplierProduct.update(req.body, { where: { id } });
        if (!updated) return res.status(404).json({ error: 'Liaison non trouvée' });
        res.json({ message: 'Liaison mise à jour' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
};

export const deleteSupplierProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await SupplierProduct.destroy({ where: { id } });
        res.json({ message: 'Liaison supprimée' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
};

export const registerSelf = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const {
            shopName, phone, whatsapp, momoNumber, address_line, lat, lng,
            termsAccepted, electronicSignature,
            departement_id, departement_label,
            commune_id, commune_label,
            quartier_id, quartier_label
        } = req.body;

        if (!userId) {
            console.error('RegisterSelf error: userId is missing from auth');
            return res.status(401).json({ error: 'Profil utilisateur introuvable. Veuillez vous reconnecter.' });
        }

        if (!shopName || !phone || !address_line || !departement_id || !commune_id || !quartier_id) {
            return res.status(400).json({ error: 'Veuillez remplir toutes les informations obligatoires, y compris l\'adresse complète.' });
        }

        const existing = await Supplier.findOne({ where: { user_id: userId } });
        if (existing) {
            return res.status(400).json({ error: 'Vous êtes déjà enregistré comme fournisseur' });
        }

        const userProfile = await Profile.findByPk(userId);
        const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
        const userEmailStr = req.auth?.email?.toLowerCase();
        const isAdmin = (userProfile && userProfile.role === 'admin') || (userEmailStr && adminEmails.includes(userEmailStr));

        const supplierId = crypto.randomUUID();
        const supplier = await Supplier.create({
            id: supplierId,
            name: shopName,
            email: userEmailStr,
            phone,
            whatsapp,
            momo_number: momoNumber,
            user_id: userId,
            status: isAdmin ? 'active' : 'En attente',
            address_line,
            departement_id,
            departement_label,
            commune_id,
            commune_label,
            quartier_id,
            quartier_label
        });

        await Boutique.create({
            id: crypto.randomUUID(),
            name: shopName,
            phone,
            whatsapp,
            momo_number: momoNumber,
            address_line,
            lat,
            lng,
            departement_id,
            departement_label,
            commune_id,
            commune_label,
            quartier_id,
            quartier_label,
            supplier_id: supplierId,
            status: 'active'
        });

        // Notify Admin of new registration
        notifyAdmin(`🏢 *Nouveau Fournisseur !*\nUne boutique "${shopName}" vient d'être enregistrée par ${userProfile?.fullname || userEmailStr}.\nNuméro : ${phone}`).catch(() => {});

        res.status(201).json(supplier);
    } catch (error) {
        console.error('RegisterSelf error:', error);
        res.status(500).json({ error: 'Erreur lors de l’inscription fournisseur', details: error.message });
    }
};

export const getMyProfile = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const supplier = await Supplier.findOne({
            where: { user_id: userId },
            include: [{ model: Profile, as: 'user' }]
        });
        // Return null gracefully — frontend handles the "register your shop" flow
        if (!supplier) return res.json(null);
        res.json(supplier);
    } catch (error) {
        console.error('GetMyProfile error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const updateMyProfile = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const supplier = await Supplier.findOne({ where: { user_id: userId } });
        if (!supplier) return res.status(404).json({ error: 'Fournisseur non trouvé' });

        const { 
            name, phone, whatsapp, momo_number, address_line, lat, lng,
            departement_id, departement_label,
            commune_id, commune_label,
            quartier_id, quartier_label
        } = req.body;

        await supplier.update({ 
            name, phone, whatsapp, momo_number, address_line, lat, lng,
            departement_id, departement_label,
            commune_id, commune_label,
            quartier_id, quartier_label
        });

        res.json(supplier);
    } catch (error) {
        console.error('UpdateMyProfile error:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
};

export const getMyProducts = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const supplier = await Supplier.findOne({ where: { user_id: userId } });
        if (!supplier) return res.json([]); // Return empty array instead of 404

        const products = await Product.findAll({
            where: { supplier_id: supplier.id },
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
                { model: ProductImage, as: 'images' },
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                { 
                    model: ProductVariant, 
                    as: 'variants',
                    include: [{ model: ProductVariantPrice, as: 'priceRows' }]
                }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(products);
    } catch (error) {
        console.error('GetMyProducts error:', error);
        res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
};

// GET /suppliers/me/products/:id — un seul produit, pour le formulaire d'édition du
// supplier-portal. Contrairement aux endpoints publics (productController.js), inclut
// cost_price (mémo privé du prix d'achat), réservé au vendeur propriétaire du produit.
export const getMyProductById = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const supplier = await Supplier.findOne({ where: { user_id: userId } });
        if (!supplier) return res.status(404).json({ error: 'Profil fournisseur non trouvé' });

        const product = await Product.findOne({
            where: { id: req.params.id, supplier_id: supplier.id },
            include: [
                { model: ProductImage, as: 'images' },
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                {
                    model: ProductVariant,
                    as: 'variants',
                    include: [{ model: ProductVariantPrice, as: 'priceRows' }]
                }
            ]
        });
        if (!product) return res.status(404).json({ error: 'Produit introuvable ou non autorisé' });

        res.json(product);
    } catch (error) {
        console.error('GetMyProductById error:', error);
        res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
};

export const updateMyBoutique = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { id } = req.params;
        const supplier = await Supplier.findOne({ where: { user_id: userId } });
        if (!supplier) return res.status(404).json({ error: 'Profil fournisseur non trouvé' });

        const boutique = await Boutique.findOne({ where: { id, supplier_id: supplier.id } });
        if (!boutique) return res.status(404).json({ error: 'Boutique non trouvée' });

        await boutique.update(req.body);
        res.json(boutique);
    } catch (error) {
        console.error('UpdateMyBoutique error:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la boutique' });
    }
};

export const deleteMyBoutique = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { id } = req.params;
        const supplier = await Supplier.findOne({ where: { user_id: userId } });
        if (!supplier) return res.status(404).json({ error: 'Profil fournisseur non trouvé' });

        const boutique = await Boutique.findOne({ where: { id, supplier_id: supplier.id } });
        if (!boutique) return res.status(404).json({ error: 'Boutique non trouvée' });

        await boutique.destroy();
        res.json({ message: 'Boutique supprimée avec succès' });
    } catch (error) {
        console.error('DeleteMyBoutique error:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de la boutique' });
    }
};

export const getMyBoutiques = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const supplier = await Supplier.findOne({ where: { user_id: userId } });
        if (!supplier) return res.json([]); // Return empty array instead of 404

        const boutiques = await Boutique.findAll({ where: { supplier_id: supplier.id } });
        res.json(boutiques);
    } catch (error) {
        console.error('GetMyBoutiques error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const createBoutique = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const supplier = await Supplier.findOne({ where: { user_id: userId } });
        if (!supplier) return res.status(404).json({ error: 'Profil fournisseur non trouvé' });

        const boutique = await Boutique.create({
            id: crypto.randomUUID(),
            ...req.body,
            supplier_id: supplier.id
        });
        res.status(201).json(boutique);
    } catch (error) {
        console.error('CreateBoutique error:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la boutique' });
    }
};

export const getAllBoutiques = async (req, res) => {
    try {
        const boutiques = await Boutique.findAll({
            include: [{
                model: Supplier,
                as: 'supplier',
                include: [{
                    model: Product,
                    as: 'products',
                    attributes: ['id', 'name', 'price', 'stock', 'approval_status'],
                    limit: 10 // On limite pour éviter de surcharger si trop de produits
                }]
            }],
            order: [['created_at', 'DESC']]
        });
        res.json(boutiques);
    } catch (error) {
        console.error('GetAllBoutiques error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des boutiques' });
    }
};

// Annuaire public des boutiques (utilisé par l'app mobile pour parcourir/filtrer
// par vendeur). Contrairement à getAllBoutiques (admin), ne renvoie que des
// champs sûrs à exposer publiquement — pas de téléphone, WhatsApp, adresse
// exacte ou coordonnées GPS.
export const getPublicBoutiques = async (req, res) => {
    try {
        const { search, commune_id } = req.query;
        const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);

        const where = { status: 'active' };
        if (commune_id) where.commune_id = commune_id;
        if (search) where.name = { [Op.like]: `%${search}%` };

        const boutiques = await Boutique.findAll({
            where,
            attributes: [
                'id', 'name', 'commune_label', 'departement_label', 'quartier_label', 'supplier_id',
                [
                    sequelize.literal(
                        `(SELECT COUNT(*) FROM products WHERE products.boutique_id = \`Boutique\`.\`id\` AND products.approval_status = 'approved')`
                    ),
                    'product_count'
                ]
            ],
            order: [['name', 'ASC']],
            limit
        });

        res.json(boutiques);
    } catch (error) {
        console.error('getPublicBoutiques error:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des boutiques' });
    }
};

export const adminCreateBoutique = async (req, res) => {
    try {
        const { supplier_id } = req.body;
        if (!supplier_id) return res.status(400).json({ error: 'ID Fournisseur obligatoire' });

        const boutique = await Boutique.create({
            id: crypto.randomUUID(),
            ...req.body,
            supplier_id: supplier_id,
            status: 'active'
        });
        res.status(201).json(boutique);
    } catch (error) {
        console.error('AdminCreateBoutique error:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la boutique par l\'admin' });
    }
};

export const notifyIncompleteSuppliers = async (req, res) => {
    try {
        const incompleteSuppliers = await Supplier.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.is]: null } },
                    { phone: { [Op.is]: null } },
                    { address_line: { [Op.is]: null } },
                    { departement_id: { [Op.is]: null } },
                    { commune_id: { [Op.is]: null } },
                    { quartier_id: { [Op.is]: null } }
                ]
            },
            include: [{ model: Profile, as: 'user', attributes: ['phone', 'fullname'] }]
        });

        if (incompleteSuppliers.length === 0) {
            return res.json({ message: 'Aucun fournisseur avec profil incomplet trouvé.' });
        }

        let sentCount = 0;
        for (const s of incompleteSuppliers) {
            const phone = s.phone || s.user?.phone || s.whatsapp;
            if (phone) {
                try {
                    // Send to the actual supplier, not admin
                    const message = `🔔 Rappel Vtout : Bonjour ${s.name || s.user?.fullname || 'Cher Partenaire'}, votre profil marchand est incomplet. Veuillez renseigner votre adresse et téléphone pour pouvoir ajouter des produits. Merci.`;
                    await notifySupplierStatusUpdate(phone, s.name || 'Votre Boutique', 'Profil Incomplet', message);
                    sentCount++;
                } catch (err) {
                    console.error(`Error notifying ${phone}:`, err);
                }
            }
        }

        res.json({ message: `${sentCount} notifications envoyées avec succès.` });
    } catch (error) {
        console.error("NOTIFY INCOMPLETE ERROR:", error);
        res.status(500).json({ error: 'Erreur Serveur', details: error.message });
    }
};

export const getMyDisputes = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const supplier = await Supplier.findOne({ where: { user_id: userId } });
        if (!supplier) return res.status(404).json({ error: 'Fournisseur non trouvé' });

        const disputes = await Dispute.findAll({
            where: { supplier_id: supplier.id },
            include: [
                { model: Profile, as: 'user', attributes: ['fullname', 'email', 'phone'] },
                { model: Order, as: 'order', attributes: ['id', 'total_amount', 'created_at', 'status'] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(disputes);
    } catch (err) {
        console.error('getMyDisputes error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const respondToMyDispute = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { id } = req.params;
        const { supplier_response, supplier_evidence_url } = req.body;

        const supplier = await Supplier.findOne({ where: { user_id: userId } });
        if (!supplier) return res.status(404).json({ error: 'Fournisseur non trouvé' });

        const dispute = await Dispute.findOne({ where: { id, supplier_id: supplier.id } });
        if (!dispute) return res.status(404).json({ error: 'Litige non trouvé' });

        await dispute.update({
            supplier_response: supplier_response || dispute.supplier_response,
            supplier_evidence_url: supplier_evidence_url || dispute.supplier_evidence_url,
            status: dispute.status === 'open' ? 'under_review' : dispute.status
        });

        res.json(dispute);
    } catch (err) {
        console.error('respondToMyDispute error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};