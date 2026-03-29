const { Supplier, SupplierProduct, Product, ProductVariant, Profile } = require('../models');
const crypto = require('crypto');

exports.getAllSuppliers = async (req, res) => {
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

exports.getAllSupplierProducts = async (req, res) => {
    try {
        const rows = await SupplierProduct.findAll({
            include: [
                { model: Supplier, as: 'supplier' },
                { model: Product, as: 'product', attributes: ['id', 'name'] },
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

exports.createSupplier = async (req, res) => {
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

exports.getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findByPk(req.params.id);
        if (!supplier) return res.status(404).json({ error: 'Fournisseur non trouvé' });
        res.json(supplier);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByPk(req.params.id);
        if (!supplier) return res.status(404).json({ error: 'Fournisseur non trouvé' });

        await supplier.update(req.body);

        res.json(supplier);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
};

exports.deleteSupplier = async (req, res) => {
    try {
        const deleted = await Supplier.destroy({
            where: { id: req.params.id }
        });
        if (!deleted) return res.status(404).json({ error: 'Fournisseur non trouvé' });
        res.json({ message: 'Fournisseur supprimé' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
};

exports.updateSupplierProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await SupplierProduct.update(req.body, { where: { id } });
        if (!updated) return res.status(404).json({ error: 'Liaison non trouvée' });
        res.json({ message: 'Liaison mise à jour' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
};

exports.deleteSupplierProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await SupplierProduct.destroy({ where: { id } });
        res.json({ message: 'Liaison supprimée' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
};

exports.registerSelf = async (req, res) => {
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

        // 1. Check if already a supplier
        const existing = await Supplier.findOne({ where: { user_id: userId } });
        if (existing) {
            return res.status(400).json({ error: 'Vous êtes déjà enregistré comme fournisseur' });
        }

        // 2. Create supplier entry
        const supplier = await Supplier.create({
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
            terms_accepted: termsAccepted,
            electronic_signature: electronicSignature,
            user_id: userId,
            status: '  En attente'
        });

        // 3. Update user profile role to 'fournisseur'
        await Profile.update({ role: 'fournisseur' }, { where: { id: userId } });

        res.status(201).json(supplier);
    } catch (error) {
        console.error('RegisterSelf error:', error);
        res.status(500).json({ error: 'Erreur lors de l’inscription fournisseur' });
    }
};

exports.getMyProfile = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const supplier = await Supplier.findOne({
            where: { user_id: userId },
            include: [{ model: Profile, as: 'user' }]
        });
        if (!supplier) return res.status(404).json({ error: 'Profil fournisseur non trouvé' });
        res.json(supplier);
    } catch (error) {
        console.error('GetMyProfile error:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

exports.updateMyProfile = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const supplier = await Supplier.findOne({ where: { user_id: userId } });
        if (!supplier) return res.status(404).json({ error: 'Fournisseur non trouvé' });

        const { name, phone, whatsapp, momo_number, address_line, lat, lng } = req.body;
        await supplier.update({ name, phone, whatsapp, momo_number, address_line, lat, lng });

        res.json(supplier);
    } catch (error) {
        console.error('UpdateMyProfile error:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
};

exports.getMyProducts = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const supplier = await Supplier.findOne({ where: { user_id: userId } });
        if (!supplier) return res.status(404).json({ error: 'Fournisseur non trouvé' });

        const products = await Product.findAll({
            where: { supplier_id: supplier.id },
            attributes: { exclude: ['price', 'old_price'] }, // Hide retail prices from suppliers
            include: ['images']
        });
        res.json(products);
    } catch (error) {
        console.error('GetMyProducts error:', error);
        res.status(500).json({ error: 'Erreur serveur', details: error.message });
    }
};
