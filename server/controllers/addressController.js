import { Address } from '../models/index.js';


export const getUserAddresses = async (req, res) => {
    try {
        const { userId } = req.params;
        const addresses = await Address.findAll({
            where: { user_id: userId }
        });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des adresses' });
    }
};

export const getMyAddresses = async (req, res) => {
    try {
        const { userId } = req.auth;
        const addresses = await Address.findAll({
            where: { user_id: userId },
            order: [['is_default', 'DESC'], ['created_at', 'DESC']]
        });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const createAddress = async (req, res) => {
    try {
        const userId = req.auth?.userId || null;
        const { is_default } = req.body;

        if (is_default && userId) {
            await Address.update({ is_default: false }, { where: { user_id: userId } });
        }

        const address = await Address.create({
            ...req.body,
            user_id: userId
        });
        res.status(201).json(address);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la création de l\'adresse' });
    }
};

export const updateAddress = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { id } = req.params;
        const { is_default } = req.body;

        if (is_default) {
            await Address.update({ is_default: false }, { where: { user_id: userId } });
        }

        await Address.update(req.body, {
            where: { id, user_id: userId }
        });
        res.json({ message: 'Adresse mise à jour' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
};

export const deleteAddress = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { id } = req.params;
        await Address.destroy({
            where: { id, user_id: userId }
        });
        res.json({ message: 'Adresse supprimée' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
};