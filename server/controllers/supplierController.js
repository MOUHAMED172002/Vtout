import { Supplier, SupplierProduct, Product, ProductVariant, ProductVariantPrice, ProductImage, Category, Profile, Boutique, sequelize } from '../models/index.js';
import crypto from 'crypto';
import { sendSupplierApprovalNotification } from '../services/mailService.js';
import { notifySupplierStatusUpdate, notifyAdmin } from '../services/whatsappService.js';

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

export const createSupplier = async (req, res) => {
    try {
        const supplierData = {
            id: crypto.randomUUID(),
            ...req.body
        };
        const supplier = await Supplier.create(supplierData);
        res.status(201).json(supplier);
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


        // Notify supplier if status changed to active or suspended
        if (status && status !== oldStatus) {
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